describe("Step1View", () => {
    it("should create \"phones\" model with 3 phones", done => {
        require(["home/views/home/Step1View"], Step1View => {
            const view = new Step1View({});
            expect(view.phones).toEqual([{
                name: "Nexus S",
                snippet: "Fast just got faster with Nexus S."
            }, {
                name: "Motorola XOOM™ with Wi-Fi",
                snippet: "The Next, Next Generation tablet."
            }, {
                name: "MOTOROLA XOOM™",
                snippet: "The Next, Next Generation tablet."
            }]);
            done();
        });
    });
});
