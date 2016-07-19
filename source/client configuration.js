import chunks_plugin from './chunks plugin'
import { clone } from './helpers'
import { find_style_loaders, is_style_loader } from './loaders'

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
		new chunks_plugin(clone(configuration))
	)

	// If it's a client-side development webpack build
	if (options.development && options.css_bundle)
	{
		const extract_text_plugin = require('extract-text-webpack-plugin')

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
		const extract_css = new extract_text_plugin('[name]-[contenthash].css', { allChunks: true })

		// Find module loaders with `style-loader`,
		// and set those module loaders to `extract-text-webpack-plugin` loader
		for (let loader of find_style_loaders(configuration))
		{
			const style_loader = loader.loaders.filter(is_style_loader)[0]

			const style_loader_and_before = loader.loaders.slice(0, loader.loaders.indexOf(style_loader) + 1)
			const after_style_loader      = loader.loaders.slice(loader.loaders.indexOf(style_loader) + 1)

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
			loader.loader = 'style-loader!' + extract_css.extract(style_loader_and_before, after_style_loader, { remove: false })
			delete loader.loaders
		}

		// Add the `extract-text-webpack-plugin` to the list of plugins.
		// It will extract all CSS into a file
		// (without removing it from the code in this case)
		configuration.plugins.push(extract_css)
	}

	// Done
	return configuration
}