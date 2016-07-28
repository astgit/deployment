define((require) => {
    /**
     * A module for toggle elements' visibility
     *
     * @module showHide
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib/jquery
     * @requires lib/fastdom
     * @requires lib/stampit
     * @requires modules/ui/animation
     *
     * @example <caption>Include the module</caption>
     *  let showHide = require('modules/ui/show-hide');
     *
     * @example <caption>Instantiate the module</caption>
     *  showHide.init();
     *
     */

    const $ = require('jquery');
    const fastdom = require('fastdom');
    const animations = require('modules/ui/animation');
    const stampit = require('stampit');


    const showHide = stampit()
        .methods({
            /**
             * Add event listener
             * @method init
             */
            init () {
                fastdom.read(() => {
                    $('body').on('click.showHideToggle', '.js-toggle-show-hide', this.toggleShowHide);
                });
            },

            /**
             * Toggle the visibility of an element
             * @method toggleShowHide
             */
            toggleShowHide () {
                const $this = $(this);
                let $toggleElement;
                let isActive;

                fastdom.read(() => {
                    isActive = $this.hasClass('is-active');

                    /**
                     * The target can either be the adjacent selector (by default) or a custom selector
                     */
                    if ($this.attr('data-target')) {
                        $toggleElement = $($this.attr('data-target'));
                    } else {
                        $toggleElement = $this.next();
                    }

                    fastdom.write(() => {
                        if (!isActive) {
                            $toggleElement
                                .velocity('slideDown', {
                                    begin () {
                                        fastdom.write(() => {
                                            $this.addClass('is-active');
                                        });
                                    },
                                    duration: animations.config.duration.base,
                                    easing: animations.config.easing.jui
                                });
                        } else {
                            $toggleElement
                                .velocity('slideUp', {
                                    complete () {
                                        fastdom.write(() => {
                                            $this.removeClass('is-active');

                                            /**
                                             * Remove the added style property to prevent
                                             * interference with the CSS that handles display
                                             */
                                            $toggleElement.attr('style', '');
                                        });
                                    },
                                    duration: animations.config.duration.fast,
                                    easing: animations.config.easing.jui
                                });
                        }
                    });
                });

                return false;
            }
        })
        .create();


    return showHide;
});
