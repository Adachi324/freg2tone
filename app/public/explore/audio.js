// 新请求替换旧请求；只有音频时钟真正走完才返回 true。
export function createPlayer(onNote, onEnd, onError, onStatus=()=>{}, options={}) {
  let context, voices=[], timers=[], generation=0, cancel=null;
  function clear() {
    timers.forEach(clearTimeout); timers=[];
    voices.forEach(({oscillator,gain})=>{try{oscillator.stop();}catch{} oscillator.disconnect();gain.disconnect();}); voices=[];
    onNote(null);
  }
  function stop(message='已停止播放。') {
    generation++; cancel?.(); cancel=null; clear(); onEnd(); onStatus(typeof message==='string'?message:'已停止播放。');
  }
  async function play(notes,durations=notes.map(()=>1)) {
    stop('正在启动声音…'); const current=generation;
    let resolveCancel;
    const cancelled=new Promise(resolve=>{resolveCancel=()=>resolve(false);});cancel=resolveCancel;
    try {
      if(!notes.length||notes.some(n=>!Number.isFinite(n)))throw Error('invalid notes');
      if(!context||context.state==='closed')context=new (window.AudioContext||window.webkitAudioContext)();
      const active=context;
      let timeout;
      const started=await Promise.race([active.resume().then(()=>true),cancelled,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('resume timeout')),2500);})]).finally(()=>clearTimeout(timeout));
      if(!started||current!==generation)return false;
      if(active.state!=='running')throw Error('audio not running');
      onStatus('正在播放…再次点击可重新播放或切换。');
      const start=active.currentTime+.04, step=options.stepSeconds??.45, tail=options.tailSeconds??.15;
      let offset=0;
      notes.forEach((midi,index)=>{
        const time=start+offset, length=step*durations[index];
        const oscillator=active.createOscillator(),gain=active.createGain();
        oscillator.type='triangle';oscillator.frequency.value=440*2**((midi-69)/12);
        gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(.195,time+.012);
        gain.gain.exponentialRampToValueAtTime(.0015,time+length+tail-.05);
        oscillator.connect(gain);gain.connect(active.destination);voices.push({oscillator,gain});
        oscillator.start(time);oscillator.stop(time+length+tail);offset+=length;
      });
      const end=start+offset+tail, deadline=Date.now()+(offset+Math.max(tail,0)+5)*1000;
      let noteIndex=-1;
      const finished=new Promise((resolve,reject)=>{
        const tick=()=>{
          if(current!==generation){resolve(false);return;}
          if(active.state!=='running'){reject(Error('interrupted'));return;}
          const elapsed=active.currentTime-start;
          let boundary=0,index=-1;durations.forEach((d,i)=>{if(elapsed>=boundary)index=i;boundary+=step*d;});
          if(index!==noteIndex&&index>=0){noteIndex=index;onNote(notes[index]);}
          if(active.currentTime>=end){resolve(true);return;}
          if(Date.now()>deadline){reject(Error('audio clock stalled'));return;}
          timers.push(setTimeout(tick,30));
        };tick();
      });
      const complete=await Promise.race([finished,cancelled]);
      if(current!==generation)return false;
      clear();cancel=null;onEnd();onStatus('播放完成，可以重听。');return complete;
    } catch {
      if(current===generation){clear();cancel=null;context?.close().catch(()=>{});context=null;onEnd();onStatus('播放未完成。请再次点击播放；若仍无声，检查静音、音量或蓝牙输出。');onError('声音未能启动或播放被中断，请再次点击重试。');}
      return false;
    }
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop('播放已暂停，返回后请重新点击播放。');});
  window.addEventListener('pagehide',()=>stop());
  return {play,stop};
}
