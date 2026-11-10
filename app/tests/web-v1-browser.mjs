import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
console.log('Chromium',browser.version());
const page=await browser.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
await mkdir('test-results/web-v1',{recursive:true});
await page.goto('http://127.0.0.1:8877/explore/');
await page.locator('[data-popup="key"]').click();await page.locator('[data-root="G"]').click();assert.equal(await page.locator('#settings').isVisible(),true);await page.keyboard.press('Escape');assert.match(await page.locator('#key-title').innerText(),/G/);
await page.locator('[data-popup="add"]').click();await page.locator('#add-scale').click();
await page.locator('[data-popup="add"]').click();await page.locator('#chord-root').selectOption('G');await page.locator('#add-chord').click();await page.locator('#link').click();
await page.locator('[data-string="2"][data-fret="7"]').click();
const saved=await page.evaluate(()=>localStorage.getItem('mg-explore-v1'));
await page.goto('http://127.0.0.1:8877/wiki/');await page.goto('http://127.0.0.1:8877/explore/');assert.equal(await page.evaluate(()=>localStorage.getItem('mg-explore-v1')),saved);
for(const [label,width,height] of [['desktop',1440,1000],['portrait',390,844],['landscape',844,390]]){
 await page.setViewportSize({width,height});
 for(const route of ['explore','wiki','lesson-1']){await page.goto('http://127.0.0.1:8877/'+route+'/');await page.screenshot({path:`test-results/web-v1/${route}-${label}.png`,fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route+' '+label+' overflow');}
}
assert.deepEqual(errors,[]);console.log('PASS: instant settings, Escape persistence, layers, Wiki roundtrip, 3 viewports no page overflow, no pageerror');await browser.close();
