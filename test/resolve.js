import chai from 'chai'
chai.should()

import { is_external } from '../source/serverConfiguration.js'

describe(`resolver`, function()
{
	it(`shouldn't mark regular files as external`, function()
	{
		const webpack_configuration = {}
		const settings = {}

		const test = (module, result) =>
		{
			is_external(module, webpack_configuration, settings).should.equal(result)
		}

		test('/work/project/file', false)
		test('/work/project/file.js', false)
	})

	it(`should mark node_modules as external`, function()
	{
		const webpack_configuration = {}
		const settings = {}

		const test = (module, result) =>
		{
			is_external(module, webpack_configuration, settings).should.equal(result)
		}

		test('a', true)
		test('react-isomorphic-render', true)
		test('react-isomorphic-render/redux', true)
	})

	it(`shouldn't mark resolve.aliases as external`, function()
	{
		const webpack_configuration =
		{
			resolve:
			{
				alias:
				{
					'an-alias': '/an-alias/path'
				}
			}
		}

		const settings = {}

		const test = (module, result) =>
		{
			is_external(module, webpack_configuration, settings).should.equal(result)
		}

		test('an-alias', false)
		test('an-alias/module', false)
		test('react-isomorphic-render', true)
		test('react-isomorphic-render/redux', true)
	})

	it(`shouldn't mark exclude_from_externals as external`, function()
	{
		const webpack_configuration =
		{
			resolve:
			{
				alias:
				{
					'an-alias': '/an-alias/path'
				}
			}
		}

		const settings =
		{
			excludeFromExternals:
			[
				'lodash-es',
				/^es6-only(\/.*)?$/
			]
		}

		const test = (module, result) =>
		{
			is_external(module, webpack_configuration, settings).should.equal(result)
		}

		test('an-alias', false)
		test('an-alias/module', false)
		test('lodash-es', false)
		test('lodash-es/module', false)
		test('es6-only', false)
		test('es6-only/module', false)
		test('react-isomorphic-render', true)
		test('react-isomorphic-render/redux', true)
	})

	it(`shouldn't externalise Webpack modules`, function()
	{
		const webpack_configuration = {}
		const settings = {}

		const test = (module, result) =>
		{
			is_external(module, webpack_configuration, settings).should.equal(result)
		}

		test('!!./../../node_modules/css-loader/index.js?importLoaders=2&sourceMap!./../../node_modules/autoprefixer-loader/index.js?browsers=last 2 version!./../../node_modules/sass-loader/index.js?outputStyle=expanded&sourceMap=true&sourceMapContents=true!./style.scss', false)
	})
})
