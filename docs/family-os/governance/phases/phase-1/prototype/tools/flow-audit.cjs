// فحص إغلاق العمليات (Q-435): يضغط كل زر ظاهر في كل سطح بشخصيته ويتبع كل عملية إلى نهايتها، ويسأل:
//   silent   زر يُضغط فلا يحدث شيء: لا شاشة، لا رسالة، لا تغيير ← طريق مسدود
//   toast    فعل ينتهي برسالة عابرة وحدها بلا أثر محفوظ ← قائمة مراجعة (تسليم لتطبيق آخر مقبول؛ «قريباً» غير مقبول)
//   commits  كل عملية حفظها الأب أو البالغ (سُجّلت في التدقيق): هل تغيّر شيء في شاشات الابن؟
//            وكل عملية أرسلها الابن: هل تغيّر شيء عند الأب؟ (والبالغ المفوَّض: عند الأب وعند الأبناء)
//            unseen = حُفظت ولم يتغير شيء عند الطرف الآخر ← تُراجع: إن كانت تخصه فهي ثغرة «لا تنعكس عنده»
//   hollow   رسالة نجاح ولم يُحفظ شيء ← تُراجع
// ثلاث جولات لكل سطح: (1) كل زر كما هو؛ (2) بعد ملء الحقول؛ (3) بعد كل مفتاح حالة ثم الأزرار الرئيسية.
// التشغيل:  node tools/flow-audit.cjs [list] [سطح …]     (list يطبع التفصيل؛ وأسماء الأسطح تقصر الفحص عليها)
// النجاح:  silent=[] و errs=[] و review=[] (review = ما في toast و hollow و unseen وليس في قائمتي المقبول OKT و OKU أسفل الملف).
const puppeteer=require('puppeteer-core');let chromium=require('@sparticuz/chromium');chromium=chromium.default||chromium;
const root=require('path').join(__dirname,'..');
(async()=>{const args=[...chromium.args.filter(a=>!/in-process-gpu|use-gl|use-angle|swiftshader|ignore-gpu/.test(a)),'--disable-gpu','--allow-file-access-from-files'];
const b=await puppeteer.launch({args,executablePath:await chromium.executablePath(),headless:'shell',protocolTimeout:600000});let R={};
try{const page=await b.newPage();await page.setViewport({width:1500,height:1000});const errs=[];let cur='';page.on('pageerror',e=>errs.push(cur+' · '+String(e)));page.on('console',m=>{if(m.type()==='warning'||m.type()==='error')errs.push(cur+' · console: '+m.text().slice(0,120))});
await page.goto('file://'+root+'/index.html?quiet=1');await page.evaluate(()=>document.fonts.ready);await new Promise(r=>setTimeout(r,1500));
await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});
/* سطحاً سطحاً: كل سطح في نداء مستقل حتى يتنفس المتصفح بين الأسطح (الحلقة الواحدة الطويلة تملأ الذاكرة) */
const IDS=await page.evaluate(()=>{const ph=document.getElementById('phone');const T=()=>document.getElementById('toast'),NF=()=>document.getElementById('notif');
 const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'};
 const NAT={adult:['owner'],owner:['owner'],any:['owner','child'],delegate:['delegate'],teen:['teen'],kid:['child','teen'],child:['child'],guest:['guest']};
 const clr=()=>{T().innerHTML='';if(NF())NF().innerHTML=''};
 const setup=(id,p)=>{clr();S=fresh();setPersona(p);jump(id);render()};
 const curId=()=>S.dlg?'dlg':S.full?S.full.id:S.sheet?S.sheet.id:S.stack[S.stack.length-1].id;
 const snap=()=>JSON.stringify(S,(k,v)=>typeof v==='function'?undefined:v);
 /* ما يراه كل ابن: أسطحه الخاصة وما يشاركه مع أهله، بحالتها الأولى، نصاً */
 const PSET={child:['kid','any','child'],teen:['kid','any','teen'],owner:['adult','owner','any'],delegate:['adult','delegate','any']};
 const KSURF=p=>Object.keys(SC).filter(id=>PSET[p].includes(SC[id].p)&&!/^(sys-|ob-|pin|sos-count|about|help|legal|licenses|display|msg-actions|conflict)/.test(id));
 const dif=(a,b)=>{let i=0;while(i<a.length&&a[i]===b[i])i++;return b.slice(Math.max(0,i-18),i+46)};
 const kidView=(st,p)=>{const keep=S,o={};clr();const one=(k,f)=>{try{S=JSON.parse(st);setPersona(p);f();render();o[k]=ph.textContent.replace(/\s+/g,' ')}catch(e){o[k]='ERR '+e.message}};
   one('@root',()=>{});for(const id of KSURF(p))one(id,()=>jump(id));S=keep;clr();return o};
 const st0=(S=fresh(),snap());const K0={child:kidView(st0,'child'),teen:kidView(st0,'teen'),owner:kidView(st0,'owner')};
 const WATCH={owner:['child','teen'],delegate:['owner','child','teen'],child:['owner'],teen:['owner']};
 const live=()=>{const lay=[...ph.querySelectorAll('#ov > .scrim, #ov > .full')].pop();
   return [...ph.querySelectorAll('[data-a]')].filter(e=>vis(e)&&!e.disabled&&e.getAttribute('aria-disabled')!=='true'&&e.getAttribute('aria-hidden')!=='true'&&!e.closest('[inert]')&&(!lay||lay.contains(e))&&!e.matches('.scrim')&&!e.closest('.nav'))};
 const chosen=e=>!!e.querySelector('.val use[href="#i-radio_button_checked"],.val use[href="#i-check_circle-fill"]')||e.getAttribute('aria-pressed')==='true'||e.getAttribute('aria-selected')==='true'||e.getAttribute('aria-current')==='true'||(e.getAttribute('role')==='radio'&&e.getAttribute('aria-checked')==='true');
 const fill=()=>{for(const i of ph.querySelectorAll('input:not([type=checkbox]):not([type=radio]),textarea')){if(!vis(i)||i.disabled||i.readOnly||i.value)continue;i.value=i.type==='number'||i.inputMode==='numeric'?'30':i.type==='email'?'a@b.co':i.type==='tel'?'777123456':'تجربة';i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}))}};
 const find=a=>live().find(e=>e.dataset.a===a);
 const STSEL='.seg button,.fch button,.chs button,[data-a^="set:"],.tg[data-a],[role="switch"][data-a],[aria-expanded="false"][data-a],.chips [data-a],.opt[data-a]';
 window.__FA=id=>{const silent=[],toastOnly=[],commits=[],hollow=[],errs=[],used=new Set();let clicks=0;const UI=new Set(['stack','sheet','full','dlg','persona']);
  const dk=(a,b)=>{const A=JSON.parse(a),B=JSON.parse(b);return [...new Set([...Object.keys(A),...Object.keys(B)])].filter(k=>!UI.has(k)&&JSON.stringify(A[k])!==JSON.stringify(B[k]))};const seenC=new Set();
  /* ينفّذ سلسلة: [مفتاح حالة؟] [ملء؟] زر. يعيد null إن لم يوجد الزر. */
  const run=(p,pre,doFill,a,lvl)=>{setup(id,p);if(pre){const e=find(pre);if(!e)return;e.click();render();if(S.dlg||curId()!==id&&S.stack[S.stack.length-1].id!==id)return}
    if(doFill)fill();const el=find(a);if(!el)return;if(lvl===1&&chosen(el))return;
    const h0=ph.innerHTML,s0=snap(),c0=curId(),n0=S.audit.length;clr();clicks++;used.add(a.split(':')[0]);if(pre)used.add(pre.split(':')[0]);
    try{el.click();if(S.dlg&&lvl>1){const y=ph.querySelector('[data-a="dlgYes"]');if(y){y.click()}}render()}catch(e){errs.push(id+'/'+p+' '+(pre?pre+' → ':'')+a+' → '+e.message.slice(0,90));return}
    const h1=ph.innerHTML,s1=snap(),tt=T().innerText.trim().replace(/\s+/g,' '),nn=NF()?NF().innerText.trim():'',c1=curId();
    const at=id+'/'+p+' · '+(pre?pre+' → ':'')+a;
    if(lvl===1&&h1===h0&&s1===s0&&!tt&&!nn){silent.push(at+' · '+el.innerText.trim().replace(/\s+/g,' ').slice(0,40));return}
    if(lvl===1&&s1===s0&&c1===c0&&tt){toastOnly.push(at+' · «'+tt.slice(0,80)+'»')}
    else if(tt&&S.audit.length===n0&&p!=='guest'&&!dk(s0,s1).length){hollow.push(at+' · «'+tt.slice(0,70)+'»')}   /* رسالة نجاح ولم يُحفظ شيء: تُراجع */
    const d=dk(s0,s1).filter(k=>!['audit','outbox','agent','undo','gate','lastSync','attX'].includes(k));
    if(WATCH[p]&&(S.audit.length>n0||(tt&&d.length))){const e=S.audit.length>n0?S.audit[0]:{t:tt},key=id+'|'+a.split(':').slice(0,2).join(':')+'|'+(e.k||'');if(seenC.has(key))return;seenC.add(key);
      const ch=[];for(const kp of WATCH[p]){const K1=kidView(s1,kp);const c=Object.keys(K1).filter(k=>K1[k]!==K0[kp][k]);if(c.length)ch.push(kp+':'+c.slice(0,6).join(',')+' «'+dif(K0[kp][c[0]],K1[c[0]])+'»')}
      commits.push({p,at,k:e.k||'',kid:e.kid||e.who||'',t:String(e.t||'').slice(0,90),toast:tt.slice(0,70),kids:ch.join(' | '),d:d.join(' ')})}};
  for(const p of NAT[SC[id].p]||['owner']){try{setup(id,p);if(curId()!==id&&S.stack[S.stack.length-1].id!==id)continue;
    const acts=[...new Set(live().map(e=>e.dataset.a))];for(const a of acts)run(p,null,false,a,1);
    setup(id,p);const hasIn=[...ph.querySelectorAll('input:not([type=checkbox]):not([type=radio]),textarea')].some(vis);
    setup(id,p);fill();const btns=[...new Set(live().filter(e=>e.matches('.btn')).map(e=>e.dataset.a))];if(hasIn)for(const a of btns)run(p,null,true,a,2);
    setup(id,p);const sw=[...new Set(live().filter(e=>e.matches(STSEL)&&!chosen(e)).map(e=>e.dataset.a))].slice(0,14);
    for(const s of sw){setup(id,p);const e=find(s);if(!e)continue;e.click();render();if(S.dlg||curId()!==id&&S.stack[S.stack.length-1].id!==id)continue;fill();
      const bs=[...new Set(live().filter(x=>x.matches('.btn')).map(x=>x.dataset.a))];for(const a of bs)run(p,s,true,a,3)}
  }catch(e){errs.push(id+'/'+p+' → '+e.message.slice(0,90))}}
  S=fresh();setPersona('owner');render();return {clicks,silent,toast:toastOnly,commits,hollow,errs,used:[...used]}};
 window.__ACTS=()=>Object.keys(ACT);
 return Object.keys(SC);});
R={clicks:0,silent:[],toast:[],commits:[],hollow:[],errs:[],used:[]};const ONLY=process.argv.slice(2).filter(a=>a!=='list');
for(const id of IDS){if(ONLY.length&&!ONLY.includes(id))continue;cur=id;const r=await page.evaluate(id=>window.__FA(id),id);R.clicks+=r.clicks;for(const k of ['silent','toast','commits','hollow','errs','used'])R[k].push(...r[k]);if(process.env.FA_LOG)require('fs').appendFileSync(process.env.FA_LOG,id+' '+r.clicks+'\n');await new Promise(r=>setTimeout(r,5))}
R.errs=R.errs.concat(errs);
/* المقبول بعد المراجعة (Q-435)، بالاسم وسببه. كل ما عداه يُسقط الفحص حتى يُصلَح أو يُضاف هنا بسبب مكتوب. */
const OKT={openApp:'يفتح تطبيقاً آخر على الجهاز',locCall:'يسلّم لتطبيق الهاتف',locDir:'يسلّم لتطبيق الخرائط',sosCall:'يسلّم لتطبيق الهاتف',sosCallOut:'يسلّم لتطبيق الهاتف',helpMail:'يسلّم لتطبيق البريد',updGo:'يسلّم للمتجر',cpy:'نسخ إلى الحافظة',msgCopy:'نسخ إلى الحافظة',updCheck:'جواب حالة: لا تحديث',rwFreeze:'جواب حالة: لا حاجة للتجميد',sdWhy:'شرح قفل ومكان تغييره',maintTry:'حالة نظام للعرض',npAllow:'إذن النظام ممنوح أصلاً',sosCancel:'إلغاء قبل الإرسال: لا أثر مقصود'};
const OKU={alertClose:'إغلاق تنبيه عند البالغين',keySave:'صلاحية بالغ؛ وما يخص الابن منها (قراءة محادثاته) يُفحص في test-q435',mdSave:'تعريف وضع للعائلة: لا يمس طفلاً حتى يُطبَّق',enfSync:'مزامنة تقنية',expAsk:'طلب يخص صاحبه',pfAsk:'طلب يخص صاحبه',tkCatSave:'فئة مهام للعائلة',tkEdSave:'قيمة افتراضية للمهام القادمة',tkSugNo:'صرف اقتراح للأب',pwGo:'دفع',flagShow:'قراءة الأب رسالة مرصودة: الابن يعلم أن محادثاته مرئية',flagOk:'تجاهل تنبيه',invShare:'دعوة بالغ',invNew:'دعوة بالغ',cnGo:'طفل جديد: يظهر عند الأهل (test-q435)',tkSubAdd:'تحقق من حقل',ntSave:'تحقق من حقل'};
const act=x=>{const a=(typeof x==='string'?x:x.at).split(' · ')[1].split(' → ').pop();return a.split(':')[0]};const valid=x=>/«(اكتب|اختر|اختاري|اكتبي)/.test(x);
R.review=[...R.toast.filter(x=>!OKT[act(x)]&&!valid(x)).map(x=>'toast  '+x),...R.hollow.filter(x=>!OKT[act(x)]).map(x=>'hollow '+x),...R.commits.filter(c=>!c.kids&&!OKU[act(c)]).map(c=>'unseen '+c.at+' · '+c.t)];const AL=await page.evaluate(()=>window.__ACTS());R.used=[...new Set(R.used)];R.unused=ONLY.length?[]:AL.filter(a=>!R.used.includes(a));R.acts=AL.length;R.used=R.used.length;R.unseen=R.commits.filter(c=>!c.kids);
}catch(e){R.crash=String(e&&e.stack||e).slice(0,600)}finally{await b.close()}
const L=process.argv.includes('list');
console.log(JSON.stringify(L?R:{clicks:R.clicks,silent:(R.silent||[]).length,toast:(R.toast||[]).length,acts:R.acts,reached:R.used,commits:(R.commits||[]).length,hollow:(R.hollow||[]).length,unseen:(R.unseen||[]).length,review:R.review,errs:R.errs,crash:R.crash},null,1));
process.exitCode=(R.crash||(R.errs||[]).length||(R.silent||[]).length||(R.review||[]).length)?1:0;})();
