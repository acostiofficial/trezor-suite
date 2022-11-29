import path from 'path';
import webpack from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';

import routes from '../../suite/src/config/suite/routes';
import { FLAGS } from '@suite-common/suite-config';

import { assetPrefix, isDev } from '../utils/env';
import { getPathForProject } from '../utils/path';

const baseDir = getPathForProject('web');
const config: webpack.Configuration = {
    target: 'browserslist',
    entry: [path.join(baseDir, 'src', 'index.ts')],
    output: {
        path: path.join(baseDir, 'build'),
    },
    module: {
        rules: [
            // note: this rule is copied from @trezor/connect-iframe
            {
                test: /sharedConnectionWorker/i,
                loader: 'worker-loader',
                issuer: /workers\/workers-*/i, // replace import ONLY in /workers\/workers- not @trezor/transport
                options: {
                    worker: 'SharedWorker',
                    filename: './workers/shared-connection-worker.[contenthash].js',
                },
            },
            // note: this rule is copied from @trezor/connect-iframe
            {
                test: /\workers\/blockbook\/index/i,
                loader: 'worker-loader',
                options: {
                    filename: './workers/blockbook-worker.[contenthash].js',
                },
            },
            // note: this rule is copied from @trezor/connect-iframe
            {
                test: /\workers\/ripple\/index/i,
                loader: 'worker-loader',
                options: {
                    filename: './workers/ripple-worker.[contenthash].js',
                },
            },
            // note: this rule is copied from @trezor/connect-iframe
            {
                test: /\workers\/blockfrost\/index/i,
                loader: 'worker-loader',
                options: {
                    filename: './workers/blockfrost-worker.[contenthash].js',
                },
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: ['browser-detection', 'fonts', 'images', 'oauth', 'videos', 'guide/assets']
                .map(dir => ({
                    from: path.join(__dirname, '..', '..', 'suite-data', 'files', dir),
                    to: path.join(baseDir, 'build', 'static', dir),
                }))
                .concat([
                    {
                        from: path.join(__dirname, '..', '..', 'message-system', 'files'),
                        to: path.join(baseDir, 'build', 'static', 'message-system'),
                    },
                ]),
            options: {
                concurrency: 100,
            },
        }),
        // Html files
        ...routes.map(
            route =>
                new HtmlWebpackPlugin({
                    minify: isDev
                        ? false
                        : {
                              collapseWhitespace: true,
                              keepClosingSlash: true,
                              removeComments: true,
                              removeRedundantAttributes: true,
                              removeScriptTypeAttributes: true,
                              removeStyleLinkTypeAttributes: true,
                              useShortDoctype: true,
                              minifyJS: true,
                          },
                    templateParameters: {
                        assetPrefix,
                        isOnionLocation: FLAGS.ONION_LOCATION_META,
                    },
                    inject: 'body' as const,
                    scriptLoading: 'blocking' as const,
                    template: path.join(baseDir, 'src', 'static', 'index.html'),
                    filename: path.join(baseDir, 'build', route.pattern, 'index.html'),
                }),
        ),
        // imports from @trezor/connect in @trezor/suite package need to be replaced by imports from @trezor/connect-web
        new webpack.NormalModuleReplacementPlugin(
            /@trezor\/connect$/,
            '@trezor/connect-web/lib/iframeless',
        ),
        ...(!isDev ? [new CssMinimizerPlugin()] : []),
    ],
};

export default config;
