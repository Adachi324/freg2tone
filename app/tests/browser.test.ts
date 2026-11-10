import { test, expect, type Page } from "@playwright/test";
async function start(page: Page, navigate = true) {
  if (navigate) await page.goto("/");
  await page.getByRole("button", { name: "靠近机关", exact: true }).click();
  await page.getByRole("button", { name: "无声继续", exact: true }).click();
  await page.getByRole("button", { name: "我来试试 →", exact: true }).click();
}
async function put(page: Page, name: string, index = 0) {
  await page
    .getByRole("button", { name: `选择材料 ${name}`, exact: true })
    .click();
  await page
    .getByRole("button", { name: new RegExp(`^槽位 ${index + 1}：`) })
    .click();
}
async function submit(page: Page) {
  await page.getByRole("button", { name: "试运行 ♪", exact: true }).click();
  await expect(page.locator("#world")).toHaveAttribute("data-playing", "false");
}
async function challenge(page: Page, navigate = true) {
  await start(page, navigate);
  for (const id of ["C", "D", "E"]) {
    await put(page, id);
    await submit(page);
    await page
      .getByRole("button", {
        name: id === "E" ? "收起说明，开始挑战 →" : "继续 →",
        exact: true,
      })
      .click();
  }
  await expect(page.locator("#world")).toHaveAttribute(
    "data-phase",
    "challenge",
  );
}
async function sequence(page: Page, capture = false) {
  const first = (await page.locator("#world").getAttribute("data-run")) === "1";
  if (
    !(await page
      .getByRole("button", { name: "继续 →", exact: true })
      .isVisible())
  ) {
    await put(page, first ? "D" : "E");
    await submit(page);
  }
  await expect(page.locator("#world")).toHaveAttribute(
    "data-phase",
    "challenge",
  );
  await page.getByRole("button", { name: "继续 →", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: first ? "选择材料 mi" : "选择材料 re",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "选择材料 E", exact: true }),
  ).toHaveCount(0);
  await page.locator("#lesson").evaluate(async (el) => {
    await Promise.all(el.getAnimations().map((a) => a.finished));
  });
  if (capture)
    await page.screenshot({
      path: "../_bmad-output/implementation-artifacts/note-unit-reverse.png",
    });
  await put(page, first ? "mi" : "re");
  await submit(page);
  await page.getByRole("button", { name: "继续 →", exact: true }).click();
}
async function complete(page: Page, capture = false) {
  await sequence(page, capture);
  const first = (await page.locator("#world").getAttribute("data-run")) === "1";
  for (const [i, id] of (first ? ["E", "D", "C"] : ["C", "E", "C"]).entries())
    await put(page, id, i);
  if (capture)
    await page.screenshot({
      path: "../_bmad-output/implementation-artifacts/note-unit-sequence.png",
    });
  await submit(page);
  await expect(page.locator("#world")).toHaveAttribute(
    "data-phase",
    "complete",
  );
}

test("介绍与双标记示范、三个练习、撤表挑战、错误修正和复玩", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "靠近机关" }).click();
  await expect(page.getByText("一个音，两种名字。")).toBeVisible();
  await page.getByRole("button", { name: "无声继续" }).click();
  await expect(page.getByRole("button", { name: "听 C / do" })).toBeVisible();
  await page.locator("#lesson").evaluate(async (el) => {
    await Promise.all(el.getAnimations().map((a) => a.finished));
  });
  await page.screenshot({
    path: "../_bmad-output/implementation-artifacts/note-unit-demo.png",
  });
  await challenge(page);
  await expect(page.locator(".mapping")).toHaveCount(0);
  await put(page, "C");
  await submit(page);
  await expect(page.locator("#feedback")).toContainText("还没对上");
  await page.getByRole("button", { name: "回看", exact: true }).click();
  await page.getByRole("button", { name: "回到花园 →" }).click();
  await expect(
    page.getByRole("button", { name: "选择材料 C", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await complete(page, true);
  await page.locator("#lesson").evaluate(async (el) => {
    await Promise.all(el.getAnimations().map((a) => a.finished));
  });
  await page.screenshot({
    path: "../_bmad-output/implementation-artifacts/note-unit-complete.png",
  });
  await page.getByRole("button", { name: "再玩一次 ↻" }).click();
  await expect(page.locator("#world")).toHaveAttribute("data-run", "2");
  expect(errors).toEqual([]);
});

test("帮助、旋转与后台保留组合；减少动效不跳过播放", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await challenge(page);
  await put(page, "D");
  await page.getByRole("button", { name: "回看", exact: true }).click();
  await page.setViewportSize({ width: 428, height: 926 });
  await expect(page.getByText("横过来，去冒险。")).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  await page.setViewportSize({ width: 926, height: 428 });
  await page.getByRole("button", { name: "继续这次冒险 →" }).click();
  await expect(page.getByRole("dialog")).toContainText("让名字找到同一个音");
  await page.getByRole("button", { name: "回到花园 →" }).click();
  await expect(page.getByRole("button", { name: /^槽位 1：D/ })).toBeVisible();
  await page.getByRole("button", { name: "试运行 ♪" }).click();
  await expect(page.locator("#world")).toHaveAttribute("data-playing", "true");
  await expect(page.locator("#world")).toHaveAttribute("data-playing", "false");
  await complete(page);
});

test("横屏命中区至少44px且不重叠，材料未被教学卡遮住", async ({ page }) => {
  test.setTimeout(120000);
  for (const size of [
    { width: 926, height: 428 },
    { width: 844, height: 390 },
    { width: 667, height: 375 },
    { width: 1366, height: 768 },
  ]) {
    await page.setViewportSize(size);
    await challenge(page);
    await sequence(page);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    const boxes = await page.locator(".hotspot:visible").evaluateAll((els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        const top = document.elementFromPoint(
          r.x + r.width / 2,
          r.y + r.height / 2,
        );
        return {
          x: r.x,
          y: r.y,
          w: r.width,
          h: r.height,
          reachable: !!top && (e === top || e.contains(top)),
        };
      }),
    );
    for (let i = 0; i < boxes.length; i++) {
      const a = boxes[i]!;
      expect(a.w).toBeGreaterThanOrEqual(44);
      expect(a.h).toBeGreaterThanOrEqual(44);
      expect(a.reachable, JSON.stringify({ size, a, boxes })).toBe(true);
      expect(a.x).toBeGreaterThanOrEqual(0);
      expect(a.x + a.w).toBeLessThanOrEqual(size.width);
      for (const b of boxes.slice(i + 1))
        expect(
          a.x + a.w <= b.x ||
            b.x + b.w <= a.x ||
            a.y + a.h <= b.y ||
            b.y + b.h <= a.y,
          JSON.stringify({ size, a, b }),
        ).toBeTruthy();
    }
  }
});

test("取消触摸不放入，键盘可继续；回看焦点返回且不穿透", async ({ page }) => {
  await challenge(page);
  await page.getByRole("button", { name: "选择材料 D", exact: true }).click();
  const slot = page.getByRole("button", { name: /^槽位 1：/ });
  await slot.dispatchEvent("pointercancel");
  await slot.dispatchEvent("click");
  await expect(slot).toHaveAttribute("aria-label", /空/);
  await slot.focus();
  await slot.press("Enter");
  await expect(slot).toHaveAttribute("aria-label", /D/);
  const help = page.getByRole("button", { name: "回看", exact: true });
  await help.click();
  await page.keyboard.press("Escape");
  await expect(help).toBeFocused();
});

test("音频不可用可无声通过；WebGL故障与脚本失败有恢复入口", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.AudioContext = class {
      constructor() {
        throw new Error("test unavailable");
      }
    } as unknown as typeof AudioContext;
  });
  await page.goto("/");
  await page.getByRole("button", { name: "♪ 声音关" }).click();
  await expect(
    page.getByText("声音暂时无法开启，你仍可以无声体验。"),
  ).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await challenge(page);
  await complete(page);
  await page
    .locator("#scene")
    .evaluate((c) =>
      c.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
    );
  await expect(page.getByRole("button", { name: "重新加载" })).toBeVisible();
});

test("真实Web Audio解锁与暂停：隐藏期间不产生新声，回来不补播旧音", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const Native = window.AudioContext;
    const observed = { contexts: [] as AudioContext[], starts: 0 };
    (window as unknown as { audioObserved: typeof observed }).audioObserved =
      observed;
    window.AudioContext = class extends Native {
      constructor(...args: ConstructorParameters<typeof Native>) {
        super(...args);
        observed.contexts.push(this);
      }
      createOscillator() {
        const oscillator = super.createOscillator();
        const start = oscillator.start.bind(oscillator);
        oscillator.start = (...args: Parameters<typeof start>) => {
          observed.starts++;
          start(...args);
        };
        return oscillator;
      }
    };
  });
  const audioState = () =>
    page.evaluate(() => {
      const o = (
        window as unknown as {
          audioObserved: { contexts: AudioContext[]; starts: number };
        }
      ).audioObserved;
      return { state: o.contexts[0]?.state, starts: o.starts };
    });
  await challenge(page);
  await page.getByRole("button", { name: "♪ 声音关", exact: true }).click();
  await page.getByRole("button", { name: "选择材料 D", exact: true }).click();
  const before = await audioState();
  expect(before.state).toBe("running");
  expect(before.starts).toBeGreaterThan(0);
  await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  await expect.poll(async () => (await audioState()).state).toBe("suspended");
  await page.waitForTimeout(250);
  expect((await audioState()).starts).toBe(before.starts);
  await page.getByRole("button", { name: "继续这次冒险 →" }).click();
  await expect.poll(async () => (await audioState()).state).toBe("running");
  expect((await audioState()).starts).toBe(before.starts);
  await page.getByRole("button", { name: "选择材料 E", exact: true }).click();
  expect((await audioState()).starts).toBeGreaterThan(before.starts);
});

test("资源脚本加载失败时提供独立于主模块的重试入口", async ({ page }) => {
  await page.route("**/assets/*.js", (route) => route.abort("failed"));
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "重新加载", exact: true }),
  ).toBeVisible();
});

test("仅开纸声也能解锁，后台回来保持纸声开且音符关", async ({ page }) => {
  await page.addInitScript(() => {
    const Native = window.AudioContext;
    const o = { contexts: [] as AudioContext[], pages: 0 };
    (window as unknown as { paperObserved: typeof o }).paperObserved = o;
    window.AudioContext = class extends Native {
      constructor(...args: ConstructorParameters<typeof Native>) {
        super(...args);
        o.contexts.push(this);
      }
      createBufferSource() {
        const source = super.createBufferSource();
        const start = source.start.bind(source);
        source.start = (...args: Parameters<typeof start>) => {
          o.pages++;
          start(...args);
        };
        return source;
      }
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "靠近机关", exact: true }).click();
  await page.getByRole("button", { name: "听听看 →", exact: true }).waitFor();
  await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  await page.getByRole("button", { name: "继续这次冒险 →" }).click();
  await expect(page.locator("#world")).toHaveAttribute("data-paused", "false");
  const output = await page.evaluate(() => {
    const o = (
      window as unknown as {
        paperObserved: { contexts: AudioContext[]; pages: number };
      }
    ).paperObserved;
    return { state: o.contexts[0]?.state, pages: o.pages };
  });
  expect(output.state).toBe("running");
  expect(output.pages).toBeGreaterThan(0);
  await expect(page.locator("#music")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#paper")).toHaveAttribute("aria-pressed", "true");
});

test("迟到的音频解锁不覆盖无声选择或跳过示范，迟到的恢复不取消新的暂停", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const resume = AudioContext.prototype.resume;
    AudioContext.prototype.resume = function () {
      return resume
        .call(this)
        .then(() => new Promise<void>((resolve) => setTimeout(resolve, 500)));
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "靠近机关", exact: true }).click();
  await page.getByRole("button", { name: "听听看 →", exact: true }).click();
  await page.getByRole("button", { name: "无声继续", exact: true }).click();
  await page.waitForTimeout(650);
  await expect(page.locator("#world")).toHaveAttribute("data-phase", "demo");
  await expect(page.locator("#music")).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "♪ 声音关", exact: true }).click();
  await expect(page.locator("#music")).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  await page.getByRole("button", { name: "继续这次冒险 →" }).click();
  await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  await page.waitForTimeout(650);
  await expect(page.locator("#world")).toHaveAttribute("data-paused", "true");
  await expect(
    page.getByRole("button", { name: "继续这次冒险 →" }),
  ).toBeVisible();
});

test("真实输出信号包含 C D E 的独立音高，关闭声音后输出归零", async ({
  page,
}) => {
  await installSoundMeter(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await challenge(page);
  await page.getByRole("button", { name: "♪ 声音关", exact: true }).click();
  for (const [note, hz] of [
    ["C", 261.63],
    ["D", 293.66],
    ["E", 329.63],
  ] as const) {
    await page.waitForTimeout(800);
    await page
      .getByRole("button", { name: `选择材料 ${note}`, exact: true })
      .click();
    await page.waitForTimeout(250);
    const signal = await page.evaluate(() =>
      (
        window as unknown as {
          sampleSound: () => { frequency: number; rms: number };
        }
      ).sampleSound(),
    );
    expect(signal.rms).toBeGreaterThan(0.005);
    expect(Math.abs(signal.frequency - hz)).toBeLessThan(3);
  }
  await page.getByRole("button", { name: "♪ 声音开", exact: true }).click();
  await page.getByRole("button", { name: "选择材料 C", exact: true }).click();
  await page.waitForTimeout(900);
  const silent = await page.evaluate(() =>
    (window as unknown as { sampleSound: () => { rms: number } }).sampleSound(),
  );
  expect(silent.rms).toBeLessThan(0.00001);
});

test("错误序列可替换；播放中暂停后从头重播，不能提前开桥", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await challenge(page);
  await sequence(page);
  await page.getByRole("button", { name: "试运行 ♪" }).click();
  await expect(page.locator("#feedback")).toContainText("填好圆槽");
  for (const [i, id] of ["C", "D", "E"].entries()) await put(page, id, i);
  await submit(page);
  await expect(page.locator("#feedback")).toContainText("还没对上");
  await expect(page.locator("#world")).toHaveAttribute("data-task", "c3");
  await put(page, "E", 0);
  await put(page, "C", 2);
  await page.getByRole("button", { name: "试运行 ♪" }).click();
  await expect(page.locator("#world")).toHaveAttribute("data-playing", "true");
  await page.getByRole("button", { name: "回看", exact: true }).click();
  await page.waitForTimeout(1000);
  await expect(page.locator("#world")).toHaveAttribute(
    "data-phase",
    "challenge",
  );
  await page.getByRole("button", { name: "回到花园 →" }).click();
  await expect(page.locator('[data-slot="0"]')).toHaveClass(/sounding/);
  await expect(page.locator("#world")).toHaveAttribute(
    "data-phase",
    "complete",
  );
});

test("结果区分重试与提示，回听不改记录；第二轮重复音和上一轮摘要", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await challenge(page);
  await put(page, "C");
  await submit(page);
  await complete(page);
  await expect(page.locator(".attempt-list")).toContainText("重试后完成");
  const original = await page.locator(".attempt-list").innerText();
  await page.getByRole("button", { name: "回听我的组合 ♪" }).click();
  await expect(page.locator('[data-result-slot="0"]')).toHaveClass(/sounding/);
  await page.getByRole("button", { name: "回看", exact: true }).click();
  await page.getByRole("button", { name: "回到花园 →" }).click();
  await expect(page.locator(".attempt-list")).toHaveText(original, { useInnerText: true });
  await page.getByRole("button", { name: "再玩一次 ↻" }).click();
  await page.getByText("上一轮记录", { exact: true }).click();
  await expect(page.locator(".previous")).toContainText("重试后完成");
  await challenge(page, false);
  await page.getByRole("button", { name: "回看", exact: true }).click();
  await page.getByRole("button", { name: "回到花园 →" }).click();
  await complete(page);
  await expect(page.locator(".result-sequence")).toHaveText("CdoEmiCdo");
  await expect(page.locator(".attempt-list").first()).toContainText(
    "借助提示完成",
  );
  await expect(page.locator(".attempt-list").first()).not.toContainText(
    "重试后完成",
  );
  await page.getByRole("button", { name: "回听我的组合 ♪" }).click();
  await expect(page.locator('[data-result-slot="0"]')).toHaveClass(/sounding/);
  await expect(page.locator('[data-result-slot="1"]')).toHaveClass(/sounding/);
  await expect(page.locator('[data-result-slot="2"]')).toHaveClass(/sounding/);
  await expect(page.locator("#world")).toHaveAttribute(
    "data-phase",
    "complete",
  );
});

async function installSoundMeter(page:Page) {
  await page.addInitScript(() => {
    const Native = window.AudioContext;
    const meters = new Map<AudioContext, AnalyserNode>();
    const connect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (
      this: AudioNode,
      ...args: unknown[]
    ) {
      const meter = meters.get(this.context as AudioContext);
      if (meter && this !== meter && args[0] === this.context.destination)
        args[0] = meter;
      return Reflect.apply(connect, this, args);
    } as typeof connect;
    window.AudioContext = class extends Native {
      constructor(...args: ConstructorParameters<typeof Native>) {
        super(...args);
        const meter = this.createAnalyser();
        meter.fftSize = 32768;
        meter.smoothingTimeConstant = 0;
        meter.connect(this.destination);
        meters.set(this, meter);
        (
          window as unknown as {
            sampleSound: () => { frequency: number; rms: number };
          }
        ).sampleSound = () => {
          const spectrum = new Float32Array(meter.frequencyBinCount);
          meter.getFloatFrequencyData(spectrum);
          const wave = new Float32Array(meter.fftSize);
          meter.getFloatTimeDomainData(wave);
          let peak = 0,
            level = -Infinity;
          for (let i = 1; i < spectrum.length; i++) {
            const hz = (i * this.sampleRate) / meter.fftSize;
            if (hz >= 200 && hz <= 400 && spectrum[i] > level) {
              peak = hz;
              level = spectrum[i];
            }
          }
          return {
            frequency: peak,
            rms: Math.sqrt(
              wave.reduce((sum, v) => sum + v * v, 0) / wave.length,
            ),
          };
        };
      }
    };
  });
}


test('三音提交实际输出与槽位一致，含错误组合与重复音回听',async({page})=>{
  test.setTimeout(90000);await installSoundMeter(page);
  await page.emulateMedia({reducedMotion:'reduce'});await challenge(page);await sequence(page);
  await page.getByRole('button',{name:'♪ 声音关',exact:true}).click();
  async function listenToSlots(frequencies:number[],result=false) {
    for(const [i,hz] of frequencies.entries()) {
      const slot=page.locator(result?`[data-result-slot="${i}"]`:`[data-slot="${i}"]`);
      await expect(slot).toHaveClass(/sounding/);
      // FFT窗口包含起音与前一音的尾部；在本槽仍发声时等到有效谱峰，不能用下一槽凑通过。
      await expect.poll(async()=>{
        const active=await slot.evaluate(el=>el.classList.contains('sounding'));
        const sample=await page.evaluate(()=>(window as unknown as {sampleSound:()=>{frequency:number;rms:number}}).sampleSound());
        return active && sample.rms>.005 && Math.abs(sample.frequency-hz)<3;
      },{timeout:600,intervals:[30],message:`槽位${i+1}应实际发出${hz}Hz且保持可闻输出`}).toBe(true);
    }
  }
  for(const [i,id] of ['C','D','E'].entries())await put(page,id,i);
  await page.getByRole('button',{name:'试运行 ♪'}).click();
  await listenToSlots([261.63,293.66,329.63]);
  await expect(page.locator('#feedback')).toContainText('还没对上');
  for(const [i,id] of ['E','D','C'].entries())await put(page,id,i);
  await page.getByRole('button',{name:'试运行 ♪'}).click();
  await listenToSlots([329.63,293.66,261.63]);
  await expect(page.locator('#world')).toHaveAttribute('data-phase','complete');
  await page.getByRole('button',{name:'回听我的组合 ♪'}).click();
  await listenToSlots([329.63,293.66,261.63],true);
  await page.getByRole('button',{name:'再玩一次 ↻'}).click();await challenge(page,false);await sequence(page);
  await page.getByRole('button',{name:'♪ 声音关',exact:true}).click();
  for(const [i,id] of ['C','E','C'].entries())await put(page,id,i);
  await page.getByRole('button',{name:'试运行 ♪'}).click();await listenToSlots([261.63,329.63,261.63]);
  await expect(page.locator('#world')).toHaveAttribute('data-phase','complete');
  await page.getByRole('button',{name:'回听我的组合 ♪'}).click();await listenToSlots([261.63,329.63,261.63],true);
});
