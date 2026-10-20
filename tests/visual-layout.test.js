import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {characterLayout,characterAnnotations,placeLabel,rectanglesOverlap} from '../ui/character-layout.js';
import {genomeFor,encodeAppearance,characterStrokes,SPECIES} from '../sim/life-systems.js';

const resident=(seed,description)=>encodeAppearance({genome:genomeFor(seed),description});

test('saved generated strokes and inherited geometry use the same world scale',()=>{
 for(let seed=1;seed<=200;seed++){
  const d=resident(seed,'A '+SPECIES[seed%SPECIES.length]+' with tall ears and a round face');
  const strokes=characterStrokes(d);
  assert.deepEqual(characterLayout(structuredClone(strokes)),characterLayout(characterStrokes(d)));
  const parent=characterLayout(strokes),child=characterLayout(strokes,true);
  for(const key of ['left','right','top','bottom'])assert.ok(Math.abs(child.bounds[key]-parent.bounds[key]*.65)<1e-9);
  assert.ok(parent.bounds.right-parent.bounds.left<=56+1e-9);
  assert.ok(parent.bounds.bottom-parent.bounds.top<=78+1e-9);
 }
});

test('freehand layout preserves saved points and handles the maximum stroke budget',()=>{
 const strokes=Array.from({length:80},()=>Array.from({length:1000},(_,i)=>[i/999,i%2]));
 const before=JSON.stringify(strokes),layout=characterLayout(strokes);
 assert.equal(JSON.stringify(strokes),before);
 assert.equal(layout.paths.length,80);
 assert.ok(layout.bounds.right-layout.bounds.left<=56+1e-9);
 assert.ok(layout.bounds.bottom-layout.bounds.top<=78+1e-9);
 assert.ok(Object.values(layout.bounds).every(Number.isFinite));
 assert.deepEqual(characterLayout([]).paths,[]);
});

test('selected thoughts stay above role titles and names stay below every silhouette',()=>{
 for(let seed=1;seed<=100;seed++){
  const d=resident(seed,'A rabbit wizard with tall ears and wings');
  for(const child of [false,true]){
   const {bounds}=characterLayout(characterStrokes(d),child),a=characterAnnotations(bounds,true);
   assert.ok(a.bubble.top+a.bubble.height<a.roleY-9);
   assert.ok(a.nameY>bounds.bottom+10);
   assert.ok(a.actionY>bounds.top+19);
  }
 }
});

test('crowded name placement never accepts intersecting label rectangles',()=>{
 const occupied=[],accepted=[];
 for(let i=0;i<100;i++){
  const rect={left:i%10*14,right:i%10*14+48,top:Math.floor(i/10)*12,bottom:Math.floor(i/10)*12+16};
  if(placeLabel(rect,occupied))accepted.push(rect);
 }
 assert.ok(accepted.length>1&&accepted.length<100);
 for(let i=0;i<accepted.length;i++)for(let j=i+1;j<accepted.length;j++)assert.equal(rectanglesOverlap(accepted[i],accepted[j],4),false);
});

test('zoom during selection keeps the camera destination and accumulates zoom',()=>{
 const page=readFileSync(new URL('../ui/index.html',import.meta.url),'utf8');
 const zoom=page.match(/^function zoom\(.*$/m)[0];
 const run=runInNewContext(`
  let cam={x:0,y:0,z:1},cameraTween={from:{...cam},to:{x:700,y:-400,z:.8},elapsed:.1},following=true;
  const width=1000,height=800,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const animateCamera=to=>{cameraTween={from:{...cam},to:{...cam,...to},elapsed:0};following=false;};
  ${zoom}
  zoom(1.25);zoom(1.25);
  ({x:cameraTween.to.x,y:cameraTween.to.y,z:cameraTween.to.z,following});
 `);
 assert.equal(run.x,700);assert.equal(run.y,-400);assert.equal(run.z,1.25);assert.equal(run.following,false);
});

test('description geometry is encoded before generating the creator preview',()=>{
 const page=readFileSync(new URL('../ui/index.html',import.meta.url),'utf8');
 const source=page.match(/function mouldCharacter\(randomize=false\)\{.*?\}/)[0];
 const calls=[],fake={genome:null};
 const context={creatorSeed:1,makeDoodle:()=>fake,$:()=>({value:'A tiny rabbit with a square face'}),color:'#66856a',
  genomeFor:()=>({}),encodeAppearance:d=>{d.encoded=true;calls.push('encode');},
  characterStrokes:d=>{assert.equal(d.encoded,true);calls.push('draw');return [];},redrawPad:()=>{},strokes:[],generatedPreview:false};
 runInNewContext(source+';mouldCharacter();',context);
 assert.deepEqual(calls,['encode','draw']);
});
