define((require) => {
    /**
     * A module for creating toggle states on hamburger icons
     *
     * @module hamburger
     * @author Sean McEmerson
     * @version 0.2.0
     * @requires lib/jquery
     * @requires lib/fastdom
     * @requires lib/stampit
     * @requires lib/lodash/object/merge
     *
     * @example <caption>Include the module</caption>
     *  let hamburger = require('modules/ui/hamburger');
     *
     * @example <caption>Instantiate the module</caption>
     *  hamburger.init();
     *
     * @example <caption>An element defined by toggle class</caption>
     *  <a href="#" class="hamburger js-toggle-hamburger">Menu</a>
     *
     * @example <caption>An element with it's state toggled by adding a class</caption>
     *  <a href="#" class="hamburger js-toggle-hamburger is-active">Menu</a>
     */

    const $ = require('jquery');
    const fastdom = require('fastdom');
    const stampit = require('stampit');
    const merge = require('lodash/object/merge');


    const hamburger = stampit()
        .state({
            config: {
                selector: '.js-toggle-hamburger'
            }
        })
        .methods({
            /**
             * Add event listener to elements
             * @method init
             */
            init (userConfig) {
                if (userConfig) {
                    this.config = merge({}, this.config, userConfig);
                }

                fastdom.read(() => {
                    $(this.config.selector).on(
                        'click.hamburger',
                        $.proxy(this.toggle, this)
                    );
                });
            },

            /**
             * Toggle the class of the element. The visuals are changed via CSS.
             * @method toggle
             * @param {Object} e - The jQuery event
             */
            toggle (e) {
                let target = e.currentTarget;

                fastdom.write(() => {
                    $(target).toggleClass('hamburger--active');
                });
            }
        });


    return hamburger;
});
