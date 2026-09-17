import {member} from './store.js';
import {now} from './model.js';
export const esc=(value='')=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const icons={feed:'▤',connections:'♧',messages:'✉',me:'▣',star:'☆',connect:'⌁',arrow:'↗',photo:'▧',poll:'▥',challenge:'⚑',lock:'▧'};
export const icon=n=>'<span class="icon" aria-hidden="true">'+(icons[n]||n)+'</span>';
export function avatar(id,size=''){const p=member(id);return '<span aria-hidden="true" class="avatar '+esc(p?.color||'blue')+' '+size+'">'+esc(p?.initials||'?')+'</span>';}
export function personLink(id){return '<a class="person-link" href="#profile/'+esc(id)+'">'+esc(member(id)?.name||'Former member')+'</a>';}
export function time(date){return new Date(date).toLocaleTimeString('en-SG',{hour:'numeric',minute:'2-digit'});}
export function day(date){const d=new Date(date),today=new Date(now());return d.toDateString()===today.toDateString()?'Today':d.toDateString()===new Date(now()-86400000).toDateString()?'Yesterday':d.toLocaleDateString('en-SG',{day:'numeric',month:'short'});}
export function stamp(date){return day(date)+' at '+time(date);}
export const audienceLabel=a=>a==='family'?'Family only':'Connections';
export const button=(label,action,cls='',attrs='')=>'<button class="'+cls+'" data-action="'+action+'" '+attrs+'>'+label+'</button>';
export function heading(eyebrow,title,aside=''){return '<div class="page-heading"><div><div class="eyebrow">'+eyebrow+'</div><h1>'+title+'</h1></div>'+aside+'</div>';}
export function empty(title,body){return '<div class="empty"><span class="empty-mark">—</span><h3>'+title+'</h3><p>'+body+'</p></div>';}
