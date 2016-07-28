define(function (require) {
    /**
     * A module
     *
     * @module module
     * @author -
     * @version 0.0.0
     * @requires lib/stampit
     * @requires lib/fastdom
     * @requires lib/jquery
     * @requires lib/lodash/object/merge
     *
     * @example <caption>Include the module</caption>
     *  let module = require('modules/modules/module');
     *
     * @example <caption>Instantiate the module</caption>
     *  module.init();
     */

    var stampit = require('stampit');
    var fastdom = require('fastdom');
    var $ = require('jquery');
    var merge = require('lodash/object/merge');

    var module = stampit().state({
        config: {}
    }).methods({
        /**
         * Hello, world
         * @method init
         */
        init: function init(userConfig) {
            this.config = merge({}, this.config, userConfig);
        }
    }).enclose(function () {});
    //.create();

    return module;
});