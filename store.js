import {createSeed,DEMO_VERSION,migrateFamilyDemo} from './data.js';
export const DEMO_KEY='common.demo.v2';
const KEY=DEMO_KEY;
export function loadState(){
  try {
    const value=JSON.parse(localStorage.getItem(KEY));
    if(value?.version===DEMO_VERSION && value.members?.length){
      if(migrateFamilyDemo(value)){try{localStorage.setItem(KEY,JSON.stringify(value));}catch{}}
      return value;
    }
  }catch{}
  return createSeed();
}
export let state=loadState();
export function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{return false;}}
export function reset(){state=createSeed();save();}
export function member(id){return state.members.find(m=>m.id===id);}
export function current(){return member(state.current);}
export function connected(a,b){return a===b||state.connections.some(pair=>pair.includes(a)&&pair.includes(b));}
export function family(a,b){return !!member(a)?.family && member(a).family===member(b)?.family;}
export function visibleField(owner,field,viewer=state.current){const p=member(owner)?.privacy[field]||'me';return owner===viewer || p==='connections'&&connected(owner,viewer)||p==='family'&&family(owner,viewer);}
export function canSeePost(post,viewer=state.current){
  if(!post||!member(viewer)||!member(post.author)||!member(post.wall))return false;
  if(post.author===viewer||post.wall===viewer)return true;
  if(post.pending||!connected(post.author,viewer)||!connected(post.wall,viewer))return false;
  return post.audience==='connections'||post.audience==='family'&&family(post.wall,viewer);
}
export function feedPosts(){return state.posts.filter(p=>!p.pending&&canSeePost(p)&&connected(p.wall,state.current)).sort((a,b)=>b.created.localeCompare(a.created));}
export function uid(prefix='id'){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);}

export function replaceState(value){migrateFamilyDemo(value);state=value;}
