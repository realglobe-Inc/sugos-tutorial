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

