'use strict'

const { spawn } = require('child_process')
const assert = require('assert')
const co = require('co')
const asleep = require('asleep')

describe('tutorial-04', function () {
  this.timeout(18000)
  let dirname = `${__dirname}/../example/tutorial-04`
  let here
  before(() => co(function * () {
    here = process.cwd()
    process.chdir(dirname)
  }))
  after(() => co(function * () {
    process.chdir(here)
  }))
  it('Run example', () => co(function * () {
    let pkg = require('../example/tutorial-04')
    assert.ok(pkg)
  }))
})

/* global describe, before, after, it */
