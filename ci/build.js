#!/usr/bin/env node

/**
 * Build this project.
 */

'use strict'

process.chdir(`${__dirname}/..`)

const { runTasks } = require('ape-tasking')
const fs = require('fs')
const co = require('co')
const toc = require('markdown-toc')
const coz = require('coz')
const path = require('path')
const aglob = require('aglob')
const unorm = require('unorm')

const pkg = require('../package.json')
const links = require('../src/links')

let langs = [ 'ja', 'en' ]

runTasks('build', [
  () => coz.render([
    '.*.bud',
    'lib/.*.bud',
    'doc/**/.*.bud',
    'test/.*.bud'
  ]),
  () => co(function * () {
    let prefixes = {
      'ja': '【SUGOSチュートリアル】',
      'en': '[SUGOS Tutorial]'
    }
    let tocTitles = {
      'ja': '内容',
      'en': 'Table of Contents'
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
      let tocTitle = tocTitles[ lang ]
      let prefix = prefixes[ lang ]
      let filenames = yield aglob(`${lang}/*.md.hbs`, { cwd: 'src' })
      for (let filename of filenames) {
        let index = filenames.indexOf(filename)
        let src = path.resolve('src', filename)
        let dest = path.resolve('dist/markdown', filename).replace(/\.hbs$/, '')
        let data = {
          pkg: pkg,
          prefix,
          imgDir: '../../images',
          links: links,
          bannerHeight: '40',
          eyecatchHeight: '128',
          markdownBase,
          markdowns,
          prev: markdowns[ index - 1 ],
          cur: markdowns[ index ],
          next: markdowns[ index + 1 ],
          tocTitle,
          get toc () {
            let content
            try {
              content = fs.readFileSync(dest).toString()
            } catch (e) {
              return null
            }
            return toc(content, {
              maxdepth: 3,
              firsth1: false,
              filter: (line) => {
                return !line.match(prefix) && !line.match(tocTitle)
              }
            }).content.toString()
          }
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
