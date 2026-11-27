import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, mkdtempSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
const archive=resolve('portfolio-careerai.zip');
const bytes=readFileSync(archive);
const sha=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
if(sha!=='91b27e81f09c05b10fc05951e07bedf2e67f2fc3')throw Error('Archive differs from reviewed source');
const temp=mkdtempSync(join(tmpdir(),'portfolio-'));
const root=join(temp,'portfolio');
const out=resolve('dist');
function replace(path,before,after){const file=join(root,path);const s=readFileSync(file,'utf8');if(s.split(before).length!==2)throw Error('Unexpected source: '+path);writeFileSync(file,s.replace(before,after));}
try {
 execFileSync('unzip',['-q',archive,'-d',temp],{stdio:'inherit'});
 replace('src/App.jsx','SPLAT_FORCE={4600}','SPLAT_FORCE={2541}');
 replace('src/components/SplashCursor.jsx','return { r: r * 0.20, g: g * 0.20, b: b * 0.20 };','return { r: r * 0.1105, g: g * 0.1105, b: b * 0.1105 };');
 replace('src/data/portfolioData.js','https://career-ai-zeta-dusky.vercel.app/','https://career-cgo7qkdzp-darshan-7df3.vercel.app/');
 const pdfPath=join(root,'public/Resume.PDF'),pdf=readFileSync(pdfPath);
 if(createHash('sha256').update(pdf).digest('hex')!=='9e2c9fb8d4d79c14e3021f36647774376f7e5b715245bd64763d27f8d784c729')throw Error('Unexpected resume source');
 const pdfDelta=Buffer.from('CjU1IDAgb2JqCjw8L0E8PC9TL1VSSS9VUkkoaHR0cHM6Ly9jYXJlZXItY2dvN3FrZHpwLWRhcnNoYW4tN2RmMy52ZXJjZWwuYXBwLyk+Pi9SZWN0WzQ3My44OTggNjQxLjA5NyA1MTkuNDEyIDY1Mi4wNTZdL0JTPDwvVyAwPj4vU3VidHlwZS9MaW5rL05NKGZpdHotTDApPj4KZW5kb2JqCgoxMDEgMCBvYmoKPDwvVHlwZS9YUmVmL0luZm8gMSAwIFIvUm9vdCA1IDAgUi9JRFs8NjlDMzVGRDU4OTI3RTlGRTU5MDI1MzFGMjY4MUVGMzg+PEUyNUJEM0VGMERCNTNBNzUzRjFFQTBFQTU4RUU0QTdDPl0vU2l6ZSAxMDIvUHJldiAyMTYvV1sxIDQgMV0vSW5kZXhbNTUgMSAxMDEgMV0vTGVuZ3RoIDEyPj4Kc3RyZWFtCgEAAmnBAAEAAmpkAAplbmRzdHJlYW0KZW5kb2JqCgpzdGFydHhyZWYKMTU4MzA4CiUlRU9GCg==','base64');
 writeFileSync(pdfPath,Buffer.concat([pdf,pdfDelta]));
 execFileSync('npm',['ci','--no-audit','--no-fund'],{cwd:root,stdio:'inherit'});
 execFileSync('npm',['run','build'],{cwd:root,stdio:'inherit'});
 rmSync(out,{recursive:true,force:true});
 mkdirSync(out,{recursive:true});
 cpSync(join(root,'dist'),out,{recursive:true});
 console.log('Reviewed portfolio archive built; force 2541, color 0.1105, CareerAI project and downloadable resume link updated.');
} finally {rmSync(temp,{recursive:true,force:true});}
