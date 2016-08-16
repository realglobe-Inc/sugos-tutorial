/**
 * Test case for demoModule.
 * Runs with mocha.
 */
'use strict'

const MyModule = require('../lib/my_module.js')
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

  it('Get module spec', () => co(function * () {
    let module = new MyModule({ $emitter: new EventEmitter() })
    assert.ok(module)

    let { $spec } = module
    let specError = sgValidator(sgSchemas.moduleSpec).validate($spec)
    assert.ok(!specError)
  }))

  it('Try ping-pong', () => co(function * () {
    let module = new MyModule({ $emitter: new EventEmitter() })
    let pong = yield module.ping('pong')
    assert.equal(pong, 'pong')
  }))

  it('Do assert', () => co(function * () {
    let module = new MyModule({ $emitter: new EventEmitter() })
    let caught
    try {
      yield module.assert({})
    } catch (err) {
      caught = err
    }
    assert.ok(!caught)
  }))

  it('Compare methods with spec', () => co(function * () {
    let module = new MyModule({ $emitter: new EventEmitter() })
    let { $spec } = module
    let implemented = Object.getOwnPropertyNames(MyModule.prototype)
      .filter((name) => !/^[\$_]/.test(name))
      .filter((name) => !~[ 'constructor' ].indexOf(name))
    let described = Object.keys($spec.methods).filter((name) => !/^[\$_]/.test(name))
    for (let name of implemented) {
      assert.ok(!!~described.indexOf(name), `${name} method should be described in spec`)
    }
    for (let name of described) {
      assert.ok(!!~implemented.indexOf(name), `${name} method should be implemented`)
    }
  }))
})

/* global describe, before, after, it */
