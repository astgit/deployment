define(function (require) {
    'use strict';

    /**
     * @fileOverview A module for adding TFL API info into Google Maps with Directions.
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib:promise
     */
    var promise = require('promise');


    /**
     * A module for adding TFL API info into Google Maps with Directions.
     * @namespace TFLAPI
     * @constructor
     * @return {Function} A new TFLAPI instance.
     */
    function TFLAPI () {
    	/**
         * Request London public transport details from TFL's external API.
         * @memberOf MapDirections
         * @instance
         * @method _showTFLTubeStatus
         */
        function _showTFLTubeStatus () {
            _getTFLTubeStatus();

            return false;
        }


        /**
         * Request London tube line status from TFL's external API.
         * @memberOf MapDirections
         * @instance
         * @method _getTFLTubeStatus
         */
        function _getTFLTubeStatus () {
            _createTFLTubeStatus();

            var $status = $.getJSON('http://tinychanges.co.uk/tests/pancentric-map-api/?type=lineStatus');

            $status
                .always(function (e) {
                })
                .fail(function (e) {
                    _showErrorMessage(true, 'Sorry, we couldn\'t find the latest tube info for you. Please check the <a href="http://www.tfl.gov.uk/">TFL website</a>.');
                })
                .done(function (data) {
                    _updateTFLTubeStatus(data);
                });
        }


        /**
         * Show matrix of current tube status
         * @memberOf MapDirections
         * @instance
         * @method _createTFLTubeStatus
         */
        function _createTFLTubeStatus () {
            if (!$('.tfl-tube').length) {
                var markup = '<ul class="nav flush tfl-tube animated fadeIn">' + 
                    '<li class="display--block text--center">Loading...</li>' + 
                '</ul>';

                $directions_toolbar.after(markup);
            } else {
                $('.tfl-tube').fadeIn(600);
            }
        }


        /**
         * Update the matrix of current tube status
         * @memberOf MapDirections
         * @instance
         * @method _updateTFLTubeStatus
         */
        function _updateTFLTubeStatus (data) {
            var markup = '';

            $.each(data, function (key, val) {
                markup += '<li class="line line--' + val.name_class + '"><a href="http://www.tfl.gov.uk/tube-dlr-overground/status/" class="external" title="The ' + val.name + ' line is currently running with' + ((val.status === 'active') ? ' no' : '') + ' delays"><span class="icon-' + ((val.status === 'active') ? 'checkmark' : 'warning') + '"></span></a></li>';
            });

            $('.tfl-tube')[0].innerHTML = markup;
        }
    }


    /**
     * @return {function} Return the TFLAPI function
     */
    return TFLAPI;
});