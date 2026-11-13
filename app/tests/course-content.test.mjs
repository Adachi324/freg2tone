import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chapters} from '../public/course/curriculum.js';
test('初学者2至8章均有实际材料和独立复测',()=>{
 assert.deepEqual(chapters.map(c=>c.id),[2,3,4,5,6,7,8]);
 for(const c of chapters){
  assert.ok(c.steps.length>=3,`chapter ${c.id} steps`);
  assert.ok(c.goal&&c.guitar);
  for(const mode of ['guided','practice','hearing','review']){
   assert.ok(c[mode].length>=2,`${c.id} ${mode}`);
   const ids=c[mode].map(q=>q.id);assert.equal(new Set(ids).size,ids.length);
   for(const q of c[mode]){
    assert.ok(q.prompt&&q.hint&&q.explanation,`${c.id}/${q.id} feedback`);
    if(q.kind==='fretboard'){assert.ok(Number.isInteger(q.targetMidi));}
    else {assert.ok(q.options.length>=2);assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length);}
    if(q.kind==='hearing')assert.ok(q.notes?.length>0);
    for(const n of q.notes||[])assert.ok(Number.isInteger(n)&&n>=0&&n<=127);
    if(q.durations){assert.equal(q.notes.length,q.durations.length);assert.ok(q.durations.every(d=>d>0));}
   }
  }
  assert.ok(c.review.some(q=>q.kind==='hearing'));assert.ok(c.review.some(q=>q.kind!=='hearing'));
 }
});
test('独立音乐预期：级数、跨弦音高、七和弦和两小节转录',()=>{
 const c=id=>chapters.find(c=>c.id===id);
 assert.equal(c(2).practice[0].options[c(2).practice[0].answer],'2–4–3–1');
 assert.equal(c(2).practice[1].options[c(2).practice[1].answer],'D–E–B–A');
 assert.equal(c(4).practice[2].targetMidi,58);assert.equal(c(4).practice[2].requiredString,3);
 assert.equal(c(4).review[1].targetMidi,68);assert.equal(c(6).practice[1].targetMidi,64);assert.equal(c(6).practice[1].requiredString,2);
 assert.deepEqual(c(7).hearing[0].notes,[53,57,60,63]);assert.equal(c(7).hearing[0].answer,1);
 assert.deepEqual(c(7).review[2].notes,[57,61,64,68]);assert.equal(c(7).review[2].answer,2);
 assert.deepEqual(c(8).hearing[0].notes,[60,64,62,67,65,64,62,60]);assert.equal(c(8).hearing[0].answer,0);
 assert.deepEqual(c(8).hearing[1].notes,[53,57,60,57,55,59,62,59]);assert.equal(c(8).hearing[1].answer,2);
 for(const chapter of chapters){const seen=chapter.steps.filter(s=>s.notes.length).map(s=>JSON.stringify(s.notes));for(const phase of ['hearing','review'])for(const q of chapter[phase].filter(q=>q.kind==='hearing')){assert.ok(!seen.includes(JSON.stringify(q.notes)),`${q.id} repeats lesson`);if(phase==='review')assert.ok(!chapter.hearing.some(h=>JSON.stringify(h.notes)===JSON.stringify(q.notes)),`${q.id} repeats same-day hearing`);}}
});
test('第五章迁移与第七章隔天解决使用新材料，旧题标识可追溯',()=>{
 const progression=chapters.find(c=>c.id===5).practice[0];
 assert.match(progression.prompt,/C–F–Am–G/);
 assert.equal(progression.options[progression.answer],'G–C–Em–D');
 assert.equal(progression.id,'5-practice-1-v2');
 assert.equal(progression.previousVersions[0].id,'5-practice-1');
 const resolution=chapters.find(c=>c.id===7).review[1];
 assert.match(resolution.prompt,/D7/);
 assert.equal(resolution.options[resolution.answer],'F♯→G，C→B是常见解决');
 assert.equal(resolution.id,'7-review-2-v2');
 assert.equal(resolution.previousVersions[0].id,'7-review-2');
});
