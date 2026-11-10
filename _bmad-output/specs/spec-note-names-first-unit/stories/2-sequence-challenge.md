---
title: 用双向对应和三音组合打开桥
type: feature
created: 2026-10-30
status: done
route: dispatch
baseline_commit: NO_VCS
review_loop_iteration: 0
---

# 用双向对应和三音组合打开桥

依赖：Story1已实现且相关检查通过。 能力：CAP-3完整；延续CAP-2的错误与帮助行为。

<frozen-after-approval reason="用户已认可单元方案并授权自主确定最小实现和任务；本记录尚未实施">

## Intent

**Problem:** 只有单音正向匹配，不能验证反向理解和组合应用。

**Approach:** 加入唱名材料的反向匹配与三个可编辑槽位；只在三项挑战全部完成后通行。

## Boundaries & Constraints

读取父SPEC的全部companions；受AD-1至AD-4约束。单花园、三音、当前页内存；不扩展为课程引擎、账号、持久存储或新场景。Story之间顺序执行，后续只替换明确标注的临时门槛。

## Acceptance Criteria

- **AC-1:** 首轮re→D通过后只响应局部机关，桥保持关闭；随后E题显示do/mi/re并以mi对应内部E，没有字母纹理或预听文案泄露答案。
- **AC-2:** 三音指令持续可见；E/D/C正确，C/D/E顺序错误；可逐槽替换，材料可重复放入，规则接受目标C/E/C的复玩任务。
- **AC-3:** 不完整槽位不计提交；完整提交播放实际选择并锁住操作，重复点击不能重复计分，错误播放结束后可修正。
- **AC-4:** 完整单元只有全部挑战通过且最终播放完成才开桥；错误题不推进，题切换保留已完成记录；正确提交接受后即封存该题完成方式，播放期间再回看不追改。
- **AC-5:** 播放中回看/竖屏/后台停止发声，恢复保留组合并重播同一快照；过期回调不能开桥或推进新题，无声与减少动效也可完整完成。

</frozen-after-approval>

## Tasks & Acceptance

- [x] `app/src/game.ts`及规则测试：实现挑战任务推进、三槽顺序/重复音判定、有效提交快照及播放结束保护。
- [x] `app/src/main.ts`、`scene.ts`、`style.css`：换标签而不换声音ID，添加三个槽位、试运行/继续入口与局部锁扣反馈；材料源不被消耗。
- [x] `app/src/main.ts`与`audio.ts`：复用帧循环和短音实现唯一序列播放，绑定run/task/submission并按槽位索引高亮；处理暂停取消和同提交重播。
- [x] `app/tests/browser.test.ts`：跑通反向题、错误序列修正和最终通行；直接检查渲染标签，不只检查DOM。

## Verification

在app/执行`npm test`、`npm run build`与`npm run test:browser`，按本Story实际变化更新断言并核对新构建。核心规则先红后绿，视觉低影响改动直接检查；无新问题不重复扩大测试。保留已有生命周期有效覆盖，截图和触控模拟不替代iPhone真机或学习观察。

## Implementation Notes

2026-10-31：功能已实现；下列历史记录保留阶段证据。最终状态以本节收尾说明及note-unit-verification.md为准。

- 2026-10-30：实现全部挑战门槛与三槽，规则5/5通过。浏览器首轮9通过/2失败；修正辅助方法和小屏排布后，恢复用例与四尺寸布局定向复查通过。失败证据及修正写入note-unit-verification。与整个单元一起进行最终BMAD审查，尚未交付用户验收。

- 收尾：本增量功能及阶段检查完成，最终组合通过配置的Standards/Spec与Edge审查；Story1临时门槛已由Story2完整门槛替换。最终全量回归与用户体验由Story3跟踪，详见note-unit-verification.md。
