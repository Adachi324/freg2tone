---
title: 回听与复玩完整学习单元
type: feature
created: 2026-10-30
status: in-review
route: dispatch
baseline_commit: NO_VCS
review_loop_iteration: 0
---

# 回听与复玩完整学习单元

依赖：Story2已实现且相关检查通过。 能力：CAP-4；CAP-1至CAP-3的完整体验回归。

<frozen-after-approval reason="用户已认可单元方案并授权自主确定最小实现和任务；本记录尚未实施">

## Intent

**Problem:** 通关后还缺少对自己的声音组合和完成方式的回顾，也缺少第二次应用与完整验证材料。

**Approach:** 展示逐题完成方式与声音序列，支持复听和另一套固定复玩，并交付可核对的软件验证及人工观察记录。

## Boundaries & Constraints

读取父SPEC的全部companions；受AD-1至AD-4约束。单花园、三音、当前页内存；不扩展为课程引擎、账号、持久存储或新场景。Story之间顺序执行，后续只替换明确标注的临时门槛。

## Acceptance Criteria

- **AC-1:** 结果按逐题事实区分首次独立、重试、提示后完成；展示顺序与提示/错误事实，不能把猜对表述为掌握。
- **AC-2:** 结果页复听自己的最终序列，不重计答题、不再次开桥；无声同步高亮，复听中断后停在结果页可再次点播。
- **AC-3:** 再玩一次轮换到mi→E、D→re、do-mi-do→C-E-C；重复音可操作；新run不继承上轮提示或错误，最近一轮摘要仍只读可查看。
- **AC-4:** 完整运行规则检查、构建与浏览器回归，截图不覆盖历史样本；检查横屏槽位/教程/按钮可达、命中区不重叠、回看焦点和触摸取消行为。
- **AC-5:** 真机检查和学习观察有独立记录栏；未实际执行则明确待验，不妨碍如实交付软件版本，也不能把整个学习验证标为通过。

</frozen-after-approval>

## Tasks & Acceptance

- [x] `app/src/game.ts`、`lesson.ts`、`main.ts`：新增结果摘要、只读复听与run奇偶任务选择；新run记录与上一轮只读摘要分离。
- [x] `app/src/main.ts`、`style.css`：结果页可见顺序/对应标记，复玩清空当前选择；提供刷新将重开体验的简短说明。
- [x] `app/tests/game.test.ts`、`browser.test.ts`：覆盖首答/重试/提示三种结果、正确提交后（含播放期间）回看不改历史、第二套重复音与陈旧播放回调、移动布局和生命周期。
- [x] `_bmad-output/implementation-artifacts/note-unit-verification.md`与note-unit-*截图：记录实际命令结果/版本与可玩入口，列出尚未通过的真机检查、人工基线/后测/选择理由观察表。

## Verification

在app/执行`npm test`、`npm run build`与`npm run test:browser`，按本Story实际变化更新断言并核对新构建。核心规则先红后绿，视觉低影响改动直接检查；无新问题不重复扩大测试。保留已有生命周期有效覆盖，截图和触控模拟不替代iPhone真机或学习观察。

## Implementation Notes

2026-10-31：功能已实现；下列历史记录保留阶段证据。最终状态以本节收尾说明及note-unit-verification.md为准。

## Review Triage Log

- Standards/Spec：0项发现，核对的是三个顺序增量最终组合，未把Story1临时门槛误当最终需求。
- Edge：代码路径审查0项发现；初次claims传入父SPEC与提示模板章节不匹配，改传当前Story并要求只补claims核对，不重跑全部审查。
- Verification gap — medium / patch：现有真实音频测试仅覆盖单音点选，组合与回听用例静音，未断言实际音高顺序。用户会听到错误序列却看到正确反馈的回归无法被捕获；复用已有AnalyserNode测试探针补充正确/错误组合及重复音回听，无新增应用接口。
- 本轮浏览器失败修正：结果不变断言取值使用innerText、匹配却默认textContent，换成同一可见文本口径；不改变期望记录或业务行为。

- 审查闭环：Edge用更正Story路径完成claims补核对仍0发现；Verification复核新增实际序列音高用例，确认原缺口关闭。最终完整回归受系统睡眠干扰未获得全绿结果，待清醒环境复核。

- 收尾：三个功能增量、结果记录和验证材料已交付；AC-4最终完整回归仍待复核，因此保留in-review，不将功能完成等同所有验收完成。真实序列音高在睡眠前连续2/2通过；最终两轮失败与系统睡眠证据分别留存。
