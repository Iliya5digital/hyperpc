document.addEventListener('DOMContentLoaded',function(){'use strict';if(window.UIkit){const items=document.getElementsByClassName('g-recaptcha');for(let i=0,l=items.length;i<l;i++){const element=items[i];element.innerHTML='&nbsp;';}UIkit.scrollspy(items,{hidden:false});UIkit.util.once(items,'inview',function(){addCaptchaScript()});}else{addCaptchaScript();}function addCaptchaScript(){const script=document.createElement('script');const scriptTag=document.getElementsByTagName('script')[0];script.src='https://www.google.com/recaptcha/api.js?onload=JoomlaInitReCaptcha2&render=explicit&hl=ru-RU';scriptTag.parentNode.insertBefore(script,scriptTag);}});