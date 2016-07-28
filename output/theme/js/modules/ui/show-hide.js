define(function (require) {
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

    var $ = require('jquery');
    var fastdom = require('fastdom');
    var animations = require('modules/ui/animation');
    var stampit = require('stampit');

    var showHide = stampit().methods({
        /**
         * Add event listener
         * @method init
         */
        init: function init() {
            var _this = this;

            fastdom.read(function () {
                $('body').on('click.showHideToggle', '.js-toggle-show-hide', _this.toggleShowHide);
            });
        },

        /**
         * Toggle the visibility of an element
         * @method toggleShowHide
         */
        toggleShowHide: function toggleShowHide() {
            var $this = $(this);
            var $toggleElement = undefined;
            var isActive = undefined;

            fastdom.read(function () {
                isActive = $this.hasClass('is-active');

                /**
                 * The target can either be the adjacent selector (by default) or a custom selector
                 */
                if ($this.attr('data-target')) {
                    $toggleElement = $($this.attr('data-target'));
                } else {
                    $toggleElement = $this.next();
                }

                fastdom.write(function () {
                    if (!isActive) {
                        $toggleElement.velocity('slideDown', {
                            begin: function begin() {
                                fastdom.write(function () {
                                    $this.addClass('is-active');
                                });
                            },
                            duration: animations.config.duration.base,
                            easing: animations.config.easing.jui
                        });
                    } else {
                        $toggleElement.velocity('slideUp', {
                            complete: function complete() {
                                fastdom.write(function () {
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
    }).create();

    return showHide;
});