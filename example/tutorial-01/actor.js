#!/usr/bin/env node

/**
 * Connect actor
 */
'use strict'

const sugoActor = require('sugo-actor')
const co = require('co')
const tableTennis = require('./modules/table-tennis')

co(function * () {
  let actor = sugoActor({
    host: 'localhost:3000',
    key: 'my-actor-01',
    /** Modules to load */
    modules: {
      tableTennis
    }
  })

// Connect to hub
  yield actor.connect()

  console.log(`Actor connected to: ${actor.socket.io.uri}`)
}).catch((err) => console.error(err))
