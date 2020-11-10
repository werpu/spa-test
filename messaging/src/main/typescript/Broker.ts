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
 *
 *
 *
 * usage
 *
 * broker = new Broker(optional rootElement)
 *
 * defines a message broker within a scope of rootElment (without it is window aka the current isolation level)
 *
 * broker.registerListener(channel, listener) registers a new listener to the current broker and channel
 * broker.unregisterListener(channel, listener) unregisters the given listener
 *
 * broker.broadcast(message, optional direction, optional callBrokerListeners)
 * sends a message (channel included in the message object) in a direction (up, down, both)
 * and also optionally calls the listeners on the same broker (default off)
 *
 * the flow is like
 * up messages are propagated upwards only until it reaches the outer top of the dom
 * downards, the messages are propagaed downwards only
 * both the message is propagated into both directions
 *
 * Usually messages sent from the same broker are not processed within... however by setting
 * callBrokerListeners to true the listeners on the same broker also are called
 * brokers on the same level will get the message and process it automatically no matter what.
 * That way you can exclude the source from message processing (and it is done that way automatically)
 *
 * Isolation levels. Usually every isolation level needs its own broker object registering
 * on the outer bounds
 *
 * aka documents will register on window
 * iframes on the iframe windowObject
 * isolated shadow doms... document
 *
 *
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

    isShadowDom = false;


    constructor(wnd: HTMLElement | Window | ShadowRoot = window, public name="brokr") {

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

        if((<any>wnd).host) {
            let host = (<ShadowRoot>wnd).host;
            host.setAttribute("data-broker", "1");
            host.addEventListener(Broker.EVENT_TYPE, (evt: MessageEvent) =>  evtHandler(evt), {capture: true});
            host.addEventListener("message", (evt: MessageEvent) =>  evtHandler(evt), {capture: true});

        } else {
            wnd.addEventListener(Broker.EVENT_TYPE, (evt: MessageEvent) =>  evtHandler(evt), {capture: true});
            wnd.addEventListener("message", (evt: MessageEvent) =>  evtHandler(evt), {capture: true});
        }
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

    broadcast(message: Message, direction: Direction = Direction.DOWN, callBrokerListeners = true) {

        switch (direction) {
            case Direction.DOWN:
                this.dispatchDown(message, callBrokerListeners);
                break;
            case Direction.UP:
                this.dispatchUp(message, callBrokerListeners)
                break;
            case Direction.BOTH:
                this.dispatchBoth(message, callBrokerListeners);
                break;
        }


        this.gcProcessedMessages();
    }

    private dispatchBoth(message: Message, ignoreListeners = true) {

        this.dispatchUp(message, ignoreListeners, true);
        //listeners already called
        this.dispatchDown(message, true, false)
    }

    private dispatchUp(message: Message, ignoreListeners = true, callBrokerListeners = true) {
        if (!ignoreListeners) {
            this.callListeners(message);
        }
        this.processedMessages[message.identifier] = message.creationDate;

        if (window.parent != null) {
            window.parent.postMessage(message, window.location.href);
        }
        if (callBrokerListeners) {
            this.dispatchSameLevel(message);
        }
    }

    private dispatchSameLevel(message: Message) {
        let event = this.transformToEvent(message, true);
        //we also dispatch sideways
        window.dispatchEvent(event);
    }

//a dispatch of our own should never trigger the listeners hence the default true
    private dispatchDown(message: Message, ignoreListeners = true, callBrokerListeners = true) {
        if (!ignoreListeners) {
            this.callListeners(message);
        }
        this.processedMessages[message.identifier] = message.creationDate;
        let evt = this.transformToEvent(message);
        window.dispatchEvent(evt);
        /*we now notify all iframes lying underneath */
        document.querySelectorAll("iframe").forEach((element: HTMLIFrameElement) => {
            element.contentWindow.postMessage(message, "*")
        });

        document.querySelectorAll("[data-broker='1']").forEach((element: HTMLElement) => element.dispatchEvent(evt))

        if (callBrokerListeners) {
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