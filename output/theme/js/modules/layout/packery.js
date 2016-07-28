define(function (require) {
    /**
     * A module for creating packed layouts.
     *
     * @module packery
     * @author Sean McEmerson
     * @version 0.5.0
     * @requires lib/stampit
     * @requires lib/fastdom
     * @requires lib/packery
     * @requires lib/images-loaded
     * @requires lib/lodash/object/merge
     *
     * @example <caption>Include the module</caption>
     *  let packery = require('modules/layout/packery');
     *
     * @example <caption>Instantiate the module</caption>
     *  packery.init();
     */

    var stampit = require('stampit');
    var fastdom = require('fastdom');
    var merge = require('lodash/object/merge');
    var Packery = require('lib/packery');
    var imagesLoaded = require('lib/images-loaded');

    var packery = stampit().state({
        config: {
            container: '#packery',
            options: {
                itemSelector: '.layout__item',
                transitionDuration: 0
            }
        }
    }).methods({
        /**
         * Hello, world
         * @method init
         */
        init: function init(userConfig) {
            var _this = this;

            this.config = merge({}, this.config, userConfig);

            fastdom.read(function () {
                _this.container = new Packery(_this.config.container, _this.config.options);

                imagesLoaded($(_this.config.container), _this.container.packery);
            });
        }
    });

    return packery;
});