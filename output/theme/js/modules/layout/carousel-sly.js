/**
 * A module for controlling a carousel instance
 */
define(function (require) {
    var $ = require('jquery'),
        fastdom = require('fastdom'),
        easing = require('easing'),
        throttle = require('lodash/function/throttle'),
        debounce = require('lodash/function/debounce'),
        values = require('lodash/object/values'),
        merge = require('lodash/object/merge'),
        currentLayout = require('modules/ui/current-layout'),
        sly = require('sly'),
        stampit = require('stampit');


    var carousel = stampit()
        .state({
            carouselLocked: false,
            config: {
                container: null,
                events: {},
                options: {
                    easing: 'easeInOutExpo',
                    dragHandle: 1,
                    dragTheshold: 2,
                    dynamicHandle: 1,
                    elasticBounds: 2,
                    horizontal: 1,
                    itemNav: 'basic',
                    mouseDragging: 1,
                    releaseSwing: 0.75,
                    scrollBy: 0,
                    smart: 1,
                    speed: 850,
                    startAt: 0,
                    touchDragging: 1
                },
                itemNav: true,
                itemNavInside: false,
                single: true,
                pageNav: true
            }
        })
        .methods({
            init: function init (userConfig) {
                this.config = merge({}, this.config, userConfig);

                /**
                 * We require a carousel container to be defined
                 */
                if (this.config.container) {
                    fastdom.read(function () {
                        this.cache();

                        fastdom.write(function () {
                            this.events();
                            this.setup();
                        }.bind(this));
                    }.bind(this));
                }
            },

            cache: function () {
                this.$window = $(window);
                this.$frame = this.config.container;
                this.$items = this.config.container.find('ul').children();
                this.$wrap = this.config.container.parent();
            },

            events: function events () {
                this.$window.on('resize', throttle(this.resizeHandler, 250).bind(this));

                if (this.config.pageNav) {
                    this.$frame.on('click.pageNav', '.js-carousel-page-left, .js-carousel-page-right', this.pageNavigation);
                }
            },

            resizeHandler: function resizeHandler () {
                fastdom.write(function () {
                    this.updateItemStyles();

                    /**
                     * Update sly (recalculate pagination etc)
                     */
                    if ((typeof this.sly) !== undefined) {
                        this.sly.reload();
                    }
                }.bind(this));
            },

            setup: function setup () {
                fastdom.read(function () {
                    // /** 
                    //  * If we need to show page navigation then create the container and update Sly options
                    //  * and cache the element
                    //  */
                    // if (config.itemNav) {
                    //     $wrap.append('<ul id="' + config.container[0].id + '-nav" class="carousel__item-nav' + ((config.itemNavInside) ? ' carousel__item-nav--inside' : '') + ((config.animateOnReady) ? ' animated fadeIn' : '') + '"></ul>');

                    //     $item_nav = $wrap.find(config.container[0].id + '-nav');

                    //     config.options.activatePageOn = 'click';
                    //     config.options.pagesBar = $('#' + config.container[0].id + '-nav');
                    // }
                    //

                    /**
                     * If we need to show page navigation _and_ there is more than one page then
                     * create the buttons, cache them and then set states
                     */
                    if (this.$frame.children().length > 1 && this.config.pageNav) {
                        this.$pageNavLeft = this.$frame.find('.js-carousel-page-left');
                        this.$pageNavRight = this.$frame.find('.js-carousel-page-right');

                        this.config.options.prevPage = this.$pageNavLeft;
                        this.config.options.nextPage = this.$pageNavRight;
                    }


                    fastdom.write(function () {
                        /**
                         * Set the item styles before creating the Sly instance
                         */
                        this.updateItemStyles();

                        /**
                         * Magic!
                         */
                        this.sly = new Sly(this.$frame, this.config.options);

                        /**
                         * Set up callbacks for Sly
                         * Note: The throttle count can be high because if the event is touch or drag based, the event
                         * can fire lots of times consecutively
                         */
                        this.sly.on('change', debounce(this.slideChanged, 250).bind(this));
                        this.sly.on('moveStart', throttle(this.lockCarousel, 250).bind(this));
                        this.sly.on('moveEnd', throttle(this.unlockCarousel, 250).bind(this));

                        this.sly.init();

                        /**
                         * Set the state of the navigation buttons
                         */
                        if (this.config.pageNav) {
                            this.setPageNavigationStates();
                        }
                    }.bind(this));
                }.bind(this));
            },

            updateItemStyles: function updateItemStyles () {
                /**
                 * If we only want to show 1 item at a time, set the items width to the frame width
                 */
                if (this.config.single || currentLayout.is('~mobile')) {
                    this.$items.css({width: this.$frame.width()});
                }
            },

            pageNavigation: function pageNavigation ($button) {
                if (!this.carouselLocked) {
                    /**
                     * Only navigate if the button has an active state
                     */
                    if ($button.currentTarget.className.indexOf('is-active') !== -1) {
                        var direction = ($button.currentTarget.className.indexOf('left') !== -1) ? 'left' : 'right';

                        if (direction === 'left') {
                            this.sly.prevPage();
                        } else {
                            this.sly.nextPage();
                        }
                    }
                }

                return false;
            },

            setPageNavigationStates: function setPageNavigationStates () {
                if (this.sly.rel.activePage === 0) {
                    this.$pageNavLeft.removeClass('is-active');
                } else {
                    this.$pageNavLeft.addClass('is-active');
                }

                if (this.sly.rel.activePage >= (this.sly.pages.length - 1)) {
                    this.$pageNavRight.removeClass('is-active');
                } else {
                    this.$pageNavRight.addClass('is-active');
                }
            },

            slideChanged: function slideChanged () {
                if (this.config.pageNav) {
                    fastdom.write(function () {
                        this.setPageNavigationStates();
                    }.bind(this));
                }
            },

            lockCarousel: function lockCarousel () {
                this.carouselLocked = true;
            },

            unlockCarousel: function unlockCarousel () {
                this.carouselLocked = false;
            }
        });


    /**
     * Don't return created instance - these should be instantiated when required
     */
    return carousel;
});
