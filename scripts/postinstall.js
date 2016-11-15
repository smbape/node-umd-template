// jshint node: true
'use strict';

var fs = require('fs'),
    which = require('which'),
    sysPath = require('path'),
    anyspawn = require('anyspawn'),
    request = require('request'),
    mkdirp = require('mkdirp'),
    deepExtend = require('deep-extend'),
    argv = process.argv.slice(2),
    push = Array.prototype.push;

postinstall();

function postinstall() {
    // make sure patch executable exists
    which.sync('patch');

    var geckodriverFile = require.resolve('protractor/node_modules/webdriver-manager/built/lib/binaries/gecko_driver.js');
    var geckodriverPatch = sysPath.resolve(__dirname, '..', 'patches', 'fix_gecko_lte_0.10.0_install.patch');

    var tasks;

    if (argv.indexOf('--preact') === -1) {
        tasks = [
            'bower install',
            // 'bower install angular-mocks angular-loader',
        ];
    } else {
        tasks = [
            updateBowerJSON({
                dependencies: {
                    "preact": undefined,
                    "preact-compat": undefined,
                    "proptypes": undefined,
                }
            }),
            'bower install',
            // 'bower install angular-mocks angular-loader',
            installBowerFile({
                name: 'preact',
                main: 'preact.js',
                version: '6.4.0',
                cdn: 'https://unpkg.com/preact@6.4.0',
                dependencies: {}
            }, sysPath.resolve(__dirname, '..', 'patches', 'preact_6.4.0.patch')),
            installBowerFile({
                name: 'proptypes',
                main: 'proptypes.js',
                version: '0.14.3',
                cdn: 'https://unpkg.com/proptypes@0.14.3',
                dependencies: {}
            }, sysPath.resolve(__dirname, '..', 'patches', 'proptypes_0.14.3.patch')),
            installBowerFile({
                name: 'preact-compat',
                main: 'preact-compat.js',
                version: '3.9.1',
                cdn: 'https://unpkg.com/preact-compat@3.9.1',
                dependencies: {
                    preact: '*',
                    proptypes: '*'
                }
            }, sysPath.resolve(__dirname, '..', 'patches', 'preact-compat_3.9.1.patch')),
            updateBowerJSON({
                dependencies: {
                    "preact": "^6.4.0",
                    "preact-compat": "^3.9.1",
                    "proptypes": "^0.14.3",
                }
            })
        ];
    }

    push.apply(tasks, [
        'patch -N ' + anyspawn.quoteArg(geckodriverFile) + ' < ' + anyspawn.quoteArg(geckodriverPatch),
        changeGeckoDriverVersion,
        'npm run update-webdriver'
    ]);

    anyspawn.spawnSeries(tasks, {
        prompt: anyspawn.defaults.prompt,
        stdio: 'inherit'
    }, function(err) {
        if (err) {
            throw err;
        }
    });
}

function changeGeckoDriverVersion() {
    var next = arguments[arguments.length - 1];
    var configFile = require.resolve('protractor/node_modules/webdriver-manager/built/config.json');
    var config = require(configFile);
    config.webdriverVersions.geckodriver = 'v0.9.0';
    fs.writeFile(configFile, JSON.stringify(config, null, 2), next);
}

function installBowerFile(config, patch) {
    var compenent = config.name,
        url = config.cdn,
        dest = sysPath.resolve(__dirname, '..', 'bower_components', compenent),
        file = sysPath.join(dest, config.main);

    var bowerFile = JSON.stringify(config, null, 2);

    return function() {
        var next = arguments[arguments.length - 1];
        mkdirp(dest, function(err) {
            if (err) {
                return next(err);
            }

            var writer = fs.createWriteStream(file);
            writer.on('error', next);
            writer.on('finish', function() {
                anyspawn.exec('patch -N ' + anyspawn.quoteArg(file) + ' < ' + anyspawn.quoteArg(patch), function(err) {
                    if (err) {
                        return next(err);
                    }
                    fs.writeFile(sysPath.join(dest, 'bower.json'), bowerFile, next);
                });
            });
            request(url).pipe(writer);
        });
    };
}

function updateBowerJSON(config) {
    return function() {
        var next = arguments[arguments.length - 1];
        var bowerFile = sysPath.resolve(__dirname, '..', 'bower.json');
        fs.readFile(bowerFile, function(err, data) {
            if (err) {
                return next(err);
            }

            config = deepExtend(JSON.parse(data.toString()), config);
            orderProperty(config, 'dependencies');
            orderProperty(config, 'overrides');

            fs.writeFile(bowerFile, JSON.stringify(config, null, 2), next);
        });
    };
}

function orderProperty(obj, prop) {
    var current = obj[prop];
    var updated = {};
    Object.keys(current).sort().forEach(function(dep) {
        updated[dep] = current[dep];
    });
    obj[prop] = updated;
}