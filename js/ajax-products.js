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
 *
 * @author     Sergey Kalistratov   <kalistratov.s.m@gmail.ru>
 * @author     Roman Evsyukov       <roman_e@hyperpc.ru>
 * @author     Artem Vyshnevskiy
 */

jQuery(function ($) {

    JBZoo.widget('HyperPC.AjaxProducts', {
        'wrapperClass' : 'jsProductWrapper',
        'limit' : 4,
        'defaultContext' : 'product'
    }, {

        /**
         * Widget simple template.
         *
         * <div class="hp-ajax-products">
         *     <div class="uk-button uk-button-default jsLoadProducts" data-parts="%i9%" data-tags="Windows, battlefield">Send</div>
         *     <div class="jsProductWrapper"></div>
         * </div>
         */

        defaultFindType : 'value',
        simpleFormScriptsLoaded : 0,

        /**
         * Load scripts and init teaser modal forms
         *
         * @param $this
         * @param $responseHtml - jQuery object
         * @param $forms - jQuery object
         */
        _initModalForms : function ($this, $responseHtml, $forms) {
            // set form config
            const $head = $('head');

            window.SF2Config = window.SF2Config || {};
            $forms.each(function () {
                const formKey = $(this).attr('id');
                if (!(formKey in window.SF2Config)) {
                    $head.append($responseHtml.filter("script:contains('SF2Config[\"" + formKey + "\"]')"));
                }
            });

            // load scripts
            let $simpleFormScripts = $('script[src*="mod_simpleform2"]');
            if (!$simpleFormScripts.length) {
                $simpleFormScripts = $responseHtml.filter('script[src*="mod_simpleform2"]');

                $.ajaxSetup({cache: true});

                $simpleFormScripts.each(function () {
                    $.getScript($(this).attr('src'))
                        .done(function () {
                            $this.simpleFormScriptsLoaded++;
                            if ($this.simpleFormScriptsLoaded === $simpleFormScripts.length) {
                                window.sf2Improvements && window.sf2Improvements($forms);

                                const paths = Joomla.getOptions('deferedPaths');
                                if (paths.geoPhoneInputJs) {
                                    if (!$('script').filter('[src="' + paths.geoPhoneInputJs + '"]').length) {
                                        window.deferJs && window.deferJs(paths.geoPhoneInputJs, function () {
                                            $forms.find('input[type="tel"]').HyperPCGeoPhoneInput({
                                                'dadataApiKey' : window.dadataToken || ''
                                            });
                                        });
                                    } else {
                                        $forms.find('input[type="tel"]').HyperPCGeoPhoneInput({
                                            'dadataApiKey' : window.dadataToken || ''
                                        });
                                    }
                                }

                                if (paths.labelInfieldJs) {
                                    if (!$('script').filter('[src="' + paths.labelInfieldJs + '"]').length) {
                                        window.deferJs && window.deferJs(paths.labelInfieldJs, function () {
                                            $forms.find('.tm-label-infield').HyperPCLabelInfield({});
                                        });
                                    } else {
                                        $forms.find('.tm-label-infield').HyperPCLabelInfield({});
                                    }
                                }
                            }
                        });
                });
            } else {
                window.JBZoo.isWidgetExists('HyperPCLabelInfield') && $forms.find('.tm-label-infield').HyperPCLabelInfield({});
            }

            // init captcha
            const hasCaptcha = Boolean($forms.find('.g-recaptcha').length);
            if (hasCaptcha) {
                if (!window.grecaptcha) {
                    const $captchaScripts = $responseHtml.filter('script[src*="recaptcha"]');
                    if ($captchaScripts.length) {
                        $captchaScripts.each(function () {
                            $.getScript($(this).attr('src'));
                        });
                    }
                } else {
                    $forms.each(function() {
                        const $form = $(this),
                              $captcha = $form.find('.g-recaptcha');

                        if (typeof $captcha.data('recaptchaWidgetId') === 'undefined') {
                            const captcha = $captcha.get(0),
                                  widgetId = grecaptcha.render(captcha, captcha.dataset);
                            $captcha.data('recaptchaWidgetId', widgetId);
                        }
                    });
                }
            }
        },

        /**
         * Lock load more button.
         *
         * @param $button - jQuery object
         */
        _lockLoadMoreButton : function ($button) {
            $button
                .addClass('uk-position-relative')
                .attr('disabled', 'disabled')
                .append('<span class="uk-position-cover uk-flex uk-flex-middle uk-flex-center" uk-spinner="ratio: 0.7"></span>');
        },

        /**
         * Unlock load more button.
         *
         * @param $button - jQuery object
         */
        _unlockLoadMoreButton : function ($button) {
            $button.removeAttr('disabled').find('[uk-spinner]').remove();
        },

        /**
         * Get an array of comma separated values
         *
         * @param {String} str
         */
        _stringToArray : function (str) {
            if (typeof str === 'number') {
                return str;
            }

            if (typeof str === 'string') {
                str = str.split(',');
                $.each(str, function (i) {
                    str[i] = str[i].trim();
                });
                return str;
            }

            return null;
        },

        /**
         * Click something button.
         *
         * @param e
         * @param $this
         */
        'click .jsLoadProducts, .jsLoadMoreProducts' : function (e, $this) {
            const $button    = $(this),
                  priceRange = $button.data('price-range') ?? null;

            let ids      = $this._stringToArray($button.data('ids')),
                tags     = $this._stringToArray($button.data('tags')),
                game     = $button.data('game') ?? null,
                type     = $button.data('type'),
                parts    = $this._stringToArray($button.data('parts')),
                order    = $button.data('order') ? $button.data('order') : '',
                layout   = $button.data('layout') ? $button.data('layout') : 'default',
                showFps  = $button.data('showfps'),
                findType = $button.data('find-type'),
                platform = $button.data('platform'),
                context  = $button.data('context') || $this.getOption('defaultContext');

            const limit = $button.data('limit') || $this.getOption('limit'),
                  start = $button.data('start');

            if ($button.is('.jsLoadMoreProducts')) {
                $this._lockLoadMoreButton($button);
            }

            if (!findType) {
                findType = $this.defaultFindType;
            }

            const sendArgs = {
                'option'        : 'com_hyperpc',
                'view'          : 'products',
                'tmpl'          : 'component',
                'ids'           : ids,
                'tags'          : tags,
                'game'          : game,
                'type'          : type,
                'order'         : order,
                'config'        : parts,
                'layout'        : layout,
                'showFps'       : showFps,
                'platform'      : platform,
                'find_type'     : findType,
                'price_range'   : priceRange,
                'context'       : context
            };

            if (limit) {
                sendArgs['limit'] = limit;
            }

            if (start) {
                sendArgs['start'] = start;
            }

            $.ajax({
                'type'     : 'post',
                'dataType' : 'html',
                'url'      : document.location.pathname,
                'data'     : sendArgs,
            })
            .done(function (response) {
                const $responseHtml    = $(response),
                      $newProductBody  = $responseHtml.find('#hp-products-view').children(),
                      $systemAlertMsg  = $responseHtml.find('#system-message'),
                      $productsWrapper = $this.$('.' + $this.getOption('wrapperClass'));

                if ($systemAlertMsg.length) {
                    $productsWrapper.html(
                        '<div class="uk-container uk-container-small">' +
                            $systemAlertMsg.html() +
                        '</div>'
                    );
                    return;
                }

                if ($newProductBody.length) {
                    if ($button.is('.jsLoadProducts')) {
                        $('.jsProductTeaserFormModal').each(function () {
                            const $modal = $(this);
                            if ($modal.hasClass('jsBuyNowModal')) {
                                $newProductBody.find('.jsBuyNowModal').remove();
                            } else if ($modal.hasClass('jsShowOnlineModal')) {
                                $newProductBody.find('.jsShowOnlineModal').remove();
                            }
                        });
                        const $newTeaserModals = $newProductBody.find('.jsProductTeaserFormModal'),
                              hasTeaserModals = Boolean($newTeaserModals.length);
                        if (hasTeaserModals) {
                            $this._initModalForms($this, $responseHtml, $newTeaserModals.find('.simpleForm2'));
                        }

                        $productsWrapper.html($newProductBody);
                        if (hasTeaserModals) {
                            window.SF2 && SF2.init();
                            window.sf2Improvements && window.sf2Improvements($('.simpleForm2'));
                            window.JBZoo.isWidgetExists('HyperPCGeoPhoneInput') && $newTeaserModals.find('input[type="tel"]').HyperPCGeoPhoneInput({});
                        }
                        $productsWrapper.find('.jsProductTeaserFormButton').HyperPCProductTeaserForm({});
                    } else if ($button.is('.jsLoadMoreProducts')) {
                        $newProductBody.find('.jsProductTeaserFormModal').remove();

                        const $newLoadMoreProductsWrapper = $newProductBody.find('.jsLoadMoreProductsWrapper');
                        let $uninitedButtons = [];

                        if ($button.closest('.jsLoadMoreProductsWrapper').prev().is('.hp-product-teaser')) { // loaded by content plugin
                            let $productsGrid = $button.closest('.jsProductsGrid');
                            if ($productsGrid.length === 0) {
                                $productsGrid = $button.closest('.jsLoadMoreProductsWrapper').parent();
                            }
                            $productsGrid.find('.jsLoadMoreProductsWrapper').remove();
                            $productsGrid.append($newProductBody.find('.jsProductsGrid').html());

                            $uninitedButtons = $productsGrid.find('.jsProductTeaserFormButton:not([data-widgetid])');

                            if ($newLoadMoreProductsWrapper.length) {
                                $productsGrid.append($newLoadMoreProductsWrapper);
                            }
                        } else {
                            $productsWrapper
                                .find('.jsProductsGrid')
                                .append($newProductBody.find('.jsProductsGrid').html());

                            $uninitedButtons = $productsWrapper.find('.jsProductTeaserFormButton:not([data-widgetid])');

                            const $loadMoreProductsWrapper = $productsWrapper.find('.jsLoadMoreProductsWrapper');
                            if ($newLoadMoreProductsWrapper.length) {
                                $loadMoreProductsWrapper.html($newLoadMoreProductsWrapper.html());
                            } else {
                                $loadMoreProductsWrapper.remove();
                            }
                        }

                        if ($uninitedButtons.length) {
                            $uninitedButtons.HyperPCProductTeaserForm({});
                        }
                    }

                    $this.$('.jsRatingStars').raty({
                        starType : 'i',
                        readOnly : true
                    });

                    if (showFps) {
                        $(document).trigger('hpproductsloaded')
                    }
                }
            })
            .fail(function (xjr, error) {
                UIkit.notification('Connection error', 'danger');
            })
            .always(function () {
                if ($button.is('.jsLoadMoreProducts')) {
                    $this._unlockLoadMoreButton($button);
                }
            });
        }
    });
});
