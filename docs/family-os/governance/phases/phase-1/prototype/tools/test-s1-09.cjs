// اختبار مسارات S1-09 (مركز التحكم والإعدادات) في النموذج: حالات اللوحة، بطاقة الانتباه، التنبيهات وتفصيلها وتأكيد القراءة،
// العرض السريع والمتقدم، صفحة الخدمة وإخفاؤها، تعديل إعداد، مركز الإعدادات والبحث الشامل، سجل أفعال المساعد وتفصيله وما يراه الطفل.
// يحتاج puppeteer-core و@sparticuz/chromium (غير مضمَّنين في المستودع):  NODE_PATH=<node_modules> node tools/test-s1-09.cjs
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
 const HUB=['home','alerts','alert','control','svc','ctl-edit','more','registry','ai','ai-act','ai-mine','why'];
 // 1 التسجيل والبذرة
 S=fresh();ok('seed: all S1-09 surfaces registered',HUB.every(k=>SC[k]&&SC[k].sys==='S1-09'),HUB.filter(k=>!SC[k]));
 ok('seed: six services, sixteen controls',SVC.length===6&&CTL.length===16);
 ok('seed: every S1-09 REQ 1..18 cited by a surface',Array.from({length:18},(_,i)=>i+1).every(n=>Object.values(SC).some(d=>new RegExp('(^| )09:[0-9,]*\\b'+n+'\\b').test(d.req||''))),Array.from({length:18},(_,i)=>i+1).filter(n=>!Object.values(SC).some(d=>new RegExp('(^| )09:[0-9,]*\\b'+n+'\\b').test(d.req||''))));
 // 2 اللوحة: الوضع العادي والحالات الثلاث
 S=fresh();tab('home');render();ok('home: attention cards + modes + map + screen time',ph.querySelectorAll('#scr .att').length===3&&!!q('[data-a="go:presets:study"]')&&!!q('[data-a="go:map"]')&&has(/وقت الشاشة اليوم/));
 ok('home: priority shown in words, not P1',!/\bP[0-4]\b/.test(txt())&&has(/عاجل/));
 S.hub='empty';render();ok('home empty: add-a-child message, no child orbs, SOS stays',has(/أضف طفلاً من الإعدادات لتبدأ/)&&!q('#scr .orb[data-a^="go:member"]')&&!!q('#scr .sos')&&!q('#scr .att'));
 S.hub='nosnap';render();ok('home no snapshot: says so, shows no data, SOS stays',has(/لا بيانات بعد/)&&has(/اتصل بالإنترنت مرة واحدة/)&&!q('#scr .pulse')&&!!q('#scr .sos')&&!has(/وقت الشاشة اليوم/));
 S.hub='bad';render();ok('home corrupt snapshot: no trusted data, nothing stale shown',has(/لا بيانات موثوقة/)&&!q('#scr .pulse')&&!has(/أين العائلة الآن/));
 S.net='off';ACT.hubRetry();render();ok('…retry offline keeps the state',S.hub==='bad');S.net='on';ACT.hubRetry();render();ok('…retry online restores the board',S.hub===''&&has(/وقت الشاشة اليوم/));
 S=fresh();S.net='off';tab('home');render();ok('home offline: last state with explicit age',has(/آخر تحديث/)&&has(/غير متصل/));
 S=fresh();setPersona('delegate');setRole('none');render();ok('adult with no grants: lands on family, no board tab',top()==='family');tab('home');render();ok('…and asking for the board still lands on family',top()==='family'&&!q('#scr .att')&&!q('#scr .pulse'));
 S=fresh();setPersona('delegate');setRole('observer');render();ok('observer: decisions she cannot take are absent',ph.querySelectorAll('#scr .att').length===attention().length&&!q('[data-a^="taskOk"]')===!can('tasks.approve'));
 // 3 التنبيهات
 S=fresh();open('alerts');ok('alerts: first tab = decision cards',ph.querySelectorAll('#scr .att').length===attention().length&&attention().length>0);
 ACT.set('alV','log');render();const all=allAlerts();ok('alerts log: one row per alert, newest state kept',rows()===all.length&&all.length>=4,[rows(),all.length]);
 ACT.flip('alUn');render();ok('alerts log: unread only',rows()===all.filter(a=>a.open).length);ACT.flip('alUn');
 ACT.alK('sos');render();ok('alerts log: filter by kind + late mark',rows()===1&&has(/وصل متأخراً/));ACT.alK('all');
 open('alert','a4');ok('late SOS: original time + late callout + already read',has(/9 نوفمبر 1:20 م/)&&has(/وقت الإرسال، لا وقت الوصول/)&&has(/قُرئ/)&&!q('[data-a^="alertAck"]'));
 ok('…and it opens its service',!!q('.btn[data-a="go:map"]'));
 S=fresh();open('alerts');open('alert','a2');ok('alert detail: unread + open service + acknowledge',has(/لم يُقرأ/)&&!!q('.btn[data-a="go:chat-flag:dm-khaled-layan:0"]')&&!!q('.btn[data-a="alertAck:a2"]'));
 const n0=attention().length;ACT.alertAck('a2');render();ok('acknowledge: closes, goes back, leaves the attention list',S.alerts.find(a=>a.id==='a2').open===0&&top()==='alerts'&&attention().length===n0-1);
 S=fresh();S.net='off';open('alert','a2');ACT.alertAck('a2');ok('acknowledge offline → waits in the outbox',S.outbox.length===1&&S.outbox[0].sys==='S1-09');
 S=fresh();S.sos={from:'layan',st:'sent',via:'عبر SMS (دون اتصال)',place:'البيت'};open('alert','sos');ok('live SOS: cannot be dismissed here',has(/طارئ/)&&!q('[data-a^="alertAck"]')&&has(/تبقى ظاهرة حتى تُحل/)&&!!q('.btn[data-a="go:sos-status"]')&&has(/وصل متأخراً/));
 S=fresh();open('alert','a1');const tamOn=S.tam.some(e=>e.kid==='khaled'&&e.open);ok('ongoing protection problem: not dismissable by reading',tamOn&&!q('[data-a^="alertAck"]')&&has(/المشكلة ما زالت قائمة/)&&!!q('.btn[data-a="go:tamper:a1"]'),tamOn);ACT.alertAck('a1');ok('…and the action refuses too',S.alerts.find(x=>x.id==='a1').open===1);
 S=fresh();setPersona('delegate');setRole('observer');ok('delegate: alerts follow her grants',allAlerts().every(a=>a.k!=='perm'&&a.k!=='grant')&&allAlerts().some(a=>a.k==='tamper')===can('protection.tamper.view'));
 open('alert','a4');ok('delegate without acknowledge key: no button',can('hub.alerts.acknowledge')||!q('[data-a^="alertAck"]'));
 open('alert','zz');ok('missing alert: calm empty state',has(/لم يعد موجوداً/));
 // 4 التحكم: سريع ومتقدم
 S=fresh();tab('control');render();ok('control quick: modes + six services + role link',!!q('#scr [data-a="go:presets:sleep"]')&&ph.querySelectorAll('#scr .card.fx').length===6&&!!q('[data-a="go:roles"]')&&!!q('[data-a="go:registry"]'));
 S.ctl='adv';render();ok('control advanced: sixteen settings from the registry',rows()===16+2&&!!q('[data-a="psFor:layan"]')&&!!q('[data-a="go:ctl-edit:cap:layan"]')&&!!q('[data-a="go:audit"]'),rows());
 S=fresh();S.os='ios';S.ctl='adv';tab('control');render();ok('iOS: unavailable settings say so',has(/غير متاح على هذا الجهاز/)&&!q('[data-a="go:quota:layan"]'));
 // 5 تعديل إعداد
 S=fresh();open('ctl-edit','cap','layan');ok('edit sheet: name, current value, source, save disabled until changed',has(/حدّ الوقت الإضافي اليومي/)&&has(/القيمة الآن/)&&has(/60 د/)&&dis('.btn[data-a="ctlSave"]'));
 ACT.ctlPick('30');render();ok('edit sheet: effect preview in a sentence',has(/30 دقيقة إضافية في اليوم على الأكثر/)&&!dis('.btn[data-a="ctlSave"]'));
 const au=S.audit.length;ACT.ctlSave();render();ok('save: value written at the owning service, logged, sheet closed',S.redeemCap===30&&S.audit.length===au+1&&/60 ← 30/.test(S.audit[0].t)&&!S.sheet);
 q('.toast [data-a], .toast button')&&q('.toast button').click();ok('undo restores',S.redeemCap===60,S.redeemCap);
 S=fresh();S.net='off';open('ctl-edit','cap','layan');ACT.ctlPick('45');render();ok('edit offline: told it waits',has(/يُرسل عند عودة الاتصال/));ACT.ctlSave();ok('…and it is queued',S.redeemCap===45&&S.outbox.length===1);
 S=fresh();setPersona('delegate');setRole('observer');S.ctlDraft={id:'cap',v:30};ACT.ctlSave();ok('no permission → nothing changes',S.redeemCap===60);
 // 6 الخدمات وصفحة الخدمة (للمالك) وأثر إزالة خدمة من التطبيق
 S=fresh();open('registry');ok('services: six human rows, no counts or codes',rows()===6&&!/S1-|مفتاحاً|ودج/.test(txt())&&!!q('[data-a="go:svc:loc"]'));
 open('svc','loc');ok('service page: state, home content, settings per child',has(/تعمل/)&&has(/ما تعرضه في الرئيسية/)&&has(/مشاركة الموقع/)&&!!q('.btn[data-a="go:map"]'));
 ok('no hide switch for the father anywhere',!q('#scr .tg')&&!ACT.svcT);
 S.svcGone='loc';render();ok('removed service: page says so, SOS note kept',has(/أُزيلت من التطبيق/)&&has(/زر الاستغاثة يبقى ظاهراً/)&&!q('.btn[data-a="go:map"]'));
 tab('home');render();ok('removed service: its widgets leave the board at once, SOS stays',!has(/أين العائلة الآن/)&&!q('#scr [data-a="go:map"]')&&!!q('#scr .sos'));
 tab('control');render();ok('removed service: card gone from quick view',ph.querySelectorAll('#scr .card.fx:not(.flat)').length===5);
 S.ctl='adv';render();ok('removed service: its settings gone from advanced view',!has(/مشاركة الموقع/)&&rows()===14+2);
 open('registry');ok('removed service stays listed',has(/أُزيلت/)&&rows()===6);
 S=fresh();S.svcGone='prot';tab('home');render();ok('protection removed: tiles and screen time gone, attention stays',!q('[data-a="go:presets:study"]')&&!has(/وقت الشاشة اليوم/)&&ph.querySelectorAll('#scr .att').length===3);
 open('alerts');ACT.set('alV','log');render();ok('old alerts of a removed service stay',has(/تعطّلت خدمة الوصول/));open('alert','a1');ok('…and say the service was removed',has(/أُزيلت من التطبيق/));
 S=fresh();setPersona('delegate');setRole('partner');open('registry');ok('services list is for the owner only',has(/هذه الصفحة للمالك/)&&rows()===0);open('svc','loc');ok('service page is for the owner only',has(/هذه الصفحة للمالك/));
 tab('more');render();ok('…and no row leads to it',!q('#scr [data-a="go:registry"]'));tab('control');render();ok('…nor a manage link',!q('#scr [data-a="go:registry"]'));
 S=fresh();S.os='ios';open('svc','prot');ok('service page on iOS: honest state',has(/غير متاح على هذا الجهاز/));
 // 6-ب الرئيسية بلا أقفال؛ الأقفال في «التحكم»
 for(const r of ['observer','guardian','partner']){S=fresh();setPersona('delegate');setRole(r);tab('home');render();ok('home has no locks: '+r,!q('#scr [data-a^="denied:"]')&&!q('#scr .dis'),r);ok('home links to my permissions: '+r,!!q('#scr [data-a="go:my-perms"]'));}
 S=fresh();setPersona('delegate');setRole('observer');tab('home');render();ok('observer home: mode tiles only if she may apply them',!!q('#scr [data-a^="go:presets"]')===can('protection.mode_preset.apply')&&!!q('#scr [data-a="go:task-new"]')===can('tasks.create')&&!!q('#scr [data-a="go:add-member"]')===can('identity.family.invite'));
 ok('observer home: suggestion card has no action buttons',!q('#scr [data-a="aiApply"]')&&!q('#scr [data-a="aiDismiss"]'));
 tab('control');render();ok('observer has no control tab at all',top()!=='control'&&!can('hub.settings.view'));
 S=fresh();setPersona('delegate');setRole('guardian');tab('control');render();ok('control keeps locks with a reason and a request path',top()==='control'&&!!q('#scr [data-a^="denied:"]')&&!!q('#scr .dis'));q('#scr [data-a^="denied:"]').click();ok('…tapping a lock explains it',!!S.sheet&&S.sheet.id==='why',S.sheet&&S.sheet.id);
 S=fresh();tab('home');render();ok('owner home unchanged: all tiles + battery beside place',!!q('[data-a="go:presets:free"]')&&!!q('[data-a="go:task-new"]')&&!!q('[data-a="go:add-member"]')&&has(/خالد: الصافية · 64%/)&&!q('#scr [data-a="go:my-perms"]'));
 // 7 مركز الإعدادات والبحث
 S=fresh();tab('more');render();ok('settings: nine fixed sections',['العائلة','الأعضاء','الخدمات','القوالب','الموافقات والاستثناءات','القواعد','التدقيق','الخصوصية والبيانات','الخطة والفوترة'].every(t=>[...ph.querySelectorAll('#scr .row .tx b')].some(b=>b.textContent.trim()===t)));
 ok('settings: badges where attention is needed',has(/بلغت حدّ الأفراد/)&&has(new RegExp(attention().length+' بانتظار قرار')));
 typeGs('السهر');ok('search synonym: السهر → نافذة النوم',q('#gsBody').hidden&&!q('#gsOut').hidden&&/نافذة النوم/.test(q('#gsOut').innerText));
 q('#gsOut [data-a="ctlFind:sleep"]').click();ok('search result opens the setting highlighted',top()==='control'&&S.ctl==='adv'&&!!q('#scr .row.hl')&&/نافذة النوم/.test(q('#scr .row.hl').innerText));
 tab('more');render();typeGs('كلمة السر');ok('search: كلمة السر → الأمان',/الأمان/.test(q('#gsOut').innerText));typeGs('الإشتراك');ok('search normalises hamza',/الخطة والفوترة/.test(q('#gsOut').innerText));
 typeGs('زززز');ok('search: no result state',/لا نتيجة/.test(q('#gsOut').innerText));typeGs('');ok('search cleared → sections back',!q('#gsBody').hidden&&q('#gsOut').hidden);
 S=fresh();setPersona('delegate');setRole('observer');tab('more');render();typeGs('الحصة');ok('search shows only what she may edit',/الحصة اليومية/.test(q('#gsOut').innerText)===can('protection.quota.edit'));
 // 8 المساعد
 S=fresh();open('ai');ok('assistant: no technical capability names',!/agent\./.test(txt())&&has(/سجل أفعال المساعد/));
 ok('assistant log: three rows open their detail',ph.querySelectorAll('#scr [data-a^="go:ai-act:"]').length===3);
 ACT.set('agF','khaled');render();ok('assistant log: filter by child',ph.querySelectorAll('#scr [data-a^="go:ai-act:"]').length===2);
 open('ai-act','g3');ok('action detail: permission, evidence, result; nothing to undo yet',has(/بأي إذن/)&&has(/إلى ماذا استند/)&&has(/المدة فقط، لا ما فُتح/)&&has(/النتيجة/)&&!q('[data-a^="aiUndo"]')&&has(/لم يُنفَّذ شيء بعد/));
 const g=S.agent.find(x=>x.id==='g3');g.st='نُفّذ بموافقتك';g.undo=1;render();ok('action detail: undo offered once executed',!!q('.btn[data-a="aiUndo:g3"]'));ACT.aiUndo('g3');render();ok('undo: recorded and sheet closed',g.undo===0&&!S.sheet&&/تراجع عن فعل المساعد/.test(S.audit[0].t));
 S=fresh();setPersona('delegate');setRole('guardian');open('ai');ok('delegate sees only what her grants cover',ph.querySelectorAll('#scr [data-a^="go:ai-act:"]').length===S.agent.filter(x=>can(x.need)).length&&has(/ما يخص صلاحياتكِ فقط/));
 S=fresh();setPersona('teen');open('ai-mine');ok('teen: a suggestion not yet decided is not shown',ph.querySelectorAll('#scr [data-a^="go:ai-act:"]').length===0&&has(/لا شيء بعد/));open('ai-act','g3');ok('…nor openable',has(/لا يوجد فعل بهذا الوصف/));
 S=fresh();S.agent.find(x=>x.id==='g3').st='رُفض';setPersona('teen');open('ai-mine');ok('teen: a refused suggestion is not shown',ph.querySelectorAll('#scr [data-a^="go:ai-act:"]').length===0);
 S=fresh();Object.assign(S.agent.find(x=>x.id==='g3'),{st:'نُفّذ بموافقتك',undo:1});setPersona('teen');open('ai-mine');ok('teen: sees it once executed, in his words',ph.querySelectorAll('#scr [data-a^="go:ai-act:"]').length===1&&has(/قُدّم وقت نومك 30 دقيقة/));
 open('ai-act','g3');ok('teen detail: no action, decided by the father',!q('[data-a^="aiUndo"]')&&has(/والدك/)&&!has(/بأي إذن/)&&has(/تغيّر وقت نومك/));open('ai-act','g2');ok('teen cannot open a sibling\'s entry',has(/لا يوجد فعل بهذا الوصف/));
 S=fresh();setPersona('mini');ok('under 7: no such screen in his template',!document.querySelector('#phone [data-a="go:ai-mine"]'));
 S=fresh();setPersona('child');open('ai-mine');ok('child: only her own entry',ph.querySelectorAll('#scr [data-a^="go:ai-act:"]').length===1&&has(/ترتيب الغرفة/));
 S=fresh();setPersona('teen');open('t-me');ok('teen profile links to it',!!q('[data-a="go:ai-mine"]'));S=fresh();setPersona('child');open('c-me');ok('child profile links to it',!!q('[data-a="go:ai-mine"]'));
 S=fresh();open('more');q('[data-a="go:plan"]')&&0;ok('plan row for owner opens the plan',!!q('#scr [data-a="go:plan"]'));setPersona('delegate');setRole('observer');tab('more');render();ok('plan for delegate: read-only mark or locked',has(/عرض فقط/));
 }catch(e){F.push('CRASH after check #'+N+': '+e.message)}
 // 9 كل أسطح S1-09: لا تجاوز أفقي + لا كلام مهندسين + لا معرّفات
 const over=[],eng=[];const ids=Object.keys(SC).filter(k=>SC[k].sys==='S1-09');const BAD=/[a-z]+\.[a-z_]+\.[a-z_]+|ALLOW|BLOCK|LIMIT|ALERT|IGNORE|Accessibility|DeviceAdmin|VPN|MQTT|Outbox|bitmask|is[A-Z]\w+|step-up|Parent Gate|PIN|نبضة|الرتيبة|القناع|مزامَن|الفرض|ذرّي|نطاق|undefined|null|NaN/;
 for(const id of ids){for(const pre of [null,'guardian','none','co','ios','off']){try{S=fresh();if(pre==='co')S.co={since:'اليوم',seen:0};else if(pre==='ios')S.os='ios';else if(pre==='off')S.net='off';else if(pre)setRole(pre);jump(id);render();const sc=document.getElementById('scr');if(sc&&sc.scrollWidth>sc.clientWidth+1)over.push(id);const sh=ph.querySelector('.sheet');if(sh&&sh.scrollWidth>sh.clientWidth+1)over.push(id+':sheet');
   const m=txt().replace(/SOS/g,'').replace(/[a-z0-9-]+\.(org|com)/g,'').match(BAD);if(m)eng.push(id+(pre?'/'+pre:'')+':'+m[0]);}catch(e){F.push('ERR '+id+' '+(pre||'')+' '+e.message)}}}
 R.over=[...new Set(over)];R.eng=[...new Set(eng)];R.n=ids.length;R.ids=ids.join(' ');R.checks=N;R.fail=F;return R;});
R.errs=errs;}catch(e){R.crash=String(e.stack||e).slice(0,900)}finally{await b.close()}
console.log(JSON.stringify(R,null,1));})();
