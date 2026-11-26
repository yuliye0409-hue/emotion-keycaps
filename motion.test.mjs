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

test('sleep settles into a side-lying pose and wake starts there',()=>{
  for(let variant=0;variant<motion.variantCount('sleep');variant++){
    const asleep=pose('sleep',1,variant);
    const waking=pose('wake',0,variant);
    const [headX,headY]=motion.headPoint(asleep,150,32);
    const [feetX,feetY]=motion.headPoint(asleep,150,208);
    assert.ok(Math.abs(headX-feetX)>150 && Math.abs(headY-feetY)<30);
    assert.deepEqual([waking.r,waking.x,waking.y,waking.smile],[asleep.r,asleep.x,asleep.y,asleep.smile]);
    assert.equal(pose('wake',1,variant).r,0);
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
