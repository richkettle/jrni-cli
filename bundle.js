const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');

const logger = require('./logger');

bundle = (configuration, cb) => {
    const projectRootPath = configuration.rootPath;

    const config = {
        context: process.cwd(),
        entry: {
            panel: [
                path.resolve(projectRootPath, 'entry.js')
            ]
        },
        optimization:{
            minimize: false
        },
        target: 'web',
        mode: configuration.isDev() ? 'development' : 'production',
        output: {
            filename: '[name].js',
            path: path.resolve(projectRootPath, 'build'),
            publicPath: './'
        },
        stats: 'verbose',
        performance: {
            hints: false
        },
        externals: {
            'bookingbug-configurator-js': 'bbConfig',
            'bookingbug-core-js': 'bbCore'
        },       
        plugins: [
            new CleanWebpackPlugin(['build/**/*'], {
                root: projectRootPath,
                verbose: true,
                exclude: [],
                watch: false
            }),
            new WebpackBar(),
            new MiniCssExtractPlugin({
                filename: 'panel.css',
            }),
        ],
        module: {
            rules: [
                {
                    test: /^(?!.*\.spec\.js$).*\.js$/,
                    use: [
                        {
                            loader: path.resolve(__dirname, 'node_modules', 'ng-annotate-loader')
                        },
                        {
                            loader: path.resolve(__dirname, 'node_modules', 'babel-loader'),
                            options: {
                                presets: [
                                    [path.resolve(__dirname, 'node_modules', 'babel-preset-env'), {
                                        loose: true
                                    }]
                                ],
                                plugins: [
                                    path.resolve(__dirname, 'node_modules', 'babel-plugin-transform-object-rest-spread'),
                                    path.resolve(__dirname, 'node_modules', 'babel-plugin-transform-decorators-legacy'),
                                    path.resolve(__dirname, 'node_modules', 'babel-plugin-transform-async-to-generator'),
                                    path.resolve(__dirname, 'node_modules', 'babel-plugin-transform-optional-catch-binding')
                                ]
                            }
                        },
                        {
                            loader: path.resolve(__dirname, 'node_modules', 'import-glob-loader')
                        }
                    ]
                },
                {
                    test: /\.scss$/,
                    use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
                },
                {
                    test: /.*\.html$/,
                    use: path.resolve(__dirname, 'node_modules', `ng-cache-loader?prefix=${configuration.manifest.unique_name}&exportId`)
                },
                {
                    test: /\.(jpe?g|png|gif|ico)$/i,
                    use: path.resolve(__dirname, 'node_modules', 'url-loader?name=images/[name].[ext]')
                },
                {
                    test: /.*fontawesome.*\.svg$/,
                    use: path.resolve(__dirname, 'node_modules', 'url-loader?name=fonts/[name].[ext]')
                },
                {
                    test: /\.font\.(?=svg$)/,
                    use: path.resolve(__dirname, 'node_modules', 'url-loader?name=fonts/[name].[ext]')
                },
                {
                    test: /\.svg$/,
                    exclude: /\.font\.(?=svg$)/,
                    use: path.resolve(__dirname, 'node_modules', 'url-loader?name=images/[name].[ext]')
                },
                {
                    test: /\.(woff2?|ttf|otf|eot)$/,
                    use: path.resolve(__dirname, 'node_modules', 'url-loader?name=fonts/[name].[ext]')
                }
            ]
        }
    };

    webpack(config, (err, stats) => {
        if (err) cb(err);
        logger.info(`webpack ${stats.toString()}`);
        cb();
    });
}

module.exports = bundle;
