import {execFile, spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import {access, mkdtemp, readFile, rename, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {setTimeout as delay} from 'node:timers/promises';

const require = createRequire(import.meta.url);
const art = require('./art.js');
const {duration,variantCount,peekBox} = require('./motion.js');
const exec = promisify(execFile);
const supportedShapes = new Set([art.character.shape,'square','wide','petal','step','pill']);
const faces = new Set(art.faces.map(([value])=>value));
const accessories = new Set(art.kits.map(([value])=>value));
let built, child;
let queue = Promise.resolve();

export function framePack(pet,request='',reveal=true) {
  const webActions=new Set(['special','cook','taste','read','listen']);
  const clips = [['idle',144],...Object.entries(duration).filter(([k])=>!webActions.has(k)).map(([k, ms])=>[k,Math.ceil(ms*.03)+(k==='sleep'?36:1)])];
  const {legend:legendColor}=art.partColors(pet);
  const legends='<legends>'+art.keyLabels.map(label=>art.legend(label,legendColor)).join('')+'</legends>';
  const boxBounds=[peekBox.left,peekBox.top,peekBox.right-peekBox.left,peekBox.bottom-peekBox.top].join(' ');
  return '<pet request="'+art.esc(request)+'" reveal="'+reveal+'" office="'+(pet.office===true?'true':'false')+'" keys="'+(pet.desktopKeys!==false?'true':'false')+'" box="'+boxBounds+'">'+legends+
    clips.flatMap(([id,count])=>Array.from({length:variantCount(id)},(_,variant)=>{
      const clipId=variant===0?id:id+':'+variant;
      return '<clip id="'+clipId+'">'+Array.from({length:count},
        (_,i)=>art.make(pet,pet.key,id,i*1000/30,false,variant)).join('')+'</clip>';
    })).join('')+'</pet>';
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

export function desktopRoute(req,res,port,updateOutfit=false) {
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
      if(!v||!supportedShapes.has(v.shape)||!art.isHex(v.color)||!faces.has(v.face)||!accessories.has(v.accessory))throw Error('preset');
      pet={...art.character,color:v.color,face:v.face,accessory:v.accessory,
        palette:art.cleanPalette(v.palette),office:v.office===true,desktopKeys:v.desktopKeys!==false};
    }catch{reply(400,{error:'preset'});return;}
    const launch=queue.then(async()=>{
      const running=()=>child&&child.exitCode===null&&child.signalCode===null;
      if(updateOutfit&&!running())return false;
      built??=compile().catch(e=>{built=null;throw e;});
      const {executable,sprites}=await built;
      const request=randomUUID(),ready=sprites+'.ready';
      await writeFile(sprites+'.tmp',framePack(pet,request,!updateOutfit),'utf8');
      await rename(sprites+'.tmp',sprites);
      let spawnError;
      const start=()=>{
        const proc=spawn(executable,[sprites],{stdio:'ignore',detached:true});
        proc.once('error',e=>{spawnError=e;if(child===proc)child=null;});
        proc.unref();
        return proc;
      };
      let started=!running();
      if(updateOutfit&&started)return false;
      if(started)child=start();
      for(let i=0;i<=80;i++){
        if(spawnError)throw spawnError;
        if(!running()){
          if(updateOutfit)return false;
          if(started)throw Error('Desktop pet exited during startup');
          started=true;
          child=start();
        }
        const marker=await readFile(ready,'utf8').catch(error=>{
          if(['ENOENT','EBUSY','EPERM'].includes(error.code))return '';
          throw error;
        });
        if(running()&&marker.split('|')[1]===request)return true;
        await delay(100);
      }
      if(started&&running())child.kill();
      throw Error('Desktop pet did not show the requested outfit');
    });
    queue=launch.catch(()=>{});
    launch.then(applied=>{
      if(applied)reply(200,{ok:true});
      else reply(409,{error:'not-running'});
    },error=>{console.error('Desktop request failed:',error);reply(500,{error:'desktop'});});
  });
}
