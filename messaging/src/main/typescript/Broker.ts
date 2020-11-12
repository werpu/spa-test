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
    private rootElem;
    private msgHandler;

    private readonly TIMEOUT_IN_MS = 1000;
    private readonly MSG_EVENT = "message";

    /**
     * constructor has an optional root element
     * and an internal name
     *
     * @param scopeElement
     * @param name
     */
    constructor(scopeElement: HTMLElement | Window | ShadowRoot = window, public name = "brokr") {

        let evtHandler = (event: MessageEvent | CustomEvent<Message>) => {
            let details = (<CustomEvent>event)?.detail || (<MessageEvent>event)?.data;
            //javascript loses the type info in certain module types
            if (details?.identifier && details?.message) {
                let msg: Message = details;
                if (msg.identifier in this.processedMessages) {
                    return;
                }
                //coming in from up... we need to send it down
                //a relayed message always has to trigger the listeners as well
                this.broadcast(msg, Direction.DOWN, false);
            }
        };
        this.msgHandler = (evt: MessageEvent) => evtHandler(evt);
        this.register(scopeElement);
    }

    /**
     * register the current broker into a scope defined by wnd
     * @param scopeElement
     */
    register(scopeElement: HTMLElement | Window | ShadowRoot) {
        this.rootElem = (<any>scopeElement).host ? (<any>scopeElement).host : scopeElement;
        if ((<any>scopeElement).host) {
            let host = (<ShadowRoot>scopeElement).host;
            host.setAttribute("data-broker", "1");
        }

        this.rootElem.addEventListener(Broker.EVENT_TYPE, this.msgHandler, {capture: true});
        /*dom message usable by iframes*/
        this.rootElem.addEventListener(this.MSG_EVENT, this.msgHandler, {capture: true});
    }

    /**
     * manual unregister function, to unregister as broker from the current
     * scoe
     */
    unregister() {
       this.rootElem.removeListener(Broker.EVENT_TYPE, this.msgHandler)
       this.rootElem.removeListener(this.MSG_EVENT, this.msgHandler)
    }

    /**
     * registers a listener on a channel
     * @param channel the channel to register the listeners for
     * @param listener the listener to register
     */
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

    /**
     * unregisters a listener from this channel
     *
     * @param channel the channel to unregister from
     * @param listener the listener to unregister the channel from
     */
    unregisterListener(channel: string, listener: (msg: Message) => void) {
        this.messageListeners[channel] = (this.messageListeners[channel] || []).filter((item: any) => item !== listener);
    }

    /**
     * broadcast a message
     * the message contains the channel and the data and some internal bookeeping data
     *
     * @param message the message dot send
     * @param direction the direction (up, down, both)
     * @param callBrokerListeners if set to true.. the brokers on the same level are also notified
     * (for instance 2 iframes within the same parent broker)
     *
     */
    broadcast(message: Message, direction: Direction = Direction.DOWN, callBrokerListeners = true) {
        try {
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
        } finally {
            this.gcProcessedMessages();
        }
    }


    /**
     * garbage collects the processed messages queue
     * usually after one second
     */
    private gcProcessedMessages() {
        if ((++this.cleanupCnt) % 10 != 0) {
            return;
        }
        let newProcessedMessages: any = {};
        for (let key in this.processedMessages) {
            if (this.messageStillActive(key)) continue;
            newProcessedMessages[key] = this.processedMessages[key];
        }
        this.processedMessages = newProcessedMessages;
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
            window.parent.postMessage(message, message.targetOrigin);
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
            element.contentWindow.postMessage(message, message.targetOrigin);
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

    private messageStillActive(key: string): boolean {
        return this.processedMessages[key] > ((new Date()).getMilliseconds() - this.TIMEOUT_IN_MS);
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