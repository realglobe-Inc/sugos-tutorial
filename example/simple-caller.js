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
