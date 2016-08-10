#!/usr/bin/env node

/**
 * Connect actor
 */
'use strict'

const sugoActor = require('sugo-actor')
const co = require('co')
const timeBomb = require('./modules/time-bomb')

co(function * () {
  let actor = sugoActor({
    host: 'localhost:3000',
    key: 'my-actor-02',
    /** Modules to load */
    modules: {
      timeBomb
    }
  })

// Connect to hub
  yield actor.connect()

  console.log(`Actor connected to: ${actor.socket.io.uri}`)
}).catch((err) => console.error(err))
