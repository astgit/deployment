define(function (require) {
    /**
     * A module for sticking/hiding the nav on scroll intent.
     * Requires <code>slideUp</code> and <code>slideDown</code> CSS animations to be enabled.
     *
     * @module stickyNav
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib/stampit
     * @requires lib/fastdom
     * @requires lib/headroom
     *
     * @example <caption>Include the module</caption>
     *  let stickyNav = require('modules/ui/sticky-nav');
     *
     * @example <caption>Instantiate the module</caption>
     *  stickyNav.init();
     */

    var stampit = require('stampit');
    var fastdom = require('fastdom');
    require('lib/headroom');

    var stickyNav = stampit().methods({
        /**
         * Hello, world
         * @method init
         */
        init: function init() {
            fastdom.read(function () {
                var navElement = document.querySelector('.headroom');

                if (navElement) {
                    (function () {
                        var nav = new Headroom(navElement, {
                            classes: {
                                initial: 'animated',
                                pinned: 'slideDown',
                                unpinned: 'slideUp'
                            },
                            offset: 100,
                            tolerance: 5
                        });

                        fastdom.write(function () {
                            nav.init();
                        });
                    })();
                }
            });
        }
    }).create();

    return stickyNav;
});