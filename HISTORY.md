0.1.43 / 13.12.2016
===================

  * A small fix for `externals`

0.1.42 / 13.12.2016
===================

  * `context` is now `process.cwd()` by default (as per Webpack docs)

0.1.40 / 21.09.2016
===================

  * Fixed `__dirname` and `__filename` in server-side builds

0.1.39 / 01.09.2016
===================

  * Fixes server bundle not yet has been written to disk

0.1.37 / 19.08.2016
===================

  * Added `silent` option (won't output client side webpack build stats to console; e.g. when using `webpack-dashboard`)

0.1.33 / 21.07.2016
===================

  * `server` running function now returns a `Promise` with a result of whatever is returned from the user supplied `server(parameters)` function

0.1.31 / 20.07.2016
===================

  * `devtools` is now a function

0.1.28 / 20.07.2016
===================

  * `development: false` option now automatically extracts styles with `extract-text-webpack-plugin` (unless `css_bundle` is `false`) (the CSS bundle filename can be customized with `css_bundle: "filename.css"`)

0.1.26 / 19.07.2016
===================

  * Constrained "flash of unstyled content" fix to setting an additional flag: `css_bundle`. Because this feature can introduce a bug if used unproperly.

0.1.21 / 19.07.2016
===================

  * Added the third parameter to Webpack configuration creators. The parameter added is an object of options. It can have a property called `development` with `true/false` value. It is used in client-side configuration creation to solve the "flash of unstyled content" on page reload.

0.1.17 - 0.1.20 / 09.07.2016
===================

  * Plugin removal bug fix
  * Added `exclude_from_externals` module
  * Covered external modules resolution with tests

0.1.16 / 09.07.2016
===================

  * Removing `CommonsChunkPlugin` from server-side configuration

0.1.15 / 30.06.2016
==================

  * Removing `HotModuleReplacementPlugin` from server-side configuration

0.1.14 / 25.06.2016
==================

  * `@papigers` fixed server-side code error swallowing

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