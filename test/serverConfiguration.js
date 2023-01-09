import chai from 'chai'
chai.should()

import path from 'path'
import webpack from 'webpack'

import server,
{
	replace_style_loader,
	dont_emit_file_loader,
	extract_package_name,
	is_external
}
from '../source/serverConfiguration.js'

describe(`serverConfiguration`, function()
{
	it(`should add "emitFile: false" for "file-loader" and "url-loader"`, function()
	{
		const configuration =
		{
			module:
			{
				rules:
				[{
					test: /\.css$/,
					use:
					[{
						loader: 'file-loader'
					}]
				},
				{
					test: /\.png$/,
					use:
					[{
						loader: 'url-loader',
						options: { limit: 10000 }
					}]
				},
				{
					test: /\.png$/,
					oneOf:
					[{
						use:
						[{
							loader: 'url-loader',
							options: { limit: 10000 }
						}]
					},
					{
						use:
						[{
							loader: 'whatever-loader'
						}]
					}]
				}]
			}
		}

		dont_emit_file_loader(configuration)

		configuration.module.rules[0].use.should.deep.equal
		([{
			loader: 'file-loader',
			options: { emitFile: false }
		}])

		configuration.module.rules[1].use.should.deep.equal
		([{
			loader: 'url-loader',
			options: { limit: 10000, emitFile: false }
		}])

		configuration.module.rules[2].oneOf[0].use.should.deep.equal
		([{
			loader: 'url-loader',
			options: { limit: 10000, emitFile: false }
		}])
	})

	it(`should replace "style-loader" and "css-loader" with "css-loader" and "exportOnlyLocals=true" on the server side for css-loader@4 (no loader options)`, function()
	{
		const configuration =
		{
			module:
			{
				rules:
				[{
					test: /\.css$/,
					use:
					[{
						loader: 'after-loader'
					},
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader'
					},
					{
						loader: 'before-loader'
					}]
				}]
			}
		}

		replace_style_loader(configuration)

		// Generic
		configuration.module.rules[0].use.should.deep.equal
		([{
			loader: 'after-loader'
		},
		{
			loader: 'css-loader',
			options: {
				modules: {
					exportOnlyLocals: true
				}
			}
		},
		{
			loader: 'before-loader'
		}])
	})

	it(`should replace "style-loader" and "css-loader" with "css-loader" and "exportOnlyLocals=true" on the server side for css-loader@4 (has loader options)`, function()
	{
		const configuration =
		{
			module:
			{
				rules:
				[{
					test: /\.css$/,
					use:
					[{
						loader: 'after-loader'
					},
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader',
						options: {}
					},
					{
						loader: 'before-loader'
					}]
				}]
			}
		}

		replace_style_loader(configuration)

		// Generic
		configuration.module.rules[0].use.should.deep.equal
		([{
			loader: 'after-loader'
		},
		{
			loader: 'css-loader',
			options: {
				modules: {
					exportOnlyLocals: true
				}
			}
		},
		{
			loader: 'before-loader'
		}])
	})

	it(`should replace "style-loader" and "css-loader" with "css-loader" and "exportOnlyLocals=true" on the server side for css-loader@4 (modules: true)`, function()
	{
		const configuration =
		{
			module:
			{
				rules:
				[{
					test: /\.css$/,
					use:
					[{
						loader: 'after-loader'
					},
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader',
						options: {
							modules: true
						}
					},
					{
						loader: 'before-loader'
					}]
				}]
			}
		}

		replace_style_loader(configuration)

		// Generic
		configuration.module.rules[0].use.should.deep.equal
		([{
			loader: 'after-loader'
		},
		{
			loader: 'css-loader',
			options: {
				modules: {
					exportOnlyLocals: true
				}
			}
		},
		{
			loader: 'before-loader'
		}])
	})

	it(`shouldn't replace "style-loader" and "css-loader" with "css-loader" and "exportOnlyLocals=true" on the server side for css-loader@4 (modules: false)`, function()
	{
		const configuration =
		{
			module:
			{
				rules:
				[{
					test: /\.css$/,
					use:
					[{
						loader: 'after-loader'
					},
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader',
						options: {
							modules: false
						}
					},
					{
						loader: 'before-loader'
					}]
				}]
			}
		}

		replace_style_loader(configuration)

		// Generic
		configuration.module.rules[0].use.should.deep.equal
		([{
			loader: 'after-loader'
		},
		{
			loader: 'css-loader',
			options: {
				modules: false
			}
		},
		{
			loader: 'before-loader'
		}])
	})

	it(`should build`, function(done)
	{
		done()

		// const server_configuration = server(webpack_configuration, settings)
		//
		// https://webpack.github.io/docs/node.js-api.html
		// webpack(server_configuration, function(error, stats)
		// {
		// 	if (error)
		// {
		// 	return done(error)
		// }
		//
		// 	const result = require(path.join(webpack_configuration.context, settings.server.output))
		// 	result.should.deep.equal({ ... })
		// 	done()
		// })
	})

	it(`should extract npm package name`, function()
	{
		extract_package_name('react').should.equal('react')
		extract_package_name('react/lib/anything').should.equal('react')
		extract_package_name('@incomplete').should.equal('@incomplete')
		extract_package_name('@private/dependency').should.equal('@private/dependency')
		extract_package_name('@private/dependency/lib/anything').should.equal('@private/dependency')
	})

	it(`should check if a dependency is external`, function()
	{
		// Generic NPM package
		is_external
		(
			'react-responsive-ui/modules/Select',
			{},
			{}
		)
		.should.equal(true)

		// Starts with `!`
		is_external
		(
			'!react-responsive-ui/modules/Select',
			{},
			{}
		)
		.should.equal(false)

		// Starts with `-!`
		is_external
		(
			'-!react-responsive-ui/modules/Select',
			{},
			{}
		)
		.should.equal(false)

		// Invalid NPM package name
		is_external
		(
			'react:responsive;ui/modules/Select',
			{},
			{}
		)
		.should.equal(false)

		// `resolve.alias`
		is_external
		(
			'react-responsive-ui/modules/Select',
			{
				resolve:
				{
					alias:
					{
						'react-responsive-ui': '/react-responsive-ui'
					}
				}
			},
			{}
		)
		.should.equal(false)

		// Is a loaded asset
		is_external
		(
			'react-responsive-ui/modules/Select.css',
			{},
			{}
		)
		.should.equal(false)

		// Not a loaded asset
		is_external
		(
			'react-responsive-ui/modules/Select.css',
			{},
			{
				loadExternalModuleFileExtensions: []
			}
		)
		.should.equal(true)

		// `excludeFromExternals` string
		is_external
		(
			'react-responsive-ui/modules/Select',
			{},
			{
				excludeFromExternals: ['react-responsive-ui']
			}
		)
		.should.equal(false)

		// `excludeFromExternals` regular expression
		is_external
		(
			'react-responsive-ui/modules/Select',
			{},
			{
				excludeFromExternals: [/^react-responsive-ui(\/.*)?$/]
			}
		)
		.should.equal(false)
	})
})