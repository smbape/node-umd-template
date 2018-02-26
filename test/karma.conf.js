const sysPath = require('path');

module.exports = function(config) {
    config.set({

        basePath: '../',

        files: [
            'test/unit/test-main.js', {
                pattern: 'test/unit/**/*-test.js',
                included: false
            }, {
                pattern: 'public/**/*.js',
                included: false
            }
        ],

        autoWatch: true,

        frameworks: ['jasmine', 'requirejs'],

        browsers: ['Chrome', 'Firefox'],

        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            {
                'framework:requirejs': ['factory', (() => {
                    function createPattern(path) {
                        return {
                            pattern: path,
                            included: true,
                            served: true,
                            watched: false
                        };
                    }

                    const requirejs = sysPath.resolve(__dirname, '../app/assets/vendor/require.js');
                    const adapter = sysPath.join(sysPath.dirname(require.resolve('karma-requirejs')), 'adapter.js');

                    function initRequireJs(files) {
                        files.unshift(createPattern(adapter));
                        files.unshift(createPattern(requirejs));
                    }

                    initRequireJs.$inject = ['config.files'];

                    return initRequireJs;
                })()]
            }
        ]
    });
};