define(function (require) {
    'use strict';

    /**
     * @fileOverview A module for creating directions for Google Map directions
     * @author Sean McEmerson
     * @version 0.4.2
     * @requires lib:jquery
     * @requires lib:underscore
     * @requires lib:cookies
     * @requires lib:jqueryeasing
     * @requires lib:promise
     * @requires module:ui/animations
     */
    var $ = require('jquery'),
        _ =  require('underscore'),
        cookies = require('cookies'),
        easing = require('jqueryEasing'),
        promise = require('promise'),
        UIAnimation = require('modules/ui/animation'),
        gmaps = require('modules/maps/gmaps');


    /**
     * A module for creating directions for Google Map directions
     * @namespace MapDirections
     * @constructor
     * @param {object} [_config] - User-defined configuration for the module
     * @example
     *  new MapDirections({
     *      map_container_id: map_container_id,
     *      map: map
     *  });
     * @return {Function} A new MapDirections instance
     */
    function MapDirections (_config) {
        /**
         * @typedef MapDirections.cache
         * @type multiple_variables
         * @description Cached commonly used jQuery selectors to increase performance
         * @property {object} $map_container - The map container element
         * @property {object} $directions_form - The directions form
         * @property {object} $directions_toolbar - The toolbar for directions results
         * @property {object} $directions_error - The error alert for directions feedback
         * @property {object} $directions_warning - The warning alert for directions feedback
         * @property {object} $location_options - The options for locationg a user
         * @property {object} $location_field - The input field in the form
         * @property {object} $travel_options - The options for travelling
         */
        var $map_container, $directions_form, $directions_toolbar, $directions_route, $directions_error, $directions_results, $directions_warning, $location_options, $location_field, $travel_options;


        /**
         * @typedef MapDirections.cache
         * @type multiple_variables
         * @description Cached shared variables
         * @property {object} Animation - UIAnimation instance
         * @property {object} config - The config object passed from the Map module
         * @property {object} visitor_location - A Google Map directions LatLng object
         * @property {string} map_container_id - The string ID for the map container
         * @property {object} map - The Google Map instance
         * @property {string} current_visitor_location - The value of the $location_field
         * @property {string} [selected_travel_mode="driving"] - The transport mode when calculating directions
         * @property {boolean} routes_calculated - Calculated routes are flagged to prevent re-calculation (which increase usage limits on Google Map directions quota)
         * @property {boolean} locked - If the toolbar is locked or not
         * @property {object} gmapsGeocoder - An instance of Google Maps geocoding service
         * @property {object} gmapsDirectionsService - An instance of Google Maps directions service
         * @property {object} gmapsDirectionsRenderer - An instance of Google Maps directions rendering service
         * @property {object} travel_mode_text - The UI values of the Google Map directions transport options
         * @property {object} travel_mode_summary - The words used in the route summary based on travel mode
         * @property {object} travel_mode_key - The key used in the Google services based on travel mode
         * @property {object} columns - Named column numbers for the toolbar grid
         */
        var Animation, config, map_container_id, map, visitor_location, current_visitor_location, selected_travel_mode = 'driving', routes_calculated, gmapsGeocoder, gmapsDirectionsService, gmapsDirectionsRenderer, locked = false,
        travel_mode_text = {
            transit: 'by public transport',
            driving: 'by car',
            walking: 'on foot',
            bicycling: 'by bike'
        },
        travel_mode_key = {
            transit: 'r',
            driving: 'd',
            walking: 'w',
            bicycling: 'b'
        },
        travel_mode_summary = {
            transit: 'travel',
            driving: 'drive',
            walking: 'walk',
            bicycling: 'cycle'
        },
        columns = {
            1: 'one',
            2: 'two',
            3: 'three',
            4: 'four',
            5: 'five',
            6: 'six',
            7: 'seven',
            8: 'eight',
            9: 'nine',
            10: 'ten',
            11: 'eleven',
            12: 'twelve'
        };

        
        /**
         * Initiate module.
         * @memberOf MapDirections
         * @instance
         * @method init
         */     
        function init () {
            /**
             * Init animations
             */
            Animation = new UIAnimation();
            
            /**
             * Save cookie data as JSON
             */
            $.cookie.json = true;

            /**
             * Merge custom/base configuration
             * TODO: drop jQuery dependency
             */
            if (_config) {
                config = _config;
            }

            if (config.map) {
                /**
                 * Cache values passed through from the Map module
                 */
                $map_container = config.$map_container;
                map_container_id = config.map_container_id;
                map = config.map;

                _setup();
                _events();
                _resetUserOptions();
            }
        }


        /**
         * Handle events on the page. Some events are created within _setup().
         * @memberOf MapDirections
         * @instance
         * @method _events
         */
        function _events () {
            $directions_form.on('submit', _submitHandler);
            $location_field.on('keyup.userInput', _.throttle(_changedLocationField, 250));
            $location_options.on('click', '.js-find-me', _findUserLocation);
            $travel_options.on('click', 'a', _changeTravelMode);

            config.$map_container.parent().on('click', '.js-directions-toggle', _toggleRouteResults);
            config.$map_container.parent().on('click', '.js-directions-print', _printRouteResults);
            config.$map_container.parent().on('click', '.js-directions-launch-app', _launchMapsWithRouteResults);
            // config.$map_container.parent().on('click', '.js-show-tube-status', _showTFLTubeStatus);
        }


        /**
         * Setup the Google Map directions services we need for calculating directions and then
         * embed the directions toolbar.
         * @memberOf MapDirections
         * @instance
         * @method _setup
         */        
        function _setup () {
            gmapsGeocoder = new gmaps.Geocoder();
            gmapsDirectionsService = new gmaps.DirectionsService();
            gmapsDirectionsRenderer = new gmaps.DirectionsRenderer();

            gmapsDirectionsRenderer.setMap(map);
            embedToolbar();
            embedResults();
        }


        /**
         * Embed the travel options toolbar (requires Modernizr <code>geolocation</code> test).
         * @memberOf MapDirections
         * @instance
         * @method embedToolbar
         */
        function embedToolbar () {
            /* Only add 'find me' button if HTML5 geocoding is supported */
            var find_user_location_button = (Modernizr.geolocation) ? '<a href="#" class="button button--geolocate js-find-me" title="Find my location"><span class="icon-crosshairs"></span></a>' : '';
            var toolbar_markup = '<div class="map-embed__directions map-embed__directions--' + config.baseConfig.directionsPositionY + '">';

                if (config.baseConfig.directionsSpanColumns < 12) {
                    toolbar_markup += '<div class="grid grid--flush">' +
                        '<div class="grid__item ' + columns[(12 - config.baseConfig.directionsSpanColumns)] + '-twelfths portable-small-one-whole map-embed__title">' +
                        '    &nbsp;' +
                        '</div><div class="grid__item ' + columns[config.baseConfig.directionsSpanColumns] + '-twelfths portable-small-one-whole map-embed__toolbar">';
                }

                toolbar_markup += '<form action="#">' +
                    '<div class="grid grid--tight">' +
                    '    <div class="grid__item four-twelfths portable-five-twelfths portable-small-four-twelfths palm-one-half">' +
                    '        <div class="grid grid--flush travel-options">' +
                    '            <div class="grid__item one-quarter">' +
                    '                <a href="#" data-mode="driving" class="travel-options__item driving is-selected" title="Driving">' +
                    '                    <span class="icon-driving"></span>' +
                    '                </a>' +
                    '            </div><div class="grid__item one-quarter">' +
                    '                <a href="#" data-mode="transit" class="travel-options__item transit" title="Public transport">' +
                    '                    <span class="icon-transit"></span>' +
                    '                </a>' +
                    '            </div><div class="grid__item one-quarter">' +
                    '                <a href="#" data-mode="walking" class="travel-options__item walking" title="Walking">' +
                    '                    <span class="icon-walking"></span>' +
                    '                </a>' +
                    '            </div><div class="grid__item one-quarter">' +
                    '                <a href="#" data-mode="bicycling" class="travel-options__item bicycling" title="Cycling">' +
                    '                    <span class="icon-cycling"></span>' +
                    '                </a>' +
                    '            </div>' +
                    '        </div>' +
                    '    </div><div class="grid__item six-twelfths portable-five-twelfths portable-small-five-twelfths palm-one-half location-options">' +
                    '        <input type="text" class="text-input visitor-location" name="from" placeholder="From:">' +
                    '        ' + find_user_location_button +
                    '    </div><div class="grid__item two-twelfths portable-small-three-twelfths palm-one-whole location-options">' +
                    '        <button type="submit" title="Go" class="button display--block" disabled>Go</button>' +
                    '    </div>' +
                    '</div>' +
                '</form>';

                if (config.baseConfig.directionsSpanColumns) {
                    toolbar_markup += '</div>' +
                    '</div>';
                }

            toolbar_markup += '</div>' + 
            '<div class="alert alert--error" style="display: none;"></div>';


            /**
             * Position the toolbar based on the config option
             */
            if (config.baseConfig.directionsPositionY === 'top') {
                config.$map_container.before(toolbar_markup);
            } else {
                config.$map_container.after(toolbar_markup);
            }

            var $container_parent = config.$map_container.parent();
            $directions_form = $container_parent.find('form');
            $directions_error = $container_parent.find('.alert--error');
            $location_options = $container_parent.find('.location-options');
            $location_field = $container_parent.find('.visitor-location');
            $travel_options = $container_parent.find('.travel-options');
        }


        /**
         * Embed the directions results.
         * @memberOf MapDirections
         * @instance
         * @method embedResults
         */
        function embedResults () {
            var results_markup = '<div class="map-embed__directions-results" style="display: none;">' + 
            '   <div class="container">' + 
            '     <div class="map-embed__directions-results__toolbar" style="display: none;">' +
            '     <div class="grid">' +
            '          <div class="grid__item one-half portable-small-one-whole results-overview">' + 
            '        </div><div class="grid__item one-half portable-small-one-whole">' + 
            '           <ul class="nav nav--fit flush">' + 
            '              <li><a href="#" class="button js-directions-toggle"><span class="icon-list"></span> View directions</a></li>' + 
            '                  <li><a href="#" class="button js-directions-print"><span class="icon-print"></span> Print</a></li>' + 
            '                    <li><a href="#" class="button js-directions-launch-app"><span class="icon-share"></span>  View in Google Maps</a></li>' + 
            '              </ul>' + 
            '         </div>' + 
            '     </div>' +
            '    </div>' + 
            '    <div class="map-embed__directions-results__route" style="display: none;">' + 
            '         <div class="container"></div>' + 
            '    </div>' +
            '    <div class="alert alert--warning" style="display: none;"></div>' + 
            '   </div>' + 
            '</div>';

            var $container_parent = config.$map_container.parent();

            $container_parent.append(results_markup);
            $directions_results = $container_parent.find('.map-embed__directions-results');
            $directions_toolbar = $container_parent.find('.map-embed__directions-results__toolbar');
            $directions_route = $container_parent.find('.map-embed__directions-results__route');
            $directions_warning = $container_parent.find('.alert--warning');
        }


        /**
         * Change the mode of travel for calculating directions.
         * @memberOf MapDirections
         * @instance
         * @method _changeTravelMode
         */
        function _changeTravelMode () {
            var $this = $(this);

            if (!$this.hasClass('is-selected')) {
                $travel_options.find('.is-selected').removeClass('is-selected');
                $this.addClass('is-selected');

                selected_travel_mode = $this.attr('data-mode');

                /* If the user has already entered an address then we can
                   immediately recalculate their directions */

                if ($location_field.val() !== '') {
                    /**
                     * I've removed automatic route re-calculation to try to reduce
                     * the number of Google Map directions requests made.
                     * 
                     * Instead, if the route results are already showing, then show
                     * the user some feedback on the button to highlight that they
                     * need to press 'go' to calculate the new routes (requires
                     * $animations-pulse to be true in css)
                     */
                    
                    if ($directions_route.is(':visible')) {    
                        $directions_form.find('button').addClass('animated pulse');
                    }
                    
                    //_calculateRoute();
                }

                locked = false;
            }

            return false;
        }


        /**
         * Reset cached values if the value of the location field is changed.
         * @memberOf MapDirections
         * @instance
         * @method _changedLocationField
         */
        function _changedLocationField () {
            /**
             * Enable/disable 'go' button based on current user location value
             */            
            if ($location_field.val() !== '') {
                $directions_form.find('button').removeAttr('disabled');
            } else {
                $directions_form.find('button').attr('disabled', '');
            }

            
            /**
             * If the user enters their location manually remove the geocoded cache
             * (this is used to reduce Google Map directions requests/limits)
             */            
            if ($location_field.val() !== current_visitor_location) {
                $location_field.removeAttr('data-geocoded');
                current_visitor_location = '';
            }

            locked = false;
        }


        /**
         * Find user location and prefill the location input field.
         * @memberOf MapDirections
         * @instance
         * @method _findUserLocation
         */
        function _findUserLocation () {
            /**
             * Let the user know we're working on locating them
             */
            $('.js-find-me').hide();
            $location_field
                .attr('placeholder', 'Locating you, please wait...')
                .val('');

            /**
             * Send request as a promise
             */
            _requestGeolocation()
                .then(_findUserLocationSuccess, _findUserLocationError);

            return false;
        }


        /**
         * Request user's location via HTML5 geolocate.
         * @memberOf MapDirections
         * @instance
         * @method _requestGeolocation
         */
        function _requestGeolocation () {
            return new Promise(function (resolve, reject) {
                window.navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    {
                        enableHighAccuracy: true,
                        timeout: (10 * 1000 * 1000),
                        maximumAge: 0
                    }
                );
            });
        }


        /**
         * The user's geolocation was successful.
         * @memberOf MapDirections
         * @instance
         * @method _findUserLocationSuccess
         */
        function _findUserLocationSuccess (position) {
            visitor_location = new gmaps.LatLng(position.coords.latitude, position.coords.longitude);

            _requestAddressGeocode(visitor_location, 'latLng')
                .then(
                    function (results) {
                        if (results[1]) {
                            var placename = results[1].formatted_address;

                            $location_field
                                .val(placename)
                                .attr('data-geocoded', true)
                                .focus();

                            _changedLocationField();
                        }

                        _showErrorMessage(false);
                    },
                    function (reponse) {
                        config.$map_container.parent().find('.js-find-me').fadeIn(600);
                        _showErrorMessage(true, 'Sorry, we couldn\'t find your location.');
                    }   
                );
        }


        /**
         * The user's geolocation was not successful.
         * @memberOf MapDirections
         * @instance
         * @method _findUserLocationError
         */
        function _findUserLocationError (error) {
             _showErrorMessage(true, 'Sorry, your location could not be detected. Please enter your location.');
             
             $location_field
                .attr('placeholder', 'Enter your location')
                .focus();
        }


        /**
         * Request an address geocode via Google Geocode service.
         * @memberOf MapDirections
         * @instance
         * @method _requestAddressGeocode
         */
        function _requestAddressGeocode (value, key) {
            key = (typeof key === 'undefined') ? 'address' : key;

            /**
             * Add our key/value to a new object to pass through to the Geocode request.
             */
            var params = {};
            params[key] = value;

            return new Promise(function (resolve, reject) {
                gmapsGeocoder.geocode(params, function (results, status) {
                    if (status === gmaps.GeocoderStatus.OK) {
                        resolve(results);
                    } else {
                        reject(status);
                    }
                });
            });
        }


        /**
         * Handle toolbar form submissions.
         * @memberOf MapDirections
         * @instance
         * @method _submitHandler
         */
        function _submitHandler () {
            if (!locked) {
                _geocodeAddress();
            }

            return false;
        }


        /**
         * Geocode an adress using Google's GeoCode service.
         * @memberOf MapDirections
         * @instance
         * @method _resizerHandler
         */
        function _geocodeAddress () {
            if ($location_field.val() !== '') {
                /**
                 * If the user has entered a new location we need to hide previous results
                 */
                if (routes_calculated && ($location_field.val() !== current_visitor_location)) {
                    current_visitor_location = $location_field.val();
                    _showRouteResults(false);
                }

                /**
                 * If we don't have the user's location via HTML5 geolocation we need to instead request it from Google
                 */
                if (!$location_field.attr('data-geocoded')) {
                    _requestAddressGeocode($location_field.val())
                        .then(
                            function (results) {
                                visitor_location = results[0].geometry.location;

                                _calculateRoute();
                                _showErrorMessage(false);
                            },
                            function () {
                                visitor_location = false;
                                _showErrorMessage(true, 'Sorry, this location has not been found.');
                            }   
                        );
                } else {
                    _calculateRoute();
                }
            } else {
                /**
                 * If the user has yet to enter their location then focus the input field and show some feedback to
                 * the user (requires $animations-shake to be true in css config)
                 */                
                $location_field
                    .addClass('animated shake')
                    .focus();

                /**
                 * We now need to remove the shake class in case we need to add it again
                 */                
                setTimeout(function () {
                    $location_field.removeClass('shake');
                }, 1000);
            }

            return false;
        }


        /**
         * Calculate the route using Google's Direction Service.
         * @memberOf MapDirections
         * @instance
         * @method _calculateRoute
         */
        function _calculateRoute () {
            var request = {
                destination: config.baseConfig.host.latlng_object,
                durationInTraffic: true,
                origin: visitor_location,
                optimizeWaypoints: true,
                travelMode: gmaps.TravelMode[selected_travel_mode.toUpperCase()]
            };

            _requestDirectionsRoute(request)
                .then(
                    function (response) {
                        locked = true;

                        _showRouteOnMap(response)
                            .then(_showRouteToolbar(response.routes));
                        //_showRouteResults(true);
                    },
                    function () {
                        _showErrorMessage(true, 'Sorry, directions ' + travel_mode_text[selected_travel_mode] + ' from your location are not available. Maybe try another location or change your travel mode.');
                    }
                );
        }


        /**
         * Update the Google Map instance with route results.
         * @memberOf MapDirections
         * @instance
         * @method _showRouteOnMap
         */
        function _showRouteOnMap (response) {
            return new Promise(function (resolve) {
                gmapsDirectionsRenderer.setDirections(response);
                gmapsDirectionsRenderer.setPanel($directions_route.find('.container')[0]);

                /**
                 * When the directions have been displayed on the map we can return the promise
                 */
                gmaps.event.addListener(gmapsDirectionsRenderer, 'directions_changed', resolve);
            });
        }


        /**
         * Request a route using Google's Direction Service.
         * @memberOf MapDirections
         * @instance
         * @method _requestDirectionsRoute
         */
        function _requestDirectionsRoute (request) {
            return new Promise(function (resolve, reject) {
                gmapsDirectionsService.route(request, function(response, status) {
                    if (status === gmaps.DirectionsStatus.OK) {
                        resolve(response);
                    } else {
                        reject();
                    }
                });
            });
        }


        /**
         * Show the route directions results toolbar.
         * @memberOf MapDirections
         * @instance
         * @param {object} route -  The Google Maps route object
         * @method _showRouteToolbar
         */
        function _showRouteToolbar (route) {
            var summary = _calculateRouteSummary(route),
                feedback_delay = 0;            

            $directions_toolbar.find('.results-overview').html(summary);


            /**
             * If the toolbar is hidden, show it then handle feedback display with a promise
             * otherwise just handle the feedback display
             * TODO: make this DRY
             */
            if (isHidden($directions_toolbar)) {
                $directions_toolbar.show();

                $.Velocity.animate($directions_results, 'transition.slideDownIn', {
                    duration: Animation.config.duration.base
                })
                    .then(function () {
                        if (route[0].warnings.length) {
                            _showWarningMessage(true, route[0].warnings[0]);
                        } else {
                            _showWarningMessage(false);
                        }
                    });
            } else {
                if (route[0].warnings.length) {
                    _showWarningMessage(true, route[0].warnings[0]);
                } else {
                    _showWarningMessage(false);
                }
            }


            // if (config.baseConfig.tflDirections) {
            //     var tube_used = false;

            //     /**
            //      * Check the route steps to see if underground is included
            //      */
            //     $.each(route[0].legs[0].steps, function (key, val) {
            //         if (val.instructions.indexOf('Underground') !== -1) {
            //             tube_used = true;
            //         }
            //     });

            //     if (tube_used) {
            //         $directions_toolbar.find('.results-overview').append('<a href="#" class="small underline js-show-tube-status">View current tube status</a>');
            //     } else {
            //         $('.tfl-tube').hide();
            //     }
            // }
        }


        /**
         * Calculate directions summary for the results toolbar.
         * @memberOf MapDirections
         * @instance
         * @param {object} route -  The Google Maps route object
         * @method _calculateRouteSummary
         */
        function _calculateRouteSummary (route) {
            var duration = 0,
                distance = 0,
                formatted_duration = '',
                formatted_distance = '',
                summary = '';

            $.each(route[0].legs, function (key, val) {
                if (val.distance) {
                    distance += val.distance.value;
                }
                if (val.duration) {
                    duration += val.duration.value;
                }
            });


            formatted_duration = formatTime(duration);
            formatted_distance = formatDistance(distance);

            return 'Your journey will take around ' + formatted_duration + ' to ' + travel_mode_summary[selected_travel_mode] + ' ' + formatted_distance + ' miles';
        }


        /**
         * Handle the display for calculated routes.
         * @memberOf MapDirections
         * @instance
         * @param {Boolean} status - Set to false to hide results and true to show them
         * @method _showRouteResults
         */
        function _showRouteResults (show) {
            if (show) {
                routes_calculated = true;

                $.Velocity.animate($directions_route, 'slideDown', {
                    duration: Animation.config.duration.slow,
                    easing: Animation.config.easing.jui
                });
                $('html').velocity('scroll', {
                    duration: Animation.config.duration.slow,
                    easing: Animation.config.easing.jui,
                    offset: $directions_toolbar.offset().top
                });
            } else {
                routes_calculated = false;

                $.Velocity.animate($directions_route, 'slideUp', {
                    duration: Animation.config.duration.base,
                    easing: Animation.config.duration.jui
                });
            }

            locked = true;
            _saveUserOptions();
        }


        /**
         * Hide the routes results.
         * @memberOf MapDirections
         * @instance
         * @method _hideRouteResults
         */
        function _hideRouteResults () {
            $directions_route.slideUp(400);

            return false;
        }


        /**
         * Toggle the routes results.
         * @memberOf MapDirections
         * @instance
         * @method _toggleRouteResults
         */
        function _toggleRouteResults () {
            if ($directions_route.is(':visible')) {
                _hideRouteResults();
            } else {
                _showRouteResults(true);
            }

            return false;
        }


        /**
         * Print the routes results
         * @memberOf MapDirections
         * @instance
         * @method _printRouteResults
         */
        function _printRouteResults () {
            var print_url = 'https://maps.google.com/?' +
                'saddr=' + encodeURI(visitor_location) + '&' +
                'daddr=' + encodeURI(config.baseConfig.host.latlng_object) + '&' +
                'dirflg=' + travel_mode_key[selected_travel_mode] + '&' +
                'pw=1';
            var print_window = window.open(print_url, '_blank');
            
            print_window.focus();
            print_window.print();

            return false;
        }


        /**
         * Launch the Google Maps website with the routes results
         * @memberOf MapDirections
         * @instance
         * @method _launchMapsWithRouteResults
         */
        function _launchMapsWithRouteResults () {
            var maps_urls = 'https://maps.google.com/?' +
                'saddr=' + encodeURI(visitor_location) + '&' +
                'daddr=' + encodeURI(config.baseConfig.host.latlng_object) + '&' +
                'dirflg=' + travel_mode_key[selected_travel_mode] + '&';
            var maps_window = window.open(maps_urls, '_blank');
            
            maps_window.focus();

            return false;
        }


        /**
         * Handle the display for error messages.
         * @memberOf MapDirections
         * @instance
         * @param {Boolean} status - Set to false to hide results and true to show them
         * @param {String} text - The error message text to show
         * @method  _showErrorMessage
         */
        function _showErrorMessage (show, text) {
            if (show) {
                text = (!text) ? 'Sorry, there was an error completing your request. Please try again.' : text;
                $directions_error.html(text);

                if (isHidden($directions_error)) {
                    $.Velocity.animate($directions_error, 'slideDown', {
                        duration: Animation.config.duration.base,
                        easing: Animation.config.easing.spring
                    });
                    $location_field.addClass('has-error');
                }
            } else {
                if (!isHidden($directions_error)) {
                    $.Velocity.animate($directions_error, 'slideUp', {
                        duration: Animation.config.duration.fast,
                        easing: 'easeInOutCirc'
                    });
                    $location_field.removeClass('has-error');
                }
            }
        }


        /**
         * Handle the display for warning messages.
         * @memberOf MapDirections
         * @instance
         * @param {Boolean} status - Set to true to show the message and false to hide
         * @param {String} text - The warning message text to show
         * @method  _showWarningMessage
         */
        function _showWarningMessage (show, text) {
            if (show) {
                $directions_warning.html('<span class="icon-warning"></span>&nbsp; ' + text);

                if (isHidden($directions_warning)) {
                    $.Velocity.animate($directions_warning, 'slideDown', {
                        duration: Animation.config.duration.base,
                        easing: Animation.config.easing.spring
                    });
                }
            } else {
                if (!isHidden($directions_warning)) {
                    $.Velocity.animate($directions_warning, 'slideUp', {
                        duration: Animation.config.duration.fast,
                        easing: 'easeInOutCirc'
                    });
                }
            }
        }


        /**
         * Save the user's options to a cookie to save on Google requests
         * @memberOf MapDirections
         * @instance
         * @method  _saveUserOptions
         */
        function _saveUserOptions () {
            var data = {
                mode: selected_travel_mode,
                latlng: visitor_location,
                location: current_visitor_location
            };
            var save = $.cookie('map_options', data, {expires: 7, path: '/'});
        }


        /**
         * Read the user's options cookie to prefill the toolbar options
         * @memberOf MapDirections
         * @instance
         * @method  _readUserOptions
         */
        function _readUserOptions () {
            return $.extend({},$.cookie('map_options'));
        }


        /**
         * Update the toolbar actions based on the user's cookie saved options
         * TODO: use calculated latlng to prevent further request to Google
         * @memberOf MapDirections
         * @instance
         * @method  _resetUserOptions
         */
        function _resetUserOptions () {
            var options = _readUserOptions();

            if (options) {
                if (options.mode) {
                    $travel_options.find('a[data-mode="' + options.mode + '"]').trigger('click');
                }
                if (options.location) {
                    current_visitor_location = options.location;
                    $location_field.val(options.location);
                }

                /**
                 * If both location options are present then enable submit button
                 */
                if (options.location && options.latlng) {
                    _changedLocationField();
                }
            }
        }


        return {
            init: init,
            embedToolbar: embedToolbar
        };
    }


    /** 
     * Function for returning formatted time
     */    
    function formatTime (seconds) {
        var minutes = (seconds / 60),
            hours = (seconds / 60 / 60),
            time = '';

        if (hours >= 1) {
            time = decFixed(Math.floor(hours), 1) + ' hour';
            time += (hours > 1) ? 's' : '';
        } else if (minutes > 1) {
            time = decFixed(Math.floor(minutes), 0) + ' minute';
            time += (minutes > 1) ? 's' : '';
        } else {
            time = 'less than a minute';
        }

        return time;
    }


    /** 
     * Function for returning formatted meters
     */    
    function formatDistance (meters) {
        var miles = (meters * 0.000621371192);

        return decFixed(miles, 1);
    }


    /**
     * Round decimal points if required
     */
    function decFixed(number, places) {
        if (!number) {
            return number.toFixed(places);
        }
        
        return number.toFixed(places).replace(/\.?0+$/, '');
    }


    /**
     * @return {function} Return the MapDirections function
     */
    return MapDirections;
});
