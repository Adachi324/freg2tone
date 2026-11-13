import {chromium} from '@playwright/test';import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});const page=await browser.newPage();page.on('pageerror',e=>console.error(e.message));
// 只替换播放器公共接口，故意在stop后延迟返回true，检查页面自身的旧请求隔离。
await page.route('**/explore/audio.js*',r=>r.fulfill({contentType:'text/javascript',body:`export function createPlayer(){return {stop(){},play(){return new Promise(resolve=>setTimeout(()=>resolve(true),700))}}}`}));
await page.route('**/course/curriculum.js*',r=>r.fulfill({contentType:'text/javascript',body:`export const chapters=[2,3].map(id=>({id,title:'测试章'+id,steps:[{title:'知识',body:'正文'}],guided:[],practice:[],hearing:[{id:'same-id',kind:'hearing',prompt:'听声音选择',options:['候选甲','候选乙'],answer:0,notes:[60,64],hint:'提示',explanation:'完成'}],review:[]}));`}));
await page.goto('http://127.0.0.1:8877/course/index.html#2');await page.getByRole('button',{name:'听觉比较',exact:true}).click();await page.getByRole('button',{name:'听参考（须完整播放）'}).click();
await page.evaluate(()=>location.hash='3');await page.getByRole('button',{name:'听觉比较',exact:true}).click();await page.waitForTimeout(850);await page.locator('[data-option="0"]').click();await page.getByRole('button',{name:'提交答案',exact:true}).click();await page.getByText('请先成功完整听完一次参考；取消或失败不算已听。').waitFor();
let s=await page.evaluate(()=>JSON.parse(localStorage.getItem('mg-course-v1')));assert.equal(s.chapters['3'].records['hearing:same-id'],undefined);
await page.getByRole('button',{name:'听参考（须完整播放）'}).click();await page.waitForTimeout(850);await page.getByRole('button',{name:'提交答案',exact:true}).click();s=await page.evaluate(()=>JSON.parse(localStorage.getItem('mg-course-v1')));assert.equal(s.chapters['3'].records['hearing:same-id'].correct,true);assert.notEqual(s.chapters['2'].records['hearing:same-id']?.correct,true);
await page.reload();await page.getByText('本组已完成',{exact:true}).waitFor();
console.log('PASS: 延迟旧参考不能解锁新章；相同题ID按章隔离；完成记录刷新恢复。此项模拟播放器，不验证真实音频。');await browser.close();
