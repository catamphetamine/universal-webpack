# universal-webpack

[![NPM Version][npm-badge]][npm]
[![Build Status][travis-badge]][travis]
[![Test Coverage][coveralls-badge]][coveralls]

**For starters:** consider skipping `universal-webpack` and trying [Next.js](https://github.com/zeit/next.js) first: it's super user-friendly, [very hyped](https://zeit.co/blog/next) and is supposed to be an ideal start for beginners. Master simpler things first, then move on to complex ones. Here be dragons.

This library generates client-side and server-side configuration for Webpack therefore enabling seamless client-side/server-side Webpack builds. Requires some initial set up and some prior knowledge of Webpack.

*Small Advertisement:* 📞 if you're looking for a React phone number component check out [`react-phone-number-input`](http://catamphetamine.github.io/react-phone-number-input/)

## Webpack 2

This library now **only supports Webpack 2**.

```sh
npm install webpack --save
npm install extract-text-webpack-plugin --save
```

I've been supporting Webpack 1 in this library for a long time but now the time has come to move to Webpack 2. See [Webpack 1 to 2 migration notes](https://webpack.js.org/guides/migrating/). For Webpack 1 use the `0.1.x` version of this library.

## Installation

```
npm install universal-webpack --save
npm install extract-text-webpack-plugin --save
```

## Example project

You may refer to [this sample project](https://github.com/catamphetamine/webpack-react-redux-isomorphic-render-example) as a reference example of using this library (see `webpack` directory, `package.json` and `client/rendering-service/main.js`).

Other sample projects (from other github users who asked me to add these links to this readme):

  * [one](https://github.com/NSLS/universal-webpack-boilerplate)
  * [two](https://github.com/krasevych/react-redux-styled-hot-universal)

## Usage

Suppose you have a typical `webpack.config.js` file. Create two new files called `webpack.config.client.babel.js` and `webpack.config.server.babel.js` with the following contents:

### webpack.config.client.babel.js

```js
import { client } from 'universal-webpack/config'
import settings from './universal-webpack-settings'
import configuration from './webpack.config'

export default client(configuration, settings)
```

### webpack.config.server.babel.js

```js
import { server } from 'universal-webpack/config'
import settings from './universal-webpack-settings'
import configuration from './webpack.config'

export default server(configuration, settings)
```

### universal-webpack-settings.json

```js
{
	"server":
	{
		"input": "./source/server.js",
		"output": "./build/server/server.js"
	}
}
```

Use `webpack.config.client.babel.js` instead of the old `webpack.config.js` for client side Webpack builds.

The `server()` configuration function takes the client-side Webpack configuration and tunes it a bit for server-side usage ([`target: "node"`](https://webpack.github.io/docs/configuration.html#target)).

The server-side bundle (`settings.server.output` file) is generated from `settings.server.input` file by Webpack when it's run with the `webpack.config.server.babel.js` configuration. An example of `settings.server.input` file may look like this (it must export a function):

### source/server.js

```js
// express.js
import path from 'path'
import http from 'http'
import express from 'express'
import http_proxy from 'http-proxy'

// react-router
import routes from '../client/routes.js'

// Redux
import store from '../client/store.js'

// The server code must export a function
// (`parameters` may contain some miscellaneous library-specific stuff)
export default function(parameters)
{
	// Create HTTP server
	const app = new express()
	const server = new http.Server(app)

	// Serve static files
	app.use(express.static(path.join(__dirname, '..', 'build/assets')))

	// Proxy API calls to API server
	const proxy = http_proxy.createProxyServer({ target: 'http://localhost:xxxx' })
	app.use('/api', (req, res) => proxy.web(req, res))

	// React application rendering
	app.use((req, res) =>
	{
		// Match current URL to the corresponding React page
		// (can use `react-router`, `redux-router`, `react-router-redux`, etc)
		react_router_match_url(routes, req.originalUrl).then((error, result) =>
		{
			if (error)
			{
				res.status(500)
				return res.send('Server error')
			}

			// Render React page

			const page = redux.provide(result, store)

			res.status(200)
			res.send('<!doctype html>' + '\n' + ReactDOM.renderToString(<Html>{page}</Html>))
		})
	})

	// Start the HTTP server
	server.listen()
}
```

The last thing to do is to create a startup file for the server side. This is the file you're gonna run with Node.js, not the file provided above.

### source/start-server.js

```js
var startServer = require('universal-webpack/server')
var settings = require('../universal-webpack-settings')
// `configuration.context` and `configuration.output.path` are used
var configuration = require('../webpack.config')

startServer(configuration, settings)
```

Calling `source/start-server.js` will basically call the function exported from `source/server.js` built with Webpack.

In the end you run all the above things like this (in parallel):

```bash
webpack-dev-server --hot --inline --config "./webpack.config.client.babel.js" --port XXXX --colors --display-error-details
```

```bash
webpack --watch --config "./webpack.config.server.babel.js" --colors --display-error-details
```

```bash
nodemon "./source/start-server" --watch "./build/server"
```

The above three commands are for development mode. For production mode the same command sequence would be:

```bash
webpack --config "./webpack.config.client.babel.js" --colors --display-error-details
webpack --config "./webpack.config.server.babel.js" --colors --display-error-details
node "./source/start-server"
```

## Chunks

This library will pass the `chunks()` function parameter (inside the `parameters` argument of the server-side function) which returns webpack-compiled chunks filename info:

### build/webpack-chunks.json

```js
{
	javascript:
	{
		main: `/assets/main.785f110e7775ec8322cf.js`
	},

	styles:
	{
		main: `/assets/main.785f110e7775ec8322cf.css`
	}
}
```

These filenames are required for `<script src=.../>` and `<link rel="style" href=.../>` tags in case of isomorphic (universal) rendering on the server-side.

## Gotchas

* It emits no assets on the server side so make sure you include all assets on the client side (e.g. "favicon").
* `resolve.root` won't work out-of-the-box while `resolve.alias`es do. For those using `resolve.root` I recommend switching to `resolve.alias`. By default no "modules" are bundled in a server-side bundle except for `resolve.alias`es and `excludeFromExternals` matches (see below).

## Using `extract-text-webpack-plugin`

The third argument – `options` object – may be passed to `client()` configuration function. If `options.development === false`, then it will apply `extract-text-webpack-plugin` to CSS styles automatically, i.e. it will extract all CSS styles into one big bundle file. This is considered the "best practice" for production deployment.

## Advanced configuration

```js
{
	// By default, all `require()`d packages
	// (e.g. everything from `node_modules`, `resolve.modules`),
	// except for `resolve.alias`ed ones,
	// are marked as `external` for server-side Webpack build
	// which means they won't be processed and bundled by Webpack,
	// instead being processed and `require()`d at runtime by Node.js.
	//
	// With this setting one can explicitly define which modules
	// aren't gonna be marked as `external` dependencies.
	// (and therefore are gonna be compiled and bundled by Webpack)
	//
	// Can be used, for example, for ES6-only `node_modules`.
	// ( a more intelligent solution would be accepted
	//   https://github.com/catamphetamine/universal-webpack/issues/10 )
	//
	excludeFromExternals:
	[
		'lodash-es',
		/^some-other-es6-only-module(\/.*)?$/
	],

	// As stated above, all files inside `node_modules`, when `require()`d,
	// would be resolved as "externals" which means Webpack wouldn't use
	// loaders to process them, and therefore `require()`ing them
	// would result in an error when running the server-side bundle.
	//
	// E.g. for CSS files Node.js would just throw `SyntaxError: Unexpected token .`
	// because these CSS files need to be compiled by Webpack's `css-loader` first.
	//
	// Hence the "exclude from externals" file extensions list
	// which by default is initialized with some common asset types:
	//
	loadExternalModuleFileExtensions:
	[
		'css',
		'png',
		'jpg',
		'svg',
		'xml'
	],

	// Enable `silent` flag to prevent client side webpack build
	// from outputting chunk stats to the console.
	silent: true,

	// By default, chunk_info_filename is `webpack-chunks.json`
	chunk_info_filename: 'submodule-webpack-chunks.json'
}
```

## Source maps

I managed to get source maps working in my Node.js server-side code using [`source-map-support`](https://github.com/evanw/node-source-map-support) module.

### source/start-server.js

```js
// Enables proper source map support in Node.js
require('source-map-support/register')

// The rest is the same as in the above example

var startServer = require('universal-webpack/server')
var settings = require('../universal-webpack-settings')
var configuration = require('../webpack.config')

startServer(configuration, settings)
```

Without `source-map-support` enabled it would give me `No element indexed by XXX` error (which [means](https://github.com/mozilla/source-map/issues/76) that by default Node.js thinks there are references to other source maps and tries to load them but there are no such source maps).

[`devtool`](https://webpack.github.io/docs/configuration.html#devtool) is set to `source-map` for server-side builds.

## Nodemon

I recommend using [nodemon](https://github.com/remy/nodemon) for running server-side Webpack bundle. Nodemon has a `--watch <directory>` command line parameter which restarts Node.js process each time the `<directory>` is updated (e.g. each time any file in that directory is modified).

In other words, Nodemon will relaunch the server every time the code is rebuilt with Webpack.

There's one little gotcha though: for the `--watch` feature to work the watched folder needs to exist by the time Nodemon is launched. That means that the server must be started only after the `settings.server.output` path folder has been created.

To accomplish that this library provides a command line tool: `universal-webpack`. No need to install in globally: it is supposed to work locally through npm scripts. Usage example:

### package.json

```js
...
  "scripts": {
    "start": "npm-run-all prepare-server-build start-development-workflow",
    "start-development-workflow": "npm-run-all --parallel development-webpack-build-for-client development-webpack-build-for-server development-start-server",
    "prepare-server-build": "universal-webpack --settings ./universal-webpack-settings.json prepare",
    ...
```

The `prepare` command creates `settings.server.output` path folder, or clears it if it already exists.

In a moderately sized React project server restart times can reach ~10 seconds. Therefore the right way to go is to extract React rendering server-side code into a separate Node.js process (service), and then in the main Node.js web server just proxy all unmatched URLs to this React rendering service, as explained in the following section. This way only React rendering service will be restarted, and the main Node.js web server will be left untouched.

## Separate React rendering service from the main code

If the sole purpose of using `universal-webpack` in your project is to enable server-side rendering of web pages, then the best practice is to extract the web page rendering code from the main Node.js application into a separate Node.js application (`reactRenderingService` in the example below), and then in the main Node.js application just proxy all unmatched URLs to this React rendering service.

```js
import express from 'express'
import httpProxy from 'http-proxy'

const app = express()

const reactRenderingService = `http://localhost:3000`
const proxy = httpProxy.createProxyServer({})

// The usual web application middleware
// (serving statics, REST API, etc)
app.use(...)
app.use(...)
app.use(...)

// Proxy all unmatched HTTP requests to webpage rendering service
app.use(function(request, response)
{
  proxy.web(request, response, { target: reactRenderingService }, (error) =>
  {
  	console.error(error)
  	response.status(500).send('Proxying failed for page rendering service')
  })
})
```

This way only the rendering service will have to be restarted (by nodemon) and rebuilt (by Webpack) on code changes.

## Flash of unstyled content

(this is an "advanced" section which can be safely skipped)

A "flash of unstyled content" is a well-known thing. One can observe it when refreshing the page in development mode: because Webpack's `style-loader` adds styles to the page dynamically there's a short period (a second maybe) when there are no CSS styles applied to the webpage (in production mode `extract-text-webpack-plugin` is used instead of `style-loader` so there's no "flash of unstyled content").

It's not really a bug, many projects live with it and it doesn't really affect the development process that much, so one can safely skip reading this section. It's just if you're a perfectionist then it can get a little itchy.

I came up with a solution which seems to be working good enough. To enable the anti-unstyled-flash feature one needs to pass the third parameter to the client-side webpack configuration creation function - an `options` object with:

 * `development` key set to `true` indicating that it's a development build configuration
 * `cssBundle` key set to `true`

If both `development` and `cssBundle` options are set to `true`, then `universal-webpack` will enhance the client side Webpack configuration to also output all styles into a single CSS bundle (while retaining `style-loader`) which is later added to the webpage's `<head/>` as a `<link rel="stylesheet"/>` tag on the server side, therefore making that "flash of unstyled content" disappear.

There's a gotcha though. Because the whole CSS bundle gets inserted as a `<link rel="stylesheet"/>` tag in the `<head/>` it also means that the styles defined in that CSS bundle are static, not dynamic, and they aren't gonna "hot reload" themselves or something. So, my proposed solution is to have that `<link rel="stylesheet"/>` tag sit in the `<head/>` for a while (say, a couple of seconds) and then remove it from there. The styling of the webpage isn't gonna disappear at that moment because by that time the dynamic styles of `style-loader` have already kicked in. See [an example of how this can be done](https://github.com/catamphetamine/webpack-react-redux-isomorphic-render-example/blob/daf84daaa00c0d37ccd9502f36c7af26d640bee2/code/page-server/web%20server.js#L51-L63).

```js
import { client } from 'universal-webpack/config'
import settings from './universal-webpack-settings'
import configuration from './webpack.config'

export default client(configuration, settings, { development: true, cssBundle: true })
```

## resolve.moduleDirectories

If you were using `resolve.moduleDirectories` for global paths instead of relative paths in your code then consider using `resolve.alias` instead

```js
resolve:
{
  alias:
  {
    components: path.resolve(__dirname, '../src/components'),
    ...
  }
}
```

## `universal-webpack` vs `webpack-isomorphic-tools`

`webpack-isomorphic-tools` runs on the server-side and hooks into Node.js `require()` function with the help of `require-hacker` and does what needs to be done.

`universal-webpack` doesn't hook into `require()` function - it's just a helper for transforming client-side Webpack configuration to a server-side Webpack configuration. It doesn't run on the server-side or something. It's just a Webpack configuration generator - turned out that Webpack has a `target: "node"` parameter which makes it output code that runs on Node.js without any issues.

I wrote `webpack-isomorphic-tools` before `universal-webpack`, so `universal-webpack` is the recommended tool. However many people still use `webpack-isomorphic-tools` (including me) and find it somewhat less complicated for beginners.

## License

[MIT](LICENSE)

[npm]: https://www.npmjs.org/package/universal-webpack
[npm-badge]: https://img.shields.io/npm/v/universal-webpack.svg?style=flat-square

[travis]: https://travis-ci.org/catamphetamine/universal-webpack
[travis-badge]: https://img.shields.io/travis/catamphetamine/universal-webpack/master.svg?style=flat-square

[coveralls]: https://coveralls.io/r/catamphetamine/universal-webpack?branch=master
[coveralls-badge]: https://img.shields.io/coveralls/catamphetamine/universal-webpack/master.svg?style=flat-square
