var config = require('../protractor-conf').config;

addScenario('Step4', function scenario(build, languge) {
    'use strict';

    var url = config.baseUrl + build + '/' + languge + '/home/home/step4',
        translate;

    return function() {
        beforeAll(function() {
            browser.driver.get(url);
            waitRender();
            initTranslation(languge, [
                require('../../public/node_modules/umd-core/src/resources'),
                require('../../public/node_modules/umd-core/src/validation/resources'),
                require('../../public/node_modules/configs/resources')
            ], function(err, t) {
                translate = t;
            });
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
                translate('error.email')
            ]);

            // modifying another input should preserve error
            firstName.clear();
            firstName.sendKeys('Liquid');
            expect(errorList.count()).toBe(1);
            expect(getErrorList()).toEqual([
                translate('error.email')
            ]);

            // global error should display on click
            button.click();
            expect(errorList.count()).toBe(2);
            expect(getErrorList()).toEqual([
                translate('error.email'),
                translate('error.email')
            ]);

            // attribute error should disappear 
            email.clear();
            email.sendKeys("ipsum@lorem.com");
            expect(errorList.count()).toBe(1);
            expect(getErrorList()).toEqual([
                translate('error.email')
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
});