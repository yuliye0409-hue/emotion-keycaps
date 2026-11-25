(() => {
  const esc = s => String(s).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const profiles = {
    round:'M99 53Q107 34 131 34h39q24 0 32 19l25 86q6 20-16 25H89q-22-5-16-25Z',
    square:'M105 25h87q17 0 21 17l15 111q0 19-18 19H88q-18 0-17-19L87 42q4-17 18-17Z',
    wide:'M68 55h162q17 0 22 15l15 67q4 19-17 21H49q-19-2-16-21l14-67q5-15 21-15Z',
    petal:'M82 58q-4-24 20-27 19-2 32 14 20-28 44-11 12 8 13 22 35-10 41 17 3 12-5 25l16 38q8 25-17 30H76q-23-5-17-29l16-39Q63 72 82 58Z',
    step:'M110 47V32h83v38h30v36h20v47q0 17-16 17H76q-17 0-17-17v-47h19V70h32Z',
    pill:'M94 76h109q27 0 43 22l19 32q12 25-15 33H51q-27-8-15-33l19-32q14-22 39-22Z'
  };
  const tops={
    round:'M107 59q5-14 26-14h36q20 0 25 14l5 14q2 7-7 7h-84q-9 0-7-7Z',
    square:'M104 38h92q6 0 7 8l2 15q0 6-7 6h-96q-6 0-5-6l2-15q1-8 5-8Z',
    wide:'M68 65h164l6 20H62Z',
    petal:'M91 65q-4-17 13-20 19-2 32 17 20-30 39-16 8 6 9 17 25-12 35 4l-3 9H89Z',
    step:'M116 40h68v17h-68zm-30 39h128v13H86Z',
    pill:'M94 86h113q21 0 34 20H60q14-20 34-20Z'
  };
  const eye=(x,y)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="7.5" ry="12" fill="#fff9ea"/>';
  function face(faceId) {
    const stroke='stroke="#fff9ea" stroke-width="4.5" fill="none" stroke-linecap="round"';
    const arc=(d)=>'<path d="'+d+'" '+stroke+'/>';
    const pairs={
      sleepy:arc('M119 113q10 9 20 0m22 0q10 9 20 0'),
      flat:eye(130,117)+eye(170,117)+'<path fill="#28252e" d="M119 104h22v10h-22zm40 0h22v10h-22z"/>',
      wink:eye(130,111)+arc('M161 113q10-12 20 0'),
      happy:arc('M120 113q9-13 18 0m24 0q9-13 18 0'),
      dizzy:arc('M122 106l14 14m0-14-14 14m42-14 14 14m0-14-14 14'),
      sip:arc('M120 110q9 7 18 0m24 0q9 7 18 0'),
      blink:arc('M120 114h15m30 0h15'),
      yawn:arc('M120 111q9 7 18 0m24 0q9 7 18 0'),
      wow:eye(128,109)+eye(171,109),
      sad:eye(130,115)+eye(170,115)+arc('M122 103l15-6m26 0 15 6'),
      cry:arc('M120 111l15 6m30 0 15-6'),
      fierce:arc('M120 105l15 7m30 0 15-7')+eye(130,117)+eye(170,117),
    };
    const mouths={sleepy:'M147 133h7',flat:'M146 130h9',dizzy:'M142 133q7-7 15 0',sad:'M143 135q7-8 14 0',fierce:'M142 133q8-7 16 0'};
    return '<g class="gaze-eyes">'+(pairs[faceId]||eye(130,111)+eye(170,111))+'</g>'+(faceId==='sip'?'<circle cx="150" cy="130" r="4.5" fill="#ffd4b5"/>':faceId==='yawn'?'<ellipse cx="150" cy="130" rx="7" ry="9" fill="#ffd4b5"/>':faceId==='wow'?'<circle cx="150" cy="132" r="5" fill="#ffd4b5"/>':arc(mouths[faceId]||'M143 129q7 9 15 0'));
  }
  function kit(id) {
    return ({
      scarf:'<path d="M100 152q50 18 100 0l-8 17q-19 9-33 8l-6 22-19-1 7-21q-24-1-37-8Z" fill="#ef6179" stroke="#28252e" stroke-width="3"/><path d="m135 190 19 2" stroke="#ffae9e" stroke-width="4"/>',
      badge:'<path d="m201 124 13 13" stroke="#28252e" stroke-width="4"/><rect x="197" y="135" width="24" height="26" rx="3" fill="#fcffe1" stroke="#28252e" stroke-width="3"/><path d="M204 145h10m-10 6h8" stroke="#497bae" stroke-width="2"/>',
      antenna:'<path d="M169 58q-7-23 14-34" stroke="#28252e" stroke-width="6" fill="none"/><circle cx="184" cy="22" r="9" fill="#fcce59" stroke="#28252e" stroke-width="3"/>',
      patch:'<path d="m182 83 14-9 11 14-14 10Z" fill="#b4e3ff" stroke="#28252e" stroke-width="2"/><path d="m195 87 16-7 8 15-17 8Z" fill="#fce274" stroke="#28252e" stroke-width="2"/>',
      stamp:'<circle cx="200" cy="136" r="13" fill="#ffe9aa" stroke="#28252e" stroke-width="3"/><path d="m194 136 4 4 7-9" stroke="#d56c63" stroke-width="3" fill="none"/>',
    })[id]||'';
  }
  const motion=typeof module!=='undefined'&&module.exports?require('./motion.js'):window.KeycapMotion;
  const n=x=>Number(x.toFixed(2)), ink='#28252e';
  const xy=p=>n(p[0])+' '+n(p[1]);
  function arm(x,y,tip,front){
    const side=x<150?-1:1, bend=[x+side*(front?24:17),Math.min(y+25,tip[1]+19)];
    return '<path d="M'+x+' '+y+'Q'+xy(bend)+' '+xy(tip)+'" fill="none" stroke="'+ink+'" stroke-width="8" stroke-linecap="round"/><circle cx="'+n(tip[0])+'" cy="'+n(tip[1])+'" r="7" fill="'+ink+'"/>';
  }
  function leg(x,y,tip,side){
    const [u,v]=tip.map(n);
    return '<path d="M'+x+' '+y+'Q'+n((x+u)/2+side*8)+' '+n(Math.min(v-13,y+29))+' '+u+' '+n(v-5)+'" fill="none" stroke="'+ink+'" stroke-width="8" stroke-linecap="round"/><ellipse cx="'+n(u+side*4)+'" cy="'+v+'" rx="15" ry="8" fill="'+ink+'" transform="rotate('+side*13+' '+u+' '+v+')"/>';
  }
  function glass(c){
    const [x,y]=c.xy.map(n), level=n(-10+14*(1-c.fill));
    return '<g class="cup" opacity="'+n(c.alpha)+'" transform="translate('+x+' '+y+') rotate('+n(c.r)+')"><path d="M-15 -36h30l-4 35h-22Z" fill="#c4edfa" stroke="'+ink+'" stroke-width="3"/><path d="M-12 '+level+'h24l-2 '+n(-2-level)+'h-20Z" fill="#6ec8e4"/><path d="M-3 -15L2 -51 '+xy(motion.strawTip)+'" fill="none" stroke="#e37589" stroke-width="4" stroke-linecap="round"/></g>';
  }
  function companionProp(q){
    if(!q.prop||q.prop.alpha<.02)return '';
    const {kind,alpha,phase}=q.prop;
    if(kind==='sign'){
     return '<g opacity="'+n(alpha)+'" transform="translate('+xy(q.rh)+')"><path d="M0 4v-30" stroke="'+ink+'" stroke-width="4" stroke-linecap="round"/><rect x="-30" y="-54" width="60" height="29" rx="5" fill="#ffd287" stroke="'+ink+'" stroke-width="3"/><path d="M-5-46v13m10-13v13" stroke="'+ink+'" stroke-width="4" stroke-linecap="round"/></g>';
    }
    if(kind==='heart'){
     return '<g opacity="'+n(alpha)+'" transform="translate(150 165)"><path d="M0 18C-10 12-25 3-22-7q4-15 22-3 18-12 22 3C25 3 10 12 0 18Z" fill="#f58da8" stroke="'+ink+'" stroke-width="2.5"/></g>';
    }
    const radius=n(9+6*(1-Math.cos(phase)));
    return '<g opacity="'+n(alpha)+'" transform="translate('+xy([q.rh[0],q.rh[1]-20])+')"><circle r="'+radius+'" fill="#bbe4d9" stroke="'+ink+'" stroke-width="2"/><path d="M-4 0h8m-4-4v8" stroke="#3d786d" stroke-width="2" stroke-linecap="round"/></g>';
  }
  function make(p,label,action='idle',ms=0,reduced=false){
    const shape=profiles[p.shape],color=esc(p.color),q=motion.pose(p,action,ms,reduced);
    const lift=motion.faceOffset(p.shape);
    const mask=p.shape==='wide'?'M109 92h82q13 0 13 13v25q0 12-12 12h-84q-12 0-12-13v-24q0-13 13-13Z':'M117 92q33-12 66 0 18 7 18 24 0 28-51 28-51 0-51-28 0-17 18-24Z';
    const at=(x,y)=>'translate('+n(x)+' '+n(y)+')';
    const pivot=at(q.x,q.y)+' translate(150 150) rotate('+n(q.r)+') scale('+n(q.sx)+' '+n(q.sy)+') translate(-150 -150)';
    const left=q.left+q.x,right=q.right+q.x;
    const armY=140+q.y;
    const bed=q.bed>.01?'<g opacity="'+n(q.bed)+'"><rect x="57" y="198" width="144" height="27" rx="13" fill="#f6d6b6" stroke="#59414f" stroke-width="3"/><path d="M67 215h33m85 0h9" stroke="#d3a5a2" stroke-width="3" stroke-linecap="round"/></g>':'';
    const cover=q.bed>.01?'<g opacity="'+n(q.bed)+'"><path d="M82 194q12-19 28-13l71 10q23 5 33 22l-13 13H82Z" fill="#c3add8" stroke="#493c57" stroke-width="3"/><path d="M91 204q52-10 111 10" fill="none" stroke="#ead8ec" stroke-width="3" stroke-linecap="round"/></g>':'';
    const stars=q.star>.01?'<g opacity="'+n(q.star)+'" fill="#fdd075"><path d="M88 66l3 8 8 3-8 3-3 8-3-8-8-3 8-3Zm129-11 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/></g>':'';
    const zzz=action==='sleep'&&q.bed>.85?'<g transform="'+at(0,n(-5*Math.sin(ms/530)))+'" fill="#fff1c9" stroke="'+ink+'" stroke-width="1.5"><path d="M225 80h16v4l-9 9h10v5h-17v-5l9-8h-9Zm17-20h18v4l-10 10h11v5h-19v-5l10-9h-10Z"/></g>':'';
    const front=!!q.cup||!!q.prop||action==='bonk'||action==='wave'||action==='special';
    const rightArm=arm(n(right),n(armY),q.rh,front);
    const leftArm=arm(n(left),n(armY),q.lh,action==='hug');
    const tears=action==='tears'?'<g transform="'+at(0,q.tear*28)+'" opacity="'+n(1-q.tear*.85)+'" fill="#83d7fc"><path d="M120 120q-12 15 0 16 12-1 0-16Zm61-3q-10 13 0 14 10-1 0-14Z"/></g>':'';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 249" role="img" aria-label="'+esc(label)+'"><ellipse cx="'+n(150+q.x*.42)+'" cy="231" rx="77" ry="8" fill="#352343" opacity=".18"/>'+bed+
     leg(n(115+q.x),n(172+q.y),q.lf,-1)+leg(n(182+q.x),n(172+q.y),q.rf,1)+(action==='hug'?'':leftArm)+(front?'':rightArm)+
     '<g class="head" transform="'+pivot+'"><path d="'+shape+'" transform="translate(0 17)" fill="'+ink+'" stroke="'+ink+'" stroke-width="6"/><path d="'+shape+'" transform="translate(0 11)" fill="'+color+'" stroke="'+ink+'" stroke-width="4"/><path d="'+shape+'" transform="translate(0 11)" fill="#31283b" opacity=".25"/><path d="'+shape+'" fill="'+color+'" stroke="'+ink+'" stroke-width="4"/><path d="'+tops[p.shape]+'" fill="#fff6da" opacity=".47"/><text x="150" y="'+({round:69,square:57,wide:80,petal:75,step:53,pill:101})[p.shape]+'" text-anchor="middle" font-size="13" font-family="monospace" font-weight="900" fill="'+ink+'">'+esc(p.key)+'</text><g transform="translate(0 '+lift+')"><path d="'+mask+'" fill="'+ink+'"/>'+face(q.smile)+'<path d="M92 127h6m104 0h6" stroke="#f07689" stroke-width="5" stroke-linecap="round"/>'+tears+'</g>'+kit(p.accessory)+'</g>'+cover+stars+zzz+companionProp(q)+(action==='hug'?leftArm:'')+(front?rightArm:'')+(q.cup?glass(q.cup)+'<circle cx="'+n(q.rh[0])+'" cy="'+n(q.rh[1])+'" r="6" fill="'+ink+'"/>':'')+'</svg>';
  }
  const api={make,esc};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else window.KeycapArt=api;
})();
