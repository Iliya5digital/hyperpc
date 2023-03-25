// check and define $ as jQuery
if (typeof jQuery != "undefined") jQuery(function ($) {
    const dadataToken = window.dadataToken || '';

    // Custom validate rules for jquery validator plugin
    // =============================================
    if ($.validator) {
        $.validator.addMethod('mobile', function (value, element) {
            return this.optional(element) || /^\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}/.test(value);
        }, 'Введите номер мобильного телефона в формате +7 (123) 123-45-67');

        $.validator.addMethod('base_email', function (value, element) {
            return this.optional(element) || /^([\w\.\-\+#$^]+)@(\w+[\w\.\-]*?)(\.[a-zA-Z]{2,18})$/.test(value);
        }, 'Введите корректный адрес электронной почты');

        $.validator.addMethod('client_email', function (value, element) {
            return this.optional(element) || /^(save@hyperpc\.ru|([\w\.\-\+#$^]+@((?!hyperpc\.|epix\.)\w+[\w\.\-]*?\.)[a-zA-Z]{2,18}))$/.test(value);
        }, 'Введите корректный адрес электронной почты');
    }

    // Simpleform2 improvements
    // =============================================
    const $sf2forms = $('form.simpleForm2');
    window.sf2Improvements = function($sf2forms) {
        window.SF2Config = window.SF2Config || {};
        const authName  = window.user && window.user.name || '';
        const authEmail = window.user && window.user.email || '';

        $sf2forms.each(function() {
            const id = this.id;
            const $form = $(this);

            if (id in window.SF2Config) {
                // Timestamp in the request uri for prevent caching problems
                if (window.SF2Config[id].ajaxURI.indexOf('?') < 0) {
                    window.SF2Config[id].ajaxURI += '?' + Date.now() + Math.floor(Math.random() * 1000);
                }

                $form.on('submit', function() {
                    const uri = window.SF2Config[id].ajaxURI.substr(0, window.SF2Config[id].ajaxURI.indexOf('?'));
                    window.SF2Config[id].ajaxURI = uri + '?' + Date.now();
                });

                const $cityInput  = $form.find('input[name=city]'),
                      $nameInput  = $form.find('input[name=name]'),
                      $emailInput = $form.find('input[name=email]');

                if (authName) {
                    $nameInput.val(authName).addClass('uk-disabled')
                        .closest('.tm-label-infield').removeClass('isEmpty')
                        .find('label').addClass('uk-disabled');
                }
                if (authEmail) {
                    $emailInput.val(authEmail).addClass('uk-disabled')
                        .closest('.tm-label-infield').removeClass('isEmpty')
                        .find('label').addClass('uk-disabled');
                }

                // Set page url
                $form.find('[name="page-url"]').val(document.location.origin + document.location.pathname);

                // Suggestions
                if ($form.suggestions) {
                    [$cityInput, $nameInput, $emailInput].forEach(function($input) {
                        if ($input.length === 0 || $input.hasClass('uk-disabled')) return;
                        let suggestionType = 'ADDRESS';
                        if ($input === $nameInput) {
                            suggestionType = 'NAME';
                        } else if ($input === $emailInput) {
                            suggestionType = 'EMAIL';
                        }

                        $input.suggestions({
                            addon         : 'none',
                            count         : 5,
                            type          : suggestionType,
                            scrollOnFocus : false,
                            token         : dadataToken
                        });
                    });
                }

                // Validation
                if ($form.validate) {
                    $form.validate({
                        errorClass   : 'uk-form-danger',
                        errorElement : 'div',
                        validClass   : 'tm-form-success',
                        rules : {
                            name : {
                                minlength : 4,
                            },
                            email : {
                                client_email : true,
                            },
                            phone : {
                                mobile    : true,
                                minlength : 11,
                            },
                        },
                    });
                }

                // Form qualification
                if ($form.find('.jsRequestQualification').length > 0) {
                    const initFormData = {
                        'ajaxURI'        : window.SF2Config[id].ajaxURI,
                        'onAfterReceive' : window.SF2Config[id].onAfterReceive,
                        'onBeforeSend'   : window.SF2Config[id].onBeforeSend
                    }

                    $form.on('change', '.jsRequestQualification', function() {
                        const moduleId = $form.find('[name=moduleID]').val(),
                              val = $(this).val();
                        if (val && val !== moduleId) {
                            const key  = 'simpleForm2_' + val;

                            $form.attr('name', key)
                                 .find('input[name=moduleID]').attr('value', val);
                            if (!(key in window.SF2Config)) {
                                initFormData.ajaxURI = initFormData.ajaxURI.substr(0, initFormData.ajaxURI.indexOf('?')) + '?' + Date.now();
                                window.SF2Config[key] = initFormData;
                            }
                        }
                    });
                }

                // Toggle form fields
                const $toggledFields = $form.find('.jsToggledFields');
                if ($toggledFields.length > 0) {
                    $toggledFields.on('change', '.jsToggleSelect', function() {
                        const $select = $(this),
                              $scope = $select.closest('.jsToggledFields');
                        $scope.find('[class*="jsToggledFieldsType"]').attr('hidden', 'hidden')
                              .find('input').removeAttr('required');
                        $scope.find('.jsToggledFieldsType' + $select.val()).removeAttr('hidden')
                              .find('input').attr('required', 'required');
                    });

                    $toggledFields.find('.jsToggleCheckbox').on('change', '[type=checkbox]', function(e) {
                        const $checkbox = $(this),
                              $scope = $checkbox.closest('.jsToggledFields'),
                              $toggled = $scope.find('[class*="jsToggledFieldsType' + $checkbox.val() + '"]');
                        if ($checkbox.is(':checked')) {
                            $toggled.removeAttr('hidden').slideDown();
                        } else {
                            $toggled.slideUp(function(){
                                $(this).attr('hidden', 'hidden');
                            });
                        }
                    });

                    $toggledFields.find('.jsToggleRadio').on('change', '[type=radio]', function(e) {
                        const $activeRadio = $(this),
                              $scope = $activeRadio.closest('.jsToggledFields'),
                              $radios = $scope.find('[name="' + $activeRadio.attr('name') + '"]');

                        $radios.each(function() {
                            const $radio = $(this),
                                  $toggled = $scope.find('[class*="jsToggledFieldsType' + $radio.val() + '"]');

                            if ($radio.is(':checked')) {
                                $toggled.removeAttr('hidden').find('input, select').attr('required', 'required');
                            } else {
                                $toggled.attr('hidden', 'hidden').find('input, select').attr('required', 'required');
                            }
                        });

                    });
                }
            }
        });

        window.SF2 = window.SF2 || {};

        // Lock submit button
        window.SF2.showLoading = function($form) {
            $form.find('[type="submit"]').attr('disabled', 'disabled')
                 .prepend('<span uk-spinner="ratio: 0.67" class="uk-margin-small-right"></span>');
            return $form;
        }

        // Unlock submit button
        window.SF2.hideLoading = function($form) {
            $form.find('[type="submit"]').removeAttr('disabled')
                 .find('[uk-spinner]').remove();
        }

        // Custom error alert
        window.SF2.showError = function(msg) {
            const alertHtml = '<div class="uk-alert tm-alert tm-alert-danger">' + msg + '</div>';
            UIkit.modal.dialog(alertHtml, {stack: true});
        }

        window.SF2Config = window.SF2Config || {};
        for (let formId in window.SF2Config) {
            if (Object.hasOwnProperty.call(window.SF2Config, formId)) {
                const $form = $sf2forms.filter('#' + formId).eq(0);
                // Validation
                if (typeof $form.validate === 'function') {
                    const afterValidation = window.SF2Config[formId].onBeforeSend;
                    window.SF2Config[formId].onBeforeSend = function($form) {
                        $form.valid();
                        if ($form.validate().numberOfInvalids() != 0) {
                            return false;
                        }
                        return afterValidation($form);
                    }
                }

                // GTM send form event
                const onAfterReceive = window.SF2Config[formId].onAfterReceive;
                window.SF2Config[formId].onAfterReceive = function($form, response) {
                    if (response.status && response.status === 'success') {
                        window.dataLayer && window.dataLayer.push({
                            'event'       : 'hpTrackedAction',
                            'hpAction'    : 'sendForm',
                            'gtm.element' : $form.get(0)
                        });
                    }
                    return onAfterReceive($form, response);
                }
            }
        }

        // Fix checkbox and radio style and improve look of simpleform standard captcha
        $('[type=checkbox]', $sf2forms).addClass('uk-checkbox uk-margin-small-right');
        $('[type=radio]', $sf2forms).addClass('uk-radio uk-margin-small-right');
        $('[name=captcha]', $sf2forms).addClass('uk-input uk-form-large').attr('autocomplete', 'off')
            .closest('.sf2-element-captcha').addClass('uk-flex uk-flex-middle')
            .find('.sf2-element-captcha-image').addClass('uk-margin-small-right');
    }

    $sf2forms.length && window.sf2Improvements($sf2forms);

    // Set utm_campaign parameter from url
    // =============================================
    const $campaignForms = $('form.campaign-form-tag');
    if ($campaignForms.length > 0) {
        const url = new URL(window.location.href);
        const campaign = url.searchParams.get("utm_campaign");
        if (campaign) {
            $campaignForms.prepend('<input type="hidden" name="campaign" value="' + campaign + '">');
        }
    }

    // Set values to inputs in question form on entity page
    // =============================================
    const $questionButton = $('.jsQuestionButton').first(),
          data = $questionButton.data('itemInfo');

    if (typeof data === 'object') {
        const $modal = $('.jsProductQuestionModal'),
              $form = $modal.find('form'),
              $inputs = $form.find('[name^="hp-item_"]');
        for (let prop in data) {
            $inputs.filter('[name^="hp-item_' + prop + '"]').val(data[prop]);
        }
    }

    // Search forms
    // =============================================
    $('.tm-offcanvas-search')
        .find('[type=search]')
        .before('<button type="submit" class="uk-search-icon-flip" uk-search-icon></button>');

    $('.tm-navbar-search').on('show', function() {
        $(this).find('[type=search]').focus();
    });

    // Order forms and configuration send by email form
    // =============================================
    const $orderForms = $('#order-form, #credit-form, .jsSendEmailForm');
    $orderForms.validate({
        errorClass   : 'uk-form-danger',
        errorElement : 'div',
        validClass   : 'tm-form-success',
    });

    $orderForms.find('[type=email]').rules('add', 'client_email');
    $orderForms.find('[type=tel]').rules('add', {
        mobile    : true,
        minlength : 11,
    });

    $orderForms.find('[name*="[username]"]').suggestions({
        addon         : 'none',
        count         : 5,
        type          : 'NAME',
        scrollOnFocus : false,
        token         : dadataToken
    });

    $orderForms.find('[type=email]').suggestions({
        addon         : 'none',
        count         : 5,
        type          : 'EMAIL',
        scrollOnFocus : false,
        token         : dadataToken
    });

    // Registration form (not used)
    // =============================================
    // var $registrationForm = $('#member-registration');
    // $registrationForm.validate({
    //     errorClass   : 'uk-form-danger',
    //     errorElement : 'div',
    //     validClass   : 'tm-form-success',
    //     rules : {
    //         'jform[email2]' : {
    //             equalTo: '#jform_email1',
    //         },
    //         'jform[password2]' : {
    //             equalTo: '#jform_password1',
    //         }
    //     },
    //     messages : {
    //         'jform[email2]' : {
    //             equalTo: 'Адреса электронной почты не совпадают',
    //         },
    //         'jform[password2]' : {
    //             equalTo: 'Пароли не совпадают',
    //         }
    //     }
    // });

    // $registrationForm.find('[type=email]').each(function() {
    //     $(this).rules('add', 'client_email')
    // });
    // $registrationForm.find('[type=tel]').rules('add', {
    //     mobile    : true,
    //     minlength : 11,
    // });

    // $registrationForm.find('#jform_name').suggestions({
    //     addon         : 'none',
    //     count         : 5,
    //     type          : 'NAME',
    //     scrollOnFocus : false,
    //     token         : dadataToken
    // });

    // $registrationForm.find('[type=email]').suggestions({
    //     addon         : 'none',
    //     count         : 5,
    //     type          : 'EMAIL',
    //     scrollOnFocus : false,
    //     token         : dadataToken
    // });

    // Profile edit form
    // =============================================
    const $profileEditForms = $('#member-profile, .jsEditFirstStep');
    $profileEditForms.each(function() {
        const $form = $(this);
        $form.validate({
            errorClass   : 'uk-form-danger',
            errorElement : 'div',
            validClass   : 'tm-form-success',
            errorLabelContainer: '.edit-form-error',
        });
        $form.find('[type=email]').rules('add', 'client_email');
        if ($form.is('.jsEditFirstStep')) {
            $form.find('[type=tel]').rules('add', {
                mobile    : true,
                minlength : 11,
            });
        }
    });

    // Auth forms
    // =============================================
    const $authForm = $('.jsAuthFirstStep').find('form'),
          $authFormEmail = $authForm.filter('.jsAuthFirstStepEmail'),
          $authFormMobile = $authForm.filter('.jsAuthFirstStepMobile');

    $authFormEmail.each(function() {
        const $form = $(this);
        $form.validate({
            errorClass   : 'uk-form-danger',
            errorElement : 'div',
            validClass   : 'tm-form-success',
            errorLabelContainer: "#auth-form-email-error",
        });
        $form.find('[type=email]').rules('add', 'base_email');
    });

    $authFormMobile.each(function() {
        const $form = $(this);
        $form.validate({
            errorClass   : 'uk-form-danger',
            errorElement : 'div',
            validClass   : 'tm-form-success',
            errorLabelContainer: "#auth-form-mobile-error",
        });
        $form.find('[type=tel]').rules('add', {
            mobile    : true,
            minlength : 11,
        });
    });

    $authFormEmail.find('[type=email]').suggestions({
        addon         : 'none',
        count         : 5,
        type          : 'EMAIL',
        scrollOnFocus : false,
        token         : dadataToken
    });
});