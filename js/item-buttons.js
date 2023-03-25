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
 * @author     Sergey Kalistratov <kalistratov.s.m@gmail.com>
 * @author     Artem Vyshnevskiy
 */

jQuery(function ($) {

    JBZoo.widget('HyperPC.SiteItemButtons', {
        'msgAlertError'          : '',
        'msgTryAgain'            : '',
        'msgWantRemove'          : '',
        'langAddedToCart'        : 'Added to cart',
        'langContinueShopping'   : 'Continue shopping',
        'langGoToCart'           : 'Go to cart'
    }, {

        /**
         * Initialize widget.
         *
         * @param $this
         */
        init : function ($this) {
            if (!$this.$('.jsCanBeChanged').length) {
                $this.$('.hp-add-to-cart')
                    .filter('.jsCreateConfigAddToCart')
                    .removeClass('jsCreateConfigAddToCart')
                    .addClass('jsAddToCart');
            }

            $(window).on('storage', function (e) {
                switch (e.key) {
                    case 'hp_cart_items':
                        $this._updateCartButtons($this);
                        break;
                }
            });

            $(document).on('updatecartbuttons', function (e) {
                $this._updateCartButtons($this);
            });
        },

        /**
         * Update buttons state from the storage
         * 
         * @param $this
         */
        _updateCartButtons : function ($this) {
            cartItems = JSON.parse(localStorage.getItem('hp_cart_items')) || [];

            $buttons = $this.$('.jsCartButtons');
            $buttons.removeClass('hp-element-in-cart');

            cartItems.forEach(function (item) {
                if (item.key) {
                    $buttons.filter('[data-itemkey="' + item.key + '"]').addClass('hp-element-in-cart');
                }
            });
        },

        /**
         * Handle success add to cart.
         *
         * @param $this
         * @param {string} itemKey
         * @param {object} data
         */
        _handleSuccessAddToCart : function ($this, itemKey, data) {
            const $buttonsWrapper = $this.$('.jsCartButtons[data-itemkey="' + itemKey + '"]');
            $buttonsWrapper.addClass('hp-element-in-cart');

            if ($('.jsCartSuccessModal').length > 0) {
                UIkit.modal('.jsCartSuccessModal').show();
            } else {
                const btnCommonClass = 'uk-button uk-button-small uk-button-normal@s';
                const dialogHtml =
                    '<div class="jsCartSuccessModal" uk-modal>' +
                        '<div class="uk-modal-dialog tm-background-gray-5">' +
                            '<button class="uk-modal-close-default" type="button" uk-close></button>' +
                            '<div class="uk-modal-body">' +
                                '<div>' +
                                    '<span uk-icon="icon: check; ratio: 1.2" class="uk-icon uk-margin-small-right uk-text-success"></span>' +
                                    $this.getOption('langAddedToCart') +
                                '</div>' +
                            '</div>' +
                            '<div class="uk-modal-footer uk-text-right tm-background-gray-5" uk-margin>' +
                                '<button class="' + btnCommonClass + ' uk-button-default uk-modal-close">' + $this.getOption('langContinueShopping') + '</button> ' +
                                '<a href="/cart" class="' + btnCommonClass + ' uk-button-primary">' + $this.getOption('langGoToCart') + '</a>' +
                            '</div>' +
                        '</div>' +
                    '</div>';

                UIkit.modal(dialogHtml).show();
            }

            if (typeof data.savedConfiguration !== 'undefined') {
                const newItemkey = $this._setSavedConfigurationToItemkey(itemKey, data.savedConfiguration);

                $buttonsWrapper
                    .data('itemkey', newItemkey)
                    .attr('data-itemkey', newItemkey);
            }

            $(document).trigger('hpcartupdated', {
                items: data.items,
                count: data.count
            });

            if (window.location !== window.parent.location) {
                localStorage.setItem('hp_cart_items', JSON.stringify(data.items));
                localStorage.setItem('hp_cart_items_count', data.count);
            }
        },

        /**
         * Set configuration id to the product itemkey
         * 
         * @param {string} itemKey 
         * @param {string|number} configId 
         */
        _setSavedConfigurationToItemkey : function (itemKey, configId) {
            const matches = itemKey.match(/^(product-\d+)(-\d+)?$/);
            if (matches) {
                return matches[1] + '-' + configId;
            }

            return itemKey;
        },

        /**
         * Handle fail add to cart.
         *
         * @param $this
         * @param {string} [msg]
         */
        _handleFailAddToCart : function ($this, msg) {
            msg = msg || $this.getOption('msgTryAgain');

            UIkit.notification('<span uk-icon="icon:warning"></span> ' + msg + '', 'danger');
        },

        /**
         * Add to cart
         * 
         * @param $this
         * @param {string} itemKey
         * @param {object} requestData
         */
        _addToCart : function ($this, itemKey, requestData) {
            requestData.format = 'raw';
            requestData.option = 'com_hyperpc';
            requestData.tmpl   = 'component';

            $this._openLoader();
            $.ajax({
                'url'      : '/index.php',
                'dataType' : 'json',
                'method'   : 'POST',
                'data'     : requestData
            })
            .done(function(data) {
                if (data.result === true) {
                    $this._handleSuccessAddToCart($this, itemKey, data);
                } else {
                    $this._handleFailAddToCart($this);
                }
            })
            .fail(function(xjr, error) {
                const msg = error.msg || $this.getOption('msgTryAgain')
                $this._handleFailAddToCart($this, msg);
            })
            .always(function() {
                $this._hideLoader();
            });
        },

        /**
         * Handle click on jsAddToCart button
         * 
         * @param $this
         * @param $button jQuery object
         */
        _handleAddToCartButton : function ($this, $button) {
            const option  = $button.data('default-option'),
                  itemKey = $button.closest('.jsCartButtons').data('itemkey');

            const args = {
                'quantity' : 1,
                'id'       : $button.data('id'),
                'type'     : $button.data('type')
            };

            if (option !== undefined) {
                args.option = option;
            }

            if ($button.data('stock-id')) {
                args.stock_id = $button.data('stock-id');
            } else if ($button.data('saved-configuration')) {
                args.savedConfiguration = $button.data('saved-configuration');
            }

            const requestData = {
                'args' : args,
                'task' : 'cart.addToCart'
            };

            $this._addToCart($this, itemKey, requestData);
        },

        /**
         * Handle click on jsCreateConfigAddToCart button
         * 
         * @param $this
         * @param $button jQuery object
         */
        _handleCreateConfigAddToCartButton : function($this, $button) {
            const itemKey = $button.closest('.jsCartButtons').data('itemkey');

            const $canBeChangedRows = $this.$('.jsCanBeChanged');

            let isDefaultConfig = true;
            $canBeChangedRows.filter('[data-changed-item]').each(function() {
                const $row = $(this);
                if ($row.data('changedItem') !== $row.data('defaultItemkey')) {
                    isDefaultConfig = false;
                    return false;
                }
            });

            if (isDefaultConfig) {
                $this._handleAddToCartButton($this, $button);
            } else {
                const id     = $button.data('id'),
                      method = 'toggle-parts',
                      args   = {};

                $canBeChangedRows.each(function(i) {
                    const $part = $(this),
                          defaultItemkey = $part.data('defaultItemkey');

                    args[i] = {
                        'default'   : null,
                        'part-id'   : $part.find('.jsGroupPartValue').val(),
                        'option-id' : $part.find('.jsGroupOptionValue').val()
                    };

                    if (window.HpProductDefaultParts[defaultItemkey]) {
                        args[i].default = {
                            'part'   : window.HpProductDefaultParts[defaultItemkey].part_id,
                            'option' : window.HpProductDefaultParts[defaultItemkey].option_id
                        };
                    }
                });

                const isMoysklad = !!itemKey.match(/^(position-\d+)(-\d+)?$/);

                if (Object.keys(args).length) {
                    const requestData = {
                        'id'         : id,
                        'args'       : args,
                        'method'     : method,
                        'isMoysklad' : isMoysklad,
                        'task'       : 'cart.add-product-and-create-config'
                    };

                    $this._addToCart($this, itemKey, requestData);
                }
            }
        },

        /**
         * Add item in to the basket.
         *
         * @param e
         * @param $this
         */
        'click .jsAddToCart' : function (e, $this) {
            e.preventDefault();

            const $button = $(this);
            $this._handleAddToCartButton($this, $button);
        },

        /**
         * Create product custom configuration and add in to the cart.
         *
         * @param e
         * @param $this
         */
        'click .jsCreateConfigAddToCart' : function (e, $this) {
            const $button = $(this);
            $this._handleCreateConfigAddToCartButton($this, $button);

            e.preventDefault();
        }
    });
});
