export class Message {

    channel: string;
    creationDate?:number;
    identifier?:string;
    targetOrigin?:string;


    constructor(channel: string, public message: any = {}, targetOrigin="*") {
        this.channel = channel;
        this.targetOrigin = targetOrigin;
        this.creationDate = new Date().getMilliseconds();
        this.identifier = new Date().getMilliseconds()+"_"+ Math.random()+"_"+ Math.random();
    }
}