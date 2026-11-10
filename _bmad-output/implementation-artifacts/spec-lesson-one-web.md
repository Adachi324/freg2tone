---
title: 第一节视听试学
status: in-review
route: oneshot
created: 2026-11-05
---
<frozen-after-approval>
## Intent
用户已授权仅实现第一节静态网页，提供指板与声音示范、换起音练习、独立听觉验证、隔天新题复测。记录首答、提示和重试，浏览器本地保存恢复。听觉测试不显示目标音或位置，允许重听与试弹；实际演奏不作通过声明。
</frozen-after-approval>
## Implementation Notes
入口 app/public/lesson-1/index.html，规则 app/public/lesson-1/model.js。复用 Vite 静态资源发布，不改游戏。测试公共规则边界：首次答案封存、提示记录、次日开放与恢复。使用本机日历日期，跨午夜开放；不是24小时延迟。无后端、无不可逆操作。

## Tasks & Acceptance
- [x] app/public/lesson-1/index.html：教学、指板、Web Audio、持久化、独立提交及中文反馈。
- [x] app/public/lesson-1/model.js：日期和首次答案记录公共规则。
- [x] app/tests/lesson-web.test.mjs：失败测试先行，验证首答封存和次日门槛。
- [x] app/tests/lesson-browser.mjs：真实 Chrome 自动化验证。
- Given 提示后未提交，when 刷新并正确提交，then 记提示后完成。
- Given 隐藏听觉题，when 未完整听参考就提交，then 拦截且不计答题次数。
- Given 当堂两组完成，when 下一自然日访问，then 开放不同材料复测。
- Given 首答错误，when 重试成功，then 保留首次答案并记重试后完成。
- Given 学习页播放示范，when 音符响起，then 对应指板位置高亮；独立听觉阶段不显示目标高亮或音名。

## Review Triage Log
主Agent进行了 Standards/Spec 审查。已修正提示未提交刷新丢失、听觉播放门槛、切页停止音频、完成日封存、英文结果标签；补充短句与小星星以及示范同步高亮。音名采用半音表，练习目标隐藏；当前演示G起音不涉及三度等音拼写错误，非G目标不展示拼写，记录页只记所选实际音高名称。

## Verification
2026-11-05 node --test tests/lesson-web.test.mjs 2/2通过；npm run build 通过。
node tests/lesson-browser.mjs 使用系统Chrome：首答、提示刷新恢复、未听拦截、播放后提交、未开放复测、跨日开放新题、390px页面无横向溢出通过，pageerror为空。
截图 app/test-results/lesson-mobile.png。
真实用户听觉表现、实琴与学习效果尚未验证。浏览器声音测试验证AudioContext与交互正常，不代表人耳听感验收。
入口 http://127.0.0.1:8877/lesson-1/，由现有Vite preview提供；构建产物已更新。

## 2026-11-10 后续改造
本记录保留第一版历史测试。当前教学及探索改造执行依据为 ../specs/spec-learning-web-v1/SPEC.md，当前测试结果见其 Story 3；旧 Chrome 结果不代表新版验收。文字模拟试学不计入网页学习记录。
