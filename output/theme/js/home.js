if (window.globalData.isModernBrowser) {
    require(['common'], function () {
        require(['app/base', 'app/pages/home'], function (app, home) {
            app.init();
            home().init();
        });
    });
}