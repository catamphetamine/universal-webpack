import chunks_plugin from './chunks plugin'

import { clone } from './helpers'

export default function client_configuration(webpack_configuration, settings)
{
	const configuration = clone(webpack_configuration)

	// Add chunk filename info plugin

	configuration.plugins = configuration.plugins || []

	configuration.plugins.push
	(
		// Writes client-side build chunks filename info
		// for later use inside server-side rendering code
		// (`<script src=.../>` and `<link rel="style" href=.../>` tags)
		//
		// Cloning Webpack configuration here
		// because `webpack-dev-server` seems to alter it
		// by changing the already predefined `.output.path`.
		//
		new chunks_plugin(clone(configuration))
	)

	// Done
	return configuration
}