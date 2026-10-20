import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {createApp} from '../worker/index.js';
const root=new URL('../',import.meta.url);
http.createServer(async(req,res)=>{try{
 const engine=(await readFile(new URL('sim/engine.js',root),'utf8')).replaceAll(/^export /gm,'');
 const page=(await readFile(new URL('ui/index.html',root),'utf8')).replace('/*__ENGINE__*/',engine);
 if(req.url==='/__qa/mobile'){res.writeHead(200,{'Content-Type':'text/html'});res.end(await readFile(new URL('ui/responsive-preview.html',root)));return;}
 const init={method:req.method,headers:req.headers};if(!['GET','HEAD'].includes(req.method)){const chunks=[];let size=0;for await(const c of req){size+=c.length;if(size>20000){res.writeHead(413);res.end();return;}chunks.push(c);}init.body=Buffer.concat(chunks);init.duplex='half';}
 const response=await createApp(page).fetch(new Request('http://'+(req.headers.host||'localhost:4173')+req.url,init),{});
 res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(500);res.end('Preview unavailable');}
}).listen(4173,'0.0.0.0',()=>console.log('Doodleworld preview ready on 4173'));
