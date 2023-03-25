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

    JBZoo.widget('HyperPC.Geo.PhoneInput', {
        'dadataApiKey' : ''
    }, {

        /**
         * @typedef {Object} UserLocation
         * @property {string} country country name
         * @property {string} city city name
         * @property {string} location full name of the user location
         * @property {string} fiasId city/settelment fias identifier
         * @property {string} fiasType type of the locality
         * @property {string|number} geoId yandex geoId
         * @property {string|number} zipCode post index
         */

         /**
         * Initialize widget.
         *
         * @param $this
         */
        init : function ($this) {
            $this._subscribeGeoEvents($this);

            $this._defineUserLocation($this, $this.getOption('dadataApiKey'));

            $('body')
            .on('input', '.tm-mask-phone input[type="tel"]', function(e) {
                const $input = $(this);
                if ($input.val().length < 4) {
                    $input.val("+7 (");
                }

                $this._setMaskAttr($this, $input);
            })
            .on('click', '.tm-mask-phone', function(e) {
                if ($(e.target).is('.tm-mask-phone')) {
                    const $input = $(e.target).find('input[type="tel"]');
                    if (!$input.is('[disabled], .uk-disabled')) {
                        const val = $input.val();
                        $input.trigger('focus').val('').val(val);
                    }
                }
            })
            .on('keydown', '.tm-mask-phone input', function(e) {
                switch (e.keyCode) {
                    case 37: // arrow left
                    case 39: // arrow right
                        if (this.selectionEnd <= 4) {
                            return false;
                        }
                        break;
                }
            });

        },

        /**
         * On location definrd.
         */
        _onLocationDefined : function () {
            this._updateMask(this);
        },

        /**
         * Update phone mask.
         *
         * @param $this
         */
        _updateMask : function ($this) {
            /** @type {UserLocation} */
            const userLocation = $this._getUserLocation($this),
                  $input = $this.el;

            let maskClass = 'tm-mask-phone';

            if ($this.el.hasClass('uk-form-large')) {
                maskClass += ' tm-mask-phone-large';
            }

            if ($this.el.siblings('.uk-form-icon:not(.uk-form-icon-flip)').length > 0) {
                maskClass += ' tm-mask-phone-icon';
            }

            if ($input.attr('aria-invalid') !== 'false') {
                const inputVal = $input.val();
                if (userLocation.country === 'Россия' && (inputVal === '' || /^(\+7)/.test(inputVal))) {
                    if (inputVal === '') {
                        $input
                            .val('+7 (')
                            .closest('.tm-label-infield').removeClass('isEmpty');
                    }

                    $input.parent().addClass(maskClass);

                    $input.mask && $input.mask('+7 (000) 000-00-00');
                    $input.is(':required') && $input.rules && $input.rules('add', 'mobile');
                } else {
                    if (inputVal === '' || inputVal === '+7 (') {
                        $input
                            .val('')
                            .closest('.tm-label-infield').addClass('isEmpty');
                    }

                    $input.closest('.tm-mask-phone').removeClass(maskClass);

                    $input.mask && $input.mask('+000000000000000');
                    $input.rules && $input.rules('remove', 'mobile');
                }

                const errors = $input.attr('aria-describedby');
                if (errors) {
                    $input.siblings('#' + errors).hide();
                }

                $input.removeClass('uk-form-danger uk-form-success');
            }

            $this._setMaskAttr($this, $input);
        },

        /**
         * Set mask attr to input wrapper
         * 
         * @param $this 
         * @param $input 
         */
        _setMaskAttr : function ($this, $input) {
            const $parent = $input.parent();
            if (!$parent.is('.tm-mask-phone')) {
                $parent.removeAttr('data-mask');
                return;
            }

            const mask = '+7 (___) ___-__-__';
            const inputVal = $input.val();
            $parent.attr('data-mask', inputVal + mask.substring(inputVal.length));
        },

        /**
         * Move caret to the end position.
         *
         * @param e
         * @param $this
         */
        'click {element}' : function (e, $this) {
            const $el = $(this),
                  val = $el.val();
            $el.trigger('focus').val('').val(val)
        }

    });

});