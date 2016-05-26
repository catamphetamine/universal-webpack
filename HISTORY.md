0.1.6 / 26.09.2016
==================

  * Fixed `resolve.alias`

0.1.3 / 23.09.2016
==================

  * Fixed "Cannot find module 'colors/safe'"

0.1.2 / 21.09.2016
==================

  * Fixed hot reload on server-side (restarts Node.js (Nodemon) on code changes)

0.1.1 / 21.09.2016
==================

  * Removed the global `_server_` variable (too specific for the project, anyone can set it using Webpack's `DefinePlugin` inside `webpack.config.server.js`)

0.1.0 / 21.09.2016
==================

  * Initial release