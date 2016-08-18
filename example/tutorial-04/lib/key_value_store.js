/**
 * KeyValueStore class
 * @class KeyValueStore
 * @augments Module
 * @param {Object} config - Configuration
 */
'use strict'

const { Module } = require('sugo-module-base')
const { name, version, description } = require('../package.json')

const fs = require('fs')
const co = require('co')
const { hasBin } = require('sg-check')
const debug = require('debug')('sugo:module:demo-module')

/** @lends KeyValueStore */
class KeyValueStore extends Module {
  constructor (config = {}) {
    let { filename = 'kv.json' } = config
    debug('Config: ', config)
    super(config)
    const s = this
    s.filename = filename
  }

  /**
   * Ping a message.
   * @param {string} pong
   * @returns {Promise.<string>} - Pong message
   */
  ping (pong = 'pong') {
    return co(function * pingAck () {
      return pong // Return result to a remote caller.
    })
  }

  /**
   * Assert actor system requirements.
   * @throws {Error} - System requirements failed error
   * @returns {Promise.<boolean>} - Asserted state
   */
  assert () {
    const bins = [ 'node' ] // Required commands
    return co(function * assertAck () {
      yield hasBin.assertAll(bins)
      return true
    })
  }

  set (key, value) {
    const s = this
    return co(function * () {
      let data = yield s._read().catch(() => ({}))
      data[ key ] = value
      return yield s._write(data)
    })
  }

  get (key) {
    const s = this
    return co(function * () {
      let data = yield s._read()
      return data[ key ]
    })
  }

  del (key) {
    const s = this
    return co(function * () {
      let data = yield s._read()
      delete data[ key ]
      return yield s._write(data)
    })
  }

  // Private function to read data file
  // Methods with "_" is not exposed to remote caller
  _read () {
    let { filename } = this
    return new Promise((resolve, reject) =>
      fs.readFile((filename), (err, content) => err ? reject(err) : resolve(content))
    ).then(JSON.parse)
  }

  // Private function to write data file
  // Methods with "_" is not exposed to remote caller
  _write (data) {
    let { filename } = this
    return new Promise((resolve, reject) =>
      fs.writeFile(filename, JSON.stringify(data), (err) => err ? reject(err) : resolve())
    )
  }

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
        ping: {
          desc: 'Test the reachability of a module.',
          params: [
            { name: 'pong', type: 'string', desc: 'Pong message to return' }
          ],
          return: {
            type: 'string',
            desc: 'Pong message'
          }
        },

        assert: {
          desc: 'Test if the actor fulfills system requirements',
          params: [],
          throws: [ {
            type: 'Error',
            desc: 'System requirements failed'
          } ],
          return: {
            type: 'boolean',
            desc: 'System is OK'
          }
        },

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
