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

    JBZoo.widget('HyperPC.LabelInfield', {}, {

        selector : 'input:not([type="date"]), textarea',

        /**
         * Initialize widget.
         *
         * @param $this
         */
        init: function($this) {
            $this.el.find($this.selector).each(function() {
                if ($(this).val() === '') {
                    $this.el.addClass('isEmpty');
                }
            });

            $this.el.on(
                'input propertychanged',
                'textarea',
                function(e) {
                    $this._handleTextareaInputPropertychanged(e, $this)
                }
            );
        },

        /**
         * Handle textarea input and propertychanged events.
         *
         * @param e
         * @param $this
         */
        _handleTextareaInputPropertychanged: function(e, $this) {
            if (e.target.clientHeight < e.target.scrollHeight) {
                $this.el.addClass('hasScrollbar');
            } else {
                $this.el.removeClass('hasScrollbar');
            }
        },

        /**
         * Handle click on label.
         *
         * @param e
         * @param $this
         */
        'click label': function(e, $this) {
            if ($this.el.is(':not(.isFocused)')) {
                $this.el.find($this.selector).trigger('focus');
            }
        },

        /**
         * Handle focusin event on input and textarea elements.
         *
         * @param e
         * @param $this
         */
        'focusin input:not([type="date"]), textarea': function(e, $this) {
            $this.el.addClass('isFocused');
        },

        /**
         * Handle focusout event on input and textarea elements.
         *
         * @param e
         * @param $this
         */
        'focusout input:not([type="date"]), textarea': function(e, $this) {
            $this.el.removeClass('isFocused');
            if ($(e.target).val() === '') {
                $this.el.addClass('isEmpty');
            } else {
                $this.el.removeClass('isEmpty');
            }
        },

    });

});