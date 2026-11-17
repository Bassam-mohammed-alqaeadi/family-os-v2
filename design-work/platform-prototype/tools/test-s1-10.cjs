// اختبار مسارات S1-10 (الحماية والفرض) في النموذج: محرك التقييم والترتيب، القواعد والحصة، الجدول والتداخل، تطبيقات الدراسة،
// الأوضاع الجاهزة والوضع الحر لكل طفل، العبث، حالة الحماية، السجل، مراجعة القواعد، تصفية الويب والمواقع المستثناة، وشاشتا الطفل.
// يحتاج puppeteer-core و@sparticuz/chromium (غير مضمَّنين في المستودع):  NODE_PATH=<node_modules> node tools/test-s1-10.cjs
// النجاح: fail=[] و over=[] و eng=[] و errs=[].
const puppeteer=require('puppeteer-core');let chromium=require('@sparticuz/chromium');chromium=chromium.default||chromium;
const root=require('path').join(__dirname,'..');
(async()=>{const args=[...chromium.args.filter(a=>!/in-process-gpu|use-gl|use-angle|swiftshader|ignore-gpu/.test(a)),'--disable-gpu','--allow-file-access-from-files'];
const b=await puppeteer.launch({args,executablePath:await chromium.executablePath(),headless:'shell'});let R={};
try{const page=await b.newPage();await page.setViewport({width:1500,height:1000});const errs=[];page.on('pageerror',e=>errs.push(String(e)));page.on('console',m=>{if(m.type()==='warning'||m.type()==='error')errs.push('console:'+m.text())});
await page.goto('file://'+root+'/index.html?quiet=1');await page.evaluate(()=>document.fonts.ready);await new Promise(r=>setTimeout(r,1700));
R=await page.evaluate(()=>{const R={},F=[];let N=0;const ph=document.getElementById('phone');const ok=(n,c,x)=>{N++;if(!c)F.push(n+(x!==undefined?' → '+JSON.stringify(x):''))};
 const txt=()=>ph.innerText.replace(/\s+/g,' ');const top=()=>S.dlg?'dlg':S.full?S.full.id:S.sheet?S.sheet.id:S.stack[S.stack.length-1].id;
 const pin=()=>{for(const k of '482615')ACT.pinK(k);render()};const dlgYes=()=>{ACT.dlgYes();render()};
 const q=s=>ph.querySelector(s);const dis=sel=>{const e=q(sel);return !e||e.disabled===true};const has=re=>re.test(txt());
 const open=(id,...a)=>{go(id,...a);render()};
 try{
 // 1 محرك التقييم بالترتيب الجاهز
 S=fresh();ok('seed: 16 screens registered',['protection','apps','app-rule','quota','schedule','win-edit','study-apps','priority','presets','tamper','enf-state','enf-all','prot-audit','rules-review','webfilter','wf-cat','web-domains','block','warn5','kid-free'].every(k=>SC[k]),Object.keys(SC).filter(k=>SC[k].sys==='S1-10'));
 ok('no freemode surface left',!SC.freemode);
 ok('default: limit exhausted → blocked by app',decide('layan','ytk').ok===false&&decide('layan','ytk').why==='app');
 ok('default: limit with balance → open',decide('layan','mc').ok===true);
 ok('default: BLOCK → blocked',decide('layan','tt').why==='blocked'&&!decide('layan','tt').ok);
 ok('default: no rule → follows quota',decide('layan','cam').ok===true&&decide('layan','cam').why==='quota');
 S.kid.layan.used=120;ok('quota exhausted: no-rule app closed',!decide('layan','cam').ok&&decide('layan','cam').why==='quota');ok('quota exhausted: app with own balance still open (first match wins)',decide('layan','mc').ok===true);
 S=fresh();S.pm.layan={k:'sleep',left:60,until:'6:12 م'};ok('sleep window: nothing opens',['ytk','mc','mad','cam'].every(a=>!decide('layan',a).ok&&decide('layan',a).why==='sleep'));
 S.pm.layan={k:'study',left:60,until:'6:12 م'};ok('school window: study only',decide('layan','mad').ok&&!decide('layan','mc').ok&&decide('layan','mc').why==='school');
 S.fm.layan=30;ok('free mode checked first',decide('layan','tt').ok&&decide('layan','tt').why==='free');ok('free is per child',!decide('yusuf','ytk').why.includes('free'));
 S=fresh();S.rank=['app','sleep','school','quota'];S.pm.layan={k:'sleep',left:60,until:'x'};ok('reorder: app above sleep → balance usable in sleep',decide('layan','mc').ok&&!decide('layan','cam').ok);
 S.rankKid.layan=['sleep','school','app','quota'];ok('child override beats family order',!decide('layan','mc').ok);ok('other child keeps family order',rankOf('yusuf').join()==='app,sleep,school,quota');
 // 2 الجدول: الآن، الحد التالي، التداخل
 S=fresh();ok('now: Sunday 5:12pm is free time',winNow('layan')===''&&winNow('khaled')==='');ok('next edge: sleep tonight',/النوم 9:00 م/.test(nextEdge('layan')),nextEdge('layan'));ok('next edge yusuf: no windows',/منتصف الليل/.test(nextEdge('yusuf')));
 ok('overnight span',spans({days:[0],s:'21:00',e:'06:00'})[0][1]===1440+360);
 S.sched.yusuf=[{id:'s',type:'school',days:[1],s:'07:30',e:'13:00'}];ok('clash: Sunday-night sleep reaching Monday school is caught and named',/المدرسة/.test(winClash('yusuf',{id:'x',type:'sleep',days:[0],s:'23:00',e:'08:00'})),winClash('yusuf',{id:'x',type:'sleep',days:[0],s:'23:00',e:'08:00'}));S.sched.yusuf=[];
 ok('clash example from spec: sleep 21–06 vs school 05–07',!!winClash('layan',{id:'x',type:'school',days:[1],s:'05:00',e:'07:00'}));
 ok('clash wraps week: Saturday night vs Sunday',!!winClash('yusuf',{id:'x',type:'sleep',days:[6,0],s:'20:00',e:'21:00'})===false&&(()=>{S.sched.yusuf=[{id:'a',type:'school',days:[0],s:'00:30',e:'02:00'}];return !!winClash('yusuf',{id:'x',type:'sleep',days:[6],s:'22:00',e:'01:00'})})());
 ok('no clash: adjacent windows',winClash('layan',{id:'x',type:'school',days:[0],s:'13:00',e:'15:00'})==='');
 ok('editing a window ignores itself',winClash('layan',{id:'w1',type:'sleep',days:[0,1,2,3,4,5,6],s:'21:30',e:'06:00'})==='');
 // 3 شاشة الجدول والمحرر
 S=fresh();open('schedule','layan');ok('schedule: 7 day bars + windows',ph.querySelectorAll('.wk .sched').length===7&&has(/نافذة نوم · كل يوم/)&&has(/الأحد – الخميس/)&&has(/اليوم التالي/));
 ACT.pkid('yusuf');render();ok('schedule empty state (Q-222)',has(/بلا نوافذ بعد/)&&has(/لم تُختر بعد|ألوان ورسم/));
 ACT.winOpen('yusuf','new','sleep');render();ok('new window: no days → save disabled',top()==='win-edit'&&dis('.sheet .btn[data-a="wdSave"]')&&has(/يوماً واحداً على الأقل/));
 ACT.wdDays('0123456');render();ok('new window: overnight said plainly',has(/تمتد إلى اليوم التالي/)&&!dis('.sheet .btn[data-a="wdSave"]'));
 ACT.wdSave();render();ok('window saved + audit',S.sched.yusuf.length===1&&S.audit[0].ty==='sched'&&S.audit[0].kid==='yusuf'&&!S.sheet);
 ACT.winOpen('yusuf','new','school');ACT.wdDays('01234');ACT.wdT('s','05:00');ACT.wdT('e','07:00');render();ok('overlap named and refused',has(/نافذتان متداخلتان/)&&has(/النوم/)&&dis('.sheet .btn[data-a="wdSave"]'));ACT.wdSave();ok('refused: nothing stored',S.sched.yusuf.length===1);
 ACT.wdT('s','07:30');ACT.wdT('e','12:00');render();ok('fixed overlap → can save',!dis('.sheet .btn[data-a="wdSave"]'));ACT.wdSave();ok('second window stored',S.sched.yusuf.length===2);
 ACT.winOpen('yusuf','new','sleep');ACT.wdDays('0');ACT.wdT('s','17:00');ACT.wdT('e','18:00');render();ok('window covering now: immediate effect told',has(/تشمل هذه اللحظة/));S.sheet=null;
 ACT.winOpen('yusuf',S.sched.yusuf[0].id);render();ACT.wdDel();render();ok('delete asks',top()==='dlg');dlgYes();ok('deleted with undo',S.sched.yusuf.length===1);
 S.net='off';ACT.winOpen('layan','w1');render();ok('offline: save disabled with reason',dis('.sheet .btn[data-a="wdSave"]')&&has(/يحتاج اتصالاً/));S.net='on';S.sheet=null;
 setPersona('delegate');setRole('guardian');open('schedule','layan');ok('guardian: schedule locked',!q('[data-a^="winOpen:layan:new"]')&&has(/ليس من صلاحياتك/));
 // 4 قواعد التطبيقات وتحرير القاعدة
 S=fresh();open('apps','layan');ok('apps: remaining + no-rule badge',has(/بقي 18 د اليوم/)&&has(/نفد وقته اليوم/)&&has(/بلا قاعدة · مسموح/)&&has(/تتبع ليان/));
 open('app-rule','layan','cam');ok('new rule: nothing chosen, save disabled',has(/لا قاعدة له/)&&dis('.btn[data-a="adSave"]'));
 ACT.adAct('LIMIT');render();ok('limit: no suggested minutes',S.ad.lim===null&&dis('.btn[data-a="adSave"]')&&has(/لا نقترح رقماً/));
 ACT.adLim('=','20');render();ok('limit typed → can save',S.ad.lim===20&&!dis('.btn[data-a="adSave"]'));ACT.adLim('=','5000');ok('limit clamped to 1440',S.ad.lim===1440);ACT.adLim('=','20');
 ACT.adPer();render();ok('per-day: 7 rows prefilled',ph.querySelectorAll('.dq').length===7&&S.ad.limD.every(v=>v===20));ACT.adDay('5','5');ACT.adDay('6','5');ok('weekend differs',S.ad.limD[5]===25&&S.ad.limD[0]===20);
 back();render();ok('leave with changes → warning',top()==='dlg'&&has(/تغييرات غير محفوظة/));ACT.dlgNo();render();
 ACT.adSave();render();ok('rule created: today limit + audit + back to list',appOf('layan','cam').act==='LIMIT'&&appOf('layan','cam').lim===20&&appOf('layan','cam').limD[5]===25&&S.audit[0].k==='protection.rule.create'&&top()==='apps');
 open('app-rule','layan','cam');ACT.adDel();render();ok('delete needs PIN',top()==='pin');pin();ok('delete explains effect',top()==='dlg'&&has(/يعود مسموحاً/));dlgYes();ok('rule deleted → no rule',appOf('layan','cam').act===undefined&&S.audit[0].k==='protection.rule.delete');
 open('app-rule','layan','ytk');ACT.adAct('BLOCK');render();ok('BLOCK hides minutes and study',!q('.numf')&&!q('[data-a="adStudy"]'));ACT.adSave();ok('edit saved',appOf('layan','ytk').act==='BLOCK'&&appOf('layan','ytk').lim===undefined);
 S.net='off';open('app-rule','layan','mc');ACT.adLim('=','50');render();ok('offline: rule save disabled',dis('.btn[data-a="adSave"]')||q('.btn[data-a="noop"]'));S.net='on';S.ad=null;
 S=fresh();S.kidOff='layan';open('app-rule','layan','mc');ACT.adLim('=','50');ACT.adSave();render();ok('child device offline → change waits',S.pendR.layan===1);open('enf-state','layan');ok('state shows pending change',has(/بانتظار اتصال الجهاز/));ACT.enfSync('layan');ok('sync while device off keeps pending',S.pendR.layan===1);S.kidOff='';ACT.enfSync('layan');ok('sync delivers',!S.pendR.layan);
 S=fresh();setPersona('delegate');setRole('guardian');open('apps','layan');ok('guardian sees rules, cannot add',!!q('[data-a="denied:protection.rule.create"]'));
 // 5 الحصة
 S=fresh();open('quota','layan');ok('quota: formula with numbers',has(/الحصة/)&&has(/الإضافي/)&&has(/المستهلك/)&&q('.eq')&&has(/بقي 24 دقيقة/));ok('quota: 7 day rows',ph.querySelectorAll('.dq').length===7);
 ACT.qdDay('5','15');ACT.qdDay('0','-15');render();ok('quota dirty → save enabled',!dis('.btn[data-a="qdSave"]'));ACT.qdSave();ok('quota saved per weekday',S.kid.layan.qD[5]===135&&S.kid.layan.quota===105&&S.audit[0].k==='protection.quota.edit');
 open('quota','yusuf');ok('default 60 stated',has(/60 دقيقة لكل يوم/));
 setPersona('delegate');open('quota','layan');ok('partner: quota locked (owner only)',!q('[data-a^="qdDay"]')&&has(/الأب وحده/)&&!q('.btn[data-a="qdSave"]'));
 // 6 تطبيقات الدراسة
 S=fresh();open('study-apps','layan');ok('study list: blocked app not selectable',!!q('.row.dis[data-q="TikTok"]')&&q('[data-q="مدرستي"]').getAttribute('aria-checked')==='true');
 ACT.sdT('mad');render();ok('none selected → effect stated',has(/كل التطبيقات تُغلق في وقت المدرسة/));ACT.sdT('mad');ACT.sdT('cam');ACT.sdSave();ok('study saved; no-rule app gets allow rule',appOf('layan','cam').study===1&&appOf('layan','cam').act==='ALLOW'&&appOf('layan','mad').study===1);
 // 7 الترتيب والمعاينة
 S=fresh();open('priority','fam');ok('priority default preview: 3 moments, no warning',has(/في وقت النوم/)&&has(/لا يُفتح أي تطبيق/)&&has(/في وقت المدرسة/)&&has(/في باقي اليوم/)&&!q('.callout.da')&&dis('.btn[data-a="pdSave"]'));
 ACT.pdMv('2','-1');ACT.pdMv('1','-1');render();ok('app on top → spec warning shown before save',S.pd.r[0]==='app'&&has(/يستطيع طفلك استخدام رصيد تطبيقاته حتى بعد وقت النوم/)&&!!q('.callout.da'));
 ACT.pdSave();render();ok('risky order asks confirm',top()==='dlg');ACT.dlgNo();ok('not saved on cancel',S.rank.join()==='sleep,school,app,quota');ACT.pdSave();dlgYes();ok('family order saved + audit',S.rank[0]==='app'&&S.audit[0].ty==='rank');
 ACT.pdSc('layan');render();ok('child follows family',has(/يتبع ترتيب العائلة/));ACT.pdReset();render();ACT.pdSave();render();ok('child override saved (safe order: no confirm)',S.rankKid.layan&&S.rankKid.layan.join()==='sleep,school,app,quota'&&top()==='priority');
 render();ok('override marked',has(/خاص/)&&!!q('[data-a="pdDrop"]'));ACT.pdDrop();ok('override dropped',!S.rankKid.layan);
 ok('quota above app → dead rules warned',rankSay(['sleep','school','quota','app']).warn.some(w=>/قواعد التطبيقات تحت الحصة/.test(w)));ok('quota on top → sleep warned',rankSay(['quota','sleep','school','app']).warn.length>=2);
 S=fresh();setPersona('delegate');setRole('guardian');open('priority','fam');ok('guardian: order read-only',dis('[data-a^="pdMv"]')&&!q('.btn[data-a="pdSave"]'));
 // 8 الأوضاع الجاهزة
 S=fresh();open('home');ok('home: 3 preset cards open the presets screen',!!q('[data-a="go:presets:study"]')&&!!q('[data-a="go:presets:sleep"]')&&!!q('[data-a="go:presets:free"]'));
 open('presets','sleep');ok('preset: nothing preselected, apply disabled',!S.psN&&dis('.btn[data-a^="psGo"]')&&has(/اختر الطفل والمدة/));
 ACT.psKid('layan');ACT.psKid('yusuf');render();ok('kids chosen, still no duration → disabled',dis('.btn[data-a^="psGo"]'));ACT.set('psN','60');render();ok('preview names each child and end time',has(/6:12 م/)&&has(/لا يُفتح أي تطبيق/)&&has(/الجدول الأسبوعي لا يتغير/)&&!dis('.btn[data-a^="psGo"]'));
 const sch=JSON.stringify(S.sched);ACT.psGo('sleep');render();ok('sleep applied to both, weekly schedule untouched',S.pm.layan.k==='sleep'&&S.pm.yusuf.k==='sleep'&&!S.pm.khaled&&JSON.stringify(S.sched)===sch&&S.audit[0].ty==='mode');
 ok('active list with end button',has(/مفعّل الآن/)&&!!q('[data-a="pmOff:layan"]'));ok('kid now in sleep',winNow('layan')==='sleep'&&!decide('layan','mad').ok);
 ACT.pmOff('layan');ok('ended early + audit',!S.pm.layan&&/قبل وقته/.test(S.audit[0].t));
 ACT.psM('study');ACT.psKid('layan');ACT.durSet('psN','45');render();ok('study preview lists study apps',has(/مدرستي/)&&has(/5:57 م/));ACT.psGo('study');ok('study applied',S.pm.layan.k==='study'&&decide('layan','mad').ok&&!decide('layan','mc').ok);
 ACT.psM('free');render();ACT.psKid('layan');ACT.psKid('khaled');ok('free: one child at a time',S.psK.length===1&&S.psK[0]==='khaled');ACT.set('psN','30');render();ok('free preview: tamper alert stays',has(/تتوقف كل القواعد/)&&has(/تنبيه العبث المفتوح على جهازه يبقى/));
 ACT.psGo('free');render();ok('free needs PIN',top()==='pin');pin();ok('free on for khaled only',S.fm.khaled===30&&!S.fm.layan&&S.audit[0].ty==='free');render();ok('banner names the child',/وضع حر: خالد — ينتهي خلال 30 د/.test(document.body.innerText));ok('free does not clear tamper',S.tam.some(e=>e.open)&&S.alerts.some(a=>a.k==='tamper'&&a.open));
 ACT.psKid('khaled');render();ok('free already active: honest state',has(/الوضع الحر سارٍ/)&&!q('.btn[data-a^="psGo"]'));ACT.freeOff('khaled');ok('free cancelled + audit',!S.fm.khaled&&/قبل انتهائه/.test(S.audit[0].t));
 S=fresh();S.net='off';open('presets','sleep');ACT.psKid('layan');ACT.set('psN','30');render();ok('offline: preset disabled with reason',dis('.btn[data-a^="psGo"]')&&has(/يحتاج اتصالاً/));
 S=fresh();setPersona('delegate');open('presets','free');ok('delegate: free is father only',has(/يفعّله الأب وحده/)&&!q('[data-a^="psKid"]'));ACT.psM('sleep');render();ok('partner may apply sleep',!!q('[data-a^="psKid"]'));
 S=fresh();S.rank=['app','sleep','school','quota'];open('presets','sleep');ACT.psKid('layan');ACT.set('psN','30');render();ok('preset preview honest about custom order',has(/قد تبقى بعض تطبيقاته مفتوحة/));
 // 9 الوضع الحر من جهاز الطفل
 S=fresh();setPersona('child');go('kid-admin');render();ACT.kidExit();render();ok('kid-free: no default duration',top()==='kid-free'&&dis('.sheet .btn[data-a="kidFreeGo"]'));ACT.set('fmN','60');render();ACT.kidFreeGo();ok('kid-free: this child only',S.fm.layan===60&&!S.fm.yusuf&&S.audit[0].kid==='layan');render();ok('kid banner',/وضع حر — ينتهي خلال 60 د/.test(document.body.innerText));
 // 10 العبث
 S=fresh();open('tamper','a1');ok('tamper via alert id → khaled',has(/جزئياً على جهاز خالد/)&&has(/توقف إذن مراقبة التطبيقات/)&&has(/12 محاولة/)&&has(/توقفت تصفية المواقع/));
 open('tamper','layan');ok('tamper empty state',has(/كل شيء على ما يرام/));
 open('tamper','khaled');ACT.tamRetry('khaled');render();ok('reactivated: alert stays for review',S.kid.khaled.enf==='active'&&S.tam[0].st==='ok'&&S.alerts.find(a=>a.id==='a1').open===1&&has(/بانتظار مراجعتك/));
 ACT.tamOk('khaled');ok('owner resolves',!S.tam.some(e=>e.open)&&!S.alerts.find(a=>a.id==='a1').open&&S.audit[0].k==='protection.tamper.resolve');
 S=fresh();open('tamper','khaled');ACT.tamOk('khaled');render();ok('resolve while broken → warns',top()==='dlg'&&has(/لا يعيد الحماية/));ACT.dlgNo();
 S=fresh();setPersona('teen');ACT.teenFix();ok('teen fix does not silence the alert',S.kid.khaled.enf==='active'&&S.alerts.find(a=>a.id==='a1').open===1&&S.tam[0].open===1);
 S=fresh();setPersona('delegate');open('tamper','khaled');ok('delegate cannot resolve',!!q('[data-a="denied:protection.tamper.resolve"]')&&has(/للأب وحده/));
 // 11 حالة الحماية
 S=fresh();open('enf-state','layan');ok('state: now + next + per app + quota',has(/وقت متاح/)&&has(/الحد التالي/)&&has(/النوم 9:00 م/)&&has(/Minecraft/)&&has(/منتصف الليل/));
 S.fm.layan=20;render();ok('state: free mode shown',has(/وضع حر/)&&has(/20 د/));open('enf-all');ok('all kids state',has(/خالد/)&&has(/يوسف/));
 // 12 السجل
 S=fresh();open('app-rule','layan','mc');ACT.adLim('=','40');ACT.adSave();open('prot-audit','all');ok('audit lists protection change',has(/عُدّلت قاعدة Minecraft/)&&!!q('[data-a^="paUndo"]'));
 ACT.paF('kid','yusuf');render();ok('audit filter by child → empty state',has(/لا تغييرات بهذه التصفية/));ACT.paClear();ACT.paF('ty','rule');render();ok('audit filter by type',has(/Minecraft/));
 ACT.paUndo(String(S.audit.findIndex(a=>a.un)));ok('undo from audit',appOf('layan','mc').lim===30&&/تراجع عن/.test(S.audit[0].t));ok('audit has no delete',!q('[data-a*="Del"]'));
 // 13 مراجعة القواعد
 S=fresh();open('protection');ok('hub shows review card',!!q('[data-a="go:rules-review"]'));open('rules-review');ok('review: new device card',has(/قُرن جهاز جديد لخالد/)&&has(/أُعيدت إليه/));
 S.rev13=1;render();ok('review: turned 13 card',has(/بلغت ليان 13 سنة/)&&has(/ما زالت سارية/));ACT.rvKeep('teen');ACT.rvGo('rv1');render();ok('keep + review → list empty, opens rules',!reviews().length&&top()==='apps');
 back();render();ok('review empty state',has(/لا مراجعات معلقة/));
 // 14 تصفية الويب
 S=fresh();ok('30 categories, ids unique',WCAT.length===30&&new Set(WCAT.map(c=>c[0])).size===30&&!WCAT.some(c=>c[0]===11||c[0]>31));ok('5 source defaults blocked',[14,12,7,3,1].every(i=>wDef(i)==='BLOCK')&&wDef(6)==='ALLOW');
 open('webfilter','layan');ok('web: 4 groups, 30 rows, defaults marked',ph.querySelectorAll('[data-grp]').length===4&&ph.querySelectorAll('.row[data-q]').length===30&&has(/محظور افتراضياً/)&&dis('.btn[data-a="wrSave"]'));
 ok('flags default: safe on, report on, unknown off, search off',wfFlagOf('layan','safe')===true&&wfFlagOf('layan','report')===true&&wfFlagOf('layan','unknown')===false&&wfFlagOf('layan','search')===false);
 open('wf-cat','layan','19');ok('category sheet: 3 actions',ph.querySelectorAll('.sheet .opt').length===3);ACT.wrCat('19','ALERT');render();ok('draft only until save',S.wr.c[19]==='ALERT'&&!S.wfc.layan[19]&&!dis('.btn[data-a="wrSave"]'));
 ACT.wrFlag('search');back();render();ok('web leave guard',top()==='dlg');ACT.dlgNo();ACT.wrSave();ok('web saved + audit',S.wfc.layan[19]==='ALERT'&&S.wfl.layan.search===true&&S.audit[0].ty==='web'&&/شبكات التواصل ← تنبيه/.test(S.audit[0].t));
 ok('per child: yusuf untouched',!S.wfc.yusuf[19]);
 S=fresh();setPersona('delegate');open('webfilter','layan');ok('partner: web filter read-only (owner only)',has(/الأب وحده/)&&!q('.btn[data-a="wrSave"]')&&!!q('[data-a="denied:protection.filter.edit"]'));
 // 15 المواقع المستثناة
 S=fresh();open('web-domains','layan');ok('domains list + rule stated',has(/khanacademy\.org/)&&has(/يفوز على فئة الموقع/));
 const setD=v=>{q('#wdomN').value=v};setD('not a site');ACT.wdomA('BLOCK');render();ACT.wdomAdd('layan');render();ok('invalid domain inline error',S.wdom.layan.length===1&&has(/ليس عنوان موقع صحيحاً/));
 setD('https://www.Example.com/path?x=1');ACT.wdomAdd('layan');render();ok('domain normalised and added',S.wdom.layan.some(x=>x.d==='example.com'&&x.a==='BLOCK')&&S.audit[0].ty==='web');
 setD('example.com');ACT.wdomA('ALLOW');render();ACT.wdomAdd('layan');render();ok('duplicate refused',S.wdom.layan.length===2&&has(/مضاف من قبل/));
 setD('test.org');S.wdN={a:''};ACT.wdomAdd('layan');render();ok('action required',S.wdom.layan.length===2&&has(/اختر الإجراء أولاً/));
 ACT.wdomDel('layan','1');render();ok('delete explains',top()==='dlg'&&has(/سيعود الموقع إلى إجراء فئته/));dlgYes();ok('domain removed',S.wdom.layan.length===1);
 open('web-domains','yusuf');ok('domains empty state',has(/لا مواقع مستثناة/));
 // 16 شاشة الحظر والتحذير عند الطفل
 S=fresh();setPersona('child');render();ACT.openApp('ytk');render();ok('block: app limit reason + ask + zero left',top()==='block'&&has(/نفد وقت YouTube Kids اليوم/)&&has(/المتبقي: 0 دقيقة/)&&!!q('[data-a="go:ask-time:ytk"]')&&!!q('.sos'));
 S.full=null;ACT.openApp('tt');render();ok('block: permanent block has no ask',has(/غير متاح/)&&!q('[data-a^="go:ask-time"]'));
 S.full=null;S.pm.layan={k:'sleep',left:60,until:'6:12 م'};ACT.openApp('mad');render();ok('block: sleep reason, no ask, SOS stays',has(/وقت نوم/)&&has(/6:12 م/)&&!q('[data-a^="go:ask-time"]')&&!!q('.sos'));
 S.full=null;S.pm.layan={k:'study',left:60,until:'6:12 م'};ACT.openApp('mc');render();ok('block: school reason + study apps button',has(/وقت مدرسة — تطبيقات الدراسة فقط/)&&!!q('[data-a="blkLearn"]'));ACT.blkLearn();render();ok('to study apps',top()==='learn');
 S=fresh();setPersona('child');S.kid.layan.used=120;render();ACT.openApp('cam');render();ok('block: quota reason',has(/نفدت حصتك اليومية/)&&!!q('[data-a="go:ask-time:cam"]'));
 S=fresh();setPersona('child');render();ACT.openApp('mc');render();ok('warn5 shown once per app per day',top()==='warn5'&&has(/بقي 5 دقائق/)&&!!q('.sheet .sos')&&appOf('layan','mc').used===25);S.sheet=null;appOf('layan','mc').used=12;ACT.openApp('mc');render();ok('warn5 not repeated',top()!=='warn5');
 S=fresh();setPersona('mini');S.apps.yusuf[0].used=30;render();ACT.openAppM();render();ok('mini block: big tile, one button',top()==='block'&&has(/انتهى وقت اللعبة/)&&!!q('[data-a="askGoM:ytk"]')&&!has(/المتبقي/));ACT.askGoM('ytk');render();ok('mini request sent',S.reqs.length===1&&has(/طلبك عند بابا/));
 S=fresh();setPersona('teen');jump('block');render();ok('teen block renders (no crash)',top()==='block'&&has(/PUBG|WhatsApp/));
 S=fresh();setPersona('child');S.fm.layan=30;render();ACT.openApp('tt');ok('free mode opens blocked app on child device',!S.full);
 }catch(e){F.push('CRASH after check #'+N+': '+e.message)}
 // 17 كل أسطح S1-10: لا تجاوز أفقي + لا كلام مهندسين + لا معرّفات
 const over=[],eng=[];const ids=Object.keys(SC).filter(k=>SC[k].sys==='S1-10');const BAD=/[a-z]+\.[a-z_]+\.[a-z_]+|ALLOW|BLOCK|LIMIT|ALERT|IGNORE|Accessibility|DeviceAdmin|VPN|MQTT|Outbox|bitmask|is[A-Z]\w+|step-up|Parent Gate|PIN|نبضة|الرتيبة|القناع|مزامَن|الفرض|ذرّي|نطاق|undefined|null|NaN/;
 for(const id of ids){for(const pre of [null,'guardian','none','co','ios','off']){try{S=fresh();if(pre==='co')S.co={since:'اليوم',seen:0};else if(pre==='ios')S.os='ios';else if(pre==='off')S.net='off';else if(pre)setRole(pre);jump(id);render();const sc=document.getElementById('scr');if(sc&&sc.scrollWidth>sc.clientWidth+1)over.push(id);const sh=ph.querySelector('.sheet');if(sh&&sh.scrollWidth>sh.clientWidth+1)over.push(id+':sheet');
   const m=txt().replace(/SOS/g,'').replace(/[a-z0-9-]+\.(org|com)/g,'').match(BAD);if(m)eng.push(id+(pre?'/'+pre:'')+':'+m[0]);}catch(e){F.push('ERR '+id+' '+(pre||'')+' '+e.message)}}}
 R.over=[...new Set(over)];R.eng=[...new Set(eng)];R.n=ids.length;R.ids=ids.join(' ');R.checks=N;R.fail=F;return R;});
R.errs=errs;}catch(e){R.crash=String(e.stack||e).slice(0,900)}finally{await b.close()}
console.log(JSON.stringify(R,null,1));})();
