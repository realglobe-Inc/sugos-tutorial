#!/usr/bin/env node
/**
 * Use sugo observer
 * @see https://github.com/realglobe-Inc/sugo-observer#readme
 */
'use strict'

const sugoObserver = require('sugo-observer')
const asleep = require('asleep')
const co = require('co')

co(function * () {
  let observer = sugoObserver(({ event, data }) => {
    switch (event) {
      case 'actor:setup': {
        let { key } = data
        console.log(`New actor joined: ${key}`)
        break
      }
      case 'caller:join': {
        let { actor } = data
        console.log(`New called joined to actor: ${actor.key}`)
        break
      }
      default:
        break
    }
  }, {
    host: 'localhost:3000'
  })

  yield observer.start() // Start observing
  /* ... */
  yield asleep(200000)
  yield observer.stop() // Stop observing

}).catch((err) => console.error(err))
