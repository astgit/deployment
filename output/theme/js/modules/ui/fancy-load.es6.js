define((require) => {
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

    const $ = require('jquery');
    const fastdom = require('fastdom');
    const stampit = require('stampit');


    const fancyLoad = stampit()
        .methods({
            /**
             * Cache elements and then call loading method
             * @method init
             */
            init () {
                fastdom.read(() => {
                    this.$window = $(window);
                    this.$html = $('html');
                    this.$content = $('#content');

                    fastdom.write(() => {
                        this.load();
                    });
                });
            },

            /**
             * Trigger 'loading' of the page by adding classes to the <html> element. Animations are done via CSS.
             * @method load
             */
            load () {
                fastdom.write(() => {
                    this.$html.addClass('is-loaded');
                    this.$content.addClass('is-visible');
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
            unload (url = '') {
                if (url) {
                    fastdom.write(() => {
                        this.$content.removeClass('is-visible');

                        setTimeout(this.changeUrl(url), 300);
                    });
                }
            },

            /**
             * Update the current URL
             * @method changeUrl
             */
            changeUrl (url = '') {
                window.location = url;
            }
        })
        .create();


    return fancyLoad;
});
