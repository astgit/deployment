define(['fastdom', 'modules/ui/load-svg'], function (fastdom, loadSvg) {
    describe('Current Layout module', function () {
        beforeEach(function (done) {
            loadFixtures('modules/ui/load-svg.html');
            loadSvg.init();
            fastdom.defer(done);
        });

        describe('module', function () {
            it('should return a singleton', function () {
                expect(loadSvg).toEqual(jasmine.any(Object));
            });
        });

        describe('initialisation', function () {
            beforeEach(function (done) {
                fastdom.defer(2, done);
            });

            it('should set the data attribute', function () {
                var element = $('.js-load-svg');
                expect(element).toHaveAttr('data', 'load-svg.svg');
            });
        });
    });
});
