if (window.globalData.isModernBrowser) {
    require(['common'], function () {
        require(['app/base', 'app/pages/contact'], function (app, contact) {
            app.init();
            contact.init();
        });
    });
}