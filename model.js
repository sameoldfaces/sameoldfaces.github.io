import {state,current,member,connected,family,canSeePost,uid} from './store.js';
export function now(){return Date.now()+(state.timeOffset||0);}
const date=()=>new Date(now()).toISOString();
function assert(condition,message){if(!condition)throw new Error(message);}
export function allowed(action,id=state.current){const p=member(id);return !!p&&(!p.parent||p.controls?.[action]!==false);}
export function canMessage(a,b){return a!==b&&connected(a,b)&&allowed('messages',a)&&allowed('messages',b);}
export function balanceChange(id,amount,label){const m=member(id);assert(m,'Member unavailable.');assert(Number.isSafeInteger(amount)&&m.stars+amount>=0,'Not enough Stars.');m.stars+=amount;state.ledger.unshift({id:uid('ledger'),member:id,amount,label,created:date()});}
export function gift(postId,amount){const p=state.posts.find(p=>p.id===postId);assert(p&&canSeePost(p)&&!p.pending,'This post is private.');assert(p.author!==state.current,'You cannot give Stars to your own post.');assert(allowed('stars'),'A parent has turned off Star transfers.');assert(Number.isSafeInteger(amount)&&amount>0,'Enter a whole number of Stars greater than zero.');assert(current().stars>=amount,'You do not have enough Stars.');balanceChange(state.current,-amount,'Gift to '+member(p.author).name);balanceChange(p.author,amount,'Gift from '+current().name);p.gifts+=amount;}
export function createPost(data){
 assert(allowed('posting'),'A parent has turned off posting.');assert(['text','photo','poll','challenge'].includes(data.type),'Choose a post type.');
 const wall=data.wall||state.current;assert(member(wall)&&connected(wall,state.current),'Connect in person before posting on this wall.');
 assert(['connections','family'].includes(data.audience),'Choose an audience.');assert(data.audience!=='family'||family(wall,state.current),'You are not part of this family.');
 assert(data.text?.trim(),'Write something before posting.');assert(data.text.length<=5000,'Keep posts under 5,000 characters.');
 assert(data.type!=='photo'||data.media,'Choose a picture or video.');assert(data.type!=='poll'||data.options?.length>=2,'Add at least two poll options.');
 assert(data.type!=='challenge'||wall===state.current,'Start challenges on your own wall.');
 const post={id:uid('post'),author:state.current,wall,text:data.text.trim(),type:data.type,audience:data.audience,created:date(),likes:[],gifts:0,comments:[],pending:false,...(data.media?{media:data.media,mediaType:data.mediaType,alt:data.alt||data.text}:{}),...(data.type==='poll'?{options:data.options,votes:{}}:{})};
 if(data.type==='challenge'){
 assert(allowed('stars'),'A parent has turned off Star transfers.'); const c=data.challenge;
 assert(c.title?.trim()&&c.criteria?.trim(),'Add a title and judging criteria.');assert(['text','image','video'].includes(c.format),'Choose a submission format.');
 assert(new Date(c.deadline+'T23:59:59+08:00').getTime()>now(),'Choose a future deadline.');
 assert(Number.isSafeInteger(c.prize)&&c.prize>0&&c.prize<=current().stars,'Choose a prize within your Star balance.');
 const challenge={id:uid('challenge'),post:post.id,creator:state.current,judge:state.current,title:c.title.trim(),task:post.text,format:c.format,deadline:c.deadline,criteria:c.criteria.trim(),prize:c.prize,reserved:c.prize,status:'open',entries:[],rules:'One entry per person. Entry is free. One judge, one winner. Ties go to the earliest qualifying entry. Cancellation or no qualifying entries returns the prize to the creator. Rules lock after the first entry.'};
 balanceChange(state.current,-c.prize,'Reserved: '+challenge.title);post.challenge=challenge.id;state.challenges.push(challenge);
 }
 state.posts.unshift(post);return post;
}
export function challengeVisible(c){const p=state.posts.find(p=>p.id===c?.post);return !!p&&canSeePost(p)&&!p.pending;}
export function deadlinePassed(c){return now()>new Date(c.deadline+'T23:59:59+08:00').getTime();}
export function submitEntry(id,{text,media,mediaType}){
 const c=state.challenges.find(c=>c.id===id);assert(c&&challengeVisible(c),'This challenge is private.');
 assert(c.status==='open'&&!deadlinePassed(c),'Submissions have closed.');assert(c.creator!==state.current,'The judge cannot enter their own challenge.');assert(allowed('posting'),'A parent has turned off posting.');
 assert(!c.entries.some(e=>e.author===state.current),'You have already entered.');assert(text?.trim(),'Add your submission or caption.');
 const expected=c.format==='text'?'text':c.format==='video'?'video':'image';
 assert(expected==='text'||media&&mediaType===expected,'Add the required '+expected+'.');
 c.entries.push({id:uid('entry'),author:state.current,text:text.trim(),media,mediaType,created:date()});
}
export function settleChallenge(id,entryId,reason=''){
 const c=state.challenges.find(c=>c.id===id);assert(c&&c.judge===state.current,'Only the named judge can settle this challenge.');assert(c.status==='open','This prize has already been settled.');
 if(entryId){assert(deadlinePassed(c),'Wait until the deadline to choose a winner.');const e=c.entries.find(e=>e.id===entryId);assert(e,'Choose a valid entry.');balanceChange(e.author,c.reserved,'Won: '+c.title);c.winner=e.author;c.winnerEntry=e.id;c.status='awarded';}
 else{assert(reason.trim(),'Publish a reason for returning the prize.');balanceChange(c.creator,c.reserved,'Returned: '+c.title);c.status='cancelled';c.reason=reason.trim();}
 c.reserved=0;c.settled= date();
}
export function sendMessage(to,text,media,mediaType){assert(canMessage(state.current,to),'Messaging is available only between permitted connections.');assert(text?.trim()||media,'Write a message or add a picture or video.');state.messages.push({id:uid('message'),from:state.current,to,text:text.trim(),media,mediaType,created:date()});}
export function approveWall(id,approve){const p=state.posts.find(p=>p.id===id);assert(p&&p.wall===state.current&&p.pending,'This post is not awaiting your approval.');if(approve){p.pending=false;p.created=date();}else{state.posts=state.posts.filter(p=>p.id!==id);}}
export function pair(to){assert(member(to)&&to!==state.current&&!connected(to,state.current),'Choose a person you are not connected to.');assert(!state.requests.some(r=>r.from===state.current&&r.to===to||r.to===state.current&&r.from===to),'A request is already waiting.');state.requests.push({id:uid('request'),from:state.current,to,status:'pending',parentApproved:!current().parent||allowed('connections'),created:date()});}
export function acceptPair(id){const r=state.requests.find(r=>r.id===id);assert(r&&r.to===state.current,'Only the recipient can accept.');assert(r.parentApproved,'A parent must approve this request first.');assert(!current().parent||allowed('connections'),'A parent needs to approve new connections.');if(!connected(r.from,r.to))state.connections.push([r.from,r.to]);state.requests=state.requests.filter(x=>x.id!==id);}
export function removeAccount(){
 const id=state.current;assert(state.members.length>1,'Reset the demo instead of deleting its last member.');assert(!state.members.some(m=>m.parent===id),'Transfer or remove child accounts before deleting the parent account.');
 for(const c of state.challenges.filter(c=>c.status==='open'&&(c.creator===id||c.judge===id))){balanceChange(c.creator,c.reserved,'Returned on account deletion');c.reserved=0;c.status='cancelled';c.reason='Creator account deleted.';}
 state.members=state.members.filter(m=>m.id!==id);state.connections=state.connections.filter(p=>!p.includes(id));state.posts=state.posts.filter(p=>p.author!==id&&p.wall!==id);
 state.messages=state.messages.filter(m=>m.from!==id&&m.to!==id);state.ledger=state.ledger.filter(l=>l.member!==id);state.requests=state.requests.filter(r=>r.from!==id&&r.to!==id);state.reports=state.reports.filter(r=>r.reporter!==id);
 state.challenges=state.challenges.filter(c=>c.creator!==id).map(c=>({...c,entries:c.entries.filter(e=>e.author!==id)}));for(const p of state.posts){p.likes=p.likes.filter(x=>x!==id);p.comments=p.comments.filter(c=>c.author!==id);if(p.votes)delete p.votes[id];}
 state.current=state.members[0]?.id;assert(state.current,'At least one demo profile is required. Reset the demo instead.');
}
