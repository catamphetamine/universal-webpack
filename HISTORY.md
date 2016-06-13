0.1.13 / 13.06.2016
==================

  * Fixing `webpack-dev-server` overwriting `configuration.output.path`

0.1.12 / 31.05.2016
==================

  * Now replacing `style-loader` with `fake-style-loader` for server-side Webpack configuration

0.1.10 / 27.05.2016
==================

  * Fixed `ExtractTextPlugin`

0.1.8 / 26.05.2016
==================

  * Fixed `resolve.alias`
  * Fixed Babel export issues during server-side code importing

0.1.3 / 23.05.2016
==================

  * Fixed "Cannot find module 'colors/safe'"

0.1.2 / 21.05.2016
==================

  * Fixed hot reload on server-side (restarts Node.js (Nodemon) on code changes)

0.1.1 / 21.05.2016
==================

  * Removed the global `_server_` variable (too specific for the project, anyone can set it using Webpack's `DefinePlugin` inside `webpack.config.server.js`)

0.1.0 / 21.05.2016
==================

  * Initial release