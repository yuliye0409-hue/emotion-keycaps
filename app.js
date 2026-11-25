const pets=[
 {id:'bean',name:'咕咕',job:'复习桌搭子',room:'复习桌',scene:'study',copy:'等你翻完今天最后一页，它会把书签叼过来。',key:'TAB',color:'#f2bd58',shape:'round',face:'sleepy',accessory:'scarf'},
 {id:'pin',name:'别针',job:'工位实习生',room:'开放工位',scene:'office',copy:'看见消息就想说“收到”，喝水时也带着工牌。',key:'ESC',color:'#70c1d9',shape:'square',face:'dot',accessory:'badge'},
 {id:'echo',name:'回声',job:'夜班程序员',room:'夜间终端',scene:'code',copy:'住在蓝紫色终端里的键帽，报错时先眨眨眼。',key:'DEL',color:'#ad9ae9',shape:'wide',face:'flat',accessory:'antenna'},
 {id:'petal',name:'花花',job:'拼贴设计师',room:'灵感工作室',scene:'studio',copy:'把色卡当宝物。卡住的时候，它会先做个鬼脸。',key:'SHIFT',color:'#ed8f93',shape:'petal',face:'wink',accessory:'patch'},
 {id:'stamp',name:'小章',job:'运营小管家',room:'待办桌',scene:'admin',copy:'纸堆再乱，也会先给每件事盖个小章。',key:'ENTER',color:'#7fb07f',shape:'step',face:'dot',accessory:'stamp'},
 {id:'nap',name:'团团',job:'自由职业者',room:'周末窗边',scene:'weekend',copy:'今天的待办只有三件：晒太阳、喝水、不加班。',key:'END',color:'#e19a78',shape:'pill',face:'happy',accessory:'none'}
];
const colors=[['#f2bd58','杏黄'],['#70c1d9','天蓝'],['#ad9ae9','芋紫'],['#ed8f93','珊瑚'],['#7fb07f','苔绿'],['#e19a78','陶橘']];
const faces=[['dot','圆眼'],['sleepy','困困'],['flat','半睁'],['wink','眨眼'],['happy','笑脸']];
const kits=[['none','无'],['scarf','围巾'],['badge','工牌'],['antenna','天线'],['patch','色卡'],['stamp','印章']];
const $=id=>document.getElementById(id);
const replies={
 bean:{poke:'啊，书签夹哪页了？',water:'咕咚咕咚，续上这口。',sleep:'今天翻到这里，晚安。',move:'绕着笔记本跑一圈！',bonk:'轻一点啦，帽沿敲歪了。'},
 pin:{poke:'收到！咦，是你呀。',water:'补水完成，继续实习。',sleep:'我只眯五分钟……',move:'冲刺去茶水间！',bonk:'工牌都被敲晃了。'},
 echo:{poke:'嗯？刚才哪个报错？',water:'保存好了，继续喝水。',sleep:'终端休眠中……',move:'跑一遍测试！',bonk:'敲我不算修好 bug。'},
 petal:{poke:'嘿，灵感被你戳出来了！',water:'颜色都喝饱啦。',sleep:'色卡收好了，明天再贴。',move:'桌面热身舞开始！',bonk:'这一稿不接受暴力修改。'},
 stamp:{poke:'有事请排队，一个一个来。',water:'流程里也要安排喝水。',sleep:'待办已暂停，晚安。',move:'整理三张纸，出发！',bonk:'章印盖歪啦！'},
 nap:{poke:'嘿嘿，还要再戳一下吗？',water:'水分充足，可以继续晒太阳。',sleep:'梦里也不加班。',move:'伸个懒腰，再跳一下！',bonk:'我是一颗软乎乎的键帽。'}
};
function sceneArt(p){
 const rooms={
 study:['#b8dcf6','#d9eaf4','#ea9b71','#f7be68',
  '<g transform="rotate(-5 191 178)"><rect x="128" y="112" width="119" height="136" fill="#fff3d5"/><path d="M148 145h75m-75 21h69m-69 21h75m-75 21h49" stroke="#9f876c" stroke-width="3"/><path d="M197 112h19v72l-10-8-9 8Z" fill="#e6798b"/><path d="M147 135v96" stroke="#efb2a7" stroke-width="2"/></g><path d="M543 298v-42l36-48" fill="none" stroke-width="7"/><path d="M557 202q22-34 43-13l16 17-59 24Z" fill="#fdcd65"/><path d="M554 231l-21 52m55-58 17 52" fill="none" stroke="#ffdf89" stroke-width="3" stroke-dasharray="3 9"/><rect x="509" y="298" width="68" height="13" rx="6" fill="#f7d9ba"/><path d="M130 357h108v14H130zm-8 16h114v16H122zm11 18h118v15H133z" fill="#e2807e"/><path d="M141 360h89m-101 20h96m-81 19h93" stroke="#fff0d2" stroke-width="5"/>'],
 office:['#c8dcd3','#ecedcc','#d5986f','#f3a47b',
  '<rect x="125" y="106" width="200" height="157" rx="6" fill="#fff2cf"/><rect x="138" y="118" width="174" height="132" fill="#add9ef"/><path d="M140 228v-52h28v52h14v-75h33v75h15v-54h34v54h13v-93h33v91z" fill="#70a3c1" stroke="none"/><path d="M224 118v132m-85-67h173" stroke="#fff2cf" stroke-width="8"/><path d="M537 154h106v125H537z" fill="#e8a883"/><path d="M553 168h34v47h-34zm44 14h32v26h-32z" fill="#f9df86"/><path d="M555 225h65v35h-65z" fill="#fed6d6"/><path d="M561 237h50m-43 9h26" stroke-width="2"/><path d="M132 347h104v57H132z" fill="#f0c988"/><path d="M141 358h86v14h-86zm0 24h86v14h-86z" fill="#fff4cc"/>'],
 code:['#4f5374','#797ba1','#ab798c','#9a96d3',
  '<rect x="111" y="136" width="203" height="132" rx="8" fill="#292b40" stroke="#dabdea" stroke-width="6"/><path d="M128 155h162v95H128z" fill="#383954" stroke="none"/><path d="m143 175 9 8-9 7m19 0h21m-39 18h71m-71 17h49" stroke="#aee1b7" fill="none" stroke-width="4"/><path d="M186 268v28m-25 0h70" stroke="#e6d4f4" stroke-width="6"/><path d="M542 105h107v151H542z" fill="#575674" stroke="#d8bfea" stroke-width="4"/><path d="M553 117h85v123h-85z" fill="#323953" stroke="none"/><path d="M556 209q20-23 40-9t40-15v54h-80Z" fill="#666998" stroke="none"/><path d="M593 131a23 23 0 1 0 20 29 23 23 0 0 1-20-29Z" fill="#f8e8a1" stroke="none"/><path d="M137 367h110l15 29H121Z" fill="#dad0e9"/><path d="M139 377h105m-106 8h111" fill="none" stroke="#786a9f" stroke-width="4" stroke-dasharray="6 4"/>'],
 studio:['#f0b9c7','#f9d9c0','#db9378','#a5c9f1',
  '<path d="M110 128q265 35 545-8" fill="none" stroke-width="2"/><g transform="rotate(-9 194 194)"><path d="M137 145h110v129H137z" fill="#fff2d7"/><path d="M149 164h85v79h-85z" fill="#b6d8f4" stroke="none"/><path d="m154 233 30-55 24 55z" fill="#ef9ba7" stroke="none"/><path d="M193 231l20-40 18 40z" fill="#eeae61" stroke="none"/><path d="M179 142h26v9h-26z" fill="#a992d9" stroke="none"/></g><g transform="rotate(8 590 200)"><path d="M532 147h117v109H532z" fill="#f9ecd0"/><path d="M544 161h27v32h-27z" fill="#ad94d8"/><path d="M577 161h27v32h-27z" fill="#ee9a9b"/><path d="M610 161h27v32h-27z" fill="#e8b55e"/><path d="M544 201h27v32h-27z" fill="#91c0b6"/><path d="M577 201h27v32h-27z" fill="#94bce0"/><path d="M610 201h27v32h-27z" fill="#f5d2e4"/></g><path d="M123 383l89-28 24 38-91 24z" fill="#f6de7a"/><path d="M155 372l72-16 12 34-72 17z" fill="#a9d5d8"/>'],
 admin:['#acd8bd','#e5ecc7','#cc9c6d','#f1bf76',
  '<rect x="122" y="108" width="207" height="144" rx="7" fill="#fceec6"/><path d="M132 133h186m-135 7v98m68-98v98" fill="none" stroke="#a78776" stroke-width="2"/><path d="M137 153h38v37h-38z" fill="#f2bc78"/><path d="M195 182h44v39h-44z" fill="#e896a0"/><path d="M259 149h46v39h-46z" fill="#9fc9da"/><path d="m268 167 7 7 16-16" fill="none" stroke-width="4"/><path d="M539 213h102v20H539zm0 27h102v18H539zm0 25h102v18H539Z" fill="#f8d79e"/><path d="M553 221h36m-36 27h55m-55 26h29" stroke-width="2"/><path d="M136 379h99v25h-99z" fill="#d77479"/><path d="M148 365h98v18h-98z" fill="#f8e5ac"/><path d="M157 371h50" stroke="#ad8f73" stroke-width="2"/>'],
 weekend:['#b3d9ed','#e5efdb','#d28d76','#ebad71',
  '<rect x="471" y="83" width="198" height="178" rx="8" fill="#fff2cf"/><rect x="483" y="95" width="174" height="154" fill="#99c8e6"/><path d="M483 213q39-37 92-14 41-27 82-20v67H483Z" fill="#90ba9b" stroke="none"/><path d="M493 221q62-23 164 6v19H483Z" fill="#b8d5a2" stroke="none"/><circle cx="604" cy="133" r="23" fill="#f9d275" stroke="none"/><path d="M572 95v154m-89-75h174" stroke="#fff2cf" stroke-width="7"/><path d="M470 87h35q-14 62-4 110l-32 19zM634 87h36v129l-32-19q8-57-4-110z" fill="#e49b9e"/><path d="M178 282q-17-28-27-69 36 9 43 39 11-53 45-58 4 32-33 69 24-20 50-16-5 23-47 40Z" fill="#83b98d"/><path d="M169 277h61l-9 30h-43Z" fill="#e18e83"/><path d="M128 376q-4-21 20-25h79q23 4 26 23l-8 20H142Z" fill="#ebba95"/><path d="M145 374h92m-85 9h79" fill="none" stroke="#c48072" stroke-width="2"/>']
 };
 const [wall,panel,desk,mat,props]=rooms[p.scene];
 const glints='<path fill="#fff2c5" d="M350 126h6v-6h6v6h6v6h-6v6h-6v-6h-6zm94 62h5v-5h5v5h5v5h-5v5h-5v-5h-5zM80 253h5v-5h5v5h5v5h-5v5h-5v-5h-5zm626-103h5v-5h5v5h5v5h-5v5h-5v-5h-5z"/>';
 return '<svg class="scene" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><pattern id="paper-dots" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M2 2h1v1H2z" fill="#2e3038" opacity=".2"/></pattern></defs>'+
 '<path d="M0 0h800v520H0z" fill="'+wall+'"/><path d="M0 48h800v16H0zm0 245h800v40H0z" fill="'+panel+'" opacity=".75"/>'+
 '<path d="M0 65h800v227H0z" fill="url(#paper-dots)"/><path d="M0 60h800M0 314h800" stroke="#302b36" opacity=".25" stroke-width="3"/>'+glints+
 '<path d="M0 331h800v189H0z" fill="'+desk+'"/><path d="M0 333h800M0 464h800" stroke="#302b36" stroke-width="4"/>'+
 '<path d="M12 444h190m403 0h160M14 410h75m616 0h78M44 482h131m529 0h64" stroke="#5d3c42" opacity=".25" stroke-width="3" stroke-linecap="round"/>'+
 '<path d="M284 379h232l42 56H241Z" fill="'+mat+'" stroke="#302b36" stroke-width="4"/><path d="M270 421h261" stroke="#302b36" opacity=".25" stroke-width="2" stroke-dasharray="5 5"/>'+
 '<g stroke="#39313c" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">'+props+'</g></svg>';
}
const actions=[
 ['poke','poke','戳一下'],['water','water','喝水'],['sleep','sleep','睡觉'],
 ['move','move','运动'],['bonk','bonk','敲键帽'],['special','special','']
];
const icons={
 poke:'M9 11V5a1.5 1.5 0 0 1 3 0v5l2-1 4 2v4a5 5 0 0 1-5 5h-2l-5-5a1.5 1.5 0 0 1 2-2l1 1',
 water:'M12 3c3 5 6 8 6 12a6 6 0 0 1-12 0c0-4 3-7 6-12Zm-3 12a3 3 0 0 0 3 3',
 sleep:'M20 15a8 8 0 0 1-11-11 8 8 0 1 0 11 11Z',
 move:'M4 14h16M6 10v8m3-10v12m6-12v12m3-10v8',
 bonk:'M4 17v3h16v-3l-2-4H6l-2 4Zm0 0h16M12 3v5m-3-3 3 3 3-3',
 special:'M12 2v4m0 12v4M2 12h4m12 0h4M5 5l3 3m8 8 3 3M19 5l-3 3m-8 8-3 3',
 sound:'M3 10v4h4l4 4V6l-4 4H3m12-1a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12',
 muted:'M3 10v4h4l4 4V6l-4 4H3m12 0 5 5m0-5-5 5'
};
const specials=[
 ['夹书签','书签找到了。就夹在今天最后一页。','书签','M7 3h10v17l-5-4-5 4Z'],
 ['收消息','叮。收到了一个来自茶水间的好消息。','工位便签','M4 6h16v12H4zM5 7l7 6 7-6'],
 ['跑终端','一行、两行……这次全绿。','终端光标','M3 4h18v16H3zM7 8l4 4-4 4m6 0h4'],
 ['贴色卡','啪。今天就选这个颜色。','拼贴色卡','M5 7l11-4 4 12-11 4Zm1 6h13v8H6z'],
 ['盖小章','咚。给「先歇会儿」盖个通过。','小章印','M9 14l1-4-1-3a3 3 0 0 1 6 0l-1 3 1 4m-9 0h12l2 4H4Zm0 7h12'],
 ['拉窗帘','阳光进来了一格。再待一会儿吧。','窗边日光','M4 4h16v16H4zM8 4c0 7 1 10-4 13M16 4c0 7-1 10 4 13']
];
const officeReplies={
 hug:'抱一下。你忙你的，我在这里。',
 calm:'跟我一起。慢慢吸气，再慢慢呼气。',
 cheer:'这一小步也值得庆祝！',
 break:'我们伸个懒腰？我先来。',
 concern:'我在听。要是想停一下，我给你举牌。'
};
const entries={poke:'戳了戳帽沿。',water:'喝了一口水。',sleep:'蜷在小窝里打盹。',wake:'醒来伸了个懒腰。',move:'跑了几步。',bonk:'帽沿被轻轻按了一下。',wave:'打了个招呼。',hug:'抱了一下。',calm:'一起做了一次深呼吸。',cheer:'为一件小事庆祝。',break:'伸了个懒腰。',concern:'举了一下暂停牌。'};
const keyMap={Space:'move',KeyH:'wave',KeyW:'water',KeyS:'sleep',KeyB:'bonk',KeyE:'special'};
const storeKey='keycap-club-2d-v2';
let state={active:0,sound:false,office:false,profiles:{}};
try {
 const raw=JSON.parse(localStorage.getItem(storeKey)||'null');
 if(raw&&typeof raw==='object') {
  if(Number.isInteger(raw.active)&&pets[raw.active]) state.active=raw.active;
  state.sound=raw.sound===true;
  state.office=raw.office===true;
  for(const p of pets) {
   const saved=raw.profiles?.[p.id];
   if(!saved||typeof saved!=='object') continue;
   const clean={log:Array.isArray(saved.log)?saved.log.filter(x=>Object.hasOwn(entries,x)||x==='special').slice(0,4):[],found:saved.found===true};
   if(typeof saved.name==='string') clean.name=saved.name.slice(0,12);
   for(const [k,opts] of [['color',colors],['face',faces],['accessory',kits]]) {
    if(opts.some(([v])=>v===saved[k])) clean[k]=saved[k];
   }
   state.profiles[p.id]=clean;
  }
 }
} catch { /* Storage can be disabled; the live session still works. */ }
let active=state.active,action='idle',timer,audio,desktopPending=false;
let started=performance.now(),frameTime=0,visiblePet;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const profile=p=>state.profiles[p.id]??={log:[],found:false};
const look=()=>{const base=pets[active],prefs=profile(base);return {...base,...prefs,name:prefs.name?.trim()||base.name}};
function persist(){try{localStorage.setItem(storeKey,JSON.stringify(state))}catch{/* Use in-memory state. */}}
const drawnIcon=path=>'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="'+path+'"/></svg>';
const icon=id=>drawnIcon(icons[id]);
function faceMark(id){
 return ({
  sleepy:'<path d="M3 6q3 4 6 0m2 0q3 4 6 0"/>',
  flat:'<path d="M3 5h5m4 0h5"/><circle cx="6" cy="7" r="1"/><circle cx="14" cy="7" r="1"/>',
  wink:'<circle cx="6" cy="6" r="1.5" fill="currentColor"/><path d="M11 7q3-4 6 0m-8 3q1 2 3 0"/>',
  happy:'<path d="M3 7q3-4 6 0m2 0q3-4 6 0m-9 3q2 4 4 0"/>',
  dot:'<circle cx="6" cy="6" r="1.2" fill="currentColor"/><circle cx="14" cy="6" r="1.2" fill="currentColor"/><path d="M8 10q2 2 4 0"/>'
 })[id];
}
function choices(items,type){
 return items.map(([v,n])=>'<button class="choice" type="button" data-type="'+type+'" data-value="'+v+'" aria-label="'+n+'" title="'+n+'">'+
  (type==='color'?'<i class="swatch" style="--swatch:'+v+'"></i>':type==='face'?'<svg viewBox="0 0 20 15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">'+faceMark(v)+'</svg>':'<span>'+(v==='none'?'–':n)+'</span>')+'</button>').join('');
}
function setupWorld(node){
 node.innerHTML='<div class="room-art"></div><div class="night"></div><button class="story-prop" type="button"><span></span></button><button class="pet-hit" type="button"></button><div class="room-effect" aria-hidden="true"></div>';
 node.querySelector('.pet-hit').onclick=()=>act('poke');
 node.querySelector('.story-prop').onclick=()=>act('special');
}
function setupActions(node){
 node.innerHTML=actions.map(([a,i,n])=>'<button type="button" data-action="'+a+'">'+icon(i)+'<span>'+n+'</span></button>').join('');
 node.querySelectorAll('button').forEach(b=>b.onclick=()=>act(b.dataset.action));
}
function render(view){
 const p=look(), [task,,sticker,symbol]=specials[active];
 if(view.world.dataset.room!==p.scene){
  view.world.dataset.room=p.scene;
  view.world.querySelector('.room-art').innerHTML=sceneArt(p);
 }
 view.world.dataset.action=action;
 const hit=view.world.querySelector('.pet-hit');
 hit.setAttribute('aria-label','戳一戳'+p.name);
 hit.dataset.action=action;
 visiblePet=p;
 drawPose(hit,performance.now());
 const prop=view.world.querySelector('.story-prop');
 prop.setAttribute('aria-label',task);
 prop.title=task;
 prop.firstElementChild.innerHTML=drawnIcon(symbol);
 const effect=view.world.querySelector('.room-effect');
 effect.replaceChildren();
 if(action==='special'){
  const item=view.world.ownerDocument.createElement('span');
  item.innerHTML=drawnIcon(symbol);
  effect.append(item);
 }
 view.message.textContent=action==='idle'?p.copy:action==='special'?specials[active][1]:action==='wave'?'嗨，在呢。':action==='wake'?'唔……早啊。':officeReplies[action]??replies[p.id][action];
 view.actions.querySelector('[data-action=special] span').textContent=task;
 view.actions.querySelector('[data-action=sleep] span').textContent=action==='sleep'?'叫醒':'睡觉';
 view.actions.querySelector('[data-action=sleep]').setAttribute('aria-pressed',String(action==='sleep'));
 view.name.textContent=p.name;
 view.room.textContent=p.room;
 $('pet-job').textContent=p.job;
 $('edition').textContent='KEYCAP '+String(active+1).padStart(2,'0')+' / 06';
 if($('nickname')!==document.activeElement) $('nickname').value=profile(p).name??pets[active].name;
 document.querySelectorAll('.roster button').forEach((b,i)=>{
  b.setAttribute('aria-pressed',String(i===active));
  const original=pets[i], customized=profile(original);
  const item={...original,...customized,name:customized.name?.trim()||original.name};
  b.title=item.job+' · '+item.room;
  b.querySelector('.roster-art').innerHTML=KeycapArt.make(item,item.name);
  b.querySelector('.roster-name').textContent=item.name;
 });
 document.querySelectorAll('.options button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===p[b.dataset.type])));
 $('diary-count').textContent=p.found?'收下了：'+sticker:'';
 $('diary').innerHTML=p.log.length?p.log.map(a=>'<li>'+(a==='special'?'在房间里收下了'+sticker+'。':entries[a])+'</li>').join(''):'<li class="empty">还没有新鲜事。</li>';
}
const mainView={world:$('world'),name:$('pet-name'),room:$('room'),message:$('message'),actions:$('actions')};
function paint(){render(mainView)}
function drawPose(hit,now){
 const elapsed=Math.max(0,now-started);
 const sample=reduced.matches
  ? action==='sleep'?KeycapMotion.duration.sleep:(KeycapMotion.duration[action]||0)*.55
  : elapsed;
 hit.innerHTML=KeycapArt.make(visiblePet,visiblePet.name,action,sample,reduced.matches);
}
function animate(now){
 const step=action==='idle'||action==='sleep'?60:32;
 if(!reduced.matches&&now-frameTime>=step){
  frameTime=now;drawPose($('world').querySelector('.pet-hit'),now);
 }
 requestAnimationFrame(animate);
}
function soundButton(){
 const b=$('sound-toggle');
 b.innerHTML=icon(state.sound?'sound':'muted');
 b.setAttribute('aria-pressed',String(state.sound));
}
function playTone(a){
 if(!state.sound||!window.AudioContext)return;
 try{
  audio??=new AudioContext();
  if(audio.state==='suspended')audio.resume().catch(()=>{});
  const notes={poke:[240,360],water:[440,560,660],sleep:[230,170],move:[270,370,480],bonk:[115,74],special:[390,490,660],wake:[240,450],wave:[330,470],hug:[360,480],calm:[260,220],cheer:[320,480,600],break:[280,420],concern:[240,290]}[a];
  notes.forEach((n,i)=>{
   const t=audio.currentTime+i*.085,o=audio.createOscillator(),g=audio.createGain();
   o.type=a==='bonk'?'triangle':'sine';
   o.frequency.setValueAtTime(n,t);
   g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(.055,t+.016);g.gain.exponentialRampToValueAtTime(.001,t+.15);
   o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.16);
  });
 }catch{/* Audio is optional. */}
}
function act(a){
 clearTimeout(timer);
 if(action==='sleep'&&(a==='poke'||a==='sleep'))a='wake';
 action=a;
 started=performance.now();
 const prefs=profile(pets[active]);
 if(a==='special')prefs.found=true;
 prefs.log=[a,...prefs.log].slice(0,4);
 persist();
 paint();
 playTone(a);
 if(a!=='sleep')timer=setTimeout(()=>{action='idle';started=performance.now();paint()},a==='special'?3200:KeycapMotion.duration[a]+240);
}
function select(i){
 if(i===active)return;
 clearTimeout(timer);
 active=state.active=i;action='idle';started=performance.now();
 persist();paint();
}
function setStatus(s){
 $('desktop-status').hidden=!s;
 $('desktop-status').textContent=s;
}
async function toDesktop(){
 if(desktopPending)return;
 if(location.protocol==='file:'){
  setStatus('请通过本机预览打开 Windows 桌宠。');return;
 }
 desktopPending=true;
 $('desktop').disabled=true;
 setStatus('');
 try{
  const {shape,color,face,accessory}=look();
  const response=await fetch('./desktop',{
   method:'POST',headers:{'Content-Type':'application/json','X-Keycap-Desktop':'1'},
   body:JSON.stringify({shape,color,face,accessory,office:state.office})
  });
  if(!response.ok)throw Error('desktop');
  setStatus('桌宠已放到桌面。');
 }catch{
  setStatus('桌宠未启动。请确认运行的是最新版 Windows 本机预览。');
 }finally{
  desktopPending=false;
  $('desktop').disabled=false;
 }
}
function handleKeys(e){
 const a=keyMap[e.code];
 if(!a||e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.isComposing)return;
 if(e.target.closest?.('input,textarea,[contenteditable],select'))return;
 if(e.code==='Space'&&e.target.closest?.('button:focus-visible,a:focus-visible'))return;
 e.preventDefault();act(a);
}
function init(){
 const r=$('roster');
 r.innerHTML=pets.map((_,i)=>'<button type="button" data-pet="'+i+'"><span class="roster-art" aria-hidden="true"></span><span class="roster-name"></span></button>').join('');
 r.querySelectorAll('[data-pet]').forEach(b=>b.onclick=()=>select(+b.dataset.pet));
 for(const [id,type,opts] of [['colors','color',colors],['faces','face',faces],['kits','accessory',kits]])$(id).innerHTML=choices(opts,type);
 document.querySelectorAll('.options button').forEach(b=>b.onclick=()=>{
  profile(pets[active])[b.dataset.type]=b.dataset.value;persist();paint();
 });
 $('nickname').oninput=e=>{profile(pets[active]).name=e.target.value.slice(0,12);persist();paint()};
 $('nickname').onblur=()=>{if(!$('nickname').value.trim())$('nickname').value=look().name};
 $('sound-toggle').onclick=()=>{state.sound=!state.sound;persist();soundButton();if(state.sound)playTone('wave')};
 $('desktop').onclick=toDesktop;
 $('office').checked=state.office;
 $('office').onchange=e=>{state.office=e.target.checked;persist()};
 document.querySelectorAll('.office-actions button').forEach(b=>b.onclick=()=>act(b.dataset.action));
 window.addEventListener('keydown',handleKeys);
 setupWorld(mainView.world);setupActions(mainView.actions);soundButton();paint();requestAnimationFrame(animate);
}
init();
