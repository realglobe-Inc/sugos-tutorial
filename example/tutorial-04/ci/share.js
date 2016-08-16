#!/usr/bin/env node

/**
 * Share this project.
 */

'use strict'

process.chdir(`${__dirname}/..`)

const pkg = require('../package.json')
const { share } = require('sugo-ci-module')

share(pkg, {})