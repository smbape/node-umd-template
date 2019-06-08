const sysPath = require("path");

module.exports = config => {
    config.set({
        basePath: "../",

        files: [
            "test/unit/test-main.js",
            {
                pattern: "test/unit/**/*-test.js",
                included: false
            },
            {
                pattern: "public/**/*.js",
                included: false
            }
        ],

        autoWatch: true,

        frameworks: ["jasmine", "requirejs"],

        browsers: ["Chrome", "Firefox"],

        client: {
            jasmine: {
                random: false
            }
        },

        plugins: [
            "karma-chrome-launcher",
            "karma-firefox-launcher",
            "karma-jasmine",
            {
                "framework:requirejs": ["factory", (() => {
                    const bootstraps = [
                        sysPath.resolve(__dirname, "../app/assets/vendor/babel/external-helpers.js"),
                        sysPath.resolve(__dirname, "../app/assets/vendor/require.js"),
                        sysPath.join(sysPath.dirname(require.resolve("karma-requirejs")), "adapter.js")
                    ].map(path => {
                        return {
                            pattern: path,
                            included: true,
                            served: true,
                            watched: false
                        };
                    });

                    const initRequireJs = files => {
                        files.unshift(...bootstraps);
                    };

                    initRequireJs.$inject = ["config.files"];

                    return initRequireJs;
                })()]
            }
        ]
    });
};
