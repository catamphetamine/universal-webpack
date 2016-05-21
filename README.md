# universal-webpack

[![NPM Version][npm-badge]][npm]
[![Build Status][travis-badge]][travis]

Helps setting up isomorphic (universal) Webpack build: the one that's working both on client and server.

## Installation

```
npm install universal-webpack --save
```

## Usage

Suppose you have a typical `webpack.config.js` file. Create two new files called `webpack.config.client.js` and `webpack.config.server.js` with the following contents:

### webpack.config.client.js

```js
import { client_configuration } from 'universal-webpack'
import settings from './universal-webpack-settings'
import configuration from './webpack.config'

export default client_configuration(configuration, settings)
```

### webpack.config.server.js

```js
import { server_configuration } from 'universal-webpack'
import settings from './universal-webpack-settings'
import configuration from './webpack.config'

export default server_configuration(configuration, settings)
```

### universal-webpack-settings.js

```js
export default
{
	server:
	{
		input: './source/server.js',
		output: './build/server/server.js'
	}
}
```

Use `webpack.config.client.js` instead of the old `webpack.config.js` for client side Webpack builds.

The `server_configuration()` function takes the client-side Webpack configuration and tunes it a bit for server-side usage ([`target: "node"`](https://webpack.github.io/docs/configuration.html#target)).

The server-side bundle (`settings.server.output` file) is generated from `settings.server.input` file by Webpack when it's run with the `webpack.config.server.js` configuration. An example of `settings.server.input` file may look like this (it must export a function):

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
		// Math current URL to the corresponding React page
		react-router.match(routes, req.originalUrl).then((error, result) =>
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
import { server } from 'universal-webpack'
import settings from '../universal-webpack-settings'
import configuration from '../webpack.config'

server(configuration, settings)
```

Calling `source/start-server.js` will basically call the function exported from `source/server.js` built with Webpack.

In the end you run all the above things like this (in parallel):

```bash
webpack-dev-server --hot --inline --config "./webpack.config.client.js --port XXXX --colors --display-error-details"
```

```bash
webpack --watch --config "./webpack.config.server.js" --colors --display-error-details
```

```bash
nodemon "./source/start-server" --watch "./build/server"
```

The above three commands are for development mode. For production mode the single command will be:

```bash
webpack --config "./webpack.config.client.js" --colors --display-error-details
webpack --config "./webpack.config.server.js" --colors --display-error-details
node "./source/start-server"
```

## Miscellaneous

This library will also expose the global `_server_` variable (set to `true`) inside the server-side bundle in case server/client detection is needed.

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

## Example project

You may refer to [this sample project](https://github.com/halt-hammerzeit/webpack-react-redux-isomorphic-render-example) as an all-in-one illustration of using this little library.

## Drawbacks

It will output double the amount of all assets included in the project: one complete bundle for client-side build and one complete bundle for server-side build. E.g. an asset `./images/dog.jpg` will be output both into `./build/client/9059f094ddb49c2b0fa6a254a6ebf2ad.jpg` and `./build/server/9059f094ddb49c2b0fa6a254a6ebf2ad.jpg`. If you find a way to avoid that, drop me a line.

Also, it will perform two Webpack builds instead of one, but this shouldn't be much of an issue since developers' machines are highly multicore these days.

## Source maps

I managed to get source maps working in my Node.js server-side code using [`source-map-support`](https://github.com/evanw/node-source-map-support) module.

### source/start-server.js

```js
// Enables proper source map support in Node.js
import 'source-map-support/register'

// The rest is the same as in the above example

import { server } from 'universal-webpack'
import settings from '../universal-webpack-settings'
import configuration from '../webpack.config'

server(configuration, settings)
```

Without `source-map-support` enabled it would give me `No element indexed by XXX` error (which [means](https://github.com/mozilla/source-map/issues/76) that by default Node.js thinks there are references to other source maps and tries to load them but there are no such source maps).

[`devtool`](https://webpack.github.io/docs/configuration.html#devtool) is set to `source-map` for server-side builds.

## License

[MIT](LICENSE)
[npm]: https://www.npmjs.org/package/universal-webpack
[npm-badge]: https://img.shields.io/npm/v/universal-webpack.svg?style=flat-square
[travis]: https://travis-ci.org/halt-hammerzeit/universal-webpack
[travis-badge]: https://img.shields.io/travis/halt-hammerzeit/universal-webpack/master.svg?style=flat-square
[coveralls]: https://coveralls.io/r/halt-hammerzeit/universal-webpack?branch=master
[coveralls-badge]: https://img.shields.io/coveralls/halt-hammerzeit/universal-webpack/master.svg?style=flat-square
