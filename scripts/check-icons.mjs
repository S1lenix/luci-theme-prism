import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

function element(tag) {
 return {tag,attrs:{},children:[],setAttribute(k,v){this.attrs[k]=String(v);},appendChild(child){this.children.push(child);return child;}};
}
const context={document:{createElementNS:(_,tag)=>element(tag)},window:{}};
vm.runInNewContext(fs.readFileSync('htdocs/luci-static/prism/navigation.js','utf8'),context);
const icon=context.window.PrismNav.icon;
const paths=svg=>svg.children.map(path=>path.attrs.d);
const keys=['status','system','network','services','overview','logs','software','wireless','firewall','routes','dhcp','dns','diagnostics','admin','startup','crontab','flash','reboot','leds','processes','realtime','vpn','amneziawg','ethernet','ethernet_disabled','bridge','tunnel','tunnel_disabled','wifi','wifi_disabled','port_up','port_down','signal-none','signal-000-000','signal-000-025','signal-025-050','signal-050-075','signal-075-100','menu','close','refresh','palette','logout','router','external'];

for(const key of keys) {
 const svg=icon(key);
 assert.equal(svg.tag,'svg');
 assert.equal(svg.attrs.viewBox,'0 0 24 24',`${key}: shared viewport`);
 assert.equal(svg.attrs.stroke,'currentColor',`${key}: theme color`);
 assert.equal(svg.attrs['stroke-width'],'1.7',`${key}: shared base weight`);
 assert.equal(svg.attrs['aria-hidden'],'true');
 assert.equal(svg.attrs.focusable,'false');
 assert.ok(svg.children.length,`${key}: nonempty drawing`);
 for(const path of svg.children) {
  assert.equal(path.tag,'path');
  assert.match(path.attrs.d,/^[Mm][-\d. ,a-z]+$/i,`${key}: valid path commands and finite coordinates`);
  assert.equal(path.attrs.stroke,undefined,`${key}: no forced accent color`);
  assert.equal(path.attrs['stroke-width'],undefined,`${key}: weight follows theme`);
 }
 assert.notDeepEqual(paths(svg),paths(icon('unknown-plugin')),`${key}: supported drawing, not fallback`);
}

for(const [enabled,disabled] of [['wifi','wifi_disabled'],['ethernet','ethernet_disabled'],['tunnel','tunnel_disabled'],['port_up','port_down']]) {
 const base=icon(enabled),inactive=icon(disabled);
 assert.deepEqual(paths(inactive).slice(0,4),paths(base),`${enabled}: identical proportions across connection states`);
 assert.equal(inactive.children.length,5);
 assert.equal(inactive.children[4].attrs.class,'prism-icon-cross');
 assert.deepEqual(base.children.map(path=>path.attrs.class),['round','ink','retro','minimal'].map(name=>'prism-icon-'+name));
}
assert.deepEqual(paths(icon('wifi')),paths(icon('wireless')),'sidebar and device Wi-Fi share drawings');
assert.deepEqual(paths(icon('channel_analysis')),paths(icon('wireless')),'channel menu uses Wi-Fi');
assert.deepEqual(paths(icon('awg')),paths(icon('amneziawg')));
assert.notDeepEqual(paths(icon('logout')),paths(icon('admin')),'logout must not display a lock');

for(const [key,level] of [['signal-none',0],['signal-000-000',0],['signal-000-025',1],['signal-025-050',2],['signal-050-075',3],['signal-075-100',4]]) {
 const svg=icon(key),bars=svg.children.filter(path=>path.attrs.class.includes('prism-signal-bar'));
 assert.equal(bars.length,4,`${key}: shared signal silhouette`);
 assert.equal(bars.filter(path=>path.attrs.class.includes('prism-signal-active')).length,level);
 assert.deepEqual(bars.map(path=>path.attrs.d),paths(icon('signal-075-100')));
}
for(const key of ['unknown-plugin','constructor','__proto__','toString','signal-future']) {
 assert.deepEqual(paths(icon(key)),paths(icon('default')),`${key}: safe generic fallback`);
}
assert.notEqual(icon('wifi'),icon('wifi'),'each placement receives its own SVG node');
console.log('PASS: icon viewport, theme colors, all variants, connection states, signal levels and plugin fallbacks.');
