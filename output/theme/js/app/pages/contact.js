define(function (require) {
    var $ = require('jquery');
    var fastdom = require('fastdom');
    var stampit = require('stampit');
    var animations = require('modules/ui/animation');
    require('parsley');

    var contact = stampit().methods({
        init: function init() {
            var _this = this;

            fastdom.read(function () {
                _this.$form = $('#contact-form');
                _this.$fields = _this.$form.find('[name^="f_"]');
                var $formContainer = $('.js-form');
                var $fallbackContainer = $('.js-form-fallback');

                fastdom.write(function () {
                    $formContainer.addClass('hide-mobile').removeClass('hide');
                    $fallbackContainer.addClass('hide-until-mobile');

                    $(document).on('submit', '#contact-form', $.proxy(_this.handleSubmit, _this));
                    _this.$form.parsley();
                });
            });
        },

        handleSubmit: function handleSubmit(event) {
            event.preventDefault();

            if (this.$form.parsley().isValid()) {
                this.submit();
            }
        },

        submit: function submit() {
            var post = $.ajax({
                type: 'POST',
                url: 'https://clients.enablermail.com/pancentric/frm/index.cfm?id=6eb0efc6-90cb-8576-65ff-df84e60f471d&no-relocate=1',
                data: this.$form.serialize()
            });

            post.fail(this.showError.bind(this));
            post.done(this.showSuccess.bind(this));
        },

        showError: function showError() {
            fastdom.write(function () {
                $('.js-error-feedback').velocity('slideDown', {
                    duration: animations.config.duration.base,
                    easing: animations.config.easing.spring
                });
            });
        },

        hideError: function hideError() {
            fastdom.write(function () {
                $('.js-error-feedback').velocity('slideUp', {
                    duration: animations.config.duration.fast,
                    easing: animations.config.easing.jui
                });
            });
        },

        showSuccess: function showSuccess() {
            this.hideError();
            $(document).off('submit');

            fastdom.write(function () {
                $('.js-success-feedback').velocity('slideDown', {
                    duration: animations.config.duration.base,
                    easing: animations.config.easing.spring
                });

                $('.js-contact-form').velocity('slideUp', {
                    duration: 300
                });
            });
        }
    }).create();

    return contact;
});