#!/usr/bin/env node

'use strict'

const sugoHub = require('sugo-hub')
const co = require('co')
const crypto = require('crypto')

// Password hash function
const toHash = (password) => crypto.createHash('sha512').update(password).digest('hex')

co(function * () {
  /**
   * Password hashes for auth
   */
  const passwordHashes = {
    actors: {
      'the-actor-for-tutorial-05': toHash('BigBigApplePie')
    },
    callers: {
      'the-caller-for-tutorial-05': toHash('LittleLittleOrange')
    }
  }

  let hub = sugoHub({
    /**
     * Custom auth function.
     * @param {Object} socket - A socket connecting
     * @param {Object} data - Socket auth data
     * @returns {Promise.<boolean>} - OK or not
     */
    authenticate (socket, data) {
      let { id, type, hash } = data
      switch (type) {
        case 'actor': {
          // Check actor hash
          let ok = passwordHashes.actors[ id ] === hash
          if (ok) {
            console.log(`Auth succeeded with actor: ${id}`)
          }
          return Promise.resolve(ok)
        }
        case 'caller': {
          // Check caller hash
          let ok = passwordHashes.callers[ id ] === hash
          if (ok) {
            console.log(`Auth succeeded with caller: ${id}`)
          }
          return Promise.resolve(ok)
        }
        default:
          console.warn(`Unknown type: ${type}`)
          return false
      }
    }
  })
  yield hub.listen(3000)
  console.log(`SUGO Cloud started at port: ${hub.port}`)
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
