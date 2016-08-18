/**
 * Test case for demoModule.
 * Runs with mocha.
 */
'use strict'

const KeyValueStore = require('../lib/key_value_store.js')
const assert = require('assert')
const co = require('co')
const { EventEmitter } = require('events')
const sgSchemas = require('sg-schemas')
const sgValidator = require('sg-validator')

describe('demo-module', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Get module spec', () => co(function * () { /* ... */ }))

  it('Try ping-pong', () => co(function * () { /* ... */ }))

  it('Do assert', () => co(function * () { /* ... */ }))

  it('Compare methods with spec', () => co(function * () { /* ... */ }))

  it('Do get/set/del', () => co(function * () {
    let module = new KeyValueStore({
      filename: `${__dirname}/../testing-store.json`,
      $emitter: new EventEmitter()
    })
    yield module.set('foo', 'This is foo')
    {
      let foo = yield module.get('foo')
      assert.equal(foo, 'This is foo')
    }
    yield module.del('foo')
    {
      let foo = yield module.get('foo')
      assert.equal(foo, undefined)
    }
  }))
})

/* global describe, before, after, it */
