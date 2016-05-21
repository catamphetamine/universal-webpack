import path from 'path'

export function chunk_info_file_path(webpack_configuration)
{
	return path.join(webpack_configuration.output.path, 'webpack-chunks.json')
}