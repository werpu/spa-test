import {expect} from 'chai';
import {describe, it} from 'mocha';
import {Broker} from "../../main/typescript/Broker";
import {Message} from "../../main/typescript/Message";
import {Direction} from "../../main/typescript/Direction";

const jsdom = require("jsdom");
const {JSDOM} = jsdom;


async function delay(milliseconds: number) {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

let iframe = `
            <div id="received">false</div>
        `;


let applyMessageReceiver = function (contentWindow: any,  msg: Message, brokr = new Broker(contentWindow)) {
    contentWindow["passMessage"] = function (message: Message) {
        msg = message;
        brokr.registerListener("channel", message => {
            contentWindow.document.getElementById("received").innerHTML = message.message;
            console.log("iframe message", message.message);
        });
    }
    return msg;
};
describe('DOMQuery tests', function () {

    beforeEach(function () {


        let dom = new JSDOM(`
            <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Title</title>
            </head>
            <body>
                <div id="id_1"></div>
                <div id="id_2"  booga="blarg" class="blarg2"></div>
                <div id="id_3" class="blarg1 blarg2"></div>
                <div id="id_4"></div>
                <iframe id="iframe1"></iframe>
            </body>
            </html>
    
    `, {
            contentType: "text/html",
            runScripts: "dangerously"
        });


        let window = dom.window;

        (<any>global).window = window;
        (<any>global).body = window.document.body;
        (<any>global).document = window.document;
        (<any>global).navigator = {
            language: "en-En"
        };


        /*this.xhr = sinon.useFakeXMLHttpRequest();
        this.requests = [];
        this.xhr.onCreate = (xhr) => {
            this.requests.push(xhr);
        };
        (<any>global).XMLHttpRequest = this.xhr;
        (<any>window).XMLHttpRequest = this.xhr;*/

    });

    /*relays a message from an iframe up into the global context*/
    it('from iframe to global', function () {

        let contentWindow = ((<any>global).document.getElementById('iframe1')).contentWindow;
        let iframeDoc = contentWindow.document;
        iframeDoc.write(iframe);
        expect(iframeDoc.querySelectorAll("#received").length > 0).to.be.true;

        let msg = new Message("channel", "booga");
        let iframeBroker = new Broker(contentWindow);
        msg = applyMessageReceiver(contentWindow, msg, iframeBroker);

        contentWindow.passMessage(msg);
        Broker.instance.broadcast(msg);
        let messageReceived = false;

        Broker.instance.registerListener("booga", (msg: Message) => {
            messageReceived = msg.message == "booga";
        });

        msg = new Message("channel2", "booga2");
        iframeBroker.broadcast(msg, Direction.UP);

        async function analyzeDelayed() {
            await delay(400);
            expect(messageReceived).to.eq(true);
        }

        analyzeDelayed();
    });

    /**
     * pass a global message into an attached brokered iframe
     */
    it('from global to iframe', function () {

        let contentWindow = ((<any>global).document.getElementById('iframe1')).contentWindow;
        let iframeDoc = contentWindow.document;
        iframeDoc.write(iframe);
        expect(iframeDoc.querySelectorAll("#received").length > 0).to.be.true;

        var msg = new Message("channel", "booga");
        msg = applyMessageReceiver(contentWindow, msg);

        contentWindow.passMessage(msg);
        Broker.instance.broadcast(msg);
        var msg = new Message("channel2", "booga2");
        Broker.instance.broadcast(msg);

        async function analyzeDelayed() {
            await delay(400);
            expect(iframeDoc.querySelectorAll("#received")[0].innerHTML).to.eq("booga");
        }

        analyzeDelayed();
    });



    it('basic message', function () {
        let broker = Broker.instance;
        let messageReceived = false;
        broker.registerListener("channel", (message: Message): void => {
            messageReceived = message.message === "booga";
        })

        broker.broadcast(new Message("channel", "booga"))
        expect(messageReceived).to.be.true;
    })

    it('basic init', function () {
        expect(window?.document?.body).not.eq(null);
    });
});