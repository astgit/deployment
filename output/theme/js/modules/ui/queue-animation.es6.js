define((require) => {
    /**
     * A module for queueing animate.css animations to fire after xx delay, or programmatically.
     *
     * @module queueAnimation
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib/jquery
     * @requires lib/fastdom
     * @requires lib/stampit
     * @requires modules/generic/modernizr
     *
     * @example <caption>Include the module</caption>
     *  let queueAnimation = require('modules/ui/queue-animation');
     *
     * @example <caption>Instantiate the module</caption>
     *  queueAnimation.init();
     *
     * @example <caption>An element defined by class and attributes</caption>
     *  <div class="animated queued js-queue-animation" data-animation="fadeInUp" data-delay="500">Super dooper animation!</a>
     *
     * @example <caption>An element markup after classes have been added</caption>
     *  <div class="animated js-queue-animation fadeInUp" data-animation="fadeInUp" data-delay="500">Super dooper animation!</a>
     */

    const $ = require('jquery');
    const fastdom = require('fastdom');
    const stampit = require('stampit');
    const Modernizr = require('modernizr');
    const hasCSSAnimations = Modernizr.cssanimations;


    const queueAnimations = stampit()
        .methods({
            /**
             * Find queued animation elements
             * @method init
             */
            init: function init (_$element) {
                /**
                 * Either target all queued animations or programatiically queue a
                 * specific element. If we're not using a specific element, we want
                 * to target only elements within main for performance reasons.
                 * @ignore
                 */
                const $element = _$element || $('body');

                fastdom.read(() => {
                    this.elements = $element.find('.js-queue-animation');

                    if (this.elements.length) {
                        fastdom.write(() => {
                            this.addAnimations();
                        });
                    }
                });
            },

            /**
             * Set the desired timeouts and then add the animation classes.
             * @method addAnimations
             */
            addAnimations: function addAnimations () {
                $.each(this.elements, (key, element) => {
                    const $element = $(element);

                    /**
                     * If CSS animations are supported, after the specified delay
                     * make the element visible and add its animation, otherwise
                     * remove the 'queued' class and make the element visible
                     */
                    if (hasCSSAnimations) {
                        setTimeout(() => {
                            $element.removeClass('queued')
                                 .addClass($element.attr('data-animation'));
                        }, $element.attr('data-delay'));
                    } else {
                        $element.removeClass('queued')
                             .addClass($element.attr('data-animation'));
                    }
                });
            }
        });


    return queueAnimations;
});
