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

    JBZoo.widget('HyperPC.ScrollToTop', {}, {

        offset: 0,
        shown: false,
        lastScrollPos: 0,
        scrollComponent: null,

         /**
         * Initialize widget.
         *
         * @param $this
         */
        init: function ($this) {
            $this.scrollComponent = UIkit.scroll($this.el, {offset:0});

            $(window).on('scroll', function() {
                if (window.pageYOffset > 150) {
                    $this.shown || ($this.el.removeAttr('hidden'), $this.shown = true);
                } else if (!$this.el.hasClass('tm-scroll-totop--back')) {
                    $this.shown && ($this.el.attr('hidden', 'hidden'), $this.shown = false);
                }

                if ($this.offset < window.pageYOffset && $this.offset > 150 && $this.el.hasClass('tm-scroll-totop--back')) {
                    $this.el.removeClass('tm-scroll-totop--back')
                            .find('[data-uk-icon]').attr('uk-icon', 'chevron-up');
                    $this.lastScrollPos = 0;
                    $this.scrollComponent.offset = 0;
                }
                $this.offset = window.pageYOffset;
            });
        },

        /**
         * On click toTop bar.
         *
         * @param e
         * @param $this
         */
        'click {element}': function (e, $this) {
            if ($this.el.hasClass('tm-scroll-totop--back')) {
                $this.el.one('scrolled', function () {
                    $this.el.removeClass('tm-scroll-totop--back')
                            .find('[data-uk-icon]').attr('uk-icon', 'chevron-up');
                    $this.scrollComponent.offset = 0;
                    $this.lastScrollPos = 0;
                });
            } else {
                $this.lastScrollPos = window.pageYOffset;
                $this.el.addClass('tm-scroll-totop--back');
                $this.el.find('[data-uk-icon]').attr('uk-icon', 'chevron-down');
                $this.el.one('scrolled', function () {
                    $this.scrollComponent.offset = -$this.lastScrollPos;
                });
            }
        }

    });

});