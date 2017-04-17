# [SUGOS Tutorial] 01 - Hello World, as always

This tutorial shows the simplest example with SUGOS. Define a function on actor, then call it from caller.
(You can learn about actors/callas in [Previous Tutorial](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/00%20-%20Let%20us%20begin%20with%20SUGOS.md))

<a href="https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/01%20-%20Hello%20World%2C%20as%20always.md">
  <img src="../../images/eyecatch-hello-world.jpg"
       alt="eyecatch"
       height="128"
       style="height:128px"
/></a>



## Before Starting

SUGOS runs on Node.js. Prepare the environment with [nvm](https://github.com/creationix/nvm#node-version-manager-)

+ [Node.js >=6](https://nodejs.org/en/)
+ [npm >=4](https://docs.npmjs.com/)

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

## Play it

### Prepare Project

Make directory for the project

```bash
mkdir sugos-tutorial-01
cd sugos-tutorial-01
npm init -y

```

Then install dependencies.

```bash
npm install sugo-actor sugo-caller sugo-hub co asleep -S
```

### Running Hub Server

Run a [SUGO-Hub](https://github.com/realglobe-Inc/sugo-hub) server to interchange commands.

Write a script like:

**hub.js**
```javascript
#!/usr/bin/env node

/**
 * Start hub server
 * @see https://github.com/realglobe-Inc/sugo-hub
 */
'use strict'

const sugoHub = require('sugo-hub')
const co = require('co')

co(function * () {
  let hub = sugoHub({})
  yield hub.listen(3000)
  console.log(`SUGO Cloud started at port: ${hub.port}`)
}).catch((err) => {
  console.error(err)
  process.exit(1)
})

```

Then, execute it with node.

```bash
node ./hub.js
```

You may get warning to use Redis server for performance, but just ignore it for now.


### Declaring a Module

Declare a module, bundle of functions, to connect actor.
For this example, define simple one which have ping function to return pong.

**modules/table-tennis.js**
```javascript
/**
 * Sample of module with simple call-return function
 * @module tableTennis
 * @see https://github.com/realglobe-Inc/sugo-module-base#usage
 */
'use strict'

const { Module } = require('sugo-actor')
const co = require('co')
const asleep = require('asleep')

// Create a new module
const tableTennis = new Module({
  ping (message = '') {
    // Just wait 500ms and return pong.
    return co(function * () {
      yield asleep(500)
      return `pong! ${message}`
    })
  }
})

module.exports = tableTennis

```

The declared functions are shared to callers via actor.

Note that the functions returns [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise). This make it easy to handle async procedures.
And this example uses [co](https://github.com/tj/co#readme) packages for promise flow controlling.


### Set the Module onto Actor and Connect to Hub

Now we have a module. The next step is set it onto [SUGO-Actor](https://github.com/realglobe-Inc/sugo-actor).

Create an actor instance with connecting hub host and `key` as identifier, and modules.

**actor.js**
```javascript
#!/usr/bin/env node

/**
 * Connect actor
 */
'use strict'

const sugoActor = require('sugo-actor')
const co = require('co')
const tableTennis = require('./modules/table-tennis')

co(function * () {
  let actor = sugoActor({
    host: 'localhost:3000',
    key: 'my-actor-01',
    /** Modules to load */
    modules: {
      tableTennis
    }
  })

// Connect to hub
  yield actor.connect()

  console.log(`Actor connected to: ${actor.socket.io.uri}`)
}).catch((err) => console.error(err))

```

Run the actor script and connect to the server.

```bash
node ./actor.js
```


### Calling from a Caller

From caller side, connect to the remote actor via `.connect()` with the key of the actor.
Pass "my-actor-01" as a key and access to 'tableTennis' module.

**caller.js**
```javascript
#!/usr/bin/env node
/**
 * Use sugo caller
 * @see https://github.com/realglobe-Inc/sugo-caller#readme
 */
'use strict'

const sugoCaller = require('sugo-caller')
const co = require('co')

co(function * () {
  let caller = sugoCaller({
    host: 'localhost:3000'
  })

  // Connect to actor
  let myActor01 = yield caller.connect('my-actor-01')
  let tableTennis = myActor01.get('tableTennis')

  let pong = yield tableTennis.ping('hello world!')
  console.log(pong)
  console.log(`Pong from myActor01/tableTennis: "${pong}"`)
}).catch((err) => console.error(err))


```

Run the call script and you will receive a pon.

```bash
node ./caller.js
```

## Conclusion

+ There are three components: Hub, Actor, Caller
+ Actors are identified by key
+ Functions declared in actor side is available in caller side
+ Function result is wrapped in promise.


Code snippets of this tutorial are also [available here](https://github.com/realglobe-Inc/sugos-tutorial/tree/master/example/tutorial-01)



## You may Want to Read

+ Previous Tutorial: [00 - Let us begin with SUGOS](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/00%20-%20Let%20us%20begin%20with%20SUGOS.md)
+ Next Tutorial: [02 - Using Event Emit](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/02%20-%20Using%20Event%20Emit.md)

## Links

+ [SUGOS](https://github.com/realglobe-Inc/sugos)
+ [SUGO-Hub](https://github.com/realglobe-Inc/sugo-hub)
+ [SUGO-Actor](https://github.com/realglobe-Inc/sugo-actor)
+ [SUGO-Caller](https://github.com/realglobe-Inc/sugo-caller)
+ Tutorials
  + [00 - Let us begin with SUGOS](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/00%20-%20Let%20us%20begin%20with%20SUGOS.md)
  + [01 - Hello World, as always](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/01%20-%20Hello%20World%2C%20as%20always.md)
  + [02 - Using Event Emit](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/02%20-%20Using%20Event%20Emit.md)
  + [03 - Communication between Browsers](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/03%20-%20Communication%20between%20Browsers.md)
  + [04 - Module as npm package](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/04%20-%20Module%20as%20npm%20package.md)
  + [05 - Authenticate Actors and Callers](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/05%20-%20Authenticate%20Actors%20and%20Callers.md)
  + [06 - Using Observers](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/06%20-%20Using%20Observers.md)
  + [07 - Scaling Out Hubs](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/07%20-%20Scaling%20Out%20Hubs.md)
