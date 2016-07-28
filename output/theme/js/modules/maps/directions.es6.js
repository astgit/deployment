define((require) => {
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

    const stampit = require('stampit');
    const fastdom = require('fastdom');
    const $ = require('jquery');
    const merge = require('lodash/object/merge');
    const throttle = require('lodash/function/throttle');
    const gmaps = require('modules/maps/gmaps');
    const map = require('modules/maps/map');
    const services = require('modules/maps/services');
    require('promise');

    const travelModes = {
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


    const directions = stampit()
        .compose(map, services)
        .state({
            travelMode: '',
            userLocation: ''
        })
        .methods({
            /**
             * Hello, world
             * @method init
             */
            init (userConfig) {
                this.config = merge({}, this.config, userConfig);

                fastdom.read(() => {
                    this.$directions = this.config.container.parent();
                    this.$toolbar = this.$directions.find('.js-directions-toolbar');
                    this.$route = this.$directions.find('.js-directions-route');

                    fastdom.write(() => {
                        this.events();
                        this.embedMap();
                    });
                });
            },

            /**
             * Handle events from directions toolbar
             * @method events
             */
            events () {
                gmaps.event.addDomListener(
                    window,
                    'resize',
                    throttle(this.handleResize, 250).bind(this)
                );

                this.$toolbar
                    .on(
                        'click',
                        '.js-change-travel-mode',
                        $.proxy(this.handleChangeTravelMode, this)
                    )
                    .on(
                        'keyup',
                        '.js-change-location',
                        throttle($.proxy(this.handleChangeUserLocation, this))
                    )
                    .on(
                        'submit click',
                        '.js-submit-directions',
                        $.proxy(this.handleFormSubmit, this)
                    );
            },

            /**
             * Handle events from travel mode buttons
             * @method handleChangeTravelMode
             */
            handleChangeTravelMode (event) {
                event.preventDefault();
                this.changeTravelMode($(event.target).attr('data-mode'));
            },

            /**
             * Change the travel mode for directions
             * @method changeTravelMode
             */
            changeTravelMode (mode) {
                this.travelMode = mode;
            },

            /**
             * Handle events from location input field
             * @method handleChangeUserLocation
             */
            handleChangeUserLocation (event) {
                this.changeUserLocation(event.target.value);
            },

            /**
             * Change the user's location via input field
             * @method changeUserLocation
             */
            changeUserLocation (value) {
                this.userLocation = value;
            },

            /**
             * Handle submission of the form
             * @method handleFormSubmit
             */
            handleFormSubmit (event) {
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
            buildRoute () {
                /**
                 * Setup the Google services required
                 */
                if (!this.gmapsGeocoder) {
                    this.setupServices();
                }

                this.getGeocodedLocation()
                    .then(this.getCalculatedRoute.bind(this))
                    .then(() => {
                        this.showRouteOnMap();
                        this.showDirectionsUI();
                    });
            },

            /**
             * Return an existing value or request a new geocoded location
             * @method getGeocodedLocation
             */
            getGeocodedLocation () {
                let location = this.userLocation;

                return new Promise((resolve, reject) => {
                    if (!this.userLocationGeocoded) {
                        this.requestGocodedAddress(location)
                            .then((result) => {
                                this.userLocationGeocoded = result;
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
            getCalculatedRoute () {
                let host = this.config.host.latlngObject;
                let destination = this.userLocationGeocoded[0].geometry.location;
                let travelMode = this.travelMode;

                return new Promise((resolve, reject) => {
                    if (!this.calculatedRoute) {
                        this.requestCalculatedRoute(host, destination, travelMode)
                            .then((result) => {
                                this.calculatedRoute = result;

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
            showRouteOnMap () {
                let route = this.calculatedRoute;
                let element = this.$route[0];

                return new Promise((resolve, reject) => {
                    fastdom.write(() => {
                        this.requestRenderedRoute(route, element)
                            .then(resolve, reject);
                    });
                });
            },

            /**
             * Show the directions copy and actions toolbar
             * @method showDirectionsUI
             */
            showDirectionsUI () {
                fastdom.write(() => {
                    this.$directions.addClass('map-directions--routed');
                    this.centerMap();
                });
            }
        });


    return directions;
});
