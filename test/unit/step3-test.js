describe('Step3View', function() {
    var view;

    beforeAll(function(done) {
        require(['home/views/home/Step3View'], function(Step3View) {
            view = new Step3View({});
            done();
        });
    })

    it('should create "phones" model no phones', function() {
        expect(view.phones.length).toBe(0);
    });

    it('should set the default value of orderProp model', function() {
        expect(view.inline.get('orderProp')).toBe('age');
    });

    it('should fetch 4 phones', function(done) {
        view.phones.fetch({
            complete: function() {
                expect(view.phones.length).toBe(4);
                done();
            }
        });
    });

});