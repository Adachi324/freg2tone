# 独立挑战与反馈画稿 · 2026-09-28

状态：反馈结构方向已获认可。用户于 2026-09-29 回复“没问题”，2026-10-13 恢复时补记；认可独立挑战、原位重试、成功通行的呈现，不扩大为课程、动态体验或学习效果验证。本轮沿用已认可的角色比例与空间组织，补齐六阶段流程中的独立挑战和场景结果。

## 入口

- [挑战、未成功、成功通行三状态](challenge-flow-2026-09-28.html)
- [成功通行概念图](scene-result-2026-09-28.png)
- [前序教学 UI](key-learning.html)
- [场景与教程布局](scene-layout-2026-09-28.html)

## 提案与边界

独立挑战撤去逐步答案提示，只保留任务、可操作材料与求助入口。未成功时保留当前场景，解释这次选择与目标的差异，允许直接重试或回看。主动求助后的完成在后续规格中应与独立完成区分。成功时按“音乐输入确认 → 机关响应 → 桥改变 → 角色行动”组织反馈，避免用结算弹窗替代世界变化。

题目“为机关找到音名 C 的材料”和 C/D/E 标签只用于检查任务、选择、原因说明与结果回顾的位置关系。它仅有字母匹配难度，不能据此认为已完成有效的乐理独立挑战设计；具体知识迁移题目、声音、唱名体系、难度与课程规则仍待内容制作。三种状态的画面按钮停用，只有页外导航可点，无实际判题、声音、角色动画或真实 3D。

这一轮不新增 2D 到 3D 转场方案。闭环状态获认可后，先确定首个 Demo 是否需展示维度过渡，再进入必要技术预研和规格。

## 图像检查

成功图沿用原构图：米色材料移入机关，托架只剩青色与黄色两枚材料，桥放下，唯一角色移到桥上。场景细部存在生成编辑带来的微小差异，不是可直接用于逐帧动画的生产资产。

浏览器检查：三状态逐屏目视通过，三幅均为 844×390；图片全部加载，字母对应材料/槽位，文字未遮住角色与目标，导航正常，画面按钮停用。此证据只覆盖静态布局。材料视觉尺寸较小，真实手机触控时需要扩大有效点击范围或局部操作视图；尚未验证触控手感，不能把小圆片的外观尺寸直接当成触控规格。

## 来源与完整提示词

内置 image_gen 编辑，参考/编辑目标为 scene-layout-base-2026-09-28.png。原始输出 exec-40f3e3c0-018d-4993-9ecb-160a0e471f86.png 已复制到本工作区。

```text
Use case: precise-object-edit
Asset type: the SUCCESS STATE of this exact single-screen hand-painted music adventure game composition.
Edit the attached original. Preserve exact aspect ratio, camera position, environment, colors, brushwork, character identity and scale, tree/rock positions, stream and stone arch, left empty tutorial area. Do not zoom, crop, or rearrange scene.
Change only these connected game state elements:
1. Lower the formerly upright wooden drawbridge on the right. Show it HORIZONTAL, spanning the entire stream gap from the near stone bridgehead to the opposite bank path under the arch, safely connecting the two shores. Keep the hinges and brass mechanical linkage in the same locations; rotate the drawbridge to its lowered state. Absolutely no upright barrier remains.
2. Move the original small metronome character from its left-of-tray position onto the middle of this lowered bridge, joyfully walking toward the stone exit arch. Remove the character from its original position so there is exactly ONE character. Retain exactly its original body, face, limbs, proportions and small scene scale; no copy.
3. Take the cream round token from the leftmost position in the three-token tray and fit it into the circular recessed socket of the wooden mechanism box. Show the cream disk seated flush inside the socket. The wooden tray now has exactly TWO tokens left, muted teal and ochre, in their original positions; the leftmost tray position is empty. No glowing magic or particles needed.
The changed game state should be immediately readable while the rest of the scene stays consistent.
No text, no letters, no HUD, no UI, no speech bubbles, no score, no frame. Hand inked vintage illustration as original, moderate soft colors, no color grading change. This is a visual storyboard frame, not an engine screenshot.
```
