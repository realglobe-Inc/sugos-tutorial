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
const unorm = require('unorm')

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
        let data = {
          pkg: require('../package.json'),
          imgDir: '../../images',
          links: require('../src/links'),
          bannerHeight: '40',
          markdownBase: 'https://github.com/realglobe-Inc/sugos-tutorial/blob/master',
          markdowns: aglob.sync(`dist/markdown/${lang}/*.md`).map((filename) => ({
            name: path.basename(filename, '.md'),
            filename: path.join(path.dirname(filename), encodeURIComponent(unorm.nfc(path.basename(filename, '.md'))) + '.md')
          }))
        }
        yield coz.render({
          tmpl: src,
          path: dest,
          force: true,
          mkdirp: true,
          mode: '444',
          cwd: `${__dirname}/..`,
          data
        })
      }
    }
  })

], true)
