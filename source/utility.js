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
export const devtools =
`
	document.addEventListener('DOMContentLoaded', function(event)
	{
		var stylesheets = document.querySelectorAll('head link[rel="stylesheet"]')

		// If style-loader has already added <link/>s 
		// to its dynamic hot-reloadable styles,
		// then remove the <link/> to the static CSS bundle
		// inserted during server side page rendering.
		if (stylesheets.length > 1)
		{
			// Waits a "magical" time amount of 2 seconds
			// for the dynamically added stylesheets
			// to be parsed and applied to the page.
			setTimeout(function()
			{
				stylesheets[0].parentNode.removeChild(stylesheets[0])
			},
			2000)
		}
		else
		{
			console.warn("Couldn't remove server-rendered stylesheet tag because the dynamically added stylesheets haven't yet been added")
		}
	})
`