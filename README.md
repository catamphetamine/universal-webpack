# universal-webpack

[![NPM Version][npm-badge]][npm]
[![Test Coverage][coveralls-badge]][coveralls]

<!-- Travis builds error beause of `npm install crlf -g` is not available there -->
<!--[![Build Status][travis-badge]][travis]-->

**For beginners:** consider trying [Next.js](https://github.com/zeit/next.js) first: it's user-friendly and is supposed to be a good start for people not wanting to deal with configuring Webpack manually. On the other hand, if you're an experienced Webpack user then setting up `universal-webpack` shouldn't be too difficult.

This library generates client-side and server-side configuration for Webpack therefore enabling seamless client-side/server-side Webpack builds. Requires some initial set up and some prior knowledge of Webpack.

*Small Advertisement:* 📞 if you're looking for a React phone number component check out [`react-phone-number-input`](http://catamphetamine.github.io/react-phone-number-input/)

## Installation

```
npm install universal-webpack --save-dev
```

## Example project

You may refer to [this sample project](https://github.com/catamphetamine/webpack-react-redux-server-side-render-example) as a reference example of using this library (see `webpack` directory, `package.json` and `rendering-service/main.js`).

## Usage

Suppose you have a typical `webpack.config.js` file. Create two new files called `webpack.config.client.babel.js` and `webpack.config.server.babel.js` with the following contents:

### webpack.config.client.babel.js

```js
import { client } from 'universal-webpack/config'
import settings from './universal-webpack-settings'
import configuration from './webpack.config'

// Create client-side Webpack config.
export default client(configuration, settings)
```

### webpack.config.server.babel.js

```js
import { server } from 'universal-webpack/config'
import settings from './universal-webpack-settings'
import configuration from './webpack.config'

// Create server-side Webpack config.
export default server(configuration, settings)
```

Where `./universal-webpack-settings.json` is a configuration file for `universal-webpack` (see below).

Now, use `webpack.config.client.babel.js` instead of the old `webpack.config.js` for client side Webpack builds. Your setup also most likely differentiates between a "development" client side Webpack build and a "production" one, in which case `webpack.config.client.babel.js` is further split into two files — `webpack.config.client.dev.babel.js` and `webpack.config.client.prod.babel.js` — each of which inherits from `webpack.config.client.babel.js` and makes the necessary changes to it as defined by your particular setup.

And, `webpack.config.server.babel.js` file will be used for server-side Webpack builds. And, analogous to the client-side config, it also most likely is gonna be split into "development" and "production" configs, as defined by your particular setup.

Setting up the server side requires an additional step: creating the "entry" file for running the server. The reason is that client-side config is created from `webpack.config.js` which already has Webpack ["entry"](https://webpack.js.org/concepts/entry-points/) defined. Usually it's something like `./src/index.js` which is the "main" file for the client-side application. Server-side needs such a "main" file too and it must be configured as the server-side Webpack configuration "entry". This library defines a specific requirement for a server-side "entry" file: it must export a function which is gonna be called by the library when the server is ready to start. An example of a server-side "entry" file:

### source/server.js

```js
import path from 'path'
import http from 'http'
import express from 'express'
import httpProxy from 'http-proxy'

// React routes.
// (shared with the client side)
import routes from '../client/routes.js'

// Redux reducers.
// (shared with the client side)
import reducers from '../client/reducers.js'

// The server code must export a function
// (`parameters` may contain some miscellaneous library-specific stuff)
export default function(parameters)
{
	// Create HTTP server.
	const app = new express()
	const server = new http.Server(app)

	// Serve static files.
	app.use(express.static(path.join(__dirname, '..', 'build/assets')))

	// Proxy API calls to API server.
	const proxy = httpProxy.createProxyServer({ target: 'http://localhost:xxxx' })
	app.use('/api', (req, res) => proxy.web(req, res))

	// React application rendering.
	app.use((req, res) => {
		// Match current URL to the corresponding React page.
		routerMatchURL(routes, req.originalUrl).then((error, routingResult) => {
			if (error) {
				throw error
			}
			// Render React page.
			const page = createPageElement(routingResult, reducers)
			res.status(200)
			res.send('<!doctype html><html>...' + ReactDOM.renderToString(page) + '...</html>')
		})
		.catch((error) => {
			res.status(500)
			return res.send('Server error')
		})
	})

	// Start the HTTP server.
	server.listen()
}
```

The server-side "entry" file path must be configured in `./universal-webpack-settings.json` as `server.input`:

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

With the server-side "entry" configured, a "server-side" Webpack build will now produce a "server-side" bundle which can be run using Node.js (just call the function exported from the bundle).

For server-side rendering use case this library also provides a server-side bundle runner which passes a `parameters` argument to the main server-side function. The `parameters` argument provides a `chunks()` function which provides the URLs to the compiled javascript and CSS files (see the "Chunks" section below). An example of using the library's runner:

### source/start-server.js

```js
// The runner.
var startServer = require('universal-webpack/server')

// The server-side bundle path info.
var settings = require('../universal-webpack-settings')

// Only `configuration.context` and `configuration.output.path`
// parameters are used from the whole Webpack config.
var configuration = require('../webpack.config')

// Run the server.
startServer(configuration, settings)
```

Running `node source/start-server.js` will basically call the function exported from `source/server.js`.

Finally, to run all the things required for "development" mode (in parallel):

```bash
# Client-side build.
webpack-dev-server --hot --config ./webpack.config.client.dev.babel.js
```

```bash
# Server-side build.
webpack --watch --config ./webpack.config.server.dev.babel.js --colors --display-error-details
```

```bash
# Run the server.
nodemon ./source/start-server --watch ./build/server
```

For production mode the command sequence would be:

```bash
# Build the client.
webpack --config "./webpack.config.client.babel.js" --colors --display-error-details
# Build the server.
webpack --config "./webpack.config.server.babel.js" --colors --display-error-details
# Run the server.
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

## Using `extract-text-webpack-plugin` or `mini-css-extract-plugin`

The third argument – `options` object – may be passed to `client()` configuration function. If `options.development` is set to `false`, then it will apply `extract-text-webpack-plugin` to CSS styles automatically, i.e. it will extract all CSS styles into separate `*.css` files (one for each Webpack "chunk"): this is considered a slightly better approach for production deployment instead of just leaving all CSS in `*.js` chunk files (due to static file caching in a browser). Using `options.development=false` option is therefore just a convenience shortcut which one may use instead of adding `extract-text-webpack-plugin` to production client-side webpack configuration manually. If upgrading a project from Webpack <= 3 to Webpack >= 4 (or starting fresh with Webpack >= 4) then `extract-text-webpack-plugin` [should be replaced](https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/749) with `mini-css-extract-plugin` (because starting from Webpack 4 `extract-text-webpack-plugin` is considered deprecated). In this case also pass `options.useMiniCssExtractPlugin=true` option.

```js
import { clientConfiguration } from 'universal-webpack'
import settings from './universal-webpack-settings'
import baseConfiguration from './webpack.config'

const configuration = clientConfiguration(baseConfiguration, settings, {
  // Extract all CSS into separate `*.css` files (one for each chunk)
  // using `mini-css-extract-plugin`
  // instead of leaving that CSS embedded directly in `*.js` chunk files.
  development : false,
  useMiniCssExtractPlugin : true
})
```

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

Note: In a big React project server restart times can reach ~10 seconds.

## Flash of unstyled content

A "flash of unstyled content" is a well-known dev-mode Webpack phenomenon. One can observe it when refreshing the page in development mode: because Webpack's `style-loader` adds styles to the page dynamically there's a short period of time (a second maybe) when there are no CSS styles applied to the webpage (in production mode `mini-css-extract-plugin` or `extract-text-webpack-plugin` is used instead of `style-loader` so there's no "flash of unstyled content").

It's not really a bug, because it's only for development mode. Still, if you're a perfectionist then it can be annoying. The most basic workaround for this is to simply show a white "smoke screen" and then hide it after a pre-defined timeout.

```js
import { smokeScreen, hideSmokeScreenAfter } from 'universal-webpack'

<body>
  ${smokeScreen}
</body>

<script>
  ${hideSmokeScreenAfter(100)}
</script>
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

Note: If you never heard of `webpack-isomorphic-tools` then you shouldn't read this section.

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
