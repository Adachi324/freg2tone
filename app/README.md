# 调音花园 · 声音之桥

单场景技术样本：固定立体花园中的纸面说明 → 示例与练习 → 收起教学 → 材料挑战 → 开桥通行。C/D/E 匹配是技术测试夹具，不是完整教案或学习效果测试。

## 运行

已在 Node 25.8.2、npm 11.11.1 验证。使用支持原生 TypeScript type stripping 的 Node 版本运行规则测试。

```sh
cd app
npm ci
npm run dev
```

开发地址为 http://127.0.0.1:8877 。制作供手机访问的静态构建：

```sh
npm run build
npm run preview
```

手机与电脑连接同一局域网，在 Safari 中打开终端显示的 Network 地址并横屏。预览服务只服务 `app/dist`；没有账号、上传、后端或持久存档。刷新会从头开始。停止预览进程后地址失效，尚未公网部署。

## 验证

```sh
npm test
npm run build
npm run test:browser
```

浏览器测试默认调用 macOS 上已安装的 Google Chrome；其他环境可用 `CHROME_PATH` 指定浏览器可执行文件。测试使用当前静态构建，改动后先 build。Playwright 不代表 iPhone Safari 真机。

手机体验重点：点击区域是否好用、说明是否易读、收起说明后能否自然继续操作、音符与亮起是否跟手；分别试一次后台返回及静音。测试使用 `932×430` 等 CSS 视口是布局检查，不是设备仿真证明。

## 实现与素材

- `src/game.ts`：唯一规则状态与命令转换；`tests/game.test.ts` 测试该公开接口。
- `src/main.ts` / `style.css`：DOM 教学界面、输入和暂停协调。
- `src/scene.ts` / `art.ts`：真实几何、桥枢轴、角色路径；程序生成纸/木/草/水纹理及角色脸，均为本样本原创代码，无外部素材下载。可直接修改参数，不依赖模型生成平台。
- `src/audio.ts`：Web Audio 合成短音和纸张拟音，不采集麦克风。

只有 Three.js 是应用运行依赖；没有 UI 框架、全局状态库、通用关卡系统。文字使用系统字体；纸纹为内联 SVG。后续替换美术不需要改变答案规则。风格样本待用户评审，并不保证已经达到先前概念画的美术精度。

技术依据：[Vite 官方起步](https://vite.dev/guide/)、[Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)、[Web Audio 恢复](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/resume)。依赖版本以 package-lock.json 为准，不依赖预研中的 latest 快照。
