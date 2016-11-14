describe('CollectionView', function() {
    'use strict';

    var slice = Array.prototype.slice;

    var letters = (function() {
        var i, j;
        letters = new Array(26);
        for (i = j = 0; j < 26; i = j += 1) {
            letters[i] = String.fromCharCode(97 + i);
        }
        return letters;
    })();

    var $, _, component, container, view, byAttributes, BackboneCollection;

    beforeAll(function(done) {
        require([
            'umd-core/src/common',
            'umd-core/src/models/BackboneCollection',
            'tests/views/collection/CollectionView'
        ], function factory(arg, _BackboneCollection, CollectionView) {
            _ = arg._;
            $ = arg.$;
            byAttributes = _BackboneCollection.byAttributes;
            BackboneCollection = _BackboneCollection;

            container = document.createElement('div');
            document.body.appendChild(container);
            view = CollectionView.createElement({
                container: container
            });

            view.render(function(err) {
                if (err) {
                    throw err;
                }
                component = view._component;
                setTimeout(done, 1);
            });
        });
    });

    afterAll(function() {
        view.destroy();
        container.parentNode.removeChild(container);
        component = null;
        view = null;
        container = null;
    });

    it('should initialize without collection', function() {
        expect($('.users .user .id').length).toBe(0);
    });

    it('should display state collection', function(done) {
        var users = generateUserCollection();
        component.setState({
            users: users
        });
        asstertCoherent(users.models, done);
    });

    it('should sort without changing initial collection', function(done) {
        var users = generateUserCollection();
        var witness = users.models.slice();
        var order = byAttributes([
            ['age', -1], 'lastName', 'firstName', 'id'
        ]);

        series([
            function(next) {
                component.setState({
                    users: users,
                    order: order
                });

                asstertCoherent(users, next);
            },
            function(next) {
                expect(users.models).toEqual(witness);
                asstertCoherent(users.models.slice().sort(order), next);
            }
        ], done);
    });

    it('should add users to main and sub collection', function(done) {
        var users = generateUserCollection();
        var order = byAttributes([
            ['age', -1], 'lastName', 'firstName', 'id'
        ]);
        var add = users.add;

        component.setState({
            users: users,
            order: order
        });

        for (var i = 0; i < add; i++) {
            users.add(users.generateUser());
        }

        asstertCoherent(users.models.slice().sort(order), done);
    });

    it('should change users to main and sub collection', function(done) {
        var users = generateUserCollection();
        var order = byAttributes([
            ['age', -1], 'lastName', 'firstName', 'id'
        ]);
        var change = users.change;

        component.setState({
            users: users,
            order: order
        });

        var index, user, attributes;

        for (var i = 0; i < change; i++) {
            index = (users.length * Math.random()) >>> 0;
            user = users.models[index];
            attributes = users.generateUser();
            delete attributes.id;
            user.set(attributes);
        }

        asstertCoherent(users.models.slice().sort(order), done);
    });

    it('should remove users to main and sub collection', function(done) {
        var users = generateUserCollection();
        var order = byAttributes([
            ['age', -1], 'lastName', 'firstName', 'id'
        ]);
        var remove = users.remove;

        component.setState({
            users: users,
            order: order
        });

        var user, index;

        for (var i = 0; i < remove; i++) {
            index = (users.length * Math.random()) >>> 0;
            user = users.models[index];
            users.remove(user);
        }

        asstertCoherent(users.models.slice().sort(order), done);
    });

    it('should add/change/remove users to main and sub collection', function(done) {
        var n = 1000,
            maxLen = 20,
            minLen = 3;

        var users = generateUserCollection(n, maxLen, minLen);
        var order = byAttributes([
            ['age', -1], 'lastName', 'firstName', 'id'
        ]);
        var add = users.add;
        var change = users.change;
        var remove = users.remove;

        component.setState({
            users: users,
            order: order
        });

        var index, user, attributes;

        for (var i = 0; i < add; i++) {
            users.add(users.generateUser());
        }

        for (var i = 0; i < change; i++) {
            index = (users.length * Math.random()) >>> 0;
            user = users.models[index];
            attributes = users.generateUser();
            delete attributes.id;
            user.set(attributes);
        }

        for (var i = 0; i < remove; i++) {
            index = (users.length * Math.random()) >>> 0;
            user = users.models[index];
            users.remove(user);
        }

        asstertCoherent(users.models.slice().sort(order), done);
    });

    function generateName(len, minLen, maxLen) {
        var i, j, letter, name, ref;
        if (!len) {
            len = minLen + Math.random() * (maxLen - minLen);
            len = len >>> 0;
        }
        name = new Array(len);
        for (i = j = 0, ref = len; j < ref; i = j += 1) {
            letter = letters[(25 * Math.random()) >>> 0];
            name[i] = letter;
        }
        return name.join('');
    }

    function generateUser(len, minLen, maxLen) {
        var user;
        user = {
            id: _.uniqueId('user'),
            firstName: generateName(len, minLen, maxLen),
            lastName: generateName(len, minLen, maxLen).toUpperCase(),
            age: 15 + (Math.random() * 60) >>> 0
        };
        user.firstName = user.firstName[0].toUpperCase() + user.firstName.slice(1);
        return user;
    }

    function generateUserCollection(n, maxLen, minLen, add, change, remove, len) {
        var _minLen;
        if (!minLen) {
            minLen = 3;
        }

        if (!maxLen) {
            maxLen = 8;
        }

        if (maxLen < minLen) {
            _minLen = maxLen;
            maxLen = minLen;
            minLen = _minLen;
        }

        if (!n) {
            n = 20;
        }

        if (!add) {
            add = n;
        }

        if (!change) {
            change = 3 * n;
        }

        if (!remove) {
            remove = n;
        }

        if (remove > (n + add)) {
            remove = n + add;
        }

        var users = new Array(n);
        for (var i = 0; i < n; i++) {
            users[i] = generateUser(len, minLen, maxLen);
        }

        var collection = new BackboneCollection();
        collection.options = {
            generateUser: generateUser.bind(len, minLen, maxLen),
            add: add,
            change: change,
            remove: remove,
        };

        return collection;
    }

    function asstertCoherent(models, done) {
        setTimeout(function() {
            var expectedIds = models.map(function(user) {
                return user.id;
            });
            var actualIds = _.map($('.users .user .id'), function(el) {
                return el.innerHTML;
            });

            expect(actualIds).toEqual(expectedIds);
            done();
        }, 2);
    }

    function series(tasks, done) {
        var len = tasks.length,
            i = 0;
        iterate();

        function iterate(err) {
            if (err || i === len) {
                done(err);
                return;
            }

            var task = tasks[i++];
            task(iterate);
        }
    }

    function waterfall(tasks, done) {
        var len = tasks.length,
            i = 0;

        iterate();

        function iterate(err) {
            if (err || i === len) {
                done.apply(null, arguments);
                return;
            }

            var task = tasks[i++];
            var args = slice.call(arguments, 1);
            args.push(iterate);
            task.apply(null, args);
        }
    }

});