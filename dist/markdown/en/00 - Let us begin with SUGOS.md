# [SUGOS Tutorial] 00 - Let us begin with SUGOS


This is the tutorial [SUGOS](https://github.com/realglobe-Inc/sugos) framework.



## What is SUGOS?

+ RPC(Remote Procedure Call) framework
+ It shares function definitions dynamically, so you don't have to care about networks
+ Most of components are written with [Node.js](https://nodejs.org/en/)
+ Supports [EventEmitter](https://nodejs.org/api/events.html#events_events) interface
+ Developed by [Realglobe, Inc](http://realglobe.jp/)

<a href="https://github.com/realglobe-Inc/sugos">
  <img src="../../images/sugos-banner.png"
       alt="Banner"
       height="40"
  />
</a>
<a href="https://nodejs.org/en/">
  <img src="../../images/nodejs-banner.png"
       alt="banner"
       height="40"
       style="height:40px"
  /></a>
<a href="https://docs.npmjs.com/">
  <img src="../../images/npm-banner.png"
       alt="banner"
       height="40"
       style="height:40px"
  /></a>
<a href="http://realglobe.jp/">
  <img src="../../images/realglboe-logo.png"
       alt="banner"
       height="40"
       style="height:40px"
  /></a>


## What We can Do with SUGOS?

With SUGOS, you can use a function declared in another client. Forget about protocols like HTTP.

<img src="../../images/sugos-overview.png"
     alt="Overview"
/>


Let's see some examples.

We name a client to provide functions an "actor":

+ Declare a "module", bundle of functions, with methods (`tableTennis#ping`)
+ Give an actor a "key" as identifier and connect hub server ( `my-actor-01@example.sugo-hub.com` )

```javascript
'use strict'

const co = require('co')
const sugoActor = require('sugo-actor')
const { Module } = sugoActor

co(function * () {
  // Define a module with methods
  let tableTennis = new Module({
    ping (pong) {
      return `"${pong}" from actor!`
    }
  })

  // Create an actor client instance
  let actor = sugoActor({
    host: 'example.sugo-hub.com',
    key: 'my-actor-01',
    modules: { tableTennis }
  })

  // Connect to hub server
  yield actor.connect()
}).catch((err) => console.error(err))

```

Then, you can access the module with a "caller", which we name a client to invoke functions:


```javascript
'use strict'

const sugoCaller = require('sugo-caller')
const co = require('co')

co(function * () {
  let caller = sugoCaller({
    host: 'example.sugo-hub.com'
  })
  // Connect to an actor with key
  let actor01 = yield caller.connect('my-actor-01')

  {
    // Get a module of the actor
    let tableTennis = actor01.get('tableTennis')
    let pong = yield tableTennis.ping('hey!')
    console.log(pong) // -> `"hey!" from call!`
  }
}).catch((err) => console.error(err))

```

You never declared the `.ping()` function in the caller-side JavaScript, but SUGOS executes it in runtime as definitions passed from actor.

Also, SUGOS supports event driven interface like [EventEmitter](https://nodejs.org/api/events.html#events_events) of Node.js.

Callers and actors can communicate with each others through `.on()` or `.emit()` methods.


## How it Works

### Main Components

| Component | Description |
| ------------ | --- |
| [SUGO-Hub](https://github.com/realglobe-Inc/sugo-hub) | Hub server to who connects actors and callers。Uses [Socket.IO](http://socket.io/) and [Koa](https://github.com/koajs/koa) internally |
| [SUGO-Actor](https://github.com/realglobe-Inc/sugo-actor) | Client who provides functions. Uniquely identified by `key` |
| [SUGO-Caller](https://github.com/realglobe-Inc/sugo-caller) | Client who call functions provided by actors. |


Both actors and callers connect hub with WebSocket.


&nbsp;&nbsp;&nbsp;&nbsp;**Caller** **<----->** **Hub** **<----->** **Actor**


Caller receives module (bundle of functions) definition and dynamically define JavaScript functions.

When you execute a function on caller side, caller convert the invocation information into JSON object, and send it to actor via hub.
On actor side, the function invoked with context given from caller and send the result back to the caller.

All functions implemented with [async/await](https://github.com/yortus/asyncawait#guide-to-asyncawait-v10) interface to handle delay of networking

## Conclusion

+ SUGOS is a frame work for RPC(Remote Procedure Call)
+ You can call a function declared on a client from another client
+ JavaScript function is dynamically defined on the caller side
+ Forget about HTTP, WebSocket


## You may Want to Read

+ Next Tutorial: [01 - Hello World, as always](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/01%20-%20Hello%20World%2C%20as%20always.md)


## Links

+ [SUGOS](https://github.com/realglobe-Inc/sugos)
+ [SUGO-Hub](https://github.com/realglobe-Inc/sugo-hub)
+ [SUGO-Actor](https://github.com/realglobe-Inc/sugo-actor)
+ [SUGO-Caller](https://github.com/realglobe-Inc/sugo-caller)
+ [Realglobe Inc](http://realglobe.jp/)
+ Tutorials
  + [00 - Let us begin with SUGOS](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/00%20-%20Let%20us%20begin%20with%20SUGOS.md)
  + [01 - Hello World, as always](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/01%20-%20Hello%20World%2C%20as%20always.md)
  + [02 - Using Event Emit](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/02%20-%20Using%20Event%20Emit.md)
  + [03 - Communication betweein Browsers](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/03%20-%20Communication%20betweein%20Browsers.md)
  + [04 - Module as npm package](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/04%20-%20Module%20as%20npm%20package.md)
