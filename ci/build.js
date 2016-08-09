#!/usr/bin/env node

/**
 * Build this project.
 */

'use strict'

process.chdir(`${__dirname}/..`)

const { runTasks } = require('ape-tasking')
const co = require('co')
const coz = require('coz')
const path = require('path')
const aglob = require('aglob')

let langs = [ 'ja' ]

runTasks('build', [
  () => coz.render([
    '.*.bud',
    'lib/.*.bud',
    'test/.*.bud'
  ]),
  () => co(function * () {
    for (let lang of langs) {
      let filenames = yield aglob(`${lang}/*.md.hbs`, { cwd: 'src' })
      for (let filename of filenames) {
        let src = path.resolve('src', filename)
        let dest = path.resolve('dist/markdown', filename).replace(/\.hbs$/, '')
        yield coz.render({
          tmpl: src,
          path: dest,
          force: true,
          mkdirp: true,
          mode: '444',
          cwd: `${__dirname}/..`,
          data: {
            imgDir: '../../images',
            links: require('../src/links')
          }
        })
      }
    }
  })

], true)
