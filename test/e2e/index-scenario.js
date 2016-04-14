var waitRender = require('./waitRender'),
    waitTimeout = require('./waitTimeout'),
    config = require('../protractor-conf').config,
    resources = getResources(),
    resourceMap = {
        en: 'en-GB',
        fr: 'fr-FR'
    };

cleanResources();
updateRessources(require('../../public/node_modules/umd-core/src/resources'));
updateRessources(require('../../public/node_modules/umd-core/src/validation/resources'));
updateRessources(require('../../public/node_modules/configs/resources'));

describe('Index', function() {
    var builds = ['web', 'app'],
        languages = ['en', 'fr'],
        leni = builds.length,
        lenj = languages.length,
        build, language, i, j;

    for (i = 0; i < leni; i++) {
        build = builds[i];
        for (j = 0; j < lenj; j++) {
            language = languages[j];
            describe('index/' + build + '/' + language, scenario(build, language));
        }
    }
});

function scenario(build, languge) {
    var url = build + '/' + languge + '/home/home/index',
        translation = resources[resourceMap[languge]].translation;

    return function() {
        beforeAll(function() {
            browser.driver.get(config.baseUrl + url);
            browser.executeAsyncScript(waitRender);
        });

        it('should translated have title', function() {
            browser.executeAsyncScript(function() {
                var callback = arguments[arguments.length - 1];
                callback(window.document.title);
            }).then(function(title) {
                expect(title).toBe(translation.home.home.index.title + ' - Tutorial');
            });
        });

        it('should have 2 language buttons', function() {
            browser.driver.findElements(by.css('#toolbar .languages button')).then(function(buttons) {
                expect(buttons.length).toBe(2);
                expect(buttons[0].getText()).toBe('English');
                expect(buttons[1].getText()).toBe('Français');
            });
        });

        it('should have 6 translated menu item', function() {
            browser.driver.findElements(by.css('#toolbar .menu a')).then(function(items) {
                expect(items.length).toBe(6);
                expect(items[0].getText()).toBe(translation.home.home.index.title);
                expect(items[0].getAttribute('href')).toBe(config.baseUrl + build + '/' + languge + '/home/home/index');
                expect(items[1].getText()).toBe(translation.home.home.step1.title);
                expect(items[1].getAttribute('href')).toBe(config.baseUrl + build + '/' + languge + '/home/home/step1');
                expect(items[2].getText()).toBe(translation.home.home.step2.title);
                expect(items[2].getAttribute('href')).toBe(config.baseUrl + build + '/' + languge + '/home/home/step2');
                expect(items[3].getText()).toBe(translation.home.home.step3.title);
                expect(items[3].getAttribute('href')).toBe(config.baseUrl + build + '/' + languge + '/home/home/step3');
                expect(items[4].getText()).toBe(translation.home.home.step4.title);
                expect(items[4].getAttribute('href')).toBe(config.baseUrl + build + '/' + languge + '/home/home/step4');
                expect(items[5].getText()).toBe(translation.home.home.step5.title);
                expect(items[5].getAttribute('href')).toBe(config.baseUrl + build + '/' + languge + '/home/home/step5');
            });
        });

        it('should have content', function() {
            browser.driver.findElement(by.id('content')).then(function(content) {
                expect(content.getText()).toBe('HOME INDEX ACTION');
            });
        });
    }
}