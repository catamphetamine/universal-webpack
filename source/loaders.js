import util from 'util'
import querystring from 'querystring'

import { is_object, ends_with } from './helpers'

// https://webpack.js.org/configuration/module/

// Finds module loaders with `style-loader`
export function find_style_rules(configuration)
{
	// Sanity check
	if (!configuration.module.rules)
	{
		throw new Error('No `module.rules` found in Webpack configuration. Migrate your configuration to Webpack 2: https://webpack.js.org/guides/migrating/')
	}

	return configuration.module.rules.filter( ( rule ) =>
	{
		normalize_rule_loaders( rule )

		// Check if this module loader has a `style-loader`
		const style_loader = rule.use.filter( loader_name_filter( 'style' ) )[0]

		// Is it `extract-text-webpack-plugin` loader
		const extract_text_plugin_loader = rule.use.filter( loader => loader.loader.indexOf( 'extract-text-webpack-plugin/loader.js' ) >= 0 )[0]

		return style_loader && !extract_text_plugin_loader
	} )
}

// Converts loader string into a Webpack 2 loader structure
export function parse_loader(loader)
{
	let name
	let options

	if (is_object(loader))
	{
		if (!loader.loader)
		{
			throw new Error(`.loader not set for a used loader`)
		}

		const parsed = parse_loader(loader.loader)

		name = parsed.loader
		options = parsed.options || (loader.query || loader.options)

		if (typeof options === 'string')
		{
			options = querystring.parse(options)
		}
	}
	else
	{
		name = loader

		if (name.indexOf('?') >= 0)
		{
			name = name.substring(0, name.indexOf('?'))
			options = querystring.parse(loader.substring(loader.indexOf('?') + 1))
		}
	}

	const result =
	{
		loader: name
	}

	if (options)
	{
		result.options = options
	}

	return result
}

// Converts loader info into a string
export function stringify_loader(loader)
{
	return loader.loader + (loader.options ? '?' + querystring.stringify(loader.options) : '')
}

// Checks if the passed loader is `style-loader`
export function loader_name_filter ( loader_name )
{
	return function ( loader )
	{
		const parsed = parse_loader( loader )

		let name = parsed.loader

		if ( ends_with( name, '-loader' ) )
		{
			name = name.substring( 0, name.lastIndexOf( '-loader' ) )
		}

		return name === loader_name
	}
}

// Converts `loader` to `loaders`
export function normalize_rule_loaders(rule)
{
	// Convert `loaders` to `use`
	if (rule.loaders)
	{
		rule.use = rule.loaders
		delete rule.loaders
	}

	// If a `loader` shorthand is used, convert it to `use`
	if (rule.loader)
	{
		let loaders = rule.loader.split('!')

		if (rule.query || rule.options)
		{
			const parsed_loader = parse_loader(loaders[0])

			if (loaders.length > 1 || parsed_loader.options)
			{
				throw new Error(`You have both a compound ".loader" and a ".query" (or an ".options") property set up directly inside a module rule: ${util.inspect(rule)}. Rewrite it either using ".loaders" or ".use".`)
			}

			loaders = [parsed_loader]

			parsed_loader.options = rule.query || rule.options
			delete rule.query
			delete rule.options
		}

		rule.use = loaders
		delete rule.loader
	}

	if (!rule.use)
	{
		throw new Error(`Neither "loaders" nor "loader" nor "use" are present inside a module rule: ${util.inspect(rule)}`)
	}

	if (typeof rule.use === 'string')
	{
		rule.use = [rule.use]
	}

	if (!Array.isArray(rule.use))
	{
		throw new Error(`Invalid Webpack configuration: "rule.use" must be an array:\n\n${JSON.stringify(rule, null, 2)}\n\nSee https://webpack.js.org/configuration/module/#rule-use`)
	}

	rule.use = rule.use.map(parse_loader)
}