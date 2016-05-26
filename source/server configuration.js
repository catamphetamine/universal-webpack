import path from 'path'
// import clean_plugin from 'clean-webpack-plugin'
import webpack from 'webpack'

import { is_object, clone, starts_with, ends_with } from './helpers'

export default function configuration(webpack_configuration, settings)
{
	if (!webpack_configuration.context)
	{
		throw new Error(`You must set "context" parameter in your Webpack configuration`)
	}

	const configuration = clone(webpack_configuration)

	// (without extension)
	const output_file_name = path.basename(settings.server.output, path.extname(settings.server.output))

	configuration.entry =
	{
		[output_file_name]: settings.server.input
	}

	// https://webpack.github.io/docs/configuration.html#target
	configuration.target = 'node'

	// https://webpack.github.io/docs/configuration.html#output-librarytarget
	configuration.output.libraryTarget = 'commonjs2'

	// No need for browser cache management, so disable hashes in filenames
	configuration.output.filename = '[name].js'
	configuration.output.chunkFilename = '[name].js'

	// Include comments with information about the modules.
	// require(/* ./test */23).
	// What for is it here? I don't know. It's a copy & paste from the Webpack author's code.
	configuration.output.pathinfo = true

	// Output server bundle into it's own directory
	configuration.output.path = path.resolve(configuration.context, path.dirname(settings.server.output))

	// Output "*.map" file for human-readable stack traces
	configuration.devtool = 'source-map'

	// https://webpack.github.io/docs/configuration.html#externals
	//
	// `externals` allows you to specify dependencies for your library 
	// that are not resolved by webpack, but become dependencies of the output. 
	// This means they are imported from the environment during runtime.
	//
	// So that Webpack doesn't bundle "node_modules" into server.js.

	configuration.externals = configuration.externals || []

	configuration.externals.push(function(context, request, callback)
	{
		// If any aliases are specified, then force-resolve them
		if (configuration.resolve && configuration.resolve.alias)
		{
			for (let key of Object.keys(configuration.resolve.alias))
			{
				if (request === key || starts_with(request, key + '/'))
				{
					return callback()
				}
			}
		}

		// Mark all node_modules as external
		if (/^[a-z\/\-0-9]+$/i.test(request))
		{
			return callback(null, request)
		}

		// Otherwise, it's not an alias and not a node_module,
		// so resolve it as usual
		return callback()
	})

	configuration.externals.push()

	// Drop style-loader since it's no web browser
	for (let loader of configuration.module.loaders)
	{
		if (!loader.loaders)
		{
			if (!loader.loader)
			{
				throw new Error('No webpack loader specified for this `module.loaders` element')
			}

			loader.loaders = loader.loader.split('!')
			delete loader.loader
		}

		const style_loader = loader.loaders.filter(is_style_loader)[0]
		if (style_loader)
		{
			loader.loaders.splice(loader.loaders.indexOf(style_loader), 1)
		}
	}

	// Add a couple of utility plugins

	configuration.plugins = configuration.plugins || []

	configuration.plugins = configuration.plugins.concat
	(
		// Resorted from using it here because
		// if the `build/server` folder is not there
		// when Nodemon starts then it simply won't detect 
		// updates of the server-side bundle
		// and therefore won't restart on code changes.
		//
		// `build/server` folder needs to be present
		// by the time Nodemon starts,
		// and that's accomplished with a separate npm script.

		// // Cleans the output folder
		// new clean_plugin([path.dirname(settings.server.output)],
		// {
		// 	root: configuration.context
		// }),

		// Put the resulting Webpack compiled code into a sigle javascript file
		new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })
	)

	// Done
	return configuration
}

function is_style_loader(loader)
{
	let name

	if (is_object(loader))
	{
		name = loader.loader
	}
	else
	{
		name = loader

		if (name.indexOf('?') >= 0)
		{
			name = name.substring(0, name.indexOf('?'))
		}
	}

	if (ends_with(name, '-loader'))
	{
		name = name.substring(0, name.lastIndexOf('-loader'))
	}

	return name === 'style'
}