'use strict';
require('coffee-script').register();
var server = require('../brunch-config').config.server;

exports.config = {
    localSeleniumStandaloneOpts: {

        // add support for Firefox 48+ using gecko driver downloaded by webdriver-manager
        args: (function() {
            // ================================================================
            // From webdriver-manager/built/lib/cmds/start.js
            // ================================================================
            var path = require('path');
            var os = require('os');

            var gecko_driver_1 = require('protractor/node_modules/webdriver-manager/built/lib/binaries/gecko_driver');
            var config_1 = require('protractor/node_modules/webdriver-manager/built/lib/config');
            var files_1 = require('protractor/node_modules/webdriver-manager/built/lib/files');
            var binaries = files_1.FileManager.setupBinaries();
            var outputDir = config_1.Config.getSeleniumDir();
            var osType = os.type();
            return ['-Dwebdriver.gecko.driver=' + path.join(outputDir, binaries[gecko_driver_1.GeckoDriver.id].executableFilename(osType))];
        }())
    },

    allScriptsTimeout: 11000,

    specs: [
        'e2e/**/*-scenario.js'
    ],

    multiCapabilities: [{
        'browserName': 'chrome'
    }, {
        'browserName': 'firefox',
        'marionette': 'true' // tell protractor to use gecko driver for firefox
    }, ],

    baseUrl: 'http://' + server.hostname + ':' + server.port + '/',

    framework: 'jasmine',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000,
        isVerbose: true
    },

    onPrepare: onPrepare
};

// init i18n
// should be similar to front-end i18n
var _ = require('lodash'),
    i18n = require('i18next'),
    hasOwn = Object.prototype.hasOwnProperty,

    i18nOptions = {
        lng: 'en-GB',
        interpolation: {
            prefix: '{{',
            suffix: '}}',
            escapeValue: false,
            unescapeSuffix: 'HTML'
        },
        returnedObjectHandler: function(key, value, options) {
            var choice, i, j, keys, len, num;
            if (!hasOwn.call(options, 'choice') || 'number' !== typeof options.choice || !hasOwn.call(value, 'choice') || 'object' !== typeof value.choice) {
                return "key '" + this.ns[0] + ":" + key + " (" + this.lng + ")' returned an object instead of string.";
            }
            keys = Object.keys(value.choice).sort(intComparator);
            choice = keys[0];
            value = options.choice;
            for (i = j = 0, len = keys.length; j < len; i = ++j) {
                num = keys[i];
                num = parseInt(num, 10);
                if (value >= num) {
                    choice = keys[i];
                }
            }
            return i18n.t(key + ".choice." + choice, options);
        }
    },

    localeMap = {
        en: 'en-GB',
        fr: 'fr-FR'
    },

    flow;

// https://jasmine.github.io/2.0/custom_matcher.html
var customMatchers = {
    // in Firefox 49.0.2, using Gecko Driver 0.9, getAttribute('href') returns the attributes as it is setted ex: /web/fr/...
    // in Chrome 54, using Chrome Driver 2.25, getAttribute('href') returns a.href ex: http://127.0.0.1:3330/web/fr/...
    // toBeUrl returns true if href === '/' + url or base + url
    toBeUrl: function(util, customEqualityTesters) {
        return {
            compare: function(actual, expected) {
                if (expected === undefined) {
                    expected = [];
                } else if (!Array.isArray(expected)) {
                    expected = [expected];
                }

                var url = expected[0],
                    base = expected[1];

                var message,
                    pass;

                pass = util.equals(actual, '/' + url, customEqualityTesters);
                if (!pass && base !== '/') {
                    pass = util.equals(actual, base + url, customEqualityTesters);
                }

                if (pass) {
                    message = "Expected " + actual + " not to equal url " + url;
                } else {
                    message = "Expected " + actual + " to equal url " + url;
                }

                return {
                    pass: pass,
                    message: message
                };
            }
        };
    }
};

function onPrepare() {
    flow = protractor.promise.controlFlow();
    browser.ignoreSynchronization = true;

    // expose needed globals
    _.extend(global, {
        pathBrowserify: require('../public/node_modules/umd-core/src/path-browserify'),
        depsLoader: require('../public/node_modules/umd-core/src/depsLoader'),
        initTranslation: initTranslation,
        addScenario: addScenario,
        waitTimeout: waitTimeout,
        waitRender: waitRender,
        waitRouteChangeSuccess: waitRouteChangeSuccess,
        setInputValue: setInputValue
    });
}

function updateRessources(resources, __resources) {
    if ('function' === typeof resources) {
        resources = resources(i18nOptions);
    }

    return _.merge(__resources, resources);
}

/**
 * Initialize an i18n translation instance
 * @param  {String}   lng       Language to translate a key of localeMap. ex: 'en'
 * @param  {Array}    resources Array of resources to use for translation
 * @param  {Function} done      called on initilization with (err, t)
 */
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
        build, language, i, j, specName;

    for (i = 0; i < leni; i++) {
        build = builds[i];
        for (j = 0; j < lenj; j++) {
            language = languages[j];
            specName = require('util').inspect({
                name: name,
                build: build,
                language: language
            }, {
                depth: null,
                colors: true
            });
            describe(specName, spec(fn, build, language));
        }
    }

    function spec(fn, build, language) {
        var scenario = fn(build, language);

        return function() {
            beforeEach(function() {
                jasmine.addMatchers(customMatchers);
            });

            scenario.apply(this, arguments);
        };
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

/**
 * SendKeys intermittently inserts incorrect text on IE only
 * https://github.com/seleniumhq/selenium-google-code-issue-archive/issues/3699
 * @param  {Element} input Input element
 * @param  {Stirng}  value text to send
 * @return {Promise}
 */
function setInputValue(input, value) {
    return new Promise(function(resolve, reject) {
        input.clear();
        input.sendKeys(value).then(function() {
            return input.getAttribute('value');
        }).then(function(res) {
            if (res !== value) {
                return setInputValue(input, value).then(resolve);
            }
            resolve(value);
        });
    });
}

function intComparator(a, b) {
    a = parseInt(a, 10);
    b = parseInt(b, 10);
    return a > b ? 1 : a < b ? -1 : 0;
}