
require("coffeescript").register();
const server = require("../brunch-config").config.server;
const SET_INTPUT_HIDDEN_ATTEMPTS_KEY = Math.random().toString(36).slice(2);

exports.config = {
    localSeleniumStandaloneOpts: {
        // stdio: "inherit",

        // add support for Firefox 48+ using gecko driver downloaded by webdriver-manager
        jvmArgs: (() => {
            // ================================================================
            // From webdriver-manager/built/lib/cmds/start.js
            // From webdriver-manager/built/lib/cmds/update.js
            // ================================================================
            const fs = require("fs");
            const path = require("path");
            const semver = require("semver");

            const builtConfig = require("protractor/node_modules/webdriver-manager/built/lib/config");
            const buitFiles = require("protractor/node_modules/webdriver-manager/built/lib/files");
            const binaries = buitFiles.FileManager.setupBinaries();
            const outputDir = builtConfig.Config.getSeleniumDir();

            const builtBinaries = require("protractor/node_modules/webdriver-manager/built/lib/binaries");
            const binary = binaries[builtBinaries.GeckoDriver.id];

            const json = JSON.parse(fs.readFileSync(path.join(outputDir, "gecko-response.json")).toString());
            const versionsLookup = json.map((item, index) => {
                return {
                    version: item.tag_name,
                    index,
                    assets: item.assets
                };
            });

            let latest = "";
            const oshelper = binary.configSource.oshelper();
            versionsLookup.forEach(item => {
                const version = item.version.replace("v", "");
                const assetsArray = item.assets;

                for (const asset of assetsArray) {
                    if (asset.name.includes(oshelper) && (latest === "" || semver.lt(latest, version))) {
                        latest = version;
                    }
                }
            });
            binary.versionCustom = `v${ latest }`;

            const executable = path.resolve(outputDir, binary.executableFilename());
            return [`-Dwebdriver.gecko.driver=${ executable }`];
        })()
    },

    allScriptsTimeout: 11000,

    specs: [
        "e2e/**/*-scenario.js"
    ],

    multiCapabilities: [{
        browserName: "chrome"
    }, {
        browserName: "firefox",
        marionette: "true" // tell protractor to use gecko driver for firefox
    }, ],

    baseUrl: `http://${ server.hostname }:${ server.port }/`,

    framework: "jasmine",

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000,
        isVerbose: true
    },

    onPrepare,
};

// init i18n
// should be similar to front-end i18n
const defaults = require("lodash/defaults");
const merge = require("lodash/merge");
const i18n = require("i18next");
const {hasOwnProperty: hasProp} = Object.prototype;

const i18nOptions = {
    lng: "en-GB",
    interpolation: {
        prefix: "{{",
        suffix: "}}",
        escapeValue: false,
        unescapeSuffix: "HTML"
    },
    returnedObjectHandler(key, value, options) {
        if (!hasProp.call(options, "choice") || "number" !== typeof options.choice || !hasProp.call(value, "choice") || "object" !== typeof value.choice) {
            return `key '${ this.ns[0] }:${ key } (${ this.lng })' returned an object instead of string.`;
        }
        const keys = Object.keys(value.choice).sort(intComparator);
        let choice = keys[0];

        value = options.choice;
        for (let i = 0, len = keys.length; i < len; i++) {
            const num = parseInt(keys[i], 10);
            if (value >= num) {
                choice = keys[i];
            }
        }
        return i18n.t(`${ key }.choice.${ choice }`, options);
    }
};

const localeMap = {
    en: "en-GB",
    fr: "fr-FR"
};

let flow;

// https://jasmine.github.io/2.0/custom_matcher.html
const customMatchers = {
    // in Firefox 49.0.2, using Gecko Driver 0.9, getAttribute('href') returns the attributes as it is setted ex: /web/fr/...
    // in Chrome 54, using Chrome Driver 2.25, getAttribute('href') returns a.href ex: http://127.0.0.1:3330/web/fr/...
    // toBeUrl returns true if href === '/' + url or base + url
    toBeUrl(util, customEqualityTesters) {
        return {
            compare(actual, expected) {
                if (expected === undefined) {
                    expected = [];
                } else if (!Array.isArray(expected)) {
                    expected = [expected];
                }

                const url = expected[0];
                const base = expected[1];

                let message, pass;

                pass = util.equals(actual, `/${ url }`, customEqualityTesters);
                if (!pass && base !== "/") {
                    pass = util.equals(actual, base + url, customEqualityTesters);
                }

                if (pass) {
                    message = `Expected ${ actual } not to equal url ${ url }`;
                } else {
                    message = `Expected ${ actual } to equal url ${ url }`;
                }

                return {
                    pass,
                    message
                };
            }
        };
    }
};

function onPrepare() {
    flow = protractor.promise.controlFlow();
    browser.ignoreSynchronization = true;

    // expose needed globals
    Object.assign(global, {
        expando: {
            initTranslation,
            addScenario,
            waitTimeout,
            waitRender,
            waitRouteChangeSuccess,
            setInputValue,
            getValue
        }
    });
}

function updateRessources(resources, __resources) {
    if ("function" === typeof resources) {
        resources = resources(i18nOptions);
    }

    return merge(__resources, resources);
}

/**
 * Initialize an i18n translation instance
 * @param  {String}   lng       Language to translate a key of localeMap. ex: 'en'
 * @param  {Array}    resources Array of resources to use for translation
 * @param  {Function} done      called on initilization with (err, t)
 */
function initTranslation(lng, resources, done) {
    const __resources = {};

    if (Array.isArray(resources)) {
        for (let i = 0, len = resources.length; i < len; i++) {
            updateRessources(resources[i], __resources);
        }
    }

    const options = defaults({
        lng: localeMap[lng] || "en-GB",
        resources: __resources
    }, i18nOptions);

    i18n.init(options, done);
}

function addScenario(name, fn) {
    const builds = ["web", "app"];
    const languages = ["en", "fr"];
    const leni = builds.length;
    const lenj = languages.length;
    let build, language, i, j, specName;

    for (i = 0; i < leni; i++) {
        build = builds[i];
        for (j = 0; j < lenj; j++) {
            language = languages[j];
            specName = require("util").inspect({
                name,
                build,
                language
            }, {
                depth: null,
                colors: true
            });
            describe(specName, spec(fn, build, language));
        }
    }

    function spec(fn, build, language) {
        const scenario = fn(build, language);

        return function() {
            beforeEach(() => {
                jasmine.addMatchers(customMatchers);
            });

            scenario.apply(this, arguments);
        };
    }
}

function waitTimeout(ms) {
    const deferred = protractor.promise.defer();
    const promise = deferred.promise;
    flow.execute(() => {
        setTimeout(deferred.fulfill.bind(deferred), ms);
        return promise;
    });
    return function() {
        return promise;
    };
}

function waitRender(prevUrl, nextUrl) {
    return browser.executeAsyncScript(_waitRender);
}

function _waitRender() {
    const callback = arguments[arguments.length - 1];
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
    const callback = arguments[arguments.length - 1];

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

    document.addEventListener("onRouteChangeSuccess", onRender);

    function onRender() {
        document.removeEventListener("onRouteChangeSuccess", onRender);
        callback();
    }
}

function getValue(elem) {
    return new Promise((resolve, reject) => {
        browser.executeAsyncScript(function(elem) {
            // jQuery.fn.val
            const callback = arguments[arguments.length - 1];
            let ret = elem.value;
            if ("string" === typeof ret) {
                ret = ret.replace(/\r/g, "");
            } else if (ret == null) {
                ret = "";
            }

            callback(ret);
        }, elem).then(value => {
            resolve(value);
        });
    });
}

/**
 * SendKeys sometimes inserts incorrect text on IE only
 * https://github.com/seleniumhq/selenium-google-code-issue-archive/issues/3699
 * @param  {Element} input Input element
 * @param  {Stirng}  value text to send
 * @return {Promise}
 */
function setInputValue(input, value) {
    const attempts = input[SET_INTPUT_HIDDEN_ATTEMPTS_KEY];

    if (attempts === 3) {
        return Promise.reject(new Error(`Failed to setInputValue ${ value }`));
    }

    if (attempts === undefined) {
        Object.defineProperty(input, SET_INTPUT_HIDDEN_ATTEMPTS_KEY, {
            configurable: true,
            writable: true,
            enumerable: false,
            value: 0
        });
    }

    ++input[SET_INTPUT_HIDDEN_ATTEMPTS_KEY];

    return new Promise((resolve, reject) => {
        input.clear();
        input.sendKeys(value).then(waitTimeout(1)).then(() => {
            return getValue(input);
        }).then(res => {
            if (res !== value) {
                return setInputValue(input, value).then(resolve);
            }

            input[SET_INTPUT_HIDDEN_ATTEMPTS_KEY] = 0;
            resolve(value);
        });
    });
}

function intComparator(a, b) {
    a = parseInt(a, 10);
    b = parseInt(b, 10);
    return a > b ? 1 : a < b ? -1 : 0;
}
