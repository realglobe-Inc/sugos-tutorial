/**
 * Use sugo caller
 * @see https://github.com/realglobe-Inc/sugo-caller#readme
 */
'use strict'

const co = require('co')
const sugoCaller = require('sugo-caller')

co(function * () {
  let caller = sugoCaller({
    host: 'localhost:3000'
  })

  // Connect to actor
  let myActor01 = yield caller.connect('my-actor-01')
  let tableTennis = myActor01.get('tableTennis')

  let pong = yield tableTennis.ping('hello world!')
  console.log(`Pong from myActor01/tableTennis: "${pong}"`)
}).catch((err) => console.error(err))

