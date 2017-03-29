import chai from 'chai'
chai.should()

import
{
	server,
	server_configuration,
	client_configuration,
	prepare,
	devtools,
	babel_register_options,
	serverConfiguration,
	clientConfiguration,
	babelRegisterOptions
}
from '../index.es6'

describe(`exports`, function()
{
	it(`should export in ES6`, function()
	{
		server.should.be.a('function')
		server_configuration.should.be.a('function')
		client_configuration.should.be.a('function')
		prepare.should.be.a('function')
		devtools.should.be.a('function')
		babel_register_options.should.be.a('function')

		serverConfiguration.should.be.a('function')
		clientConfiguration.should.be.a('function')
		babelRegisterOptions.should.be.a('function')
	})

	it(`should export in CommonJS`, function()
	{
		const _ = require('../index.common')

		_.server.should.be.a('function')
		_.server_configuration.should.be.a('function')
		_.client_configuration.should.be.a('function')
		_.prepare.should.be.a('function')
		_.devtools.should.be.a('function')
		_.babel_register_options.should.be.a('function')

		_.serverConfiguration.should.be.a('function')
		_.clientConfiguration.should.be.a('function')
		_.babelRegisterOptions.should.be.a('function')
	})

	it(`should export /config and /server`, function()
	{
		require('../config').client.should.be.a('function')
		require('../config').server.should.be.a('function')

		require('../server').should.be.a('function')
	})
})