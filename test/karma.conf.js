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
            'karma-requirejs'
        ],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};