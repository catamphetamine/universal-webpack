import extract_text_plugin from 'extract-text-webpack-plugin'

import chunks_plugin from './chunks plugin'
import { clone, starts_with } from './helpers'
import { find_style_loaders, is_style_loader, normalize_loaders } from './loaders'

export default function client_configuration(webpack_configuration, settings, options = {})
{
	const configuration = clone(webpack_configuration)

	configuration.plugins = configuration.plugins || []

	configuration.plugins.push
	(
		// Add chunk filename info plugin
		//
		// Writes client-side build chunks filename info
		// for later use inside server-side rendering code
		// (`<script src=.../>` and `<link rel="style" href=.../>` tags)
		//
		// Cloning Webpack configuration here
		// because `webpack-dev-server` seems to alter it
		// by changing the already predefined `.output.path`.
		//
		new chunks_plugin(clone(configuration), { silent: settings.silent, chunkFilename: settings.chunkFilename })
	)

	// Not sure about the name yet
	// // Normalize legacy options
	// if (options.css_bundle)
	// {
	// 	console.warn("`css_bundle` option is now called `extract_styles`")
	// 	options.extract_styles = options.css_bundle
	// 	delete options.css_bundle
	// }

	// If it's a client-side development webpack build,
	// and CSS bundle extraction is enabled,
	// then extract all CSS styles into a file.
	// (without removing them from the code)
	if (options.development && options.css_bundle)
	{
		let css_bundle_filename = '[name]-[contenthash].css'

		if (typeof options.css_bundle === 'string')
		{
			css_bundle_filename = options.css_bundle
		}

		// Extract styles into a file
		// (without removing them from the code in this case).
		//
		// It copies contents of each `require("style.css")`
		// into one big CSS file on disk
		// which will be later read on the server-side
		// and inserted into `<head><style></style></head>`,
		// so that in development mode there's no
		// "flash of unstyled content" on page reload.
		//
		// "allChunks: true" option means that the styles from all chunks
		// (think "entry points") will be extracted into a single big CSS file.
		//
		const extract_css = extract_text_plugin_instance(css_bundle_filename, { allChunks: true })

		// Find module loaders with `style-loader`,
		// and set those module loaders to `extract-text-webpack-plugin` loader
		for (let loader of find_style_loaders(configuration))
		{
			normalize_loaders(loader)

			const style_loader = loader.loaders.filter(is_style_loader)[0]

			const before_style_loader = loader.loaders.slice(0, loader.loaders.indexOf(style_loader))
			const after_style_loader  = loader.loaders.slice(loader.loaders.indexOf(style_loader) + 1)

			// The first argument to the .extract() function is the name of the loader
			// ("style-loader" in this case) to be applied to non-top-level-chunks in case of "allChunks: false" option.
			// since in this configuration "allChunks: true" option is used, this first argument is irrelevant.
			//
			// `remove: false` ensures that the styles being extracted
			// aren't erased from the chunk javascript file.
			//
			// I'm also prepending another `style-loader` here
			// to re-enable adding these styles to the <head/> of the page on-the-fly.
			//
			loader.loader = 'style-loader!' + extract_text_plugin_extract(extract_css, before_style_loader, after_style_loader, { remove: false })
			delete loader.loaders
		}

		// Add the `extract-text-webpack-plugin` to the list of plugins.
		// It will extract all CSS into a file
		// (without removing it from the code in this case)
		configuration.plugins.push(extract_css)
	}

	// Use `extract-text-webpack-plugin`
	// to extract all CSS into a separate file
	// (in production)
	if (options.development === false && options.css_bundle !== false)
	{
		let css_bundle_filename = '[name]-[contenthash].css'

		if (typeof options.css_bundle === 'string')
		{
			css_bundle_filename = options.css_bundle
		}

		// Extract styles into a file
		// (removing them from the code in this case).
		//
		// It moves contents of each `require("style.css")`
		// into one big CSS file on disk
		// which will be later read on the server-side
		// and inserted into `<head><style></style></head>`.
		//
		// "allChunks: true" option means that the styles from all chunks
		// (think "entry points") will be extracted into a single big CSS file.
		//
		const extract_css = extract_text_plugin_instance(css_bundle_filename, { allChunks: true })

		// Find module loaders with `style-loader`,
		// and set those module loaders to `extract-text-webpack-plugin` loader
		for (let loader of find_style_loaders(configuration))
		{
			normalize_loaders(loader)

			const style_loader = loader.loaders.filter(is_style_loader)[0]

			const style_loader_and_before = loader.loaders.slice(0, loader.loaders.indexOf(style_loader) + 1)
			const after_style_loader      = loader.loaders.slice(loader.loaders.indexOf(style_loader) + 1)

			// The first argument to the .extract() function is the name of the loader
			// ("style-loader" in this case) to be applied to non-top-level-chunks in case of "allChunks: false" option.
			// since in this configuration "allChunks: true" option is used, this first argument is irrelevant.
			//
			loader.loader = extract_text_plugin_extract(extract_css, style_loader_and_before, after_style_loader)
			delete loader.loaders
		}

		// Add the `extract-text-webpack-plugin` to the list of plugins.
		// It will extract all CSS into a file
		// (removing it from the code in this case)
		configuration.plugins.push(extract_css)
	}

	// Done
	return configuration
}

// Supports both v1 and v2 of `extract-text-webpack-plugin`
function extract_text_plugin_instance(filename, options = {})
{
	let plugin

	try
	{
		plugin = new extract_text_plugin(filename, options)
	}
	catch (error)
	{
		if (starts_with(error.message, 'Breaking change: ExtractTextPlugin now only takes a single argument.'))
		{
			plugin = new extract_text_plugin({ ...options, filename })
		}
		else
		{
			throw error
		}
	}

	return plugin
}

// Supports both v1 and v2 of `extract-text-webpack-plugin`
function extract_text_plugin_extract(plugin, fallbackLoader, loader, options = {})
{
	let result

	try
	{
		result = plugin.extract(fallbackLoader, loader, options)
	}
	catch (error)
	{
		if (starts_with(error.message, 'Breaking change: extract now only takes a single argument.'))
		{
			result = plugin.extract({ ...options, fallbackLoader, loader })
		}
		else
		{
			throw error
		}
	}

	return result
}
