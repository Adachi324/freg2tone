# BMAD + Matt 工作流

## 职责与产物

BMAD 是主流程。Matt 是按阶段使用的方法库；每个阶段保留一份正式产物。

| 阶段 | 使用方式 | 完成条件 |
| --- | --- | --- |
| 探索方向 | `bmad-brainstorming` | 得到候选方向并选定待验证方向 |
| 验证想法 | 按需 `bmad-deep-recon`；`grill-me` / `grilling` 只追问尚未解决的决策；`bmad-product-brief` 整理结论 | 目标用户、痛点、替代方案明确，事实与假设分开 |
| 定义 MVP | `bmad-prd` | 范围、非目标、用户场景与验收标准明确 |
| 体验设计 | `bmad-ux`；复杂概念使用 `domain-modeling` | 关键用户流程和交互状态可检查 |
| 技术设计 | `bmad-architecture` + `codebase-design`；必要时 `grill-with-docs`；`bmad-spec` 固化规格 | 接口、数据、错误处理和测试边界足以指导实现 |
| 拆解 | BMAD Story Breakdown，采用纵向切片 | 每项任务有依赖、验收标准，能独立演示或验证 |
| 实现 | `bmad-build`，核心行为采用 `tdd`，难复现问题采用 `diagnosing-bugs` | 可运行增量、测试与验证证据齐备 |
| 审查与验收 | BMAD 内建审查已接入 Matt Standards / Spec 视角；`bmad-walkthrough` 支持检查成果 | 需求、代码与运行行为一致，核心场景实际跑通 |
| 发布 | 接入选定平台的 CI/CD 与部署工具 | 用户可访问，核心任务可完成，部署版本、健康检查及恢复方式有证据 |
| 复盘 | `bmad-retrospective`，结合真实用户反馈 | 整体验收结论、改进项和下一轮优先级明确 |

## 衔接规则

- 规划输出默认位于 `_bmad-output/planning-artifacts`；实现输出默认位于 `_bmad-output/implementation-artifacts`。具体规格位置以 BMAD 实际创建的路径为准，通过引用衔接。
- 采用 spec-backed 路线，使用每个 epic 的 `SPEC.md`、`stories.yaml` 和 Story 记录。暂不建立另一份工单清单；接入远端 tracker 时再明确唯一状态来源。
- Matt `to-spec`、`to-tickets`、`implement` 不作为常规入口；纵向切片原则直接用于 BMAD 拆解，避免重复规格、任务和实现流程。
- Matt `grill-with-docs` 依赖 `grilling` 和 `domain-modeling`，已一并安装。每轮只询问会影响当前范围或设计的未决问题，已确认内容沿用。
- 在技术规格中确定测试边界和关键行为。业务逻辑使用有独立预期结果的行为测试；可逆低影响改动采用必要直接检查。
- Build 的正式和 oneshot 路线均接入两维审查视角。复用本轮已经有效的验证证据，只有新改动、失败或未解疑点才扩大或重跑检查。
- 每次结束实施，记录完成项、验证结果、未解决问题和下一步；恢复时先读当前规格和关联 Story 状态。
- 部署能力尚未配置。MVP 确定后选择目标环境，早期跑通最小部署链路；合并代码或测试通过本身不构成交付。

## 安装与维护

- BMAD：稳定版 `6.12.0`，项目级 `.agents/skills/bmad-*` 与 `_bmad/`。帮助入口为 `bmad-help`。
- Matt：用户级 `/Users/yichen_yang/.codex/skills/`，选择 `grill-me`、`grilling`、`grill-with-docs`、`domain-modeling`、`codebase-design`、`tdd`、`diagnosing-bugs`、`code-review`。
- 原版技能保持原样；组合配置在 `_bmad/custom/bmad-build.toml` 和 `_bmad/custom/bmad-code-review.toml`。升级后重新检查配置渲染和技能发现。
- 安装来源、版本和备份位置记录在 `docs/agents/skill-installation.json`。
