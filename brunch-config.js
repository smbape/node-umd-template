const merge = require("lodash/merge");
const {basename, extname} = require("path");
const {matcher, config} = require("umd-builder/lib/brunch-config");

const coreLibFiles = matcher(["bower_components/umd-core/lib/**"]);
const ignore = (path) => config.conventions.vendor(path) || coreLibFiles.test(path);

config.compilers.unshift(require("umd-builder/lib/compilers/babel"));
config.compilers.push(...[
    require("umd-builder/lib/compilers/html"),
    require("umd-builder/lib/compilers/stylus")
]);

const npmVendors = [
    "node_modules/auto-reload-brunch/vendor"
];

const moduleSources = ["app/node_modules", "bower_components"].concat(npmVendors);
const pathCleaner = new RegExp(matcher(moduleSources).source + /[/\\](.*)$/.source);
const npmVendorMatcher = new RegExp(matcher(npmVendors).source + /[/\\]/.source);
const isVendor = config.conventions.vendor;

const platform = require("os").platform();

const es6rules = {
    "arrow-parens": 0,
    "arrow-spacing": 0,
    "no-class-assign": 0,
    "no-confusing-arrow": 0,
    "no-const-assign": 0,
    "no-dupe-class-members": 0,
    "no-duplicate-imports": 0,
    "no-new-symbol": 0,
    "no-useless-computed-key": 0,
    "no-useless-constructor": 0,
    "no-useless-rename": 0,
    "no-var": 0,
    "object-shorthand": 0,
    "prefer-arrow-callback": 0,
    "prefer-const": 0,
    "prefer-numeric-literals": 0,
    "prefer-spread": 0,
    "prefer-template": 0,
    "require-yield": 0,
    "rest-spread-spacing": 0,
    "sort-imports": 0,
    "symbol-description": 0,
    "template-curly-spacing": 0,
    "yield-star-spacing": 0
};

// https://github.com/brunch/brunch/blob/2.8.2/docs/config.md
exports.config = merge(config, {

    // http://requirejs.org/docs/api.html#config-map
    requirejs: {
        waitSeconds: 30, // prevent slow networks from breaking the application
        map: {
            "*": {
                underscore: "lodash"
            }
        },

        deps: [
            "auto-reload-brunch/vendor/auto-reload"
        ]
    },

    modules: {
        pathCleaner
    },

    paths: {
        watched: ["app"].concat(npmVendors)
    },

    files: {
        javascripts: {
            joinTo: {
                "javascripts/app.js": new RegExp(matcher(["app/node_modules"].concat(npmVendors)).source + /[/\\]/.source)
            }
        }
    },

    conventions: {
        vendor: (path) => {
            return npmVendorMatcher.test(path) || isVendor(path);
        }
    },

    plugins: {
        babel: {
            ignore: ignore
        },

        amd: {
            eslint: true
        },

        eslint: {
            config: {
                fix: true,
                ignore: false, // let brunch deal with ignore
                globals: [
                    "define:false"
                ]
            },

            ignore: ignore,

            overrides: {
                "*.coffee": ({data, path, map}) => {
                    const name = basename(path, extname(path));

                    return {
                        rules:  Object.assign({
                            "no-redeclare": 0,
                            "no-use-before-define": 0,
                            "no-invalid-this": 0,
                            "no-void": 0,
                            "no-useless-escape": 0,
                            "no-sequences": 0,
                            "no-unused-expressions": 0,
                            "no-return-assign": 0,
                            "no-empty-function": 0,
                            "guard-for-in": 0,
                            "consistent-return": 0,
                            "no-unused-vars": [2, {
                                vars: "all",
                                args: "none",
                                caughtErrors: "none",
                                varsIgnorePattern: `\\b(?:factory|deps|${name})\\b`
                            }]
                        }, es6rules)
                    };
                },

                "*": ({data, path, map}) => {
                    const name = basename(path, extname(path));

                    return {
                        rules: Object.assign({
                            "no-invalid-this": 0,
                            "no-unused-expressions": 0,
                            "no-shadow": [2, {
                                "allow": [
                                    "require",
                                    "promise",
                                    "done",
                                    "err",
                                    "next",
                                    name
                                ]
                            }],
                            "no-unused-vars": [2, {
                                vars: "all",
                                args: "none",
                                caughtErrors: "none",
                                varsIgnorePattern: `\\b(?:factory|deps|${name})\\b`
                            }]
                        }, es6rules)
                    };
                }
            }
        },

        html: {
            type: "common"
        },

        autoReload: {
            enabled: {
                css: true,
                js: true,
                assets: true
            },

            port: [19408],

            delay: platform === "win32" ? 200 : undefined
        }
    },

    server: {
        path: "./server/HttpServer",
        hostname: "127.0.0.1",
        port: 3330
    },

    overrides: {
        production: {
            requirejs: {
                deps: []
            },
            plugins: {
                autoReload: {
                    enabled: false
                }
            },
            paths: {
                watched: ["app"]
            }
        }
    }
});
