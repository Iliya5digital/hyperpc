const JCaption=function(){}
if(typeof jQuery!="undefined")jQuery(function($){const $window=$(window),$html=$('html'),$body=$('body');$html.removeClass('js-supported').addClass('js-ready');const userAgent=window.navigator.userAgent;const isIos=/iPad|iPhone|iPod/.test(userAgent)&&!window.MSStream;if(isIos){$body.removeClass('device-ios-no').addClass('device-ios-yes');}window.isIE=(/trident/gi).test(userAgent)||(/msie/gi).test(userAgent);window.dump=function(vars,name,showTrace){if(typeof console=="undefined")return false;if(typeof vars=="string"||typeof vars=="array")var type=" ("+typeof vars+", "+vars.length+")";else var type=" ("+typeof vars+")";if(typeof vars=="string")vars='"'+vars+'"';if(typeof name=="undefined")name="..."+type+" = ";else name+=type+" = ";if(typeof showTrace=="undefined")showTrace=false;console.log(name,vars);if(showTrace)console.trace();return true};$window.HyperPCGeoCity&&$('.jsGeoCity').HyperPCGeoCity({'dadataApiKey':window.dadataToken||''});if($html.attr('lang')==='ru'){UIkit.modal.i18n={ok:'Да',cancel:'Отмена'};}const $mainnav=$body.find('.tm-nav-main, .tm-mainnav');if($mainnav.length){const $pageStickyNav=$body.find('.jsPageStickyNav').filter('[uk-sticky]'),stickyParams={};if($pageStickyNav.length){$pageStickyNav.wrap('<div class="jsMainnavStickyBottom"></div>');stickyParams.bottom='.jsMainnavStickyBottom';}UIkit.sticky($mainnav,stickyParams);}const $chooseBlock=$body.find('.jsChooseAnotherCategory');if($chooseBlock.length){$chooseBlock.each(function(){const $block=$(this),$items=$block.children();$items.each(function(){const $item=$(this),$link=$item.find('a[href]').eq(0),url=new URL($link.attr('href'),window.location.href);if(url.href===window.location.href){$item.remove();return false;}});});}const uidCookieKey='hp_uid';if(document.cookie.split(';').filter(function(item){return item.trim().indexOf(uidCookieKey+'=')===0}).length===0){const saltMin=1000000000,saltMax=2147483647,uidCoockieValue=Math.floor((Math.random()*(saltMax-saltMin)+saltMin))+'.'+Math.floor(Date.now()/1000),expire=new Date(2147483647*1000).toUTCString();document.cookie=uidCookieKey+'='+uidCoockieValue+'; path=/; expires='+expire;}});