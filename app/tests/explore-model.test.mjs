import test from 'node:test';
import assert from 'node:assert/strict';
import { noteAt, scaleNotes, spelledPitch } from '../public/explore/model.js';

test('标准调弦的空弦、八度与跨弦同音位置正确', () => {
  assert.deepEqual([1,2,3,4,5,6].map(s => noteAt(s,0)), [64,59,55,50,45,40]);
  assert.equal(noteAt(6,12),52);
  assert.equal(noteAt(3,9),noteAt(2,5));
  assert.throws(() => noteAt(7,0), RangeError);
});

test('音阶保留正确音名拼写与级数，支持不同主音', () => {
  assert.deepEqual(scaleNotes('C','major').map(n => n.name), ['C','D','E','F','G','A','B']);
  assert.deepEqual(scaleNotes('F','major').map(n => n.name), ['F','G','A','B♭','C','D','E']);
  assert.deepEqual(scaleNotes('Gb','major').map(n => n.name), ['G♭','A♭','B♭','C♭','D♭','E♭','F']);
  assert.deepEqual(scaleNotes('A','minor-pentatonic').map(n => [n.name,n.degree]), [['A','1'],['C','♭3'],['D','4'],['E','5'],['G','♭7']]);
  assert.deepEqual(scaleNotes('C','minor').map(n => n.name), ['C','D','E♭','F','G','A♭','B♭']);
});

test('等音拼写跨越 C 边界时保留正确八度', () => {
  assert.equal(spelledPitch(59,'C♭'),'C♭4');
  assert.equal(spelledPitch(60,'B♯'),'B♯3');
  assert.equal(spelledPitch(64,'E'),'E4');
});
