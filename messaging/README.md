# 🚀 messaging - A simple messaging bus

This project is a library which provides a jms like messaging
between different isolation layers in a web page...

The ideas is that méssages are sent via different channels
and then ever isolation layer can subscribe to those channels
and receive the messages. Or send messages back into the channel.

What can be bridged

* normal dom elements within a single document
* iframes 
* shadow html closed and open
* popups (very likely, they use the same mechanisms as iframe, not tested though)

What cannot be bridged. Everything which is not connected on the same document
one way or the other aka, either has no direct dom connection or the parent
has no window/shadowRoot/dom reference to the other isolated part!


## building the library

```
npm run build
```



to bundle the library application


## Usage

### Brokers

Brokers are the central hook point into the message bus
they are responsible for sending and receiving the messages
and for distributing them over the boundaries.

Every isolation layer needs one or more brokers (usually one)

### Messages

Messages: Message units containing data and the channel name they should be sent to

### Channels

channels: String identifiers for the bus... to where to distribute the messages to

### Listeners

Ever broker has one or more listeners listening to channels
a channel name of * means receive all messages
or send to

shadowBroker.broadcast(new Message(CHANNEL, "booga2"), Direction.DOWN);

### usage


For receiving and sending data perform following operation
* define a new broker with a reference to your isolation root (no isolation root means window)
* register listeners via the registerListener method
* for sending use the broadcast method!


### Example:

```typescript
 let broker1 = new Broker();//define a broker with a window context
 let shadowBroker = new Broker(shadowRoot, "shadow");    //define a broker with a shadow root reference and a name

 /*
  * registers a listener on the channel
  */   
 shadowBroker.registerListener(CHANNEL, (msg: Message) => {
    shadowBrokerReceived++;
 });
 /*
  * send a message into the messag bus, direction up from the current position
  * possible directions UP, DOWN, ALL, default if no value is given
  * is all, which is the behavior expected from a one dimensional bus
  * UP and down introduces a two dimensional behavior allowing a direction within the 
  * dom hierarchy where the message has to be processed from the current position
  * (aka subbus behavior)
  *
  * Also not the issuing broker never receives the message it sends 
  * out... only the others do
  */ 
 shadowBroker.broadcast(new Message(CHANNEL, "booga2"), Direction.UP);

 shadowBroker.unregister(); //unregisters the current broker from the existing dom isolation layer
 //in case of a destruction of the layer referenced the deregistration happens automatically
```




