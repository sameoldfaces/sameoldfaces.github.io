import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';

const root = fileURLToPath(new URL('./', import.meta.url));
const previewId = createHash('sha256').update(root).digest('hex').slice(0,16);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.gif':'image/gif','.mp4':'video/mp4','.webm':'video/webm'};

// The same static site can be mounted at / or at a GitHub Pages project path.
export function createPreviewServer({basePath='/'}={}) {
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(basePath)) throw new Error('Base path must look like / or /common/.');
  return http.createServer(async (req,res) => {
    try {
      if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405,{'Allow':'GET, HEAD'}); return res.end(); }
      const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      if (basePath!=='/' && pathname===basePath.slice(0,-1)) {res.writeHead(308,{'Location':basePath});return res.end();}
      if (!pathname.startsWith(basePath)) {res.writeHead(404);return res.end('Not found');}
      const relative = pathname.slice(basePath.length);
      const name = relative===''?'index.html':relative;
      const file = path.resolve(root,name);
      const relativeFile = path.relative(root,file);
      if (relativeFile.startsWith('..') || path.isAbsolute(relativeFile)) {res.writeHead(403);return res.end('Forbidden');}
      const type=types[path.extname(file).toLowerCase()];
      if(!type){res.writeHead(404);return res.end('Not found');}
      const body=await readFile(file);
      res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','X-Common-Preview':previewId});
      res.end(req.method==='HEAD'?undefined:body);
    } catch {res.writeHead(404);res.end('Not found');}
  });
}

function openBrowser(url){
  const command=process.platform==='win32'?'cmd.exe':process.platform==='darwin'?'open':'xdg-open';
  const args=process.platform==='win32'?['/d','/c','start','',url]:[url];
  const child=spawn(command,args,{windowsHide:true,stdio:'ignore'});
  child.on('error',()=>console.log('Open this address in your browser: '+url));
  child.unref();
}

async function main(){
  const args=process.argv.slice(2);
  const argument=name=>args.includes(name)?args[args.indexOf(name)+1]:undefined;
  const port=Number(argument('--port')||process.env.PORT||4173);
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Choose a port between 1 and 65535.');
  const basePath=argument('--base-path')||'/';
  const url='http://127.0.0.1:'+port+basePath;
  const shouldOpen=args.includes('--open')&&!args.includes('--no-open');
  const server=createPreviewServer({basePath});
  server.on('error',async error=>{
    if(error.code==='EADDRINUSE'){
      try {
        const response=await fetch(url,{signal:AbortSignal.timeout(2000)});
        if(response.headers.get('X-Common-Preview')===previewId){
          console.log('Same Old Faces is already running at '+url);
          if(shouldOpen)openBrowser(url);
          return;
        }
      }catch{}
      console.error('Port '+port+' is used by another application. Run start.cmd --port '+(port===65535?4173:port+1)+' to choose another port.');
    }else console.error('Unable to start the server: '+error.message);
    process.exitCode=1;
  });
  server.listen(port,'127.0.0.1',()=>{
    console.log('Serving: '+root);
    console.log('Same Old Faces is ready at '+url);
    console.log('Keep this window open. Press Ctrl+C to stop the server.');
    if(shouldOpen)openBrowser(url);
  });
}

if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){
  main().catch(error=>{console.error(error.message);process.exitCode=1;});
}
