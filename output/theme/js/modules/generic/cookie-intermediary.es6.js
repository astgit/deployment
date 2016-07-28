define((require) => {

    const stampit = require('stampit');
    const $ = require('jquery');
    const cookies = require('cookies');

    const overlayTarget = document.getElementById('financialIntermediaryOverlay');
    const confirmButton = document.getElementById('js-confirm-intermediary');
    const declineButton = document.getElementById('js-decline-intermediary');

    const home = "http://www.castletrust.co.uk/";

    const cookieIntermediary = stampit()
        .methods({
            init () {
                if(window.globalData.isIntermediary){
                    this.checkForCookie();                    
                }
            },

            checkForCookie () {
                if(!$.cookie('IntermediaryConfirmed')){
                    this.displayPrompt();
                }
            },

            displayPrompt () {
                overlayTarget.classList.add("is-fixed");
                this.clickListeners();
            },

            clickListeners () {
                confirmButton.addEventListener('click', this.confirmAndAddCookie.bind(this));
                declineButton.addEventListener("click", this.denyAndRedirect);
            },

            confirmAndAddCookie () {
                $.cookie('IntermediaryConfirmed', 'true', { expires: 91, path: '/' });
                overlayTarget.classList.remove("is-fixed");
            },
             
            denyAndRedirect () {
                const destination = (document.referrer.indexOf(home) !== -1)  ? document.referrer : home;

                window.location = destination;              
            }

        })
        .create();


    return cookieIntermediary;
});
