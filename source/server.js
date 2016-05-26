import path from 'path'
import fs from 'fs'

import wait_for_file from './wait for file'
import { chunk_info_file_path } from './chunks'

export default function server(webpack_configuration, settings)
{
	if (!webpack_configuration.context)
	{
		throw new Error(`You must set "context" parameter in your Webpack configuration`)
	}

	// Path to `build/server.js`
	// (built by Webpack)
	const server_bundle_path = path.resolve(webpack_configuration.context, settings.server.output)

	// waits for the first Webpack server-side build to finish and produce `webpage_rendering_server.js`
	wait_for_file(server_bundle_path).then(function()
	{
		const chunk_info_json_file_path = chunk_info_file_path(webpack_configuration)

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

		throw new Error(`[universal-webpack] Your server source file must export a function`)
	})
}