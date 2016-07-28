define(function(require) {
    /**
     * @fileOverview A module for creating accordion/revealing content, like FAQs and toggles.
     * @author Sean McEmerson
     * @version 0.3.1
     * @requires lib:jquery
     * @requires module:animations
     */
    var $ = require('jquery'),
        UIAnimation = require('modules/ui/animation');


    /**
     * A module for creating accordion/revealing content, like FAQs and toggles.
     * @namespace Accordion
     * @constructor
     * @param {object} [_config] - User-defined configuration for the module
     * @example
     *  new Accordion({
     *      hidePreviousAnswers: false
     *  }).init();
     * @example
     *  <section id="test" class="accordion">
     *       <div class="accordion__group">
     *           <div class="accordion__group-header"><h3>Test section</h3></div>
     *           <ul class="accordion__items">
     *               <li>
     *                   <a href="#item1" class="accordion__item js-accordion-open" id="item1">A question</a>
     *                   <div class="accordion__item-content">
     *                       Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere.
     *                   <div>
     *               </li>
     *           </ul>
     *       </div>
     *   </section>
     * @return {Function} A new accordion instance which controls the opening/closing of hidden content within the accordion items.
     */   
    function Accordion (_config) {
        /**
         * @typedef Accordion.cache
         * @type multiple_variables
         * @description Cached commonly used jQuery selectors to increase performance
         * @property {object} $window - The window object
         * @property {object} $container - The accordion container
         * @property {object} $accrdion_sections - The sections within an accordion container
         * @property {object} $items - The accordion items
         */
        var $window, $container, $accordion_groups, $open_parent, $items, $accordion_items;

        /**
         * @typedef Accordion.cache
         * @type multiple_variables
         * @description Cached shared variables
         * @property {object} Animation - UIAnimation instance
         * @property {boolean} locked - The clickable state of the toggle items
         */
        var Animation, locked = false;

        /**
         * @typedef Accordion.config
         * @description Configuration for the accordion instance.
         * @type {object}
         * @property {object} [container] - The accordion container element
         * @property {number} [contentShowSpeed=800] - The length of time that the child opening animates
         * @property {number} [contentHideSpeed=400] - The length of time that the child closing animates
         * @property {boolean} [contentsToggle=true] - Add a toggle to open/close all children within a section (is added to the accordion's section element
         * @property {boolean} [hidePreviousAnswers=true] - If true, then the previous child will close when you open a new one
         * @property {boolean} [useHistory=false] - Use history api to save accordion state (if this is set to true then the <code>history</code> test must be enabled within Modernizr)(if this is set to true then the <code>history</code> test must be enabled within Modernizr)
         */
        var config = {
            container: null,
            contentShowSpeed: 800,
            contentHideSpeed: 400,
            contentsToggle: true,
            hidePreviousAnswers: true,
            useHistory: true
        };


        /**
         * Initiate module.
         * @memberOf Accordion
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

            Animation = new UIAnimation();

            _cache();
            _events();
            _setup();
        }


        /**
         * Cache commonly used selectors
         * @memberOf Accordion
         * @instance
         * @method _cache
         */
        function _cache () {
            $window = $(window);
            $container = $(config.container);
            $accordion_groups = $(config.container).find('.accordion__group');
            $accordion_items = $(config.container).find('.accordion__item');
        }


        /**
         * Handle events
         * @memberOf Accordion
         * @instance
         * @method _events
         */
        function _events () {
            $container.on('click.item', '.js-accordion-open', _itemClicked);
            $container.on('click.toggle', '.js-accordion-toggle', _toggleAnswers);
        }


        /**
         * Create revealing toggles etc.
         * @memberOf Accordion
         * @instance
         * @method _setup
         */        
        function _setup () {
            if (config.contentsToggle) {
                $accordion_groups.each(function (key, el) {
                    $(this).find('.accordion__group-header').append('<a href="#" class="accordion__toggle js-accordion-toggle"><span>Open</span> all</a>');
                });
            }

            /**
             * If there is a state defined in the URL then go to that slide
             */
            if (config.useHistory) {
                _checkHistory();
            }
        }


        /**
         * Handle opening/closing of accordion items
         * @memberOf Accordion
         * @instance
         * @method _itemClicked
         */
        function _itemClicked () {
            /**
             * Clear the backlog and clear any queued animations
             */
            $.Velocity.animate($items, 'stop');

            if (!locked) {
                var $this = $(this);

                /*
                 * If this item-content isn't already showing then show it
                 */
                if (!$this.hasClass('is-selected')) {
                    if (config.hidePreviousAnswers) {
                        /**
                         * If an item-content is open then close it
                         */
                        if ($open_parent) {
                            _hideAnswer($open_parent);
                        }
                    }

                    _lock()
                        .then(function () {
                            return _showAnswer($this);
                        })
                        .then(_unlock);
                } else {
                    _lock()
                        .then(function () {
                            return _hideAnswer($this);
                        })
                        .then(_unlock);
                }
            }

            return false;
        }

        
        /**
         * Show the child of an item
         * @memberOf Accordion
         * @instance
         * @param {object} $item - A jQuery object for a single item or all items
         * @method _showAnswer
         */        
        function _showAnswer ($item) {
            return new Promise(function (resolve) {
                var $this = ($item) ? $item : $(this);
                
                $.Velocity.animate($item.next(), 'slideDown', {
                    duration: config.contentShowSpeed,
                    easing: [500, 45]
                })
                    .then(resolve);

                /**
                 * Set this item-content to the open item-content
                 */
                $item.addClass('is-selected');
                $open_parent = $this;

                /**
                 * Add the item to the browser history
                 */
                if (config.useHistory) {
                    _updateHistory({
                        data: {
                            item_id: $this.id
                        },
                        title: $this[0].innerHTML,
                        url: $this.attr('href')
                    });
                }
            });
        }

        
        /**
         * Hide a item's item-content
         * @memberOf Accordion
         * @instance
         * @param {object} $item - A jQuery object for a single item or all items
         * @method _hideAnswer
         */
        function _hideAnswer ($item) {
            return new Promise(function (resolve) {
                $.Velocity.animate($item.next(), 'slideUp', {
                    duration: config.contentHideSpeed,
                    easing: Animation.config.easing.jui
                })
                    .then(resolve);

                /**
                 * Clear the open item-content
                 */
                $item.removeClass('is-selected');
                $open_parent = null;
            });
        }


        /**
         * Toggle all item-contents as opened or closed
         * @memberOf Accordion
         * @instance
         * @method _toggleAnswers
         */        
        function _toggleAnswers () {
            if (!locked) {
                var $this = $(this);
                var $section = $this.parent().parent();

                if (!$this.hasClass('is-selected')) {
                    _showAnswer($section.find('.js-accordion-open'));

                    $this.addClass('is-selected').find('span').html('Close');
                } else {
                    _hideAnswer($section.find('.js-accordion-open'));

                    $this.removeClass('is-selected').find('span').html('Open');
                }
            }

            return false;
        }


        /**
         * When a user lands on the page, check if there is a hash (a item ID) in the URL.
         * If there is a hash then we want to show that item-content and scroll the user to it.
         * @memberOf Accordion
         * @instance
         * @method _checkHistory
         */
        function _checkHistory () {
            if (Modernizr.history && window.location.hash) {
                var history_state = window.location.hash;

                /**
                 * If we have an active target trigger the click to view its inner content
                 */
                if (history_state.length && $container.find(history_state).length) {
                    $(history_state).trigger('click');

                    $.Velocity.animate($('html'), 'scroll', {
                        duration: Animation.config.duration.slow,
                        easing: Animation.config.easing.jui,
                        offset: ($(history_state).offset().top - 150)
                    });
                }
            }
        }


        /**
         * Update the user's history with the item they've just clicked on.
         * @memberOf Accordion
         * @instance
         * @method _updateHistory
         * @param {object} params -  the parameters to store in the user's history
         */        
        function _updateHistory (params) {
            if (Modernizr.history) {
                window.history.pushState(params.data, params.title, params.url);
            }
        }


        /**
         * Lock the UI.
         * @memberOf Accordion
         * @instance
         * @method _lock
         */  
        function _lock () {
            return new Promise(function (resolve) {
                locked = true;
                
                resolve();
            });
        }


        /**
         * Unlock the UI.
         * @memberOf Accordion
         * @instance
         * @method _unlock
         */  
        function _unlock () {
            return new Promise(function (resolve) {
                locked = false;
                
                resolve();
            });
        }


        return {
            init: init
        };
    }


    /**
     * @return {function} Return the Accordion function
     */
    return Accordion;
});
