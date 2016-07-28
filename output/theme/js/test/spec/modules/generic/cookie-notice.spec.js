define(['fastdom', 'modules/generic/cookienotice'], function (fastdom, cookieNotice) {
    describe('Current Layout module', function () {
        beforeEach(function () {
            loadFixtures('modules/generic/cookie-notice.html');
            cookieNotice.init({
                cookieAcceptButtonText: 'yaldi'
            });
        });

        describe('module', function () {
            it('should return a singleton', function () {
                expect(cookieNotice).toEqual(jasmine.any(Object));
            });
        });

        describe('initialisation', function () {
            it('should merge any overriding configuration values', function () {
                expect(cookieNotice.config.cookieAcceptButtonText).toEqual('yaldi');
            });

            it('should add the cookie cuttr plugin to the page', function (done) {
                fastdom.defer(function () {
                    var element = $('.cc-cookies');
                    expect(element[0]).toBeInDOM();
                    done();
                });
            });

            it('should add the cookie cuttr plugin to the page with custom configuration applied', function (done) {
                fastdom.defer(function () {
                    var element = $('.cc-cookie-accept');
                    expect(element.text()).toContain('yaldi');
                    done();
                });
            });
        });
    });
});
