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

    JBZoo.widget('HyperPC.Geo.Phone', {
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

        $phones : null,
        availableLocations : [],

         /**
         * Initialize widget.
         *
         * @param $this
         */
        init : function ($this) {
            $this.availableLocations = [];
            $this.$phones = $this.el.children();
            $this.$phones.each(function() {
                $this.availableLocations.push($(this).data('locate'));
            });

            $this._subscribeGeoEvents($this);

            $this._defineUserLocation($this, $this.getOption('dadataApiKey'));
        },

        /**
         * On location definrd.
         */
        _onLocationDefined : function () {
            this._showPhone(this);
        },

        _showPhone : function ($this) {
            /** @type {UserLocation} */
            const userLocation = $this._getUserLocation($this);

            $this.$phones.addClass('uk-hidden');
            if ((userLocation.geoId == 213 || userLocation.country !== 'Россия') && $this.availableLocations.indexOf('Moscow') !== -1) {
                $this.$phones.filter('[data-locate="Moscow"]').removeClass('uk-hidden');
            } else if ((userLocation.geoId == 2 || userLocation.location.indexOf('Ленинградская обл') !== -1) && $this.availableLocations.indexOf('SPb') !== -1) {
                $this.$phones.filter('[data-locate="SPb"]').removeClass('uk-hidden');
            } else if ($this.availableLocations.indexOf('Russia') !== -1) {
                $this.$phones.filter('[data-locate="Russia"]').removeClass('uk-hidden');
            }

            if ($this.$phones.not('.uk-hidden').length === 0) {
                $this.$phones.first().removeClass('uk-hidden');
            }
        }

    });

});