describe('Step5Controller', function() {
    var $;

    beforeAll(function(done) {
        require(['jquery', 'home/test/mock'], function(jQuery) {
            $ = jQuery;
            done();
        });
    })

    it('should GET 4 users', function(done) {
        $.ajax({
            url: '/rest/users',
            contentType: 'application/json',
            type: 'GET',
            success: function(users) {
                expect(users).toEqual([
                    {
                        id: 1,
                        firstName: 'Solid',
                        lastName: 'SNAKE',
                        age: 1
                    }, {
                        id: 2,
                        firstName: 'Mikasa',
                        lastName: 'ACKERMAN',
                        age: 3
                    }, {
                        id: 3,
                        firstName: 'Integra',
                        lastName: 'FAIRBOOK WINGATES HELLSING',
                        age: 4
                    }, {
                        id: 4,
                        firstName: 'Wade',
                        lastName: 'WILSON',
                        age: 2
                    }
                ]);
                done();
            }
        });
    });

    it('should GET user 1', function(done) {
        $.ajax({
            url: '/rest/users/1',
            contentType: 'application/json',
            type: 'GET',
            success: function(user) {
                expect(user).toEqual({
                    id: 1,
                    firstName: 'Solid',
                    lastName: 'SNAKE',
                    age: 1
                });
                done();
            }
        });
    });

    it('should POST user 5', function(done) {
        $.ajax({
            url: '/rest/users',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify({
                firstName: 'FirstName5',
                lastName: 'Name5',
                age: 50
            }),
            success: function(user) {
                expect(user).toEqual({
                    id: 5,
                    firstName: 'FirstName5',
                    lastName: 'Name5',
                    age: 50
                });
                done();
            }
        });
    });

    it('should GET 5 users', function(done) {
        $.ajax({
            url: '/rest/users',
            contentType: 'application/json',
            type: 'GET',
            success: function(users) {
                expect(users).toEqual([
                    {
                        id: 1,
                        firstName: 'Solid',
                        lastName: 'SNAKE',
                        age: 1
                    }, {
                        id: 2,
                        firstName: 'Mikasa',
                        lastName: 'ACKERMAN',
                        age: 3
                    }, {
                        id: 3,
                        firstName: 'Integra',
                        lastName: 'FAIRBOOK WINGATES HELLSING',
                        age: 4
                    }, {
                        id: 4,
                        firstName: 'Wade',
                        lastName: 'WILSON',
                        age: 2
                    }, {
                        id: 5,
                        firstName: 'FirstName5',
                        lastName: 'Name5',
                        age: 50
                    }
                ]);
                done();
            }
        });
    });

    it('should PUT user 1', function(done) {
        $.ajax({
            url: '/rest/users/1',
            contentType: 'application/json',
            type: 'PUT',
            data: JSON.stringify({
                firstName: 'FirstName1',
                lastName: 'Name1'
            }),
            success: function(user) {
                expect(user).toEqual({
                    id: 1,
                    firstName: 'FirstName1',
                    lastName: 'Name1'
                });
                done();
            }
        });
    });

    it('should PATCH user 1', function(done) {
        $.ajax({
            url: '/rest/users/1',
            contentType: 'application/json',
            type: 'PATCH',
            data: JSON.stringify({
                age: 26
            }),
            success: function(user) {
                expect(user).toEqual({
                    id: 1,
                    firstName: 'FirstName1',
                    lastName: 'Name1',
                    age: 26
                });
                done();
            }
        });
    });

    it('should DELETE user 1', function(done) {
        $.ajax({
            url: '/rest/users/1',
            contentType: 'application/json',
            type: 'DELETE',
            success: function(user) {
                expect(user).toEqual({
                    id: 1,
                    firstName: 'FirstName1',
                    lastName: 'Name1',
                    age: 26
                });
                done();
            }
        });
    });

    it('should GET 4 users', function(done) {
        $.ajax({
            url: '/rest/users',
            contentType: 'application/json',
            type: 'GET',
            success: function(users) {
                expect(users).toEqual([
                    {
                        id: 2,
                        firstName: 'Mikasa',
                        lastName: 'ACKERMAN',
                        age: 3
                    }, {
                        id: 3,
                        firstName: 'Integra',
                        lastName: 'FAIRBOOK WINGATES HELLSING',
                        age: 4
                    }, {
                        id: 4,
                        firstName: 'Wade',
                        lastName: 'WILSON',
                        age: 2
                    }, {
                        id: 5,
                        firstName: 'FirstName5',
                        lastName: 'Name5',
                        age: 50
                    }
                ]);
                done();
            }
        });
    });

});