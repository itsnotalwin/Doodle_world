import {validateWorld} from '../sim/engine.js';
// Owner-scoped, revision-checked checkpoints. Never stores credentials or writes GitHub.
const MAX_SNAPSHOT=6_000_000,CHUNK=100_000;
export async function worldStore(request,env,{now=Date.now,validate=validateWorld}={}){
 const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}}),owner=request.headers.get('oai-authenticated-user-id');
 if(!owner)return json({available:false,message:'Hosted sign-in is required for cloud checkpoints. Device saves still work.'},401);
 if(!env.DB)return json({available:false,message:'Cloud storage is unavailable. Export a backup; local simulation continues.'},503);
 try{
  if(request.method==='GET'){const head=await env.DB.prepare('SELECT revision, token, parts, updated_at FROM world_checkpoints WHERE owner = ?').bind(owner).first();if(!head)return json({available:true,revision:0,world:null});const rows=await env.DB.prepare('SELECT part, data FROM world_chunks WHERE owner = ? AND token = ? ORDER BY part').bind(owner,head.token).all();if(rows.results.length!==head.parts)return json({available:true,message:'The checkpoint changed while loading. Load it again.'},409);const world=validate(JSON.parse(rows.results.map(r=>r.data).join('')));return json({available:true,revision:head.revision,checkpointToken:head.token,updatedAt:head.updated_at,world});}
  if(request.method!=='PUT')return json({message:'Method not allowed.'},405);
  const url=new URL(request.url);if(request.headers.get('origin')!==url.origin)return json({message:'Same-origin request required.'},403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return json({message:'JSON required.'},415);
  if(Number(request.headers.get('content-length'))>MAX_SNAPSHOT)return json({message:'Checkpoint is too large. Export a backup instead.'},413);
  const reader=request.body?.getReader();if(!reader)return json({message:'World required.'},400);const chunks=[];let bytes=0;for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>MAX_SNAPSHOT){await reader.cancel();return json({message:'Checkpoint is too large. Export a backup instead.'},413);}chunks.push(value);}const buf=new Uint8Array(bytes);let offset=0;for(const c of chunks){buf.set(c,offset);offset+=c.length;}
  let payload,world;try{payload=JSON.parse(new TextDecoder().decode(buf));if(!Number.isInteger(payload.revision)||payload.revision<0)throw Error();world=validate(payload.world);}catch{return json({message:'Invalid world checkpoint.'},400);}
  const data=JSON.stringify(world),parts=[];for(let i=0;i<data.length;){let end=Math.min(data.length,i+CHUNK);const char=data.charCodeAt(end-1);if(end<data.length&&char>=0xD800&&char<=0xDBFF)end--;parts.push(data.slice(i,end));i=end;}const token=crypto.randomUUID(),stamp=now(),revision=payload.revision;
  // The whole batch is atomic. Failed optimistic writes cannot change chunks or remove the winner.
  const first=env.DB.prepare('INSERT INTO world_checkpoints(owner, revision, token, parts, updated_at) SELECT ?, 1, ?, ?, ? WHERE ? = 0 OR EXISTS (SELECT 1 FROM world_checkpoints WHERE owner = ? AND revision = ?) ON CONFLICT(owner) DO UPDATE SET revision = revision + 1, token = excluded.token, parts = excluded.parts, updated_at = excluded.updated_at WHERE world_checkpoints.revision = ? RETURNING revision').bind(owner,token,parts.length,stamp,revision,owner,revision,revision);
  const statements=[first,...parts.map((part,i)=>env.DB.prepare('INSERT INTO world_chunks(owner, token, part, data) SELECT ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM world_checkpoints WHERE owner = ? AND token = ?)').bind(owner,token,i,part,owner,token)),env.DB.prepare('DELETE FROM world_chunks WHERE owner = ? AND token <> ? AND EXISTS (SELECT 1 FROM world_checkpoints WHERE owner = ? AND token = ?)').bind(owner,token,owner,token)];
  const results=await env.DB.batch(statements);if(!results[0].results?.length)return json({available:true,conflict:true,message:'Another session saved first. Load its checkpoint or export this local world before choosing a version.'},409);
  return json({available:true,revision:revision+1,checkpointToken:token,updatedAt:stamp,message:'World and individual brains checkpointed.'});
 }catch{return json({available:false,message:'Cloud checkpoint storage is not ready. Local saves and exports remain available.'},503);}
}
