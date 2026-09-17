import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
const memory=new Map();
globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
const store=await import('./store.js');
const model=await import('./model.js');
const {createSeed,DEMO_VERSION}=await import('./data.js');
const views=await import('./views.js');
beforeEach(()=>{memory.clear();store.replaceState(createSeed());});
const total=()=>store.state.members.reduce((s,m)=>s+m.stars,0)+store.state.challenges.reduce((s,c)=>s+c.reserved,0);
const post=id=>store.state.posts.find(p=>p.id===id);
const outsider=()=>store.state.members.push({...store.member('lea'),id:'visitor',name:'Demo visitor',family:undefined});

test('all eleven family personas have the requested ages, themes and child controls',()=>{
  assert.equal(store.state.members.length,11);
  for(const [id,age] of [['ada',7],['linus',11],['pascal',12],['dad',44]])assert.equal(store.member(id).age,age);
  assert.equal(store.member('ada').theme,'rainbow');
  for(const id of ['ada','linus','pascal']){assert.equal(store.member(id).parent,'dad');assert.equal(store.member(id).verified,false);assert.equal(model.allowed('messages',id),true);}
  assert(store.state.posts.length>=50);assert(store.state.messages.length>=100);
  assert(store.state.posts.filter(p=>p.type==='poll').length>=6);
  for(const member of store.state.members){assert(store.state.posts.filter(p=>p.author===member.id).length>=3);assert(store.state.messages.some(m=>m.from===member.id));}
});
test('the connection graph matches every requested exception in both directions',()=>{
  const core=['dad','lea','ada','linus','pascal'];
  const blocked=(a,b)=>a==='christina'&&!core.includes(b)||b==='christina'&&!core.includes(a)||['claude','nathalie'].includes(a)&&['suzanne','denis'].includes(b)||['claude','nathalie'].includes(b)&&['suzanne','denis'].includes(a);
  assert.equal(store.state.connections.length,46);
  for(const a of store.state.members)for(const b of store.state.members)if(a!==b){assert.equal(store.connected(a.id,b.id),!blocked(a.id,b.id),`${a.id}/${b.id}`);assert.equal(model.canMessage(a.id,b.id),!blocked(a.id,b.id));}
});
test('seed interactions only come from people in the intended audience',()=>{
  for(const p of store.state.posts){
    assert(store.member(p.author)&&store.member(p.wall));assert(store.connected(p.author,p.wall));
    for(const id of [...p.likes,...p.comments.map(c=>c.author),...Object.keys(p.votes||{})])assert(store.canSeePost(p,id),`${id} cannot interact with ${p.id}`);
    if(p.votes)for(const choice of Object.values(p.votes))assert(p.options[choice]);
    if(p.type==='photo')assert(p.caption&&p.creditUrl);
  }
  for(const m of store.state.messages)assert(model.canMessage(m.from,m.to),m.id);
  for(const c of store.state.challenges)for(const e of c.entries)assert(store.canSeePost(post(c.post),e.author));
});
test('all seeded Star balances reconcile, including gifts, reserved prizes and the completed challenge',()=>{
  for(const m of store.state.members){assert.equal(store.state.ledger.filter(l=>l.member===m.id).reduce((s,l)=>s+l.amount,0),m.stars);assert(m.stars>=0);}
  const opening=store.state.ledger.filter(l=>l.id.startsWith('opening-')).reduce((sum,l)=>sum+l.amount,0);
  assert.equal(total(),opening);
  const won=store.state.challenges.find(c=>c.id==='maths-explain');assert.equal(won.winner,'pascal');assert.equal(won.reserved,0);assert.equal(won.status,'awarded');
});
test('household homework, pending wall posts and excluded connections remain private',()=>{
  store.state.current='christina';assert.equal(store.canSeePost(post('dad-today')),false);assert.equal(store.canSeePost(post('denis-questions')),false);assert(!store.feedPosts().some(p=>p.pending||p.author==='cielo'));
  store.state.current='claude';assert.equal(store.canSeePost(post('suzanne-yoga')),false);assert.equal(store.canSeePost(post('denis-questions')),false);assert.equal(store.canSeePost(post('pascal-maths')),true);
  store.state.current='ada';assert.equal(store.canSeePost(post('dad-today')),true);assert.equal(store.canSeePost(post('pending-ada')),true);
});
test('private fields are excluded from unrelated viewers',()=>{
  assert.equal(store.visibleField('pascal','email'),false);store.member('pascal').privacy.email='connections';assert.equal(store.visibleField('pascal','email'),true);
  store.state.current='christina';assert.equal(store.visibleField('cielo','bio'),false);
});
test('Star gifts debit and credit once while conserving the total',()=>{
  const before=total(),giver=store.current().stars,receiver=store.member('ada').stars;model.gift('ada-golden',25);
  assert.equal(store.current().stars,giver-25);assert.equal(store.member('ada').stars,receiver+25);assert.equal(total(),before);
});
test('invalid, excessive and self gifts leave balances unchanged',()=>{
  const before=total();for(const amount of [-1,0,1.5,store.current().stars+1,NaN])assert.throws(()=>model.gift('ada-golden',amount));assert.throws(()=>model.gift('dad-today',10));assert.equal(total(),before);
});
test('a new challenge reserves Stars, closes on its deadline and awards once',()=>{
  const before=total(),balance=store.current().stars;
  const p=model.createPost({type:'challenge',text:'Describe an original small project.',audience:'family',challenge:{title:'One small project',format:'text',deadline:new Date(Date.now()+86400000).toISOString().slice(0,10),criteria:'Clarity and effort.',prize:75}});
  const c=store.state.challenges.find(c=>c.id===p.challenge);assert.equal(store.current().stars,balance-75);assert.equal(total(),before);
  store.state.current='ada';model.submitEntry(c.id,{text:'I made the unicorn move.'});assert.throws(()=>model.submitEntry(c.id,{text:'A second entry.'}));assert.throws(()=>model.settleChallenge(c.id,c.entries[0].id));
  store.state.current='dad';assert.throws(()=>model.settleChallenge(c.id,c.entries[0].id));store.state.timeOffset=3*86400000;
  const winnerBefore=store.member('ada').stars;model.settleChallenge(c.id,c.entries[0].id);assert.equal(c.status,'awarded');assert.equal(c.reserved,0);assert.equal(store.member('ada').stars,winnerBefore+75);assert.equal(total(),before);assert.throws(()=>model.settleChallenge(c.id,c.entries[0].id));
});
test('cancellation refunds the reserved prize exactly once',()=>{
  const before=total(),balance=store.current().stars;model.settleChallenge('cscs-step',null,'No qualifying entry in this demo.');assert.equal(store.current().stars,balance+60);assert.equal(total(),before);assert.throws(()=>model.settleChallenge('cscs-step',null,'Again'));
});
test('the mask challenge requires an image and rejects late entries',()=>{
  store.state.current='ada';assert.throws(()=>model.submitEntry('mask-pattern',{text:'A caption only'}));model.submitEntry('mask-pattern',{text:'My drawing',media:'data:image/png;base64,abc',mediaType:'image'});store.state.current='linus';store.state.timeOffset=8*86400000;assert.throws(()=>model.submitEntry('mask-pattern',{text:'Late',media:'data:image/png;base64,abc',mediaType:'image'}));
});
test('new wall posts publish directly and reach only the author, owner and shared connections',()=>{
  store.state.current='christina';
  const p=model.createPost({wall:'dad',type:'text',text:'Lunch is ready for the family.',audience:'connections'});
  assert.equal(p.pending,false);
  for(const viewer of store.state.members){
    store.state.current=viewer.id;
    const expected=['dad','christina','lea','ada','linus','pascal'].includes(viewer.id);
    assert.equal(store.canSeePost(p),expected,viewer.name);
    assert.equal(store.feedPosts().some(x=>x.id===p.id),expected,viewer.name+' feed');
    assert.equal(views.profile('dad').includes('data-post="'+p.id+'"'),expected,viewer.name+' wall');
    if(!expected)assert.throws(()=>model.gift(p.id,1));
  }
});
test('shared-wall access requires both connections, even when only the author is known',()=>{
  store.state.current='claude';
  const p=model.createPost({wall:'dad',type:'text',text:'A note for Danny.',audience:'connections'});
  store.state.current='denis';assert.equal(store.canSeePost(p),false);
  outsider();store.state.connections.push(['visitor','claude']);
  assert.equal(store.canSeePost(p,'visitor'),false);
  assert.equal(store.canSeePost(p,'missing-member'),false);
  store.state.connections.push(['visitor','dad']);assert.equal(store.canSeePost(p,'visitor'),true);
  store.state.connections=store.state.connections.filter(pair=>!pair.includes('claude')||!pair.includes('visitor'));
  assert.equal(store.canSeePost(p,'visitor'),false);
  store.state.current='christina';assert.throws(()=>model.createPost({wall:'claude',type:'text',text:'No connection.',audience:'connections'}));
});
test('household restrictions remain in force on shared walls',()=>{
  store.state.current='ada';const p=model.createPost({wall:'dad',type:'text',text:'My household homework.',audience:'family'});
  assert(store.canSeePost(p,'pascal'));assert.equal(store.canSeePost(p,'christina'),false);assert.equal(store.canSeePost(p,'denis'),false);
});
test('migration publishes only the unchanged fixture and preserves custom held content',()=>{
  const old=createSeed();delete old.wallPostingVersion;old.current='ada';
  old.posts.find(p=>p.id==='pending-ada').pending=true;
  old.posts.push({...old.posts.find(p=>p.id==='pending-ada'),id:'custom-held',text:'Keep this held.',pending:true});
  const before=structuredClone(old);memory.set(store.DEMO_KEY,JSON.stringify(old));
  const migrated=store.loadState();assert.equal(migrated.wallPostingVersion,1);
  before.wallPostingVersion=1;before.posts.find(p=>p.id==='pending-ada').pending=false;
  assert.deepEqual(migrated,before);assert.deepEqual(store.loadState(),migrated);
  const edited=createSeed();delete edited.wallPostingVersion;
  Object.assign(edited.posts.find(p=>p.id==='pending-ada'),{text:'My edited submission.',pending:true});
  store.replaceState(edited);assert.equal(post('pending-ada').pending,true);
});
test('older held posts remain private until their owner publishes them',()=>{
  const held={...post('pending-ada'),id:'legacy-held',pending:true};store.state.posts.push(held);
  store.state.current='ada';assert.throws(()=>model.approveWall(held.id,true));assert(!store.feedPosts().some(p=>p.id===held.id));
  store.state.current='pascal';assert.equal(store.canSeePost(held),false);
  store.state.current='dad';const before=held.created;model.approveWall(held.id,true);assert.equal(held.pending,false);assert(held.created>before);assert(store.feedPosts().some(p=>p.id===held.id));
});
test('replies and challenge submissions do not reveal content from unknown people',()=>{
  const p=post('ada-golden');p.comments.push({author:'denis',text:'PRIVATE-DENIS-REPLY',created:p.created},{author:'dad',text:'VISIBLE-DANNY-REPLY',created:p.created});
  store.state.current='christina';const html=views.profile('ada');assert(!html.includes('PRIVATE-DENIS-REPLY'));assert(html.includes('VISIBLE-DANNY-REPLY'));
  const c=store.state.challenges.find(c=>store.canSeePost(post(c.post)));
  c.entries.push({id:'privacy-entry',author:'denis',text:'PRIVATE-DENIS-ENTRY',created:p.created});
  assert(!views.challenge(c.id).includes('PRIVATE-DENIS-ENTRY'));
});
test('a connection outside the household cannot submit a household-only wall post',()=>{
  store.state.current='christina';assert.throws(()=>model.createPost({type:'text',text:'Hello',wall:'dad',audience:'family'}));
});
test('messaging respects connection exclusions and both children’s controls',()=>{
  store.state.current='christina';assert.throws(()=>model.sendMessage('cielo','Hello'));model.sendMessage('dad','Shopping is ready.');store.member('ada').controls.messages=false;assert.throws(()=>model.sendMessage('ada','Hello'));store.state.current='ada';assert.throws(()=>model.sendMessage('dad','Hello'));
});
test('child posting and Star restrictions are enforced',()=>{
  store.state.current='ada';store.current().controls.posting=false;store.current().controls.stars=false;assert.throws(()=>model.createPost({type:'text',text:'Hello',audience:'family'}));assert.throws(()=>model.gift('linus-castle',5));
});
test('new connections require both people and a parent when applicable',()=>{
  outsider();store.state.current='ada';model.pair('visitor');const request=store.state.requests[0];assert.equal(request.parentApproved,false);store.state.current='visitor';assert.throws(()=>model.acceptPair(request.id));request.parentApproved=true;model.acceptPair(request.id);assert(store.connected('ada','visitor'));
});
test('deleting a profile removes its content and connections, but parent deletion is blocked',()=>{
  assert.throws(()=>model.removeAccount());store.state.current='christina';model.removeAccount();assert.equal(store.member('christina'),undefined);assert(!store.state.posts.some(p=>p.author==='christina'));assert(!store.state.messages.some(m=>m.from==='christina'||m.to==='christina'));assert(!store.state.connections.some(pair=>pair.includes('christina')));
});
test('every profile has a chronological feed and renders its member surfaces',()=>{
  for(const member of store.state.members){store.state.current=member.id;const feed=store.feedPosts();assert(feed.every((p,i)=>!i||feed[i-1].created>=p.created));for(const name of ['feed','connections','messages','profile','stars','settings'])assert.equal(typeof views[name](),'string');}
});
test('the new family dataset loads without overwriting the previous generic demo',()=>{
  memory.set('common.demo.v1','{"version":1,"members":[{"id":"alex"}]}');const previous=memory.get('common.demo.v1');assert.equal(store.loadState().version,DEMO_VERSION);store.save();assert.equal(memory.get('common.demo.v1'),previous);assert.equal(JSON.parse(memory.get(store.DEMO_KEY)).current,'dad');
});


test('saved family names migrate once without resetting activity or profile preferences',()=>{
  const old=createSeed();delete old.familyNamesVersion;old.current='ada';
  const legacy={dad:'Dad',ada:'Ada',linus:'Linus',pascal:'Pascal',lea:'Léa',christina:'Christina',suzanne:'Grandma Suzanne',denis:'Grandpa Denis',claude:'Grandpa Claude',nathalie:'Grandma Nathalie',cielo:'Cielo'};
  for(const person of old.members)person.name=legacy[person.id];
  old.members.find(p=>p.id==='lea').initials='LÉ';old.members.find(p=>p.id==='christina').initials='CH';
  old.posts[0].text='Dad, Pascal and Léa thanked Christina and Grandma Suzanne.';
  old.posts[0].comments[0].text='Grandpa Denis, Grandpa Claude and Grandma Nathalie are here.';
  old.posts.find(p=>p.options).options[0]='Pascal’s mask sketches';
  old.messages[0].text='dad can you see my dog poll';
  old.ledger[0].label='Gift from Dad';old.challenges[0].entries[0].text='Pascal helped me';
  old.posts.push({id:'custom-post',author:'ada',wall:'ada',text:'My new drawing 🦄',created:'2026-09-16T00:00:00Z'});
  memory.set('common.theme.profiles.v1','{"ada":"y2k"}');
  memory.set(store.DEMO_KEY,JSON.stringify(old));
  const expected=structuredClone(old);expected.familyNamesVersion=1;
  const corrected=['Danny','Ada','Linus','Pascale','Leah','Kristina','Suzanne','Denis','Claude','Nathalie','Cielo'];
  expected.members.forEach((p,i)=>p.name=corrected[i]);
  expected.members.find(p=>p.id==='lea').initials='LE';expected.members.find(p=>p.id==='christina').initials='KR';
  expected.posts[0].text='Danny, Pascale and Leah thanked Kristina and Suzanne.';
  expected.posts[0].comments[0].text='Denis, Claude and Nathalie are here.';
  expected.posts.find(p=>p.options).options[0]='Pascale’s mask sketches';
  expected.messages[0].text='Danny can you see my dog poll';
  expected.ledger[0].label='Gift from Danny';expected.challenges[0].entries[0].text='Pascale helped me';
  const migrated=store.loadState();assert.deepEqual(migrated,expected);
  assert.deepEqual(JSON.parse(memory.get(store.DEMO_KEY)),expected);
  assert.equal(memory.get('common.theme.profiles.v1'),'{"ada":"y2k"}');
  store.replaceState(structuredClone(old));assert.deepEqual(store.state,expected);
  migrated.messages[0].text='Dad is a role, Danny is my name.';
  memory.set(store.DEMO_KEY,JSON.stringify(migrated));
  assert.deepEqual(store.loadState(),migrated);
});
test('name corrections still load saved activity when browser storage cannot be written',()=>{
  const old=createSeed();delete old.familyNamesVersion;old.current='ada';old.members[0].name='Dad';
  memory.set(store.DEMO_KEY,JSON.stringify(old));
  const original=globalThis.localStorage.setItem;
  globalThis.localStorage.setItem=()=>{throw new Error('Storage blocked');};
  try{const loaded=store.loadState();assert.equal(loaded.current,'ada');assert.equal(loaded.members[0].name,'Danny');assert.deepEqual(loaded.posts,old.posts);}finally{globalThis.localStorage.setItem=original;}
});

test('learning revision corrects saved AoPS and CSES content without discarding custom activity',()=>{
  const old=createSeed();delete old.learningContentVersion;old.current='ada';
  const addedIds=['linus-cses-subarray','pascal-aops-proof','ada-scratch-tests'];
  old.posts=old.posts.filter(p=>!addedIds.includes(p.id));
  old.members.find(p=>p.id==='dad').interests=['Enshrouded','AIops','CSCS'];
  old.posts.find(p=>p.id==='dad-today').text='Today’s little missions:\n• AIops: explain one problem you tried to solve.\n• CSCS: show one exercise and the step you got stuck on.\n• Terraria Complete or Database Inspector: finish one objective and tell us what you learned.\nAn honest attempt counts. Ask for help, then show your own thinking.';
  const ownPost={id:'user-post',author:'ada',wall:'ada',text:'My own new drawing',comments:[],created:'2026-09-16T00:00:00Z',likes:['pascal']};
  old.posts.push(ownPost);old.posts[0].comments.push({author:'ada',text:'My own reply',created:'2026-09-16T00:00:00Z'});
  old.messages.push({id:'user-message',from:'dad',to:'linus',text:'Alops and CSCS tomorrow',created:'2026-09-16T00:00:00Z'});
  const preserve=s=>({current:s.current,connections:s.connections,members:s.members.map(({id,stars,theme,privacy,controls})=>({id,stars,theme,privacy,controls})),posts:s.posts.filter(p=>!addedIds.includes(p.id)).map(({id,likes,votes,gifts,pending})=>({id,likes,votes,gifts,pending})).sort((a,b)=>a.id.localeCompare(b.id)),challenges:s.challenges.map(({id,prize,reserved,status,winner,deadline})=>({id,prize,reserved,status,winner,deadline})),ledger:s.ledger.map(({id,member,amount})=>({id,member,amount}))});
  const before=preserve(structuredClone(old));
  memory.set(store.DEMO_KEY,JSON.stringify(old));memory.set('common.theme.profiles.v1','{"ada":"rainbow"}');
  const saved=store.loadState();assert.equal(saved.learningContentVersion,1);
  assert.deepEqual(preserve(saved),before);
  assert(saved.posts.find(p=>p.id==='dad-today').text.includes('AoPS — Art of Problem Solving'));
  assert.deepEqual(saved.members.find(p=>p.id==='dad').interests,['Enshrouded','AoPS','CSES.fi']);
  assert.equal(saved.messages.find(m=>m.id==='user-message').text,'AoPS and CSES.fi tomorrow');
  assert.deepEqual(saved.posts.find(p=>p.id==='user-post'),ownPost);
  assert(saved.posts.some(p=>p.comments?.some(c=>c.text==='My own reply')));
  for(const id of addedIds)assert.equal(saved.posts.filter(p=>p.id===id).length,1);
  assert.equal(memory.get('common.theme.profiles.v1'),'{"ada":"rainbow"}');
  assert.deepEqual(store.loadState(),saved);
});

