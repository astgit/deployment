define(function (require) {
    var stampit = require('stampit');


    var moduleB = stampit()
        .methods({
            testB: function testB () {
                return 'test B';
            }
        })
        .create();

    return moduleB;
});
