define((require) => {
    /**
     * A module
     *
     * @module module
     * @author -
     * @version 0.0.0
     * @requires lib/stampit
     * @requires lib/fastdom
     * @requires lib/jquery
     * @requires lib/lodash/object/merge
     *
     * @example <caption>Include the module</caption>
     *  let module = require('modules/modules/module');
     *
     * @example <caption>Instantiate the module</caption>
     *  module.init();
     */

    const stampit = require('stampit');
    const fastdom = require('fastdom');
    const $ = require('jquery');
    const merge = require('lodash/object/merge');


    const module = stampit()
        .state({
            config: {

            }
        })
        .methods({
            /**
             * Hello, world
             * @method init
             */
            init (userConfig) {
                this.config = merge({}, this.config, userConfig);
            }
        })
        .enclose(() => {

        });
        //.create();


    return module;
});
