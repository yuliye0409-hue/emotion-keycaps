(function(root){
 const rooms=[
  {id:'living',room:'客厅',scene:'living',copy:'回来啦。坐一会儿，放张唱片也好。'},
  {id:'kitchen',room:'厨房',scene:'kitchen',copy:'今天想吃什么？咔粒刚把小锅擦干净。'},
  {id:'bedroom',room:'卧室',scene:'bedroom',copy:'床铺好了。累了的话，我们就把灯关小一点。'}
 ];
 const dishes={
  soup:{name:'南瓜浓汤',prep:'先把南瓜切成小块。',stir:'慢慢搅，香味已经冒出来了。',serve:'南瓜浓汤出锅啦。',taste:'先吹一吹。今天这一碗是你的。'},
  toast:{name:'果酱吐司',prep:'把面包切厚一点，边边才会脆。',stir:'翻个面，再把果酱抹上去。',serve:'热吐司切好了。',taste:'听！边边咬起来咔嚓一下。'}
 };
 const servedLine=dish=>dishes[dish].serve+' 来尝一口？';
 const plateIcon={
  soup:'M3 12h18l-3 6H6ZM8 20h8M9 7q-2-2 0-4m6 4q-2-2 0-4',
  toast:'M5 18v-8a3 3 0 0 1 2-6h10a3 3 0 0 1 2 6v8q-7 3-14 0Zm5-6q2-4 5 0v3h-5z'
 };
 const tabs=['living','kitchen','bedroom','bean'];
 const primary={
  living:{action:'listen',label:'放张唱片',icon:'M9 18V6l11-3v12M9 16c-2-1-6 0-6 2s4 3 6 0m11-5c-2-1-6 0-6 2s4 3 6 0',x:74,y:65},
  kitchen:{action:'cook',label:'煮南瓜浓汤',icon:'M4 11h16l-2 7H6Zm3-5q-2-2 0-4m5 6q-2-3 0-5m5 3q-2-2 0-4M4 13H2m18 0h2',x:74,y:73},
  bedroom:{action:'sleep',label:'盖上被子',icon:'M3 6v14m18 0v-7a3 3 0 0 0-3-3H8v7m-5 0h18M3 10h5',x:72,y:64}
 };
 const ambient={living:'listen',kitchen:'wave',bedroom:'calm',study:'read'};
 const scenes={
  living:{
   wall:'#e8d8ce',trim:'#f4e8d7',floor:'#d7a585',rug:'#bcaed9',
   art:`
    <path d="M62 280V146Q62 86 126 86H220Q284 86 284 146V280Z" fill="#f5e3bd"/>
    <path d="M76 266V146Q76 101 127 101H219Q269 101 269 146V266Z" fill="#b9d5df"/>
    <path d="M78 234q55-27 108-10 43-34 81-27v67H79z" fill="#98b69e" stroke="none"/>
    <path d="M173 104v158M78 181h188" stroke="#f5e3bd" stroke-width="8"/>
    <path d="M518 95h141v12H518z" fill="#ab765e"/>
    <path d="M544 94V61h22v33m5 0V53h22v41m7-2-8-36 17-4 9 40z" fill="#85a79e"/>
    <path d="M508 315V186q0-20 28-19l15 1" fill="none" stroke-width="6"/>
    <path d="M488 318q19-9 40 0v7h-40Z" fill="#af8063"/>
    <path d="M539 170q9-31 35-30 27 0 36 29Z" fill="#f6c871"/>
    <path d="M556 178l-32 48m72-48 24 48" stroke="#f5c369" stroke-width="2" stroke-dasharray="4 7"/>
    <path d="M90 364v-57q0-21 23-21h123q22 0 22 22v57z" fill="#aa9ccc"/>
    <rect x="79" y="322" width="191" height="66" rx="21" fill="#c6b4de"/>
    <path d="M102 326h144v42H102z" fill="#ddd0ea"/>
    <path d="M93 382v13m160-13v13" stroke-width="7"/>
    <path d="M117 336q1-24 22-22 24 1 29 24-25 7-51-2z" fill="#edb599"/>
    <path d="M556 327h143l14 18H543Z" fill="#eec793"/>
    <path d="M548 345h160v41H548z" fill="#b6856a"/><path d="M563 385v18m131-18v18M563 363h130" fill="none" stroke-width="4"/>
    <rect x="582" y="301" width="91" height="26" rx="4" fill="#a6c2af"/>
    <ellipse cx="614" cy="308" rx="22" ry="8" fill="#403449"/><ellipse cx="614" cy="308" rx="7" ry="3" fill="#e9a883"/>
    <path d="M650 304v8l-21 5" fill="none" stroke-width="2"/>
    <path d="M37 377q14-40 26-23 4 13-11 32-18-38-31-32-11 8 6 24" fill="#8aa687"/>
    <path d="M25 379h37l-6 29H30z" fill="#d48b79"/>`
  },
  kitchen:{
   wall:'#e5e5c8',trim:'#f4e8c9',floor:'#dba27d',rug:'#eec08c',
   art:`
    <rect x="112" y="74" width="198" height="159" rx="8" fill="#fff0d1"/>
    <path d="M126 88h170v131H126Z" fill="#b5d9d3"/>
    <path d="M127 191q46-27 86 1 26-15 83-11v36H127Z" fill="#a2b998" stroke="none"/>
    <path d="M211 90v128m-83-64h166" stroke="#fff0d1" stroke-width="7"/>
    <path d="M112 78h61q-13 38-48 48l-13 1zm135 0h63v49q-43-3-63-49z" fill="#e8a08d"/>
    <path d="M489 107h195v16H489z" fill="#af8063"/>
    <path d="M505 107V77q1-10 20-10t20 10v30zm48 0V84q1-7 15-7 16 0 16 7v23zm56-2q-11-11-5-21h36q4 11-9 21z" fill="#f8e0a1"/>
    <path d="M505 84h40m9 8h28m26-2h29" opacity=".6" stroke-width="2"/>
    <path d="M536 167h146m-116 3v29m52-29v34m48-34v26" fill="none"/>
    <path d="M553 194h24l-3 40h-18z" fill="#e0a6a2"/>
    <ellipse cx="617" cy="224" rx="13" ry="23" fill="#b6ceaf"/>
    <path d="M654 193q10-8 20 0v35q-10 11-20 0z" fill="#c7afe3"/>
    <path d="M76 306h647v48H76z" fill="#8da991"/><path d="M76 343h647v35H76z" fill="#739382"/>
    <path d="M76 290h647v17H76z" fill="#f2d3a4"/>
    <path d="M95 314h123v53H95zM231 314h88v53h-88zm250 0h88v53h-88zm101 0h119v53H582z" fill="none" opacity=".66"/>
    <path d="M180 323h18m48 0h18m278 0h16m38 0h21" stroke="#f7d8a7"/>
    <path d="M114 283h129v8H114z" fill="#bc8e76"/><ellipse cx="178" cy="280" rx="37" ry="6" fill="#5d4b59"/>
    <path d="M156 269q4-17 26-17 20 0 22 17z" fill="#e78971"/><path d="M174 251q6-7 14 0" fill="none"/>
    <path d="M609 281h62v9h-62z" fill="#c39679"/><path d="M611 281q1-15 14-15 15 0 18 15m3 0q1-14 13-14 10 1 11 14" fill="#e7a568"/>
    <path d="M80 383h166l23 28H59z" fill="#ffd9a5"/>
    <path d="M624 382h96l13 25H605Z" fill="#f1c49d"/>
    <path d="M633 393h77" stroke="#d29a79" stroke-width="2" stroke-dasharray="4 6"/>`
  },
  bedroom:{
   wall:'#d8d0e8',trim:'#ece1ed',floor:'#b9a1b5',rug:'#e4bbbe',
   art:`
    <rect x="467" y="78" width="220" height="194" rx="16" fill="#f8eadf"/>
    <rect x="483" y="93" width="188" height="163" rx="9" fill="#727d9f"/>
    <path d="M486 211q50-22 95-9 42-32 87-30v79H486z" fill="#9296b0" stroke="none"/>
    <path d="M610 115q-25 18-9 40 12 18 37 6-14 15-34 8-25-9-25-28 1-19 31-26z" fill="#fae5a9" stroke="none"/>
    <path d="M498 140h.1m29-15h.1m26 29h.1m90 34h.1m-85-13h.1" stroke="#f8e3b6" stroke-width="4"/>
    <path d="M577 95v159m-89-79h177" stroke="#f8eadf" stroke-width="7"/>
    <path d="M467 83h48q-17 83-43 129h-7zm168 0h50v129h-11q-26-44-39-129z" fill="#b7a1cf"/>
    <path d="M110 140q17-35 52-38 20 0 37 20-26-5-42 16-6 10-5 25-33-4-42-23z" fill="#f5d29e"/>
    <path d="M111 180h90m-69 18h41" stroke="#a999b1" stroke-width="2"/>
    <path d="M108 342h143l-13 49H121z" fill="#c48e84"/>
    <path d="M113 343q13-29 37-26 19 2 26 20 18-23 57-15l12 20z" fill="#f6ddcc"/>
    <rect x="102" y="337" width="151" height="12" rx="6" fill="#e6b58a"/>
    <path d="M118 358h123m-121 10h118m-115 10h112" stroke="#a67369" stroke-width="2"/>
    <path d="M567 343h104v41H567z" fill="#c59681"/><path d="M556 335h126v12H556z" fill="#f1cc9f"/><path d="M576 384v15m85-15v15m-49-36h16" fill="none" stroke-width="4"/>
    <path d="M641 333v-35" stroke-width="5"/><path d="M618 298l11-29h27l12 29z" fill="#efd49b"/>
    <path d="M566 328v-13h26v15h-26m25-12h7v7h-7" fill="#e6adc7" stroke-width="2"/>`
  }
 };
 function scene(id){
  const {wall,trim,floor,rug,art}=scenes[id];
  return `<svg class="scene home-scene" viewBox="0 0 800 520" aria-hidden="true">
   <defs><pattern id="home-grain" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".7" fill="#422e42" opacity=".19"/></pattern></defs>
   <path d="M0 0h800v520H0Z" fill="${wall}"/><path d="M0 49h800v260H0Z" fill="url(#home-grain)"/>
   <path d="M0 41h800v13H0zm0 240h800v35H0z" fill="${trim}"/>
   <path d="M0 314h800v206H0Z" fill="${floor}"/>
   <g stroke="#4b3845" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path d="M0 314h800m-800 134h800M0 487h800" fill="none" opacity=".35"/>
    <path d="M100 448l-15 39m280-39-6 39m250-39 15 39m71 0 12 33m-239-33 8 33m-253-33-7 33" fill="none" opacity=".25"/>
    <path d="M286 367H515Q527 367 535 378L580 426Q589 438 574 441H226Q212 438 220 428L269 376Q277 367 286 367Z" fill="${rug}"/>
    <path d="M253 425H551M282 380h238" fill="none" opacity=".43" stroke-dasharray="4 8" stroke-width="2"/>
    ${art}
   </g></svg>`;
 }
 root.KeycapHome={rooms,dishes,servedLine,plateIcon,tabs,primary,ambient,scene};
})(globalThis);
