try{localStorage.setItem('mg-learning-help-visit',String(Date.now()));}catch{}
import {noteAt,roots,scaleNotes,pitchName,displayRoot,spelledPitch,chordShapes,associated} from './model.js';
import {createPlayer} from './audio.js';
import {initWiki,initPanel} from './knowledge.js';
if(document.body.dataset.page==='wiki') initWiki(); else {
const $=s=>document.querySelector(s),key='mg-explore-v1';
let state={root:'C',display:'hidden',scope:'all',scale:false,chord:null,selection:null};
try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&roots.includes(saved.root))state={...state,...saved};}catch{}
if(!['notes','degrees','hidden'].includes(state.display))state.display='hidden';
if(state.selection&&(!Number.isInteger(state.selection.string)||state.selection.string<1||state.selection.string>6||!Number.isInteger(state.selection.fret)||state.selection.fret<0||state.selection.fret>15))state.selection=null;
if(state.chord&&(!roots.includes(state.chord.root)||!['major','minor'].includes(state.chord.quality)||!chordShapes(state.chord.root,state.chord.quality)[state.chord.index]))state.chord=null;
let popup=null;
const player=createPlayer(m=>document.querySelectorAll('[data-midi]').forEach(b=>b.classList.toggle('sounding',Number(b.dataset.midi)===m)),()=>{},m=>$('#audio-status').textContent=m);
const save=()=>{try{localStorage.setItem(key,JSON.stringify(state));}catch{$('#audio-status').textContent='本地存储不可用，刷新可能丢失探索状态。';}};
const panel=initPanel(()=>{});
function sound(notes){$('#audio-status').textContent='';player.play(notes);}
function render(){
 save();const tones=scaleNotes(state.root,'major'),c=state.chord,shape=c?chordShapes(c.root,c.quality)[c.index]:null,groups=c?.linked?associated(state.root,c.root,c.quality,c.index):[];
 $('#key-title').textContent=displayRoot(state.root)+' 大调';
 $('#layers').innerHTML=(state.scale?`<div class="layer">${displayRoot(state.root)} 大调音阶 <button id="hear-scale">试听</button><button id="remove-scale">移除音阶</button></div>`:'')+(c?`<div class="layer">${displayRoot(c.root)} ${c.quality==='major'?'大':'小'}三和弦 · ${shape?.name||'无可用指型'} ${associated(state.root,c.root,c.quality,c.index).length?'':'· 非调内和弦'} <button id="prev">‹</button><span>指型 ${c.index+1}/${chordShapes(c.root,c.quality).length}</span><button id="next">›</button><button id="link" aria-pressed="${c.linked}">关联音阶 ${c.linked?'开':'关'}</button><button id="remove-chord">移除和弦</button>${c.linked?`<p>${groups.length?groups.map(g=>['低把位','当前把位','高把位'][g.role+1]+'：六弦起点 '+g.start+' 品').join(' · ')+(groups.length<3?' · 指板边界，部分相邻把位不可用':''):'非调内和弦：保留指型，不显示关联音阶'}</p>`:''}</div>`:'');
 const board=$('#fretboard');board.replaceChildren();
 for(let f=-1;f<=15;f++){const x=document.createElement('span');x.className='fret-label';x.textContent=f<0?'':f===0?'空弦':f;board.append(x);}
 for(let s=1;s<=6;s++){
 const label=document.createElement('span');label.className='string-label';label.textContent=s+' '+pitchName(noteAt(s,0))+(shape?(shape.frets[6-s]===null?' ×':shape.frets[6-s]===0?' ○':''):'');board.append(label);
 for(let f=0;f<=15;f++){
 const midi=noteAt(s,f),tone=tones.find(t=>t.pc===midi%12),roles=groups.filter(g=>g.notes.some(n=>n.string===s&&n.fret===f)).map(g=>g.role),chord=shape&&shape.frets[6-s]===f;
 const cell=document.createElement('div');cell.className='fret '+(f===0?'open':'');cell.style.setProperty('--thickness',1+(s-1)*.4+'px');
 const b=document.createElement('button');b.dataset.midi=midi;b.dataset.string=s;b.dataset.fret=f;
 b.className=(state.scale&&tone?'in-scale ':'')+(chord?'chord ':'')+(state.selection?.string===s&&state.selection?.fret===f?'selected ':'');
 if(roles.length){const colors=roles.map(r=>['#9de0d6','#a9c5ff','#ffd1a2'][r+1]);b.style.background=colors.length===1?colors[0]:`linear-gradient(135deg,${colors.join(',')})`;}
 const chordTone=chord?scaleNotes(c.root,c.quality).find(t=>t.pc===midi%12):null;const name=chordTone?.name||tone?.name||pitchName(midi).split(' / ')[0];b.textContent=state.display==='hidden'||(state.scope==='key'&&!tone)?'':state.display==='degrees'?(tone?.degree||'·'):name;
 b.setAttribute('aria-label',`${s}弦${f}品 ${spelledPitch(midi,name)}${chord?' 和弦按弦点':''}${roles.map(r=>['低把位','当前把位','高把位'][r+1]).join('、')}`);
 b.onclick=()=>{state.selection={string:s,fret:f};sound([midi]);render();};cell.append(b);board.append(cell);
 }}
 for(let f=-1;f<=15;f++){const x=document.createElement('span');x.className='position-marker';x.textContent=[3,5,7,9,15].includes(f)?'●':f===12?'● ●':'';board.append(x);}
 if(state.selection){const {string:s,fret:f}=state.selection,m=noteAt(s,f),t=(shape?.frets[6-s]===f?scaleNotes(c.root,c.quality):tones).find(t=>t.pc===m%12);$('#selected-note').textContent=`${s} 弦 ${f} 品 · ${t?spelledPitch(m,t.name):pitchName(m).split(' / ').map(n=>spelledPitch(m,n)).join(' / ')} · ${tones.find(t=>t.pc===m%12)?'调内级数 '+tones.find(t=>t.pc===m%12).degree:'调外音'}`;$('#replay').disabled=false;}
 const bind=(id,fn)=>{if($(id))$(id).onclick=fn;};
 bind('#remove-scale',()=>{state.scale=false;render()});bind('#hear-scale',()=>sound([...tones.map(t=>60+roots.indexOf(state.root)+t.step),72+roots.indexOf(state.root)]));
 bind('#remove-chord',()=>{state.chord=null;render()});bind('#link',()=>{c.linked=!c.linked;render()});
 for(const [id,d] of [['#prev',-1],['#next',1]])bind(id,()=>{c.index=(c.index+d+chordShapes(c.root,c.quality).length)%chordShapes(c.root,c.quality).length;player.stop();render()});
}
function settings(type){popup=type;const box=$('#settings');box.hidden=!type;if(!type)return;
 box.innerHTML='<button id="close-settings" aria-label="关闭设置">✕</button>'+ (type==='key'?`<h2>调性 · 大调</h2><div class="choices">${roots.map(r=>`<button data-root="${r}" aria-pressed="${r===state.root}">${displayRoot(r)}</button>`).join('')}</div><p>选中即生效，保留已添加的和弦。</p>`:type==='display'?`<h2>显示设置</h2>${[['notes','音名'],['degrees','级数'],['hidden','无文字']].map(([v,l])=>`<button data-display="${v}" aria-pressed="${v===state.display}">${l}</button>`).join('')}<p>级数指当前大调音阶级数，不是和弦内角色。</p><button data-scope="all" aria-pressed="${state.scope==='all'}">全部半音</button><button data-scope="key" aria-pressed="${state.scope==='key'}">仅调内标注</button><p>选中即生效</p>`:`<h2>添加内容</h2><button id="add-scale">添加当前大调音阶</button><hr><label>和弦根音<select id="chord-root">${roots.map(r=>`<option>${r}</option>`).join('')}</select></label><label>类型<select id="quality"><option value="major">大三和弦</option><option value="minor">小三和弦</option></select></label><button id="add-chord">添加和弦</button>`);
 $('#close-settings').onclick=()=>settings(null);
 box.querySelectorAll('[data-root],[data-display],[data-scope]').forEach(b=>b.onclick=()=>{Object.assign(state,b.dataset);player.stop();render();settings(type)});
 if($('#add-scale'))$('#add-scale').onclick=()=>{state.scale=true;render();settings(null)};
 if($('#add-chord'))$('#add-chord').onclick=()=>{state.chord={root:$('#chord-root').value,quality:$('#quality').value,index:0,linked:false};render();settings(null)};
}
 document.querySelectorAll('[data-popup]').forEach(b=>b.onclick=()=>settings(popup===b.dataset.popup?null:b.dataset.popup));
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('#settings,[data-popup]'))settings(null)});document.addEventListener('keydown',e=>{if(e.key==='Escape')settings(null)});
 const open=e=>panel.open('positions',e.currentTarget);$('#manual').onclick=open;$('#open-wiki').onclick=open;
 document.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>panel.open(b.dataset.topic,b));
 $('#replay').onclick=()=>sound([noteAt(state.selection.string,state.selection.fret)]);$('#stop').onclick=player.stop;
 window.addEventListener('resize',()=>{if(state.selection)requestAnimationFrame(()=>document.querySelector(`[data-string="${state.selection.string}"][data-fret="${state.selection.fret}"]`)?.scrollIntoView({block:'nearest',inline:'nearest'}));});render();
}
