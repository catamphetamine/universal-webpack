#!/usr/bin/env node

var path = require('path')
var fs = require('fs')

var minimist = require('minimist')
var universal_webpack = require('../index.common')

var command_line_arguments = minimist(process.argv.slice(2))

if (!command_line_arguments.settings)
{
	return usage('Path to the settings file not specified')
}

var settings = require(path.resolve(process.cwd(), command_line_arguments.settings))

if (command_line_arguments._.length === 0)
{
	return usage('No command specified')
}

if (command_line_arguments._.length > 1)
{
	return usage('Invalid input')
}

var command = command_line_arguments._[0]

switch (command)
{
	case 'prepare':
		universal_webpack.prepare(settings, command_line_arguments.basePath)
		break

	default:
		usage('Unknown command: ' + command)
}

function usage(reason)
{
	if (reason)
	{
		console.log(reason)
		console.log('')
	}

	console.log('Usage:')
	console.log('')
	console.log('universal-webpack --settings ./universal-webpack-settings.js <command>')
	console.log('')
	console.log('Commands:')
	console.log('')
	console.log('   prepare - Creates (or cleans) the server-side build folder')
	console.log('             ')
	console.log('             That\'s needed because Nodemon, for example,')
	console.log('             needs the folder to exist by the time it runs,')
	console.log('             otherwise it won\'t detect any changes to the code')
	console.log('             in that "--watch"ed folder and therefore won\'t')
	console.log('             restart the server on code changes.')
	console.log('             ')
	console.log('             An optional --basePath argument may be passed')
	console.log('             (same as Webpack\'s `.context` setting)')
	console.log('             which is gonna be the base path for resolving')
	console.log('             the `server` path inside `./universal-webpack-settings.js`.')
	console.log('             Is `process.cwd()` by default, i.e. the folder')
	console.log('             from which the `universal-webpack` command is being run.')

	if (reason)
	{
		return process.exit(1)
	}

	process.exit(0)
}