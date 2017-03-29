'use strict'

exports = module.exports =
{
	server                 : require('./build/server').default,
	server_configuration   : require('./build/server configuration').default,
	client_configuration   : require('./build/client configuration').default,
	prepare                : require('./build/prepare').default,
	devtools               : require('./build/devtools').default,
	babel_register_options : require('./build/babel-register').babel_register_options,

	// for camelCased guys
	serverConfiguration    : require('./build/server configuration').default,
	clientConfiguration    : require('./build/client configuration').default,
	babelRegisterOptions   : require('./build/babel-register').babel_register_options
}