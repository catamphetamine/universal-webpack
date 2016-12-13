import path from 'path'
import fs from 'fs'
import util from 'util'

import wait_for_file from './wait for file'
import { chunk_info_file_path } from './chunks'

export default function server(webpack_configuration, settings)
{
	// if (!webpack_configuration.context)
	// {
	// 	throw new Error(`You must set "context" parameter in your Webpack configuration`)
	// }

	// Path to `build/server.js`
	// (built by Webpack)
	const server_bundle_path = path.resolve(webpack_configuration.context || process.cwd(), settings.server.output)

	// waits for the first Webpack server-side build to finish and produce `webpage_rendering_server.js`
	return wait_for_file(server_bundle_path).then(function()
	{
		const chunk_info_json_file_path = chunk_info_file_path(webpack_configuration, settings.chunk_info_filename)

		// Will be passed to the server code
		const additional =
		{
			chunks: () =>
			{
				// clear Webpack require() cache for hot reload in development mode
				if (process.env.NODE_ENV === 'development')
				{
					delete require.cache[chunk_info_json_file_path]
				}

				return require(chunk_info_json_file_path)
			}
		}

		// Start webpage rendering server
		// (this module will be compiled by Webpack server-side build from './source/server.js')

		const starter = require(server_bundle_path)

		// Fixing Babel `module.exports.default` issues

		if (typeof starter === 'function')
		{
			return starter(additional)
		}

		if (typeof starter.default === 'function')
		{
			return starter.default(additional)
		}

		let stringified_starter = String(starter)
		if (stringified_starter === '[object Object]')
		{
			stringified_starter = JSON.stringify(starter, null, 2)
		}

		throw new Error(`[universal-webpack] Your server source file must export a function. ` +
			`Got ${util.inspect(starter)}`)
	})
	.catch(function(error)
	{
		// bright red color
		console.log("\x1b[1m\x1b[31m")

		// Output the error stack trace
		console.error(`\n${error.stack || error}`)

		// reset color and brightness
		console.log('\x1b[39m\x1b[22m')

		// exit with non-zero exit code (indicating that an error happened)
		process.exit(1)
	})
}
