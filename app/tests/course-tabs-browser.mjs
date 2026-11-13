import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
 for(const first of [0,1]) {
  const context=await browser.newContext();const a=await context.newPage();const b=await context.newPage();
  await a.goto('http://127.0.0.1:8877/course/index.html#2');await a.getByRole('button',{name:'独立应用',exact:true}).click();
  await b.goto('http://127.0.0.1:8877/course/index.html#2');
  // Hold the second tab's cross-tab listener to exercise its stale snapshot on focus.
  await b.evaluate(()=>window.addEventListener('storage',event=>event.stopImmediatePropagation(),true));
  await a.locator(`[data-option="${first}"]`).click();await a.getByRole('button',{name:'提交答案',exact:true}).click();
  const record=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('mg-course-v1')).chapters[2].records['practice:2-practice-1']);
  const sealed=await record(a);assert.equal(sealed.first,first);
  await b.evaluate(()=>window.dispatchEvent(new Event('focus')));
  assert.deepEqual(await record(b),sealed,'stale focus must preserve first answer');
  if(first===1){await b.getByRole('button',{name:'查看提示',exact:true}).click();await b.locator('[data-option="0"]').click();await b.getByRole('button',{name:'提交答案',exact:true}).click();}
  if(first===0){await b.locator('[data-option="1"]').click();await b.getByRole('button',{name:'提交答案',exact:true}).click();await b.getByText('本题已在另一标签页完成，保留原作答记录。',{exact:true}).waitFor();}
  const completed=await record(b);assert.equal(completed.first,first);assert.equal(completed.correct,true);assert.equal(completed.attempts,first===1?2:1);assert.equal(completed.help,first===1);
  for(let n=0;n<3;n++)await a.evaluate(()=>window.dispatchEvent(new Event('focus')));
  assert.deepEqual(await record(a),completed,'repeated synchronization must not add attempts');
  await a.getByRole('button',{name:'听觉比较',exact:true}).click();await a.getByRole('button',{name:'查看提示',exact:true}).click();await b.evaluate(()=>window.dispatchEvent(new Event('focus')));
  assert.equal(await b.evaluate(()=>JSON.parse(localStorage.getItem('mg-course-v1')).chapters[2].records['hearing:2-hearing-1'].help),true,'another question survives stale saves');
  await b.reload();await b.getByText('把 C 大调的 5–6–3–2 换到 G 大调，应选哪组音？',{exact:true}).waitFor();
  await context.close();
 }
 const context=await browser.newContext();const p=await context.newPage();
 await p.goto('http://127.0.0.1:8877/course/index.html');
 await p.evaluate(()=>localStorage.setItem('mg-course-v1',JSON.stringify({chapters:{5:{mode:'practice',step:0,completed:'2026-11-12',records:{'practice:5-practice-1':{first:0,attempts:1,correct:true,help:false}}}}})));
 await p.goto('http://127.0.0.1:8877/course/index.html?legacy#5');
 await p.getByText('本题材料已更新，旧版作答保留在学习记录，请完成新题。',{exact:true}).waitFor();
 await p.getByRole('button',{name:'学习记录',exact:true}).click();await p.getByText(/旧版题记录/).waitFor();
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('mg-course-v1')).chapters[5].completed),'2026-11-12');
 await context.close();
 console.log('PASS: two tabs preserve correct/wrong first answers, help, retries and refresh continuation');
}finally{await browser.close();}
