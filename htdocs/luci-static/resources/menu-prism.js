'use strict';
'require baseclass';
'require ui';
'require rpc';
'require poll';

const callInfo = rpc.declare({ object: 'system', method: 'info', expect: {} });

function icon(name) { return window.PrismNav.icon(name); }

return baseclass.extend({
 __init__() {
  if (document.querySelector('input[name="luci_password"]')) return;
  ui.menu.load().then(tree=>this.render(tree)).catch(error=>{
   const nav=document.querySelector('#topmenu');
   if(nav) nav.appendChild(E('p',{'class':'lz-menu-error'},[_('Unable to load the menu') + ': ' + error.message]));
  });
  const update=()=>callInfo().then(info=>{
   const mem=info.memory, output=document.querySelector('#lz-memory-value'), bar=document.querySelector('#lz-memory-bar');
   if(mem && mem.total && output && bar) {
    const free = mem.available != null ? mem.available : (mem.free||0)+(mem.buffered||0)+(mem.cached||0);
    const used=Math.max(0,mem.total-free), percent=Math.min(100,Math.round(used/mem.total*100));
    output.textContent=Math.round(used/1048576)+' / '+Math.round(mem.total/1048576)+' MB';bar.style.width=percent+'%';
    bar.parentElement.setAttribute('aria-valuenow',percent);
   }
   const uptime=document.querySelector('#lz-uptime');
   if(uptime && info.uptime!=null) uptime.textContent='%t'.format(info.uptime);
  }).catch(()=>{});
  poll.add(update,10); update();
 },
 render(tree) {
  this.renderModeMenu(tree);
  let node=tree, path=[];
  for(let i=0;i<3 && node;i++) { const part=L.env.dispatchpath[i]; if(!part) break; node=node.children?.[part];path.push(part); }
  if(node && path.length===3) this.renderTabMenu(node,path.join('/'),0);
 },
 renderModeMenu(tree) {
  const modes=ui.menu.getChildren(tree), modesEl=document.querySelector('#modemenu');
  modes.forEach((child,index)=>{
   const active=L.env.requestpath.length ? child.name===L.env.requestpath[0] : index===0;
   if(modesEl) modesEl.appendChild(E('li',{'class':active?'active':''},[E('a',{href:L.url(child.name)},[_(child.title)])]));
   if(active) this.renderMainMenu(child,child.name);
  });
  if(modesEl && modes.length>1) modesEl.style.display='';
 },
 renderMainMenu(tree,base) {
  const nav=document.querySelector('#topmenu'); if(!nav) return;
  const dispatch=L.env.dispatchpath;
  ui.menu.getChildren(tree).forEach(group=>{
   const children=ui.menu.getChildren(group), path=base+'/'+group.name;
   if(children.length) {
    const items=children.map(child=>this.item(path+'/'+child.name,_(child.title),child.name,dispatch[1]===group.name && dispatch[2]===child.name));
    nav.appendChild(window.PrismNav.group(_(group.title),group.name,items,dispatch[1]===group.name));
   } else if(group.name!=='logout') nav.appendChild(this.item(path,_(group.title),group.name,dispatch[1]===group.name));
   else {
    const logout=document.querySelector('.zmw-logout');
    if(logout) {logout.href=L.url(base,group.name);logout.hidden=false;}
   }
  });
  nav.style.display='';
  const current=nav.querySelector('[aria-current="page"]');
  if(current) {
   const title=document.querySelector('#lz-page-title');
   if(title && !title.textContent.trim()) title.textContent=current.textContent;
  }
 },
 item(path,title,group,active) {
  const attrs={'class':'zmw-nav-item'+(active?' zmw-active':''),href:L.url(path)};
  if(active) attrs['aria-current']='page';
  return E('a',attrs,[E('span',{'class':'zmw-nav-ico'},[icon(group)]),E('span',{'class':'zmw-nav-label'},[title])]);
 },
 renderTabMenu(tree,url,level) {
  const container=document.querySelector('#tabmenu'), ul=E('ul',{'class':'tabs'});if(!container) return;
  let activeNode;
  ui.menu.getChildren(tree).forEach(child=>{
   const active=L.env.dispatchpath[3+level]===child.name;
   const attr={href:L.url(url,child.name)};if(active) attr['aria-current']='page';
   ul.appendChild(E('li',{'class':'tabmenu-item-'+child.name+(active?' active':'')},[E('a',attr,[_(child.title)])]));
   if(active) activeNode=child;
  });
  if(!ul.children.length) return;
  container.appendChild(ul);container.style.display='';
  if(activeNode) this.renderTabMenu(activeNode,url+'/'+activeNode.name,level+1);
 }
});
