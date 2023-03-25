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

    JBZoo.widget('HyperPC.LoadIframe', {
        selector: '.jsLoadIframe',
    }, {

        /**
         * Initialize widget.
         *
         * @param $this
         */
        init: function($this) {
            $this.el.on('click', $this.getOption('selector'), function(e) {
                e.preventDefault();
                $this._handleClick($(this), $this);
            });

            const $body = $('body');

            $body.on('itemload', '.uk-lightbox', function() {
                $this._handleItemload($(this), $this);
            });

            if (history.state && history.state.hasOwnProperty('type') && history.state.type === 'iframe' && history.state.hasOwnProperty('href')) {
                $this._showLigtbox(history.state.href);
            }

            window.addEventListener('popstate', function(e) {
                const $opennedLightbox = $body.find('.uk-lightbox.uk-open');
                if ($opennedLightbox.length && $opennedLightbox.data('source')) {
                    UIkit.modal($opennedLightbox).hide();
                } else if (e.state && e.state.hasOwnProperty('type') && e.state.type === 'iframe' && e.state.hasOwnProperty('href')) {
                    $this._showLigtbox(e.state.href);
                }
            });
        },

        /**
         * Handle click on load link.
         *
         * @param $el
         * @param $this
         */
        _handleClick: function($el, $this) {
            let href = $el.is('a') ? $el.attr('href') : $el.data('href');

            if (href && href.indexOf('tmpl=') === -1) {
                href += href.indexOf('?') !== -1 ? '&' : '?';
                href += 'tmpl=component';
            }
            href += '&iframe=1';

            $this._showLigtbox(href);

            history.pushState({href: href, type: 'iframe'}, '');
        },

        /**
         * Handle lightbox load.
         *
         * @param $el
         * @param $this
         */
        _handleItemload: function($el, $this) {
            const $iframe = $el.find('.uk-lightbox-iframe');

            // set toolbar style
            if ($iframe.length > 0 && !$iframe.is('[src*="task=workers.render-form"]')) {
                $el.find('.uk-lightbox-toolbar.uk-position-top').addClass('tm-lightbox-iframe-close');
            }
        },

        /**
         * Show UIkit ligtbox
         * 
         * @param {string} href
         */
        _showLigtbox: function(href) {
            const item = [{source: href, type: 'iframe'}],
                  panel = UIkit.lightboxPanel({'items': item});

            $(panel.$el).data('source', href);
            panel.show();

            UIkit.util.on(panel.$el, 'hidden', function() {
                const $lightbox = $(this),
                      source = $lightbox.data('source');

                if (history.state && history.state.hasOwnProperty('href') && source === history.state.href) {
                    history.go(-1);
                }
            });
        }

    });

});
