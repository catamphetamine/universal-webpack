// Type Definitions for Universal Webpack 0.2

import * as webpack from 'webpack';

export as namespace UniversalWebpack;

export interface Chunks {
    javascript: {
        [scriptname: string]: string;
    };
    styles: {
        [scriptname: string]: string;
    };
}

export interface Parameters {
    chunks: () => Chunks;
}

export interface UniversalConfiguration {
    server: {
        input: string;
        output: string;
    }
}

export interface ClientConfigurationOptions {
    development?: boolean;
    useMiniCssExtractPlugin?: boolean;
    cssBundle?: boolean;
}

// Server Runner
export function server(webpackConfig: webpack.Configuration, settings: UniversalConfiguration): any;

// Server Configuration
export function serverConfiguration(webpackConfig: webpack.Configuration, settings: UniversalConfiguration): webpack.Configuration;

// Client Configuration
export function clientConfiguration(webpackConfig: webpack.Configuration, settings: UniversalConfiguration, options?: ClientConfigurationOptions): webpack.Configuration;

// Prepare
export function prepare(settings: UniversalConfiguration, webpackConfig: webpack.Configuration): void;

// Devtools
export function devtools(parameters: Parameters): string;
