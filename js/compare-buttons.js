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

    JBZoo.widget('HyperPC.SiteCompareButtons', {
        'compareUrl'             : '/index.php?option=com_hyperpc&view=compare',
        'inCompareClass'         : 'inCompare',
        'compareBtn'             : '',
        'addToCompareTitle'      : '',
        'removeFromCompareTitle' : '',
        'addToCompareText'       : '',
        'removeFromCompareText'  : ''
    }, {

        /**
         * Initialize widget.
         *
         * @param $this
         */
        init : function ($this) {
            $(window).on('storage', function (e) {
                switch (e.key) {
                    case 'hp_compared_items':
                        $this._updateCompareButtons($this);
                        break;
                }
            });
        },

        /**
         * Update compare buttons.
         *
         * @param $this
         */
        _updateCompareButtons : function ($this) {
            const comparedItems = JSON.parse(localStorage.getItem('hp_compared_items')) || {};

            const $buttons = $this.$('.jsCompareAdd');
            $buttons
                .removeClass($this.getOption('inCompareClass'))
                .attr('title', $this.getOption('addToCompareTitle'))
                .find('.hp-compare-btn-text')
                .text($this.getOption('addToCompareText'));
            $buttons.filter('.uk-disabled').each(function() {
                $this._unlockButton($(this));
            });

            for (let type in comparedItems) {
                if (Object.hasOwnProperty.call(comparedItems, type)) {
                    const items = comparedItems[type];
                    for (let key in items) {
                        if (Object.hasOwnProperty.call(items, key)) {
                            const itemKey = items[key].type + '-' + key;
                            $buttons.filter('[data-itemkey="' + itemKey + '"]')
                                .addClass($this.getOption('inCompareClass'))
                                .attr('title', $this.getOption('removeFromCompareTitle'))
                                .find('.hp-compare-btn-text')
                                .text($this.getOption('removeFromCompareText'));
                        }
                    }
                }
            }
        },

        /**
         * Handle success compare add
         *
         * @param $this
         * @param response
         * @param $button
         */
        _handleSuccessCompareAdd : function ($this, response, $button) {
            const groupKey = $this._getGroupKeyFromCompareButton($button);
            if (response.result) {
                $button.addClass($this.getOption('inCompareClass'))
                       .attr('title', $this.getOption('removeFromCompareTitle'))
                       .find('.hp-compare-btn-text')
                       .text($this.getOption('removeFromCompareText'));

                const eventData = {
                    task: 'add',
                    totalCount: response.total
                };

                if (typeof response.html !== undefined) {
                    eventData.groupKey = groupKey;
                    eventData.html = response.html;
                }

                localStorage.setItem('hp_compared_items', JSON.stringify(response.items));
                $(document).trigger('hpcompareupdated', eventData);

                if (window.location !== window.parent.location) {
                    localStorage.setItem('hp_compared_items_count', response.count);
                }

                $this._showSuccessCompareMessage($this, $button, response);
            } else {
                $this._showFailCompareMessage($this, $button, response);
            }
        },

        /**
         * Show success compare message
         *
         * @param $this
         * @param $button
         * @param response
         */
        _showSuccessCompareMessage: function($this, $button, response) {
            const compareUrl = $this._getCompareUrl($this, $button),
                  msg = response.msg || '',
                  icon = '<span class="uk-text-success uk-visible@s" uk-icon="icon: check; ratio: 1.5"></span>';

            $this._showMessage($this, msg, icon, compareUrl);
        },

        /**
         * Show fail compare message
         *
         * @param $this
         * @param $button
         * @param response
         */
        _showFailCompareMessage: function($this, $button, response) {
            const compareUrl = $this._getCompareUrl($this, $button),
                  msg = response.msg || '',
                  icon = '<span class="uk-text-warning uk-visible@s" uk-icon="icon: warning; ratio: 1.5"></span>';

            $this._showMessage($this, msg, icon, compareUrl);
        },

        /**
         * Show notification message
         *
         * @param $this
         * @param {string} msg
         * @param {string} icon
         * @param {string} compareUrl
         */
        _showMessage: function($this, msg, icon, compareUrl) {
            let compareLink = '';
            if (typeof compareUrl !== 'undefined' && compareUrl.length) {
                compareLink =
                    '<a href="' + compareUrl + '"class="jsLoadIframe uk-button uk-button-default uk-button-small uk-modal-close">' +
                        $this.getOption('compareBtn') +
                    '</a>';
            }

            const modalHtml =
                '<div>' +
                    '<div class="uk-grid-small uk-flex-middle" uk-grid>' +
                        '<div class="uk-visible@s uk-flex-last@s uk-text-right">' +
                            '<a class="uk-modal-close uk-link-muted" uk-icon="icon: close; ratio: 1.5"></a>' +
                        '</div>' +
                        icon +
                        '<div class="uk-width-1-1 uk-width-expand@s">' +
                            msg +
                        '</div>' +
                        '<div class="uk-width-1-1 uk-width-auto@s uk-text-center">' +
                            compareLink +
                        '</div>' +
                    '</div>' +
                '</div>';

            UIkit.notification.closeAll();
            UIkit.notification(modalHtml, {pos: 'compare', timeout: 3000});
        },

        /**
         * Get compare url
         *
         * @param $this
         * @param $el
         * @returns {string}
         */
        _getCompareUrl: function($this, $button) {
            const groupKey = $this._getGroupKeyFromCompareButton($button),
                  type = $button.data('type');

            let compareUrl = $this.getOption('compareUrl');
                compareUrl += compareUrl.indexOf('?') > 0 ? '&' : '?';
                compareUrl += 'group=' + groupKey + '&type=' + type;

            return compareUrl;
        },

        /**
         * Handle success compare remove
         *
         * @param $this
         * @param response
         * @param $el
         */
        _handleSuccessCompareRemove : function ($this, response, $el) {
            if (response.result) {
                $el.removeClass($this.getOption('inCompareClass'))
                   .attr('title', $this.getOption('addToCompareTitle'))
                   .find('.hp-compare-btn-text')
                   .text($this.getOption('addToCompareText'));

                $(document).trigger('hpcompareupdated', {
                    task: 'remove',
                    totalCount: response.count
                });
                localStorage.setItem('hp_compared_items', JSON.stringify(response.items));

                if (window.location !== window.parent.location) {
                    localStorage.setItem('hp_compared_items_count', response.count);
                }
            } else {
                // error
            }
        },

        /**
         * Lock compare button.
         *
         * @param $button
         */
        _lockButton : function ($button) {
            $button
                .addClass('uk-disabled')
                .css('opacity', 1)
                .find('.uk-icon')
                .removeAttr('uk-icon')
                .html('')
                .attr('uk-spinner', 'ratio: 0.667');
        },

        /**
         * Unlock compare button.
         *
         * @param $button
         */
        _unlockButton : function ($button) {
            $button
                .removeClass('uk-disabled')
                .css('opacity', '')
                .find('.uk-icon')
                .removeClass('uk-spinner')
                .removeAttr('uk-spinner')
                .attr('uk-icon', 'hp-compare-add');
        },

        /**
         * Get groupKey from compare button
         *
         * @param $el
         * @returns {string}
         */
        _getGroupKeyFromCompareButton : function ($el) {
            return $el.closest('[data-group]').data('group') || '';
        },


        /**
         * Collect request args
         *
         * @param $this
         * @param $el
         *
         * @returns {object}
         */
        _collectRequestArgs : function ($this, $el) {
            const id = $el.data('id');
            const args  = {
                'type'     : $el.data('type'),
                'itemId'   : id,
                'optionId' : $el.data('option-id') || null,
            };

            if ($el.data('stock-id')) {
                args.stockId = $el.data('stock-id');
                args.itemId  = id + '-in-stock-' + $el.data('stock-id');
            }

            return args;
        },

        /**
         * On click compare button.
         *
         * @param $this
         */
        'click .jsCompareAdd' : function (e, $this) {
            e.preventDefault();

            const $el = $(this),
                  args = $this._collectRequestArgs($this, $el),
                  task = $el.hasClass($this.getOption('inCompareClass')) ? 'remove' : 'add';

            $this._lockButton($el);

            const request = $.ajax({
                'url'       : '/index.php',
                'dataType'  : 'json',
                'type'      : 'POST',
                'data'      : {
                    'option' : 'com_hyperpc',
                    'tmpl'   : 'component',
                    'task'   : 'compare.' + task,
                    'format' : 'raw',
                    'args'   : args
                }
            })
            .fail(function($xhr, textStatus, errorThrown) {
                const msg = $xhr.status ? $xhr.statusText : 'Connection error';
                UIkit.notification(msg, 'danger');
            })
            .always(function() {
                $this._unlockButton($el);
            });

            switch (task) {
                case 'add':
                    request.done(function(response) {
                        $this._handleSuccessCompareAdd($this, response, $el);
                    });
                    break;
                case 'remove':
                    UIkit.notification.closeAll();
                    request.done(function(response) {
                        $this._handleSuccessCompareRemove($this, response, $el);
                    });
                    break;
            }
        }

    });
});
