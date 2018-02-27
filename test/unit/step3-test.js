describe('Step3View', function() {
    var $, view;

    beforeAll(function(done) {
        require(['jquery', 'home/views/home/Step3View'], function(jQuery, Step3View) {
            $ = jQuery;
            view = new Step3View({});
            done();
        });
    })

    it('should create "phones" model no phones', function() {
        expect(view.state.collection.length).toBe(0);
    });

    it('should set the default value of order model', function() {
        expect(view.inline.get('order')).toBe('age');
    });

    it('should fetch 4 phones', function(done) {
        $.ajax({
            url: '/rest/phone-list',
            type: 'GET',
            success: function(phones) {
                expect(phones).toEqual([{
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
                }, {
                    'age': 13,
                    'id': "motorola-defy-with-motoblur",
                    'name': "Motorola DEFY\u2122 with MOTOBLUR\u2122",
                    'snippet': "Are you ready for everything life throws your way?"
                }]);
                done();
            }
        });
    });

});