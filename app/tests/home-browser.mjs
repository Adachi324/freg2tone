import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.env.TEST_BASE||'http://127.0.0.1:8877';
await mkdir('test-results/home',{recursive:true});
for(const [name,width,height] of [['desktop',1440,900],['portrait',390,844],['landscape',844,390]]){
 await page.setViewportSize({width,height});await page.goto(base+'/home/');await page.waitForTimeout(800);
 assert.equal(await page.locator('#wires path').count(),6);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:`test-results/home/${name}.png`,fullPage:true});
}
await page.locator('#enter').click();await page.waitForURL('**/explore/');await page.goBack();await page.locator('#enter').click();await page.waitForURL('**/explore/');await page.locator('.brand').click();await page.waitForURL('**/home/');
await page.getByRole('link',{name:'知识 Wiki',exact:true}).click();await page.waitForURL('**/wiki/');await page.locator('.brand').click();await page.getByRole('link',{name:'章节学习',exact:true}).click();await page.waitForURL('**/lesson-1/');await page.getByRole('link',{name:'首页',exact:true}).click();await page.waitForURL('**/home/');
await page.route('**/wiki/',async route=>{await new Promise(r=>setTimeout(r,1200));await route.continue();});
await page.locator('#enter').click();await page.getByRole('link',{name:'知识 Wiki',exact:true}).click();await page.waitForURL('**/wiki/');await page.unroute('**/wiki/');
const reduced=await browser.newPage({reducedMotion:'reduce'});await reduced.goto(base+'/home/');await reduced.locator('#enter').click();await reduced.waitForURL('**/explore/');
const noJS=await browser.newPage({javaScriptEnabled:false});await noJS.goto(base+'/home/');await noJS.locator('#enter').click();await noJS.waitForURL('**/explore/');assert.deepEqual(errors,[]);
console.log('PASS home layouts, six strings, real navigation, back/re-enter, reduced motion, no-JS links');await browser.close();
