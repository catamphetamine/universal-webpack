import path from 'path'

export function chunk_info_file_path(webpack_configuration, chunk_info_filename)
{
	return path.join(webpack_configuration.output.path, chunk_info_filename || 'webpack-chunks.json')
}
