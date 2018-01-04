import chai from 'chai'
chai.should()

import
{
	get_style_rules,
	find_loader,
	parse_loader,
	stringify_loader,
	normalize_rule_loaders,
	normalize_configuration_rule_loaders
}
from '../source/loaders'

describe(`webpack loader utilities`, function()
{
	it(`should get style rules`, function()
	{
		let configuration

		configuration =
		{
			module:
			{
				rules:
				[{
					use:
					[{
						loader: 'not-a-style-loader'
					}]
				},
				{
					use:
					[{
						loader: 'style-loader'
					}]
				},
				{
					use:
					[{
						loader : '/Users/kuchumovn/work/CollegeConsortium/node_modules/extract-text-webpack-plugin/loader.js',
						omit   : 1
					},
					{
						loader : 'style-loader'
					},
					{
						loader : 'css-loader'
					}]
				}]
			}
		}

		get_style_rules(configuration).should.deep.equal
		([{
			use:
			[{
				loader: 'style-loader'
			}]
		}])
	})

	it(`should get style rules when using "oneOf"`, function()
	{
		let configuration

		configuration =
		{
			module:
			{
				rules:
				[{
					test: /\.css$/,
					oneOf:
					[{
						use:
						[{
							loader: 'not-a-style-loader'
						}]
					},
					{
						use:
						[{
							loader: 'not-a-style-loader'
						},
						{
							loader: 'style-loader'
						}]
					}]
				},
				{
					test: /\.css$/,
					oneOf:
					[{
						use:
						[{
							loader: 'style-loader'
						}]
					},
					{
						use:
						[{
							loader: 'not-a-style-loader'
						}]
					}]
				}]
			}
		}

		get_style_rules(configuration).should.deep.equal
		([{
			use:
			[{
				loader: 'not-a-style-loader'
			},
			{
				loader: 'style-loader'
			}]
		},
		{
			use:
			[{
				loader: 'style-loader'
			}]
		}])
	})

	it(`should find style loader`, function()
	{
		find_loader
		({
			test: /\.css$/,
			use:
			[{
				loader: 'after-loader'
			},
			{
				loader: 'style-loader'
			},
			{
				loader: 'before-loader'
			}]
		},
		'style-loader')
		.should.deep.equal
		({
			loader: 'style-loader'
		})
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

		// Convert `loader` and `query` to `use` and `options`

		loader =
		{
			loader: 'style-loader',
			query:
			{
				query: 'true',
				gay: 'porn'
			}
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
			}]
		})

		// Convert `use` string to array

		loader =
		{
			use: 'style-loader'
		}

		normalize_rule_loaders(loader)

		loader.should.deep.equal
		({
			use:
			[{
				loader: 'style-loader'
			}]
		})

		// Shouldn't convert compound `loader` and `query`

		loader =
		{
			loader: 'style-loader!another-loader',
			query:
			{
				query: true,
				gay: 'porn'
			}
		}

		let execute = () => normalize_rule_loaders(loader)
		execute.should.throw(`You have both a compound ".loader" and a ".query"`)

		// Should recurse into `oneOf`

		loader =
		{
			test: /.css$/,
			oneOf:
			[{
				resourceQuery: /hot/, // foo.css?hot
				use: 'hot-style-loader'
			},
			{
				resourceQuery: /gay/, // foo.css?gay
				use: 'gay-style-loader'
			}]
		}

		normalize_rule_loaders(loader)

		loader.should.deep.equal
		({
			test: /.css$/,
			oneOf:
			[{
				resourceQuery: /hot/, // foo.css?hot
				use:
				[{
					loader: 'hot-style-loader'
				}]
			},
			{
				resourceQuery: /gay/, // foo.css?gay
				use:
				[{
					loader: 'gay-style-loader'
				}]
			}]
		})

		// No `loader` is specified

		loader =
		{
			query:
			{
				query: 'true',
				gay: 'porn'
			}
		}

		execute = () => normalize_rule_loaders(loader)
		execute.should.throw(`Neither "loaders" nor "loader" nor "use" nor "oneOf" are present inside a module rule`)

		// Convert compound `loader` to `use` array

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

	it('should normalize configuration rule loaders', function()
	{
		const configuration =
		{
			module:
			{
				rules:
				[{
					test: /.css$/,
					use: 'css-loader'
				}]
			}
		}

		normalize_configuration_rule_loaders(configuration)

		configuration.should.deep.equal
		({
			module:
			{
				rules:
				[{
					test: /.css$/,
					use:
					[{
						loader: 'css-loader'
					}]
				}]
			}
		})
	})
})