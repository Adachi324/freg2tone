import "./style.css";
import {
  act,
  createGame,
  currentTask,
  editable,
  paused,
  resultSummary,
} from "./game.ts";
import type { Action, Phase, ResultSummary } from "./game.ts";
import {
  label,
  noteIds,
  notes,
  practiceTasks,
  challengeTasks,
} from "./lesson.ts";
import type { MaterialId } from "./lesson.ts";
import { createScene } from "./scene.ts";
import { Sound } from "./audio.ts";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `<main id="world">
  <canvas id="scene" aria-label="固定花园中的三枚音乐材料与声音之桥"></canvas><div class="paper-grain" aria-hidden="true"></div>
  <header class="topbar"><div class="brand"><span class="brand-note">♪</span><div>调音花园<small>声音的两种名字</small></div></div>
  <div class="chapter"><span id="chapter-label"></span><div class="steps" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div>
  <nav aria-label="体验设置"><button id="music" class="quiet">♪ 声音关</button><button id="paper" class="quiet">纸声开</button><button id="help" class="quiet" hidden>回看</button></nav></header>
  <section id="lesson" class="lesson" aria-labelledby="lesson-title"></section>
  <div id="objects" aria-label="音乐材料">${noteIds.map((id) => `<button class="hotspot material" data-material="${id}"><span></span></button>`).join("")}
  ${[0, 1, 2].map((i) => `<button class="hotspot slot" data-slot="${i}"><span class="slot-hint">点一下机关 ↗</span><span class="slot-index">${i + 1}</span></button>`).join("")}</div>
  <footer class="bottom"><p id="feedback" role="status" aria-live="polite"></p><span class="edition">声音，让花园动起来</span></footer>
  <div id="audio-notice" role="status" hidden></div>
</main><section id="overlay" role="dialog" aria-modal="true" aria-labelledby="overlay-title" hidden><div class="modal-paper"></div></section>`;
const $ = <T extends HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!;
const world = $("#world"),
  lesson = $("#lesson"),
  overlay = $("#overlay"),
  canvas = $<HTMLCanvasElement>("#scene");
const musicButton = $<HTMLButtonElement>("#music"),
  paperButton = $<HTMLButtonElement>("#paper"),
  helpButton = $<HTMLButtonElement>("#help");
const materials = Array.from(
  document.querySelectorAll<HTMLButtonElement>("[data-material]"),
);
const slots = Array.from(
  document.querySelectorAll<HTMLButtonElement>("[data-slot]"),
);
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let game = createGame();
const sound = new Sound();
let scene: ReturnType<typeof createScene> | undefined;
let failure = "",
  phaseTime = 0,
  totalTime = 0,
  lastTime = 0,
  noticeUntil = 0;
let audioRequest = 0,
  lifecycleEpoch = 0,
  playEpoch = 0;
let pulse: MaterialId | null = null,
  pulseStart = 0,
  pulseSlot = -1;
let previousPanel = "",
  previousOverlay = "",
  returnFocus: HTMLElement | null = null;
const duration: Partial<Record<Phase, number>> = {
  approach: 0.9,
  bridge: 1.25,
  crossing: 2.2,
};
const button = (action: string, text: string, secondary = false) =>
  `<button class="${secondary ? "secondary" : "primary"}" data-action="${action}">${text}</button>`;
const explanation = `<p><b>C、D、E</b> 是音名。<b>do、re、mi</b> 是唱名，可以用来唱这些声音。</p><p>这一节在 C 大调中练习：<br><b>C ↔ do　D ↔ re　E ↔ mi</b><br>两种标记，说的是同一个音。</p>`;
type Playback = {
  kind: "demo" | "submission" | "result";
  notes: readonly MaterialId[];
  index: number;
  next: number;
  epoch: number;
  run: number;
  taskId: string;
  submissionId: number;
};
let playback: Playback | null = null;
const inTask = () => game.phase === "practice" || game.phase === "challenge";
const canEdit = () => editable(game) && !failure;
function notify(text: string) {
  const n = $("#audio-notice");
  n.textContent = text;
  n.hidden = false;
  noticeUntil = performance.now() + 3500;
}
function syncSoundButtons() {
  musicButton.textContent = sound.music ? "♪ 声音开" : "♪ 声音关";
  musicButton.setAttribute("aria-pressed", String(sound.music));
  paperButton.textContent = sound.paper ? "纸声开" : "纸声关";
  paperButton.setAttribute("aria-pressed", String(sound.paper));
}
function stopPlayback() {
  playEpoch++;
  playback = null;
  sound.stop();
  pulse = null;
  pulseSlot = -1;
}
function startPlayback(kind: Playback["kind"], ids: readonly MaterialId[]) {
  stopPlayback();
  playback = {
    kind,
    notes: [...ids],
    index: -1,
    next: 0,
    epoch: playEpoch,
    run: game.run,
    taskId: game.submission?.taskId || "",
    submissionId: game.submission?.id || 0,
  };
}
function playNote(id: MaterialId, index = -1) {
  pulse = id;
  pulseSlot = index;
  pulseStart = sound.note(id);
}
async function unlockSound() {
  const epoch = lifecycleEpoch;
  const enabled = await sound.unlock();
  if (epoch !== lifecycleEpoch || document.hidden || failure) {
    void sound.suspend();
    return false;
  }
  return enabled;
}
async function enableSound() {
  const request = ++audioRequest;
  const enabled = await unlockSound();
  if (request !== audioRequest) return false;
  sound.music = enabled;
  syncSoundButtons();
  if (!enabled) notify("声音暂时无法开启，你仍可以无声体验。");
  return enabled;
}
function dispatch(action: Action) {
  const before = game;
  game = act(game, action);
  const changed =
    game.phase !== before.phase ||
    game.run !== before.run ||
    game.taskIndex !== before.taskIndex;
  if (changed) {
    phaseTime = 0;
    stopPlayback();
    if (
      game.phase === "intro" ||
      (game.phase === "challenge" && before.phase === "practice")
    )
      sound.page();
  }
  if (paused(game) && !paused(before)) stopPlayback();
  if (
    game.help !== before.help &&
    !game.suspended &&
    !game.portrait &&
    !game.submission?.playing
  )
    sound.page();
  if (!paused(game) && !failure) {
    if (game.submission?.playing && !playback)
      startPlayback("submission", game.submission.answer);
    else if (game.phase === "demo" && (changed || paused(before)))
      startPlayback("demo", noteIds);
    if (action.type === "select" && canEdit() && game.selected)
      playNote(game.selected);
  }
  updateUI();
}
function showOverlay(key: string, html: string) {
  if (key === previousOverlay) return;
  previousOverlay = key;
  if (key) {
    if (overlay.hidden) returnFocus = document.activeElement as HTMLElement;
    world.inert = true;
    overlay.hidden = false;
    overlay.querySelector(".modal-paper")!.innerHTML = html;
    overlay.querySelector<HTMLElement>("button:not(:disabled)")?.focus();
  } else {
    overlay.hidden = true;
    world.inert = false;
    if (
      returnFocus?.isConnected &&
      !(returnFocus as HTMLButtonElement).disabled
    )
      returnFocus.focus();
  }
}
function summaryHTML(summary: ResultSummary): string {
  return `<ol class="attempt-list">${summary.attempts.map((a, i) => `<li><strong>第 ${i + 1} 题 · ${{ first: "首次独立完成", retry: "重试后完成", help: "借助提示完成" }[a.kind]}</strong><small>首答 ${a.firstSubmission?.answer.map((id) => label(id, challengeTasks(summary.run)[i]!.materialMode)).join(" · ")} · 错误 ${a.wrongCount} 次 · ${a.helpUsed ? "用过提示" : "未用提示"}</small></li>`).join("")}</ol>`;
}
function previousHTML(): string {
  return game.lastResult
    ? `<details class="previous"><summary>上一轮记录</summary>${summaryHTML(game.lastResult)}</details>`
    : "";
}
function updateUI() {
  const phase = game.phase,
    t = currentTask(game),
    mode = phase === "demo" ? "both" : t.materialMode;
  world.dataset.phase = phase;
  world.dataset.run = String(game.run);
  world.dataset.task = t.id;
  world.dataset.paused = String(paused(game));
  world.dataset.playing = String(!!game.submission?.playing);
  world.dataset.labelMode = mode;
  const stage = ["arrival", "approach", "intro"].includes(phase)
    ? 0
    : ["demo", "practice"].includes(phase)
      ? 1
      : phase === "complete"
        ? 3
        : 2;
  $("#chapter-label").textContent = [
    "初见 · 声音之桥",
    "认识 · 两种名字",
    "应用 · 让机关响起来",
    "抵达 · 桥的另一边",
  ][stage]!;
  document
    .querySelectorAll(".steps i")
    .forEach((dot, i) => dot.classList.toggle("active", i <= stage));
  helpButton.hidden = ![
    "practice",
    "challenge",
    "bridge",
    "crossing",
    "complete",
  ].includes(phase);
  const key = `${phase}:${game.run}:${game.taskIndex}:${game.result}:${game.submission?.playing}`;
  if (key !== previousPanel) {
    previousPanel = key;
    let html = "";
    if (phase === "arrival" || phase === "approach")
      html = `<span class="eyebrow">声音之桥 / 01</span><h1 id="lesson-title">给花园<br>一个声音。</h1><p>小拍的路，被一座安静的桥挡住了。<br>轻点机关，看看它需要什么。</p><p class="hint">${phase === "approach" ? "小拍正在靠近…" : "本次进度留在当前页面；刷新会重新开始。"}</p>${phase === "arrival" ? previousHTML() : ""}`;
    if (phase === "intro")
      html = `<span class="eyebrow">认识一个小秘密</span><h1 id="lesson-title">一个音，两种名字。</h1>${explanation}<div class="actions">${button("listen", "听听看 →")}${button("silent", "无声继续", true)}</div>`;
    if (phase === "demo")
      html = `<span class="eyebrow">看看，也听听</span><h1 id="lesson-title">名字变了，声音没变。</h1><p>每枚材料上的两种标记，指向同一个音。点一下，再听听。</p><div class="note-row">${noteIds.map((id) => `<button data-note="${id}" aria-label="听 ${label(id, "both")}"><b>${id}</b><small>${notes[id].solfege}</small></button>`).join("")}</div><div class="actions">${button("practice", "我来试试 →")}${button("demo", "再听一遍", true)}</div>`;
    if (inTask()) {
      const isPractice = phase === "practice",
        playing = game.submission?.playing,
        right = game.result === "right" && !playing;
      const count = isPractice
        ? practiceTasks.length
        : challengeTasks(game.run).length;
      html = `<span class="eyebrow">${isPractice ? "一起练习" : "轮到你了"} · ${game.taskIndex + 1} / ${count}</span><h1 id="lesson-title">${isPractice ? "把名字连起来。" : t.materialMode === "solfege" ? "换一种名字。" : t.target.length > 1 ? "让声音排成一条路。" : "唤醒第一道锁。"}</h1><div class="target"><small>机关需要</small><strong>${t.target.map((id) => label(id, t.promptMode)).join(" · ")}</strong></div>`;
      if (isPractice)
        html += '<p class="mapping">C ↔ do　D ↔ re　E ↔ mi</p>';
      else if (t.materialMode === "solfege")
        html +=
          '<p class="hint">这次材料写着唱名。找到与音名对应的那一枚。</p>';
      else html += '<p class="hint">选材料 → 放入圆槽 → 试运行</p>';
      html += `<div class="actions">${playing ? '<p class="playing-note">听听你的选择…</p>' : right ? button("continue", isPractice && game.taskIndex === 2 ? "收起说明，开始挑战 →" : "继续 →") : button("submit", "试运行 ♪")}</div>`;
    }
    if (phase === "complete") {
      const summary = resultSummary(game);
      html = `<span class="eyebrow">声音，真的起作用了</span><h1 id="lesson-title">路，打开了。</h1><p>你的声音组合，让小拍走到了桥的另一边。</p>
        <div class="result-sequence" aria-label="这次的声音组合">${summary.sequence.map((id, i) => `<span data-result-slot="${i}"><b>${id}</b><small>${notes[id].solfege}</small></span>`).join("")}</div>
        <div class="actions">${button("result-listen", "回听我的组合 ♪", true)}${button("replay", "再玩一次 ↻")}</div>
        ${summaryHTML(summary)}${previousHTML()}<p class="hint">这是本轮应用记录。你能说说为什么选这些音吗？</p>`;
    }
    lesson.classList.toggle("result-card", phase === "complete");
    lesson.classList.toggle("task-card", phase === "challenge");
    lesson.innerHTML = html;
    lesson.hidden = !html;
    lesson.getAnimations().forEach((a) => a.cancel());
    if (html && !reduced.matches)
      lesson.animate(
        [
          { opacity: 0, translate: "-8px 0" },
          { opacity: 1, translate: "0 0" },
        ],
        { duration: 180, easing: "ease-out" },
      );
  }
  const wrong = game.result === "wrong" && !game.submission?.playing;
  const wrongIndex = game.slots.findIndex((id, i) => id !== t.target[i]);
  const wrongHint =
    wrongIndex >= 0
      ? `第 ${wrongIndex + 1} 格还没对上「${label(t.target[wrongIndex]!, t.promptMode)}」。检查这格的名字，或点「回看」对照。`
      : "";
  const feedback = game.submission?.playing
    ? "声音正按你的选择响起…"
    : wrong
      ? wrongHint
      : game.result === "empty"
        ? "先选一枚材料，填好圆槽，再试运行。"
        : game.result === "right" && inTask()
          ? "对上了！这一道机关回应了你。"
          : inTask()
            ? game.selected
              ? `已选 ${label(game.selected, mode)} · 点圆槽放入`
              : "点选材料 → 点圆槽放入 → 试运行"
            : (
                {
                  arrival: "轻点机关，小拍会自己走过去。",
                  approach: "哒、哒、哒…",
                  intro: "先认识声音，再让声音改变花园。",
                  demo: sound.music
                    ? "同一个声音，两种名字。"
                    : "无声模式 · 跟着亮起的材料认识两个名字。",
                  bridge: "咔嗒——声音让桥动了起来。",
                  crossing: "桥已经稳稳落下，小拍出发了。",
                  complete: "你的声音，已经留在这座花园。",
                } as Partial<Record<Phase, string>>
              )[phase] || "";
  $("#feedback").textContent = feedback;
  $("#feedback").classList.toggle("retry", wrong);
  materials.forEach((b) => {
    const id = b.dataset.material as MaterialId;
    b.hidden = !inTask();
    b.disabled = !canEdit();
    b.setAttribute("aria-label", `选择材料 ${label(id, mode)}`);
    b.setAttribute("aria-pressed", String(game.selected === id));
    b.querySelector("span")!.textContent = label(id, mode);
  });
  slots.forEach((b, i) => {
    b.hidden = !(
      (phase === "arrival" && i === 0) ||
      (inTask() && i < game.slots.length)
    );
    b.disabled =
      paused(game) || !!failure || !(phase === "arrival" || canEdit());
    b.classList.toggle("arrival", phase === "arrival");
    b.classList.toggle("sequence-slot", game.slots.length === 3);
    b.setAttribute(
      "aria-label",
      phase === "arrival"
        ? "靠近机关"
        : `槽位 ${i + 1}：${game.slots[i] ? label(game.slots[i]!, mode) : "空"}，放入所选材料`,
    );
  });
  if (failure)
    showOverlay(
      "error",
      `<h2 id="overlay-title">画面需要重新开启</h2><p>${failure}</p><p>重新加载会从头开始这次体验。</p>${button("reload", "重新加载")}`,
    );
  else if (game.suspended)
    showOverlay(
      `suspend:${game.portrait}`,
      `<h2 id="overlay-title">准备好，就继续吧。</h2><p>${game.portrait ? "请先把手机转成横屏。" : "花园停在你离开的位置，声音也暂停了。"}</p><button class="primary" data-action="resume" ${game.portrait ? "disabled" : ""}>继续这次冒险 →</button>`,
    );
  else if (game.portrait)
    showOverlay(
      "portrait",
      `<h2 id="overlay-title">横过来，去冒险。</h2><div class="rotate" aria-hidden="true">▯ ↻ ▭</div><p>当前进度会保留。</p>`,
    );
  else if (game.help)
    showOverlay(
      "help",
      `<span class="eyebrow">回看 · 声音的两种名字</span><h2 id="overlay-title">让名字找到同一个音。</h2>${explanation}<p class="hint">关掉说明后，刚才的组合还在。</p>${button("close", "回到花园 →")}`,
    );
  else showOverlay("", "");
}
app.addEventListener("click", async (event) => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
    "button",
  );
  if (!target || target.disabled) return;
  if (target === musicButton) {
    if (sound.music) {
      audioRequest++;
      sound.music = false;
      sound.stop();
    } else await enableSound();
    syncSoundButtons();
    updateUI();
    return;
  }
  if (target === paperButton) {
    sound.paper = !sound.paper;
    if (sound.paper) void unlockSound();
    syncSoundButtons();
    return;
  }
  if (target === helpButton) {
    dispatch({ type: "help", open: true });
    return;
  }
  if (target.dataset.material) {
    dispatch({ type: "select", id: target.dataset.material as MaterialId });
    return;
  }
  if (target.dataset.slot !== undefined) {
    if (game.phase === "arrival") {
      if (sound.paper) void unlockSound();
      dispatch({ type: "approach" });
    } else dispatch({ type: "place", index: Number(target.dataset.slot) });
    return;
  }
  if (target.dataset.note) {
    stopPlayback();
    playNote(target.dataset.note as MaterialId);
    return;
  }
  switch (target.dataset.action) {
    case "listen": {
      const run = game.run;
      await enableSound();
      if (game.run === run && game.phase === "intro" && !paused(game))
        dispatch({ type: "next" });
      break;
    }
    case "silent":
      audioRequest++;
      sound.music = false;
      sound.paper = false;
      stopPlayback();
      syncSoundButtons();
      dispatch({ type: "next" });
      break;
    case "practice":
      dispatch({ type: "next" });
      break;
    case "demo":
      startPlayback("demo", noteIds);
      break;
    case "submit":
      dispatch({ type: "submit" });
      break;
    case "continue":
      dispatch({ type: "continue" });
      break;
    case "close":
      dispatch({ type: "help", open: false });
      break;
    case "resume": {
      if (document.hidden || game.portrait) return;
      const epoch = lifecycleEpoch;
      if (sound.music || sound.paper) {
        const ok = await unlockSound();
        if (!ok) {
          sound.music = false;
          sound.paper = false;
          syncSoundButtons();
          notify("声音暂时不可用，先无声继续。");
        }
      }
      if (epoch === lifecycleEpoch && !document.hidden && !game.portrait)
        dispatch({ type: "resume" });
      break;
    }
    case "result-listen":
      if (game.phase === "complete" && !paused(game))
        startPlayback("result", resultSummary(game).sequence);
      break;
    case "replay":
      dispatch({ type: "replay" });
      break;
    case "reload":
      window.location.reload();
      break;
  }
});
let cancelledPointer = false;
app.addEventListener(
  "pointerdown",
  () => {
    cancelledPointer = false;
  },
  true,
);
app.addEventListener(
  "pointercancel",
  () => {
    cancelledPointer = true;
  },
  true,
);
app.addEventListener(
  "click",
  (event) => {
    if (cancelledPointer) {
      event.preventDefault();
      event.stopImmediatePropagation();
      cancelledPointer = false;
    }
  },
  true,
);
app.addEventListener("keydown", (event) => {
  cancelledPointer = false;
  if (overlay.hidden) return;
  if (event.key === "Escape" && game.help && !game.suspended && !game.portrait)
    dispatch({ type: "help", open: false });
  if (event.key === "Tab") {
    const buttons = Array.from(
      overlay.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
    );
    if (!buttons.length) {
      event.preventDefault();
      return;
    }
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.shiftKey && index <= 0) {
      buttons.at(-1)!.focus();
      event.preventDefault();
    } else if (!event.shiftKey && index === buttons.length - 1) {
      buttons[0]!.focus();
      event.preventDefault();
    }
  }
});
function suspend() {
  lifecycleEpoch++;
  audioRequest++;
  dispatch({ type: "suspend" });
  void sound.suspend();
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) suspend();
});
window.addEventListener("pagehide", suspend);
canvas.addEventListener("webglcontextlost", (event) => {
  event.preventDefault();
  fail("画面连接中断了。请重新加载花园。");
});
function fail(message: string) {
  failure = message;
  stopPlayback();
  void sound.suspend();
  updateUI();
}
function resize() {
  const { width, height } = world.getBoundingClientRect();
  scene?.resize(width, height);
  dispatch({ type: "portrait", value: height > width });
}
try {
  scene = createScene(canvas);
} catch (error) {
  console.error(error);
  fail("当前浏览器无法绘制这座花园，请使用支持 WebGL 2 的浏览器。");
}
new ResizeObserver(resize).observe(world);
window.visualViewport?.addEventListener("resize", resize);
resize();
syncSoundButtons();
updateUI();
function frame(now: number) {
  requestAnimationFrame(frame);
  const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0;
  lastTime = now;
  if (failure || !scene) return;
  const running = !paused(game);
  if (running) {
    phaseTime += dt;
    totalTime += dt;
    const p = playback;
    if (p && p.epoch === playEpoch && now >= p.next) {
      const index = p.index + 1;
      if (index < p.notes.length) {
        p.index = index;
        playNote(p.notes[index]!, p.kind !== "demo" ? index : -1);
        p.next = pulseStart + 850;
      } else {
        playback = null;
        if (p.kind === "submission")
          dispatch({
            type: "playbackFinished",
            run: p.run,
            taskId: p.taskId,
            submissionId: p.submissionId,
          });
      }
    }
  }
  const progress = reduced.matches
    ? 1
    : Math.min(phaseTime / (duration[game.phase] || 1), 1);
  const active =
    pulse && running && now >= pulseStart && now < pulseStart + 650
      ? pulse
      : null;
  const t = currentTask(game),
    mode = game.phase === "demo" ? "both" : t.materialMode;
  scene.render({
    approach:
      game.phase === "arrival" ? 0 : game.phase === "approach" ? progress : 1,
    bridge:
      game.phase === "bridge"
        ? progress
        : ["crossing", "complete"].includes(game.phase)
          ? 1
          : 0,
    travel:
      game.phase === "crossing" ? progress : game.phase === "complete" ? 1 : 0,
    selected: game.selected,
    slots: game.slots,
    activeSlot: active ? pulseSlot : -1,
    labelMode: mode,
    locks: Object.values(game.records).filter(
      (r) => r.taskId.startsWith("c") && r.completed,
    ).length,
    order: inTask() ? t.order : noteIds,
    pulse: active,
    time: totalTime,
  });
  const anchors = scene.anchors();
  for (const b of materials) {
    const a = anchors[b.dataset.material as MaterialId];
    b.style.left = `${a.x * 100}%`;
    b.style.top = `${a.y * 100}%`;
  }
  slots.forEach((b, i) => {
    const a = game.phase === "arrival" ? anchors.slot : anchors.slots[i]!;
    b.style.left = `${a.x * 100}%`;
    b.style.top = `${a.y * 100}%`;
    b.classList.toggle("sounding", !!active && pulseSlot === i);
  });
  document
    .querySelectorAll<HTMLButtonElement>("[data-note]")
    .forEach((b) => b.classList.toggle("sounding", b.dataset.note === active));
  document
    .querySelectorAll<HTMLElement>("[data-result-slot]")
    .forEach((el) =>
      el.classList.toggle(
        "sounding",
        !!active && pulseSlot === Number(el.dataset.resultSlot),
      ),
    );
  if (running && progress === 1) {
    const finished = {
      approach: "arrived",
      bridge: "bridgeReady",
      crossing: "exitReached",
    } as const;
    if (game.phase in finished)
      dispatch({
        type: finished[game.phase as keyof typeof finished],
        run: game.run,
      });
  }
  if (noticeUntil && now > noticeUntil) {
    $("#audio-notice").hidden = true;
    noticeUntil = 0;
  }
}
requestAnimationFrame(frame);
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    scene?.dispose();
    stopPlayback();
    void sound.suspend();
  });
