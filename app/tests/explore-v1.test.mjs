import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chordShapes,positions,associated} from '../public/explore/model.js';
test('C major playable voicings and C major 3NPS positions',()=>{assert.deepEqual(chordShapes('C','major')[0].frets,[8,10,10,9,8,8]); const p=positions('C');assert.ok(p.length>1);assert.ok(p.every(x=>x.notes.length===18));assert.equal(associated('C','Db','major',0).length,0);});
import {roots,noteAt} from '../public/explore/model.js';
test('all offered voicings are complete triads and 3NPS shapes stay playable within board',()=>{
 for(const root of roots){for(const quality of ['major','minor'])for(const shape of chordShapes(root,quality)){
 const actual=[...new Set(shape.frets.flatMap((f,i)=>f===null?[]:[(noteAt(6-i,f)-roots.indexOf(root)+12)%12]))].sort((a,b)=>a-b);
 assert.deepEqual(actual,quality==='major'?[0,4,7]:[0,3,7]);
 }
 for(const p of positions(root))for(let s=1;s<=6;s++){
 const frets=p.notes.filter(n=>n.string===s).map(n=>n.fret);assert.equal(frets.length,3);assert.ok(Math.max(...frets)-Math.min(...frets)<=4);
 }}
 assert.deepEqual(positions('C')[0].notes.filter(n=>n.string===6).map(n=>n.fret),[0,1,3]);
 assert.deepEqual(chordShapes('A','minor')[1].frets,[null,0,2,2,1,0]);
});
