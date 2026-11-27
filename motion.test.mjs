import {strict as assert} from 'node:assert';
import {test} from 'node:test';
import art from './art.js';
import motion from './motion.js';

const pet={...art.character,face:'pensive'};
const pose=(action,fraction,variant=0)=>motion.pose(pet,action,fraction*motion.duration[action],false,variant);

test('the straw meets the mouth throughout both sip variants',()=>{
  for(let variant=0;variant<motion.variantCount('water');variant++){
    for(let i=44;i<=70;i++){
      const q=pose('water',i/100,variant);
      assert.equal(q.smile,'sip');
      const tip=motion.rotate(motion.strawTip,q.cup.r).map((v,j)=>v+q.cup.xy[j]);
      const mouth=motion.headPoint(q,...motion.sipPoint);
      assert.ok(Math.hypot(tip[0]-mouth[0],tip[1]-mouth[1])<.001);
      const local=motion.localPoint(q,...q.cup.grip);
      assert.ok(Math.hypot(...motion.headPoint(q,...local).map((v,j)=>v-q.cup.grip[j]))<.001);
    }
  }
});

test('sleep lies centered under the quilt and wake starts in that same pose',()=>{
  for(let variant=0;variant<motion.variantCount('sleep');variant++){
    const asleep=pose('sleep',1,variant);
    const waking=pose('wake',0,variant);
    const [headX,headY]=motion.headPoint(asleep,150,32);
    const [feetX,feetY]=motion.headPoint(asleep,150,208);
    assert.equal(headX,feetX);
    assert.ok(headY>80 && headY<110 && feetY>175 && feetY<215);
    assert.deepEqual(waking,asleep);
    assert.equal(pose('wake',1,variant).lie,0);
    const svg=art.make(pet,'Kali','sleep',motion.duration.sleep,true,variant);
    assert.ok(svg.indexOf('class="sleep-mattress"')<svg.indexOf('class="head"'));
    assert.ok(svg.indexOf('class="head"')<svg.indexOf('class="sleep-quilt"'));
  }
});

test('special star eyes replace the pupils and sip frames keep a filled mitt',()=>{
  const custom={...pet,palette:{pupils:'#010203',arms:'#302419',hands:'#ac4123'}};
  const paint=art.partColors(custom);
  for(const id of ['excited','sparkle']){
    const face=art.expression(id,paint);
    assert.match(face,/fill="#ffce52"/);
    assert.doesNotMatch(face,/#010203|<ellipse|<circle/);
  }
  for(const fraction of [.20,.37,.55,.76,.90]){
    const svg=art.make(custom,'Kali','water',motion.duration.water*fraction);
    assert.match(svg,/class="drinking-mitt"><path[^>]+fill="#302419"\/><path[^>]+fill="#ac4123"/);
  }
});

test('the hidden pose waits for a separate reveal behind the box',()=>{
  for(const t of [1,2,10]){
    const q=pose('peek',t);
    assert.ok(q.box.hidden && q.box.alpha===1);
    assert.doesNotMatch(art.make(pet,'Kali','peek',t*motion.duration.peek),/class="head"/);
  }
  const revealed=pose('peekReveal',.44);
  assert.ok(!revealed.box.hidden && revealed.box.clip);
  assert.ok(motion.headPoint(revealed,180,108)[1]<motion.peekBox.top);
  assert.equal(pose('peekReveal',1).box.alpha,0);
});

test('the workbench offers at least 50 unique drawn expressions',()=>{
  assert.ok(art.faces.length>=50);
  assert.equal(new Set(art.faces.map(([id])=>id)).size,art.faces.length);
  assert.equal(new Set(art.faces.map(([id])=>art.expression(id))).size,art.faces.length);
  assert.equal(motion.pose(pet,'idle',0,true).smile,pet.face);
});
