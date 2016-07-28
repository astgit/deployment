define(function (require) {
    'use strict';

    /**
     * @fileOverview A module for creating forms that extend FormAjax.
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib:jquery
     * @requires lib:parsley
     */
    var $ = require('jquery'),
        FormAjax = require('modules/forms/ajax');


    /**
     * A module for creating forms that extend FormAjax.
     * @namespace FormContact
     * @constructor
     * @param {object} [_config] - User-defined configuration for the module
     * @example
     *  new FormContact({
     *      container: '#contact-form'
     *  }).init();
     * @example
     *  <form id="contact-form">
     *      <input type="email" name="email" placeholder="Your email address">
     *      <button type="submit">Submit</button>
     * </form>
     * @return {Function} A new FormContact instance that used FormAjax to post data.
     */
    function FormContact(_config) {
        /**
         * @typedef FormContact.cache
         * @type multiple_variables
         * @description Cached commonly used jQuery selectors to increase performance
         * @property {object} $captcha_refresh - The refresh captcha button
         * * @property {object} $captcha_image - The captcha image
         */
        var $captcha_refresh, $captcha_image;


        /**
         * @typedef FormContact.config
         * @type {object}
         * @description Configuration for the FormContact instance.
         * @property {object} [container="#contact-form"] - The selector for the form element
         * @property {string} [captchaRefreshURL] - The URL to request a new captcha image
         */
        var config = {
            container: '#contact-form',
            captchaRefreshURL: ''
        };


        /**
         * Initiate module.
         * @memberOf FormContact
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
            _setup();
            _events();

            new FormAjax(config).init();
        }


        /**
         * Cache commonly used selectors.
         * @memberOf FormContact 
         * @instance
         * @method _cache
         */
        function _cache() {
            $captcha_refresh = $(config.container).find('.js-captcha-refresh');
            $captcha_image = $(config.container).find('img.captcha');
        }


        /**
         * Listen for events and fire callbacks to handle them.
         * @memberOf FormContact
         * @instance
         * @method _events
         */
        function _events() {
            $captcha_refresh.on('click', _refreshCaptcha);
        }


        /**
         * Setup the form layout.
         * @memberOf FormContact
         * @instance
         * @method _setup
         */
        function _setup() {
            $captcha_refresh.detach().insertBefore('#id_enter_the_letters_from_the_image_1');
        }


        /**
         * Send a request to refresh the captcha image.
         * @memberOf FormContact
         * @instance
         * @method _refreshCaptcha
         */
        function _refreshCaptcha() {
            $.getJSON(config.captchaRefreshURL, {}, function(json) {
                $captcha_image[0].src = json.image_url;
                $captcha_image.next()[0].value= json.key;
            });

            return false;
        }


        /**
         * @returns {object} - Returns public functions
         */
        return {
            init: init
        };
    }


    /**
     * @returns {function} Return the FormContact instance
     */
    return FormContact;
});