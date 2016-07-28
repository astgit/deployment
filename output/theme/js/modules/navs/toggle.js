define(function (require) {
    /**
     * @fileOverview A module for creating toggle navigations
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib:jquery
     */
    var $ = require('jquery');


    /**
     * A module for creating push navigations
     * @namespace NavToggle
     * @constructor
     * @param {object} [_config] - User-defined configuration for the module
     * @example
     *  new NavToggle({
     *      container: '#some-nav'
     *  });
     * @return {Function} A new navigation instance
     */
    function NavToggle (_config) {
        /**
         * @typedef NavToggle.cache
         * @type multiple_variables
         * @description Cached commonly used jQuery selectors to increase performance
         * @property {object} $container - The container containing the toggle nav
         * @property {object} $open_toggle - The currently open item
         */
        var $container, $open_toggle;

        /**
         * @typedef NavToggle.config
         * @description Configuration for the NavToggle instance.
         * @type {object}
         * @property {string} [container="#nav-site"] - The nav selector
         * @property {number} [itemShowSpeed=400] - The speed at which an item is revealed
         * @property {number} [itemHideSpeed=250] - The speed at which an item is hidden
         */
         var config = {
            container: '#nav-site',
            itemShowSpeed: 400,
            itemHideSpeed: 250
        };

        
        /**
         * Initiate module.
         * @memberOf NavToggle
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
        }


        /**
         * Cache commonly used selectors.
         * @memberOf NavToggle
         * @instance
         * @method _cache
         */
        function _cache () {
            $container = $(config.container);
        }


       /**
         * Handle events on the page.
         * @memberOf NavToggle
         * @instance
         * @method _events
         */
        function _events () {
            $container.on('click.navToggle', '.js-toggle-level', _toggle);
        }

       
        /**
         * Toggle a nav level open or closed.
         * @memberOf NavToggle
         * @instance
         */
        function _toggle () {
            var $this = $(this);
            var $this_item = $this.parent().parent();
            var $this_container = $this.parent();

            if ($this_item.hasClass('is-active')) {
                $this_container.removeClass('is-active');
                $this_item.removeClass('is-active');
                $this_item.find('> .toggle-nav').slideToggle(config.itemHideSpeed);

                $open_toggle = null;
            } else {
                $this_container.addClass('is-active');
                $this_item.addClass('is-active');
                $this_item.find('> .toggle-nav').slideToggle(config.itemShowSpeed);

                $open_toggle = $this;
            }

            return false;
        }


        return {
            init: init
        };
    }


    /**
     * @return {function} Return the NavToggle function
     */
    return NavToggle;
});