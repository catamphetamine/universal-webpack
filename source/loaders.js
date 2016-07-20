import util from 'util'
import querystring from 'querystring'

import { is_object, ends_with } from './helpers'

// Finds module loaders with `style-loader`
export function find_style_loaders(configuration)
{
	const style_loaders = []

	for (let loader of configuration.module.loaders)
	{
		let loaders = loader.loaders

		// convert `loader` to `loaders` for convenience
		if (!loader.loaders)
		{
			if (!loader.loader)
			{
				throw new Error('No webpack loader specified for this `module.loaders` element')
			}

			// Don't mess with ExtractTextPlugin at all
			// (even though it has `style` loader,
			//  it has its own ways)
			if (loader.loader.indexOf('extract-text-webpack-plugin/loader.js') >= 0)
			{
				continue
			}

			if (loader.loader.indexOf('!') >= 0)
			{
				// Replace `loader` with the corresponding `loaders`
				loader.loaders = loader.loader.split('!')
				delete loader.loader
			}

			// if (loader.query)
			// {
			// 	loader.loaders[0] += '?' + querystring.stringify(loader.query)
			// 	delete loader.query
			// }
		}

		// Check if this module loader has a `style-loader`
		const style_loader = (loader.loaders || loader.loader.split('!')).filter(is_style_loader)[0]
		if (style_loader)
		{
			style_loaders.push(loader)
		}
	}

	return style_loaders
}

// Converts loader string into loader info structure
export function parse_loader(loader)
{
	let name
	let query

	if (is_object(loader))
	{
		name = loader.loader
		query = loader.query
	}
	else
	{
		name = loader

		if (name.indexOf('?') >= 0)
		{
			name = name.substring(0, name.indexOf('?'))
			query = querystring.parse(loader.substring(loader.indexOf('?') + 1))
		}
	}

	const result =
	{
		name,
		query
	}

	return result
}

// Converts loader info into a string
export function stringify_loader(loader)
{
	return loader.name + (loader.query ? '?' + querystring.stringify(loader.query) : '')
}

// Checks if the passed loader is `style-loader`
export function is_style_loader(loader)
{
	let { name } = parse_loader(loader)

	if (ends_with(name, '-loader'))
	{
		name = name.substring(0, name.lastIndexOf('-loader'))
	}

	return name === 'style'
}

// Converts `loader` to `loaders`
export function normalize_loaders(loader)
{
	if (!loader.loaders)
	{
		if (!loader.loader)
		{
			throw new Error(`Neither "loaders" not "loader" are present inside a module loader: ${util.inspect(loader)}`)
		}

		if (loader.query)
		{
			throw new Error(`Unable to normalize a module loader with a "query" object: ${util.inspect(loader)}`)
		}

		loader.loaders = loader.loader.split('!')
		delete loader.loader
	}
}