define(['fastdom', 'modules/ui/hamburger'], function (fastdom, hamburger) {
    describe('Current Layout module', function () {
        beforeEach(function (done) {
            loadFixtures('modules/ui/hamburger.html');
            hamburger.init();
            fastdom.defer(done);
        });

        describe('module', function () {
            it('should return a singleton', function () {
                expect(hamburger).toEqual(jasmine.any(Object));
            });
        });

        describe('initialisation', function () {
            it('should add a delegate event listener for element clicks', function () {
                var element = $('.js-toggle-hamburger');
                expect(element).toHandleWith('click', hamburger.toggle);
            });
        });

        describe('toggle()', function () {
            it('should add a class on an element that is not toggled', function (done) {
                var element = $('.js-toggle-hamburger');
                element.click();

                fastdom.defer(function () {
                    expect(element).toHaveClass('is-open');
                    done();
                });
            });

            it('should remove a class on an element that is toggled', function (done) {
                var element = $('.js-toggle-hamburger');
                element.click();

                fastdom.defer(function () {
                    expect(element).toHaveClass('is-open');

                    fastdom.defer(function () {
                        element.click();

                        fastdom.defer(function () {
                            expect(element).not.toHaveClass('is-open');
                            done();
                        });
                    });
                });
            });
        });
    });
});
