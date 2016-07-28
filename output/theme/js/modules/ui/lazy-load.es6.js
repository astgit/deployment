define((require) => {
    /**
     * A module for creating lazy-loaded images and backgrounds.
     *
     * @module lazyLoad
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib/jquery
     * @requires lib/stampit
     * @requires lib/unveil
     *
     * @example <caption>Include the module</caption>
     *  let lazyLoad = require('modules/ui/lazy-load');
     *
     * @example <caption>Instantiate the module</caption>
     *  lazyLoad.init();
     *
     */

    const $ = require('jquery');
    const stampit = require('stampit');
    require('unveil');


    const lazyLoad = stampit()
        .methods({
            /**
             * Call unveil() plugin.
             * @method init
             */
            init () {
                $(() => {
                    $('img, [data-aload]').unveil(200);
                });
            }
        })
        .create();


    return lazyLoad;
});
