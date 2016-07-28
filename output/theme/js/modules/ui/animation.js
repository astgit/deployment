define(function (require) {
    var forEach = require('lodash/collection/forEach');
    var stampit = require('stampit');
    require('velocityui');

    var animations = stampit().state({
        config: {
            duration: {
                base: 800,
                fast: 400,
                slow: 1200
            },
            easing: {
                jui: 'easeOutExpo',
                spring: [500, 20]
            }
        }
    }).methods({
        options: function options(values) {
            var _this = this;

            var optionsObj = {};
            var map = { 'd': 'duration', 'e': 'easing', 'w': 'delay' };

            forEach(values, function (value, i) {
                if (typeof map[i] === 'string') {
                    optionsObj[map[i]] = _this.config[map[i]][values[i]];
                } else {
                    optionsObj[i] = values[i];
                }
            });

            return optionsObj;
        },

        duration: function duration(key) {
            var val = 0;

            /**
             * If the key exists use this, otherwise return a default value
             */
            if (typeof this.config.duration[key] !== 'undefined') {
                val = this.config.duration[key];
            } else {
                val = this.config.duration.base;
            }

            return val;
        },

        easing: function easing(key) {
            var val = '';

            /**
             * If the key exists use this, otherwise return a default value
             */
            if (typeof this.config.easing[key] !== 'undefined') {
                val = this.config.easing[key];
            } else {
                val = this.config.easing.jui;
            }

            return val;
        },

        delay: function delay(key) {
            return this.config.duration(key);
        }
    }).create();

    return animations;
});