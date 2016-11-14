var config = require('../protractor-conf').config;

expando.addScenario('Index', function scenario(build, languge) {
    'use strict';

    var url = config.baseUrl + build + '/' + languge + '/home/home/index',
        translate;

    return function() {
        beforeAll(function() {
            browser.driver.get(url);
            expando.waitRender();
            expando.initTranslation(languge, [
                require('../../public/node_modules/umd-core/src/resources'),
                require('../../public/node_modules/umd-core/src/validation/resources'),
                require('../../public/node_modules/configs/resources')
            ], function(err, t) {
                translate = t;
            });
        });

        it('should translated have title', function() {
            browser.executeAsyncScript(function() {
                var callback = arguments[arguments.length - 1];
                callback(window.document.title);
            }).then(function(title) {
                expect(title).toBe(translate('home.home.index.title') + ' - Tutorial');
            });
        });

        it('should have 2 language buttons', function() {
            browser.driver.findElements(by.css('#toolbar .languages button')).then(function(buttons) {
                expect(buttons.length).toBe(2);
                expect(buttons[0].getText()).toBe('English');
                expect(buttons[1].getText()).toBe('Français');
            });
        });

        it('should have 2 translated menu items', function() {
            browser.driver.findElements(by.css('#toolbar .menu a')).then(function(items) {
                expect(items.length).toBe(2);
                expect(items[0].getText()).toBe(translate('home.home.index.title'));
                expect(items[0].getAttribute('href')).toBeUrl([build + '/' + languge + '/home/home/index', config.baseUrl]);
                expect(items[1].getText()).toBe(translate('home.home.step1.title'));
                expect(items[1].getAttribute('href')).toBeUrl([build + '/' + languge + '/home/home/step1', config.baseUrl]);
            });
        });

        it('should have content', function() {
            browser.driver.findElement(by.id('content')).then(function(content) {
                expect(content.getText()).toBe('HOME INDEX ACTION');
            });
        });
    };
});