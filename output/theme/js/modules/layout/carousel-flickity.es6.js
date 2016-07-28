define((require) => {
    /**
     * A module for creating carousel containers using the Flickity plugin.
     *
     * @module carouselFlickity
     * @author Sean McEmerson
     * @version 0.4.0
     * @requires lib/stampit
     * @requires lib/jquery
     * @requires lib/fastdom
     * @requires lib/lodash/object/merge
     * @requires lib/flickity
     *
     * @example <caption>Include the module</caption>
     *  let carousel = require('modules/layout/carousel');
     *
     * @example <caption>Instantiate the module</caption>
     *  carousel.create().init({...config});
     *
     * @example <caption>or...</caption>
     *  let myCarousel = carousel.create();
     *  myCarousel.init({...config});
     */

    const stampit = require('stampit');
    const fastdom = require('fastdom');
    const $ = require('jquery');
    const merge = require('lodash/object/merge');
    const Flickity = require('lib/flickity');


    const carouselFlickity = stampit()
        .state({
            config: {
                container: null,
                options: {
                    autoPlay: false,
                    cellSelector: '.carousel__item',
                    freeScroll: false,
                    friction: 0.8,
                    pageDots: true,
                    prevNextButtons: true,
                    resize: true,
                    selectedAttraction: 0.1,
                    wrapAround: true
                },
                itemNav: true,
                itemNavInside: false,
                single: true,
                pageNav: true
            }
        })
        .methods({
            /**
             * Update config and match with Flickity options then setup.
             * @method init
             */
            init (userConfig) {
                this.config = merge({}, this.config, userConfig);

                /**
                 * Matching custom config with Flickity options
                 */
                this.config.options.prevNextButtons = this.config.pageNav;
                this.config.options.pageDots = this.config.itemNav;

                if (!this.config.single) {
                    this.config.options.contain = true;
                    this.config.options.wrapAround = false;
                }

                /**
                 * We require a carousel container to be defined
                 */
                if (this.config.container) {
                    this.setup();
                }
            },

            /**
             * Create the Flickity instance and change some UI.
             * @method setup
             */
            setup () {
                /**
                 * Use the selector string passed through from the jQuery object
                 */
                let flickityElement = this.config.container.selector;

                this.carousel = new Flickity(flickityElement, this.config.options);


                if (this.config.itemNavInside) {
                    fastdom.write(() => {
                        $(this.container).find('.flickity-page-dots').addClass('carousel__nav--nested');
                    });
                }
            }
        });


    /**
     * Don't return created instance - these should be instantiated when required
     */
    return carouselFlickity;
});
