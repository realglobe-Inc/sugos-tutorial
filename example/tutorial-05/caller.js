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

