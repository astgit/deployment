/* global Headroom */

define(function(require) {
    /**
     * @fileOverview A module for creating sticky elements
     * @author Sean McEmerson
     * @version 0.2.0
     * @requires lib:jquery
     * @requires lib:underscore
     */
    var $ = require('jquery'),
        headroom = require('headroom'),
        stickyKit = require('stickykit'),
        UIBase = require('modules/ui/ui');


    /**
     * A module for creating sticky elements
     * @namespace Sticky
     * @constructor
     * @param {object} [_config] - User-defined configuration for the elements
     * @example
     *  new Sticky().init();
     * @example
     *  <nav class="sticky">
     *      <ul>
     *          ...
     *      </ul>
     *  </nav>
     * @return {Function} A new Sticky instance that will stick content on the page depending on  where the user has scrolled.
     */
    function Sticky(_config) {
        /**
         * @typedef Sticky.cache
         * @type multiple_variables
         * @description Cached commonly used jQuery selectors to increase performance
         * @property {object} $window - The window object
         * @property {object} $document - The document object
         * @property {object} $item - The sticky element container
         * @property {object} $parent - The parent item that affects the sticky item position
         * @property {object} $footer - The site's footer
         */
        var $container;


        /**
         * @typedef Sticky.cache
         * @type multiple_variables
         * @description Cached shared variables
         * @property {number} scroll_top - The window's current scroll position
         * @property {number} item_height - The height of the container element
         * @property {number} item_top - The offset position of the container
         * @property {number} item_last_scroll_top - The lascroll_top scrolled position of the container
         * @property {number} [item_offset=0] - A custom scroll offset for the container
         * @property {number} item_top_offset - The current offset of the scrolled container
         */
        var UI, headroom;


        /**
         * @typedef Sticky.config
         * @description Configuration for the Sticky instance.
         * @type {object}
         * @property {boolean} [animated=true] - Add animations to the different sticky states
         * @property {string} [container] - Only apply sticky to a single element
         * @property {string} [parentContainer] - The parent item that affects the sticky position
         * @property {boolean} [scrollIntent=false] - Show the sticky element on intent only (scroll up)
         */
        var config = {
            animated: true,
            container: null,
            options: {},
            parentContainer: null,
            scrollIntent: false
        };


        /**
         * Initiate module.
         * @memberOf Sticky
         * @instance
         * @method init
         */
        function init() {
            /**
             * Merge cuscroll_topom/base configuration
             * TODO: drop jQuery dependency
             */
            if (_config) {
                config = $.extend(true, config, _config);
            }

            new UIBase().resizeHandler();

            _cache();


            if (config.scrollIntent) {
                headroom = new Headroom(document.querySelector(config.container));
                headroom.init(config.options);
            } else {
                if (window.current_layout.indexOf('mobile') === -1) {
                    $container.stick_in_parent(config.options);
                }
            }
        }


        /**
         * Cache commonly used selectors.
         * @memberOf Sticky
         * @instance
         * @method _cache
         */
        function _cache() {
            $container = $(config.container);
        }


        return {
            init: init
        };
    }


    /**
     * @return {function} Return the Sticky function
     */
    return Sticky;
});