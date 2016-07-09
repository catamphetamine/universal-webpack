import path from 'path'
import webpack from 'webpack'
import server from '../source/server configuration'

describe(`server configuration`, function()
{
	it(`should remove unnecessary plugins`, function()
	{
		// Submit a Pull Request

		// const webpack_configuration = {}
		// const settings = {}
		// const server_configuration = server(webpack_configuration, settings)
		//
		// `server_configuration` should not contain `CommonsChunkPlugin`
	}

	it(`should replace style-loader with fake-style-loader`, function()
	{
		// Submit a Pull Request
	})

	it(`shouldn't replace style-loader with fake-style-loader for ExtractTextPlugin`, function()
	{
		// Submit a Pull Request
	})

	it(`should build`, function()
	{
		// https://webpack.github.io/docs/node.js-api.html
		// webpack(client_configuration, function(error, stats)
		// {
		// 	const result = require(path.join(webpack_configuration.context, settings.server.output))
		// })
	})
})