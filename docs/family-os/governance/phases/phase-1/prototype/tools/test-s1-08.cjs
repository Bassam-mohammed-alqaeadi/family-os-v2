// اختبار مسارات S1-08 (المحادثة العائلية) في النموذج: القائمة والبحث، الإرسال وحالاته (ساعة، صح، صحّان، دون اتصال، فشل)، الصورة والصوت،
// إجراءات الرسالة والحذف، قناة الوالدين وبوابتها، محادثات الأبناء والقراءة الإشرافية، الإغلاق وإعادة الفتح، تنبيه المصنّف وما أوقفه، استرداد السجل.
// يحتاج puppeteer-core و@sparticuz/chromium (غير مضمَّنين في المستودع):  NODE_PATH=<node_modules> node tools/test-s1-08.cjs
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
 const T=()=>document.querySelector('#toast').textContent;const noT=()=>{document.querySelector('#toast').innerHTML=''};const scr=()=>q('#scr').innerText.replace(/\s+/g,' ');
 const type=v=>{const e=q('#cmp');e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))};const sendBtn=()=>q('.composer [data-a^="send:"]');
 const say=(id,v)=>{open('thread',id);type(v);sendBtn().click();render();const ms=msgsOf(id);return ms[ms.length-1]};const last=id=>{const ms=msgsOf(id);return ms[ms.length-1]};
 const lastMe=()=>[...ph.querySelectorAll('#scr .msg.me')].pop();const K='dm-khaled-layan';const CHATS=['chat','chat-new','chat-group','thread','chat-info','msg-actions','chat-close','minor-chats','chat-flag','chat-review','chat-restore','chat-settings'];
 // 1 البذرة
 S=fresh();ok('seed: thirteen S1-08 surfaces',CHATS.every(k=>SC[k]&&SC[k].sys==='S1-08'),CHATS.filter(k=>!SC[k]));
 ok('seed: media limits are the spec values',IMG_MAX===10&&VOICE_MAX===5);
 // 2 القائمة
 S=fresh();tab('chat');render();
 ok('list: family lounge, parents channel and one direct chat',rows()>=3&&has(/مجلس العائلة/)&&has(/قناة الوالدين/)&&!!q('#chl [data-a="openCh:dm-layan"]'));
 ok('list: unread badge on the lounge only',q('#chl [data-a="openCh:majlis"] .unr').textContent==='1'&&ph.querySelectorAll('#chl .unr').length===1);
 ok('list: parents row never previews its content',/مشفّرة · لا معاينة هنا/.test(q('#chl [data-a="openCh:parents"]').innerText)&&!/طبيب ليان|أضفته إلى التقويم/.test(scr()));
 ok('list: last message with its time on each row',/خالد: وصلت البيت/.test(q('#chl [data-a="openCh:majlis"]').innerText)&&/5:09/.test(q('#chl [data-a="openCh:majlis"]').innerText));
 ok('list: one supervision entry counting flagged messages once',!!q('#scr [data-a="go:minor-chats:khaled"]')&&has(/رسالة واحدة تحتاج مراجعتك/));
 ok('list: new-chat and settings buttons for the parent',!!ph.querySelector('[data-a="go:chat-new"]')&&!!ph.querySelector('[data-a="go:chat-settings"]'));
 const si=q('[data-cq]');si.value='ليان';si.dispatchEvent(new Event('input',{bubbles:true}));
 ok('search filters without redrawing the field',ph.querySelectorAll('#chl .row').length===1&&q('[data-cq]')===si&&S.chQ==='ليان');
 si.value='زز';si.dispatchEvent(new Event('input',{bubbles:true}));ok('search with no match says so',/لا محادثة بهذا الاسم/.test(q('#chl').innerText));
 si.value='المجلس';si.dispatchEvent(new Event('input',{bubbles:true}));ok('search ignores the leading article',ph.querySelectorAll('#chl .row').length===1);
 S=fresh();S.chLoad=true;tab('chat');render();ok('list loading: placeholders, no names yet',has(/جارٍ جلب المحادثات/)&&!/مجلس العائلة/.test(scr()));
 S=fresh();S.chErr=true;tab('chat');render();ok('list error: says saved messages are safe, offers retry',has(/تعذّر جلب المحادثات/)&&!!q('#scr [data-a="set:chErr:false"]'));
 S=fresh();S.privacy=true;tab('chat');render();ok('privacy mode hides previews',!/وصلت البيت/.test(scr()));
 // 3 الأبناء والبالغ الآخر
 S=fresh();setPersona('child');tab('chat');render();
 ok('child: parents channel does not exist for her, no settings, told the father sees',!/قناة الوالدين/.test(txt())&&!ph.querySelector('[data-a="go:chat-settings"]')&&has(/بابا وماما يستطيعان رؤية محادثاتك/)&&!q('#scr [data-a^="go:minor-chats"]'));
 S=fresh();setPersona('teen');tab('chat');render();ok('teen: no parents channel, told plainly',!/قناة الوالدين/.test(txt())&&has(/محادثاتك داخل العائلة مرئية لوالدك/));
 S=fresh();setPersona('delegate');setRole('partner');tab('chat');render();ok('second adult with the permission sees the parents channel',!!q('#chl [data-a="openCh:parents"]'));
 delete S.g['chat.parents.view'];render();ok('adult without it: the parents channel is not listed',!q('#chl [data-a="openCh:parents"]'));
 delete S.g['chat.minor.view'];render();ok('adult without child-chat permission: no supervision entry',!q('#scr [data-a^="go:minor-chats"]'));
 // 4 المحادثة والإرسال
 S=fresh();open('thread','majlis');
 ok('thread: opening clears unread, names on others, typing shown',chUnread('majlis')===0&&!!q('#scr .msg .wh')&&has(/سارة تكتب الآن/));
 ok('thread: composer has emoji, text, image, voice and send',!!q('.composer [data-a="emoT"]')&&!!q('#cmp')&&!!q('.composer [data-a="sendK:majlis:img"]')&&!!q('.composer [data-a="recGo:majlis"]')&&!!sendBtn());
 type('مرحبا');ok('typing swaps the voice button for send',q('.composer').classList.contains('has'));
 let n0=msgsOf('majlis').length;sendBtn().click();render();let m=last('majlis');
 ok('sent message appears at once with the clock',msgsOf('majlis').length===n0+1&&m.x==='مرحبا'&&m.st===0&&lastMe().querySelector('.tk').getAttribute('aria-label')==='تنتظر الإرسال');
 chDeliver(m);render();ok('then one tick when the server has it',m.st===1&&lastMe().querySelector('.tk').getAttribute('aria-label')==='أُرسلت');
 chDeliver(m,1);render();ok('then two ticks when read',m.st===2&&lastMe().querySelector('.tk').getAttribute('aria-label')==='قُرئت');
 type('   ');n0=msgsOf('majlis').length;sendBtn().click();ok('blank message is not sent',msgsOf('majlis').length===n0);
 S.typing=false;render();ok('typing indicator goes when nobody types',!has(/تكتب الآن/));
 // 5 دون اتصال والفشل
 S=fresh();S.net='off';m=say('majlis','أنا في الطريق');
 ok('offline: message waits with the clock and enters the outbox',m.q===1&&m.st===0&&S.outbox.length===1&&S.outbox[0].sys==='S1-08');
 tab('chat');render();ok('offline: the list says one message is waiting',has(/رسالة واحدة تنتظر الإرسال/)&&!!q('#scr [data-a="go:outbox"]'));
 S.net='on';open('thread','majlis');ok('back online: the waiting message is sent',!m.q&&m.st===1);
 S=fresh();m=say('majlis','هل تحتاجون شيئاً؟');m.fail=1;S.sendFail=true;render();
 ok('failed message says so and offers retry',!!q('#scr .msg.fail')&&has(/لم تُرسل · أعد المحاولة/)&&!!q('#scr [data-a^="msgRetry:majlis"]'));
 q('#scr [data-a^="msgRetry:majlis"]').click();ok('retry that fails again stays failed, honestly',m.fail===1&&/تعذّر الإرسال مرة أخرى/.test(T()));noT();
 S.sendFail=false;q('#scr [data-a^="msgRetry:majlis"]').click();ok('retry that works clears the failure',!m.fail&&m.st===1);noT();
 S=fresh();S.net='off';m=say('majlis','سأحذف هذه');lastMe().click();ok('waiting message: can be cancelled before it leaves',!!q('.sheet [data-a^="msgDrop:majlis"]')&&!q('.sheet [data-a^="msgSelf"]')&&!q('.sheet [data-a^="msgDel:"]'));
 n0=msgsOf('majlis').length;q('.sheet [data-a^="msgDrop:majlis"]').click();ok('cancelled: gone from the thread and the outbox',msgsOf('majlis').length===n0-1&&S.outbox.length===0);noT();
 // 6 الصورة والصوت والرموز
 S=fresh();S.bigMedia=true;open('thread','majlis');n0=msgsOf('majlis').length;q('.composer [data-a="sendK:majlis:img"]').click();
 ok('image over the limit: inline error with the limit, nothing sent',msgsOf('majlis').length===n0&&/الصورة أكبر من 10 م\.ب/.test(q('.cmperr').innerText));
 type('x');ok('typing clears the error',!q('.cmperr'));
 S.bigMedia=false;q('.composer [data-a="sendK:majlis:img"]').click();ok('image within the limit is sent',last('majlis').k==='img');
 S=fresh();S.lbw=true;open('thread','majlis');ok('data saver: image loads on request only',!!q('#scr [data-a^="imgLd:majlis"]'));q('#scr [data-a^="imgLd:majlis"]').click();ok('image loaded after the request',!q('#scr [data-a^="imgLd:majlis"]'));
 S=fresh();open('thread','majlis');q('.composer [data-a="recGo:majlis"]').click();ok('voice: recording bar with cancel and send',S.rec==='majlis'&&has(/يسجّل/)&&!!q('[data-a="recX"]')&&!!q('[data-a="recSend:majlis"]')&&!q('#cmp'));
 n0=msgsOf('majlis').length;q('[data-a="recX"]').click();ok('voice cancelled: nothing sent',S.rec===null&&msgsOf('majlis').length===n0);noT();
 q('.composer [data-a="recGo:majlis"]').click();q('[data-a="recSend:majlis"]').click();ok('voice sent',last('majlis').k==='voice'&&!!q('#scr .msg.me .vo'));
 q('.composer [data-a="emoT"]').click();ok('emoji row opens',ph.querySelectorAll('.emo button').length===8);q('.emo button').click();ok('emoji goes into the text field without closing it',q('#cmp').value.length>0&&!!q('.emo'));
 // 7 إجراءات الرسالة والحذف
 S=fresh();m=say('majlis','رسالتي');chDeliver(m,1);render();lastMe().click();
 ok('own message: copy, delete from my phone, delete for all (owner)',!!q('.sheet [data-a^="msgCopy"]')&&!!q('.sheet [data-a^="msgSelf"]')&&!!q('.sheet [data-a^="msgDel:"]'));
 q('.sheet [data-a^="msgSelf"]').click();ok('delete from my phone: hidden for me only, with undo',m.hid.includes('ahmad')&&!/رسالتي/.test(scr())&&!!tU());
 setPersona('delegate',1);setRole('partner');open('thread','majlis');ok('the others still see it',/رسالتي/.test(scr()));
 S=fresh();open('thread','majlis');q('#scr .msg:not(.me)').click();ok('another member\'s message: no delete-from-my-phone',!q('.sheet [data-a^="msgSelf"]')&&!!q('.sheet [data-a^="msgDel:"]'));
 q('.sheet [data-a^="msgDel:"]').click();ok('delete for all asks first and states the real effect and the 7 days',!!S.dlg&&has(/من الخادم ومن كل الأجهزة/)&&has(/تُمحى نهائياً خلال 7 أيام/)&&has(/لا تراجع/));
 const a0=S.audit.length;dlgYes();ok('deleted for all: placeholder stays, logged, no undo',msgsOf('majlis')[0].del==='ahmad'&&has(/حُذفت هذه الرسالة/)&&S.audit.length===a0+1&&!tU());noT();
 q('#scr .msg.del');ACT.msgAct('majlis','0');render();ok('a deleted message has no actions',!S.sheet);
 S=fresh();open('thread',K);q('#scr .msg').click();q('.sheet [data-a^="msgDel:"]').click();ok('deleting a flagged message states the 30-day review',has(/تبقى 30 يوماً للمراجعة/));dlgYes();ok('deleting it closes its alert',!S.alerts.some(a=>a.k==='chat'&&a.open));noT();
 S=fresh();S.net='off';open('thread','majlis');q('#scr .msg:not(.me)').click();ok('delete for all needs a connection',/يحتاج اتصالاً/.test(q('.sheet').innerText)&&!q('.sheet [data-a^="msgDel:"]'));
 S=fresh();setPersona('delegate');setRole('guardian');open('thread','majlis');q('#scr .msg:not(.me)').click();ok('adult without the delete permission is not offered it',!q('.sheet [data-a^="msgDel:"]')&&!/احذف للجميع/.test(q('.sheet').innerText));
 S=fresh();setPersona('child');open('thread','majlis');q('#scr .msg:not(.me)').click();ok('child: copy only on others\' messages',!!q('.sheet [data-a^="msgCopy"]')&&!q('.sheet [data-a^="msgDel:"]')&&!q('.sheet [data-a^="msgSelf"]'));
 S.sheet=null;m=say('majlis','من ليان');chDeliver(m);render();lastMe().click();ok('child deleting her own: told the father still sees it',/ووالدك ما زال يراها/.test(q('.sheet').innerText));
 // 8 قناة الوالدين
 S=fresh();tab('chat');render();q('#chl [data-a="openCh:parents"]').click();ok('parents channel asks for the secret number first',!!S.full&&S.full.id==='pin'&&top()==='pin');
 pin();ok('after it: the channel opens, marked encrypted, no classifier chip',top()==='thread'&&!!ph.querySelector('.bar .chip')&&/مشفّرة/.test(ph.querySelector('.bar .chip').innerText)&&!has(/رصدها المصنّف/));
 back();render();q('#chl [data-a="openCh:parents"]').click();ok('it asks again on every entry',!!S.full&&S.full.id==='pin');S.full=null;
 S=fresh();open('chat-info','parents');ok('parents channel: info explains who reads it; it cannot be closed',/لا يقرؤها الخادم/.test(q('.sheet').innerText)&&!q('.sheet [data-a^="go:chat-close"]'));
 S=fresh();open('chat-info','majlis');ok('the family lounge cannot be closed either',!q('.sheet [data-a^="go:chat-close"]'));
 // 9 القراءة الإشرافية والإغلاق
 S=fresh();open('thread',K);
 ok('guardian view: read-only banner, both names, no text field, flagged chip',has(/بصفتك وليّ الأمر · للقراءة فقط/)&&!q('#cmp')&&ph.querySelectorAll('#scr .msg .wh').length===2&&has(/رصدها المصنّف/)&&!!q('.composer [data-a="go:chat-close:'+K+'"]'));
 q('.composer [data-a="go:chat-close:'+K+'"]').click();ok('close: reason is required',q('.sheet [data-a^="chCloseDo"]').disabled&&/السبب \(يراه خالد وليان\)/.test(q('.sheet').innerText));
 q('.sheet [data-a="clsWhy:وقت للتهدئة"]').click();ok('picking a reason enables the button',!q('.sheet [data-a^="chCloseDo"]').disabled);
 S.net='off';render();ok('closing needs a connection',q('.sheet [data-a^="chCloseDo"]').disabled&&/الإغلاق يحتاج اتصالاً/.test(q('.sheet').innerText));S.net='on';render();
 const a1=S.audit.length;q('.sheet [data-a^="chCloseDo"]').click();ok('closed: reason shown, logged, sheet gone',chOf(K).closed.why==='وقت للتهدئة'&&!S.sheet&&has(/أغلق أحمد هذه المحادثة: «وقت للتهدئة»/)&&S.audit.length===a1+1);noT();
 ok('owner now sees «reopen» instead of «close»',!!q('.composer [data-a="chReopen:'+K+'"]')&&!q('.composer [data-a^="go:chat-close"]'));
 setPersona('teen',1);open('thread',K);ok('teen in a closed chat: sees who and why, cannot write, cannot reopen',has(/أغلق أحمد هذه المحادثة: «وقت للتهدئة»/)&&!q('#cmp')&&has(/أحمد وحده يعيد فتحها/)&&!q('[data-a^="chReopen"]'));
 tab('chat');render();ok('closed chat is marked in the list',/مغلقة/.test(q('#chl [data-a="openCh:'+K+'"]').innerText));
 setPersona('delegate',1);setRole('partner');open('thread',K);ok('second adult with the close permission cannot reopen',!q('[data-a^="chReopen"]'));
 const a2=S.audit.length;ACT.chReopen(K);render();ok('her attempt is refused and logged',!!chOf(K).closed&&S.audit.length===a2+1&&S.audit[0].deny===1&&/أحمد وحده/.test(T()));noT();
 setPersona('owner',1);open('thread',K);q('.composer [data-a="chReopen:'+K+'"]').click();ok('owner reopening confirms first',!!S.dlg&&has(/يعود الإرسال فوراً/));dlgYes();ok('reopened: sending is back',!chOf(K).closed);noT();
 setPersona('teen',1);open('thread',K);ok('teen can write again',!!q('#cmp'));
 S=fresh();open('chat-close',K);const ci=q('#clsWhy');ci.value='سبب خاص';ci.dispatchEvent(new Event('input',{bubbles:true}));ok('a typed reason also enables closing',!q('.sheet [data-a^="chCloseDo"]').disabled&&S.clsWhy==='سبب خاص');
 S=fresh();setPersona('delegate');setRole('observer');open('thread',K);ok('adult who may read but not close: no close button',has(/للقراءة فقط/)&&!q('[data-a^="go:chat-close"]'));
 // 10 محادثة جديدة ومجموعة
 S=fresh();tab('chat');open('chat-new');ok('new chat: every other member, existing chat marked, group button',ph.querySelectorAll('.sheet .row').length===3&&/محادثة قائمة/.test(q('.sheet [data-a="dmStart:layan"]').innerText)&&!!q('.sheet [data-a="grpNew"]'));
 q('.sheet [data-a="dmStart:layan"]').click();ok('existing chat opens, no duplicate',top()==='thread'&&S.stack[S.stack.length-1].a[0]==='dm-layan');
 S=fresh();tab('chat');ACT.dmStart('khaled');render();ok('new direct chat starts empty with a prompt',!!chOf('dm-ahmad-khaled')&&has(/ابدأ المحادثة/)&&!!q('#cmp'));
 S=fresh();S.net='off';tab('chat');open('chat-new');ok('offline: existing chat opens, a new one waits for a connection',!!q('.sheet [data-a="dmStart:layan"]')&&!q('.sheet [data-a="dmStart:khaled"]')&&/بدء محادثة جديدة يحتاج اتصالاً/.test(q('.sheet').innerText)&&q('.sheet [data-a="grpNew"]').disabled);
 S=fresh();setPersona('child');tab('chat');open('chat-new');ok('child may start a chat with anyone, not a group',ph.querySelectorAll('.sheet .row').length===3&&!q('.sheet [data-a="grpNew"]')&&/والداك يستطيعان رؤيتها/.test(q('.sheet').innerText));
 S=fresh();setPersona('delegate');setRole('guardian');tab('chat');open('chat-new');ok('adult without the group permission: no group button',!q('.sheet [data-a="grpNew"]'));
 S=fresh();tab('chat');open('chat-new');q('.sheet [data-a="grpNew"]').click();ok('group: needs a name and two members',q('.sheet [data-a="grpMake"]').disabled&&/اختر فردين على الأقل/.test(q('.sheet').innerText));
 q('.sheet [data-ta="grpT:sara"]')?q('.sheet [data-ta="grpT:sara"]').click():ACT.grpT('sara');ACT.grpT('sara');ACT.grpT('sara');ACT.grpT('khaled');render();
 const gi=q('#grpN');gi.value='رحلة الجمعة';gi.dispatchEvent(new Event('input',{bubbles:true}));
 ok('group ready: button enabled, note that the owner sees it because a child is in',S.grp.mem.length===2&&!q('.sheet [data-a="grpMake"]').disabled);render();ok('group with a child: said to be visible',/فيها أبناء: يراها صاحب العائلة/.test(q('.sheet').innerText));
 q('.sheet [data-a="grpMake"]').click();const gid=S.stack[S.stack.length-1].a[0];ok('group created and opened',top()==='thread'&&chOf(gid).k==='group'&&chOf(gid).n==='رحلة الجمعة'&&chOf(gid).mem.length===3);noT();
 tab('chat');render();ok('group is in the list',!!q('#chl [data-a="openCh:'+gid+'"]'));
 // 11 محادثات الأبناء
 S=fresh();open('minor-chats','khaled');ok('children\'s chats: a chip per child, his chat marked for review, told he knows',ph.querySelectorAll('#scr .fch button').length===2&&/للمراجعة/.test(q('#scr [data-a="openCh:'+K+'"]').innerText)&&has(/خالد يعلم أن محادثاته مرئية/)&&!/قناة الوالدين|مجلس العائلة/.test(scr()));
 q('#scr [data-a="minorPick:layan"]').click();ok('her chats: the one with her brother and the one with her father',rows()===2);
 {const C=CHS(),keep={};kidChs('layan').forEach(id=>{keep[id]=C[id];delete C[id];});render();ok('a child with no chats: says so',has(/لا محادثات لليان بعد/));Object.assign(C,keep);render();}
 S=fresh();setPersona('delegate');setRole('partner');S.g['chat.minor.view'].sc=['layan'];open('minor-chats','khaled');ok('adult limited to one child sees that child only',!q('#scr .fch')&&has(/ليان تعلم/)&&has(/من سُمح لكِ/));
 delete S.g['chat.minor.view'];render();ok('adult without the permission: honest state',has(/لا تملكين رؤية محادثات الأبناء/)&&rows()===0);
 // 12 تنبيه المصنّف
 S=fresh();open('chat-flag',K,'0');ok('classifier alert: category and severity, message text hidden until asked',has(/تنمّر/)&&has(/الخطورة: متوسطة/)&&has(/قد يكون تقديره خاطئاً/)&&!/لا تدخلي غرفتي/.test(scr())&&!!q('#scr [data-a^="flagShow"]'));
 const a3=S.audit.length;q('#scr [data-a^="flagShow"]').click();ok('showing the message is a deliberate, logged act',/لا تدخلي غرفتي/.test(scr())&&S.audit.length===a3+1);
 ok('alert actions: talk, open, ignore, delete, close',!!q('#scr [data-a="dmStart:khaled"]')&&!!q('#scr [data-a="go:thread:'+K+'"]')&&!!q('#scr [data-a^="flagOk"]')&&!!q('#scr [data-a^="msgDel:"]')&&!!q('#scr [data-a="go:chat-close:'+K+'"]'));
 q('#scr [data-a^="flagOk"]').click();ok('ignore: alert closed everywhere, message untouched',!msgsOf(K)[0].flag&&!S.alerts.some(a=>a.k==='chat'&&a.open)&&has(/أُغلق هذا التنبيه/)&&!msgsOf(K)[0].del);noT();
 S=fresh();open('chat-flag',K,'0');ok('alert carries three short tips for the talk',ph.querySelectorAll('#ftips li').length===3&&has(/ابدأ بسؤال هادئ/));
 S.flagCat='threat';render();ok('threat category: named, medium',has(/تهديد بالأذى/)&&has(/الخطورة: متوسطة/));
 S.flagCat='sexual';render();ok('unfit-language category: named, medium',has(/كلام غير لائق/)&&has(/الخطورة: متوسطة/));
 S.flagCat='distress';render();ok('distress: high, says the message was delivered, offers neither delete nor close',has(/ضيق شديد/)&&has(/الخطورة: عالية/)&&has(/وصلت كما هي ولم يُحجب شيء/)&&!q('#scr [data-a^="msgDel:"]')&&!q('#scr [data-a^="go:chat-close"]')&&!!q('#scr [data-a="dmStart:khaled"]')&&has(/اطمأننت: أغلق التنبيه/));
 ok('distress: its own tips, with the specialist line',has(/لا تؤجل الحديث/)&&has(/فاطلب مساعدة مختص/));
 S=fresh();open('chat-settings');q('#scr [data-a^="why:"]')&&q('#scr [data-a^="why:"]').click();ok('«how it works» names the four alert cases and the three blocked ones',/تنمّر أو إهانة، تهديد بالأذى، كلام غير لائق، ضيق شديد/.test(txt())&&/محتوى جنسي يخص قاصراً، تشجيع على إيذاء النفس، استدراج/.test(txt()));S.sheet=null;S.dlg=null;
 S=fresh();S.net='off';open('chat-flag',K,'0');ok('offline: the alert shows, the message cannot be fetched',has(/تنمّر/)&&q('#scr [data-a^="flagShow"]').disabled&&has(/عرض الرسالة يحتاج اتصالاً/));
 S=fresh();CHS();msgsOf(K)[0].del='ahmad';open('chat-flag',K,'0');ok('message deleted before viewing: said plainly',has(/الرسالة غير متاحة/));
 S=fresh();setPersona('delegate');setRole('guardian');open('chat-flag',K,'0');ok('adult without delete or close permission is offered neither',!q('#scr [data-a^="msgDel:"]')&&!q('#scr [data-a^="go:chat-close"]'));
 S=fresh();open('alerts');open('alert','a2');ok('the alert opens the classifier screen, not the raw chat',!!q('.btn[data-a="go:chat-flag:'+K+':0"]'));
 // 16 ودجة الرئيسية CH-10
 S=fresh();tab('home');render();ok('home widget: one row per chat with news, count only, no content',!!q('#scr [data-a="openCh:majlis"]')&&/رسالة واحدة غير مقروءة/.test(q('#scr [data-a="openCh:majlis"]').innerText)&&!/وصلت البيت/.test(scr())&&!q('#scr [data-a="openCh:dm-layan"]'));
 CHS();S.chat.parents.push({f:'sara',x:'سرّ',at:'5:10',st:1},{f:'sara',x:'سرّ آخر',at:'5:11',st:1});render();ok('home widget: parents channel as a number only',/رسالتان جديدتان · العدد فقط/.test(q('#scr [data-a="openCh:parents"]').innerText)&&!/سرّ/.test(scr()));
 q('#scr [data-a="openCh:parents"]').click();ok('home widget: the parents row still asks for the secret number',!!S.full&&S.full.id==='pin');S.full=null;
 S=fresh();open('thread','majlis');tab('home');render();ok('home widget: nothing new says so and links to all chats',!!q('#chw0')&&/لا رسائل جديدة/.test(q('#chw0').innerText));
 S=fresh();setPersona('child');CHS();S.chat.parents.push({f:'sara',x:'سرّ',at:'5:10',st:1});tab('c-home');render();ok('child home: her own news only, never the parents channel',!!q('#scr [data-a="openCh:majlis"]')&&!q('#scr [data-a="openCh:parents"]')&&!/قناة الوالدين/.test(txt()));
 open('thread','majlis');tab('c-home');render();ok('child home: the widget hides when nothing is new',!q('#scr [data-a="openCh:majlis"]')&&!q('#chw0'));
 // 17 الصندوق الصادر CH-09
 S=fresh();m=say('majlis','هل تحتاجون شيئاً؟');m.fail=1;open('outbox');ok('outbox lists my failed message with retry',has(/رسالة لم تُرسل/)&&!!q('#scr [data-a^="msgRetry:majlis"]')&&has(/أعد المحاولة/));
 q('#scr [data-a^="msgRetry:majlis"]').click();ok('retry from the outbox sends it and clears the row',!m.fail&&!q('#scr [data-a^="msgRetry"]'));noT();
 S=fresh();S.net='off';say('majlis','أ');m=say('majlis','ب');S.outbox.unshift({t:'عملية أخرى',sys:'S1-06',at:'الآن'});ACT.msgDrop('majlis',String(msgsOf('majlis').length-1));ok('cancelling a waiting message removes only its own outbox entry',S.outbox.length===2&&S.outbox[0].t==='عملية أخرى'&&!S.outbox.some(o=>o.m===m));noT();
 S=fresh();ACT.openCh('parents');pin();m=say('parents','خاص جداً');m.fail=1;S.full=null;open('outbox');ok('a failed parents-channel message shows no text outside the channel',!/خاص جداً/.test(scr())&&!!q('#scr [data-a^="msgRetry:parents"]'));
 S=fresh();setPersona('child');m=say('majlis','من ليان');m.fail=1;open('outbox');ok('child sees her failed message and can retry',!!q('#scr [data-a^="msgRetry:majlis"]'));
 // 18 لا قالب لمن هم دون 7 (Q-426): قالب الطفل لكل من هم دون 13
 S=fresh();ok('no under-7 chat screen or symbol-only composer',!SC['m-chat']&&!ACT.mOpen&&!ACT.mEmo&&!PERSONA.mini);
 S=fresh();ok('the family lounge holds the four members',chOf('majlis').mem.length===4);
 // 13 ما أوقفه المصنّف قبل التسليم
 S=fresh();setPersona('teen');S.blockNext=true;m=say(K,'نص تجريبي');
 ok('blocked before delivery: sender is told, nothing is silent',m.blk===1&&has(/لم تُسلَّم هذه الرسالة/)&&has(/أحالها إلى والدك/)&&S.review.length===1&&S.review[0].cat==='harm');
 q('#scr .msg.blk').click();ok('sender can read why and what happens next',/والدك سيراها ويقرر/.test(q('.sheet').innerText));S.sheet=null;
 setPersona('child',1);open('thread',K);ok('the recipient never sees it',!/نص تجريبي|لم تُسلَّم/.test(scr()));
 setPersona('owner',1);open('thread',K);ok('it is not in the channel for the guardian either',!/نص تجريبي/.test(scr()));
 ok('owner gets an alert that leads to the review list',S.alerts[0].rv===1&&alertSees(S.alerts[0])&&/أوقفها المصنّف قبل أن تصل/.test(S.alerts[0].t));
 tab('chat');render();ok('the list shows the review entry with its count',!!q('#scr [data-a="go:chat-review"]'));
 open('chat-review');ok('review list: category, not delivered, text hidden until asked, 30 days stated',has(/تشجيع على إيذاء النفس/)&&has(/لم تُسلَّم/)&&!/«نص تجريبي»/.test(scr())&&has(/تبقى هنا 30 يوماً ثم تُحذف نهائياً/)&&has(/لم تصل/));
 q('#scr [data-a^="rvShow"]').click();ok('text shown on request',/«نص تجريبي»/.test(scr()));
 q('#scr [data-a^="rvOk"]').click();ok('ignored: removed, alert closed, empty state',S.review.length===0&&!S.alerts.some(a=>a.rv&&a.open)&&has(/لا رسائل موقوفة/));noT();
 S=fresh();setPersona('delegate');setRole('partner');S.blockNext=true;say('majlis','من بالغة');ok('the block applies to chats with children, whoever writes',last('majlis').blk===1);
 S=fresh();S.blockNext=true;tab('chat');ACT.openCh('parents');pin();type('خاص');sendBtn().click();ok('parents channel is never classified',!last('parents').blk&&S.review.length===0);
 S=fresh();setPersona('delegate');setRole('partner');open('chat-review');ok('review list is the owner\'s',/لصاحب العائلة/.test(txt())||top()!=='chat-review');
 // 14 الإعدادات والمصنّف للمراهق
 S=fresh();open('chat-settings');ok('settings: under-13 always on, teen switch, parents channel, retention',has(/دون 13 سنة: يعمل دائماً/)&&q('#scr [data-a="clsT"]').getAttribute('aria-checked')==='true'&&has(/مشفّرة من طرف إلى طرف/)&&has(/يُمحى نهائياً خلال 7 أيام/)&&has(/يبقى 30 يوماً للمراجعة/));
 q('#scr [data-a="clsT"]').click();ok('turning the teen classifier off asks first and says what is lost',!!S.dlg&&has(/ولن تُوقف رسالة خطيرة قبل وصولها/)&&(S.clsTeen??true)===true);dlgYes();ok('off after confirming',S.clsTeen===false&&has(/متوقف: لا تنبيهات عن رسائله/));noT();
 q('#scr [data-a="clsT"]').click();ok('turning it back on is one touch',S.clsTeen===true&&!S.dlg);noT();
 S.net='off';render();q('#scr [data-a="clsT"]').click();ok('changing it is refused offline',S.clsTeen===true&&!S.dlg&&/يحتاج اتصالاً/.test(T()));noT();
 S=fresh();setPersona('delegate');setRole('partner');open('chat-settings');ok('second adult sees the teen classifier state, cannot change it, no restore',!q('#scr [data-a="clsT"]')&&has(/يتحكم به أحمد/)&&!q('#scr [data-a="go:chat-restore"]')&&!q('#scr [data-a="go:chat-review"]'));
 // 15 استرداد سجل قناة الوالدين
 S=fresh();open('chat-restore');ok('restore: three steps explained, start button',has(/رقمك السري/)&&has(/رمز تحقق/)&&has(/الخادم يسلّم نسخة مشفّرة لا يقرؤها/)&&!!q('#scr [data-a="crGo"]'));
 q('#scr [data-a="crGo"]').click();ok('step 1: the secret number',!!S.full&&S.full.id==='pin');pin();ok('step 2: the verification code',S.cr.step===1&&has(/أدخل رمز التحقق/));
 '111111'.split('').forEach(d=>ACT.crK(d));render();ok('wrong code: says how many tries remain, logged',S.cr.bad===1&&has(/بقيت 4 محاولات/)&&S.audit[0].deny===1);
 for(let i=0;i<4;i++)'111111'.split('').forEach(d=>ACT.crK(d));render();ok('five wrong codes lock for fifteen minutes',S.cr.lock===true&&has(/انتظر 15 دقيقة/)&&!q('#scr .pad'));
 S=fresh();open('chat-restore');ACT.crGo();pin();'246810'.split('').forEach(d=>ACT.crK(d));render();ok('right code: decrypting on this phone',S.cr.step===2&&has(/نفك السجل على هذا الهاتف/));
 crDone();render();ok('done: restored, the server never read it',S.cr.step===3&&has(/عاد سجل قناة الوالدين/)&&has(/لم يقرأه الخادم/)&&!!q('#scr [data-a="openCh:parents"]'));
 S=fresh();S.crDead=true;open('chat-restore');ACT.crGo();pin();render();ok('old secret number lost: said plainly, no false promise',S.cr.step===9&&has(/السجل القديم لا يمكن استرداده/)&&has(/ولا طريقاً آخر/));
 S=fresh();S.net='off';open('chat-restore');ok('restore needs a connection',q('#scr [data-a="crGo"]').disabled&&has(/الاسترداد يحتاج اتصالاً/));
 // جمع النموذجين (Q-457)
 S=fresh();tab('chat');S.chQ='ززز';render();ok('chat search: empty result offers to clear',has(/لا محادثة بهذا الاسم/)&&!!q('[data-a="chClearQ"]'));ACT.chClearQ();render();ok('chat search: cleared',S.chQ===''&&!has(/لا محادثة بهذا الاسم/));
 ok('review: classifier feedback marked as a proposal',/UNKNOWN/.test(SC['chat-review'].note));
 }catch(e){F.push('CRASH after check #'+N+': '+e.message)}
 // كل أسطح S1-08: لا تجاوز أفقي + لا كلام مهندسين + لا معرّفات
 const over=[],eng=[];const ids=Object.keys(SC).filter(k=>SC[k].sys==='S1-08');const BAD=/[a-z]+\.[a-z_]+\.[a-z_]+|ALLOW|BLOCK|LIMIT|ALERT|IGNORE|Accessibility|DeviceAdmin|VPN|MQTT|Outbox|bitmask|is[A-Z]\w+|step-up|Parent Gate|PIN|نبضة|الرتيبة|القناع|مزامَن|الفرض|ذرّي|نطاق|undefined|null|NaN/;
 for(const id of ids){for(const pre of [null,'guardian','none','co','ios','off']){try{S=fresh();if(pre==='co')S.co={since:'اليوم',seen:0};else if(pre==='ios')S.os='ios';else if(pre==='off')S.net='off';else if(pre)setRole(pre);jump(id);render();const sc=document.getElementById('scr');if(sc&&sc.scrollWidth>sc.clientWidth+1)over.push(id);const sh=ph.querySelector('.sheet');if(sh&&sh.scrollWidth>sh.clientWidth+1)over.push(id+':sheet');
   const m=txt().replace(/SOS/g,'').replace(/[a-z0-9-]+\.(org|com)/g,'').match(BAD);if(m)eng.push(id+(pre?'/'+pre:'')+':'+m[0]);}catch(e){F.push('ERR '+id+' '+(pre||'')+' '+e.message)}}}
 R.over=[...new Set(over)];R.eng=[...new Set(eng)];R.n=ids.length;R.ids=ids.join(' ');R.checks=N;R.fail=F;return R;});
R.errs=errs;}catch(e){R.crash=String(e.stack||e).slice(0,900)}finally{await b.close()}
console.log(JSON.stringify(R,null,1));process.exitCode=(R.crash||[R.fail,R.errs,R.over,R.eng].some(x=>x&&x.length))?1:0;})();
