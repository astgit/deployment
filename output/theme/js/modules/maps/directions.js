define(function (require) {
    /**
     * A module for creating A-B directions with Google Maps
     *
     * @module directions
     * @author Sean McEmerson
     * @version 0.5.0
     * @requires lib/stampit
     * @requires lib/fastdom
     * @requires lib/lodash/object/merge
     * @requires lib/lodash/function/throttle
     * @requires lib/promise
     * @requires lib/jquery
     * @requires modules/maps/gmaps
     * @requires modules/maps/map
     * @requires modules/maps/services
     *
     * @example <caption>Include the module</caption>
     *  let directions = require('modules/maps/directions');
     *
     * @example <caption>Instantiate the module</caption>
     *  directions.init({...config});
     *
     * @example <caption>or...</caption>
     *  let myDirections = directions();
     *  myDirections.init({...config});
     *
     * @example <caption>Container element markup</caption>
     *  <div class="map-embed">
     *      <div id="map-canvas" class="map-embed__canvas"></div>
     *  </div>
     */

    var stampit = require('stampit');
    var fastdom = require('fastdom');
    var $ = require('jquery');
    var merge = require('lodash/object/merge');
    var throttle = require('lodash/function/throttle');
    var gmaps = require('modules/maps/gmaps');
    var map = require('modules/maps/map');
    var services = require('modules/maps/services');
    require('promise');

    var travelModes = {
        travelModes: {
            transit: {
                key: 'r',
                summary: 'travel',
                text: 'by public transport'
            },
            driving: {
                key: 'd',
                summary: 'drive',
                text: 'by car'
            },
            walking: {
                key: 'w',
                summary: 'walk',
                text: 'on foot'
            },
            bicycling: {
                key: 'b',
                summary: 'cycle',
                text: 'by bike'
            }
        }
    };

    var directions = stampit().compose(map, services).state({
        travelMode: '',
        userLocation: ''
    }).methods({
        /**
         * Hello, world
         * @method init
         */
        init: function init(userConfig) {
            var _this = this;

            this.config = merge({}, this.config, userConfig);

            fastdom.read(function () {
                _this.$directions = _this.config.container.parent();
                _this.$toolbar = _this.$directions.find('.js-directions-toolbar');
                _this.$route = _this.$directions.find('.js-directions-route');

                fastdom.write(function () {
                    _this.events();
                    _this.embedMap();
                });
            });
        },

        /**
         * Handle events from directions toolbar
         * @method events
         */
        events: function events() {
            gmaps.event.addDomListener(window, 'resize', throttle(this.handleResize, 250).bind(this));

            this.$toolbar.on('click', '.js-change-travel-mode', $.proxy(this.handleChangeTravelMode, this)).on('keyup', '.js-change-location', throttle($.proxy(this.handleChangeUserLocation, this))).on('submit click', '.js-submit-directions', $.proxy(this.handleFormSubmit, this));
        },

        /**
         * Handle events from travel mode buttons
         * @method handleChangeTravelMode
         */
        handleChangeTravelMode: function handleChangeTravelMode(event) {
            event.preventDefault();
            this.changeTravelMode($(event.target).attr('data-mode'));
        },

        /**
         * Change the travel mode for directions
         * @method changeTravelMode
         */
        changeTravelMode: function changeTravelMode(mode) {
            this.travelMode = mode;
        },

        /**
         * Handle events from location input field
         * @method handleChangeUserLocation
         */
        handleChangeUserLocation: function handleChangeUserLocation(event) {
            this.changeUserLocation(event.target.value);
        },

        /**
         * Change the user's location via input field
         * @method changeUserLocation
         */
        changeUserLocation: function changeUserLocation(value) {
            this.userLocation = value;
        },

        /**
         * Handle submission of the form
         * @method handleFormSubmit
         */
        handleFormSubmit: function handleFormSubmit(event) {
            event.preventDefault();

            /**
             * Ensure we have the required data before moving on
             */
            if (this.travelMode && this.userLocation) {
                this.buildRoute();
            }
        },

        /**
         * Build the directions from host to destination
         * @method buildRoute
         */
        buildRoute: function buildRoute() {
            var _this2 = this;

            /**
             * Setup the Google services required
             */
            if (!this.gmapsGeocoder) {
                this.setupServices();
            }

            this.getGeocodedLocation().then(this.getCalculatedRoute.bind(this)).then(function () {
                _this2.showRouteOnMap();
                _this2.showDirectionsUI();
            });
        },

        /**
         * Return an existing value or request a new geocoded location
         * @method getGeocodedLocation
         */
        getGeocodedLocation: function getGeocodedLocation() {
            var _this3 = this;

            var location = this.userLocation;

            return new Promise(function (resolve, reject) {
                if (!_this3.userLocationGeocoded) {
                    _this3.requestGocodedAddress(location).then(function (result) {
                        _this3.userLocationGeocoded = result;
                        resolve();
                    }, reject);
                } else {
                    resolve();
                }
            });
        },

        /**
         * Return an existing value or return a new route calculation
         * @method getCalculatedRoute
         */
        getCalculatedRoute: function getCalculatedRoute() {
            var _this4 = this;

            var host = this.config.host.latlngObject;
            var destination = this.userLocationGeocoded[0].geometry.location;
            var travelMode = this.travelMode;

            return new Promise(function (resolve, reject) {
                if (!_this4.calculatedRoute) {
                    _this4.requestCalculatedRoute(host, destination, travelMode).then(function (result) {
                        _this4.calculatedRoute = result;

                        resolve();
                    }, reject);
                } else {
                    resolve();
                }
            });
        },

        /**
         * Show a calculated route betwee host and destination on the map
         * @method showRouteOnMap
         */
        showRouteOnMap: function showRouteOnMap() {
            var _this5 = this;

            var route = this.calculatedRoute;
            var element = this.$route[0];

            return new Promise(function (resolve, reject) {
                fastdom.write(function () {
                    _this5.requestRenderedRoute(route, element).then(resolve, reject);
                });
            });
        },

        /**
         * Show the directions copy and actions toolbar
         * @method showDirectionsUI
         */
        showDirectionsUI: function showDirectionsUI() {
            var _this6 = this;

            fastdom.write(function () {
                _this6.$directions.addClass('map-directions--routed');
                _this6.centerMap();
            });
        }
    });

    return directions;
});