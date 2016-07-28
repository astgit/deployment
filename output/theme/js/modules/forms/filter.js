define(function (require) {
    'use strict';

    /**
     * @fileOverview A module for filtering content via redirect, ajax or isotope sorting.
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib:jquery
     * @requires lib:parsley
     */
    var $ = require('jquery'),
        UIBase = require('modules/ui/ui');


    /**
     * A module for filtering content via redirect, ajax or isotope sorting.
     * @namespace Filter
     * @constructor
     * @param {object} [_config] - User-defined configuration for the module
     * @example
     *  new FormFilter({
     *      container: '#blog',
     *      items: '.grid__item'
     *  }).init();
     * @example
     *  <form>
     *      <select name="filter" id="filter">
     *          <option value="">--</option>
     *          <option value="date">date</option>
     *          <option value="category">category</option>
     *      </select>
     *  </form>
     *  <div class="grid" id="filter-content">
     *      <div class="grid__item">
     *          Blog content one
     *      </div><div class="grid__item">
     *          Blog content two
     *      </div><div class="grid__item">
     *          Blog content three
     *      </div><div class="grid__item">
     *          Blog content four
     *      </div><div class="grid__item">
     *          Blog content five
     *      </div><div class="grid__item">
     *          Blog content six
     *      </div> 
     * </div>
     * @return {Function} A new Filter instance that can filter and sort a page's content.
     */
    function FormFilter(_config) {
        /**
         * @typedef Filter.cache
         * @type multiple_variables
         * @description Cached commonly used jQuery selectors to increase performance
         * @property {object} $container - The container element
         * @property {object} $filter - The filter selector element
         * @property {object} $items - The container's filterable item elements
         */
        var $container, $filter, $items;


        /**
         * @typedef Filter.cache
         * @type multiple_variables
         * @description Cached shared variables
         * @property {string} current_filter - The value of the filter used
         * @property {object} [UI] - The UIBase module
         */
        var current_filter = '', UI;


        /**
         * @typedef Filter.config
         * @type {object}
         * @description Configuration for the Filter instance.
         * @property {string} [container="#filter-content"] - The container for the filterable items
         * @property {string} [filter="#filter"] - The filter select (this should be a select element)
         * @property {string} [items=".grid__item"] - The sortable items
         * @property {string} [filterType: 'submit'="submit"] - The type of action to take when the filter changes
         * @property {string} [postMethod="post"] - The method for requesting new content
         * @property {string} [postParameter=""] - If the post has a URL paramter specify it here
         * @property {string} [postURL] - The URL that new requests should be sent to
         */
        var config = {
            container: '#filter-content',
            filter: '#filter',
            filterType: 'submit',
            items: '.grid__item',
            postMethod: 'post',
            postParameter: '',
            postURL: ''
        };


        /**
         * Initiate module.
         * @memberOf Filter
         * @instance
         * @method init
         * @fires _cache
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
            _events();

            UI = new UIBase();
            UI.init();
        }


        /**
         * Cache commonly used selectors.
         * @memberOf Filter
         * @instance
         * @method _cache
         */
        function _cache () {
            $container = $(config.container);
            $filter = $(config.filter);
            $items = $(config.container).find(config.items);
        }


        /**
         * Listen for events and fire callbacks to handle them.
         * @memberOf Filter
         * @instance
         * @method _events
         */
        function _events () {
            $filter.on('submit', _submitHandler);
            $filter.find('select').on('change', _submitHandler);
        }


        /**
         * Handle submissions and changes on the filter form.
         * @memberOf Filter
         * @instance
         * @method _submitHandler
         */
        function _submitHandler () {
            _filter($filter.find('select'));

            return false;
        }


        /**
         * Filter content based on user filter choice.
         * @memberOf Filter
         * @instance
         * @method _filter
         */
        function _filter ($field) {
            if ($field.val() !== current_filter) {
                current_filter = $field.val();

                if (config.postMethod === 'post') {
                    UI.unload(config.postURL + ((config.postParameter) ? config.postParameter : '') + current_filter);
                } else {
                    _post();
                }   
            }

            return false;
        }   


        /**
         * Post the form data and deal with the success and error callbacks.
         * @memberOf Filter
         * @instance
         * @method submit
         */
        function _post() {
            var post = $.post(config.postURL, ((config.postParameter) ? config.postParameter + '=' : '') + current_filter);
                post.done(function(data) {
                    _postSuccess(data);
                });
                post.fail(function(data) {
                    _postError(data);
                });
        }


        /**
         * Handle successful form posts.
         * @memberOf Filter
         * @instance
         * @method _postSuccess
         * @param {string} [data] - The data returned from the post request
         */
        function _postSuccess(data) {
            _showFeedback('success', config.feedbackSuccessMessage, data);

            $form.find('.form-fields, button').slideUp(200);
        }


        /**
         * Handle failed form posts.
         * @memberOf Filter
         * @instance
         * @method _postError
         * @param {string} [data] - The data returned from the post request
         */
        function _postError(data) {
            _showFeedback('error', config.feedbackErrorMessage, data);
        }


        /**
         * @returns {object} - Returns public functions
         */
        var exports = {
            init: init
        };

        return exports;
    }


    /**
     * @returns {function} Return the Filter instance
     */
    return FormFilter;
});