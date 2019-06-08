const config = require("../protractor-conf").config;

expando.addScenario("Step1", (build, languge) => {
    const url = `${ config.baseUrl + build }/${ languge }/home/home/step1`;
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

        it("should filter the phone list as a user types into the search box", () => {
            const phoneList = element.all(by.css(".phones li"));
            const query = element(by.css("input"));

            expect(phoneList.count()).toBe(3);

            expando.setInputValue(query, "nexus");
            expect(phoneList.count()).toBe(1);

            expando.setInputValue(query, "motorola");
            expect(phoneList.count()).toBe(2);
        });
    };
});
