---
title: 可运行的单场景音乐机关技术样本
type: feature
created: 2026-10-15
status: done
baseline_commit: NO_VCS
route: dispatch
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-demo-technical-probe/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-demo-technical-probe/implementation.md'
  - '{project-root}/_bmad-output/specs/spec-demo-technical-probe/acceptance.md'
---

<frozen-after-approval reason="用户授权实现细节自主决策；完整范围以父SPEC及伴随文件为准">

## Intent

**Problem:** 静态画稿无法验证音乐操作、手绘场景和真实3D转场。
**Approach:** 制作单屏可玩样本，从说明、示范、练习进入固定镜头挑战，材料改变机关并让角色通过。用户授权细节由助手把控，禁止过度设计；完成后再体验。

## Boundaries & Constraints

**Always:** 同场景三材料一机关；真实几何；可读说明；声音/无声模式；手机横屏优先；核心规则TDD；保存可编辑资产来源。
**Never:** 后端、账号、编辑器、通用引擎、第二关、正式课程或学习效果声明。未经真机操作不能宣称iPhone通过。

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| 错误/正确 | Given挑战中，When D/C提交 | Then D留原地可替换；C只开桥一次，桥就绪角色再通过 | 无选择只提示 |
| 中断/回看 | Given动作中，When后台/说明/竖屏 | Then停声、暂停，继续保留进度 | 不补播旧声 |
| 旧事件 | Given复玩后，When旧attempt完成 | Then忽略，不推进新流程 | 不报致命错误 |
| 降级 | Given声音/渲染失败，When进入 | Then无声可继续或明确重载入口 | context丢失停止声音 |

</frozen-after-approval>

## Code Map

- 现有工程只有BMAD及设计文档，无package.json、应用代码、Git仓库；不修改旧画稿。
- `_bmad-output/planning-artifacts/ux-designs/ux-mg_ground-2026-09-20/`：沿用教学UI和空间组织，完整插画仅作参考。
- `app/`：唯一应用目录，开发服务不把根目录文档暴露为网站资源。

## Tasks & Acceptance

**Execution:**
- [x] `app/package.json`, `app/tsconfig.json`, `app/index.html`, `app/vite.config.ts` — 建立vanilla TypeScript构建，固定依赖。
- [x] `app/src/game.ts`, `app/tests/game.test.ts` — 先红后绿实现规则公共接口，覆盖上述I/O。
- [x] `app/src/scene.ts`, `app/src/art.ts` — 同源可编辑场景、转场、固定镜头、桥/角色动作及手绘样本。
- [x] `app/src/audio.ts` — 短音、纸张拟音、解锁与停声恢复。
- [x] `app/src/main.ts`, `app/src/style.css` — 说明、材料交互、覆盖层、手机适配和错误入口。
- [x] `app/tests/browser.test.ts`, `app/README.md` — 浏览器检查、运行入口与资产说明。
- [x] `_bmad-output/implementation-artifacts/probe-verification.md` — 记录证据与待真机项。

**Acceptance Criteria:**
- Given首次进入，when点目标，then角色靠近后可阅读、看示范、亲手练习，声音和材料标记对应。
- Given练习完成，when进入挑战，then同对象展开为真实3D且输入锁定，结束后镜头固定；减少动效到相同终态。
- Given横屏，when触摸或鼠标操作，then命中正确、说明不穿透；竖屏时暂停并提示。
- Given成品样本，when浏览器验收，then运行与核心回归通过；手绘观感和手机声音手感单独交给用户评审。

## Implementation Notes

- 2026-10-15：无不可逆操作；新建约10个应用文件，无公共服务接口。技术默认、测试边界及不增加检查点均由用户授权助手决定。真机系统版本/最终体验是验收输入，不是实施阻塞。
- 按官方Vite/Three/Web Audio文档核对起步要求；实际版本以安装锁文件为准。已检查Node v25.8.2、npm 11.11.1。

## Spec Change Log

## Review Triage Log

| 来源 | Verdict | 证据与处理 |
|---|---|---|
| Standards/Spec：纸声恢复 | medium | main只在music=true恢复context，paper单独开时确会失声；patch，分离解锁上下文与音乐偏好并补回归。 |
| Standards/Spec：脚本加载失败 | medium | index只有模块内错误UI，主模块下载失败不可恢复；patch，在入口脚本外提供加载错误与刷新入口。 |
| Edge：延迟解锁 | medium | await后只检查paused，旧回调可在demo推进next且覆盖静音选择；patch，阶段/run与请求序号保护。 |
| Edge：恢复期间再次暂停 | medium | await后直接resume会清除新suspend；patch，生命周期序号与可见性再次检查。 |
| Edge：完成后回看 | low | helpUsed在complete被改但panelKey不更新；公开规则复现失败。patch，仅挑战答题期间求助影响记录，通关后回看不追溯更改。 |
| Edge：取消触摸后键盘 | low | cancelledPointer未在keydown清除，键盘click会被吞掉；patch，键盘事件清除旧触摸标记。 |
| Verification：几何结果自动断言缺失 | low | 自动测试只验phase，缺自动画面断言是真实回归缺口；当前前后截图已由主Agent目视确认桥水平、角色抵达。拒绝为测试新增生产场景观察接口（非直接修正且扩大接口），保留人工视觉检查和流程录像作为本样本证据，不能把phase测试声称为几何验收。 |
| Verification：音高/实际信号缺失 | medium | start计数不证明信号与音高；patch，在真实Web Audio输出路径采样，校验三种音高及静音，仍不冒充声学延迟测量。 |
| Standards证据备注：哈希/录像 | low | 补构建哈希与浏览器录制；真机与用户观感继续明确待测。 |

## Verification

- `cd app && npm test`：规则公共接口行为通过。
- `cd app && npm run build`：类型检查与静态构建通过。
- `cd app && npm run test:browser`：浏览器流程、无错误、触控/暂停/复玩检查通过。
- 实际查看浏览器截图，交付访问入口；iPhone真机结果须用户实测后记录。

## Scene 子任务契约（当前实施用）

仅独立委派场景美术：负责 `app/src/scene.ts` 与 `app/src/art.ts`，不改其他文件。输入是本Story及其context、已认可的scene-layout-base-2026-09-28.png（须查看）。交付可编译Three.js真实几何场景、手绘墨线/纹理、角色、桥、三枚材料及空间展开；不加依赖、不做整图背景代替几何。完成判据：类型检查可通过、接口与下文一致、资产程序源可编辑。主Agent负责其余文件和最终浏览器视觉检查。

固定接口（在scene.ts导出）：`type MaterialId = 'C'|'D'|'E'`；`type SceneView = { depth:number; approach:number; bridge:number; travel:number; selected:MaterialId|null; installed:boolean; order:MaterialId[]; pulse:MaterialId|null; time:number }`。所有进度0..1，time秒。`createScene(canvas:HTMLCanvasElement)` 返回 `{ render(view:SceneView):void; resize(width:number,height:number):void; anchors():Record<'C'|'D'|'E'|'slot', {x:number,y:number}>; dispose():void }`。anchors为画布内归一化投影位置，DOM透明按钮将贴合这些点进行命中/键盘操作，场景自身不监听事件。depth=0为扁平画面，1为固定立体镜头；桥随bridge由直立到横跨水面，角色随approach靠近机关，随travel过桥抵达。selected/pulse反馈可见，installed时C进入槽位，其他材料保留。左侧约32%留给教学说明；手机宽高约2.1，构图以角色40%、材料50%、机关64%、桥80%、出口93%为参考。绘本色块、中等亮度、粗墨线，简化节拍器角色有眼睛/手脚；尽量利用几何与自绘纹理，避免画面只是杂乱几何堆叠。

- 2026-10-15 实现检查：5项规则、8项浏览器及构建通过；NO_VCS新增源码完整diff保存在 /tmp/mg-ground-probe-20261015.diff，已按I/O矩阵审阅。实际真机、声学延迟、用户视觉认可明确待验证，未标为通过。

- 2026-10-15 最终交付：审查列出的6项行为问题已修复，额外补真实输出信号/音高检查。先记录失败回归，再修改原有模块，无新增运行依赖或生产观察接口。最终 `npm test` 6/6、`npm run test:browser` 13/13、类型检查与构建通过。纸声恢复测试等待异步恢复实际完成后断言；未使用固定延时掩盖恢复状态。
- 实现状态 done 仅表示本Story工程交付完成；done_checkpoint保留用户体验，AC-03/AC-12主观认可与iPhone真机条件尚待验证。完整证据见 `../../../implementation-artifacts/probe-verification.md`，源码/构建哈希与画面/录像一并保留。未提交或发布公网，无Git仓库。
