define((require) => {
    /**
     * A module for time-based wrapping the store.js localStorage plugin.
     *
     * @module store
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib/stampit
     * @requires lib/store
     *
     * @example <caption>Include the module</caption>
     *  let store = require('modules/generic/store');
     *
     * @example <caption>Set a stored item that expires in 5 minutes</caption>
     *  let save = store.set('myKey', {foo: bar, expires: (60 * 60 * 5)});
     *
     * @example <caption>Retrieve a stored item</caption>
     *  let data = store.get('myKey');
     *
     * @example <caption>Retrieve a stored item</caption>
     *  let data = store.get('myKey');
     */

    const stampit = require('stampit');
    const store = require('lib/store');


    const localStore = stampit()
        .state({
            flush: false
        })
        .methods({
            /**
             * Check if the data has expired based on its 'expires' prop
             * @method checkExpiry
             * @property {String} key - The key identifier
             * @property {Object} data - The retrieved object
             * @returns {Object} - The data object
             */
            checkExpiry (key, data) {
                let returnData = {};

                if (data) {
                    if (data.expires && (new Date().getTime() - data.created) > data.expires) {
                        /**
                         * Remove an item if it has expired and is no longer needed
                         */
                        if (this.flush) {
                            store.remove(key);
                        }
                    } else {
                        returnData = data.data;
                    }
                }

                return returnData;
            },

            /**
             * Retrieve an object from local storage
             * @method get
             * @property {String} key - The key identifier
             * @returns {Object} - The data object
             */
            get (key) {
                let data = store.get(key);

                return this.checkExpiry(key, data);
            },

            /**
             * Save an object in local storage
             * @method set
             * @property {String} key - The key identifier
             * @property {Object} val - The data to save
             */
            set (key, val) {
                let data = val;

                data.created = new Date().getTime();
                store.set(key, data);
            }
        })
        .create();


    return localStore;
});
