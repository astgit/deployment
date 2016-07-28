define(function (require) {
    var moduleA = require('modules/stampit-test/module-a'),
        moduleB = require('modules/stampit-test/module-b'),
        stampit = require('stampit');


    var moduleC = stampit()
        .compose(moduleA, moduleB)
        .methods({
            testC: function testC () {
                return 'test C';
            },
            testState: function testState () {
                return this.stateTest;
            }
        })
        .create();

    return moduleC;
});
