import chai from 'chai'
chai.should()

import path from 'path'
import webpack from 'webpack'
import server, { replace_style_loader, dont_emit_file_loader, extract_package_name } from '../source/server configuration'

describe(`server configuration`, function()
{
	it(`should add "emit: false" for "file-loader" and "url-loader"`, function()
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
	})

	it(`should replace "style-loader" and "css-loader" with "css-loader/locals" on the server side`, function()
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
						loader: 'style-loader'
					},
					{
						loader: 'css-loader'
					}]
				}]
			}
		}

		replace_style_loader(configuration)

		configuration.module.rules[0].use.should.deep.equal
		([{
			loader: 'css-loader/locals'
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
})