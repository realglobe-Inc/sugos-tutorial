#!/usr/bin/env node

'use strict'

const sugoHub = require('sugo-hub')
const co = require('co')

const ports = [ 3000, 3001 ]

co(function * () {
  // Start hub server for each ports
  for (let port of ports) {
    let hub = sugoHub({
      storage: {
        // Use redis as storage
        // See https://github.com/realglobe-Inc/sugo-hub#using-redis-server
        redis: {
          host: 'localhost',
          port: '6379',
          db: 1
        }
      }
    })
    yield hub.listen(port)
    console.log(`SUGO Cloud started at port: ${hub.port}`)
  }
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
