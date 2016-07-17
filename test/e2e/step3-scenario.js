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

describe('Step 3', function() {
    var builds = ['web', 'app'],
        languages = ['en', 'fr'],
        leni = builds.length,
        lenj = languages.length,
        build, language, i, j;

    for (i = 0; i < leni; i++) {
        build = builds[i];
        for (j = 0; j < lenj; j++) {
            language = languages[j];
            describe('step3/' + build + '/' + language, scenario(build, language));
        }
    }
});

function scenario(build, languge) {
    var url = build + '/' + languge + '/home/home/step3',
        translation = resources[resourceMap[languge]].translation;

    return function() {
        beforeAll(function() {
            browser.driver.get(config.baseUrl + url);
            browser.executeAsyncScript(waitRender);
        });

        it('should filter the phone list as a user types into the search box', function() {
            // wait 300 ms to leave time for fetching
            waitTimeout(300).then(function() {
                var phoneList = element.all(by.css('.phones .name'));
                var query = element(by.css('input'));

                expect(phoneList.count()).toBe(4);

                query.clear();
                query.sendKeys('nexus');
                expect(phoneList.count()).toBe(1);

                query.clear();
                query.sendKeys('motorola');
                expect(phoneList.count()).toBe(3);
            });
        });

        it('should be possible to control phone order via the drop down select box', function() {
            // wait 300 ms to leave time for fetching
            waitTimeout(300).then(function() {
                var phoneNameColumn = element.all(by.css('.phones .name'));
                var query = element(by.css('input'));

                function getNames() {
                    return phoneNameColumn.map(function(elm) {
                        return elm.getText();
                    });
                }

                query.clear();
                query.sendKeys('tablet'); //let's narrow the dataset to make the test assertions shorter

                expect(getNames()).toEqual([
                    "Motorola XOOM\u2122 with Wi-Fi",
                    "MOTOROLA XOOM\u2122"
                ]);

                element(by.css('select option[value="name"]')).click();
                expect(getNames()).toEqual([
                    "MOTOROLA XOOM\u2122",
                    "Motorola XOOM\u2122 with Wi-Fi"
                ]);

                element(by.css('select option[value="age"]')).click();
                expect(getNames()).toEqual([
                    "Motorola XOOM\u2122 with Wi-Fi",
                    "MOTOROLA XOOM\u2122"
                ]);
            });
        });

    }
}