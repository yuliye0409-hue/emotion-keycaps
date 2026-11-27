import {strict as assert} from 'node:assert';
import {test} from 'node:test';
import {rooms,doors,roomAt,canStand,clearWalk,walkPath} from './house-layout.mjs';

test('each furnished room has a walkable spawn and routes to all other rooms',()=>{
 for(const a of Object.values(rooms)){
  assert.ok(canStand(...a.spot),a.name);
  for(const b of Object.values(rooms)){
   const route=walkPath(a.spot,b.spot);
   assert.ok(route.length,a.name+' → '+b.name);
   assert.deepEqual(route.at(-1),b.spot);
   let previous=a.spot;
   for(const point of route){
    assert.ok(clearWalk(previous,point));
    previous=point;
   }
  }
 }
});

test('only the doorway is walkable across a wall and furniture is solid',()=>{
 for(const d of doors){
  const samples=d.axis==='x'?[[d.x-.7,d.z],[d.x+.7,d.z]]:[[d.x,d.z-.7],[d.x,d.z+.7]];
  assert.notEqual(roomAt(...samples[0]),roomAt(...samples[1]));
  assert.ok(clearWalk(...samples));
  const blocked=samples.map(([x,z])=>d.axis==='x'?[x,z+2]:[x+2,z]);
  assert.equal(clearWalk(...blocked),false);
 }
 assert.equal(canStand(-2.75,-1.5),false);
 assert.equal(canStand(9.1,2.85),false);
 assert.equal(canStand(14,3),false);
});
