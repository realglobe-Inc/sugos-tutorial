#!/usr/bin/env node

/**
 * Format files.
 */

'use strict'

process.chdir(`${__dirname}/..`)

const { format } = require('sugo-ci-module')

format({})
