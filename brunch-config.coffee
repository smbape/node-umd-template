_ = require 'lodash'
{matcher, config} = require 'umd-builder/lib/brunch-config'

browserifyFile = matcher ['**-browserify.js$', 'bower_components/umd-core/lib/**']
ignore = (path)-> config.conventions.vendor(path) || browserifyFile.test path

config.compilers.unshift require('umd-builder/lib/compilers/babel')
config.compilers.push.apply config.compilers, [
    require('umd-builder/lib/compilers/handlebars')
    require('umd-builder/lib/compilers/jst/jst')
    require('umd-builder/lib/compilers/html')
    require('umd-builder/lib/compilers/markdown')
]

# https://github.com/brunch/brunch/blob/1.8.5/docs/config.md
exports.config = _.merge config,

    requirejs:
        # http://requirejs.org/docs/api.html#config-map
        map:
            '*':
                underscore: 'lodash'
                'react-dom': 'bundle-react-0'

    plugins:
        babel:
            pretransform: [
                require('umd-builder/lib/spTransform')
            ]
            ignore: ignore
        jshint: ignore: ignore

    server:
        path: './server/HttpServer'
        host: '127.0.0.1'
        port: 3330

    paths:
        watched: [ 'app', 'vendor', 'bower_components/umd-core' ]
