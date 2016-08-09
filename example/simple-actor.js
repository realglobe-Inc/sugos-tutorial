'use strict'

const co = require('co')
const sugoActor = require('sugo-actor')
const { Module } = sugoActor

co(function * () {
  // Define a module with methods
  let tableTennis = new Module({
    ping (pong = 'default pong!') {
      return co(function * () {
        /* ... */
        return `"${pong}" from actor!`
      })
    },
    /* ... */
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
