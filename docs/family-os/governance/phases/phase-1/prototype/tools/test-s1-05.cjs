// اختبار مسارات S1-05 (المكافآت) في النموذج: المحفظة والدفتر، الكسب من المهام والسلسلة ومكافأتها، الصرف وحد اليوم، طلب الوقت وقراره،
// المنح والتراجع، إلغاء الإيداع بقيد تعويضي، الاعتراض وقراره، التجميد، قواعد الأب، المراهق بلا محفظة، منتصف الليل، ودون اتصال.
// يحتاج puppeteer-core و@sparticuz/chromium (غير مضمَّنين في المستودع):  NODE_PATH=<node_modules> node tools/test-s1-05.cjs
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
 const rows=()=>ph.querySelectorAll('#scr .list .row').length;const typeGs=v=>{const e=q('[data-gs]');e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))};
 const pins=()=>ph.querySelectorAll('#scr .map .pin').length;const SOS=x=>Object.assign({from:'layan',st:'sent',ch:'server',via:'عبر الإنترنت',place:'البيت'},x||{});
 const kidSos=p=>{setPersona(p||'child');ACT.sosStart();ACT.sosSend();render()};const tU=()=>document.querySelector('#toast [data-a="undo"]');
 const LOCS=['map','loc','history','emergency','ec-add','sos-count','sos-sent','sos-status','sos-resolve','sos-log','loc-share'];
 const T=()=>document.querySelector('#toast').textContent;const noT=()=>{document.querySelector('#toast').innerHTML=''};const sh=()=>(q('.sheet')||q('#scr')).innerText.replace(/\s+/g,' ');
 const L=id=>RW().led[id];const kid=p=>{setPersona(p||'child')};const RWS=['c-rewards','rw-ledger','rw-move','redeem','ask-time','streak','objection','rewards-admin','wallet-admin','grant-points','grant-time','time-decide','obj-decide','rw-settings','rw-edit','rw-ai'];
 const REQ=x=>{const r=Object.assign({id:'r0',kid:'layan',app:'ytk',min:15,msg:'بقيت حلقة واحدة',st:'PENDING'},x||{});S.reqs.push(r);return r};
 const OBJ=x=>{const o=Object.assign({id:'o1',kid:'layan',sub:'d1',txt:'أنجزتها كما طُلب',st:'PENDING',at:'الآن'},x||{});RW().obj.push(o);return o};
 // 1 البذرة
 S=fresh();ok('seed: seventeen S1-05 surfaces',RWS.every(k=>SC[k]&&SC[k].sys==='S1-05'),RWS.filter(k=>!SC[k]));
 ok('seed: ledger balances match the wallets',L('layan')[0].bal===S.kid.layan.pts&&L('khaled').length===0);
 ok('seed: every ledger line carries its running balance',L('layan').every((e,i,a)=>i===a.length-1||e.bal===a[i+1].bal+e.n));
 ok('seed: daily cap 60, streak bonus 50, tasks the only source',S.redeemCap===60&&RW().bonus===50&&Object.keys(RW().src).join()==='tasks'&&RW().src.tasks===true);
 ok('wallet only under thirteen',rwHas('layan')&&!rwHas('khaled'));
 // 2 محفظة الطفل
 S=fresh();kid();tab('c-rewards');render();
 ok('child wallet: balance, fixed rate, convert button',has(/نقاطي/)&&q('#scr .wallet .big').textContent.trim().startsWith('85')&&has(/كل 10 نقاط = 10 دقائق/)&&!!q('#scr [data-a="go:redeem:ytk"]'));
 ok('child wallet: extra-time meter against the cap',has(/وقتي الإضافي اليوم/)&&has(/0 من 60 دقيقة/)&&has(/بقي لك 60 دقيقة اليوم/));
 ok('child wallet: streak card with the week and its bonus',has(/سلسلتي: 5 أيام/)&&has(/بقي يومان للمكافأة/)&&ph.querySelectorAll('#scr .week .on').length===5&&has(/\+50/));
 ok('child wallet: tasks waiting with what they pay',has(/عندك مهمتان اليوم/)&&has(/تكسبين بها 25 نقطة/));
 ok('child wallet: last four moves, link to all',ph.querySelectorAll('#scr [data-a^="go:rw-move:layan:"]').length===4&&!!q('#scr [data-a="go:rw-ledger"]'));
 ok('child wallet: objection entry, no shop, no prices',!!q('#scr [data-a="go:objection"]')&&!has(/متجر|شراء|ريال/));
 ok('child wallet: the other way is to ask dad',!!q('#scr [data-a="go:ask-time:ytk"]'));
 ok('feminine wording for a girl',has(/حوّلي نقاطك إلى وقت/)&&has(/أخبري بابا/));
 // 3 السجل وتفصيل الحركة
 open('rw-ledger');ok('ledger: grouped by day, newest first',has(/اليوم/)&&has(/أمس/)&&has(/أقدم/)&&rows()===6);
 ok('ledger: each line says who verified',has(/تحقق المساعد/)&&has(/اعتمدها بابا/)&&has(/اعتمدها ماما/));
 ACT.set('rwF','out');render();ok('ledger filter: spent only',rows()===1&&has(/وقت إضافي لـYouTube Kids/));
 ACT.set('rwF','in');render();ok('ledger filter: earned only',rows()===5);ACT.set('rwF','');
 open('rw-move','layan','l5');ok('move detail (child): source, assigner, verifier, evidence, balance after',/المصدر المهام/.test(sh())&&/من أسندها بابا/.test(sh())&&/من تحقق منها المساعد/.test(sh())&&/تسجيل صوتي/.test(sh())&&/الرصيد بعدها 80 نقطة/.test(sh()));
 ok('move detail (child): no reversal button',!q('.sheet [data-a^="rwRevAsk"]'));
 open('rw-move','layan','l3');ok('gift detail: who gave it and why',/هدية من بابا/.test(sh())&&/ساعدتِ أخاكِ في واجبه/.test(sh()));
 // 4 الصرف
 S=fresh();kid();tab('c-rewards');open('redeem','ytk');
 ok('redeem: for the app that ran out, step of ten',/وقت إضافي لـYouTube Kids/.test(sh())&&/10 دقيقة = 10 نقاط/.test(sh().replace(/10دقيقة/,'10 دقيقة'))&&dis('.sheet [data-a="set:rdN:0"]'));
 ok('redeem: what remains and what is left of the cap',/معك الآن 85 نقطة/.test(sh())&&/يبقى معك 75 نقطة/.test(sh())&&/بقي من حد اليوم 60 دقيقة/.test(sh()));
 ok('redeem: says it ends at midnight, no refund',/ينتهي هذا الوقت عند منتصف الليل/.test(sh())&&/لا يعود نقاطاً/.test(sh()));
 ACT.set('rdN',30);render();ok('redeem stepper: thirty minutes',/يبقى معك 55 نقطة/.test(sh())&&!!q('.sheet [data-a="rdGo:ytk:30"]'));
 q('.sheet [data-a="rdGo:ytk:30"]').click();render();
 ok('redeem done: points down, app limit up, cap counted',S.kid.layan.pts===55&&appOf('layan','ytk').lim===75&&S.kid.layan.spent===30&&S.kid.layan.extra===30&&S.sheet===null);
 ok('redeem done: a spend line in the ledger',L('layan')[0].k==='spend'&&L('layan')[0].n===-30&&L('layan')[0].bal===55&&/\+30 دقيقة/.test(T()));noT();
 ok('redeem done: meter shows 30 of 60',has(/30 من 60 دقيقة/));
 appOf('layan','ytk').used=75;open('redeem','ytk');ACT.set('rdN',60);render();ok('redeem never exceeds what is left of the cap',!!q('.sheet [data-a="rdGo:ytk:30"]')&&dis('.sheet [data-a="set:rdN:40"]'));
 ACT.rdGo('ytk',50);ok('server-side guard: over the cap refused',S.kid.layan.pts===55&&/تعذّر التحويل/.test(T()));noT();
 S=fresh();kid();S.kid.layan.spent=60;tab('c-rewards');open('redeem','ytk');ok('cap reached: explained, points kept',/انتهى الوقت الإضافي لليوم/.test(sh())&&/نقاطك باقية معك/.test(sh())&&!q('.sheet [data-a^="rdGo"]'));
 S=fresh();kid();S.kid.layan.pts=5;tab('c-rewards');open('redeem','ytk');ok('not enough points: ask dad or do a task',/نقاطك لا تكفي الآن/.test(sh())&&!!q('.sheet [data-a="go:ask-time:ytk"]'));
 S=fresh();kid();appOf('layan','ytk').used=10;tab('c-rewards');open('redeem');ok('no app out of time: nothing to redeem for',/لا تطبيق يحتاج وقتاً الآن/.test(sh())&&/النقاط لا تنتهي/.test(sh()));
 S=fresh();kid();S.net='off';tab('c-rewards');open('redeem','ytk');ok('offline redeem: allowed, says it syncs later',/يُضاف الوقت الآن على جهازك/.test(sh()));q('.sheet [data-a^="rdGo:ytk"]').click();render();ok('offline redeem: applied and queued',S.kid.layan.pts===75&&S.outbox.length===1&&/يُسجَّل عند الاتصال/.test(T()));noT();
 // 5 طلب الوقت
 S=fresh();kid();tab('c-rewards');open('ask-time','ytk');
 ok('ask: three durations, middle one chosen, optional note',ph.querySelectorAll('.sheet .seg button').length===3&&!!q('.sheet #akM')&&/قد يمنحك وقتاً، وقد يعطيك مهمة/.test(sh()));
 q('#akM').value='بقيت حلقة واحدة';q('.sheet [data-a="askGo:ytk"]').click();render();
 ok('ask sent: one pending request with the note',S.reqs.length===1&&S.reqs[0].st==='PENDING'&&S.reqs[0].min===15&&S.reqs[0].msg==='بقيت حلقة واحدة'&&/وصل طلبك إلى بابا/.test(T()));noT();
 ok('ask sent: wallet shows it waiting',has(/طلبك عند بابا/));
 open('ask-time','ytk');ok('ask twice for the same app: told it is waiting',/طلبك عند بابا/.test(sh())&&!q('.sheet [data-a^="askGo"]'));
 S=fresh();kid();S.kid.layan.spent=50;tab('c-rewards');open('ask-time','ytk');ok('ask: durations capped by what is left today',ph.querySelectorAll('.sheet .seg button').length===1&&/10 دقيقة/.test(sh()));
 S=fresh();kid();S.kid.layan.spent=60;tab('c-rewards');open('ask-time','ytk');ok('ask at the cap: no request possible',/انتهى الوقت الإضافي لليوم/.test(sh())&&!q('.sheet [data-a^="askGo"]'));
 S=fresh();kid();S.net='off';tab('c-rewards');open('ask-time','ytk');q('.sheet [data-a="askGo:ytk"]').click();render();ok('offline ask: saved and queued',S.reqs.length===1&&S.outbox.length===1&&/يُرسل عند الاتصال/.test(T()));noT();
 // 6 قرار الأب على الطلب
 S=fresh();REQ();tab('home');render();
 ok('parent home: request card with one-tap grant',has(/ليان تطلب 15 دقيقة إضافية/)&&!!q('#scr [data-a="reqGrant:r0:15"]')&&!!q('#scr [data-a="go:time-decide:r0"]'));
 open('time-decide','r0');ok('decide: the note, today so far, the wallet',/بقيت حلقة واحدة/.test(sh())&&/إضافي اليوم 0 من 60 د/.test(sh())&&/في محفظتها 85 نقطة/.test(sh()));
 ok('decide: grant options, swap task, plain refusal',!!q('.sheet [data-a="reqGrant:r0:10"]')&&!!q('.sheet [data-a="reqGrant:r0:60"]')&&!!q('.sheet [data-a="rwTdTask:r0"]')&&!!q('.sheet [data-a="reqDeny:r0"]'));
 q('.sheet [data-a="reqGrant:r0:15"]').click();render();
 ok('grant: time added to that app, counted in the cap, no points taken',S.reqs[0].st==='GRANTED'&&S.reqs[0].got===15&&appOf('layan','ytk').lim===60&&S.kid.layan.spent===15&&S.kid.layan.pts===85&&S.audit[0].k==='rewards.time_request.decide');
 ok('grant: shown in the ledger with no points',L('layan')[0].k==='time'&&L('layan')[0].n===0&&L('layan')[0].min===15);
 ok('grant: ten-second undo',!!tU()&&/تنتهي عند منتصف الليل/.test(T()));tU().click();render();ok('undo: request back, time and ledger line removed',S.reqs[0].st==='PENDING'&&appOf('layan','ytk').lim===45&&S.kid.layan.spent===0&&L('layan')[0].id==='l6');noT();
 ACT.reqGrant('r0',15);noT();kid();render();ok('child home: told dad agreed',has(/وافق بابا! \+15 دقيقة/)&&has(/تنتهي عند منتصف الليل/));q('#scr [data-a="reqSeen:r0"]').click();render();ok('result card dismissed once',!has(/وافق بابا/));
 S=fresh();REQ();S.kid.layan.spent=50;tab('home');render();ok('card offers only what the cap allows',!!q('#scr [data-a="reqGrant:r0:10"]')&&!q('#scr [data-a="reqGrant:r0:15"]'));
 ACT.reqGrant('r0',15);ok('grant over the cap refused',S.reqs[0].st==='PENDING'&&/بقي من حد اليوم 10 دقائق فقط/.test(T()));noT();
 S=fresh();REQ();S.kid.layan.spent=60;open('time-decide','r0');ok('decide at the cap: no grant, owner can raise the cap',!q('.sheet [data-a^="reqGrant"]')&&/ارفع الحد اليومي/.test(sh())&&!!q('.sheet [data-a="go:ctl-edit:cap:layan"]'));
 S=fresh();REQ();open('time-decide','r0');q('.sheet [data-a="rwTdTask:r0"]').click();render();ok('swap task: pick the task and its value',/مهمة بدل الوقت/.test(sh())&&ph.querySelectorAll('.sheet [data-a^="rwTdSet:t:"]').length===3&&/15 نقطة = 15 دقيقة وقتاً/.test(sh()));
 ACT.rwTdSet('t','1');ACT.rwTdSet('pts','25');render();q('.sheet [data-a="rwTdGo"]').click();render();
 ok('swap task: request refused, task assigned with its points',S.reqs[0].st==='DENIED'&&S.reqs[0].task==='ترتيب الغرفة'&&S.tasks[0].kid==='layan'&&S.tasks[0].pts===25&&S.tasks[0].st==='PENDING'&&S.kid.layan.spent===0);noT();
 kid();render();ok('child home: told about the task instead',has(/ليس الآن يا بطلة/)&&has(/أعطاك بابا مهمة «ترتيب الغرفة»/));
 S=fresh();REQ();ACT.reqDeny('r0');noT();ok('plain refusal: no task, nothing granted',S.reqs[0].st==='DENIED'&&!S.reqs[0].task&&S.tasks.length===7&&S.kid.layan.spent===0);
 ACT.reqGrant('r0',15);ok('a decided request cannot be decided twice',S.kid.layan.spent===0&&/سبق القرار/.test(T()));noT();
 S=fresh();setPersona('delegate');REQ();tab('home');render();ok('delegate with the key decides requests too',!!q('#scr [data-a="reqGrant:r0:15"]'));
 // 7 الكسب من المهام والسلسلة
 S=fresh();ACT.taskOk('t1');
 ok('task approved: points through the ledger, verifier and evidence kept',S.kid.layan.pts===95&&L('layan')[0].k==='task'&&L('layan')[0].t==='ترتيب الغرفة'&&L('layan')[0].vf==='ahmad'&&/صورة الإثبات/.test(L('layan')[0].ev));
 ok('streak counts once a day',S.kid.layan.streak===5&&/أُودعت 10 نقاط في محفظة ليان/.test(T()));
 tU().click();render();ok('undo approval: compensating line, balance restored',S.kid.layan.pts===85&&L('layan')[0].k==='rev'&&L('layan')[1].rev===L('layan')[0].id&&S.tasks.find(t=>t.id==='t1').st==='SUBMITTED');noT();
 S=fresh();RW().day.layan=0;S.kid.layan.streak=6;ACT.taskOk('t1');
 ok('seventh day: streak bonus deposited as its own line',S.kid.layan.streak===7&&S.kid.layan.pts===145&&L('layan')[0].k==='streak'&&L('layan')[0].n===50&&L('layan')[1].st1===1&&/مكافأة السلسلة 50/.test(T()));noT();
 kid();tab('c-home');render();open('streak');ok('streak page: seven days, silver badge earned',q('#scr .rwstk > b').textContent==='7'&&ph.querySelectorAll('#scr .rwbdg .got').length===1&&has(/نلتِها/)&&has(/بقي 23 يوماً/));
 S=fresh();RW().src.tasks=false;ACT.taskOk('t1');ok('source switched off: task approved without points',S.kid.layan.pts===85&&S.tasks.find(t=>t.id==='t1').st==='APPROVED'&&/كسب النقاط من المهام متوقف/.test(T()));noT();
 S=fresh();S.tasks.push({id:'tk',kid:'khaled',t:'تجربة',cat:'home',pts:10,due:'اليوم',proof:'self',st:'SUBMITTED'});ACT.taskOk('tk');ok('teen task never deposits points',S.kid.khaled.pts===0&&L('khaled').length===0);noT();
 // 8 منح النقاط
 S=fresh();open('grant-points','layan');
 ok('grant points: one child so no chooser, the teen never offered, default ten, reasons',ph.querySelectorAll('.sheet [data-a^="gpSet:kid:"]').length===0&&S.gp.kid==='layan'&&ph.querySelectorAll('.sheet [data-a^="gpSet:why:"]').length===3&&/أقصى ما يُمنح في المرة 60 نقطة/.test(sh()));
 ACT.gpSet('n','200');render();ok('grant points: never above sixty',S.gp.n===60&&dis('.sheet [data-a="gpSet:n:65"]'));
 ACT.gpSet('n','20');ACT.gpSet('why','0');render();q('.sheet [data-a="gpGo"]').click();render();
 ok('gift deposited with the giver and the reason',S.kid.layan.pts===105&&L('layan')[0].k==='gift'&&L('layan')[0].by==='ahmad'&&L('layan')[0].why==='خُلق حسن'&&S.audit[0].k==='rewards.grant.create');
 ok('gift does not extend the streak',S.kid.layan.streak===5&&!L('layan')[0].st1);
 tU().click();render();ok('undo gift: one compensating line',S.kid.layan.pts===85&&L('layan')[0].k==='rev'&&L('layan')[0].n===-20&&S.audit[0].k==='rewards.grant.reverse');noT();
 S=fresh();setPersona('delegate');open('grant-points','layan');ok('delegate with the grant key can gift',!!q('.sheet [data-a="gpGo"]'));
 S=fresh();setRole('guardian');setPersona('delegate');open('rewards-admin');ok('guardian: sees wallets, cannot grant, rules are the owner’s',!!q('#scr [data-a="go:wallet-admin:layan"]')&&!q('#scr [data-a="go:grant-points"]')&&!q('#scr [data-a="go:rw-settings"]')&&has(/قواعد المكافآت يضبطها أحمد/));
 // 8-ب الفرق بين النقاط والوقت ظاهر حيث يختار الأب
 S=fresh();open('rewards-admin');ok('give: two choices that explain themselves',ph.querySelectorAll('#scr .rwch button').length===2&&has(/تبقى في المحفظة، وتُصرف وقتاً متى شاء/)&&has(/دقائق الآن لتطبيق واحد، تنتهي عند منتصف الليل/)&&!!q('#scr [data-a="why:rwgive"]'));
 open('why','rwgive');ok('give: the difference in plain words',/ما الفرق بين منح النقاط ومنح الوقت؟/.test(sh())&&/رصيد يدخل محفظة الطفل/.test(sh())&&/تنتهي عند منتصف الليل/.test(sh())&&/طريق المراهق/.test(sh()));
 S=fresh();open('wallet-admin','khaled');ok('give for a teen: time only',ph.querySelectorAll('#scr .rwch button').length===1&&!!q('#scr .rwch [data-a="go:grant-time:khaled"]'));
 S=fresh();open('grant-points','layan');ok('points sheet says what points are and offers the other way',/تدخل محفظة ليان وتبقى فيها/.test(sh())&&!!q('.sheet [data-a="rwSwap:time"]'));
 q('.sheet [data-a="rwSwap:time"]').click();render();ok('switch to time keeps the same child',S.sheet.id==='grant-time'&&S.gt.kid==='layan'&&/لا تدخل المحفظة/.test(sh())&&!!q('.sheet [data-a="rwSwap:points"]'));
 q('.sheet [data-a="rwSwap:points"]').click();render();ok('…and back',S.sheet.id==='grant-points'&&S.gp.kid==='layan');
 S=fresh();open('grant-time','khaled');ok('teen time sheet offers no points',!q('.sheet [data-a="rwSwap:points"]'));
 S=fresh();open('help');ok('help answers the same question',has(/ما الفرق بين منح النقاط ومنح الوقت؟/));
 // 9 منح الوقت
 S=fresh();open('grant-time','layan');
 ok('grant time: kid, limited app, durations within the cap',ph.querySelectorAll('.sheet [data-a^="gtSet:kid:"]').length===2&&ph.querySelectorAll('.sheet [data-a^="gtSet:app:"]').length>=2&&ph.querySelectorAll('.sheet .seg button').length===4);
 ACT.gtSet('n','30');render();q('.sheet [data-a="gtGo"]').click();render();
 ok('time granted: app limit up, cap counted, points untouched',appOf('layan','ytk').lim===75&&S.kid.layan.spent===30&&S.kid.layan.pts===85&&L('layan')[0].k==='time');
 tU().click();render();ok('undo time grant',appOf('layan','ytk').lim===45&&S.kid.layan.spent===0&&L('layan')[0].id==='l6');noT();
 S=fresh();S.kid.layan.spent=40;open('grant-time','layan');ok('grant time: options shrink with the cap',ph.querySelectorAll('.sheet .seg button').length===2);
 S=fresh();S.kid.layan.spent=60;open('grant-time','layan');ok('grant time at the cap: blocked with the way out',!q('.sheet [data-a="gtGo"]')&&/ارفع الحد اليومي/.test(sh()));
 S=fresh();open('grant-time','khaled');ok('teen gets direct time, no points involved',!!q('.sheet [data-a="gtGo"]')&&/امنح خالد/.test(sh()));q('.sheet [data-a="gtGo"]').click();render();ok('teen time grant: cap counted, no ledger line',S.kid.khaled.spent===15&&L('khaled').length===0);noT();
 // 10 لوحة الأب ومحفظة الطفل
 S=fresh();open('rewards-admin');
 ok('admin: one wallet, the teen without one, grant buttons, rules',rows()===2&&ph.querySelectorAll('#scr [data-a^="go:wallet-admin:"]').length===2&&!!q('#scr [data-a="go:wallet-admin:layan"]')&&has(/لا محفظة للمراهقين/)&&!!q('#scr [data-a="go:grant-points"]')&&!!q('#scr [data-a="go:rw-settings"]')&&!!q('#scr [data-a="go:rw-ai"]'));
 REQ();OBJ();render();ok('admin: pending request and objection on top',has(/ينتظر قرارك/)&&!!q('#scr [data-a="go:time-decide:r0"]')&&!!q('#scr [data-a="go:obj-decide:o1"]'));
 S=fresh();open('wallet-admin','layan');ok('wallet (parent): balance as minutes, meter, streak, moves',has(/يكفي 80 دقيقة من الوقت الإضافي/)&&has(/الوقت الإضافي اليوم/)&&!!q('#scr [data-a="go:streak:layan"]')&&ph.querySelectorAll('#scr [data-a^="go:rw-move:layan:"]').length===5&&has(/هدية من أحمد/));
 open('wallet-admin','khaled');ok('teen page: no wallet, grant time only',has(/لا محفظة للمراهقين/)&&!q('#scr [data-a^="go:grant-points"]')&&!!q('#scr [data-a="go:grant-time:khaled"]'));
 S=fresh();open('member','layan');ok('member page links the wallet',!!q('#scr [data-a="go:wallet-admin:layan"]')&&has(/85 نقطة/));
 // 11 إلغاء الإيداع
 S=fresh();open('rw-move','layan','l5');
 ok('owner: reverse a same-day deposit, AI deposit explained',!!q('.sheet [data-a="rwRevAsk:layan:l5"]')&&/أودعها المساعد بتفويضك/.test(sh()));
 q('.sheet [data-a="rwRevAsk:layan:l5"]').click();render();ok('reversal asks first',S.dlg&&/تُخصم 15 نقطة من محفظة ليان/.test(txt()));dlgYes();
 ok('reversed: one compensating line tied to the original',S.kid.layan.pts===70&&L('layan')[0].k==='rev'&&L('layan')[0].of==='l5'&&L('layan').find(e=>e.id==='l5').rev===L('layan')[0].id&&S.audit[0].k==='rewards.grant.reverse');
 ok('reversing the day’s first earning takes the day back',S.kid.layan.streak===4&&RW().day.layan===0);
 const n0=L('layan').length;rwRev('layan','l5','ahmad');ok('a second reversal changes nothing',L('layan').length===n0&&S.kid.layan.pts===70);noT();
 open('rw-move','layan','l5');ok('reversed line: marked, no second button',/أُلغي هذا الإيداع/.test(sh())&&!q('.sheet [data-a^="rwRevAsk"]'));
 S=fresh();open('rw-move','layan','l2');ok('yesterday’s deposit: window closed',!q('.sheet [data-a^="rwRevAsk"]')&&/الإيداع يُلغى في يومه فقط/.test(sh()));
 S=fresh();S.kid.layan.pts=5;rwRev('layan','l5','ahmad');ok('balance never goes below zero',S.kid.layan.pts===0&&L('layan')[0].n===-5);
 S=fresh();S.net='off';open('rw-move','layan','l5');ok('reversal needs a connection',!q('.sheet [data-a^="rwRevAsk"]')&&/إلغاء الإيداع يحتاج اتصالاً/.test(sh()));
 S=fresh();setPersona('delegate');open('rw-move','layan','l5');ok('delegate cannot reverse',!q('.sheet [data-a^="rwRevAsk"]'));
 // 12 الاعتراض
 S=fresh();kid();tab('c-rewards');open('objection');
 ok('objection: lists the decisions that can be contested',!!q('.sheet [data-a="go:objection:d1"]')&&/لم تُعتمد «قراءة 15 دقيقة»/.test(sh()));
 open('objection','d1');ok('objection form: the decision, who, why, quick phrases, short text',/من قرره المساعد/.test(sh())&&/التسجيل مدته 6 دقائق/.test(sh())&&ph.querySelectorAll('.sheet [data-a^="rwObQ:"]').length===3&&q('.sheet #obT').maxLength>0);
 ACT.rwObjGo('d1');ok('empty objection refused',RW().obj.length===0&&/اختاري جملة أو اكتبي ما حدث/.test(T()));noT();
 ACT.rwObQ(0);render();q('#obT').value='قرأت القصة كلها';q('.sheet [data-a="rwObjGo:d1"]').click();render();
 ok('objection sent with phrase and text',RW().obj.length===1&&RW().obj[0].st==='PENDING'&&RW().obj[0].txt==='أنجزتها كما طُلب. قرأت القصة كلها'&&/وصل اعتراضك إلى بابا/.test(T()));noT();
 ok('objection: status shown, cannot send twice',/عند بابا/.test(sh())&&!q('.sheet [data-a^="rwObjGo"]'));
 const oid=RW().obj[0].id;setPersona('owner');tab('home');render();ok('parent home: objection card',has(/ليان تعترض على قرار/)&&!!q(`#scr [data-a="go:obj-decide:${oid}"]`));
 open('obj-decide',oid);ok('objection decision: decision, reason, evidence, the child’s words, effect',/من قرره المساعد/.test(sh())&&/تسجيل صوتي مدته 6 دقائق/.test(sh())&&/قرأت القصة كلها/.test(sh())&&/تُعتمد المهمة وتودَع 10 نقاط في محفظتها/.test(sh()));
 q(`.sheet [data-a="rwObjYes:${oid}"]`).click();render();
 ok('accepted: task credited through the ledger',RW().obj[0].st==='ACCEPTED'&&S.kid.layan.pts===95&&L('layan')[0].k==='task'&&/اعتراض مقبول/.test(L('layan')[0].ev)&&S.audit[0].k==='rewards.objection.decide');noT();
 kid();tab('c-rewards');render();ok('child told the objection was accepted',has(/قبل بابا اعتراضك/)&&has(/دخلت 10 نقاط محفظتك/));
 S=fresh();const o2=OBJ();open('obj-decide','o1');q('.sheet [data-a="rwOdStep:o1"]').click();render();ok('rejecting needs a reason',/سبب الرفض/.test(sh())&&ph.querySelectorAll('.sheet [data-a^="rwOdSet:"]').length>=2);
 ACT.rwObjNo('o1');ok('no reason, no rejection',o2.st==='PENDING'&&/اكتب سبب الرفض/.test(T()));noT();
 ACT.rwOdSet(0);render();q('.sheet [data-a="rwObjNo:o1"]').click();render();ok('rejected with the reason, no points moved',o2.st==='REJECTED'&&!!o2.why&&S.kid.layan.pts===85);noT();
 kid();tab('c-rewards');render();ok('child sees the answer and its reason',has(/ردّ بابا على اعتراضك/)&&has(new RegExp(o2.why)));
 S=fresh();rwRev('layan','l5','ahmad');kid();tab('c-rewards');open('rw-move','layan',L('layan')[0].id);ok('a reversed deposit can be contested from its line',!!q('.sheet [data-a^="go:objection:L"]'));
 const rid='L'+L('layan')[0].id;OBJ({sub:rid});setPersona('owner');ACT.rwObjYes('o1');ok('accepted objection to a reversal returns the points',S.kid.layan.pts===85&&L('layan')[0].k==='back'&&L('layan')[0].n===15);noT();
 S=fresh();OBJ();setPersona('delegate');open('obj-decide','o1');ok('delegate reads the objection, the owner decides',!q('.sheet [data-a^="rwObjYes"]')&&/القرار على الاعتراض لأحمد وحده/.test(sh()));
 S=fresh();OBJ();S.net='off';open('obj-decide','o1');ok('objection decision needs a connection',!q('.sheet [data-a^="rwObjYes"]')&&/يحتاج اتصالاً/.test(sh()));
 S=fresh();kid();S.net='off';tab('c-rewards');open('objection','d1');ACT.rwObQ(1);render();q('.sheet [data-a="rwObjGo:d1"]').click();render();ok('offline objection: saved and queued, not yet on the father’s board',RW().obj[0].q===1&&S.outbox.length===1&&attention().every(a=>a.i!=='balance'));noT();
 S=fresh();ACT.taskReject('t1');ok('a task sent back becomes a contestable decision',RW().dec[0].kid==='layan'&&RW().dec[0].t==='ترتيب الغرفة'&&rwSubs('layan').length===2);noT();
 // 13 السلسلة والتجميد
 S=fresh();RW().day.layan=0;open('streak','layan');
 ok('streak (owner): today not counted yet, freeze available',has(/لم تُعتمد مهمة اليوم بعد/)&&!!q('#scr [data-a="rwFreeze:layan"]')&&has(/0 من 2/));
 q('#scr [data-a="rwFreeze:layan"]').click();render();ok('freeze asks first',S.dlg&&/التجميد 1 من 2/.test(txt()));dlgYes();
 ok('frozen for today',RW().frz.layan.on===1&&RW().frz.layan.n===1&&has(/مجمّدة اليوم/)&&S.audit[0].k==='rewards.streak.freeze');noT();
 rwNextDay();ok('a frozen day does not break the streak',S.kid.layan.streak===5&&RW().frz.layan.on===0);
 rwNextDay();ok('a day with no earning and no freeze breaks it',S.kid.layan.streak===0&&RW().broke.layan===1);
 kid();tab('c-rewards');render();ok('child told gently the streak ended',has(/انقطعت سلسلتك أمس/)&&has(/سلسلتي: لم تبدأ بعد/));
 S=fresh();open('streak','layan');ACT.rwFreeze('layan');ok('no freeze on a day already counted',RW().frz.layan.on===0&&/يوم اليوم محسوب/.test(T()));noT();
 S=fresh();RW().day.layan=0;RW().frz.layan.n=2;open('streak','layan');ok('two freezes per streak at most',!q('#scr [data-a="rwFreeze:layan"]')&&has(/2 من 2/));
 S=fresh();RW().day.layan=0;setPersona('delegate');open('streak','layan');ok('freeze is the owner’s alone',!q('#scr [data-a="rwFreeze:layan"]'));
 S=fresh();kid();tab('c-rewards');open('streak');ok('child streak page: no freeze control, told dad can',!q('#scr [data-a^="rwFreeze"]')&&has(/يستطيع بابا تجميد السلسلة يوماً/));
 // 14 منتصف الليل
 S=fresh();ACT.reqGrant(REQ().id,15);noT();kid();ACT.rdGo('ytk',10);noT();const pts=S.kid.layan.pts;REQ({id:'r9',app:'mc'});rwNextDay();
 ok('midnight: extra time ends, the cap resets',appOf('layan','ytk').lim===45&&S.kid.layan.extra===0&&S.kid.layan.spent===0&&RW().gt.length===0);
 ok('midnight: points stay, unused time is not refunded',S.kid.layan.pts===pts);
 ok('midnight: an unanswered request lapses',S.reqs.find(r=>r.id==='r9').st==='EXPIRED');
 ok('midnight: ledger lines age by a day',L('layan').every(e=>e.d>=1));
 // 15 القواعد
 S=fresh();open('rw-settings');
 ok('rules: cap, rate, midnight, bonus, badges, sources, celebration, constants',has(/الحد اليومي/)&&has(/10 نقاط = 10 دقائق/)&&has(/منتصف الليل بتوقيت العائلة/)&&has(/مكافأة السلسلة/)&&has(/فضية 7 أيام · ذهبية 30 · ماسية 90/)&&has(/من أين تأتي النقاط/)&&has(/شدة الاحتفال/)&&has(/لا نقاط للمراهقين/));
 ok('rules: who assigns and verifies',has(/من يسند ويتحقق/)&&!!q('#scr [data-a="go:family"]')&&!!q('#scr [data-a="go:ai"]')&&has(/يتحقق من الإنجاز ويودِع النقاط بتفويضك/));
 ok('rules: fixed items are locked, editable ones open',!!q('#scr [data-a="go:ctl-edit:cap:layan"]')&&!!q('#scr [data-a="go:rw-edit:bonus"]')&&!!q('#scr [data-a="go:rw-edit:cele"]')&&ph.querySelectorAll('#scr .chip.ol').length>=5);
 q('#scr [data-a="rwSrc:tasks"]').click();render();ok('switching a source off asks first',S.dlg&&/لا تودِع نقاطاً حتى تعيد تشغيله/.test(txt()));dlgYes();ok('source off: said on the row, logged',RW().src.tasks===false&&has(/متوقف: المهام تُعتمد بلا نقاط/)&&S.audit[0].k==='rewards.settings.edit');noT();
 open('rw-edit','bonus');ok('edit bonus: current value, save disabled until changed',/القيمة الآن/.test(sh())&&/50 نقطة/.test(sh())&&dis('.sheet [data-a="rwEdSave"]'));
 ACT.rwEdPick('75');render();ok('edit bonus: effect in a sentence',/75/.test(sh())&&!dis('.sheet [data-a="rwEdSave"]'));q('.sheet [data-a="rwEdSave"]').click();render();
 ok('bonus saved, logged, undoable',RW().bonus===75&&S.audit[0].k==='rewards.settings.edit'&&!!tU());tU().click();render();ok('undo restores the bonus',RW().bonus===50);noT();
 open('rw-edit','cele');ACT.rwEdPick('off');ACT.rwEdSave();noT();ok('celebration set to silent',RW().cele==='off');
 S=fresh();open('ctl-edit','cap','layan');ACT.ctlPick('90');ACT.ctlSave();noT();ok('cap raised to ninety from the control page',S.redeemCap===90&&rwCapLeft('layan')===90);
 S=fresh();S.ctl='adv';tab('control');render();ok('control page lists the rewards rules',!!q('#scr [data-a="go:rw-edit:bonus"]')&&!!q('#scr [data-a="go:rw-edit:cele"]')&&!!q('#scr [data-a="go:rw-settings"]'));
 S=fresh();setPersona('delegate');open('rw-settings');ok('rules are closed to a delegate',has(/قواعد المكافآت لأحمد وحده/)&&!q('#scr [data-a^="go:rw-edit"]'));
 // 16 إيداعات المساعد
 S=fresh();open('rw-ai');ok('AI deposits: listed with their evidence, each opens',rows()>=3&&has(/ليان: حفظ سورة الفلق/)&&has(/التلاوة كاملة بلا توقف/)&&!!q('#scr [data-a="go:rw-move:layan:l5"]')&&has(/ما لم يجزم به يحيله إليك ولا يودِع شيئاً/));
 // 17 المراهق والتجميد عند 13
 S=fresh();kid('teen');open('c-rewards');ok('teen: no wallet, told how extra time works',has(/لا محفظة للمراهقين/)&&has(/والدك/)&&!q('#scr .wallet'));
 open('ask-time','yt');ok('teen asks for time without any points talk',/يصل طلبك إلى والدك وهو يقرر\./.test(sh())&&!/نقاط/.test(sh()));
 open('t-me');ok('teen keeps the objection channel',!!q('#scr [data-a="go:objection"]'));open('objection');ok('teen objection lists his own decisions only',!!q('.sheet [data-a="go:objection:d2"]')&&!q('.sheet [data-a="go:objection:d1"]'));
 S=fresh();OBJ({kid:'khaled',sub:'d2'});ACT.rwObjYes('o1');ok('teen objection accepted: task done, no points',S.kid.khaled.pts===0&&/سُجّلت «إخراج القمامة» منجزة/.test(RW().obj[0].eff));noT();
 S=fresh();S.rev13=1;kid();tab('c-rewards');render();ok('at thirteen: wallet frozen, balance kept',has(/محفظة مجمّدة/)&&has(/رصيدك 85 نقطة محفوظ كما هو/)&&!q('#scr [data-a^="go:redeem"]'));
 ACT.rdGo('ytk',10);ok('frozen wallet cannot be spent by the child',S.kid.layan.pts===85);noT();
 setPersona('owner');ok('frozen wallet earns nothing',rwEarn('layan',{k:'task',n:10,t:'x'})===null&&S.kid.layan.pts===85);
 open('wallet-admin','layan');ok('parent sees the frozen balance and what he can do',has(/رصيد مجمّد/)&&has(/الرصيد لا يُصادَر/)&&!q('#scr [data-a^="go:grant-points"]')&&!!q('#scr [data-a="go:grant-time:layan"]'));
 open('grant-time','layan');ok('frozen balance can pay for granted time',!!q('.sheet [data-a="gtSet:fz:1"]'));ACT.gtSet('fz','1');ACT.gtSet('n','10');ACT.gtGo();ok('paid from the frozen balance',S.kid.layan.pts===75&&S.kid.layan.spent===10);noT();
 // 18 الطفل الصغير
 S=fresh();ok('no separate stars screen for small children (Q-426)',!SC['m-stars']&&!ACT.rwMini);
 // 19 دون اتصال
 S=fresh();S.net='off';kid();tab('c-rewards');render();ok('offline wallet: balance still readable, said plainly',has(/دون اتصال/)&&has(/رصيدك المحفوظ على جهازك/)&&q('#scr .wallet .big').textContent.trim().startsWith('85'));
 S=fresh();S.net='off';open('grant-points','layan');ACT.gpGo();ok('offline gift: queued and marked',S.outbox.length===1&&/عند الاتصال/.test(T()));noT();
 // 20 الأهداف والروابط
 S=fresh();kid();tab('c-rewards');render();ok('touch targets at least 48',[...ph.querySelectorAll('#scr button')].filter(b=>b.offsetParent&&!b.closest('.sec')).every(b=>b.getBoundingClientRect().height>=48));
 ok('every rewards link leads to a surface',RWS.every(id=>{try{S=fresh();jump(id);render();return [...ph.querySelectorAll('[data-a^="go:"]')].every(e=>!!SC[e.dataset.a.split(':')[1]])}catch(e){return false}}));
 }catch(e){F.push('CRASH after check #'+N+': '+e.message)}
 // كل أسطح S1-05: لا تجاوز أفقي + لا كلام مهندسين + لا معرّفات
 const over=[],eng=[];const ids=Object.keys(SC).filter(k=>SC[k].sys==='S1-05');const BAD=/[a-z]+\.[a-z_]+\.[a-z_]+|ALLOW|BLOCK|LIMIT|ALERT|IGNORE|Accessibility|DeviceAdmin|VPN|MQTT|Outbox|bitmask|is[A-Z]\w+|step-up|Parent Gate|PIN|نبضة|الرتيبة|القناع|مزامَن|الفرض|ذرّي|نطاق|undefined|null|NaN/;
 for(const id of ids){for(const pre of [null,'guardian','none','co','ios','off']){try{S=fresh();if(pre==='co')S.co={since:'اليوم',seen:0};else if(pre==='ios')S.os='ios';else if(pre==='off')S.net='off';else if(pre)setRole(pre);jump(id);render();const sc=document.getElementById('scr');if(sc&&sc.scrollWidth>sc.clientWidth+1)over.push(id);const sh=ph.querySelector('.sheet');if(sh&&sh.scrollWidth>sh.clientWidth+1)over.push(id+':sheet');
   const m=txt().replace(/SOS/g,'').replace(/[a-z0-9-]+\.(org|com)/g,'').match(BAD);if(m)eng.push(id+(pre?'/'+pre:'')+':'+m[0]);}catch(e){F.push('ERR '+id+' '+(pre||'')+' '+e.message)}}}
 R.over=[...new Set(over)];R.eng=[...new Set(eng)];R.n=ids.length;R.ids=ids.join(' ');R.checks=N;R.fail=F;return R;});
R.errs=errs;}catch(e){R.crash=String(e.stack||e).slice(0,900)}finally{await b.close()}
console.log(JSON.stringify(R,null,1));})();
