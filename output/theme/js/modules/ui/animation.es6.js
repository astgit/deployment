define((require) => {
    const forEach = require('lodash/collection/forEach');
    const stampit = require('stampit');
    require('velocityui');


    const animations = stampit()
        .state({
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
        })
        .methods({
            options (values) {
                let optionsObj = {};
                let map = {'d': 'duration', 'e': 'easing', 'w': 'delay'};

                forEach(values, (value, i) => {
                    if (typeof map[i] === 'string') {
                        optionsObj[map[i]] = this.config[map[i]][values[i]];
                    } else {
                        optionsObj[i] = values[i];
                    }
                });

                return optionsObj;
            },

            duration (key) {
                let val = 0;

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

            easing (key) {
                let val = '';

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

            delay (key) {
                return this.config.duration(key);
            }
        })
        .create();


    return animations;
});
