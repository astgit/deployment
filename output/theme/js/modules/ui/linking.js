define(function (require) {
    'use strict';

    /**
     * @fileOverview A module for linking within a page
     * @author Jane Kelly
     * @version 0.1.0
     * @requires lib:jquery
     */
    var $ = require('jquery'),
        animation = require('modules/ui/animation');


    /**
     * A module for creating forms that extend FormAjax.
     * @namespace Linking
     * @constructor

     */
    function Linking(_config) {
        /**
         * @typedef Linking.cache
         * @type multiple_variables
         * @description Cached commonly used jQuery selectors to increase performance
         * @property {object} $captcha_refresh - The refresh captcha button
         * * @property {object} $captcha_image - The captcha image
         */
        var $window, $divs, $header, $nav, headerHeight, navHeight, $internalLinks, $linkedSection, linkedSectionOffset, offsetPadding;

        /**
         * @typedef Linking.config
         * @type {object}
         * @description Configuration for the Linking instance.
         * @property {object} [container="#contact-form"] - The selector for the form element
         * @property {string} [captchaRefreshURL] - The URL to request a new captcha image
         */
        var config = {
        };


        /**
         * Initiate module.
         * @memberOf Linking
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
         * @memberOf Linking 
         * @instance
         * @method _cache
         */
        function _cache() {
            $window = $(window);
            $divs = $('html,body');
            $internalLinks = $('.js-internal-link');
            $header = $('.site-header');
            $nav = $('.sub-nav');
            // Initial value for fixed header height
            headerHeight = 55;
            // Initial value for fixed nav height
            navHeight = 51;
            // Initial value for total offset padding
            offsetPadding = 106;
        }


        /**
         * Set up the initial state
         * @memberOf Linking
         * @instance
         * @method _setup
         */
        function _setup () {
            _flagLinks();
        }

        /**
         * Find the initial measurements
         * @memberOf Linking
         * @instance
         * @method _findMeasurements
         */
        function _findMeasurements () {
            if ($header.hasClass('site-header--fixed') && $header.outerHeight() > 0) {
                headerHeight = $header.outerHeight();
            }
            if ($nav.outerHeight() > 0) {
                navHeight = $nav.outerHeight();
            }
            if ($nav.length < 1) {
                navHeight = 0;
            }
            offsetPadding = headerHeight + navHeight;
        }

        /**
         * Listen for events and fire callbacks to handle them.
         * @memberOf Linking
         * @instance
         * @method _events
         */
        function _events () {
            $internalLinks.on('click', function (e) {
                e.preventDefault();
                _findMeasurements();
                _findSectionFromHref(e);
                _scrollToPoint(e);
            });

            // When the page is already loaded, scroll back up 
            // to allow for the sticky header and menu
            if (window.location.hash) {
                // _correctScrollPosition();
                $linkedSection = $(window.location.hash);
                _scrollToPoint();       
            }

            $window.on('resize', _findMeasurements);
            $window.on('scroll', _flagLinks);
        }

        function _findSectionFromHref (e) {
            $linkedSection = $($(e.currentTarget).attr('href'));
        }

        function _correctScrollPosition () {
            $('body,html').animate({
                scrollTop: $('body').scrollTop() - offsetPadding
            }, 'fast');
        }

        function _scrollToPoint () {
            
            linkedSectionOffset = $linkedSection.offset().top;

            // if subnav is not yet fixed, offset will need to account for subnav height
            if ($('.sub-nav--fixed').length === 0) {
                linkedSectionOffset -= navHeight;
            }
            $('body,html').animate({
                scrollTop: linkedSectionOffset - offsetPadding
            }, 'fast');

            _updateHash($linkedSection.attr('id'));            

        }

        function _flagLinks () {
            $('.sub-nav .js-internal-link').each(function () {
                var $section = $($(this).attr('href')),
                    $top = $section.offset().top - offsetPadding,
                    $bottom = $top + $section.outerHeight(),
                    $scrolltop = $(window).scrollTop();
                if ($scrolltop > $top && $scrolltop < $bottom) {
                    $(this).addClass('nav-active');
                } else {
                    $(this).removeClass('nav-active');
                }
            });
        }

        function _updateHash(id) {
            window.location.hash = id;
        }

        /**
         * @returns {object} - Returns public functions
         */
        return {
            init: init
        };

    }


    /**
     * @returns {function} Return the Linking instance
     */
    return Linking;
});