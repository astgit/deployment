/**
 * A module for conditionally loading or modifying a site based on browsers, evnironments and available features.
 */
define(function (require) {
    var stampit = require('stampit');
    var fastClick = require('lib/fastclick');
    var mBP = require('mobileBoilerplate');

    var conditions = stampit().methods({
        init: function init() {
            /**
             * Detect touch devices and load helpers for improving the UX.
             */
            if ('ontouchstart' in window || !!window.navigator.msMaxTouchPoints) {
                this.touchInit();
            }
        },

        touchInit: function touchInit() {
            mBP.scaleFix();
            mBP.hideUrlBar();
            mBP.preventZoom();
            fastClick.attach(document.body);
        }
    }).create();

    return conditions;
});