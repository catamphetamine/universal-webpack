import util from 'util'

import chunks_plugin from './chunks plugin'
import { clone, starts_with } from './helpers'

import
{
	find_loader,
	get_style_rules,
	normalize_configuration_rule_loaders
}
from './loaders'

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
		new chunks_plugin(clone(configuration), {
			silent: settings.silent,
			chunk_info_filename: settings.chunk_info_filename,
			skipDynamicChunks: settings.skipDynamicChunks || false
		})
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
		const extract_css_plugin = create_extract_css_plugin(css_bundle_filename, options.useMiniCssExtractPlugin)

		// Normalize `modules.rules` loaders.
		normalize_configuration_rule_loaders(configuration)

		// Find all rules using `style-loader`
		// and replace `style-loader` with `extract-text-webpack-plugin`
		// or `mini-css-extract-plugin` loader.
		for (const rule of get_style_rules(configuration))
		{
			const style_loader = find_loader(rule, 'style-loader')

			const before_style_loader = rule.use.slice(0, rule.use.indexOf(style_loader))
			const after_style_loader  = rule.use.slice(rule.use.indexOf(style_loader) + 1)

			if (before_style_loader.length > 0)
			{
				throw new Error('No loaders can preceed `style-loader` in a Webpack module rule.', util.inspect(rule))
			}

			rule.use = generate_extract_css_loaders(after_style_loader, options.development, extract_css_plugin, options.useMiniCssExtractPlugin)
		}

		// Add the `extract-text-webpack-plugin` or
		// `mini-css-extract-plugin` to the list of plugins.
		// It will extract all CSS into a file
		// (without removing it from the code in this case)
		configuration.plugins.push(extract_css_plugin)
	}

	// Use `extract-text-webpack-plugin`
	// or `mini-css-extract-plugin`
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
		const extract_css_plugin = create_extract_css_plugin(css_bundle_filename, options.useMiniCssExtractPlugin)

		// Normalize `modules.rules` loaders.
		normalize_configuration_rule_loaders(configuration)

		// Find module loaders with `style-loader`,
		// and set those module loaders to `extract-text-webpack-plugin`
		// or `mini-css-extract-plugin` loader
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

			rule.use = generate_extract_css_loaders(after_style_loader, options.development, extract_css_plugin, options.useMiniCssExtractPlugin)
		}

		// Add the `extract-text-webpack-plugin` or
		// `mini-css-extract-plugin` to the list of plugins.
		// It will extract all CSS into a file
		// (removing it from the code in this case)
		configuration.plugins.push(extract_css_plugin)
	}

	// Done
	return configuration
}

/**
 * Creates an instance of plugin for extracting styles in a file.
 * Either `extract-text-webpack-plugin` or `mini-css-extract-plugin`.
 */
function create_extract_css_plugin(css_bundle_filename, useMiniCssExtractPlugin)
{
	if (useMiniCssExtractPlugin)
	{
		const MiniCssExtractPlugin = require('mini-css-extract-plugin')

		return new MiniCssExtractPlugin
		({
			// Options similar to the same options in webpackOptions.output
			// both options are optional
			filename : css_bundle_filename
		})
	}

	const ExtractTextPlugin = require('extract-text-webpack-plugin')

	// "allChunks: true" option means that the styles from all chunks
	// (think "entry points") will be extracted into a single big CSS file.
	//
	return new ExtractTextPlugin
	({
		filename  : css_bundle_filename,
		allChunks : true
	})
}

/**
 * Generates rule.use loaders for extracting styles in a file.
 * Either for `extract-text-webpack-plugin` or `mini-css-extract-plugin`.
 */
function generate_extract_css_loaders(after_style_loader, development, extract_css_plugin, useMiniCssExtractPlugin)
{
	let extract_css_loaders

	if (useMiniCssExtractPlugin)
	{
		const MiniCssExtractPlugin = require('mini-css-extract-plugin')

		return [{
			loader: MiniCssExtractPlugin.loader
		},
		...after_style_loader]
	}

	// The first argument to the .extract() function is the name of the loader
	// ("style-loader" in this case) to be applied to non-top-level-chunks in case of "allChunks: false" option.
	// since in this configuration "allChunks: true" option is used, this first argument is irrelevant.
	//
	// `remove: false` ensures that the styles being extracted
	// aren't erased from the chunk javascript file.
	//
	const extract_css_loader = extract_css_plugin.extract
	({
		remove    : development ? false : true,
		// `fallback` option is not really being used
		// because `allChunks: true` option is used.
		// fallback  : before_style_loader,
		use       : after_style_loader
	})

	// Workaround for an old bug, may be obsolete now.
	// https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/368
	if (Array.isArray(extract_css_loader))
	{
		extract_css_loaders = extract_css_loader
	}
	else
	{
		extract_css_loaders =
		[{
			loader: extract_css_loader
		}]
	}

	// I'm also prepending another `style-loader` here
	// to re-enable adding these styles to the <head/> of the page on-the-fly.
	if (development)
	{
		return [{
			loader: 'style-loader'
		},
		...extract_css_loaders]
	}

	return extract_css_loaders
}
