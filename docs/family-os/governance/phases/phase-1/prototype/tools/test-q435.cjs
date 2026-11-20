// اختبار إغلاق العمليات (Q-435): ما يفعله الأب يظهر عند الابن، وما يرسله الابن يصل الأب، ولا عملية تنتهي بلا أثر.
//   أ) «قواعدي» عند الطفل والمراهق: كل تغيير يحفظه الأب في قواعد ابنه (نافذة، قاعدة تطبيق، تصفية، حصة، وضع) يظهر في صفحته وببطاقة في رئيسيته حتى «فهمت».
//   ب) طفل يضيفه الأب عضو حقيقي: يظهر في العائلة والرئيسية، يشغل مقعداً، بلا موقع قبل الإقران، ثم يُقرن فتُفتح قواعده؛ والحالة تعود نظيفة.
//   ج) «شيء أزعجني» وطلب تغيير الصورة يصلان الأب بتنبيه له فعل، ويُغلقان.
//   د) إصلاحات: «ارفض فقط» لا ينشئ مهمة، لوحة الرقم السري تعمل إن فُتحت مباشرة، الدعوة تحمل «شوركت»، الوثيقة القانونية تفتح أبوابها.
// التشغيل من مجلد النموذج: NODE_PATH=<node_modules> node tools/test-q435.cjs        النجاح: fail=[] و errs=[].
const puppeteer=require('puppeteer-core');let chromium=require('@sparticuz/chromium');chromium=chromium.default||chromium;
const root=require('path').join(__dirname,'..');
(async()=>{const args=[...chromium.args.filter(a=>!/in-process-gpu|use-gl|use-angle|swiftshader|ignore-gpu/.test(a)),'--disable-gpu','--allow-file-access-from-files'];
const b=await puppeteer.launch({args,executablePath:await chromium.executablePath(),headless:'shell'});let R={};
try{const page=await b.newPage();await page.setViewport({width:1500,height:1000});const errs=[];page.on('pageerror',e=>errs.push(String(e)));page.on('console',m=>{if(m.type()==='warning'||m.type()==='error')errs.push('console:'+m.text())});
await page.goto('file://'+root+'/index.html?quiet=1');await page.evaluate(()=>document.fonts.ready);await new Promise(r=>setTimeout(r,1700));
R=await page.evaluate(()=>{const R={},F=[];let N=0;const ph=document.getElementById('phone');const ok=(n,c,x)=>{N++;if(!c)F.push(n+(x!==undefined?' → '+JSON.stringify(x):''))};
 const scr=()=>document.getElementById('scr').innerText.replace(/\s+/g,' ');const all=()=>ph.innerText.replace(/\s+/g,' ');
 const clr=()=>{document.getElementById('toast').innerHTML=''};const tst=()=>document.getElementById('toast').innerText.replace(/\s+/g,' ');
 const open=(id,...a)=>{S.stack.push({id,a});render()};const click=a=>{const e=ph.querySelector(`[data-a="${a}"]`);if(!e)throw new Error('لا زر: '+a);e.click();render()};
 const as=(p,f)=>{const keep=S.persona,st=S.stack,sh=S.sheet,fu=S.full;setPersona(p);render();const v=f();S.persona=keep;S.stack=st;S.sheet=sh;S.full=fu;render();return v};
 const kidSees=(p,id)=>as(p,()=>{if(id)open(id);return scr()});
 const start=p=>{clr();S=fresh();setPersona(p||'owner');render()};
 try{
 /* ---------- أ) قواعدي ---------- */
 start('child');ok('أ1 رئيسية الطفل بلا بطاقة تغيير في البداية',!ph.querySelector('.krn'));
 open('c-me');ok('أ2 «قواعدي» صف في ملف الطفل',!!ph.querySelector('[data-a="go:my-rules"]'));click('go:my-rules');
 let t=scr();ok('أ3 الصفحة تعرض وقت اليوم',/وقتي اليوم/.test(t)&&/بقي 24 د/.test(t),t.slice(0,160));
 ok('أ4 وتعرض وقت النوم بساعته',/وقت النوم/.test(t)&&/9:00 م – 6:00 ص · كل يوم/.test(t),t.match(/وقت النوم.{0,50}/));ok('أ5 ووقت المدرسة',/وقت المدرسة/.test(t)&&/7:30 ص – 1:00 م/.test(t));
 ok('أ6 والتطبيقات بحدودها',/YouTube Kids/.test(t)&&/45 د/.test(t)&&/TikTok/.test(t)&&/محظور/.test(t));
 ok('أ7 والإنترنت',/البحث الآمن/.test(t)&&/مفعّل/.test(t)&&/khanacademy\.org/.test(t));
 ok('أ8 قراءة فقط: لا مفاتيح ولا حقول',!document.querySelector('#scr input, #scr .tg, #scr [role="switch"]'));
 ok('أ9 آخر التغييرات من سجل الحماية نفسه',/آخر التغييرات/.test(t)&&/الحصة اليومية: 150 ← 120 د/.test(t),t.slice(-260));
 ok('أ10 بلا اسم الطفل داخل السطر',!/لليان|لـليان/.test(t));
 /* الأب يعدّل نافذة النوم من شاشته: يظهر عند ليان */
 start('owner');open('win-edit','layan','w1');ACT.wdT('s','21:30');render();click('wdSave');
 ok('أ11 حُفظت النافذة',S.sched.layan.find(w=>w.id==='w1').s==='21:30',S.sched.layan);
 t=kidSees('child');ok('أ12 بطاقة «قاعدة تغيّرت» في رئيسية ليان',/قاعدة تغيّرت/.test(t)&&/بابا/.test(t)&&/9:30 م/.test(t),t.slice(0,200));
 t=kidSees('child','my-rules');ok('أ13 والساعة الجديدة في «قواعدي»',/9:30 م – 6:00 ص/.test(t)&&!/9:00 م – 6:00 ص/.test(t));
 ok('أ14 وبطاقة التغيير في أعلاها بزر «فهمت»',/قاعدة تغيّرت/.test(t)&&/فهمت/.test(t));
 t=kidSees('teen');ok('أ15 ولا شيء عند خالد',!/قاعدة تغيّرت/.test(t));
 setPersona('child');render();open('my-rules');click('krSeen');ok('أ16 «فهمت» يطوي البطاقة',!ph.querySelector('.krnew')&&krNew('layan').length===0);
 S.stack.pop();render();ok('أ17 وتختفي من الرئيسية',!ph.querySelector('.krn'));ok('أ18 ويبقى السطر في آخر التغييرات',krLog('layan').length>=2);
 /* قاعدة تطبيق */
 start('owner');open('app-rule','layan','ytk');ACT.adLim('=','30');render();click('adSave');
 ok('أ19 صار حدّ YouTube Kids 30 دقيقة',S.apps.layan.find(a=>a.id==='ytk').lim===30&&!S.sheet,[S.apps.layan.find(a=>a.id==='ytk'),S.sheet]);
 t=kidSees('child','my-rules');ok('أ20 يظهر الحد الجديد عند ليان',/YouTube Kids حتى 30 دقيقة في اليوم/.test(t),t.match(/YouTube Kids.{0,40}/));ok('أ21 وببطاقة تغيير',/قاعدة تغيّرت/.test(kidSees('child')));
 /* تصفية الويب */
 start('owner');open('webfilter','layan');click('wrFlag:safe');click('wrSave');ok('أ22 أُطفئ البحث الآمن',wfFlagOf('layan','safe')===false);
 t=kidSees('child','my-rules');ok('أ23 يظهر متوقفاً عند ليان',/البحث الآمن متوقف على جهازك/.test(t),t.match(/البحث الآمن.{0,40}/));ok('أ24 وببطاقة تغيير',/قاعدة تغيّرت/.test(kidSees('child')));
 /* وضع مؤقت للمراهق */
 start('owner');open('presets','study');click('psKid:khaled');S.psN=30;render();click('psGo:study');
 ok('أ25 طُبّق وضع الدراسة على خالد',!!S.pm.khaled,S.pm);t=kidSees('teen','my-rules');ok('أ26 يظهر سارياً في «قواعدي» عند خالد',/وضع الدراسة سارٍ الآن/.test(t),t.slice(0,220));
 ok('أ27 وببطاقة في رئيسيته',/قاعدة تغيّرت/.test(kidSees('teen')));ok('أ28 بلغة المراهق',/والدك/.test(kidSees('teen','my-rules')));
 start('teen');open('t-me');ok('أ29 «قواعدي» في صفحة المراهق',!!ph.querySelector('[data-a="go:my-rules"]'));
 /* ---------- ب) طفل جديد ---------- */
 start('owner');const n0=blMemN();open('child-new');ok('ب1 زر الإضافة ظاهر',!!ph.querySelector('[data-a="cnGo"]'));
 clr();click('cnGo');ok('ب2 بلا اسم: رسالة ولا إضافة',/اكتب اسم الطفل/.test(tst())&&!(S.addK||[]).length);
 document.getElementById('cnN').value='نور';click('cnSet:y:2019');ok('ب3 الاسم يبقى بعد اختيار السنة',document.getElementById('cnN').value==='نور');click('cnGo');
 const id=(S.addK||[])[0]&&S.addK[0].id;ok('ب4 أُنشئ ملف',!!id&&!!M[id]&&KIDS.includes(id),[id,KIDS]);ok('ب5 يشغل مقعداً',blMemN()===n0+1,[n0,blMemN()]);
 ok('ب6 قالبه من سنته',M[id].role==='child'&&/7 سنوات/.test(M[id].rel),M[id]);ok('ب7 سُجّل',S.audit[0].k==='identity.child.create'&&/نور/.test(S.audit[0].t));
 ok('ب8 انتقل إلى الإقران باسمه',S.stack[S.stack.length-1].id==='pair-code'&&S.stack[S.stack.length-1].a[0]===id&&/جهاز نور/.test(scr()),scr().slice(0,120));
 ok('ب9 أزرار العرض موسومة',/للعرض فقط/.test(scr()));
 S.stack=[{id:'family',a:[]}];render();t=scr();ok('ب10 يظهر في العائلة',/نور/.test(t)&&/لم يُقرن جهازه بعد/.test(t),t.slice(0,300));ok('ب11 العدّاد 5 من 5',/5 من 5/.test(t));
 S.stack=[{id:'home',a:[]}];render();t=scr();ok('ب12 يظهر في الرئيسية «بلا جهاز بعد»',/نور/.test(t)&&/بلا جهاز بعد/.test(t));open('alerts');ok('ب13 وبطاقة «بقي إقران جهاز نور» فيما يحتاج قراره',/بقي إقران جهاز نور/.test(scr())&&!!ph.querySelector(`[data-a="go:pair-code:${id}"]`));S.stack.pop();render();
 open('member',id);t=scr();ok('ب14 صفحته تقول الحال وتعرض الإقران',/لم يُقرن جهاز نور بعد/.test(t)&&!!ph.querySelector(`[data-a="go:pair-code:${id}"]`));ok('ب15 بلا بطارية ولا موقع',!/%/.test(t.slice(0,200))&&!ph.querySelector(`[data-a="go:loc:${id}"]`));
 S.stack=[{id:'map',a:[]}];render();ok('ب16 لا دبوس له على الخريطة',!ph.querySelector(`[data-a="mapF:${id}"] .pin, .pin[data-id="${id}"]`)&&locOf(id).none===1);
 t=scr();ok('ب16ب وصفّه في قائمة الخريطة «بلا جهاز» يفتح الإقران',/لم يُقرن جهازه بعد/.test(t)&&!!ph.querySelector(`[data-a="go:pair-code:${id}"]`)&&!ph.querySelector(`[data-a="mapF:${id}"]`),t.slice(-300));
 open('enf-state',id);t=scr();ok('ب16ج «حالة الحماية» لا تدّعي حالة ولا مزامنة',/لم يُقرن جهاز نور بعد/.test(t)&&!/آخر مزامنة للقواعد/.test(t)&&!/وقت متاح/.test(t)&&!ph.querySelector(`[data-a="enfSync:${id}"]`),t.slice(0,300));S.stack.pop();
 S.ctlKid=id;open('protection');t=scr();ok('ب16د و«الحماية» تقول إن القواعد تسري من الإقران',/تسري من لحظة الإقران/.test(t)&&!/الآن: وقت متاح/.test(t.replace(/\s+/g,' ')),t.slice(0,300));S.stack.pop();S.ctlKid='layan';
 S.stack=[{id:'add-member',a:[]}];render();ok('ب17 اكتملت المقاعد: الإضافة تعرض الترقية',!ph.querySelector('[data-a="go:child-new"]'),scr().slice(0,120));
 /* الإقران */
 S.stack=[{id:'alerts',a:[]}];render();click('go:pair-code:'+id);click('pcSet:done');ok('ب18 شاشة «اقترن جهاز نور»',/اقترن جهاز نور/.test(scr()));click('pcDone');
 ok('ب19 خرج من «بلا جهاز»',!noDev(id)&&!S.unp[id]&&S.kid[id].enf==='active');ok('ب20 وصلت تطبيقاته',S.apps[id].length===3);ok('ب21 سُجّل الإقران',S.audit[0].k==='identity.device.pair');
 S.stack=[{id:'alerts',a:[]}];render();t=scr();ok('ب22 بطاقة «اضبط قواعده» فيما يحتاج قراره',/اقترن جهاز نور: اضبط قواعده/.test(t),t.slice(0,400));ok('ب23 وزالت بطاقة الإقران',!/بقي إقران جهاز نور/.test(t));
 open('rules-review');ok('ب24 بطاقة المراجعة بنص الطفل الجديد، والحصة الجاهزة 60 (Q-223)',/حصة 60 دقيقة/.test(scr()));click('rvGo:rv-'+id);ok('ب25 «راجع القواعد» يفتح تطبيقاته',S.stack[S.stack.length-1].id==='apps'&&S.stack[S.stack.length-1].a[0]===id&&/YouTube Kids/.test(scr()));
 S.stack=[{id:'home',a:[]}];render();open('schedule',id);ok('ب26 جدوله يُفتح فارغاً',!/undefined|NaN/.test(scr()));
 S.stack=[{id:'home',a:[]}];render();open('quota',id);ok('ب27 وحصته',/60/.test(scr())&&!/120/.test(scr())&&!/undefined|NaN/.test(scr()));
 S.stack=[{id:'home',a:[]}];render();open('child-new',id);document.getElementById('cnN').value='نورة';click('cnGo');ok('ب28 تعديل اسمه يثبت',M[id].n==='نورة'&&S.addK[0].n==='نورة');render();ok('ب29 ويبقى بعد الرسم',M[id].n==='نورة');
 const snap=JSON.stringify(S);S=fresh();render();ok('ب30 حالة جديدة: يعود أربعة',Object.keys(M).length===4&&KIDS.length===2&&!M[id],[Object.keys(M),KIDS]);
 S=JSON.parse(snap);render();ok('ب31 واسترجاع الحالة يعيده',!!M[id]&&KIDS.includes(id)&&M[id].n==='نورة');S=fresh();render();
 /* مراهق جديد */
 start('owner');open('child-new');document.getElementById('cnN').value='سالم';click('cnSet:y:2011');click('cnGo');ok('ب32 مواليد 2011 مراهق',M[S.addK[0].id].role==='teen'&&/مراهق · 15 سنة/.test(M[S.addK[0].id].rel),M[S.addK[0].id]);S=fresh();render();
 /* ---------- ج) من الابن إلى الأب ---------- */
 start('child');open('kid-help');clr();click('helpTell');ok('ج1 الطفلة تُطمأن',/وصلت رسالتك إلى بابا/.test(tst()),tst());
 const h=S.alerts.find(a=>a.k==='help');ok('ج2 أُنشئ تنبيه',!!h&&h.kid==='layan'&&h.open===1&&h.p===1,h);
 open('kid-help');click('helpTell');ok('ج3 لا يتكرر',S.alerts.filter(a=>a.k==='help').length===1);
 t=kidSees('owner');ok('ج4 بطاقة في رئيسية الأب',/ليان تقول: شيء أزعجني/.test(t)&&/تحدّث مع ليان/.test(t),t.slice(0,300));
 t=as('delegate',()=>scr());ok('ج5 وعند الأم',/ليان تقول: شيء أزعجني/.test(t));
 setPersona('owner');render();open('alerts');click('set:alV:log');ok('ج6 وفي كل التنبيهات بنوعه',/طلب مساعدة/.test(scr())&&/شيء أزعجني/.test(scr()));
 open('alert',h.id);ok('ج7 تفصيله يفتح المحادثة',!!ph.querySelector('[data-a="dmStart:layan"]'),scr().slice(0,200));click('dmStart:layan');ok('ج8 فُتحت محادثة ليان',S.stack[S.stack.length-1].id==='thread',S.stack.map(x=>x.id));
 S.stack=[{id:'home',a:[]}];render();click('alertClose:'+h.id);ok('ج9 «تمّ» يغلقه',!h.open&&!/شيء أزعجني/.test(scr()));
 start('child');S.net='off';render();open('kid-help');clr();click('helpTell');ok('ج10 دون اتصال: تُحفظ وتُرسل لاحقاً',/تصل بابا عند عودة الاتصال/.test(tst())&&S.outbox.length===1,[tst(),S.outbox]);
 start('teen');open('kid-help');clr();click('helpTell');ok('ج11 للمراهق بلغته',/والدك/.test(tst())&&S.alerts[0].kid==='khaled'&&/خالد يقول/.test(S.alerts[0].t),[tst(),S.alerts[0]]);
 /* طلب تغيير الصورة */
 start('child');open('c-me');clr();click('askDad');ok('ج12 طلب الصورة يصل',/وصل طلبك إلى بابا/.test(tst())&&!!S.alerts.find(a=>a.k==='prof'&&a.kid==='layan'));
 ok('ج13 الصف يقول «عند بابا»',/عند بابا/.test(scr()));clr();click('askDad');ok('ج14 لا يتكرر',S.alerts.filter(a=>a.k==='prof').length===1&&/طلبك عند بابا/.test(tst()));
 setPersona('owner');render();ok('ج15 عدّاد الأب يزيد',attention().some(x=>/ليان تطلب تغيير لونها وصورتها/.test(x.t)));open('alerts');t=scr();ok('ج15ب بطاقة فيما يحتاج قراره',/ليان تطلب تغيير لونها وصورتها/.test(t),t.slice(0,300));click('go:child-new:layan');
 ok('ج16 تفتح ملف ليان للتعديل',S.stack[S.stack.length-1].id==='child-new'&&document.getElementById('cnN').value==='ليان');const c0=M.layan.c,i0=M.layan.i;click('cnSet:c:#1F6B3B');click('cnGo');
 ok('ج17 حُفظ اللون',M.layan.c==='#1F6B3B');ok('ج18 وأُغلق الطلب',!S.alerts.find(a=>a.k==='prof'&&a.open));
 setPersona('child');render();open('c-me');ok('ج19 ليان ترى لونها الجديد',/#1F6B3B/i.test(ph.querySelector('#scr .av').getAttribute('style')||''),ph.querySelector('#scr .av').getAttribute('style'));ok('ج20 وزال «عند بابا»',!/عند بابا/.test(scr()));M.layan.c=c0;M.layan.i=i0;
 /* ---------- د) إصلاحات ---------- */
 start('owner');S.reqs.push({id:'r0',kid:'layan',app:'ytk',min:15,msg:'',st:'PENDING'});const tn=S.tasks.length;open('time-decide','r0');click('reqDeny:r0');
 ok('د1 «ارفض فقط» لا ينشئ مهمة',S.tasks.length===tn,S.tasks[0]);ok('د2 ولا يكتب «undefined» في السجل',!/undefined/.test(S.audit[0].t),S.audit[0].t);ok('د3 والطلب مرفوض',S.reqs[0].st==='DENIED');
 start('owner');S.reqs.push({id:'r0',kid:'layan',app:'ytk',min:15,msg:'',st:'PENDING'});open('time-decide','r0');click('rwTdTask:r0');render();const g=ph.querySelector('[data-a="rwTdGo"]');if(g){g.click();render()}ok('د4 «ارفض وأسند مهمة» ما زال ينشئها',S.tasks.length===tn+1&&!!S.tasks[0].t,S.tasks[0]);
 start('owner');S.ps=null;S.full={id:'pin-set',a:[]};render();click('psK:1');ok('د5 لوحة الرقم السري تعمل إن فُتحت مباشرة',!!S.ps&&ph.querySelectorAll('.dots i.f').length===1,S.ps);click('psK:b');ok('د6 والحذف',ph.querySelectorAll('.dots i.f').length===0);S.full=null;
 start('owner');open('invite');ok('د7 الدعوة «لم تُشارك بعد»',/لم تُشارك بعد/.test(scr()));click('invShare');ok('د8 بعد المشاركة «شوركت · بانتظار انضمامه»',/شوركت · بانتظار انضمامه/.test(scr())&&S.invs[0].sent===1);
 const an=S.audit.length;click('invShare');ok('د9 لا تتكرر في السجل',S.audit.length===an);
 start('owner');open('legal');click('legalDoc:terms');t=scr();ok('د10 شروط الاستخدام تفتح أبوابها',/1\. من نحن وما الخدمة/.test(t)&&/بعد اعتماد المحامي/.test(t),t.slice(0,300));click('legalDoc:privacy');t=scr();ok('د11 والخصوصية، وتُطوى الأولى',/بيانات الأطفال وموافقة ولي الأمر/.test(t)&&!/من نحن وما الخدمة/.test(t));click('legalDoc:privacy');ok('د12 وتُطوى',!/ما نجمعه 2\./.test(scr())&&S.lgQ==='');
 start('owner');open('study-apps','layan');clr();const sw=ph.querySelector('[data-a="sdWhy:tt"]');ok('د13 التطبيق المحظور صفه يشرح',!!sw);if(sw){sw.click();ok('د14 بسبب ومكان التغيير',/محظور دائماً/.test(tst())&&/التطبيقات/.test(tst()),tst())}
 /* جهاز الابن منقطع: التغيير ينتظر ولا يُقال «تغيّرت» قبل استلامه (REQ-017) */
 start('owner');S.kidOff='layan';open('win-edit','layan','w1');ACT.wdT('s','21:30');render();click('wdSave');if(S.sheet&&S.sheet.id==='conflict'){click('cfKeep')}
 ok('أ37 حُفظ منتظراً اتصال الجهاز',S.pendR.layan>0,S.pendR);t=kidSees('child');ok('أ38 لا بطاقة «قاعدة تغيّرت» قبل الاستلام',!/قاعدة تغيّرت/.test(t));t=kidSees('child','my-rules');ok('أ39 و«قواعدي» تقول إنه يسري عند الاتصال',/جهازك غير متصل الآن/.test(t)&&/يسري حين يتصل جهازك/.test(t),t.slice(0,300));
 S.kidOff='';S.pendR.layan=0;t=kidSees('child');ok('أ40 وعند الاتصال تظهر البطاقة',/قاعدة تغيّرت/.test(t),t.slice(0,300));
 /* من يرى محادثات الابن */
 start('child');S.stack=[{id:'chat',a:[]}];render();ok('أ30 ليان تُخبَر أن بابا وماما يريان محادثاتها',/بابا وماما يستطيعان رؤية محادثاتك/.test(scr()),scr().slice(-200));
 start('owner');delete S.g['chat.minor.view'];t=as('child',()=>{S.stack=[{id:'chat',a:[]}];render();return scr()});ok('أ31 وبعد سحبها من سارة: بابا وحده',/بابا يستطيع رؤية محادثاتك ليبقيك/.test(t)&&!/ماما/.test(t),t.slice(-200));
 t=as('teen',()=>{open('t-me');return scr()});ok('أ32 وعند خالد «لوالدك» وحده',/مرئية لوالدك/.test(t)&&!/والدتك/.test(t));
 /* تذكير الأب في صفحة العبث يصل الابن */
 start('owner');open('tamper','a1');clr();click('tamPing:khaled');ok('أ33 التذكير يُسجَّل',S.tamP.khaled===1&&/تذكير/.test(S.audit[0].t)&&/وصل خالد تذكير/.test(tst()),[tst(),S.audit[0].t]);
 t=kidSees('teen');ok('أ34 ويظهر في رئيسية خالد',/والدك يذكّرك: أعد تفعيل خدمة الوصول/.test(t),t.slice(0,300));clr();click('tamPing:khaled');ok('أ35 ولا يتكرر',/سبق أن وصل خالد تذكيرك/.test(tst()));
 setPersona('teen');render();click('teenFix');ok('أ36 وبعد إعادة التفعيل يزول',!S.tamP.khaled&&!/يذكّرك/.test(scr()));
 /* ضابط التكرار يسري على المراهق */
 start('teen');open('t-task-new');ok('د15 التكرار متاح للمراهق والضابط مفعّل',!!ph.querySelector('[data-a="tkTt:rr:daily"]'));
 start('owner');open('tk-settings');click('tkRec');ok('د16 الأب أوقف التكرار',TK().rec===false);setPersona('teen');render();open('t-task-new');t=scr();ok('د17 فيختفي عند خالد بسببه',!ph.querySelector('[data-a="tkTt:rr:daily"]')&&/أوقف والدك تكرار المهام/.test(t),t.slice(0,300));
 S.tt.rr='daily';document.getElementById('ttT').value='مراجعة';click('tkTtSave');ok('د18 والمهمة تُحفظ مرة واحدة',S.tasks[0].t==='مراجعة'&&S.tasks[0].rr==='none',S.tasks[0]);
 }catch(e){F.push('ERR '+e.message+' '+String(e.stack).split('\n')[1])}
 R.checks=N;R.fail=F;return R;});
R.errs=errs;}catch(e){R.crash=String(e.stack||e).slice(0,900)}finally{await b.close()}
console.log(JSON.stringify(R,null,1));process.exitCode=(R.crash||(R.fail||[]).length||(R.errs||[]).length)?1:0;})();
