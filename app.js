import {DEMO_VERSION} from './data.js';
import {themeControl,applyTheme,readTheme,useProfileTheme,THEME_KEY,PROFILE_THEME_KEY} from './themes.js';
import {state,current,member,connected,family,canSeePost,save,reset,uid,replaceState,DEMO_KEY} from './store.js';
import {esc,icon,personLink,button as b,empty} from './ui.js';
import {feed,connections,messages,profile,challenge,stars,settings,about,welcome,ui} from './views.js';
import {allowed,canMessage,gift,createPost,sendMessage,submitEntry,settleChallenge,approveWall,pair,acceptPair,balanceChange,removeAccount,now} from './model.js';
import {showModal,closeModal,formError,composeModal,postExtras,editModal,connectModal,nearbyModal} from './dialogs.js';
const app=document.querySelector('#app'),modal=document.querySelector('#modal');let toastTimer;
const route=()=>(location.hash.slice(1)||'feed').split('/');
export function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),4500);}
function persist(){if(!save())throw new Error('Browser storage is full or unavailable. Remove an attachment, export your data, or reset the demo. Your last change was not saved.');}
function change(fn){const backup=JSON.stringify(state);try{const result=fn();persist();return result;}catch(error){replaceState(JSON.parse(backup));throw error;}}
function refresh(message){closeModal();render();if(message)toast(message);}
function navTo(hash){if(location.hash==='#'+hash)render();else location.hash=hash;}
export function render(){
 const me=current();if(!me){reset();return render();}
 useProfileTheme(me.id,me.theme||'sunny');
 const [page='feed',id]=route(),isPublic=page==='about'||page==='welcome';
 const pending=state.posts.filter(p=>p.wall===me.id&&p.pending).length,requests=state.requests.filter(r=>r.to===me.id).length;
 const section=page==='profile'?(id===me.id?'me':'connections'):['stars','settings'].includes(page)?'me':page;
 const views={feed:()=>feed(),connections:()=>connections(),messages:()=>messages(id),me:()=>profile(),profile:()=>profile(id),challenge:()=>challenge(id),stars:()=>stars(),settings:()=>settings(),about:()=>about(),welcome:()=>welcome()};
 const body=(views[page]||views.feed)();
 document.title=(page==='feed'?'Your feed':page==='profile'?member(id)?.name||'Private profile':page.charAt(0).toUpperCase()+page.slice(1))+' — Same Old Faces';
 app.innerHTML='<div class="demo-bar"><div>FAMILY DEMO <span>Invented conversations based on your personas. Saved here.</span></div>'+(isPublic?'<a href="#feed">Enter member demo →</a>':'<label>Viewing as <select id="profile-switch" aria-label="Switch demo profile">'+state.members.map(p=>'<option value="'+p.id+'" '+(p.id===me.id?'selected':'')+'>'+esc(p.name)+(p.parent?' · '+p.age:'')+'</option>').join('')+'</select></label>')+'</div>'+
 '<header class="masthead"><a href="#feed" class="brand" aria-label="Same Old Faces home">Same Old Faces</a><div class="masthead-actions">'+themeControl()+'</div></header>'+
 '<div class="app-layout '+(isPublic?'public-layout':'member-layout')+'">'+(isPublic?'':'<aside class="left-sidebar"><nav aria-label="Main navigation">'+['Feed','Connections','Messages','Me'].map(n=>'<a href="#'+n.toLowerCase()+'" class="'+(section===n.toLowerCase()?'active':'')+'" '+(section===n.toLowerCase()?'aria-current="page"':'')+'>'+icon(n.toLowerCase())+n+(n==='Me'&&pending?'<span class="count">'+pending+'</span>':n==='Connections'&&requests?'<span class="count">'+requests+'</span>':'')+'</a>').join('')+'</nav><div class="side-bottom"><a href="#about">About Same Old Faces</a><a href="#settings">Membership & settings</a></div></aside>')+'<main id="main" tabindex="-1">'+body+'</main></div>';
 if(page==='messages'){const history=document.querySelector('.chat-history');if(history)history.scrollTop=history.scrollHeight;}
}
document.addEventListener('click',e=>{
 if(e.target.closest('.skip')){e.preventDefault();document.querySelector('#main').focus();document.querySelector('#main').scrollIntoView();return;}
 const target=e.target.closest('[data-action]');if(!target)return;const {action,id,value,wall,entry}=target.dataset;
 try{
 const post=()=>{const p=state.posts.find(p=>p.id===id);if(!p||!canSeePost(p))throw new Error('This post is unavailable.');return p;};
 switch(action){
 case 'choose-theme':{const result=applyTheme(value);toast(result.theme.name+(result.saved?' applied.':' applied for now. Browser storage is unavailable.'));break;}
 case 'enter-demo':navTo('feed');break;
 case 'close':closeModal();break;
 case 'compose':if(!allowed('posting'))throw new Error('A parent has turned off posting for this account.');composeModal(value||'text',wall||state.current);break;
 case 'profile-tab':ui.profileTab=value;render();break;
 case 'like':change(()=>{const p=post();if(p.pending)throw new Error('Wait for wall approval.');p.likes=p.likes.includes(state.current)?p.likes.filter(x=>x!==state.current):[...p.likes,state.current];});render();break;
 case 'vote':change(()=>{const p=post();const v=Number(value);if(p.type!=='poll'||!p.options[v])throw new Error('Invalid poll option.');p.votes[state.current]=v;});render();toast('Your vote is saved.');break;
 case 'reply':showModal('Leave a reply','<p class="help">Visible to people who know you and can see this post.</p><form id="reply-form" data-id="'+post().id+'"><label>Your reply<textarea name="text" required maxlength="2000" rows="3"></textarea></label><label class="check-label"><input type="checkbox" required> Written by me, without generative AI.</label><button class="primary">Post reply</button></form>');break;
 case 'gift':showModal('A little appreciation.','<p>Give Stars to '+personLink(post().author)+'.</p><form id="gift-form" data-id="'+id+'"><label>Stars to give<input type="number" name="amount" min="1" max="'+current().stars+'" step="1" value="10" required></label><p class="help">'+current().stars+' Stars available. Gifts cannot be taken back.</p><button class="primary">Give Stars</button></form>');break;
 case 'approve':change(()=>approveWall(id,true));refresh('Published on your wall.');break;
 case 'decline':change(()=>approveWall(id,false));refresh('The wall submission was declined.');break;
 case 'edit-profile':editModal();break;
 case 'connect':connectModal();break;
 case 'nearby':nearbyModal(id);break;
 case 'request-pair':change(()=>pair(id));refresh('Your confirmation is saved. Switch profiles for the other person to confirm.');navTo('connections');break;
 case 'accept-pair':change(()=>acceptPair(id));render();toast('You’re connected.');break;
 case 'decline-pair':change(()=>{const r=state.requests.find(r=>r.id===id);if(r?.to!==state.current)throw new Error('Not your request.');state.requests=state.requests.filter(r=>r.id!==id);});render();break;
 case 'parent-pair':change(()=>{const r=state.requests.find(r=>r.id===id);if(member(r?.from)?.parent!==state.current)throw new Error('Only the parent can approve.');r.parentApproved=true;});render();toast('Request approved. The other person can now confirm.');break;
 case 'buy-stars':if(current().parent)throw new Error('Only adults can buy Stars.');showModal('Add some Stars.','<form id="purchase-form"><label>How many?<select name="amount" id="purchase-amount"><option value="100">100 Stars · S$1.00</option><option value="500">500 Stars · S$5.00</option><option value="1000">1,000 Stars · S$10.00</option></select></label><div class="notice">Demo purchase. No card details and no real charge. S$0.01 per Star is proposed pricing.</div><button class="primary">Simulate purchase</button></form>');break;
 case 'advance-clock':change(()=>{const c=state.challenges.find(c=>c.id===id);if(c?.judge!==state.current)throw new Error('Only the demo judge can advance the clock.');state.timeOffset=new Date(c.deadline+'T23:59:59+08:00').getTime()+1000-Date.now();});render();toast('Demo time advanced past the deadline. Submissions are closed.');break;
 case 'award':{const c=state.challenges.find(c=>c.id===id),en=c?.entries.find(e=>e.id===entry);showModal('Award the prize?','<p>'+esc(member(en?.author)?.name)+' will receive all '+c?.prize+' reserved Stars. This settles the challenge.</p>'+b('Confirm award','confirm-award','primary','data-id="'+id+'" data-entry="'+entry+'"'));break;}
 case 'confirm-award':change(()=>settleChallenge(id,entry));refresh('Prize awarded. The winner’s Star balance has been updated.');break;
 case 'cancel-challenge':showModal('Return the reserved prize.','<form id="cancel-challenge-form" data-id="'+id+'"><label>Public reason<textarea name="reason" required rows="3" placeholder="Explain the cancellation or why no entry qualifies."></textarea></label><p class="help">The challenge closes and the reserved Stars return to its creator.</p><button class="danger">Close challenge & return Stars</button></form>');break;
 case 'post-options':showModal('Post options','<p>Something doesn’t belong here? A person can review it.</p>'+b('Report this post','report-post','full','data-id="'+post().id+'"'));break;
 case 'report-post':case 'report-entry':showModal('Ask for a human review.','<form id="report-form" data-id="'+id+'"><label>Reason<select name="reason"><option>Suspected AI-generated content</option><option>Harassment or harmful behaviour</option><option>Privacy concern</option><option>Other community-rule concern</option></select></label><label>Tell us more<textarea name="details" rows="3" required maxlength="2000"></textarea></label><p class="help">Demo only: this is stored locally. No moderator will receive it.</p><button class="primary">Save demo report</button></form>');break;
 case 'appeal':showModal('Add context or appeal.','<form id="appeal-form" data-id="'+id+'"><label>Your explanation<textarea name="text" required rows="4" maxlength="2000"></textarea></label><p class="help">Recorded locally for a future human review. No automated decisions.</p><button class="primary">Save appeal</button></form>');break;
 case 'cancel-membership':showModal('Cancel your membership?','<p>Your demo membership will stop renewing. Access remains through the current membership period. No real subscription will be changed.</p>'+b('Confirm cancellation','confirm-cancel-membership','danger'));break;
 case 'confirm-cancel-membership':change(()=>{if(current().parent)throw new Error('Membership is managed by your parent.');current().membership='ends after current period';});refresh('Membership cancellation is saved.');break;
 case 'resume-membership':change(()=>current().membership='active');render();toast('Demo membership resumed.');break;
 case 'export':{const id=state.current,payload={exportedAt:new Date().toISOString(),demo:true,profile:current(),connections:state.connections.filter(p=>p.includes(id)),posts:state.posts.filter(p=>p.author===id||p.wall===id),messages:state.messages.filter(m=>m.from===id||m.to===id),ledger:state.ledger.filter(l=>l.member===id),reports:state.reports.filter(r=>r.reporter===id),challenges:state.challenges.filter(c=>c.creator===id||c.entries.some(e=>e.author===id))};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='same-old-faces-'+id+'-export.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Your account export has been downloaded.');break;}
 case 'delete-account':showModal('Delete this demo account?','<form id="delete-form"><p>This removes '+esc(current().name)+'’s profile, posts, connections and messages from this browser. Parents must remove or transfer child accounts first. You can restore the original fictional accounts using Reset all demo data.</p><label>Type DELETE to confirm<input name="confirm" required pattern="DELETE" autocomplete="off"></label><button class="danger">Delete this demo account</button></form>');break;
 case 'reset':showModal('Start fresh?','<p>This clears your local changes and restores the family demo profiles, posts and Star balances.</p>'+b('Reset all demo data','confirm-reset','danger'));break;
 case 'confirm-reset':reset();ui.query='';ui.city='';ui.profileTab='wall';refresh('Family demo restored.');navTo('feed');break;
 }
 }catch(error){if(!formError(error.message))toast(error.message);}
});
document.addEventListener('change',e=>{
 if(e.target.matches('[data-theme-select]')){const result=applyTheme(e.target.value);toast(result.theme.name+(result.saved?' applied.':' applied for now. Browser storage is unavailable.'));}
 if(e.target.type==='file'&&e.target.closest('#message-form')){const label=e.target.closest('label')?.querySelector('span');if(label)label.textContent=e.target.files?.[0]?.name||'Photo / video';}
 if(e.target.id==='profile-switch'){try{change(()=>state.current=e.target.value);ui.profileTab='wall';ui.query='';ui.city='';closeModal();navTo('feed');render();toast('Now viewing as '+current().name+'.');}catch(error){toast(error.message);}}
 if(e.target.id==='post-type'){document.querySelector('#post-extras').innerHTML=postExtras(e.target.value);document.querySelector('#text-label').textContent=e.target.value==='challenge'?'The task':'What would you like to share?';const form=document.querySelector('#post-form');form.querySelector('button[type=submit],.modal-footer button').textContent=e.target.value==='challenge'?'Reserve Stars & open':'Publish post';}
});
async function attachment(form){const file=form.querySelector('input[type=file]')?.files?.[0];if(!file)return {};if(file.size>1.5*1024*1024)throw new Error('This demo supports attachments up to 1.5 MB. Choose a smaller file.');if(!['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm'].includes(file.type))throw new Error('Choose a JPG, PNG, WebP, GIF, MP4 or WebM file.');const media=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('The file could not be read.'));reader.readAsDataURL(file);});return {media,mediaType:file.type.startsWith('video/')?'video':'image'};}
document.addEventListener('submit',async e=>{
 const form=e.target;if(!(form instanceof HTMLFormElement))return;e.preventDefault();if(form.dataset.busy)return;form.dataset.busy='true';const data=new FormData(form),get=key=>String(data.get(key)||'').trim(),id=form.dataset.id,actor=state.current;
 const submit=form.querySelector('button[type=submit],button:not([type])');if(submit)submit.disabled=true;
 try{
 switch(form.id||form.className){
 case 'search-form':ui.query=get('query');ui.city=get('city');render();break;
 case 'post-form':{const file=await attachment(form);if(actor!==state.current)throw new Error('Profile changed. Please reopen the post form.');const created=change(()=>createPost({type:get('type'),wall:form.dataset.wall,audience:get('audience'),text:get('text'),options:get('options').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,6),...file,challenge:{title:get('title'),format:get('format'),deadline:get('deadline'),criteria:get('criteria'),prize:Number(get('prize'))}}));refresh(created.type==='challenge'?'Challenge opened. Prize reserved.':'Your post is published.');if(created.challenge)navTo('challenge/'+created.challenge);break;}
 case 'profile-form':change(()=>{for(const key of ['bio','interests','city','email','phone','whatsapp']){if(!data.has(key))continue;current()[key]=key==='interests'?get(key).split(',').map(s=>s.trim()).filter(Boolean):get(key);current().privacy[key]=get(key+'Privacy');}});refresh('Profile and visibility saved.');break;
 case 'reply-form':change(()=>{const p=state.posts.find(p=>p.id===id);if(!p||p.pending||!canSeePost(p)||!allowed('posting'))throw new Error('Replies are not available for this account or post.');p.comments.push({author:state.current,text:get('text'),created:new Date(now()).toISOString()});});refresh('Your reply is posted.');break;
 case 'gift-form':change(()=>gift(id,Number(get('amount'))));refresh('Stars sent. Both balances are updated.');break;
 case 'message-form':{const file=await attachment(form);if(actor!==state.current)throw new Error('Profile changed. Please try again.');change(()=>sendMessage(form.dataset.to,get('text'),file.media,file.mediaType));render();toast('Message sent.');break;}
 case 'entry-form':{const file=await attachment(form);if(actor!==state.current)throw new Error('Profile changed. Please try again.');change(()=>submitEntry(id,{text:get('text'),...file}));render();toast('Your entry is submitted.');break;}
 case 'cancel-challenge-form':change(()=>settleChallenge(id,null,get('reason')));refresh('Challenge closed. Prize returned.');break;
 case 'purchase-form':change(()=>{if(current().parent)throw new Error('Only an adult can purchase Stars.');const amount=Number(get('amount'));if(![100,500,1000].includes(amount))throw new Error('Choose a listed purchase amount.');balanceChange(state.current,amount,'Demo purchase · S$'+(amount*.01).toFixed(2));});refresh('Demo Stars added. No charge was made.');break;
 case 'family-form':change(()=>{const child=member(id);if(child?.parent!==state.current)throw new Error('Only the parent can change these controls.');for(const key of ['messages','connections','stars','posting'])child.controls[key]=data.has(key);});render();toast('Parental controls saved.');break;
 case 'report-form':change(()=>state.reports.push({id:uid('report'),target:id,reporter:state.current,reason:get('reason'),details:get('details'),status:'Awaiting human review · demo',created:new Date().toISOString()}));refresh('Demo report saved. Find it under Membership & settings.');break;
 case 'appeal-form':change(()=>{const report=state.reports.find(r=>r.id===id&&r.reporter===state.current);if(!report)throw new Error('Report unavailable.');report.appeal=get('text');report.status='Appeal awaiting human review · demo';});refresh('Your appeal is saved locally.');break;
 case 'join-form':{const id=uid('member');change(()=>{const name=get('name');const privacy=Object.fromEntries(['bio','city','occupation','email','phone','whatsapp','interests'].map(k=>[k,'me']));state.members.push({id,name,initials:name.split(/\s+/).map(n=>n[0]).slice(0,2).join('').toUpperCase(),color:'blue',bio:'',city:get('city'),occupation:'',email:'',phone:'',whatsapp:'',interests:[],privacy,verified:true,stars:0,plan:get('plan'),membership:'active',...(get('plan')==='family'?{family:id}:{})});state.current=id;balanceChange(id,100,'Joining allowance · demo membership');});navTo('me');render();toast('Welcome to Same Old Faces. Complete your profile, then connect in person.');break;}
 case 'delete-form':if(get('confirm')!=='DELETE')throw new Error('Type DELETE to confirm.');change(()=>removeAccount());refresh('Demo account deleted.');navTo('feed');break;
 }
 }catch(error){if(!formError(error.message))toast(error.message);}
 finally{delete form.dataset.busy;if(submit)submit.disabled=false;}
});
window.addEventListener('hashchange',()=>{closeModal();render();window.scrollTo(0,0);});
window.addEventListener('storage',e=>{if(e.key===DEMO_KEY&&e.newValue){try{const fresh=JSON.parse(e.newValue);if(fresh.version===DEMO_VERSION){replaceState(fresh);closeModal();render();}}catch{}}});
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
render();

// Keep appearance in sync with other Same Old Faces tabs, without replacing page content.
window.addEventListener('storage',event=>{if(event.key===THEME_KEY||event.key===PROFILE_THEME_KEY||event.key===null)applyTheme(readTheme().id,{persist:false});});
