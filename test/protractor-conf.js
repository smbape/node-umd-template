var _ = require('lodash'),
    __resources = {};

exports.config = {
    allScriptsTimeout: 11000,

    specs: [
        'e2e/**/*-scenario.js'
    ],

    multiCapabilities: [{
        'browserName': 'chrome'
    }, {
        'browserName': 'firefox'
    }],

    baseUrl: 'http://127.0.0.1:3330/',

    framework: 'jasmine',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000,
        isVerbose: true
    },

    onPrepare: function() {
        browser.ignoreSynchronization = true;
        _.extend(global, {
            pathBrowserify: require('../public/node_modules/umd-core/src/path-browserify'),
            depsLoader: require('../public/node_modules/umd-core/src/depsLoader'),
            getResources: getResources,
            updateRessources: updateRessources,
            cleanResources: cleanResources
        });
    }
};

function getResources() {
    return __resources;
}

function updateRessources(resources) {
    if ('function' === typeof resources) {
        resources = resources();
    }

    return _.merge(__resources, resources);
}

function cleanResources() {
    for (var prop in __resources) {
        delete __resources[prop];
    }
}