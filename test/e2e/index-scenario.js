const config = require("../protractor-conf").config;

expando.addScenario("Index", (build, languge) => {
    const url = `${ config.baseUrl }${ build }/${ languge }/home/home/index`;
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

        it("should have translated document title", () => {
            browser.executeAsyncScript(function() {
                const callback = arguments[arguments.length - 1];
                callback(window.document.title);
            }).then(title => {
                expect(title).toBe(`${ translate("home.home.index.title") } - Tutorial`);
            });
        });

        it("should have 2 language buttons", () => {
            browser.driver.findElements(by.css("#toolbar .languages button")).then(buttons => {
                expect(buttons.length).toBe(2);
                expect(buttons[0].getText()).toBe("English");
                expect(buttons[1].getText()).toBe("Français");
            });
        });

        it("should have 2 translated menu items", () => {
            browser.driver.findElements(by.css("#toolbar .menu a")).then(items => {
                expect(items.length).toBe(2);
                expect(items[0].getText()).toBe(translate("home.home.index.title"));
                expect(items[0].getAttribute("href")).toBeUrl([`${ build }/${ languge }/home/home/index`, config.baseUrl]);
                expect(items[1].getText()).toBe(translate("home.home.step1.title"));
                expect(items[1].getAttribute("href")).toBeUrl([`${ build }/${ languge }/home/home/step1`, config.baseUrl]);
            });
        });

        it("should have index content", () => {
            browser.driver.findElement(by.id("content")).then(content => {
                expect(content.getText()).toBe("HOME INDEX ACTION");
            });
        });
    };
});
