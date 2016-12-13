import path from 'path'
import fs from 'fs-extra'

// Creates (or cleans) the server-side build folder.
//
// That's needed because Nodemon, for example,
// needs the folder to exist by the time it runs,
// otherwise it won't detect any changes to the code
// and therefore won't restart on code changes.
//
export default function prepare(settings, webpack_configuration)
{
	// if (!webpack_configuration.context)
	// {
	// 	throw new Error('Base folder not specified')
	// }

	// By default, Webpack sets `context` to `process.cwd()`
	const base_path = webpack_configuration.context || process.cwd()

	if (!settings.server.output)
	{
		throw new Error('`settings.server.output` not specified')
	}

	const server_build_bundle_path = path.resolve(base_path, settings.server.output)
	const server_build_folder = path.dirname(server_build_bundle_path)

	// Extra caution to prevent data loss
	if (server_build_folder === path.normalize(base_path))
	{
		throw new Error('`settings.server.output` "' + server_build_folder + '" points to the project root folder. Won\'t clear that folder to prevent accidental data loss.')
	}

	// Extra caution to prevent data loss
	if (server_build_folder.indexOf(base_path) !== 0)
	{
		throw new Error('`settings.server.output` "' + server_build_folder + '" points outside of the project root folder "' + base_path + '". Won\'t clear that folder to prevent accidental data loss')
	}

	fs.emptyDirSync(server_build_folder)
}