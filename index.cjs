'use strict'

exports = module.exports =
{
	serverConfiguration    : require('./build/serverConfiguration.js').default,
	clientConfiguration    : require('./build/clientConfiguration.js').default,
	prepare                : require('./build/prepare.js').default,
	devtools               : require('./build/devtools.js').default,
	smokeScreen            : require('./build/devtools.js').smokeScreen,
	hideSmokeScreen        : require('./build/devtools.js').hideSmokeScreen,
	hideSmokeScreenAfter   : require('./build/devtools.js').hideSmokeScreenAfter
}