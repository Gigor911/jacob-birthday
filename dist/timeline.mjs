export const DURATION=44;
export const ease=(a,b,v)=>{const q=Math.max(0,Math.min(1,(v-a)/(b-a)));return q*q*(3-2*q);};
export const shots=[
{name:'A quiet moment',start:0,end:5,time:2.5,line:'A very special day.',note:'Jacob and his wife wait together. She rests a hand on his shoulder as he turns toward the family.'},
{name:'Here they come',start:5,end:12,time:9,line:'We’re all here for you.',note:'Daryna and Davyd arrive together, with Maya supported in Daryna’s arms.'},
{name:'A family moment',start:12,end:20,time:16.8,line:'',note:'Jacob bends toward Davyd and shares a smile with him.'},
{name:'Birthday lights',start:20,end:29,time:25,line:'',note:'Ihor carries the candlelit cake to the table and steps aside.'},
{name:'Make a wish',start:29,end:35,time:32,line:'Make a wish.',note:'Jacob leans toward the cake, takes a breath and blows. The flames go out and smoke rises.'},
{name:'All together',start:35,end:44,time:39,line:'Happy birthday!',note:'Everyone gathers close. The adults applaud, the boy jumps and the baby waves as confetti falls.'}
];
export function actionAt(t){return {arrival:ease(5,11,t),offer:ease(12,15,t),transfer:ease(15,18,t),putGift:ease(19,21,t),cakeArrival:ease(20,24,t),cakeSet:ease(24,27,t),stepBack:ease(27,29,t),lean:ease(29,32,t)*(1-ease(34,36,t)),blown:t>=33.5,celebrate:ease(35,37,t)};}
const lerp=(a,b,q)=>a+(b-a)*q;
export function pathAt(role,t){const a=actionAt(t);if(role==='mother')return [lerp(-6,-2.1,a.arrival),lerp(2.2,-.15,a.arrival)];if(role==='boy')return [lerp(-5.1,-.9,a.arrival),lerp(2.8,.55,a.arrival)];if(role==='father')return [lerp(5.8,1.1,a.cakeArrival)+a.stepBack*1.2,lerp(1.9,.85,a.cakeArrival)-a.stepBack*.8];return [.25,-.55];}
export function facingAt(role,t){
const p=pathAt(role,t),before=pathAt(role,t-.03),after=pathAt(role,t+.03),speed=Math.hypot(after[0]-before[0],after[1]-before[1])/.06;
const target=role==='father'?[0,1.35]:[.25,-.55];let rest=Math.atan2(target[0]-p[0],target[1]-p[1]);
if(role==='birthday')return {yaw:lerp(-.8,-.13,ease(18,22,t))*(1-ease(35,38,t)),speed:0,moving:false};
const start=role==='father'?(t<26?20:27):5,end=role==='father'?(t<26?24:29):11,p0=pathAt(role,start),p1=pathAt(role,end),travel=Math.atan2(p1[0]-p0[0],p1[1]-p0[1]),delta=Math.atan2(Math.sin(rest-travel),Math.cos(rest-travel));
let yaw=travel+delta*ease(end-.5,end+.7,t);
if(role==='father'&&t>=26&&t<27.2){const previous=pathAt(role,26),restBefore=Math.atan2(-previous[0],1.35-previous[1]);yaw=restBefore+Math.atan2(Math.sin(yaw-restBefore),Math.cos(yaw-restBefore))*ease(26,27.2,t);}
yaw=Math.atan2(Math.sin(yaw),Math.cos(yaw));return {yaw:yaw*(1-ease(35,38,t)),speed,moving:speed>.001};}

