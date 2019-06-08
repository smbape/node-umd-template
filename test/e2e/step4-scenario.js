const config = require("../protractor-conf").config;

expando.addScenario("Step4", (build, languge) => {
    const url = `${ config.baseUrl + build }/${ languge }/home/home/step4`;
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
        });

        it("should have display correct errors", () => {
            const errorList = element.all(by.className("error-message"));
            const email = element(by.css("[data-bind-attr=email]"));
            const firstName = element(by.css("[data-bind-attr=firstName]"));
            const button = element(by.css("button[type=submit]"));

            const getErrorList = () => {
                return errorList.map(elm => elm.getText());
            };

            // primary invalid error should be displayed
            expect(errorList.count()).toBe(1);
            expect(getErrorList()).toEqual([
                translate("error.email")
            ]);

            // modifying another input should preserve error
            expando.setInputValue(firstName, "Liquid");
            expect(errorList.count()).toBe(1);
            expect(getErrorList()).toEqual([
                translate("error.email")
            ]);

            // global error should display on click
            button.click();
            expect(errorList.count()).toBe(2);
            expect(getErrorList()).toEqual([
                translate("error.email"),
                translate("error.email")
            ]);

            // attribute error should disappear
            expando.setInputValue(email, "ipsum@lorem.com");
            expect(errorList.count()).toBe(1);
            expect(getErrorList()).toEqual([
                translate("error.email")
            ]);

            // all errors should disappear
            button.click();
            const alertDialog = browser.driver.switchTo().alert();
            const attributes = {
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
    };
});
