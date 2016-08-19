#!/usr/bin/env node

/**
 * Example usage to register module on actor
 * @see https://github.com/realglobe-Inc/sugo-actor
 */
'use strict'

const { KeyValueStore } = require('sugos-tutorial-04')
const sugoActor = require('sugo-actor')
const co = require('co')

co(function * () {
  let actor = sugoActor('http://my-sugo-cloud.example.com/actors', {
    key: 'my-actor-01',
    modules: {
      // Register the module
      kvs: new KeyValueStore({
        filename: 'kv.json'
      })
    }
  })
  yield actor.connect()
}).catch((err) => console.error(err))
