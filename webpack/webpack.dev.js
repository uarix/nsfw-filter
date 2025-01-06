const { merge } = require('webpack-merge');  
const common = require('./webpack.common.js');  
const ExtReloader = require('webpack-ext-reloader');  

module.exports = merge(common, {  
    devtool: 'inline-source-map',  
    mode: 'development',  
    watch: true,  
    watchOptions: {  
        ignored: ['node_modules/**']  
    },  
    plugins: [  
        new ExtReloader({  
            port: 9090,   
            reloadPage: true,  
            entries: {   
                background: 'background',  
                popup: 'popup',  
                content: 'content'  
            }  
        })   
    ]  
});