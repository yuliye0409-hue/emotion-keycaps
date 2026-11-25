(() => {
  const esc = s => String(s).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const character={name:'咔粒',shape:'round',key:'ESC',color:'#d5ef59',face:'dot',accessory:'none'};
  const colors=[['#d5ef59','青柠'],['#f2bd58','杏黄'],['#70c1d9','天蓝'],['#ad9ae9','芋紫'],['#ed8f93','珊瑚'],['#7fb07f','苔绿'],['#e19a78','陶橘']];
  const faces=[['dot','得意'],['sleepy','犯困'],['flat','无语'],['wink','眨眼'],['happy','大笑']];
  const kits=[['none','无配件'],['scarf','围巾'],['badge','挂坠'],['antenna','弹簧'],['patch','创可贴'],['stamp','贴纸']];
  const motion=typeof module!=='undefined'&&module.exports?require('./motion.js'):window.KeycapMotion;
  const n=x=>Number(x.toFixed(2)), ink='#26212b',cream='#fff8dc',pink='#f56c9e',orange='#ff8259';
  const shell='M98 51Q102 39 120 39L181 37Q199 36 205 51L230 137Q239 159 220 168Q203 176 148 175L89 174Q67 174 70 152Z';
  const line=(d,width=4)=>'<path d="'+d+'" fill="none" stroke="'+ink+'" stroke-width="'+width+'" stroke-linecap="round" stroke-linejoin="round"/>';
  const fill=(d,color)=>'<path d="'+d+'" fill="'+color+'"/>';
  const outlined=(d,color,width=4)=>'<path d="'+d+'" fill="'+color+'" stroke="'+ink+'" stroke-width="'+width+'" stroke-linejoin="round" stroke-linecap="round"/>';
  const pupil=(x,y,rx,ry)=>'<g class="gaze-pupil"><ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+ink+'"/><circle cx="'+(x-3)+'" cy="'+(y-4)+'" r="2.6" fill="'+cream+'"/></g>';
  const leftEye=outlined('M102 101Q103 82 120 80Q138 77 146 94Q153 111 140 122Q124 134 110 120Q102 113 102 101Z',cream)+pupil(128,105,9,12);
  const rightEye=outlined('M157 104Q160 86 175 88Q189 88 194 102Q199 119 186 125Q172 130 163 121Q157 115 157 104Z',cream)+pupil(178,107,7.5,10);
  const openMouth=outlined('M112 135Q150 137 186 129Q182 146 174 154Q161 167 140 160Q118 155 112 135Z',ink,3.5)+
    fill('M119 137L137 137Q133 149 130 148Q126 148 119 137ZM162 135L175 132Q173 142 169 143Q165 143 162 135Z',cream)+
    fill('M137 156Q145 146 153 151Q164 142 175 149Q161 165 137 156Z',pink);
  const smallMouth=(d,tongue)=>outlined(d,ink,3.5)+(tongue?fill(tongue,pink):'');
  const shut=line('M108 107Q121 117 139 106M161 109Q174 119 187 111');
  const lids=outlined('M104 103L145 108Q141 124 124 121Q108 121 104 103ZM158 108L194 104Q192 121 178 122Q164 123 158 108Z',cream);
  const half=lids+pupil(128,113,3.8,4.5)+pupil(178,113,3.8,4.5);
  const roundEyes=outlined('M101 101Q101 81 124 81Q148 81 149 102Q150 123 125 124Q102 123 101 101ZM154 104Q154 86 175 86Q196 86 197 104Q198 124 176 126Q154 125 154 104Z',cream);
  const pinEyes=roundEyes+pupil(126,105,3.4,4.5)+pupil(174,108,3,3.8);
  const squint=line('M105 95l31 12-29 8m83-21-25 13 23 10',4.3);
  const arcs=line('M103 110Q119 90 141 105M159 111Q173 95 192 106',4.5);
  const worried=line('M106 80q12 2 25-6m35 3q8 4 18 5',3.5);
  const brow=line('M105 79q13 2 30 10m37-2 16-10',4);
  const blush='<path d="M95 116l-5 9m12-7-5 10m105-13-5 10m12-8-5 10" stroke="'+pink+'" stroke-width="3.5" stroke-linecap="round"/>';
  const sweat=outlined('M202 90q-10 11-7 16 5 7 11 0 3-5-4-16Z','#8cdcff',2);
  const quiver=line('M132 142q6-7 12-2 5 5 11-1 6-5 12 0',3.5);
  const oMouth=smallMouth('M140 138Q142 127 150 128Q160 128 160 138Q160 148 150 149Q141 148 140 138Z','M143 144Q152 138 157 143Q153 148 143 144Z');
  const grin=line('M132 136Q149 150 170 132',3.7);
  const teeth=outlined('M126 134Q148 137 175 131L170 146Q147 153 131 145Z',cream,3.5)+line('M132 140q17 4 39-2',2.6);
  const tongue=outlined('M131 136Q145 145 169 132Q168 141 158 144L155 154Q148 160 142 155L140 145Q135 144 131 136Z',pink,3.3)+line('M148 144l1 7',2);
  const angryEyes=outlined('M105 96L145 106Q139 124 123 123Q109 121 105 96ZM157 107L193 98Q194 118 180 123Q164 127 157 107Z',cream)+pupil(128,112,4,5)+pupil(176,112,4,5);
  const spiral=line('M130 112q-8 6-13-1-7-10 5-17 17-8 23 7 5 17-14 23m47-14q-7 6-11 0-6-9 4-15 14-7 20 6 4 14-12 23',3.9);
  const tear=outlined('M111 119q-11 13-7 19 5 7 12 0 4-5-5-19Z','#8cdcff',2.3);
  const glints=fill('M126 90l3 10 10 4-10 4-3 10-4-10-9-4 9-4ZM177 95l3 8 8 3-8 3-3 9-3-9-8-3 8-3Z','#ffce52');
  const expressions={
      dot:leftEye+rightEye+openMouth,
      sleepy:shut+line('M143 138Q151 142 157 137',3.5),
      relaxed:shut+grin,
      flat:half+line('M138 138L161 135',4),
      wink:leftEye+line('M160 112Q172 100 189 107M182 106l6-5')+openMouth,
      happy:arcs+openMouth,
      sip:shut+'<circle cx="150" cy="130" r="6.2" fill="'+ink+'"/><circle cx="150" cy="130" r="2.6" fill="'+pink+'"/>',
      blink:line('M107 107q16 3 31 0m24 3q13 3 26-1')+line('M135 137Q149 149 168 133'),
      yawn:shut+smallMouth('M139 140Q138 125 149 124Q162 125 162 140Q163 153 151 153Q139 152 139 140Z','M143 148Q151 140 158 147Q154 153 143 148Z'),
      wow:pinEyes+oMouth+line('M105 78q12-8 24-5m45 1q11 1 17 7',3.2),
      sad:leftEye+rightEye+worried+line('M140 143q10-12 23-4',3.5),
      cry:line('M107 113l29-9m29 4 22 9')+smallMouth('M135 144Q148 126 165 142Q167 150 158 149L140 150Q134 150 135 144Z','M140 148Q150 139 161 146L158 148Z'),
      angry:angryEyes+brow+quiver,
      confused:leftEye+line('M159 104q19-10 33 0m-25-14 16-3',4)+oMouth,
      pleased:arcs+grin,
      pain:squint+line('M134 134q13 9 32 5',4)+tear,
      scared:pinEyes+worried+teeth+sweat,
      serious:half+line('M107 91h31m24 1 28-3m-52 49 22-3',4),
      silly:line('M105 94l31 14-27 9',4.4)+rightEye+tongue,
      flirty:lids+pupil(136,112,4,5)+pupil(183,112,4,5)+blush+grin,
      nervous:roundEyes+pupil(112,105,5,6)+pupil(164,109,4,6)+quiver+sweat,
      tired:half+worried+line('M142 141l12 1',3.2)+fill('M137 150q-5 10 1 12 7-1 3-11Z','#8cdcff'),
      irritated:half+brow+line('M131 140q15-7 34 2',3.8),
      disbelief:roundEyes+outlined('M134 131L167 136L161 157L136 155Z',ink,3.4)+line('M106 124v8m7-7v5m69-3 3 5',2.6),
      rage:angryEyes+brow+teeth+'<path d="M204 81l-5 7 8-1-5 7" fill="none" stroke="#e04a60" stroke-width="3.5" stroke-linecap="round"/>',
      disgust:outlined('M105 104Q128 110 141 101Q144 122 124 122Q110 122 105 104Z',cream)+pupil(134,112,4,5)+rightEye+outlined('M132 137q16-12 33 3l-4 8q-15-10-24-2Z','#9fc662',3.3),
      confident:shut+line('M106 89l17-5m49 2 15-4m-47 56q12 10 26-2',3.4),
      woozy:spiral+tongue+blush,
      concerned:leftEye+rightEye+worried+oMouth,
      curious:leftEye+rightEye+line('M169 79q10-7 20-1',3.6)+outlined('M147 132q10-6 11 5-2 11-8 12-6-3-3-17Z',ink,3.4),
      pout:half+brow+line('M135 136q5 6 11 2l10-2-5 8',4.2),
      sick:half+quiver+outlined('M159 143l23 13-3 5-24-12Z',cream,2.2)+fill('M170 150l9 5-2 2-8-4Z','#ec4771'),
      laughing:squint+openMouth+blush,
      bashful:shut+blush+quiver+sweat,
      skeptical:leftEye+outlined('M158 105L193 101Q192 123 177 123Q162 123 158 105Z',cream)+pupil(175,112,4,5)+line('M171 91l16-3m-46 53 17-3',3.5),
      bored:lids+pupil(137,113,4,5)+pupil(185,111,4,5)+line('M136 140h23',3.6),
      snooty:shut+line('M106 86l17 3m47 4 18-4m-37 51q4-8 9 1',3.5),
      cold:pinEyes+teeth+line('M98 89l-5 9m108 0 5 8M96 125l-4 8m108-8 4 9',2.6),
      neutral:leftEye+rightEye+line('M140 138h17',3.5),
      devious:angryEyes+outlined('M132 134q15 9 39-3-7 20-29 17Z',cream,3.5)+line('M150 138v7m9-9v5',2.5),
      pensive:roundEyes+pupil(137,102,6,8)+pupil(184,105,5,7)+worried+line('M140 141q8-5 17-4',3.4),
      excited:leftEye+rightEye+glints+openMouth,
      triumph:arcs+outlined('M121 132Q153 141 180 125Q176 157 149 158Q131 157 121 132Z',cream,3.6)+line('M128 145q26 4 45-6',3),
      dizzy:spiral+quiver,
      drool:half+oMouth+outlined('M150 148q-6 10-6 16 2 4 6 1 4-4 3-16Z','#8cdcff',1.8),
      kitty:roundEyes+pupil(125,106,5,7)+pupil(175,107,5,7)+blush+line('M132 134q5 12 17 1 8 11 19-1',4),
      teary:lids+pupil(129,112,4,5)+pupil(176,111,4,5)+tear+grin,
      blank:roundEyes+teeth
  };
  const expression=id=>expressions[id]||expressions.dot;
  const keyNames={
    Escape:'ESC',Space:'SPACE',Enter:'ENTER',NumpadEnter:'ENTER',Tab:'TAB',Backspace:'BKSP',Delete:'DEL',
    Insert:'INS',ArrowLeft:'←',ArrowUp:'↑',ArrowRight:'→',ArrowDown:'↓',CapsLock:'CAPS',NumLock:'NUM',
    ScrollLock:'SCROLL',PageUp:'PG UP',PageDown:'PG DN',PrintScreen:'PRTSC',Home:'HOME',End:'END',Pause:'PAUSE',
    ShiftLeft:'SHIFT',ShiftRight:'SHIFT',ControlLeft:'CTRL',ControlRight:'CTRL',AltLeft:'ALT',AltRight:'ALT',
    MetaLeft:'WIN',MetaRight:'WIN',ContextMenu:'MENU',Backquote:'\x60',Minus:'-',Equal:'=',BracketLeft:'[',
    BracketRight:']',Backslash:'\\',IntlBackslash:'\\',IntlRo:'\\',IntlYen:'¥',Semicolon:';',Quote:"'",
    Comma:',',Period:'.',Slash:'/',NumpadAdd:'+',NumpadSubtract:'-',NumpadMultiply:'*',
    NumpadDivide:'/',NumpadDecimal:'.',NumpadComma:',',NumpadEqual:'='
  };
  function keyLegend(code){
    if(Object.hasOwn(keyNames,code))return keyNames[code];
    if(/^Key[A-Z]$|^Digit[0-9]$|^Numpad[0-9]$/.test(code))return code.at(-1);
    return /^F(?:[1-9]|1[0-9]|2[0-4])$/.test(code)?code:'';
  }
  // All legends share the original ESC's 12-unit cap height and 2.4-unit strokes.
  const glyphs={
    A:'M0 12V4L4 0 8 4V12M0 7h8', B:'M0 12V0H5L8 2 8 4 5 6H0M5 6L8 8V10L5 12H0',
    C:'M8 0H0V12H8', D:'M0 12V0H4L8 3V9L4 12Z', E:'M8 0H0V12H8M0 6h6',
    F:'M8 0H0V12M0 6h6', G:'M8 0H0V12H8V6H5', H:'M0 0V12M8 0V12M0 6h8',
    I:'M0 0h8M4 0v12M0 12h8', J:'M8 0v12H0V8', K:'M0 0v12M8 0L0 7m3-2 5 7', L:'M0 0v12h8',
    M:'M0 12V0l4 5 4-5v12', N:'M0 12V0l8 12V0', O:'M2 0h4l2 2v8l-2 2H2l-2-2V2Z',
    P:'M0 12V0h6l2 2v3l-2 2H0', Q:'M2 0h4l2 2v8l-2 2H2l-2-2V2ZM5 8l3 4',
    R:'M0 12V0h6l2 2v3l-2 2H0m4 0 4 5', S:'M7 0H0v6h7v6H0', T:'M0 0h8M4 0v12',
    U:'M0 0v10l2 2h4l2-2V0', V:'M0 0l4 12 4-12', W:'M0 0l1 12 3-5 3 5 1-12',
    X:'M0 0l8 12M8 0 0 12', Y:'M0 0l4 6 4-6M4 6v6', Z:'M0 0h8L0 12h8',
    0:'M2 0h4l2 2v8l-2 2H2l-2-2V2ZM2 9l4-6', 1:'M1 3l3-3v12M0 12h8',
    2:'M0 2l2-2h4l2 2v3l-8 7h8', 3:'M0 0h8v12H0m3-6h5', 4:'M1 0l-1 7h8M6 2v10',
    5:'M8 0H0v6h8v6H0', 6:'M8 0H0v12h8V6H0', 7:'M0 0h8L3 12', 8:'M0 0h8v12H0ZM0 6h8',
    9:'M8 12V0H0v6h8', ' ':'', '-':'M0 6h8', '=':'M0 4h8M0 8h8',
    '[':'M6 0H2v12h4', ']':'M2 0h4v12H2', '\\':'M0 0l8 12', '/':'M0 12L8 0',
    "'":'M4 0v3', '\x60':'M3 0l2 3', ';':'M4 4h.1M5 9l-2 3', ':':'M4 4h.1M4 10h.1',
    ',':'M5 9l-2 3', '.':'M4 12h.1', '+':'M0 6h8M4 2v8', '*':'M0 3l8 6M8 3 0 9M4 1v10',
    '←':'M8 6H0m4-4L0 6l4 4', '→':'M0 6h8M4 2l4 4-4 4', '↑':'M4 12V0M0 4l4-4 4 4',
    '↓':'M4 0v12M0 8l4 4 4-4', '¥':'M0 0l4 5 4-5M4 5v7M0 6h8M0 9h8'
  };
  const keyLabels=[...new Set([...Object.values(keyNames),...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    ...Array.from({length:24},(_,i)=>'F'+(i+1))])];
  function legend(value){
    const letters=Array.from(value);
    const gap=letters.length>5?2:letters.length>4?3:5;
    const width=letter=>letter==='S'?7:letter===' '?4:8;
    const total=letters.reduce((sum,letter)=>sum+width(letter),0)+gap*(letters.length-1);
    let x=143.5-total/2;
    const strokes=letters.map(letter=>{
      const path=glyphs[letter];
      const mark=path?'<g transform="translate('+x+' 51)">'+line(path,2.4)+'</g>':'';
      x+=width(letter)+gap;
      return mark;
    }).join('');
    return '<g class="key-legend" data-key="'+esc(value)+'">'+strokes+'</g>';
  }
  function kit(id) {
    return ({
      scarf:outlined('M90 159Q139 179 204 156L208 171Q183 182 164 181L168 199L152 204L146 183Q110 184 88 173Z','#f575ac')+line('M102 165l-2 12m19-8-2 12m40 8 9-2m-6 9 8-2',2.8),
      badge:line('M209 124q-8 13 1 22',3)+outlined('M210 140l5 7 9 1-6 7 1 9-9-4-8 4 1-9-7-7 10-1Z','#ffce52',3)+line('M207 152h1m5 0h1',2),
      antenna:line('M182 44q20-7 19-15-2-8-10-5-7 5 4 7 12 0 16-10',3.6)+outlined('M212 11l4 6 7 1-5 4 1 7-7-3-7 3 2-7-5-5 7-1Z','#f575ac',3),
      patch:outlined('M184 66l21-8q7-2 9 4l3 7q1 6-5 9l-21 7q-6 2-8-4l-3-8q-2-5 4-7Z','#f7b0a9',3)+line('M195 66l5 13m0-15 5 13m-17-6h1m20-1h1',1.8),
      stamp:outlined('M204 135q11-3 15 7 3 11-8 16-13 4-17-7-3-11 10-16Z','#b69aff',3)+fill('M207 139l-6 10 5-1-1 7 9-12-6 2 1-6Z',ink),
    })[id]||'';
  }
  const xy=p=>n(p[0])+' '+n(p[1]);
  function mitten(tip,side,color){
    return '<g transform="translate('+xy(tip)+') scale('+side+' 1)">'+
      outlined('M-5-7Q0-11 4-6Q10-9 11-3Q16-1 12 4Q13 10 5 11Q-4 12-8 5Q-10-2-5-7Z',color,3.5)+
      line('M5-6L6-2M11-2L9 1',1.8)+'</g>';
  }
  function arm(x,y,tip,front,color,hand=true){
    const side=x<150?-1:1, bend=[x+side*(front?24:17),Math.min(y+25,tip[1]+19)];
    return line('M'+x+' '+y+'Q'+xy(bend)+' '+xy(tip),8)+(hand?mitten(tip,side,color):'');
  }
  function leg(x,y,tip,side){
    const [u,v]=tip.map(n);
    return line('M'+x+' '+y+'Q'+n((x+u)/2+side*8)+' '+n(Math.min(v-13,y+29))+' '+u+' '+n(v-5),8)+
      '<g transform="translate('+u+' '+v+') scale('+side+' 1)">'+
      outlined('M-8 1Q-10-7-4-11Q2-14 7-7Q14-11 18-5Q23 2 15 6Q7 10-5 8Q-9 6-8 1Z',orange,4)+
      line('M11-5l2 4',2.4)+'</g>';
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
    const color=esc(p.color),q=motion.pose({...p,shape:character.shape},action,ms,reduced);
    const at=(x,y)=>'translate('+n(x)+' '+n(y)+')';
    const pivot=at(q.x,q.y)+' translate(150 150) rotate('+n(q.r)+') scale('+n(q.sx)+' '+n(q.sy)+') translate(-150 -150)';
    const left=q.left+q.x,right=q.right+q.x;
    const armY=140+q.y;
    const bed=q.bed>.01?'<g opacity="'+n(q.bed)+'"><rect x="57" y="198" width="144" height="27" rx="13" fill="#f6d6b6" stroke="#59414f" stroke-width="3"/><path d="M67 215h33m85 0h9" stroke="#d3a5a2" stroke-width="3" stroke-linecap="round"/></g>':'';
    const cover=q.bed>.01?'<g opacity="'+n(q.bed)+'"><path d="M82 194q12-19 28-13l71 10q23 5 33 22l-13 13H82Z" fill="#c3add8" stroke="#493c57" stroke-width="3"/><path d="M91 204q52-10 111 10" fill="none" stroke="#ead8ec" stroke-width="3" stroke-linecap="round"/></g>':'';
    const stars=q.star>.01?'<g opacity="'+n(q.star)+'" fill="#fdd075"><path d="M88 66l3 8 8 3-8 3-3 8-3-8-8-3 8-3Zm129-11 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/></g>':'';
    const zzz=action==='sleep'&&q.bed>.85?'<g transform="'+at(0,n(-5*Math.sin(ms/530)))+'" fill="#fff1c9" stroke="'+ink+'" stroke-width="1.5"><path d="M225 80h16v4l-9 9h10v5h-17v-5l9-8h-9Zm17-20h18v4l-10 10h11v5h-19v-5l10-9h-10Z"/></g>':'';
    const front=!!q.cup||!!q.prop||action==='bonk'||action==='wave'||action==='special';
    const rightArm=arm(n(right),n(armY),q.rh,front,color,!q.cup);
    const leftArm=arm(n(left),n(armY),q.lh,action==='hug',color);
    const tears=q.smile==='cry'?'<g transform="'+at(0,q.tear*28)+'" opacity="'+n(1-q.tear*.85)+'">'+
      outlined('M111 115q-13 13-6 19 8 5 12-3 1-5-6-16ZM186 117q11 11 8 17-4 7-11 2-5-4 3-19Z','#83d7fc',2.5)+'</g>':'';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 249" role="img" aria-label="'+esc(label)+'" data-expression="'+q.smile+'"><ellipse cx="'+n(150+q.x*.42)+'" cy="231" rx="77" ry="8" fill="#352343" opacity=".18"/>'+bed+
     leg(n(115+q.x),n(172+q.y),q.lf,-1)+leg(n(182+q.x),n(172+q.y),q.rf,1)+(action==='hug'?'':leftArm)+(front?'':rightArm)+
     '<g class="head" transform="'+pivot+'">'+
     outlined('M74 147Q135 164 229 143L232 160Q231 181 201 188Q165 195 92 190Q63 189 66 168Z',orange,5.5)+
     outlined(shell,color,5.5)+
     '<path d="M99 53Q101 41 120 41L181 39Q198 38 203 52L210 67Q151 78 92 68Z" fill="'+cream+'" opacity=".53"/>'+
     line('M93 69Q127 75 167 72Q194 72 209 66',3.5)+
     legend(p.key||character.key)+
     line('M177 55h13m-10 4h8M87 151l2-7m121-8 2 5m-10 36 11-3',2.7)+
     '<path d="M88 127l7 1-3 7 7 1m97-5 7-3 1 6 7-3" fill="none" stroke="'+pink+'" stroke-width="4.7" stroke-linecap="round" stroke-linejoin="round"/>'+
     expression(q.smile)+tears+kit(p.accessory)+'</g>'+cover+stars+zzz+companionProp(q)+(action==='hug'?leftArm:'')+(front?rightArm:'')+
     (q.cup?glass(q.cup)+mitten(q.rh,-1,color):'')+'</svg>';
  }
  const api={make,esc,character,colors,faces,kits,expression,keyLegend,keyLabels,legend};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else window.KeycapArt=api;
})();
