/**
 * Base config for all require files
 */
define(() => {
    require.config({
        baseUrl: `${window.globalData.basePath}/js`,
        paths: {
            async: 'lib/async',
            accounting: 'lib/accounting',
            jquery: 'lib/jquery',
            easing: 'lib/jquery.easing',
            jqueryui: 'lib/jquery-ui',
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
            modernizr: 'modules/generic/modernizr',
            TweenMax: 'lib/tweenmax',
            TimelineMax: 'lib/timelinemax',
            OnepageScroll: 'lib/onepage-scroll',
            ScrollMagic: 'lib/scrollmagic',
            touchSwipe: 'lib/touchSwipe',
            'ScrollMagic.debug': 'lib/scrollmagic.debug',
            unveil: 'lib/unveil'
        },
        shim: {
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
            cookies: {
                deps: ['jquery'],
                exports: 'cookies'
            },
            velocityui: {
                deps: ['velocity']
            },
            fitvids: {
                deps: ['jquery'],
                exports: 'fitvids'
            },
            touchSwipe: {
                deps: ['jquery']
            },
            unveil: {
                deps: ['jquery']
            }
        }
    });
});
