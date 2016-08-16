/**
 * 
 * @module sugos-tutorial-04
 * @version 4.0.8
 */

'use strict'

const create = require('./create')
const MyModule = require('./my_module')

let lib = create.bind(this)

Object.assign(lib, MyModule, {
  create,
  MyModule
})

module.exports = lib
