import fs from 'fs'

// Waits for `build/server.js` to be created 
// after Webpack build process finishes.
//
// The Promise is resolved when `build/server.js` has been found 
// (this is needed for development because `webpack-dev-server` 
//  and your Node.js application server are run in parallel,
//  and are restarted simultaneously).
//
export default function wait_for_file(path)
{
	// waits for condition to be met, then resolves the promise
	return new Promise(resolve =>
	{
		const tick_interval = 300

		// show the message not too often
		let message_timer = 0
		const message_interval = 2000 // in milliseconds

		tick
		(
			() => fs_exists(path),
			tick_interval,
			resolve,
			() =>
			{
				message_timer += tick_interval

				if (message_timer >= message_interval)
				{
					message_timer = 0

					console.log(`("${path}" not found)`)
					console.log('(waiting for Webpack build to finish)')
				}
			}
		)
	})
}

function tick(check_condition, interval, done, not_done_yet)
{
	check_condition().then(function(condition_is_met)
	{
		if (condition_is_met)
		{
			return done()
		}

		not_done_yet()

		setTimeout(() => tick(check_condition, interval, done, not_done_yet), interval)
	})
}

// Checks if a filesystem path exists.
// Returns a promise
export function fs_exists(path)
{
	return new Promise((resolve, reject) => 
	{
		fs.exists(path, exists => resolve(exists))
	})
}
