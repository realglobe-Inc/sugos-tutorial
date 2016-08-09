'use strict'

const { spawn } = require('child_process')
const assert = require('assert')
const co = require('co')
const asleep = require('asleep')

describe('tutorial-01', function () {
  this.timeout(18000)
  let dirname = `${__dirname}/../example/tutorial-01`
  let here
  before(() => co(function * () {
    here = process.cwd()
    process.chdir(dirname)
  }))
  after(() => co(function * () {
    process.chdir(here)
  }))
  it('Run example', () => co(function * () {
    let hub = spawn('node', [ './hub.js' ], { stdio: 'inherit' })

    yield asleep(500)
    let actor = spawn('node', [ './actor.js' ], { stdio: 'inherit' })
    yield asleep(500)

    let caller = spawn('node', [ './caller.js' ], { stdio: 'inherit' })

    yield asleep(1300)

    yield new Promise((resolve, reject) => {
      hub.on('exit', () => resolve())
      hub.on('error', (err) => reject(err))
      hub.kill()
    })
    yield asleep(10)
  }))
})

/* global describe, before, after, it */
