import path from 'path'

// For some weird reason Babel `filename` has posix slashes
// instead of standard Windows slashes on Windows operating system.
const node_modules = `${path.posix.sep}node_modules${path.posix.sep}`

// Exclude `node_modules` anywhere in the path,
// and also the server-side bundle output by `universal-webpack`.
// 
// Babel excludes all `node_modules` by default,
// so by overriding the default `ignore` behavior
// the `node_modules` exclusion feature must be duplicated.
// https://github.com/babel/babel/blob/c8bd9e3ffb23e216d92fb70188fcf105381b8bb8/packages/babel-register/src/node.js#L90-L96
//
// Excluding the server-side bundle is said to speed up things a bit.
// https://github.com/halt-hammerzeit/webpack-react-redux-isomorphic-render-example/issues/5
//
export function babel_register_options(universal_webpack_settings, webpack_configuration)
{
	let server_side_bundle_path = path.resolve(webpack_configuration.context, universal_webpack_settings.server.output)
	
	// For some weird reason Babel `filename` has posix slashes
	// instead of standard Windows slashes on Windows operating system.
	server_side_bundle_path = server_side_bundle_path.replace(/\\/g, path.posix.sep)

	// `babel-register` options
	const options =
	{
		ignore(filename)
		{
			// Ignore all `node_modules` folders
			if (filename.indexOf(node_modules) >= 0)
			{
				return true
			}

			// Ignore the server-side bundle
			if (filename === server_side_bundle_path)
			{
				return true
			}

			return false
		}
	}

	return options
}