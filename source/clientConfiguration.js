import util from 'util'

import MiniCssExtractPlugin from 'mini-css-extract-plugin'

import chunks_plugin from './chunksPlugin.js'
import { clone, starts_with } from './helpers.js'

import
{
	find_loader,
	get_style_rules,
	normalize_configuration_rule_loaders
}
from './loaders.js'

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
		new chunks_plugin(clone(configuration), { silent: settings.silent, chunk_info_filename: settings.chunk_info_filename })
	)

	// CSS bundle filename (if specified)

	const css_bundle = options.css_bundle || options.cssBundle

	let css_bundle_filename = '[name]-[contenthash].css'

	if (typeof css_bundle === 'string')
	{
		css_bundle_filename = css_bundle
	}

	// If it's a client-side development webpack build,
	// and CSS bundle extraction is enabled,
	// then extract all CSS styles into a file.
	// (without removing them from the code)
	if (options.development && css_bundle)
	{
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
		const extract_css_plugin = create_extract_css_plugin(css_bundle_filename)

		// Normalize `modules.rules` loaders.
		normalize_configuration_rule_loaders(configuration)

		// Find all rules using `style-loader`
		// and replace `style-loader` with `mini-css-extract-plugin` loader.
		for (const rule of get_style_rules(configuration))
		{
			const style_loader = find_loader(rule, 'style-loader')

			const before_style_loader = rule.use.slice(0, rule.use.indexOf(style_loader))
			const after_style_loader  = rule.use.slice(rule.use.indexOf(style_loader) + 1)

			if (before_style_loader.length > 0)
			{
				throw new Error('No loaders can preceed `style-loader` in a Webpack module rule.', util.inspect(rule))
			}

			rule.use = generate_extract_css_loaders(after_style_loader, options.development)
		}

		// Add `mini-css-extract-plugin` to the list of plugins.
		// It will extract all CSS into a file
		// (without removing it from the code in this case)
		configuration.plugins.push(extract_css_plugin)
	}

	// Use `mini-css-extract-plugin`
	// to extract all CSS into a separate file
	// (in production)
	if (options.development === false && css_bundle !== false)
	{
		// Extract styles into a file
		// (removing them from the code in this case).
		//
		// It moves contents of each `require("style.css")`
		// into one big CSS file on disk
		// which will be later read on the server-side
		// and inserted into `<head><style></style></head>`.
		//
		const extract_css_plugin = create_extract_css_plugin(css_bundle_filename)

		// Normalize `modules.rules` loaders.
		normalize_configuration_rule_loaders(configuration)

		// Find module loaders with `style-loader`,
		// and set those module loaders to `mini-css-extract-plugin` loader
		for (const rule of get_style_rules(configuration))
		{
			const style_loader = find_loader(rule, 'style-loader')

			// const style_loader_and_before = rule.use.slice(0, rule.use.indexOf(style_loader) + 1)

			const before_style_loader = rule.use.slice(0, rule.use.indexOf(style_loader))
			const after_style_loader  = rule.use.slice(rule.use.indexOf(style_loader) + 1)

			if (before_style_loader.length > 0)
			{
				throw new Error('No loaders can preceed `style-loader` in a Webpack module rule.', util.inspect(rule))
			}

			rule.use = generate_extract_css_loaders(after_style_loader, options.development)
		}

		// Add `mini-css-extract-plugin` to the list of plugins.
		// It will extract all CSS into a file
		// (removing it from the code in this case)
		configuration.plugins.push(extract_css_plugin)
	}

	// Done
	return configuration
}

/**
 * Creates an instance of `mini-css-extract-plugin` for extracting styles in a file.
 */
function create_extract_css_plugin(css_bundle_filename)
{
	return new MiniCssExtractPlugin
	({
		// Options similar to the same options in webpackOptions.output
		// both options are optional
		filename : css_bundle_filename
	})
}

/**
 * Generates rule.use loaders for extracting styles in a file.
 * For `mini-css-extract-plugin`.
 */
function generate_extract_css_loaders(after_style_loader, development)
{
	return [{
		loader: MiniCssExtractPlugin.loader
	},
	...after_style_loader]
}