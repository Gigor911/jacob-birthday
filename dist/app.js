import * as THREE from './vendor/three.module.js';
import {fitSubjects,boxCorners} from './framing.mjs';
const $=s=>document.querySelector(s), reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
import {DURATION,shots,actionAt,pathAt,facingAt,ease as smooth} from './timeline.mjs';
let person='Jacob',wish='The best is still to come.',t=0,playing=false,sound=false,audio;
const scene=new THREE.Scene();scene.background=new THREE.Color('#142b36');scene.fog=new THREE.FogExp2('#142b36',.035);
const stage=$('#stage');let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});}catch(e){$('#fallback').hidden=false;document.body.classList.add('error');throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;stage.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-label','Inside a lantern-lit birthday garden with Jacob, Galia, Ihor, Daryna, Maya and Davyd celebrating a birthday');renderer.domElement.setAttribute('role','img');
const camera=new THREE.PerspectiveCamera(48,1,.08,120);
scene.add(new THREE.HemisphereLight(0x8eafca,0x30291e,.85));const key=new THREE.DirectionalLight(0xffd6a0,3.2);key.position.set(-3,6,4);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=9;key.shadow.camera.bottom=-9;key.shadow.normalBias=.035;key.shadow.radius=4;scene.add(key);const rim=new THREE.DirectionalLight(0x9bc8e8,2);rim.position.set(2,7,-6);scene.add(rim);
const mat=(color,roughness=.63)=>new THREE.MeshStandardMaterial({color,roughness});const cream=mat('#fff1d7'),coral=mat('#db7059'),pink=mat('#edb3ad'),gold=mat('#e8b95f'),sage=mat('#9eaf94'),lavender=mat('#aaa0c9'),dark=mat('#44362d'),white=mat('#fff8e9');
function mesh(geo,m,parent=scene,x=0,y=0,z=0){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
const sphere=(m,p,x,y,z,sx,sy=sx,sz=sx)=>{const o=mesh(new THREE.SphereGeometry(1,32,24),m,p,x,y,z);o.scale.set(sx,sy,sz);return o;};
const cyl=(rt,rb,h,m,p,x=0,y=0,z=0)=>mesh(new THREE.CylinderGeometry(rt,rb,h,64),m,p,x,y,z);
function tube(points,r,m,parent=scene){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),32,r,8,false),m,parent);}
mesh(new THREE.PlaneGeometry(200,200),mat('#243d37'),scene,0,-.22,0).rotation.x=-Math.PI/2;
// A continuous terrace extends around the viewer; no miniature display plinth.
const timber=mat('#765641');
for(let i=-14;i<=14;i++)mesh(new THREE.BoxGeometry(.47,.14,26),timber,scene,i*.49,-.1,1);
const bulbMat=new THREE.MeshStandardMaterial({color:'#fff0c5',emissive:'#ffbb66',emissiveIntensity:4});
const glowCanvas=document.createElement('canvas');glowCanvas.width=64;glowCanvas.height=64;const ctx=glowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(255,210,130,.7)');gradient.addColorStop(.15,'rgba(255,180,80,.18)');gradient.addColorStop(1,'rgba(255,150,60,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);const glowTexture=new THREE.CanvasTexture(glowCanvas);
function glow(x,y,z,size){const o=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));o.position.set(x,y,z);o.scale.setScalar(size);scene.add(o);return o;}
for(const z of [-5,1,7]){for(const x of [-6,6]){cyl(.065,.09,6,mat('#4c4035'),scene,x,2.9,z);}tube([[-6,5.9,z],[0,4.6,z],[6,5.9,z]],.015,dark);for(let i=0;i<13;i++){const x=-5.6+i*.93,y=4.6+1.3*(x/6)**2;sphere(bulbMat,scene,x,y-.08,z,.055,.09,.055);glow(x,y-.08,z,.65);}const light=new THREE.PointLight(0xffc481,24,13,2);light.position.set(0,4.5,z);scene.add(light);}
for(let i=0;i<22;i++){const a=i/22*Math.PI*2,x=Math.cos(a)*(10+i%3),z=Math.sin(a)*(10+i%3);if(z>3)continue;cyl(.13,.25,6,mat('#263a35'),scene,x,2.7,z);const leaves=mat(i%2?'#284b48':'#24413e');for(let j=0;j<3;j++)sphere(leaves,scene,x+Math.sin(i+j)*.8,4+j*.9,z+Math.cos(i+j)*.7,1.6,1.7,1.4);}
for(const x of [-4.7,4.7])for(const z of [-3,3,7]){cyl(.2,.24,.48,mat('#b18b60'),scene,x,.18,z);sphere(bulbMat,scene,x,.49,z,.12,.18,.12);glow(x,.5,z,1.3);const l=new THREE.PointLight(0xffae59,3,4,2);l.position.set(x,.65,z);scene.add(l);}
const candleLight=new THREE.PointLight(0xffb650,4,5,2);candleLight.position.set(0,2.2,1.1);scene.add(candleLight);

// Distinct articulated cast based on the supplied photo references.
function character({role,shirt,hairColor,skinColor='#e7b694',scale=1,style='short',eyes='#657e87'}){
const g=new THREE.Group();scene.add(g);g.scale.setScalar(scale);g.name=role;const root=new THREE.Group();g.add(root);const skin=mat(skinColor),hair=mat(hairColor),cloth=mat(shirt),legs=[],arms=[];
for(const side of [-1,1]){const leg=new THREE.Group();leg.position.set(side*.21,.65,0);root.add(leg);sphere(mat('#424951'),leg,0,-.24,0,.16,.34,.17);sphere(cream,leg,0,-.56,.12,.19,.12,.28);legs.push(leg);}
sphere(cloth,root,0,1.12,0,.48,.59,.32);sphere(skin,root,0,1.69,0,.17,.2,.16);
const head=new THREE.Group();head.position.y=2.12;root.add(head);sphere(skin,head,0,0,0,.43,.51,.40);sphere(skin,head,-.43,-.02,0,.085,.14,.10);sphere(skin,head,.43,-.02,0,.085,.14,.10);
sphere(hair,head,0,.27,-.09,.43,.28,.36);
if(style==='long'){for(const side of [-1,1])for(let i=0;i<5;i++)sphere(hair,head,side*(.35+Math.sin(i)*.04),.17-i*.15,-.1,.17,.25,.29);sphere(hair,head,-.17,.34,.16,.29,.15,.24);}
else if(style==='curly'){for(let i=0;i<18;i++){const a=i*2.4;sphere(hair,head,Math.cos(a)*(.12+(i%3)*.1),.35+(i%4)*.04,Math.sin(a)*.22,.12,.11,.12);}}
else{for(let i=0;i<6;i++)sphere(hair,head,-.31+i*.12,.32+Math.sin(i*.6)*.08,.13,.14,.09,.17);}
const eyeMeshes=[];for(const side of [-1,1]){sphere(white,head,side*.16,.025,.373,.077,.055,.03);const eye=sphere(mat(eyes),head,side*.16,.025,.399,.035,.043,.014);sphere(dark,head,side*.16,.024,.413,.018,.029,.009);sphere(white,head,side*.16-.01,.04,.422,.009);eyeMeshes.push(eye);tube([[side*.16-.08,.15,.37],[side*.16,.17,.4],[side*.16+.08,.15,.37]],.023,hair,head);sphere(pink,head,side*.27,-.13,.32,.06,.035,.03);}
sphere(skin,head,0,-.07,.406,.065,.095,.085);const smile=tube([[-.14,-.23,.333],[0,-.28,.38],[.14,-.23,.333]],.018,mat('#914c43'),head);sphere(white,head,0,-.247,.372,.1,.022,.015);
for(const side of [-1,1]){const shoulder=new THREE.Group();shoulder.position.set(side*.43,1.49,0);root.add(shoulder);sphere(cloth,shoulder,0,-.21,0,.16,.25,.17);const elbow=new THREE.Group();elbow.position.y=-.4;shoulder.add(elbow);sphere(skin,elbow,0,-.15,0,.115,.2,.12);const hand=sphere(skin,elbow,0,-.33,0,.12,.13,.10);arms.push({shoulder,elbow,hand});}
// Collars, buttons and recognizable accessories are geometry, not pasted photos.
for(const side of [-1,1]){const c=mesh(new THREE.BoxGeometry(.18,.19,.045),role==='mother'?coral:cloth,root,side*.13,1.56,.29);c.rotation.z=side*.45;}
for(let i=0;i<3;i++)sphere(role==='birthday'?mat('#997274'):gold,root,0,1.42-i*.2,.32,.026);
if(role==='birthday'){
const frame=mat('#303c48');for(const side of [-1,1]){const x=side*.195;tube([[x-.16,.12,.412],[x+.15,.12,.412],[x+.14,-.08,.425],[x-.14,-.08,.425],[x-.16,.12,.412]],.018,frame,head);tube([[side*.35,.1,.41],[side*.43,.12,.05]],.017,frame,head);}tube([[-.04,.07,.44],[0,.1,.45],[.04,.07,.44]],.016,frame,head);
for(const side of [-1,1])sphere(mat('#69675f'),head,side*.4,.17,-.03,.05,.15,.22);
}else if(role==='father'){sphere(hair,head,0,-.32,.19,.29,.18,.21);sphere(skin,head,0,-.21,.32,.23,.13,.09);for(const side of [-1,1])sphere(hair,head,side*.075,-.16,.39,.085,.035,.035);sphere(hair,head,0,-.32,.38,.07,.06,.025);sphere(gold,head,.46,-.09,.03,.025);}
if(role==='boy'){for(const side of [-1,1])for(let i=0;i<3;i++){const o=mesh(new THREE.TorusGeometry(.08,.018,6,12),mat('#9d5b35'),root,side*.24,.92+i*.18,.29);o.scale.y=.8;}head.scale.setScalar(1.07);}
if(role==='baby'){const skirt=cyl(.33,.58,.55,white,root,0,.85,0);head.scale.setScalar(1.18);for(let i=0;i<9;i++){const a=i/8*Math.PI;const x=Math.cos(a)*.43,y=.2+Math.sin(a)*.32;for(let j=0;j<5;j++)sphere(white,head,x+Math.cos(j*1.256)*.045,y+Math.sin(j*1.256)*.045,.25,.045,.04,.025);sphere(gold,head,x,y,.28,.02);} }
return {g,root,head,arms,legs,role,scale,smile};}
const birthday=character({role:'birthday',shirt:'#f2eee4',hairColor:'#45423d',eyes:'#685b47',scale:1.08});
const mother=character({role:'mother',shirt:'#29262c',hairColor:'#67462d',style:'long',scale:1});
const father=character({role:'father',shirt:'#64402e',hairColor:'#342b23',style:'curly',scale:1.06});
const boy=character({role:'boy',shirt:'#eee0b9',hairColor:'#a18350',scale:.64});
const baby=character({role:'baby',shirt:'#fff7ec',hairColor:'#ba996c',scale:.40});
const wife=character({role:'wife',shirt:'#c7c6bc',hairColor:'#59402e',skinColor:'#e5b797',eyes:'#62483a',style:'long',scale:.98});
for(const side of [-1,1]){const e=mesh(new THREE.TorusGeometry(.044,.012,8,16),gold,wife.head,side*.44,-.13,.03);}
const cast=[birthday,wife,mother,father,boy,baby];
// Camera-facing wooden name planks follow each animated head in world space.
const namePlanks=cast.map(c=>{
const names={birthday:'Jacob',wife:'Galia',father:'Ihor',mother:'Daryna',baby:'Maya',boy:'Davyd'};
const canvas=document.createElement('canvas');canvas.width=512;canvas.height=144;const context=canvas.getContext('2d');
context.fillStyle='#89603d';context.fillRect(0,0,512,144);
for(let i=0;i<16;i++){context.strokeStyle=i%2?'#765033':'#a8794d';context.lineWidth=2;context.beginPath();context.moveTo(0,i*10);context.bezierCurveTo(160,i*10-8,350,i*10+11,512,i*10-3);context.stroke();}
context.strokeStyle='#c69a65';context.lineWidth=4;context.strokeRect(7,7,498,130);context.fillStyle='#3d2b21';for(const x of [20,492])for(const y of [20,124]){context.beginPath();context.arc(x,y,3,0,Math.PI*2);context.fill();}
context.textAlign='center';context.textBaseline='middle';context.font='600 64px Georgia';context.shadowColor='#2b1b13';context.shadowBlur=3;context.shadowOffsetY=3;context.fillStyle='#fff0ce';context.fillText(names[c.role],256,76);
const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const edge=new THREE.MeshBasicMaterial({color:'#62432c'}),face=new THREE.MeshBasicMaterial({map:texture});const plank=mesh(new THREE.BoxGeometry(1.05,.30,.055),[edge,edge,edge,edge,face,edge]);plank.castShadow=false;plank.receiveShadow=false;plank.name=names[c.role]+' name plank';return {character:c,plank};
});
// A carried infant remains parented to the supporting adult throughout the film.
scene.remove(baby.g);mother.root.add(baby.g);baby.g.position.set(.5,1.1,.43);
const table=new THREE.Group();scene.add(table);table.position.set(0,0,1.35);cyl(.72,.72,.12,timber,table,0,.62);for(const x of [-.45,.45])for(const z of [-.4,.4])cyl(.045,.045,.6,timber,table,x,.27,z);
const cake=new THREE.Group();scene.add(cake);cake.position.set(0,0,1.05);cyl(.43,.65,.64,cream,cake,0,.4);cyl(1.13,1.13,.13,white,cake,0,.76);cyl(.96,.96,.65,pink,cake,0,1.13);cyl(.97,.97,.10,cream,cake,0,1.47);cyl(.68,.68,.51,coral,cake,0,1.76);cyl(.7,.7,.12,cream,cake,0,2.04);
for(let i=0;i<22;i++){let a=i/22*Math.PI*2;sphere(cream,cake,Math.cos(a)*.91,1.44,Math.sin(a)*.91,.10,.12+(i%3)*.035,.10);}
for(let i=0;i<14;i++){let a=i/14*Math.PI*2;sphere(pink,cake,Math.cos(a)*.66,1.99,Math.sin(a)*.66,.085,.13,.085);}
// Fifty small candles: 32 around the lower tier and 18 on the upper tier.
const flames=[],candlePoints=[];
for(let i=0;i<50;i++){const lower=i<32,n=lower?32:18,j=lower?i:i-32,angle=j/n*Math.PI*2,r=lower?.84:(j%2?.49:.29),x=Math.cos(angle)*r,z=Math.sin(angle)*r,base=lower?1.52:2.10,height=.22+(i%3)*.025;
cyl(.017,.017,height,[cream,gold,lavender,coral][i%4],cake,x,base+height/2,z);cyl(.006,.006,.04,dark,cake,x,base+height+.02,z);
const f=sphere(new THREE.MeshStandardMaterial({color:'#ffe7a1',emissive:'#ffb23c',emissiveIntensity:3}),cake,x,base+height+.06,z,.022,.05,.022);flames.push(f);candlePoints.push(new THREE.Vector3(x,base+height+.06,z));}
const smoke=[];for(let i=0;i<14;i++){const material=new THREE.SpriteMaterial({map:glowTexture,color:'#9cabb8',transparent:true,opacity:0,depthWrite:false});const o=new THREE.Sprite(material);scene.add(o);smoke.push(o);}
const balloons=[];function balloon(x,y,z,m){const g=new THREE.Group();scene.add(g);g.position.set(x,y,z);sphere(m,g,0,0,0,.43,.56,.43);mesh(new THREE.ConeGeometry(.065,.12,16),m,g,0,-.57,0);tube([[0,-.6,0],[-.1,-1.2,.05],[.12,-1.9,0],[.04,-2.65,.1]],.009,cream,g);balloons.push({g,y});}
balloon(-3.45,3.7,-.55,gold);balloon(-2.8,4.25,-1.3,pink);balloon(-3.9,2.8,0,sage);balloon(3.35,3.9,-.6,lavender);balloon(3.9,3.15,-.1,gold);balloon(2.75,4.45,-1.2,coral);
function gift(x,z,size,m,ribbon){const g=new THREE.Group();g.position.set(x,size/2+.1,z);scene.add(g);const b=mesh(new THREE.BoxGeometry(size,size,size),m,g);mesh(new THREE.BoxGeometry(size+.04,.11,size+.04),m,g,0,size/2-.03);mesh(new THREE.BoxGeometry(size*.15,size+.06,size+.07),ribbon,g);mesh(new THREE.BoxGeometry(size+.07,size+.07,size*.15),ribbon,g);for(const s of [-1,1]){const bow=mesh(new THREE.TorusGeometry(size*.16,.035,8,24),ribbon,g,s*size*.12,size*.67,0);bow.rotation.y=.4;bow.rotation.z=s*.6;bow.scale.y=.65;}g.rotation.y=x*.15;return g;}
const present=gift(0,0,.48,coral,cream);const secondPresent=gift(0,0,.33,lavender,gold);gift(-3.6,-1,.65,sage,cream);
// Paper bunting across the back of the miniature set.
tube([[-4.4,4.3,-2.3],[0,3.35,-2.5],[4.4,4.3,-2.3]],.016,cream);
for(let i=0;i<11;i++){const x=-3.8+i*.76,y=3.35+.95*(x/4.4)**2;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([-.18,0,0,.18,0,0,0,-.36,0],3));geo.computeVertexNormals();const m=[coral,gold,lavender,sage][i%4].clone();m.side=THREE.DoubleSide;mesh(geo,m,scene,x,y,-2.45);}
let seed=1234;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};const confetti=[];for(let i=0;i<160;i++){const o=mesh(new THREE.PlaneGeometry(.065,.14),[coral,gold,lavender,sage,pink][i%5].clone());o.material.side=THREE.DoubleSide;confetti.push({o,x:(random()-.5)*10,y:random()*8,z:(random()-.5)*6,s:random(),phase:random()*6.28});}
function shotAt(v){return shots.findIndex(s=>v<s.end)===-1?shots.length-1:shots.findIndex(s=>v<s.end);}
const mix=THREE.MathUtils.lerp;
function arms(c,raise,clap=0){c.arms.forEach((a,i)=>{a.shoulder.rotation.set(-raise,0,(i===0?-1:1)*(.12+clap));a.elbow.rotation.set(-raise*.3,0,0);});}
function place(c,x,z,turn=0,walk=0,v=0){c.g.position.set(x,Math.abs(Math.sin(v*7))*walk*.055,z);c.g.rotation.y=turn;c.root.rotation.set(0,0,Math.sin(v*2)*.01);c.head.rotation.set(0,0,0);c.legs.forEach((leg,i)=>leg.rotation.x=Math.sin(v*7+i*Math.PI)*walk*.45);arms(c,0);}
function worldHand(c,i){scene.updateMatrixWorld(true);return c.arms[i].hand.getWorldPosition(new THREE.Vector3());}
function centerHands(c){return worldHand(c,0).lerp(worldHand(c,1),.5);}
// Two-bone arm solving keeps hands on the parcel during the exchange.
function reach(c,i,worldTarget,weight=1){
scene.updateMatrixWorld(true);const arm=c.arms[i],target=c.root.worldToLocal(worldTarget.clone()),origin=arm.shoulder.position.clone(),delta=target.sub(origin),d=Math.min(.724,Math.max(.08,delta.length())),direction=delta.normalize(),l1=.4,l2=.33;
const along=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along)),bend=new THREE.Vector3(0,-1,.3);bend.addScaledVector(direction,-bend.dot(direction)).normalize();const upper=direction.clone().multiplyScalar(along).addScaledVector(bend,height),lower=direction.clone().multiplyScalar(d).sub(upper),down=new THREE.Vector3(0,-1,0),q1=new THREE.Quaternion().setFromUnitVectors(down,upper.normalize()),q2=new THREE.Quaternion().setFromUnitVectors(down,lower.normalize());arm.shoulder.quaternion.slerp(q1,weight);arm.elbow.quaternion.slerp(q1.clone().invert().multiply(q2),weight);
}
function pose(v,aspect=camera.aspect){const a=actionAt(v),celebrate=a.celebrate;
for(const c of [birthday,mother,boy,father]){const [x,z]=pathAt(c.role,v),motion=facingAt(c.role,v);place(c,x,z,motion.yaw,Math.min(1,motion.speed),v);const start=pathAt(c.role,0),distance=Math.hypot(x-start[0],z-start[1]);c.legs.forEach((leg,i)=>{leg.rotation.x=Math.sin(distance*11+i*Math.PI)*Math.min(1,motion.speed)*.45;});c.g.position.y=Math.abs(Math.sin(distance*11))*Math.min(1,motion.speed)*.045;}
place(wife,1.4,-.9,-.16,0,v);wife.head.rotation.z=-.08;scene.updateMatrixWorld(true);reach(wife,0,birthday.root.localToWorld(new THREE.Vector3(.4,1.5,0)));
father.g.visible=v>=20;mother.g.visible=boy.g.visible=v>=5;
// Mother supports the baby with her right forearm; baby kicks and waves independently.
mother.arms[1].shoulder.rotation.set(-1.3,0,.2);mother.arms[1].elbow.rotation.x=-.85;
baby.g.rotation.set(.08,0,-.1);baby.legs.forEach((leg,i)=>leg.rotation.x=-.7+Math.sin(v*4+i)*.15);arms(baby,.6+Math.sin(v*5)*.25);baby.head.rotation.y=Math.sin(v)*.12;
mother.arms[0].shoulder.rotation.z=-.3-(v>7&&v<12?(.6+Math.sin(v*5)*.2):0);
// Child holds the gift against the chest, extends it, then releases it to Jacob.
arms(boy,1.35+a.offer*.25-a.transfer*.9);boy.head.rotation.x=-.14*a.offer;
const bend=smooth(12,15,v)*(1-smooth(18,20,v));birthday.root.rotation.x=.25*bend+.22*a.lean; birthday.root.position.y=-.26*bend;birthday.head.rotation.x=.13*bend+.13*a.lean;birthday.head.rotation.y=v<12?-.3*smooth(3,5,v):-.3*bend;
arms(birthday,.9*a.offer*(1-a.putGift));birthday.arms[0].shoulder.rotation.z=-.15-.35*bend;
const childHold=centerHands(boy).add(new THREE.Vector3(0,.1,.09)),receive=centerHands(birthday).add(new THREE.Vector3(-.12,.12,.1));const meeting=new THREE.Vector3(-.5,1.02,.15);present.position.copy(childHold.lerp(meeting,a.offer));present.position.lerp(receive,a.transfer);present.position.lerp(new THREE.Vector3(-1.7,.3,-.3),a.putGift);present.rotation.set(0,mix(.6,0,a.transfer),0);present.visible=v>=5;
if(v>=12&&v<19){for(let i=0;i<2;i++){const grip=present.position.clone().add(new THREE.Vector3(i===0?-.22:.22,-.1,0));reach(boy,i,grip,a.offer*(1-a.transfer));reach(birthday,i,grip,a.offer);}}
// A smaller parcel is carried by the other adult and placed beside Jacob's gift.
secondPresent.position.copy(worldHand(mother,0)).add(new THREE.Vector3(0,-.08,0));secondPresent.position.lerp(new THREE.Vector3(-2.3,.22,.45),smooth(11,13,v));secondPresent.visible=v>=5;
// The cake stays at full size and travels with its carrier, then lowers onto the table.
arms(father,1.3*(1-a.stepBack));cake.scale.setScalar(.5);const carried=centerHands(father).add(new THREE.Vector3(0,-.38,.12).applyAxisAngle(new THREE.Vector3(0,1,0),father.g.rotation.y));cake.position.copy(carried.lerp(new THREE.Vector3(0,.65,1.35),a.cakeSet));cake.rotation.y=0;cake.visible=v>=20;
if(v>=20&&v<28){for(let i=0;i<2;i++){const grip=cake.position.clone().add(new THREE.Vector3(.48,.38,i===0?-.20:.20));reach(father,i,grip,a.cakeSet*(1-a.stepBack));}}
scene.updateMatrixWorld(true);reach(mother,1,mother.root.localToWorld(new THREE.Vector3(.5,1.12,.45)));

if(celebrate>0){for(const c of [father,birthday,wife]){arms(c,1.05,.35+Math.sin(v*9)*.25);c.arms.forEach((arm,i)=>{arm.shoulder.rotation.y=(i===0?1:-1)*(.65+Math.sin(v*9)*.18);});}arms(boy,1.8);boy.g.position.y=Math.abs(Math.sin((v-35)*5))*.18*celebrate;mother.arms[0].shoulder.rotation.z=-1.9;baby.arms[0].shoulder.rotation.z=-1.8;}
balloons.forEach((b,i)=>{b.g.position.y=b.y+Math.sin(v*1.2+i)*.09;b.g.rotation.z=Math.sin(v*.8+i)*.06;});
flames.forEach((f,i)=>{f.visible=!a.blown;f.scale.y=.05*(1+Math.sin(v*11+i)*.16);});candleLight.position.copy(cake.position).add(new THREE.Vector3(0,1.8,0));birthday.smile.scale.y=1-.7*smooth(32,33.4,v)*(1-smooth(33.5,34,v));candleLight.intensity=cake.visible&&!a.blown?4:0;
smoke.forEach((o,i)=>{const elapsed=v-33.5-i*.10;o.visible=elapsed>0&&elapsed<2.8;const progress=Math.max(0,elapsed);o.position.set(cake.position.x+((i%2)? .21:-.09)+Math.sin(i+v)*.06,cake.position.y+1.46+progress*.3,cake.position.z);o.scale.setScalar(.10+progress*.20);o.material.opacity=Math.max(0,.35-progress*.12);});
confetti.forEach(c=>{c.o.visible=v>=35;const elapsed=Math.max(0,v-35);c.o.position.set(c.x+Math.sin(elapsed+c.phase)*.5,5+c.y-elapsed*(.8+c.s*.3),c.z);c.o.rotation.set(elapsed*2+c.phase,elapsed+c.phase,elapsed*1.3);});
// The camera frames each action and its recipient, with edited cuts between beats.
let from,to,targetFrom,targetTo,q;
if(v<5){q=smooth(0,5,v);from=[2,2.3,6.4];to=[1.5,2.25,5.8];targetFrom=[.7,1.85,-.55];targetTo=[.5,1.85,-.4];}
else if(v<12){q=smooth(5,12,v);from=[-3.8,2.7,8];to=[-2.4,2.4,7];targetFrom=[-2,1.4,.1];targetTo=[-.9,1.4,0];}
else if(v<20){q=smooth(12,20,v);from=[-2.8,1.85,4.5];to=[-1.8,1.85,4.2];targetFrom=[-.6,1.25,.15];targetTo=[-.2,1.4,0];}
else if(v<29){q=smooth(20,29,v);from=[4.3,2.75,6.4];to=[2.2,2.8,5.8];targetFrom=[2,1.65,.5];targetTo=[.3,1.65,.6];}
else if(v<35){q=smooth(29,35,v);from=[1.4,2.9,5.4];to=[.9,2.75,4.8];targetFrom=[.15,2.0,.7];targetTo=[.15,2,.7];}
else{q=smooth(35,44,v);from=[-.8,2.6,7.6];to=[.5,3,9.2];targetFrom=[0,1.65,0];targetTo=[0,1.8,0];}
const cp=new THREE.Vector3(...from).lerp(new THREE.Vector3(...to),q),target=new THREE.Vector3(...targetFrom).lerp(new THREE.Vector3(...targetTo),q);camera.fov=48;camera.position.copy(cp);camera.lookAt(target);camera.updateProjectionMatrix();
scene.updateMatrixWorld(true);for(const {character:c,plank} of namePlanks){plank.visible=c.g.visible&&(c!==baby||mother.g.visible);c.head.getWorldPosition(plank.position);plank.position.y+=.56*c.scale+.24;plank.quaternion.copy(camera.quaternion);if(c===baby)plank.position.x+=.10;}
// Reserve room for subtitles and controls; decorations do not drive the framing.
scene.updateMatrixWorld(true);
const subjects=[...cast.filter(c=>c.g.visible&&(c!==baby||mother.g.visible)).map(c=>c.g),...namePlanks.filter(n=>n.plank.visible).map(n=>n.plank),...[cake,present,secondPresent].filter(o=>o.visible)];
const points=subjects.flatMap(o=>boxCorners(new THREE.Box3().setFromObject(o)));
fitSubjects(camera,target,points,{left:.89,top:.82,bottom:stage.clientHeight<500?.46:.58});
}

function updateUI(){const index=shotAt(t);$('#chapter').textContent=`0${index+1} / ${shots[index].name.toUpperCase()}`;$('#line').textContent=index===5?`Happy birthday${person?', '+person:''}! ${wish}`:shots[index].line;$('#scrub').value=t;$('#time').textContent=`00:${String(Math.floor(t)).padStart(2,'0')} / 00:44`;$('#play').textContent=playing?'Ⅱ':'▶';$('#play').setAttribute('aria-label',playing?'Pause animation':'Play animation');document.querySelectorAll('.frame').forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-pressed',i===index);});}
function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;pose(t);renderer.render(scene,camera);}window.addEventListener('resize',resize);new ResizeObserver(resize).observe(stage);window.visualViewport?.addEventListener('resize',resize);
shots.forEach((s,i)=>{const b=document.createElement('button');b.className='frame';b.innerHTML=`<img alt="${s.name} keyframe"><div class="frame-bottom"><b><span>0${i+1}</span>${s.name}</b><small>${s.start}–${s.end}s</small></div>`;b.onclick=()=>{t=s.time;playing=false;document.body.classList.add('started');$('#script-dialog').close();updateUI();};$('#frames').append(b);$('#script-content').innerHTML+=`<p><strong>0${i+1} · ${s.name}</strong><br>${s.note}</p>`;});
renderer.setSize(500,250);camera.aspect=2;shots.forEach((s,i)=>{pose(s.time);renderer.render(scene,camera);document.querySelectorAll('.frame img')[i].src=renderer.domElement.toDataURL('image/png');});resize();
$('#begin').onclick=()=>{document.body.classList.add('started');t=reduced?39:0;playing=!reduced;updateUI();};$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{}};
$('#play').onclick=()=>{if(t>=DURATION)t=0;playing=!playing;updateUI();};$('#replay').onclick=()=>{t=0;playing=true;updateUI();};$('#scrub').oninput=e=>{t=Number(e.target.value);playing=false;updateUI();};$('#wish').onclick=()=>{t=29;playing=!reduced;chime();updateUI();};$('#personalize').onclick=()=>{playing=false;$('#editor').showModal();};$('#script').onclick=()=>{playing=false;$('#script-dialog').showModal();};$('#save').onclick=()=>{person=$('#name').value.trim();wish=$('#message').value.trim();$('#editor').close();t=39;playing=false;updateUI();};
let songTimer=null,scheduledNodes=[],songCursor=0,songAnchor=0;
// Public-domain melody, synthesized locally as a gentle music-box arrangement.
const melody=[[67,.75],[67,.25],[69,1],[67,1],[72,1],[71,2],[67,.75],[67,.25],[69,1],[67,1],[74,1],[72,2],[67,.75],[67,.25],[79,1],[76,1],[72,1],[71,1],[69,2],[77,.75],[77,.25],[76,1],[72,1],[74,1],[72,2]];
const beat=.48,score=[];let scoreTime=0;for(const [note,length] of melody){score.push({note,at:scoreTime,duration:length*beat});scoreTime+=length*beat;}
function tone(note,at,duration,gainValue=.06){const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type='triangle';oscillator.frequency.value=440*2**((note-69)/12);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(gainValue,at+.012);gain.gain.exponentialRampToValueAtTime(.001,at+duration+.25);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(at);oscillator.stop(at+duration+.3);scheduledNodes.push(oscillator);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();scheduledNodes=scheduledNodes.filter(n=>n!==oscillator);};}
function stopSong(){clearInterval(songTimer);songTimer=null;for(const n of scheduledNodes){try{n.stop();}catch{}}scheduledNodes=[];}
async function startSong(){stopSong();if(!sound||!playing)return;audio??=new(window.AudioContext||window.webkitAudioContext)();await audio.resume();songCursor=0;songAnchor=audio.currentTime+.08;const offset=t%scoreTime;while(songCursor<score.length&&score[songCursor].at<offset)songCursor++;songAnchor-=offset;
const schedule=()=>{if(!playing||!sound){stopSong();return;}while(songAnchor+(score[songCursor]?.at??scoreTime)<audio.currentTime+.15){if(songCursor>=score.length){songCursor=0;songAnchor+=scoreTime;}const event=score[songCursor++],at=Math.max(audio.currentTime+.01,songAnchor+event.at);tone(event.note,at,event.duration);if(songCursor%4===1){tone(48,at,event.duration+.2,.018);tone(55,at,event.duration+.2,.012);}}};schedule();songTimer=setInterval(schedule,80);}
function chime(){if(sound&&audio)[72,76,79,84].forEach((n,i)=>tone(n,audio.currentTime+i*.12,.8,.035));}
$('#sound').onclick=()=>{sound=!sound;$('#sound span').textContent=sound?'Music on':'Music off';$('#sound').setAttribute('aria-pressed',sound);if(sound)startSong();else stopSong();};
for(const selector of ['#play','#replay','#begin','#scrub','#wish','#save','#personalize','#script']){const control=$(selector),event=selector==='#scrub'?'oninput':'onclick',original=control[event];control[event]=e=>{original?.(e);if(selector==='#begin'){sound=true;$('#sound span').textContent='Music on';$('#sound').setAttribute('aria-pressed','true');}if(playing)startSong();else stopSong();};}
document.addEventListener('visibilitychange',()=>{if(document.hidden){playing=false;stopSong();updateUI();}});
let prev=performance.now();renderer.setAnimationLoop(now=>{const dt=Math.min((now-prev)/1000,.05);prev=now;const before=t;if(playing){t=Math.min(DURATION,t+dt);if(before<35&&t>=35)chime();if(t===DURATION){playing=false;stopSong();};}pose(t);updateUI();renderer.render(scene,camera);});
window.postcard={shots,seek(v){t=THREE.MathUtils.clamp(v,0,DURATION);playing=false;pose(t);updateUI();renderer.render(scene,camera);},get time(){return t;}};
console.assert(shots.length===6&&cast.length===6&&flames.length===50,'Birthday scene structure');
