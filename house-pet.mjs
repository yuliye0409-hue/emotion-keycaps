import * as T from './vendor/three.module.min.js';
import {cap as capShape, body as bodyShape, foot as footShape, arms as armShapes, hatBrim, characterMaterial} from './kali-model.mjs';

const sphere=new T.SphereGeometry(1,28,18);
const color=value=>new T.MeshBasicMaterial({color:value});
function mesh(parent,geometry,material,x=0,y=0,z=0){
 const m=new T.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m;
}
function blob(parent,material,x,y,z,a,b,c){
 const m=mesh(parent,sphere,material,x,y,z);m.scale.set(a,b,c);return m;
}
function group(parent,x=0,y=0,z=0){
 const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;
}
function loft(rings,split=Infinity,edgeSteps=1){
 const vertices=[],indices=[],count=4*(11+edgeSteps),geo=new T.BufferGeometry();
 for(const [y,w,d,r,arch=0] of rings){
  const points=[];
  for(let q=0;q<4;q++)for(let i=0;i<12;i++){
   const a=(q+i/11)*Math.PI/2;
   const x=Math.sign(Math.cos((q+.5)*Math.PI/2))*(w-r)+r*Math.cos(a);
   const z=Math.sign(Math.sin((q+.5)*Math.PI/2))*(d-r)+r*Math.sin(a);
   points.push([x,z]);
  }
  for(const [i,[x,z]] of points.entries()){
   vertices.push(x,y+(w?arch*(x/w)**2:0),z);
   if((i+1)%12===0){
    const [nextX,nextZ]=points[(i+1)%48];
    for(let step=1;step<edgeSteps;step++){
     const fraction=step/edgeSteps,edgeX=T.MathUtils.lerp(x,nextX,fraction);
     vertices.push(edgeX,y+(w?arch*(edgeX/w)**2:0),T.MathUtils.lerp(z,nextZ,fraction));
    }
   }
  }
 }
 for(let j=0;j<rings.length-1;j++){
  const off=indices.length;
  for(let i=0;i<count;i++){
   const a=j*count+i,b=j*count+(i+1)%count;
   indices.push(a,a+count,b,b,a+count,b+count);
  }
  geo.addGroup(off,indices.length-off,j<split?0:1);
 }
 geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
 geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
function surfaceArtwork(){
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=512;
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
 return {canvas,map,key:'',request:0,direction:{value:new T.Vector2(0,1)}};
}
const expandedOutlines=new WeakMap();
function outline(object,stroke,thickness){
 let cached=expandedOutlines.get(object.geometry);
 if(!cached)expandedOutlines.set(object.geometry,cached=new Map());
 if(cached.has(thickness))return attachOutline(object,cached.get(thickness),stroke);
 const geo=object.geometry.clone(),p=geo.getAttribute('position'),n=geo.getAttribute('normal');
 // Beveled extrusions duplicate vertices at face boundaries. Push all
 // copies in the same direction to keep the ink line closed.
 const normals=new Map(),keys=[],direction=new T.Vector3();
 for(let i=0;i<p.count;i++){
  const key=[p.getX(i),p.getY(i),p.getZ(i)].map(value=>Math.round(value*100000)).join(',');
  if(!normals.has(key))normals.set(key,new T.Vector3());
  normals.get(key).add(direction.fromBufferAttribute(n,i));
  keys.push(key);
 }
 for(const value of normals.values())value.normalize().multiplyScalar(thickness);
 for(let i=0;i<p.count;i++){
  direction.fromBufferAttribute(p,i).add(normals.get(keys[i]));
  p.setXYZ(i,...direction);
 }
 geo.computeBoundingSphere();
 cached.set(thickness,geo);
 return attachOutline(object,geo,stroke);
}
function attachOutline(object,geo,stroke){
 const border=mesh(object,geo,stroke);
 border.renderOrder=stroke.stencilWrite?2:-1;
 border.raycast=()=>{};
 return border;
}
const box=(p,m,x,y,z,w,h,d)=>mesh(p,new T.BoxGeometry(w,h,d),m,x,y,z);
const tube=(p,m,points,r)=>mesh(p,new T.TubeGeometry(new T.CatmullRomCurve3(points.map((v)=>new T.Vector3(...v))),16,r,8,false),m);
function kit(parent,id,m){
 if(id==='none')return;
 if(id==='sprout'||id==='antenna'){
  tube(parent,m,[[.16,2.20,0],[.16,2.34,0],[.19,2.46,0]],.036);
  if(id==='antenna')blob(parent,m,.19,2.47,0,.09,.09,.09);
  else for(const s of [-1,1])blob(parent,m,.18+s*.095,2.43,0,.14,.06,.045).rotation.z=s*.54;
 }else if(id==='scarf'||id==='badge'){
  if(id==='scarf'){
   const ring=mesh(parent,new T.TorusGeometry(.53,.095,12,44),m,0,.62,.018);
   ring.rotation.x=Math.PI/2;ring.scale.y=.75;
   blob(parent,m,.27,.59,.48,.11,.105,.08);
   blob(parent,m,.32,.47,.49,.088,.19,.045).rotation.z=.24;
  }else blob(parent,m,0,.45,.456,.105,.1,.04);
 }else if(id==='headphones'){
  tube(parent,m,[[-.84,1.58,-.05],[-.63,2.14,-.05],[0,2.25,-.05],[.63,2.14,-.05],[.84,1.58,-.05]],.058);
  for(const s of [-1,1])blob(parent,m,s*.84,1.51,0,.13,.24,.25);
 }else if(id==='glasses'){
  for(const x of [-.31,.31]){
   const frame=mesh(parent,new T.TorusGeometry(.237,.022,10,32),m,x,1.52,.696);
   frame.rotation.x=-.16;frame.scale.y=1.11;
  }
  tube(parent,m,[[-.08,1.54,.70],[0,1.58,.69],[.08,1.54,.70]],.019);
 }else if(id==='bow'){
  for(const s of [-1,1])blob(parent,m,.59+s*.11,2.14,.44,.125,.075,.045).rotation.z=s*.43;
  blob(parent,m,.59,2.14,.47,.073,.069,.052);
 }else{
  const s=new T.Shape(),n=id==='star'?10:id==='patch'?4:8;
  for(let i=0;i<n;i++){
   const a=Math.PI/2+i*Math.PI*2/n,r=id==='star'&&i%2?.064:.143;
   s[i?'lineTo':'moveTo'](Math.cos(a)*r,Math.sin(a)*r);
  }
  s.closePath();
  const emblem=mesh(parent,new T.ExtrudeGeometry(s,{depth:.022,bevelSize:.012,bevelThickness:.008,bevelSegments:2}),m,.60,1.94,.575);
  emblem.rotation.z=-.17;
 }
}
export function makePet(parent){
 const root=group(parent),lean=group(root),cap=group(lean);
 const face=surfaceArtwork(),legend=surfaceArtwork(),belly=surfaceArtwork();
 const characterView={value:new T.Vector3(0,0,1)};
 const mats=Object.fromEntries(['shell','top','rim','legs','feet','arms','hands','accessory'].map(k=>[k,color('#a391e6')]));
 const ink=new T.MeshBasicMaterial({color:'#291e44',side:T.BackSide,stencilWrite:true,stencilRef:1,
  stencilFunc:T.NotEqualStencilFunc,stencilFail:T.KeepStencilOp,stencilZFail:T.KeepStencilOp,stencilZPass:T.KeepStencilOp});
 const pigments={
  skin:new T.Color('#a391e6'),pale:new T.Color('#e6dbff'),rim:new T.Color('#927ed8'),seam:new T.Color('#65529c'),
  sole:new T.Color('#8e79d4'),brimUnder:new T.Color('#cbbdf1'),brimEdge:new T.Color('#907fb6'),
  sideInk:new T.Color('#645592'),topHighlight:new T.Color('#f8f0fa'),footHighlight:new T.Color('#c6b9dc'),
  bodyColor:new T.Color('#a391e6'),handColor:new T.Color('#a391e6'),armColor:new T.Color('#a391e6'),
  shellGlint:new T.Color('#b8a9e7'),faceArt:face.map,hatArt:legend.map,bodyArt:belly.map
 };
 const makeMaterial=(mode,side=0,view=characterView)=>characterMaterial(mode,
  Object.fromEntries(Object.entries(pigments).map(([name,value])=>[name,value.isColor?value.clone():value])),view,side);
 const armViews=[-1,1].map(()=>({value:new T.Vector3(0,0,1)}));
 const armMaterials=[-1,1].map((side,i)=>makeMaterial(4,side,armViews[i]));
 const caps=[];
 const body=mesh(lean,bodyShape,makeMaterial(1));
 outline(body,ink,.018);caps.push(body);
 const arms=armShapes.map((shape,i)=>{
  const shoulder=group(lean,i?.51:-.51,.53,.025);
  const hand=mesh(shoulder,shape,armMaterials[i],-shoulder.position.x,-shoulder.position.y,-shoulder.position.z);
  outline(hand,ink,.018);
  return shoulder;
 });
 const feet=[-1,1].map((s,i)=>{
  const item=mesh(lean,footShape,makeMaterial(3));
  item.position.x=s*.307;item.position.z=i===0?-.066:.079;
  outline(item,ink,.018);caps.push(item);return item;
 });
 const capMaterial=makeMaterial(0),brimMaterial=makeMaterial(2);
 const shell=mesh(cap,capShape,capMaterial);outline(shell,ink,.025);caps.push(shell);
 const brim=mesh(cap,hatBrim,brimMaterial);outline(brim,ink,.018);caps.push(brim);
 const materials=[body.material,...armMaterials,...feet.map(m=>m.material),capMaterial,brimMaterial];
 const colorUniform=(name,value)=>materials.forEach(m=>m.uniforms[name].value.set(value));
 const setArtwork=(target,key,viewBox,content)=>{
  if(target.key===key)return;
  target.key=key;
  const version=++target.request,img=new Image();
  img.onload=()=>{
   if(version!==target.request)return;
   const ctx=target.canvas.getContext('2d');
   ctx.clearRect(0,0,target.canvas.width,target.canvas.height);ctx.drawImage(img,0,0,target.canvas.width,target.canvas.height);target.map.needsUpdate=true;
  };
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(
   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+viewBox+'" width="'+target.canvas.width+'" height="'+target.canvas.height+'" preserveAspectRatio="none">'+content+'</svg>');
 };
 const props=group(root),blanketMat=color('#b7a1da'),wood=color('#d9a180'),soft=color('#efd2ce'),ivory=color('#fff3db');
 const sleep=group(props);
 const bed=mesh(sleep,loft([[0,.82,1.25,.19],[.04,.97,1.39,.20],[.20,1.01,1.42,.21],
  [.26,.97,1.37,.22],[.275,.80,1.22,.22],[.28,0,0,0]]),soft);
 outline(bed,ink,.019);
 outline(blob(sleep,ivory,0,.306,-1.04,.91,.113,.38),ink,.025);
 const quilt=mesh(sleep,loft([
  [.29,.87,.50,.21],[.36,.98,.66,.20],[.58,.98,.66,.23],
  [.84,.91,.59,.23],[.98,.77,.46,.25],[1.04,.55,.29,.19],[1.06,0,0,0]
 ]),blanketMat,0,0,.66);
 outline(quilt,ink,.021);
 const water=group(lean,.63,.69,.75);
 outline(mesh(water,new T.CylinderGeometry(.187,.145,.32,32),color('#a5e0e9'),0,.05,0),ink,.018);
 outline(mesh(water,new T.CylinderGeometry(.191,.186,.027,32),color('#59abc6'),0,.218,0),ink,.012);
 tube(water,color('#e383a7'),[[0,.19,.026],[0,.393,.026],[-.056,.447,.005],[-.383,.447,-.097]],.025);
 tube(water,color('#e1fbff'),[[-.096,.147,.153],[-.08,-.031,.137]],.013);
 const mitt=blob(water,mats.hands,.156,.021,.092,.112,.089,.106);
 outline(mitt,ink,.108);
 const reachArm=blob(lean,mats.arms,0,0,0,.11,.25,.105);
 outline(reachArm,ink,.096);
 const armStart=new T.Vector3(),armEnd=new T.Vector3(),armUp=new T.Vector3(0,1,0),armDirection=new T.Vector3();
 const hide=group(props,0,0,-1.68),hideLid=group(hide,0,.88,-1.12);
 const cardboardEdge=new T.LineBasicMaterial({color:'#785367'});
 function panel(group,x,y,z,w,h,d,material=wood){
  const piece=box(group,material,x,y,z,w,h,d);
  piece.add(new T.LineSegments(new T.EdgesGeometry(piece.geometry),cardboardEdge));
  return piece;
 }
 for(const s of [-1,1]){
  panel(hide,s*1.39,.43,0,.105,.86,2.24);
  panel(hide,0,.43,s*1.07,2.675,.86,.10);
 }
 panel(hide,0,.042,0,2.85,.084,2.24);
 panel(hideLid,0,0,1.12,2.86,.09,2.28);
 box(hideLid,ivory,0,.052,1.14,.22,.018,2.22);
 const book=group(lean,0,.52,.59);book.rotation.x=-.31;
 for(const s of [-1,1]){
  const leaf=group(book);leaf.rotation.z=s*.14;
  box(leaf,blanketMat,s*.17,0,0,.34,.36,.061);
  box(leaf,ivory,s*.168,.016,.036,.317,.312,.024);
 }
 const cook=group(props,1.15,0,.55),pot=group(cook,0,.5,0);
 box(cook,wood,0,.38,0,.79,.12,.66);
 for(const s of [-1,1])box(cook,wood,s*.32,.17,0,.10,.33,.54);
 mesh(pot,new T.CylinderGeometry(.294,.196,.27,32),color('#d97965'),0,.06,0);
 mesh(pot,new T.CylinderGeometry(.28,.28,.027,32),color('#f4c175'),0,.192,0);
 const spoon=blob(pot,wood,.06,.28,0,.05,.263,.051);
 const steam=Array.from({length:3},(_,i)=>blob(pot,new T.MeshBasicMaterial({color:'#fff4d9',transparent:true,opacity:.42,depthWrite:false}),-.13+.13*i,.47,0,.036,.095,.036));
 const toast=box(cook,color('#cf8756'),0,.517,0,.45,.10,.3);toast.rotation.y=.20;
 box(toast,color('#cb6b8c'),0,.06,0,.33,.023,.21);
 const heart=group(props,0,1.15,.79),heartMat=color('#e98aaa');
 blob(heart,heartMat,-.083,.048,0,.112,.112,.055);
 blob(heart,heartMat,.083,.048,0,.112,.112,.055);
 box(heart,heartMat,0,-.034,0,.213,.213,.1).rotation.z=Math.PI/4;
 const pulse=mesh(props,new T.TorusGeometry(.13,.022,8,28),color('#80baab'),.91,1.25,.56);
 const star=mesh(props,new T.TorusGeometry(.14,.033,8,5),color('#edb65d'),.81,1.75,.51);
 let kitId,kitGroup=group(lean),lookKey,paint;
 const boxFloorClip=new T.Plane(new T.Vector3(0,1,0),100);
 lean.traverse(object=>{
  if(object.isMesh)for(const material of [object.material].flat())material.clippingPlanes=[boxFloorClip];
 });
 mats.accessory.clippingPlanes=[boxFloorClip];
 function update(p,q,action,moving,phase,ms,reduced){
  const key=JSON.stringify([p.color,p.palette,p.accessory]);
  if(key!==lookKey){
   lookKey=key;
   paint=globalThis.KeycapArt.partColors(p);
   for(const [id,m] of Object.entries(mats))m.color.set(paint[id]);
   if(!p.palette?.rim)mats.rim.color.lerp(mats.shell.color,.49);
   ink.color.set(paint.outline);
   const mix=(a,b,amount)=>'#'+new T.Color(a).lerp(new T.Color(b),amount).getHexString();
   const tint=mix(paint.top,paint.glints,.65);
   const seam=mix(paint.outline,paint.shell,.29);
   colorUniform('skin',paint.shell);colorUniform('pale',paint.top);colorUniform('rim',paint.rim);
   colorUniform('seam',seam);colorUniform('sole',paint.feet);colorUniform('sideInk',mix(paint.legs,paint.outline,.54));
   colorUniform('brimUnder',mix(paint.top,paint.shell,.17));colorUniform('brimEdge',mix(paint.top,paint.outline,.32));
   colorUniform('topHighlight',tint);colorUniform('footHighlight',mix(paint.feet,paint.glints,.54));
   colorUniform('footTone',paint.legs);colorUniform('bodyColor',paint.legs);
   colorUniform('handColor',paint.hands);colorUniform('armColor',paint.arms);
   colorUniform('shellGlint',mix(paint.shell,paint.glints,.21));
   setArtwork(belly,key,'80 168 143 45',
    '<path d="M117 182C124 174 161 174 176 179C185 183 185 191 173 194C158 199 137 198 122 194Q112 191 117 182Z" fill="'+mix(paint.legs,paint.glints,.21)+'"/>');
  }
  const printKey=JSON.stringify([p.key,paint.legend]);
  if(legend.key!==printKey)setArtwork(legend,printKey,'68 32 155 116',
   globalThis.KeycapArt.legend(p.key,paint.legend)+'<path d="M182 52h9m-7 4h5" fill="none" stroke="'+paint.legend+'" stroke-width="1.65" stroke-linecap="round"/>');
  if(kitId!==p.accessory){
   kitId=p.accessory;
   const released=new Set();
   kitGroup.traverse(obj=>{if(obj.isMesh&&obj.geometry!==sphere)released.add(obj.geometry)});
   for(const geo of released)geo.dispose();
   kitGroup.clear();kit(kitGroup,kitId,mats.accessory);
  }
  const faceKey=JSON.stringify([key,q.smile]);
  if(face.key!==faceKey){
   const cheeks='<path d="M88 129Q92 123 106 126Q113 130 106 135Q94 139 88 133ZM197 130Q203 125 214 128Q221 131 216 136Q207 140 198 135Z" fill="'+paint.cheeks+'"/>';
   const expression=globalThis.KeycapArt.expression(q.smile,paint);
   setArtwork(face,faceKey,'74 64 152 96',cheeks+expression);
  }
  const step=moving&&!reduced?Math.sin(phase):0;
  lean.position.set(q.x*.013,Math.abs(step)*.1-q.y*.011,0);
  lean.rotation.set(q.lie?-Math.PI*.49*q.lie:0,0,-q.r*.014+step*.041);
  lean.position.y+=q.lie*.94;lean.position.z+=q.lie*.91;
  lean.scale.set(q.sx,1+(q.sy-1)*(1-q.lie),1-.23*q.lie);
  feet.forEach((m,i)=>{
   const n=i?1:-1,base=i?q.rf:q.lf;
   m.position.y=Math.max(0,step*n)*.08;
   m.position.z=(i===0?-.066:.079)+step*n*.125;
   m.rotation.x=step*n*.31+(220-base[1])*.009;
  });
  arms.forEach((m,i)=>{
   const s=i?1:-1,a=i?q.rh:q.lh;
   m.rotation.z=s*(a[1]<(i?171:173)?Math.min((174-a[1])*.014,.64):0);
   m.rotation.x=step*s*.31;
  });
  if(q.cup){
   const reach=q.cup.reach;
   water.position.set(.69-.274*reach,.38+.169*reach,.43+.526*reach);
   water.rotation.z=.09*(1-reach);
   armStart.set(.69,.424,.225);
   armEnd.copy(water.position).add(mitt.position);
   reachArm.position.lerpVectors(armStart,armEnd,.5);
   armDirection.subVectors(armEnd,armStart);
   reachArm.scale.y=armDirection.length()*.61;
   reachArm.quaternion.setFromUnitVectors(armUp,armDirection.normalize());
  }
  water.visible=Boolean(q.cup?.alpha>.18);
  reachArm.visible=water.visible;
  arms[1].visible=!water.visible;
  lean.visible=true;
  boxFloorClip.constant=q.box?-.08:100;
  if(q.box){
   const timing=globalThis.KeycapMotion.duration[action];
   const t=reduced?(action==='peek'?1:.44):ms/timing;
   const ease=(start,end)=>T.MathUtils.smoothstep(t,start,end);
   const reveal=action==='peekReveal';
   const crossing=reveal?ease(.67,.85):ease(.30,.52);
   const lift=reveal?ease(.58,.67)*(1-ease(.86,.98)):ease(.19,.30)*(1-ease(.53,.66));
   const sink=reveal?1-ease(.23,.40):ease(.65,.82);
   const glance=.53*ease(.23,.40)*(1-ease(.60,.69));
   const height=reveal?-.85-.84*sink+glance+1.92*lift+.85*ease(.82,.98):1.07*lift-1.48*sink;
   lean.position.set(0,height,-1.68*(reveal?1-crossing:crossing));
   lean.rotation.z=-(reveal?-.07:.09)*lift;
   lean.visible=reveal?t>=.23:t<.82;
   const lid=reveal?ease(.01,.20)*(1-ease(.90,1)):ease(.09,.19)*(1-ease(.74,.94));
   hideLid.rotation.x=-2.03*lid;
  }
  hide.visible=Boolean(q.box?.alpha>.18);
  sleep.visible=q.bed>.25;
  quilt.scale.y=1+(reduced?0:Math.sin(ms/440)*.025);
  quilt.visible=q.lie>.52;
  body.visible=true;
  for(const limb of caps)limb.visible=true;
  bed.visible=sleep.visible;
  book.visible=q.prop?.kind==='book'&&q.prop.alpha>.2;
  cook.visible=q.prop?.kind==='cook'&&q.prop.alpha>.2;
  pot.visible=p.dish!=='toast';toast.visible=!pot.visible;
  if(cook.visible){
   const stirred=q.prop.stage==='stir';
   spoon.rotation.z=Math.sin(ms/125)*.43;
   spoon.visible=stirred;
   toast.rotation.x=stirred?Math.sin(ms/170)*.28:0;
   for(const [i,m] of steam.entries()){
    m.visible=q.prop.stage!=='prep';m.position.y=.42+((ms/700+i*.33)%1)*.25;
   }
  }
  heart.visible=Boolean(q.prop?.kind==='heart'&&q.prop.alpha>.2);
  pulse.visible=Boolean(q.prop?.kind==='breath'&&q.prop.alpha>.2);
  pulse.scale.setScalar(1+.38*Math.sin(ms/390));
  star.visible=q.star>.3||q.prop?.kind==='highfive'&&q.prop.alpha>.3;
  star.rotation.z=ms/280;
 }
 const armRotation=new T.Quaternion(),cameraDirection=new T.Vector3();
 function view(cameraPosition){
  cameraDirection.subVectors(cameraPosition,root.position).setY(0).normalize();
  arms.forEach((arm,i)=>{
   arm.getWorldQuaternion(armRotation).invert();
   armViews[i].value.copy(cameraDirection).applyQuaternion(armRotation).setY(0).normalize();
  });
 }
 return {root,update,view};
}
