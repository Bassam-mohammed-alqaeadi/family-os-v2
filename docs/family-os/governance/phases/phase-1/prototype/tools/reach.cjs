// فحص الوصول (المراجعة الختامية — ROADMAP، البند 4): هل لكل سطح مدخل من التنقل العادي؟
// قراءة ساكنة للمصدر، بلا متصفح: يبني خريطة «من أي سطح يُفتح أي سطح» من نص كل سطح، ومن الأفعال (ACT) التي يستدعيها،
// ومن الدوال المساعدة التي يمر بها، ثم يمشي من الجذور: تبويبات كل قالب، وشاشة الترحيب، وما يفتحه هيكل التطبيق نفسه (core.js).
// STATE: أسطح لا يفتحها زر بل حالة (النظام يعرضها حين تقع حالتها)؛ ليست نقصاً، وتُفتح في النموذج من الاستوديو.
// النجاح: unreached فارغة. التشغيل من مجلد النموذج:  node tools/reach.cjs
const fs=require('fs'),path=require('path');const dir=path.join(__dirname,'..','assets','js');
const STATE={'sys-update':'تحديث إجباري يفرضه الخادم','sys-maint':'صيانة يعلنها الخادم','sys-first':'أول فتح للتطبيق دون اتصال','owner-now':'تظهر مرة واحدة حين تكتمل مهلة حذف حساب المالك (Q-402)',
 'bio-unlock':'تظهر عند فتح التطبيق إن كان الفتح بالبصمة مشغَّلاً','ob-totp':'بديل مقترح ينتظر حكم المالك (Q-246)؛ لا يدخل المسار قبل الحكم'};
/* WRAP: سطح يفتحه غلاف يُركَّب على أفعال الحفظ وقت التشغيل، فلا تراه القراءة الساكنة؛ يُتحقق أن الغلاف ما زال في مكانه. */
const WRAP={conflict:['conflicts.js',"S.sheet = { id: 'conflict'",'ACT[name] = ','ورقة التعارض تفتحها أفعال حفظ القواعد حين يتعارض حكمان (Q-419)؛ يمشي فيها test-q419']};
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.js')&&!/req-data|icons|studio/.test(f));
const chunks=[];   // {file,kind:'surface'|'act'|'fn',name,text}
for(const f of files){const L=fs.readFileSync(path.join(dir,f),'utf8').split('\n');let cur=null;const push=()=>{if(cur)chunks.push(cur)};
 for(const l of L){let m;
  if((m=l.match(/^surface\('([a-z0-9-]+)'/))){push();cur={file:f,kind:'surface',name:m[1],text:l}}
  else if(/^Object\.assign\(ACT/.test(l)){push();cur={file:f,kind:'act',name:'',text:l}}
  else if((m=l.match(/^(?:async )?function\*? ([A-Za-z0-9_$]+)/))||(m=l.match(/^(?:const|let|var) ([A-Za-z0-9_$]+)\s*=/))){push();cur={file:f,kind:'fn',name:m[1],text:l}}
  else if(cur)cur.text+='\n'+l}
 push()}
const ids=chunks.filter(c=>c.kind==='surface').map(c=>c.name);const idRe=new RegExp("['\"`:]("+ids.slice().sort((a,b)=>b.length-a.length).map(i=>i.replace(/-/g,'\\-')).join('|')+")(?![A-Za-z0-9-])",'g');
const ACT={};for(const c of chunks.filter(c=>c.kind==='act')){const parts=c.text.split(/\n(?=  [A-Za-z0-9_$]+\s*[(:])/);for(const p of parts){const m=p.match(/^  ([A-Za-z0-9_$]+)\s*[(:]/);if(m)ACT[m[1]]=(ACT[m[1]]||'')+p}}
const FN={};for(const c of chunks.filter(c=>c.kind==='fn'))FN[c.name]={text:c.text,core:c.file==='core.js'};
const actRe=new RegExp("['\"`]("+Object.keys(ACT).sort((a,b)=>b.length-a.length).join('|')+")(?=['\"`:])",'g');
const fnRe=new RegExp("(?<![A-Za-z0-9_$.])("+Object.keys(FN).filter(n=>!FN[n].core&&n.length>1).sort((a,b)=>b.length-a.length).map(n=>n.replace(/\$/g,'\\$')).join('|')+")(?=\\s*\\()",'g');
const memo={};const out=(key,text,self)=>{if(memo[key])return memo[key];const R=memo[key]=new Set();   /* الأسطح التي يفتحها هذا النص */
 for(const m of text.matchAll(idRe))if(m[1]!==self)R.add(m[1]);
 for(const m of text.matchAll(actRe))for(const x of out('act:'+m[1],ACT[m[1]]))R.add(x);
 for(const m of text.matchAll(fnRe))if(FN[m[1]])for(const x of out('fn:'+m[1],FN[m[1]].text))R.add(x);
 return R};
const E={};for(const c of chunks.filter(c=>c.kind==='surface'))E[c.name]=out('s:'+c.name,c.text.replace(/^surface\('[a-z0-9-]+'/,''),c.name);
const core=chunks.filter(c=>c.file==='core.js').map(c=>c.text).join('\n');const roots=new Set(['ob-welcome']);for(const m of core.matchAll(idRe))roots.add(m[1]);for(const m of core.matchAll(actRe))for(const x of out('act:'+m[1],ACT[m[1]]))roots.add(x);
const seen=new Set(roots),Q=[...roots];while(Q.length){const a=Q.shift();for(const b of E[a]||[])if(!seen.has(b)){seen.add(b);Q.push(b)}}
const wrapped=[];for(const [id,[f,x,y,why]] of Object.entries(WRAP)){const t=fs.readFileSync(path.join(dir,f),'utf8');if(t.includes(x)&&t.includes(y)){seen.add(id);wrapped.push(id+' — '+why)}}
const un=ids.filter(i=>!seen.has(i));const R={total:ids.length,reached:ids.length-un.length,state:un.filter(i=>STATE[i]).map(i=>i+' — '+STATE[i]),wrapped,unreached:un.filter(i=>!STATE[i]),staleState:Object.keys(STATE).filter(i=>!un.includes(i))};
if(process.argv[2])R.from=ids.filter(a=>(E[a]||new Set()).has(process.argv[2])),R.rootHas=roots.has(process.argv[2]);
console.log(JSON.stringify(R,null,1));process.exitCode=R.unreached.length||R.staleState.length?1:0;
