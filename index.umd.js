'use strict'

exports = module.exports =
{
	server : require('./build/server'),
	server_configuration : require('./build/server configuration').default,
	client_configuration : require('./build/client configuration'),
	prepare : require('./build/prepare'),

	// for camelCased guys
	serverConfiguration : require('./build/server configuration').default,
	clientConfiguration : require('./build/client configuration')
}