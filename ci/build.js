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

const pkg = require('../package.json')
const links = require('../src/links')

let langs = [ 'ja' ]

runTasks('build', [
  () => coz.render([
    '.*.bud',
    'lib/.*.bud',
    'test/.*.bud'
  ]),
  () => co(function * () {
    let prefixes = {
      'ja': '【SUGOSチュートリアル】',
      'en': '[SUGOS TUtorial]'
    }
    for (let lang of langs) {
      let markdownBase = 'https://github.com/realglobe-Inc/sugos-tutorial/blob/master'
      let markdowns = aglob.sync(`dist/markdown/${lang}/*.md`).map((filename) => {
        let name = path.basename(filename, '.md')
        let encodedFilename = path.join(path.dirname(filename), encodeURIComponent(unorm.nfc(name)) + '.md')
        return {
          name,
          filename: encodedFilename,
          url: `${markdownBase}/${encodedFilename}`
        }
      })
      let filenames = yield aglob(`${lang}/*.md.hbs`, { cwd: 'src' })
      for (let filename of filenames) {
        let index = filenames.indexOf(filename)
        let src = path.resolve('src', filename)
        let dest = path.resolve('dist/markdown', filename).replace(/\.hbs$/, '')
        let data = {
          pkg: pkg,
          prefix: prefixes[ lang ],
          imgDir: '../../images',
          links: links,
          bannerHeight: '40',
          markdownBase,
          markdowns,
          prev: markdowns[ index - 1 ],
          cur: markdowns[ index ],
          next: markdowns[ index + 1 ]
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
