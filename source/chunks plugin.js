import path from 'path'
import fs   from 'fs-extra'

import output_webpack_stats from './output webpack stats'
import { chunk_info_file_path } from './chunks'

export default function Chunk_file_names_plugin(configuration, options)
{
	this.configuration = configuration
	this.options = options
}

Chunk_file_names_plugin.prototype.apply = function(compiler)
{
	// // Webpack configuration
	// // (has wrong `output.path` at this point 
	// //  so `output.path` has to be passed when constructing an instance)
	// const webpack_configuration = compiler.options
	const webpack_configuration = this.configuration

	const options = this.options

	// chunk filename info file path
	const output_file_path = chunk_info_file_path(webpack_configuration)

	// when all is done
	// https://github.com/webpack/docs/wiki/plugins
	compiler.plugin('done', function(stats)
	{
		const json = stats.toJson
		({
			context: webpack_configuration.context,

			// Add built modules information to chunk information.
			// What for is it here? I don't know. It's a copy & paste from the Webpack author's code.
			chunkModules: true,

			// // The following modules will be excluded from Webpack stats Json file.
			// // What for is it here? I don't know. It's a copy & paste from the Webpack author's code.
			// exclude:
			// [
			// 	/node_modules[\\\/]react(-router)?[\\\/]/,
			// 	/node_modules[\\\/]items-store[\\\/]/
			// ]
		})

		// output some info to the console if in development mode
		if (!options.silent)
		{
			// outputs stats info to the console
			// (only needed in development mode)
			output_webpack_stats(stats, json)
		}

		// "publicPath" (will be prepended to chunk file names)
		const assets_base_url = (webpack_configuration.devServer && webpack_configuration.devServer.publicPath) ? webpack_configuration.devServer.publicPath : json.publicPath

		// Generate chunk filename info
		const chunk_filename_info = filename_info(json, assets_base_url)

		// Write chunk filename info to disk
		fs.outputFileSync(output_file_path, JSON.stringify(chunk_filename_info))
	})
}

// Generates chunk filename info
// (`assets_base_url` will be prepended to chunk file names)
function filename_info(json, assets_base_url)
{
	const assets_by_chunk = json.assetsByChunkName

	const assets_chunks =
	{
		javascript: {},
		styles: {}
	}

	// gets asset paths by name and extension of their chunk
	function get_assets(name, extension)
	{
		let chunk = json.assetsByChunkName[name]
	
		// a chunk could be a string or an array, so make sure it is an array
		if (!(Array.isArray(chunk)))
		{
			chunk = [chunk]
		}
	
		return chunk
			// filter by extension
			.filter(name => path.extname(name) === `.${extension}`)
			// adjust the real path (can be http, filesystem)
			.map(name => assets_base_url + name)
	}

	// for each chunk name ("main", "common", ...)
	Object.keys(assets_by_chunk).forEach(function(name)
	{
		// log.debug(`getting javascript and styles for chunk "${name}"`)

		// get javascript chunk real file path

		const javascript = get_assets(name, 'js')[0]
		// the second asset is usually a source map

		if (javascript)
		{
			// log.debug(` (got javascript)`)
			assets_chunks.javascript[name] = javascript
		}

		// get style chunk real file path

		const style = get_assets(name, 'css')[0]
		// the second asset is usually a source map

		if (style)
		{
			// log.debug(` (got style)`)
			assets_chunks.styles[name] = style
		}
	})

	return assets_chunks
}