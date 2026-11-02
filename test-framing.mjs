import assert from 'node:assert/strict';
import * as THREE from './dist/vendor/three.module.js';
import {fitSubjects,boxCorners} from './dist/framing.mjs';
const views=[[320,568],[390,844],[768,1024],[844,390],[1440,900],[2560,1080]];
const boxes=[new THREE.Box3(new THREE.Vector3(-3,0,-1),new THREE.Vector3(3,3.6,2)),new THREE.Box3(new THREE.Vector3(-6,0,-1),new THREE.Vector3(2,3.6,3)),new THREE.Box3(new THREE.Vector3(-2,0,-1),new THREE.Vector3(6,3.6,2))];
for(const [w,h] of views)for(const box of boxes){
 const camera=new THREE.PerspectiveCamera(48,w/h,.08,120),target=new THREE.Vector3(0,1.6,0);camera.position.set(2,2.8,5);camera.lookAt(target);camera.updateProjectionMatrix();
 const points=boxCorners(box),bottom=h<500?.46:.58;
 fitSubjects(camera,target,points,{left:.89,top:.82,bottom});
 for(const point of points){const p=point.clone().project(camera);assert(Math.abs(p.x)<=.890001,`${w}x${h}: horizontal clip`);assert(p.y<=.820001&&p.y>=-bottom-.000001,`${w}x${h}: vertical clip`);assert(p.z>-1&&p.z<1);}
}
console.log('Passed: subjects remain inside safe bounds at six portrait, landscape, tablet and ultrawide sizes.');
