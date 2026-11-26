(function(root) {
 const duration={poke:850,water:2450,sleep:1600,wake:1250,move:2400,bonk:1050,wave:1450,special:1150,
  lonely:2400,tears:1800,concern:3100,calm:3600,hug:1900,cheer:1500,break:2500,
  highfive:1500,peek:1250,peekReveal:2100};
 const strawTip=[-8,-51], grip=[13,-17], sipPoint=[150,130];
 const peekBox={left:109,top:161,right:261,bottom:224};
 const clamp=t=>Math.max(0,Math.min(1,t));
 const ease=t=>{t=clamp(t);return t*t*(3-2*t)};
 const lerp=(a,b,t)=>a+(b-a)*t;
 const ramp=(t,a,b)=>ease((t-a)/(b-a));
 const peak=(t,a,b,c,d)=>ramp(t,a,b)*(1-ramp(t,c,d));
 const actionFaces={
  move:'happy',wave:'waving',special:'excited',lonely:'sad',tears:'cry',
  concern:'concerned',calm:'relaxed',hug:'pleased',cheer:'triumph',break:'yawn'
 };
 // A variant is chosen once per interaction. Timed poses can still override it
 // for contact (sipping, hiding the face) or an intended emotional beat.
 const faceVariants={
  move:['happy','excited'],wave:['waving','wink'],special:['excited','triumph'],
  poke:['curious','pleased'],water:['quenched','relaxed'],sleep:['sleepy','dozing'],wake:['sleepy','dozing'],
  hug:['pleased','bashful'],calm:['relaxed','content'],cheer:['triumph','excited'],
  highfive:['excited','waving'],peekReveal:['wink','happy']
 };
 const variantCount=action=>faceVariants[action]?.length??1;
 const tracks={round:[86,214],square:[84,216],wide:[53,247],petal:[75,225],step:[72,228],pill:[55,245]};
 const point=(x,y)=>[x,y];
 const mix=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
 function rotate([x,y],degrees){
  const angle=degrees*Math.PI/180;
  return [x*Math.cos(angle)-y*Math.sin(angle),x*Math.sin(angle)+y*Math.cos(angle)];
 }
 function headPoint(q,x,y){
  const [u,v]=rotate([(x-150)*q.sx,(y-150)*q.sy],q.r);
  return [150+q.x+u,150+q.y+v];
 }
 function localPoint(q,x,y){
  const [u,v]=rotate([x-150-q.x,y-150-q.y],-q.r);
  return [150+u/q.sx,150+v/q.sy];
 }
 function pose(p,a,ms,reduced=false,variant=0){
  const t=ms/(duration[a]||1), s=Number(p.shape==='wide'||p.shape==='pill');
  const [left,right]=tracks[p.shape]||tracks.round;
  const variantFace=faceVariants[a]?.[variant];
  let x=0,y=0,r=0,sx=1,sy=1,smile=variantFace||actionFaces[a]||p.face,cup=null,bed=0,star=0,prop=null,tear=0,box=null;
  // The neutral pose keeps both hands low and outside the cap silhouette.
  // Action tracks below lift these anchors when the pet needs to gesture.
  const leftRest=point(left-24,174),rightRest=point(right+23,173);
  let lh=leftRest,rh=rightRest;
  let lf=point(114,220),rf=point(184,220),stride=0;
  let handsUp=false;
  if(a==='idle'){
   y=reduced?0:-1.25*(1-Math.cos(ms/570));
   if(!reduced&&ms%4800>4650&&p.face==='dot')smile='blink';
  } else if(a==='water'){
   const lift=peak(t,.17,.44,.70,.92);
   r=5*lift;y=1.5*lift-.55*Math.sin(t*43)*peak(t,.49,.52,.64,.69);
   const mouth=headPoint({x,y,r,sx,sy},...sipPoint);
   const cupAngle=-10*lift;
   const [tipX,tipY]=rotate(strawTip,cupAngle);
   const center=mix([207,207],[mouth[0]-tipX,mouth[1]-tipY],lift);
   const [gripX,gripY]=rotate(grip,cupAngle);
   cup={xy:center,r:cupAngle,grip:[center[0]+gripX,center[1]+gripY],fill:1-.58*ramp(t,.46,.69),alpha:peak(t,.015,.14,.91,.99),reach:peak(t,0,.125,.90,1)};
   smile=t<.44?'curious':t<=.70?'sip':variantFace||'pleased';
  } else if(a==='sleep'||a==='wake'){
   const lie=a==='sleep'?ramp(t,.26,.92):1-ramp(t,.16,.72);
   const sit=peak(lie,0,.4,.47,1);
   const stretch=a==='wake'?peak(t,.43,.72,.83,1):peak(t,0,.13,.22,.43);
   const settle=a==='sleep'?peak(t,.68,.87,.91,1):0;
   bed=a==='sleep'?ramp(t,.08,.33):1-ramp(t,.67,1);
   r=81*lie+5*settle;
   x=-4*lie-11*sit;
   y=-9*lie+12*sit-3*stretch;
   sx=1-.04*lie;
   sy=1-.06*sit;
   lh=mix(lh,point(left-24,113),stretch);
   rh=mix(rh,point(right+24,108),stretch);
   lh=mix(lh,point(left-12,181),lie);
   rh=mix(rh,point(right+8,186),lie);
   lf=mix(lf,point(122,217),lie);
   rf=mix(rf,point(176,216),lie);
   smile=a==='sleep'?(t<.34?'yawn':variantFace||'sleepy'):(t<.30?variantFace||'sleepy':t<.72?'yawn':'sleepy');
   if(a==='sleep'&&t>=1&&!reduced)sx+=.012*(1-Math.cos((ms-duration.sleep)*Math.PI/600));
  } else if(a==='move'){
   const ready=peak(t,0,.08,.1,.22), run=peak(t,.12,.24,.77,.89), stop=peak(t,.81,.91,.93,1);
   const beat=(t-.12)*Math.PI*9;
   stride=run*Math.sin(beat);
   x=21*run*Math.sin(beat*.33);y=8*ready+5*stop-10*run*Math.abs(Math.sin(beat));
   r=7*run+6*stride-8*stop;
   lf=point(114+45*stride,220-31*Math.max(0,-stride));rf=point(184-45*stride,220-31*Math.max(0,stride));
   lh=mix(leftRest,point(left-15-25*stride,142+10*stride),run);
   rh=mix(rightRest,point(right+15-25*stride,139-10*stride),run);
  } else if(a==='poke'){
   const recoil=peak(t,0,.12,.19,.38), curious=peak(t,.26,.44,.73,1);
   r=-9*recoil+7*curious;x=-6*recoil+4*curious;y=2*recoil;
   rh=mix(rh,point(right+4,145),curious);
   smile=t<.34?'wow':variantFace||'curious';
  } else if(a==='bonk'){
   const press=peak(t,0,.10,.15,.42), rub=peak(t,.20,.48,.76,1), rebound=peak(t,.21,.4,.47,.72);
   y=17*press-3*rebound;sy=1-.095*press;r=-6*press+4*rub;x=-4*press;
   rh=mix(rh,point(right-20,77+s*17),rub);lh=mix(lh,point(left-34,154),press);
   star=peak(t,.08,.2,.31,.59);
   smile=t<.39?'pain':'pout';
  } else if(a==='lonely'||a==='tears'){
   const slump=-Math.cos(ms/460)*.7;
   y=8+slump;r=-6;sy=.975;
   lh=[left-8,190];rh=[right+6,189];
   if(a==='tears')tear=ms/1000%1;
  } else if(a==='concern'||a==='calm'||a==='break'||a==='hug'||a==='cheer'){
   const up=peak(t,.03,.23,.79,1);
   if(a==='concern'||a==='calm'){
    r=(a==='concern'?-6:2)*up;y=-3*up;
    rh=mix(rh,[Math.min(right+18,264),132],up);
    prop={kind:a==='concern'?'sign':'breath',alpha:up,phase:ms/360};
   } else if(a==='break'){
    lh=mix(lh,[left-19,112],up);rh=mix(rh,[right+16,110],up);
    y=-8*up;r=4*Math.sin(ms/240)*up;
   } else if(a==='hug'){
    lh=mix(lh,[125,166],up);rh=mix(rh,[175,166],up);
    y=3*up;sy=1-.045*up;
    prop={kind:'heart',alpha:up,phase:ms/360};
   } else {
    rh=mix(rh,[right+14,98+9*Math.sin(ms/140)],up);
    y=-5*up;
   }
  } else if(a==='highfive'){
   const raise=peak(t,.06,.43,.64,.95), tap=peak(t,.42,.49,.52,.69), ready=peak(t,.04,.18,.31,.47);
   x=6*raise;y=5*ready-14*tap;r=-5*ready+6*raise;sy=1-.045*ready;
   rh=mix(rh,[right+39,101-12*tap],raise);
   rf[1]-=13*tap;
   handsUp=raise>.34;
   prop={kind:'highfive',alpha:tap};
  } else if(a==='peek'||a==='peekReveal'){
   const opening=a==='peekReveal';
   const dip=peak(t,.04,.21,.23,.34), hop=peak(t,.21,.42,.44,.66);
   const inside=ramp(t,.49,.85), pop=ramp(t,.03,.29), exit=ramp(t,.59,.85);
   const exitHop=peak(t,.59,.71,.735,.92), land=peak(t,.86,.93,.95,1);
   if(opening){
    x=31*(1-exit);
    y=150-102*pop-48*exit-88*exitHop+6*land;
    r=-5*pop*(1-exit)+7*exitHop;sx=1-.08*exitHop;sy=1-.16*exitHop-.055*land;
    lh=mix(lh,[left-30,111],exitHop);
    rh=mix(rh,[right+27,112],exitHop);
    smile=t<.27?'tiptoe':variantFace||'happy';
   }else{
    x=31*ramp(t,.21,.56);
    y=6*dip-29*hop+150*inside;
    r=-5*dip+9*hop;sy=1-.055*dip+.04*hop;
    lh=mix(lh,[left-26,118],hop);
    rh=mix(rh,[right+27,117],hop);
    smile=t<.31?'tiptoe':'excited';
   }
   box={alpha:opening?1-ramp(t,.89,1):ramp(t,0,.20),
    lid:opening?Math.max(peak(t,.11,.33,.78,.96),.85*exitHop):peak(t,.23,.44,.64,.85),
    thump:opening?.5*land:peak(t,.64,.72,.74,.86),
    clip:opening?t<.735:t>=.51, hidden:opening?t<.05:t>=.86};
  } else if(a==='wave'||a==='special'){
   const up=peak(t,.04,.26,.7,1);
   const hand=point(left-31+8*Math.sin(t*24),93+5*Math.cos(t*24));
   lh=mix(lh,hand,up);r=-3*up;y=-2*up;
  }
  return {x,y,r,sx,sy,smile,cup,bed,box,star,lh,rh,lf,rf,left,right,prop,tear,handsUp};
 }
 const api={pose,duration,variantCount,headPoint,localPoint,rotate,strawTip,sipPoint,peekBox};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.KeycapMotion=api;
})(typeof globalThis==='undefined'?this:globalThis);
