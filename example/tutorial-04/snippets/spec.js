/** ... */
'use strict'

const { Module } = require('sugo-module-base')
const { name, version, description } = require('../package.json')

const co = require('co')
const fs = require('fs')
const { hasBin } = require('sg-check')
const debug = require('debug')('sugo:module:demo-module')

/** @lends KeyValueStore */
class KeyValueStore extends Module {
  constructor (config = {}) { /* ... */ }

  /** ... */
  ping (pong = 'pong') { /* ... */ }

  /** ... */
  assert () { /* ... */ }

  set (key, value) { /* ... */ }

  get (key) { /* ... */ }

  del (key) { /* ... */ }

  // Private function to read data file
  // Methods with "_" is not exposed to remote caller
  _read () { /* ... */ }

  // Private function to write data file
  // Methods with "_" is not exposed to remote caller
  _write (data) { /* ... */ }

  /**
   * Module specification
   * @see https://github.com/realglobe-Inc/sg-schemas/blob/master/lib/module_spec.json
   */
  get $spec () {
    return {
      name,
      version,
      desc: description,
      methods: {
        ping: { /* ... */ },

        assert: { /* ... */ },

        set: {
          desc: 'Set key value',
          params: [
            { name: 'key', type: 'string', desc: 'Key to set' },
            { name: 'value', type: 'string', desc: 'value to set' }
          ]
        },

        get: {
          desc: 'Get by key ',
          params: [
            { name: 'key', type: 'string', desc: 'Key to set' }
          ],
          return: { type: 'string', desc: 'Found value' }
        },

        del: {
          desc: 'Delete by key ',
          params: [
            { name: 'key', type: 'string', desc: 'Key to set' }
          ]
        }
      },
      events: null
    }
  }
}

module.exports = KeyValueStore
