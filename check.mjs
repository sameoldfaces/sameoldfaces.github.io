import {readdir,readFile,access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createPreviewServer} from './server.mjs';
const root=new URL('./',import.meta.url);
const scripts=(await readdir(root)).filter(f=>f.endsWith('.js')||f.endsWith('.mjs'));
for(const file of scripts){
  const result=spawnSync(process.execPath,['--check',fileURLToPath(new URL(file,root))],{stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status)process.exit(result.status);
}
const staticFiles=['index.html','styles.css','themes.css',...scripts.filter(f=>f.endsWith('.js')),'assets/garden.jpg','assets/golden-retriever.jpg','assets/corgi.jpg'];
for(const file of [...staticFiles,'.nojekyll'])await access(new URL(file,root));
const html=await readFile(new URL('index.html',root),'utf8');
assert(html.includes('name="viewport"')&&html.includes('rel="icon"'));
assert(!/(?:src|href)="\/(?!\/)/.test(html),'Entrypoint asset paths must be relative for GitHub Pages.');
for(const basePath of ['/','/common/']){
  const server=createPreviewServer({basePath});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const origin='http://127.0.0.1:'+server.address().port;
  try{
    for(const file of staticFiles){
      const response=await fetch(origin+basePath+(file==='index.html'?'':file));
      assert.equal(response.status,200,basePath+file+' must load');
      if(file.endsWith('.js'))assert(response.headers.get('content-type').includes('javascript'));
      if(file.endsWith('.css'))assert(response.headers.get('content-type').includes('text/css'));
      await response.arrayBuffer();
    }
    if(basePath!=='/'){
      const redirect=await fetch(origin+basePath.slice(0,-1),{redirect:'manual'});
      assert.equal(redirect.status,308);
      assert.equal(redirect.headers.get('location'),basePath);
    }
    console.log('Static entrypoint, modules and photograph passed at '+basePath);
  }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
}
console.log('Syntax and GitHub Pages root/project-path checks passed.');
