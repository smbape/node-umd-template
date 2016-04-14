describe('Step2View', function() {
    var view;

    beforeAll(function(done) {
        require(['home/views/home/Step2View'], function(Step2View) {
            view = new Step2View({});
            done();
        });
    })

    it('should create "phones" model with 3 phones', function() {
        expect(view.phones.length).toBe(3);
    });

    it('should set the default value of orderProp model', function() {
        expect(view.inline.get('orderProp')).toBe('age');
    });

});