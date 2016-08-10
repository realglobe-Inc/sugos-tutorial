/**
 * Sample of module with simple call-return function
 * @module tableTennis
 * @see https://github.com/realglobe-Inc/sugo-module-base#usage
 */
'use strict'

const { Module } = require('sugo-actor')
const co = require('co')
const asleep = require('asleep')

// Create a new module
const tableTennis = new Module({
  ping (message = '') {
    // Just wait 500ms and return pong.
    return co(function * () {
      yield asleep(500)
      return `pong! ${message}`
    })
  }
})

module.exports = tableTennis
