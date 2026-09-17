import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const memory=new Map();
globalThis.localStorage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value)};
const appearance=await import('./themes.js');
const store=await import('./store.js');
const {createSeed}=await import('./data.js');
const {feed}=await import('./views.js');
beforeEach(()=>{memory.clear();store.replaceState(createSeed());appearance.useProfileTheme(null);appearance.applyTheme('sunny',{persist:false});});

test('first visit and unknown stored themes use Sunny Clubhouse',()=>{
  assert.equal(appearance.readTheme().id,'sunny');
  memory.set(appearance.THEME_KEY,'removed-theme');
  assert.equal(appearance.readTheme().id,'sunny');
});
test('every theme survives reload without changing member data',async()=>{
  store.save();const original=memory.get(store.DEMO_KEY);
  for(const theme of appearance.themes){
    assert(appearance.applyTheme(theme.id).saved);
    const reloaded=await import('./themes.js?reload='+theme.id);
    assert.equal(reloaded.currentTheme().id,theme.id);
    assert.equal(memory.get(store.DEMO_KEY),original);
  }
});
test('changing profiles and resetting demo data preserve the appearance preference',()=>{
  appearance.applyTheme('terminal');store.state.current='lea';store.save();
  assert.equal(appearance.readTheme().id,'terminal');
  store.reset();assert.equal(appearance.readTheme().id,'terminal');
});
test('blocked browser storage still allows a temporary theme',()=>{
  const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
  assert.equal(appearance.readTheme(blocked).id,'sunny');
  const result=appearance.applyTheme('rainbow',{storage:blocked});
  assert.equal(result.theme.id,'rainbow');assert.equal(result.saved,false);
});
test('the personalised greeting treats a member name as text',()=>{
  store.current().name='<img/src=x/onerror=alert(1)> Person';
  assert(!feed().includes('<img/src=x/onerror=alert(1)>'));
  assert(feed().includes('Hi, &lt;img/src=x/onerror=alert(1)&gt;.'));
});

// Measure the actual CSS token pairs, including small text and dark surfaces.
test('theme text and controls meet WCAG AA contrast against their token backgrounds',async()=>{
  const css=await readFile(new URL('themes.css',import.meta.url),'utf8');
  const declarations=block=>Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})\s*;/g)].map(match=>[match[1],match[2]]));
  const base=declarations(css.match(/:root\s*\{([^}]+)\}/)[1]);
  const luminance=hex=>hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);
  const contrast=(a,b)=>{const values=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (values[0]+.05)/(values[1]+.05);};
  for(const theme of appearance.themes){
    const match=css.match(new RegExp(':root\\[data-theme="'+theme.id+'"\\]\\s*\\{([^}]+)\\}'));
    const palette={...base,...(match?declarations(match[1]):{})};
    for(const [foreground,background] of [['ink','bg'],['ink','paper'],['ink','soft'],['ink','highlight'],['muted','bg'],['muted','paper'],['muted','soft'],['blue','paper'],['on-accent','navy'],['masthead-ink','masthead'],['success','paper'],['danger','danger-bg']]){
      const ratio=contrast(palette[foreground],palette[background]);
      assert(ratio>=4.5,`${theme.name}: ${foreground} on ${background} is ${ratio.toFixed(2)}:1`);
    }
  }
});

test('each family profile gets its own default and saved appearance',()=>{
  appearance.useProfileTheme('ada','rainbow');assert.equal(appearance.currentTheme().id,'rainbow');
  appearance.applyTheme('y2k');
  appearance.useProfileTheme('dad','sunny');assert.equal(appearance.currentTheme().id,'sunny');
  appearance.useProfileTheme('linus','terminal');assert.equal(appearance.currentTheme().id,'terminal');
  appearance.useProfileTheme('ada','rainbow');assert.equal(appearance.currentTheme().id,'y2k');
  store.reset();appearance.useProfileTheme('dad','sunny');appearance.useProfileTheme('ada','rainbow');assert.equal(appearance.currentTheme().id,'y2k');
});