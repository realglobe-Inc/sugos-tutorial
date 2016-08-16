#!/usr/bin/env node

/**
 * Send reports.
 */

'use strict'

process.chdir(`${__dirname}/..`)

const { report } = require('sugo-ci-module')

report({})