define((require) => {
    /**
     * A module for creating flyout navigations
     *
     * @module flayoutNav
     * @author Sean McEmerson
     * @version 0.2.0
     * @requires lib/stampit
     * @requires lib/jquery
     * @requires lib/fastdom
     * @requires lib/lodash/object/merge
     * @requires lib/lodash/function/throttle
     *
     * @example <caption>Include the module</caption>
     *  let flyoutNav = require('modules/navs/flyout');
     *
     * @example <caption>Instantiate the module</caption>
     *  flyoutNav.create().init({...config});
     *
     * @example <caption>or...</caption>
     *  let myFlyout = flyoutNav.create();
     *  myFlyout.init({...config});
     */

    const stampit = require('stampit');
    const fastdom = require('fastdom');
    const merge = require('lodash/object/merge');
    const throttle = require('lodash/function/throttle');
    const $ = require('jquery');


    const flayoutNav = stampit()
        .state({
            config: {
                container: '.js-flyout-nav',
                intent: 'hover',
                timeout: 1000
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
                    this.cache();
                    this.events();
                });
            },

            /**
             * Cache commonly used selectors.
             * @method cache
             */
            cache () {
                this.$nav = $(this.config.container);
            },

            /**
             * Handle events on the page.
             * @method events
             */
            events () {
                /**
                 * Touch events are applied to the toggle (the main A element) so it doesn't interfere with
                 * elements within the flyout content (only really applies when using hover intents).
                 */
                this.$nav.on('click', '.flyout-nav__toggle', $.proxy(this.handleClick, this));

                /**
                 * These mouseout events are applied for any intent
                 */
                this.$nav
                    .on('mouseenter', $.proxy(this.handleHoverOn, this))
                    .on('mouseleave', $.proxy(this.handleHoverOff, this));

                /**
                 * Add listeners for hover intents.
                 */
                if (this.config.intent === 'hover') {
                    /**
                     * Hover events are applied for desktop where we don't require click input.
                     */
                    this.$nav.on('mouseenter', '.flyout-nav__item', throttle($.proxy(this.handleHoverOver, this), 300));
                }
            },

            /**
             * Return the correct element depending on which event has triggered.
             * @method this.toggleElement
             * @param {object} $element - The element that triggered the event
             * @returns {Object} - The target element or its parent
             */
            toggleElement ($element) {
                let tag = $element[0].tagName;

                return (tag === 'A') ? $element.parent() : $element;
            },

            /**
             * Handle click events on nav toggles.
             * @method click
             */
            click (event) {
                let $target = $(event.target);

                fastdom.read(() => {
                    let thisIsActive = this.toggleElement($target).hasClass('is-active');

                    fastdom.write(() => {
                        /**
                         * A catch-all event handler for touch 'click' events. If the same item is clicked
                         * consecutively then it means it's an open then close intent.
                         */
                        if (thisIsActive) {
                            this.hideContent();
                        } else {
                            if (this.$openNav) {
                                this.hideContent(this.$openNav);
                            }

                            this.showContent(this.toggleElement($target));
                        }
                    });
                });

                return false;
            },

            /**
             * Handle hover events on nav contaner.
             * @method handleHoverOn
             */
            handleHoverOn () {
                /**
                 * Reset the container timeout now a new hover is taking place
                 */
                clearTimeout(this.timeout);
            },

            /**
             * Handle hover events on nav items.
             * @method handleHoverOver
             */
            handleHoverOver (event) {
                let $target = $(event.target);

                fastdom.read(() => {
                    let thisIsActive = this.toggleElement($target).hasClass('is-active');

                    fastdom.write(() => {
                        /**
                         * A catch-all event handler for touch 'click' events. If the same item is clicked consecutively
                         * then it means it's an open then close intent.
                         */
                        if (thisIsActive) {
                            /**
                             * Double-check we're not on a hover event
                             */
                            if (event.type !== 'mouseover') {
                                this.hideContent(this.$openNav);
                            }
                        } else {
                            if (this.$openNav) {
                                this.hideContent(this.$openNav);
                            }

                            this.showContent(this.toggleElement($target));
                        }
                    });

                    clearTimeout(this.timeout);
                });

                return false;
            },

            /**
             * Handle hover-off events on nav items.
             * @method handleHoverOff
             */
            handleHoverOff () {
                /**
                 * Add a delay after hovering out to ensure its the user's intent. The delay gives them time
                 * to mouse back over the content without it disappearing.
                 */
                this.timeout = setTimeout(() => {
                    fastdom.write(() => {
                        this.hideContent();
                    });
                }, this.config.timeout);
            },

            /**
             * Show a nav item content.
             * @method showContent
             */
            showContent ($item) {
                this.$openNav = $item;
                this.$openNav.addClass('is-active');
            },

            /**
             * Hide nav item contents and reset the cached the element.
             * @method hideContent
             */
            hideContent () {
                if (this.$openNav) {
                    this.$openNav.removeClass('is-active');
                    this.$openNav = null;
                }
            }
        });


    return flayoutNav;
});
