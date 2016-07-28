define(function (require) {
    /**
     * @fileOverview A module for creating in-page toggle and go-to navigations
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib:jquery
     */
    var $ = require('jquery'),
    	_ = require('underscore'),
    	Sticky = require('modules/ui/sticky'),
        scrollspy = require('scrollspy');


    /**
     * A module for creating in-page toggle and go-to navigations
     * @namespace NavSub
     * @constructor
     * @param {object} [_config] - User-defined configuration for the module
     * @example
     *  new NavSub({
     *      container: '#some-nav'
     *  });
     * @return {Function} A new NavSub instance that will create in-page navigation between various anchors on the page. On mobile, it will change to a toggle menu.
     */
    function NavSub (_config) {
        /**
         * @typedef NavSub.cache
         * @type multiple_variables
         * @description Cached commonly used jQuery selectors to increase performance
         * @property {object} $window - The window object
         * @property {object} $body - The body element
         * @property {object} $nav - The nav element
         */
        var $window, $body, $nav;

        /**
         * @typedef NavSub.config
         * @description Configuration for the NavSub instance.
         * @type {object}
         * @property {string} [config.container="#nav-site"] - The nav selector
         * @property {number} [config.itemShowSpeed=400] - The speed at which an item is revealed
         * @property {number} [config.itemHideSpeed=250] - The speed at which an item is hidden
         */
         var config = {
            container: '#nav-site',
            itemShowSpeed: 400,
            itemHideSpeed: 250
        };


        /**
         * Initiate module.
         * @memberOf NavSub
         * @instance
         * @method init
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
            _events();

            $body.scrollspy({
                offset: 70,
                target: '.sub-nav'
            });

            var sticky_config = {
                container: '.sub-nav',
                parentContainer: '.desktop-nav-bar',
                scrollIntent: true
            };
            new Sticky(sticky_config).init();
        }


        /**
         * Cache commonly used selectors.
         * @memberOf NavSub
         * @instance
         * @method _cache
         */
        function _cache () {
            $window = $(window);
            $body = $('body');
            $nav = $('.sub-nav');
        }


       /**
         * Handle events on the page.
         * @memberOf NavSub
         * @instance
         * @method _events
         */
        function _events () {
            $nav.on('click.toggleOpen', 'a.js-sub-nav-toggle-open', _toggleOpen);
            $nav.on('click.toggleClosed', 'a.js-sub-nav-toggle-closed', _toggleClosed);
            $nav.on('click.toggleToClose', '.sub-nav__items a', _navClicked);
            
            $window.on('resize', _.throttle(_resizeHandler, 250));
        }


        /**
         * Handle events when the window is resized.
         * @memberOf NavSub
         * @instance
         * @method _resizerHandler
         */
        function _resizeHandler () {
        	/**
        	 * Override styles applied when opening/closing elements
        	 */
        	$('.sub-nav__items, .sub-nav__toggle').attr('style', '');
        }

       
        /**
         * Toggle a nav level open.
         * @memberOf NavSub
         * @instance
         */
        function _toggleOpen () {
            $nav.find('.sub-nav__toggle').slideUp(150);
            $nav.find('.sub-nav__items').slideDown(300);

            return false;
        }


        /**
         * Toggle a nav level open.
         * @memberOf NavSub
         * @instance
         */
        function _toggleClosed () {
            $nav.find('.sub-nav__items').slideUp(150);
            $nav.find('.sub-nav__toggle').slideDown(300);

            return false;
        }


        /**
         * Handle clicks of links within a nav (it should close the nav again).
         * @memberOf NavSub
         * @instance
         */
        function _navClicked () {
        	if (['portable-small', 'palm'].indexOf(window.current_layout) !== -1) {
	            _toggleClosed();

	            return true;
			}
        }

        return {
            init: init
        };
    }


    /**
     * @return {function} Return the NavSub function
     */
    return NavSub;
});