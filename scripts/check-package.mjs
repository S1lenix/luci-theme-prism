import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const {version}=JSON.parse(fs.readFileSync('package.json','utf8'));
const media='htdocs/luci-static/prism';
const header=fs.readFileSync('ucode/template/themes/prism/header.ut','utf8');
assert.match(fs.readFileSync('Makefile','utf8'),new RegExp('PKG_VERSION:='+version.replaceAll('.','\\.')));
assert.ok(header.includes('v'+version),'header version matches package');
assert.ok(fs.readFileSync('update.sh','utf8').includes('Prism '+version+' updated'),'update version matches package');
for(const match of header.matchAll(/(?:src|href)="\{\{ media \}\}\/([^"?]+)/g)) {
 assert.ok(fs.statSync(path.join(media,match[1])).size>0,'header asset exists: '+match[1]);
}
for(const match of fs.readFileSync(media+'/fonts.css','utf8').matchAll(/url\(([^)]+)\)/g)) {
 assert.ok(!/^https?:/.test(match[1]),'fonts stay local');
 assert.ok(fs.statSync(path.join(media,match[1])).size>0,'font exists: '+match[1]);
}
for(const file of ['LICENSE','NOTICE.md','fonts/onest-OFL.txt','fonts/unbounded-OFL.txt','fonts/ibmplexsans-OFL.txt']) {
 assert.ok(fs.statSync(file.startsWith('fonts/')?path.join(media,file):file).size>0,'license exists: '+file);
}
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
for(const file of [...walk('htdocs'),...walk('ucode'),...walk('root')].filter(f=>/\.(js|css|ut)$/.test(f))) {
 const source=fs.readFileSync(file,'utf8');
 assert.ok(!/C:[\\/]|192\.168\.1\.1|Xiaomi AX3600|S1len|codex-clipboard|OneDrive/.test(source),'no private fixture data: '+file);
}
console.log('PASS: release versions, local assets, font licenses and generic router source.');
