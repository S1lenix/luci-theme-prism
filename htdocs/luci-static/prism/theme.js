(function () {
 'use strict';
 const russian=document.documentElement.lang.toLowerCase().startsWith('ru');
 const themes = [
  ['micro',russian?'Светлая':'Light'],['light',russian?'Лёгкая':'Soft'],['ink',russian?'Контур':'Ink'],['minimal',russian?'Минимал':'Minimal'],
  ['bento',russian?'Бенто':'Bento'],['retro',russian?'Ретро 98':'Retro 98'],['dark',russian?'Тёмная':'Dark'],['depth',russian?'Объём 3D':'Depth']
 ];
 const themeLabel=russian?'Тема оформления':'Appearance';
 const key = 'luci.prism.theme';
 const nativeIcons=new Set(['ethernet','ethernet_disabled','bridge','tunnel','tunnel_disabled','wifi','wifi_disabled','port_up','port_down','signal-none','signal-000-000','signal-000-025','signal-025-050','signal-050-075','signal-075-100']);
 function apply(id) {
  if (!themes.some(t => t[0] === id)) id = 'dark';
  const root = document.documentElement;
  root.dataset.theme = id;
  const scale=window.devicePixelRatio || 1;
  root.style.setProperty('--prism-segment-size',`${Math.round(12*scale)/scale}px`);
  root.style.setProperty('--prism-segment-gap',`${Math.max(1,Math.round(2*scale))/scale}px`);
  root.dataset.zmThemeChecked = '1';
  root.dataset.darkmode = String(id === 'dark' || id === 'depth');
  root.classList.toggle('zm-theme-dark', id === 'dark' || id === 'depth');
  document.querySelectorAll('.zmw-theme-toggle').forEach(b => { b.title = themeLabel + ': ' + themes.find(t => t[0] === id)[1]; });
 }
 try { apply(localStorage.getItem(key) || 'dark'); } catch (_) { apply('dark'); }
 function init() {
  let menu, opener, drawerOpener, closingMenu;
  function closeMenu(focus) {
   if (menu) {
    const closing=menu; closing.inert=true;closing.setAttribute('aria-hidden','true');closingMenu=closing;
    window.PrismMotion.animate(closing,[{opacity:getComputedStyle(closing).opacity,transform:getComputedStyle(closing).transform},{opacity:0,transform:'translateY(-5px)'}],()=>{closing.remove();if(closingMenu===closing)closingMenu=null;});
   }
   menu = null;
   if (opener) { opener.setAttribute('aria-expanded','false'); if (focus) opener.focus(); }
  }
  function themeMenu(button) {
   if (menu) { closeMenu(true); return; }
   closingMenu?.remove();closingMenu=null;
   opener = button;
   menu = document.createElement('div'); menu.className = 'zmw-theme-menu'; menu.setAttribute('role','menu'); menu.setAttribute('aria-label',themeLabel);
   const heading = document.createElement('div'); heading.className = 'zmw-theme-group'; heading.textContent = themeLabel; menu.appendChild(heading);
   themes.forEach(([id,name]) => {
    const option = document.createElement('button'); option.type = 'button'; option.className = 'zmw-theme-opt' + (id === document.documentElement.dataset.theme ? ' zmw-on' : '');
    option.setAttribute('role','menuitemradio'); option.setAttribute('aria-checked',String(id === document.documentElement.dataset.theme));
    const swatch = document.createElement('span'); swatch.className = 'lz-swatch lz-swatch-' + id; swatch.setAttribute('aria-hidden','true');
    const label = document.createElement('span'); label.textContent = name;
    const mark = document.createElement('span'); mark.className = 'zmw-theme-mark'; mark.textContent = id === document.documentElement.dataset.theme ? '✓' : ''; mark.setAttribute('aria-hidden','true');
    option.append(swatch,label,mark);
    option.addEventListener('click',() => { apply(id); try { localStorage.setItem(key,id); } catch (_) {} closeMenu(true); });
    menu.appendChild(option);
   });
   document.body.appendChild(menu);
   const bounds = button.getBoundingClientRect();
   const viewportWidth=document.documentElement.clientWidth;
   menu.style.top = Math.min(bounds.bottom + 8, Math.max(8,innerHeight-menu.offsetHeight-8)) + 'px';
   menu.style.right = Math.min(Math.max(8,viewportWidth-bounds.right),Math.max(8,viewportWidth-menu.offsetWidth-8)) + 'px';
   button.setAttribute('aria-expanded','true');
   menu.querySelector('[aria-checked="true"]').focus();
   menu.addEventListener('keydown',e => {
    if(e.key==='Tab'){closeMenu(true);return;}
    const items = Array.from(menu.querySelectorAll('button')), i = items.indexOf(document.activeElement);
    if (['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','Home','End'].includes(e.key)) {
     const step={ArrowDown:2,ArrowUp:-2,ArrowLeft:-1,ArrowRight:1}[e.key];
     e.preventDefault(); items[e.key === 'Home' ? 0 : e.key === 'End' ? items.length-1 : (i+step+items.length)%items.length].focus();
    }
   });
  }
  const drawerQuery=matchMedia('(max-width: 960px)');
  function drawer(open) {
   if(open && !drawerQuery.matches)return;
   document.body.classList.toggle('zmw-drawer-open',open);
   const toggle = document.querySelector('.zmw-burger'), side = document.querySelector('.zmw-side');
   if (toggle) toggle.setAttribute('aria-expanded',String(open));
   if(side)side.inert=drawerQuery.matches && !open;
   const scrim=document.querySelector('.zmw-scrim');
   if(scrim){scrim.inert=!open;scrim.setAttribute('aria-hidden',String(!open));}
   if (open && side) { drawerOpener = document.activeElement; side.querySelector('button,a,summary')?.focus(); }
   else if (drawerOpener) { drawerOpener.focus(); drawerOpener = null; }
  }
  drawerQuery.addEventListener('change',()=>drawer(false));
  document.querySelectorAll('.zmw-theme-toggle').forEach(b => b.addEventListener('click',() => themeMenu(b)));
  document.querySelectorAll('.zmw-burger').forEach(b => b.addEventListener('click',() => drawer(!document.body.classList.contains('zmw-drawer-open'))));
  document.querySelectorAll('.zmw-drawer-close,.zmw-scrim').forEach(b => b.addEventListener('click',() => drawer(false)));
  document.querySelectorAll('[data-lz-refresh]').forEach(b => b.addEventListener('click',() => location.reload()));
  document.querySelectorAll('.zmw-logout').forEach(b => b.setAttribute('aria-label',b.textContent.trim() || 'Выйти'));
  document.addEventListener('click',e => { if (menu && !menu.contains(e.target) && !e.target.closest('.zmw-theme-toggle')) closeMenu(false); });
  document.addEventListener('keydown',e => {
   if (e.key === 'Escape') { if (menu) closeMenu(true); else drawer(false); }
   if (e.key === 'Tab' && document.body.classList.contains('zmw-drawer-open')) {
    const items = Array.from(document.querySelectorAll('.zmw-side a,.zmw-side button,.zmw-side summary')).filter(el=>el.getClientRects().length && !el.closest('details:not([open]) .prism-group-items'));
    if (!items.length) return;
    if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items[items.length-1].focus(); }
    else if (!e.shiftKey && document.activeElement === items[items.length-1]) { e.preventDefault(); items[0].focus(); }
   }
  });
  window.addEventListener('storage',e => { if (e.key === key) apply(e.newValue); });
  const sections=new WeakMap(), sectionObservers=new Map();
  function sectionButton(control) {
   const heading=control.closest('.cbi-title'), card=heading?.parentElement, content=heading?.nextElementSibling;
   if(!card || !content)return;
   control.dataset.prismToggle='';
   const sectionName=Array.from(control.parentElement.childNodes).filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ');
   control.setAttribute('role','button');control.tabIndex=0;
   function label() {
    const collapsed=control.getAttribute('data-style')==='active';
    control.setAttribute('aria-expanded',String(!collapsed));
    control.setAttribute('aria-label',control.firstChild.textContent.trim()+' '+sectionName);
    control.title=control.getAttribute('aria-label');
   }
   label();
   if(sections.has(control))return;
   const state={animation:null,fade:null,revision:0,overflow:card.style.overflow,hidden:content.style.display==='none'};
   sections.set(control,state);
   control.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();control.click();control.focus({preventScroll:true});}});
   // The existing LuCI listener owns hide/show, persistence and data collection.
   control.addEventListener('click',()=>{
    const revision=++state.revision;
    const start=card.getBoundingClientRect().height;
    const startOpacity=state.hidden&&!state.animation?0:parseFloat(getComputedStyle(content).opacity);
    state.animation?.cancel();state.fade?.cancel();
    requestAnimationFrame(()=>{
     if(revision!==state.revision)return;
     state.hidden=content.style.display==='none';
     label();
     const end=card.getBoundingClientRect().height;
     content.inert=state.hidden;
     if(window.PrismMotion.reduced()) {card.style.overflow=state.overflow;return;}
     if(state.hidden)content.style.display='block';
     card.style.overflow='hidden';
     state.fade=window.PrismMotion.animate(content,[{opacity:startOpacity},{opacity:state.hidden?0:1}]);
     state.animation=window.PrismMotion.animate(card,[{height:start+'px'},{height:end+'px'}],()=>{
      if(revision!==state.revision)return;
      content.style.display=state.hidden?'none':'block';card.style.overflow=state.overflow;
      state.animation=null;state.fade=null;
     });
    });
   },true);
   if(typeof ResizeObserver==='function'){
    const observer=new ResizeObserver(()=>{
    if(state.hidden || !state.animation)return;
    const revision=state.revision;
    const start=card.getBoundingClientRect().height;
    state.animation.cancel();const end=card.getBoundingClientRect().height;
    state.animation=window.PrismMotion.animate(card,[{height:start+'px'},{height:end+'px'}],()=>{if(revision!==state.revision)return;card.style.overflow=state.overflow;state.animation=null;});
    });
    observer.observe(content);sectionObservers.set(control,observer);
   }
  }
  // LuCI creates sections asynchronously. Class decoration leaves its controls and events intact.
  function decorate() {
   // Polling views replace their DOM; release observers for the removed sections.
   sectionObservers.forEach((observer,control)=>{if(!control.isConnected){observer.disconnect();sectionObservers.delete(control);}});
   document.querySelectorAll('svg[data-prism-icon]:not([data-prism-rendered])').forEach(original=>{
    const svg=window.PrismNav.icon(original.dataset.prismIcon);
    svg.classList.add(...original.classList);
    ['id','role','tabindex','focusable','aria-label','aria-labelledby','aria-hidden'].forEach(name=>{if(original.hasAttribute(name))svg.setAttribute(name,original.getAttribute(name));});
    svg.dataset.prismIcon=original.dataset.prismIcon;svg.dataset.prismRendered='1';original.replaceWith(svg);
   });
   document.querySelectorAll('#maincontent input:is([id^="invertLog"],#invertSeverity,#invertAscendingSort)').forEach(input=>{
    const label=input.previousElementSibling;
    if(label?.tagName==='LABEL' && label.htmlFor!==input.id)label.htmlFor=input.id;
    input.parentElement.childNodes.forEach(node=>{if(node.nodeType===3 && node.textContent.includes('\u00a0') && !node.textContent.trim())node.remove();});
   });
   document.querySelectorAll('#maincontent .cbi-title [data-clickable="true"][data-indicator="poll-status"]').forEach(sectionButton);
   document.querySelectorAll('#maincontent .ifacebox img[src*="/icons/port_"]').forEach(img=>img.closest('.ifacebox').parentElement.classList.add('prism-port-grid'));
   document.querySelectorAll('#maincontent img[src*="/icons/"],.modal img[src*="/icons/"],img.prism-original-icon').forEach(img=>{
    const source=img.getAttribute('src') || '', name=source.match(/\/icons\/([^/?]+)\.svg(?:\?.*)?$/)?.[1];
    const previous=img.previousElementSibling;
    if(!nativeIcons.has(name)){
     if(img.dataset.prismIcon){
      if(previous?.classList.contains('prism-native-icon'))previous.remove();
      img.classList.remove('prism-original-icon');delete img.dataset.prismIcon;
     }
     return;
    }
    if(img.dataset.prismIcon===source && previous?.classList.contains('prism-native-icon'))return;
    if(previous?.classList.contains('prism-native-icon'))previous.remove();
    const svg=window.PrismNav.icon(name);svg.classList.add('prism-native-icon');svg.dataset.icon=name;
    img.before(svg);img.classList.add('prism-original-icon');img.dataset.prismIcon=source;
   });
   document.querySelectorAll('#maincontent svg:has(polyline)').forEach(svg=>{
    svg.classList.add('prism-chart');svg.parentElement.classList.add('prism-chart-frame');
    const channel=svg.parentElement.id==='channel_graph';
    svg.querySelectorAll('polyline:not([id])').forEach((line,i)=>{
     if(channel && !line.style.fill.startsWith('url('))line.dataset.prismSeries=String(i%6);
    });
    if(channel){
     const card=svg.parentElement.parentElement;
     const series=[...svg.querySelectorAll('polyline[data-prism-series]')];
     card.querySelectorAll('span[style]').forEach(label=>{
      const line=series.find(line=>{
       const color=line.style.stroke.replace(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i,(_,r,g,b)=>`rgb(${parseInt(r,16)}, ${parseInt(g,16)}, ${parseInt(b,16)})`);
       return color===label.style.color;
      });
      if(line)label.dataset.prismSeries=line.dataset.prismSeries;
     });
    }
   });
   document.querySelectorAll('#maincontent .cbi-section, #maincontent .cbi-tblsection').forEach(el => {
    if (!el.parentElement.closest('.cbi-section,.cbi-tblsection,.zm-card')) el.classList.add('lz-card');
   });
   if (document.querySelector('input[name="luci_password"]')) document.body.classList.add('lz-login');
   document.querySelectorAll('.zm-meter-head').forEach(el=>el.classList.add('zmw-mem-head'));
   document.querySelectorAll('.zm-meter-label').forEach(el=>el.classList.add('zmw-mem-label'));
   document.querySelectorAll('.zm-meter-val').forEach(el=>el.classList.add('zmw-mem-val'));
   document.querySelectorAll('.zm-meter-bar').forEach(el=>el.classList.add('zmw-mem-bar'));
  }
  let pending = false;
  const content = document.body;
  if (content) new MutationObserver(() => {
   if (pending) return; pending = true;
   requestAnimationFrame(()=>{pending=false;decorate();});
  }).observe(content,{childList:true,subtree:true,attributes:true,attributeFilter:['data-style','data-tab-active','src']});
  decorate(); apply(document.documentElement.dataset.theme);
  drawer(false);
  document.body.classList.add('zmw-ready');
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
