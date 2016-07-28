if (window.globalData.isModernBrowser) {
    require(['common'], () => {
        require(['app/base'], (app) => {
            app.init();
        });
        // PUSH NAV
        require(['modules/navs/push'], function (pushNav) {
           var nav = pushNav.create();
           nav.init();
        });
        // BDM FINDER
        require(['modules/forms/bdm'], function (Bdm) {
        	// var bdm = Bdm.create();
            var bdm = new Bdm();
        	bdm.init();
        });
        // REMORTGAGE TOOL
        require(['modules/forms/remortgage']);

        // LINKING
        require(['modules/ui/linking'], function (Linking) {
            var linking = new Linking();
            linking.init();
        });
        // OVERLAYS 
        require(['modules/ui/overlay'], function (Overlay) {
            var overlay = new Overlay();
            overlay.init();
        });
        // TABS 
        require(['modules/ui/tabs']);
    });
}
