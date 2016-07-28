define(['fastdom', 'modules/ui/queue-animation'], function (fastdom, queueAnimation) {
    describe('Current Layout module', function () {
        var animations;

        beforeEach(function (done) {
            loadFixtures('modules/ui/queue-animation.html');
            animations = queueAnimation.create();
            animations.init();
            fastdom.defer(done);
        });

        describe('module', function () {
            it('should return a factory', function () {
                expect(queueAnimation).toEqual(jasmine.any(Function));
            });

            it('should return an object on create', function () {
                var animationsCreate = queueAnimation.create();
                expect(animationsCreate).toEqual(jasmine.any(Object));
            });
        });

        describe('addAnimations()', function () {
            it('should add classes to an element after a delay', function (done) {
                setTimeout(function () {
                    var element = $('.js-queue-animation');

                    expect(element).toHaveClass('fadeInUp');
                    done();
                }, 250);
            });

            it('should remove classes to an element after a delay', function (done) {
                setTimeout(function () {
                    var element = $('.js-queue-animation');

                    expect(element).not.toHaveClass('queued');
                    done();
                }, 250);
            });
        });
    });
});
