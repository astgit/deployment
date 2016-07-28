define(function (require) {
    var currentLayout = require('modules/ui/current-layout'),
        stampit = require('stampit');


    var moduleE = stampit()
        .methods({
            testE: function testE () {

                return 'test E';
            },

            testInheritence: function testInheritence () {
                return currentLayout.layout();
            }
        })
        .create();

    return moduleE;
});
