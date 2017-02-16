# [SUGOS Tutorial] 05 - Authenticate Actors and Callers

This tutorial shows you how to authenticate actors and callers on hub.


<a href="https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/05%20-%20Authenticate%20Actors%20and%20Callers.md">
    <img src="../../images/eyecatch-auth.jpg"
         alt="eyecatch"
         height="128"
         style="height:128px"
    /></a>




## Try It Out

### Prepare project

Prepare project directory, as usual.

```bash
mkdir sugos-tutorial-05
cd sugos-tutorial-05
npm init -y

```

Then, install dependencies.

```bash
npm install sugo-actor sugo-caller sugo-hub co debug asleep -S
```

### Running Hub Server

Add `authenticate` option on hub creation.
Passing custom authenticate function enables you to accept/reject connecting sockets.

For now, compare the password hash to conform.

**hub.js**

```javascript
#!/usr/bin/env node

'use strict'

const sugoHub = require('sugo-hub')
const co = require('co')
const crypto = require('crypto')

// Password hash function
const toHash = (password) => crypto.createHash('sha512').update(password).digest('hex')

co(function * () {
  /**
   * Password hashes for auth
   */
  const passwordHashes = {
    actors: {
      'the-actor-for-tutorial-05': toHash('BigBigApplePie')
    },
    callers: {
      'the-caller-for-tutorial-05': toHash('LittleLittleOrange')
    }
  }

  let hub = sugoHub({
    /**
     * Custom auth function.
     * @param {Object} socket - A socket connecting
     * @param {Object} data - Socket auth data
     * @returns {Promise.<boolean>} - OK or not
     */
    authenticate (socket, data) {
      let { id, type, hash } = data
      switch (type) {
        case 'actor': {
          // Check actor hash
          let ok = passwordHashes.actors[ id ] === hash
          if (ok) {
            console.log(`Auth succeeded with actor: ${id}`)
          }
          return Promise.resolve(ok)
        }
        case 'caller': {
          // Check caller hash
          let ok = passwordHashes.callers[ id ] === hash
          if (ok) {
            console.log(`Auth succeeded with caller: ${id}`)
          }
          return Promise.resolve(ok)
        }
        default:
          console.warn(`Unknown type: ${type}`)
          return false
      }
    }
  })
  yield hub.listen(3000)
  console.log(`SUGO Cloud started at port: ${hub.port}`)
}).catch((err) => {
  console.error(err)
  process.exit(1)
})

```
```bash
DEBUG=sugos:tutorial:* node ./hub.js
```


### Connecting Actor to Hub

Add `auth` option on actor creation and pass authenticate data as object.
This data will be the second arguments on hub authenticate functions.

**actor.js**

```javascript
#!/usr/bin/env node

'use strict'

const sugoActor = require('sugo-actor')
const { Module } = sugoActor
const co = require('co')
const asleep = require('asleep')
const crypto = require('crypto')

// Password hash function
const toHash = (password) => crypto.createHash('sha512').update(password).digest('hex')

co(function * () {
  let actor = sugoActor({
    host: 'localhost:3000',
    key: 'my-actor-05',
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
    },

    /**
     * Authenticate data of this actor
     */
    auth: {
      id: 'the-actor-for-tutorial-05',
      type: 'actor',
      hash: toHash('BigBigApplePie')
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

Run this actor script and you will see auth success message on hub side.


### Connecting Caller to Hub

Caller side as same. Pass authentication data to `auth` options.

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
const crypto = require('crypto')

// Password hash function
const toHash = (password) => crypto.createHash('sha512').update(password).digest('hex')

co(function * () {
  let caller = sugoCaller({
    host: 'localhost:3000',
    /**
     * Authenticate data of this caller
     */
    auth: {
      id: 'the-caller-for-tutorial-05',
      type: 'caller',
      hash: toHash('LittleLittleOrange')
    }
  })

  // Connect to actor
  let myActor05 = yield caller.connect('my-actor-05')
  let tableTennis = myActor05.get('tableTennis')

  let pong = yield tableTennis.ping('hello world!')
  console.log(`Pong from myActor05/tableTennis: "${pong}"`)
}).catch((err) => console.error(err))


```

```bash
node ./caller.js
```

### Conclusion

+ Passing a function to `authenticate` on Hub enables you to authenticate Actors and Callers
+ Signature of authenticate function is `(socket, data) -> Promise.<Boolean/>`
+ Actor and Caller receives authentication data as `auth` option

## You may Want to Read

+ Previous Tutorial: [04 - Module as npm package](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/04%20-%20Module%20as%20npm%20package.md)
+ Next Tutorial: [06 - Using Observers](https://github.com/realglobe-Inc/sugos-tutorial/blob/master/dist/markdown/en/06%20-%20Using%20Observers.md)


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
