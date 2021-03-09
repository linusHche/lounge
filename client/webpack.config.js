const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

var config = {
    entry: './src/index.js',
    target: 'electron-renderer',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'build'),
    },
    watch: false,
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.join(__dirname, 'index.html'),
        }),
    ],
};

module.exports = (env, argv) => {
    if (argv.mode === 'development') {
        config.watch = true;
    }

    return config;
};
