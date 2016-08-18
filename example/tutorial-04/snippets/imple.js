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

  // Add "filename" parameter on constructor

  constructor (filename = 'kv.json', config = {}) {
    debug('Config: ', config)
    super(config)
    const s = this
    s.filename = filename
  }

  /** ... */
  ping (pong = 'pong') { /* ... */ }

  /** ... */
  assert () { /* ... */ }

  // Define methods for Key-vale store

  set (key, value) {
    const s = this
    return co(function * () {
      let data = yield s._read()
      data[ key ] = value
      return yield s.write(data)
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
      return yield s.write(data)
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

  /** ... */
  get $spec () { /* ... */ }
}

module.exports = KeyValueStore
