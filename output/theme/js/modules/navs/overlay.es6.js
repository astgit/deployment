define((require) => {
    /**
     * A module for creating overlay navigation layers
     *
     * @module overlayNav
     * @author Sean McEMerson
     * @version 0.1.0
     * @requires lib/stampit
     * @requires lib/fastdom
     * @requires lib/jquery
     * @requires lib/lodash/function/throttle
     * @requires modules/generic/modernizr
     *
     * @example <caption>Include the module</caption>
     *  let overlayNav = require('modules/navs/overlay');
     *
     * @example <caption>Instantiate the module</caption>
     *  overlayNav.init();
     */

    const stampit = require('stampit');
    const fastdom = require('fastdom');
    const $ = require('jquery');
    const Modernizr = require('modernizr');
    const throttle = require('lodash/function/throttle');


    /**
     * Bypass VH bug on iOS 7 until a better fix can be added
     */
    const vhSupport = (Modernizr.cssvhunit && !navigator.userAgent.match(/(iPod|iPhone|iPad)/));


    const overlayNav = stampit()
        .state({
            isActive: false
        })
        .methods({
            /**
             * Hello, world
             * @method init
             */
            init () {
                fastdom.read(() => {
                    this.$window = $(window);
                    this.$body = $('body');
                    this.$toggle = $('.js-open-overlay-nav');
                    this.$overlay = $('.js-overlay-nav');
                    this.$container = this.$overlay.find('.overlay-nav__outer');

                    this.$toggle.on(
                        'click.openOverlayNav',
                        $.proxy(this.clickHandler, this)
                    );
                });
            },

            /**
             * Handle clicks from the toggle button
             * @method clickHandler
             */
            clickHandler () {
                if (!this.isActive) {
                    this.showNav();
                } else {
                    this.hideNav();
                }

                return false;
            },

            /**
             * Add an event handler for when the window is resized
             * @method addEventHandlers
             */
            addEventHandlers () {
                if (!vhSupport) {
                    this.$window.on(
                        'resize',
                        throttle(this.setHeight, 250).bind(this)
                    );
                }

                this.$window.on(
                    'keyup',
                    throttle(this.keyCapture, 250).bind(this)
                );
            },

            /**
             * Remove an event handler for when the window is resized
             * @method removeEventHandlers
             */
            removeEventHandlers () {
                if (!vhSupport) {
                    this.$window.off('resize');
                }

                this.$window.off('keyup');
            },

            /**
             * Capture events from key hits
             * @method keyCapture
             */
            keyCapture (e) {
                if (e.keyCode === 27 && this.isActive) {
                    this.hideNav();
                }
            },

            /**
             * Show an overlay nav
             * @method showNav
             */
            showNav () {
                this.addEventHandlers();

                if (!vhSupport) {
                    this.setHeight();
                }

                fastdom.write(() => {
                    this.$toggle.addClass('hamburger--active');
                    this.$body.addClass('scroll-lock');
                    this.$overlay
                       .addClass('overlay-nav--active')
                       .removeClass('hide');

                    fastdom.defer(() => {
                        this.$container.addClass('overlay-nav__outer--active');
                        this.isActive = true;
                    });
                });
            },

            /**
             * Hide an overlay nav
             * @method hideNav
             */
            hideNav () {
                this.removeEventHandlers();

                fastdom.write(() => {
                    this.$toggle.removeClass('hamburger--active');
                    this.$body.removeClass('scroll-lock');
                    this.$container.removeClass('overlay-nav__outer--active');
                    this.$overlay.addClass('overlay-nav--closing');

                    setTimeout(() => {
                        this.$overlay
                            .removeClass('overlay-nav--active overlay-nav--closing')
                            .addClass('hide');
                        this.isActive = false;
                    }, 600);
                });
            },

            /**
             * Fallback function to set minimum heigth of the overlay if CSS
             * viewport units are not supported
             */
            setHeight () {
                fastdom.write(() => {
                    this.$overlay.css('min-height', this.$window.height());
                });
            }
        })
        .create();


    return overlayNav;
});
