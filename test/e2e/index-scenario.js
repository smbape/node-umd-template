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

        it("should have 6 translated menu items", () => {
            browser.driver.findElements(by.css("#toolbar .menu a")).then(items => {
                expect(items.length).toBe(6);
                expect(items[0].getText()).toBe(translate("home.home.index.title"));
                expect(items[0].getAttribute("href")).toBeUrl([`${ build }/${ languge }/home/home/index`, config.baseUrl]);
                expect(items[1].getText()).toBe(translate("home.home.step1.title"));
                expect(items[1].getAttribute("href")).toBeUrl([`${ build }/${ languge }/home/home/step1`, config.baseUrl]);
                expect(items[2].getText()).toBe(translate("home.home.step2.title"));
                expect(items[2].getAttribute("href")).toBeUrl([`${ build }/${ languge }/home/home/step2`, config.baseUrl]);
                expect(items[3].getText()).toBe(translate("home.home.step3.title"));
                expect(items[3].getAttribute("href")).toBeUrl([`${ build }/${ languge }/home/home/step3`, config.baseUrl]);
                expect(items[4].getText()).toBe(translate("home.home.step4.title"));
                expect(items[4].getAttribute("href")).toBeUrl([`${ build }/${ languge }/home/home/step4`, config.baseUrl]);
                expect(items[5].getText()).toBe(translate("home.step5.user-list.title"));
                expect(items[5].getAttribute("href")).toBeUrl([`${ build }/${ languge }/home/step5/user-list`, config.baseUrl]);
            });
        });

        it("should have index content", () => {
            browser.driver.findElement(by.id("content")).then(content => {
                expect(content.getText()).toBe("HOME INDEX ACTION");
            });
        });
    };
});
