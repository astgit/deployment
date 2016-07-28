define(function (require) {
    /**
     * A module for performing animations on window loading and unloading
     *
     * @module fancyLoad
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib/jquery
     * @requires lib/fastdom
     * @requires lib/stampit
     *
     * @example <caption>Include the module</caption>
     *  let fancyLoad = require('modules/ui/fancy-load');
     *
     * @example <caption>Instantiate the module</caption>
     *  fancyLoad.init();
     *
     * @example <caption>Change the location/URL of the page and trigger animation</caption>
     *  fancyLoad.unload('/contact');
     */

    var $ = require('jquery');
    var fastdom = require('fastdom');
    var stampit = require('stampit');

    var fancyLoad = stampit().methods({
        /**
         * Cache elements and then call loading method
         * @method init
         */
        init: function init() {
            var _this = this;

            fastdom.read(function () {
                _this.$window = $(window);
                _this.$html = $('html');
                _this.$content = $('#content');

                fastdom.write(function () {
                    _this.load();
                });
            });
        },

        /**
         * Trigger 'loading' of the page by adding classes to the <html> element. Animations are done via CSS.
         * @method load
         */
        load: function load() {
            var _this2 = this;

            fastdom.write(function () {
                _this2.$html.addClass('is-loaded');
                _this2.$content.addClass('is-visible');
            });

            /**
             * Extra event to catch 'back button' page loads
             */
            this.$window.on('pageshow', $.proxy(this.load, this));
        },

        /**
         * Trigger 'unloading' of the page and then change the URL/location.
         * @method unload
         */
        unload: function unload() {
            var _this3 = this;

            var url = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

            if (url) {
                fastdom.write(function () {
                    _this3.$content.removeClass('is-visible');

                    setTimeout(_this3.changeUrl(url), 300);
                });
            }
        },

        /**
         * Update the current URL
         * @method changeUrl
         */
        changeUrl: function changeUrl() {
            var url = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

            window.location = url;
        }
    }).create();

    return fancyLoad;
});