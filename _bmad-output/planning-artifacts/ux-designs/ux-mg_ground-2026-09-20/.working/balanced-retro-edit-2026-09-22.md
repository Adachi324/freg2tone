# 复古手绘折中调色

使用内置 imagegen，将较暗复古版和过亮版同时作为参考，调整到中间的亮度与饱和度。未使用 CLI 或程序调色。

- 输入：[暗版](style-retro-2026-09-21.png)、[亮版](style-retro-bright-2026-09-22.png)
- 输出：[折中版](style-retro-balanced-2026-09-22.png)
- 目视检查：主要角色、机关及构图保留；较亮版减少高亮黄、蓝绿及红的饱和感，较暗版保留更清晰明亮的天空和主体。不是数值精确的两图平均，具体效果待用户评审。

## 完整提示词

```text
Create a color-only revision of the same hand-drawn music garden illustration shown in both references. Image 1 is TOO DARK and sepia. Image 2 is TOO BRIGHT and saturated. Produce a balanced midpoint between them in perceived brightness and saturation, approximately halfway. Use IMAGE 2 as the exact composition and drawing to preserve. No split screen, one finished landscape image.
Preserve all characters, faces, poses, bold ink contours, object positions, framing and background details: walking metronome, large bell, three chimes, smiling drum, garden gate and water. Do not redesign anything.
Target: comfortable soft daylight, gently muted but alive colors, warm inviting vintage hand-drawn animation. Lower image 2's overly luminous yellow highlights, vivid cyan water/sky, lime greens and scarlet reds. Sky should be soft dusty blue, water restrained blue-green, leaves natural sage and mid greens, instruments mellow honey-gold, drum warm muted coral/red. Cream faces and stone surfaces should be moderately light, not near-white. Restore some soft midtone depth and delicate handmade texture, but DO NOT restore image 1's overall brown filter, dirty paper stains, deep murky shadows or dense film grain. Keep confident dark ink lines. Neither faded pastel nor punchy saturated sunshine. No added UI, text or book. Only color and tonal balance changes.
```
