import chai from 'chai'
chai.should()

import { server, server_configuration, client_configuration, prepare, devtools, serverConfiguration, clientConfiguration } from '../index.es6'

describe(`exports`, function()
{
	it(`should export in ES6`, function()
	{
		server.should.be.a.function
		server_configuration.should.be.a.function
		client_configuration.should.be.a.function
		prepare.should.be.a.function
		devtools.should.be.a.string

		serverConfiguration.should.be.a.function
		clientConfiguration.should.be.a.function
	})

	it(`should export in CommonJS`, function()
	{
		// Not 'umd' actually, just 'CommonJS'
		const _ = require('../index.umd')

		_.server.should.be.a.function
		_.server_configuration.should.be.a.function
		_.client_configuration.should.be.a.function
		_.prepare.should.be.a.function
		_.devtools.should.be.a.string

		_.serverConfiguration.should.be.a.function
		_.clientConfiguration.should.be.a.function
	})
})