var allTestFiles = [];
var TEST_REGEXP = /.spec.js/i;


Object.keys(window.__karma__.files).forEach(function(file) {
    if (TEST_REGEXP.test(file)) {
        var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '');
        allTestFiles.push(normalizedTestModule);
    }
});


require.config({
    baseUrl: '/base',
    callback: function () {
        require(['modules/generic/polyfills'], function () {
            window.__karma__.start();
        });

        var fixtures = jasmine.getFixtures();

        fixtures.fixturesPath = 'base/test/fixtures/';
    },
    deps: allTestFiles,
    paths: {
        async: 'lib/async',
        jquery: 'lib/jquery',
        easing: 'lib/jquery.easing',
        underscore: 'lib/underscore',
        conditionizr: 'lib/conditionizr',
        mobileBoilerplate: 'lib/mobile-boilerplate',
        parsley: 'lib/parsley',
        sly: 'lib/sly',
        cookies: 'lib/cookies',
        cookieCutter: 'lib/cookiecuttr',
        velocity: 'lib/velocity',
        velocityui: 'lib/velocity.ui',
        fitvids: 'lib/fitvids',
        promise: 'lib/promise',
        lodash: 'lib/lodash',
        fastdom: 'lib/fastdom',
        stampit: 'lib/stampit',
        modernizr: 'modules/generic/modernizr'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        mobileBoilerplate: {
            exports: 'MBP'
        },
        easing: {
            deps: ['jquery'],
            exports: 'easing'
        },
        visible: {
            deps: ['jquery'],
            exports: 'visible'
        },
        parsley: {
            deps: ['jquery'],
            exports: 'parsley'
        },
        sly: {
            deps: ['jquery'],
            exports: 'sly'
        },
        cookieCutter: {
            deps: ['jquery', 'cookies'],
            exports: 'cookieCutter'
        },
        velocityui: {
            deps: ['velocity']
        },
        fitvids: {
            deps: ['jquery'],
            exports: 'fitvids'
        }
    }
});
