const path = require('path');

module.exports = {
    mode : 'development',
    
    devtool : 'inline-source-map',

    entry : {
        index : path.resolve(__dirname, 'src/index.ts'),
        background: path.resolve(__dirname, 'src/background.ts'),
        options: path.resolve(__dirname, 'src/options.ts')
    },

    module : {
        rules : [ {
            test : /\.ts$/,
            use : 'ts-loader'
        } ]
    },

    output : {
        filename : '[name].js',
        path : path.join(__dirname, 'js')
    },

    resolve: {
        extensions: ['.ts'],
        modules: [path.resolve(__dirname, 'src'), 'node_modules']
    }
}