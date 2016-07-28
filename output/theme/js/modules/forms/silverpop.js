define(function (require) {
    'use strict';

    /**
     * @fileOverview A module for finding your nearest Business Development manager
     * @author Jane Kelly
     * @version 0.1.0
     * @requires lib:jquery
     * @requires lib:parsley
     */
    var $ = require('jquery');


    /**
     * A module for creating forms that extend FormAjax.
     * @namespace Bdm
     * @constructor
     * @param {object} [_config] - User-defined configuration for the module
     * @example
     *  new Bdm({
     *      container: '#contact-form'
     *  }).init();
     * @example
     *  <form id="contact-form">
     *      <input type="email" name="email" placeholder="Your email address">
     *      <button type="submit">Submit</button>
     * </form>
     * @return {Function} A new Bdm instance that used FormAjax to post data.
     */
    function Bdm(_config) {
        /**
         * @typedef Bdm.cache
         * @type multiple_variables
         * @description Cached commonly used jQuery selectors to increase performance
         * @property {object} $captcha_refresh - The refresh captcha button
         * * @property {object} $captcha_image - The captcha image
         */
        var url,
            $bdmForm,
            $bdmPostcode,
            $bdmSubmit,
            $bdmResult,
            $bdmImage,
            $bdmName,
            $bdmTel,
            $bdmEmail,
            $bdmError,
            bdmUrl;

        /**
         * @typedef Bdm.config
         * @type {object}
         * @description Configuration for the Bdm instance.
         * @property {object} [container="#contact-form"] - The selector for the form element
         * @property {string} [captchaRefreshURL] - The URL to request a new captcha image
         */
        var config = {
        };


        /**
         * Initiate module.
         * @memberOf Bdm
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
        }


        /**
         * Cache commonly used selectors.
         * @memberOf Bdm 
         * @instance
         * @method _cache
         */
        function _cache() {
            $bdmForm = $('#js-bdm-form');
            $bdmPostcode = $('#id_postcode');
            $bdmSubmit = $('#js-bdm-submit');
            $bdmResult = $('#js-bdm-result');
            $bdmImage = $('#js-bdm-image');
            $bdmName = $('#js-bdm-name');
            $bdmTel = $('#js-bdm-tel');
            $bdmEmail = $('#js-bdm-email');
            $bdmError = $('#js-bdm-error');
            bdmUrl = "https://services.castletrust.co.uk/app/user/bdm.json?";
        }


        /**
         * Set up the initial state
         * @memberOf Bdm
         * @instance
         * @method _setup
         */
        function _setup () {
            $bdmResult.addClass('is-hidden');
        }

        /**
         * Listen for events and fire callbacks to handle them.
         * @memberOf Bdm
         * @instance
         * @method _events
         */
        function _events () {
            $bdmForm.on('submit', function (e) {
                e.preventDefault();
                _handleSubmit($(this).serialize());
            });
        }

        /**
         * Handle the form submit
         * @memberOf Bdm
         * @instance
         * @method _handleSubmit
         */
        function _handleSubmit (data) {
            console.log(data);
            $.ajax({
                url: bdmUrl + data,
                success: function (response) {
                    _populateResult(response.data.bdm);
                }
            });
        }

        /**
         * Populate results
         * @memberOf Bdm
         * @instance
         * @method _populateResult
         */
        function _populateResult (bdm) {
            $bdmImage.attr('src', 'https://www.castletrust-intermediaries.co.uk/assets/gfx/bdm/' + bdm.username + '.jpg');
            $bdmTel.html(bdm.phone);
            $bdmName.html(bdm.fullName);
            $bdmEmail.attr('href', bdm.email);
            $bdmEmail.html(bdm.email);
            _showResult();
        }

        /**
         * Show the result.
         * @memberOf Bdm
         * @instance
         * @method _handleError
         */
        function _showResult () {
            $bdmResult.removeClass('is-hidden');
        }

        /**
         * Handle an error.
         * @memberOf Bdm
         * @instance
         * @method _handleError
         */
        function _handleError () {
            $bdmError.removeClass('is-hidden');
        }

        /**
         * @returns {object} - Returns public functions
         */
        return {
            init: init
        };
    }


    /**
     * @returns {function} Return the Bdm instance
     */
    return Bdm;
});