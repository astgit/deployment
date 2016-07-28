 /**
 * A module for handling the base functionality required for the site.
 */
define((require) => {
    /**
     * These are very common modules and are included here so that they can be
     * excluded from per-module builds during optimisation.
     */
    const stampit = require('stampit');
    const fastdom = require('fastdom');
    const $ = require('jquery');
    require('modules/generic/polyfills');


    /**
     * These are the base modules used throughout the site
     */
    const conditions = require('app/conditions');
    const showHide = require('modules/ui/show-hide');
    const media = require('modules/ui/media');
    const overlayNav = require('modules/navs/overlay');
    const jsClass = require('modules/ui/js-class');
    const currentLayout = require('modules/ui/current-layout');
    const cookieIntermediary = require('modules/generic/cookie-intermediary');
    require('lib/lazysizes');
    require('lib/picturefill');


    return {
        init () {
            jsClass.init();
            conditions.init();
            currentLayout.init();
            media.init();
            overlayNav.init();
            showHide.init();
            cookieIntermediary.init();
        }
    };
});
