# [SUGOS Tutorial] 


This tutorials shows you to how to scale out [SUGO-Hub](https://github.com/realglobe-Inc/sugo-hub#readme).
Hub instances connected same redis server act like same instance.


<a href="">
    <img src="../../images/eyecatch-spread.jpg"
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

Then, install dependencies.


```bash
npm install sugo-actor sugo-caller sugo-hub sugo-observer co asleep -S
```

### Running Redis Server

Start [Redis](https://github.com/realglobe-Inc/sugos) on locale。By default, it listens port 6379.

```bash
redis-server
```


### Running Hub Server

This time create 2 hub instances with different pots.

**hub.js**

```javascript
#!/usr/bin/env node

'use strict'

const sugoHub = require('sugo-hub')
const co = require('co')

const ports = [ 3000, 3001 ]

co(function * () {
  // Start hub server for each ports
  for (let port of ports) {
    let hub = sugoHub({
      storage: {
        // Use redis as storage
        // See https://github.com/realglobe-Inc/sugo-hub#using-redis-server
        redis: {
          host: 'localhost',
          port: '6379',
          db: 1
        }
      }
    })
    yield hub.listen(port)
    console.log(`SUGO Cloud started at port: ${hub.port}`)
  }
}).catch((err) => {
  console.error(err)
  process.exit(1)
})

```
```bash
node ./hub.js
```

### Connecting Actor to Hub

Prepare actors for each hubs

**actor.js**

```javascript
#!/usr/bin/env node

'use strict'

const sugoActor = require('sugo-actor')
const { Module } = sugoActor
const co = require('co')
const asleep = require('asleep')

const HUB_O1 = 'localhost:3000'
const HUB_O2 = 'localhost:3001'

co(function * () {
  const tableTennis = () => new Module({
    ping (message = '') {
      // Just wait 500ms and return pong.
      return co(function * () {
        yield asleep(500)
        return `pong! ${message}`
      })
    }
  })

  // Prepare actors for each hubs
  let actors = [
    sugoActor({
      host: HUB_O1,
      key: 'my-actor-07@hub01',
      modules: { tableTennis: tableTennis() }
    }),
    sugoActor({
      host: HUB_O2,
      key: 'my-actor-07@hub02',
      modules: { tableTennis: tableTennis() }
    })
  ]

  for (let actor of actors) {
    // Connect to hub
    yield actor.connect()

    console.log(`Actor connected to: ${actor.socket.io.uri}`)
  }
}).catch((err) => console.error(err))

```

```bash
node ./actor.js
```


### Connecting Caller to Hub

Prepare a caller and connect to each actors.


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

const HUB_O1 = 'localhost:3000'

co(function * () {
  let caller = sugoCaller({
    host: HUB_O1
  })

  // Try actors on each hub
  let actorKeys = [
    'my-actor-07@hub01',
    'my-actor-07@hub02'
  ]

  for (let actorKey of actorKeys) {
    // Connect to actor
    let myActor07 = yield caller.connect(actorKey)
    let tableTennis = myActor07.get('tableTennis')

    let pong = yield tableTennis.ping('hello world!')
    console.log(`Pong from ${actorKey}/tableTennis: "${pong}"`)
  }
}).catch((err) => console.error(err))


```

```bash
node ./caller.js
```

However the caller is on the hub01 (with port 3000), it can connect to the actor who is on hub01 (with port 3001).


### Conclusion

+ SUGO-Hub can be scaled out with Redis
+ Scaled hubs act like a single hub


## You may Want to Read

+ Previous Tutorial: [06 - Using Observers](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/06%20-%20Using%20Observers.md)
+ Next Tutorial: []()


## Links

+ [SUGOS](https://github.com/realglobe-Inc/sugos)
+ [SUGO-Actor](https://github.com/realglobe-Inc/sugo-actor)
+ [SUGO-Scaffold](https://github.com/realglobe-Inc/sugo-scaffold)
+ Tutorials
+ [00 - Let us begin with SUGOS](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/00%20-%20Let%20us%20begin%20with%20SUGOS.md)
+ [01 - Hello World, as always](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/01%20-%20Hello%20World%2C%20as%20always.md)
+ [02 - Using Event Emit](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/02%20-%20Using%20Event%20Emit.md)
+ [03 - Communication between Browsers](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/03%20-%20Communication%20between%20Browsers.md)
+ [04 - Module as npm package](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/04%20-%20Module%20as%20npm%20package.md)
+ [05 - Authenticate Actors and Callers](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/05%20-%20Authenticate%20Actors%20and%20Callers.md)
+ [06 - Using Observers](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/06%20-%20Using%20Observers.md)
