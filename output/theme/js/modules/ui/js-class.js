define(function (require) {
    /**
     * A module for adding a class representing JS support. We've moved this away from Modernizr so
     * we have more control over the "cutting the mustard" test.
     *
     * @module jsClass
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib/fastdom
     * @requires lib/stampit
     *
     * @example <caption>Include the module</caption>
     *  let jsClass = require('modules/ui/jsClass');
     *
     * @example <caption>Instantiate the module</caption>
     *  jsClass.init();
     */

    var fastdom = require('fastdom');
    var stampit = require('stampit');

    var jsClass = stampit().methods({
        /**
         * Add class to HTML tag.
         * @method init
         */
        init: function init() {
            fastdom.read(function () {
                var tag = document.querySelector('html');

                fastdom.write(function () {
                    tag.classList.remove('no-js');
                    tag.classList.add('js');
                });
            });
        }

    }).create();

    return jsClass;
});