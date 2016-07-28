define((require) => {
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

    const mixin = require('lodash/utility/mixin');
    const has = require('lodash/object/has');


    mixin({
        globalData (key, empty = false) {
            let value = empty;

            if (has(window.globalData, key)) {
                value = window.globalData[key];
            }

            return value;
        }
    });
});
