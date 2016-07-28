define(function (require) {
    /**
     * @fileOverview A module for masonry layouts.
     * @author Sean McEmerson
     * @version 0.4.0
     * @requires lib:jquery
     * @requires lib:underscore
     * @requires lib:isotope
     * @requires lib:images-loaded
     * @requires lib:visible
     */
    var $ = require('jquery'),
        _ = require('underscore'),
        Isotope = require('lib/isotope'),
        ImagesLoaded = require('lib/images-loaded'),
        Visible = require('visible');


    /**
     * A module for creating masonry layouts.
     * @methodspace Masonry
     * @constructor
     * @param {object} _config - User-defined configuration for the map
     * @example
     *  var map = new Masonry().init();
     * @example
     *  <div class="grid masonry">
     *      <div class="grid__item one-quarter">
     *          [content]
     *      </div><div class="grid__item one-quarter">
     *          [content]
     *      </div><div class="grid__item one-quarter">
     *          [content]
     *      </div><div class="grid__item one-quarter">
     *          [content]
     *      </div>
     *  </div>
     * @return {Function} A new Masonry instance
     */
    function Masonry (_config) {
        /**
         * @typedef Masonry.cache
         * @type multiple_variables
         * @description Cached commonly used jQuery selectors to increase performance
         * @property {object} $window - The window object
         * @property {object} $document - The document object
         * @property {object} $body_html - jQuery object for the body/html elements
         * @property {object} $container - jQuery object for the masonry container
         * @property {object} $items - The items within the container
         * @property {object} $to_top - A button to return the user to the top of the page
         */
        var $window, $document, $body_html, $container, $items, $to_top;


        /**
         * @typedef Masonry.cache
         * @type multiple_variables
         * @description Cached shared variables
         * @property {object} hidden_items - All items within the masonry container that aren't visible
         * @property {object} masonry - The masonry plugin instance
         * @property {boolean} [load_new_items=true] - A switch for enabling/disabling the loading of new items
         */
        var hidden_items = {}, masonry = null, load_new_items = true;


        /**
         * @typedef Masonry.config
         * @description Configuration for the Masonry instance.
         * @type {object}
         * @property {string} [container="#masonry"] - The selector for the masonry container
         * @property {string} [itemSelector=".grid__item"] - The selector for the masonry items
         * @property {number} [scrollOffset=250] - The offset for showing/loading new items as a user scrolls
         * @property {string} [visibleOn="load|scroll"] - Set the action for showing/loading new items. If 'load', then all items are visible when the page loads. If 'scroll', the items are made visible as a user scrolls down the page.
         * @property {string} [visibleClass="animated fadeInUp"] - The class to add to the items when the become visible
         */
        var config = {
            container: '#masonry',
            itemSelector: '.grid__item',
            scrollOffset: 250,
            visibleOn: 'load',
            visibleClass: 'animated fadeInUp'
        };


        /**
         * Initiate module.
         * @memberOf Masonry
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

            /**
             * Ensure a masonry container exists
             */

            if ($container.length) {
                _events();
                _windowResized();


                /**
                 * If items should be visible as the user scrolls then we need to keep
                 * track of scroll position. Otherwise, by default all items are hidden
                 * so we need to make them visible
                 */

                if (config.visibleOn === 'scroll') {
                    _showVisibleItems();
                } else {
                    $container.addClass('masonry--items-visible');
                }
            }
        }


        /**
         * Cache commonly used selectors
         * @memberOf Masonry
         * @instance
         * @method _cache
         */
        function _cache () {
            $window = $(window);
            $document = $(document);
            $body_html = $('body, html');
            $container = $(config.container);
            $items = $(config.container).find(config.itemSelector);
            $to_top = $('.to-top');

            if (config.visibleOn === 'scroll') {
                config.scrollOffset = ($window.height() - config.scrollOffset);
            }

            /**
             * Add all items that are currently loaded on the page to the hiddenitems array
             */
            $items.each(function(i, element) {
                hidden_items[$(element).index()] = $(element);
            });
        }


        /**
         * Handle events on the page
         * @memberOf Masonry
         * @instance
         * @method _events
         */
        function _events () {
            /**
             * Listen for window resize and scroll
             */        
            $window.on('scroll.toTop', _.throttle(_scrollHandler, 500));
            $window.on('resize', _.throttle(_windowResized, 250));

            if (config.visibleOn === 'scroll') {
                _bindScroll();
            }

            /**
             * Scroll to top
             */            
            $to_top.on('click', scrollToTop);
        }


        /**
         * Change layout when the window is resized
         * @memberOf Masonry
         * @instance
         * @method _windowResized         */

        function _windowResized () {
            if (window.current_layout === 'palm') {
                _masonryDestroy();
            } else {
                _masonryInit();
            }
        }


        /**
         * Bind scrolling to show the user more masonry items as they scroll
         * @memberOf Masonry
         * @instance
         * @method _bindScroll
         */

        function _bindScroll () {
            $window.on('scroll.items', _.throttle(_showVisibleItems, 500));
        }


        /**
         * Remove the scroll listeners
         * @memberOf Masonry
         * @instance
         * @method _unbindScroll
         */
        function _unbindScroll () {
            $window.off('scroll.items');
        }


        /**
         * Handle custom events when a user scrolls.
         * @memberOf Masonry
         * @instance
         * @method _scrollHandler
         * @fires _showVisibleItems
         */
        function _scrollHandler () {
            if ($window.scrollTop() > $window.height()) {
                $to_top.addClass('is-visible');
            } else {
                $to_top.removeClass('is-visible');
            }
        }


        /**
         * Show items that have been scrolled into view. Once all items have been
         * shown then we can request new items from the CMS.
         * @memberOf Masonry
         * @instance
         * @method _showVisibleItems
         */
        function _showVisibleItems () {
            var counter = 0;

            /**
             * Loop through our list of hidden items. Any item that
             * is in view will be shown to the user
             */
            for (var key in hidden_items) {
                var $item = $(hidden_items[key]);

                if ($item.visible(config.scrollOffset)) {
                    /**
                     * Once an item is visible then we can remove it from
                     * the hidden items array
                     */                    
                    delete hidden_items[key];

                    /** 
                     * Add the visible class to the item
                     */                    
                    $item.addClass(config.visibleClass);
                }

                /**
                 * Limit the amount of loops per call
                 */                
                if (counter > 50) {
                    return;
                }

                counter++;
            }
        }


        /**
         * Create the masonry grid
         * @memberOf Masonry
         * @instance
         * @method _masonryInit
         * @fires _masonryImagesLoaded
         */
        function _masonryInit () {
            /**
             * Check if a masonry grid has already been created
             */            
            if (!masonry && $container.length) {
                masonry = new Isotope($container[0], {
                    itemSelector: config.itemSelector
                });

                /**
                 * Images from the first items are lazy loaded, let's show any
                 * image that isn't visible
                 */
                $container.find('.lazy-load').each(function() {
                    $(this).attr('src', $(this).attr('data-src'));
                });

                /**
                 * Reset the layout and restore item loading
                 */
                _masonryImagesLoaded();
            }
        }


        /**
         * When images are loaded in the grid we need to ensure the layout is correct
         * if unloaded image dimensions cause overlaps
         * @memberOf Masonry
         * @instance
         * @method _masonryImagesLoaded
         * @fires _masonryResetLayout
         */

        function _masonryImagesLoaded () {
            new ImagesLoaded($container, function() {
                _masonryResetLayout();
            });
        }


        /**
         * Reset the masonry layout.
         * @memberOf Masonry
         * @instance
         * @method _masonryResetLayout
         * @fires masonry#layout
         */
        function _masonryResetLayout () {
            /**
             * Check if masonry exists
             */            
            if (masonry) {
                masonry.layout();
            }
        }


        /**
         * Remove the masonry grid. This is used for removing masonry on mobile
         * viewports or smaller screens.
         * @memberOf Masonry
         * @instance
         * @method _masonryDestroy
         */
        function _masonryDestroy () {
            /**
             * Check if masonry exists, if it does the destroy it
             */            
            if (masonry) {
                masonry.destroy();
                masonry = null;
            }
        }


        /**
         * Scroll the user back to the top of the page
         * @memberOf Masonry
         * @instance
         * @method scrollToTop
         */        
        function scrollToTop () {
            $body_html.animate({
                scrollTop: 0
            }, 650);

            return false;
        }


        return {
            init: init,
            scrollToTop: scrollToTop
        };
    }


    /**
     * @returns {function} Return the Masonry function
     */
    return Masonry;
});