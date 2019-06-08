const config = require("../protractor-conf").config;

expando.addScenario("Step5", (build, languge) => {
    const url = `${ config.baseUrl + build }/${ languge }/home/step5/user-list`;
    let translate;

    return () => {
        beforeAll(() => {
            browser.driver.get(url);
            expando.waitRender();
            expando.initTranslation(languge, [
                require("../../public/node_modules/umd-core/src/resources"),
                require("../../public/node_modules/umd-core/src/validation/resources"),
                require("../../public/node_modules/configs/resources")
            ], (err, t) => {
                translate = t;
            });
            expando.waitTimeout(300); // wait 300 ms for remote data display
        });

        it("should have a create user button", () => {
            const createButton = element.all(by.css(".user-create"));
            expect(createButton.count()).toBe(1);
            expect(createButton.map(getText)).toEqual([translate("label.user.create").toUpperCase()]);
        });

        it("should have headers", () => {
            expect(element.all(by.tagName("th")).map(getText)).toEqual([
                translate("label.firstName"),
                translate("label.lastName"),
                translate("label.age"),
                ""
            ]);
        });

        it("should have 4 users", () => {
            const users = element.all(by.className("user"));
            expect(users.count()).toBe(4);

            const buttons = getActionButtons();
            expect(getUsersAttributes(users)).toEqual([
                ["Solid", "SNAKE", "1", buttons],
                ["Mikasa", "ACKERMAN", "3", buttons],
                ["Integra", "FAIRBOOK WINGATES HELLSING", "4", buttons],
                ["Wade", "WILSON", "2", buttons]
            ]);
        });

        it("should display edit form", () => {
            const editButtons = element.all(by.css(".user .user-edit"));
            expect(editButtons.count()).toBe(4);

            // Edit user at index 1
            editButtons.get(1).click();
            expando.waitRouteChangeSuccess(url);

            // wait 300 ms for remote data display
            expando.waitTimeout(300);

            // Should have correct labels
            expect(element.all(by.tagName("label")).map(getText)).toEqual([
                translate("label.firstName"),
                translate("label.lastName"),
                translate("label.age")
            ]);

            // Should have correct values
            expect(element.all(by.css("input[type=text]")).map(expando.getValue)).toEqual(["Mikasa", "ACKERMAN", "3"]);

            // Should have correct buttons
            const buttons = element.all(by.css("#content button"));
            expect(buttons.map(getText)).toEqual([
                translate("button.delete").toUpperCase(),
                translate("button.cancel").toUpperCase(),
                translate("button.save").toUpperCase()
            ]);

            // click on cancel should return to url
            buttons.get(1).click();
            expando.waitRouteChangeSuccess(null, url);

            // wait 300 ms for remote data display
            expando.waitTimeout(300);

            expectCurrentUrl(url);
        });

        it("should create user", () => {
            const createButton = element.all(by.css(".user-create"));
            expect(createButton.count()).toBe(1);

            createButton.get(0).click();
            expando.waitRouteChangeSuccess(url);

            // wait 300 ms for remote data display
            expando.waitTimeout(300);

            // Should have correct values
            expect(element.all(by.css("input[type=text]")).map(expando.getValue)).toEqual(["", "", ""]);

            const inputs = {
                firstName: element(by.css("[data-bind-attr=firstName]")),
                lastName: element(by.css("[data-bind-attr=lastName]")),
                age: element(by.css("[data-bind-attr=age]"))
            };

            setInputs(inputs, {
                firstName: "Nelson",
                lastName: "MANDELA",
                age: "95"
            });

            // Should have correct buttons
            let buttons = element.all(by.css("#content button"));
            expect(buttons.map(getText)).toEqual([
                translate("button.cancel").toUpperCase(),
                translate("button.save").toUpperCase()
            ]);

            // click on save should return to original page
            buttons.get(1).click();
            expando.waitRouteChangeSuccess(null, url);

            // wait 300 ms for remote data display
            expando.waitTimeout(300);

            expectCurrentUrl(url);

            const users = element.all(by.className("user"));
            expect(users.count()).toBe(5);

            buttons = getActionButtons();
            expect(getUsersAttributes(users)).toEqual([
                ["Solid", "SNAKE", "1", buttons],
                ["Mikasa", "ACKERMAN", "3", buttons],
                ["Integra", "FAIRBOOK WINGATES HELLSING", "4", buttons],
                ["Wade", "WILSON", "2", buttons],
                ["Nelson", "MANDELA", "95", buttons]
            ]);
        });

        it("should delete user", () => {
            const users = element.all(by.className("user"));
            expect(users.count()).toBe(5);
            users.get(4).element(by.className("user-delete")).click();

            // wait 300 ms for remote data display
            expando.waitTimeout(300);

            const buttons = getActionButtons();
            expect(getUsersAttributes(users)).toEqual([
                ["Solid", "SNAKE", "1", buttons],
                ["Mikasa", "ACKERMAN", "3", buttons],
                ["Integra", "FAIRBOOK WINGATES HELLSING", "4", buttons],
                ["Wade", "WILSON", "2", buttons]
            ]);
        });

        it("should edit user", () => {
            const editButtons = element.all(by.css(".user .user-edit"));
            expect(editButtons.count()).toBe(4);

            // Edit user at index 1
            editButtons.get(1).click();
            expando.waitRouteChangeSuccess(url);

            // wait 300 ms for remote data display
            expando.waitTimeout(300);

            // Should have correct values
            expect(element.all(by.css("input[type=text]")).map(expando.getValue)).toEqual(["Mikasa", "ACKERMAN", "3"]);

            const inputs = {
                firstName: element(by.css("[data-bind-attr=firstName]")),
                lastName: element(by.css("[data-bind-attr=lastName]")),
                age: element(by.css("[data-bind-attr=age]"))
            };

            setInputs(inputs, {
                firstName: "Nelson",
                lastName: "MANDELA",
                age: "95"
            });

            // click on save should return to original page
            let buttons = element.all(by.css("#content button"));
            buttons.get(2).click();
            expando.waitRouteChangeSuccess(null, url);

            // wait 300 ms for remote data display
            expando.waitTimeout(300);

            expectCurrentUrl(url);

            const users = element.all(by.className("user"));
            expect(users.count()).toBe(4);

            buttons = getActionButtons();
            expect(getUsersAttributes(users)).toEqual([
                ["Solid", "SNAKE", "1", buttons],
                ["Nelson", "MANDELA", "95", buttons],
                ["Integra", "FAIRBOOK WINGATES HELLSING", "4", buttons],
                ["Wade", "WILSON", "2", buttons]
            ]);
        });
    };

    function setInputs(inputs, attributes) {
        for (const prop in attributes) {
            expando.setInputValue(inputs[prop], attributes[prop]);
        }
    }

    function getText(elm) {
        return elm.getText();
    }

    function getUsersAttributes(users) {
        return users.map(elm => {
            let index = 0;
            return elm.all(by.tagName("td")).map(elm => {
                return ++index !== 4 ? elm.getText() : elm.all(by.className("mdl-button")).map(getText);
            });
        });
    }

    function expectCurrentUrl(url) {
        return browser.executeAsyncScript(function() {
            const callback = arguments[arguments.length - 1];
            callback(window.location.href);
        }).then(href => {
            expect(href).toBe(url);
        });
    }

    function getActionButtons() {
        return [translate("button.edit").toUpperCase(), translate("button.delete").toUpperCase()];
    }
});
