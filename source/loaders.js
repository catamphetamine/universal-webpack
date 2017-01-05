import util from 'util'
import querystring from 'querystring'

import { is_object, ends_with } from './helpers'

// Finds module loaders with `style-loader`
export function find_style_rules(configuration)
{
	const style_rules = []

	const uses_module_rules = !configuration.module.loaders && configuration.module.rules
	const rules = configuration.module.loaders || configuration.module.rules

	if (!rules)
	{
		throw new Error('No `module.loaders` or `module.rules` found in Webpack configuration')
	}

	for (let rule of rules)
	{
		if (rule.loader)
		{
			// Don't mess with ExtractTextPlugin at all
			// (even though it has `style` loader,
			//  it has its own ways)
			if (rule.loader.indexOf('extract-text-webpack-plugin/loader.js') >= 0)
			{
				continue
			}
		}

		normalize_rule_loaders(rule)

		if (!rule.use)
		{
			throw new Error(`No webpack loader specified for this module.${uses_module_rules ? 'rules' : 'loaders'} element: ${util.inspect(rule)}`)
		}

		// Check if this module loader has a `style-loader`
		const style_loader = rule.use.filter(is_style_loader)[0]
		if (style_loader)
		{
			// Don't mess with ExtractTextPlugin at all
			// (even though it has `style` loader,
			//  it has its own ways)
			if (style_loader.loader.indexOf('extract-text-webpack-plugin/loader.js') >= 0)
			{
				continue
			}

			style_rules.push(rule)
		}
	}

	return style_rules
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
export function is_style_loader(loader)
{
	const parsed = parse_loader(loader)

	let name = parsed.loader

	if (ends_with(name, '-loader'))
	{
		name = name.substring(0, name.lastIndexOf('-loader'))
	}

	return name === 'style'
}

// Converts `loader` to `loaders`
export function normalize_rule_loaders(rule)
{
	if (rule.loaders)
	{
		rule.use = rule.loaders
		delete rule.loaders
	}

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

	rule.use = rule.use.map(parse_loader)
}