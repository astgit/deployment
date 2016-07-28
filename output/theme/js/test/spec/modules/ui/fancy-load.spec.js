define(['fastdom', 'modules/ui/fancy-load'], function (fastdom, fancyLoad) {
    describe('Current Layout module', function () {
        beforeEach(function (done) {
            loadFixtures('modules/ui/fancy-load.html');
            fancyLoad.init();
            fastdom.defer(done);
        });

        describe('module', function () {
            it('should return a singleton', function () {
                expect(fancyLoad).toEqual(jasmine.any(Object));
            });
        });

        describe('initialisation', function () {
            it('should call load()', function (done) {
                spyOn(fancyLoad, 'load');
                fancyLoad.init();

                /**
                 * Defer for 2 frames to account for read/write
                 */
                fastdom.defer(2, function () {
                    expect(fancyLoad.load).toHaveBeenCalled();
                    done();
                });
            });
        });

        describe('load()', function () {
            it('should add a class to the main element', function (done) {
                fastdom.defer(2, function () {
                    expect(fancyLoad.$content).toHaveClass('is-visible');
                    done();
                });
            });
        });

        describe('unload()', function () {
            beforeEach(function () {
                /**
                 * Override url change
                 */
                fancyLoad.changeUrl = function () {
                    return false;
                }
            });

            it('should do nothing if no url is passed', function (done) {
                fancyLoad.unload();

                fastdom.defer(function () {
                    expect(fancyLoad.$content).toHaveClass('is-visible');
                    done();
                });
            });

            it('should remove a class from the main element if a url is passed', function (done) {
                fancyLoad.unload('test');

                fastdom.defer(function () {
                    expect(fancyLoad.$content).not.toHaveClass('is-visible');
                    done();
                });
            });
        });
    });
});
