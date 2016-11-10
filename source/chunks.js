import path from 'path'

export function chunk_info_file_path(webpack_configuration, chunkFilename)
{
	return path.join(webpack_configuration.output.path, chunkFilename || 'webpack-chunks.json')
}
