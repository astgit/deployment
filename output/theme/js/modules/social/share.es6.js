define((require) => {
    /**
     * A module for creating social share buttons. Currently supports Facebook, Twitter, Google+, LinkedIn, Pinterest,,
     *  email and print.
     *
     * @module share
     * @author Sean McEmerson
     * @version 0.3.0
     * @requires lib/jquery
     * @requires lib/fastdom
     * @requires lib/stampit
     * @requires lib/lodash/object/merge
     *
     * @example <caption>Include the module</caption>
     *  let share = require('modules/social/share');
     *
     * @example <caption>Instantiate the module</caption>
     *  share.init({...config});
     *
     * @example <caption>Instantiate the module with custom configuration</caption>
     *  share.init({
     *      facebook: {
     *          appId: 00011123
     *      }
     *  });
     *
     * @example <caption>An element defined by class</caption>
     *  <a href="#" data-service="twitter" data-title="Pancentric Digital - Imagine Tomorrow" data-url="http://www.pancentric.com" data-via="pancentric">
     *       Tweet this
     *   </a>
     */

    const stampit = require('stampit');
    const fastdom = require('fastdom');
    const $ = require('jquery');
    const merge = require('lodash/object/merge');


    const share = stampit()
        .state({
            config: {
                facebook: {
                    appId: '',
                    redirectURI: '/close.html'
                }
            }
        })
        .methods({
            /**
             * Merge custom config and setup listeners
             * @method init
             */
            init (userConfig) {
                this.config = merge({}, this.config, userConfig);

                fastdom.read(() => {
                    this.cache();
                    this.events();
                });
            },

            /**
             * Cache commonly used selectors.
             * @method cache
             */
            cache () {
                this.$window = $(window);
                this.$buttons = $('.social-share');
            },

            /**
             * Handle events on the page. Some events are created within setup().
             * @method events
             */
            events () {
                this.$buttons.on('click', 'a', (e) => this.share.call(this, e));
            },

            /**
             * Determine the site and data to share.
             * @method share
             * @param {Object} e - the jQuery event
             */
            share (e) {
                let $this = $(e.target);
                let service = $this.attr('data-service');

                if (service + 'URL' in this) {
                    let url = this[service + 'URL'].call(this, $this);

                    /**
                     * Prevent email links opening a blank pop-up window
                     */
                    if (service === 'email') {
                        window.location.href = url;
                    } else {
                        this.openWindow(url, 'Share this page');
                    }
                }

                return false;
            },

            /**
             * Format the URL for a Facebook post. If an app ID is defined we will use the nicer share window. (requires Open Graph metadata to be defined).
             * @method facebookURL
             * @param {Object} $button - the target of the event that was triggered
             * @returns {String} - A formatted URL
             */
            facebookURL ($button) {
                let url = '';

                /**
                 * If there's a Facebook app ID then show the custom share window.
                 * If not then show the new, meta data only share window.
                 */
                if (this.config.facebook.appId) {
                    /**
                     * @comment
                     * Redirects are required for Facebook sharing. If there's no redirect defined then fallback to the config-defined share URL
                     */
                    let redirectUri = this.config.facebook.redirectURI;

                    if (typeof($button.attr('data-redirect') !== 'undefined')) {
                        redirectUri = $button.attr('data-redirect');
                    }

                    url = 'https://www.facebook.com/dialog/feed?' +
                          'app_id=' + this.config.facebook.app_id +
                          '&display=popup' +
                          '&caption=' + encodeURIComponent($button.attr('data-description')) +
                          '&link=' + encodeURIComponent($button.attr('data-url')) +
                          ((typeof($button.attr('data-photo') !== 'undefined')) ? '&picture=' + encodeURIComponent($button.attr('data-photo')) : '') +
                          '&redirect_uri=' + redirectUri;
                } else {
                    url = 'https://www.facebook.com/sharer.php?' +
                          '&u=' + $button.attr('data-url');
                }

                return url;
            },

            /**
             * Format the URL for a Twitter post.
             * @method twitterURL
             * @param {Object} $button - the target of the event that was triggered
             * @returns {String} - A formatted URL
             */
            twitterURL ($button) {
                return 'https://twitter.com/intent/tweet?' +
                    '&text=' + encodeURIComponent($button.attr('data-title')) +
                    '&url=' + encodeURIComponent($button.attr('data-url')) +
                    ((typeof($button.attr('data-via')) !== 'undefined') ? '&via=' + $button.attr('data-via') : '');
            },

            /**
             * Format the URL for a LinkedIn post.
             * @method linkedInURL
             * @param {Object} $button - the target of the event that was triggered
             * @returns {String} - A formatted URL
             */
            linkedInURL ($button) {
                return 'http://www.linkedin.com/shareArticle?mini=true' +
                    '&url=' + encodeURIComponent($button.attr('data-url')) +
                    '&title=' + encodeURIComponent($button.attr('data-title')) +
                    '&summary=' + encodeURIComponent($button.attr('data-description'));
            },

            /**
             * Format the URL for a Pinterest post.
             * @method pinterestURL
             * @param {Object} $button - the target of the event that was triggered
             * @returns {String} - A formatted URL
             */
            pinterestURL ($button) {
                return 'http://pinterest.com/pin/create/button/?' +
                    'url=' + encodeURIComponent($button.attr('data-url')) +
                    '&media=' + encodeURIComponent($button.attr('data-photo')) +
                    '&description=' + encodeURIComponent($button.attr('data-description'));
            },

            /**
             * Format the URL for a email post.
             * @method emailURL
             * @param {Object} $button - the target of the event that was triggered
             * @returns {String} - A formatted URL
             */
            emailURL ($button) {
                return 'mailto:?' +
                    'subject=' + encodeURIComponent($button.attr('data-title')) +
                    '&body=' + encodeURIComponent($button.attr('data-description')) + '\n\n' + encodeURIComponent($button.attr('data-url'));
            },

            /**
             * Format the URL for a Google+ post (requires Open Graph metadata to be defined).
             * @method googlePlusURL
             * @param {Object} $button - the target of the event that was triggered
             * @returns {String} - A formatted URL
             */
            googlePlusURL ($button) {
                return 'https://plus.google.com/share?' +
                    'url=' + encodeURIComponent($button.attr('data-url'));
            },

            /**
             * Format the URL for a print post.
             * @method printURL
             * @param {Object} $button - the target of the event that was triggered
             * @returns {String} - A formatted URL
             */
            printURL () {
                return window.print;
            },

            /**
             * Open a pop-window with a share page.
             * @method openWindow
             * @param {String} url - the share page url
             * @param {String} title - the title of the window
             */
            openWindow (url, title) {
                let left = (this.$window.width() - 700) / 2;
                let top = (this.$window.height() - 500) / 2;

                window.open(url, title, 'toolbar=0,status=0,width=700,height=300,left=' + left + ',top=' + top);
            }
        });


    return share;
});
