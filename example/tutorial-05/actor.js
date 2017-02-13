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
