
Grafana Tools
=============

Automate your project Grafana dashboards.

[![Build status](https://img.shields.io/circleci/project/Financial-Times/grafana-tools.svg)][ci]
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)][license]

```sh
grafana pull <slug> <file>
grafana push <slug> <file>
```


Table Of Contents
-----------------

  * [Requirements](#requirements)
  * [Install](#install)
  * [Usage](#usage)
  * [Testing](#testing)
  * [Deployment](#deployment)
  * [License](#license)


Requirements
------------

Running Grafana tools requires [Node.js] 6.x and [npm].


Install
-------

```sh
npm install -g @financial-times/grafana-tools
```

Usage
-----

Pull a JSON representation of a dashboard and save it locally:

```
Usage: grafana pull <name> <file> [options]

Options:

  -h, --help             output usage information
  -V, --version          output the version number
  -a, --api-key <key>    the API key to use when accessing the Grafana API
  -H, --hostname <host>  the hostname Grafana runs on
```

Push a local JSON representation of a dashboard to the server:

```
Usage: grafana-push <name> <file> [options]

Options:

  -h, --help             output usage information
  -V, --version          output the version number
  -a, --api-key <key>    the API key to use when accessing the Grafana API
  -H, --hostname <host>  the hostname Grafana runs on
  -o, --overwrite        whether to overwrite any changes on the server
```


Testing
-------

To run tests on your machine you'll need to install [Node.js] and run `make install`. Then you can run the following commands:

```sh
make test              # run all the tests
make test-unit         # run the unit tests
```

You can run the unit tests with coverage reporting, which expects 90% coverage or more:

```sh
make test-unit-coverage verify-coverage
```

The code will also need to pass linting on CI, you can run the linter locally with:

```sh
make verify
```

We run the tests and linter on CI, you can view [results on CircleCI][ci]. `make test` and `make lint` must pass before we merge a pull request.


Deployment
----------

New versions of the module are published automatically by CI when a new tag is created matching the pattern `/v.*/`.


License
-------

The Financial Times has published this software under the [MIT license][license].



[ci]: https://circleci.com/gh/Financial-Times/grafana-tools
[license]: http://opensource.org/licenses/MIT
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[semver]: http://semver.org/
