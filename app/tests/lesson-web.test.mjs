import {test} from 'node:test';
import assert from 'node:assert/strict';
import {submit,day,available} from '../public/lesson-1/model.js';
test('首答错误保留，重试正确不能改写',()=>{const r=submit(null,60,64,false); const s=submit(r,64,64,true);assert.equal(s.first,60);assert.equal(s.attempts,2);assert.equal(s.help,true);assert.equal(s.correct,true)});
test('次日开放而非当日反复刷题',()=>{assert.equal(available('2026-11-05',new Date(2026,10,5,23)),false);assert.equal(available('2026-11-05',new Date(2026,10,6)),true);assert.equal(day(new Date(2026,10,5)),'2026-11-05')});
import {markHelp} from '../public/lesson-1/model.js';
test('离开未完成独立题查资料后，提示状态不改写首答',()=>{const r=submit(null,60,64,false);const h=markHelp(r);assert.equal(h.first,60);assert.equal(h.attempts,1);assert.equal(submit(h,64,64,false).help,true);assert.equal(markHelp(submit(null,64,64,false)).help,false)});
import {applyVisit} from '../public/lesson-1/model.js';
test('另一标签查资料只标记已开始的未完成题',()=>{const s={records:{},activeId:'hearing-0',helpSeen:100};applyVisit(s,101);assert.equal(s.records['hearing-0'].help,true);const idle={records:{},helpSeen:100};applyVisit(idle,101);assert.deepEqual(idle.records,{});const done={records:{'hearing-0':submit(null,71,71,false)},activeId:'hearing-0',helpSeen:100};applyVisit(done,101);assert.equal(done.records['hearing-0'].help,false)});
