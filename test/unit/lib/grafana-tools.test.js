'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const pkg = require('../../../package.json');
const sinon = require('sinon');
require('sinon-as-promised');

describe('lib/grafana-tools', () => {
	let fs;
	let GrafanaClient;

	beforeEach(() => {
		fs = require('../mock/fs');
		mockery.registerMock('fs', fs);
		global.fetch = require('../mock/fetch');
		GrafanaClient = require('../../../lib/grafana-tools');
	});

	it('exports a function', () => {
		assert.isFunction(GrafanaClient);
	});

	describe('new GrafanaClient(options)', () => {
		let instance;
		let resolvedValue;
		let caughtError;

		beforeEach(() => {
			instance = new GrafanaClient({
				apiKey: 'xxxxxx',
				hostname: 'testhost'
			});
		});

		it('returns an object', () => {
			assert.isObject(instance);
		});

		describe('returned object', () => {

			it('has an `apiKey` property set to the passed in key', () => {
				assert.strictEqual(instance.apiKey, 'xxxxxx');
			});

			it('has a `host` property set to the passed in host', () => {
				assert.strictEqual(instance.hostname, 'testhost');
			});

			it('has a `userAgent` property', () => {
				assert.strictEqual(instance.userAgent, `ft-grafana-tools/${pkg.version}`);
			});

			it('has a `fetch` method', () => {
				assert.isFunction(instance.fetch);
			});

			describe('.fetch(endpoint, options)', () => {
				let mockBody = {foo: 'bar'};
				let mockResponse;

				beforeEach(() => {
					mockResponse = {
						ok: true,
						json: sinon.stub().resolves(mockBody)
					};
					fetch.resolves(mockResponse);

					return instance.fetch('/foo/bar', {
						method: 'POST'
					}).then(value => resolvedValue = value);
				});

				it('fetches the expected URL with the expected options', () => {
					assert.calledOnce(fetch);
					assert.calledWith(fetch, 'http://testhost/api/foo/bar');
					assert.deepEqual(fetch.firstCall.args[1], {
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Authorization': `Bearer ${instance.apiKey}`,
							'Content-Type': 'application/json',
							'User-Agent': instance.userAgent
						}
					});
				});

				it('resolves with the fetch response and JSON body', () => {
					assert.deepEqual(resolvedValue, {
						response: mockResponse,
						body: mockBody
					});
				});

				describe('when the response is not successful', () => {

					beforeEach(() => {

						mockResponse = {
							ok: false,
							status: 456,
							json: sinon.stub().resolves(mockBody)
						};
						fetch.resolves(mockResponse);

						return instance.fetch('/foo/bar', {
							method: 'POST'
						}).catch(error => caughtError = error);
					});

					it('rejects with the expected error', () => {
						assert.instanceOf(caughtError, Error);
						assert.strictEqual(caughtError.message, '/foo/bar responded with a 456 status');
					});

				});

				describe('when the response is not successful and a message is given', () => {

					beforeEach(() => {

						mockBody = {
							message: 'mock error'
						};
						mockResponse = {
							ok: false,
							status: 456,
							json: sinon.stub().resolves(mockBody)
						};
						fetch.resolves(mockResponse);

						return instance.fetch('/foo/bar', {
							method: 'POST'
						}).catch(error => caughtError = error);
					});

					it('rejects with the expected error', () => {
						assert.instanceOf(caughtError, Error);
						assert.strictEqual(caughtError.message, '/foo/bar responded with a 456 status:\nmock error');
					});

				});

			});

			it('has a `get` method', () => {
				assert.isFunction(instance.get);
			});

			describe('.get(endpoint, options)', () => {
				const mockResponse = {};
				const options = {foo: 'bar'};

				beforeEach(() => {
					instance.fetch = sinon.stub().resolves(mockResponse);
					return instance.get('/foo/bar', options).then(value => resolvedValue = value);
				});

				it('fetches the expected endpoint with the expected options', () => {
					assert.calledOnce(instance.fetch);
					assert.calledWith(instance.fetch, '/foo/bar');
					assert.deepEqual(instance.fetch.firstCall.args[1], {
						method: 'GET',
						foo: 'bar'
					});
				});

				it('resolves with the result of the fetch', () => {
					assert.deepEqual(resolvedValue, mockResponse);
				});

			});

			it('has a `post` method', () => {
				assert.isFunction(instance.post);
			});

			describe('.post(endpoint, data, options)', () => {
				const mockResponse = {};
				const data = {foo: 'bar'};
				const options = {bar: 'baz'};

				beforeEach(() => {
					instance.fetch = sinon.stub().resolves(mockResponse);
					return instance.post('/foo/bar', data, options).then(value => resolvedValue = value);
				});

				it('fetches the expected endpoint with the expected options', () => {
					assert.calledOnce(instance.fetch);
					assert.calledWith(instance.fetch, '/foo/bar');
					assert.deepEqual(instance.fetch.firstCall.args[1], {
						method: 'POST',
						body: '{"foo":"bar"}',
						bar: 'baz'
					});
				});

				it('resolves with the result of the fetch', () => {
					assert.deepEqual(resolvedValue, mockResponse);
				});

			});

			it('has an `pull` method', () => {
				assert.isFunction(instance.pull);
			});

			describe('.pull(slug, filename)', () => {
				const mockResponse = {
					body: {
						dashboard: {
							id: 123
						}
					}
				};

				beforeEach(() => {
					instance.get = sinon.stub().resolves(mockResponse);
					fs.writeFile.yields();
					return instance.pull('mock-name', 'mock-file').then(value => resolvedValue = value);
				});

				it('gets the expected endpoint with the expected options', () => {
					assert.calledOnce(instance.get);
					assert.calledWithExactly(instance.get, '/dashboards/db/mock-name');
				});

				it('writes the response to the given file as JSON', () => {
					assert.calledOnce(fs.writeFile);
					assert.calledWith(fs.writeFile, 'mock-file', JSON.stringify(mockResponse.body, null, 2));
				});

				it('resolves with the dashboard JSON', () => {
					assert.deepEqual(resolvedValue, mockResponse.body);
				});

				describe('when the file write fails', () => {
					const fileError = new Error('file error');
					let rejectedError;

					beforeEach(() => {
						instance.get = sinon.stub().resolves(mockResponse);
						fs.writeFile.yields(fileError);
						return instance.pull('mock-name', 'mock-file').catch(error => rejectedError = error);
					});

					it('rejects with the file write error', () => {
						assert.strictEqual(rejectedError, fileError);
					});

				});

			});

		});

		it('has an `push` method', () => {
			assert.isFunction(instance.push);
		});

		describe('.push(filename)', () => {
			const mockResponse = {
				body: {
					slug: 'foo'
				}
			};

			beforeEach(() => {
				instance.post = sinon.stub().resolves(mockResponse);
				fs.readFile.yields(null, JSON.stringify({
					dashboard: {
						id: 123,
						version: 1
					}
				}));
				return instance.push('mock-file').then(value => resolvedValue = value);
			});

			it('reads the given file', () => {
				assert.calledOnce(fs.readFile);
				assert.calledWith(fs.readFile, 'mock-file');
			});

			it('posts to the expected endpoint with the expected options', () => {
				assert.calledOnce(instance.post);
				assert.calledWith(instance.post, '/dashboards/db', {
					dashboard: {
						id: 123,
						version: 1
					}
				});
			});

			it('resolves with the response body', () => {
				assert.deepEqual(resolvedValue, mockResponse.body);
			});

			describe('when the file read fails', () => {
				const fileError = new Error('file error');
				let rejectedError;

				beforeEach(() => {
					instance.get = sinon.stub().resolves(mockResponse);
					fs.readFile.yields(fileError);
					return instance.push('mock-name').catch(error => rejectedError = error);
				});

				it('rejects with the file read error', () => {
					assert.strictEqual(rejectedError, fileError);
				});

			});

		});

		describe('.push(filename, overwrite)', () => {
			const mockResponse = {
				body: {
					slug: 'foo'
				}
			};

			beforeEach(() => {
				instance.post = sinon.stub().resolves(mockResponse);
				fs.readFile.yields(null, JSON.stringify({
					dashboard: {
						id: 123,
						version: 1
					}
				}));
				return instance.push('mock-file', true).then(value => resolvedValue = value);
			});

			it('posts to the expected endpoint with id removed and overwrite set to `true`', () => {
				assert.calledOnce(instance.post);
				assert.calledWith(instance.post, '/dashboards/db', {
					overwrite: true,
					dashboard: {
						id: 123
					}
				});
			});

		});

	});

});
