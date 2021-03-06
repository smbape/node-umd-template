merge = require 'lodash/merge'
sysPath = require 'path'
{matcher, config} = require 'umd-builder/lib/brunch-config'

coreLibFiles = matcher ['bower_components/umd-core/lib/**']
ignore = (path)-> config.conventions.vendor(path) || coreLibFiles.test path

config.compilers.unshift require('umd-builder/lib/compilers/babel')
config.compilers.push.apply config.compilers, [
    require('umd-builder/lib/compilers/html')
    require('umd-builder/lib/compilers/stylus')
]

npmVendors = [
    "node_modules/auto-reload-brunch/vendor"
]

moduleSources = ["app/node_modules", "bower_components"].concat(npmVendors)
pathCleaner = new RegExp matcher(moduleSources).source + /[/\\](.*)$/.source
npmVendorMatcher = new RegExp matcher(npmVendors).source + /[/\\]/.source
isVendor = config.conventions.vendor

platform = require('os').platform()

# https://github.com/brunch/brunch/blob/2.8.2/docs/config.md
exports.config = merge config,

    # http://requirejs.org/docs/api.html#config-map
    requirejs:
        waitSeconds : 30 # prevent slow networks from breaking the application
        map:
            '*':
                underscore: 'lodash'

        deps: [
            "auto-reload-brunch/vendor/auto-reload"
        ]

    modules:
        pathCleaner: pathCleaner

    paths:
        watched: [ "app" ].concat(npmVendors)

    files:
        javascripts:
            joinTo:
                'javascripts/app.js': new RegExp matcher(['app/node_modules'].concat(npmVendors)).source + /[/\\]/.source

    conventions:
        vendor: (path)->
            return npmVendorMatcher.test(path) or isVendor(path)

    plugins:
        babel:
            pretransform: [
                require('umd-builder/lib/spTransform')
            ]

            ignore: ignore

        amd:
            eslint: true

        eslint:
            config:
                fix: true
                ignore: false # let brunch deal with ignore
                globals: [
                    "define:false"
                ]

            ignore: ignore

            overrides:
                "*.coffee": ({data, path, map})->
                    basename = sysPath.basename(path, sysPath.extname(path))

                    rules: {
                        "no-redeclare": 0
                        "no-use-before-define": 0
                        "no-invalid-this": 0
                        "no-void": 0
                        "no-useless-escape": 0
                        "no-sequences": 0
                        "no-unused-expressions": 0
                        "no-return-assign": 0
                        "no-empty-function": 0
                        "guard-for-in": 0
                        "consistent-return": 0
                        "no-unused-vars": [2, {
                            "vars": "all"
                            "args": "none"
                            "caughtErrors": "none"
                            "varsIgnorePattern": "\\b(?:factory|deps|#{basename})\\b"
                        }]
                    }

        autoReload:
            enabled:
                css: true
                js: true
                assets: true

            port: [ 19408 ]

            delay: if platform is 'win32' then 200 else undefined

    server:
        path: './server/HttpServer'
        hostname: '127.0.0.1'
        port: 3330

    paths:
        watched: [ 'app', 'vendor' ]

    overrides:
        production:
            requirejs:
                deps: []
            plugins:
                autoReload: enabled: false
            paths:
                watched: [ "app" ]