import chai from 'chai'
chai.should()

import path from 'path'
import webpack from 'webpack'
import server, { replace_style_loader, dont_emit_file_loader } from '../source/server configuration'

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
						loader: 'file-loader',
						options: { a: 'b' }
					}]
				},
				{
					test: /\.png$/,
					use:
					[{
						loader: 'url-loader'
					}]
				}]
			}
		}

		dont_emit_file_loader(configuration)

		configuration.module.rules[0].use.should.deep.equal
		([{
			loader: 'file-loader',
			options: { a: 'b', emitFile: false }
		}])

		configuration.module.rules[1].use.should.deep.equal
		([{
			loader: 'file-loader',
			options: { emitFile: false }
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
})