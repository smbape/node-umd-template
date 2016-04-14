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

describe('Step 1', function() {
    var builds = ['web', 'app'],
        languages = ['en', 'fr'],
        leni = builds.length,
        lenj = languages.length,
        build, language, i, j;

    for (i = 0; i < leni; i++) {
        build = builds[i];
        for (j = 0; j < lenj; j++) {
            language = languages[j];
            describe('step1/' + build + '/' + language, scenario(build, language));
        }
    }
});

function scenario(build, languge) {
    var url = build + '/' + languge + '/home/home/step1',
        translation = resources[resourceMap[languge]].translation;

    return function() {
        beforeAll(function() {
            browser.driver.get(config.baseUrl + url);
            browser.executeAsyncScript(waitRender);
        });

        it('should filter the phone list as a user types into the search box', function() {
            var phoneList = element.all(by.css('.phones li'));
            var query = element(by.css('input'));

            expect(phoneList.count()).toBe(3);

            query.clear();
            query.sendKeys('nexus');
            expect(phoneList.count()).toBe(1);

            query.clear();
            query.sendKeys('motorola');
            expect(phoneList.count()).toBe(2);
        });

    }
}