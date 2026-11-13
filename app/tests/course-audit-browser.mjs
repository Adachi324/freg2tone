import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const base=process.env.COURSE_TEST_URL||'http://127.0.0.1:8877';
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
const errors=[];
const button=(page,name)=>page.getByRole('button',{name,exact:true});
const complete=page=>page.locator('#audio').filter({hasText:'播放完成，可以重听。'}).waitFor({timeout:15000});
async function fresh(chapter=8){
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.audioAudit={starts:[],failNext:false};
  const start=OscillatorNode.prototype.start;
  OscillatorNode.prototype.start=function(time){window.audioAudit.starts.push({frequency:this.frequency.value,time});return start.call(this,time);};
  const resume=AudioContext.prototype.resume;
  AudioContext.prototype.resume=function(){if(window.audioAudit.failNext){window.audioAudit.failNext=false;return Promise.reject(new Error('test resume failure'));}return resume.call(this);};
 });
 await page.goto(`${base}/course/#${chapter}`);return page;
}
async function assertUnrecorded(page,key){
 const record=await page.evaluate(key=>JSON.parse(localStorage.getItem('mg-course-v1')).chapters[8].records[key],key);
 assert.ok(!record||record.first===null,`no first answer for ${key}`);
 assert.equal(record?.attempts??0,0);assert.equal(record?.correct??false,false);
}
async function denied(page){
 await button(page,'提交答案').click();
 await page.getByText('请先成功完整听完一次参考；取消或失败不算已听。',{exact:true}).waitFor();
 await assertUnrecorded(page,'hearing:8-hearing-1');
}
async function recover(page){
 await button(page,'听参考（须完整播放）').click();await complete(page);
 await button(page,'提交答案').click();await button(page,'下一题').waitFor();
 const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('mg-course-v1')).chapters[8].records['hearing:8-hearing-1']);
 assert.equal(record.first,0);assert.equal(record.attempts,1);assert.equal(record.correct,true);
}
try{
 const fret=await fresh(2);await button(fret,'独立应用').click();
 for(const answer of [0,1]){await fret.locator(`[data-option="${answer}"]`).click();await button(fret,'提交答案').click();await button(fret,'下一题').click();}
 await button(fret,'2弦5品').click();await button(fret,'提交答案').click();
 await fret.getByText('请在题目指定的弦上选择。',{exact:true}).waitFor();
 assert.equal(await fret.evaluate(()=>JSON.parse(localStorage.getItem('mg-course-v1')).chapters[2].records['practice:2-practice-3']),undefined);
 await button(fret,'1弦0品').click();await button(fret,'提交答案').click();await button(fret,'下一题').waitFor();
 const fretRecord=await fret.evaluate(()=>JSON.parse(localStorage.getItem('mg-course-v1')).chapters[2].records['practice:2-practice-3']);
 assert.equal(fretRecord.first,64);assert.equal(fretRecord.attempts,1);assert.equal(fretRecord.correct,true);await fret.close();
 console.log('PASS wrong-string E4 rejected without recording; required-string E4 accepted');

 // Independent expectations: these are the eight-note melodies named by the UI,
 // not values read from the curriculum answer key. Observe real WebAudio scheduling.
 const sequences=[['听参考（须完整播放）',[60,64,62,67,65,64,62,60]],['试听选项 2',[60,62,64,67,65,64,62,60]],['试听选项 3',[60,64,62,67,65,62,64,60]]];
 const audio=await fresh();await button(audio,'听觉比较').click();
 for(const speed of [1,1.5]){
  await audio.locator('#speed').selectOption(String(speed));
  for(const [label,notes] of sequences){
   await audio.evaluate(()=>{window.audioAudit.starts=[];});await button(audio,label).click();
   await audio.waitForFunction(()=>window.audioAudit.starts.length===8);
   const starts=await audio.evaluate(()=>window.audioAudit.starts);
   assert.equal(starts.length,notes.length);
   for(let i=0;i<notes.length;i++){
    assert.ok(Math.abs(starts[i].frequency-440*2**((notes[i]-69)/12))<.001,`${label}, speed ${speed}, note ${i}`);
    if(i)assert.ok(Math.abs(starts[i].time-starts[i-1].time-.65*speed)<.00001,`${label}, speed ${speed}, interval ${i}`);
   }
   await complete(audio);
  }
 }
 await audio.close();console.log('PASS real WebAudio reference and two distinct candidate sequences, normal/slow pitch and spacing');

 for(const scenario of ['failure','stop','speed','candidate']){
  const page=await fresh();await button(page,'听觉比较').click();await page.locator('[data-option="0"]').click();
  if(scenario==='failure')await page.evaluate(()=>{window.audioAudit.failNext=true;});
  await button(page,'听参考（须完整播放）').click();
  if(scenario==='failure')await page.getByText('声音未能启动或播放被中断，请再次点击重试。',{exact:true}).waitFor();
  else{
   await page.waitForFunction(()=>window.audioAudit.starts.length===8);
   if(scenario==='stop')await button(page,'停止声音').click();
   if(scenario==='speed')await page.locator('#speed').selectOption('1.5');
   if(scenario==='candidate'){await button(page,'试听选项 2').click();await complete(page);}
  }
  await denied(page);await recover(page);await page.close();console.log(`PASS ${scenario}: interrupted reference blocked without record; complete replay recovers`);
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
