#!/usr/bin/env node

'use strict'

const sugoActor = require('sugo-actor')
const { Module } = sugoActor
const co = require('co')
const asleep = require('asleep')

const HUB_O1 = 'localhost:3000'
const HUB_O2 = 'localhost:3001'

co(function * () {
  const tableTennis = () => new Module({
    ping (message = '') {
      // Just wait 500ms and return pong.
      return co(function * () {
        yield asleep(500)
        return `pong! ${message}`
      })
    }
  })

  // Prepare actors for each hubs
  let actors = [
    sugoActor({
      host: HUB_O1,
      key: 'my-actor-07@hub01',
      modules: { tableTennis: tableTennis() }
    }),
    sugoActor({
      host: HUB_O2,
      key: 'my-actor-07@hub02',
      modules: { tableTennis: tableTennis() }
    })
  ]

  for (let actor of actors) {
    // Connect to hub
    yield actor.connect()

    console.log(`Actor connected to: ${actor.socket.io.uri}`)
  }
}).catch((err) => console.error(err))
