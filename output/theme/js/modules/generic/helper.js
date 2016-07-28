define(function (require) {
    /**
     * A module for creating helper mixin functions with lodash.
     *
     * @module helper
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib/lodash/utility/mixin
     * @requires lib/lodash/object/has
     *
     * @example <caption>Include the module</caption>
     *  let helper = require('modules/generic/helper');
     *
     */

    var mixin = require('lodash/utility/mixin');
    var has = require('lodash/object/has');

    mixin({
        globalData: function globalData(key) {
            var empty = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            var value = empty;

            if (has(window.globalData, key)) {
                value = window.globalData[key];
            }

            return value;
        }
    });
});