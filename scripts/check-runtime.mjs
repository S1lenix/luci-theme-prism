import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../htdocs/luci-static/prism');

// Cancellation can precede its event when reduced motion is enabled mid-frame.
let change, duration;
const preference={matches:false,addEventListener:(_,fn)=>change=fn};
const motion={window:{},document:{documentElement:{}},matchMedia:()=>preference,getComputedStyle:()=>({getPropertyValue:name=>name==='--prism-duration'?'0':''})};
vm.runInNewContext(fs.readFileSync(path.join(base,'motion.js'),'utf8'),motion);
const animations=[];
const animated={animate(_,options){duration=options.duration;const animation={playState:'running',finish(){this.onfinish();},cancel(){this.playState='idle';}};animations.push(animation);return animation;}};
let completed=0;
motion.window.PrismMotion.animate(animated,[],()=>completed++);
motion.window.PrismMotion.animate(animated,[],()=>completed++);
assert.equal(duration,0,'explicit zero-duration preference is retained');
animations[0].cancel();
change({matches:true});
assert.equal(completed,1,'an idle cancelled animation does not prevent the others finishing');

function element(tag,attrs={}) {
 const classes=new Set((attrs.class||'').split(' ').filter(Boolean));
 const el={tag,attrs:{...attrs},dataset:{},style:{},isConnected:true,childNodes:[],listeners:{},classList:{
  add(...names){names.forEach(name=>classes.add(name));},remove(name){classes.delete(name);},contains(name){return classes.has(name);},toggle(name,on){if(on)classes.add(name);else classes.delete(name);},[Symbol.iterator](){return classes.values();}
 },setAttribute(name,value){this.attrs[name]=String(value);},getAttribute(name){return this.attrs[name]??null;},hasAttribute(name){return name in this.attrs;},addEventListener(name,fn){this.listeners[name]=fn;},querySelector(){return null;},remove(){this.isConnected=false;},focus(){document.activeElement=this;}};
 return el;
}
const control=element('span',{'data-style':'inactive'}), content=element('div'), card=element('section');
const heading={parentElement:card,nextElementSibling:content};
control.closest=()=>heading;
control.parentElement={childNodes:[{nodeType:3,textContent:'Example section'}]};
control.firstChild={textContent:'Hide'};
const header=element('svg',{class:'zmw-i header-icon','aria-hidden':'false','aria-label':'Example icon'});
header.dataset.prismIcon='refresh';
let replaced;
header.replaceWith=svg=>{header.isConnected=false;replaced=svg;};
const native=element('img',{src:'/luci-static/resources/icons/signal-000-000.svg'});
native.before=svg=>{native.previousElementSibling=svg;};
const root=element('html');root.lang='en';root.style.setProperty=()=>{};
const document={documentElement:root,body:element('body'),readyState:'complete',querySelector:()=>null,querySelectorAll(selector){
 if(selector==='svg[data-prism-icon]:not([data-prism-rendered])')return header.isConnected?[header]:[];
 if(selector.includes('.cbi-title [data-clickable='))return control.isConnected?[control]:[];
 if(selector.startsWith('#maincontent img[src*='))return [native];
 return [];
},addEventListener(){}};
const frames=[], observers=[], mutations=[];
class ResizeObserver {constructor(callback){this.callback=callback;observers.push(this);}observe(target){this.target=target;}disconnect(){this.disconnected=true;}}
class MutationObserver {constructor(callback){mutations.push(callback);}observe(){}}
const iconRequests=[];
const runtime={document,window:{devicePixelRatio:1,addEventListener(){},PrismNav:{icon(name){iconRequests.push(name);return element('svg',{class:'zmw-i','aria-hidden':'true'});}}},localStorage:{getItem:()=>null},matchMedia:()=>({matches:false,addEventListener(){}}),ResizeObserver,MutationObserver,requestAnimationFrame:callback=>frames.push(callback)};
vm.runInNewContext(fs.readFileSync(path.join(base,'theme.js'),'utf8'),runtime);
assert.equal(replaced.dataset.prismIcon,'refresh');
assert.equal(replaced.getAttribute('aria-label'),'Example icon');
assert.equal(replaced.getAttribute('aria-hidden'),'false');
assert.equal(replaced.classList.contains('header-icon'),true,'template layout classes survive icon unification');
assert.equal(iconRequests.includes('signal-000-000'),true,'zero-quality native icons use the same factory');
assert.equal(observers.length,1);
assert.equal(observers[0].target,content);
control.isConnected=false;
native.attrs.src='/luci-static/resources/icons/plugin-specific.svg';
mutations[0]();
frames.splice(0).forEach(callback=>callback());
assert.equal(observers[0].disconnected,true,'removed polling sections release their resize observers');
assert.equal(native.previousElementSibling.isConnected,false,'unrecognized replacement icons are restored');
assert.equal(native.classList.contains('prism-original-icon'),false);
assert.equal(native.dataset.prismIcon,undefined);
assert.equal(iconRequests.filter(name=>name==='refresh').length,1,'decorating again does not duplicate template icons');
console.log('PASS: cancelled animation, zero duration, icon accessibility/fallback and polling observer cleanup.');
