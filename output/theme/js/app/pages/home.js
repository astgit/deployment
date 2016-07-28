/*eslint-disable*/
define(function (require) {
    'use strict';

    ParallaxSection();

    var $ = require('jquery'),
        Animation = require('modules/ui/animation'),
        TweenMax = require('TweenMax'),
        ScrollMagic = require('ScrollMagic'),
        touchSwipe = require('lib/touchSwipe');

    function ParallaxSection() {

        var $window;

        var controller,
            scenes = {},
            window_height = 0;

        function init() {
            _cache();
            _events();

            if ($('html').hasClass('no-touchevents')) {
                _setup();
            }
        }

        function _cache() {
            $window = $(window);

            window_height = $window.height();
        }

        function _events() {
            /* Swipe functionality (Mobile Devices) */

            $(".screen").swipe({
                swipeUp: function swipeUp(event, distance, duration, fingerCount, fingerData) {

                    if ($('.background.active').is('#background-7')) {} else {
                        _paraScroll();
                    }
                },

                swipeDown: function swipeDown(event, distance, duration, fingerCount, fingerData) {

                    if ($('.background.active').is('#background-1')) {} else if ($('.background.active').is('#background-7')) {
                        _paraScrollUp();
                        $('#downwards').addClass('darken').removeClass('scroll-up');
                    } else if ($('.background.active').is('#background-6')) {
                        _paraScrollUp();
                        $('#downwards').removeClass('darken');
                    } else {
                        _paraScrollUp();
                    }
                }
            });

            $('.scroll-trigger').on('click', function (e) {
                _paraScroll(e);
            });
        }

        function _setup() {
            var tween_duration = 100,
                tween_options = {
                ease: SteppedEase.easeOut,
                opacity: 0,
                top: '-20%'
            };

            controller = new ScrollMagic.Controller({
                globalSceneOptions: {
                    triggerHook: 0,
                    offset: -1,
                    autoKill: false,
                    duration: window_height,
                    reverse: true
                }
            });

            var screen1sequence = new TimelineMax().add([TweenMax.to('#screen-1 .screen__item', tween_duration, tween_options)]);

            var screen2sequence = new TimelineMax().add([TweenMax.to('#screen-2 .screen__item', tween_duration, tween_options)]);

            var screen3sequence = new TimelineMax().add([TweenMax.to('#screen-3 .screen__item', tween_duration, tween_options)]);

            var screen4sequence = new TimelineMax().add([TweenMax.to('#screen-4 .screen__item', tween_duration, tween_options)]);

            var screen5sequence = new TimelineMax().add([TweenMax.to('#screen-5 .screen__item', tween_duration, tween_options)]);

            var screen6sequence = new TimelineMax().add([TweenMax.to('#screen-6 .screen__item', tween_duration, tween_options)]);

            scenes[0] = new ScrollMagic.Scene({ triggerElement: '#screen-1' }).setClassToggle('#screen-1, #anchor-1', 'active')
            // .setPin(".no-touchevents  #screen-1")
            .setTween(screen1sequence).addTo(controller).on("enter", function (e) {
                // $('#downwards').attr('href', '#screen-2');
            });

            scenes[1] = new ScrollMagic.Scene({ triggerElement: '#screen-2' }).setClassToggle('#screen-2, #anchor-2', 'active')
            // .setPin(".no-touchevents  #screen-2")
            .setTween(screen2sequence).addTo(controller).on("enter", function (e) {
                // $('#downwards').attr('href', '#screen-3');
            });

            scenes[2] = new ScrollMagic.Scene({ triggerElement: '#screen-3' }).setClassToggle('#screen-3, #anchor-3', 'active')
            // .setPin(".no-touchevents  #screen-3")
            .setTween(screen3sequence).addTo(controller).on("enter", function (e) {
                // $('#downwards').attr('href', '#screen-4');
            });

            scenes[3] = new ScrollMagic.Scene({ triggerElement: '#screen-4' }).setClassToggle('#screen-4, #anchor-4', 'active')
            // .setPin(".no-touchevents  #screen-4")
            .setTween(screen4sequence).addTo(controller).on("enter", function (e) {
                // $('#downwards').attr('href', '#screen-5').addClass('darken');
            }).on("leave", function (e) {
                // $('#downwards').removeClass('darken');
            });

            scenes[4] = new ScrollMagic.Scene({ triggerElement: '#screen-5' }).setClassToggle('#screen-5, #anchor-5', 'active')
            // .setPin(".no-touchevents  #screen-5")
            .setTween(screen5sequence).addTo(controller).on("enter", function (e) {
                // $('#downwards').attr('href', '#screen-6');
            });

            scenes[5] = new ScrollMagic.Scene({ triggerElement: '#screen-6' }).setClassToggle('#screen-6, #anchor-6', 'active')
            // .setPin(".no-touchevents  #screen-6")
            .setTween(screen6sequence).addTo(controller).on("enter", function (e) {
                // $('#downwards').attr('href', '#screen-7').addClass('darken');
                $('.pips,.burger').addClass('darken');
            }).on("leave", function (e) {
                // $('#downwards, .pips, .burger').removeClass('darken');
            });

            scenes[6] = new ScrollMagic.Scene({ triggerElement: '#screen-7' }).on("enter", function (e) {
                // $('#downwards').attr('href', '#screen-1').addClass('scroll-up');
            }).setClassToggle('#screen-7, #anchor-7', 'active').addTo(controller).on("leave", function (e) {
                // $('#downwards').removeClass('scroll-up');
            });
        }

        function _paraScrollUp() {
            var PrevSlide = $('.screen.active').prev().attr('id'),
                PrevBackground = $('.background.active').prev().attr('id');

            // alert('prev slide is ' + PrevSlide )

            $('.screen.active').removeClass('active');
            $('#' + PrevSlide).removeClass('above').addClass('active');
            $('.background.active').css({ height: "0%" }).removeClass('active'); // Removes active state from the current slide
            $('#' + PrevBackground).addClass('active');
        }

        function _paraScroll(e) {
            // Simulates Parallax for mobile devices */

            function _checkState() {
                $('.background.active').removeClass('active'); // Removes active state from the current slide
                $('.screen.active').removeClass('active').addClass('above'); // Swaps 'active' class with the 'above' class (offsetting the screen)
                $('#' + nextSlide).css({ height: "100%" }).addClass('active'); // Gives the next slide 100% height, and applies the active state
                $('.screens .screen:eq(' + activeSlideIndex + ')').addClass('active');
            }

            if ($('html').hasClass('touchevents')) {
                var nextSlide = $('.background.active').next().attr('id'),
                    // Finds the 'active' slide and fetches the next slide's ID
                activeSlideIndex = $('.background.active').index() + 1,
                    // Fetches index of the 'active' slide
                scrollTrigger = $('#downwards');

                if ($('.background.active').is('#background-7')) {
                    $(scrollTrigger).removeClass('scroll-up');
                    $('.screen').removeClass('active above');
                    $('.background').css({ height: "0" }).removeClass('active');
                    $('#screen-1').addClass('active');
                    $('#background-1').css({ height: "100%" }).addClass('active');
                } else if ($('.background.active').is('#background-5')) {

                    $(scrollTrigger).addClass('darken');
                    _checkState();
                } else if ($('.background.active').is('#background-6')) {

                    $(scrollTrigger).removeClass('darken').addClass('scroll-up');
                    _checkState();
                } else {
                    _checkState();
                }
            }

            if (typeof e !== 'undefined') {
                var hash = e.currentTarget.hash;

                $('html').velocity('stop', true).velocity('scroll', {
                    duration: Animation.config.duration.slow,
                    easing: Animation.config.easing.jui,
                    offset: $(hash).offset().top - 0
                });

                e.preventDefault();
                e.stopPropagation();
            }
        }

        return {
            init: init
        };
    }

    return ParallaxSection;
});