define((require) => {
    /**
     * A module for creating EU cookie law notifications
     *
     * @module cookieNotice
     * @author Sean McEmerson
     * @version 0.3.0
     * @requires lib/jquery
     * @requires lib/stampit
     * @requires lib/fastdom
     * @requires lib/cookie-cuttr
     * @requires lib/lodash/object/merge
     *
     * @example <caption>Include the module</caption>
     *  let cookieNotice = require('modules/generic/cookie-notice');
     *
     * @example <caption>Add functionality</caption>
     *  cookieNotice.init({...config});
     */

    const stampit = require('stampit');
    const fastdom = require('fastdom');
    const $ = require('jquery');
    const merge = require('lodash/object/merge');
    require('cookieCutter');


    const cookieNotice = stampit()
        .state({
            config: {
                cookieAnalyticsMessage: '<p>The cookies which we use on this site record information about your online preferences, remember information about you when you visit our site and compile statistical reports on website activity. Some of the cookies we use are essential in order for us to provide our services and the website to you. By clicking \'I agree\' or by continuing to use our site you are consenting to our use of cookies in accordance with our cookies policy.</p>',
                cookieAcceptButtonText: 'I agree',
                cookieWhatAreTheyLink: '/cookies/',
                cookieWhatAreLinkText: 'More information'
            }
        })
        .methods({
            /**
             * Merge custom config and initialise the jQuery plugin
             * @method init
             */
            init (userConfig) {
                if (userConfig) {
                    this.config = merge({}, this.config, userConfig);
                }

                fastdom.write(() => {
                    $.cookieCuttr(this.config);
                });
            }
        })
        .create();


    return cookieNotice;
});
