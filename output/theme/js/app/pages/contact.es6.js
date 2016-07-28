define((require) => {
    const $ = require('jquery');
    const fastdom = require('fastdom');
    const stampit = require('stampit');
    const animations = require('modules/ui/animation');
    require('parsley');


    const contact = stampit()
        .methods({
            init () {
                fastdom.read(() => {
                    this.$form = $('#contact-form');
                    this.$fields = this.$form.find('[name^="f_"]');
                    let $formContainer = $('.js-form');
                    let $fallbackContainer = $('.js-form-fallback');

                    fastdom.write(() => {
                        $formContainer.addClass('hide-mobile').removeClass('hide');
                        $fallbackContainer.addClass('hide-until-mobile');

                        $(document).on('submit', '#contact-form', $.proxy(this.handleSubmit, this));
                        this.$form.parsley();
                    });
                });
            },

            handleSubmit (event) {
                event.preventDefault();

                if (this.$form.parsley().isValid()) {
                    this.submit();
                }
            },

            submit () {
                let post = $.ajax({
                    type: 'POST',
                    url: 'https://clients.enablermail.com/pancentric/frm/index.cfm?id=6eb0efc6-90cb-8576-65ff-df84e60f471d&no-relocate=1',
                    data: this.$form.serialize()
                });

                post.fail(this.showError.bind(this));
                post.done(this.showSuccess.bind(this));
            },

            showError () {
                fastdom.write(() => {
                    $('.js-error-feedback').velocity('slideDown', {
                        duration: animations.config.duration.base,
                        easing: animations.config.easing.spring
                    });
                });
            },

            hideError () {
                fastdom.write(() => {
                    $('.js-error-feedback').velocity('slideUp', {
                        duration: animations.config.duration.fast,
                        easing: animations.config.easing.jui
                    });
                });
            },

            showSuccess () {
                this.hideError();
                $(document).off('submit');

                fastdom.write(() => {
                    $('.js-success-feedback').velocity('slideDown', {
                        duration: animations.config.duration.base,
                        easing: animations.config.easing.spring
                    });

                    $('.js-contact-form').velocity('slideUp', {
                        duration: 300
                    });
                });
            }
        })
        .create();


    return contact;
});
