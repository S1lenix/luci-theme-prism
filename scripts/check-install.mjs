import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

const shell=process.env.PRISM_TEST_SHELL||'sh';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'prism-install-check-'));
const unix=file=>file.replaceAll('\\','/');
const write=(file,value)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,value);};
function prepare(name,script) {
 const dir=path.join(root,name),source=path.join(dir,'source');
 fs.cpSync('htdocs',path.join(source,'htdocs'),{recursive:true});
 fs.cpSync('ucode',path.join(source,'ucode'),{recursive:true});
 let content=fs.readFileSync(script,'utf8');
 for(const original of ['/www','/usr/share/ucode','/usr/lib/opkg','/lib/apk','/etc','/tmp/prism-backup.']) {
  content=content.replaceAll(original,unix(path.join(dir,original.slice(1))));
 }
 content=content.replace('set -eu','set -eu\nid() { printf \'0\\n\'; }');
 const file=path.join(source,script);write(file,content);
 write(path.join(dir,'usr/share/ucode/luci/template/themes/bootstrap/header.ut'),'Bootstrap');
 write(path.join(dir,'www/luci-static/resources/.keep'),'');
 write(path.join(dir,'etc/config/luci'),'LuCI');
 fs.mkdirSync(path.join(dir,'tmp'),{recursive:true});
 return {dir,source,file};
}
const run=file=>spawnSync(shell,[unix(file)],{encoding:'utf8'});
try {
 const missing=prepare('missing','install.sh');
 fs.unlinkSync(path.join(missing.source,'htdocs/luci-static/prism/base.css'));
 const result=run(missing.file);
 assert.equal(result.error,undefined,'shell available');
 assert.notEqual(result.status,0,'incomplete archive rejected');
 assert.match(result.stderr,/Missing file:/);
 assert.equal(fs.existsSync(path.join(missing.dir,'www/luci-static/prism')),false,'preflight performs no installation');

 for(const script of ['install.sh','update.sh','uninstall.sh']) {
  for(const manager of ['usr/lib/opkg/info/luci-theme-prism.control','lib/apk/packages/luci-theme-prism.list']) {
   const managed=prepare(script+'-'+manager.split('/')[0],script);
   write(path.join(managed.dir,manager),'managed');
   const media=path.join(managed.dir,'www/luci-static/prism/base.css');
   write(media,'keep existing package');
   const result=run(managed.file);
   assert.notEqual(result.status,0,'archive script rejects managed package');
   assert.match(result.stderr,/package-managed/);
   assert.equal(fs.readFileSync(media,'utf8'),'keep existing package');
  }
 }

 const makefile=fs.readFileSync('Makefile','utf8');
 const prerm=makefile.match(/define Package\/luci-theme-prism\/prerm\n([\s\S]*?)\nendef/)[1].replaceAll('$$','$');
 function removal(name,active,env={}) {
  const dir=path.join(root,name),log=path.join(dir,'uci.log'),script=path.join(dir,'remove.sh');
  write(script,`#!/bin/sh\nuci() {\n if [ "$1" = -q ] && [ "$2" = get ]; then printf '%s\\n' '${active}'; else printf '%s\\n' "$*" >> '${unix(log)}'; fi\n}\n${prerm}`);
  const result=spawnSync(shell,[unix(script)],{encoding:'utf8',env:{...process.env,...env}});
  assert.equal(result.status,0,'removal hook succeeds');
  return fs.existsSync(log)?fs.readFileSync(log,'utf8'):'';
 }
 assert.match(removal('active','/luci-static/prism'),/set luci.main.mediaurlbase=\/luci-static\/bootstrap/);
 assert.doesNotMatch(removal('other','/luci-static/other'),/set luci.main.mediaurlbase/);
 assert.equal(removal('upgrade','/luci-static/prism',{PKG_UPGRADE:'1'}),'','upgrade preserves active theme');
 assert.equal(removal('offline','/luci-static/prism',{IPKG_INSTROOT:unix(root)}),'','offline install does not change host configuration');

 const rollback=prepare('rollback','update.sh');
 const media=path.join(rollback.dir,'www/luci-static/prism');
 const templates=path.join(rollback.dir,'usr/share/ucode/luci/template/themes/prism');
 const menu=path.join(rollback.dir,'www/luci-static/resources/menu-prism.js');
 write(path.join(media,'base.css'),'previous CSS');write(path.join(templates,'header.ut'),'previous template');write(menu,'previous menu');
 // Fail the forward menu copy once, after the new media files have been copied.
 let update=fs.readFileSync(rollback.file,'utf8');
 update=update.replace('set -eu',`set -eu
 failed=0
 cp() {
  if [ "$failed" = 0 ] && [ "$1" = htdocs/luci-static/resources/menu-prism.js ]; then
   failed=1; return 1
  fi
  command cp "$@"
 }`);
 fs.writeFileSync(rollback.file,update);
 const failure=run(rollback.file);
 assert.notEqual(failure.status,0,'failed update reports error');
 assert.match(failure.stderr,/Restoring from/);
 assert.equal(fs.readFileSync(path.join(media,'base.css'),'utf8'),'previous CSS');
 assert.equal(fs.readFileSync(path.join(templates,'header.ut'),'utf8'),'previous template');
 assert.equal(fs.readFileSync(menu,'utf8'),'previous menu');
 console.log('PASS: preflight, managed-package guards, removal fallback, upgrade preservation and update rollback.');
} finally {
 assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir())+path.sep+'prism-install-check-'));
 fs.rmSync(root,{recursive:true,force:true});
}
