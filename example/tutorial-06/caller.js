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

