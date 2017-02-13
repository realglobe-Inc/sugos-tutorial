# [SUGOS Tutorial] 02 - Using Event Emit

In [the Previous Tutorial](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/01%20-%20Hello%20World%2C%20as%20always.md), we learned simple call/return function.

Now, we will try using event emitter interface.
Fire events from actors and receive them on callers.


<a href="https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/02%20-%20Using%20Event%20Emit.md">
  <img src="../../images/eyecatch-event-emit.jpg"
       alt="eyecatch"
       height="128"
       style="height:128px"
  /></a>



## Try It Out

### Prepare project

For the beginning, prepare project directory.

```bash
mkdir sugos-tutorial-02
cd sugos-tutorial-02
npm init -y

```

Then, install dependencies.

```bash
npm install sugo-actor sugo-caller sugo-hub co asleep -S
```

### Running Hub Server

Hub server script is same as the previous tutorial.

**hub.js**
```javascript
#!/usr/bin/env node

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

Then, execute with node.

```bash
node ./hub.js
```

### Declaring a Module to Fire Events

Define a module which fires tick each second and say "boom!"

**modules/time-bomb.js**
```javascript
/**
 * Sample of module with event emitting
 * @module tableTennis
 */
'use strict'

const { Module } = require('sugo-actor')
const co = require('co')
const asleep = require('asleep')

const timeBomb = new Module({
  countDown (count) {
    const s = this
    return co(function * () {
      let abort = () => { count = -1 }
      s.on('abort', abort) // Listen to events from the caller
      while (count > 0) {
        count--
        s.emit('tick', { count }) // Emit an event to the caller
        yield new Promise((resolve) =>
          setTimeout(() => resolve(), 1000)
        )
      }
      s.off('abort', abort) // Remove event listener
      let isAborted = count === -1
      return isAborted ? 'hiss...' : 'booom!!!'
    })
  }
})

module.exports = timeBomb

```

The `this` inside module method inherits EventEmitter and has `.on`, `.off` and `.emit()`methods


### Setting the Module to Actor and Connect to Hub Server

Create an actor instance

**actor.js**
```javascript
#!/usr/bin/env node

'use strict'

const sugoActor = require('sugo-actor')
const co = require('co')
const timeBomb = require('./modules/time-bomb')

co(function * () {
  let actor = sugoActor({
    host: 'localhost:3000',
    key: 'my-actor-02',
    /** Modules to load */
    modules: {
      timeBomb
    }
  })

// Connect to hub
  yield actor.connect()

  console.log(`Actor connected to: ${actor.socket.io.uri}`)
}).catch((err) => console.error(err))

```

```bash
node ./actor.js
```

### Calling from Caller

Call the timeBomb module from caller side.
The module instance returns from `.get()` on caller side is also an instance of EventEmitter.

**caller.js**
```javascript
#!/usr/bin/env node
'use strict'

const sugoCaller = require('sugo-caller')
const co = require('co')

co(function * () {
  let caller = sugoCaller({
    host: 'localhost:3000'
  })

  // Connect to actor
  let myActor02 = yield caller.connect('my-actor-02')
  let timeBomb = myActor02.get('timeBomb')
  let tick = (data) => console.log(`tick: ${data.count}`)
  timeBomb.on('tick', tick) // Add listener
  let booom = yield timeBomb.countDown(10)
  console.log(booom)
  timeBomb.off('tick', tick) // Remove listener
}).catch((err) => console.error(err))

```

Note that `yield timeBomb.countDown(10)` waits until the count down finished.
Internally, promise state is pending until actor returns.

Now, execute the script and do count down.

```bash
node ./caller.js
```

## Conclusion


+ `this` in module methods is an instance of EventEmitter
+ Fire and receive events via `.on()`, `.off()`, `.emit()` methods.
+ While an promise on actor side is pending, caller also waits

Code snippets of this tutorial are also [available here](https://github.com/realglobe-Inc/sugos-tutorial/tree/master/example/tutorial-02)



## You may Want to Read

+ Previous Tutorial: [01 - Hello World, as always](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/01%20-%20Hello%20World%2C%20as%20always.md)
+ Next Tutorial: [03 - Communication betweein Browsers](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/03%20-%20Communication%20betweein%20Browsers.md)

## Links

+ [SUGOS](https://github.com/realglobe-Inc/sugos)
+ [SUGO-Hub](https://github.com/realglobe-Inc/sugo-hub)
+ [SUGO-Actor](https://github.com/realglobe-Inc/sugo-actor)
+ [SUGO-Caller](https://github.com/realglobe-Inc/sugo-caller)
+ Tutorials
  + [00 - Let us begin with SUGOS](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/00%20-%20Let%20us%20begin%20with%20SUGOS.md)
  + [01 - Hello World, as always](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/01%20-%20Hello%20World%2C%20as%20always.md)
  + [02 - Using Event Emit](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/02%20-%20Using%20Event%20Emit.md)
  + [03 - Communication betweein Browsers](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/03%20-%20Communication%20betweein%20Browsers.md)
  + [04 - Module as npm package](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/04%20-%20Module%20as%20npm%20package.md)
  + [05 - Authenticate Actors and Callers](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/05%20-%20Authenticate%20Actors%20and%20Callers.md)
