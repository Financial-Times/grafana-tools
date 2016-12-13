#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const GrafanaClient = require('..');
const path = require('path');
const pkg = require('../package.json');
const program = require('commander');

program
	.usage('<name> <file> [options]')
	.version(pkg.version)
	.option(
		'-a, --api-key <key>',
		'the API key to use when accessing the Grafana API',
		process.env.GRAFANA_API_KEY
	)
	.option(
		'-H, --hostname <host>',
		'the hostname Grafana runs on',
		'grafana.ft.com'
	)
	.parse(process.argv);

// Get program args
const name = program.args[0];
let file = program.args[1];

// No arguments? Show the help
if (!name || !file) {
	program.help();
}

// Resolve the file path against CWD and add an extension
if (!file.startsWith('/')) {
	file = path.resolve(process.cwd(), file);
}
if (!file.endsWith('.js') && !file.endsWith('.json')) {
	file += '.json';
}

// A little feedback
console.log(chalk.cyan.underline(`Pulling dashboard "${name}" from Grafana`));
console.log(`Will save to local file: "${file}"`);

// Do the thing!
const grafana = new GrafanaClient({
	apiKey: program.apiKey,
	hostname: program.hostname
});
grafana.pull(name, file)
	.then(() => {
		console.log(chalk.green(`Pulled dashboard successfully`));
	})
	.catch(error => {
		console.error(`${chalk.red(error.message)}\n${error.stack ? chalk.grey(error.stack.replace(error.message, '')) : ''}`);
		process.exit(1);
	});
