// اختبار التعارض بين ما يحفظه الأهل (Q-419) عبر الأنظمة: الكاشف ومطابقته لمحرك التقييم، بطاقة الحفظ بمستوييها،
// الحلول بضغطة، «احفظ كما هو» والوسم، صفحة التعارضات وسطرها، بطاقة «يتطلب انتباهك» للمالك، والتعارضان اللحظيان (المنح وتطبيق الوضع).
// التشغيل من مجلد النموذج: NODE_PATH=<node_modules> node tools/test-q419.cjs
// النجاح: fail=[] و over=[] و eng=[] و errs=[].
const puppeteer=require('puppeteer-core');let chromium=require('@sparticuz/chromium');chromium=chromium.default||chromium;
const root=require('path').join(__dirname,'..');
(async()=>{const args=[...chromium.args.filter(a=>!/in-process-gpu|use-gl|use-angle|swiftshader|ignore-gpu/.test(a)),'--disable-gpu','--allow-file-access-from-files'];
const b=await puppeteer.launch({args,executablePath:await chromium.executablePath(),headless:'shell'});let R={};
try{const page=await b.newPage();await page.setViewport({width:1500,height:1000});const errs=[];page.on('pageerror',e=>errs.push(String(e)));page.on('console',m=>{if(m.type()==='warning'||m.type()==='error')errs.push('console:'+m.text())});
await page.goto('file://'+root+'/index.html?quiet=1');await page.evaluate(()=>document.fonts.ready);await new Promise(r=>setTimeout(r,1700));
R=await page.evaluate(()=>{const R={},F=[];let N=0;const ph=document.getElementById('phone');const ok=(n,c,x)=>{N++;if(!c)F.push(n+(x!==undefined?' → '+JSON.stringify(x):''))};
 const scr=()=>document.getElementById('scr').innerText.replace(/\s+/g,' ');const sht=()=>{const e=ph.querySelector('.sheet');return e?e.innerText.replace(/\s+/g,' '):''};
 const top=()=>S.dlg?'dlg':S.full?S.full.id:S.sheet?S.sheet.id:S.stack[S.stack.length-1].id;
 const q=s=>ph.querySelector(s);const qa=s=>[...ph.querySelectorAll(s)];const dis=sel=>{const e=q(sel);return !e||e.disabled===true};
 const open=(id,...a)=>{go(id,...a);render()};const keys=k=>cfScan(k).map(c=>c.k).sort().join();const okd=k=>cfOkAll()[k];
 const fixBtn=re=>qa('.sheet .cfc .btn, #scr .cfc .btn').find(e=>re.test(e.innerText));const tap=re=>{const e=fixBtn(re);if(!e)return false;const [n,...a]=e.dataset.a.split(':');ACT[n](...a);render();return true};
 const over=[],eng=[];const BAD=/[a-z]+\.[a-z_]+\.[a-z_]+|ALLOW|BLOCK|LIMIT|ALERT|IGNORE|Accessibility|DeviceAdmin|VPN|MQTT|Outbox|bitmask|is[A-Z]\w+|step-up|Parent Gate|PIN|نبضة|الرتيبة|القناع|مزامَن|الفرض|ذرّي|نطاق|undefined|null|NaN/;
 const scan=tag=>{const sc=document.getElementById('scr');if(sc&&sc.scrollWidth>sc.clientWidth+1)over.push(tag);const sh=q('.sheet');if(sh&&sh.scrollWidth>sh.clientWidth+1)over.push(tag+':sheet');
   const m=(scr()+' '+sht()).replace(/[a-z0-9-]+\.(org|com|net)/g,'').match(BAD);if(m)eng.push(tag+':'+m[0]);
   qa('.cfc .btn, .sheet>.btns .btn').forEach(e=>{const r=e.getBoundingClientRect();if(r.height&&r.height<44)over.push(tag+':touch:'+e.innerText.trim()+':'+Math.round(r.height))})};
 try{
 // 1 البذرة والكاشف
 S=fresh();ok('seed: two Q-419 surfaces registered under S1-10',['conflict','conflicts'].every(k=>SC[k]&&SC[k].sys==='S1-10')&&SC.conflict.kind==='sheet');
 ok('seed: one standing conflict only (TikTok blocked, its site open), kept by the owner',cfAll().map(cfKey).join()==='layan|web.tt'&&okd('layan|web.tt').by==='ahmad',cfAll().map(cfKey));
 ok('seed: nothing about conflicts in the owner attention list',!attention().some(a=>String(a.k).startsWith('cf:')));
 ok('seed: Khaled and Yusuf have none',keys('khaled')===''&&keys('yusuf')==='');
 // 2 نص «ما سيحدث» يطابق المحرك
 S=fresh();{const a=appOf('layan','mc');a.lim=150;S.kid.layan.used=400;const c=cfScan('layan').find(x=>x.k==='lim.mc');
  ok('engine: an app with its own limit ignores the quota (default order)',left('layan')===0&&decide('layan','mc').ok===true&&decide('layan','mc').why==='app');
  ok('card says exactly that: runs its full 150 minutes, the quota does not stop it',!!c&&/سيُفتح 150 دقيقة كاملة ولن توقفه الحصة/.test(c.fx)&&/120 د/.test(c.fx),c&&c.fx);}
 S=fresh();S.rank=['sleep','school','quota','app'];{const c=cfScan('layan').find(x=>x.k==='dead');
  ok('engine: quota above app rules → a blocked app opens while quota has time',decide('layan','tt').ok===true&&decide('layan','tt').why==='quota');
  ok('card names the blocked app and says it will open',!!c&&/TikTok محظور، لكنه سيُفتح/.test(c.fx)&&/الحصة اليومية فوق قواعد التطبيقات/.test(c.fx),c&&c.fx);
  ok('no limit-above-quota card when the quota decides anyway',!cfScan('layan').some(x=>x.k.startsWith('lim.')));}
 S=fresh();S.rank=['app','sleep','school','quota'];{const c=cfScan('layan').find(x=>x.k==='rank.sleep'),n0=NOW.m;NOW.m=22*60;
  ok('engine: app rules above sleep → an always-allowed app opens at night',decide('layan','mad').ok===true);NOW.m=n0;
  ok('card names the apps that open in sleep time',!!c&&/مدرستي/.test(c.fx)&&/في وقت النوم/.test(c.fx),c&&c.fx);}
 // 3 حفظ قاعدة تطبيق: لا شيء يُحفظ قبل القرار
 S=fresh();open('apps','layan');open('app-rule','layan','mc');ACT.adLim('=','150');render();ACT.adSave();render();
 ok('app limit above quota: card first, nothing saved',top()==='conflict'&&appOf('layan','mc').lim===30&&S.audit.every(a=>!/Minecraft/.test(a.t)));
 ok('card: both parties by name, the child, and what will happen',/Minecraft/.test(sht())&&/الحصة اليومية/.test(sht())&&/يخص ليان/.test(sht())&&/ما سيحدث:/.test(sht())&&/مع/.test(q('.sheet .cfp').innerText));
 ok('card: one-tap fix for the other side + open it + keep + edit',!!fixBtn(/ارفع الحصة إلى 150 د/)&&!!fixBtn(/عدّل الحصة/)&&!!q('.sheet [data-a="cfKeep"]')&&!!q('.sheet [data-a="cfEdit"]')&&!fixBtn(/عدّل قاعدة Minecraft/));
 ok('owner is not told about an alert to himself',!/ووصل أحمد تنبيه/.test(sht())&&/وسم «متعارض»/.test(sht()));scan('save-app');
 ACT.cfEdit();render();ok('«عدّل هذا» returns to the editor with the draft intact',top()==='app-rule'&&S.ad.lim===150&&appOf('layan','mc').lim===30&&!okd('layan|lim.mc'));
 ACT.adSave();ACT.cfKeep();render();ok('«احفظ كما هو» saves and records who kept it',appOf('layan','mc').lim===150&&okd('layan|lim.mc').by==='ahmad'&&top()==='apps');
 ok('kept: tag on the app row, and a line in the protection log',/Minecraft\s*متعارض/.test(scr())&&S.audit.some(a=>/حُفظ مع تعارض عند ليان: حدّ Minecraft أكبر من الحصة/.test(a.t)));
 open('app-rule','layan','mc');ok('the editor of a conflicting item shows the standing card',!!q('#scr .cfc')&&/أبقاه أحمد كما هو/.test(scr()));scan('editor-inline');
 ACT.adLim('=','160');ACT.adSave();render();ok('already kept: raising it further does not ask again',top()!=='conflict'&&appOf('layan','mc').lim===160);
 S.ctlKid='layan';S.stack=[{id:'protection',a:[]}];render();ok('rules page: «تعارضات» line with the count',!!q('#scr .cfl')&&/تعارضات · 2/.test(scr())&&/أُبقيت كما هي/.test(scr()));scan('hub');
 // 4 حل بضغطة عند الحفظ
 S=fresh();open('app-rule','layan','mc');ACT.adLim('=','150');ACT.adSave();render();ok('one tap «ارفع الحصة»: fixes the other side then saves',tap(/ارفع الحصة إلى 150 د/)&&S.kid.layan.quota===150&&appOf('layan','mc').lim===150&&!S.sheet&&!cfScan('layan').some(c=>c.k==='lim.mc')&&!okd('layan|lim.mc'));
 ok('both changes are in the log',S.audit.some(a=>/رُفعت بقدر حدّ Minecraft/.test(a.t))&&S.audit.some(a=>/عُدّلت قاعدة Minecraft/.test(a.t)));
 // 5 الحصة: بطاقتان، وحلّ واحدة يبقي الأخرى
 S=fresh();open('quota','layan');S.qd.v=Array(7).fill(20);render();ACT.qdSave();render();
 ok('quota below two limits: two cards, nothing saved',top()==='conflict'&&qa('.sheet .cfc').length===2&&S.kid.layan.quota===120&&/تعارضان/.test(sht()));scan('save-quota');
 ok('fixing one leaves the other on the sheet',tap(/اجعل الحد 20 د/)&&top()==='conflict'&&qa('.sheet .cfc').length===1&&S.kid.layan.quota===120);
 ACT.cfKeep();render();ok('keep the rest: quota saved, one conflict tagged',S.kid.layan.quota===20&&cfScan('layan').filter(c=>c.k.startsWith('lim.')).length===1);
 // 6 الترتيب
 S=fresh();open('priority','layan');ACT.pdMv('3','-1');render();ACT.pdSave();render();
 ok('child order with quota above app rules: card says what stops working',top()==='conflict'&&/قواعد التطبيقات لا تعمل/.test(sht())&&/TikTok محظور، لكنه سيُفتح/.test(sht())&&!S.rankKid.layan);
 ok('card button says «راجع الترتيب»',/راجع الترتيب/.test(q('.sheet [data-a="cfEdit"]').innerText));ACT.cfKeep();render();
 ok('kept: child order saved without a second question',!!S.rankKid.layan&&top()==='priority'&&okd('layan|dead').by==='ahmad');
 // 7 الجدول: المستوى المانع
 S=fresh();open('schedule','layan');ACT.winOpen('layan','new','school');ACT.wdDays('01234');ACT.wdT('s','05:00');ACT.wdT('e','08:00');render();
 ok('overlapping windows: same card, red, blocks the save',!!q('.sheet .cfc.blk')&&/يمنع الحفظ/.test(sht())&&/نافذتان متداخلتان/.test(sht())&&/وقت النوم/.test(sht())&&dis('.sheet .btn[data-a="wdSave"]'));scan('clash');
 ACT.wdSave();ok('blocked: nothing stored',S.sched.layan.length===2);
 ok('one tap trims the window at the edge of the other',tap(/اجعلها تبدأ 6:00 ص/)&&S.wd.s==='06:00');
 ok('…but it still overlaps the school window, named next',!!q('.sheet .cfc.blk')&&/وقت المدرسة/.test(q('.sheet .cfx:last-child').innerText));
 ACT.wdT('e','07:00');render();ok('fixed → can save',!q('.sheet .cfc')&&!dis('.sheet .btn[data-a="wdSave"]'));ACT.wdSave();ok('stored',S.sched.layan.length===3);
 // 8 تطبيقات الدراسة
 S=fresh();open('study-apps','layan');ACT.sdT('mad');render();ACT.sdSave();render();
 ok('clearing study apps with a school window: card says everything closes',top()==='conflict'&&/وقت المدرسة يغلق كل شيء/.test(sht())&&appOf('layan','mad').study===1);ACT.cfEdit();ok('edit: draft kept',S.sd.on.length===0);
 // 9 تصفية الويب بالاتجاهين
 S=fresh();open('webfilter','layan');ACT.wrCat('8','BLOCK');render();ACT.wrSave();render();
 ok('blocking the games category while Minecraft is allowed: card',top()==='conflict'&&/Minecraft مسموح وموقعه محجوب/.test(sht())&&/قد لا يعمل/.test(sht())&&!S.wfc.layan[8]);scan('save-web');
 ok('one tap «اسمح بموقعه»: exception added, filter saved',tap(/اسمح بموقعه/)&&S.wfc.layan[8]==='BLOCK'&&S.wdom.layan.some(x=>x.d==='minecraft.net'&&x.a==='ALLOW')&&!S.sheet&&!cfScan('layan').some(c=>c.k==='web.mc'));
 S=fresh();open('app-rule','khaled','wa');ACT.adAct('BLOCK');render();ACT.adSave();render();
 ok('blocking an app whose site stays open: card',top()==='conflict'&&/WhatsApp محظور وموقعه مفتوح/.test(sht())&&/يُفتح في المتصفح/.test(sht()));
 ok('one tap «احظر موقعه أيضاً»: site blocked, rule saved',tap(/احظر موقعه أيضاً/)&&appOf('khaled','wa').act==='BLOCK'&&S.wdom.khaled.some(x=>x.d==='whatsapp.com'&&x.a==='BLOCK')&&keys('khaled')==='');
 open('web-domains','khaled');S.wdN={a:'ALLOW'};render();q('#wdomN').value='whatsapp.com';ACT.wdomAdd('khaled');render();ok('duplicate site exception is still refused by the form',top()!=='conflict'&&/مضاف من قبل/.test(scr()));
 S=fresh();setPersona('delegate');open('app-rule','khaled','wa');ok('Sara may edit Khaled rules in this role',can('protection.rule.edit','khaled'));ACT.adAct('BLOCK');ACT.adSave();render();
 ok('non-owner: the filter fix is not offered (owner only), and the alert to Ahmad is stated',top()==='conflict'&&!fixBtn(/احظر موقعه/)&&/ووصل أحمد تنبيه/.test(sht()));scan('save-sara');
 // 10 الأوضاع
 S=fresh();appOf('yusuf','ytk').act='BLOCK';cfOkAll()['yusuf|web.ytk']={by:'ahmad',at:'x'};cfOkAll()['yusuf|mode.m1']={by:'ahmad',at:'x'};
 open('mode-edit','new');ACT.mdN('سهرة');ACT.mdOpen('list');ACT.mdApp('ytk');render();ACT.mdSave();render();
 ok('new mode opening an app blocked for one child: card names mode, app and child',top()==='conflict'&&/وضع «سهرة» يفتح تطبيقاً محظوراً/.test(sht())&&/يوسف/.test(sht())&&S.modes.length===1);scan('save-mode');
 ACT.cfKeep();ok('kept: mode created',S.modes.length===2&&!!okd('yusuf|mode.m2'));
 S=fresh();appOf('yusuf','draw').study=0;open('presets','study');S.psK=['yusuf'];S.psN=60;render();ACT.psGo('study');render();
 ok('applying study mode to a child with no study apps: card before applying',top()==='conflict'&&/وضع الدراسة يغلق كل شيء عند يوسف/.test(sht())&&!S.pm.yusuf&&/طبّق على أي حال/.test(sht())&&!/وسم «متعارض»/.test(sht()));scan('apply');
 ACT.cfKeep();ok('apply anyway: applied, no tag kept for a one-time warning',S.pm.yusuf.k==='study'&&!okd('yusuf|apply.yusuf'));
 // 11 المهام
 S=fresh();open('task-new','layan');S.nt.t='قراءة قصة';S.nt.hm='2200';S.nt.dirty=1;render();ACT.ntSave();render();const nT=S.tasks.length;
 ok('task due inside sleep time: card, not saved',top()==='conflict'&&/موعد مهمة في وقت النوم/.test(sht())&&/قبل 9:00 م/.test(sht())&&/لم تُحفظ المهمة بعد/.test(sht()));scan('save-task');
 ok('reminder inside sleep is said',/التذكير سيرنّ في وقت النوم/.test(sht()));
 ok('one tap moves the time before sleep and saves',tap(/اجعل الموعد 8:30 م/)&&S.tasks.length===nT+1&&S.tasks[0].hm==='2030'&&!S.sheet&&keys('layan')==='web.tt');
 S=fresh();open('task-new','layan');S.nt.t='قراءة قصة';S.nt.hm='2200';S.nt.dirty=1;render();ACT.ntSave();ACT.cfKeep();render();{const t=S.tasks[0];
  ok('kept: task saved under the same key, tagged in the list',t.hm==='2200'&&!!okd('layan|task.'+t.id));S.tv='list';S.stack=[{id:'tasks',a:[]}];render();ok('task row says «متعارض»',/متعارض/.test(scr()));
  open('task',t.id);ok('task page shows the card with the one-tap fix',!!q('#scr .cfc')&&!!fixBtn(/اجعل الموعد 8:30 م/));scan('task-page');tap(/اجعل الموعد 8:30 م/);ok('fixed from the task page',S.tasks[0].hm==='2030'&&!q('#scr .cfc'));}
 S=fresh();open('task-new','layan');S.nt.t='واجب';S.nt.cat='school';S.nt.hm='1000';S.nt.dk='2026-11-16';S.nt.dirty=1;render();ACT.ntSave();render();ok('a school task in school time is not a conflict',top()!=='conflict');
 S=fresh();open('task-new','layan');S.nt.t='سقي النباتات';S.nt.cat='home';S.nt.hm='1000';S.nt.dk='2026-11-16';S.nt.dirty=1;render();ACT.ntSave();render();ok('a home task in school time is',top()==='conflict'&&/موعد مهمة في وقت المدرسة/.test(sht())&&!!fixBtn(/اجعل الموعد 1:00 م/));
 // 12 الأحداث
 S=fresh();S.tkDay='2026-11-18';open('tasks');ACT.tkEvNew('2026-11-18');S.ev.t='موعد الأسنان';S.ev.hm='0800';S.ev.who='layan';render();ACT.evSave();render();const nE=S.events.length;
 ok('two events for the same child at the same time: card',top()==='conflict'&&/حدثان لليان في الوقت نفسه/.test(sht())&&/اختبار الرياضيات/.test(sht())&&/لم يُحفظ الحدث بعد/.test(sht()));scan('save-event');
 ACT.cfEdit();render();ok('edit returns to the event sheet with the draft',top()==='event-new'&&S.ev.t==='موعد الأسنان'&&S.events.length===nE);
 ACT.evSave();ACT.cfKeep();render();ok('kept: event saved, both tagged in the calendar',S.events.length===nE+1&&qa('#scr .row .chip').filter(e=>/متعارض/.test(e.innerText)).length===2);
 open('event','e3');ok('event sheet shows the card',!!q('.sheet .cfc')&&/حدثان لليان/.test(sht()));scan('event-sheet');
 S=fresh();open('tasks');ACT.tkEvNew('2026-11-21');S.ev.t='موعد المصرف';S.ev.hm='1030';S.ev.who='sara';render();ACT.evSave();render();ok('adults too: Sara double-booked, 30 minutes apart',top()==='conflict'&&/حدثان لسارة/.test(sht())&&/يفصل بينهما 30 دقيقة فقط/.test(sht()));
 S=fresh();open('tasks');ACT.tkEvNew('2026-11-20');S.ev.t='سفر';S.ev.hm='2200';S.ev.who='layan';render();ACT.evSave();render();ok('child event inside sleep time: card',top()==='conflict'&&/حدث في وقت النوم/.test(sht()));
 S=fresh();open('tasks');ACT.tkEvNew('2026-11-17');S.ev.t='رحلة المدرسة';S.ev.hm='0900';S.ev.who='layan';render();ACT.evSave();render();ok('child event in school hours is not a conflict',top()!=='conflict'&&S.events.some(e=>e.t==='رحلة المدرسة'));
 // 13 منح الوقت
 S=fresh();S.pm.layan={k:'sleep',left:60,until:'6:12 م'};open('grant-time','layan');const sp0=S.kid.layan.spent;ACT.gtGo();render();
 ok('grant while a mode keeps the app closed: card before granting',top()==='conflict'&&/الوقت الممنوح لن يُستعمل الآن/.test(sht())&&/وضع النوم/.test(sht())&&S.kid.layan.spent===sp0&&/امنح على أي حال/.test(sht()));scan('grant');
 ACT.cfEdit();render();ok('«لا تمنح الآن» returns to the grant sheet',top()==='grant-time'&&S.kid.layan.spent===sp0);ACT.gtGo();ACT.cfKeep();ok('grant anyway works',S.kid.layan.spent>sp0);
 S=fresh();{const n0=NOW.m;NOW.m=22*60;const c=cfGrantNow('layan','ytk',15)[0];NOW.m=n0;ok('grant in sleep time: says the minutes end at midnight unused',!!c&&/الآن وقت نوم ليان/.test(c.fx)&&/ينتهي عند منتصف الليل قبل أن تستيقظ/.test(c.fx),c&&c.fx);}
 S=fresh();ok('grant in free time: no card',cfGrantNow('layan','ytk',15).length===0);
 S=fresh();{const n0=NOW.m,d0=NOW.d;NOW.m=9*60;NOW.d=1;const c=cfGrantNow('layan','ytk',15)[0],c2=cfGrantNow('layan','mad',15);NOW.m=n0;NOW.d=d0;ok('grant in school time: usable after school; study apps are fine',!!c&&/بعد 1:00 م/.test(c.fx)&&c2.length===0,c&&c.fx);}
 // 14 صفحة التعارضات
 S=fresh();cfEv('lim');open('conflicts','layan');ok('conflicts page: one card each, with who kept it',qa('#scr .cfc').length===2&&/أبقاه أحمد كما هو/.test(scr())&&/شيئان لن يعملا/.test(scr()));scan('page');
 ok('page: one-tap fixes for both sides',!!fixBtn(/اجعل الحد 120 د/)&&!!fixBtn(/ارفع الحصة إلى 150 د/)&&!!fixBtn(/احظر موقعه أيضاً/)&&!!fixBtn(/عدّل قاعدة Minecraft/));
 tap(/احظر موقعه أيضاً/);ok('fix from the page: site blocked, card gone, undo offered',S.wdom.layan.some(x=>x.d==='tiktok.com'&&x.a==='BLOCK')&&qa('#scr .cfc').length===1&&!!document.querySelector('#toast [data-a="undo"]'));
 tap(/اجعل الحد 120 د/);ok('all fixed: empty state',qa('#scr .cfc').length===0&&/لا تعارض في قواعد ليان/.test(scr())&&appOf('layan','mc').lim===120);scan('page-empty');
 ACT.pkid('yusuf');render();ok('child tabs switch',/لا تعارض في قواعد يوسف/.test(scr()));
 // 15 «يتطلب انتباهك»
 S=fresh();cfEv('sara');{const a=attention().find(x=>x.k==='cf:layan');ok('another adult kept a conflict: the owner gets a card with «رتّب قواعد ليان»',!!a&&/حفظته سارة كما هو/.test(a.s)&&a.b[0][0]==='رتّب قواعد ليان'&&a.b[0][1]==='go:conflicts:layan',a);}
 S.alerts.forEach(a=>{a.open=0});S.rv=[];render();ok('card is on the home screen',/حدّ Minecraft أكبر من الحصة · ليان/.test(scr())&&/رتّب قواعد ليان/.test(scr()));scan('home');
 setPersona('delegate');ok('the adult who kept it is not alerted',!attention().some(a=>a.k==='cf:layan'));
 setPersona('owner');ACT.cfSeen('layan');ok('«تمّ» clears the card; the conflict stays tagged',!attention().some(a=>a.k==='cf:layan')&&cfScan('layan').some(c=>c.k==='lim.mc'));
 S=fresh();cfEv('teen');{const a=attention().find(x=>x.k==='cf:khaled');ok('a conflict nobody decided (teen own task after bedtime) reaches the owner',!!a&&/لم يقرّر فيه أحد/.test(a.s)&&/خالد/.test(a.t),a);}
 S.co={since:'اليوم',seen:1};setPersona('delegate');ok('…and the adult with full authority',attention().some(a=>a.k==='cf:khaled'));
 S.co=null;ok('…not a regular adult',!attention().some(a=>a.k==='cf:khaled'));
 setPersona('owner');open('conflicts','khaled');ok('undecided card offers «أبقِه كما هو»',/لم يقرّر أحد فيه بعد/.test(scr())&&!!fixBtn(/أبقِه كما هو/));tap(/أبقِه كما هو/);ok('decided: card leaves the attention list',!attention().some(a=>a.k==='cf:khaled')&&okd('khaled|task.tcf').by==='ahmad');
 // 16 ما يظهر بعد حذف أو تراجع، وتنظيف القرارات القديمة
 S=fresh();open('app-rule','layan','mc');ACT.adLim('=','150');ACT.adSave();ACT.cfKeep();render();ACT.undo&&0;appOf('layan','mc').lim=30;cfSweep();ok('a kept decision is dropped once the conflict is gone',!okd('layan|lim.mc'));
 S=fresh();S.wdom.layan.push({d:'tiktok.com',a:'BLOCK'});cfSweep();ok('seed decision dropped after the site is blocked',!okd('layan|web.tt'));S.wdom.layan.pop();ok('exception deleted later: undecided conflict reaches the owner',attention().some(a=>a.k==='cf:layan'));
 // 17 الوصف الصادق لخيار «مسموح دائماً»
 S=fresh();open('app-rule','layan','mc');ok('«مسموح دائماً» for Layan says when it still closes',/يُفتح متى شاء عدا وقت النوم ووقت المدرسة/.test(scr()));
 open('app-rule','yusuf','ytk');ok('…for Yusuf (no windows) it is plain',/يُفتح متى شاء، ولا تحدّه الحصة اليومية/.test(scr()));
 // 18 دون اتصال، والورقة بلا سياق
 S=fresh();S.net='off';open('app-rule','layan','mc');ACT.adLim('=','150');ACT.adSave();render();ok('offline: saving is off, so no card',top()==='app-rule'&&appOf('layan','mc').lim===30);
 S=fresh();CFX=null;open('conflict');ok('sheet opened alone explains itself',/لا تعارض الآن/.test(sht()));scan('sheet-alone');ACT.cfKeep();ACT.cfEdit();ok('its actions are harmless without a save',!S.sheet);
 // 19 رحلة الاستوديو وأحداثه
 {const J=JOURNEYS.find(j=>j.t==='تعارض القواعد'),want=['conflict','apps','protection','conflicts','conflict','win-edit','conflict','home','home'];ok('studio journey exists with nine steps',!!J&&J.s.length===9);
  J.s.forEach(([t,fn],i)=>{S=fresh();setPersona('owner');fn();render();ok('journey step '+(i+1)+' lands on '+want[i],top()===want[i],top());scan('journey'+(i+1));});
  S=fresh();Studio.act.cfEv('sara');ok('studio event: Sara kept a conflict → owner card',attention().some(a=>a.k==='cf:layan')&&top()==='home');Studio.act.cfEv('clear');ok('studio event: reset removes it',cfAll().map(cfKey).join()==='layan|web.tt'&&appOf('layan','mc').lim===30);}
 for(const th of ['dark']){S=fresh();S.theme=th;cfEv('lim');open('conflicts','layan');scan('page-'+th);}
 S=fresh();S.ts=1.3;open('app-rule','layan','mc');ACT.adLim('=','150');ACT.adSave();render();scan('save-big-text');
 }catch(e){F.push('ERR '+e.message+' '+String(e.stack).split('\n')[1])}
 R.over=[...new Set(over)];R.eng=[...new Set(eng)];R.checks=N;R.fail=F;return R;});
R.errs=errs;}catch(e){R.crash=String(e.stack||e).slice(0,900)}finally{await b.close()}
console.log(JSON.stringify(R,null,1));})();
