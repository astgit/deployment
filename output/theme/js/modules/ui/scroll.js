define(function (require) {
    'use strict';

    /**
     * @fileOverview A module for doing things when the user scrolls
     * @author Jane Kelly
     * @version 0.1.0
     * @requires lib:jquery
     */
    var $ = require('jquery'),
        animation = require('modules/ui/animation');


    /**
     * A module for creating forms that extend FormAjax.
     * @namespace Scroll
     * @constructor

     */
    function Scroll(_config) {
        /**
         * @typedef Scroll.cache
         * @type multiple_variables
         * @description Cached commonly used jQuery selectors to increase performance
         * @property {object} $captcha_refresh - The refresh captcha button
         * * @property {object} $captcha_image - The captcha image
         */
        var $window, $body, $html, $header, $banner, headerHeight, difference, subnavOffsetTop, $subnav;

        /**
         * @typedef Scroll.config
         * @type {object}
         * @description Configuration for the Scroll instance.
         * @property {object} [container="#contact-form"] - The selector for the form element
         * @property {string} [captchaRefreshURL] - The URL to request a new captcha image
         */
        var config = {
        };


        /**
         * Initiate module.
         * @memberOf Scroll
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
         * @memberOf Scroll 
         * @instance
         * @method _cache
         */
        function _cache() {
            $window = $(window);
            $body = $('body');
            $html = $('html');
            $header = $('.site-header');
            $banner = $('.banner');
            headerHeight = 55;
            subnavOffsetTop = 360;
            $subnav = $('.sub-nav');
        }


        /**
         * Set up the initial state
         * @memberOf Scroll
         * @instance
         * @method _setup
         */
        function _setup () {
            // Capture the header height and the sub nav offset
            setTimeout(_findMeasurements, 500);

        }

        /**
         * Find the initial measurements
         * @memberOf Scroll
         * @instance
         * @method _findMeasurements
         */
        function _findMeasurements () {
            // Capture the header height and the sub nav offset
            if ($header.length > 0 && $banner.length > 0) {
                // headerHeight = $header.outerHeight();
                subnavOffsetTop = $banner.outerHeight();
            }

        }

        /**
         * Listen for events and fire callbacks to handle them.
         * @memberOf Scroll
         * @instance
         * @method _events
         */
        function _events () {
            _checkSubNav();
            $window.on('scroll', function () {
                _checkSubNav();
            });
            $window.on('resize', function () {
                _findMeasurements();
            })
        }


        /**
         * Populate results
         * @memberOf Scroll
         * @instance
         * @method _makeMenuSticky
         */
        function _checkSubNav () {

            //$subnav.css('top', headerHeight + 'px');

        }

        /**
         * @returns {object} - Returns public functions
         */
        return {
            init: init
        };
    }


    /**
     * @returns {function} Return the Scroll instance
     */
    return Scroll;
});