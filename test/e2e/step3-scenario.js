const config = require("../protractor-conf").config;

expando.addScenario("Step3", (build, languge) => {
    const url = `${ config.baseUrl + build }/${ languge }/home/home/step3`;
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
            // wait 300 ms to leave time for fetching
            expando.waitTimeout(300);

            const phoneList = element.all(by.css(".phones .name"));
            const query = element(by.css("input"));

            expect(phoneList.count()).toBe(4);

            expando.setInputValue(query, "nexus");
            expect(phoneList.count()).toBe(1);

            expando.setInputValue(query, "motorola");
            expect(phoneList.count()).toBe(3);
        });

        it("should be possible to control phone order via the drop down select box", () => {
            // wait 300 ms to leave time for fetching
            expando.waitTimeout(300);

            const phoneNameColumn = element.all(by.css(".phones .name"));
            const query = element(by.css("input"));

            const getNames = () => {
                return phoneNameColumn.map(elm => elm.getText());
            };

            expando.setInputValue(query, "tablet"); //let's narrow the dataset to make the test assertions shorter

            expect(getNames()).toEqual([
                "Motorola XOOM\u2122 with Wi-Fi",
                "MOTOROLA XOOM\u2122"
            ]);

            element(by.css("select option[value=\"name\"]")).click();
            expect(getNames()).toEqual([
                "MOTOROLA XOOM\u2122",
                "Motorola XOOM\u2122 with Wi-Fi"
            ]);

            element(by.css("select option[value=\"age\"]")).click();
            expect(getNames()).toEqual([
                "Motorola XOOM\u2122 with Wi-Fi",
                "MOTOROLA XOOM\u2122"
            ]);
        });
    };
});
