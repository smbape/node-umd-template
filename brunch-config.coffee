_ = require 'lodash'
{matcher, config} = require 'umd-builder/lib/brunch-config'

browserifyFile = matcher ['**-browserify.js$', 'bower_components/umd-core/lib/**']
ignore = (path)-> config.conventions.vendor(path) || browserifyFile.test path

config.compilers.unshift require('umd-builder/lib/compilers/babel')
config.compilers.push.apply config.compilers, [
    require('umd-builder/lib/compilers/html')
    require('umd-builder/lib/compilers/stylus')
]

# https://github.com/brunch/brunch/blob/2.8.2/docs/config.md
exports.config = _.merge config,

    requirejs:
        # http://requirejs.org/docs/api.html#config-map
        map:
            '*':
                underscore: 'lodash'
                react: 'preact-compat'
                'react-dom': 'preact-compat'

    plugins:
        babel:
            pretransform: [
                require('umd-builder/lib/spTransform')
            ]
            ignore: ignore
        jshint: ignore: ignore

    server:
        path: './server/HttpServer'
        hostname: '127.0.0.1'
        port: 3330

    paths:
        watched: [ 'app', 'vendor' ]
