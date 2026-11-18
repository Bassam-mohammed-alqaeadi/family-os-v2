// اختبار مسارات S1-02 (الهوية والتهيئة) في النموذج: مسارات التسجيل بالهاتف وبالبريد والاسترداد والإدارة + فحص كل سطح بلغتين.
// يحتاج puppeteer-core و@sparticuz/chromium (غير مضمَّنين في المستودع):  NODE_PATH=<node_modules> node tools/test-s1-02.cjs
// النجاح: fail=[] و over=[] و eng=[] و errs=[].
const puppeteer=require('puppeteer-core');let chromium=require('@sparticuz/chromium');chromium=chromium.default||chromium;
const root=require('path').join(__dirname,'..');
(async()=>{const args=[...chromium.args.filter(a=>!/in-process-gpu|use-gl|use-angle|swiftshader|ignore-gpu/.test(a)),'--disable-gpu','--allow-file-access-from-files'];
const b=await puppeteer.launch({args,executablePath:await chromium.executablePath(),headless:'shell'});let R={};
try{const page=await b.newPage();await page.setViewport({width:1500,height:1000});const errs=[];page.on('pageerror',e=>errs.push(String(e)));page.on('console',m=>{if(m.type()==='warning'||m.type()==='error')errs.push('console:'+m.text())});
await page.goto('file://'+root+'/index.html?quiet=1');await page.evaluate(()=>document.fonts.ready);await new Promise(r=>setTimeout(r,1700));
R=await page.evaluate(()=>{const R={},F=[];const ph=document.getElementById('phone');let N=0;const ok=(n,c,x)=>{N++;if(!c)F.push(n+(x!==undefined?' → '+JSON.stringify(x):''))};
 const txt=()=>ph.innerText.replace(/\s+/g,' ');const top=()=>S.full?S.full.id:S.sheet?S.sheet.id:S.stack[S.stack.length-1].id;
 const pin=()=>{for(const k of '482615')ACT.pinK(k);render()};const otp=c=>{for(const k of c)ACT.otpK(k);render()};
 const guest=()=>{S=fresh();setPersona('guest');S.ob={};render()};
 // 1 الترحيب والرقم
 guest();ok('welcome: create, join, child device, sign in',['obStart:new','obStart:join','go:ob-pair','obStart:'].every(a=>!!ph.querySelector('[data-a="'+a+'"]'))&&ph.querySelectorAll('.btn').length===4,ph.querySelectorAll('.btn').length);
 ACT.obStart('');render();ok('to phone',top()==='ob-phone');ok('phone and email equal',ph.querySelectorAll('.seg button').length===2&&ph.querySelector('.seg [aria-pressed="true"]').dataset.a==='obWay:phone');
 ACT.obWay('email');render();ok('switch to email',top()==='ob-email'&&S.stack.length===2&&ph.querySelector('.seg [aria-pressed="true"]').dataset.a==='obWay:email');ACT.obWay('phone');render();ok('switch back',top()==='ob-phone'&&S.stack.length===2);document.getElementById('obP').value='٧٧١٢٣';ACT.obPhone();render();ok('short number err',S.ob.err===1&&top()==='ob-phone');
 document.getElementById('obP').value='٠٧٧١٢٣٤٥٦٧';ACT.obPhone();render();ok('arabic digits accepted',top()==='ob-otp'&&S.ob.phone==='771234567',S.ob.phone);
 ok('otp never shown',!/246810/.test(txt()));
 // 2 قفل
 for(let i=0;i<5;i++)otp('111111');ok('lock after 5',S.ob.lock===1);ok('lock hides resend',!ph.querySelector('[data-a="otpNext"]')&&!ph.querySelector('.pad'));
 S.ob.lock=0;S.ob.bad=0;render();ACT.otpNext();ACT.otpNext();render();ok('3rd channel',/مكالمة فائتة/.test(txt()));ACT.otpNext();render();ok('all channels failed state',S.ob.fail===1&&/لم نستطع إيصال الرمز/.test(txt())&&!!ph.querySelector('[data-a="go:ob-email"]'));
 ACT.otpRetry();render();otp('246810');ok('new number → choose',top()==='ob-choose',top());
 ACT.back();render();
 // 2-ب التسجيل بالبريد: طريق مساوٍ بلا رقم هاتف
 guest();ACT.obStart('new');render();ACT.obWay('email');render();document.getElementById('obE').value='not-an-email';ACT.obEmail();render();ok('bad email',S.ob.eerr===1&&top()==='ob-email');
 document.getElementById('obE').value='sara@example.com';ACT.obEmail();render();ok('email sent state',S.ob.em==='sent'&&/افتح بريدك/.test(txt()));ACT.emOpen();render();ok('email new → family, no phone asked',top()==='ob-family'&&!S.ob.phone&&S.ob.via==='email',[top(),S.ob.phone]);
 ok('country from phone settings when email',/من إعداد هاتفك/.test(txt()));
 guest();ACT.obStart('join');render();ACT.obWay('email');render();document.getElementById('obE').value='sara@example.com';ACT.obEmail();ACT.emOpen();render();ok('email join → invite',top()==='ob-join');
 guest();ACT.obStart('');render();ACT.obWay('email');render();document.getElementById('obE').value='ahmad@example.com';ACT.obEmail();ACT.emOpen();render();ok('email existing → home',S.persona==='owner'&&top()==='home');
 guest();ACT.obStart('');render();ACT.obWay('email');render();document.getElementById('obE').value='x@down.test';ACT.obEmail();render();ok('email service down',S.ob.em==='down');ACT.emPhone();render();ok('down → phone',top()==='ob-phone'&&S.stack.length===2);
 guest();ACT.obStart('new');render();document.getElementById('obP').value='771234567';ACT.obPhone();render();otp('246810');ok('create flow skips choose',top()==='ob-family',top());
 // 3 رقم له حساب
 guest();ACT.obStart('');render();document.getElementById('obP').value='777000111';ACT.obPhone();render();otp('246810');ok('existing → home',S.persona==='owner'&&top()==='home',[S.persona,top()]);
 // 4 العائلة
 guest();go('ob-family');render();ok('family one text field',ph.querySelectorAll('input').length===1);ok('tz default device',/صنعاء/.test(txt()));
 document.getElementById('obF').value='عائلة التجربة';ACT.obPick('open','reg');render();ok('7 regions',ph.querySelectorAll('.row').length===7,ph.querySelectorAll('.row').length);ACT.obPick('reg','AE');render();
 ok('region change keeps tz + name',/الإمارات/.test(txt())&&/صنعاء/.test(txt())&&document.getElementById('obF').value==='عائلة التجربة',txt().slice(0,200));
 ACT.obPick('open','tz');render();ACT.obPick('tz','دبي');render();ok('tz picked',/دبي/.test(txt()));
 document.getElementById('obF').value='';ACT.obFam();render();ok('empty name blocked',top()==='ob-family');document.getElementById('obF').value='المنصور';ACT.obFam();render();ok('family → done',top()==='ob-done');
 ACT.obEnter();render();ok('enter → owner',S.persona==='owner');
 // 5 الانضمام
 guest();S.ob={flow:'join'};go('ob-join');render();document.getElementById('obJ').value='XXXX-0000';ACT.obJoin();render();ok('bad invite',S.ob.jerr===1&&!/المنصور/.test(txt()));
 document.getElementById('obJ').value='mnsr-7k2p';ACT.obJoin();render();ok('invite ok shows family',S.ob.jok===1&&/عائلة المنصور تدعوك/.test(txt()));const al=S.alerts.length;ACT.obJoinGo();render();ok('joined as delegate w/ alert',S.persona==='delegate'&&S.alerts.length===al+1&&S.tpl==='none');
 // 6 الإقران والموافقة
 guest();go('ob-pair');render();ok('pair one field',ph.querySelectorAll('input').length===1);document.getElementById('obC').value='OTHER1';ACT.obPair();render();ok('other family state',/عائلة أخرى/.test(txt()));ACT.pairBack();render();
 document.getElementById('obC').value='ZZZZZZ';ACT.obPair();render();ok('wrong code',S.ob.perr===1);document.getElementById('obC').value='ly4n82';ACT.obPair();render();ok('to consent',top()==='ob-consent');
 ok('consent btn disabled',ph.querySelector('[data-a="consGo"]').disabled);ACT.consT('k');ACT.consT('p');render();ok('consent enabled',!ph.querySelector('[data-a="consGo"]').disabled);
 ACT.consT('no');render();ok('not now state',/لم يكتمل الإقران/.test(txt()));ACT.consLater();render();ok('later → welcome unpaired',S.persona==='guest'&&top()==='ob-welcome');
 // 7 الاسترداد
 guest();go('ob-phone');go('ob-recover');render();document.getElementById('obRo').value='771234567';document.getElementById('obRn').value='771234567';ACT.recAsk();render();ok('same numbers rejected',S.ob.rerr===1);
 document.getElementById('obRo').value='771234567';document.getElementById('obRn').value='733555019';ACT.recAsk();render();ok('recover → otp',top()==='ob-otp');otp('246810');ok('recover wait pending',top()==='recover-wait'&&S.recReq.st==='pending'&&!/سارة/.test(txt()),top());
 ACT.recDemo();render();ok('waiting 7 days',/بقي 7 أيام|بقي ٧ أيام/.test(txt()));
 setPersona('delegate');S.recReq={st:'pending',kind:'num'};go('recover-review');render();ok('contact sees confirm/refuse',!!ph.querySelector('[data-a="recConfirm"]')&&!!ph.querySelector('[data-a="recRefuse"]'));ACT.recConfirm();ACT.dlgYes();render();ok('confirmed → waiting',S.recReq.st==='waiting'&&S.recReq.kind==='num');
 setPersona('owner');go('recover-review');render();ok('owner can stop',!!ph.querySelector('[data-a="recObject"]'));ACT.recObject();ACT.dlgYes();render();ok('objection cancels',S.recReq.st==='cancelled'&&/أُلغي الطلب/.test(txt()));
 guest();S.ob={old:'770000000'};go('ob-recover');render();document.getElementById('obRo').value='770000000';document.getElementById('obRn').value='733555019';ACT.recAsk();render();otp('246810');ok('no contact honest',/لا نستطيع استرداد/.test(txt()));
 // 8 الأمان
 S=fresh();go('security');render();ok('bio off by default',S.bio===false&&ph.querySelector('[data-a="bioT"]').getAttribute('aria-checked')==='false');ok('no engineer words',!/TOTP|مفتاح توقيع|العتاد/.test(txt()),txt().slice(0,300));
 ACT.bioT();render();ok('bio needs pin',top()==='pin'&&!S.bio);pin();ok('bio on after pin',S.bio===true);
 S.bioChg=1;go('rekey');render();ACT.rekeyGo();render();pin();ok('rekey clears',S.bioChg===0);
 S=fresh();go('sessions');render();ACT.sessEnd(1);render();ok('session end confirm',!!S.dlg);ACT.dlgYes();render();ok('session removed',S.sess.length===1&&/لا جهاز آخر/.test(txt()));
 S=fresh();go('sessions');ACT.sessAll();render();ok('revoke all needs pin',top()==='pin');pin();ok('revoke all done',S.sess.length===1);
 S=fresh();S.full={id:'bio-unlock',a:[]};render();ACT.bioBad();ACT.bioBad();render();ok('2 fails',/محاولة/.test(txt()));ACT.bioBad();render();ok('3 fails → pin',top()==='pin');
 // 9 الاسترداد: اختيار الجهة
 S=fresh();go('recovery');render();ok('contact listed',/سارة/.test(txt())&&/اختيارك/.test(txt()));ACT.recPick('');render();pin();ok('contact removed warns',S.rec===null&&/لم تختر أحداً/.test(txt()));
 S=fresh();S.rec=null;go('pin-forgot');render();ok('pin forgot w/o contact honest',/لم تختر من يساعدك/.test(txt()));S.rec='sara';render();ACT.pfAsk();render();ok('pin forgot request',S.recReq.kind==='pin'&&/بانتظار تأكيد سارة/.test(txt()));
 // 10 التصدير والحذف والمغادرة
 S=fresh();go('export');render();ok('export no JSON word',!/JSON/i.test(txt()));ACT.expAsk('me');render();ok('export prep',/نجهّز/.test(txt()));ACT.expReady('me');render();ok('export ready',/النسخة جاهزة/.test(txt()));
 S=fresh();go('export','layan');render();ok('minor export owner',/بيانات ليان|نجمع/.test(txt()));setPersona('delegate');go('export','layan');render();ok('minor export delegate denied',/للأب فقط/.test(txt()));
 S=fresh();go('delete-account');render();ok('owner must transfer',!ph.querySelector('[data-a="delGo"]')&&!!ph.querySelector('[data-a="go:transfer"]'));
 S=fresh();setPersona('delegate');go('delete-account');render();ok('no owner-disabled state',!/معطَّل|اطلب من الأب/.test(txt()));ACT.delGo();ACT.dlgYes();render();ok('delete needs pin',top()==='pin');pin();ok('delete pending',S.delP===30&&/يُحذف بعد/.test(txt()));ACT.delUndo();render();ok('delete undone',!S.delP);
 S=fresh();setPersona('delegate');go('leave-family');render();ok('leave warns trusted contact',/اختارها أحمد/.test(txt()));ACT.leaveFam();ACT.dlgYes();render();ok('left → guest, contact cleared',S.persona==='guest'&&S.rec===null);
 S=fresh();go('leave-family');render();ok('owner cannot leave',/المالك لا يغادر/.test(txt())&&!ph.querySelector('[data-a="leaveFam"]'));
 // 11 الفك
 S=fresh();go('unpair','layan');render();ok('unpair explains',/ماذا يحدث بعد الفك/.test(txt()));ACT.unpairGo('layan');render();ok('unpair needs pin',top()==='pin');pin();ok('unpaired',S.unp.layan===1&&/فُكّ الإقران/.test(txt()));
 ACT.back();go('device','layan');render();ok('device empty after unpair',/لا جهاز مقترن/.test(txt()));
 setPersona('delegate');go('unpair','layan');render();ok('unpair owner only',/للأب فقط/.test(txt()));
 // 12 الدعوات
 S=fresh();go('invite');render();ok('invite msg has link+code',/https:\/\//.test(txt())&&/MNSR-7K2P/.test(txt()));ACT.invNew();render();ok('2 invites',S.invs.length===2&&S.invs[0].c!=='MNSR-7K2P'&&/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(S.invs[0].c),S.invs[0].c);ACT.invRevoke(0);ACT.dlgYes();render();ok('revoke one keeps other',S.invs.length===1&&S.invs[0].c==='MNSR-7K2P');
 ACT.invRevoke(0);ACT.dlgYes();render();ok('no invites empty',/لا دعوات معلقة/.test(txt()));
 // 13 ملف الطفل
 S=fresh();S.plan='basic';go('child-new');render();ok('child fields: 1 input only',ph.querySelectorAll('input').length===1&&!/بريد|هاتف/.test(txt()));ok('no template jargon',!/minimal|standard|القالب/.test(txt()),txt().slice(0,200));
 ACT.cnGo();render();ok('child name required',top()==='child-new');
 S=fresh();const by=M.layan.by;go('child-new','layan');render();ACT.cnSet('y','2012');render();ok('age change warned',/بعد الحفظ تتغير شاشة/.test(txt()));ACT.cnGo();render();ok('child saved',M.layan.by===2012);M.layan.by=by;
 S=fresh();go('child-profile','khaled');render();ok('turning 18 row',!!ph.querySelector('[data-a="go:age-up:khaled"]'));
 S=fresh();S.pcSt='exp';go('pair-code','layan');render();ok('code expired state',/انتهى وقت الرمز/.test(txt()));S.pin.set=false;S.pcSt='live';render();ok('code hidden w/o pin',!/LY4N82/.test(txt()));
 // 13-ب مفتاح الدولة (REQ-001)
 guest();ACT.obStart('');render();ok('country key: opens a list',!!ph.querySelector('[data-a="ccT"]'));ACT.ccT();render();ok('country key: sheet with Yemen and the Gulf first',top()==='cc-pick'&&ph.querySelectorAll('.sheet [data-a^="ccSet:"]').length===13&&ph.querySelector('.sheet [data-a^="ccSet:"]').dataset.a==='ccSet:YE');
 ACT.ccSet('SA');render();ok('country key: chosen key shown',!S.sheet&&S.ob.cc==='SA'&&/\+966/.test(txt()));document.getElementById('obP').value='771234567';ACT.obPhone();render();ok('country key: number checked per country',S.ob.err===1&&top()==='ob-phone');
 document.getElementById('obP').value='501234567';ACT.obPhone();render();ok('country key: valid Saudi number goes on',top()==='ob-otp');
 // 13-ج صيغ الموافقة الثلاث (REQ-017)
 guest();go('ob-pair');render();document.getElementById('obC').value='kh4l37';ACT.obPair();render();ok('consent teen: what the father knows and does not, plus rights',top()==='ob-consent'&&S.ob.kid==='khaled'&&/نتفق معاً يا خالد/.test(txt())&&/لا يعرف ما تفعله داخله/.test(txt())&&/ولك دائماً/.test(txt())&&ph.querySelector('[data-a="consGo"]').disabled);
 ACT.consT('k');ACT.consT('p');render();ok('consent teen: both confirm',!ph.querySelector('[data-a="consGo"]').disabled&&!!ph.querySelector('[data-a="consT:no"]'));
 /* Q-426: لا قالب لمن هم دون 7؛ يُقبلون بقالب الطفل. */
 guest();S.ob={cons:{},kid:'yusuf'};go('ob-consent');render();ok('consent for a child under 7: the child wording, no picture variant',!ph.querySelector('.tile')&&!/بابا يشرح/.test(txt())&&!!ph.querySelector('[data-a="consT:k"]')&&!!ph.querySelector('[data-a="consT:no"]')&&ph.querySelector('[data-a="consGo"]').disabled);
 ok('a birth year under 7 gives the child template',tplOf(2021)[1]==='واجهة الأطفال'&&tplOf(2021)[1]===tplOf(2016)[1]&&tplOf(2012)[1]==='واجهة المراهقين');
 ok('no under-7 persona, tab set or member flag is left',!PERSONA.mini&&!TABS.mini&&!M.yusuf.mini&&!OB_PAIR.YS4F51);
 ACT.consT('no');render();ok('consent under 7: not now, no blame',/لم يكتمل الإقران/.test(txt())&&/الجهاز لم يُقرن/.test(txt()));
 guest();go('ob-pair');render();document.getElementById('obC').value='LY4N82';ACT.obPair();render();ok('consent child: Layan wording kept',S.ob.kid==='layan'&&/نتفق معاً يا ليان/.test(txt())&&/أنا ليان، فهمت/.test(txt()));
 // 13-د بريد للدخول يُضاف لاحقاً (REQ-029)
 S=fresh();go('account');render();ok('account: add-email row',!!ph.querySelector('#scr [data-a="go:login-add"]'));go('login-add');render();ok('login email: form',top()==='login-add'&&!!document.getElementById('em2'));
 document.getElementById('em2').value='nope';ACT.em2Send();render();ok('login email: bad address',S.em2F.e==='bad'&&!S.em2);document.getElementById('em2').value='sara@example.com';ACT.em2Send();render();ok('login email: another account refused',S.em2F.e==='used'&&!S.em2&&/لحساب آخر/.test(txt()));
 document.getElementById('em2').value='a@down.test';ACT.em2Send();render();ok('login email: service down says the phone still works',S.em2F.e==='down'&&/دخولك برقمك يعمل/.test(txt()));
 document.getElementById('em2').value='Ahmad.New@Example.com';ACT.em2Send();render();ok('login email: PIN before sending',!S.em2&&!!ph.querySelector('.pad'));const a0=S.audit.length;pin();ok('login email: sent, not yet added',S.em2&&S.em2.st==='sent'&&S.em2.a==='ahmad.new@example.com'&&S.audit.length===a0+1,S.em2);
 S.sheet=null;go('account');render();ok('account: says waiting for the link',/بانتظار|ينتظر/.test(txt()),txt().slice(0,300));go('login-add');render();ok('login email: sent state',/افتح بريدك/.test(txt())&&!!ph.querySelector('[data-a="em2Open"]')&&!!ph.querySelector('[data-a="em2Cancel"]'));
 ACT.em2Open();render();ok('login email: added only after the link',S.em2.st==='ok'&&S.audit.length===a0+2&&/مؤكَّد/.test(txt()));ACT.em2Rm();render();ok('login email: removal asks PIN',!!ph.querySelector('.pad')&&!!S.em2);pin();ok('login email: removed, phone stays',!S.em2&&S.audit.length===a0+3);
 S=fresh();go('login-add');render();document.getElementById('em2').value='x@example.com';ACT.em2Send();render();pin();ACT.em2Cancel();render();ok('login email: cancel leaves nothing',!S.em2&&!S.sheet);
 S=fresh();S.net='off';go('login-add');render();ok('login email: offline cannot send',ph.querySelector('[data-a="em2Send"]').disabled&&/غير متصل/.test(txt()));
 // 13-د2 الاتجاه الآخر: من سجّل ببريده يضيف رقماً (REQ-029)
 S=fresh();setPersona('delegate');go('account');render();ok('phone login: email-registered adult sees add-phone row',!!ph.querySelector('#scr [data-a="go:login-add:phone"]')&&!ph.querySelector('#scr [data-a="go:login-add"]')&&/s•••@example\.com/.test(txt()));
 go('login-add','phone');render();ok('phone login: form',top()==='login-add'&&!!document.getElementById('ph2'));
 document.getElementById('ph2').value='123';ACT.ph2Send();render();ok('phone login: bad number',S.ph2F.e==='bad'&&!S.ph2);document.getElementById('ph2').value='777000111';ACT.ph2Send();render();ok('phone login: another account refused',S.ph2F.e==='used'&&!S.ph2&&/لحساب آخر/.test(txt()));
 document.getElementById('ph2').value='770000000';ACT.ph2Send();render();ok('phone login: delivery down says email still works',S.ph2F.e==='down'&&/الدخول بالبريد يعمل/.test(txt()));
 {document.getElementById('ph2').value='٠٧٧١٢٣٤٥٦٧';ACT.ph2Send();render();ok('phone login: PIN before sending',!S.ph2&&!!ph.querySelector('.pad'));const a0=S.audit.length;pin();ok('phone login: code asked, not yet added',S.ph2&&S.ph2.st==='code'&&S.ph2.a==='771234567'&&S.audit.length===a0+1&&top()==='login-add'&&!!document.getElementById('ph2c'),top());
 S.sheet=null;go('account');render();ok('phone login: account says waiting for the code',/بانتظار الرمز/.test(txt()));go('login-add','phone');render();
 document.getElementById('ph2c').value='111111';ACT.ph2Ok();render();ok('phone login: wrong code counts down',S.ph2.st==='code'&&S.ph2.bad===1&&/بقيت 4 محاولات/.test(txt()));
 document.getElementById('ph2c').value='246810';ACT.ph2Ok();render();ok('phone login: added only after the code',S.ph2.st==='ok'&&S.audit.length===a0+2&&/مؤكَّد/.test(txt()));
 ACT.ph2Rm();render();ok('phone login: removal asks PIN',!!ph.querySelector('.pad')&&!!S.ph2);pin();ok('phone login: removed, email stays',!S.ph2&&S.audit.length===a0+3);}
 S=fresh();setPersona('delegate');S.ph2={a:'771234567',st:'code',bad:4};go('login-add','phone');render();document.getElementById('ph2c').value='000000';ACT.ph2Ok();render();ok('phone login: five wrong codes lock',S.ph2.bad===5&&/15 دقيقة/.test(txt())&&!document.getElementById('ph2c'));ACT.ph2Cancel();render();ok('phone login: cancel leaves nothing',!S.ph2&&!S.sheet);
 S=fresh();setPersona('delegate');S.net='off';go('login-add','phone');render();ok('phone login: offline cannot send',ph.querySelector('[data-a="ph2Send"]').disabled&&/غير متصل/.test(txt()));
 S=fresh();go('account');render();ok('phone login: phone-registered owner keeps add-email row',!!ph.querySelector('#scr [data-a="go:login-add"]')&&!ph.querySelector('#scr [data-a="go:login-add:phone"]'));
 // 13-هـ تعديل العائلة بعد إنشائها (REQ-030)
 S=fresh();go('family-settings');render();ok('family: three editable rows for the owner',['name','reg','tz'].every(k=>!!ph.querySelector('#scr [data-a="famEdit:'+k+'"]')));
 ACT.famEdit('name');render();document.getElementById('fmN').value='ا';ACT.famSave('name');render();ok('family name: too short',S.fmF.e===1&&top()==='fam-edit');const a1=S.audit.length;document.getElementById('fmN').value='  عائلة   الصالح ';ACT.famSave('name');render();
 ok('family name: saved at once, logged',S.famName==='عائلة الصالح'&&!S.sheet&&S.audit.length===a1+1&&/عائلة الصالح/.test(txt()));ph.querySelector('.toast button').click();render();ok('family name: undo',famN()==='عائلة المنصور');
 S=fresh();S.famName='عائلة الصالح';go('family-delete');render();ok('family name: delete screen asks for the new name',/عائلة الصالح/.test(txt())&&!/عائلة المنصور/.test(txt()));
 S=fresh();go('family-settings');ACT.famEdit('reg');render();ok('family country: save disabled until changed',ph.querySelector('[data-a="famSave:reg"]').disabled);ACT.famPick('reg','SA');render();ok('family country: says what changes and what does not',/اشتراكك الحالي يبقى/.test(txt())&&!ph.querySelector('[data-a="famSave:reg"]').disabled);
 const tz0=S.tz;ACT.famSave('reg');render();ok('family country: PIN',S.reg==='YE'&&!!ph.querySelector('.pad'));pin();ok('family country: changed, time zone untouched',S.reg==='SA'&&S.tz===tz0&&/غُيّر بلد العائلة/.test(S.audit[0].t));
 S=fresh();go('family-settings');ACT.famEdit('tz');ACT.famPick('tz','دبي');render();ok('family time zone: applies to all children',/عند كل الأبناء/.test(txt()));ACT.famSave('tz');render();pin();ok('family time zone: changed by PIN, country untouched',S.tz==='دبي'&&S.reg==='YE');
 S=fresh();S.net='off';go('family-settings');ACT.famEdit('reg');ACT.famPick('reg','SA');render();ok('family edit: needs connection',ph.querySelector('[data-a="famSave:reg"]').disabled);
 S=fresh();setPersona('delegate');go('family-settings');render();ok('family: delegate cannot edit',!ph.querySelector('#scr [data-a^="famEdit:"]'));
 // 14 كل أسطح S1-02: إنجليزي + لا تجاوز أفقي + لا كلام مهندسين
 const over=[],eng=[];for(const id of Object.keys(SC).filter(k=>SC[k].sys==='S1-02')){for(const lang of ['ar','en']){try{S=fresh();jump(id);S.lang=lang;render();const sc=document.getElementById('scr');if(sc&&sc.scrollWidth>sc.clientWidth+1)over.push(id+':'+lang);
   if(lang==='ar'&&/TOTP|HMAC|JSON|IANA|mTLS|MQTT|مفتاح التوقيع|مفتاح توقيع|العتاد|E\.164|Firebase/.test(txt()))eng.push(id);}catch(e){F.push('ERR '+id+' '+lang+' '+e.message)}}}
 R.over=over;R.eng=eng;R.checks=N;R.n=Object.keys(SC).filter(k=>SC[k].sys==='S1-02').length;R.fail=F;return R;});
R.errs=errs;}catch(e){R.crash=String(e)}finally{await b.close()}
console.log(JSON.stringify(R,null,1));})();
