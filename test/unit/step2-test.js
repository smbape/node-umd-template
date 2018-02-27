describe('Step2View', function() {
    var view;

    beforeAll(function(done) {
        require(['home/views/home/Step2View'], function(Step2View) {
            view = new Step2View({});
            done();
        });
    })

    it('should create "phones" model with 3 phones', function() {
        expect(view.phones).toEqual([{
            'name': 'Nexus S',
            'snippet': 'Fast just got faster with Nexus S.',
            'age': 1
        }, {
            'name': 'Motorola XOOM™ with Wi-Fi',
            'snippet': 'The Next, Next Generation tablet.',
            'age': 2
        }, {
            'name': 'MOTOROLA XOOM™',
            'snippet': 'The Next, Next Generation tablet.',
            'age': 3
        }]);
    });

    it('should set the default value of order model', function() {
        expect(view.inline.get('order')).toBe('age');
    });

});