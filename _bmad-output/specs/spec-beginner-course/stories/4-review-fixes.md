---
status: done
baseline_commit: db722d92eb61a6e620aa5ae7cedfe3d1a7df2b2a
---
# 第2–8章审查与修复

用户授权直接修复并回归后更新线上。沿用课程SPEC，不扩展课程范围。

## 确认问题与验收
- [x] 多标签旧快照覆盖持久化记录（high）：A提交后B聚焦、答题、切章，不得抹掉首答、辅助、完成日；保存不能制造重试。通过课程UI与持久化公开边界复现并验证。
- [x] 第5章迁移题复用示范（medium）：改为C–F–Am–G迁移G–C–Em–D。
- [x] 第7章隔天题复用当堂G7解决（medium）：改为D7→G的F♯→G/C→B。
- [x] 两道改题采用v2标识；旧题记录保留可读，不作为新题成绩；保留已获得的完成日期与隔天资格。
- [x] 补课程浏览器验证（medium gaps）：错误弦同音拒绝且不记提交；参考和不同候选实际调度音序/正常慢速时距；失败、停止、切速、快速替换参考后不解锁，完整重播恢复。

## 审查决议
四层均完成：Standards无具体问题；Edge确认多标签覆盖；Acceptance确认两题复用；Verification Gap确认三类缺口。显式请求提示有help标记，符合已授权帮助行为，不认定为独立题自动泄露。题库音高、命名、级数、11道指板目标及28道听觉参考核对未发现其它具体错误。

## Code Map
课程运行/存储：app/public/course/app.js、model.js；内容：curriculum.js；验证：app/tests/course-*.mjs；CI：.github/workflows/deploy.yml。旧第一章记录不改。多标签合并须最小实现且有真实浏览器证据。

## 修复实现与复核
- app.js保存前合并最新持久化记录，提交/提示前同步；storage事件只更新模型与提示，不重绘中断音频。旧页已完成题的再次提交显示专门提示。
- model.js合并首答、帮助、完成日期与各题记录；重复同步幂等。真正同时从未答状态提交不同首答时，至少计2次且展示方式同时核对首答与正确答案，不能错标独立首答通过。内部attempts为极端并发情况下的下界，并非精确操作审计日志；UI不显示精确次数，独立/重试/辅助分类有约束。
- 旧版题记录可在学习记录查看；两道新材料有独立v2标识，已有记录时明确提示材料更新。
- Standards初审无具体发现。内容审核逐音核对后仅确认2处复用；修复再次核对答案和版本映射通过。追加复核发现并发合并的分类问题已补测修复。

## Review Triage Log
|发现|来源|裁决与处理|
|---|---|---|
|旧标签focus写回覆盖记录|Edge|high / patch：浏览器红灯证实首答变undefined，修复后绿|
|第5章直接复用示范迁移|Acceptance|medium / patch：换新功能顺序，v2记录|
|第7章隔天复问原示范解决|Acceptance|medium / patch：换根音解决，v2记录|
|错误弦同音缺测试|Gap|medium / patch：补失败与成功路径，现有实现正确|
|参考/候选实际调度缺测试|Gap|medium / patch：独立频率和时距预期通过，现有实现正确|
|音频失败和取消缺测试|Gap|medium / patch：失败/停止/切速/快速替换与恢复通过，现有实现正确|
|合并错误首答却显示独立完成|修复复核|medium / patch：不同首答至少2次，分类同时核对首答|
|显式提示含答案|Acceptance讨论|false：用户允许明确标记的帮助，非自动泄露；现有help记录符合要求|

## 验证边界
规则测试以实际材料预期与合并行为为准；课程浏览器通过可观察UI/持久化记录检查，不用复制判题实现作断言。音频观测为WebAudio实际调度频率/时间，不是人耳听辨。Codex内置浏览器本轮两次启动超时，不能宣称内置浏览器验收或真机通过；本轮采用Chromium自动化。真人学习、实琴、长期保持仍未验证。

## 本轮实际验证
- 完整领域/判定规则28/28通过；新增内容用例修复前失败、修复后通过。
- npm run build、git diff --check通过。
- 在本次最终构建的preview上运行course-race、course-help、course-tabs、course-browser、course-flow、course-audit六套浏览器脚本全部通过。
- 2–8入口/未听门槛，2/4/6屏幕指板，2章完整作答/次日复测，8章慢速整句均覆盖；桌面/竖屏/横屏无整体溢出或pageerror。
- 专项真实音频调度参考/两个不同候选八音，正常.65秒与慢速.975秒间隔通过；失败/停止/切速/候选替换拦截及恢复通过。
- 新增course-tabs与course-audit纳入GitHub Actions。截图app/test-results/beginner-course/cr-chapter5-desktop.png及既有三尺寸截图。
