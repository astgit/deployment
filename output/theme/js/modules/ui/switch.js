define(function(require) {
    /**
     * @fileOverview A module for creating switched (show/hide) elements
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib:jquery
     */
    var $ = require('jquery'),
        cookies = require('cookies');


    /**
     * A module for creating switched (show/hide) elements
     * @namespace Switch
     * @constructor
     * @param {object} [_config] - User-defined configuration for the elements
     * @example
     *  new Switch().init();
     * @example
     *  <nav class="Switch">
     *      <ul>
     *          ...
     *      </ul>
     *  </nav>
     * @return {Function} A new Switch instance that will stick content on the page depending on  where the user has scrolled.
     */
    function Switch(_config) {
        /**
         * @typedef Switch.cache
         * @type multiple_variables
         * @description Cached commonly used jQuery selectors to increase performance
         * @property {object} $window - The window object
         * @property {object} $document - The document object
         * @property {object} $item - The Switch element container
         * @property {object} $parent - The parent item that affects the Switch item position
         * @property {object} $footer - The site's footer
         */
        var $switches, $items, $active_switch = null;


        /**
         * @typedef Switch.cache
         * @type multiple_variables
         * @description Cached shared variables
         */
        //var;


        /**
         * @typedef Switch.config
         * @description Configuration for the Switch instance.
         * @type {object}
         * @property {boolean} [animated=true] - Add animations to the different Switch states
         * @property {boolean} [saveState=true] - If set to true the state of the switch will be saved in a cookie
         * @property {string} [$items=".switch] - The class for selecting switch items
         * @property {object} [$switches=".switch"] - The class for selecting switches
         */
        var config = {
            animated: true,
            items: '.switch-item',
            saveState: true,
            switches: '.switch'
        };


        /**
         * Initiate module.
         * @memberOf Switch
         * @instance
         * @method init
         */
        function init() {
            /**
             * Merge cuscroll_topom/base configuration
             * TODO: drop jQuery dependency
             */
            if (_config) {
                config = $.extend(true, config, _config);
            }


            _cache();
            _events();
            _restoreStates();
        }


        /**
         * Handle events on the page.
         * @memberOf Switch
         * @instance
         * @method _events
         */
        function _events () {
            $switches.on('click.switch', 'a', _toggleSwitch);
        }


        /**
         * Cache commonly used selectors.
         * @memberOf Switch
         * @instance
         * @method _cache
         */
        function _cache() {
            $switches = $(config.switches);
            $items = $(config.items);

            $active_switch = $('.switch__item > .is-active');
        }


        /**
         * Refresh the cache.
         * @memberOf Switch
         * @instance
         * @method refreshCache
         */
        function refreshCache() {
            _cache();
        }


        /**
         * Toggle the state of a switch.
         * @memberOf Switch
         * @instance
         * @method _toggleSwitch
         */
        function _toggleSwitch (e) {
            var $this = $(this),
                active = $this.hasClass('is-active');

            if (!active) {
                /**
                 * Remove the state of a previously selection
                 */
                if ($active_switch !== null && $active_switch !== $this) {
                    $active_switch.removeClass('is-active');
                    $items.filter('.switch-' + $active_switch.attr('data-switch')).hide();
                    $active_switch = null;
                }
                
                $this.addClass('is-active');
                $items.filter('.switch-' + $this.attr('data-switch')).show();
                $active_switch = $this;


                /**
                 * Save the state via cookie
                 */
                if (config.saveState) {
                    _saveState(
                        $this.parent().parent().attr('data-switch-id'),
                        $this.attr('data-switch')
                    );
                }
            }

            return false;
        }


        /**
         * Save the state of a switch by writing a cookie.
         * @memberOf Switch
         * @instance
         * @method _saveState
         */
        function _saveState (switch_id, state_id) {
            $.cookie(switch_id, state_id, {path: '/'});
        }


        /**
         * Restore the state of a switch from reading a cookie.
         * @memberOf Switch
         * @instance
         * @method _restoreStates
         */
        function _restoreStates () {
            $switches.each(function () {
                var cookie = $.cookie($(this).attr('data-switch-id'));

                if (cookie !== undefined) {
                    $(this).find('a[data-switch="' + cookie + '"]').trigger('click');
                }
            });
        }


        return {
            init: init,
            refreshCache: refreshCache
        };
    }


    /**
     * @return {function} Return the Switch function
     */
    return Switch;
});