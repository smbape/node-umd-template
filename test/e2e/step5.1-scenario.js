var config = require('../protractor-conf').config;

addScenario('Step5.1', function scenario(build, languge) {
    'use strict';

    var url = config.baseUrl + build + '/' + languge + '/home/step5/list-user',
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
            waitTimeout(300) // wait 300 ms for remote data display
        });

        it('should have a create user button', function() {
            var createButton = element.all(by.css('.create-user'));
            expect(createButton.count()).toBe(1);
            expect(createButton.map(getText)).toEqual([translate('label.user.create').toUpperCase()]);

        });

        it('should have headers', function() {
            expect(element.all(by.tagName('th')).map(getText)).toEqual([
                translate('label.firstName'),
                translate('label.lastName'),
                translate('label.age'),
                ''
            ]);
        });

        it('should have 4 users', function() {
            var users = element.all(by.className('user'));
            expect(users.count()).toBe(4);

            var buttons = getActionButtons();
            expect(getUsersAttributes(users)).toEqual([
                ['Solid', 'SNAKE', '1', buttons],
                ['Mikasa', 'ACKERMAN', '3', buttons],
                ['Integra', 'FAIRBOOK WINGATES HELLSING', '4', buttons],
                ['Wade', 'WILSON', '2', buttons]
            ]);
        });

        it('should display edit form', function() {
            var editButtons = element.all(by.css('.user .edit-user'));
            expect(editButtons.count()).toBe(4);

            // Edit user at index 1
            editButtons.get(1).click();
            waitRouteChangeSuccess(url);

            // wait 300 ms for remote data display
            waitTimeout(300);

            // Should have correct labels
            expect(element.all(by.tagName('label')).map(getText)).toEqual([
                translate('label.firstName'),
                translate('label.lastName'),
                translate('label.age')
            ]);

            // Should have correct values
            expect(element.all(by.css('input[type=text]')).map(getValue)).toEqual(['Mikasa', 'ACKERMAN', '3']);

            // Should have correct buttons
            var buttons = element.all(by.css('#content button'));
            expect(buttons.map(getText)).toEqual([
                translate('button.delete').toUpperCase(),
                translate('button.cancel').toUpperCase(),
                translate('button.save').toUpperCase()
            ]);

            // click on cancel should return to url
            buttons.get(1).click();
            waitRouteChangeSuccess(null, url);

            // wait 300 ms for remote data display
            waitTimeout(300);

            expectCurrentUrl(url);
        });

        it('should create user', function() {
            var createButton = element.all(by.css('.create-user'));
            expect(createButton.count()).toBe(1);

            createButton.get(0).click();
            waitRouteChangeSuccess(url);

            // wait 300 ms for remote data display
            waitTimeout(300);

            // Should have correct values
            expect(element.all(by.css('input[type=text]')).map(getValue)).toEqual(['', '', '']);

            var inputs = {
                firstName: element(by.css('[data-bind-attr=firstName]')),
                lastName: element(by.css('[data-bind-attr=lastName]')),
                age: element(by.css('[data-bind-attr=age]'))
            };

            setInputs(inputs, {
                firstName: 'Nelson',
                lastName: 'MANDELA',
                age: '95'
            });

            // Should have correct buttons
            var buttons = element.all(by.css('#content button'));
            expect(buttons.map(getText)).toEqual([
                translate('button.cancel').toUpperCase(),
                translate('button.save').toUpperCase()
            ]);

            // click on save should return to original page
            buttons.get(1).click();
            waitRouteChangeSuccess(null, url);

            // wait 300 ms for remote data display
            waitTimeout(300);

            expectCurrentUrl(url);

            var users = element.all(by.className('user'));
            expect(users.count()).toBe(5);

            var buttons = getActionButtons();
            expect(getUsersAttributes(users)).toEqual([
                ['Solid', 'SNAKE', '1', buttons],
                ['Mikasa', 'ACKERMAN', '3', buttons],
                ['Integra', 'FAIRBOOK WINGATES HELLSING', '4', buttons],
                ['Wade', 'WILSON', '2', buttons],
                ['Nelson', 'MANDELA', '95', buttons]
            ]);
        });

        it('should delete user', function() {
            var users = element.all(by.className('user'));
            expect(users.count()).toBe(5);
            users.get(4).element(by.className('delete-user')).click();

            // wait 300 ms for remote data display
            waitTimeout(300);

            var buttons = getActionButtons();
            expect(getUsersAttributes(users)).toEqual([
                ['Solid', 'SNAKE', '1', buttons],
                ['Mikasa', 'ACKERMAN', '3', buttons],
                ['Integra', 'FAIRBOOK WINGATES HELLSING', '4', buttons],
                ['Wade', 'WILSON', '2', buttons]
            ]);
        });

        it('should edit user', function() {
            var editButtons = element.all(by.css('.user .edit-user'));
            expect(editButtons.count()).toBe(4);

            // Edit user at index 1
            editButtons.get(1).click();
            waitRouteChangeSuccess(url);

            // wait 300 ms for remote data display
            waitTimeout(300);

            // Should have correct values
            expect(element.all(by.css('input[type=text]')).map(getValue)).toEqual(['Mikasa', 'ACKERMAN', '3']);

            var inputs = {
                firstName: element(by.css('[data-bind-attr=firstName]')),
                lastName: element(by.css('[data-bind-attr=lastName]')),
                age: element(by.css('[data-bind-attr=age]'))
            };

            setInputs(inputs, {
                firstName: 'Nelson',
                lastName: 'MANDELA',
                age: '95'
            });

            // click on save should return to original page
            var buttons = element.all(by.css('#content button'));
            buttons.get(2).click();
            waitRouteChangeSuccess(null, url);

            // wait 300 ms for remote data display
            waitTimeout(300);

            expectCurrentUrl(url);

            var users = element.all(by.className('user'));
            expect(users.count()).toBe(4);

            var buttons = getActionButtons();
            expect(getUsersAttributes(users)).toEqual([
                ['Solid', 'SNAKE', '1', buttons],
                ['Nelson', 'MANDELA', '95', buttons],
                ['Integra', 'FAIRBOOK WINGATES HELLSING', '4', buttons],
                ['Wade', 'WILSON', '2', buttons]
            ]);
        });

    }

    function setInputs(inputs, attributes) {
        for (var prop in attributes) {
            setInputValue(inputs[prop], attributes[prop]);
        }
    }

    function getText(elm) {
        return elm.getText();
    }

    function getValue(elm) {
        return elm.getAttribute('value');
    }

    function getUsersAttributes(users) {
        return users.map(function(elm) {
            var index = 0;
            return elm.all(by.tagName('td')).map(function(elm) {
                return ++index !== 4 ? elm.getText() : elm.all(by.className('mdl-button')).map(getText);
            });
        });
    }

    function expectCurrentUrl(url) {
        return browser.executeAsyncScript(function() {
            var callback = arguments[arguments.length - 1];
            callback(window.location.href);
        }).then(function(href) {
            expect(href).toBe(url);
        });
    }

    function getActionButtons() {
        return [translate('button.edit').toUpperCase(), translate('button.delete').toUpperCase()];
    }
});