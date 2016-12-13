'use strict';

const pkg = require('../package.json');
const extend = require('node.extend');
const fs = require('fs');
require('isomorphic-fetch');

module.exports = class GrafanaClient {

	constructor(options) {
		this.apiKey = options.apiKey;
		this.hostname = options.hostname;
		this.userAgent = `ft-grafana-tools/${pkg.version}`;
	}

	fetch(endpoint, options) {
		const url = `http://${this.hostname}/api${endpoint}`;
		options = extend(true, {
			headers: {
				'Accept': 'application/json',
				'Authorization': `Bearer ${this.apiKey}`,
				'Content-Type': 'application/json',
				'User-Agent': this.userAgent
			}
		}, options);

		return fetch(url, options)
			.then(response => response.json().then(body => {
				if (!response.ok) {
					let errorMessage = `${endpoint} responded with a ${response.status} status`;
					if (body.message) {
						errorMessage += `:\n${body.message}`;
					}
					throw new Error(errorMessage);
				}
				return {
					response,
					body
				};
			}));
	}

	get(endpoint, options) {
		options = extend(true, {
			method: 'GET'
		}, options);
		return this.fetch(endpoint, options);
	}

	post(endpoint, data, options) {
		options = extend(true, {
			method: 'POST',
			body: JSON.stringify(data)
		}, options);
		return this.fetch(endpoint, options);
	}

	pull(name, filename) {
		return this.get(`/dashboards/db/${name}`)
			.then(response => {
				return {
					dashboard: response.body.dashboard
				};
			})
			.then(response => {
				return writeJsonFile(filename, response).then(() => {
					return response;
				});
			});
	}

	push(filename, overwrite) {
		return readJsonFile(filename)
			.then(data => {
				if (overwrite) {
					delete data.dashboard.version;
					data.overwrite = true;
				}
				return this.post('/dashboards/db', data);
			})
			.then(response => {
				return response.body;
			});
	}

};

function writeFile(filename, data) {
	return new Promise((resolve, reject) => {
		fs.writeFile(filename, data, error => {
			if (error) {
				return reject(error);
			}
			resolve();
		});
	});
}

function writeJsonFile(filename, data) {
	const json = JSON.stringify(data, null, 2);
	return writeFile(filename, json);
}

function readFile(filename) {
	return new Promise((resolve, reject) => {
		fs.readFile(filename, 'utf-8', (error, data) => {
			if (error) {
				return reject(error);
			}
			resolve(data);
		});
	});
}

function readJsonFile(filename) {
	return readFile(filename).then(data => {
		return JSON.parse(data);
	});
}
