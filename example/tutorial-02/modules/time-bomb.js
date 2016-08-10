/**
 * Sample of module with event emitting
 * @module tableTennis
 */
'use strict'

const { Module } = require('sugo-actor')
const co = require('co')
const asleep = require('asleep')

const timeBomb = new Module({
  countDown (count) {
    const s = this
    return co(function * () {
      let abort = () => { count = -1 }
      s.on('abort', abort) // Listen to events from the caller
      while (count > 0) {
        count--
        s.emit('tick', { count }) // Emit an event to the caller
        yield new Promise((resolve) =>
          setTimeout(() => resolve(), 1000)
        )
      }
      s.off('abort', abort) // Remove event listener
      let isAborted = count === -1
      return isAborted ? 'hiss...' : 'booom!!!'
    })
  }
})

module.exports = timeBomb
