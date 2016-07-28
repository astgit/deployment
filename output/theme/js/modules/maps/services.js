define(function (require) {
    /**
     * A module for talking to Google Maps services.
     *
     * @module services
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib/stampit
     * @requires lib/promise
     * @requires modules/maps/gmaps
     *
     * @example <caption>Include the module</caption>
     *  let services = require('modules/maps/services');
     *
     * @example <caption>Instantiate the module</caption>
     *  services.init({...config});
     *
     * @example <caption>or...</caption>
     *  let mapsServices = services();
     *  mapsServices.geocodeAddress(locationString);
     *
     */

    var stampit = require('stampit');
    var gmaps = require('modules/maps/gmaps');
    require('promise');

    var services = stampit().methods({
        /**
         * Handle error responses
         * @method logError
         * @param {String} error - The message to display
         */
        logError: function logError(error) {
            console.log(error);
        },

        /**
         * Setup Google services, container element and events
         * @method setupServices
         */
        setupServices: function setupServices() {
            this.gmapsGeocoder = new gmaps.Geocoder();
            this.gmapsDirectionsService = new gmaps.DirectionsService();
            this.gmapsDirectionsRenderer = new gmaps.DirectionsRenderer();
            this.gmapsDirectionsRenderer.setMap(this.map);
        },

        /**
         * Request a geocoded location from the user's input via Google Geocode service
         * @method requestGocodedAddress
         * @param {Object} location - A Google Maps location instance
         */
        requestGocodedAddress: function requestGocodedAddress(location) {
            var _this = this;

            var request = {
                address: location
            };

            return new Promise(function (resolve, reject) {
                _this.gmapsGeocoder.geocode(request, function (results, status) {
                    if (status === gmaps.GeocoderStatus.OK) {
                        resolve(results);
                    } else {
                        reject(status);
                    }
                });
            });
        },

        /**
         * Request a calculate route from user's location and host's location via Goolge Directions service
         * @method requestCalculatedRoute
         * @param {Object} host - The host's Google Maps LatLngObject
         * @param {Object} destination - The destinations's Google Maps LatLngObject
         * @param {String} travelMode - The user's mode of travel
         */
        requestCalculatedRoute: function requestCalculatedRoute(host, destination, travelMode) {
            var _this2 = this;

            var request = {
                destination: destination,
                durationInTraffic: true,
                optimizeWaypoints: true,
                origin: host,
                travelMode: gmaps.TravelMode[travelMode.toUpperCase()]
            };

            return new Promise(function (resolve, reject) {
                _this2.gmapsDirectionsService.route(request, function (results, status) {
                    if (status === gmaps.DirectionsStatus.OK) {
                        resolve(results);
                    } else {
                        reject(response);
                    }
                });
            });
        },

        /**
         * Request a route display
         * @method requestRenderedRoute
         * @param {Object} route - A Google Maps route instance
         * @param {Object} element - A DOM element with a Maps instance
         */
        requestRenderedRoute: function requestRenderedRoute(route, element) {
            var _this3 = this;

            return new Promise(function (resolve) {
                _this3.gmapsDirectionsRenderer.setDirections(route);
                _this3.gmapsDirectionsRenderer.setPanel(element);

                /**
                 * When the directions have been displayed on the map we can return the promise
                 */
                gmaps.event.addListener(_this3.gmapsDirectionsRenderer, 'directions_changed', resolve);
            });
        }
    });

    return services;
});