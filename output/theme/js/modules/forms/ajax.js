define(function (require) {
    'use strict';

    /**
     * @fileOverview A module for creating forms that post its data via AJAX.
     * @author Sean McEmerson
     * @version 0.2.0
     * @requires lib:jquery
     * @requires lib:parsley
     */
    var $ = require('jquery'),
        parsley = require('parsley');


    /**
     * A module for creating forms that post its data via AJAX.
     * @namespace FormAjax
     * @constructor
     * @param {object} [_config] - User-defined configuration for the module
     * @example
     *  new FormAjax({
     *      container: '#user-details'
     *  }).init();
     * @example
     *  <form id="test">
     *      <input type="email" name="email" placeholder="Your email address">
     *      <button type="submit">Submit</button>
     * </form>
     * @return {Function} A new FormAjax instance that posts a form's data via AJAX once it has (optionally) passed validation
     */
    function FormAjax(_config) {
        /**
         * @typedef FormAjax.cache
         * @type multiple_variables
         * @description Cached commonly used jQuery selectors to increase performance
         * @property {object} $form - The form element
         * @property {object} $submit_button - The form's submit button
         * @property {object} $loading_spinner - The loading spinner for showing user feedback
         */
        var $form, $submit_button, $loading_spinner;

        /**
         * @typedef FormAjax.cache
         * @type multiple_variables
         * @description Cached shared variables
         * @property {array} items - All FormAjax elements
         * @property {boolean} waiting - If the user is waiting an action to process then lock down form actions
         */
        var items = [], parsley_form, parsley_fields = {}, is_waiting = false;


        /**
         * @typedef FormAjax.config
         * @type {object}
         * @description Configuration for the Map instance.
         * @property {object} [container="#ajax-form"] - The selector for the form element
         * @property {string} [feedbackPosition="bottom"] - Show feedback positions before or after the form fields
         * @property {string} [feedbackSuccessMessage="Thanks! We\'ll be in touch soon."] - The message to show when form posts are successful
         * @property {string} [feedbackErrorMessage="Sorry, there was an error submitting your details. Please try again.] - The message to show when form posts are not successful
         * @property {string} [postURL] - The url that form posts will be sent to
         * @property {oject} [parsleyOptions] - Custom options for Parlsey validation plugin
         * @property {oject} [parsleyOptions.errorsContainer] - The placement of error messages. By default, it will place at the end of .form-fields__field container, otherwise it will appear next to the erroneous form field(s).
         * @property {boolean} [validate=true] - Should the form be validated before submitting?
         */
        var config = {
            container: '#ajax-form',
            feedbackPosition: 'bottom',
            feedbackSuccessMessage: 'Thanks! We\'ll be in touch soon.',
            feedbackErrorMessage: 'Sorry, there was an error submitting your details. Please try again.',
            parsleyOptions: {
                errorsContainer: function (el) {
                    return el.$element.closest('.form-fields__field');
                }
            },
            postURL: '',
            validate: true
        };


        /**
         * Initiate module.
         * @memberOf FormAjax
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

            /**
             * If no postURL is defined use the URL defined from the form tag
             */
            if (!config.postURL.length && $form.attr('action').length > 1) {
                config.postURL = $form.attr('action');
            }
        }


        /**
         * Cache commonly used selectors.
         * @memberOf FormAjax 
         * @instance
         * @method _cache
         */
        function _cache() {
            $form = $(config.container);
            $submit_button = $form.find('button[type=submit]');
        }


        /**
         * Listen for events and fire callbacks to handle them.
         * @memberOf FormAjax
         * @instance
         * @method _events
         */
        function _events() {
            $form.on('submit', submit);

            if (config.validate) {
                $.listen('parsley:form:validated', _isValid);
                $.listen('parsley:field:init', _cacheField);
            }
        }


        /**
         * Keep an array of the parsely fields in memory for later user when 
         * validating on the server-side.
         * @memberOf FormAjax
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
         * @memberOf FormAjax
         * @instance
         * @method _setup
         */
        function _setup() {
            if (config.validate) {
                parsley_form = $form.parsley(config.parsleyOptions);
            }
        }


        /**
         * Check if the form is valid.
         * @memberOf FormAjax
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
         * Handle form submissions.
         * @memberOf FormAjax
         * @instance
         * @method submit
         */
        function submit() {
            if (!is_waiting) {
                /**
                 * If the form is valid then handle the post, otherwise let Parsley do its thang
                 */
                if (config.validate) {
                    if ($form.parsley().isValid()) {
                        _post();
                    }
                } else {
                    _post();
                }
            }

            return false;
        }


        /**
         * Post the form data and deal with the success and error callbacks.
         * @memberOf FormAjax
         * @instance
         * @method submit
         */
        function _post() {
            _isWaiting(true);

            $.post(config.postURL, $form.serialize())
                .always(function () {
                    _isWaiting(false);
                })
                .done(function(data) {
                    if (data.valid) {
                        _postSuccess(data); 
                    } else {
                        _postInvalid(data); 
                    }
                    
                })
                .fail(function(data, status, error) {
                    _postError(data);
                });
        }


        /**
         * Show the user some feedback if there's a waiting state (while form posts, for example).
         * @memberOf FormAjax
         * @instance
         * @method _isWaiting
         * @param {boolean} [waiting] - A boolean to set the waiting state
         */
        function _isWaiting (waiting) {
            if (waiting) {
                $submit_button.attr('disabled', 'disabled').addClass('is-waiting');
            } else {
                $submit_button.removeAttr('disabled').removeClass('is-waiting');
            }

            is_waiting = waiting;
        }



        /**
         * Handle successful form posts.
         * @memberOf FormAjax
         * @instance
         * @method _postSuccess
         * @param {string} type - The type of feedback to shwo
         * @param {object} [data] - The error message returned from XHR request
         */
        function _postSuccess(data) {
            var feedback = data.message.length > 0 ? data.message : config.feedbackSuccessMessage;
            _showFeedback('success', feedback, data);

            $form.find('.form-fields, button').slideUp(200);
        }

        /**
         * Handle form posts that failed server side validation.
         * @memberOf FormAjax
         * @instance
         * @method _postSuccess
         * @param {object} [data] - The error message returned from XHR request
         */
        function _postInvalid(data) {
            _showFeedback('error', data.message, data);
        }



        /**
         * Handle failed form posts.
         * @memberOf FormAjax
         * @instance
         * @method _postError
         * @param {object} [data] - The error message returned from XHR request
         */
        function _postError(data) {
            _showFeedback('error', config.feedbackErrorMessage, data);
        }


        /**
         * Show form feedback via an alert message block.
         * @memberOf FormAjax
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
         * @memberOf FormAjax
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
     * @returns {function} Return the FormAjax instance
     */
    return FormAjax;
});