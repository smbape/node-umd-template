// jshint node: true
'use strict';

var fs = require('fs'),
    which = require('which'),
    sysPath = require('path'),
    anyspawn = require('anyspawn');

// make sure patch executable exists
which.sync('patch');

var geckodriverFile = require.resolve('protractor/node_modules/webdriver-manager/built/lib/binaries/gecko_driver.js');
var geckodriverPatch = sysPath.resolve(__dirname, '..', 'patches', 'fix_gecko_lte_0.10.0_install.patch');

anyspawn.spawnSeries([
    'bower install',
    // 'bower install angular-mocks angular-loader',
    'patch -N ' + anyspawn.quoteArg(geckodriverFile) + ' < ' + anyspawn.quoteArg(geckodriverPatch),
    changeGeckoDriverVersion,
    'npm run update-webdriver'
], {
    // prompt: anyspawn.defaults.prompt,
    stdio: 'inherit'
}, function(err) {
    if (err) {
        throw err;
    }
});

function changeGeckoDriverVersion() {
    var next = arguments[arguments.length - 1];
    var configFile = require.resolve('protractor/node_modules/webdriver-manager/built/config.json');
    var config = require(configFile);
    config.webdriverVersions.geckodriver = 'v0.9.0';
    fs.writeFile(configFile, JSON.stringify(config, null, 2), next);
}