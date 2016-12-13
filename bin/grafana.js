#!/usr/bin/env node
'use strict';

const pkg = require('../package.json');
const program = require('commander');

program
	.usage('[options]')
	.version(pkg.version)
	.command('pull <slug> <file>', 'pull down JSON for an existing dashboard and save it')
	.command('push <slug> <file>', 'push local JSON to an existing dashboard')
	.parse(process.argv);
