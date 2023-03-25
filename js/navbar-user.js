/**
 * HYPERPC - The shop of powerful computers.
 *
 * This file is part of the HYPERPC package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @package    HYPERPC
 * @license    Proprietary
 * @copyright  Proprietary https://hyperpc.ru/license
 * @link       https://github.com/HYPER-PC/HYPERPC".
 * @author     Artem Vyshnevskiy
 */

jQuery(function ($) {

    JBZoo.widget('HyperPC.NavbarUser', {
        'cartItemsLimit' : 3,
        'profileUrl'     : '/account',
        'lang'           : 'en-GB',
        'langItemForms'  : 'item,items'
    }, {

        authInitiated : false,

        /**
         * Initialize widget.
         *
         * @param $this
         */
        init : function ($this) {
            $(window).on('storage', function (e) {
                switch (e.key) {
                    case 'hp_cart_items_count':
                        $this._onCartItemsCountChange($this);
                        break;
                    case 'hp_compared_items_count':
                        $this._onComparedItemsCountChange($this);
                        break;
                    case 'hp_unseen_notifications':
                        $this._onUnseenNotificationsChange($this);
                        break;
                }
            });

            // Remove update notification on page load
            localStorage.removeItem('hp_update_cart_now');

            $(document)
                .on('hpcartupdated', function(e, data) {
                    $this._onCartUpdated($this, data);
                })
                .on('hpcompareupdated', function(e, data) {
                    $this._onCompareUpdated($this, data);
                })
                .on('hpuserloggedin', function(e, data) {
                    $this._onUserLoggedIn($this, data);
                })
                .on('hpuserloggedout', function(e) {
                    $this._onUserLoggedOut($this);
                });

            UIkit.util.on('#login-form-modal', 'hidden', function(e) {
                if ($(e.target).is('#login-form-modal')) {
                    $this.authInitiated = false;
                }
            });

            $('.jsAuthSecondStep').find('[name^="pwd"]')
                .on('keydown', function (e) {
                    const $input = $(this);
                    const key = e.originalEvent.key;
                    if (key === 'Backspace' || key === 'Delete') {
                        if ($input.val().length === 0) {
                            const index = $input.data('code');
                            if (index >= 1) {
                                $input.closest('.jsAuthSecondStep').find('[data-code="' + (index - 1) + '"]').trigger('focus').val('');
                            }
                        }
                    }
                })
                .on('input', function (e) {
                    const $input = $(this),
                          val = $input.val();
                    if ($input.data('code') === 0 && e.originalEvent.data) {
                        const $form = $input.closest('.jsAuthSecondStep'),
                              pasteCodeResult = $this._fillPwdInputs(e.originalEvent.data, $form);
                        if (pasteCodeResult) {
                            $form.trigger('submit');
                            return false;
                        }
                    }

                    if (val.length === 1) {
                        if (/^\d{1}$/.test(val)) {
                            const index = $input.data('code'),
                                  $form = $input.closest('.jsAuthSecondStep'),
                                  inputsCount = $form.find('[name^="pwd"]').length;
                            if (index < inputsCount - 1) { // focus next input
                                $form.find('[data-code="' + (index + 1) + '"]').trigger('focus');
                            } else if (index === inputsCount - 1) { // submit if last
                                $form.trigger('submit');
                            }
                        } else {
                            $input.val('');
                        }
                    }
                })
                .on('beforeinput', function(e) {
                    const $input = $(this);
                    if ($input.data('code') === 0) {
                        const $form = $input.closest('.jsAuthSecondStep'),
                              pasteCodeResult = $this._fillPwdInputs(e.originalEvent.data, $form);
                        if (pasteCodeResult) {
                            e.preventDefault();
                            $form.trigger('submit');
                        }
                    }
                });

            $this._initNotificatioMarkState($this);
        },

        /**
         * Fill pwd inputs
         *
         * @param code
         *
         * @returns {boolean}
         */
        _fillPwdInputs : function (code, $form) {
            if (typeof code === 'string' && /^\d{4}$/.test(code.trim())) {
                const digits = code.trim().split(''),
                      $pwdInputs = $form.find('[name^="pwd"]');

                for (let i = 0; i < digits.length; i++) {
                    $pwdInputs.eq(i).val(digits[i]);
                }

                $pwdInputs.last().trigger('focus');
                return true;
            }

            return false;
        },

        /**
         * Check whether to show the notification mark on init.
         *
         * @param $this
         */
        _initNotificatioMarkState : function ($this) {
            const notificationChecked = localStorage.getItem('hp_notifications_last_check'),
                  currentDate = Date.now();
            if (notificationChecked === null || currentDate - notificationChecked > this.options.notificationRemindTime) {
                $this._showNotificationMark($this);
                return;
            }

            const actualCartItemsCount = $this._getCurrentCartItemsCount($this),
                  actualComparedItemsCount = $this._getCurrentComparedItemsCount($this);

            if (localStorage.getItem('hp_unseen_notifications') == 1) {
                if (actualCartItemsCount !== 0) {
                    $this._showNotificationMark($this);
                } else {
                    localStorage.setItem('hp_unseen_notifications', 0);
                }
            }

            localStorage.setItem('hp_cart_items_count', actualCartItemsCount);
            localStorage.setItem('hp_compared_items_count', actualComparedItemsCount);
        },

        /**
         * On cart updated.
         *
         * @param $this
         * @param data
         */
        _onCartUpdated: function($this, data) {
            if (typeof data !== 'undefined' && typeof data.count !== 'undefined' && typeof data.items !== 'undefined') {
                localStorage.setItem('hp_cart_items', JSON.stringify(data.items));
                $this._updateCartItemsList($this, data.items);

                localStorage.setItem('hp_cart_items_count', data.count);
                $this._setCartItemsCount($this, data.count);
            } else { 
                const xhr = $.ajax({
                    'url'       : '/index.php',
                    'dataType'  : 'json',
                    'type'      : 'POST',
                    'data'      : {
                        'option' : 'com_hyperpc',
                        'task'   : 'cart.get-items-count',
                        'format' : 'raw'
                    }
                });

                xhr.done(function(response) {
                    localStorage.setItem('hp_cart_items_count', response.count);
                    $this._setCartItemsCount($this, response.count);
                });
            }

            window.dataLayer && window.dataLayer.push({'event' : 'hpCartUpdated'});
        },

        /**
         * Update cart items list
         * 
         * @param $this
         * @param {array} [items]
         */
        _updateCartItemsList : function ($this, items) {
            items = items || JSON.parse(localStorage.getItem('hp_cart_items')) || [];

            if (items.length > 0) {
                $this.$('.jsNavbarUserCartItemsWrapper').removeAttr('hidden');
                let cartIemsHtml = '';

                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const html =  '<li class="jsNavbarUserCartItem">' +
                                    (item.url.length ? '<a href="' + item.url + '" class="uk-link-reset" target="_blank">' : '') +
                                        '<span class="uk-flex uk-flex-middle">' +
                                            '<span class="uk-flex-none hp-navbar-user-cart-list__item-image">' +
                                                '<img src="' + item.image + '" alt="" class="uk-responsive-height">' +
                                            '</span>' +
                                            '<span>' +
                                                item.name +
                                            '</span>' +
                                        '</span>' +
                                    (item.url.length ? '</a>' : '') +
                                '</li>';

                    cartIemsHtml += html;
                }

                $this.$('.jsNavbarUserCartItems').html(cartIemsHtml);

                if (items.length > $this.getOption('cartItemsLimit') && $this.$('[data-uk-dropdown]').hasClass('uk-open')) {
                    $this._checkCartItems($this);
                } else {
                    $this.$('.jsHiddenItemsCount').parent().attr('hidden', 'hidden');
                }
            } else {
                $this.$('.jsNavbarUserCartLink').removeAttr('hidden');
                $this.$('.jsNavbarUserCartItemsWrapper').attr('hidden', 'hidden')
                     .find('.jsNavbarUserCartItems').html('');
            }
        },

        /**
         * On cart items count change.
         *
         * @param $this
         */
        _onCartItemsCountChange : function ($this) {
            $this._setCartItemsCount($this);
            $this._updateCartItemsList($this);
        },

        /**
         * Set cart items count.
         *
         * @param $this
         * @param {number} [itemsCount]
         */
        _setCartItemsCount : function ($this, itemsCount) {
            const count = itemsCount || localStorage.getItem('hp_cart_items_count') || 0,
                  $countEl = $this.$('.jsCartItemsCount'),
                  $badge = $this.$('.jsNavbarUserActionBadge'),
                  currentCount = $this._getCurrentCartItemsCount($this);

            $countEl.html('(' + count + ')');
            $badge.html(count);
            if (count == 0) {
                $countEl.addClass('uk-hidden');
                $badge.attr('hidden', 'hidden');
            } else {
                $countEl.removeClass('uk-hidden');
                $badge.removeAttr('hidden');
                $this.$('.hp-navbar-user__toggle').removeClass('hp-navbar-user__toggle--has-notification');
                if (count > currentCount) {
                    localStorage.setItem('hp_unseen_notifications', 1);
                    $this._showNotificationMark($this);
                }
            }
        },

        /**
         * Get current cart items count.
         *
         * @param $this
         * 
         * @returns {number}
         */
        _getCurrentCartItemsCount : function ($this) {
            return parseInt($this.$('.jsCartItemsCount').text().trim().replace(/[()]/g, '')) || 0;
        },

        /**
         * On compare list updated.
         *
         * @param $this
         * @param data
         */
        _onCompareUpdated : function ($this, data) {
            if (typeof data !== 'undefined' && typeof data.totalCount !== 'undefined') {
                localStorage.setItem('hp_compared_items_count', data.totalCount);
                $this._setComparedItemsCount($this, data.totalCount);
            }
        },

        /**
         * On compared items count change.
         *
         * @param $this
         */
        _onComparedItemsCountChange : function ($this) {
            $this._setComparedItemsCount($this);
        },

        /**
         * Set compared items count.
         *
         * @param $this
         * @param {number} [itemsCount]
         */
        _setComparedItemsCount : function ($this, itemsCount) {
            const count = itemsCount || localStorage.getItem('hp_compared_items_count'),
                  $countEl = $this.$('.jsNavbarUserCompareBadge'),
                  $hiddenEl = $this.$('.jsNavbarUserCompare');

            $countEl.html(count);
            if (count == 0) {
                $hiddenEl.attr('hidden', 'hidden');
            } else {
                $hiddenEl.removeAttr('hidden');
            }
        },

        /**
         * Get current compared items count.
         *
         * @param $this
         * 
         * @returns {number}
         */
        _getCurrentComparedItemsCount : function ($this) {
            return parseInt($this.$('.jsNavbarUserCompareBadge').text().trim()) || 0;
        },

        /**
         * Hide notification mark.
         *
         * @param $this
         */
        _hideNotificationMark : function ($this) {
            $this.$('.hp-navbar-user__toggle').removeClass('hp-navbar-user__toggle--has-notification');
        },

        /**
         * Show notification mark.
         *
         * @param $this
         */
        _showNotificationMark : function ($this) {
            if ($this.$('.jsNavbarUserActionBadge').length > 0 && $this.$('.jsNavbarUserActionBadge').is('[hidden]')) {
                $this.$('.hp-navbar-user__toggle').addClass('hp-navbar-user__toggle--has-notification');
            }
        },

        /**
         * On unseen notification state change.
         *
         * @param $this
         */
        _onUnseenNotificationsChange : function ($this) {
            if (localStorage.getItem('hp_unseen_notifications') == 1) {
                $this._showNotificationMark($this);
            } else if (localStorage.getItem('hp_unseen_notifications') == 0) {
                $this._hideNotificationMark($this);
            }
        },

        /**
         * Check and hide excess cart items.
         *
         * @param $this
         */
        _checkCartItems : function ($this) {
            const $cartItems = $this.$('.jsNavbarUserCartItem');

            if ($cartItems.length === 0) {
                return false;
            }

            const limit = Math.min($this.getOption('cartItemsLimit'), $cartItems.length),
                  hidenItems = $cartItems.length - limit;
            if (hidenItems > 0) {
                $cartItems.removeAttr('hidden');
                $cartItems.slice(limit).attr('hidden', 'hidden');
                $this.$('.jsHiddenItemsCount')
                     .html($this._pluralize($this, hidenItems, $this.getOption('langItemForms').split(',')))
                     .parent().removeAttr('hidden');
            } else {
                $this.$('.jsHiddenItemsCount').parent().attr('hidden', 'hidden');
            }

            $this.$('.jsNavbarUserCartItemsWrapper').removeAttr('hidden');
            $this.$('.jsNavbarUserCartLink').attr('hidden', 'hidden');

            const $drop = $this.$('.hp-navbar-user__drop');
            let heightDiff = $(window).height() - ($drop.outerHeight() + $drop.position().top);
            if (heightDiff < 0) {
                if (Math.abs(heightDiff) >= $this.$('.jsNavbarUserCartItems').outerHeight()) {
                    $this.$('.jsNavbarUserCartItemsWrapper').attr('hidden', 'hidden');
                    $this.$('.jsNavbarUserCartLink').removeAttr('hidden');
                } else {
                    const $visibleItems = $cartItems.not('[hidden]');
                    $($visibleItems.get().reverse()).each(function() {
                        const $item = $(this);
                        let itemHeight = $item.outerHeight() + parseInt($item.css('marginTop'));
                        $item.attr('hidden', 'hidden');
                        heightDiff += itemHeight;
                        if (heightDiff >= 0) {
                            return false;
                        }
                    });

                    const $actualVisible = $cartItems.not('[hidden]');

                    $this.$('.jsHiddenItemsCount')
                         .html($this._pluralize($this, $cartItems.length - $actualVisible.length, $this.getOption('langItemForms').split(',')))
                         .parent().removeAttr('hidden');

                    if (heightDiff < 0 || $actualVisible.length === 0) {
                        $this.$('.jsNavbarUserCartItemsWrapper').attr('hidden', 'hidden');
                        $this.$('.jsNavbarUserCartLink').removeAttr('hidden');
                    }
                }
            }
        },

        /**
         * On user logged in
         *
         * @param $this
         * @param data
         */
        _onUserLoggedIn : function ($this, data) {
            $this.$('.jsNavbarUserDropItemAuthed').removeAttr('hidden');
            $this.$('.jsNavbarUserDropItemGuest').attr('hidden', 'hidden');
            $this.$('.jsNavbarUserDropUsername').text(data.username);

            $this._setLogoutToken($this, data.token);

            window.user = {
                id: data.id,
                name: data.name,
                email: data.email,
                emailHash: data.emailHash
            };
        },

        /**
         * Set token to the logout link
         *
         * @param $this
         * @param {string} token
         */
        _setLogoutToken : function ($this, token) {
            const $logoutLink = $this.$('.jsUserLogoutLink'),
                  logoutHref = $logoutLink.attr('href'),
                  newLogoutHref = logoutHref.replace(/^(.+&)([a-z0-9]{32})(=1.*)$/, '$1' + token + '$3');
            $this.$('.jsUserLogoutLink').attr('href', newLogoutHref);
        },

        /**
         * On user logged out
         *
         * @param $this
         */
        _onUserLoggedOut : function ($this) {
            $this.$('.jsNavbarUserDropItemAuthed').attr('hidden', 'hidden');
            $this.$('.jsNavbarUserDropItemGuest').removeAttr('hidden');
            $this.$('.jsNavbarUserDropUsername').text('');

            window.user = {
                id: 0,
                name: null,
                email: null,
                emailHash: null
            };
        },

        /**
         * Handle form ajax fail.
         *
         * @param $form - jQuery object
         */
        _handleFormAjaxFail : function($form, message) {
            $form.prepend(
                '<div class="uk-alert uk-alert-danger" uk-alert>' +
                    '<a class="uk-alert-close" uk-close></a>' +
                    (message || 'Ajax loading error...') +
                '</div>');
        },

        /**
         * Lock form submit button.
         *
         * @param $form - jQuery object
         */
        _lockFormSubmitButton : function ($form) {
            $form.find('[type="submit"]')
                 .prepend('<span uk-spinner="ratio: 0.7"></span>')
                 .attr('disabled', 'disabled');
        },

        /**
         * Unlock form submit button.
         *
         * @param $form - jQuery object
         */
        _unlockFormSubmitButton : function ($form) {
            $form.find('[type="submit"]')
                 .removeAttr('disabled')
                 .find('[uk-spinner]').remove();
        },

        /**
         * Get Uid from cookie
         *
         * @returns {string}
         */
         _getUid : function () {
            /** @see https://developer.mozilla.org/ru/docs/Web/API/Document/cookie */
            return document.cookie.replace(/(?:(?:^|.*;\s*)hp_uid\s*\=\s*([^;]*).*$)|^.*$/, "$1"); 
        },

        /**
         * On show action drop.
         *
         * @param e
         * @param $this
         */
        'show .hp-navbar-user__drop' : function (e, $this) {
            localStorage.setItem('hp_unseen_notifications', 0);
            localStorage.setItem('hp_notifications_last_check', Date.now());
            $this._hideNotificationMark($this);
            $this._checkCartItems($this);
        },

        /**
         * On submit registration form.
         *
         * @param e
         * @param $this
         */
        'submit {document} .jsRegistrationAjaxForm' : function (e, $this) {
            e.preventDefault();

            const $form = $(this);
            $form.find('[uk-alert]').remove();

            $this._lockFormSubmitButton($form);

            $.ajax({
                'url'       : '/index.php?' + $form.serialize(),
                'dataType'  : 'json',
                'type'      : 'POST',
                'timeout'   : 15000,
                'data'      : {
                    'option' : 'com_hyperpc',
                    'task'   : 'user.ajax-registration',
                    'tmpl'   : 'component'
                }
            })
            .done(function(response) {
                if (response.result) {
                    $('.jsAuthAjaxForm').prepend(
                        '<div class="uk-alert uk-alert-success" uk-alert>' +
                            '<a class="uk-alert-close" uk-close></a>' +
                            response.message +
                        '</div>');

                    UIkit.switcher($form.closest('[uk-modal]').find('[uk-switcher]')).show(0);
                } else {
                    $form.prepend(
                        '<div class="uk-alert uk-alert-danger" uk-alert>' +
                            '<a class="uk-alert-close" uk-close></a>' +
                            response.message +
                        '</div>');
                }
            })
            .fail(function() {
                $this._handleFormAjaxFail($form)
            })
            .always(function() {
                $this._unlockFormSubmitButton($form);
            });
        },

        /**
         * On submit login form.
         *
         * @param e
         * @param $this
         */
        'submit {document} .jsAuthAjaxForm' : function (e, $this) {
            e.preventDefault();

            const $form    = $(this),
                  username = $form.find('input[name=username]'),
                  password = $form.find('input[name=password]'),
                  remember = $form.find('input[name=remember]');

            const formSerialize = username.val() + ':' + encodeURI(password.val()) + ':' + remember.prop('checked'),
                  formHash      = window.btoa(formSerialize);

            const uid = $this._getUid();

            $form.find('[uk-alert]').remove();

            $this._lockFormSubmitButton($form);
            $.ajax({
                'url'       : '/index.php?' + $form.serialize(),
                'dataType'  : 'json',
                'type'      : 'POST',
                'timeout'   : 15000,
                'data'      : {
                    'option' : 'com_hyperpc',
                    'tmpl'   : 'component',
                    'task'   : 'user.ajax-login',
                    'data'   : formHash
                }
            })
            .done(function(response) {
                const alertStyle = response.result ? 'uk-alert-success' : 'uk-alert-danger';

                $form.prepend(
                    '<div class="uk-alert ' + alertStyle + '" uk-alert>' +
                        '<a class="uk-alert-close" uk-close></a>' +
                        response.message +
                    '</div>');

                if (response.result) {
                    $(document).trigger('hpuserloggedin', response.user);
                }

                const newUid = $this._getUid();
                if (newUid !== uid) {
                    window.dataLayer && window.dataLayer.push({'event' : 'hpUidChanged'});
                }

                setTimeout(function() {
                    UIkit.modal('#login-form-modal').hide();
                    $form.find('[uk-alert]').remove();
                }, 1000);
            })
            .fail(function() {
                $this._handleFormAjaxFail($form);
            })
            .always(function() {
                $this._unlockFormSubmitButton($form);
            });
        },

        /**
         * Auth step first action.
         *
         * @param e
         * @param $this
         */
        'submit {document} .jsAuthFirstStep form': function (e, $this) {
            e.preventDefault();

            const $form = $(this);

            if ($form.validate) {
                $form.valid();
                if ($form.validate().numberOfInvalids() != 0) {
                    return false;
                }
            }

            const data = {
                'option'    : 'com_hyperpc',
                'task'      : 'auth.step-one',
                'tmpl'      : 'component',
                'format'    : null,
            };

            $form.find('input').each(function () {
                const $input = $(this);
                if ($input.is('[type="checkbox"]')) {
                    data[$input.attr('name')] = $input.prop('checked');
                } else {
                    data[$input.attr('name')] = $input.val();
                }
            });

            const $recaptcha = $form.find('.g-recaptcha');
            if ($recaptcha.length > 0 && window.grecaptcha) {
                data['jform[g-recaptcha-response]'] = grecaptcha.getResponse($recaptcha.data('recaptcha-widget-id'));
            }

            $form.find('[uk-alert]').remove();
            $this._lockFormSubmitButton($form);

            const authMethod = $form.find('[id^="jform_type_"]').val();

            $.ajax({
                'method'    : 'POST',
                'data'      : data,
                'dataType'  : 'json',
                'timeout'   : 15000,
            })
            .done(function (data) {
                if (data.result) {
                    const user = window.atob(data.user).split('::');

                    $this.userId = user[0];
                    $this.codeId = user[1];

                    $this.newUserRegistered = data.new;

                    $form.closest('.jsAuthFirstStep').attr('hidden', 'hidden');

                    const $wrapper    = $form.closest('.jsAuthWrapper'),
                          $secondStep = $wrapper.find('.jsAuthSecondStep');

                    $wrapper.find('.jsAuthGoBack').removeAttr('hidden');
                    $secondStep
                        .removeAttr('hidden').append('<input type="hidden" name="' + data.token + '" value="1">')
                        .find('[name*="pwd[0]"]').trigger('focusin');

                    $wrapper.find('.jsAuthBeforeFormText').html(data.message);

                    if (authMethod === 'mobile') {
                        const $authGoBack = $wrapper.find('.jsAuthGoBack'),
                              waitTime    = $form.data('wait-time'),
                              waitMsg     = $form.data('wait-msg'),
                              waitSlant   = $form.data('wait-slant').split(':');

                        $secondStep.find('.jsAuthEmailProblemText').attr('hidden', 'hidden');

                        /** @todo rewrite to 0:00 format */
                        const slantSeconds = $this._pluralize($this, waitTime, waitSlant);

                        $secondStep.append(
                            '<div class="jsAuthCountDown uk-margin uk-margin-small-top uk-text-center uk-text-small uk-text-muted">' + waitMsg  + '&nbsp;' +
                                '<span class="jsAuthLeftTime" data-value="' + waitTime + '">' + slantSeconds + '</span>' +
                            '</div>'
                        );

                        $authGoBack.addClass('uk-disabled');

                        const $timeLeft = $secondStep.find('.jsAuthLeftTime');
                        let timeLeft = parseInt(waitTime);

                        const timer = setInterval(function(){
                            if (--timeLeft >= 0) {
                                const slantSeconds = $this._pluralize($this, timeLeft, waitSlant);
                                $timeLeft.html(slantSeconds);
                            } else {
                                clearInterval(timer);
                            }
                        }, 1000);

                        setTimeout(function () {
                            $authGoBack.removeClass('uk-disabled');
                            $secondStep.find('.jsAuthCountDown').remove();
                            $this._resetCaptcha($form);
                        }, waitTime * 1000);
                    } else if (authMethod === 'email') {
                        $secondStep.find('.jsAuthEmailProblemText').removeAttr('hidden');
                    }
                } else {
                    if (data.captcha) {
                        const $captchaWrapper = $form.find('.jsAuthCaptcha');

                        if (!$captchaWrapper.children().is('.g-recaptcha')) {
                            $captchaWrapper.html($(data.captcha));
                        }

                        if (window.grecaptcha) {
                            const $captcha = $captchaWrapper.children();
                            if (typeof $captcha.data('recaptchaWidgetId') === 'undefined') {
                                const captcha = $captcha.get(0);
                                const widgetId = grecaptcha.render(captcha, captcha.dataset);
                                $captcha.data('recaptchaWidgetId', widgetId);
                            }
                        } else {
                            const firstScriptTag = document.getElementsByTagName('script')[0];

                            const plgRecapthaScript = document.createElement('script');
                            plgRecapthaScript.src = '/media/plg_captcha_recaptcha/js/recaptcha.min.js';

                            firstScriptTag.parentNode.insertBefore(plgRecapthaScript, firstScriptTag);

                            plgRecapthaScript.addEventListener("load", function(e) {
                                const googleRecaptchaScript = document.createElement('script');
                                googleRecaptchaScript.src = 'https://www.google.com/recaptcha/api.js?onload=JoomlaInitReCaptcha2&render=explicit&hl=ru-RU';
                                firstScriptTag.parentNode.insertBefore(googleRecaptchaScript, firstScriptTag);
                            });
                        }
                    }

                    $this._handleFormAjaxFail($form, data.message);
                    $this._unlockFormSubmitButton($form);
                }
            })
            .fail(function (response) {
                $this._handleFormAjaxFail($form);
                $this._unlockFormSubmitButton($form);
            })
            .always(function () {
                $this._resetCaptcha($form);
            });
        },

        /**
         * Reset captcha
         *
         * @param {jQuery Object} $form 
         */
        _resetCaptcha : function ($form) {
            if (window.grecaptcha) {
                const $captcha = $form.find('.jsAuthCaptcha').find('.g-recaptcha');
                if ($captcha.length) {
                    grecaptcha.reset($captcha.data('recaptchaWidgetId'));
                }
            }
        },

        /**
         * Get text count of hidden items.
         *
         * @param $this
         * @param {number} number
         * @param {Array} forms
         * @returns {string}
         */
        _pluralize : function ($this, number, forms) {
            let index = 0;
            switch ($this.getOption('lang')) {
                case 'en-GB':
                    index = number === 1 ? 0 : 1;
                    break;
                case 'ru-RU':
                    const cases = [2, 0, 1, 1, 1, 2];
                    index = (number%100 > 4 && number%100 < 20) ? 2 : cases[(number%10 < 5) ? number%10 : 5];
                    break;
            }

            if (!forms[index]) {
                index = forms.length - 1;
            }

            return number + ' ' + forms[index];
        },

        /**
         * Auth step second action.
         *
         * @param e
         * @param $this
         */
        'submit {document} .jsAuthSecondStep': function (e, $this) {
            e.preventDefault();

            const $form = $(this);
            const data = {
                    'option'    : 'com_hyperpc',
                    'task'      : 'auth.step-two',
                    'tmpl'      : 'component',
                    'format'    : null,
                    'user_id'   : $this.userId,
                    'code_id'   : $this.codeId,
                };

            $form.find('input').each(function () {
                const $input = $(this);
                if ($input.is('[type="checkbox"]')) {
                    data[$input.attr('name')] = $input.prop('checked');
                } else {
                    data[$input.attr('name')] = $input.val();
                }
            });

            $form.find('[uk-alert]').remove();
            $this._lockFormSubmitButton($form);

            const uid = $this._getUid();

            $.ajax({
                'method'    : 'POST',
                'data'      : data,
                'dataType'  : 'json',
                'timeout'   : 15000,
            })
            .done(function (response) {
                if (response.result) {
                    $form.prepend(
                        '<div class="uk-alert uk-alert-success" uk-alert>' +
                            '<a class="uk-alert-close" uk-close></a>' +
                            response.message +
                        '</div>');

                    $(document).trigger('hpuserloggedin', response.user);

                    // GTM track registration
                    if ($this.newUserRegistered) {
                        window.dataLayer && window.dataLayer.push({
                            'event'    : 'hpTrackedAction',
                            'hpAction' : 'userRegistered'
                        });
                    }

                    const newUid = $this._getUid();
                    if (newUid !== uid) {
                        window.dataLayer && window.dataLayer.push({'event' : 'hpUidChanged'});
                    }

                    setTimeout(function() {
                        if ($this.authInitiated || $form.closest('.hp-auth-card').length) {
                            location.href = $this.getOption('profileUrl');
                        } else {
                            UIkit.modal('#login-form-modal').hide();
                            $form.find('[uk-alert]').remove();
                        }
                    }, 1000);
                } else {
                    $this._handleFormAjaxFail($form, response.message);
                }
            })
            .fail(function (response) {
                $this._handleFormAjaxFail($form);
            })
            .always(function () {
                $this._unlockFormSubmitButton($form);
            });
        },

        /**
         * Process auth go back.
         *
         * @param e
         * @param $this
         */
        'click {document} .jsAuthGoBack': function (e, $this) {
            e.preventDefault();

            const $backButton = $(this),
                  $wrapper = $backButton.closest('.jsAuthWrapper'),
                  $firstStep = $wrapper.find('.jsAuthFirstStep');

            $backButton.attr('hidden', 'hidden');
            $firstStep.removeAttr('hidden');
            $wrapper.find('.jsAuthSecondStep').attr('hidden', 'hidden');

            $wrapper.find('[uk-alert]').remove();
            $this._unlockFormSubmitButton($firstStep.find('form'));
        },

        /**
         * On open login modal by click.
         *
         * @param e
         * @param $this
         */
        'click .jsLoginModalToggle': function (e, $this) {
            $this.authInitiated = true;
        }

    });
});