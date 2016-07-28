define(function (require) {
    'use strict';

    /**
     * @fileOverview A module showing an overlay when users try to navigate to financial intermediaries
     * @author Jane Kelly
     * @version 0.1.0
     * @requires lib:jquery
     * @requires lib:parsley
     */
    var $ = require('jquery');


    /**
     * A module for creating forms that extend FormAjax.
     * @namespace Bdm
     * @constructor
     * @param {object} [_config] - User-defined configuration for the module
     * @example
     *  new Bdm({
     *      container: '#contact-form'
     *  }).init();
     * @example
     *  <form id="contact-form">
     *      <input type="email" name="email" placeholder="Your email address">
     *      <button type="submit">Submit</button>
     * </form>
     * @return {Function} A new Bdm instance that used FormAjax to post data.
     */
    function Overlay(_config) {
        /**
         * @typedef Bdm.cache
         * @type multiple_variables
         * @description Cached commonly used jQuery selectors to increase performance
         * @property {object} $captcha_refresh - The refresh captcha button
         * * @property {object} $captcha_image - The captcha image
         */
        var $overlay,
            $overlayTrigger,
            $overlayCloseButton;

        /**
         * @typedef Bdm.config
         * @type {object}
         * @description Configuration for the Bdm instance.
         * @property {object} [container="#contact-form"] - The selector for the form element
         * @property {string} [captchaRefreshURL] - The URL to request a new captcha image
         */
        var config = {
        };


        /**
         * Initiate module.
         * @memberOf Bdm
         * @instance
         * @method init
         * @fires _cache
         * @fires _setup
         * @fires _events
         */        
        function init () {
            /**
             * Merge custom/base configuration
             * TODO: drop jQuery dependency
             */
            if (_config) {
                config = $.extend(true, config, _config);
            }

            _cache();
            _setup();
            _events();
        }


        /**
         * Cache commonly used selectors.
         * @memberOf Bdm 
         * @instance
         * @method _cache
         */
        function _cache() {
            $overlayTrigger = $('.js-overlay-trigger');
            $overlayCloseButton = $('.js-overlay-close');
        }


        /**
         * Set up the initial state
         * @memberOf Bdm
         * @instance
         * @method _setup
         */
        function _setup () {
        }

        /**
         * Listen for events and fire callbacks to handle them.
         * @memberOf Bdm
         * @instance
         * @method _events
         */
        function _events () {
            if ($overlayTrigger !== undefined) {
                $overlayTrigger.on('click', function (e) {
                    e.preventDefault();
                    $overlay = $('#' + $overlayTrigger.data('overlaytarget'));
                    $overlayCloseButton = $overlay.find('.js-overlay-close');
                    _openOverlay();
                }); 
            }
            if ($overlayCloseButton !== undefined) {
                $overlayCloseButton.on('click', function (e) {
                    e.preventDefault();
                    $overlay = $(this).parents('.overlay');
                    _closeOverlay();
                });
            }

        }


        /**
         * Open the overlay
         * @memberOf Overlay
         * @instance
         * @method _openOverlay
         */
        function _openOverlay () {
            $overlay.addClass('is-fixed');
        }


        /**
         * Close the overlay
         * @memberOf Overlay
         * @instance
         * @method _closeOverlay
         */
        function _closeOverlay () {
            $overlay.removeClass('is-fixed');
        }


        /**
         * @returns {object} - Returns public functions
         */
        return {
            init: init
        };
    }


    /**
     * @returns {function} Return the Overlay instance
     */
    return Overlay;
});
