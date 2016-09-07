var config = require('../protractor-conf').config;

addScenario('Step2', function scenario(build, languge) {
    'use strict';

    var url = config.baseUrl + build + '/' + languge + '/home/home/step2',
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

        it('should filter the phone list as a user types into the search box', function() {
            var phoneList = element.all(by.css('.phones .name'));
            var query = element(by.css('input'));

            expect(phoneList.count()).toBe(3);

            setInputValue(query, 'nexus');
            expect(phoneList.count()).toBe(1);

            setInputValue(query, 'motorola');
            expect(phoneList.count()).toBe(2);
        });

        it('should be possible to control phone order via the drop down select box', function() {
            var phoneNameColumn = element.all(by.css('.phones .name'));
            var query = element(by.css('input'));

            function getNames() {
                return phoneNameColumn.map(function(elm) {
                    return elm.getText();
                });
            }

            setInputValue(query, 'tablet'); //let's narrow the dataset to make the test assertions shorter

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
    }
});