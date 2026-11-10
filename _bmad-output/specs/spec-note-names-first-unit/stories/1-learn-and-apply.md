---
title: 在花园里认识三个音并独立应用一次
type: feature
created: 2026-10-30
status: done
route: dispatch
baseline_commit: NO_VCS
review_loop_iteration: 0
---

# 在花园里认识三个音并独立应用一次

依赖：无；本单元第一项。 能力：CAP-1、CAP-2；CAP-3正向匹配。

<frozen-after-approval reason="用户已认可单元方案并授权自主确定最小实现和任务；本记录尚未实施">

## Intent

**Problem:** 现有样本只有音名字母与C找C，不能教会两种标记的关系。

**Approach:** 复用花园，将介绍、同音双标签示范、三个引导练习和一题撤表挑战串起来，形成可独立试玩的第一步。

## Boundaries & Constraints

读取父SPEC的全部companions；受AD-1至AD-4约束。单花园、三音、当前页内存；不扩展为课程引擎、账号、持久存储或新场景。Story之间顺序执行，后续只替换明确标注的临时门槛。

## Acceptance Criteria

- **AC-1:** 读完介绍后知道本节字母音名和唱名的用途及C大调语境；同一材料双标签显示时只发同一个音，无声仍有同步提示。
- **AC-2:** 三个引导练习各自完成才出现进入挑战入口；未放入或放错不通过，修正不要求重启。
- **AC-3:** 撤去对应表，材料C/D/E下根据re选D，主动试运行正确后可开桥；错误不开桥，选择/放入不自动提交。
- **AC-4:** 每题有效首答与帮助独立记录，回看保留槽位；重新提交或暂停恢复不重复计数。
- **AC-5:** 当前单向题开桥仅为本Story阶段交付；Story2替换，不作为整个CAP-3完成或学习效果证据。

</frozen-after-approval>

## Tasks & Acceptance

- [x] `app/src/lesson.ts`与`audio.ts`：集中三音ID/显示名/频率和本节固定题目，声音模块引用同一声音定义。
- [x] `app/src/game.ts`：先以公共接口行为测试锁定三题练习、正向挑战、有效提交与首答/求助记录，再实现；保留暂停/过期事件防护。
- [x] `app/src/main.ts`、`scene.ts`、`art.ts`、`style.css`：扩展现有faceTexture的唱名/双标签排版，同步双标签示范、单槽放入与主动试运行；统一中性材料颜色，更新3D纹理、DOM与可访问名称。
- [x] `app/tests/game.test.ts`、`browser.test.ts`：更新现有C答案假设，验证完整本增量及无声、帮助、错误替换。

## Verification

在app/执行`npm test`、`npm run build`与`npm run test:browser`，按本Story实际变化更新断言并核对新构建。核心规则先红后绿，视觉低影响改动直接检查；无新问题不重复扩大测试。保留已有生命周期有效覆盖，截图和触控模拟不替代iPhone真机或学习观察。

## Implementation Notes

2026-10-31：功能已实现；下列历史记录保留阶段证据。最终状态以本节收尾说明及note-unit-verification.md为准。

- 2026-10-30：已完成单向挑战增量，规则3/3、构建、Chrome10/10通过。红→绿首例记录为旧规则无提交快照导致失败，增加本节规则后通过。浏览器截图已生成；截图需等待面板动画结束的修订随下一次检查执行。后续Story按用户授权连续实施，三项共同变更在最终提交体验前执行BMAD配置审查；当前非最终交付。

- 收尾：本增量功能及阶段检查完成，最终组合通过配置的Standards/Spec与Edge审查；Story1临时门槛已由Story2完整门槛替换。最终全量回归与用户体验由Story3跟踪，详见note-unit-verification.md。
