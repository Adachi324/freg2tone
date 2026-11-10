// 同一个播放器负责试听和音阶；任何新播放都会取消上一段。
export function createPlayer(onNote, onEnd, onError) {
  let context, voices = [], timers = [], generation = 0;
  function stop() {
    generation++;
    timers.forEach(clearTimeout); timers = [];
    voices.forEach(voice => { try { voice.stop(); } catch {} }); voices = [];
    onNote(null); onEnd();
  }
  async function play(notes) {
    stop(); const current = generation;
    try {
      context ??= new AudioContext();
      await context.resume();
      if (current !== generation) return;
      if (context.state !== 'running') throw new Error('audio unavailable');
      const start = context.currentTime + .04;
      notes.forEach((midi, index) => {
        const time = start + index * .45;
        const oscillator = context.createOscillator(), gain = context.createGain();
        oscillator.type = 'triangle'; oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
        gain.gain.setValueAtTime(0,time); gain.gain.linearRampToValueAtTime(.13,time+.012);
        gain.gain.exponentialRampToValueAtTime(.001,time+.55);
        oscillator.connect(gain); gain.connect(context.destination);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
        oscillator.start(time); oscillator.stop(time+.6); voices.push(oscillator);
        timers.push(setTimeout(() => { if (current === generation) onNote(midi); },index*450+40));
      });
      timers.push(setTimeout(() => { if (current === generation) stop(); },notes.length*450+200));
    } catch { if (current === generation) { stop(); onError('声音未能启动，请检查浏览器声音设置后再试。'); } }
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide',stop);
  return {play,stop};
}
