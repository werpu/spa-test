/**
 * custom dom event wrapping our messages
 */
import {Message} from "./Message";

export class MessageWrapper implements CustomEventInit<Message> {

    detail?: Message;
    bubbles?: boolean;
    cancelable?: boolean;
    composed?: boolean;


    constructor(message: Message) {
        this.detail = message;
        this.bubbles = true;
        this.cancelable = true;
        this.composed = true;
    }
}