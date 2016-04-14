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

describe('Step 4', function() {
    var builds = ['web', 'app'],
        languages = ['en', 'fr'],
        leni = builds.length,
        lenj = languages.length,
        build, language, i, j;

    for (i = 0; i < leni; i++) {
        build = builds[i];
        for (j = 0; j < lenj; j++) {
            language = languages[j];
            describe('step4/' + build + '/' + language, scenario(build, language));
        }
    }
});

function scenario(build, languge) {
    var url = build + '/' + languge + '/home/home/step4',
        translation = resources[resourceMap[languge]].translation;

    return function() {
        beforeAll(function() {
            browser.driver.get(config.baseUrl + url);
            browser.executeAsyncScript(waitRender);
        });

        it('should have display correct errors', function() {
            var errorList = element.all(by.className('error-message')),
                email = element(by.css('[data-bind-attr=email]')),
                firstName = element(by.css('[data-bind-attr=firstName]')),
                button = element(by.css('button[type=submit]'));

            function getErrorList() {
                return errorList.map(function(elm) {
                    return elm.getText();
                });
            }

            // primary invalid error should be displayed
            expect(errorList.count()).toBe(1);
            expect(getErrorList()).toEqual([
                translation.error.email
            ]);

            // modifying another input should preserve error
            firstName.clear();
            firstName.sendKeys('Liquid');
            expect(errorList.count()).toBe(1);
            expect(getErrorList()).toEqual([
                translation.error.email
            ]);

            // global error should display on click
            button.click();
            expect(errorList.count()).toBe(2);
            expect(getErrorList()).toEqual([
                translation.error.email,
                translation.error.email
            ]);

            // attribute error should disappear 
            email.clear();
            email.sendKeys("ipsum@lorem.com");
            expect(errorList.count()).toBe(1);
            expect(getErrorList()).toEqual([
                translation.error.email
            ]);

            // all errors should disappear
            button.click();
            var alertDialog = browser.driver.switchTo().alert();
            var attributes = {
                title: "Spy",
                email: "ipsum@lorem.com",
                firstName: "Liquid",
                lastName: "SNAKE",
                company: "Foxhound",
                address: "Right behind you",
                state: "CA",
                biography: "Born to be a soldier.\n\nDied as a soldier",
                postalCode: "54952"
            };

            expect(alertDialog.getText()).toEqual(JSON.stringify(attributes, null, 2));
            alertDialog.accept();
            expect(errorList.count()).toBe(0);
        });
    }
}