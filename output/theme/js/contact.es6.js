if (window.globalData.isModernBrowser) {
    require(['common'], () => {
        require(['app/base', 'app/pages/contact'], (app, contact) => {
            app.init();
            contact.init();
        });
    });
}
