'use strict'

exports = module.exports =
{
	server                 : require('./build/server').default,
	server_configuration   : require('./build/server configuration').default,
	client_configuration   : require('./build/client configuration').default,
	prepare                : require('./build/prepare').default,
	devtools               : require('./build/devtools').default,

	// for camelCased guys
	serverConfiguration    : require('./build/server configuration').default,
	clientConfiguration    : require('./build/client configuration').default
}