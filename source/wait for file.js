import fs from 'fs'

// Waits for a file to be created 
// (e.g. after Webpack build process finishes).
//
// The Promise is resolved when the file has been found 
// (for example, this is needed for development because
//  `webpack-dev-server` and Node.js application server
//  are run in parallel).
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
			async () =>
			{
				// Check if the file exists in the filesystem
				const exists = await fs_exists(path)

				if (!exists)
				{
					return false
				}

				// Check if the file contents have been written to disk
				// https://github.com/catamphetamine/universal-webpack/issues/24
				const contents = fs.readFileSync(path, 'utf8')

				// Check if the file contents is empty
				if (!contents)
				{
					return false
				}

				return true
			},
			tick_interval,
			resolve,
			() =>
			{
				message_timer += tick_interval

				if (message_timer >= message_interval)
				{
					message_timer = 0

					console.log(`("${path}" not found)`)
					console.log('(waiting for the file to be generated; e.g. as a result of a Webpack build)')
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
