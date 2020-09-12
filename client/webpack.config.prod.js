const path = require('path');
const CleanPlugin = require('clean-webpack-plugin')

module.exports = {
    mode: 'production',
    entry: './src/client.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                include: [path.resolve(__dirname, 'src')],
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    devtool: 'none',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'lib'),
    },
    plugins: [
        new CleanPlugin.CleanWebpackPlugin()
    ]
};