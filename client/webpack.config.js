const path = require('path');

module.exports = {
    entry: './src/client.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                include: [path.resolve(__dirname, 'src')],
                use: 'ts-loader',
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    devtool: 'eval-source-map',
    output: {
        publicPath: 'lib',
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'lib'),
    },
    devServer: {
        hot: true,
        contentBase: path.join(__dirname, '/'),
        watchContentBase: true,
        before(app, server, compiler) {
            const watchFiles = ['.html', '.hbs'];

            compiler.plugin('done', () => {
                const changedFiles = Object.keys(compiler.watchFileSystem.watcher.mtimes);

                if (
                    this.hot &&
                    changedFiles.some(filePath => watchFiles.includes(path.parse(filePath).ext))
                ) {
                    server.sockWrite(server.sockets, 'content-changed');
                }
            });
        }
    }
};