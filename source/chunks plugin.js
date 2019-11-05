import path from 'path'
import fs   from 'fs-extra'

import output_webpack_stats from './output webpack stats'
import { chunk_info_file_path } from './chunks'

export default function ChunkFileNamesPlugin(configuration, options)
{
	this.configuration = configuration
	this.options = options
}

ChunkFileNamesPlugin.prototype.apply = function(compiler)
{
	const onDone = (stats) => writeChunkFileNames(stats, this.options, this.configuration)

	// Fixes "DeprecationWarning: Tapable.plugin is deprecated. Use new API on `.hooks` instead".
	// (backwards compatible)
	if (compiler.hooks) {
		compiler.hooks.done.tap('UniversalWebpackChunkFileNamesPlugin', onDone)
	} else {
		compiler.plugin('done', onDone)
	}
}

// Generates chunk filename info
// (`assets_base_url` will be prepended to chunk file names)
function filename_info(json, assets_base_url, options)
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
			.filter(name => path.extname(name).split('?')[0] === `.${extension}`)
			// adjust the real path (can be http, filesystem)
			.map(name => assets_base_url + name)
	}

	// leave only initial ( non dynamic ) chunks
	function filterNonInitialChunks(chunkName) {
		const chunkObj = json.chunks.find(chunkObj => chunkObj.names && chunkObj.names[0] === chunkName);
		return chunkObj && chunkObj.initial;
	}

	function hasInitialChunks() {
		return !!(json.chunks && json.chunks.length && json.chunks.find(chunkObj => chunkObj.initial));
	}

	let chunkNames = Object.keys(assets_by_chunk);
	if (hasInitialChunks() && options.skipDynamicChunks) {
		chunkNames = chunkNames.filter(filterNonInitialChunks);
	}

	// for each chunk name ("main", "common", ...)
	chunkNames.forEach(function(name)
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

function writeChunkFileNames(stats, options, webpack_configuration)
{
	const json = stats.toJson
	({
		context: webpack_configuration.context || process.cwd(),

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
	const assets_base_url = (process.env.NODE_ENV !== 'production' && webpack_configuration.devServer && webpack_configuration.devServer.publicPath) ? webpack_configuration.devServer.publicPath : json.publicPath

	// chunk filename info file path
	const output_file_path = chunk_info_file_path(webpack_configuration, options.chunk_info_filename)

	// Write chunk filename info to disk
	fs.outputFileSync(output_file_path, JSON.stringify(filename_info(json, assets_base_url, options)))
}
