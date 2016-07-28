define(function (require) {
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

    var stampit = require('stampit');
    var fastdom = require('fastdom');
    var merge = require('lodash/object/merge');
    var throttle = require('lodash/function/throttle');
    var currentLayout = require('modules/ui/current-layout');
    var gmaps = require('modules/maps/gmaps');

    var map = stampit().state({
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
    }).methods({
        /**
         * Hello, world
         * @method init
         */
        init: function init(userConfig) {
            var _this = this;

            this.config = merge({}, this.config, userConfig);

            /**
             * Exit if there is no 'host' location to show or the container doesn't exist
             */
            if (!this.config.host.latlng.length || !this.config.container.length) {
                return;
            }

            fastdom.write(function () {
                _this.events();
                _this.embedMap();
            });
        },

        /**
         * Add event listeners for the map instance
         * @method events
         */
        events: function events() {
            gmaps.event.addDomListener(window, 'resize', throttle(this.handleResize, 250).bind(this));
        },

        /**
         * Embed the appropriate map based on config/env settings
         * @method embedMap
         */
        embedMap: function embedMap() {
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
        embedInteractiveMap: function embedInteractiveMap() {
            var _this2 = this;

            this.currentMapType = 'interactive';

            /**
             * Create our latlng instance if it doesn't exist
             */
            if (!this.config.host.latlngObject) {
                this.setLatLng(this.config.host.latlng);
            }

            fastdom.write(function () {
                /**
                 * Get the target element by using the jQuery object selector value
                 */
                _this2.map = new gmaps.Map(document.getElementById(_this2.config.container.selector.replace('#', '')), _this2.config.options);

                /**
                 * Add our custom marker for the host
                 */
                if (_this2.config.host.marker) {
                    _this2.addMarker(_this2.map, _this2.config.host.latlngObject, _this2.config.host.markerTitle);
                }
            });
        },

        /**
         * Embed a static Google Map image
         * @method embedStaticMap
         */
        embedStaticMap: function embedStaticMap() {
            var _this3 = this;

            this.currentMapType = 'static';
            var customMarker = '';

            /**
             * If a custom marker is defined then add the required param values
             */
            if (this.config.host.markerImage) {
                customMarker = 'icon:' + this.config.host.markerImage + '|';
            }

            var image = 'https://maps.google.com/maps/api/staticmap?' + 'center=' + this.config.host.latlng[0] + ',' + this.config.host.latlng[1] + '&markers=' + customMarker + this.config.host.latlng[0] + ',' + this.config.host.latlng[1] + '&sensor=true' + '&size=' + this.config.container.outerWidth() + 'x' + this.config.container.outerHeight() + '&zoom=' + this.config.options.zoom;

            fastdom.write(function () {
                /**
                 * Set style the attribute directly so we can override any styling applied to the element
                 */
                _this3.config.container.attr('style', 'background-image: url(' + image + ') !important; background-position: center center !important; background-size: cover !important;');
            });
        },

        /**
         * Handle events when the window is resized.
         * @method handleResize
         */
        handleResize: function handleResize() {
            var _this4 = this;

            /**
             * Embed the map if the layout is no longer mobile
             */
            if (this.config.type === 'interactive' && currentLayout.not('~mobile') && this.currentMapType === 'static') {
                this.embedInteractiveMap();
            }

            fastdom.write(function () {
                _this4.centerMap();
            });
        },

        /**
         * Resize the layout and center the host location after the window is resized.
         * @method centerMap
         */
        centerMap: function centerMap() {
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
        setLatLng: function setLatLng(latlng) {
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
        addMarker: function addMarker(_map, latlng, title) {
            /**
             * If the latlng is not a Google Maps object then it needs to be converted
             */
            if (!this.config.host.latlngObject) {
                this.setLatLng(this.config.host.latlng);
            }

            var marker = new gmaps.Marker({
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