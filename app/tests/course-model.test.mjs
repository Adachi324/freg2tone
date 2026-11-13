import {test} from 'node:test';import assert from 'node:assert/strict';
import {answer,assist,day,reviewOpen,finish,visit} from '../public/course/model.js';
test('首答封存，提示与重试分别保留，已完成不改写',()=>{let r=answer(null,'b','a');r=answer(assist(r),'a','a');assert.equal(r.first,'b');assert.equal(r.attempts,2);assert.equal(r.help,true);assert.equal(answer(r,'b','a'),r)});
test('提示未答刷新后仍保留；听觉失败不计提交',()=>{const r=JSON.parse(JSON.stringify(assist(null)));assert.equal(answer(r,'a','a',false),r);assert.equal(answer(r,'a','a',true).help,true)});
test('完成日封存，下一自然日开放',()=>{const s={records:{p:{correct:true},h:{correct:true}}};finish(s,['p','h'],'2026-11-13');finish(s,['p','h'],'2026-11-14');assert.equal(s.completed,'2026-11-13');assert.equal(reviewOpen(s.completed,'2026-11-13'),false);assert.equal(reviewOpen(s.completed,'2026-11-14'),true);assert.equal(day(new Date(2026,10,13)),'2026-11-13')});
test('知识访问仅辅助已开始未完成题',()=>{const s={records:{},active:'p',helpSeen:5};visit(s,6);assert.equal(s.records.p.help,true);const idle={records:{},helpSeen:5};visit(idle,6);assert.deepEqual(idle.records,{})});
import {beginQuestion,helpOpen,navigationHelps} from '../public/course/model.js';
test('同章多个已开始未完成题都记录帮助，未开始题不创建',()=>{const s={records:{}};beginQuestion(s,'practice:one',10);beginQuestion(s,'hearing:one',10);visit(s,11);assert.equal(s.records['practice:one'].help,true);assert.equal(s.records['hearing:one'].help,true);assert.equal(s.records['review:one'],undefined);s.records['practice:one']=answer(s.records['practice:one'],0,0);const frozen=s.records['practice:one'];helpOpen(s);assert.equal(s.records['practice:one'],frozen)});
test('只有资料导航标帮助，目录首页与切章链接不标',()=>{assert.equal(navigationHelps('/course/'),false);assert.equal(navigationHelps('/home/'),false);assert.equal(navigationHelps('/course/index.html'),false);assert.equal(navigationHelps('/wiki/'),true);assert.equal(navigationHelps('/explore/'),true);assert.equal(navigationHelps('/lesson-1/'),true)});
import {mergeProgress} from '../public/course/model.js';
test('两页已提交不同首答时保留最早持久首答及至少两次尝试，重复合并幂等',()=>{
 const state={chapters:{2:{records:{q:{first:0,attempts:1,correct:true,help:false}}}}};
 const remote={chapters:{2:{records:{q:{first:1,attempts:1,correct:false,help:true}},completed:'2026-11-12'}}};
 mergeProgress(state,remote);assert.deepEqual(state.chapters[2].records.q,{first:1,attempts:2,correct:true,help:true});
 mergeProgress(state,remote);assert.equal(state.chapters[2].records.q.attempts,2);assert.equal(state.chapters[2].completed,'2026-11-12');
});
