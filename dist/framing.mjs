import * as THREE from './vendor/three.module.js';

// Fit only story subjects, preserving the director's camera angle and minimum distance.
export function fitSubjects(camera, target, points, {left=.90,top=.82,bottom=.56}={}) {
  if (!points.length) return;
  const right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion);
  const up=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion);
  const back=new THREE.Vector3(0,0,1).applyQuaternion(camera.quaternion);
  const coordinates=points.map(point=>{const p=point.clone().sub(target);return {x:p.dot(right),y:p.dot(up),z:p.dot(back)};});
  const centerX=(Math.min(...coordinates.map(p=>p.x))+Math.max(...coordinates.map(p=>p.x)))/2;
  const centerY=(Math.min(...coordinates.map(p=>p.y))+Math.max(...coordinates.map(p=>p.y)))/2;
  const tangent=Math.tan(THREE.MathUtils.degToRad(camera.fov)/2),horizontal=tangent*camera.aspect,offset=(top-bottom)/2;
  let distance=camera.position.distanceTo(target);
  for(const p of coordinates){
    distance=Math.max(distance,p.z+Math.abs(p.x-centerX)/(horizontal*left),((p.y-centerY)/tangent+top*p.z)/(top-offset),(-(p.y-centerY)/tangent+bottom*p.z)/(bottom+offset),p.z+camera.near+.1);
  }
  camera.position.copy(target).addScaledVector(right,centerX).addScaledVector(up,centerY-offset*distance*tangent).addScaledVector(back,distance);
  camera.lookAt(camera.position.clone().sub(back));
  camera.updateMatrixWorld(true);
}

export function boxCorners(box){
  const result=[];
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])result.push(new THREE.Vector3(x,y,z));
  return result;
}
