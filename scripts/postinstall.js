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
            installBowerFile({
                name: 'preact',
                main: 'preact.js',
                version: '8.1.0',
                cdn: 'https://unpkg.com/preact@8.1.0',
                dependencies: {}
            }, sysPath.resolve(__dirname, '..', 'patches', 'preact_8.1.0.patch')),
            installBowerFile({
                name: 'proptypes',
                main: 'proptypes.js',
                version: '1.1.0',
                cdn: 'https://unpkg.com/proptypes@1.1.0',
                dependencies: {}
            }, sysPath.resolve(__dirname, '..', 'patches', 'proptypes_1.1.0.patch')),
            installBowerFile({
                name: 'preact-compat',
                main: 'preact-compat.js',
                version: '3.16.0',
                cdn: 'https://unpkg.com/preact-compat@3.16.0',
                dependencies: {
                    preact: '*',
                    proptypes: '*'
                }
            }, sysPath.resolve(__dirname, '..', 'patches', 'preact-compat_3.16.0.patch')),
            updateBowerJSON({
                dependencies: {
                    "preact": "^8.1.0",
                    "preact-compat": "^3.16.0",
                    "proptypes": "^1.1.0",
                }
            })
        ];
    }

    push.apply(tasks, [
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
                if (!patch) {
                    fs.writeFile(sysPath.join(dest, 'bower.json'), bowerFile, next);
                    return;
                }
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