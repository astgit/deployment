define((require) => {
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

    const stampit = require('stampit');
    const fastdom = require('fastdom');
    const merge = require('lodash/object/merge');
    const Packery = require('lib/packery');
    const imagesLoaded = require('lib/images-loaded');


    const packery = stampit()
        .state({
            config: {
                container: '#packery',
                options: {
                    itemSelector: '.layout__item',
                    transitionDuration: 0
                }
            }
        })
        .methods({
            /**
             * Hello, world
             * @method init
             */
            init (userConfig) {
                this.config = merge({}, this.config, userConfig);

                fastdom.read(() => {
                    this.container = new Packery(
                        this.config.container,
                        this.config.options
                    );

                    imagesLoaded($(this.config.container), this.container.packery);
                });
            }
        });


    return packery;
});
