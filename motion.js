(function(root) {
 const duration={poke:850,water:2450,sleep:1600,wake:1250,move:2400,bonk:1050,wave:1450,special:1150,
  lonely:2400,tears:1800,concern:3100,calm:3600,hug:1900,cheer:1500,break:2500};
 const strawTip=[10,-51], grip=[-13,-17];
 const clamp=t=>Math.max(0,Math.min(1,t));
 const ease=t=>{t=clamp(t);return t*t*(3-2*t)};
 const lerp=(a,b,t)=>a+(b-a)*t;
 const ramp=(t,a,b)=>ease((t-a)/(b-a));
 const peak=(t,a,b,c,d)=>ramp(t,a,b)*(1-ramp(t,c,d));
 const actionFaces={
  move:'happy',wave:'dot',special:'excited',lonely:'sad',tears:'cry',
  concern:'concerned',calm:'relaxed',hug:'pleased',cheer:'triumph',break:'yawn'
 };
 const tracks={round:[86,214],square:[84,216],wide:[53,247],petal:[75,225],step:[72,228],pill:[55,245]};
 const point=(x,y)=>[x,y];
 const mix=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
 const faceOffset=shape=>shape==='pill'?8:shape==='square'?-5:0;
 function rotate([x,y],degrees){
  const angle=degrees*Math.PI/180;
  return [x*Math.cos(angle)-y*Math.sin(angle),x*Math.sin(angle)+y*Math.cos(angle)];
 }
 function headPoint(q,x,y){
  const [u,v]=rotate([(x-150)*q.sx,(y-150)*q.sy],q.r);
  return [150+q.x+u,150+q.y+v];
 }
 function pose(p,a,ms,reduced=false){
  const t=ms/(duration[a]||1), s=Number(p.shape==='wide'||p.shape==='pill');
  const [left,right]=tracks[p.shape]||tracks.round;
  let x=0,y=0,r=0,sx=1,sy=1,smile=actionFaces[a]||p.face,cup=null,bed=0,star=0,prop=null,tear=0;
  let lh=point(left-24,176),rh=point(right+24,168);
  let lf=point(104,220),rf=point(196,220),stride=0;
  if(a==='idle'){
   y=reduced?0:-1.25*(1-Math.cos(ms/570));
   if(!reduced&&ms%4800>4650&&p.face!=='sleepy')smile='blink';
  } else if(a==='water'){
   const lift=peak(t,.25,.49,.68,.86), hold=peak(t,.06,.25,.86,.98);
   r=6*lift;y=3*lift-.9*Math.sin(t*61)*peak(t,.51,.54,.63,.67);
   const mouth=headPoint({x,y,r,sx,sy},150,130+faceOffset(p.shape));
   const cupAngle=-12*lift;
   const [tipX,tipY]=rotate(strawTip,cupAngle);
   const center=mix([Math.min(right+37,276),220],[mouth[0]-tipX,mouth[1]-tipY],lift);
   const [gripX,gripY]=rotate(grip,cupAngle);
   cup={xy:center,r:cupAngle,fill:1-.58*ramp(t,.51,.67),alpha:peak(t,0,.1,.92,1)};
   rh=mix(rh,[center[0]+gripX,center[1]+gripY],hold);
   if(t>=.49)smile=t<=.68?'sip':'pleased';
  } else if(a==='sleep'||a==='wake'){
   const q=a==='sleep'?ramp(t,.25,1):1-ramp(t,.16,.73);
   const stretch=a==='wake'?peak(t,.34,.64,.75,1):peak(t,0,.19,.27,.43);
   bed=q; r=-10*q;y=20*q-4*stretch;x=-13*q; sy=1-.045*q;
   lh=mix(lh,point(left-23,111),stretch);rh=mix(rh,point(right+24,106),stretch);
   lh=mix(lh,point(99,191),q);rh=mix(rh,point(186,198),q);
   lf=mix(lf,point(102,222),q);rf=mix(rf,point(160,220),q);
   smile=a==='sleep'?(t<.42?'yawn':'sleepy'):(t<.34?'sleepy':'yawn');
   if(a==='sleep'&&t>=1&&!reduced)y+=Math.sin(ms/520)*1.25;
  } else if(a==='move'){
   const ready=peak(t,0,.08,.1,.22), run=peak(t,.12,.24,.77,.89), stop=peak(t,.81,.91,.93,1);
   const beat=(t-.12)*Math.PI*9;
   stride=run*Math.sin(beat);
   x=21*run*Math.sin(beat*.33);y=8*ready+5*stop-10*run*Math.abs(Math.sin(beat));
   r=7*run+6*stride-8*stop;
   lf=point(104+48*stride,220-31*Math.max(0,-stride));rf=point(196-48*stride,220-31*Math.max(0,stride));
   lh=point(left-15-25*stride,167-25*run+10*stride);rh=point(right+15-25*stride,165-26*run-10*stride);
  } else if(a==='poke'){
   const recoil=peak(t,0,.12,.19,.38), curious=peak(t,.26,.44,.73,1);
   r=-9*recoil+7*curious;x=-6*recoil+4*curious;y=2*recoil;
   rh=mix(rh,point(right+4,145),curious);
   smile=t<.34?'wow':'curious';
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
  } else if(a==='wave'||a==='special'){
   const up=peak(t,.04,.26,.7,1);
   const hand=point(right+17+11*Math.sin(t*24),100+5*Math.cos(t*24));
   rh=mix(rh,hand,up);r=3*up;y=-2*up;
  }
  return {x,y,r,sx,sy,smile,cup,bed,star,lh,rh,lf,rf,left,right,prop,tear};
 }
 const api={pose,duration,faceOffset,headPoint,rotate,strawTip,grip};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.KeycapMotion=api;
})(typeof globalThis==='undefined'?this:globalThis);
