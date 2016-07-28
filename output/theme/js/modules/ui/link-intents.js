define(function (require) {
    /**
     * A module for performing actions based on link intent.
     *
     * @module linkIntents
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib/jquery
     * @requires lib/fastdom
     * @requires modules/ui/animation
     * @requires lib/stampit
     *
     * @example <caption>Include the module</caption>
     *  let linkIntents = require('modules/ui/link-intens');
     *
     * @example <caption>Instantiate the module</caption>
     *  linkIntents.init();
     *
     * @example <caption>Trigger unload of the page (standard link)</caption>
     *  <a href="/" class="">Home</a>
     *
     * @example <caption>Ignored link types</caption>
     *  <a href="mailto@sean@pancentric.com">Message me!</a>
     *  <a href="#" class="ignore js-event-trigger">I trigger something else, ignore me</a>
     *  <a href="https://ww.google.com" target="_blank">External link</a>
     *  <a href="/contact" class="is-ative">Active item with no actions</a>
     *  <a href="/contact" class="is-disabled">Disabled item with no actions</a>
     *
     * @example <caption>Anchor links trigger smooth Velocity scrolling</caption>
     *  <a href="#more-info">Read more</a>
     */

    var $ = require('jquery');
    var fastdom = require('fastdom');
    var animations = require('modules/ui/animation');
    var stampit = require('stampit');

    var linkIntents = stampit().methods({
        /**
         * Add event listener to all A links
         * @method init
         */
        init: function init() {
            var _this = this;

            fastdom.read(function () {
                return $('body').on('click.pageLink', 'a', _this.intent);
            });
        },

        /**
         * Handle action for clicked link
         * @method intent
         */
        intent: function intent(event) {
            var $tag = $(this);
            var href = $tag.attr('href');
            var target = $tag.attr('target');
            var classes = $tag.attr('class');

            if (href.length > 1 && /* [1] */
            !/^(#|mailto|tel|callto)/i.test(href) && /* [2] */
            !/(ignore|anchor)/.test(classes) && /* [3] */
            target !== '_blank' /* [4] */) {
                    /**
                     * Test if 'regular' link
                     *
                     * 1. Length greater than 1 (capture #)
                     * 2. Isn't a mailto
                     * 3. Isn't an internal anchor link or should be ignored
                     * 4. Isn't a _blank
                     */

                    /**
                     * Ensure the user doesn't want to open the link in a new tab or window
                     */
                    if (!event.ctrlKey && !event.metaKey) {
                        if (typeof fancyLoad !== 'undefined') {
                            fancyLoad.unload($tag.attr('href'));
                        } else {
                            window.location = $tag.attr('href');
                        }

                        return false;
                    }
                } else if (/(ignore|is-active|is-disabled)i/.test(classes)) {
                /**
                 * Test if 'ignore' link
                 *
                 * 1. Has ignore classes
                 * 2. Has active classes, these shouldn't be interactive
                 * 3. Has disabled classes, these shouldn't be interactive
                 */

                return false;
            } else {
                /**
                 * Is an internal anchor link
                 */
                var $anchorElement = undefined;

                if ($(href).length) {
                    $anchorElement = $(href);
                } else if ($('[name=' + href.replace('#', '') + ']')) {
                    $anchorElement = $('[name=' + href.replace('#', '') + ']');
                }

                if ($anchorElement.length) {
                    $('html').velocity('scroll', {
                        duration: Animation.config.duration.slow,
                        easing: Animation.config.easing.jui,
                        offset: $anchorElement.offset().top - 100
                    });
                }

                return false;
            }

            return true;
        }
    }).create();

    return linkIntents;
});