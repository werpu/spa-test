export class Message {

    channel: string;
    creationDate?:number;
    identifier?:string;


    constructor(channel: string, public message: any = {}) {
        this.channel = channel;
        this.creationDate = new Date().getMilliseconds();
        this.identifier = new Date().getMilliseconds()+"_"+ Math.random()+"_"+ Math.random();
    }
}