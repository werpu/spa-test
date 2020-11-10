/**
 * Universal message broker which allows to send messages
 *
 */
import {Message} from "./Message";
import {MessageWrapper} from "./MessageWrapper";
import {Direction} from "./Direction";


/**
 * central message broker which uses various dom constructs
 * to broadcast messages into subelements
 *
 * we use the dom event system as transport and encapsule iframe and shadow dom mechanisms in a transparent way to
 * pull this off
 */
export class Broker {

    static readonly EVENT_TYPE = "brokerEvent";


    /**
     * we can split the listeners with the system
     * namespace... and type (aka identifier criteria)
     */
    private messageListeners: any = {};

    private processedMessages: any = {};


    private cleanupCnt = 0;


    constructor(wnd = window) {

        let evtHandler = (event: MessageEvent | CustomEvent<Message>) => {
            let details = (<CustomEvent>event)?.detail || (<MessageEvent>event)?.data;
            if (details instanceof Message) {

                let msg: Message = details;
                if (msg.identifier in this.processedMessages) {
                    return;
                }
                //coming in from up... we need to send it down
                //a relayed message always has to trigger the listeners as well
                this.broadcast(msg, Direction.DOWN, false);
            }
        };

        wnd.addEventListener(Broker.EVENT_TYPE, (evt: MessageEvent) =>  evtHandler(evt), {capture: true});
        wnd.addEventListener("message", (evt: MessageEvent) =>  evtHandler(evt), {capture: true});
    }

    registerListener(channel: string, listener: (msg: Message) => void) {
        this.reserveListenerNS(channel);

        //we skip the processed messages, because they originated here
        //and already are processed
        this.messageListeners[channel].push((msg: Message) => {
            if (msg.identifier in this.processedMessages) {
                return;
            }
            listener(msg);
        });
    }

    gcProcessedMessages() {
        if ((++this.cleanupCnt) % 10 != 0) {
            return;
        }
        let newProcessedMessages: any = {};
        for (let key in this.processedMessages) {
            if (this.processedMessages[key] < ((new Date()).getMilliseconds() - 1000)) continue;
            newProcessedMessages[key] = this.processedMessages[key];
        }
        this.processedMessages = newProcessedMessages;
    }

    unregisterListener(channel: string, listener: (msg: Message) => void) {
        this.messageListeners = (this.messageListeners[channel] || []).filter((item: any) => item !== listener);
    }

    broadcast(message: Message, direction: Direction = Direction.DOWN, ignoreListeners = true) {

        switch (direction) {
            case Direction.DOWN:
                this.dispatchDown(message, ignoreListeners);
                break;
            case Direction.UP:
                this.dispatchUp(message, ignoreListeners)
                break;
            case Direction.BOTH:
                this.dispatchBoth(message, ignoreListeners);
                break;
        }


        this.gcProcessedMessages();
    }

    private dispatchBoth(message: Message, ignoreListeners = true) {

        this.dispatchUp(message, ignoreListeners, true);
        //listeners already called
        this.dispatchDown(message, true, false)
    }

    private dispatchUp(message: Message, ignoreListeners = true, dispatchSameLevel = true) {
        if (!ignoreListeners) {
            this.callListeners(message);
        }
        this.processedMessages[message.identifier] = message.creationDate;

        if (window.parent != null) {
            window.parent.postMessage(message, window.location.href);
        }
        if (dispatchSameLevel) {
            this.dispatchSameLevel(message);
        }


    }

    private dispatchSameLevel(message: Message) {
        let event = this.transformToEvent(message, true);
        //we also dispatch sideways
        window.dispatchEvent(event);
    }

//a dispatch of our own should never trigger the listeners hence the default true
    private dispatchDown(message: Message, ignoreListeners = true, dispatchSameLevel = true) {
        if (!ignoreListeners) {
            this.callListeners(message);
        }
        this.processedMessages[message.identifier] = message.creationDate;

        window.document.dispatchEvent(this.transformToEvent(message));
        /*we now notify all iframes lying underneath */
        document.querySelectorAll("iframe").forEach((element: HTMLIFrameElement) => {
            element.contentWindow.postMessage(message, "*")
        });
        if (dispatchSameLevel) {
            this.dispatchSameLevel(message);
        }
    }

    private callListeners(message: Message) {
        let listeners = this.messageListeners[message.channel];
        if (listeners?.length) {
            let callElement = (element: (msg: Message) => void) => {
                element(message);
            }

            listeners.forEach(callElement);
        }
    }

    private transformToEvent(message: Message, bubbles = false): CustomEvent {
        let messageWrapper = new MessageWrapper(message);
        messageWrapper.bubbles = bubbles;
        return this.createCustomEvent(Broker.EVENT_TYPE, messageWrapper);
    }

    private createCustomEvent(name: string, wrapper: any): any {
        if ('undefined' == typeof window.CustomEvent) {
            let e: any = document.createEvent('HTMLEvents');
            e.detail = wrapper.detail;
            e.initEvent(name, wrapper.bubbles, wrapper.cancelable);
            return e;

        } else {
            return new window.CustomEvent(name, wrapper);
        }

    }

    /**
     * reserves the listener namespace and wildcard namespace for the given identifier
     * @param identifier
     * @private
     */
    private reserveListenerNS(identifier: string) {
        if (!this.messageListeners[identifier]) {
            this.messageListeners[identifier] = [];
        }
        if (!this.messageListeners["*"]) {
            this.messageListeners["*"] = [];
        }
    }
}