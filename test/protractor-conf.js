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

    onPrepare: onPrepare
};

var _ = require('lodash'),
    i18n = require('i18next'),
    flow,

    i18nOptions = {
        lng: 'en-GB',
        interpolation: {
            prefix: '{{',
            suffix: '}}',
            escapeValue: false,
            unescapeSuffix: 'HTML'
        },
        returnedObjectHandler: function(key, value, options) {
            var choice, i, keys, len, num;
            if (!hasOwn.call(options, 'choice') || 'number' !== typeof options.choice || !hasOwn.call(value, 'choice') || 'object' !== typeof value.choice) {
                return "key '" + this.ns[0] + ":" + key + " (" + this.lng + ")' returned an object instead of string.";
            }
            keys = Object.keys(value.choice);
            choice = keys[0];
            value = options.choice;
            for (i = 0, len = keys.length; i < len; i++) {
                num = keys[i];
                if (value >= num) {
                    choice = num;
                }
            }
            return i18n.t(key + ".choice." + choice, options);
        }
    },

    localeMap = {
        en: 'en-GB',
        fr: 'fr-FR'
    };

function onPrepare() {
    flow = protractor.promise.controlFlow();
    browser.ignoreSynchronization = true;
    _.extend(global, {
        pathBrowserify: require('../public/node_modules/umd-core/src/path-browserify'),
        depsLoader: require('../public/node_modules/umd-core/src/depsLoader'),
        initTranslation: initTranslation,
        addScenario: addScenario,
        waitTimeout: waitTimeout,
        waitRender: waitRender,
        waitRouteChangeSuccess: waitRouteChangeSuccess
    });
}

function updateRessources(resources, __resources) {
    if ('function' === typeof resources) {
        resources = resources(i18nOptions);
    }

    return _.merge(__resources, resources);
}

function initTranslation(lng, resources, done) {
    var __resources = {};

    if (Array.isArray(resources)) {
        for (var i = 0, len = resources.length; i < len; i++) {
            updateRessources(resources[i], __resources);
        }
    }

    var options = _.defaults({
        lng: localeMap[lng] || 'en-GB',
        resources: __resources
    }, i18nOptions);

    i18n.init(options, done);
}

function addScenario(name, fn) {
    var builds = ['web', 'app'],
        languages = ['en', 'fr'],
        leni = builds.length,
        lenj = languages.length,
        build, language, i, j;

    for (i = 0; i < leni; i++) {
        build = builds[i];
        for (j = 0; j < lenj; j++) {
            language = languages[j];
            describe(require('util').inspect({
                name: name,
                build: build,
                language: language
            }, {
                depth: null,
                colors: true
            }), fn(build, language));
        }
    }
}

function waitTimeout(ms) {
    return flow.execute(function() {
        var deferred = protractor.promise.defer();
        setTimeout(deferred.fulfill.bind(deferred), ms);
        return deferred.promise;
    });
}

function waitRender(prevUrl, nextUrl) {
    return browser.executeAsyncScript(_waitRender);
}

function _waitRender() {
    var callback = arguments[arguments.length - 1];
    iterate();

    function iterate() {
        if (!window.rendered) {
            setTimeout(iterate, 100);
            return;
        }

        callback();
    }
}

function waitRouteChangeSuccess(prevUrl, nextUrl) {
    return browser.executeAsyncScript(_waitRouteChangeSuccess, prevUrl, nextUrl);
}

function _waitRouteChangeSuccess(prevUrl, nextUrl) {
    var callback = arguments[arguments.length - 1];

    if (nextUrl) {
        if (window.location.href === nextUrl) {
            callback();
            return;
        }
    }
    if (prevUrl) {
        if (window.location.href !== prevUrl) {
            callback();
            return;
        }
    }

    document.addEventListener('onRouteChangeSuccess', onRender);

    function onRender() {
        document.removeEventListener('onRouteChangeSuccess', onRender);
        callback();
    }
}