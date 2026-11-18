// اختبار بوابة الوالدين والتأكيد بالبصمة (S1-01، Q-418): الرقم السري افتراضي، والبصمة باختيار صاحب الهاتف على هاتف الأهل وحده،
// والحالات التي يبقى فيها الرقم السري مطلوباً: جهاز الابن، تشغيل البصمة وتغيير الرقم، ثلاث محاولات فاشلة أو تغيّر البصمات، ومرة كل 30 يوماً.
// يحتاج puppeteer-core و@sparticuz/chromium (غير مضمَّنين في المستودع):  NODE_PATH=<node_modules> node tools/test-s1-01.cjs
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
 const T=()=>document.querySelector('#toast').textContent;const noT=()=>{document.querySelector('#toast').innerHTML=''};
 const cl=sel=>{q(sel).click();render()};const fp=()=>{S.bioAct=true};const bad=()=>{ACT.bcBad();render()};const A=()=>S.full?S.full.a:[];
 // 1 البذرة
 S=fresh();ok('seed: confirming by fingerprint is off, the secret number was typed 12 days ago',S.bioAct===false&&S.bio===false&&S.pinAgo===12&&PIN_EVERY===30);
 ok('seed: the fingerprint confirmation surface exists',!!SC['bio-confirm']&&SC['bio-confirm'].kind==='full'&&SC['bio-confirm'].sys==='S1-01');
 // 2 الافتراضي: الرقم السري
 S=fresh();open('trial');ACT.trGo();render();ok('default: a sensitive action asks for the secret number',top()==='pin'&&!q('[data-a="pinBio"]')&&!q('.pinwhy'));
 pin();ok('default: the secret number confirms it',S.planSt==='trial'&&!S.full&&S.pinAgo===0);noT();
 S=fresh();open('security');ok('security: two separate fingerprint switches, both off',q('[data-a="bioT"]').getAttribute('aria-checked')==='false'&&q('[data-a="bioActT"]').getAttribute('aria-checked')==='false'&&has(/افتح التطبيق بالبصمة/)&&has(/أكّد الأفعال الحساسة بالبصمة/)&&has(/الآن تؤكَّد بالرقم السري/));
 ok('security: says which actions are meant, no warning while off',has(/تغيير الخطة والدفع، منح صلاحية حساسة، إيقاف القواعد، حذف فرد أو العائلة/)&&!has(/كل من له بصمة مسجّلة/));
 // 3 التشغيل
 cl('[data-a="bioActT"]');ok('turning it on needs the secret number, never the fingerprint',top()==='pin'&&!S.bioAct&&A()[1]==='pin'&&!q('[data-a="pinBio"]'));
 ACT.pinX();render();ok('closing the pad leaves it off',!S.bioAct&&!S.full);
 cl('[data-a="bioActT"]');pin();ok('on after the secret number, logged',S.bioAct===true&&/تؤكَّد الآن بالبصمة/.test(T())&&/شُغّل تأكيد الأفعال الحساسة بالبصمة/.test(S.audit[0].t)&&S.audit[0].k==='identity.biometric.enable');noT();
 ok('security when on: who can confirm is said beside the switch',q('[data-a="bioActT"]').getAttribute('aria-checked')==='true'&&has(/كل من له بصمة مسجّلة في هذا الهاتف يستطيع تأكيد هذه الأفعال باسمك/)&&has(/بدل الرقم السري، على هذا الهاتف/));
 ok('security when on: the four cases the secret number stays for',has(/على أجهزة الأبناء/)&&has(/لتغيير الرقم أو تشغيل البصمة/)&&has(/بعد ثلاث محاولات فاشلة أو تغيّر بصمات الهاتف/)&&has(/مرة كل 30 يوماً حتى لا تنساه/));
 ok('security when on: when the secret number is next asked',has(/نطلبه منك مرة بعد 30 يوماً/));
 ok('the app-open switch is independent',S.bio===false);
 S=fresh();S.pin.set=false;open('security');ACT.bioActT();render();ok('no secret number yet: cannot be turned on',!S.bioAct&&!S.full&&/أنشئ الرقم السري أولاً/.test(T()));noT();
 // 4 التأكيد بالبصمة
 S=fresh();fp();open('trial');ACT.trGo();render();
 ok('on: the action asks for the fingerprint, not the number',top()==='bio-confirm'&&has(/أكّد أنك أنت/)&&has(/بدء التجربة/)&&has(/المس حساس البصمة/)&&!q('.pad')&&S.plan==='free');
 ok('on: the secret number is always one tap away, and the screen can be closed',!!q('[data-a="bcPin"]')&&!!q('[data-a="pinX"]')&&[...ph.querySelectorAll('#ov button,#full button')].length>=0);
 cl('[data-a="bcOk"]');ok('fingerprint confirms the action',S.planSt==='trial'&&!S.full&&BL().trialUsed===1&&S.pinAgo===12);noT();
 S=fresh();fp();open('trial');ACT.trGo();render();cl('[data-a="pinX"]');ok('closing the fingerprint screen does nothing',!S.full&&S.plan==='free'&&!S.planSt);
 S=fresh();fp();open('trial');ACT.trGo();render();cl('[data-a="bcPin"]');ok('choosing the secret number: the pad, with a way back to the fingerprint',top()==='pin'&&!q('.pinwhy')&&!!q('[data-a="pinBio"]'));
 cl('[data-a="pinBio"]');ok('back to the fingerprint with the same action',top()==='bio-confirm'&&has(/بدء التجربة/));cl('[data-a="bcPin"]');pin();ok('the number confirms the same action',S.planSt==='trial');noT();
 S=fresh();fp();open('trial');ACT.trGo();render();bad();ok('one failed touch: said, two left',top()==='bio-confirm'&&has(/لم نتعرف على البصمة\. بقيت محاولتان/)&&S.plan==='free');
 bad();ok('two failed touches: one left',has(/بقيت محاولة واحدة/));
 bad();ok('three failed touches: the secret number, with the reason, and no fingerprint again',top()==='pin'&&has(/ثلاث محاولات لم تنجح بالبصمة/)&&!q('[data-a="pinBio"]')&&S.plan==='free'&&/ثلاث محاولات فاشلة بالبصمة/.test(S.audit[0].t));
 ACT.pinBio();render();ok('after three failures the fingerprint cannot be forced',top()==='pin');pin();ok('the number then confirms',S.planSt==='trial');noT();
 S=fresh();fp();open('trial');ACT.trGo();render();bad();ACT.pinX();render();ACT.trGo();render();ok('failures do not carry over to the next confirmation',top()==='bio-confirm'&&has(/المس حساس البصمة/));
 // 5 الأفعال الحساسة كلها على هاتف الأهل
 const ACTS=[['plan change',()=>{open('plan-change','basic');ACT.plGo('basic')}],['top-up',()=>{open('topup');ACT.topGo()}],['remove member',()=>{ACT.memRemove('sara')}],['free mode',()=>{gate('الوضع الحر يوقف كل القواعد',()=>{S.x418=1},'stepup')}],['parents channel',()=>{gate('قناة الوالدين محمية',()=>{S.x418=1})}]];
 ok('on: every confirmation on the parent phone goes to the fingerprint',ACTS.every(([n,f])=>{S=fresh();fp();f();render();return top()==='bio-confirm'}),ACTS.filter(([n,f])=>{S=fresh();fp();f();render();return top()!=='bio-confirm'}).map(x=>x[0]));
 ok('off: the same confirmations go to the secret number',ACTS.every(([n,f])=>{S=fresh();f();render();return top()==='pin'}));
 // 6 ما يبقى بالرقم السري
 S=fresh();fp();setPersona('child');gate('إعدادات الجهاز للأهل',()=>{S.x418=1});render();ok('child device: the secret number only, even when the father chose the fingerprint',top()==='pin'&&!q('[data-a="pinBio"]')&&!q('.pinwhy'));
 ACT.pinBio();render();ok('child device: the fingerprint cannot be forced',top()==='pin'&&!S.x418);
 ok('child and teen devices never get the fingerprint screen',['child','teen'].every(p=>{S=fresh();fp();setPersona(p);gate('فكّ الإقران فعل حساس',()=>{},'stepup');render();return top()==='pin'&&!q('[data-a="pinBio"]')}));
 S=fresh();fp();open('security');ACT.pinChange();render();ok('changing the secret number asks for the number itself',top()==='pin'&&A()[1]==='pin'&&!q('[data-a="pinBio"]'));
 S=fresh();fp();open('security');ACT.bioT();render();ok('turning on app unlock asks for the number itself',top()==='pin'&&!q('[data-a="pinBio"]'));
 S=fresh();fp();open('recovery');ACT.recPick&&0;gate('اختيار من يساعدك',()=>{},'pin');render();ok('a number-only confirmation never offers the fingerprint',top()==='pin'&&!q('[data-a="pinBio"]'));
 S=fresh();fp();S.bioChg=1;open('trial');ACT.trGo();render();ok('fingerprints of the phone changed: the number, with the reason',top()==='pin'&&has(/تغيّرت بصمات هذا الهاتف، فالتأكيد الآن بالرقم السري/)&&!q('[data-a="pinBio"]'));
 ACT.pinX();open('rekey');ACT.rekeyGo();render();ok('re-trusting the phone is by the number',top()==='pin');pin();ok('after re-trusting, the fingerprint works again',S.bioChg===0&&(open('trial'),ACT.trGo(),render(),top()==='bio-confirm'));noT();
 S=fresh();fp();S.pinAgo=30;open('trial');ACT.trGo();render();ok('thirty days without typing it: the number once, with the reason',top()==='pin'&&has(/مرّ 30 يوماً على آخر مرة كتبت فيها رقمك السري/)&&has(/حتى لا تنساه/)&&!q('[data-a="pinBio"]'));
 pin();ok('typing it resets the count',S.pinAgo===0&&S.planSt==='trial');noT();ACT.blCancel&&0;S.plan='free';S.planSt='';S.bl=null;open('topup');ACT.topGo();render();ok('the next confirmation is by fingerprint again',top()==='bio-confirm');
 S=fresh();fp();S.pinAgo=29;open('trial');ACT.trGo();render();ok('twenty-nine days: still the fingerprint',top()==='bio-confirm');
 S=fresh();fp();S.pinAgo=31;open('security');ok('security: says the number is due at the next confirmation',has(/نطلبه منك في التأكيد القادم/));
 S=fresh();fp();S.pin.lock=120;open('trial');ACT.trGo();render();ok('gate locked after wrong numbers: the fingerprint does not open it',top()==='pin'&&has(/البوابة مقفلة مؤقتاً/)&&!q('.pad'));S.pin.lock=0;
 // 7 الإطفاء وتغيير الرقم
 S=fresh();fp();open('security');cl('[data-a="bioActT"]');ok('turning it off needs nothing and is logged',S.bioAct===false&&!S.full&&/عاد التأكيد بالرقم السري/.test(T())&&/أُطفئ تأكيد الأفعال الحساسة بالبصمة/.test(S.audit[0].t));noT();
 open('trial');ACT.trGo();render();ok('off again: back to the secret number',top()==='pin');
 S=fresh();fp();S.ps={kind:'change',step:'new',a:'',err:''};S.full={id:'pin-set',a:[]};render();for(const k of '739104')ACT.psK(k);render();for(const k of '739104')ACT.psK(k);render();
 ok('a new secret number turns the fingerprint confirmation off',S.pin.code==='739104'&&S.bioAct===false&&S.audit.some(a=>/بعد تغيير الرقم السري/.test(a.t)),[S.pin.code,S.bioAct,S.ps&&S.ps.step,S.ps&&S.ps.err]);
 // 8 اللوحة
 S=fresh();Studio.act.flip('bioAct');ok('studio: the switch turns it on',S.bioAct===true);Studio.act.set('pinAgo','31');ok('studio: thirty-one days since the number',S.pinAgo===31);
 ok('journey exists with six steps',JOURNEYS.some(j=>j.t==='التأكيد بالبصمة'&&j.s.length===6));
 ok('journey steps run without error',(()=>{try{S=fresh();JOURNEYS.find(j=>j.t==='التأكيد بالبصمة').s.forEach(x=>{x[1]();render()});return top()==='pin'&&mode()!=='parent'}catch(e){return String(e)}})()===true);
 }catch(e){F.push('CRASH after check #'+N+': '+e.message)}
 // كل أسطح S1-01: لا تجاوز أفقي + لا كلام مهندسين + لا معرّفات
 const over=[],eng=[];const ids=Object.keys(SC).filter(k=>SC[k].sys==='S1-01');const BAD=/[a-z]+\.[a-z_]+\.[a-z_]+|ALLOW|BLOCK|LIMIT|ALERT|IGNORE|Accessibility|DeviceAdmin|VPN|MQTT|Outbox|bitmask|is[A-Z]\w+|step-up|Parent Gate|PIN|نبضة|الرتيبة|القناع|مزامَن|الفرض|ذرّي|نطاق|undefined|null|NaN/;
 for(const id of ids){for(const pre of [null,'guardian','none','co','ios','off']){try{S=fresh();if(pre==='co')S.co={since:'اليوم',seen:0};else if(pre==='ios')S.os='ios';else if(pre==='off')S.net='off';else if(pre)setRole(pre);jump(id);render();const sc=document.getElementById('scr');if(sc&&sc.scrollWidth>sc.clientWidth+1)over.push(id);const sh=ph.querySelector('.sheet');if(sh&&sh.scrollWidth>sh.clientWidth+1)over.push(id+':sheet');
   const m=txt().replace(/SOS/g,'').replace(/[a-z0-9-]+\.(org|com)/g,'').match(BAD);if(m)eng.push(id+(pre?'/'+pre:'')+':'+m[0]);}catch(e){F.push('ERR '+id+' '+(pre||'')+' '+e.message)}}}
 R.over=[...new Set(over)];R.eng=[...new Set(eng)];R.n=ids.length;R.ids=ids.join(' ');R.checks=N;R.fail=F;return R;});
R.errs=errs;}catch(e){R.crash=String(e.stack||e).slice(0,900)}finally{await b.close()}
console.log(JSON.stringify(R,null,1));})();
