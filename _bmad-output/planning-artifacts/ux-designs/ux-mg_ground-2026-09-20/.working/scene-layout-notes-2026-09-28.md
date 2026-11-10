# 游戏场景构图提案 · 2026-09-28

状态：待评审。延续已认可的教学 UI，展示游戏场景与教程空间关系；不作引擎截图或可玩 Demo。

- [同场景收起与展开对照](scene-layout-2026-09-28.html)
- [场景概念图](scene-layout-base-2026-09-28.png)

## 构图及范围

固定镜头下，用正常尺度的角色、三枚可操作材料、带槽机关、阻断通路的短桥和出口组织画面。左侧低重要度区域供教程展开，右侧保留角色与操作对象。这是助手的布局提案，未确定角色造型、桥机关、材料语义或课程映射；空白材料避免提前把具体乐器等同于音名。

参考图只延续复古手绘笔触和折中配色，重新设计构图。生成结果中角色与材料比提示词指定位置偏左，需以实际图检查 UI 遮挡。宽画幅完整显示，避免再次裁切插画后掩盖游戏关系。场景美术整体仍待确认；静态图不能证明角色移动、声音与机关反馈、真实 3D 或学习效果。

## 本轮评审

先检查玩家能否辨认自己操控谁、在哪里操作、要让哪里发生变化；再看教程展开后这些对象是否完整保留。通过后再补独立挑战和结果/转场状态，不先锁定引擎。

## 来源与完整提示词

使用内置 image_gen 工具，参考图为 style-retro-balanced-2026-09-22.png（仅风格参考）。原始输出 exec-de2ff348-5520-444f-b605-a168b6caf3f4.png，已复制到本工作区。

```text
Use case: stylized-concept
Asset type: landscape mobile music adventure GAMEPLAY COMPOSITION concept, single environment plate, aspect ratio 2.16:1.
Input image 1 is STYLE REFERENCE ONLY: retain its expressive hand inked vintage rubber-hose animation, painterly soft muted greens, warm cream and restrained ochre/red. Completely redesign composition and scale for a playable small scene. Do not reproduce the reference's huge foreground instruments or portrait-like illustration.
Camera: fixed elevated three-quarter gameplay camera, clearly readable continuous walkable ground, shallow illustrative depth, strong hand drawn outlines, no physical book, no floating diorama base. Frame the whole small garden puzzle scene in a single wide image.
Composition precise normalized positions: left 0–36% of image is a quiet approach path and low detail grass, empty of critical gameplay objects, reserved for a later UI overlay (DO NOT draw the overlay). All gameplay-important objects stay within x=43–95%, y=22–84%.
One small original anthropomorphic metronome player character, same style as reference, at x=47%, y=68%, about 14% of image height, clearly standing on the ground facing the mechanism to its right.
At x=61%, y=70% put a waist-high shallow wooden tray with exactly THREE distinct cream, muted teal, and ochre flat sound tokens upright, each blank and equally sized, no letters or notes. Tray and tokens simple, chunky and readable, discreet ivory outlines indicating manipulable materials. No giant instruments.
At x=73%, y=53% put a small wooden music mechanism with ONE clearly empty recessed socket sized to accept a token, a simple brass crank, and a visibly continuous mechanical rod leading to a short raised wooden drawbridge crossing a narrow blue stream at x=82%. Beyond the stream, at x=92%, y=38%, a simple small stone exit arch on a walkable path. The raised bridge clearly interrupts the route from character to exit. Make rod/bridge physical linkage legible, not a decorative ambiguous trail. Mechanism/socket, materials, character and exit must not overlap and each must have clear surrounding space.
All ordinary flowers, shrubs, rocks and trees low contrast and kept at borders, smaller than action objects. No decorative faces except the player, no giant foreground props, no repeating instruments, no photorealism, no dark sepia filter, no overbright neon colors.
Moderate daylight, light paper grain, intentional loose ink contours, hand painted areas with enough empty ground to read the route. Sparse readable level, not dense narrative illustration.
No text, no labels, no HUD, no UI panel, no frame, no watermarks. This is an illustrative proposal of a game view, not a claimed engine render.
```

