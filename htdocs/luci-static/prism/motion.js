/* SPDX-License-Identifier: Apache-2.0 */
(function () {
 'use strict';
 const preference=matchMedia('(prefers-reduced-motion: reduce)'), running=new Set();
 function animate(element,frames,done) {
  if(preference.matches || typeof element.animate!=='function') { done?.(); return null; }
  const style=getComputedStyle(document.documentElement);
  const configuredDuration=parseFloat(style.getPropertyValue('--prism-duration'));
  const duration=Number.isFinite(configuredDuration) && configuredDuration>=0 ? configuredDuration : 220;
  const easing=style.getPropertyValue('--prism-ease').trim() || 'cubic-bezier(.2,.7,.2,1)';
  const animation=element.animate(frames,{duration,easing});
  running.add(animation);
  animation.onfinish=()=>{running.delete(animation);done?.();};
  animation.oncancel=()=>running.delete(animation);
  return animation;
 }
 preference.addEventListener('change',e=>{if(e.matches)Array.from(running).forEach(a=>{
  // Cancel dispatches its event asynchronously; an idle animation cannot finish.
  if(a.playState==='idle')running.delete(a);else a.finish();
 });});
 window.PrismMotion={animate,reduced:()=>preference.matches};
})();
