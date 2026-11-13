---
title: 初学者课程独立内容审查与软件验证
status: done
date: 2026-11-13
---
## 内容审查
逐章读取curriculum.js（2–8章36个知识点、74题），核对MIDI（C4=60）、大调/自然小调级数、三和弦/七和弦与转位、调内进行、五声关系和指板目标。未发现当前答案音乐错误。
补充独立字面预期：G调A C B G=2 4 3 1；5 6 3 2=D E B A；Gm小三音B♭3=58/3弦3品；E大三音G♯4=68/2弦9品；F7=53,57,60,63；Amaj7=57,61,64,68；章8旋律与F→G骨架8音完整核对。
各章听觉和隔天参考音序不复用本章教学示范，隔天不复用当堂听觉参考。提示/解释包含答案但仅显式辅助或提交后出现；听觉题干未直接给正确音序/正确选项。
章8提供新4小节给谱分析、2小节8音旋律转录选择及2小节8音伴奏骨架匹配，具有真实合成声音、慢速和候选试听；属于有候选的受限扒歌，非任意录音自由听写。章3中心题已增加参考候选音，避免只凭绝对音高命名。
## 实际运行
- npm run build 通过。
- node --test tests/course-content.test.mjs tests/course-model.test.mjs：8/8通过。
- course-browser.mjs：目录1–8全部入口；2–8章教学/独立/听觉可达且全部未听拦截；2/4/6指板正确位置实际提交；桌面1440×1000、竖屏390×844、横屏844×390无整体溢出和pageerror。
- course-flow-browser.mjs：章2首答错误、提示、刷新后正确重试封存；实际逐题完成独立应用和成功参考播放后的听觉；完成日锁定；只模拟下一自然日Date、不预写正确记录，逐题完成复测。章8慢速8音参考、候选试听后成功提交。
- course-help-browser.mjs：返回目录不标辅助；同章独立/听觉两个已开始未完成题访问Wiki均标辅助，首答不覆盖。
- 浏览器使用Playwright bundled Chromium（默认安装revision1248），不是内置浏览器或真机。
- 截图：app/test-results/beginner-course/directory-{desktop,portrait,landscape}.png、chapter8-{desktop,portrait,landscape}.png。目视竖屏章8文字完整、选项与按钮可读。
## 边界
以上证明软件规则和提供的材料可运行，不证明用户实际学会、真人听辨、真实吉他演奏或长期保持。未对每章每题进行完整浏览器作答；章2为完整代表流程，2–8数据均经检查。真实内置浏览器及发布/CI证据由主Agent另行记录。

## 主 Agent 复核
- 完整既有与新增规则测试26/26通过；diff空白检查通过。
- Codex内置浏览器本次成功打开localhost:8877/course/，实际点击第二章并核验教学内容与入口；在右侧保留页面。三种尺寸交互覆盖仍为自动化Chromium模拟，不是真机。
- GitHub Actions已纳入课程规则、可达、完整代表流程、帮助标记及音频竞态回归。服务器发布脚本新增course/index.html完整性门槛；网关不变。

## 发布结果
- 代码提交：0299ac14951bcc5398b19420e9bcf1373415bcf5。GitHub Actions run 43351907686 全部通过，包含旧页面交互与本轮新增课程回归，自动部署成功。
- https://43.142.118.254/music/version.txt 与上述 SHA 一致；course/home/lesson-1/explore/wiki 均 HTTP 200，线上首页含课程目录链接。
- 文档收尾提交不改运行代码，以 [skip ci] 跳过重复部署；部署版本仍为上述已验证代码。
