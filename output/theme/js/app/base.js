/**
* A module for handling the base functionality required for the site.
*/
define(function (require) {
    /**
     * These are very common modules and are included here so that they can be
     * excluded from per-module builds during optimisation.
     */
    var stampit = require('stampit');
    var fastdom = require('fastdom');
    var $ = require('jquery');
    require('modules/generic/polyfills');

    /**
     * These are the base modules used throughout the site
     */
    var conditions = require('app/conditions');
    var showHide = require('modules/ui/show-hide');
    var media = require('modules/ui/media');
    var overlayNav = require('modules/navs/overlay');
    var jsClass = require('modules/ui/js-class');
    var currentLayout = require('modules/ui/current-layout');
    var cookieIntermediary = require('modules/generic/cookie-intermediary');
    require('lib/lazysizes');
    require('lib/picturefill');

    return {
        init: function init() {
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