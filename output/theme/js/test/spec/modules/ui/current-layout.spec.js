define(['modules/ui/current-layout'], function (currentLayout) {
    describe('Current Layout module', function () {
        beforeEach(function () {
            currentLayout.init();

            /**
             * Fake layout as CSS isn't available to set the pseudo content
             */
            currentLayout.currentLayout = 'desktop';
        });

        describe('module', function () {
            it('should return a singleton', function () {
                expect(currentLayout).toEqual(jasmine.any(Object));
            });
        });

        describe('initialisation', function () {
            it('should set the default state', function () {
                spyOn(currentLayout, 'update');

                currentLayout.init();
                expect(currentLayout.update).toHaveBeenCalled();
            });

            it('should add a throttled event handler for window resizes', function () {
                var windowEvents = $._data(window, 'events');
                expect(windowEvents.resize[0].handler).toEqual(jasmine.any(Function));
            });

            // it('should throttle calls to update()', function () {
            //     spyOn(currentLayout, 'update');
            //     $(window).resize();
            //     expect(currentLayout.update).toHaveBeenCalled();
            // });
        });

        describe('layout()', function () {
            it('should set the current layout if it has not been set already', function () {
                spyOn(currentLayout, 'update');
                currentLayout.currentLayout = '';

                currentLayout.layout();
                expect(currentLayout.update).toHaveBeenCalled();
            });

            it('should return the name of the current layout', function () {
                var layout = currentLayout.layout();
                expect(layout).toEqual('desktop');
            });
        });

        describe('is()', function () {
            it('should return false if no string is provided', function () {
                var is = currentLayout.is();
                expect(is).toEqual(false);
            });

            it('should check if a string is contained in the current layout name', function () {
                var is;

                currentLayout.currentLayout = 'tablet-small';
                is = currentLayout.is('~tablet');
                expect(is).toEqual(true);

                is = currentLayout.is('~tablet-small');
                expect(is).toEqual(true);

                is = currentLayout.is('~smablet');
                expect(is).toEqual(false);

                is = currentLayout.is('~smablet-tall');
                expect(is).toEqual(false);

                currentLayout.currentLayout = 'desktop';
                is = currentLayout.is('~desktop');
                expect(is).toEqual(true);
            });

            it('should check if a string equals the current layout name', function () {
                var is;

                currentLayout.currentLayout = 'tablet-small';
                is = currentLayout.is('tablet');
                expect(is).toEqual(false);

                is = currentLayout.is('tablet-small');
                expect(is).toEqual(true);

                is = currentLayout.is('smablet-tall');
                expect(is).toEqual(false);

                currentLayout.currentLayout = 'desktop';
                is = currentLayout.is('desktop');
                expect(is).toEqual(true);

                is = currentLayout.is('desktop-big');
                expect(is).toEqual(false);                
            });
        });

        describe('not()', function () {
            it('should use the is() function to determine equality', function () {
                spyOn(currentLayout, 'is');

                currentLayout.not('desktop');
                expect(currentLayout.is).toHaveBeenCalled();
                expect(currentLayout.is).toHaveBeenCalledWith('desktop');
            });

            it('should check if a string is not contained in the current layout name', function () {
                var not;

                currentLayout.currentLayout = 'tablet-small';
                not = currentLayout.not('~mobile');
                expect(not).toEqual(true);

                not = currentLayout.not('~mobile-small');
                expect(not).toEqual(true);

                not = currentLayout.not('~smablet');
                expect(not).toEqual(true);

                not = currentLayout.not('~smablet-tall');
                expect(not).toEqual(true);

                currentLayout.currentLayout = 'desktop';
                not = currentLayout.not('~desktop');
                expect(not).toEqual(false);
            });

            it('should check if a string does not equal the current layout name', function () {
                var not;

                currentLayout.currentLayout = 'tablet-small';
                not = currentLayout.not('tablet');
                expect(not).toEqual(true);

                not = currentLayout.not('tablet-small');
                expect(not).toEqual(false);

                not = currentLayout.not('smablet-tall');
                expect(not).toEqual(true);

                currentLayout.currentLayout = 'desktop';
                not = currentLayout.not('desktop');
                expect(not).toEqual(false);

                not = currentLayout.not('desktop-big');
                expect(not).toEqual(true);                
            });
        });
    });
});
