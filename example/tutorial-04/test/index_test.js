/**
 * Test case for index.
 * Runs with mocha.
 */
'use strict'

const index = require('../lib/index.js')
const assert = require('assert')
const co = require('co')

describe('index', () => {
  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Eval props', () => co(function * () {
    assert.ok(index)
    for (let name of Object.keys(index)) {
      assert.ok(index[ name ], name)
    }
  }))

  it('Eval browser index', () => co(function * () {
    let index = require('../shim/browser')
    assert.ok(index)
  }))
})

/* global describe, before, after, it */
