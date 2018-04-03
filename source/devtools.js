// This is for `extract-text-webpack-plugin` only.
//
// The following code is an advanced topic
// and can be skipped safely.
// This code is not required
// for the whole thing to work.
// It's gonna work fine without this code.
//
// (in development mode)
//
// Removing the now unnecessary `<link rel="stylesheet"/>` tag,
// because the client-side javascript has already kicked-in
// and added all the styles using `style-loader` dynamically.
//
// Should that stylesheet be removed at all?
// Not necessarily.
// It's just, for example, if a developer opens the page,
// then decides to remove some CSS class,
// and switches back to the browser,
// and the CSS class is still there,
// because it was only removed from dynamically added CSS styles,
// not the statically added ones on the server-side.
//
export default function devtools(parameters)
{
	const chunks = parameters.chunks()

	const style_url        = chunks.styles[parameters.entry]
	const common_style_url = chunks.styles.common

	const get_style_link_element_script = url => `document.querySelector('head > link[rel="stylesheet"][href="${url}"]')`

	const script =
	`
		document.addEventListener('DOMContentLoaded', function(event)
		{
			// The style-loader has already added <link/>s
			// to its dynamic hot-reloadable styles,
			// so remove the <link/> to the static CSS bundle
			// inserted during server side page rendering.

			var stylesheet
			var common_stylesheet

			${style_url        ? 'stylesheet        = ' + get_style_link_element_script(style_url) : ''}
			${common_style_url ? 'common_stylesheet = ' + get_style_link_element_script(common_style_url) : ''}

			// Waits a "magical" time amount of one second
			// for the dynamically added stylesheets
			// to be parsed and applied to the page.
			setTimeout(function()
			{
				stylesheet        && stylesheet.parentNode.removeChild(stylesheet)
				common_stylesheet && common_stylesheet.parentNode.removeChild(common_stylesheet)
			},
			1000)
		})
	`

	return script
}

// Smoke screen is for `mini-css-extract-plugin`.
// Because prepending `style-loader` trick doesn't work for it.

const fade_duration = 150

export const smokeScreen = `
	<div
		id="universal-webpack-smoke-screen"
		style="
			position: fixed;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			z-index: 2147483647;
			background: white;
			opacity: 1;
			transition: opacity ${fade_duration}ms ease-out
		">
	</div>
`

export const hideSmokeScreen = `
	document.addEventListener('DOMContentLoaded', function(event)
	{
		// The style-loader has already added <link/>s
		// to its dynamic hot-reloadable styles,
		// so remove the white screen.
		document.getElementById('universal-webpack-smoke-screen').style.opacity = 0
		setTimeout(() => document.body.removeChild(document.getElementById('universal-webpack-smoke-screen')), ${fade_duration})
	})
`

export const hideSmokeScreenAfter = (delay = 0) => `
	document.addEventListener('DOMContentLoaded', function(event)
	{
		setTimeout(function()
		{
			// The style-loader has already added <link/>s
			// to its dynamic hot-reloadable styles,
			// so remove the white screen.

			document.getElementById('universal-webpack-smoke-screen').style.opacity = 0

			setTimeout(function() {
				document.body.removeChild(document.getElementById('universal-webpack-smoke-screen'))
			},
			${fade_duration})
		},
		${delay})
	})
`