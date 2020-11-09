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

    static readonly EVENT_TYPE = "brokerEvent/";

    private static _instance: Broker;

    /**
     * we can split the listeners with the system
     * namespace... and type (aka identifier criteria)
     */
    private messageListeners: any = {};

    private processedMessages: any = {};


    private cleanupCnt = 0;



    static get instance(): Broker {
        if(!Broker._instance) {
            Broker._instance = new Broker();
        }
        return Broker._instance;
    }


    constructor(wnd = window) {

        let evtHandler = (event: MessageEvent) => {
            if((<any>event)?.data instanceof Message){
                let wrapper = <MessageEvent> event;
                let msg: Message = wrapper.data;
                if(msg.identifier in this.processedMessages) {
                    return;
                }
                //coming in from up... we need to send it down
                this.broadcast(msg, Direction.DOWN);
            }
        };

        wnd.addEventListener(Broker.EVENT_TYPE, evtHandler);
        wnd.addEventListener("message", evtHandler);
    }

    registerListener(channel: string, listener: (msg: Message) => void) {
        this.reserveListenerNS(channel);

        //we skip the processed messages, because they originated here
        //and already are processed
        this.messageListeners[channel].push((msg: Message) => {
            if(this.processedMessages[msg.identifier]) {
                return;
            }
            listener(msg);
        });
    }

    gcProcessedMessages() {
        if((++this.cleanupCnt) % 10 != 0) {
            return;
        }
        let newProcessedMessages: any = {};
        for(let key in this.processedMessages) {
            if(this.processedMessages[key] < ((new Date()).getMilliseconds() - 1000)) continue;
            newProcessedMessages[key] = this.processedMessages[key];
        }
        this.processedMessages = newProcessedMessages;
    }

    unregisterListener(channel: string, listener: (msg: Message) => void) {
        this.messageListeners = (this.messageListeners[channel] || []).filter((item: any) => item !== listener);
    }

    broadcast(message: Message, direction: Direction = Direction.DOWN) {
        switch (direction) {
            case Direction.DOWN:
                this.dispatchDown(message);
                break;
            case Direction.UP:
                this.dispatchUp(message)
                break;
            case Direction.BOTH:
                this.dispatchBoth(message);
                break;
        }

        this.processedMessages[message.identifier] = message.creationDate;
        this.gcProcessedMessages();
    }

    private dispatchBoth(message: Message) {
        this.dispatchUp(message);
        //listeners already called
        this.dispatchDown(message, true)
    }

    private dispatchUp(message: Message) {
        this.callListeners(message);
        if(window.parent != null) {
            window.parent.postMessage(message, window.location.href);
        } else {
            let event = this.transformToEvent(message, true);
            document.dispatchEvent(event);
        }
    }

    private dispatchDown(message: Message, ignoreListeners = false) {
        if(!ignoreListeners) {
            this.callListeners(message);
        }


        window.document.dispatchEvent(this.transformToEvent(message));
        /*we now notify all iframes lying underneath */
        document.querySelectorAll("iframe").forEach((element: HTMLIFrameElement) => {
            element.contentWindow.postMessage(message,"*")
        });
        //TODO shadow dom
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

    private createCustomEvent (name: string, wrapper: any): any {
        if('undefined' == typeof CustomEvent) {
            let e: any = document.createEvent('HTMLEvents');
            e.detail = wrapper.detail;
            e.initEvent(name, wrapper.bubbles, wrapper.cancelable);
            return e;

        } else {
            return new CustomEvent(name, wrapper);
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