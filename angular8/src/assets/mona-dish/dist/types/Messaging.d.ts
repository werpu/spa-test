/**
 * Message direction
 */
export declare enum Direction {
    UP = 0,
    DOWN = 1,
    ALL = 2
}
/**
 * a standardized message to be sent over the message bus
 */
export declare class Message {
    message: any;
    channel: string;
    creationDate?: number;
    identifier?: string;
    targetOrigin?: string;
    constructor(channel: string, message?: any, targetOrigin?: string);
}
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
export declare class Broker {
    name: string;
    static readonly EVENT_TYPE = "brokerEvent";
    /**
     * we can split the listeners with the system
     * namespace... and type (aka identifier criteria)
     */
    private messageListeners;
    private processedMessages;
    private cleanupCnt;
    private rootElem;
    private msgHandler;
    private readonly TIMEOUT_IN_MS;
    private readonly MSG_EVENT;
    /**
     * constructor has an optional root element
     * and an internal name
     *
     * @param scopeElement
     * @param name
     */
    constructor(scopeElement?: HTMLElement | Window | ShadowRoot, name?: string);
    /**
     * register the current broker into a scope defined by wnd
     * @param scopeElement
     */
    register(scopeElement: HTMLElement | Window | ShadowRoot): void;
    /**
     * manual unregister function, to unregister as broker from the current
     * scoe
     */
    unregister(): void;
    /**
     * registers a listener on a channel
     * @param channel the channel to register the listeners for
     * @param listener the listener to register
     */
    registerListener(channel: string, listener: (msg: Message) => void): void;
    /**
     * unregisters a listener from this channel
     *
     * @param channel the channel to unregister from
     * @param listener the listener to unregister the channel from
     */
    unregisterListener(channel: string, listener: (msg: Message) => void): void;
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
    broadcast(message: Message, direction?: Direction, callBrokerListeners?: boolean): void;
    /**
     * garbage collects the processed messages queue
     * usually after one second
     */
    private gcProcessedMessages;
    private dispatchBoth;
    private dispatchUp;
    private dispatchSameLevel;
    private dispatchDown;
    private callListeners;
    private transformToEvent;
    private createCustomEvent;
    private messageStillActive;
    /**
     * reserves the listener namespace and wildcard namespace for the given identifier
     * @param identifier
     * @private
     */
    private reserveListenerNS;
}
