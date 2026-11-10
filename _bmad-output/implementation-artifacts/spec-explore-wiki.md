---
title: 指板自由探索与关联 Wiki
type: feature
created: 2026-11-05
status: done
route: oneshot
---

<frozen-after-approval>
## Intent

用户要求先搭建自由探索与 Wiki，教学的小知识点流程以后逐步设计。自由探索以指板为主体，相关知识以侧栏呈现；Wiki 采用文章式连续阅读，具有独立入口。保持当前教学与游戏入口可用。
</frozen-after-approval>

## Implementation Notes

- 本次是一个关联知识查阅的指板工作区，本地可逆实现，无后端、迁移、部署或账户操作。沿用现有 Vite public 静态页面方式，不新增框架。
- 新增 `/explore/` 与 `/wiki/`，共享文章内容及视觉样式。教学页仅添加探索/Wiki导航，不改教学规则和本地记录。
- 实施范围：标准调弦六弦0–12品、点击发声、选主音与大调/自然小调/大小五声音阶、音名/级数/隐藏标记、播放当前音阶和停止。无测验计分或课程推进。
- 独立 Wiki 提供主题目录、文章、返回探索；侧栏关闭或更换文章保留指板选择。文章内“在指板查看”显式应用例子，不因阅读自动改指板。
- 默认沿用现有米白与深绿，指板用弦线/品线表达位置，空弦单独一列、根音有文字/形状区别。桌面侧栏并排，手机用原生模态侧面板且支持关闭/Escape与焦点返回。
- 测试边界沿用项目授权的开发细节自主决策：纯音乐模型公开函数（标准调弦、跨弦同音、跨八度、调内音名与级数），浏览器检查真实用户操作和响应式布局；不写样式快照单测。
- Given C大调，when 查看音阶，then 为 C D E F G A B；Given F大调，then 使用 B♭；Given A小调五声，then 为 A C D E G；0品与12品相隔八度。
- Given 用户选音和音阶，when 开关知识栏，then 操作状态保留；Given Wiki链接，when 刷新或返回，then 展示对应文章；Given 手机窄屏，then 页面无横向溢出，指板内部可横向滚动。
- 文件：app/public/explore/{index.html,style.css,app.js,model.js,wiki.js}、app/public/wiki/index.html、app/tests/explore-model.test.mjs；旧lesson仅加导航。
- 当前目录没有 Git 仓库，不能生成提交或差异基线；已有 CONTEXT.md 与 ADR 目录均不存在。

- 实际按职责拆分 audio.js 与 knowledge.js，并拆分布局样式 layout.css；不引入依赖。文章由独立内容任务核对并生成。

## Review Triage Log

- Standards：无发现。
- Spec / medium / patch：C♭的八度显示错误。已用spelledPitch按字母与升降号计算八度，C♭4/B♯3测试通过，Chrome复核C♭4通过。

## Verification

详见 [explore-wiki-verification.md](explore-wiki-verification.md)。5/5规则检查和构建通过，真实Chrome核心路径与四档宽度检查通过；真机与人耳听感未验。Git不可用，未提交。
