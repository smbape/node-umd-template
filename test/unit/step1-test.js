describe('Step1View', function() {
    it('should create "phones" model with 3 phones', function(done) {
        require(['home/views/home/Step1View'], function(Step1View) {
            var view = new Step1View({});
            expect(view.phones.length).toBe(3);
            done();
        });
    });
});