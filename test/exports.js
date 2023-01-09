import chai from 'chai'
chai.should()

import _ from '../index.cjs'

import { client as ConfigClient, server as ConfigServer } from '../config.js'
// import Server from '../server.js'

import ConfigCJS from '../config.cjs'
import ServerCJS from '../server.cjs'

import
{
	prepare,
	devtools,
	smokeScreen,
	hideSmokeScreen,
	hideSmokeScreenAfter,
	serverConfiguration,
	clientConfiguration
}
from '../index.js'

describe(`exports`, function()
{
	it(`should export in ES6`, function()
	{
		prepare.should.be.a('function')
		devtools.should.be.a('function')
		smokeScreen.should.be.a('string')
		hideSmokeScreen.should.be.a('string')
		hideSmokeScreenAfter.should.be.a('function')
		serverConfiguration.should.be.a('function')
		clientConfiguration.should.be.a('function')
	})

	it(`should export in CommonJS`, function()
	{
		_.prepare.should.be.a('function')
		_.devtools.should.be.a('function')
		_.smokeScreen.should.be.a('string')
		_.hideSmokeScreen.should.be.a('string')
		_.hideSmokeScreenAfter.should.be.a('function')
		_.serverConfiguration.should.be.a('function')
		_.clientConfiguration.should.be.a('function')
	})

	it(`should export /config and /server`, function()
	{
		ConfigClient.should.be.a('function')
		ConfigServer.should.be.a('function')

		// Server.should.be.a('function')
	})

	it(`should export /config and /server (CommonJS)`, function()
	{
		ConfigCJS.client.should.be.a('function')
		ConfigCJS.server.should.be.a('function')

		ServerCJS.should.be.a('function')
	})
})