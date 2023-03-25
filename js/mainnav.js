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

    JBZoo.widget('HyperPC.Mainnav', {}, {

        /**
         * Initialize widget.
         *
         * @param $this
         */
        init : function ($this) {
            // Active items in first level
            if ($this.el.children('.uk-active').length < 1) {
                $this.el.children().each(function() {
                    var $children = $(this);
                    if ($children.find('.uk-active').not('[class*="tm-mainnav-list__switcher"]:not(.tm-mainnav-list__switcher-nav--active)').length > 0) {
                        $children.addClass('uk-active');
                        return false;
                    }
                });
            }

            // Active items in second level
            var $thirdLevelActive = $this.$('.tm-mainnav-list__switcher-item').find('.uk-active').first(),
                $secondLevelItems = $this.$('.tm-mainnav-list__switcher-nav');
            if ($thirdLevelActive.length) {
                $secondLevelItems = $thirdLevelActive.closest('.tm-mainnav-list').find('.tm-mainnav-list__switcher-nav');
                if ($secondLevelItems.filter('.tm-mainnav-list__switcher-nav--active').length === 0) {
                    var index = $thirdLevelActive.closest('.tm-mainnav-list__switcher-item').index();
                    $secondLevelItems.eq(index).addClass('tm-mainnav-list__switcher-nav--active');
                }
            }

            // Prevention of double active items at the same level
            $this.$('.uk-active ~ .uk-active').each(function() {
                $activesOnLevel = $(this).parent().children('.uk-active');
                var $aliasParentActive = $activesOnLevel.filter('.alias-parent-active');
                if ($aliasParentActive.length < $activesOnLevel.length) {
                    $aliasParentActive.removeClass('uk-active');
                } else if ($aliasParentActive.length === $activesOnLevel.length) {
                    // TODO compare hrefs for get right active item
                }
            });
        },

        /**
         * Set data to the image block
         * 
         * @param $imageBlock
         * @param data
         */
        _setImageBlock: function ($imageBlock, data) {
            if (typeof data === 'undefined') {
                $imageBlock
                    .data('changed', false)
                    .find('.tm-mainnav-list__image-block-link').attr('hidden', 'hidden');
            } else {
                $imageBlock
                    .data('changed', true)
                    .find('.tm-mainnav-list__image-block-link').text(data.linkText).removeAttr('hidden');
            }

            var data = data || $imageBlock.data('default') || {},
                $image = $imageBlock.find('img'),
                imageSrc = data.image || $image.data('src') || '';

            $imageBlock.find('a').attr('href', data.link);
            $imageBlock.find('.tm-mainnav-list__image-block-text').text(data.text);
            $image.attr('src', imageSrc);
        },

        /**
         * Toggle menu switcher on hover
         * 
         * @param e 
         * @param $this 
         */
        'mouseenter .tm-mainnav-list__switcher-nav' : function(e, $this) {
            var $switcherNavItem = $(this),
                $switcherNav = $switcherNavItem.closest('.tm-mainnav-list__nav'),
                index = $switcherNav.find('li').index(this);

            UIkit.switcher($switcherNav).show(index);
        },

        /**
         * Go to the new location on switcher nav click
         * 
         * @param e 
         * @param $this 
         */
        'click .tm-mainnav-list__switcher-nav' : function(e, $this) {
            var $switcherNavItem = $(this),
                $link = $switcherNavItem.children(),
                href = $link.attr('href');

            if (href === '#') {
                e.preventDefault();
            } else if ($link.attr('target') === '_blank') {
                window.open(href,'_blank');
            } else {
                window.location.href = href;
            }
        },

        /**
         * Set 3rd level menu item info to the image block
         * 
         * @param e
         * @param $this
         */
        'mouseenter .tm-mainnav-list__item-menu > ul > li' : function (e, $this) {
            var $menuItem = $(this).children().filter('a'),
                $imageBlock = $menuItem.closest('.tm-mainnav-list__switcher-item').find('.tm-mainnav-list__item-image-block'),
                $subTitle = $menuItem.find('.uk-navbar-subtitle');

            var menuItemInfo = {
                'link': $menuItem.attr('href'),
                'text': $menuItem.data('text') || ($subTitle.length > 0 ? $subTitle.text() : $menuItem.text()),
                'image': $menuItem.data('image'),
                'linkText': $menuItem.data('linkText') || 'Подробнее',
            };

            $this._setImageBlock($imageBlock, menuItemInfo);
        },

        /**
         * Set image block to default
         * 
         * @param e
         * @param $this
         */
        'mouseleave .tm-mainnav-list__switcher-item' : function(e, $this) {
            var $imageBlock = $(this).find('.tm-mainnav-list__item-image-block');
            if ($imageBlock.data('changed') === true) {
                $this._setImageBlock($imageBlock);
            }
        }

    });
});
