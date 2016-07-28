define((require) => {
    /**
     * A module for creating a feed of social posts.
     *
     * @module feed
     * @author Sean McEmerson
     * @version 0.1.0
     * @requires lib/stampit
     * @requires lib/fastdom
     * @requires lib/jquery
     * @requires lib/lodash/object/merge
     * @requires lib/lodash/collection/map
     * @requires modules/generic/helper
     * @requires modules/generc/local-store
     *
     * @example <caption>Include the module</caption>
     *  let feed = require('modules/social/feed');
     *
     * @example <caption>Instantiate the module</caption>
     *  feed.init();
     */

    const stampit = require('stampit');
    const fastdom = require('fastdom');
    const $ = require('jquery');
    const merge = require('lodash/object/merge');
    const map = require('lodash/collection/map');
    const helper = require('modules/generic/helper');
    const localStore = require('modules/generic/local-store');


    const feed = stampit()
        .state({
            config: {
                feeds: ['facebook', 'twitter'],
                limit: 5,
                username: ''
            }
        })
        .methods({
            /**
             * Hello, world
             * @method init
             */
            init (userConfig) {
                this.config = merge({}, this.config, userConfig);
                this.params = this.formatParams();
            },

            /**
             * Format required URL parameters for the fetch URL
             * @method formatParams
             */
            formatParams () {
                let params = map(this.config, (val, key) => {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(val);
                });

                return params.join('&');
            },

            /**
             * Retrieve data from local storage if it exists. Otherwise fetch via AJAX.
             * @return retrieveData
             */
            retrieveData () {
                let savedFeed = localStore.get(this.params);

                if (!savedFeed) {
                    $.get(helper.globalData('basePath', '') + 'social-feed/', this.params)
                        .done((result) => {
                            this.saveFeed(result);
                            this.showFeed(result);
                        });
                } else {
                    this.showFeed(savedFeed);
                }
            },

            /**
             * Save retrieved feed data to local storage for faster retrievel and less requests.
             * @property {Object} data - The object to save
             * @method saveFeed
             */
            saveFeed (data) {
                localStore.set(this.params, {
                    data,
                    expires: (60 * 60 * 5)
                });
            },

            /**
             * Show a feed by adding its content to the page.
             * @property {Object} data - The feed data to add to the page
             * @method showFeed
             */
            showFeed (data) {
                fastdom.read(() => {
                    let container = $('#feed');

                    if (container.length) {
                        fastdom.write(() => {
                            container.innerHTML = data;

                            $('.js-social-feed')
                                .removeClass('hide')
                                .addClass('animated fadeIn');
                        });
                    }
                });
            }
        })
        .create();


    return feed;
});
