/**
 * Simple key value store for Tutotiral 04
 * @module sugos-tutorial-04
 * @version 4.0.8
 */

'use strict'

const create = require('./create')
const KeyValueStore = require('./key_value_store')

let lib = create.bind(this)

Object.assign(lib, KeyValueStore, {
  create,
  KeyValueStore
})

module.exports = lib
