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
  let myActor02 = yield caller.connect('my-actor-02')
  let timeBomb = myActor02.get('timeBomb')
  let tick = (data) => console.log(`tick: ${data.count}`)
  timeBomb.on('tick', tick) // Add listener
  let booom = yield timeBomb.countDown(10)
  console.log(booom)
  timeBomb.off('tick', tick) // Remove listener
}).catch((err) => console.error(err))
