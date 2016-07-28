define((require) => {
    /**
     * A module for creating push navigations
     *
     * @module pushNav
     * @author Sean McEmerson
     * @version 0.5.0
     * @requires lib/jquery
     * @requires lib/fastdom
     * @requires lib/stampit
     * @requires modules/generic/modernizr
     * @requires lib/lodash/function/throttle
     * @requires modules/ui/animation
     * @requires modules/ui/current-layout
     *
     * @example <caption>Include the module</caption>
     *  let pushNav = require('modules/navs/push');
     *
     * @example <caption>Instantiate the module</caption>
     *  pushNav.init();
     *
     * @example <caption>Navigation markup with the required classes</caption>
     * <nav class="push-nav push-nav--left">
     *     <div id="nav-site" class="push-nav__nav">
     *          {% show_menu_below_id "home" 0 100 100 100 "nav/mobile.html" %}
     *      </div>
     *  </nav>
     *
     * @example <caption>Element with a trigger for opening a nav</caption>
     *  <a class="js-open-push-nav" data-direction="left" data-nav="site" href="#">Menu</a>
     */

    const $ = require('jquery');
    const fastdom = require('fastdom');
    const stampit = require('stampit');
    const Modernizr = require('modernizr');
    const throttle = require('lodash/function/throttle');
    const currentLayout = require('modules/ui/current-layout');
    const animation = require('modules/ui/animation');


    const pushNav = stampit()
        .state({
            config: {
                positions: {
                    left: {
                        nav: {
                            closed: -400,
                            open: -60,
                            mobile: {
                                closed: '-100%',
                                open: '-20%'
                            }
                        },
                        wrapper: {
                            closed: 0,
                            open: 340,
                            mobile: {
                                closed: 0,
                                open: '80%'
                            }
                        }
                    },
                    right: {
                        nav: {
                            closed: 400,
                            open: 60,
                            mobile: {
                                closed: '100%',
                                open: '20%'
                            }
                        },
                        wrapper: {
                            closed: 0,
                            open: -340,
                            mobile: {
                                closed: 0,
                                open: '-80%'
                            }
                        }
                    }
                }
            }
        })
        .methods({
            /**
             * Initiate module.
             * @method init
             */
            init () {
                fastdom.read(() => {
                    this.cache();
                    this.events();

                    fastdom.write(() => {
                        this.fallback();
                    });
                });
            },

            /**
             * Cache commonly used selectors.
             * @method _cache
             */
            cache () {
                this.$window = $(window);
                this.$wrapper = $('.site-wrapper');
                this.$close_buttons = $('.js-close-push-nav');
                this.$open_buttons = $('.js-open-push-nav');
                this.$active_button = null;
                this.$push_left = $('.push-nav--left');
                this.$push_right = $('.push-nav--right');
                this.$all_navs = $('.push-nav').find('.push-nav__nav');
                this.$open_nav = null;
            },

            /**
             * Handle events on the page.
             * @method _events
             */
            events () {
                this.$window.on('resize', throttle(this.resizeHandler, 250));
                this.$close_buttons.on('click.pushNavClose', (e) => this.close.call(this, e));
                this.$open_buttons.on('click.pushNavOpen', (e) => this.open.call(this, e));
                this.$all_navs.on('click.navLink', 'a', (e) => this.forceClose.call(this, e));
            },

            /**
             * Handle events when the window is resized.
             * @method _resizerHandler
             */
            resizeHandler () {
                /**
                 * Hide the push nav if it's open and we're no longer in mobile view
                 */
                if (this.$open_nav && currentLayout.not('~mobile')) {
                    this.$open_buttons.each(() => {
                        if ($(this).hasClass('is-active')) {
                            $(this).trigger('click');
                        }
                    });
                }
            },

            /**
             * Open a nav.
             * @method open
             */
            open (e) {
                let _$button = $(e.target);
                if ($(e.target).parents().hasClass('js-open-push-nav')) {
                    _$button = $(e.target).parents('.js-open-push-nav');
                }
                let direction = _$button.attr('data-direction');

                /**
                 * If a left/right nav is open, but we need to change the nav currently
                 * showing within it
                 */
                if (this.$open_nav !== null && ('nav-' + _$button.attr('data-nav')) !== this.$open_nav[0].id) {
                    /**
                     * Show/hide the appropriate nav(s)
                     */
                    this.$open_nav.hide();
                    this.$open_nav = $('#nav-' + _$button.attr('data-nav'));

                    fastdom.write(() => {
                        $.Velocity.animate(this.$open_nav, 'fadeIn', {
                            duration: animation.config.duration.fast
                        });

                        /**
                         * Remove custom classes from the current nav
                         */
                        this.removeCustomClass(this.$open_nav.attr('data-direction'));

                        /**
                         * Switch the new nav to be active and load any lazy-loaded images
                         */
                        this.switchActiveButton(_$button);
                        this.loadImages();
                    });
                } else {
                    /**
                     * If no nav is currently open
                     */
                    if (this.$open_nav === null) {
                        fastdom.read(() => {
                            this.$open_nav = $('#nav-' + _$button.attr('data-nav'));

                            $.Velocity.animate(this.$open_nav, 'fadeIn', {
                                duration: animation.config.duration.fast
                            });

                            /**
                             * Separate the animation properties to do our feature check
                             */
                            let animationOptions = {
                                duration: animation.config.duration.base,
                                easing: [animation.config.duration.base, 40]
                            };
                            let animationProperty = (Modernizr.csstransforms) ? 'translateX' : direction;
                            let animationProperties = {};

                            /**
                             * Show the nav from either left/right position
                             * (Use the Velocity utility method for easy chaining by selector)
                             * 1. Stop previous animations to prevent any conflict
                             */
                            animationProperties[animationProperty] = this.getCoordinates(direction, 'nav', 'open');
                            ((direction === 'left') ? this.$push_left : this.$push_right)
                                .velocity('stop') /* [1] */
                                .velocity(animationProperties, animationOptions)
                                .toggleClass('is-active');

                            animationProperties[animationProperty] = this.getCoordinates(direction, 'wrapper', 'open');
                            this.$wrapper
                                .velocity('stop') /* [1] */
                                .velocity(animationProperties, animationOptions)
                                .toggleClass('is-pushed is-pushed--' + direction);


                            /**
                             * Switch the new nav to be active and load any lazy-loaded images
                             */
                            this.switchActiveButton(_$button);
                            this.loadImages();
                        });
                    } else {
                        this.close(_$button);
                    }
                }

                /**
                 * Add the name of the current nav as a class to allow for CSS styling
                 */
                if (this.$open_nav !== null && typeof(this.$open_nav.attr('data-class')) !== 'undefined') {
                    fastdom.read(() => {
                        this.customClass = this.$open_nav.attr('data-class');

                        fastdom.write(() => {
                            ((direction === 'left') ? this.$push_left : this.$push_right).addClass(this.customClass);
                        });
                    });
                }

                e.preventDefault();
            },

            /**
             * Close a nav.
             * @method close
             * @param {object} _$button - A button element (toggle)
             */
            close (_$button) {
                let $button = _$button;

                if (typeof($button[0]) === 'undefined') {
                    if (!$($button.toElement).hasClass('ignore')) {
                        fastdom.write(() => {
                            this.$wrapper.toggleClass('is-pushed');
                            this.$push_left.removeClass('is-active');
                            this.$push_right.removeClass('is-active');
                        });
                    }
                } else {
                    $button = (typeof($button) !== 'undefined') ? $button : $(this);

                    if (!$button.hasClass('ignore')) {
                        fastdom.read(() => {
                            let direction = $button.attr('data-direction');

                            fastdom.write(() => {
                                /**
                                 * Separate the animation properties to do our feature check
                                 */
                                let animationOptions = {
                                    complete: () => {
                                        this.removeCustomClass(direction);
                                        this.$wrapper.attr('style', '');
                                    },
                                    duration: animation.config.duration.base,
                                    easing: [animation.config.duration.base, 50]
                                };
                                let animationProperty = (Modernizr.csstransforms) ? 'translateX' : direction;
                                let animationProperties = {};

                                /**
                                 * Hide the nav from either left/right position
                                 * (Use the Velocity utility method for easy chaining by selector)
                                 * 1. Stop previous animations to prevent any conflict
                                 */
                                animationProperties[animationProperty] = this.getCoordinates(direction, 'nav', 'closed');
                                ((direction === 'left') ? this.$push_left : this.$push_right)
                                    .velocity('stop') /* [1] */
                                    .velocity(animationProperties, animationOptions)
                                    .toggleClass('is-active');

                                animationProperties[animationProperty] = this.getCoordinates(direction, 'wrapper', 'closed');
                                this.$wrapper
                                    .velocity('stop') /* [1] */
                                    .velocity(animationProperties, animationOptions)
                                    .toggleClass('is-pushed is-pushed--' + direction);


                                this.$active_button.blur().removeClass('is-active');
                                $.Velocity.animate(this.$all_navs, 'fadeOut', {
                                    duration: (animation.config.duration.fast / 2)
                                });

                                this.$active_button = null;
                                this.$open_nav = null;
                            });
                        });
                    }

                    return false;
                }
            },

            /**
             * Remove a custom class name from an open nav.
             * @method removeCustomClass
             */
            removeCustomClass (direction) {
                /**
                 * If a custom class has been set on the nav then remove it when the nav has closed
                 */
                if (this.customClass) {
                    fastdom.write(() => {
                        ((direction === 'left') ? this.$push_left : this.$push_right).removeClass(this.customClass);
                        this.customClass = null;
                    });
                }
            },

            /**
             * Force close a nav.
             * @method forceClose
             */
            forceClose () {
                /**
                 * Select the toggle that is used for the nav that's currently open
                 */
                $('.js-open-push-nav[data-nav="' + this.$open_nav[0].id.replace('nav-', '') + '"]').click();
            },

            /**
             * Get the animation coordinates based on current breakpoint.
             * @method getCoordinates
             * @returns {Array} - Coordinates of target position
             */
            getCoordinates (direction, element, state) {
                let states = ['open', 'closed'];
                let coords = [0, 0];

                if (state === 'closed') {
                    states.reverse();
                }

                if (currentLayout.is('~mobile')) {
                    coords = [this.config.positions[direction][element].mobile[states[0]], this.config.positions[direction][element].mobile[states[1]]];
                } else if (currentLayout.is('~tablet')) {
                    coords = [this.config.positions[direction][element].mobile[states[0]], this.config.positions[direction][element].mobile[states[1]]];
                } else {
                    
                    coords = [this.config.positions[direction][element][states[0]], this.config.positions[direction][element][states[1]]];
                }

                return coords;
            },

            /**
             * Lazy load images within a nav.
             * @method loadImages
             */
            loadImages () {
                fastdom.read(() => {
                    if (!this.$open_nav.hasClass('images-loaded')) {
                        fastdom.write(() => {
                            this.$open_nav
                                .addClass('images-loaded')
                                .find('img').each(() => {
                                    $(this).attr('src', $(this).attr('data-src'));
                                });
                        });
                    }
                });
            },

            /**
             * Switch the currently active open button.
             * @method switchActiveButton
             */
            switchActiveButton (_$button) {
                fastdom.write(() => {
                    if (this.$active_button !== null) {
                        this.$active_button.removeClass('is-active').blur();
                    }

                    this.$active_button = _$button;
                    this.$active_button.addClass('is-active');
                });
            },

            /**
             * Fallbacks for older browsers.
             * @method fallback
             */
            fallback () {
                /**
                 * Android browsers require a fix on the touch-scroll wrappers
                 */
                if (navigator.userAgent.match(/android/i)) {
                    fastdom.write(() => {
                        this.$wrapper.addClass('device-android');
                    });
                }
            }
        });


    return pushNav;
});
