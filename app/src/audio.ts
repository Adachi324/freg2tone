import { notes } from "./lesson.ts";
import type { MaterialId } from "./lesson.ts";

/** 只有短音和纸张声；不持有游戏状态或任何判题逻辑。 */
export class Sound {
  private context: AudioContext | null = null;
  private active = new Set<AudioScheduledSourceNode>();
  private envelopes = new Set<GainNode>();
  music = false;
  paper = true;
  async unlock(): Promise<boolean> {
    try {
      this.context ??= new AudioContext();
      await this.context.resume();
      return this.context.state === "running";
    } catch {
      return false;
    }
  }
  stop(immediate = false): void {
    const now = this.context?.currentTime || 0;
    for (const gain of this.envelopes) {
      gain.gain.cancelAndHoldAtTime(now);
      if (immediate) gain.gain.setValueAtTime(0, now);
      else gain.gain.linearRampToValueAtTime(0, now + 0.012);
    }
    for (const source of this.active) {
      try {
        source.stop(now + (immediate ? 0 : 0.015));
      } catch {
        /* 已结束。 */
      }
    }
    this.active.clear();
  }
  async suspend(): Promise<void> {
    this.stop(true);
    if (this.context?.state === "running")
      await this.context.suspend().catch(() => {});
  }
  note(id: MaterialId): number {
    const ctx = this.context;
    if (!this.music || !ctx || ctx.state !== "running")
      return performance.now();
    this.stop();
    const start = ctx.currentTime + 0.025;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.17, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.65);
    gain.connect(ctx.destination);
    this.envelopes.add(gain);
    let remaining = 3;
    for (const [multiple, volume] of [
      [1, 1],
      [2, 0.22],
      [3, 0.08],
    ]) {
      const oscillator = ctx.createOscillator();
      const partial = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = notes[id].frequency * multiple;
      partial.gain.value = volume;
      oscillator.connect(partial);
      partial.connect(gain);
      this.active.add(oscillator);
      oscillator.onended = () => {
        this.active.delete(oscillator);
        oscillator.disconnect();
        partial.disconnect();
        if (--remaining === 0) {
          gain.disconnect();
          this.envelopes.delete(gain);
        }
      };
      oscillator.start(start);
      oscillator.stop(start + 0.7);
    }
    const timestamp = ctx.getOutputTimestamp?.();
    return timestamp?.contextTime && timestamp.performanceTime
      ? timestamp.performanceTime + (start - timestamp.contextTime) * 1000
      : performance.now() +
          (start - ctx.currentTime + (ctx.outputLatency || 0)) * 1000;
  }
  page(): void {
    const ctx = this.context;
    if (!this.paper || !ctx || ctx.state !== "running") return;
    this.stop();
    const duration = 0.17;
    const buffer = ctx.createBuffer(
      1,
      Math.ceil(ctx.sampleRate * duration),
      ctx.sampleRate,
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / data.length);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1600;
    filter.Q.value = 0.65;
    const gain = ctx.createGain();
    gain.gain.value = 0.06;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    this.active.add(source);
    this.envelopes.add(gain);
    source.onended = () => {
      this.active.delete(source);
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
      this.envelopes.delete(gain);
    };
    source.start();
  }
}
