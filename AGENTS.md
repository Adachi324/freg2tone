# mg_ground

全局规则来源：`/Users/yichen_yang/.codex/AGENTS.md`。本文件只补充项目约定。

## 项目流程

启动新需求、规划、实施、审查或交付时，先读取 `docs/agents/workflow.md`，按当前阶段推进。BMAD 管理需求、规格、任务和实现记录；Matt 技能补充追问、领域概念、模块设计、测试和审查。

规格和任务沿用 BMAD 的现有产物。项目采用 spec-backed 路线：每个 epic 的 `SPEC.md`、`stories.yaml` 和关联 Story 记录是执行依据。产品产物尚未形成时从 brainstorm 开始。

首次涉及领域概念时按需创建根目录 `CONTEXT.md`，只保存术语；重大技术取舍按需记录在 `docs/adr/`。修改相关代码前读取已有术语和对应 ADR。

实施入口为 `bmad-build`。核心业务行为采用 Matt `tdd`，测试边界在规格中确定。审查使用已配置的 BMAD 流程，不再自动追加第二轮完整 Matt 审查。只有独立且有明确收益的工作才委派；共享状态与连续决策由当前 Agent 处理。

当前已完成首轮脑暴与产品简报，PRD 保持草稿。最小技术样本已在 `app/` 实现：同一固定立体花园内的纸面教学/练习→收起教学后立即挑战（2026-10-16取消整场维度翻转），2026-10-27用户已认可当前体验方向；iPhone 13 Pro Max真机验收与学习效果仍待验证。恢复时优先读取 `_bmad-output/specs/spec-demo-technical-probe/SPEC.md`、`stories/2-continuous-garden.md`、该工作区 `.memlog.md` 及 `_bmad-output/implementation-artifacts/probe-v2-verification.md`；上游PRD/UX位于 `_bmad-output/planning-artifacts/`，区分已确认方向与助手提案。用户授权开发细节自主决策，要求避免过度设计；只围绕已确定范围迭代，不将完整MVP作为Demo前置条件。候选技术的正式架构尚未定案，公网部署尚未配置。

2026-10-31首个三音学习单元已按三个任务顺序实现，仍只新增lesson.ts并扩展既有模块。恢复入口为 `_bmad-output/specs/spec-note-names-first-unit/SPEC.md`、全部companions、stories及`.memlog.md`；当前软件证据见 `_bmad-output/implementation-artifacts/note-unit-verification.md`。Story1/2为done，Story3功能完成但保留in-review：规则6/6、构建与配置审查完成，实际序列音高定向连续2/2通过；最终完整浏览器回归受系统反复睡眠干扰尚未全绿，须在清醒环境复核，不扩展功能或降低断言。体验入口仍为localhost:8877，真机连通性和学习效果待验。该架构只约束本单元，不代表全产品定案。
