define(function (require) {
    'use strict';

    /**
     * @fileOverview A module for creating forms that validate on the front-end.
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib:jquery
     * @requires lib:parsley
     */
    var $ = require('jquery'),
        parsley = require('parsley');


    /**
     * A module for creating forms that validate on the front-end.
     * @namespace FormValidate
     * @constructor
     * @param {object} [_config] - User-defined configuration for the module
     * @example
     *  new FormValidate({
     *      container: '#user-details'
     *  }).init();
     * @return {Function} A new FormValidate instance that validates a form's data
     */
    function FormValidate(_config) {
        /**
         * @typedef FormValidate.cache
         * @type multiple_variables
         * @description Cached commonly used jQuery selectors to increase performance
         * @property {object} $form - The form element
         * @property {object} $submit_button - The form's submit button
         */
        var $form, $submit_button;

        /**
         * @typedef FormValidate.cache
         * @type multiple_variables
         * @description Cached shared variables
         * @property {array} items - All FormValidate elements
         * @property {boolean} waiting - If the user is waiting an action to process then lock down form actions
         */
        var items = [], parsley_form, parsley_fields = {};


        /**
         * @typedef FormValidate.config
         * @type {object}
         * @description Configuration for the Map instance.
         * @property {object} [container="form[data-validate]"] - The selector for the form element
         * @property {string} [feedbackPosition="bottom"] - Show feedback positions before or after the form fields
         * @property {string} [feedbackSuccessMessage="Thanks! We\'ll be in touch soon."] - The message to show when form posts are successful
         * @property {string} [feedbackErrorMessage="Sorry, there was an error submitting your details. Please try again.] - The message to show when form posts are not successful
         * @property {string} [postURL] - The url that form posts will be sent to
         * @property {oject} [parsleyOptions] - Custom options for Parlsey validation plugin
         * @property {oject} [parsleyOptions.errorsContainer] - The placement of error messages. By default, it will place at the end of .form-fields__field container, otherwise it will appear next to the erroneous form field(s).
         */
        var config = {
            container: 'form[data-validate]',
            feedbackPosition: 'bottom',
            feedbackSuccessMessage: 'Thanks! We\'ll be in touch soon.',
            feedbackErrorMessage: 'Sorry, there was an error submitting your details. Please try again.',
            parsleyOptions: {
                errorsContainer: function (el) {
                    return el.$element.closest('.form__fields > li');
                },
                trigger: 'change keyup'
            }
        };


        /**
         * Initiate module.
         * @memberOf FormValidate
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
            _events();
            _setup();
        }


        /**
         * Cache commonly used selectors.
         * @memberOf FormValidate 
         * @instance
         * @method _cache
         */
        function _cache() {
            $form = $(config.container);
            $submit_button = $form.find('button[type=submit]');
        }


        /**
         * Listen for events and fire callbacks to handle them.
         * @memberOf FormValidate
         * @instance
         * @method _events
         */
        function _events() {
            $.listen('parsley:form:validated', _isValid);
            $.listen('parsley:field:init', _cacheField);
        }


        /**
         * Keep an array of the parsely fields in memory for later user when 
         * validating on the server-side.
         * @memberOf FormValidate
         * @instance
         * @method _cacheField
         */
        function _cacheField(field) {
            if (field.$element[0].name.match(/_[0-9]$/i)) {
                /**
                 * Slight hack here. If the field being validated is a captcha, its name has a number appended
                 * to differentiate the key and user input parts. This needs to be stripped off to match
                 * the name returned by the server validator
                 */
                parsley_fields[field.$element[0].name.substr(0, field.$element[0].name.length-2)] = field;
            } else {
                parsley_fields[field.$element[0].name] = field;
            }
        }


        /**
         * Setup the form and validation based on the configuration options.
         * @memberOf FormValidate
         * @instance
         * @method _setup
         */
        function _setup() {
            parsley_form = $form.parsley(config.parsleyOptions);
        }


        /**
         * Check if the form is valid.
         * @memberOf FormValidate
         * @instance
         * @method _isValid
         */
        function _isValid() {
            /**
             * If the form data is valid then call attention to the submit button
             */
            if ($form.parsley().isValid()) {
                /**
                 * TODO: fix this interaction
                 */
                //$form.find('button[type=submit]').addClass('animated pulse');
            }
        }


        /**
         * Show form feedback via an alert message block.
         * @memberOf FormValidate
         * @instance
         * @method _showFeedback
         * @param {string} type - The type of feedback to shwo
         * @param {object} [data] - The error message returned from XHR request
         */
        function _showFeedback(type, message, data) {
            var $el;

            if ($form.find('.alert')) {
                $form.find('.alert').remove();
            }

            var error_list = '';

            if (data.errors !== undefined) {
                error_list = '<ul>';

                for (var e in data.errors) {
                    if (e in parsley_fields) {
                        window.ParsleyUI.removeError(parsley_fields[e], 'server-side');
                        window.ParsleyUI.addError(parsley_fields[e], 'server-side', data.errors[e]);
                    }
                }
            }

            if (data.new_captcha_key !== undefined) {
                $('img.captcha')[0].src = data.new_captcha_image;
                $('img.captcha').siblings('input[type=hidden]').val(data.new_captcha_key);
            }

            $el = $('<div class="alert alert--' + type + ' animated fadeIn">' + message + '</div>');

            if (config.feedbackPosition === 'top') {
                $form.find('.form-fields').before($el);
            } else {
                $form.find('.form-fields').after($el);
            }
        }


        /**
         * Hide form feedback.
         * @memberOf FormValidate
         * @instance
         * @method _hideFeedback
         */
        function _hideFeedback() {
            $form.find('.alert').remove();
        }


        /**
         * @returns {object} - Returns public functions
         */
        return {
            init: init
        };
    }


    /**
     * @returns {function} Return the FormValidate instance
     */
    return FormValidate;
});