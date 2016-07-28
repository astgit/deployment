define(function (require) {
    'use strict';

    /**
     * @fileOverview A module for clicking between tabs; hiding/showing content
     * @author Jane Kelly
     * @version 0.1.0
     * @requires lib:jquery
     * @requires lib:parsley
     */
    var $ = require('jquery'),
        $tabs = $('[data-purpose="tab"]'),
        $sections = $('[data-section]');

    (function () {
        $tabs.on('click', function () {
            $sections.addClass('is-hidden');
            $('[data-section="' + $(this).data('tab') + '"]').removeClass('is-hidden');

            $tabs.removeClass('button--dark--highlight');
            $(this).addClass('button--dark--highlight');
        });
    })();

});