/**
 * Create a module instance
 * @function create
 * @returns {MyModule}
 */
'use strict'

const MyModule = require('./my_module')

/** @lends create */
function create (...args) {
  return new MyModule(...args)
}

module.exports = create
