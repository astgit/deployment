/**
 * A module for creating a site's base UI.
 */
define(function (require) {
    var moduleA = require('modules/stampit-test/module-a'),
        moduleB = require('modules/stampit-test/module-b'),
        moduleC = require('modules/stampit-test/module-c'),
        moduleD = require('modules/stampit-test/module-d'),
        moduleE = require('modules/stampit-test/module-e');


    function init () {
        console.log('A:');
        console.log(moduleA);
        console.log('B:');
        console.log(moduleB);
        console.log('C:');
        console.log(moduleC);
        console.log('D:');
        console.log(moduleD);
        console.log('E:');
        console.log(moduleE);
    }


    return {
        init: init
    };
});
