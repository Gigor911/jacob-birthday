import assert from 'node:assert/strict';
import {DURATION,shots,actionAt} from './dist/timeline.mjs';
assert.equal(shots[0].start,0);assert.equal(shots.at(-1).end,DURATION);
for(let i=1;i<shots.length;i++)assert.equal(shots[i-1].end,shots[i].start);
assert.equal(actionAt(4).arrival,0);
assert.equal(actionAt(12).arrival,1);
assert.equal(actionAt(14).transfer,0);
assert.equal(actionAt(18).transfer,1);
assert.equal(actionAt(23).cakeSet,0);
assert.equal(actionAt(27).cakeSet,1);
assert.equal(actionAt(33).blown,false);assert.equal(actionAt(34).blown,true);
assert.equal(actionAt(39).celebrate,1);
for(let t=0;t<=44;t+=.1){for(const [key,value] of Object.entries(actionAt(t)))if(typeof value==='number')assert(value>=0&&value<=1,key);}
console.log('Passed: continuous shot coverage, gift before cake, candle blow-out, bounded animation states.');
const {pathAt,facingAt}=await import('./dist/timeline.mjs');
for(const role of ['mother','boy','father']){
 const mid=role==='father'?22:8,p=pathAt(role,mid-.01),q=pathAt(role,mid+.01),f=facingAt(role,mid);
 assert(Math.sin(f.yaw)*(q[0]-p[0])+Math.cos(f.yaw)*(q[1]-p[1])>0,role+' faces along travel');
 const end=role==='father'?24:11;
 assert(Math.abs(facingAt(role,end-.01).yaw-facingAt(role,end+.01).yaw)<.15,role+' turns without snapping');
}
console.log('Passed: cast faces travel direction and turns continuously at arrival.');
