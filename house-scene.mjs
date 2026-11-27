import * as T from './vendor/three.module.min.js';
import {rooms,doors,doorOpening,roomAt,canStand,clearWalk,walkPath} from './house-layout.mjs';
import {makePet} from './house-pet.mjs';

const ink='#554456';
const tones=new Map();
const mat=(color,value=1)=>{
 const id=color+'/'+value;
 if(!tones.has(id))tones.set(id,new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(value)}));
 return tones.get(id);
};
function box(parent,x,y,z,w,h,d,c,edge=false){
 const geometry=new T.BoxGeometry(w,h,d);
 const m=new T.Mesh(geometry,[.82,.87,1,.72,.94,.86].map(value=>mat(c,value)));
 m.position.set(x,y,z);
 if(edge)m.add(new T.LineSegments(new T.EdgesGeometry(geometry),new T.LineBasicMaterial({color:ink,transparent:true,opacity:.78})));
 parent.add(m);return m;
}
function oval(parent,x,y,z,rx,ry,rz,c){
 const m=new T.Mesh(new T.SphereGeometry(1,24,12),mat(c));m.position.set(x,y,z);m.scale.set(rx,ry,rz);parent.add(m);return m;
}
function cylinder(parent,x,y,z,top,bottom,h,c){
 const m=new T.Mesh(new T.CylinderGeometry(top,bottom,h,32),mat(c));m.position.set(x,y,z);parent.add(m);return m;
}
function group(parent,x=0,y=0,z=0){
 const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;
}
function rug(parent,x,z,w,d,c){
 const s=new T.Shape(),a=w/2,b=d/2,r=.17;
 s.moveTo(-a+r,-b);s.lineTo(a-r,-b);s.quadraticCurveTo(a,-b,a,-b+r);
 s.lineTo(a,b-r);s.quadraticCurveTo(a,b,a-r,b);s.lineTo(-a+r,b);
 s.quadraticCurveTo(-a,b,-a,b-r);s.lineTo(-a,-b+r);s.quadraticCurveTo(-a,-b,-a+r,-b);
 const m=new T.Mesh(new T.ShapeGeometry(s),mat(c));m.rotation.x=-Math.PI/2;m.position.set(x,.024,z);
 const pts=s.getPoints(8).map(p=>new T.Vector3(p.x,p.y,.003));
 m.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:'#8e6e73',transparent:true,opacity:.55})));
 parent.add(m);return m;
}
function sticker(text,bg='#fff0d4',fg='#42334b'){
 const canvas=document.createElement('canvas');canvas.width=360;canvas.height=96;
 const c=canvas.getContext('2d');c.fillStyle=bg;c.strokeStyle=ink;c.lineWidth=5;
 c.beginPath();c.roundRect(6,10,348,75,15);c.fill();c.stroke();
 c.fillStyle=fg;c.font='700 38px "Microsoft YaHei", sans-serif';
 c.textAlign='center';c.textBaseline='middle';c.fillText(text,180,48,315);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const s=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));s.scale.set(1.76,.47,1);return s;
}
function table(parent,x,z,w,d,h=.87){
 for(const a of [-1,1])for(const b of [-1,1])box(parent,x+a*(w/2-.14),h*.45,z+b*(d/2-.14),.12,h*.9,.12,'#9d7166');
 box(parent,x,h,z,w,.15,d,'#efcaa0',true);
}
function plant(parent,x,z,s=1,y=0){
 cylinder(parent,x,y+.25*s,z,.31*s,.24*s,.5*s,'#cb8a7c');
 cylinder(parent,x,y+.51*s,z,.29*s,.29*s,.027,'#795b60');
 for(let i=0;i<6;i++){
  const a=i*2.4,m=oval(parent,x+Math.cos(a)*.19*s,y+(i%2?.91:.76)*s,z+Math.sin(a)*.18*s,.15*s,.34*s,.092*s,i%2?'#9bb589':'#78a08c');
  m.rotation.y=-a;m.rotation.z=.65;
 }
}
function books(parent,x,y,z){
 ['#dc8d99','#91a8c8','#f5ce86'].forEach((c,i)=>{
  box(parent,x+i*.037,y+i*.083,z,.53,.087,.36,c,true);
  box(parent,x+.005+i*.037,y+i*.083,z+.184,.45,.045,.012,'#fff0d7');
 });
}
function lamp(parent,x,z,y=0,s=1){
 cylinder(parent,x,y+.025,z,.27*s,.28*s,.05,'#d29873');
 cylinder(parent,x,y+.69*s,z,.038*s,.041*s,1.3*s,'#725262');
 cylinder(parent,x,y+1.33*s,z,.14*s,.38*s,.35*s,'#f5c673');
 cylinder(parent,x,y+1.152*s,z,.36*s,.36*s,.025,'#ffdf95');
}
function windowArt(parent,x,z,y,width){
 box(parent,x,y,z,width,1.44,.09,'#f4e6ce',true);
 box(parent,x,y,z+.054,width-.20,1.25,.04,'#b0d5e5');
 oval(parent,x-.29,y-.35,z+.08,.55,.23,.016,'#a4b998');
 oval(parent,x+.34,y-.33,z+.083,.48,.25,.016,'#8eac94');
 box(parent,x,y-.60,z+.112,width-.20,.12,.04,'#f4e6ce');
 box(parent,x,y,z+.099,.061,1.42,.063,'#f4e6ce');
 box(parent,x,y+.01,z+.099,width,.073,.063,'#f4e6ce');
}
function buildRoom(scene,id,floors,details){
 const r=rooms[id],g=group(scene,r.x,0,r.z);
 const plank=id==='kitchen'?'#c4a480':'#b18370';
 const floor=box(g,0,-.138,0,r.w-.025,.274,r.d-.025,r.floor,true);
 floor.userData.kind='floor';floors.push(floor);
 for(let j=-4;j<=4;j++){
  const lineZ=j*.84;
  box(g,0,.004,lineZ,8.96,.012,.014,plank);
  for(const x of [-3.3,-.2,2.7])box(g,x+(j%2)*.65,.004,lineZ+.42,.013,.012,.84,plank);
 }
 rug(g,id==='living'?-.14:0,id==='living'?.66:.21,id==='living'?5:4.45,id==='living'?3.48:2.4,r.rug);
 const features=group(g);
 if(id==='living'){
  box(g,-2.75,.40,-1.5,2.42,.62,1.08,'#ac9ec9',true);
  box(g,-2.75,.96,-1.93,2.47,.85,.26,'#a598c2',true);
  for(const s of [-1,1]){
   box(g,-2.75+s*1.09,.70,-1.48,.30,.53,1.11,'#c8b7dd',true);
   box(g,-2.75+s*.49,.704,-1.41,.94,.15,.75,'#e3d1ed',true);
  }
  const pillow=oval(g,-3.19,.96,-1.66,.34,.32,.15,'#ebb394');pillow.rotation.z=.25;
  table(g,2.15,-1.5,1.53,1.07,.72);
  box(features,2.15,.88,-1.55,1.02,.17,.71,'#9db9a5',true);
  cylinder(features,2.03,.989,-1.54,.294,.294,.025,'#534554');
  cylinder(features,2.03,1.004,-1.54,.075,.075,.015,'#e8ad88');
  box(features,2.50,1.021,-1.50,.04,.035,.38,'#624d5e').rotation.y=.48;
  plant(g,-3.32,2.62,.88);lamp(g,-3.79,-2.65);
 }else if(id==='kitchen'){
  box(g,.1,.52,2.85,5.4,1.04,1.08,'#91ac99',true);
  box(g,.1,1.09,2.85,5.48,.15,1.16,'#f5d5a7',true);
  for(let i=0;i<5;i++){
   const x=-1.95+i*1.02;
   box(g,x,.52,3.41,.89,.78,.06,i%2?'#a3b7a2':'#96b19d',true);
   box(g,x,.72,3.466,.26,.041,.07,'#f2cf95');
  }
  box(features,-.94,1.19,2.76,1.09,.075,.86,'#695761',true);
  for(const x of [-1.18,-.72])cylinder(features,x,1.24,2.77,.182,.182,.04,'#9f8390');
  cylinder(features,-.74,1.405,2.77,.224,.17,.266,'#dc876f');
  cylinder(features,-.74,1.55,2.77,.245,.245,.03,'#efd09a');
  oval(features,-.74,1.61,2.77,.067,.062,.067,'#c28373');
  box(g,1.6,1.175,2.8,.98,.055,.68,'#dba57a',true);
  oval(g,1.55,1.31,2.8,.16,.16,.16,'#e7a271');oval(g,1.86,1.31,2.72,.13,.13,.13,'#a3b886');
  table(g,2.9,-1.5,1.17,1.05,.73);
  plant(g,2.9,-1.5,.52,.82);
 }else if(id==='study'){
  table(g,-2.8,-2.05,2.3,1.22,.88);books(features,-3.25,1.02,-2.05);
  lamp(g,-2.0,-2.23,.955,.62);
  box(features,-2.58,1.008,-1.84,.61,.045,.42,'#fff0d5',true).rotation.y=-.12;
  box(g,2.97,1.22,-2.75,1.18,2.40,.57,'#bb896f',true);
  for(let i=0;i<4;i++){
   box(g,2.97,.38+i*.50,-2.43,1.08,.07,.52,'#edc8a1');
   books(g,2.92,.49+i*.50,-2.41);
  }
  plant(g,-3.65,2.56,.77);
 }else{
  box(g,1.95,.375,-1.10,2.65,.54,2.90,'#bc8792',true);
  box(g,1.95,.71,-2.56,2.72,.94,.17,'#ab7d9e',true);
  box(g,1.95,.675,-1.05,2.52,.30,2.77,'#efd2d7',true);
  for(const x of [1.36,2.54])oval(g,x,.91,-2.00,.48,.15,.32,'#fff0d4');
  box(features,1.95,.88,-.69,2.53,.19,1.89,'#bda9db',true);
  box(features,1.95,.976,-1.62,2.54,.05,.13,'#eac4d1');
  for(const x of [1.21,1.95,2.69])box(features,x,.987,-.69,.015,.02,1.65,'#ac95cf');
  table(g,-1.9,-2.45,1.10,.89,.71);lamp(g,-1.9,-2.52,.81,.59);
 }
 details[id]=features;
}
function wallArt(parent,x,y,z,w,h,art){
 const surface=document.createElement('canvas');
 surface.width=512;surface.height=384;
 const map=new T.CanvasTexture(surface);
 map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
 const drawing=new Image();
 drawing.onload=()=>{
  surface.getContext('2d').drawImage(drawing,0,0,512,384);
  map.needsUpdate=true;
 };
 drawing.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 384">'+art+'</svg>');
 const print=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false}));
 print.position.set(x,y,z);
 parent.add(print);
}
const wallDetails={
 study:'<g transform="rotate(-8 145 206)" stroke="#524153" stroke-width="7" stroke-linejoin="round"><path d="M59 90h177v201H59z" fill="#fff1cd"/><path d="M86 137h118m-118 29h106m-106 29h104m-104 29h80" stroke="#ac8c71" stroke-width="4"/><path d="M85 123v142" stroke="#eac0a4" stroke-width="3"/><path d="M160 91h29v116l-14-10-15 10z" fill="#e682a0"/></g><path d="M362 98h9v13h13v9h-13v13h-9v-13h-13v-9h13Zm43 105h8v11h11v8h-11v11h-8v-11h-11v-8h11Z" fill="#fff0ba"/>',
 bedroom:'<g stroke="#645473" stroke-width="6" stroke-linejoin="round"><rect x="73" y="116" width="144" height="140" rx="14" fill="#eee0f4"/><rect x="88" y="131" width="114" height="110" rx="7" fill="#77759b"/></g><path d="M155 155c-27 3-38 29-22 48 14 16 37 10 45-5-26 10-43-21-23-43zM113 155l3 6 6 2-6 3-3 6-3-6-6-3 6-2Z" fill="#ffebb7"/>',
 kitchen:'<g stroke="#596458" stroke-width="6" stroke-linejoin="round"><path d="M252 163h190v23H252z" fill="#b99070"/><path d="M279 163v-45h29v45m14 0v-54h32v54m12-1q-15-15-13-29h61q1 15-16 29z" fill="#f4cca1"/><path d="M282 126h23m20 2h26m7 17h51" stroke-width="3"/></g>',
 living:'<g stroke="#665461" stroke-width="6" stroke-linejoin="round"><rect x="305" y="94" width="125" height="147" rx="8" fill="#fff0cf"/><circle cx="367" cy="155" r="27" fill="#eaa993"/><path d="M323 222l43-42 43 42z" fill="#a9c6a9"/></g>'
};
function partitions(scene){
 const outside=[],join='#877182',base='#a28a83';
 for(const [x,z,w,d] of [[4.5,4,18,.15],[4.5,-12,18,.15],[-4.5,-4,.15,16],[13.5,-4,.15,16]]){
  const bed=box(scene,x,.096,z,w,.19,d,base,true);
  const high=group(scene,x,0,z);
  const horizontal=w>d,span=horizontal?w:d;
  for(let i=0;i<2;i++){
   const sample=horizontal?roomAt(x+(i-.5)*span/2,z===4?3.9:-11.9):roomAt(x<0?-4.4:13.4,z+(i-.5)*span/2);
   const c=rooms[sample].walls,j=(i-.5)*span/2;
   box(high,horizontal?j:0,1.44,horizontal?0:j,horizontal?span/2:.15,2.55,horizontal?.15:span/2,c,true);
   if(horizontal&&z===-12){
    windowArt(high,j+1.8,.125,1.80,1.66);
    wallArt(high,j-.66,1.62,.096,4.35,2.28,wallDetails[sample]);
   }
   if(horizontal&&z===4){
    const win=group(high,j,0,0);win.rotation.y=Math.PI;
    windowArt(win,1.2,.125,1.75,1.66);
    wallArt(win,-.87,1.56,.096,4.35,2.28,wallDetails[sample]);
   }
  }
  outside.push({high,x,z,horizontal,bed});
 }
 for(const axis of ['x','z']){
  const entries=doors.filter(d=>d.axis===axis).sort((a,b)=>axis==='x'?a.z-b.z:a.x-b.x);
  const fixed=axis==='x'?4.5:-4;
  const wax=(a,b,y,h,c,edge=false)=>axis==='x'?box(scene,fixed,y,(a+b)/2,.17,h,b-a,c,edge):box(scene,(a+b)/2,y,fixed,b-a,h,.17,c,edge);
  let cursor=axis==='x'?-12:-4.5;
  for(const d of entries){
   const center=axis==='x'?d.z:d.x;
   const {halfWidth,height}=doorOpening,left=center-halfWidth,right=center+halfWidth;
   wax(cursor,left,.34,.68,'#c4aeb6',true);
   wax(cursor,left,.72,.117,'#e6cebd',true);
   wax(left,right,.013,.024,'#eed0a8');
   wax(left-.15,left,height/2,height,join,true);
   wax(right,right+.15,height/2,height,join,true);
   wax(left-.15,right+.15,height+.065,.13,join,true);
   cursor=right;
  }
  const end=axis==='x'?4:13.5;
  wax(cursor,end,.34,.68,'#c4aeb6',true);
  wax(cursor,end,.72,.117,'#e6cebd',true);
 }
 return outside;
}
function groundLabel(scene,text,x,z,s=1){
 const label=sticker(text);label.position.set(x,.28,z);label.scale.multiplyScalar(s);scene.add(label);return label;
}
const modAngle=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
export function createHouse(canvas,api){
 const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,stencil:true,powerPreference:'default'});
 renderer.localClippingEnabled=true;
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.outputColorSpace=T.SRGBColorSpace;
 const scene=new T.Scene();
 const houseBackground=new T.Color('#f6eee1'),portraitBackground=new T.Color('#eee7f8');
 scene.background=houseBackground;
 const sun=new T.DirectionalLight('#fff2dd',1.13);sun.position.set(-5,12,7);scene.add(sun);
 const fill=new T.DirectionalLight('#e2e6ff',.34);fill.position.set(9,5,-10);scene.add(fill);
 const camera=new T.OrthographicCamera(-8,8,6,-6,.1,90);
 const floors=[],details={},roomsGroup=group(scene);
 for(const id of Object.keys(rooms))buildRoom(roomsGroup,id,floors,details);
 const walls=partitions(roomsGroup);
 const labels={};
 for(const [id,r] of Object.entries(rooms))labels[id]=groundLabel(scene,r.name,r.x-2.65,r.z+3.22,.94);
 const interact=[];
 for(const [id,g] of Object.entries(details)){
  const control=groundLabel(scene,{living:'唱片',kitchen:'料理',study:'书签',bedroom:'睡觉'}[id],
   {living:2.15,kitchen:8.1,study:-2.8,bedroom:11.15}[id],
   {living:-1.5,kitchen:2.67,study:-10.05,bedroom:-9.14}[id],.64);
  control.position.y=id==='bedroom'?1.76:1.52;
  control.userData.action=id;g.userData.action=id;
  interact.push(g,control);
 }
 const doorSigns=doors.map(d=>{
  const signs=[sticker(rooms[d.a].name,'#f5e6d6'),sticker(rooms[d.b].name,'#f5e6d6')];
  for(const sign of signs){
   sign.position.set(d.x,doorOpening.height+.32,d.z);sign.scale.multiplyScalar(.70);sign.userData.door=d;scene.add(sign);
  }
  return {d,signs};
 });
 const doorTargets=new T.MeshBasicMaterial({visible:false});
 const doorObjects=doors.map(d=>{
  const m=rug(scene,d.x,d.z,d.axis==='x'?.7:1.16,d.axis==='z'?.7:1.16,'#f5dba9');
  m.position.y=.037;roomsGroup.add(m);
  const hit=new T.Mesh(new T.BoxGeometry(d.axis==='x'?.97:1.79,1.43,d.axis==='x'?1.79:.97),doorTargets);
  hit.position.set(d.x,.72,d.z);
  hit.userData.door=d;scene.add(hit);return hit;
 });
 const contact=new T.Mesh(new T.CircleGeometry(1,42),new T.MeshBasicMaterial({color:'#765a73',transparent:true,opacity:.19,depthWrite:false}));
 contact.rotation.x=-Math.PI/2;contact.scale.set(.83,.57,1);scene.add(contact);
 const marker=new T.Mesh(new T.RingGeometry(.18,.235,28),new T.MeshBasicMaterial({color:'#fff1c6',side:T.DoubleSide}));
 marker.rotation.x=-Math.PI/2;marker.visible=false;scene.add(marker);
 const pet=makePet(scene),ray=new T.Raycaster(),ndc=new T.Vector2();
 const target=new T.Vector3(),lookAt=new T.Vector3(),temp=new T.Vector3();
 let room=Object.hasOwn(rooms,api.initial)?api.initial:'living';
 pet.root.position.set(rooms[room].spot[0],0,rooms[room].spot[1]);
 let angle=.46,pitch=.91,zoom=1,mode='home',distance=11.9,aspect=1;
 let path=[],done=null,phase=0,drag,frame=0,last=0,snapshot;
 const held=new Set(),keyDirs={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],KeyW:[0,-1],KeyS:[0,1],KeyA:[-1,0],KeyD:[1,0]};
 const pos=()=>[pet.root.position.x,pet.root.position.z];
 const stop=()=>{path=[];done=null;marker.visible=false};
 function go(where,callback){
  const route=walkPath(pos(),where);
  if(!route.length)return;
  path=route;done=callback;marker.position.set(path.at(-1)[0],.045,path.at(-1)[1]);marker.visible=!callback;
 }
 function move(dx,dz,dt){
  const [x,z]=pos();
  let nx=x+dx,nz=z+dz;
  if(!canStand(nx,nz)){
   if(canStand(nx,z))nz=z;
   else if(canStand(x,nz))nx=x;
   else return false;
  }
  if(Math.hypot(nx-x,nz-z)<.0001)return false;
  const aim=Math.atan2(nx-x,nz-z);
  pet.root.rotation.y+=modAngle(pet.root.rotation.y,aim)*Math.min(1,dt*15);
  pet.root.position.set(nx,0,nz);
  const next=roomAt(nx,nz);
  if(next!==room){room=next;api.enter(next)}
  return true;
 }
 function toDoor(d){
  const to=room===d.a?d.b:room===d.b?d.a:(Math.hypot(d.x-rooms[d.a].x,d.z-rooms[d.a].z)<Math.hypot(d.x-rooms[d.b].x,d.z-rooms[d.b].z)?d.a:d.b);
  const r=rooms[to],sign=Math.sign(d.axis==='x'?r.x-d.x:r.z-d.z);
  go([d.x+(d.axis==='x'?1.32*sign:0),d.z+(d.axis==='z'?1.32*sign:0)]);
 }
 function hit(ray,items){
  return ray.intersectObjects(items,true).find(entry=>{
   for(let object=entry.object;object;object=object.parent)if(!object.visible)return false;
   return true;
  });
 }
 function click(e){
  const bounds=canvas.getBoundingClientRect();ndc.set((e.clientX-bounds.left)*2/bounds.width-1,1-(e.clientY-bounds.top)*2/bounds.height);
  ray.setFromCamera(ndc,camera);
  const door=hit(ray,[...doorObjects,...doorSigns.flatMap(x=>x.signs)]),prop=hit(ray,interact),obj=hit(ray,[pet.root]),floor=hit(ray,floors);
  if(obj&&(!prop||obj.distance<prop.distance)&&(!floor||obj.distance<floor.distance)){
   if(snapshot?.action==='peek')api.reveal();
   else{
    stop();
    pet.root.rotation.y=angle;
    api.poke();
   }
   return;
  }
  if(prop&&(!floor||prop.distance<floor.distance)&&(!door||prop.distance<door.distance)){
   let item=prop.object;
   while(item&&!item.userData.action)item=item.parent;
   const next=item?.userData.action;
   if(next){
    stop();
    if(next===room&&Math.hypot(pos()[0]-rooms[next].spot[0],pos()[1]-rooms[next].spot[1])<.5)api.interact(next);
    else go(rooms[next].spot,()=>api.interact(next));
    return;
   }
  }
  if(door){toDoor(door.object.userData.door);return}
  if(floor)go([floor.point.x,floor.point.z]);
 }
 canvas.addEventListener('pointerdown',e=>{
  if(!e.isPrimary||e.button!==0)return;
  canvas.focus({preventScroll:true});
  canvas.setPointerCapture(e.pointerId);
  drag={x:e.clientX,y:e.clientY,a:angle,p:pitch,active:false,id:e.pointerId};
 });
 canvas.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const x=e.clientX-drag.x,y=e.clientY-drag.y;
  if(Math.hypot(x,y)>6)drag.active=true;
  if(drag.active){
   angle=drag.a-x*.009;pitch=T.MathUtils.clamp(drag.p-y*.006,.48,1.42);
  }
 });
 canvas.addEventListener('pointerup',e=>{if(drag?.id===e.pointerId){if(!drag.active)click(e);drag=null}});
 canvas.addEventListener('pointercancel',()=>{drag=null});
 canvas.addEventListener('wheel',e=>{
  if(document.activeElement!==canvas&&!e.ctrlKey)return;
  e.preventDefault();zoom=T.MathUtils.clamp(zoom*Math.exp(e.deltaY*.0011),.62,1.8);
 },{passive:false});
 const keys=e=>{
  if(e.ctrlKey||e.altKey||e.metaKey||!keyDirs[e.code]||
   e.target.closest?.('input,textarea,select,[contenteditable]')||
   (e.target.closest?.('button,a')&&e.code.startsWith('Arrow')))return;
  e.preventDefault();
  held.add(e.code);stop();
 };
 window.addEventListener('keydown',keys);
 window.addEventListener('keyup',e=>held.delete(e.code));
 window.addEventListener('blur',()=>held.clear());
 const resize=()=>{
  const {clientWidth:w,clientHeight:h}=canvas;
  if(w<1||h<1)return;
  aspect=w/h;renderer.setSize(w,h,false);
 };
 new ResizeObserver(resize).observe(canvas);resize();
 const animate=now=>{
  const dt=Math.min(.045,(now-(last||now))/1000);last=now;
  snapshot=api.state(now);
  let moving=false;
  const asleep=snapshot.action==='sleep'||snapshot.action==='wake'||snapshot.action==='peek'||snapshot.action==='peekReveal';
  if(!asleep&&dt>0){
   const speed=4.55*dt;
   if(held.size){
    const d=[0,0];
    for(const code of held){d[0]+=keyDirs[code][0];d[1]+=keyDirs[code][1]}
    const length=Math.hypot(...d);
    if(length){
     const c=Math.cos(angle),s=Math.sin(angle);
     moving=move((d[0]*c+d[1]*s)*speed/length,(-d[0]*s+d[1]*c)*speed/length,dt);
    }
   }else if(path.length){
    const [x,z]=pos(),[a,b]=path[0],dx=a-x,dz=b-z,d=Math.hypot(dx,dz);
    const n=Math.min(1,speed/Math.max(d,.0001));
    if(d<.002||clearWalk([x,z],[x+dx*n,z+dz*n])){
     if(d>=.002)moving=move(dx*n,dz*n,dt);
     if(d<=speed+.002)path.shift();
    }else stop();
    if(!path.length){const fn=done;stop();fn?.()}
   }
  }
  if(moving)phase+=dt*16;
  const [x,z]=pos();
  contact.position.set(x,.039,z);
  canvas.dataset.roaming=String(moving);
  canvas.dataset.room=room;
  const {pet:look,pose,action,elapsed,reduced}=snapshot;
  pet.update(look,pose,action,moving,phase,elapsed,reduced);
  const overview=mode==='overview',portrait=mode==='portrait';
  const inspectingBox=portrait&&Boolean(pose.box);
  target.set(overview?4.5:x,portrait?1.1:overview?.45:.38,overview?-4:z);
  if(inspectingBox){
   target.x-=Math.sin(pet.root.rotation.y)*1.18;
   target.z-=Math.cos(pet.root.rotation.y)*1.18;
   target.y=1.36;
  }
  if(!overview&&!portrait){
   target.x=T.MathUtils.lerp(target.x,rooms[room].x,.37);
   target.z=T.MathUtils.lerp(target.z,rooms[room].z,.37);
  }
  const flex=dt===0||reduced?1:1-Math.exp(-dt*6);
  lookAt.lerp(target,flex);
  distance=T.MathUtils.lerp(distance,(overview?Math.max(21.8,26.2/aspect):inspectingBox?5.8:portrait?4.1:11.4)*zoom,flex);
  const standingPitch=inspectingBox?Math.min(1.19,pitch+.33):Math.min(1.515,pitch+.58);
  const pitchNow=portrait?T.MathUtils.lerp(standingPitch,.82,pose.lie):pitch;
  const orbit=22;
  camera.position.copy(lookAt).add(temp.set(Math.sin(angle)*Math.sin(pitchNow)*orbit,Math.cos(pitchNow)*orbit,Math.cos(angle)*Math.sin(pitchNow)*orbit));
  camera.left=-distance*aspect/2;camera.right=-camera.left;camera.top=distance/2;camera.bottom=-camera.top;
  camera.lookAt(lookAt);camera.updateProjectionMatrix();
  roomsGroup.visible=!portrait;
  scene.background=portrait?portraitBackground:houseBackground;
  for(const w of walls)w.high.visible=!portrait&&(w.horizontal?(w.z<0?camera.position.z>w.z:camera.position.z<w.z):(w.x<0?camera.position.x>w.x:camera.position.x<w.x));
  for(const label of Object.values(labels)){label.visible=overview;label.position.y=.73}
  for(const {d,signs} of doorSigns){
   signs[0].visible=!portrait&&!overview&&room===d.b;
   signs[1].visible=!portrait&&!overview&&room===d.a;
  }
  for(const petControl of interact)if(petControl.isSprite)petControl.visible=!portrait;
  pet.view(camera.position);
  renderer.render(scene,camera);
  frame=requestAnimationFrame(animate);
 };
 frame=requestAnimationFrame(animate);
 return {
  command(cmd){
   if(cmd==='overview'||cmd==='portrait'){
    mode=mode===cmd?'home':cmd;zoom=1;
    if(mode==='portrait'){angle=pet.root.rotation.y;pitch=.91}
    else if(mode==='overview'){angle=.49;pitch=.74}
   }
   if(cmd==='three-quarter'){
    mode='portrait';
    angle=pet.root.rotation.y-Math.PI/4;
    pitch=.91;
    zoom=1;
   }
   if(cmd==='left')angle-=Math.PI/4;
   if(cmd==='right')angle+=Math.PI/4;
   if(cmd==='in')zoom=Math.max(.62,zoom*.82);
   if(cmd==='out')zoom=Math.min(1.8,zoom/ .82);
   if(cmd==='reset'){mode='home';angle=.46;pitch=.91;zoom=1}
   return mode;
  },
  stop,
  busy:()=>Boolean(path.length||held.size),
  dispose(){cancelAnimationFrame(frame);renderer.dispose()}
 };
}
