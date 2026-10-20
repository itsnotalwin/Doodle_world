// Shared environment, procedural creativity, social rules and globe projection.
// No network or DOM dependencies: the world remains a local simulation.
export const FIELD_SIZE=24000;
export const MOTIFS=['flower','tree','bird','star','sun','moon','spiral','portrait','river','house','mountain','heart'];
export const cap=(n,a,b)=>Math.max(a,Math.min(b,n));
export const hash=(x,y,seed=71)=>{const n=Math.sin(x*127.1+y*311.7+seed*13.37)*43758.5453;return n-Math.floor(n);};
export function terrainAt(x,y,seed=71){
 const lon=x/FIELD_SIZE*Math.PI*2,lat=y/FIELD_SIZE*Math.PI;
 const land=Math.sin(lon*1.8+Math.sin(lat*3)*.9)+Math.cos(lat*2.3+lon*.55)*.85+Math.sin(lon*3.2-lat*2)*.3;
 if(land<-.48)return {biome:'water',color:'#dbe7e1',speed:.42};
 if(Math.abs(y)>9700)return {biome:'tundra',color:'#e7e9df',speed:.8};
 const moisture=Math.sin(lon*4+seed*.01)+Math.cos(lat*5-lon);
 if(moisture<-.8)return {biome:'dunes',color:'#eee3c9',speed:.75};
 if(moisture>1.12)return {biome:'forest',color:'#dce5cc',speed:.82};
 return {biome:'meadow',color:'#e9ecd7',speed:1};
}
export function environmentAt(time,seed=71){
 const day=1+Math.floor(time/480),season=['spring','summer','autumn','winter'][Math.floor(time/1920)%4];
 const hour=(8+time/480*24)%24,weather=['clear','cloudy','rain'][Math.floor(hash(Math.floor(time/180),0,seed)*3)];
 return {day,season,hour,weather,night:hour<6||hour>20};
}
export function resourceNodes(w,x,y,radius=650){
 const nodes=[],cell=220,reach=Math.ceil(radius/cell),cx=Math.floor(x/cell),cy=Math.floor(y/cell);
 const fixed=[{id:'water:-3:1',x:-510,y:360,kind:'water',max:100},{id:'food:0:0',x:-80,y:95,kind:'food',max:14},{id:'ink:0:0',x:100,y:65,kind:'ink',max:16}];
 for(const n of fixed)if(Math.hypot(n.x-x,n.y-y)<radius)nodes.push(n);
 for(let i=cx-reach;i<=cx+reach;i++)for(let j=cy-reach;j<=cy+reach;j++){
  if(Math.abs(i*cell)>11900||Math.abs(j*cell)>11900)continue;
  const n=hash(i,j,w.seed),kind=n<.23?'food':n<.5?'ink':n<.59?'water':null;if(!kind)continue;
  const px=i*cell+40+hash(i+9,j,w.seed)*130,py=j*cell+40+hash(i,j+9,w.seed)*130;
  if(terrainAt(px,py,w.seed).biome==='water'&&kind!=='water')continue;
  if(Math.hypot(px-x,py-y)>radius)continue;
  const id=kind+':'+i+':'+j;if(nodes.some(o=>o.id===id))continue;
  nodes.push({id,x:px,y:py,kind,max:kind==='water'?100:10});
 }
 return nodes.map(n=>({...n,amount:w.resources?.[n.id]?.amount??n.max}));
}
export function nearestResource(w,d,kind){return resourceNodes(w,d.x,d.y,1500).filter(n=>n.kind===kind&&n.amount>.5).sort((a,b)=>Math.hypot(a.x-d.x,a.y-d.y)-Math.hypot(b.x-d.x,b.y-d.y))[0]||null;}
export function consumeResource(w,node,amount){
 if(!w.resources[node.id]){if(Object.keys(w.resources).length>=4000)return 0;w.resources[node.id]={amount:node.max,max:node.max,kind:node.kind};}
 const store=w.resources[node.id],taken=Math.min(store.amount,amount);store.amount=Math.max(0,store.amount-taken);return taken;
}
export function regenerateResources(w,seconds){
 const weather=w.environment?.weather||'clear';for(const node of Object.values(w.resources))node.amount=cap(node.amount+seconds*(node.kind==='water'?.8:.035)*(weather==='rain'?2:1),0,node.max);
}
export function migrateGrowth(w){
 const old=w.version===1;
 if(old){w.version=2;w.artworks=[];w.groups=[];w.resources={};w.socialClock=0;w.groupClock=0;w.growthClock=w.time;w.growth=true;w.social=true;w.totalArt=0;}
 w.environment=environmentAt(w.time,w.seed);
 for(const d of w.doodles){if(!old&&d.mood)continue;
  d.mood={anger:0,joy:55,loneliness:20};d.needs={food:90,water:90};d.relationships={};d.socialCooldown=0;d.thought='What could I make of this little life?';d.groupId=null;d.artCount=0;d.lastIdea=null;d.stall=0;
 }
 return w;
}
export function relationship(a,b){return a.relationships[b.id]||0;}
export function changeBond(a,b,delta){a.relationships[b.id]=cap(relationship(a,b)+delta,-100,100);}
export function feelAngry(d,other,amount){d.mood.anger=cap(d.mood.anger+amount,0,100);d.mood.joy=cap(d.mood.joy-amount*.25,0,100);if(other)changeBond(d,other,-amount*.6);}
export function moodName(d){return d.mood.anger>62?'angry':d.mood.loneliness>65?'lonely':d.mood.joy>68?'happy':d.mood.joy<30?'low':'content';}
export function interact(w,a,b,type,log){
 if(!a||!b||a.id===b.id)return;
 const names={talk:['I like sharing this patch of paper.','Tell me about your next idea.'],argue:['That was my space!','I need a little room.'],apologize:['I was cross. Can we start again?','Let’s make something better.'],admire:['I love what you drew.','Your lines gave me an idea.']};
 if(type==='argue'){
  changeBond(a,b,-12);changeBond(b,a,-10);feelAngry(a,null,5);feelAngry(b,null,18);a.mood.anger=cap(a.mood.anger-12,0,100);
  log(w,a.name+' and '+b.name+' argued about their space.','social');
 }else if(type==='apologize'){
  changeBond(a,b,12);changeBond(b,a,10);a.mood.anger=Math.max(0,a.mood.anger-24);b.mood.anger=Math.max(0,b.mood.anger-20);log(w,a.name+' made peace with '+b.name+'.','social');
 }else{
  const shared=a.traits.builder*b.traits.builder+a.traits.curious*b.traits.curious;
  const gain=(type==='admire'?7:5)+shared*2;changeBond(a,b,gain);changeBond(b,a,gain*.9);
  a.mood.joy=cap(a.mood.joy+7,0,100);b.mood.joy=cap(b.mood.joy+5,0,100);
 }
 a.mood.loneliness=Math.max(0,a.mood.loneliness-28);b.mood.loneliness=Math.max(0,b.mood.loneliness-18);
 a.thought=names[type]?.[a.id%2]||names.talk[0];b.thought=type==='argue'?'I won’t forget that in a hurry.':type==='apologize'?'A fresh start might be nice.':'Maybe we could make something together.';
 a.socialCooldown=18;b.socialCooldown=Math.max(b.socialCooldown,10);
}
export function formGroups(w,log){
 // Existing circles dissolve or lose members when their mutual bonds break down.
 for(const g of w.groups){g.members=g.members.filter(id=>{const d=w.doodles.find(d=>d.id===id);if(!d)return false;const rivals=g.members.filter(other=>other!==id&&(d.relationships[other]||0)<-25).length;if(rivals>=2){d.groupId=null;log(w,d.name+' left '+g.name+'.','group');return false;}return true;});}
 w.groups=w.groups.filter(g=>{if(g.members.length>=2)return true;for(const id of g.members){const d=w.doodles.find(d=>d.id===id);if(d)d.groupId=null;}return false;});
 // A circle grows only from a connected network of mutual friendships.
 const free=w.doodles.filter(d=>!d.groupId),visited=new Set();
 for(const root of free){if(visited.has(root.id))continue;const stack=[root],component=[];visited.add(root.id);
  while(stack.length){const d=stack.pop();component.push(d);for(const o of free)if(!visited.has(o.id)&&relationship(d,o)>=24&&relationship(o,d)>=24){visited.add(o.id);stack.push(o);}}
  if(component.length<3||w.groups.length>=20)continue;
  const founder=component[0],id='g'+w.nextId++,style=founder.traits.builder>.7?'makers':founder.traits.curious>.7?'wanderers':'neighbours';
  const g={id,name:founder.name+'’s '+(style==='makers'?'Ink Circle':style==='wanderers'?'Wandering Club':'Paperfolk'),members:component.map(d=>d.id),founded:w.time,color:founder.color,style};
  w.groups.push(g);component.forEach(d=>{d.groupId=id;d.thought='We are '+g.name+'. This feels like home.';});log(w,g.name+' formed from '+component.length+' friendships.','group');
 }
 for(const d of w.doodles.filter(d=>!d.groupId))for(const g of w.groups){const friends=g.members.filter(id=>(d.relationships[id]||0)>=28);if(friends.length>=2){g.members.push(d.id);d.groupId=g.id;log(w,d.name+' joined '+g.name+'.','group');break;}}
}
export function tickSociety(w,dt,log){
 w.environment=environmentAt(w.time,w.seed);
 for(const d of w.doodles){d.mood.anger=Math.max(0,d.mood.anger-dt*.09);d.mood.loneliness=cap(d.mood.loneliness+dt*.075,0,100);d.mood.joy=cap(d.mood.joy+dt*(d.needs.food<25||d.needs.water<25?-.25:.008),0,100);d.socialCooldown=Math.max(0,d.socialCooldown-dt);d.needs.food=Math.max(0,d.needs.food-dt*.105);d.needs.water=Math.max(0,d.needs.water-dt*(w.environment.season==='summer'?.18:.145));}
 w.socialClock+=dt;w.groupClock+=dt;
 if(w.socialClock>=2){regenerateResources(w,w.socialClock);w.socialClock=0;
  if(w.social)for(const a of w.doodles){if(a.socialCooldown>0||a.action==='spar'||a.action==='argue')continue;
   const b=w.doodles.find(o=>o.id>a.id&&o.socialCooldown<=0&&Math.hypot(o.x-a.x,o.y-a.y)<95&&o.action!=='spar');if(!b)continue;
   if(a.mood.anger>65&&relationship(a,b)<-10)interact(w,a,b,'argue',log);else interact(w,a,b,'talk',log);
  }
 }
 if(w.groupClock>=30){w.groupClock=0;if(w.social)formGroups(w,log);}
}
export function inventIdea(d,w,random=Math.random,recipe=null){
 let motifs=recipe?.motifs?.filter(m=>MOTIFS.includes(m)).slice(0,3)||[];
 const description=d.description.toLowerCase(),terrain=terrainAt(d.x,d.y,w.seed).biome,mood=moodName(d);
 if(!motifs.length){const pool=['flower','tree','bird','star','sun','spiral','portrait','river','house','heart'];
  if(/space|star|moon|cosmic/.test(description))pool.push('star','moon','star');
  if(/flower|garden|nature|gentle/.test(description))pool.push('flower','tree','heart');
  if(/build|architect|village/.test(description))pool.push('house','house','mountain');
  if(terrain==='forest')pool.push('tree','bird');if(w.environment.weather==='rain')pool.push('river','moon');if(mood==='angry')pool.push('mountain','spiral','sun');
  motifs=[pool[Math.floor(random()*pool.length)],pool[Math.floor(random()*pool.length)]];if(d.skills.drawing>25)motifs.push(pool[Math.floor(random()*pool.length)]);
  const nearby=w.artworks.find(a=>a.finished&&a.owner!==d.id&&Math.hypot(a.x-d.x,a.y-d.y)<220);if(nearby&&random()<.4)motifs[0]=nearby.motifs[0];
 }
 const adjective=mood==='angry'?'Stormy':mood==='happy'?'Joyful':w.environment.night?'Moonlit':['Little','Dancing','Dreaming','Wild','Quiet'][Math.floor(random()*5)];
 return {title:(recipe?.title||adjective+' '+motifs.join(' & ')).slice(0,70),motifs,tone:mood,seed:Math.floor(random()*1e8),inspiration:(recipe?'A thought from Groq':terrain+' · '+w.environment.weather+' · '+mood).slice(0,100)};
}
function circleStroke(x,y,r,n=18){return Array.from({length:n+1},(_,i)=>[x+Math.cos(i/n*Math.PI*2)*r,y+Math.sin(i/n*Math.PI*2)*r]);}
export function artStrokes(idea,quality=0){
 const paths=[],r=(n)=>hash(n,idea.seed,idea.seed),m=idea.motifs;
 for(let i=0;i<m.length;i++){const x=(i-(m.length-1)/2)*30,y=i%2?-3:2,s=12+r(i)*7;const add=p=>paths.push(p);
  switch(m[i]){
   case 'flower':add([[x,y],[x-2,y+22]]);for(let k=0;k<5+Math.floor(r(i+5)*4);k++){let a=k*Math.PI*2/(5+Math.floor(r(i+5)*4));add(circleStroke(x+Math.cos(a)*s*.65,y+Math.sin(a)*s*.65,s*.4,10));}add(circleStroke(x,y,s*.28));add([[x-2,y+13],[x-12,y+8],[x-2,y+19]]);break;
   case 'tree':add([[x,y+24],[x,y-5]]);add([[x-s,y+9],[x,y-s*1.5],[x+s,y+9],[x-s,y+9]]);break;
   case 'bird':add([[x-s,y],[x-s*.5,y-s*.6],[x,y],[x+s*.5,y-s*.6],[x+s,y]]);break;
   case 'star':{const p=[];for(let k=0;k<=10;k++){let a=k*Math.PI/5-Math.PI/2,rr=k%2?s*.4:s;p.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr]);}add(p);break;}
   case 'sun':add(circleStroke(x,y,s*.6));for(let k=0;k<8;k++){let a=k*Math.PI/4;add([[x+Math.cos(a)*s*.8,y+Math.sin(a)*s*.8],[x+Math.cos(a)*s*1.3,y+Math.sin(a)*s*1.3]]);}break;
   case 'moon':{const p=[];for(let k=0;k<=20;k++){let a=k/20*Math.PI*2;p.push([x+Math.cos(a)*s*(k<10?1:.55)+ (k<10?0:s*.4),y+Math.sin(a)*s]);}add(p);break;}
   case 'spiral':add(Array.from({length:45},(_,k)=>[x+Math.cos(k*.4)*k*.42,y+Math.sin(k*.4)*k*.42]));break;
   case 'portrait':add(circleStroke(x,y,s));add([[x-s*.3,y-3],[x-s*.3+.5,y-3]]);add([[x+s*.3,y-3],[x+s*.3+.5,y-3]]);add([[x-5,y+5],[x,y+(idea.tone==='angry'?2:8)],[x+5,y+5]]);break;
   case 'river':add(Array.from({length:30},(_,k)=>[x+Math.sin(k*.3)*s,k*2-28]));add(Array.from({length:30},(_,k)=>[x+8+Math.sin(k*.3)*s,k*2-28]));break;
   case 'house':add([[x-s,y],[x,y-s],[x+s,y],[x-s,y],[x-s,y+s],[x+s,y+s],[x+s,y]]);add([[x-3,y+s],[x-3,y+6],[x+3,y+6],[x+3,y+s]]);break;
   case 'mountain':add([[x-s,y+s],[x,y-s],[x+s,y+s]]);add([[x-5,y-5],[x,y-1],[x+5,y-5]]);break;
   case 'heart':add(Array.from({length:35},(_,k)=>{const t=k/34*Math.PI*2;return [x+Math.sin(t)**3*s,y-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*s/16];}));break;
  }
 }
 const noise=(1-cap(quality,0,100)/100)*(idea.tone==='angry'?2.4:1.2);
 return paths.map((p,pi)=>p.map(([x,y],j)=>[cap(x+(r(pi*59+j)-.5)*noise,-150,150),cap(y+(r(pi*41+j+7)-.5)*noise,-150,150)]));
}
export function inventBuilding(d,w,random=Math.random){
 const kind=d.groupId&&random()<.45?'workshop':d.mood.anger>60?'tower':['cottage','workshop','tower'][Math.floor(random()*3)];
 const width=26+random()*21,height=25+random()*20,roof=22+random()*26,windows=1+Math.floor(random()*3);
 const blueprint=kind==='tower'?[[[-width*.65,height],[-width*.65,-height],[-width*.85,-height],[-width*.85,-height-12],[-width*.4,-height-12],[-width*.4,-height-5],[0,-height-5],[0,-height-12],[width*.4,-height-12],[width*.4,-height-5],[width*.85,-height-5],[width*.85,-height],[width*.65,-height],[width*.65,height],[-width*.65,height]]]:[[[-width,0],[0,-roof],[width,0],[-width,0]],[[-width*.8,0],[-width*.8,height],[width*.8,height],[width*.8,0]]];
 blueprint.push([[-6,height],[-6,height-19],[6,height-19],[6,height]]);
 for(let i=0;i<windows;i++){const x=(i-(windows-1)/2)*17;blueprint.push([[x-4,-height*.25],[x+4,-height*.25],[x+4,-height*.25+8],[x-4,-height*.25+8],[x-4,-height*.25]]);}
 return {kind,blueprint,design:{width,height,roof,windows},name:(d.lastIdea?.title||d.name+'’s '+kind).slice(0,70)};
}
export function globeProject(x,y,centerX=0,centerY=0){
 const lon=x/FIELD_SIZE*Math.PI*2,lat=-y/FIELD_SIZE*Math.PI,lon0=centerX/FIELD_SIZE*Math.PI*2,lat0=-centerY/FIELD_SIZE*Math.PI;
 const delta=lon-lon0,cos=Math.cos(lat),depth=Math.sin(lat0)*Math.sin(lat)+Math.cos(lat0)*cos*Math.cos(delta);
 return {x:cos*Math.sin(delta),y:-(Math.cos(lat0)*Math.sin(lat)-Math.sin(lat0)*cos*Math.cos(delta)),visible:depth>=0,depth};
}
export function globeUnproject(px,py,centerX=0,centerY=0){
 const rho=Math.hypot(px,py);if(rho>1)return null;if(rho<1e-8)return {x:centerX,y:centerY};
 const c=Math.asin(rho),lon0=centerX/FIELD_SIZE*Math.PI*2,lat0=-centerY/FIELD_SIZE*Math.PI;
 const lat=Math.asin(cap(Math.cos(c)*Math.sin(lat0)-py*Math.sin(c)*Math.cos(lat0)/rho,-1,1));
 let lon=lon0+Math.atan2(px*Math.sin(c),rho*Math.cos(lat0)*Math.cos(c)+py*Math.sin(lat0)*Math.sin(c));lon=((lon+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;
 return {x:lon/(Math.PI*2)*FIELD_SIZE,y:-lat/Math.PI*FIELD_SIZE};
}
