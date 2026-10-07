import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
for(const f of walk('htdocs').filter(f=>f.endsWith('.js'))) {
 const s=fs.readFileSync(f,'utf8');
 if(f.endsWith('menu-prism.js'))new Function(s);else new vm.Script(s,{filename:f});
}
let change, finished=0, called=0;
const preference={matches:true,addEventListener:(_,fn)=>change=fn};
const ctx={window:{},document:{documentElement:{}},matchMedia:()=>preference,getComputedStyle:()=>({getPropertyValue:()=>''})};
vm.runInNewContext(fs.readFileSync('htdocs/luci-static/prism/motion.js','utf8'),ctx);
const element={animate:()=>{called++;return {finish(){finished++;this.onfinish();}};}};
let done=0;
assert.equal(ctx.window.PrismMotion.animate(element,[],()=>done++),null);
assert.equal(called,0);assert.equal(done,1);
preference.matches=false;
ctx.window.PrismMotion.animate(element,[],()=>done++);
change({matches:true});
assert.equal(finished,1);assert.equal(done,2);
execFileSync(process.execPath,['scripts/check-menu.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-package.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-icons.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-runtime.mjs'],{stdio:'inherit'});
console.log('PASS: JavaScript syntax, reduced motion and active-animation completion.');
