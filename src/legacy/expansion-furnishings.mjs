// Approximate furnishing plans inside the existing measured-outline concept model.
// Photographic concept views are separately authored, not reconstructed meshes.
import {EXPANSION_PLANS} from './expansion-homes.mjs';
export function furnishExpansionDining({spec,rooms,objects,group,box,seat,cylinder,cabinet,chair,m}){
 const plan=EXPANSION_PLANS[spec.design]?.dining;if(!plan)return;
 rooms.get('dining').userData.plan=plan;
 for(const [id,obj] of [...objects])if(id==='dining-table'||id.startsWith('dining-chair')||id==='dining-bench'){
  obj.traverse(o=>o.geometry?.dispose());obj.removeFromParent();objects.delete(id);
 }
 const table=group('dining-table','dining',5.16,plan==='folding'?6.44:6.18);
 if(plan==='banquette'){
  cylinder(.51,.04,0,.75,0,m.wood,table);cylinder(.17,.70,0,.37,0,m.metal,table);
  const seat1=cabinet('dining-bench','dining',5.05,6.78,1.68,.47,.42);seat(1.60,.09,.45,0,.46,0,m.sofa,seat1);
  const seat2=cabinet('dining-bench-return','dining',4.20,6.46,.96,.43,.42,Math.PI/2);seat(.93,.09,.41,0,.46,0,m.sofa,seat2);
  chair('dining-chair-1','dining',5.93,6.28,Math.PI/2);chair('dining-chair-2','dining',5.15,5.45,Math.PI);
 }else{
  if(plan==='oval'){const top=cylinder(.60,.04,0,.75,0,m.wood,table);top.scale.z=.60;cylinder(.16,.70,0,.37,0,m.metal,table);}
  else{box(1.24,.04,plan==='folding'?.66:.75,0,.75,0,m.wood,table);for(const x of [-.52,.52])for(const z of [-.23,.23])box(.027,.70,.027,x,.37,z,m.metal,table);}
  table.userData.foldable=plan==='folding';
  for(const [i,x,z,yaw]of [[1,4.79,5.52,Math.PI],[2,5.54,5.52,Math.PI],[3,4.79,6.75,0],[4,5.54,6.75,0]])chair('dining-chair-'+i,'dining',x,plan==='folding'&&z===5.52?5.89:z,yaw);
 }
}
export function furnishExpansionSecondary({spec,rooms,group,box,seat,cylinder,cabinet,chair,bed,m}){
 const plan=EXPANSION_PLANS[spec.design]?.second;if(!plan)return false;
 rooms.get('second').userData.plan=plan;
 const desk=(id,x,z,w,d,yaw=0)=>{const g=group(id,'second',x,z,yaw);box(w,.035,d,0,.75,0,m.wood,g);for(const x of [-w/2+.06,w/2-.06])box(.03,.71,.03,x,.37,0,m.metal,g);return g;};
 if(plan==='atelier'){
  desk('second-work-desk',8.55,6.79,1.85,.46);desk('second-work-return',9.62,6.28,.65,.40,-Math.PI/2);chair('second-chair','second',8.55,6.12,0);
  const g=group('second-chair-bed','second',8.63,4.98,Math.PI);seat(.80,.19,.86,0,.38,0,m.sofa,g);seat(.80,.45,.15,0,.63,-.36,m.sofa,g);box(.75,.24,.78,0,.18,0,m.wood,g);g.userData.closed=true;
  cabinet('second-tools','second',7.62,4.67,.68,.32,1.55);
 }else if(plan==='trundle'){
  bed('second-daybed','second',8.62,6.45,1.0,Math.PI/2);
  const trundle=group('second-trundle','second',8.62,6.04,Math.PI/2);box(.30,.17,1.86,0,.11,0,m.wood,trundle);trundle.userData.closed=true;
  cabinet('second-storage','second',7.98,4.69,1.05,.42,1.82);desk('second-pullout-desk',8.93,4.78,.67,.30);
 }else if(plan==='permanent'){
  bed('second-single-bed','second',8.65,5.00,1.0,Math.PI/2);
  cabinet('second-storage','second',8.05,6.79,1.10,.42,1.80,Math.PI);
  desk('second-window-shelf',9.61,6.20,.72,.34,-Math.PI/2);chair('second-chair','second',9.07,6.20,-Math.PI/2);
 }else{
  cabinet('second-hobby-storage','second',8.00,4.64,1.25,.30,1.68);
  const g=desk('second-fold-desk',8.6,6.80,1.15,.42);g.userData.foldable=true;
  const stool=group('second-stool','second',8.6,6.7);cylinder(.19,.43,0,.215,0,m.wood,stool);
  const ottoman=group('second-sleeper-ottoman','second',9.32,4.98);seat(.68,.38,.76,0,.23,0,m.sofa,ottoman);ottoman.userData.closed=true;
 }
 return true;
}
export function furnishExpansionBalcony({spec,rooms,group,box,seat,cylinder,cabinet,chair,m}){
 const plan=EXPANSION_PLANS[spec.design]?.balcony;if(!plan)return false;
 rooms.get('balcony').userData.plan=plan;
 const table=(id,x,z,r=.25)=>{const g=group(id,'balcony',x,z);cylinder(r,.035,0,.73,0,m.wood,g);cylinder(.025,.70,0,.35,0,m.metal,g);return g;};
 if(plan==='side-office'){
  const desk=group('balcony-fold-desk','balcony',3.74,1.35,Math.PI/2);box(.85,.035,.42,0,.75,0,m.wood,desk);box(.04,.40,.25,0,.54,0,m.metal,desk);desk.userData.foldable=true;
  chair('balcony-work-chair','balcony',4.27,1.36,Math.PI/2);
 }else if(plan==='bistro'){
  table('balcony-bistro-table',4.37,1.38,.29);chair('balcony-chair-1','balcony',3.85,1.38,-Math.PI/2);chair('balcony-chair-2','balcony',4.97,1.38,Math.PI/2);
 }else if(plan==='clear-reading'){
  chair('balcony-reading-chair','balcony',4.05,1.47,.25);table('balcony-side-table',4.75,1.65,.19);
 }else{
  const mat=group('balcony-yoga-mat','balcony',4.84,1.39);box(1.80,.012,.61,0,.025,0,m.sofa,mat);
  cabinet('balcony-plant-shelf','balcony',6.79,1.65,.66,.23,.74,-Math.PI/2,true);
  const plant=group('balcony-planters','balcony',6.78,1.67);for(const z of [-.18,.18]){cylinder(.08,.13,0,.84,z,m.stone,plant);seat(.18,.30,.18,0,1.04,z,m.leaf,plant);}
 }
 return true;
}
export function furnishExpansionWet({spec,rooms,group,box,seat,cylinder,cabinet,m}){
 const plans=EXPANSION_PLANS[spec.design];if(!plans)return false;
 const stone=m.marble||m.stone;
 for(const name of ['kitchen','bath','utility'])rooms.get(name).userData.plan=plans[name];
 function counter(id,x,z,w,d,yaw=0){const g=cabinet(id,'kitchen',x,z,w,d,.84,yaw);box(w+.02,.032,d+.035,0,.86,0,stone,g);return g;}
 const right=counter('kitchen-cabinet',3.14,3.70,2.18,.55,-Math.PI/2);
 box(.52,.018,.39,.54,.89,0,m.dark,right);
 const faucet=g=>{box(.45,.014,.33,-.54,.89,0,m.metal,g);box(.36,.01,.25,-.54,.90,0,m.dark,g);cylinder(.011,.26,-.54,1.03,-.19,m.metal,g);box(.016,.018,.18,-.54,1.16,-.10,m.metal,g);};
 if(plans.kitchen==='single-run'){
  faucet(right);const cart=counter('kitchen-mobile-cart',1.80,4.11,.62,.38);cart.userData.mobile=true;
 }else if(plans.kitchen==='galley'){
  const left=counter('kitchen-left-run',1.49,3.55,1.40,.48,Math.PI/2);faucet(left);
 }else{
  const back=counter('kitchen-return',2.49,2.47,1.23,.54);box(.43,.015,.32,.35,.89,0,m.metal,back);cylinder(.012,.24,.35,1.02,-.15,m.metal,back);
  if(plans.kitchen==='u-cook')counter('kitchen-prep-run',1.45,3.50,1.30,.44,Math.PI/2);
  else cabinet('kitchen-shallow-pantry','kitchen',1.35,3.45,1.25,.25,1.58,Math.PI/2);
 }
 // Fridge stays in the kitchen, outside the door gap.
 const fridge=group('kitchen-fridge','kitchen',1.55,2.48);box(.60,1.75,.45,0,.875,0,m.metal,fridge);
 const vanity=group('bath-vanity','bath',1.08,4.90);box(.88,.04,.47,0,.79,0,stone,vanity);seat(.39,.08,.30,0,.85,0,m.white,vanity);
 box(.68,.68,.024,1.08,1.34,4.64,m.metal,rooms.get('bath'));
 if(plans.bath==='open-basin'){
  for(const x of [-.40,.40])box(.03,.75,.03,x,.40,-.16,m.metal,vanity);
  cabinet('bath-rolling-storage','bath',1.50,5.58,.33,.35,.59);
  const showerSeat=group('bath-fold-seat','bath',.22,6.54);box(.34,.05,.36,0,.47,0,m.wood,showerSeat);showerSeat.userData.foldable=true;
 }else if(plans.bath==='hamper'){
  box(.48,.39,.42,-.18,.50,0,m.wood,vanity);box(.29,.45,.40,.27,.35,.04,m.linen,vanity);
 }else if(plans.bath==='mobile'){
  for(const x of [-.23,.23]){box(.35,.33,.39,x,.30,.05,m.wood,vanity);for(const z of [-.13,.13])cylinder(.024,.05,x,.11,z,m.dark,vanity);}
 }else{
  for(const x of [-.23,.23])box(.32,.25,.34,x,.28,.02,m.linen,vanity);
  cabinet('bath-linen-tower','bath',1.51,5.25,.28,.30,1.65);
 }
 const wc=group('bath-wc','bath',1.31,6.51);seat(.38,.42,.56,0,.25,0,m.white,wc);box(.34,.71,.16,0,.36,.34,m.white,wc);
 const shower=group('bath-shower','bath');box(.012,1.70,1.03,.96,.86,6.46,m.glass,shower);box(.92,1.70,.012,.48,.86,5.94,m.glass,shower);cylinder(.012,1.6,.14,1.02,6.77,m.metal,shower);shower.userData.screen=plans.bath==='linen'?'sliding':'fixed';
 const machine=(id,x,z,y=0,yaw=0)=>{const g=group(id,'utility',x,z,yaw);g.position.y=y;box(.60,.82,.62,0,.43,0,m.white,g);const ring=cylinder(.215,.033,0,.43,-.325,m.metal,g);ring.rotation.x=Math.PI/2;const glass=cylinder(.174,.04,0,.43,-.35,m.dark,g);glass.rotation.x=Math.PI/2;return g;};
 if(plans.utility==='parallel'){
  machine('utility-washer',.82,2.66,0,Math.PI/2);machine('utility-dryer',.82,3.35,0,Math.PI/2);
  const top=group('utility-counter','utility',.82,3.0);box(.65,.04,1.36,0,.88,0,stone,top);
 }else{
  machine('utility-washer',.63,4.08);machine('utility-dryer',.63,4.08,.87);
  const g=group('utility-side-worktop','utility',1.00,3.10,Math.PI/2);box(.90,.033,.23,0,.87,0,m.wood,g);g.userData.foldable=plans.utility==='ironing';
  cabinet('utility-sorting-cabinet','utility',1.01,2.70,.54,.22,.68,Math.PI/2,true);
 }
 return true;
}
