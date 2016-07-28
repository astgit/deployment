define(function (require) {
    var moduleC = require('modules/stampit-test/module-c'),
        stampit = require('stampit');


    var moduleD = stampit()
        .methods({
            testA: function testA () {
                console.log(moduleC);
                moduleC.init();

                return 'I am the master! AH!';
            },
            testD: function testD () {
                return 'test D';
            }
        })
        .create();

    return moduleD;
});
