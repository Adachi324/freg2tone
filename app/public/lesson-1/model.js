export const day=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const available=(completed,d=new Date())=>Boolean(completed&&day(d)>completed);
export function submit(old,note,target,help){if(old?.correct)return old;return {first:old?.first??note,attempts:(old?.attempts??0)+1,help:Boolean(old?.help||help),correct:note===target};}
export const names=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
export const name=n=>names[n%12]+(Math.floor(n/12)-1);
export const label=d=>({3:'小三度',4:'大三度',7:'纯五度'})[d];
export const sets={practice:[[67,4],[62,7],[66,3],[60,4]],hearing:[[64,7],[66,4],[64,3],[67,7]],review:[[65,3],[59,7],[69,4],[62,3]]};
export const markHelp=old=>old?.correct?old:{first:null,attempts:0,correct:false,...old,help:true};
export function applyVisit(state,visit){if(state.activeId&&Number.isFinite(state.helpSeen)&&visit>state.helpSeen){state.records[state.activeId]=markHelp(state.records[state.activeId]);}state.helpSeen=visit;}
