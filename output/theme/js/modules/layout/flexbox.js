define(function (require) {
    'use strict';

    /**
     * @fileOverview A template Flexitem for creating a new Flexitem.
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib:jquery
     */
    var $ = require('jquery'),
        _ = require('underscore'),
        UIBase = require('modules/ui/ui');


    /**
     * A template module for creating a new Flexitem.
     * @namespace Flexitem
     * @constructor
     * @param {object} [_config] - User-defined configuration for the Flexitem
     * @example
     *  new Flexitem().init();
     * @return {Function} A new Flexitem instance.
     */
    function Flexitem(_config) {
        /**
         * @typedef Flexitem.cache
         * @type multiple_variables
         * @description Cached commonly used jQuery selectors to increase performance
         */
        var $window, $all_items;


        /**
         * @typedef Flexitem.cache
         * @type multiple_variables
         * @description Cached shared variables
         */
        var UI;


        /**
         * @typedef Flexitem.config
         * @type {object}
         * @description Configuration for the Flexitem instance.
         */
        var config = {
            type: 'related'
        };


        /**
         * Initiate Flexitem.
         * @memberOf Flexitem
         * @instance
         * @method init
         */        
        function init (_config) {
            if (!Modernizr.flexbox) {
                /**
                 * Merge custom/base configuration
                 * TODO: drop jQuery dependency
                 */
                if (_config) {
                    config = $.extend(true, config, _config);
                }

                UI = new UIBase();
                UI.resizeHandler();

                _cache();
                _events();

                setHeights();
            }
        } 


        /**
         * Cache commonly used selectors.
         * @memberOf Flexitem
         * @instance
         * @method _cache
         */
        function _cache() {
            $window = $(window);
            $all_items = $('.flex-height');
        }


        /**
         * Listen for events and fire callbacks to handle them.
         * @memberOf Flexitem
         * @instance
         * @method _events
         */
        function _events() {
             $window
                .on('resize', _.debounce(setHeights, 200))
                .on('load', setHeights);
        }


        /**
         * Set the heights of  items.
         * @memberOf Flexitem
         * @instance
         * @method setHeights
         */
        function setHeights () {
            if (config.items) {
                _setHeightsRelated();
            } else {
                _setHeightsAll();
            }
        }


        /**
         * Set the heights of related items.
         * @memberOf Flexitem
         * @instance
         * @method setHeightsRelated
         */
        function _setHeightsRelated () {
            /**
             * Only fix the heights if we're not in mobile view
             */
            if (window.current_layout.indexOf('mobile') === -1) {
                $all_items.css({height: ''});

                $.each(config.items, function (key, val) {
                    var heights = [$('#' + key).outerHeight()];

                    for (var i = 0, length = val.length; i < length; i++) {
                        heights[heights.length] = $('#' + val[i]).outerHeight();
                    }

                    var tallest = Math.max.apply(Math, heights);
                    $('#' + key).css({height: tallest});

                    for (var j = 0, _length = val.length; j < _length; j++) {
                        $('#' + val[j]).css({height: tallest});
                    }
                });
            } else {
                $.each(config.items, function (key, val) {
                    $all_items.css({height: ''});
                });
            }
        }


        /**
         * Set the heights of all items.
         * @memberOf Flexitem
         * @instance
         * @method setHeightsAll
         */
        function _setHeightsAll () {
            if (window.current_layout.indexOf('mobile') === -1) {
                var heights = $all_items.map(function () {
                    return $(this).height();
                }).get();

                $all_items.height(Math.max.apply(null, heights));
            } else {
                $all_items.height('');
            }
        }


        /**
         * @returns {object} - Returns public functions
         */
        return {
            init: init,
            setHeights: setHeights
        };
    }


    /**
     * @returns {function} Return the Flexitem instance
     */
    return Flexitem;
});