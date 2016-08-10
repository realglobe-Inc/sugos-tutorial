#!/usr/bin/env node

/**
 * Start hub server
 * @see https://github.com/realglobe-Inc/sugo-hub
 */
'use strict'

const sugoHub = require('sugo-hub')

const co = require('co')

co(function * () {
  let hub = yield sugoHub({
    // Options
    port: 3000
  })
  console.log(`SUGO Cloud started at port: ${hub.port}`)
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
