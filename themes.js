// Appearance is saved per demo profile on this device, separate from member data and resets.
export const THEME_KEY = 'common.theme.v1';
export const DEFAULT_THEME = 'sunny';
export const PROFILE_THEME_KEY = 'common.theme.profiles.v1';
let activeProfile=null,profileDefault=DEFAULT_THEME;
function profilePreferences(storage){try{const value=JSON.parse(storage.getItem(PROFILE_THEME_KEY));return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}}

export const themes = Object.freeze([
  {id:'sunny',name:'Sunny Clubhouse',note:'Sunshine yellow, leafy green, friendly bold edges.',era:'A little sunshine',colors:['#ffdb58','#fff9db','#263c2f'],font:'"Trebuchet MS",sans-serif',radius:'10px'},
  {id:'classic',name:'Friendly Classic',note:'Familiar blue, tidy tabs and early social-web warmth.',era:'The early web',colors:['#3269b6','#eef3fa','#193d73'],font:'Verdana,sans-serif',radius:'3px'},
  {id:'soft',name:'Soft Everyday',note:'Apricot, rounded corners and a softer pace.',era:'Easygoing & cosy',colors:['#f4b49b','#fff4ec','#93432e'],font:'"Trebuchet MS",sans-serif',radius:'18px'},
  {id:'mac',name:'Mac ’98',note:'Platinum grey, Bondi teal and satisfying raised buttons.',era:'Desktop nostalgia',colors:['#177780','#dfdfdc','#252827'],font:'Tahoma,sans-serif',radius:'2px'},
  {id:'modern',name:'Quiet Modern',note:'Fresh white, gentle green and room to breathe.',era:'Clean & calm',colors:['#c8e5d7','#ffffff','#246856'],font:'"Segoe UI",sans-serif',radius:'12px'},
  {id:'terminal',name:'Green Screen',note:'Black screen, green type. A home-computer throwback.',era:'Back to BASIC',colors:['#78f59a','#050c08','#12371e'],font:'Consolas,monospace',radius:'0px'},
  {id:'rainbow',name:'Rainbow Daydream',note:'Unicorn energy. Candy colours, soft clouds and joy.',era:'Unapologetically happy',colors:['#f9a5cf','#fff5fc','#7441a7'],font:'"Trebuchet MS",sans-serif',radius:'22px'},
  {id:'y2k',name:'Y2K Pop',note:'Bubblegum pink, icy blue and a little dial-up optimism.',era:'Hello, 2000',colors:['#ec99c4','#edf6ff','#5b3999'],font:'Verdana,sans-serif',radius:'14px'},
  {id:'midnight',name:'Midnight Mix',note:'Inky violet, lilac and a bright lime accent.',era:'After-hours colour',colors:['#d8f77a','#171522','#c9afff'],font:'"Segoe UI",sans-serif',radius:'16px'},
  {id:'clear',name:'Bright & Clear',note:'Bigger type, strong contrast and simple blue controls.',era:'Comfort comes first',colors:['#2368a2','#fffdf6','#193146'],font:'Verdana,sans-serif',radius:'6px'}
].map(theme=>Object.freeze(theme)));

export function themeFor(id) { return themes.find(theme=>theme.id===id)||themes[0]; }
export function readTheme(storage) {
  try { const saved=storage || globalThis.localStorage; return themeFor(activeProfile ? profilePreferences(saved)[activeProfile] || profileDefault : saved.getItem(THEME_KEY)); }
  catch { return themeFor(activeProfile?profileDefault:DEFAULT_THEME); }
}
let activeTheme = readTheme();
export function currentTheme() { return activeTheme; }
export function useProfileTheme(id,fallback=DEFAULT_THEME){
  if(activeProfile===id)return activeTheme;
  activeProfile=id;profileDefault=themeFor(fallback).id;
  return applyTheme(readTheme().id,{persist:false}).theme;
}

// Apply in place: changing appearance must never discard a draft or reset a route.
export function applyTheme(id, {persist=true,storage,doc=globalThis.document}={}) {
  activeTheme = themeFor(id);
  if(doc) {
    doc.documentElement.dataset.theme = activeTheme.id;
    doc.querySelectorAll('[data-theme-select]').forEach(select=>{select.value=activeTheme.id;});
    doc.querySelectorAll('[data-theme-choice]').forEach(button=>{
      const selected=button.dataset.themeChoice===activeTheme.id;
      button.setAttribute('aria-pressed',String(selected));
      button.querySelector('[data-theme-status]').textContent=selected?'✓ Current theme':'Use theme';
    });
    doc.querySelectorAll('[data-current-theme]').forEach(label=>{label.textContent=activeTheme.name;});
  }
  let saved=true;
  if(persist) {
    try { const saved=storage || globalThis.localStorage; if(activeProfile){const preferences=profilePreferences(saved);preferences[activeProfile]=activeTheme.id;saved.setItem(PROFILE_THEME_KEY,JSON.stringify(preferences));} saved.setItem(THEME_KEY,activeTheme.id); }
    catch { saved=false; }
  }
  return {theme:activeTheme,saved};
}

export function themeControl() {
  return '<label class="theme-control" title="Choose a theme"><span class="sr-only">Theme</span><select data-theme-select aria-label="Choose theme">'+themes.map(theme=>'<option value="'+theme.id+'" '+(theme.id===activeTheme.id?'selected':'')+'>'+theme.name+'</option>').join('')+'</select></label>';
}

export function themeGallery() {
  return '<section class="paper-section appearance" id="appearance" aria-labelledby="appearance-title"><div class="section-top"><h2 id="appearance-title">Make yourself at home.</h2><span class="badge">'+themes.length+' themes</span></div><p>Pick the look that feels like you. Change it any time from the Theme menu at the top.</p><p class="help">Saved for this profile on this device. Each person starts with their own theme; you can change it any time.</p><div class="theme-grid">'+themes.map(theme=>'<button type="button" class="theme-choice" data-action="choose-theme" data-theme-choice="'+theme.id+'" data-value="'+theme.id+'" aria-label="Use '+theme.name+'" aria-pressed="'+(theme.id===activeTheme.id)+'"><span class="theme-sample sample-'+theme.id+'" aria-hidden="true" style="--sample-accent:'+theme.colors[0]+';--sample-bg:'+theme.colors[1]+';--sample-ink:'+theme.colors[2]+';--sample-font:'+theme.font.replaceAll('"',"'")+';--sample-radius:'+theme.radius+'"><span class="sample-bar">Same Old Faces'+(theme.id==='rainbow'?' ✨':'')+'</span><span class="sample-body"><span class="sample-greeting">Hello, friend.'+(theme.id==='terminal'?' _':'')+'</span><span class="sample-post">A little hello from me to you.</span><span class="sample-footer">♡ Like <span>☆ Stars</span></span></span></span><span class="theme-choice-copy"><strong>'+theme.name+'</strong><span class="theme-era">'+theme.era+'</span><span class="theme-description">'+theme.note+'</span><span class="theme-status" data-theme-status>'+(theme.id===activeTheme.id?'✓ Current theme':'Use theme')+'</span></span></button>').join('')+'</div></section>';
}

applyTheme(activeTheme.id,{persist:false});
