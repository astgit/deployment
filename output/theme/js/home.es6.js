if (window.globalData.isModernBrowser) {
    require(['common'], () => {
        require(['app/base', 'app/pages/home'], (app, home) => {
            app.init();
            home().init();
        });
    });
}
