#!/usr/bin/env node

/**
 * Update project.
 */

'use strict'

process.chdir(`${__dirname}/..`)

const { update } = require('sugo-ci-module')

update({})
