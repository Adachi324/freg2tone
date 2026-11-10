# 风格对照生成提示词 · 2026-09-21

使用内置 image_gen 工具。两张全新候选图，不以旧图作编辑底图，避免延续用户不满意的柔和水彩微缩景观。具体场景、角色、配色均为提案。

## A 初次请求（未成功）

工具在输出阶段返回 moderation_blocked，类别 other，未给具体理由；没有可交付图片。随后用简化的原创复古动画描述重试内置工具。

```text
Use case: stylized-concept. Create a single LANDSCAPE game art direction frame for an original music-learning adventure for adults. This is a style exploration, not a lesson diagram. NO text, no logos, no watermark, no UI, no book, no page borders, no classroom.
Composition: fixed slightly elevated three-quarter view of a SMALL playful music-mechanism courtyard, sparse and readable. On the LEFT a small original human explorer in a short jacket with a tiny satchel, expressive face and recognizable silhouette. CENTER LEFT a bronze bell suspended on a simple curved timber frame above a large round trigger; CENTER a compact rack of three hanging musical chimes above a second trigger; CENTER RIGHT a friendly rounded drum above a third trigger. On the FAR RIGHT a simple arched exit gate connected visually by a short path. A few simple trees and tufts of grass. Main interactive objects occupy most of frame; minimal distant scenery, no dense ancient ruins, no vast island landscape, no sheet music, no keyboard simulator. The scene should feel immediately playful. Clear contact between feet and ground, legible silhouettes at mobile scale. Color identities are red/coral bell trigger, blue chime trigger, golden drum trigger. Same layout usable for side-by-side style comparison. No sound or music-theory accuracy claims.
STYLE A — STRONG HAND-DRAWN VINTAGE CARTOON, inspired by Cuphead's 1930s hand-inked cel-animation visual language, with entirely original characters. The hand-drawn quality MUST be unmissable at first glance. Bold BLACK india-ink outlines with visible thick-thin variation and small organic contour irregularity; elastic rubber-hose limbs; confident graphic silhouettes; lively squash-and-stretch posing; charming expressive cartoon eyes. Large flat cel-painted colors, VERY restrained shading. Hand-painted understated gouache/watercolor background with broad strokes that stays behind the bold outlined foreground. The bell and drum can have subtle cartoon personality. Ivory, warm red, mustard, teal, muted botanical green. Fine analog cel/paper grain only as a secondary detail. Retain playful warmth, not horror. Absolutely NO 3D render, no realistic lighting, no smooth volumetric diorama, no polished miniature-game aesthetic, no timid thin-line watercolor travel illustration. Foreground resembles scanned original ink animation drawings rather than a painting with an outline filter.
```

## A 重试结果

简化为原创复古动画描述后，工具仍在输出阶段返回 moderation_blocked（类别 other），未提供具体原因。没有复古版可交付图，不再继续重试或切换工具。现代版已完成；本轮尚未形成两张生成图的完整对照。

```text
Create one landscape concept illustration for an original friendly music adventure game, drawn in a distinctly 1930s hand-inked cartoon style. Make the foreground visibly feel like traditional animation drawings: bold irregular black ink strokes, thick-to-thin line weight, springy curved limbs and exaggerated lively poses, expressive simple eyes, large flat painted color shapes. Quiet watercolor background with broad simple shapes. Warm cream, red, mustard, teal and green. Hand-drawn character animation appeal is more important than ornate scenery. No 3D rendering, no realistic shading.
Fixed slightly elevated view of a small music courtyard: an original cheerful explorer with a short jacket and satchel at the far left; a large bronze bell on a curved wooden stand at center left; a simple frame with three hanging blue chime tubes at center; a round drum at center right; an arched exit at far right. Three large round floor triggers beneath the instruments: red, blue, yellow. Sparse grass and a tree, clear route to the exit. The explorer has playful bent limbs and a lively expressive pose, no weapons. Large readable foreground objects, confident cartoon silhouettes, plenty of simple space. The viewer should immediately think of an old hand-animated cartoon brought to life as a playful game. Entirely original characters. No words, letters, logos, book, pages, school or lesson panels.
```

## A 用户再次要求生成后成功

用户明确要求再次模仿《茶杯头》的感觉。仍使用内置 image_gen，成功生成 [复古候选图](style-retro-2026-09-21.png)。原创节拍器角色、粗墨线和拟人化音乐对象构成新的气质提案，未由用户选定。此结果更新先前“仅 B 完成”的状态。

```text
Generate a landscape concept art image for a friendly music adventure game in the visual style of Cuphead and 1930s hand-drawn animation. An entirely original little walking metronome character explores a musical garden: a large hanging brass bell on the left, three chime tubes in the center, a round drum on the right, and a little gate beyond them. The metronome is a cheerful wooden trapezoid with an expressive face, bendy cartoon legs and oversized shoes, posed mid-step. Bold black ink contours with varied line weight, rubber-hose animation poses, expressive faces, simple flat cel-painted foreground colors. Gentle hand-painted watercolor background. Warm cream, red, golden yellow, teal and green, subtle vintage film texture. The character and interactive objects should look unmistakably drawn by hand, not like a 3D render or a modern digital painting. Playful, welcoming, clear readable silhouettes, a compact scene seen from a slightly elevated fixed camera. No book, text, logo or game UI. Use original character designs, not Cuphead's existing characters.
```

## B 现代可爱

已输出 [现代候选图](style-modern-2026-09-21.png)。

```text
Use case: stylized-concept. Create a single LANDSCAPE game art direction frame for an original music-learning adventure for adults. This is a style exploration, not a lesson diagram. NO text, no logos, no watermark, no UI, no book, no page borders, no classroom.
Composition: fixed slightly elevated three-quarter view of a SMALL playful music-mechanism courtyard, sparse and readable. On the LEFT a small original human explorer in a short jacket with a tiny satchel, expressive face and recognizable silhouette. CENTER LEFT a bronze bell suspended on a simple curved timber frame above a large round trigger; CENTER a compact rack of three hanging musical chimes above a second trigger; CENTER RIGHT a friendly rounded drum above a third trigger. On the FAR RIGHT a simple arched exit gate connected visually by a short path. A few simple trees and tufts of grass. Main interactive objects occupy most of frame; minimal distant scenery, no dense ancient ruins, no vast island landscape, no sheet music, no keyboard simulator. The scene should feel immediately playful. Clear contact between feet and ground, legible silhouettes at mobile scale. Color identities are red/coral bell trigger, blue chime trigger, golden drum trigger. Same layout usable for side-by-side style comparison. No sound or music-theory accuracy claims.
STYLE B — CONTEMPORARY CUTE GAME ILLUSTRATION. Fresh, clean and inviting rather than vintage. Rounded compact shapes, pleasing graphic proportions, clear faces, simplified large forms and generously spaced composition. Clean confident dark colored contour lines of moderate width, smooth flat color blocks with only ONE simple cel-shadow step. A sunny modern palette of mint, teal, peach/coral, butter yellow and warm cream, lively without neon. Sophisticated cute all-ages game art, not a preschool learning app. Simplified sculptural shapes readable in the same three-quarter composition, but an illustrated look, not a photorealistic toy render. NO aged parchment, no vintage grain, no sepia, no rubber-hose old-cartoon styling, no decorative brush clutter, no micro-details, no realistic stone textures. Do not merely recolor a vintage scene: change the shape language, proportions, line finish and visual rhythm to feel genuinely contemporary.
```
