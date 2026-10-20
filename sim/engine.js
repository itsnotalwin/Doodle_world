import {initBrain,chooseBrainAction,observeOutcome,beginBrainEpisode,tickCivilization,validateBrains} from './agent-brain.js';
import {initLivelihood,migrateLivelihood,startLivelihood,tickLivelihoodAction,tickEconomy,validateLivelihood,BUILDING_KINDS,PROFESSIONS,buildingCost,affordable,functionalDesign,practiceSkill,weaponDamage,armorGuard,toolBonus} from './livelihood.js';
import {initLife,migrateLife,tickLife,validateLife,living,rally,markDead,gene,genomeFor,phenotype,characterTraits,characterStrokes,encodeAppearance,randomDescription} from './life-systems.js';
import {FIELD_SIZE,terrainAt,environmentAt,migrateGrowth,nearestResource,consumeResource,tickSociety,interact,relationship,feelAngry,moodName,inventIdea,artStrokes,inventBuilding,MOTIFS} from './world-systems.js';
export const WORLD_SIZE=FIELD_SIZE;
export const ACTIONS=['explore','practise','gather','build','spar','rest','create','socialize','forage','drink','argue','apologize','upgrade','attack','destroy','rally','eat','study','woodcut','quarry','plant','tend','harvest','craft'];
export const COLORS=['#66856a','#b47d57','#8175a1','#578f9b','#bf7276'];
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function rng(seed=71){let s=seed>>>0;return ()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^s>>>15,1|s);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;};}
export function traitsFrom(text=''){
 const s=text.toLowerCase(),has=r=>r.test(s)?1:0;
 return {builder:.25+.65*has(/build|draw|architect|creative|artist/),fighter:.12+.78*has(/fight|brave|warrior|soldier|aggress|protect|spar/),curious:.3+.65*has(/explor|curious|adventur|wander/),gentle:.2+.75*has(/kind|gentle|peace|shy|friendly|heal/),diligent:.3+.6*has(/work|patient|learn|study|clever|research/),artistic:.1+.8*has(/artist|paint|draw|creative|imagin/)};
}
export function makeDoodle(id,name,description,color,x,y,strokes=[]){const d=initLife({id,name,description,color,x,y,vx:0,vy:0,home:{x,y},strokes,traits:traitsFrom(description),skills:{movement:0,drawing:0,combat:0},q:Object.fromEntries(ACTIONS.map(a=>[a,0])),trials:Object.fromEntries(ACTIONS.map(a=>[a,0])),energy:100,health:100,ink:18,action:'explore',timer:0,target:null,project:null,progress:0,plan:null,memories:[],reward:0,age:0,wins:0,mood:{anger:0,joy:55,loneliness:20},needs:{food:90,water:90},relationships:{},socialCooldown:0,thought:'What could I make of this little life?',groupId:null,artCount:0,lastIdea:null,stall:0},Math.round(x*13+y*17));return initBrain(initLivelihood(d));}
export function newWorld(seed=71){
 const w={version:3,lifeClock:0,births:0,deaths:0,destructions:0,upgrades:0,lethal:true,seed,time:0,nextId:13,doodles:[],buildings:[],events:[],completed:0,spars:0,learning:true,combat:true,artworks:[],groups:[],resources:{},socialClock:0,groupClock:0,growthClock:0,growth:true,social:true,totalArt:0,environment:environmentAt(0,seed)};
 const names=['Pip','Moss','Noodle','Fern','Otto','Juniper','Bean','Cricket','Bramble','Dot','Clover','Rook'];
 const personalities=['A curious rabbit explorer who loves to wander','A patient human creative architect who loves to build','A brave fox warrior who protects friends','A gentle cat artist who draws flowers','A diligent robot worker and builder','A curious alien learner who loves stars','A sociable mushroom artist who loves family and community','An independent bird explorer who values freedom','An ambitious aggressive dragon leader who rallies loyal friends','A gentle human healer with glasses who loves peace and family','A patient rabbit scientist who studies and builds','A cautious loyal fox artist who forgives others'];
 const r=rng(seed);names.forEach((name,i)=>{let a=i*Math.PI*2/12;w.doodles.push(makeDoodle(i+1,name,personalities[i%personalities.length],COLORS[i%5],Math.cos(a)*(170+r()*250),Math.sin(a)*(140+r()*210)));});
 migrateLivelihood(w,ACTIONS);w.doodles.forEach(d=>initBrain(d));w.events=[{time:0,text:'Twelve little minds. A whole world of things to become.',kind:'world'}];return w;
}
export function event(w,text,kind='world'){w.events.unshift({time:w.time,text:String(text).slice(0,240),kind});w.events.length=Math.min(60,w.events.length);}
export function remember(d,text){text=text.slice(0,240);d.memories=d.memories.filter(m=>m!==text);d.memories.unshift(text);d.memories.length=Math.min(6,d.memories.length);}
export function reward(d,action,value,learn=true){if(!ACTIONS.includes(action))return;d.trials[action]++;if(learn)d.q[action]+=.22*(clamp(value,-1,2)-d.q[action]);}
function allowedAction(d,w,a){if(!d.alive||['create','gather'].includes(a))return false;if(['attack','destroy','rally','spar'].includes(a)&&(!w.combat||d.stage==='child'))return false;if(['attack','destroy','rally'].includes(a)&&!w.lethal)return false;if(['socialize','argue','apologize'].includes(a)&&!w.social)return false;if(a==='build'&&(d.proficiency.construction<8||w.buildings.length>=600))return false;if(a==='plant'&&(d.proficiency.farming<6||d.inventory.seeds<1||w.fields.length>=300))return false;if(a==='craft'&&d.proficiency.crafting<6)return false;if(a==='upgrade'&&(d.proficiency.construction<16||d.inventory.wood<4||d.inventory.stone<2||!w.buildings.some(b=>b.finished&&!b.ruined&&b.level<5&&(b.owner===d.id||d.groupId&&w.doodles.find(o=>o.id===b.owner)?.groupId===d.groupId))))return false;if(a==='rally'&&(!d.groupId||d.proficiency.leadership<8))return false;return true;}
export function chooseAction(d,w,random=Math.random){return chooseBrainAction(d,w,random,a=>allowedAction(d,w,a));}
function pFamily(d,w){return d.personality.fertility>.25&&w.doodles.some(o=>o.alive&&o.id!==d.id&&o.age>=900&&!o.familyCooldown&&(d.relationships[o.id]||0)>55&&(o.relationships[d.id]||0)>55&&Math.hypot(o.x-d.x,o.y-d.y)<1800)&&w.buildings.some(b=>b.finished&&!b.ruined&&Math.hypot(b.x-d.x,b.y-d.y)<600);}
function pickOther(d,w,action){const requested=d.plan?.until>w.time?w.doodles.find(o=>o.alive&&o.id===d.plan.targetId&&o.id!==d.id):null;if(requested)return requested;
 if(action==='socialize'&&d.age>=900&&!d.familyCooldown){const partner=w.doodles.find(o=>o.alive&&o.id!==d.id&&o.age>=900&&!o.familyCooldown&&(d.relationships[o.id]||0)>55&&(o.relationships[d.id]||0)>55&&Math.hypot(o.x-d.x,o.y-d.y)<1800);if(partner)return partner;}
 if(action==='attack'&&d.warTarget){const enemy=w.doodles.find(o=>o.id===d.warTarget&&o.alive);if(enemy)return enemy;}
 const candidates=w.doodles.filter(o=>o.alive&&o.id!==d.id&&Math.hypot(o.x-d.x,o.y-d.y)<1400&&(action!=='spar'||o.health>55&&o.energy>30&&o.stage!=='child'&&(o.traits.fighter>.5||relationship(o,d)>40&&o.personality.caution<.7))&&(action!=='attack'&&action!=='rally'||relationship(d,o)<-20||o.id===d.warTarget));
 return candidates.sort((a,b)=>{const bias=o=>['spar','argue','attack','rally'].includes(action)?(relationship(d,o)<-20?-180:0):action==='apologize'?(relationship(d,o)<0?-250:0):-relationship(d,o)*3;return Math.hypot(a.x-d.x,a.y-d.y)+bias(a)-Math.hypot(b.x-d.x,b.y-d.y)-bias(b);})[0];}
function startAction(d,w,r){
 d.action=chooseAction(d,w,r);beginBrainEpisode(d,w);d.timer=9+r()*10;d.reward=0;d.target=null;d.project=null;d.progress=0;d.stall=0;
 const radius=d.action==='explore'?180+r()*(300+d.personality.wanderlust*300):60+r()*100,angle=r()*Math.PI*2;
 const neighbours=d.groupId?w.doodles.filter(o=>o.alive&&o.groupId===d.groupId):[],community=neighbours.length?{x:neighbours.reduce((v,o)=>v+o.x,0)/neighbours.length,y:neighbours.reduce((v,o)=>v+o.y,0)/neighbours.length}:d.home,anchor=d.action!=='explore'&&d.personality.independence<.7?community:d;
 d.target={x:clamp(anchor.x+Math.cos(angle)*radius,-WORLD_SIZE/2+100,WORLD_SIZE/2-100),y:clamp(anchor.y+Math.sin(angle)*radius,-WORLD_SIZE/2+100,WORLD_SIZE/2-100)};
 const thoughts={explore:'What is beyond those trees?',practise:'I am testing how these materials fit together.',rest:'A little rest will help.',gather:'I need useful materials.',forage:'Something to eat would be lovely.',drink:'Time to find a little water.'};d.thought=thoughts[d.action]||d.thought;
 if(startLivelihood(d,w,r))return;
 if(d.action==='rest'){const shelter=w.buildings.find(b=>b.finished&&!b.ruined&&Math.hypot(b.x-d.x,b.y-d.y)<250);d.target=shelter?{x:shelter.x+65,y:shelter.y+45}:{x:d.x,y:d.y};const danger=w.doodles.find(o=>o.alive&&o.action==='attack'&&o.target?.id===d.id&&Math.hypot(o.x-d.x,o.y-d.y)<200);if(danger&&(d.personality.caution>.4||d.health<25)){const angle=Math.atan2(d.y-danger.y,d.x-danger.x);d.target={x:clamp(d.x+Math.cos(angle)*350,-WORLD_SIZE/2+100,WORLD_SIZE/2-100),y:clamp(d.y+Math.sin(angle)*350,-WORLD_SIZE/2+100,WORLD_SIZE/2-100)};d.thought='I choose to retreat and find safety.';}d.timer=18;}
 if(['gather','forage','drink'].includes(d.action)){const kind={gather:'ink',forage:'food',drink:'water'}[d.action],node=nearestResource(w,d,kind);if(node){d.target={x:node.x,y:node.y,nodeId:node.id,kind,max:node.max};d.timer=Math.max(24,Math.hypot(node.x-d.x,node.y-d.y)/25+18);}else{d.action='explore';d.thought='The nearby supplies need time to grow back.';}}
 if(d.action==='build'){
  const bx=Math.round(d.target.x/130)*130||0,by=Math.round(d.target.y/130)*130||0;
  if(w.buildings.length>=600||terrainAt(bx,by,w.seed).biome==='water'||w.buildings.some(b=>Math.hypot(b.x-bx,b.y-by)<110)){d.action='practise';return;}
  const cost=buildingCost(d);if(!affordable(d,cost)){d.action=d.inventory.wood<cost.wood?'woodcut':'quarry';startLivelihood(d,w,r);return;}const design=functionalDesign(w,d,r),b={id:'b'+w.nextId++,x:bx,y:by,...design,progress:0,owner:d.id,color:d.color,quality:d.skills.drawing,finished:false,level:1,hp:100,ruined:false};
  w.buildings.push(b);d.project=b.id;d.target={x:bx+56,y:by+55};d.timer=45;d.inventory.wood-=cost.wood;d.inventory.stone-=cost.stone;d.thought='I have learned enough to build '+design.name+' for our settlement.';
 }
 if(['spar','socialize','argue','apologize','attack','rally'].includes(d.action)){const o=pickOther(d,w,d.action);if(o){d.target={id:o.id};d.timer=Math.max(20,Math.hypot(o.x-d.x,o.y-d.y)/25+14);if(d.action==='spar')d.thought=relationship(d,o)<-20?'We have a score to settle.':'A little duel might sharpen my timing.';}else{d.action='explore';}}
 if(['upgrade','destroy'].includes(d.action)){const candidates=w.buildings.filter(b=>b.finished&&!b.ruined&&(d.action==='upgrade'?b.level<5&&(b.owner===d.id||d.groupId&&w.doodles.find(o=>o.id===b.owner)?.groupId===d.groupId):relationship(d,{id:b.owner})<-20));const b=candidates.sort((a,b)=>Math.hypot(a.x-d.x,a.y-d.y)-Math.hypot(b.x-d.x,b.y-d.y))[0];if(b){d.project=b.id;d.target={x:b.x+58,y:b.y+52};d.timer=Math.max(30,Math.hypot(b.x-d.x,b.y-d.y)/25+30);d.thought=d.action==='upgrade'?'I can improve this design with what I have learned.':'I am going to tear down my rival’s building.';}else d.action='explore';}
 if(d.plan?.until>w.time&&d.plan.say)d.thought=d.plan.say;
}
function move(d,tx,ty,dt,w){
 const dx=tx-d.x,dy=ty-d.y,dist=Math.hypot(dx,dy),terrain=terrainAt(d.x,d.y,w.seed),speed=(35+d.skills.movement*.25)*terrain.speed*(w.environment.weather==='rain'?.88:1);
 let desiredX=dist>7?dx/dist*speed:0,desiredY=dist>7?dy/dist*speed:0;
 for(const o of w.doodles){if(!o.alive||o.id===d.id)continue;const ox=d.x-o.x,oy=d.y-o.y,l=Math.hypot(ox,oy);if(l>0&&l<25){desiredX+=ox/l*(25-l)*3;desiredY+=oy/l*(25-l)*3;}}
 for(const b of w.buildings){if(!b.finished||b.ruined)continue;const ox=d.x-b.x,oy=d.y-(b.y+12),l=Math.hypot(ox,oy);if(l>0&&l<51){desiredX+=ox/l*(51-l)*4;desiredY+=oy/l*(51-l)*4;}}
 const blend=Math.min(1,dt*5);d.vx+=(desiredX-d.vx)*blend;d.vy+=(desiredY-d.vy)*blend;d.x=clamp(d.x+d.vx*dt,-WORLD_SIZE/2+30,WORLD_SIZE/2-30);d.y=clamp(d.y+d.vy*dt,-WORLD_SIZE/2+30,WORLD_SIZE/2-30);
 if(Math.hypot(d.vx,d.vy)>3){d.skills.movement=clamp(d.skills.movement+dt*.035,0,100);d.energy=Math.max(0,d.energy-dt*.2);d.stall=0;}else if(dist>45)d.stall+=dt;
 if(d.stall>10){d.timer=0;d.thought='A different path might work.';}return dist;
}
export function step(w,dt,random=Math.random){
 dt=clamp(dt,0,.1);w.time+=dt;tickSociety(w,dt,event);tickEconomy(w,dt,event);tickLife(w,dt,random,makeDoodle,event);tickCivilization(w,dt,event);
 for(const d of living(w)){d.age+=dt;d.timer-=dt;
  if(d.timer<=0){observeOutcome(d,w);reward(d,d.action,d.reward,w.learning);startAction(d,w,random);}
  if(!allowedAction(d,w,d.action)&&!['build','create'].includes(d.action)){d.timer=0;continue;}
  let target=d.target||d.home;if(target.id){const o=w.doodles.find(o=>o.alive&&o.id===target.id);if(!o){d.timer=0;continue;}target=o;}
  const dist=move(d,target.x,target.y,dt,w);if(tickLivelihoodAction(d,w,dt,dist,random,event)){if(d.needs.food<18&&d.action!=='eat'&&d.action!=='forage'||d.needs.water<18&&d.action!=='drink')d.timer=0;continue;}
  if(d.action==='explore'){d.reward+=dt*.05;d.needs.fulfilment=clamp(d.needs.fulfilment+dt*.12,0,100);}
  if(d.action==='rest'){d.energy=clamp(d.energy+dt*(dist<80?6:1),0,100);d.health=clamp(d.health+dt*(d.needs.food>10&&d.needs.water>10?3.5:0),0,100);d.reward=.3;if(d.energy>=99&&d.health>=99)d.timer=0;}
  else if(d.action==='practise'&&dist<25){d.skills.drawing=clamp(d.skills.drawing+dt*.23*(.75+d.personality.patience*.4+d.personality.discipline*.25),0,100);d.reward+=dt*.07;d.energy=Math.max(0,d.energy-dt*.35);practiceSkill(d,d.brain.topic,dt*.12,w);d.progress+=dt;}
  else if(['gather','forage','drink'].includes(d.action)&&dist<28){const node={id:d.target.nodeId,kind:d.target.kind,max:d.target.max};if(!node.id){d.timer=0;continue;}const amount=consumeResource(w,node,dt*(d.action==='drink'?2:.8));
   if(amount<=0){d.timer=0;d.thought='Someone used the last of that. I will look elsewhere.';const competitor=w.doodles.find(o=>o.id!==d.id&&o.target?.nodeId===node.id);if(competitor&&w.social)feelAngry(d,competitor,7);continue;}
   if(d.action==='gather')d.ink=clamp(d.ink+amount*2,0,60);if(d.action==='forage'){d.inventory.food=clamp(d.inventory.food+amount*(.5+d.proficiency.foraging/100),0,40);practiceSkill(d,'foraging',dt*.13,w);}if(d.action==='drink'){d.needs.water=clamp(d.needs.water+amount*9,0,100);d.inventory.water=clamp(d.inventory.water+amount*.8,0,30);}d.reward+=amount*.2;d.energy=Math.max(0,d.energy-dt*.15);
   if(d.action==='forage'&&(d.inventory.food>=6||d.needs.food<25&&d.inventory.food>1)||d.action==='drink'&&d.needs.water>95&&d.inventory.water>6||d.action==='gather'&&d.ink>40)d.timer=0;
  }
  else if(d.action==='build'&&dist<28){const b=w.buildings.find(b=>b.id===d.project);if(!b||b.finished){d.timer=0;continue;}b.progress=clamp(b.progress+dt*(.025+d.proficiency.construction*.0008)*(1+toolBonus(d,'construction')),0,1);d.skills.drawing=clamp(d.skills.drawing+dt*.3,0,100);practiceSkill(d,'construction',dt*.18,w);d.energy=Math.max(0,d.energy-dt*.6);d.timer=Math.max(2,d.timer);
   if(b.progress>=1){b.finished=true;d.needs.fulfilment=clamp(d.needs.fulfilment+20,0,100);w.completed++;d.reward=2;d.home={x:b.x+65,y:b.y+55};d.mood.joy=clamp(d.mood.joy+18,0,100);remember(d,'I designed '+(b.name||b.kind)+'. The shape was my idea.');event(w,d.name+' built '+(b.name||b.kind)+'.','build');d.timer=0;}
  }
  else if(d.action==='create'&&dist<28){const a=w.artworks.find(a=>a.id===d.project);if(!a||a.finished){d.timer=0;continue;}a.progress=clamp(a.progress+dt*(.055+d.skills.drawing*.00045),0,1);d.skills.drawing=clamp(d.skills.drawing+dt*.33,0,100);d.energy=Math.max(0,d.energy-dt*.32);d.timer=Math.max(2,d.timer);
   if(a.progress>=1){a.finished=true;d.artCount++;w.totalArt++;d.reward=1.6;d.mood.joy=clamp(d.mood.joy+15,0,100);d.thought='I made '+a.title+'. What should come next?';remember(d,'Created '+a.title+' from '+a.inspiration+'.');event(w,d.name+' drew “'+a.title+'”.','art');d.timer=0;}
  }
  else if(d.action==='upgrade'&&dist<90){const b=w.buildings.find(b=>b.id===d.project);if(!b||b.ruined||b.level>=5){d.timer=0;continue;}b.upgradeProgress=(b.upgradeProgress||0)+dt*(.015+d.skills.drawing*.0004);d.skills.drawing=clamp(d.skills.drawing+dt*.15,0,100);d.timer=Math.max(2,d.timer);if(b.upgradeProgress>=1){b.upgradeProgress=0;b.level++;b.hp=b.level*100;b.quality=clamp(b.quality+12,0,100);d.inventory.wood=Math.max(0,d.inventory.wood-4);d.inventory.stone=Math.max(0,d.inventory.stone-2);practiceSkill(d,'construction',2,w);b.capacity=Math.min(12,b.capacity+(b.capacity?1:0));w.upgrades++;d.reward=2;remember(d,'Upgraded '+b.kind+' to level '+b.level+'.');event(w,d.name+' upgraded a '+b.kind+' to level '+b.level+'.','upgrade');d.timer=0;}}
  else if(d.action==='destroy'&&dist<95){const b=w.buildings.find(b=>b.id===d.project);if(!b||b.ruined){d.timer=0;continue;}b.hp=Math.max(0,b.hp-dt*(4+d.skills.combat*.07));d.energy=Math.max(0,d.energy-dt*.65);d.skills.combat=clamp(d.skills.combat+dt*.12,0,100);d.timer=Math.max(2,d.timer);const owner=w.doodles.find(o=>o.id===b.owner);if(owner?.alive&&w.social)feelAngry(owner,d,dt*1.5);if(b.hp<=0){b.ruined=true;w.destructions++;d.reward=1;event(w,d.name+' destroyed '+(b.name||b.kind)+'.','destruction');d.timer=0;}}
  else if(d.action==='rally'&&dist<110){const enemy=w.doodles.find(o=>o.id===d.target.id);rally(w,d,enemy,event);d.timer=0;}
  else if(d.action==='attack'&&dist<42){const enemy=w.doodles.find(o=>o.alive&&o.id===d.target.id);if(!enemy){d.timer=0;continue;}d.progress+=dt;d.energy=Math.max(0,d.energy-dt*.95);d.skills.combat=clamp(d.skills.combat+dt*.28,0,100);practiceSkill(d,'warfare',dt*.18,w);for(const item of d.equipment)if(item.type==='weapon')item.durability=Math.max(0,item.durability-dt*.1);feelAngry(enemy,d,dt*3);if(!enemy.warTarget&&enemy.health>45&&enemy.personality.aggression>.45){enemy.warTarget=d.id;enemy.rallyUntil=w.time+60;enemy.timer=0;}if(d.progress>=1){d.progress=0;if(random()<.45+d.skills.combat/250){enemy.health=Math.max(0,enemy.health-(4+d.skills.combat*.06+weaponDamage(d))*(1-armorGuard(enemy)));d.reward+=.2;if(enemy.health<=0){markDead(w,enemy,'a fight with '+d.name,event);d.wins++;d.timer=0;}}}}
  else if(['socialize','argue','apologize'].includes(d.action)&&dist<70){const other=w.doodles.find(o=>o.id===d.target.id);if(other){interact(w,d,other,d.action==='socialize'?(random()<.4?'admire':'talk'):d.action,event);remember(d,(d.action==='argue'?'Argued with ':d.action==='apologize'?'Made peace with ':'Shared an idea with ')+other.name+'.');d.reward=d.action==='argue'?.15:.9;}d.timer=0;}
  else if(d.action==='spar'&&dist<42){const enemy=w.doodles.find(o=>o.id===d.target.id);if(!enemy||enemy.health<=35||d.health<=35){d.timer=0;continue;}d.progress+=dt;d.energy=Math.max(0,d.energy-dt*.8);d.skills.combat=clamp(d.skills.combat+dt*.3,0,100);practiceSkill(d,'warfare',dt*.17,w);
   if(d.progress>.9){d.progress=0;const hit=random()<.5+d.skills.combat/250;d.reward+=hit?.12:-.02;if(hit){enemy.health=Math.max(30,enemy.health-(3+d.skills.combat*.035));enemy.vx+=(enemy.x-d.x)*.6;enemy.vy+=(enemy.y-d.y)*.6;if(w.social){feelAngry(enemy,d,2.5);enemy.thought='Ouch. I did not like that.';}}
    if(enemy.health<=38){d.wins++;w.spars++;event(w,d.name+' won a duel with '+enemy.name+'.','spar');remember(d,'Won a duel with '+enemy.name+'. Timing matters.');remember(enemy,'Lost to '+d.name+'; I need to recover.');enemy.action='rest';enemy.target={x:enemy.x,y:enemy.y};enemy.timer=15;d.timer=0;}
   }
  }
  if(d.energy<8&&d.action!=='rest'||d.needs.food<20&&d.action!=='forage'&&d.action!=='eat'||d.needs.water<20&&d.action!=='drink')d.timer=0;
 }
 for(const c of w.claims){if(c.owner&&!w.groups.some(g=>g.id===c.owner)){c.owner=null;c.contender=null;c.progress=0;}if(c.contender&&!w.groups.some(g=>g.id===c.contender)){c.contender=null;c.progress=0;}}
 w.buildings=w.buildings.filter(b=>b.finished||w.doodles.some(d=>d.alive&&d.project===b.id));w.artworks=w.artworks.filter(a=>a.finished||w.doodles.some(d=>d.alive&&d.project===a.id));
 if(w.growth&&w.time-w.growthClock>=600){w.growthClock=w.time;if(living(w).length<32&&w.doodles.length<240&&w.groups.length&&w.completed>=Math.ceil(w.doodles.length/4)){
  const host=w.doodles.find(d=>d.alive&&d.groupId),id=w.nextId++,name=['Wren','Pebble','Lark','Sprout','Fable','Ash','Sunny','Sage'][id%8]+' '+Math.floor(id/8),x=clamp(host.x+90,-WORLD_SIZE/2+100,WORLD_SIZE/2-100),y=clamp(host.y+90,-WORLD_SIZE/2+100,WORLD_SIZE/2-100);
  const newcomer=makeDoodle(id,name,'A friendly curious newcomer who loves art and learning',COLORS[id%5],x,y);newcomer.thought='I heard there was room for one more story here.';w.doodles.push(newcomer);event(w,name+' arrived, drawn by the growing settlement.','arrival');
 }}
}
export function addDoodle(w,{name,description,color,strokes,genome},x=0,y=0){if((living(w).length>=100||w.doodles.length>=240))throw Error('This world holds 100 living doodles and 240 lifetime stories.');const d=makeDoodle(w.nextId++,name.trim().slice(0,30)||'New doodle',description.trim().slice(0,500),COLORS.includes(color)?color:COLORS[0],clamp(x,-WORLD_SIZE/2+100,WORLD_SIZE/2-100),clamp(y,-WORLD_SIZE/2+100,WORLD_SIZE/2-100),strokes);if(genome){d.genome=genome;encodeAppearance(d);d.personality=characterTraits(d);d.appearance=phenotype(d);}d.born=w.time;w.doodles.push(d);event(w,d.name+' stepped off the sketchpad.','arrival');return d;}
export function validateWorld(raw){
 const fail=()=>{throw Error('That file is not a valid Doodleworld save.');};
 if(!raw||![1,2,3,4].includes(raw.version)||!Number.isFinite(raw.time)||raw.time<0||!Number.isInteger(raw.seed)||!Number.isInteger(raw.nextId)||raw.nextId<1||!Array.isArray(raw.doodles)||raw.doodles.length<1||raw.doodles.length>240||!Array.isArray(raw.buildings)||raw.buildings.length>600)fail();
 const legacy=raw.version===1,oldLife=raw.version<3,oldEconomy=raw.version<4;
 if(legacy){migrateGrowth(raw);for(const d of raw.doodles){for(const a of ACTIONS){d.q[a]??=0;d.trials[a]??=0;}}}
 if(oldLife)migrateLife(raw);if(oldEconomy){migrateLivelihood(raw,ACTIONS);raw.doodles.forEach(d=>initBrain(d));}
 const ids=new Set();
 for(const d of raw.doodles){
  if(!d||!Number.isInteger(d.id)||d.id<1||ids.has(d.id)||typeof d.name!=='string'||d.name.length>30||typeof d.description!=='string'||d.description.length>500||!COLORS.includes(d.color))fail();ids.add(d.id);
  for(const k of ['x','y','vx','vy','energy','health','ink','timer','progress','age','reward','wins'])if(!Number.isFinite(d[k])||Math.abs(d[k])>1e9)fail();
  if(Math.abs(d.x)>WORLD_SIZE/2||Math.abs(d.y)>WORLD_SIZE/2||d.energy<0||d.energy>100||d.health<0||d.health>100||d.ink<0||d.ink>60||!d.home||!Number.isFinite(d.home.x)||!Number.isFinite(d.home.y)||Math.abs(d.home.x)>WORLD_SIZE/2||Math.abs(d.home.y)>WORLD_SIZE/2)fail();
  if(!ACTIONS.includes(d.action)||!d.skills||!d.q||!d.trials||!d.traits||!Array.isArray(d.memories)||d.memories.length>6||d.memories.some(m=>typeof m!=='string'||m.length>240))fail();
  for(const k of ['movement','drawing','combat'])if(!Number.isFinite(d.skills[k])||d.skills[k]<0||d.skills[k]>100)fail();
  for(const k of ACTIONS)if(!Number.isFinite(d.q[k])||Math.abs(d.q[k])>5||!Number.isInteger(d.trials[k])||d.trials[k]<0)fail();
  d.traits=traitsFrom(d.description);
  if(!Array.isArray(d.strokes)||d.strokes.length>80||d.strokes.some(s=>!Array.isArray(s)||s.length>1000||s.some(p=>!Array.isArray(p)||p.length!==2||p.some(n=>!Number.isFinite(n)||n<0||n>1))))fail();
  if(d.target&&(!Number.isFinite(d.target.id)&&(!Number.isFinite(d.target.x)||!Number.isFinite(d.target.y))))fail();
  if(d.plan&&(!ACTIONS.includes(d.plan.action)||!Number.isFinite(d.plan.until)||typeof d.plan.reason!=='string'||d.plan.reason.length>160))fail();
 }
 for(const b of raw.buildings){if(!b||typeof b.id!=='string'||!BUILDING_KINDS.includes(b.kind)||!Number.isFinite(b.x)||!Number.isFinite(b.y)||Math.abs(b.x)>WORLD_SIZE/2||Math.abs(b.y)>WORLD_SIZE/2||!Number.isFinite(b.progress)||b.progress<0||b.progress>1||!COLORS.includes(b.color)||!Number.isFinite(b.quality)||typeof b.finished!=='boolean')fail();}
 if(!Array.isArray(raw.events)||raw.events.length>60||raw.events.some(e=>!e||typeof e.text!=='string'||e.text.length>240||!Number.isFinite(e.time)||typeof e.kind!=='string'))fail();
 if(!Number.isFinite(raw.completed)||!Number.isFinite(raw.spars)||typeof raw.combat!=='boolean'||typeof raw.learning!=='boolean'||raw.nextId<=Math.max(...ids))fail();
 validateGrowth(raw,fail);validateLife(raw,fail);validateLivelihood(raw,fail);validateBrains(raw,fail);
 return raw;
}
function validateGrowth(w,fail){
 const finite=(n,min=0,max=1e9)=>Number.isFinite(n)&&n>=min&&n<=max;
 if(!Array.isArray(w.artworks)||w.artworks.length>1200||!Array.isArray(w.groups)||w.groups.length>20||!w.resources||typeof w.resources!=='object'||Array.isArray(w.resources)||Object.keys(w.resources).length>4000||typeof w.social!=='boolean'||typeof w.growth!=='boolean'||!finite(w.totalArt)||!finite(w.socialClock,0,3)||!finite(w.groupClock,0,31)||!finite(w.growthClock,0,w.time))fail();
 const ids=new Set(w.doodles.map(d=>d.id)),gids=new Set(),occupied=new Set();
 const pathsValid=(paths,max=80)=>Array.isArray(paths)&&paths.length>0&&paths.length<=max&&paths.every(p=>Array.isArray(p)&&p.length>0&&p.length<=80&&p.every(v=>Array.isArray(v)&&v.length===2&&v.every(n=>finite(n,-200,200))));
 const ideaValid=idea=>idea&&typeof idea.title==='string'&&idea.title.length<=70&&Array.isArray(idea.motifs)&&idea.motifs.length>0&&idea.motifs.length<=3&&idea.motifs.every(m=>MOTIFS.includes(m));
 for(const d of w.doodles){
  if(!d.mood||!d.needs||['anger','joy','loneliness'].some(k=>!finite(d.mood[k],0,100))||['food','water'].some(k=>!finite(d.needs[k],0,100))||!d.relationships||typeof d.relationships!=='object'||Array.isArray(d.relationships)||Object.keys(d.relationships).length>240||Object.entries(d.relationships).some(([id,v])=>!ids.has(Number(id))||!finite(v,-100,100))||typeof d.thought!=='string'||d.thought.length>180||!finite(d.socialCooldown,0,60)||!finite(d.artCount)||!finite(d.stall,0,30)||(d.groupId!==null&&typeof d.groupId!=='string')||(d.lastIdea&&!ideaValid(d.lastIdea)))fail();
  if(d.plan?.idea&&!ideaValid(d.plan.idea)||d.plan?.say&&(typeof d.plan.say!=='string'||d.plan.say.length>180)||d.plan?.targetId&&!ids.has(d.plan.targetId))fail();
  if(d.target?.nodeId&&(typeof d.target.nodeId!=='string'||!/^(food|ink|water|wood|stone):-?\d+:-?\d+$/.test(d.target.nodeId)||!['food','ink','water','wood','stone'].includes(d.target.kind)||!finite(d.target.max,1,100)))fail();
 }
 for(const [id,node] of Object.entries(w.resources))if(!/^(food|ink|water|wood|stone):-?\d+:-?\d+$/.test(id)||!node||!finite(node.max,1,100)||!finite(node.amount,0,node.max)||!['food','water','ink','wood','stone'].includes(node.kind))fail();
 const buildingIds=new Set();for(const b of w.buildings){if(buildingIds.has(b.id)||!ids.has(b.owner))fail();buildingIds.add(b.id);}
 const aids=new Set();for(const a of w.artworks){if(!a||typeof a.id!=='string'||aids.has(a.id)||!ids.has(a.owner)||!ideaValid(a)||!pathsValid(a.strokes)||!finite(a.x,-WORLD_SIZE/2,WORLD_SIZE/2)||!finite(a.y,-WORLD_SIZE/2,WORLD_SIZE/2)||!finite(a.progress,0,1)||typeof a.finished!=='boolean'||!COLORS.includes(a.color)||!finite(a.created,0,w.time)||typeof a.inspiration!=='string'||a.inspiration.length>100)fail();aids.add(a.id);}
 for(const b of w.buildings){if(b.blueprint&&!pathsValid(b.blueprint,20)||b.name&&(typeof b.name!=='string'||b.name.length>70))fail();}
 for(const g of w.groups){if(!g||typeof g.id!=='string'||gids.has(g.id)||typeof g.name!=='string'||g.name.length>80||!COLORS.includes(g.color)||!finite(g.founded,0,w.time)||!Array.isArray(g.members)||g.members.length<2||g.members.length>100||new Set(g.members).size!==g.members.length||g.members.some(id=>!ids.has(id)||!w.doodles.find(d=>d.id===id)?.alive||occupied.has(id)))fail();gids.add(g.id);g.members.forEach(id=>{if(w.doodles.find(d=>d.id===id)?.groupId!==g.id)fail();occupied.add(id);});}
 for(const d of w.doodles)if(d.groupId&&!w.groups.some(g=>g.id===d.groupId&&g.members.includes(d.id)))fail();
 w.environment=environmentAt(w.time,w.seed);
}
export function applyPlans(w,plans){
 let n=0;for(let p of plans.slice(0,12)){const d=w.doodles.find(d=>d.alive&&d.id===p.id);if(!d||!ACTIONS.includes(p.action))continue;if(p.action==='create')p={...p,action:'study'};if(p.action==='gather')p={...p,action:'woodcut'};
  d.plan={action:p.action,until:w.time+clamp(Number(p.seconds)||120,15,180),reason:String(p.reason||'A fresh idea.').slice(0,160)};
  if(p.idea&&Array.isArray(p.idea.motifs)){const motifs=p.idea.motifs.filter(m=>MOTIFS.includes(m)).slice(0,3);if(motifs.length)d.plan.idea={title:String(p.idea.title||'A new idea').slice(0,70),motifs};}
  if(w.doodles.some(o=>o.id===p.targetId&&o.id!==d.id))d.plan.targetId=p.targetId;
  if(typeof p.say==='string')d.plan.say=p.say.slice(0,180);d.timer=0;n++;
 }if(n)event(w,'A new spark: '+n+' doodles received a plan.','brain');return n;
}
