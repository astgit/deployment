define((require) => {
    /**
     * A module for queueing animate.css animations to fire after xx delay, or programmatically.
     *
     * @module currentLayout
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib/jquery
     * @requires lib/lodash/function/throttle
     * @requires lib/stampit
     * @requires modules/generic/modernizr
     *
     * @example <caption>Include the module</caption>
     *  let currentLayout = require('modules/ui/current-layout');
     *
     * @example <caption>Add event listener for window resizes</caption>
     *  currentLayout.init();
     *
     * @example <caption>Get current layout</caption>
     *  currentLayout.layout();
     *
     * @example <caption>Test if the current layout contains a breakpoint (note use of tilde)</caption>
     *  let isMobile = currentLayout.is('~mobile');
     *
     * @example <caption>Test if the current layout equals a specific breakpoint</caption>
     *  let isSmallerMobile = currentLayout.is('mobile-small');
     *
     * @example <caption>Test if the current layout is not a breakpoint (note use of tilde)</caption>
     *  let notMobile = currentLayout.not('~mobile');
     *
     * @example <caption>Test if the current layout is not a breakpoint</caption>
     *  let notSmallMobile = currentLayout.not('mobile-small');
     */

    const $ = require('jquery');
    const throttle = require('lodash/function/throttle');
    const stampit = require('stampit');
    const Modernizr = require('modernizr');

    const currentLayout = stampit()
        .state({
            currentLayout: ''
        })
        .methods({
            /**
             * Save current layout and add event listener to window
             * @method init
             */
            init () {
                this.update();

                $(window).on('resize.currentLayout', throttle(this.update, 250).bind(this));
            },

            /**
             * Check whether the current layout matches an expected breakpoint.
             * @method is
             * @returns {Boolean} - Returns true/false if current layout matches
             */
            is (breakpoint) {
                let is = false;

                if (!breakpoint || (typeof breakpoint) !== 'string') {
                    is = false;
                } else if (breakpoint.charAt(0) === '~') {
                    is = this.currentLayout.indexOf(breakpoint.slice(1)) !== -1;
                } else {
                    is = this.currentLayout === breakpoint;
                }

                return is;
            },

            /**
             * Return the current layout
             * @method layout
             * @returns {String} the name of the current layout
             */
            layout () {
                /**
                 * Update the layout if it is not yet defined
                 */
                if ((typeof this.currentLayout) === 'undefined' || !this.currentLayout) {
                    this.update();
                }

                return this.currentLayout;
            },

            /**
             * Check whether the current layout does not match an expected breakpoint
             * @method not
             * @returns {Boolean} - Returns true/false if current layout does not match
             */
            not (breakpoint) {
                return !this.is(breakpoint);
            },

            /**
             * Updates the current layout based on current CSS breakpoint
             * @method updated
             * @returns {String} the name of the current layout
             */
            update () {
                /**
                 * Test for media queries: if not supported, show desktop for older browsers
                 */
                let mqSupport = true;

                if ((typeof Modernizr) !== 'undefined' && !Modernizr.mq('only all')) {
                    mqSupport = false;
                }

                if (mqSupport) {
                    this.currentLayout = window.getComputedStyle(document.body, ':before').getPropertyValue('content').replace(/["']/g, '');

                    /**
                     * If the layout cannot be read then default to desktop
                     * @ignore
                     */
                    if ((typeof this.currentLayout) !== 'string') {
                        this.currentLayout = 'desktop';
                    }
                } else {
                    this.currentLayout = 'desktop';
                }

                return this.currentLayout;
            }
        })
        .create();

    return currentLayout;
});
