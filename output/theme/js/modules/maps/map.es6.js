define((require) => {
    /**
     * A module for creating embeddable Google Maps
     *
     * @module map
     * @author Sean McEmerson
     * @version 0.4.0
     * @requires lib/stampit
     * @requires lib/fastdom
     * @requires lib/lodash/object/merge
     * @requires lib/lodash/function/throttle
     * @requires lib/jquery
     * @requires modules/ui/currentLayout
     * @requires modules/maps/gmaps
     *
     * @example <caption>Include the module</caption>
     *  let map = require('modules/maps/map');
     *
     * @example <caption>Instantiate the module</caption>
     *  map.init({...config});
     *
     * @example <caption>or...</caption>
     *  let myMap = map();
     *  myMap.init({...config});
     *
     * @example <caption>Container element markup</caption>
     *  <div class="map-embed">
     *      <div id="map-canvas" class="map-embed__canvas"></div>
     *  </div>
     */

    const stampit = require('stampit');
    const fastdom = require('fastdom');
    const merge = require('lodash/object/merge');
    const throttle = require('lodash/function/throttle');
    const currentLayout = require('modules/ui/current-layout');
    const gmaps = require('modules/maps/gmaps');


    const map = stampit()
        .state({
            config: {
                container: {},
                host: {
                    latlng: [],
                    marker: true,
                    markerImage: false,
                    markerTitle: ''
                },
                options: {
                    disableDefaultUI: true,
                    panControl: false,
                    scaleControl: false,
                    scrollwheel: false,
                    zoom: 13,
                    zoomControl: true
                },
                type: 'interactive'
            },
            currentMapType: ''
        })
        .methods({
            /**
             * Hello, world
             * @method init
             */
            init (userConfig) {
                this.config = merge({}, this.config, userConfig);

                /**
                 * Exit if there is no 'host' location to show or the container doesn't exist
                 */
                if (!this.config.host.latlng.length || !this.config.container.length) {
                    return;
                }

                fastdom.write(() => {
                    this.events();
                    this.embedMap();
                });
            },

            /**
             * Add event listeners for the map instance
             * @method events
             */
            events () {
                gmaps.event.addDomListener(
                    window,
                    'resize',
                    throttle(this.handleResize, 250).bind(this)
                );
            },

            /**
             * Embed the appropriate map based on config/env settings
             * @method embedMap
             */
            embedMap () {
                /**
                 * Only embed the map if the layout is not mobile otherwise force the use of a static background image
                 */
                if (this.config.type === 'interactive' && currentLayout.not('~mobile')) {
                    this.embedInteractiveMap();
                } else {
                    this.embedStaticMap();
                }
            },

            /**
             * Embed an interactive Google Map instance.
             * @method embedInteractiveMap
             */
            embedInteractiveMap () {
                this.currentMapType = 'interactive';

                /**
                 * Create our latlng instance if it doesn't exist
                 */
                if (!this.config.host.latlngObject) {
                    this.setLatLng(this.config.host.latlng);
                }

                fastdom.write(() => {
                    /**
                     * Get the target element by using the jQuery object selector value
                     */
                    this.map = new gmaps.Map(
                        document.getElementById(this.config.container.selector.replace('#', '')),
                        this.config.options
                    );

                    /**
                     * Add our custom marker for the host
                     */
                    if (this.config.host.marker) {
                        this.addMarker(
                            this.map,
                            this.config.host.latlngObject,
                            this.config.host.markerTitle
                        );
                    }
                });
            },

            /**
             * Embed a static Google Map image
             * @method embedStaticMap
             */
            embedStaticMap () {
                this.currentMapType = 'static';
                let customMarker = '';

                /**
                 * If a custom marker is defined then add the required param values
                 */
                if (this.config.host.markerImage) {
                    customMarker = 'icon:' + this.config.host.markerImage + '|';
                }

                let image = 'https://maps.google.com/maps/api/staticmap?' +
                    'center=' + this.config.host.latlng[0] + ',' + this.config.host.latlng[1] +
                    '&markers=' + customMarker + this.config.host.latlng[0] + ',' + this.config.host.latlng[1] +
                    '&sensor=true' +
                    '&size=' + this.config.container.outerWidth() + 'x' + this.config.container.outerHeight() +
                    '&zoom=' + this.config.options.zoom;

                fastdom.write(() => {
                    /**
                     * Set style the attribute directly so we can override any styling applied to the element
                     */
                    this.config.container.attr('style', 'background-image: url(' + image + ') !important; background-position: center center !important; background-size: cover !important;');
                });
            },

            /**
             * Handle events when the window is resized.
             * @method handleResize
             */
            handleResize () {
                /**
                 * Embed the map if the layout is no longer mobile
                 */
                if (this.config.type === 'interactive' &&
                    currentLayout.not('~mobile') &&
                    this.currentMapType === 'static') {
                    this.embedInteractiveMap();
                }

                fastdom.write(() => {
                    this.centerMap();
                });
            },

            /**
             * Resize the layout and center the host location after the window is resized.
             * @method centerMap
             */
            centerMap () {
                if (this.map) {
                    gmaps.event.trigger(this.map, 'resize');

                    if (this.config.host.latlngObject) {
                        this.map.setCenter(this.config.host.latlngObject);
                    }
                }
            },

            /**
             * Create a Google Map LatLng instance from the configuration options.
             * @method setLatLng
             * @param {Array} latlng - An array with latitude longitude values
             */
            setLatLng (latlng) {
                /**
                 * Convert values into a LatLng object
                 */
                this.config.host.latlngObject = new gmaps.LatLng(latlng[0], latlng[1]);

                /**
                 * Update the saved center location
                 */
                this.config.options.center = this.config.host.latlngObject;
            },

            /**
             * Add a marker to an interactive map.
             * @param {object} map - a Google Maps instance
             * @param {(array|object)} latlng - Either a Goolge Maps LatLng object or an array with latitude and longitude
             * @param {string} [title] - A title for the marker
             * @method addMarker
             */
            addMarker (_map, latlng, title) {
                /**
                 * If the latlng is not a Google Maps object then it needs to be converted
                 */
                if (!this.config.host.latlngObject) {
                    this.setLatLng(this.config.host.latlng);
                }

                let marker = new gmaps.Marker({
                    animation: gmaps.Animation.DROP,
                    map: _map,
                    position: latlng,
                    title: title
                });

                return marker;
            }
        });


    return map;
});
