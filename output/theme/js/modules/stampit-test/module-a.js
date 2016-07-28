define(function (require) {
    var stampit = require('stampit');


    var moduleA = stampit()
        .state({
            stateTest: 'foo'
        })
        .methods({
            init: function init () {
                return 'init called';
            },

            testA: function testA () {
                return 'test A';
            }
        })
        .enclose(function () {
            var privVar = 'bolt';

            this.privMethod = function () {
                return privVar;
            };
        })
        .create();

    return moduleA;
});
