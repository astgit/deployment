define((require) => {
    /**
     *  A module for handling a site's base media (videos and images). Fitvids.js is used for responsive video containers.
     *
     * @module media
     * @author Sean McEmerson
     * @version 0.2.0
     * @requires lib/jquery
     * @requires lib/fastdom
     * @requires lib/stampit
     * @requires lib/fastvids
     *
     * @example <caption>Include the module</caption>
     *  let media = require('modules/ui/media');
     *
     * @example <caption>Instantiate the module</caption>
     *  media.init();
     *
     * @example <caption>Markup for a video player - by default the link opens the YouTube page in an external
     *  window. If/when the JS kicks in we make the video play inline by embedding an iframe.</caption>
     *  <div class="video-embed js-video-embed" data-youtubeid="Z38EuVhXzZ8">
     *      <div class="video-embed__container">
     *           <img src="http://img.youtube.com/vi/Z38EuVhXzZ8/maxresdefault.jpg" alt="">
     *           <a href="https://www.youtube.com/watch?v=Z38EuVhXzZ8" class="js-play-video video-embed__play" target="_blank">
     *               Watch the video
     *           </a>
     *       </div>
     *   </div>
     *
     * @example <caption>A video element with the iframe embedded (after the user hits 'play')</caption>
     *  <div class="video-embed js-video-embed video-embed--embedded" data-youtubeid="Z38EuVhXzZ8">
     *      <div class="video-embed__container">
     *           <iframe width="1280" height="720" src="//www.youtube.com/embed/Z38EuVhXzZ8?autoplay=1&rel=0&showinfo=0&theme=dark&modestbranding=1" frameborder="0" allowfullscreen></iframe>
     *       </div>
     *   </div>
     */

    const $ = require('jquery');
    const fastdom = require('fastdom');
    const stampit = require('stampit');
    require('fitvids');


    const media = stampit()
        .methods({
            /**
             * Find all video elements
             * @method init
             */
            init () {
                fastdom.read(() => {
                    $('.js-play-video').on('click.embedVideoPlayer', this.embedVideoPlayer);
                });
            },

            /**
             * Embed an iframe'd YouTube player when the user hits 'play'
             * @method init
             */
            embedVideoPlayer (e) {
                /**
                 * Markup is like so:
                 * embed  > container > play button
                 */
                let $target = $(e.target);
                let $video = $target.parent().parent();

                /**
                 * Remove click listener
                 */
                $target.off('click');

                /**
                 * Embed the responsive iframe
                 */
                fastdom.write(() => {
                    $video.html('<iframe width="1280" height="720" src="//www.youtube.com/embed/' + $video.attr('data-youtubeid') + '?autoplay=1&rel=0&showinfo=0&theme=dark&modestbranding=1" frameborder="0" allowfullscreen></iframe>')
                        .addClass('video-embed--embedded');

                    if (typeof ($.fn.fitVids) === 'function') {
                        $video.fitVids();
                    }
                });

                return false;
            }
        })
        .create();


    return media;
});
