#!/usr/bin/env

/**
 * Build script
 */
'use strict'

const fs = require('fs')
const browserify = require('browserify')


function bundle (src, dest) {
  browserify(src)
    .transform('babelify', {
      babelrc: false,
      presets: [ 'es2015', 'react' ]
    })
    .bundle()
    .pipe(fs.createWriteStream(dest))
    .on('close', () => {
      console.log(`File generated: ${dest}`)
    })
}

bundle('public/actor.jsx', 'public/actor.js')
bundle('public/caller.jsx', 'public/caller.js')
