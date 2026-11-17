// اختبار مسارات S1-07 (الموقع الأساسي والاستغاثة) في النموذج: الخريطة وحداثة الموقع ودقته، موقع فرد، سجل التنقل، جهات الطوارئ،
// الاستغاثة عند المرسِل (إنترنت، رسالة نصية، رصيد منتهٍ، iPhone، بلا موقع جديد) وعند الأهل (تأكيد، حل، تصعيد مستنفد)، وما يراه الطفل والمراهق.
// يحتاج puppeteer-core و@sparticuz/chromium (غير مضمَّنين في المستودع):  NODE_PATH=<node_modules> node tools/test-s1-07.cjs
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
 // 1 البذرة
 S=fresh();ok('seed: eleven S1-07 surfaces',LOCS.every(k=>SC[k]&&SC[k].sys==='S1-07'),LOCS.filter(k=>!SC[k]));
 ok('seed: thresholds are the approved lab values',LOC_FRESH===15&&LOC_POOR===50&&BAT_LOW===15);
 ok('seed: no emergency contacts, no SOS, one past SOS',S.ec.length===0&&S.sos===null&&S.sosLog.length===1);
 // 2 الخريطة
 const PIN=()=>[...ph.querySelectorAll('#scr .map .pin')];
 open('map');ok('map fills the screen: title, chips, map, bottom panel',q('.bar h2').textContent==='خريطة العائلة'&&!!q('#scr .mapscr .map.fill')&&!!q('#scr .mpanel')&&q('#scr .map.fill').offsetHeight>=300,q('#scr .map.fill')&&q('#scr .map.fill').offsetHeight);
 ok('member switcher: «all» plus one chip per child',ph.querySelectorAll('#scr .mfch button').length===4&&q('#scr .mfch [data-a="mapFit"]').getAttribute('aria-pressed')==='true');
 ok('two children in one place: one marker with a count',PIN().length===2&&q('#scr .pin.clu .cn').textContent==='2'&&/ليان ويوسف/.test(q('#scr .pin.clu').textContent));
 ok('live marker carries name, battery and age',/خالد · 64% · قبل 4 د/.test(q('#scr .pin:not(.clu)').textContent));
 ok('touch target of a marker is at least 48',PIN().every(e=>e.offsetWidth>=48&&e.offsetHeight>=48),PIN().map(e=>e.offsetWidth+'x'+e.offsetHeight).join());
 ok('own position: «you» dot, and distance on each row',!!q('#scr .map .medot')&&has(/يبعد نحو 2\.1 كم/)&&has(/يبعد نحو 2\.3 كم/));
 ok('addresses come from the map: no family-named places',has(/الصافية · شارع الزبيري/)&&has(/حدة · قرب شارع الخمسين/)&&!has(/المدرسة/)&&!has(/البيت ·/));
 ok('map: all live by default, nothing marked old',!q('#scr .pin.old')&&!has(/آخر موقع معروف/)&&!q('#scr .mstrip'));
 ok('map controls: zoom in, zoom out, show all',!!q('#scr .mctl [data-a="mapZ:1"]')&&q('#scr .mctl [data-a="mapZ:-1"]').disabled&&!!q('#scr .mctl [data-a="mapFit"]'));
 ok('one entry each for sharing, contacts and SOS log',!!q('#scr [data-a="go:loc-share"]')&&ph.querySelectorAll('[data-a="go:emergency"]').length===1&&!!q('#scr [data-a="go:sos-log"]'));
 q('#scr .mfch [data-a="mapF:khaled"]').click();ok('chip filters the map to one child: his marker only, zoomed, his card',PIN().length===1&&S.mapZ===1.6&&/scale\(1\.6\)/.test(q('#scr svg.m').getAttribute('style')||'')&&!!q('#scr .mhead')&&!!q('#scr [data-a="locCall:khaled"]')&&!!q('#scr [data-a="go:loc:khaled"]')&&has(/موقع حي · قبل 4 د/));
 q('#scr [data-a="locDir:khaled"]').click();ok('directions: hands over to the phone maps app',/تطبيق الخرائط/.test(document.querySelector('#toast').textContent));
 q('#scr .mctl [data-a="mapZ:1"]').click();ok('zoom in to the limit, then the button locks',S.mapZ===2.4&&q('#scr .mctl [data-a="mapZ:1"]').disabled);
 q('#scr .mhead [data-a="mapFit"]').click();ok('close returns everyone',PIN().length===2&&S.mapZ===1&&!q('#scr .mhead'));
 q('#scr .pin.clu').click();ok('tapping the group lists who is there',has(/في المكان نفسه/)&&rows()===2&&PIN().length===1);
 ACT.mapFit();render();q('#scr .pin:not(.clu)').click();ok('tapping a marker focuses, does not leave the map',top()==='map'&&S.mapF==='khaled');
 ACT.mapFit();render();q('#scr .mgrab').click();ok('panel grows on demand and map controls step aside',!!q('#scr .mpanel.x')&&!q('#scr .mctl'));q('#scr .mgrab').click();
 S.locK='old';render();ok('stale location is marked with its reason, never shown as live',ph.querySelectorAll('#scr .pin.old').length===1&&has(/خالد: يُعرض آخر موقع معروف/)&&has(/آخر موقع معروف قبل 25 د · جهازه بلا اتصال الآن/)&&/قبل 25 د/.test(q('#scr .pin.old').textContent));
 ok('threshold: 15 minutes is live, 16 is not',(()=>{S.locK='';S.kid.khaled.ago=15;const a=locOf('khaled').live;S.kid.khaled.ago=16;const b=locOf('khaled').live;S.kid.khaled.ago=4;return a&&!b})());
 S.locK='mov';render();ok('moving: badge on the marker and the word in the row',!!q('#scr .pin.mv .mvb')&&has(/يتحرك · قبل 1 د/));
 S.locK='poor';render();ok('poor accuracy: a circle, not a false point',!!q('#scr .map .unc'));
 S.locK='none';render();ok('no reading yet: no pin, says so',PIN().length===1&&has(/لا موقع معروف بعد/));
 S=fresh();S.locLoad=true;open('map');ok('loading: placeholders, no names or places yet',q('#scr .mapscr').getAttribute('aria-busy')==='true'&&ph.querySelectorAll('#scr .pin.sk').length===2&&has(/جارٍ جلب المواقع/)&&!/خالد|حدة/.test(q('#scr').innerText));
 S=fresh();S.myLocOff=true;open('map');ok('my own location off: no dot, no distances, said',!q('#scr .medot')&&!has(/يبعد/)&&has(/تحديد الموقع متوقف في هاتفك/));
 S=fresh();S.net='off';open('map');ok('offline: strip, every location is last-known',has(/أنت دون اتصال: تُعرض آخر المواقع المعروفة/)&&ph.querySelectorAll('#scr .pin.old').length===2&&ph.querySelectorAll('#scr .pin').length===2);
 S=fresh();S.os='ios';open('map');ok('iOS: honest limit, ages shown',has(/iPhone/)&&ph.querySelectorAll('#scr .pin.old').length===2);
 S=fresh();S.tilesFail=true;open('map');ok('map failed to load: card with retry, list still works',has(/تعذّر تحميل الخريطة/)&&!q('#scr .map')&&rows()>=3&&!!q('#scr .mpanel.nomap'));q('[data-a="set:tilesFail:false"]').click();ok('…retry brings it back',!!q('#scr .map'));
 S=fresh();S.privacy=true;open('map');ok('privacy mode: no map, no addresses, no distances, no name chips',!q('#scr .map')&&!has(/الصافية/)&&!has(/حدة/)&&!has(/يبعد/)&&!q('#scr .mfch'));
 S=fresh();S.sos=SOS();open('map');ok('map during SOS: strip and marked pin',!!q('#scr .mstrip[data-a="go:sos-status"]')&&!!q('#scr .pin.sosp'));
 S=fresh();setPersona('delegate');setRole('partner');delete S.g['location.view'];open('map');ok('adult without the grant: honest state, no map',has(/لا مواقع مرئية/)&&!q('#scr .map'));
 S=fresh();setPersona('delegate');setRole('partner');S.g['location.view'].sc=['layan'];open('map');ok('adult scoped to one child sees one pin, no switcher, no sharing row',PIN().length===1&&has(/من سُمح لكِ/)&&!q('#scr .mfch')&&!q('#scr [data-a="go:loc-share"]'));
 open('loc','khaled');ok('…and cannot open another child',has(/غير مسموح لكِ/)&&!q('#scr .map'));
 tab('home');render();ok('…home widget shows only that child',has(/ليان: حدة/)&&!has(/خالد: الصافية/));
 // 2-ب ما يراه الأبناء من مواقع إخوتهم
 S=fresh();open('loc-share');ok('sharing: by default nobody sees a sibling',ph.querySelectorAll('#scr .tg').length===6&&ph.querySelectorAll('#scr .tg[aria-checked="true"]').length===0);
 q('#scr [data-a="shareT:khaled:layan"]').click();ok('father shows one sibling to one child, one direction only',S.locShare.khaled.join()==='layan'&&S.locShare.layan.length===0&&ph.querySelectorAll('#scr .tg[aria-checked="true"]').length===1);
 S.net='off';render();q('#scr [data-a="shareT:layan:khaled"]').click();ok('sharing change refused offline',S.locShare.layan.length===0&&/يحتاج اتصالاً/.test(document.querySelector('#toast').textContent));S.net='on';document.querySelector('#toast').innerHTML='';
 setPersona('teen',1);open('map');ok('teen now sees himself and that sibling only, markers do not open details',PIN().length===2&&/ليان/.test(q('#scr .map').textContent)&&!/يوسف/.test(q('#scr').innerText)&&has(/من أراه من إخوتي/)&&!q('#scr .map .pin[data-a]'));
 ok('…sibling shown without battery',!/41%/.test(q('#scr').innerText));
 setPersona('child',1);open('map');ok('the shown child is told who sees her, and sees no one herself',has(/يرى مكانك لأن بابا سمح/)&&PIN().length===1&&has(/لا ترى مكان إخوتك/));
 setPersona('delegate',1);setRole('partner');open('loc-share');ok('only the family owner decides sharing',has(/هذا القرار لصاحب العائلة/)&&!q('#scr .tg'));
 // 3 موقع فرد
 S=fresh();open('loc','khaled');ok('member: live chip, accuracy, battery, actions',has(/موقع حي/)&&has(/بحدود 12 متراً/)&&!!q('[data-a="locMsg:khaled"]')&&!!q('[data-a="locCall:khaled"]')&&!!q('[data-a="go:history:khaled"]'));
 S.locK='old';render();ok('member stale: "not live", age and reason',has(/ليس موقعاً حياً/)&&has(/آخر موقع معروف قبل 25 د/)&&has(/جهازه بلا اتصال/));
 S.locK='off';render();ok('device off: reason and hours',has(/مغلق أو نفدت بطاريته/)&&has(/قبل 3 س و10 د/));
 S.locK='poor';render();ok('poor accuracy: circle and approximate wording',!!q('#scr .unc')&&has(/ضمن 120 متراً/)&&has(/تقريبي/));
 S.locK='low';render();ok('low battery: says updates slow down, offers to ask him to charge',has(/منخفضة/)&&has(/شحن الهاتف/));
 S.locK='none';render();ok('no reading: empty state, can still message',has(/لا موقع معروف بعد/)&&!!q('[data-a="locMsg:khaled"]')&&!q('#scr .map'));
 S=fresh();open('loc','layan');q('[data-a="locMsg:layan"]').click();ok('message opens her thread',top()==='thread');
 S=fresh();setPersona('delegate');setRole('partner');delete S.g['location.history.view'];open('loc','layan');ok('history locked with a reason',!!q('#scr [data-a="denied:location.history.view"]'));open('history','layan');ok('history screen refuses too',has(/غير مسموح لكِ/)&&!q('#scr .map'));
 // 4 سجل التنقل
 S=fresh();open('history','layan');ok('history: 7 days oldest to today, today selected',ph.querySelectorAll('#scr [data-a^="histDay:"]').length===7&&q('[data-a="histDay:6"]').getAttribute('aria-pressed')==='true');
 ok('history: stops numbered on map and list, auto-delete stated',ph.querySelectorAll('#scr .map .hp').length===2&&/1،3/.test(q('#scr .map .hp').textContent)&&rows()===3&&has(/يُحذف من نفسه/));
 ok('history: day chips start with today',q('#scr [data-a^="histDay:"]').textContent==='اليوم');
 q('#scr .row[data-a="histPt:1"]').click();ok('tapping a stop marks it on the map',!!q('#scr .map .hp.on')&&q('#scr .map .hp.on').textContent==='2');q('#scr .row[data-a="histPt:2"]').click();ok('two stops at one place share a marker',q('#scr .map .hp.on').textContent==='1،3');
 q('[data-a="histKid:khaled"]').click();ok('switch child inside the screen',has(/سجل تنقل خالد/)&&has(/موقع تقريبي/));
 q('[data-a="histDay:5"]').click();ok('gap in data is stated, not filled',has(/بلا بيانات/));
 q('[data-a="histDay:2"]').click();ok('day with no points: empty state',has(/لا نقاط في هذا اليوم/)&&!q('#scr .map'));
 ok('no manual delete, no playback',!q('#scr [data-a*="Del"]')&&!has(/تشغيل/));
 S=fresh();S.net='off';open('history','layan');ok('history offline: stored copy with a note',has(/ما حُفظ على هاتفك/)&&rows()===3);
 // 5 جهات الطوارئ
 S=fresh();open('emergency');ok('contacts: adults always listed, none external by default',has(/يصلهم التنبيه دائماً/)&&has(/سارة/)&&has(/لا أحد من خارج البيت بعد/)&&has(/رسالتان/));
 q('[data-a="ecNew"]').click();ok('add sheet opens',top()==='ec-add');
 const fill=(n,p)=>{q('#ecN').value=n;q('#ecP').value=p;q('[data-a="ecSave"]').click()};
 fill('','');ok('empty form: both errors beside their fields',has(/اكتب اسماً/)&&has(/اكتب رقم الجوال/)&&top()==='ec-add');
 fill('العم ناصر','12345');ok('bad number: inline error, name kept',has(/9 أرقام/)&&q('#ecN').value==='العم ناصر'&&S.ec.length===0);
 fill('العم ناصر','77 123 4567');ok('valid: saved, formatted, logged',top()==='emergency'&&S.ec.length===1&&S.ec[0].p==='+967 77 123 4567'&&has(/أضافه أحمد/)&&/جهة طوارئ/.test(S.audit[0].t));
 ok('…messages per SOS grow with each contact',has(/3 رسائل/));
 q('[data-a="ecNew"]').click();fill('ناصر ثانية','771234567');ok('duplicate number refused',has(/مضاف من قبل/)&&S.ec.length===1);
 fill('خال في جدة','+966 50 123 4567');ok('number abroad accepted with +',S.ec.length===2&&S.ec[1].p==='+966501234567');
 q('[data-a^="ecDel:"]').click();ok('delete asks first and says what stops',top()==='dlg'&&/لن تصله الاستغاثات القادمة/.test(S.dlg.b));dlgYes();ok('deleted with undo',S.ec.length===1&&!!tU());tU().click();ok('undo restores',S.ec.length===2);
 S.net='off';render();ok('offline: add and delete need the internet, said honestly',!q('[data-a="ecNew"]')&&has(/يحتاجان الإنترنت/));q('[data-a^="ecDel:"]').click();ok('…delete refused offline',S.ec.length===2&&top()==='emergency');
 S=fresh();setPersona('delegate');setRole('partner');open('emergency');ok('other adult: reads the list, cannot manage',!q('[data-a="ecNew"]')&&has(/أحمد وحده/));
 S=fresh();S.smsOut=true;S.smsEm=1;ACT.ecAdd();open('emergency');ok('quota warning: not everyone reachable offline',has(/الرصيد لا يكفي/)&&has(/1 من 3/)&&!!q('[data-a="go:topup"]'));
 // 6 الاستغاثة: المسار العادي
 S=fresh();setPersona('child');render();ACT.sosStart();render();ok('countdown of 10 with a cancel',top()==='sos-count'&&has(/10/)&&!!q('[data-a="sosCancel"]'));
 ACT.sosCancel();render();ok('cancel inside the window: nothing sent, nothing counted',S.sos===null&&S.sms.used===14&&top()!=='sos-count');
 kidSos();ok('sent online: reached 2 of 2 over the internet',top()==='sos-sent'&&has(/وصلت إلى 2 من 2/)&&has(/عبر الإنترنت/)&&S.sos.st==='sent');
 ok('sender cannot cancel a sent SOS',!ACT.sosSelfEnd&&!q('[data-a="sosSelfEnd"]')&&has(/هو من يغلق الاستغاثة/)&&!!q('[data-a="sosCallOut"]'));
 ACT.close();render();ACT.sosStart();render();ok('pressing again reopens the status: no countdown, no second alert',top()==='sos-sent'&&S.sos.st==='sent');
 setPersona('owner');render();ok('father: top card on home',has(/استغاثة من ليان/));
 open('sos-status');ok('father detail: place, who got it, re-alert rule, three actions',has(/ليان تستغيث/)&&has(/المكان لحظة الاستغاثة/)&&has(/يُعاد التنبيه للجميع بعد 5 دقائق/)&&!!q('[data-a="sosCall"]')&&!!q('[data-a="sosAck"]')&&!!q('[data-a="go:sos-resolve"]'));
 q('[data-a="sosAck"]').click();ok('acknowledge: recorded, shown, alert still open',S.sos.ack==='أحمد'&&has(/أكّدتَ الاستلام/)&&!has(/يُعاد التنبيه/)&&S.sos.st==='sent');
 setPersona('child');ACT.sosStart();render();ok('child sees who is on the way',has(/أحمد في الطريق إليك/));
 setPersona('owner');open('sos-status');q('[data-a="go:sos-resolve"]').click();ok('resolve asks first and says there is no undo',top()==='sos-resolve'&&has(/لا تراجع بعد الإغلاق/));
 q('#sosNote').value='ضغطت بالخطأ';q('[data-a="sosDone"]').click();ok('resolved with a note, logged, no undo offered',S.sos.st==='resolved'&&S.sos.note==='ضغطت بالخطأ'&&has(/أغلقها أحمد/)&&/حُلّت استغاثة/.test(S.audit[0].t)&&!tU());
 tab('home');render();ok('top card leaves home after resolve',!has(/استغاثة من ليان/));
 setPersona('child');S.full={id:'sos-sent',a:[]};render();ok('child is told it ended and who closed it',has(/انتهت الاستغاثة/)&&has(/أغلقها أحمد/));
 // 7 بلا إنترنت
 S=fresh();ACT.ecAdd();S.net='off';kidSos();ok('offline Android: text message to all three, counted from the quota',has(/وصلت إلى 3 من 3/)&&has(/برسالة نصية/)&&S.sms.used===17&&S.sos.ch==='sms');
 setPersona('owner');setNet('on');open('sos-status');ok('father: came by text message, verified',has(/برسالة نصية/)&&has(/رسالة موثّقة/));
 S=fresh();S.smsOut=true;S.net='off';kidSos();ok('quota used up: the three emergency messages cover it',S.sos.st==='sent'&&S.sos.got===2&&S.smsEm===1&&has(/الباقي 1 من 3/));
 S=fresh();S.smsOut=true;S.smsEm=1;ACT.ecAdd();S.net='off';kidSos();ok('not enough for all: father first, the rest named as not sent',S.sos.got===1&&has(/وصلت إلى 1 من 3/)&&has(/لم تُرسل بعد/)&&S.smsEm===0);
 S=fresh();S.smsOut=true;S.smsEm=0;S.net='off';kidSos();ok('nothing left: pending, never shown as sent, call offered',S.sos.st==='pending'&&has(/الاستغاثة معلّقة/)&&!has(/أُرسلت استغاثتك/)&&!!q('[data-a="sosCallOut"]'));
 setPersona('owner');render();ok('…parents see nothing while it is pending',!has(/استغاثة من ليان/)&&allAlerts().every(a=>a.id!=='sos'));open('sos-status');ok('…and no alert screen',has(/لا استغاثة الآن/));
 setNet('on');tab('home');render();ok('connection back: it goes out by itself',S.sos.st==='sent'&&S.sos.ch==='server'&&has(/استغاثة من ليان/));
 S=fresh();S.os='ios';S.net='off';kidSos();ok('iPhone offline: not sent until the user sends the message',S.sos.st==='pending'&&S.sos.pend==='composer'&&has(/لم تُرسل الاستغاثة بعد/)&&!!q('[data-a="sosCompose"]'));
 q('[data-a="sosCompose"]').click();ok('message composer opens',top()==='dlg');ACT.dlgNo();render();ok('closed without sending: stays unsent, asks again, no failure banner',S.sos.st==='pending'&&!!q('[data-a="sosCompose"]')&&!has(/فشل/));
 q('[data-a="sosCompose"]').click();dlgYes();ok('sent from the composer: one alert, by text message',S.sos.st==='sent'&&S.sos.ch==='sms'&&has(/أُرسلت استغاثتك/));
 S=fresh();S.gpsOff=true;kidSos();ok('no new fix: sent at once with the last known place and its age',S.sos.st==='sent'&&S.sos.fix==='last'&&has(/آخر مكان معروف قبل 18 د/));
 setPersona('owner');open('sos-status');ok('father is told it is not the live place',has(/لا مكان اللحظة/));
 // 8 عند الأهل: حالات خاصة
 S=fresh();S.sos=SOS({exh:1});open('sos-status');ok('nobody acknowledged: stays visible with a badge, still resolvable',has(/لم يؤكد أحد استلام/)&&!!q('[data-a="go:sos-resolve"]'));open('sos-log');ok('…and in the list',has(/لم يؤكد أحد/));
 S=fresh();S.sos=SOS();S.net='off';open('sos-status');ok('parent offline: acknowledge and resolve need the internet, call stays',has(/اتصل هاتفياً الآن/)&&!q('[data-a="sosAck"]')&&!q('[data-a="go:sos-resolve"]')&&!!q('[data-a="sosCall"]'));
 S=fresh();S.sos=SOS();setPersona('delegate');setRole('partner');S.g['location.sos.acknowledge']=Object.assign({},S.g['location.view']);delete S.g['location.sos.resolve'];open('sos-status');ok('adult without resolve: locked with a reason, can still acknowledge',!!q('[data-a="denied:location.sos.resolve"]')&&!!q('[data-a="sosAck"]'));q('[data-a="sosAck"]').click();ok('her acknowledgement carries her name',S.sos.ack==='سارة');
 S=fresh();ACT.sosStart();ACT.sosSend();render();ok('father can send too: it goes to the other adult',top()==='sos-sent'&&has(/وصلت إلى 1 من 1/)&&has(/سارة/));
 setPersona('delegate');setRole('partner');render();ok('…and she gets the top card',has(/استغاثة من أحمد/));
 S=fresh();open('sos-log');ok('log: calm state and one past entry with who closed it',has(/لا استغاثة الآن/)&&has(/خالد · 9 نوفمبر/)&&has(/اتصلتُ به وانتهى الأمر/));
 S.sosLog=[];render();ok('log empty: positive wording',has(/كل شيء على ما يرام/));
 // 9 الطفل والمراهق
 S=fresh();setPersona('teen');open('map');ok('teen: own location only, told who sees it and that it cannot be turned off',pins()===1&&has(/أنت هنا/)&&has(/يرى مكانك الدقيق دائماً/)&&has(/لا تُطفأ/)&&!/ليان/.test(q('#scr').innerText));
 open('loc','layan');ok('teen cannot open a sibling detail page',has(/هذه التفاصيل للأهل/)&&!q('#scr .map'));
 for(const id of ['history','emergency','sos-status','sos-log']){open(id);ok('parent screen closed to the teen: '+id,has(/هذه الصفحة للأهل/))}
 S=fresh();setPersona('teen');open('t-me');ok('teen profile links to my location',!!q('#scr [data-a="go:map"]'));S=fresh();setPersona('child');open('c-me');ok('child profile links to it',!!q('#scr [data-a="go:map"]'));
 S=fresh();setPersona('child');open('map');ok('child: simple words, no numbers',has(/بابا/)&&has(/ليطمئن عليك/)&&!has(/متراً/));
 S.gpsOff=true;render();ok('location off on the child device: says so, SOS still works',has(/تحديد الموقع متوقف/)&&has(/زر الاستغاثة يعمل/));
 S=fresh();S.g['location.view'].sc=['khaled'];setPersona('child');open('map');ok('child is told truthfully whether mum sees her',!has(/ترى مكانك أيضاً/));
 // 10 الربط بمركز الأوامر
 S=fresh();tab('home');render();ok('home widget: chips with battery, no age while live',has(/خالد: الصافية · 64%/)&&!has(/خالد: الصافية · 64% · قبل/));
 S.locK='old';render();ok('home widget: stale child carries his age',has(/خالد: الصافية · 64% · قبل 25 د/));
 S.locK='low';render();ok('home widget: battery flagged below 15%',has(/خالد: الصافية · 12%/)&&!!q('#scr .chips .chip.da'));
 S=fresh();open('member','khaled');ok('member page links to his location',!!q('#scr [data-a="go:loc:khaled"]'));
 S=fresh();tab('more');render();typeGs('استغاثة');ok('search finds SOS alerts and contacts',!!q('[data-a="go:sos-log"]')&&!!q('[data-a="go:emergency"]'));
 }catch(e){F.push('CRASH after check #'+N+': '+e.message)}
 // كل أسطح S1-07: لا تجاوز أفقي + لا كلام مهندسين + لا معرّفات
 const over=[],eng=[];const ids=Object.keys(SC).filter(k=>SC[k].sys==='S1-07');const BAD=/[a-z]+\.[a-z_]+\.[a-z_]+|ALLOW|BLOCK|LIMIT|ALERT|IGNORE|Accessibility|DeviceAdmin|VPN|MQTT|Outbox|bitmask|is[A-Z]\w+|step-up|Parent Gate|PIN|نبضة|الرتيبة|القناع|مزامَن|الفرض|ذرّي|نطاق|undefined|null|NaN/;
 for(const id of ids){for(const pre of [null,'guardian','none','co','ios','off']){try{S=fresh();if(pre==='co')S.co={since:'اليوم',seen:0};else if(pre==='ios')S.os='ios';else if(pre==='off')S.net='off';else if(pre)setRole(pre);jump(id);render();const sc=document.getElementById('scr');if(sc&&sc.scrollWidth>sc.clientWidth+1)over.push(id);const sh=ph.querySelector('.sheet');if(sh&&sh.scrollWidth>sh.clientWidth+1)over.push(id+':sheet');
   const m=txt().replace(/SOS/g,'').replace(/[a-z0-9-]+\.(org|com)/g,'').match(BAD);if(m)eng.push(id+(pre?'/'+pre:'')+':'+m[0]);}catch(e){F.push('ERR '+id+' '+(pre||'')+' '+e.message)}}}
 R.over=[...new Set(over)];R.eng=[...new Set(eng)];R.n=ids.length;R.ids=ids.join(' ');R.checks=N;R.fail=F;return R;});
R.errs=errs;}catch(e){R.crash=String(e.stack||e).slice(0,900)}finally{await b.close()}
console.log(JSON.stringify(R,null,1));})();
