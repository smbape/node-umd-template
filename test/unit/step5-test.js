describe('Step5', function() {
    var _, Backbone, User, user, UserList, userList;

    beforeAll(function(done) {
        require([
            'umd-core/src/common',
            'umd-core/src/models/BackboneCollection',
            'home/test/mock'
        ], function(com, BackboneCollection) {
            _ = com._;
            Backbone = com.Backbone;

            User = Backbone.Model.extend({
                urlRoot: '/rest/users'
            });

            UserList = BackboneCollection.extend({
                url: '/rest/users'
            });

            userList = new UserList();
            user = new User({
                lastName: 'User 1'
            });
            done();
        });
    })

    it('should fetch 4 users', function(done) {
        userList.fetch({
            complete: function() {
                expect(userList.length).toBe(4);
                done();
            }
        });
    });

    it('should add user', function(done) {
        user.save(null, {
            complete: function() {
                expect(!!user.id).toBe(true);
                userList.fetch({
                    complete: function() {
                        expect(userList.length).toBe(5);
                        expect(_.isEqual(userList.models[4].attributes, user.attributes)).toBe(true);
                        done();
                    }
                });
            }
        });
    });

    it('should edit user', function(done) {
        user.set('lastName', 'User 2');
        user.save(null, {
            complete: function() {
                expect(!!user.id).toBe(true);
                userList.fetch({
                    complete: function() {
                        expect(userList.length).toBe(5);
                        expect(_.isEqual(userList.models[4].attributes, user.attributes)).toBe(true);
                        done();
                    }
                });
            }
        });
    });

    it('should delete user', function(done) {
        user.destroy({
            complete: function() {
                userList.fetch({
                    complete: function() {
                        expect(userList.length).toBe(4);
                        done();
                    }
                });
            }
        });
    });

});