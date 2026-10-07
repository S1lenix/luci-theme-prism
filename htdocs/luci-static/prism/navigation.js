(function () {
 'use strict';
 const paths = {
  status:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  system:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2',
  network:'M9 3h6v6H9z M12 9v4 M5 17v-4h14v4 M3 17h4v4H3z M10 17h4v4h-4z M17 17h4v4h-4z',
  services:'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M17 13v8 M13 17h8',
  overview:'M3 12a9 9 0 0 1 18 0v7H3z M12 12l4-4 M7 15h10',
  logs:'M6 3h9l4 4v14H6z M14 3v5h5 M9 12h7 M9 16h7',
  software:'M12 2l9 5v10l-9 5-9-5V7z M3 7l9 5 9-5 M12 12v10 M7 4l10 6',
  firewall:'M12 2l8 4v6c0 5-8 10-8 10S4 17 4 12V6z M8 12l3 3 5-6',
  routes:'M4 20V5a2 2 0 0 1 2-2h9 M12 1l3 2-3 2 M4 14h14 M15 11l3 3-3 3',
  dhcp:'M3 5h18v5H3z M3 14h18v5H3z M7 7.5h.01 M7 16.5h.01 M16 8h2 M16 17h2',
  dns:'M3 12h18 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 3c-5 5-5 13 0 18 M12 3c5 5 5 13 0 18',
  diagnostics:'M2 12h5l3-8 4 16 3-8h5',
  admin:'M8 10V6a4 4 0 0 1 8 0v4 M5 10h14v11H5z M12 14v3',
  startup:'M13 2L4 14h7l-1 8 10-13h-8z',
  crontab:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l3 2',
  flash:'M12 3v12 M8 7l4-4 4 4 M4 14v6h16v-6',
  reboot:'M12 2v10 M6 5a9 9 0 1 0 12 0',
  leds:'M9 18h6 M10 21h4 M8 15a7 7 0 1 1 8 0l-1 3H9z',
  processes:'M6 6h12v12H6z M9 9h6v6H9z M9 2v4 M15 2v4 M9 18v4 M15 18v4 M2 9h4 M2 15h4 M18 9h4 M18 15h4',
  realtime:'M3 3v18h18 M6 16l4-6 4 3 6-8',
  vpn:'M8 14l-1 1a3 3 0 0 1-4-4l4-4a3 3 0 0 1 4 0 M16 10l1-1a3 3 0 0 1 4 4l-4 4a3 3 0 0 1-4 0 M8 16l8-8',
  amneziawg:'M12 2L5 21 M12 2l7 19 M3 15l18-3 M12 5a8 8 0 1 0 0 16 8 8 0 0 0 0-16',
  menu:'M4 6h16 M4 12h16 M4 18h16',
  close:'M6 6l12 12 M6 18L18 6',
  refresh:'M20 4v6h-6 M20 10a8 8 0 1 0-2.3 7.7',
  palette:'M12 3a9 9 0 0 0 0 18h2a2 2 0 0 0 1-4 2 2 0 0 1 1-4h2a3 3 0 0 0 3-3 9 9 0 0 0-9-7 M7 8h.01 M12 6h.01 M17 8h.01 M6 13h.01',
  logout:'M9 4H3v16h6 M9 12h12 M17 8l4 4-4 4',
  external:'M14 3h7v7 M21 3L10 14 M10 3H3v18h18v-7',
  router:'M4 11h16v9H4z M7 15h.01 M11 15h.01 M17 11V5 M7 11V7 M14 3a6 6 0 0 1 6 6',
  default:'M5 5h14v14H5z M9 9h6 M9 13h6'
 };
 const aliases={interfaces:'network','package-manager':'software',packages:'software',routesj:'routes',nftables:'firewall',channel_analysis:'wireless',awg:'amneziawg',doh:'dns',attendedsysupgrade:'flash',dashboard:'overview',strategy:'firewall',hosts:'dns',statistics:'realtime',monitoring:'realtime'};
 const wifiShapes={
  round:'M3 8a13 13 0 0 1 18 0 M7 13a7 7 0 0 1 10 0 M12 18a1 1 0 1 0 0 2 1 1 0 0 0 0-2',
  ink:'M3 9V6h18v3 M7 14v-3h10v3 M11 18h2v2h-2z',
  retro:'M3 9V8h1V7h1V6h2V5h3V4h4v1h3v1h2v1h1v1h1v1 M7 14v-1h1v-1h2v-1h4v1h2v1h1v1 M11 18h2v2h-2z',
  minimal:'M4 9a11 11 0 0 1 16 0 M8 14a6 6 0 0 1 8 0 M12 18a1 1 0 1 0 0 2 1 1 0 0 0 0-2'
 };
 const deviceShapes={
  ethernet:'M4 3h16v14h-4v4H8v-4H4z M8 3v5 M12 3v5 M16 3v5',
  bridge:'M8 4h8v5H8z M12 9v5 M5 18v-4h14v4 M3 18h4v3H3z M17 18h4v3h-4z',
  tunnel:'M3 5h6v14H3z M15 5h6v14h-6z M9 12h6'
 };
 const signalLevels={'signal-none':0,'signal-000-000':0,'signal-000-025':1,'signal-025-050':2,'signal-050-075':3,'signal-075-100':4};
 const signalBars=['M3 18h3v3H3z','M8 14h3v7H8z','M13 10h3v11h-3z','M18 6h3v15h-3z'];
 function icon(name) {
  const key=Object.prototype.hasOwnProperty.call(aliases,name)?aliases[name]:name, ns='http://www.w3.org/2000/svg', svg=document.createElementNS(ns,'svg');
  for(const [k,v] of Object.entries({viewBox:'0 0 24 24',class:'zmw-i',fill:'none',stroke:'currentColor','stroke-width':'1.7','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true',focusable:'false'}))svg.setAttribute(k,v);
  const device=key.replace(/_disabled$/,'').replace(/^port_(up|down)$/,'ethernet');
  const wifi=device==='wifi'||key==='wireless';
  const shape=Object.prototype.hasOwnProperty.call(deviceShapes,device)?deviceShapes[device]:null;
  function add(d,cls){const path=document.createElementNS(ns,'path');path.setAttribute('d',d);if(cls)path.setAttribute('class',cls);svg.appendChild(path);}
  if(shape || wifi){
   for(const variant of ['round','ink','retro','minimal'])add(wifi?wifiShapes[variant]:shape,'prism-icon-'+variant);
   if(/_disabled$|^port_down$/.test(key))add(device==='tunnel'?'M10 10l4 4 M14 10l-4 4':'M17 2l5 5 M22 2l-5 5','prism-icon-cross');
  }else if(Object.prototype.hasOwnProperty.call(signalLevels,key)){
   const level=signalLevels[key];
   signalBars.forEach((d,i)=>add(d,'prism-signal-bar'+(i<level?' prism-signal-active':'')));
   if(!level)add('M3 3l5 5 M8 3L3 8','prism-icon-cross');
  }else add(Object.prototype.hasOwnProperty.call(paths,key)?paths[key]:paths.default);
  return svg;
 }
 const states=new WeakMap();
 function setOpen(el,open,animate=true) {
  const previous=states.get(el), start=el.getBoundingClientRect().height;
  if(previous?.animation) previous.animation.cancel();
  const state={open}; states.set(el,state); el.dataset.expanded=String(open);
  const summary=el.querySelector('summary'), list=el.querySelector('.prism-group-items');
  if(!open && list.contains(document.activeElement)) summary.focus();
  list.inert=!open;
  if(!animate || window.PrismMotion.reduced()) { el.open=open;el.style.overflow='';return; }
  el.open=true;
  const end=open?el.getBoundingClientRect().height:summary.getBoundingClientRect().height;
  el.style.overflow='hidden';
  state.animation=window.PrismMotion.animate(el,[{height:start+'px'},{height:end+'px'}],()=>{
   if(states.get(el)!==state)return;el.open=open;el.style.overflow='';state.animation=null;
  });
 }
 function bind(el) {
  if(el.dataset.prismBound)return;el.dataset.prismBound='1';
  el.querySelector('summary').addEventListener('click',e=>{
   e.preventDefault();const open=!(states.get(el)?.open ?? el.open);
   if(open)el.parentElement.querySelectorAll(':scope > .prism-group').forEach(other=>{if(other!==el && (states.get(other)?.open ?? other.open))setOpen(other,false);});
   setOpen(el,open);
  });
 }
 function group(title,id,items,active) {
  const details=document.createElement('details');details.className='prism-group';details.dataset.group=id;details.open=!!active;
  const summary=document.createElement('summary');summary.className='prism-group-heading';
  const ico=document.createElement('span');ico.className='zmw-nav-ico';ico.appendChild(icon(id));
  const label=document.createElement('span');label.className='zmw-nav-label';label.textContent=title;
  const arrow=document.createElement('span');arrow.className='prism-chevron';arrow.setAttribute('aria-hidden','true');
  summary.append(ico,label,arrow);details.appendChild(summary);
  const list=document.createElement('div');list.className='prism-group-items';items.forEach(item=>list.appendChild(item));details.appendChild(list);
  bind(details);
  return details;
 }
 function reveal(nav) {
  const current=nav.querySelector('[aria-current="page"]');
  nav.querySelectorAll('.prism-group').forEach(g=>{bind(g);setOpen(g,!!current && g.contains(current),false);});
 }
 window.PrismNav={icon,group,reveal};
})();
