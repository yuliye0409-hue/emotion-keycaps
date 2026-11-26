(() => {
  const esc = s => String(s).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const character={name:'咔粒',shape:'round',key:'ESC',color:'#a391e6',face:'dot',accessory:'none'};
  const colors=[[character.color,'蓝紫'],['#d5ef59','青柠'],['#f2bd58','杏黄'],['#70c1d9','天蓝'],['#ed8f93','珊瑚'],['#7fb07f','苔绿'],['#e19a78','陶橘']];
  const faces=[['dot','得意'],['sleepy','犯困'],['flat','无语'],['wink','眨眼'],['happy','大笑'],
    ['curious','好奇'],['excited','星星眼'],['pout','嘟嘴'],['teary','眼泪汪汪'],['silly','吐舌'],
    ['sad','委屈'],['angry','生气'],['wow','吃惊'],['bashful','害羞'],['confident','自信'],
    ['dizzy','晕乎乎'],['kitty','猫猫嘴'],['pensive','发呆'],['triumph','胜利'],['yawn','打哈欠'],
    ['neutral','平静'],['content','满足'],['waving','问好'],['pleased','欣慰'],['laughing','笑到脸红'],
    ['sparkle','眼睛发亮'],['smirk','偷笑'],['flirty','俏皮'],['playbite','抿牙偷乐'],['quenched','喝饱啦'],
    ['relaxed','放松'],['dozing','打盹'],['tired','没电了'],['drool','口水包'],['bored','好无聊'],
    ['tiptoe','悄悄的'],['confused','没听懂'],['skeptical','半信半疑'],['disbelief','愣住'],['blank','石化'],
    ['serious','认真脸'],['focus','集中'],['concerned','担心'],['nervous','紧张'],['scared','吓一跳'],
    ['cry','放声哭'],['pain','捂疼'],['irritated','不耐烦'],['rage','冒火'],['disgust','嫌弃'],
    ['snooty','傲娇'],['devious','坏笑'],['cold','打寒颤'],['sick','不舒服'],['woozy','打转转']];
  const kits=[['none','无配件'],['scarf','围巾','#f575ac'],['badge','挂坠','#ffce52'],
    ['antenna','弹簧','#f575ac'],['patch','创可贴','#f7b0a9'],['stamp','贴纸','#b69aff'],
    ['headphones','耳机','#a99bf2'],['sprout','芽芽','#88c990'],['bow','蝴蝶结','#f88fae'],
    ['star','星星发夹','#ffdb6a'],['glasses','圆框眼镜','#715dae']];
  const motion=typeof module!=='undefined'&&module.exports?require('./motion.js'):window.KeycapMotion;
  const n=x=>Number(x.toFixed(2)), ink='#291e44',cream='#fcf4e7',pink='#eb8cac';
  const colorParts=[
    ['shell','帽壳',character.color],['top','键帽顶面','#e6dbff'],['rim','键帽底边',null],
    ['arms','手臂',null],['hands','手掌',null],['legs','下半身',null],['feet','脚底',null],
    ['legend','按键字样',ink],['outline','描边',ink],['eyes','眼白',cream],
    ['pupils','瞳孔',ink],['mouth','嘴巴',ink],['teeth','牙齿',cream],
    ['tongue','舌头',pink],['cheeks','腮红','#f3a5be'],['tears','眼泪','#8cdcff'],['glints','眼睛高光','#fff8eb'],
    ['stars','星星眼','#ffce52'],['accessory','配饰',null]
  ];
  const isHex=value=>typeof value==='string'&&/^#[\da-f]{6}$/i.test(value);
  function mixColor(a,b,ratio){
    return '#'+[1,3,5].map(i=>Math.round(
      parseInt(a.slice(i,i+2),16)*(1-ratio)+parseInt(b.slice(i,i+2),16)*ratio
    ).toString(16).padStart(2,'0')).join('');
  }
  function cleanPalette(value){
    return Object.fromEntries(colorParts.flatMap(([key])=>
      isHex(value?.[key])?[[key,value[key].toLowerCase()]]:[]));
  }
  function partColors(p){
    const palette=p.palette??{};
    const shellColor=isHex(palette.shell)?palette.shell:isHex(p.color)?p.color:character.color;
    const kit=kits.find(([id])=>id===p.accessory);
    const shade=mixColor(shellColor,'#3d1e91',.33);
    const outline=isHex(palette.outline)?palette.outline:ink;
    const defaults={shell:shellColor,arms:palette.legs??shellColor,hands:palette.arms??palette.legs??shellColor,
      legs:shellColor,feet:shade,rim:shade,accessory:kit?.[2]??pink};
    return Object.fromEntries(colorParts.map(([key,,color])=>
      [key,isHex(palette[key])?palette[key]:isHex(defaults[key])?defaults[key]:color??shade]));
  }
  const line=(d,width=4,color=ink)=>'<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" stroke-linecap="round" stroke-linejoin="round"/>';
  const fill=(d,color)=>'<path d="'+d+'" fill="'+color+'"/>';
  const outlined=(d,color,width=4,stroke=ink)=>'<path d="'+d+'" fill="'+color+'" stroke="'+stroke+'" stroke-width="'+width+'" stroke-linejoin="round" stroke-linecap="round"/>';
  const pupilColor='@pupils';
  const pupil=(x,y,rx,ry)=>'<g class="gaze-pupil"><ellipse cx="'+x+'" cy="'+y+'" rx="'+(rx+1.8)+'" ry="'+(ry+1.8)+'" fill="@iris"/><ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+pupilColor+'"/><circle cx="'+n(x+rx*.28)+'" cy="'+n(y-ry*.32)+'" r="'+n(Math.min(3,rx*.39))+'" fill="@glints"/><circle cx="'+n(x-rx*.30)+'" cy="'+n(y+ry*.42)+'" r="'+n(Math.min(1.35,rx*.22))+'" fill="@glints" opacity=".72"/></g>';
  const leftWhite='M100 108C98 95 104 85 116 84C128 83 138 93 139 105C139 118 133 127 121 127C110 128 102 119 100 108Z';
  const rightWhite='M165 107C165 95 172 87 183 87C194 87 202 96 201 108C201 120 193 128 182 128C172 128 165 120 165 107Z';
  const leftEye=outlined(leftWhite,cream,2.5)+pupil(123,107,8.6,9.2);
  const rightEye=outlined(rightWhite,cream,2.5)+pupil(185,108,8.6,9.2);
  const openMouth=outlined('M135 129Q151 133 168 126Q169 141 156 146Q145 151 135 129Z',ink,2.2)+
    fill('M139 131L148 132L146 137Q143 139 139 131Z','@teeth')+
    fill('M148 145Q153 141 157 142Q162 139 165 139Q159 147 148 145Z',pink);
  const waveMouth=outlined('M130 128Q151 133 172 124Q172 145 157 152Q139 155 130 128Z',ink,2.4)+
    fill('M135 130L146 131L144 137Q141 140 135 130Z','@teeth')+
    fill('M144 150Q148 143 154 146Q161 141 167 143Q158 153 144 150Z',pink);
  const friendlyBrows=line('M106 79q8-7 20-3m47 4q9-5 16 1',2.7);
  const smallMouth=(d,tongue)=>outlined(d,ink,3.5)+(tongue?fill(tongue,pink):'');
  const shut=line('M108 107Q121 117 139 106M161 109Q174 119 187 111');
  const lids=outlined('M104 103L145 108Q141 124 124 121Q108 121 104 103ZM158 108L194 104Q192 121 178 122Q164 123 158 108Z',cream);
  const half=lids+pupil(128,113,3.8,4.5)+pupil(178,113,3.8,4.5);
  const roundEyes=outlined(leftWhite+rightWhite,cream,2.5);
  const pinEyes=roundEyes+pupil(121,105,3.9,4.6)+pupil(183,107,3.8,4.4);
  const squint=line('M105 95l31 12-29 8m83-21-25 13 23 10',4.3);
  const arcs=line('M103 110Q119 90 141 105M159 111Q173 95 192 106',4.5);
  const worried=line('M106 80q12 2 25-6m35 3q8 4 18 5',3.5);
  const brow=line('M105 79q13 2 30 10m37-2 16-10',4);
  const blush='<path d="M95 116l-5 9m12-7-5 10m105-13-5 10m12-8-5 10" stroke="'+pink+'" stroke-width="3.5" stroke-linecap="round"/>';
  const sweat=outlined('M202 90q-10 11-7 16 5 7 11 0 3-5-4-16Z','#8cdcff',2);
  const mouthLine=(d,width)=>line(d,width,'@mouth');
  const quiver=mouthLine('M132 142q6-7 12-2 5 5 11-1 6-5 12 0',3.5);
  const oMouth=smallMouth('M140 138Q142 127 150 128Q160 128 160 138Q160 148 150 149Q141 148 140 138Z','M143 144Q152 138 157 143Q153 148 143 144Z');
  const grin=mouthLine('M132 136Q149 150 170 132',3.7);
  const teeth=outlined('M126 134Q148 137 175 131L170 146Q147 153 131 145Z','@teeth',3.5)+line('M132 140q17 4 39-2',2.6);
  const tongue=outlined('M131 136Q145 145 169 132Q168 141 158 144L155 154Q148 160 142 155L140 145Q135 144 131 136Z',pink,3.3)+line('M148 144l1 7',2);
  const angryEyes=outlined('M105 96L145 106Q139 124 123 123Q109 121 105 96ZM157 107L193 98Q194 118 180 123Q164 127 157 107Z',cream)+pupil(128,112,4,5)+pupil(176,112,4,5);
  const spiral=line('M130 112q-8 6-13-1-7-10 5-17 17-8 23 7 5 17-14 23m47-14q-7 6-11 0-6-9 4-15 14-7 20 6 4 14-12 23',3.9);
  const tear=outlined('M111 119q-11 13-7 19 5 7 12 0 4-5-5-19Z','#8cdcff',2.3);
  const glints=fill('M126 90l3 10 10 4-10 4-3 10-4-10-9-4 9-4ZM177 95l3 8 8 3-8 3-3 9-3-9-8-3 8-3Z','#ffce52');
  const expressions={
      dot:friendlyBrows+leftEye+rightEye+openMouth,
      waving:friendlyBrows+roundEyes+pupil(116,106,8.6,9.2)+pupil(179,108,8.6,9.2)+waveMouth,
      sleepy:shut+mouthLine('M143 138Q151 142 157 137',3.5),
      dozing:shut+smallMouth('M145 137Q145 131 151 131Q157 131 157 137Q157 143 151 143Q145 143 145 137Z'),
      relaxed:shut+grin,
      flat:half+mouthLine('M138 138L161 135',4),
      wink:leftEye+line('M160 112Q172 100 189 107M182 106l6-5')+openMouth,
      happy:arcs+openMouth,
      sip:shut+'<circle cx="150" cy="130" r="6.2" fill="'+ink+'"/><circle cx="150" cy="130" r="2.6" fill="'+pink+'"/>',
      blink:line('M107 107q16 3 31 0m24 3q13 3 26-1')+openMouth,
      yawn:shut+smallMouth('M139 140Q138 125 149 124Q162 125 162 140Q163 153 151 153Q139 152 139 140Z','M143 148Q151 140 158 147Q154 153 143 148Z'),
      wow:pinEyes+oMouth+line('M105 78q12-8 24-5m45 1q11 1 17 7',3.2),
      sad:leftEye+rightEye+worried+mouthLine('M140 143q10-12 23-4',3.5),
      cry:line('M107 113l29-9m29 4 22 9')+smallMouth('M135 144Q148 126 165 142Q167 150 158 149L140 150Q134 150 135 144Z','M140 148Q150 139 161 146L158 148Z')+
        fill('M112 114Q103 119 103 127Q108 131 113 126L119 112ZM178 114Q187 120 189 128Q185 134 179 126L172 111Z','#8cdcff'),
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
      pout:half+brow+mouthLine('M135 136q5 6 11 2l10-2-5 8',4.2),
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
      triumph:arcs+outlined('M121 132Q153 141 180 125Q176 157 149 158Q131 157 121 132Z','@teeth',3.6)+mouthLine('M128 145q26 4 45-6',3),
      dizzy:spiral+quiver,
      drool:half+oMouth+outlined('M150 148q-6 10-6 16 2 4 6 1 4-4 3-16Z','#8cdcff',1.8),
      kitty:roundEyes+pupil(125,106,5,7)+pupil(175,107,5,7)+blush+mouthLine('M132 134q5 12 17 1 8 11 19-1',4),
      teary:lids+pupil(129,112,4,5)+pupil(176,111,4,5)+tear+grin,
      blank:roundEyes+teeth,
      content:line('M106 109q15 9 28-2m31 4q14 7 26-1',3.8)+blush+mouthLine('M137 135q13 13 27-1',4),
      sparkle:roundEyes+pupil(121,105,7.4,9.6)+pupil(182,105,6.9,9)+
        fill('M122 95l2 7 7 2-7 2-2 7-2-7-7-2 7-2Zm60 0 2 7 6 2-6 2-2 7-2-7-6-2 6-2Z','#ffce52')+oMouth,
      smirk:leftEye+outlined('M159 105Q176 101 195 105Q191 122 179 122Q168 122 159 105Z',cream)+pupil(182,112,4,5)+mouthLine('M134 139q17 8 29-7l5 2',4),
      playbite:leftEye+line('M162 110q13-10 26-2',3.7)+outlined('M134 134Q150 139 168 129Q164 150 144 149Z','@teeth',2.5)+mouthLine('M145 138l2 9',2),
      quenched:arcs+smallMouth('M137 132Q150 139 165 131Q166 144 151 146Q139 146 137 132Z','M143 143Q150 139 160 141Q154 148 143 143Z')+
        fill('M197 93q-7 9-5 14 3 7 9 1 3-4-4-15Z','#8cdcff'),
      tiptoe:roundEyes+pupil(131,104,5,7)+pupil(192,107,5,7)+
        line('M107 78q9-4 20 0m43-1 16 3',2.8)+mouthLine('M142 134q6-5 12-1m-10 8q5-2 10 0',2.7),
      focus:roundEyes+pupil(130,113,6,7)+pupil(188,114,5,7)+line('M106 82l25 9m42 0 15-8',3.6)+mouthLine('M137 139q13-3 25 0',3.7)
  };
  function expression(id, paint=partColors(character)){
    // Expressions share the same color slots across web and desktop.
    return (Object.hasOwn(expressions,id)?expressions[id]:expressions.dot).replace(
      /fill="(@iris|@pupils|@teeth|@glints|#291e44|#fcf4e7|#eb8cac|#8cdcff|#ffce52)"|stroke="(@mouth|#291e44|#eb8cac)"/g,
      (_,filled,stroked)=>filled
        ?'fill="'+(filled==='@iris'?mixColor(paint.pupils,paint.shell,.45):paint[{'@pupils':'pupils','@teeth':'teeth','@glints':'glints',[ink]:'mouth',[cream]:'eyes',[pink]:'tongue','#8cdcff':'tears','#ffce52':'stars'}[filled]])+'"'
        :'stroke="'+paint[stroked===ink?'outline':stroked===pink?'cheeks':'mouth']+'"');
  }
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
  function legend(value,color=ink){
    const letters=Array.from(value);
    const gap=letters.length>5?2:letters.length>4?3:5;
    const width=letter=>letter==='S'?7:letter===' '?4:8;
    const total=letters.reduce((sum,letter)=>sum+width(letter),0)+gap*(letters.length-1);
    let x=143.5-total/2;
    const strokes=letters.map(letter=>{
      const path=glyphs[letter];
      const mark=path?'<g transform="translate('+x+' 46)">'+line(path,2.4,color)+'</g>':'';
      x+=width(letter)+gap;
      return mark;
    }).join('');
    return '<g class="key-legend" data-key="'+esc(value)+'">'+strokes+'</g>';
  }
  function accessoryBack(id,paint){
    const band='M81 104Q82 28 149 24Q215 20 225 104';
    switch(id){
      case 'headphones':return line(band,15,paint.outline)+line(band,9,paint.accessory);
      case 'bow':return outlined('M187 40Q181 21 180 15Q197 17 205 33Q214 20 230 22L222 43Q216 52 204 45Z',paint.accessory,3.5,paint.outline);
      default:return '';
    }
  }
  function kit(id,paint,q) {
    const color=paint.accessory, edge=paint.outline;
    const edgeLine=(d,width)=>line(d,width,edge);
    const shape=(d,width)=>outlined(d,color,width,edge);
    const worn=({
      scarf:fill('M92 159Q114 169 150 169Q187 169 208 159L209 166Q192 178 150 179Q109 179 92 166Z',color)+
        edgeLine('M92 159Q114 169 150 169Q187 169 208 159M209 166Q192 178 150 179Q109 179 92 166',2.1)+
        '<g transform="rotate('+n(-q.r*.4+Math.max(-12,(q.rh[1]-193)*.1))+' 200 175)">'+
        shape('M193 173Q201 171 207 175Q210 185 219 191L208 201Q194 192 193 173Z',3.2)+
        edgeLine('M205 191q3-2 5-4m-1 8 5-4',2)+'</g>'+
        shape('M188 170q6-6 17-5l4 9q-5 8-18 7Z',3),
      badge:'<g transform="translate(-4 10)">'+edgeLine('M210 122q-6 7-4 15',3)+
        shape('M207 132l5 7 8 1-6 6 1 8-8-4-7 4 1-8-6-6 8-1Z',2.8)+
        edgeLine('M205 143h.5m4 0h.5',2)+'</g>',
      antenna:shape('M182 40l7-5 11 1 2 6q-10 3-20 1Z',2.7)+
        edgeLine('M192 37q11-4 10-10-2-8-10-5-6 5 4 7 12 0 16-10',3.6)+shape('M212 9l4 6 7 1-5 4 1 7-7-3-7 3 2-7-5-5 7-1Z',3),
      patch:shape('M180 74q14-3 25-9l7-2q4 1 6 6l1 5q-2 6-7 7l-23 7q-6 2-8-4Z',2.8)+
        edgeLine('M192 72l4 13m3-15 4 12m-18-2h1m26-6h1',1.8),
      stamp:shape('M198 141q7-9 17-9 7 2 6 9-2 13-15 14-10-2-8-14Z',2.7)+
        fill('M210 136l-8 9 5-1-1 7 10-11-6 2Z',edge),
      headphones:shape('M88 95q8 2 6 11l-6 24q-2 9-11 7l-5-2q-7-3-4-13l5-18q4-12 15-9ZM213 95q12-3 17 7l7 22q3 10-7 14l-5 1q-9 1-11-8l-7-26q-2-7 6-10Z',3.5)+
        edgeLine('M85 101q-1 15-8 28m143-27 9 28',2.3),
      sprout:shape('M150 39q9-6 21-3l3 4q-13 4-24 1Z',2.5)+edgeLine('M162 39q-1-11 0-20',3)+
        shape('M161 26q-18 0-22-16 16-1 22 13 2-16 19-16-1 18-19 19Z',3)+edgeLine('M148 15l11 9m14-11-10 11',1.8),
      bow:shape('M185 40q8-8 16-4l5 7-6 8q-10 1-15-11Z',2.8)+edgeLine('M182 38l-6 2m30 3 5 1',2.3),
      star:edgeLine('M210 68q-10 4-21 5',4)+shape('M208 57l4 7 8 1-6 5 2 8-8-4-7 4 1-8-6-5 8-1Z',2.6),
      glasses:edgeLine('M95 102l-13-5m123 7 20-7m-80 11q7-6 15 0',3)+
        line(leftWhite+rightWhite,3.5,color)+
        '<path d="M105 99l5-7m62 9 4-6" fill="none" stroke="#fff8dc" stroke-width="1.8" stroke-linecap="round" opacity=".75"/>',
    })[id]||'';
    if(id==='headphones')return '<g transform="translate(-4 0) scale(1.04 1)">'+worn+'</g>';
    if(id==='antenna'||id==='sprout'||id==='bow'||id==='star')return '<g transform="translate(0 -5)">'+worn+'</g>';
    return worn;
  }

  const xy=p=>n(p[0])+' '+n(p[1]);
  const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  const ridge='M110.6 34.1L180.3 32C197.2 31.1 208.2 35.8 211.9 51.2L214.4 61.9';
  const brim='C79.9 64.9 76.6 67.4 72.1 68.7C65.1 71.3 56.5 69.1 51.2 65.7C45.9 62.7 47.1 59.3 52.8 57.6C61 55.1 69.6 58.5 76.6 56.3Q84.8 54.6 88.9 46.9C93 39.3 101.2 35 110.6 34.1';
  const capSeam='M83.2 65.3C122.1 70.9 173.8 72.6 214.4 61.9';
  const capTop=ridge+'C173.8 72.6 122.1 70.9 83.2 65.3'+brim+'Z';
  const rightSide='L226.3 119.1C227.9 127.6 229.5 136.6 228.7 145.2C227.9 155.4 218.9 161.8 208.6 165.2';
  const leftSide='C81.5 161 72.1 155.8 70.9 145.2C69.6 137 71.7 128.1 73.7 119.1L83.2 65.3';
  const baseSeam='M93 164.8C109 170.4 129 172.8 150 172.6C174 172.8 194 170.6 208.6 165.2';

  function shortArm(side,lift,reach,paint){
    const left=side<0;
    const point=(x,y)=>[left?301.6-x:x,y];
    const shoulder=left?[93,164.8]:[208.6,165.2];
    const inner=point(202.1,188.7);

    const raised=clamp(lift/15,0,1);
    const drop=Math.max(0,-lift);
    const control=(x,y,upX,upY,spread)=>point(
      x+(upX-x)*raised+reach*spread,
      y+(upY-y)*raised+drop*spread
    );
    const a=control(211.7,167.4,210.1,167.2,.15);
    const b=control(215.3,170.8,211.8,170.9,.32);
    const wrist=control(217.1,174.2,213.5,171.6,.58);
    const c=control(218.4,177.6,216.8,170.3,.8);
    const d=control(218.9,180,217.6,166.1,.95);
    const tip=control(218.1,183.2,221.3,165.2,1);
    const e=control(217.4,185.8,224.6,164.4,.9);
    const f=control(215.4,187.9,227.4,166.1,.8);
    const palm=control(212.8,188.9,227.9,169.9,.65);
    const g=control(209.8,190.2,228.7,174.2,.50);
    const h=control(205.6,190.1,215.6,187,.18);
    const edge=(...points)=>'C'+points.map(xy).join(' ');
    const sleeve=edge(a,b,wrist), fingers=edge(c,d,tip)+edge(e,f,palm), join=edge(g,h,inner);
    const forward=sleeve+fingers+join;
    const reverse=edge(h,g,palm)+edge(f,e,tip)+edge(d,c,wrist)+edge(b,a,shoulder);
    return {
      edge:left?reverse:forward,
      color:paint.arms===paint.legs?'':fill('M'+xy(shoulder)+forward+'Q'+xy(point(205,179))+' '+xy(shoulder)+'Z',paint.arms),
      hand:paint.hands===paint.arms?'':fill('M'+xy(wrist)+fingers+'Q'+xy(point(210,182))+' '+xy(wrist)+'Z',paint.hands),
      tip
    };
  }

  function bodyArt(paint,q,action){
    // Scale the action tracks to the short-limbed body. Everything visible at
    // the edge, including the brim and both hands, follows one closed path.
    const leftLift=clamp((174-q.lh[1])*.19,-4,15);
    const rightLift=clamp((173-q.rh[1])*.16,-4,12);
    const left=shortArm(-1,leftLift,clamp((62-q.lh[0])*.24,-3,9),paint);
    const right=shortArm(1,rightLift,clamp((q.rh[0]-237)*.12,-3,6),paint);
    const holding=q.cup?.alpha>.02;
    if(holding){
      right.edge='C210.8 171.3 209.2 181.2 202.1 188.7';
      right.color=right.hand='';
    }
    const foot=(x,y,rest,tip)=>xy([x+clamp((tip[0]-rest)*.13,-5,5),y+clamp((tip[1]-220)*.23,-7,4)]);
    const r=(x,y)=>foot(x,y,184,q.rf),l=(x,y)=>foot(x,y,114,q.lf);
    const rightToes='C'+r(194.3,213)+' '+r(184.4,213.9)+' '+r(172.1,212.6)+
      'C'+r(164.3,212.2)+' '+r(157.8,210.9)+' '+r(154.5,205.8)+'Q'+r(152.1,202.4)+' 150.4 202.4';
    const leftToes='Q'+l(148.4,202.4)+' '+l(146.3,205.8)+
      'C'+l(143,210.9)+' '+l(136.5,212.2)+' '+l(127.5,212.6)+
      'C'+l(115.2,213.9)+' '+l(105.7,212.6)+' '+l(102,207.1);
    const feet='C202.1 195.1 '+r(201.7,201.9)+' '+r(198,207.5)+rightToes+leftToes+
      'C'+l(98.8,202.4)+' 97.9 194.3 99.5 188.7';
    const lower=right.edge+feet+left.edge;
    const outer=ridge+rightSide+lower+leftSide+brim+'Z';
    const sole='M'+r(198,207.5)+rightToes+leftToes+'Q'+l(121,209)+' '+l(139,206)+'Q'+l(146,205)+' 150.4 202.4'+
      'Q'+r(159,206)+' '+r(172.1,207.5)+'Q'+r(188,209)+' '+r(198,207.5)+'Z';
    const waving=(action==='wave'||action==='special')&&leftLift>5;
    return {
      right:right.tip,
      svg:fill(outer,paint.shell)+
        fill('M208.6 165.2'+lower+'C109 170.4 129 172.8 150 172.6C174 172.8 194 170.6 208.6 165.2Z',paint.legs)+
        fill(sole,mixColor(paint.feet,paint.legs,.37))+
        left.color+right.color+left.hand+right.hand+
        fill('M86 67Q92 68 102 69L81 134Q75 145 72 145Q70 137 74 119Z',mixColor(paint.shell,paint.glints,.23))+
        fill('M71 145Q83 160 110 163Q151 168 191 163Q217 160 228.7 145.2C227.9 155.4 218.9 161.8 208.6 165.2C194 170.6 174 172.8 150 172.6C129 172.8 109 170.4 93 164.8C81.5 161 72.1 155.8 71 145Z',mixColor(paint.rim,paint.shell,.5))+
        fill(capTop,paint.top)+
        fill('M48.3 62.7Q59 67.3 72.1 64.7Q78.6 62 83.2 65.3C79.9 64.9 76.6 67.4 72.1 68.7C65.1 71.3 56.5 69.1 51.2 65.7Q48.6 64.4 48.3 62.7Z',mixColor(paint.top,paint.rim,.27))+
        line('M53 60.6Q61 58.4 69 59.8M92 51.5Q97.4 41 114 39.6L125 39M198 39q7 4 10 10',1.8,mixColor(paint.top,paint.glints,.72))+
        fill('M117 182C124 174 161 174 176 179C185 183 185 191 173 194C158 199 137 198 122 194Q112 191 117 182Z',mixColor(paint.legs,paint.glints,.17))+
        line(baseSeam,1.7,mixColor(paint.rim,paint.outline,.28))+
        line(capSeam,1.65,mixColor(paint.outline,paint.shell,.32))+
        line('M99.5 188.7q2.4-2.2 3.6-5.1'+(holding?'':'M202.1 188.7q-3-2.3-4.2-5.1'),1.25,mixColor(paint.legs,paint.outline,.52))+
        line('M'+l(114,204)+'q7 2.5 14 1.5M'+r(171,205.5)+'q7 .4 12-1.7',1.4,mixColor(paint.feet,paint.glints,.55))+
        line(outer,2.75,paint.outline)+
        (waving?line('M'+xy([left.tip[0]-6,left.tip[1]-3])+'q-2-3-4-3m3 5q-2 1-3 3',1.45,mixColor(paint.shell,paint.outline,.48)):'')
    };
  }

  function drinkingArm(q,paint){
    const [gx,gy]=motion.localPoint(q,...q.cup.grip), reach=q.cup.reach;
    const x=211+(gx-211)*reach,y=181+(gy-181)*reach;
    const bent=Math.max(0,Math.min(1,(205-x)/37));
    const elbowX=217-6*bent,elbowY=187-3*bent;
    // Only the exposed edge is inked; the shoulder fill overlaps the cap edge.
    const edge='M'+xy([209,166])+'C'+[ [218,170],[elbowX+2,elbowY-8],[elbowX,elbowY-4] ].map(xy).join(' ')+
      'C'+[[elbowX-5,elbowY-4],[x+9,y-6],[x+2,y-5.4]].map(xy).join(' ')+
      'C'+[[x-3,y-5.1],[x-5.4,y-1.8],[x-4.6,y+1.7]].map(xy).join(' ')+
      'Q'+xy([x-4,y+6.6])+' '+xy([x+2,y+6.1])+
      'C'+[[x+9,y+5.8],[elbowX-2,elbowY+5],[elbowX,elbowY+3.2]].map(xy).join(' ')+
      'Q'+xy([elbowX+1,elbowY+1.3])+' 202.1 188.7';
    const hand='M'+xy([x+5,y-5.3])+'Q'+xy([x-5.5,y-6.1])+' '+xy([x-4.6,y+1.7])+
      'Q'+xy([x-4,y+6.6])+' '+xy([x+2,y+6.1])+'Q'+xy([x+5,y+5.9])+' '+xy([x+5,y-5.3])+'Z';
    return fill(edge+'Q207 182 203.5 169.5L209 166Z',paint.arms)+
      (paint.hands===paint.arms?'':fill(hand,paint.hands))+
      line(edge,2.55,paint.outline)+line('M'+xy([x+1,y-2.8])+'q3.4-.5 4.5 1.7',1.2,mixColor(paint.hands,paint.outline,.45));
  }

  function glass(c){
    const [x,y]=c.xy.map(n), level=n(-10+14*(1-c.fill));
    return '<g class="cup" opacity="'+n(c.alpha)+'" transform="translate('+x+' '+y+') rotate('+n(c.r)+')">'+
      outlined('M-15 -36H15L11 -3Q10 -1 8 -1H-8Q-10 -1-11 -3Z','#c4edfa',2.6)+
      fill('M-12 '+level+'Q0 '+n(level+2)+' 12 '+level+'L10 -4H-10Z','#6ec8e4')+
      line('M-9 -31L-7 -9',1.4,'#effbff')+line('M-3 -13L2 -51 '+xy(motion.strawTip),3.5,'#c25372')+
      line('M-15 -36Q0 -40 15 -36',1.6,ink)+line('M-11 -34Q0 -32 11 -34',1.2,'#80bfcf')+'</g>';
  }
  function boxArt(b){
    const {left,top,right,bottom}=motion.peekBox;
    const front='M'+left+' '+top+'H'+right+'L253 '+(bottom-4)+'Q252 '+bottom+' 248 '+bottom+'H122Q118 '+bottom+' 117 '+(bottom-4)+'Z';
    const lid=top-2-23*b.lid, squash=3*b.thump;
    return {
      back:'<g opacity="'+n(b.alpha)+'">'+outlined('M109 161L122 142H247L261 161Z','#896057',2.6)+
        outlined('M109 161L118 '+n(lid)+'Q119 '+n(lid-4)+' 124 '+n(lid-5)+'H247Q251 '+n(lid-4)+' 252 '+n(lid)+'L261 161Z','#e8ae7e',2.5)+
        line('M126 '+n(lid+3)+'H241',1.4,'#f8cc9e')+'</g>',
      front:'<g opacity="'+n(b.alpha)+'">'+outlined(front,'#e5ae80',2.8)+
        outlined('M108 160Q184 '+n(156+squash)+' 262 160L261 171H109Z','#f3c99b',2.5)+
        fill('M119 179H252L249 215H123Z','#dead87')+
        outlined('M135 183H156V204H135Z','#ffefcc',1.6)+
        line('M140 197l5-9 6 9m-10-3h8',1.4,'#856054')+
        line('M235 208v-14m-4 4 4-4 4 4',1.7,'#856054')+
        (b.thump>.05?'<g opacity="'+n(b.thump)+'">'+line('M105 181l-9-7m9 16-13 1m173-10 9-7m-9 16 13 1',2,'#955d63')+'</g>':'')+
        '</g>'
    };
  }
  function companionProp(q,hand){
    if(!q.prop||q.prop.alpha<.02)return '';
    const {kind,alpha,phase}=q.prop;
    if(kind==='highfive'){
      const center=[hand[0]+11,hand[1]-14];
      return '<g opacity="'+n(alpha)+'" transform="translate('+xy(center)+')">'+
        outlined('M0-13 3-4 12-2 4 2 2 11-2 4-10 1-3-3Z','#ffdb75',1.7)+
        line('M-16-8l-4-4M8-14l4-5',2,'#b86970')+'</g>';
    }
    if(kind==='sign'){
     return '<g opacity="'+n(alpha)+'" transform="translate('+xy(hand)+')"><path d="M0 4v-30" stroke="'+ink+'" stroke-width="4" stroke-linecap="round"/><rect x="-30" y="-54" width="60" height="29" rx="5" fill="#ffd287" stroke="'+ink+'" stroke-width="3"/><path d="M-5-46v13m10-13v13" stroke="'+ink+'" stroke-width="4" stroke-linecap="round"/></g>';
    }
    if(kind==='heart'){
     return '<g opacity="'+n(alpha)+'" transform="translate(150 165)"><path d="M0 18C-10 12-25 3-22-7q4-15 22-3 18-12 22 3C25 3 10 12 0 18Z" fill="#f58da8" stroke="'+ink+'" stroke-width="2.5"/></g>';
    }
    const radius=n(9+6*(1-Math.cos(phase)));
    return '<g opacity="'+n(alpha)+'" transform="translate('+xy([hand[0],hand[1]-20])+')"><circle r="'+radius+'" fill="#bbe4d9" stroke="'+ink+'" stroke-width="2"/><path d="M-4 0h8m-4-4v8" stroke="#3d786d" stroke-width="2" stroke-linecap="round"/></g>';
  }
  function make(p,label,action='idle',ms=0,reduced=false,variant=0){
    const paint=partColors(p),q=motion.pose({...p,shape:character.shape},action,ms,reduced,variant);
    const at=(x,y)=>'translate('+n(x)+' '+n(y)+')';
    const pivot=at(q.x,q.y)+' translate(150 150) rotate('+n(q.r)+') scale('+n(q.sx)+' '+n(q.sy)+') translate(-150 -150)';
    const accessory=p.accessory??'none';
    const body=bodyArt(paint,q,action);
    const bed=q.bed>.01?'<g opacity="'+n(q.bed)+'">'+
      outlined('M77 204Q175 199 269 204Q283 205 285 215Q286 225 274 228H79Q64 227 64 217Q64 208 77 204Z','#e1b6c9',2.8)+
      line('M69 218Q174 225 280 217',1.8,'#9f718f')+
      outlined('M211 201Q216 194 233 194L260 195Q277 194 281 204Q285 213 270 215L226 215Q210 215 211 201Z','#f6e4cf',2.6)+
      line('M266 200Q277 202 276 207M217 206Q222 209 231 209',1.55,'#c8a9a1')+'</g>':'';
    const stars=q.star>.01?'<g opacity="'+n(q.star)+'" fill="#fdd075"><path d="M88 66l3 8 8 3-8 3-3 8-3-8-8-3 8-3Zm129-11 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/></g>':'';
    const zzz=action==='sleep'&&ms>=motion.duration.sleep*.84?'<g transform="'+at(11,reduced?-4:-4+n(2.5*Math.cos((ms-motion.duration.sleep)*Math.PI/600)))+'" fill="#fff1c9" stroke="'+ink+'" stroke-width="1.5"><path d="M225 80h16v4l-9 9h10v5h-17v-5l9-8h-9Zm17-20h18v4l-10 10h11v5h-19v-5l10-9h-10Z"/></g>':'';
    const cap='<g class="head" transform="'+pivot+'">';
    const tears=q.smile==='cry'&&action==='tears'?'<g transform="'+at(0,q.tear*28)+'" opacity="'+n(1-q.tear*.85)+'">'+
      outlined('M111 115q-13 13-6 19 8 5 12-3 1-5-6-16ZM186 117q11 11 8 17-4 7-11 2-5-4 3-19Z',paint.tears,2.5,paint.outline)+'</g>':'';
    const box=q.box&&boxArt(q.box);
    const drinking=q.cup&&q.cup.alpha>.02;
    const pet=cap+accessoryBack(accessory,paint)+body.svg+
     legend(p.key||character.key,paint.legend)+
     line('M182 52h9m-7 4h5',1.65,mixColor(paint.legend,paint.top,.33))+
     fill('M88 129Q92 123 106 126Q113 130 106 135Q94 139 88 133ZM197 130Q203 125 214 128Q221 131 216 136Q207 140 198 135Z',paint.cheeks)+
     line('M94 130h.1m4 2h.1m4-2h.1m99 2h.1m4-1h.1m4 2h.1',1.7,mixColor(paint.cheeks,paint.outline,.46))+
     expression(q.smile,paint)+tears+
     (accessory==='none'?'':kit(accessory,paint,q))+'</g>';
    const clip=box&&q.box.clip&&!q.box.hidden;
    const clipId='kali-behind-box';
    const shadowY=q.bed>.1?225:218;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 249" role="img" aria-label="'+esc(label)+'" data-expression="'+q.smile+'">'+
     '<ellipse cx="'+n(150+q.x*.42)+'" cy="'+shadowY+'" rx="'+n(61+28*q.bed)+'" ry="5.5" fill="#352343" opacity=".18"/>'+bed+
     (box?box.back:'')+
     (q.box?.hidden?'':clip?'<defs><clipPath id="'+clipId+'"><rect width="300" height="'+motion.peekBox.top+'"/></clipPath></defs>'+
       '<g clip-path="url(#'+clipId+')" data-clip-bottom="'+motion.peekBox.top+'">'+pet+'</g>':pet)+
     (box?box.front:'')+
     companionProp(q,motion.headPoint(q,...body.right))+stars+zzz+
     (drinking?glass(q.cup)+'<g class="drinking-arm" transform="'+pivot+'">'+drinkingArm(q,paint)+'</g>':'')+'</svg>';
  }
  const api={make,esc,character,colors,faces,kits,colorParts,isHex,cleanPalette,partColors,expression,keyLegend,keyLabels,legend};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else window.KeycapArt=api;
})();
