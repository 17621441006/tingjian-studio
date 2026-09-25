// Shared placement plan for the detailed and light models, in metres.
// The first two homes keep their original furnishing arrangement.
export function furnishSecondary({spec,rooms,group,box,seat,cylinder,cabinet,chair,bed,m}){
 const room=rooms.get('second'),plan=spec.secondPlan;
 room.userData.plan=plan;
 const desk=(id,x,z,w,d,yaw=0)=>{const g=group(id,'second',x,z,yaw);box(w,.035,d,0,.75,0,m.wood,g);for(const x of [-w/2+.05,w/2-.05])box(.035,.73,d-.06,x,.365,0,m.wood,g);return g;};
 if(plan==='classic')return false;
 if(plan==='zen'){
  const low=bed('second-low-bed','second',8.83,6.03,1.18,0);low.scale.y=.78;
  desk('second-fold-desk',7.39,5.54,.98,.42,Math.PI/2);chair('second-chair','second',7.96,5.53,Math.PI/2);
  cabinet('second-storage','second',8.72,4.68,1.64,.45,1.55);
 }else if(plan==='library'){
  cabinet('second-library','second',9.62,5.68,2.02,.44,1.82,-Math.PI/2,true);
  const love=group('second-loveseat','second',8.44,6.63);box(1.42,.26,.7,0,.22,0,m.wood,love);seat(1.37,.14,.66,0,.40,0,m.sofa,love);seat(1.40,.38,.13,0,.63,.29,m.sofa,love);
  desk('second-listening-desk',7.43,5.38,1.26,.48,Math.PI/2);chair('second-chair','second',8.04,5.38,Math.PI/2);
 }else if(plan==='work'||plan==='foldaway'){
  const wallbed=cabinet('second-foldaway-bed','second',9.62,5.84,1.96,.48,1.95,-Math.PI/2);wallbed.userData.closed=true;wallbed.userData.function='foldaway-bed';
  desk('second-work-desk',7.44,5.72,1.68,.48,Math.PI/2);
  if(plan==='work')desk('second-work-return',8.29,4.68,1.55,.43);
  chair('second-chair','second',8.11,5.62,Math.PI/2);
 }else if(plan==='dressing'){
  bed('second-guest-bed','second',7.89,6.03,1.18,0);
  desk('second-vanity',9.63,5.74,1.10,.44,-Math.PI/2);
  const stool=group('second-vanity-stool','second',9.05,5.75);cylinder(.21,.42,0,.21,0,m.linen,stool);
  cabinet('second-storage','second',9.20,4.69,1.17,.46,1.64);
 }
 return true;
}

export function furnishBalcony({spec,rooms,group,box,seat,cylinder,cabinet,chair,m}){
 const plan=spec.balconyPlan;rooms.get('balcony').userData.plan=plan;
 if(plan==='bench'||plan==='tea')return false;
 const lounge=(id,x,z,yaw=0)=>{const g=group(id,'balcony',x,z,yaw);for(const xx of [-.25,.25])for(const zz of [-.23,.23])cylinder(.018,.33,xx,.165,zz,m.metal,g);seat(.56,.13,.60,0,.38,0,m.sofa,g);seat(.60,.42,.12,0,.62,-.26,m.sofa,g);for(const xx of [-.29,.29])seat(.09,.20,.58,xx,.50,0,m.sofa,g);return g;};
 const side=(x,z)=>{const g=group('balcony-side-table','balcony',x,z);cylinder(.24,.03,0,.49,0,m.stone,g);cylinder(.11,.46,0,.23,0,m.metal,g);};
 if(plan==='tea-pair'){
  lounge('balcony-chair-left',4.14,1.30,-.16);lounge('balcony-chair-right',5.56,1.30,.16);side(4.85,1.43);
 }else{
  const g=lounge('balcony-lounge',4.52,1.30,.30);g.userData.type=plan;
  if(plan==='lounge')g.scale.set(1.04,.87,1.12);
  side(5.46,1.33);
  if(plan==='record')cabinet('balcony-record-cabinet','balcony',6.62,1.56,.66,.32,.70,-Math.PI/2,true);
  if(plan==='reading')cabinet('balcony-book-shelf','balcony',6.76,1.58,.65,.22,1.20,-Math.PI/2,true);
 }
 return true;
}
