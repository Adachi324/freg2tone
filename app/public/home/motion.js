const ns='http://www.w3.org/2000/svg';
const wires=document.querySelector('#wires'),frets=document.querySelector('#frets'),markers=document.querySelector('#markers');
const paths=Array.from({length:6},()=>{const path=document.createElementNS(ns,'path');wires.append(path);return path});
let progress=0,target=0,paused=false,frame=0,last=0,phase=0;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
function shape(){paths.forEach((path,i)=>{const p=(1-Math.cos(progress*Math.PI))/2,offset=i*15,y=300+i*33,breath=Math.sin(phase/8000)*9;
const start=[-80,500+offset+breath,340,760+offset,730,390+offset+breath,1280,495+offset];
const end=[105,y,430,y,780,y,1095,y];const a=start.map((v,n)=>v+(end[n]-v)*p);
path.setAttribute('d',`M${a[0]},${a[1]} C${a[2]},${a[3]} ${a[4]},${a[5]} ${a[6]},${a[7]}`);});}
function drawBoard(){for(let i=0;i<=12;i++){const x=105+i*82.5;const line=document.createElementNS(ns,'line');Object.entries({x1:x,x2:x,y1:286,y2:480,stroke:i===0?'#e0d4ca':'#ded9d8','stroke-width':i===0?6:1}).forEach(([k,v])=>line.setAttribute(k,v));frets.append(line);if(i){const label=document.createElementNS(ns,'text');label.setAttribute('x',x-41);label.setAttribute('y',270);label.setAttribute('text-anchor','middle');label.setAttribute('fill','#90868b');label.setAttribute('font-size',13);label.textContent=i;markers.append(label)}}}
function tick(now){const dt=Math.min(now-last||16,40);last=now;if(!paused&&!reduce.matches)phase+=dt;
if(reduce.matches)progress=target;else{const step=dt/650;progress=target===1?Math.min(1,progress+step):Math.max(0,progress-step)}
shape();if(!document.hidden)frame=requestAnimationFrame(tick);}
let navigationTimer;
const enter=document.querySelector('#enter');
function reset(){clearTimeout(navigationTimer);target=0;progress=0;last=0;document.body.classList.remove('leaving','exploring');enter.removeAttribute('aria-busy');shape();}
enter.addEventListener('click',event=>{
 if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 if(reduce.matches)return;
 event.preventDefault();if(target===1)return;
 target=1;document.body.classList.add('leaving','exploring');enter.setAttribute('aria-busy','true');
 navigationTimer=setTimeout(()=>location.assign(enter.href),650);
});
document.querySelectorAll('header a').forEach(link=>link.addEventListener('click',event=>{if(event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey)reset();}));
function resume(){cancelAnimationFrame(frame);last=0;shape();if(!document.hidden&&!reduce.matches)frame=requestAnimationFrame(tick);}
document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('paused',document.hidden);resume();});
window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);clearTimeout(navigationTimer);});
window.addEventListener('pageshow',event=>{if(event.persisted){reset();resume();}});
reduce.addEventListener('change',()=>{if(reduce.matches&&target===1){clearTimeout(navigationTimer);location.assign(enter.href);}resume();});
drawBoard();shape();document.body.classList.add('intro-animate');resume();
