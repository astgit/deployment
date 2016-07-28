define(['fastdom', 'modules/ui/media'], function (fastdom, media) {
    describe('Current Layout module', function () {
        beforeEach(function (done) {
            loadFixtures('modules/ui/media.html');
            media.init();
            fastdom.defer(done);
        });

        describe('module', function () {
            it('should return a singleton', function () {
                expect(media).toEqual(jasmine.any(Object));
            });
        });

        describe('embedVideoPlayer()', function () {
            it('should handle click events from the play button', function () {
                var element = $('.js-play-video');
                var events = $._data(element[0], 'events');
                expect(events.click.length).toEqual(1);
            });

            it('should remove click events handlers from the play button once a video has been embedded', function (done) {
                var element = $('.js-play-video');
                element.click();

                fastdom.defer(function () {
                    var events = $._data(element[0], 'events');
                    expect(events).toEqual(undefined);
                    done();
                });
            });

            it('should embed an iframed youtube video when called', function (done) {
                $('.js-play-video').click();

                fastdom.defer(function () {
                    var element = $('.js-video-embed');
                    expect(element.find('iframe').length).toEqual(1);
                    expect(element).toHaveClass('video-embed--embedded');
                    done();
                });
            });
        });
    });
});
