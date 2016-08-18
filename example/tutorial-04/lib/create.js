/**
 * Create a module instance
 * @function create
 * @returns {KeyValueStore}
 */
'use strict'

const KeyValueStore = require('./key_value_store')

/** @lends create */
function create (...args) {
  return new KeyValueStore(...args)
}

module.exports = create
