import chai from 'chai'
chai.should()

import { find_style_rules, is_style_loader, parse_loader, stringify_loader, normalize_rule_loaders } from '../source/loaders'

describe(`webpack loader utilities`, function()
{
	it(`should find style loaders`, function()
	{
		let configuration

		configuration =
		{
			module:
			{
				loaders:
				[{
					loaders:
					[{
						loader: 'not-a-style-loader'
					}]
				},
				{
					loaders:
					[{
						loader: 'style-loader'
					}]
				}]
			}
		}

		find_style_rules(configuration).should.deep.equal
		([{
			use:
			[{
				loader: 'style-loader'
			}]
		}])
	})

	it(`should detect style loader`, function()
	{
		is_style_loader('style-loader').should.equal(true)
		is_style_loader('style-loader?query=true&gay=porn').should.equal(true)
		is_style_loader('style').should.equal(true)
		is_style_loader('style?query=true').should.equal(true)

		is_style_loader('style_loader').should.equal(false)
	})

	it(`should parse loaders`, function()
	{
		const parsed =
		{
			loader: 'style-loader',
			options:
			{
				query: 'true',
				gay: 'porn'
			}
		}

		parse_loader('style-loader?query=true&gay=porn').should.deep.equal(parsed)
		parse_loader({ loader: 'style-loader?query=true&gay=porn' }).should.deep.equal(parsed)
		parse_loader({ loader: 'style-loader', query: 'query=true&gay=porn' }).should.deep.equal(parsed)
		parse_loader({ loader: 'style-loader', options: 'query=true&gay=porn' }).should.deep.equal(parsed)
		parse_loader({ loader: 'style-loader', query: { query: 'true', 'gay': 'porn' }}).should.deep.equal(parsed)
		parse_loader({ loader: 'style-loader', options: { query: 'true', 'gay': 'porn' }}).should.deep.equal(parsed)
	})

	it(`should stringify loaders`, function()
	{
		stringify_loader
		({
			loader: 'style-loader',
			options:
			{
				query: 'true',
				gay: 'porn'
			}
		})
		.should.equal('style-loader?query=true&gay=porn')
	})

	it(`should normalize loaders`, function()
	{
		let loader

		loader =
		{
			loader: 'style-loader',
			query:
			{
				query: true,
				gay: 'porn'
			}
		}

		let execute = () => normalize_rule_loaders(loader)
		execute.should.throw(`You have both ".loader" and ".query"`)

		loader =
		{
			query:
			{
				query: 'true',
				gay: 'porn'
			}
		}

		execute = () => normalize_rule_loaders(loader)
		execute.should.throw(`Neither "loaders" nor "loader" nor "use" are present inside a module rule`)

		loader =
		{
			loader: 'style-loader?query=true&gay=porn!css-loader?a=b'
		}

		normalize_rule_loaders(loader)

		loader.should.deep.equal
		({
			use:
			[{
				loader: 'style-loader',
				options:
				{
					query: 'true',
					gay: 'porn'
				}
			},
			{
				loader: 'css-loader',
				options:
				{
					a: 'b'
				}
			}]
		})
	})
})