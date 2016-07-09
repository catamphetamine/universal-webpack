import webpack from 'webpack'
import fs from 'fs'
import { chunk_info_file_path } from '../source/chunks'
import client from '../source/client configuration'

describe(`client configuration`, function()
{
	it(`should output chunks info file after Webpack build`, function()
	{
		// Submit a Pull Request

		// const webpack_configuration = {}
		// const settings = {}
		// const client_configuration = client(webpack_configuration, settings)
		//
		// fs.unlink(chunk_info_file_path(client_configuration))
		//
		// https://webpack.github.io/docs/node.js-api.html
		// webpack(client_configuration, function(error, stats)
		// {
		// 	fs.exists(chunk_info_file_path(client_configuration)).should.equal(true)
		// })
	}
})