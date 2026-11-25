import {execFile, spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {access, mkdtemp, rename, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {setTimeout as delay} from 'node:timers/promises';

const require = createRequire(import.meta.url);
const art = require('./art.js');
const {duration} = require('./motion.js');
const exec = promisify(execFile);
const supportedShapes = new Set([art.character.shape,'square','wide','petal','step','pill']);
const colors = new Set(art.colors.map(([value])=>value));
const faces = new Set(art.faces.map(([value])=>value));
const accessories = new Set(art.kits.map(([value])=>value));
const legends = '<legends>'+art.keyLabels.map(art.legend).join('')+'</legends>';
let built, child;
let queue = Promise.resolve();

export function framePack(pet) {
  const clips = [['idle',144],...Object.entries(duration).filter(([k])=>k!=='special').map(([k, ms])=>[k,Math.ceil(ms*.03)+(k==='sleep'?36:1)])];
  return '<pet office="'+(pet.office===true?'true':'false')+'" keys="'+(pet.desktopKeys!==false?'true':'false')+'">'+legends+clips.map(([id,count])=>'<clip id="'+id+'">'+Array.from({length:count},
    (_,i)=>art.make(pet,pet.key,id,i*1000/30)).join('')+'</clip>').join('')+'</pet>';
}

async function compile() {
  const fw = join(process.env.WINDIR || 'C:/Windows','Microsoft.NET','Framework64','v4.0.30319');
  const compiler = join(fw,'csc.exe');
  const refs = ['WindowsBase.dll','PresentationCore.dll','PresentationFramework.dll'];
  await access(compiler);
  const dir = await mkdtemp(join(tmpdir(),'emotion-keycaps-'));
  const executable = join(dir,'desktop-pet.exe');
  try {
    await exec(compiler, ['/nologo','/codepage:65001','/target:winexe','/optimize+','/out:'+executable,
      ...['System.Xaml.dll','System.Windows.Forms.dll','System.Drawing.dll'].map(x=>'/reference:'+join(fw,x)),
      ...refs.map(x=>'/reference:'+join(fw,'WPF',x)),
      ...['desktop-pet.cs','office-companion.cs','pet-bubble.cs'].map(file=>fileURLToPath(new URL('./'+file,import.meta.url)))], {windowsHide:true});
    return {executable, sprites:join(dir,'pet.xml')};
  } catch(error) {
    await rm(dir,{recursive:true,force:true});
    throw error;
  }
}

export function desktopRoute(req,res,port) {
  const reply=(code,data)=>res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}).end(JSON.stringify(data));
  if(req.method!=='POST'||!['http://localhost:', 'http://127.0.0.1:'].some(base=>req.headers.origin===base+port)||
    req.headers['x-keycap-desktop']!=='1'||req.headers['content-type']!=='application/json') {
    reply(403,{error:'request'});return;
  }
  if(process.platform!=='win32'){reply(501,{error:'windows'});return;}
  let raw='', tooLong=false;
  req.setEncoding('utf8');
  req.on('data',chunk=>{if(tooLong)return;raw+=chunk;if(raw.length>1024){tooLong=true;raw='';}});
  req.on('end',()=>{
    let pet;
    try {
      const v=JSON.parse(raw);
      if(!v||!supportedShapes.has(v.shape)||!colors.has(v.color)||!faces.has(v.face)||!accessories.has(v.accessory))throw Error('preset');
      pet={...art.character,color:v.color,face:v.face,accessory:v.accessory,office:v.office===true,desktopKeys:v.desktopKeys!==false};
    }catch{reply(400,{error:'preset'});return;}
    const launch=queue.then(async()=>{
      built??=compile().catch(e=>{built=null;throw e;});
      const {executable,sprites}=await built;
      await writeFile(sprites+'.tmp',framePack(pet),'utf8');
      await rename(sprites+'.tmp',sprites);
      if(child&&child.exitCode===null&&child.signalCode===null)return;
      const ready=sprites+'.ready';
      await rm(ready,{force:true});
      const proc=spawn(executable,[sprites],{stdio:'ignore',detached:true});
      let spawnError;
      proc.once('error',e=>{spawnError=e;});
      for (let i=0;;i++) {
        if(spawnError)throw spawnError;
        if(proc.exitCode!==null||proc.signalCode!==null)throw Error('Desktop pet exited during startup');
        if(await access(ready).then(()=>true,()=>false))break;
        if(i===80){proc.kill();throw Error('Desktop pet did not draw its first frame');}
        await delay(100);
      }
      child=proc;proc.unref();
    });
    queue=launch.catch(()=>{});
    launch.then(()=>reply(200,{ok:true}),error=>{console.error('Desktop launch failed:',error);reply(500,{error:'launch'});});
  });
}
