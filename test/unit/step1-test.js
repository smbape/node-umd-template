describe('Step1View', function() {
    it('should create "phones" model with 3 phones', function(done) {
        require(['home/views/home/Step1View'], function(Step1View) {
            var view = new Step1View({});
            expect(view.phones).toEqual([{
                'name': 'Nexus S',
                'snippet': 'Fast just got faster with Nexus S.'
            }, {
                'name': 'Motorola XOOM™ with Wi-Fi',
                'snippet': 'The Next, Next Generation tablet.'
            }, {
                'name': 'MOTOROLA XOOM™',
                'snippet': 'The Next, Next Generation tablet.'
            }]);
            done();
        });
    });
});