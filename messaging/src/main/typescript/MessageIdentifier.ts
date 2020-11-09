export class MessageIdentifier {
    /**
     * @param system defines the originating system
     * @param namespace defines the originating system namespace
     * @param messageType defines the message type
     * @param message defines the message itself
     */
    constructor(public channel="*", public data: any = {}) {
    }

    sameChannel(other: MessageIdentifier): boolean {
        return other.channel === "*" || other.channel === this.channel;
    }
}