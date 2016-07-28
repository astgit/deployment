define(function (require) {
    'use strict';

    /**
     * @fileOverview A template FormUI for creating a new FormUI.
     * @author Sean McEmerson
     * @version 0.0.0
     * @requires lib:jquery
     */
    var $ = require('jquery');


    /**
     * A template FormUI for creating a new FormUI.
     * @namespace FormUI
     * @constructor
     * @param {object} [_config] - User-defined configuration for the FormUI
     * @example
     *  new FormUI().init();
     * @return {Function} A new FormUI instance.
     */
    function FormUI(_config) {
        /**
         * @typedef FormUI.cache
         * @type multiple_variables
         * @description Cached commonly used jQuery selectors to increase performance
         */


        /**
         * @typedef FormUI.cache
         * @type multiple_variables
         * @description Cached shared variables
         */
        var $checkboxes, $radios, $labels;


        /**
         * @typedef FormUI.config
         * @type {object}
         * @description Configuration for the FormUI instance.
         */
        var config = {};


        /**
         * Initiate FormUI.
         * @memberOf FormUI
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
         * @memberOf FormUI
         * @instance
         * @method _cache
         */
        function _cache() {
            $labels = $('.custom-input');
            $checkboxes = $('.custom-checkbox');
            $radios = $('.custom-radio');
        }


        /**
         * Listen for events and fire callbacks to handle them.
         * @memberOf FormUI
         * @instance
         * @method _events
         */
        function _events() {
            $labels.on('click', _labelClick);
            // $checkboxes.on('click', _toggleCheckbox);            
            // $radios.on('click', _toggleRadio);
        }


        /**
         * Handle clicks on label text.
         * @memberOf FormUI
         * @instance
         * @method _labelClick
         */
        function _labelClick() {
            var $this = $(this);

            if ($this.find('.custom-checkbox')) {
                _toggleCheckbox($this.find('.custom-checkbox'));
            } else if ($this.find('.custom-radio')) {
                _toggleRadio($this.find('.custom-radio'));
            }
        }


        /**
         * Toggle the state of custom checkboxes.
         * @memberOf FormUI
         * @instance
         * @method _toggleCheckbox
         */
        function _toggleCheckbox($element) {
            var $this = (($element) ? $element : $(this)),
                val;

            if ($this.hasClass('is-active')) {
                $this.removeClass('is-active');
                val = (typeof($this.attr('data-off')) === 'string') ? $this.attr('data-off') : 'off';
            } else {
                $this.addClass('is-active');
                val = (typeof($this.attr('data-on')) === 'string') ? $this.attr('data-on') : 'on';
            }

            
            if (!!$this.attr('data-element')) {
                $($this.attr('data-element')).val(val).trigger('change');
            } else {
                $this.parent().find('input').val(val).trigger('change');
            }
        }


        /**
         * Toggle the state of custom radios.
         * @memberOf FormUI
         * @instance
         * @method _toggleRadio
         */
        function _toggleRadio($element) {
            var $this = (($element) ? $element : $(this)),
                $field = $($this.attr('data-element')),
                val;


            if ($this.attr('data-on') !== $field.val()) {
                $('.custom-radio[data-element="' + $this.attr('data-element') + '"]').removeClass('is-active');

                $this.addClass('is-active');
                $field.val((!!$this.attr('data-on')) ? $this.attr('data-on') : 'on').trigger('change');
            }
        }


        /**
         * @returns {object} - Returns public functions
         */
        return {
            init: init
        };
    }


    /**
     * @returns {function} Return the FormUI instance
     */
    return FormUI;
});