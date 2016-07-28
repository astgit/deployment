define(function (require) {

    var stampit = require('stampit');
    var $ = require('jquery');
    var cookies = require('cookies');

    var overlayTarget = document.getElementById('financialIntermediaryOverlay');
    var confirmButton = document.getElementById('js-confirm-intermediary');
    var declineButton = document.getElementById('js-decline-intermediary');

    var home = "http://www.castletrust.co.uk/";

    var cookieIntermediary = stampit().methods({
        init: function init() {
            if (window.globalData.isIntermediary) {
                this.checkForCookie();
            }
        },

        checkForCookie: function checkForCookie() {
            if (!$.cookie('IntermediaryConfirmed')) {
                this.displayPrompt();
            }
        },

        displayPrompt: function displayPrompt() {
            overlayTarget.classList.add("is-fixed");
            this.clickListeners();
        },

        clickListeners: function clickListeners() {
            confirmButton.addEventListener('click', this.confirmAndAddCookie.bind(this));
            declineButton.addEventListener("click", this.denyAndRedirect);
        },

        confirmAndAddCookie: function confirmAndAddCookie() {
            $.cookie('IntermediaryConfirmed', 'true', { expires: 91, path: '/' });
            overlayTarget.classList.remove("is-fixed");
        },

        denyAndRedirect: function denyAndRedirect() {
            var destination = document.referrer.indexOf(home) !== -1 ? document.referrer : home;

            window.location = destination;
        }

    }).create();

    return cookieIntermediary;
});