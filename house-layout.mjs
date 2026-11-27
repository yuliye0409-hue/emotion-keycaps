export const rooms={
 living:{name:'客厅',id:'living',x:0,z:0,w:9,d:8,floor:'#d7a585',rug:'#bcaed9',walls:'#e8d8ce',spot:[-1.1,1.3]},
 kitchen:{name:'厨房',id:'kitchen',x:9,z:0,w:9,d:8,floor:'#dba27d',rug:'#eec08c',walls:'#e5e5c8',spot:[9.8,0.1]},
 study:{name:'复习桌',id:'bean',x:0,z:-8,w:9,d:8,floor:'#ea9b73',rug:'#f5bf66',walls:'#b6d9ed',spot:[0,-7.6]},
 bedroom:{name:'卧室',id:'bedroom',x:9,z:-8,w:9,d:8,floor:'#b9a1b5',rug:'#e4bbbe',walls:'#d8d0e8',spot:[8.20,-7.6]}
};
export const doors=[
 {a:'living',b:'kitchen',x:4.5,z:.45,axis:'x'},
 {a:'living',b:'study',x:-.3,z:-4,axis:'z'},
 {a:'kitchen',b:'bedroom',x:9.1,z:-4,axis:'z'},
 {a:'study',b:'bedroom',x:4.5,z:-7.3,axis:'x'}
];
export const furnishings={
 living:[[-2.75,-1.5,2.4,1.05],[2.15,-1.5,1.55,1.25],[-3.3,2.65,1.1,1.1]],
 kitchen:[[9.1,2.85,5.4,1.08],[11.9,-1.5,1.2,1.2]],
 study:[[-2.8,-10.05,2.3,1.25],[2.97,-10.75,1.18,.57]],
 bedroom:[[10.95,-9.1,2.65,2.9],[7.1,-10.45,1.1,1.0]]
};
export const doorOpening={halfWidth:1.37,height:2.50};
const petRadius=.43,doorClearance=1.11;
export const roomAt=(x,z)=>x<4.5?(z<-4?'study':'living'):(z<-4?'bedroom':'kitchen');
const inRect=(x,z,[a,b,w,d],pad)=>Math.abs(x-a)<w/2+pad&&Math.abs(z-b)<d/2+pad;
export function canStand(x,z){
 if(x< -4.5+petRadius||x>13.5-petRadius||z< -12+petRadius||z>4-petRadius)return false;
 for(const [axis,boundary] of [['x',4.5],['z',-4]]){
  const v=axis==='x'?x:z, other=axis==='x'?z:x, along=axis==='x'?'z':'x';
  if(Math.abs(v-boundary)<petRadius+.075&&!doors.some(d=>d.axis===axis&&Math.abs(d[along]-other)<doorOpening.halfWidth-doorClearance))return false;
 }
 return !furnishings[roomAt(x,z)].some(rect=>inRect(x,z,rect,petRadius));
}
const step=.2,W=90,H=80, left=-4.5,top=-12;
const point=i=>[left+(i%W+.5)*step,top+(Math.floor(i/W)+.5)*step];
const walkable=Uint8Array.from({length:W*H},(_,i)=>Number(canStand(...point(i))));
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function nearest(p){
 let best=-1,range=Infinity;
 for(let i=0;i<walkable.length;i++)if(walkable[i]){
  const d=dist(p,point(i));
  if(d<range){best=i;range=d}
 }
 return best;
}
export function clearWalk(a,b){
 const n=Math.ceil(dist(a,b)/.07);
 for(let k=1;k<=n;k++)if(!canStand(a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n))return false;
 return true;
}
export function walkPath(from,to){
 const start=nearest(from),end=nearest(to);
 const target=canStand(...to)&&clearWalk(point(end),to)?to:point(end);
 if(clearWalk(from,target))return [target];
 const prev=new Int16Array(W*H).fill(-1),queue=[start];
 prev[start]=start;
 for(let j=0;j<queue.length&&prev[end]===-1;j++){
  const v=queue[j],x=v%W;
  for(const d of [x>0?-1:0,x<W-1?1:0,-W,W]){
   const i=v+d;
   if(!walkable[i]||prev[i]!==-1)continue;
   prev[i]=v;queue.push(i);
  }
 }
 if(prev[end]===-1)return [];
 const raw=[target];
 for(let i=end;;i=prev[i]){
  raw.push(point(i));
  if(i===start)break;
 }
 raw.reverse();
 const route=[];
 for(let i=0;i<raw.length;){
  let j=raw.length-1;
  const p=route.at(-1)??from;
  while(j>i&&!clearWalk(p,raw[j]))j--;
  if(!clearWalk(p,raw[j]))return [];
  route.push(raw[j]);i=j+1;
 }
 return route;
}
