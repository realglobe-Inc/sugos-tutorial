# [SUGOS Tutorial] 05 - Authenticate Actors and Callers

[Sugo Observer](https://github.com/realglobe-Inc/sugo-observer#readme) enables you to observe actors and callers on hub from client side.

On this tutorial, emit logs when actor and caller connected to hub.


<a href="https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/05%20-%20Authenticate%20Actors%20and%20Callers.md">
    <img src="../../images/eyecatch-dynamic.jpg"
         alt="eyecatch"
         height="128"
         style="height:128px"
    /></a>



## Try It Out

Prepare project directory, as usual.


```bash
mkdir sugos-tutorial-06
cd sugos-tutorial-06
npm init -y

```

Then, install dependencies. Note that we added "sugo-observer" package this time.

```bash
npm install sugo-actor sugo-caller sugo-hub sugo-observer co asleep -S
```

### Running Hub Server

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
```bash
node ./hub.js
```

### Start Observing

Use SUGO-Observer factory method（`.sugoObserver(handler, config)`) to create an instance


**observer.js**

```javascript
#!/usr/bin/env node
/**
 * Use sugo observer
 * @see https://github.com/realglobe-Inc/sugo-observer#readme
 */
'use strict'

const sugoObserver = require('sugo-observer')
const asleep = require('asleep')
const co = require('co')

co(function * () {
  let observer = sugoObserver(({ event, data }) => {
    switch (event) {
      case 'actor:setup': {
        let { key } = data
        console.log(`New actor joined: ${key}`)
        break
      }
      case 'caller:join': {
        let { actor } = data
        console.log(`New called joined to actor: ${actor.key}`)
        break
      }
      default:
        break
    }
  }, {
    host: 'localhost:3000'
  })

  yield observer.start() // Start observing
  /* ... */
  yield asleep(200000)
  yield observer.stop() // Stop observing

}).catch((err) => console.error(err))

```

```bash
node ./observer.js
```


### Connecting Actor to Hub

**actor.js**

```javascript
#!/usr/bin/env node

'use strict'

const sugoActor = require('sugo-actor')
const { Module } = sugoActor
const co = require('co')
const asleep = require('asleep')

co(function * () {
  let actor = sugoActor({
    host: 'localhost:3000',
    key: 'my-actor-06',
    /** Modules to load */
    modules: {
      tableTennis: new Module({
        ping (message = '') {
          // Just wait 500ms and return pong.
          return co(function * () {
            yield asleep(500)
            return `pong! ${message}`
          })
        }
      })
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

Executing this will show message on observer side.

### Connecting Caller to Hub


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
  let myActor06 = yield caller.connect('my-actor-06')
  let tableTennis = myActor06.get('tableTennis')

  let pong = yield tableTennis.ping('hello world!')
  console.log(`Pong from myActor06/tableTennis: "${pong}"`)
}).catch((err) => console.error(err))


```

```bash
node ./caller.js
```

Executing this will show message on observer side.


### Conclusion

+ SUGO-Observe enables you to observe hub from client side
+ Detects connections of actors/callers


## You may Want to Read

+ Previous Tutorial: [04 - Module as npm package](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/04%20-%20Module%20as%20npm%20package.md)
+ Next Tutorial: []()


## Links

+ [SUGOS](https://github.com/realglobe-Inc/sugos)
+ [SUGO-Actor](https://github.com/realglobe-Inc/sugo-actor)
+ [SUGO-Scaffold](https://github.com/realglobe-Inc/sugo-scaffold)
+ Tutorials
+ [00 - Let us begin with SUGOS](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/00%20-%20Let%20us%20begin%20with%20SUGOS.md)
+ [01 - Hello World, as always](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/01%20-%20Hello%20World%2C%20as%20always.md)
+ [02 - Using Event Emit](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/02%20-%20Using%20Event%20Emit.md)
+ [03 - Communication betweein Browsers](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/03%20-%20Communication%20betweein%20Browsers.md)
+ [03 - Communication between Browsers](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/03%20-%20Communication%20between%20Browsers.md)
+ [04 - Module as npm package](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/04%20-%20Module%20as%20npm%20package.md)
+ [05 - Authenticate Actors and Callers](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/05%20-%20Authenticate%20Actors%20and%20Callers.md)
