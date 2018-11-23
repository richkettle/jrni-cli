const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Configuration = require('./configuration');
const path = require('path');

bundle = (cb) => {
    const projectRootPath = process.cwd();
    const configuration = new Configuration(projectRootPath);
    process.chdir(__dirname);

    const config = {
        context: process.cwd(),
        entry: {
            panel: [
                path.resolve(projectRootPath, 'entry.js')
            ]
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
                            loader: 'ng-annotate-loader'
                        },
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    [path.join(process.cwd(), 'node_modules/babel-preset-env'), {
                                        loose: true
                                    }]
                                ],
                                plugins: [
                                    path.join(process.cwd(), 'node_modules/babel-plugin-transform-object-rest-spread'),
                                    path.join(process.cwd(), 'node_modules/babel-plugin-transform-decorators-legacy'),
                                    path.join(process.cwd(), 'node_modules/babel-plugin-transform-async-to-generator'),
                                    path.join(process.cwd(), 'node_modules/babel-plugin-transform-optional-catch-binding')
                                ]
                            }
                        },
                        {
                            loader: 'import-glob-loader'
                        }
                    ]
                },
                {
                    test: /\.scss$/,
                    use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
                },
                {
                    test: /.*\.html$/,
                    use: `ng-cache-loader?prefix=${configuration.manifest.unique_name}&exportId`
                },
                {
                    test: /\.(jpe?g|png|gif|ico)$/i,
                    use: 'url-loader?name=images/[name].[ext]'
                },
                {
                    test: /.*fontawesome.*\.svg$/,
                    use: 'url-loader?name=fonts/[name].[ext]'
                },
                {
                    test: /\.font\.(?=svg$)/,
                    use: 'url-loader?name=fonts/[name].[ext]'
                },
                {
                    test: /\.svg$/,
                    exclude: /\.font\.(?=svg$)/,
                    use: 'url-loader?name=images/[name].[ext]'
                },
                {
                    test: /\.(woff2?|ttf|otf|eot)$/,
                    use: 'url-loader?name=fonts/[name].[ext]'
                }
            ]
        }
    };

    webpack(config, (err, stats) => {
        if (err) cb(err);
        console.log('webpack', stats.toString());
        process.chdir(projectRootPath);
        cb();
    });
}

module.exports = bundle;
