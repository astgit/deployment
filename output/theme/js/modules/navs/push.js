define(function (require) {
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

    var $ = require('jquery');
    var fastdom = require('fastdom');
    var stampit = require('stampit');
    var Modernizr = require('modernizr');
    var throttle = require('lodash/function/throttle');
    var currentLayout = require('modules/ui/current-layout');
    var animation = require('modules/ui/animation');

    var pushNav = stampit().state({
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
    }).methods({
        /**
         * Initiate module.
         * @method init
         */
        init: function init() {
            var _this = this;

            fastdom.read(function () {
                _this.cache();
                _this.events();

                fastdom.write(function () {
                    _this.fallback();
                });
            });
        },

        /**
         * Cache commonly used selectors.
         * @method _cache
         */
        cache: function cache() {
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
        events: function events() {
            var _this2 = this;

            this.$window.on('resize', throttle(this.resizeHandler, 250));
            this.$close_buttons.on('click.pushNavClose', function (e) {
                return _this2.close.call(_this2, e);
            });
            this.$open_buttons.on('click.pushNavOpen', function (e) {
                return _this2.open.call(_this2, e);
            });
            this.$all_navs.on('click.navLink', 'a', function (e) {
                return _this2.forceClose.call(_this2, e);
            });
        },

        /**
         * Handle events when the window is resized.
         * @method _resizerHandler
         */
        resizeHandler: function resizeHandler() {
            var _this3 = this;

            /**
             * Hide the push nav if it's open and we're no longer in mobile view
             */
            if (this.$open_nav && currentLayout.not('~mobile')) {
                this.$open_buttons.each(function () {
                    if ($(_this3).hasClass('is-active')) {
                        $(_this3).trigger('click');
                    }
                });
            }
        },

        /**
         * Open a nav.
         * @method open
         */
        open: function open(e) {
            var _this4 = this;

            var _$button = $(e.target);
            if ($(e.target).parents().hasClass('js-open-push-nav')) {
                _$button = $(e.target).parents('.js-open-push-nav');
            }
            var direction = _$button.attr('data-direction');

            /**
             * If a left/right nav is open, but we need to change the nav currently
             * showing within it
             */
            if (this.$open_nav !== null && 'nav-' + _$button.attr('data-nav') !== this.$open_nav[0].id) {
                /**
                 * Show/hide the appropriate nav(s)
                 */
                this.$open_nav.hide();
                this.$open_nav = $('#nav-' + _$button.attr('data-nav'));

                fastdom.write(function () {
                    $.Velocity.animate(_this4.$open_nav, 'fadeIn', {
                        duration: animation.config.duration.fast
                    });

                    /**
                     * Remove custom classes from the current nav
                     */
                    _this4.removeCustomClass(_this4.$open_nav.attr('data-direction'));

                    /**
                     * Switch the new nav to be active and load any lazy-loaded images
                     */
                    _this4.switchActiveButton(_$button);
                    _this4.loadImages();
                });
            } else {
                /**
                 * If no nav is currently open
                 */
                if (this.$open_nav === null) {
                    fastdom.read(function () {
                        _this4.$open_nav = $('#nav-' + _$button.attr('data-nav'));

                        $.Velocity.animate(_this4.$open_nav, 'fadeIn', {
                            duration: animation.config.duration.fast
                        });

                        /**
                         * Separate the animation properties to do our feature check
                         */
                        var animationOptions = {
                            duration: animation.config.duration.base,
                            easing: [animation.config.duration.base, 40]
                        };
                        var animationProperty = Modernizr.csstransforms ? 'translateX' : direction;
                        var animationProperties = {};

                        /**
                         * Show the nav from either left/right position
                         * (Use the Velocity utility method for easy chaining by selector)
                         * 1. Stop previous animations to prevent any conflict
                         */
                        animationProperties[animationProperty] = _this4.getCoordinates(direction, 'nav', 'open');
                        (direction === 'left' ? _this4.$push_left : _this4.$push_right).velocity('stop') /* [1] */
                        .velocity(animationProperties, animationOptions).toggleClass('is-active');

                        animationProperties[animationProperty] = _this4.getCoordinates(direction, 'wrapper', 'open');
                        _this4.$wrapper.velocity('stop') /* [1] */
                        .velocity(animationProperties, animationOptions).toggleClass('is-pushed is-pushed--' + direction);

                        /**
                         * Switch the new nav to be active and load any lazy-loaded images
                         */
                        _this4.switchActiveButton(_$button);
                        _this4.loadImages();
                    });
                } else {
                    this.close(_$button);
                }
            }

            /**
             * Add the name of the current nav as a class to allow for CSS styling
             */
            if (this.$open_nav !== null && typeof this.$open_nav.attr('data-class') !== 'undefined') {
                fastdom.read(function () {
                    _this4.customClass = _this4.$open_nav.attr('data-class');

                    fastdom.write(function () {
                        (direction === 'left' ? _this4.$push_left : _this4.$push_right).addClass(_this4.customClass);
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
        close: function close(_$button) {
            var _this5 = this;

            var $button = _$button;

            if (typeof $button[0] === 'undefined') {
                if (!$($button.toElement).hasClass('ignore')) {
                    fastdom.write(function () {
                        _this5.$wrapper.toggleClass('is-pushed');
                        _this5.$push_left.removeClass('is-active');
                        _this5.$push_right.removeClass('is-active');
                    });
                }
            } else {
                $button = typeof $button !== 'undefined' ? $button : $(this);

                if (!$button.hasClass('ignore')) {
                    fastdom.read(function () {
                        var direction = $button.attr('data-direction');

                        fastdom.write(function () {
                            /**
                             * Separate the animation properties to do our feature check
                             */
                            var animationOptions = {
                                complete: function complete() {
                                    _this5.removeCustomClass(direction);
                                    _this5.$wrapper.attr('style', '');
                                },
                                duration: animation.config.duration.base,
                                easing: [animation.config.duration.base, 50]
                            };
                            var animationProperty = Modernizr.csstransforms ? 'translateX' : direction;
                            var animationProperties = {};

                            /**
                             * Hide the nav from either left/right position
                             * (Use the Velocity utility method for easy chaining by selector)
                             * 1. Stop previous animations to prevent any conflict
                             */
                            animationProperties[animationProperty] = _this5.getCoordinates(direction, 'nav', 'closed');
                            (direction === 'left' ? _this5.$push_left : _this5.$push_right).velocity('stop') /* [1] */
                            .velocity(animationProperties, animationOptions).toggleClass('is-active');

                            animationProperties[animationProperty] = _this5.getCoordinates(direction, 'wrapper', 'closed');
                            _this5.$wrapper.velocity('stop') /* [1] */
                            .velocity(animationProperties, animationOptions).toggleClass('is-pushed is-pushed--' + direction);

                            _this5.$active_button.blur().removeClass('is-active');
                            $.Velocity.animate(_this5.$all_navs, 'fadeOut', {
                                duration: animation.config.duration.fast / 2
                            });

                            _this5.$active_button = null;
                            _this5.$open_nav = null;
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
        removeCustomClass: function removeCustomClass(direction) {
            var _this6 = this;

            /**
             * If a custom class has been set on the nav then remove it when the nav has closed
             */
            if (this.customClass) {
                fastdom.write(function () {
                    (direction === 'left' ? _this6.$push_left : _this6.$push_right).removeClass(_this6.customClass);
                    _this6.customClass = null;
                });
            }
        },

        /**
         * Force close a nav.
         * @method forceClose
         */
        forceClose: function forceClose() {
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
        getCoordinates: function getCoordinates(direction, element, state) {
            var states = ['open', 'closed'];
            var coords = [0, 0];

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
        loadImages: function loadImages() {
            var _this7 = this;

            fastdom.read(function () {
                if (!_this7.$open_nav.hasClass('images-loaded')) {
                    fastdom.write(function () {
                        _this7.$open_nav.addClass('images-loaded').find('img').each(function () {
                            $(_this7).attr('src', $(_this7).attr('data-src'));
                        });
                    });
                }
            });
        },

        /**
         * Switch the currently active open button.
         * @method switchActiveButton
         */
        switchActiveButton: function switchActiveButton(_$button) {
            var _this8 = this;

            fastdom.write(function () {
                if (_this8.$active_button !== null) {
                    _this8.$active_button.removeClass('is-active').blur();
                }

                _this8.$active_button = _$button;
                _this8.$active_button.addClass('is-active');
            });
        },

        /**
         * Fallbacks for older browsers.
         * @method fallback
         */
        fallback: function fallback() {
            var _this9 = this;

            /**
             * Android browsers require a fix on the touch-scroll wrappers
             */
            if (navigator.userAgent.match(/android/i)) {
                fastdom.write(function () {
                    _this9.$wrapper.addClass('device-android');
                });
            }
        }
    });

    return pushNav;
});