---
title: 集成验证与交付
status: in-review
date: 2026-11-10
---
## 当前软件证据
npm run build 成功；node --test tests/lesson-web.test.mjs tests/explore-model.test.mjs tests/explore-v1.test.mjs 9/9通过（主Agent最终复跑）。游戏6项由主Agent另验。
使用缓存 Playwright Chromium 147.0.7727.15（revision1217），不是系统Chrome或Codex内置浏览器。执行时设置 PLAYWRIGHT_EXECUTABLE_PATH=/Users/yichen_yang/Library/Caches/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-arm64/chrome-headless-shell。
- tests/lesson-browser.mjs：首答、提示刷新恢复、未听阻止提交、播放完成提交、日期门槛、新题及窄屏检查通过。
- tests/web-v1-browser.mjs：即时调性、浮层保持、Escape不撤销、叠加音阶和和弦、Wiki往返保留状态通过；教学/探索/Wiki分别1440×1000、390×844、844×390截图，无整体横向溢出或pageerror。
- 截图 app/test-results/web-v1/，共9张。人工查看探索竖屏发现导航与标题重叠，已送实现Agent修复，需刷新截图。
- 初次Vite dev目录URL返回游戏入口，已改用构建后的preview8877，三个目录入口正确返回目标页面。
## 验证缺口
内置浏览器主Agent三次连接超时，尚未验收。自动化不证明真实手机、实琴、人耳听感或学习效果。
现有测试未覆盖：音频启动失败、快速切换/后台停止的完整集成；每个和弦与全部把位独立音乐学预期；旧记录各版本迁移；隔天听觉新题完整流程；旋转当前音位保持可见的精确几何断言；可访问性目标隐藏逐项检查。不能将这些写成通过。

## 修复后追加验证
- 再次构建成功，重跑 web-v1-browser.mjs 全通过，9张截图已覆盖更新；目视探索竖屏 header 重叠已消除。
- 新增 tests/web-v1-edge-browser.mjs 并通过：真实第二标签页打开Wiki后未答题记辅助且首答仍为空；模拟 visibilitychange 中断参考播放后禁止提交；注入 AudioContext 构造失败后禁止提交；旋转390×844到844×390后所选2弦12品完整位于指板滚动视口内。
- 上述后台检查为事件模拟，未证明操作系统真实后台音频政策；音频失败为注入测试，未证明所有硬件故障。
- 因此上文音频启动失败、后台中断门槛、跨标签帮助、旋转几何缺口已补对应自动化证据。旧数据全版本迁移及全部音乐数据独立预期仍需按具体覆盖区分。
- 教学小步骤改造后主Agent再次执行 lesson-browser.mjs，全通过。

## 教学分步最终回归
新增 tests/lesson-steps-browser.mjs 通过：三知识点仅保留当前说明，第二/第三步刷新后停留原步；引导收起提示后刷新仍收起，正文不再显示三/四/七半音公式。最终重跑 web-v1-browser.mjs 通过并刷新全部三尺寸截图。lesson-browser 最终版本由主Agent另跑通过。
