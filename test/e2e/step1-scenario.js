var config = require('../protractor-conf').config;

addScenario('Step1', function scenario(build, languge) {
    'use strict';

    var url = config.baseUrl + build + '/' + languge + '/home/home/step1',
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
});