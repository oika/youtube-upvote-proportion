const path = require('path');

module.exports = {
    mode : 'development',
    
    devtool : 'inline-source-map',

    entry : {
        index : path.resolve(__dirname, 'src/index.ts'),
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
    }
}