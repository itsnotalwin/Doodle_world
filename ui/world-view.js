// Canvas views share the exact environment sampler and world coordinates.
let globeCache=null,cameraTween=null,selectedArt=null,miniTerrainCache=null;
const globeBlend=()=>1-clamp((Math.log(cam.z)-Math.log(.04))/(Math.log(.12)-Math.log(.04)),0,1);
function globeLayout(){return {x:width*(width>720?.43:.5),y:height*.49,r:Math.min(width*(width>720?.27:.43),height*.36)};}
function animateCamera(to){cameraTween={from:{...cam},to:{...cam,...to},elapsed:0};following=false;}
function updateCamera(dt){if(!cameraTween)return;cameraTween.elapsed+=dt;const t=clamp(cameraTween.elapsed/.7,0,1),ease=t*t*(3-2*t),a=cameraTween.from,b=cameraTween.to;cam.x=a.x+(b.x-a.x)*ease;cam.y=a.y+(b.y-a.y)*ease;cam.z=Math.exp(Math.log(a.z)+(Math.log(b.z)-Math.log(a.z))*ease);if(t>=1)cameraTween=null;}
function globePick(x,y){const g=globeLayout();return globeUnproject((x-g.x)/g.r,(y-g.y)/g.r,cam.x,cam.y);}
function drawGlobe(alpha){
 const g=globeLayout(),size=Math.ceil(g.r*2+8),centerX=Math.round(cam.x/(WORLD_SIZE/800))*WORLD_SIZE/800,centerY=Math.round(cam.y/(WORLD_SIZE/800))*WORLD_SIZE/800,key=[size,centerX,centerY,w.seed].join(':');
 if(globeCache?.key!==key){const surface=document.createElement('canvas');surface.width=size;surface.height=size;const c=surface.getContext('2d'),r=g.r,cx=size/2,cy=size/2;
  c.fillStyle='#e1ebe3';c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.fill();c.save();c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.clip();
  for(let lat=-90;lat<90;lat+=5)for(let lon=-180;lon<180;lon+=5){const coords=[[lon,lat],[lon+5,lat],[lon+5,lat+5],[lon,lat+5]],points=coords.map(([a,b])=>globeProject(a/360*WORLD_SIZE,-b/180*WORLD_SIZE,centerX,centerY));if(points.every(p=>!p.visible))continue;
   const t=terrainAt((lon+2.5)/360*WORLD_SIZE,-(lat+2.5)/180*WORLD_SIZE,w.seed);c.fillStyle=t.color;c.beginPath();points.forEach((p,i)=>i?c.lineTo(cx+p.x*r,cy+p.y*r):c.moveTo(cx+p.x*r,cy+p.y*r));c.closePath();c.fill();
  }
  c.lineWidth=.6;c.strokeStyle='#71846b33';
  for(let lat=-60;lat<=60;lat+=30){c.beginPath();let pen=false;for(let lon=-180;lon<=180;lon+=3){const p=globeProject(lon/360*WORLD_SIZE,-lat/180*WORLD_SIZE,centerX,centerY);if(!p.visible){pen=false;continue;}if(pen)c.lineTo(cx+p.x*r,cy+p.y*r);else c.moveTo(cx+p.x*r,cy+p.y*r);pen=true;}c.stroke();}
  for(let lon=-180;lon<180;lon+=30){c.beginPath();let pen=false;for(let lat=-90;lat<=90;lat+=3){const p=globeProject(lon/360*WORLD_SIZE,-lat/180*WORLD_SIZE,centerX,centerY);if(!p.visible){pen=false;continue;}if(pen)c.lineTo(cx+p.x*r,cy+p.y*r);else c.moveTo(cx+p.x*r,cy+p.y*r);pen=true;}c.stroke();}
  const light=c.createRadialGradient(cx-r*.35,cy-r*.35,r*.05,cx,cy,r);light.addColorStop(0,'#fffef52a');light.addColorStop(.7,'#5d765000');light.addColorStop(1,'#54634135');c.fillStyle=light;c.fillRect(0,0,size,size);c.restore();c.strokeStyle='#78896b';c.lineWidth=1.6;c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.stroke();globeCache={key,surface};
 }
 ctx.save();ctx.globalAlpha=alpha;
 ellipse(g.x,g.y+g.r+15,g.r*.64,11,null,'#6f765710');ctx.drawImage(globeCache.surface,g.x-size/2,g.y-size/2);
 // Globe dots are the real doodles, buildings and drawings, never a second population.
 for(const b of w.buildings.filter(b=>b.finished)){const p=globeProject(b.x,b.y,cam.x,cam.y);if(p.visible){ctx.fillStyle=b.color;ctx.fillRect(g.x+p.x*g.r-2,g.y+p.y*g.r-2,4,4);}}
 for(const d of w.doodles){const p=globeProject(d.x,d.y,cam.x,cam.y);if(p.visible)ellipse(g.x+p.x*g.r,g.y+p.y*g.r,2.5,2.5,null,d.color);}
 const home=globeProject(0,0,cam.x,cam.y);if(home.visible){const hx=g.x+home.x*g.r,hy=g.y+home.y*g.r;ellipse(hx,hy,10,10,'#7e9167');line([[hx+10,hy],[hx+51,hy-31],[hx+126,hy-31]],'#8f9d7c',.9);text('the first meadow',hx+91,hy-39,12,'#6d7d5e');}
 text('O N E   P L A N E T .   E V E R Y   L I T T L E   L I F E .',g.x,g.y-g.r-32,width>720?10:7,'#8f9b80','monospace');
 text('Drag to turn · click a place to land',g.x,g.y+g.r+43,11,'#829174');ctx.restore();
}
function drawEnvironment(){
 const inheritedAlpha=ctx.globalAlpha;
 const tile=Math.max(500,Math.ceil(Math.max(width,height)/cam.z/32/500)*500),left=Math.floor((cam.x-width/cam.z*.55)/tile)*tile,right=Math.min(WORLD_SIZE/2,cam.x+width/cam.z*.55),top=Math.floor((cam.y-height/cam.z*.6)/tile)*tile,bottom=Math.min(WORLD_SIZE/2,cam.y+height/cam.z*.6);
 for(let x=Math.max(-WORLD_SIZE/2,left);x<right;x+=tile)for(let y=Math.max(-WORLD_SIZE/2,top);y<bottom;y+=tile){const t=terrainAt(x+tile/2,y+tile/2,w.seed);ctx.globalAlpha=inheritedAlpha*(t.biome==='water'?.7:t.biome==='dunes'?.35:.13);ctx.fillStyle=t.color;ctx.fillRect(x,y,tile+1,tile+1);}
 ctx.globalAlpha=inheritedAlpha;
 for(const g of w.groups){const members=w.doodles.filter(d=>g.members.includes(d.id));if(!members.length)continue;const x=members.reduce((s,d)=>s+d.x,0)/members.length,y=members.reduce((s,d)=>s+d.y,0)/members.length;if(!visible(x,y,400))continue;const radius=clamp(Math.max(...members.map(d=>Math.hypot(d.x-x,d.y-y)))+60,90,360);ellipse(x,y,radius,radius*.65,g.color+'44',g.color+'08');if(cam.z>.35)text(g.name,x,y-radius*.65-12,11,g.color);}
 const radius=Math.min(1900,Math.max(width,height)/cam.z*.65),nodes=resourceNodes(w,cam.x,cam.y,radius);
 for(const n of nodes){if(!visible(n.x,n.y)||n.amount<.1)continue;ctx.save();ctx.translate(n.x,n.y);
  if(n.kind==='food'){ellipse(0,-4,13,10,'#9da988','#dce5cb');for(let i=0;i<Math.min(6,Math.ceil(n.amount));i++){const a=i*2.4;ellipse(Math.cos(a)*8,Math.sin(a)*6-4,1.6,1.6,null,'#ba7d76');}}
  else if(n.kind==='wood'){drawTree(0,0,.55+n.amount/35);}else if(n.kind==='stone'){drawRock(0,0,.45+n.amount/25);}else if(n.kind==='ink'){line([[-8,8],[-9,-13],[-4,-18]],'#9ba783',1);line([[0,8],[3,-20],[7,-23]],'#8d9f75',1.2);line([[7,8],[11,-11]],'#9fa98a',1);ellipse(3,-21,2,5,null,'#8e9b78');}
  else if(n.id!=='water:-3:1'){ellipse(0,0,19,8,'#bfd0c3','#deebe2');line([[-7,0],[7,-1]],'#a7bfae',1);}
  ctx.restore();
 }
}
function drawAtmosphere(){
 if(w.environment.night){ctx.fillStyle='#52618412';ctx.fillRect(0,0,width,height);}
 if(w.environment.weather==='rain'&&cam.z>.15){ctx.save();ctx.strokeStyle='#8ca9a835';ctx.lineWidth=.8;for(let i=0;i<65;i++){const x=(hash(i,0,w.seed)*width+w.time*45)%width,y=(hash(i,9,w.seed)*height+w.time*110)%height;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-3,y+9);ctx.stroke();}ctx.restore();}
}
function drawMiniTerrain(){if(miniTerrainCache?.seed!==w.seed){const surface=document.createElement('canvas');surface.width=196;surface.height=132;const c=surface.getContext('2d');for(let x=0;x<196;x+=4)for(let y=0;y<132;y+=4){c.fillStyle=terrainAt((x/196-.5)*WORLD_SIZE,(y/132-.5)*WORLD_SIZE,w.seed).color;c.fillRect(x,y,4,4);}miniTerrainCache={seed:w.seed,surface};}mc.drawImage(miniTerrainCache.surface,0,0);}
function appendLife(book,d){
 book.append(el('div',d.thought,'quote'));const tags=el('div',undefined,'trait-tags');tags.append(el('span',moodName(d)),el('span','anger '+Math.round(d.mood.anger)+'%'),el('span','food '+Math.round(d.needs.food)+'%'),el('span','water '+Math.round(d.needs.water)+'%'));book.append(tags);
 const group=w.groups.find(g=>g.id===d.groupId);if(group)book.append(el('p','Belongs to '+group.name));else book.append(el('p','Independent — free to choose a circle.'));book.append(el('div','OWN DECISION · '+d.decision.kind,'eyebrow'),el('div',d.decision.reason,'quote'),el('p',(d.alive?d.stage:'Remembered')+' · knowledge '+d.knowledge.toFixed(1)+'/100 · generation '+d.generation));if(d.death)book.append(el('p','Died: '+d.death.cause));const family=[...d.parents.map(id=>({id,label:'Parent'})),...w.doodles.filter(o=>o.parents.includes(d.id)).map(o=>({id:o.id,label:'Child'}))];if(family.length){book.append(el('div','FAMILY · INHERITED GENES','eyebrow'));for(const f of family){const relative=w.doodles.find(o=>o.id===f.id);const b=el('button',f.label+': '+relative.name,'inline-link');b.onclick=()=>select(relative);book.append(b,el('br'));}}const details=el('details'),summary=el('summary','24 personality traits');details.append(summary);for(const [k,v] of Object.entries(d.personality))details.append(el('p',k+' · '+Math.round(v*100)+'%'));book.append(details);
 const ties=Object.entries(d.relationships).filter(([,v])=>Math.abs(v)>=10).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,3);if(ties.length){book.append(el('div','RELATIONSHIPS','eyebrow'));for(const [id,value] of ties){const o=w.doodles.find(o=>o.id===Number(id));if(o){const b=el('button',o.name+' · '+(value>24?'friend':value<-24?'rival':value>0?'warming up':'uneasy')+' '+Math.round(value),'inline-link');b.onclick=()=>select(o);book.append(b,el('br'));}}}
}
function showGroupsPage(book){if(bookTab!=='groups')return false;book.append(el('div','BELONGING TAKES TIME','eyebrow'),el('h3','Little circles.'),el('p','Each doodle chooses: join, refuse, stay, leave or found a circle. Trust, shared values, loyalty, independence and danger shape each decision. Rallies require individual consent.'));
 if(!w.groups.length)book.append(el('div','No circles yet. Doodles need to meet, share ideas and build trust first.','quote'));
 for(const g of w.groups){book.append(el('h3',g.name),el('p',g.members.length+' members · '+(g.title||g.style)+(g.leader?' · leader '+(w.doodles.find(d=>d.id===g.leader)?.name||'none'):' · no chosen leader')+(g.strategy?' · '+g.strategy.goal:'')));for(const id of g.members){const d=w.doodles.find(d=>d.id===id);if(!d)continue;const b=el('button',d.name+' ↗','inline-link');b.onclick=()=>select(d);book.append(b,el('br'));}book.append(el('hr',undefined,'divider'));}return true;}

