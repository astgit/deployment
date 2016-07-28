define(function (require) {
    /**
     * A module for lazy-loading SVGs within object tags
     *
     * @module loadSVG
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib/jquery
     * @requires lib/fastdom
     * @requires lib/stampit
     *
     * @example <caption>Include the module</caption>
     *  let loadSVG = require('modules/ui/load-svg');
     *
     * @example <caption>Instantiate the module</caption>
     *  loadSVG.init();
     *
     * @example <caption>An element defined by expected class and attributes</caption>
     *  <object type="image/svg+xml" data-url="main.svg" class="js-load-svg">
     *     <img src="fallback.png" alt="">
     *  </object>
     *
     * @example <caption>An element with it's SVG loaded and element updated</caption>
     *  <object type="image/svg+xml" data-url="main.svg" class="js-load-svg">
     *      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" class="svg-object">
     *          <circle cx="60" cy="60" r="50"/>
     *      </svg>
     *  </object>
     *
     */
    var $ = require('jquery');
    var fastdom = require('fastdom');
    var stampit = require('stampit');

    var loadSvgs = stampit().methods({
        /**
         * Select all elements on the page and edit their attributes
         * @method init
         */
        init: function init() {
            fastdom.read(function () {
                var $svgObjects = $('#content').find('.js-load-svg');

                fastdom.write(function () {
                    $.each($svgObjects, function (key, element) {
                        var $element = $(element);

                        $element.attr('data', $element.attr('data-url'));
                        $element.find('svg').addClass('svg-object');
                    });
                });
            });
        }
    }).create();

    return loadSvgs;
});