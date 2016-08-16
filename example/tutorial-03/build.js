#!/usr/bin/env node

/**
 * Build script
 */
'use strict'

const fs = require('fs')
const co = require('co')
const browserify = require('browserify')
const browserifyInc = require('browserify-incremental')
const xtend = require('xtend')

function bundle (src, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Bundling ${src}...`)
    let b = browserify(src, xtend(browserifyInc.args, {
      // your custom opts
    })).transform('babelify', {
      babelrc: false,
      presets: [ 'es2015', 'react' ]
    })

    browserifyInc(b, { cacheFile: './tmp/browserify-cache.json' })

    b
      .bundle()
      .pipe(fs.createWriteStream(dest))
      .on('error', (err) => {
        console.error(err)
        reject(err)
      })
      .on('close', () => {
        console.log(`File bundled: ${dest}`)
        resolve()
      })
  })
}

co(function * () {
  yield bundle('public/actor.jsx', 'public/actor.js')
  yield bundle('public/caller.jsx', 'public/caller.js')
})

