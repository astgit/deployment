define(function (require) {
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

    var stampit = require('stampit');
    var fastdom = require('fastdom');
    var $ = require('jquery');
    var Modernizr = require('modernizr');
    var throttle = require('lodash/function/throttle');

    /**
     * Bypass VH bug on iOS 7 until a better fix can be added
     */
    var vhSupport = Modernizr.cssvhunit && !navigator.userAgent.match(/(iPod|iPhone|iPad)/);

    var overlayNav = stampit().state({
        isActive: false
    }).methods({
        /**
         * Hello, world
         * @method init
         */
        init: function init() {
            var _this = this;

            fastdom.read(function () {
                _this.$window = $(window);
                _this.$body = $('body');
                _this.$toggle = $('.js-open-overlay-nav');
                _this.$overlay = $('.js-overlay-nav');
                _this.$container = _this.$overlay.find('.overlay-nav__outer');

                _this.$toggle.on('click.openOverlayNav', $.proxy(_this.clickHandler, _this));
            });
        },

        /**
         * Handle clicks from the toggle button
         * @method clickHandler
         */
        clickHandler: function clickHandler() {
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
        addEventHandlers: function addEventHandlers() {
            if (!vhSupport) {
                this.$window.on('resize', throttle(this.setHeight, 250).bind(this));
            }

            this.$window.on('keyup', throttle(this.keyCapture, 250).bind(this));
        },

        /**
         * Remove an event handler for when the window is resized
         * @method removeEventHandlers
         */
        removeEventHandlers: function removeEventHandlers() {
            if (!vhSupport) {
                this.$window.off('resize');
            }

            this.$window.off('keyup');
        },

        /**
         * Capture events from key hits
         * @method keyCapture
         */
        keyCapture: function keyCapture(e) {
            if (e.keyCode === 27 && this.isActive) {
                this.hideNav();
            }
        },

        /**
         * Show an overlay nav
         * @method showNav
         */
        showNav: function showNav() {
            var _this2 = this;

            this.addEventHandlers();

            if (!vhSupport) {
                this.setHeight();
            }

            fastdom.write(function () {
                _this2.$toggle.addClass('hamburger--active');
                _this2.$body.addClass('scroll-lock');
                _this2.$overlay.addClass('overlay-nav--active').removeClass('hide');

                fastdom.defer(function () {
                    _this2.$container.addClass('overlay-nav__outer--active');
                    _this2.isActive = true;
                });
            });
        },

        /**
         * Hide an overlay nav
         * @method hideNav
         */
        hideNav: function hideNav() {
            var _this3 = this;

            this.removeEventHandlers();

            fastdom.write(function () {
                _this3.$toggle.removeClass('hamburger--active');
                _this3.$body.removeClass('scroll-lock');
                _this3.$container.removeClass('overlay-nav__outer--active');
                _this3.$overlay.addClass('overlay-nav--closing');

                setTimeout(function () {
                    _this3.$overlay.removeClass('overlay-nav--active overlay-nav--closing').addClass('hide');
                    _this3.isActive = false;
                }, 600);
            });
        },

        /**
         * Fallback function to set minimum heigth of the overlay if CSS
         * viewport units are not supported
         */
        setHeight: function setHeight() {
            var _this4 = this;

            fastdom.write(function () {
                _this4.$overlay.css('min-height', _this4.$window.height());
            });
        }
    }).create();

    return overlayNav;
});