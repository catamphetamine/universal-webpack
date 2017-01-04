import path from 'path'
import webpack from 'webpack'
import validate_npm_package_path from 'validate-npm-package-name'

import { clone, starts_with } from './helpers'
import { find_style_rules, is_style_loader, parse_loader, stringify_loader, normalize_rule_loaders } from './loaders'

// Tunes the client-side Webpack configuration for server-side build
export default function server_configuration(webpack_configuration, settings)
{
	// if (!webpack_configuration.context)
	// {
	// 	throw new Error(`You must set "context" parameter in your Webpack configuration`)
	// }

	const configuration = clone(webpack_configuration)

	// By default, Webpack sets `context` to `process.cwd()`
	configuration.context = configuration.context || process.cwd()

	// (without extension)
	const output_file_name = path.basename(settings.server.output, path.extname(settings.server.output))

	configuration.entry =
	{
		[output_file_name]: settings.server.input
	}

	// https://webpack.github.io/docs/configuration.html#target
	configuration.target = 'node'

	// Tell Webpack to leave `__dirname` and `__filename` unchanged
	// https://github.com/webpack/webpack/issues/1599#issuecomment-186841345
	configuration.node =
	{
		__dirname  : false,
		__filename : false
	}

	// https://webpack.github.io/docs/configuration.html#output-librarytarget
	configuration.output.libraryTarget = 'commonjs2'

	// No need for browser cache management, so disable hashes in filenames
	configuration.output.filename = '[name].js'
	configuration.output.chunkFilename = '[name].js'

	// Include comments with information about the modules.
	// require(/* ./test */23).
	// What for is it here? I don't know. It's a copy & paste from the Webpack author's code.
	configuration.output.pathinfo = true

	// Output server bundle into its own directory
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

	if (!Array.isArray(configuration.externals))
	{
		configuration.externals = [configuration.externals]
	}

	configuration.externals.push(function(context, request, callback)
	{
		if (is_external(request, configuration, settings))
		{
			// Resolve dependency as external
			return callback(null, request)
		}

		// Resolve dependency as non-external
		return callback()
	})

	// Replace `style-loader` with `fake-style-loader`
	// since it's no web browser
	for (let rule of find_style_rules(configuration))
	{
		normalize_rule_loaders(rule)

		const style_loader = rule.use.filter(is_style_loader)[0]

		// Copy `style-loader` configuration
		const fake_style_loader = parse_loader(style_loader)

		// Since npm v3 enforces flat `node_modules` structure,
		// `fake-style-loader` is gonna be right inside `node_modules`
		fake_style_loader.loader = 'fake-style-loader'
		// fake_style_loader.loader = path.resolve(__dirname, '../node_modules/fake-style-loader')

		// Replace the loader
		rule.use[rule.use.indexOf(style_loader)] = fake_style_loader
	}

	configuration.plugins = configuration.plugins || []

	// Remove HotModuleReplacementPlugin and CommonsChunkPlugin
	configuration.plugins = configuration.plugins.filter(plugin =>
	{
		return plugin.constructor !== webpack.HotModuleReplacementPlugin
			&& plugin.constructor !== webpack.optimize.CommonsChunkPlugin
	})

	// Add a couple of utility plugins
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
		// (doesn't disable CommonsChunkPlugin)
		new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })
	)

	// Done
	return configuration
}

// Checks if a require()d dependency is external
export function is_external(request, webpack_configuration, settings)
{
	// If someone finds a way to mark all assets (jpg, png, css, scss)
	// as not external then create a Pull Request on github.
	// Until then, all assets from `node_modules` have to be specified
	// inside `exclude_from_externals` configuration parameter.

	// Mark all files inside packages (e.g. `node_modules`) as external.

	let package_name = request
	if (package_name.indexOf('/') >= 0)
	{
		package_name = package_name.substring(0, package_name.indexOf('/'))
	}

	// Skip webpack loader specific require()d paths
	// https://webpack.github.io/docs/loaders.html
	if (starts_with(package_name, '!') || starts_with(package_name, '-!'))
	{
		// The dependency is not external
		return false
	}

	// If it's not a module require call,
	// then resolve it as non-external.
	//
	// https://github.com/npm/validate-npm-package-name
	//
	if (!validate_npm_package_path(package_name).validForNewPackages)
	{
		// The dependency is not external
		return false
	}

	// If any aliases are specified, then resolve those aliases as non-external
	if (webpack_configuration.resolve && webpack_configuration.resolve.alias)
	{
		for (let alias of Object.keys(webpack_configuration.resolve.alias))
		{
			// if (request === key || starts_with(request, key + '/'))
			if (package_name === alias)
			{
				// The module is not external
				return false
			}
		}
	}

	// Skip modules explicitly ignored by the user
	if (settings.exclude_from_externals)
	{
		for (let exclusion_pattern of settings.exclude_from_externals)
		{
			let regexp = exclusion_pattern

			if (typeof exclusion_pattern === 'string')
			{
				if (request === exclusion_pattern 
					|| starts_with(request, exclusion_pattern + '/'))
				{
					// The module is not external
					return false
				}
			}
			else if (exclusion_pattern instanceof RegExp)
			{
				if (regexp.test(request))
				{
					// The module is not external
					return false
				}
			}
			else
			{
				throw new Error(`Invalid exclusion pattern: ${exclusion_pattern}. Only strings and regular expressions are allowed.`)
			}
		}
	}

	// The module is external
	return true
}