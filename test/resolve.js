import { is_external } from '../source/server configuration'

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
			exclude_from_externals:
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
})
