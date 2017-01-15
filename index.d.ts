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

// Server Runner
export function server(params: Parameters): void;

// Server Configuration
export function server_configuration(webpackConfig: webpack.Configuration, settings: UniversalConfiguration): webpack.Configuration;
export function serverConfiguration(webpackConfig: webpack.Configuration, settings: UniversalConfiguration): webpack.Configuration;


// Client Configuration
export function client_configuration(webpackConfig: webpack.Configuration, settings: UniversalConfiguration): webpack.Configuration;
export function clientConfiguration(webpackConfig: webpack.Configuration, settings: UniversalConfiguration): webpack.Configuration;

// Prepare
export function prepare(settings: UniversalConfiguration, webpackConfig: webpack.Configuration): void;

// Devtools
export function devtools(parameters: Parameters): string;