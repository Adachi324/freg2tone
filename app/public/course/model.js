export const day=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const reviewOpen=(completed,today=day())=>Boolean(completed&&today>completed);
export const assist=r=>r?.correct?r:{first:null,attempts:0,correct:false,...r,help:true};
export function answer(r,value,target,allowed=true){if(!allowed||r?.correct)return r;return {first:r?.first??value,attempts:(r?.attempts??0)+1,help:Boolean(r?.help),correct:value===target};}
export function finish(s,ids,today=day()){if(!s.completed&&ids.length&&ids.every(id=>s.records[id]?.correct))s.completed=today;}
function begun(s){s.started??={};if(s.active&&Number.isFinite(s.helpSeen)&&!(s.active in s.started))s.started[s.active]=s.helpSeen;return s.started;}
export function beginQuestion(s,id,time){const started=begun(s);started[id]??=time;s.active=id;s.helpSeen=time;}
export function helpOpen(s){for(const id of Object.keys(begun(s)))s.records[id]=assist(s.records[id]);}
export function visit(s,time){for(const [id,start] of Object.entries(begun(s)))if(time>start)s.records[id]=assist(s.records[id]);s.helpSeen=time;}
export const navigationHelps=path=>/\/(wiki|explore|lesson-1)(\/|$)/.test(path);
