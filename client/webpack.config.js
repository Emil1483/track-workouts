const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/client.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'lib'),
        publicPath: 'lib'
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    }
};