/**
 * A module for conditionally loading or modifying a site based on browsers, evnironments and available features.
 */
define((require) => {
    const stampit = require('stampit');
    const fastClick = require('lib/fastclick');
    const mBP = require('mobileBoilerplate');


    const conditions = stampit()
        .methods({
            init () {
                /**
                 * Detect touch devices and load helpers for improving the UX.
                 */
                if ('ontouchstart' in window || !!window.navigator.msMaxTouchPoints) {
                    this.touchInit();
                }
            },

            touchInit () {
                mBP.scaleFix();
                mBP.hideUrlBar();
                mBP.preventZoom();
                fastClick.attach(document.body);
            }
        })
        .create();


    return conditions;
});
