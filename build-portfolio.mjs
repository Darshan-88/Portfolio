import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, lstatSync, readFileSync, writeFileSync, cpSync, rmSync, mkdirSync } from 'node:fs';
import { join, dirname, basename, resolve } from 'node:path';
import { tmpdir } from 'node:os';
const archive = resolve('portfolio-careerai.zip');
const temp = mkdtempSync(join(tmpdir(), 'portfolio-'));
const out = resolve('dist');
const oldUrl = 'https://career-ai-zeta-dusky.vercel.app/';
const newUrl = 'https://career-cgo7qkdzp-darshan-7df3.vercel.app/';
const oldForce = /SPLAT_FORCE:(3500|2275)(?=,COLOR_UPDATE_SPEED:18)/g;
const oldColor = /r:n\*\.(15|0975),g:r\*\.\1,b:i\*\.\1/g;
function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name), st = lstatSync(p);
    if (st.isSymbolicLink()) throw new Error('Unexpected symbolic link: ' + p);
    return st.isDirectory() ? walk(p) : [p];
  });
}
function patch(js) {
  const counts = { url: js.split(oldUrl).length - 1, force: [...js.matchAll(oldForce)].length, color: [...js.matchAll(oldColor)].length };
  if (counts.url < 1 || counts.force !== 1 || counts.color !== 1) throw new Error('Unexpected source configuration; no release: ' + JSON.stringify(counts));
  const updated = js.replaceAll(oldUrl,newUrl).replace(oldForce,'SPLAT_FORCE:1933.75').replace(oldColor,'r:n*.082875,g:r*.082875,b:i*.082875');
  const check = join(temp,'syntax-check.mjs');
  writeFileSync(check,updated);
  execFileSync(process.execPath,['--check',check],{stdio:'inherit'});
  rmSync(check);
  return updated;
}
try {
  const names = execFileSync('unzip',['-Z1',archive],{encoding:'utf8'}).trim().split('\n');
  if (names.some(n => n.startsWith('/') || n.includes('\\') || n.split('/').includes('..'))) throw new Error('Unsafe archive paths');
  const archiveInfo = execFileSync('unzip',['-Z','-l',archive],{encoding:'utf8'});
  if (/^l[rwx-]{9}\s/m.test(archiveInfo)) throw new Error('Unexpected symlinks in archive');
  execFileSync('unzip',['-q',archive,'-d',temp],{stdio:'inherit'});
  const files = walk(temp);
  const candidates = files.filter(p => /^(index|portfolio-preview)\.html$/i.test(basename(p))).filter(p => /data:text\/javascript;base64,/.test(readFileSync(p,'utf8')));
  if (candidates.length !== 1) throw new Error('Expected exactly one bundled portfolio HTML, found ' + candidates.length);
  const source = candidates[0];
  const html = readFileSync(source,'utf8');
  const re = /data:text\/javascript;base64,([^"']+)/g;
  const matches = [...html.matchAll(re)];
  if (matches.length !== 1) throw new Error('Unexpected bundle structure');
  const js = Buffer.from(matches[0][1],'base64').toString('utf8');
  const updated = patch(js);
  const result = html.replace(re, 'data:text/javascript;base64,' + Buffer.from(updated,'utf8').toString('base64'));
  rmSync(out,{recursive:true,force:true});
  mkdirSync(out,{recursive:true});
  cpSync(dirname(source),out,{recursive:true});
  writeFileSync(join(out,'index.html'),result);
  console.log('Portfolio source verified and patched; smoke force 1933.75; color multiplier 0.082875; CareerAI link updated.');
} finally { rmSync(temp,{recursive:true,force:true}); }
