export const WORLD_SIZE = 24000;
export const ACTIONS = ['explore','practise','gather','build','spar','rest'];
export const COLORS = ['#66856a','#b47d57','#8175a1','#578f9b','#bf7276'];
export const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
export function rng(seed=71) { let s=seed>>>0; return ()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^s>>>15,1|s);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;}; }
export function traitsFrom(text='') {
 const s=text.toLowerCase(); const has = r => r.test(s)?1:0;
 return {builder: .25+.65*has(/build|draw|architect|creative|artist/), fighter:.12+.78*has(/fight|brave|warrior|soldier|aggress|protect|spar/), curious:.3+.65*has(/explor|curious|adventur|wander/), gentle:.2+.75*has(/kind|gentle|peace|shy|friendly|heal/), diligent:.3+.6*has(/work|patient|learn|study|clever|research/)};
}
export function makeDoodle(id,name,description,color,x,y,strokes=[]) {
 return {id,name,description,color,x,y,vx:0,vy:0,home:{x,y},strokes,traits:traitsFrom(description),skills:{movement:0,drawing:0,combat:0},q:Object.fromEntries(ACTIONS.map(a=>[a,0])),trials:Object.fromEntries(ACTIONS.map(a=>[a,0])),energy:100,health:100,ink:18,action:'explore',timer:0,target:null,project:null,progress:0,plan:null,memories:[],reward:0,age:0,wins:0};
}
export function newWorld(seed=71) {
 const w={version:1,seed,time:0,nextId:13,doodles:[],buildings:[],events:[],completed:0,spars:0,learning:true,combat:true};
 const names=['Pip','Moss','Noodle','Fern','Otto','Juniper','Bean','Cricket','Bramble','Dot','Clover','Rook'];
 const personalities=['A curious explorer who loves to wander','A patient creative architect who loves to build','A brave warrior who loves to spar','A gentle friendly artist','A diligent worker and builder','A curious explorer and learner'];
 const r=rng(seed);
 names.forEach((name,i)=>{let a=i*Math.PI*2/12;w.doodles.push(makeDoodle(i+1,name,personalities[i%6],COLORS[i%5],Math.cos(a)*(170+r()*250),Math.sin(a)*(140+r()*210)));});
 w.events=[{time:0,text:'Twelve little minds. One very big blank page.',kind:'world'}];
 return w;
}
export function event(w,text,kind='world') {w.events.unshift({time:w.time,text,kind});w.events.length=Math.min(60,w.events.length);}
export function remember(d,text){ d.memories.unshift(text);d.memories.length=Math.min(6,d.memories.length); }
export function reward(d,action,value,learn=true){d.trials[action]++; if(learn)d.q[action]+=.22*(clamp(value,-1,2)-d.q[action]);}
export function chooseAction(d,w,random=Math.random) {
 if(d.energy<22||d.health<40)return 'rest';
 if(d.plan&&d.plan.until>w.time&&ACTIONS.includes(d.plan.action)&&!(d.plan.action==='spar'&&!w.combat)&&!(d.plan.action==='build'&&d.ink<8)) return d.plan.action;
 const t=d.traits;
 const scores={explore:.3+t.curious*.8,practise:.25+t.diligent*.7,gather:d.ink<10?2:.15+t.diligent*.25,build:d.ink>=8?.25+t.builder: -10,spar:w.combat?.05+t.fighter*(1-t.gentle*.8):-10,rest:-1};
 let best='explore',max=-Infinity;
 for(const a of ACTIONS){const score=scores[a]+(w.learning?d.q[a]*.8:0)+random()*.65;if(score>max){max=score;best=a;}}
 return best;
}
function startAction(d,w,r) {
 d.action=chooseAction(d,w,r); d.timer=7+r()*10;d.reward=0;d.target=null;d.project=null;d.progress=0;
 const radius=d.action==='explore'?180+r()*450:60+r()*100,angle=r()*Math.PI*2;
 d.target={x:clamp(d.x+Math.cos(angle)*radius,-WORLD_SIZE/2+100,WORLD_SIZE/2-100),y:clamp(d.y+Math.sin(angle)*radius,-WORLD_SIZE/2+100,WORLD_SIZE/2-100)};
 if(d.action==='rest'){d.target={...d.home};d.timer=12;}
 if(d.action==='build') {
  const bx=Math.round(d.target.x/130)*130,by=Math.round(d.target.y/130)*130;
  if(w.buildings.length>=300||w.buildings.some(b=>Math.hypot(b.x-bx,b.y-by)<110)){d.action='practise';return;}
  const kind=['cottage','workshop','tower'][Math.floor(r()*3)];
  const b={id:'b'+w.nextId++,x:bx,y:by,kind,progress:0,owner:d.id,color:d.color,quality:d.skills.drawing,finished:false};
  w.buildings.push(b); d.project=b.id;d.target={x:bx+56,y:by+42}; d.timer=40;d.ink-=8;
 }
 if(d.action==='spar') {
  const targets=w.doodles.filter(o=>o.id!==d.id&&o.health>45&&o.energy>25);
  const enemy=targets.sort((a,b)=>Math.hypot(a.x-d.x,a.y-d.y)-Math.hypot(b.x-d.x,b.y-d.y))[0];
  if(enemy){d.target={id:enemy.id};d.timer=14;}else{d.action='practise';}
 }
}
function move(d,tx,ty,dt,w) {
 let dx=tx-d.x,dy=ty-d.y,dist=Math.hypot(dx,dy),speed=35+d.skills.movement*.25;
 let desiredX=dist>7?dx/dist*speed:0,desiredY=dist>7?dy/dist*speed:0;
 for(const o of w.doodles){if(o.id===d.id)continue;let ox=d.x-o.x,oy=d.y-o.y,l=Math.hypot(ox,oy);if(l>0&&l<25){desiredX+=ox/l*(25-l)*3;desiredY+=oy/l*(25-l)*3;}}
 for(const b of w.buildings){if(!b.finished)continue;let ox=d.x-b.x,oy=d.y-(b.y+12),l=Math.hypot(ox,oy);if(l>0&&l<51){desiredX+=ox/l*(51-l)*4;desiredY+=oy/l*(51-l)*4;}}
 const blend=Math.min(1,dt*5);d.vx+=(desiredX-d.vx)*blend;d.vy+=(desiredY-d.vy)*blend;
 d.x=clamp(d.x+d.vx*dt,-WORLD_SIZE/2+30,WORLD_SIZE/2-30);d.y=clamp(d.y+d.vy*dt,-WORLD_SIZE/2+30,WORLD_SIZE/2-30);
 if(Math.hypot(d.vx,d.vy)>3){d.skills.movement=clamp(d.skills.movement+dt*.035,0,100);d.energy=Math.max(0,d.energy-dt*.2);}
 return dist;
}
export function step(w,dt,random=Math.random){
 dt=clamp(dt,0,.1);w.time+=dt;
 for(const d of w.doodles){
  d.age+=dt;d.timer-=dt;
  if(d.timer<=0){if(d.action){reward(d,d.action,d.reward,w.learning);}startAction(d,w,random);}
  if(!w.combat&&d.action==='spar'){d.timer=0;continue;}
  let target=d.target||d.home;
  if(target.id){const o=w.doodles.find(o=>o.id===target.id);if(!o){d.timer=0;continue;}target=o;}
  const dist=move(d,target.x,target.y,dt,w);
  if(d.action==='explore'){d.reward+=dt*.05;}
  if(d.action==='rest'){d.energy=clamp(d.energy+dt*6,0,100);d.health=clamp(d.health+dt*3.5,0,100);d.reward=.3;if(d.energy>=99&&d.health>=99)d.timer=0;}
  else if(d.action==='practise'&&dist<25){d.skills.drawing=clamp(d.skills.drawing+dt*.23,0,100);d.reward+=dt*.07;d.energy=Math.max(0,d.energy-dt*.35);d.progress+=dt;}
  else if(d.action==='gather'&&dist<25){d.ink=clamp(d.ink+dt*1.5,0,60);d.reward+=dt*.07;d.energy=Math.max(0,d.energy-dt*.3);}
  else if(d.action==='build'&&dist<26){const b=w.buildings.find(b=>b.id===d.project);if(!b||b.finished){d.timer=0;continue;}
   b.progress=clamp(b.progress+dt*(.04+d.skills.drawing*.0006),0,1);d.skills.drawing=clamp(d.skills.drawing+dt*.3,0,100);d.energy=Math.max(0,d.energy-dt*.6);d.timer=Math.max(2,d.timer);
   if(b.progress>=1){b.finished=true;w.completed++;d.reward=2;remember(d,'I drew a '+b.kind+'. Practice made my lines steadier.');event(w,d.name+' drew a '+b.kind+'.','build');d.timer=0;}
  }
  else if(d.action==='spar'&&dist<42){
   const enemy=w.doodles.find(o=>o.id===d.target.id); if(!enemy||enemy.health<=35||d.health<=35){d.timer=0;continue;}
   d.progress+=dt;d.energy=Math.max(0,d.energy-dt*.8);d.skills.combat=clamp(d.skills.combat+dt*.3,0,100);
   if(d.progress>.9){d.progress=0;const hit=random()<.5+d.skills.combat/250;d.reward+=hit?.12:-.02;
    if(hit){enemy.health=Math.max(30,enemy.health-(3+d.skills.combat*.035));enemy.vx+=(enemy.x-d.x)*.6;enemy.vy+=(enemy.y-d.y)*.6;}
    if(enemy.health<=38){d.wins++;w.spars++;event(w,d.name+' won a friendly duel with '+enemy.name+'.','spar');remember(d,'Won a duel. Timing matters.');remember(enemy,'Lost a duel; recover before trying again.');enemy.action='rest';enemy.target={...enemy.home};enemy.timer=15;d.timer=0;}
   }
  }
  if(d.energy<8&&d.action!=='rest'){d.timer=0;}
 }
 // Abandoned foundations fade rather than accumulating forever.
 w.buildings=w.buildings.filter(b=>b.finished||w.doodles.some(d=>d.project===b.id));
}
export function addDoodle(w,{name,description,color,strokes},x=0,y=0){
 if(w.doodles.length>=80)throw Error('This notebook holds up to 80 doodles.');
 const d=makeDoodle(w.nextId++,name.trim().slice(0,30)||'New doodle',description.trim().slice(0,500),COLORS.includes(color)?color:COLORS[0],clamp(x,-11900,11900),clamp(y,-11900,11900),strokes);
 w.doodles.push(d);event(w,d.name+' stepped off the sketchpad.','arrival');return d;
}
export function validateWorld(raw){
 const fail=()=>{throw Error('That file is not a valid Doodleworld save.');};
 if(!raw||raw.version!==1||!Number.isFinite(raw.time)||raw.time<0||!Number.isInteger(raw.seed)||!Number.isInteger(raw.nextId)||raw.nextId<1||!Array.isArray(raw.doodles)||raw.doodles.length<1||raw.doodles.length>80||!Array.isArray(raw.buildings)||raw.buildings.length>300)fail();
 const ids=new Set();
 for(const d of raw.doodles){
  if(!d||!Number.isInteger(d.id)||d.id<1||ids.has(d.id)||typeof d.name!=='string'||d.name.length>30||typeof d.description!=='string'||d.description.length>500||!COLORS.includes(d.color))fail();ids.add(d.id);
  for(const k of ['x','y','vx','vy','energy','health','ink','timer','progress','age','reward','wins'])if(!Number.isFinite(d[k])||Math.abs(d[k])>1e9)fail();
  if(Math.abs(d.x)>12000||Math.abs(d.y)>12000||d.energy<0||d.energy>100||d.health<0||d.health>100||d.ink<0||d.ink>60||!d.home||!Number.isFinite(d.home.x)||!Number.isFinite(d.home.y)||Math.abs(d.home.x)>12000||Math.abs(d.home.y)>12000)fail();
  if(!ACTIONS.includes(d.action)||!d.skills||!d.q||!d.trials||!d.traits||!Array.isArray(d.memories)||d.memories.length>6||d.memories.some(m=>typeof m!=='string'||m.length>240))fail();
  for(const k of ['movement','drawing','combat'])if(!Number.isFinite(d.skills[k])||d.skills[k]<0||d.skills[k]>100)fail();
  for(const k of ACTIONS)if(!Number.isFinite(d.q[k])||Math.abs(d.q[k])>5||!Number.isInteger(d.trials[k])||d.trials[k]<0)fail();
  d.traits=traitsFrom(d.description);
  if(!Array.isArray(d.strokes)||d.strokes.length>80||d.strokes.some(s=>!Array.isArray(s)||s.length>1000||s.some(p=>!Array.isArray(p)||p.length!==2||p.some(n=>!Number.isFinite(n)||n<0||n>1))))fail();
  if(d.target&&(!Number.isFinite(d.target.id)&&(!Number.isFinite(d.target.x)||!Number.isFinite(d.target.y))))fail();
  if(d.plan&&(!ACTIONS.includes(d.plan.action)||!Number.isFinite(d.plan.until)||typeof d.plan.reason!=='string'||d.plan.reason.length>160))fail();
 }
 for(const b of raw.buildings){if(!b||typeof b.id!=='string'||!['cottage','workshop','tower'].includes(b.kind)||!Number.isFinite(b.x)||!Number.isFinite(b.y)||Math.abs(b.x)>12000||Math.abs(b.y)>12000||!Number.isFinite(b.progress)||b.progress<0||b.progress>1||!COLORS.includes(b.color)||!Number.isFinite(b.quality)||typeof b.finished!=='boolean')fail();}
 if(!Array.isArray(raw.events)||raw.events.length>60||raw.events.some(e=>!e||typeof e.text!=='string'||e.text.length>240||!Number.isFinite(e.time)||typeof e.kind!=='string'))fail();
 if(!Number.isFinite(raw.completed)||!Number.isFinite(raw.spars)||typeof raw.combat!=='boolean'||typeof raw.learning!=='boolean'||raw.nextId<=Math.max(...ids))fail();
 return raw;
}
export function applyPlans(w,plans){
 let n=0;for(const p of plans.slice(0,12)){const d=w.doodles.find(d=>d.id===p.id);if(!d||!ACTIONS.includes(p.action))continue;d.plan={action:p.action,until:w.time+clamp(Number(p.seconds)||120,15,180),reason:String(p.reason||'A fresh idea.').slice(0,160)};d.timer=0;n++;}
 if(n)event(w,'A new spark: '+n+' doodles received a plan.','brain');return n;
}
