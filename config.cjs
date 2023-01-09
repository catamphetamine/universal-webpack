'use strict'

// This is an alternative to `import { clientConfiguration, serverConfiguration } from 'universal-webpack'`.
// https://github.com/catamphetamine/universal-webpack/issues/23#issuecomment-290201907
exports = module.exports =
{
	server : require('./build/serverConfiguration.js').default,
	client : require('./build/clientConfiguration.js').default
}