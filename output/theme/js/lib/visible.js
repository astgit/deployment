(function($) {
    /**
     * Copyright 2012, Digital Fusion
     * Licensed under the MIT license.
     * http://teamdf.com/jquery-plugins/license/
     *
     * @author Sam Sehnert
     * @desc A small plugin that checks whether elements are within
     *     the user visible viewport of a web browser.
     *     only accounts for vertical position, not horizontal.
     */
    $.fn.visible = function(offset) {
        if ($(this).length) {
            offset = (typeof(offset) === 'undefined') ? 0 : offset;

            var $this = $(this),
                $window = $(window),
                window_scroll_top = $window.scrollTop() + offset,
                this_top = $this.offset().top;

            return ((window_scroll_top >= this_top));
        }

        return false;
    };
})(jQuery);