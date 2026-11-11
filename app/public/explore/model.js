const opens = [64,59,55,50,45,40];
export const roots = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
export const scales = {
  major: {name:'大调音阶',steps:[0,2,4,5,7,9,11],degrees:['1','2','3','4','5','6','7'],letters:[0,1,2,3,4,5,6]},
  minor: {name:'自然小调',steps:[0,2,3,5,7,8,10],degrees:['1','2','♭3','4','5','♭6','♭7'],letters:[0,1,2,3,4,5,6]},
  'major-pentatonic': {name:'大调五声音阶',steps:[0,2,4,7,9],degrees:['1','2','3','5','6'],letters:[0,1,2,4,5]},
  'minor-pentatonic': {name:'小调五声音阶',steps:[0,3,5,7,10],degrees:['1','♭3','4','5','♭7'],letters:[0,2,3,4,6]},
};
export const displayRoot = root => root.replace('b','♭');
export function scaleNotes(root, type) {
  const pitch = roots.indexOf(root), scale = scales[type];
  if (pitch < 0 || !scale) throw new RangeError('未知音阶');
  const letters = 'CDEFGAB', natural = [0,2,4,5,7,9,11];
  const start = letters.indexOf(root[0]);
  return scale.steps.map((step,i) => {
    const pc = (pitch + step) % 12, letter = (start + scale.letters[i]) % 7;
    const diff = ((pc - natural[letter] + 18) % 12) - 6;
    const accidental = diff < 0 ? '♭'.repeat(-diff) : '♯'.repeat(diff);
    return {pc,name:letters[letter]+accidental,degree:scale.degrees[i],step};
  });
}
export function pitchName(midi) {
  return ['C','C♯ / D♭','D','D♯ / E♭','E','F','F♯ / G♭','G','G♯ / A♭','A','A♯ / B♭','B'][midi % 12];
}
export function spelledPitch(midi,name) {
  const natural = {C:0,D:2,E:4,F:5,G:7,A:9,B:11}[name[0]];
  const accidental = [...name.slice(1)].reduce((sum,char) => sum + (char === '♯' ? 1 : char === '♭' ? -1 : 0),0);
  return name + ((midi - natural - accidental) / 12 - 1);
}
export function noteAt(string, fret) {
  if (!Number.isInteger(string) || string < 1 || string > 6 || !Number.isInteger(fret) || fret < 0 || fret > 15) throw new RangeError('弦或品位超出范围');
  return opens[string - 1] + fret;
}

export function chordShapes(root, quality='major') {
 const pc=roots.indexOf(root); if(pc<0||!['major','minor'].includes(quality)) return [];
 const e=(pc-4+12)%12,a=(pc-9+12)%12;
 // 先保留原有 E/A 顺序；新增型只追加，兼容已保存的指型索引。
 const shapes=[{name:'E 型横按',frets:[e,e+2,e+2,e+(quality==='major'?1:0),e,e]}, {name:'A 型横按',frets:[null,a,a+2,a+2,a+(quality==='major'?2:1),a]}];
 // 旧版过滤后的 E/A 索引保持不变，新进入范围的型排在其后。
 shapes.sort((x,y)=>Number(x.frets.some(f=>f!==null&&f>12))-Number(y.frets.some(f=>f!==null&&f>12)));
 if(quality==='major') {
  const c=pc,g=(pc-7+12)%12,d=(pc-2+12)%12;
  shapes.push(
   {name:c===0?'C 型开放':'C 型横按',frets:[null,c+3,c+2,c,c+1,c]},
   {name:g===0?'G 型开放':'G 型横按',frets:[g+3,g+2,g,g,g,g+3]},
   {name:d===0?'D 型开放':'D 型横按',frets:[null,null,d,d+2,d+3,d+2]}
  );
 }
 return shapes.filter(s=>s.frets.every(f=>f===null||(f>=0&&f<=15)));
}
export function positions(root) {
 const pcs=scaleNotes(root,'major').map(n=>n.pc), result=[];
 for(let start=0;start<=15;start++) {
  if(!pcs.includes((40+start)%12)) continue;
  let pitch=40+start; const notes=[];
  for(let string=6;string>=1;string--) for(let n=0;n<3;n++) {
   if(notes.length){do{pitch++}while(!pcs.includes(pitch%12));}
   notes.push({string,fret:pitch-opens[string-1]});
  }
  if(notes.every(n=>n.fret>=0&&n.fret<=15)) result.push({start,notes});
 }
 return result;
}
export function associated(key,root,quality,index) {
 const pcs=scaleNotes(key,'major').map(n=>n.pc), r=roots.indexOf(root);
 if(![0,quality==='major'?4:3,7].every(n=>pcs.includes((r+n)%12))) return [];
 const shape=chordShapes(root,quality)[index];if(!shape)return [];
 const fs=shape.frets.filter(f=>f!==null), center=fs.reduce((a,b)=>a+b,0)/fs.length, list=positions(key);
 const avg=p=>p.notes.reduce((a,n)=>a+n.fret,0)/18;
 let current=0;list.forEach((p,i)=>{if(Math.abs(avg(p)-center)<Math.abs(avg(list[current])-center))current=i});
 return [-1,0,1].flatMap(offset=>list[current+offset]?[{...list[current+offset],role:offset}]:[]);
}
