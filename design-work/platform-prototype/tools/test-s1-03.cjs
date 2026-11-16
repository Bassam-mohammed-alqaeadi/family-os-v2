// اختبار مسارات S1-03 (الأدوار والصلاحيات) في النموذج: الدور، الصلاحية بعينها، الحساسة، الطلب، نقل الملكية، الحذف والإزالة، السجل.
// يحتاج puppeteer-core و@sparticuz/chromium (غير مضمَّنين في المستودع):  NODE_PATH=<node_modules> node tools/test-s1-03.cjs
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
 const P=window.FOS_PERM;
 // 1 بيانات الصلاحيات: كل ما يُعطى له عنوان ووصف، والمجموعات تغطي الأدوار الثلاثة
 ok('44 grantable',PGIVE.length===44&&new Set(PGIVE).size===44,PGIVE.length);
 ok('all grantable titled',PGIVE.every(k=>PL[k]&&PL[k][0]&&PL[k][1]),PGIVE.filter(k=>!(PL[k]&&PL[k][1])));
 ok('templates inside groups',[...P.partner,...P.guardian,...P.observer].every(k=>PGIVE.includes(k)),[...P.partner,...P.guardian,...P.observer].filter(k=>!PGIVE.includes(k)));
 ok('partner 43 guardian 24 observer 10',P.partner.length===43&&P.guardian.length===24&&P.observer.length===10);
 ok('owner-only never grantable',P.ownerOnly.every(k=>!PGIVE.includes(k)),P.ownerOnly.filter(k=>PGIVE.includes(k)));
 ok('owner-only titled',P.ownerOnly.every(k=>PL[k]),P.ownerOnly.filter(k=>!PL[k]));
 ok('5 sensitive, all grantable',SENS.length===5&&SENS.every(k=>PGIVE.includes(k)));
 // 2 العائلة
 S=fresh();go('family');render();ok('family: role chip',/شريك/.test(txt())&&/المالك/.test(txt()));ok('family: owner links',!!ph.querySelector('[data-a="go:perm-registry"]')&&!!ph.querySelector('[data-a="go:audit"]'));
 setPersona('delegate');go('family');render();ok('family delegate: my perms',!!ph.querySelector('[data-a="go:my-perms"]')&&!ph.querySelector('[data-a="go:perm-registry"]'));
 // 3 ملف البالغ
 S=fresh();go('member','sara');render();ok('member: 9 groups',ph.querySelectorAll('[data-a^="go:perm-group:"]').length===9);ok('member: role/scope/until',/الدور/.test(txt())&&/كل الأطفال/.test(txt())&&/حتى تلغيها/.test(txt()));ok('member: no key ids',!/[a-z]+\.[a-z_]+\.[a-z_]+/.test(txt()),(txt().match(/[a-z]+\.[a-z_]+\.[a-z_.]+/)||[])[0]);
 go('member','ahmad');render();ok('owner profile: owner-only list + transfer',/تبقى له وحده/.test(txt())&&!!ph.querySelector('[data-a="go:transfer"]'));
 // 4 تغيير الدور: معاينة ← الرقم السري ← تراجع
 S=fresh();go('member','sara');go('role-pick');render();ok('role-pick: 4 roles',ph.querySelectorAll('.sheet button.card').length===4);
 ACT.rolePick('guardian');render();ok('diff opens',top()==='tpl-diff'&&/لن تستطيع بعدها \((١٩|19)\)/.test(txt()),txt().slice(0,300));ok('diff: no ids',!/[a-z]+\.[a-z_]+\.[a-z_]+/.test(txt()));
 ACT.tplApply('guardian');render();ok('apply needs pin',!!S.pin&&S.tpl==='partner');pin();ok('applied',S.tpl==='guardian'&&S.audit[0].k==='roles.template.apply');ok('nav shrinks for guardian',(()=>{setPersona('delegate');render();return !can('protection.rule.edit')&&can('tasks.approve')})());
 S=fresh();S.tpl='observer';go('tpl-diff','partner');render();ok('diff: sensitive notice',/حساسة/.test(txt()));S.net='off';render();ok('diff offline blocked',ph.querySelector('.sheet .btn[data-a^="tplApply"]').disabled===true);
 S=fresh();S.conflict=true;ACT.tplApply('guardian');render();ok('conflict → dialog, no change',top()==='dlg'&&S.tpl==='partner'&&/جهاز آخر/.test(txt()));
 // 5 صلاحية بعينها
 S=fresh();go('perm-group','tasks');render();ok('group: toggles',ph.querySelectorAll('.tg,[role="switch"]').length>=6,ph.querySelectorAll('[data-a^="permT:"]').length);
 ACT.permT('tasks.approve');render();ok('revoke immediate no pin',!grantsOf().includes('tasks.approve')&&!S.sheet&&!S.full&&/سُحبت/.test(txt()));ok('role marked edited',/معدَّل/.test(roleName()));
 ok('revoke audit',S.audit[0].k==='roles.grant.revoke');ACT.permT('tasks.approve');render();ok('re-grant non-sensitive no pin',grantsOf().includes('tasks.approve')&&!S.gx.rem.length);
 S=fresh();S.tpl='observer';go('perm-group','chat');render();ok('sensitive chip',/حساسة/.test(txt()));const a0=S.audit.length;ACT.permT('chat.minor.view');render();ok('sensitive grant asks pin',!grantsOf().includes('chat.minor.view')&&/حساسة/.test(txt()));pin();ok('sensitive granted after pin',grantsOf().includes('chat.minor.view')&&S.gx.add.includes('chat.minor.view')&&S.audit.length===a0+1);
 ACT.permT('chat.minor.view');render();ok('sensitive revoke no pin',!grantsOf().includes('chat.minor.view'));
 S=fresh();S.tpl='observer';S.net='off';go('perm-group','chat');render();ACT.permT('chat.minor.view');render();ok('sensitive offline refused, not queued',!grantsOf().includes('chat.minor.view')&&/يحتاج اتصالاً/.test(txt()));ACT.permT('chat.parents.view');render();ok('normal offline queued',grantsOf().includes('chat.parents.view')&&/عند عودة الاتصال/.test(txt()));
 S=fresh();S.conflict=true;go('perm-group','chat');render();ok('conflict banner',/جهاز آخر/.test(txt()));ACT.permT('chat.parents.view');ok('conflict blocks toggle',grantsOf().includes('chat.parents.view'));
 S=fresh();go('perm-key','chat.minor.view');render();ok('key sheet: human',/قراءة محادثات الأطفال/.test(txt())&&!/chat\.minor/.test(txt()));
 // 6 على من وإلى متى
 S=fresh();go('grant-terms');render();ACT.gScope('layan');ACT.gUntil('m');render();ok('scope+until set',S.gScope.join()==='layan'&&S.gUntil==='m');S.sheet=null;go('member','sara');render();ok('member shows scope',/ليان/.test(txt())&&/شهر واحد/.test(txt()));
 ACT.gScope('layan');S.sheet={id:'grant-terms',a:[]};render();ok('empty scope warned',/طفلاً واحداً على الأقل/.test(txt()));
 S=fresh();S.tpl='none';S.gScope=S.gUntil=null;go('tpl-diff','observer');render();ok('no preselected terms: apply blocked',ph.querySelector('.sheet .btn[data-a^="tplApply"]').disabled===true&&/اختر على من وإلى متى/.test(txt()));ACT.gScope('all');render();ok('scope alone not enough',ph.querySelector('.sheet .btn[data-a^="tplApply"]').disabled===true);ACT.gUntil('');render();ok('terms chosen: apply enabled',ph.querySelector('.sheet .btn[data-a^="tplApply"]').disabled===false);
 S=fresh();S.sheet={id:'grant-terms',a:['guardian']};render();ACT.gtDone('guardian');render();ok('terms sheet returns to preview',top()==='tpl-diff');
 // 7 سحب الكل
 S=fresh();go('member','sara');render();ACT.revokeAll();render();ok('revoke all confirm',top()==='dlg');dlgYes();ok('revoked all',S.tpl==='none'&&S.gScope===null&&S.gUntil===null&&/بلا صلاحيات/.test(txt()));setPersona('delegate');render();ok('delegate none: still in family',top()!=='ob-welcome'&&isAdult());
 // 8 صلاحياتي + الطلب
 S=fresh();S.tpl='guardian';setPersona('delegate');go('my-perms');render();ok('my-perms: request buttons',ph.querySelectorAll('[data-a^="preqSend:"]').length===44-24,ph.querySelectorAll('[data-a^="preqSend:"]').length);ok('my-perms: seed rights line',/حقّان لك دائماً/.test(txt()));
 const al=S.alerts.length;ACT.preqSend('protection.rule.edit');render();ok('request sent, no alert-as-denial',S.preq.length===1&&S.alerts.length===al&&/بانتظار أحمد/.test(txt()));
 setPersona('owner');render();ok('owner sees request',attention().some(a=>/سارة تطلب صلاحية/.test(a.t)));go('perm-request','0');render();ACT.preqOk('0');render();ok('request granted',grantsOf().includes('protection.rule.edit')&&S.preq[0].st==='ok');
 S=fresh();S.tpl='observer';setPersona('delegate');ACT.preqSend('chat.minor.view');setPersona('owner');ACT.preqOk('0');render();ok('sensitive request needs pin',!grantsOf().includes('chat.minor.view'));pin();ok('sensitive request granted',grantsOf().includes('chat.minor.view'));
 S=fresh();S.tpl='none';setPersona('delegate');go('my-perms');render();ok('none: empty + ask role',/لم تُمنحي صلاحيات بعد/.test(txt())&&!!ph.querySelector('[data-a="preqSend:role"]'));
 // 9 القفل: العادي صامت، والحساس يُسجَّل
 S=fresh();S.tpl='observer';setPersona('delegate');const a1=S.alerts.length,u1=S.audit.length;ACT.denied('tasks.approve');render();ok('plain lock silent',S.alerts.length===a1&&S.audit.length===u1&&top()==='why'&&/اعتماد مهمة/.test(txt())&&!!ph.querySelector('[data-a="preqSend:tasks.approve"]'));
 ACT.denied('protection.quota.edit');render();ok('owner-only lock: no request',!ph.querySelector('[data-a^="preqSend:"]')&&/لأحمد وحده/.test(txt())&&!/protection\./.test(txt()));
 ACT.denied('chat.minor.view');render();ok('sensitive denial logged + alert',S.alerts.length===a1+1&&S.audit.length===u1+1&&S.audit[0].deny===1);
 setPersona('owner');go('denial',S.alerts[0].id);render();ok('denial detail',/رُفض/.test(txt())&&/قراءة محادثات الأطفال/.test(txt()));ACT.denialAck(S.alerts[0].id);render();ok('denial acked',S.alerts[0].open===0);
 // 10 الدليل والسجل
 S=fresh();go('perm-registry');render();ok('registry: no ids no counts',!/[a-z]+\.[a-z_]+\.[a-z_]+/.test(txt())&&/للمالك وحده/.test(txt()));ACT.pgF('sens');render();ok('registry sensitive filter = 5',ph.querySelectorAll('#scr .list .row').length===5,ph.querySelectorAll('#scr .list .row').length);
 S=fresh();go('audit');render();ok('audit all',ph.querySelectorAll('.tl .ev').length===S.audit.length);ACT.auF('deny');render();ok('audit deny filter',ph.querySelectorAll('.tl .ev').length===S.audit.filter(a=>a.deny).length);ok('audit no ids',!/[a-z]+\.[a-z_]+\.[a-z_]+/.test(txt()));S.audit=[];ACT.auF('all');render();ok('audit empty',/لا أحداث بعد/.test(txt()));
 // 11 نقل الملكية
 S=fresh();go('transfer');render();ok('transfer: adults only',!/خالد|ليان|يوسف/.test(document.querySelector('#scr .list').innerText));ACT.transferGo();render();ok('transfer needs pin',!S.xfer);pin();ok('transfer pending 7d',S.xfer.st==='pending'&&S.xfer.left===7&&/بانتظار قبول سارة/.test(txt()));
 go('family');render();ok('family shows pending transfer',/بانتظار قبولها/.test(txt()));
 setPersona('delegate');render();ok('recipient attention',attention().some(a=>/نقل ملكية/.test(a.t)));go('transfer-accept');render();ok('accept screen',/تصيرين المالكة/.test(txt()));ACT.xferAccept();render();pin();ok('accepted',S.xfer.st==='done'&&/أنتِ المالكة الآن/.test(txt()));
 S=fresh();S.xfer={to:'sara',left:7,st:'pending'};setPersona('delegate');go('transfer-accept');ACT.xferDecline();dlgYes();ok('declined',S.xfer.st==='declined');setPersona('owner');go('transfer');render();ok('owner sees decline',/لم تقبل/.test(txt()));
 S=fresh();S.xfer={to:'sara',left:7,st:'pending'};go('transfer');render();ok('single pending: no second start',!ph.querySelector('[data-a="transferGo"]'));ACT.xferCancel();dlgYes();ok('cancelled',S.xfer===null&&!!ph.querySelector('[data-a="transferGo"]'));
 S=fresh();S.removed.sara=30;go('transfer');render();ok('no other adult',/لا بالغ آخر/.test(txt()));S=fresh();S.net='off';go('transfer');render();ok('transfer offline blocked',ph.querySelector('[data-a="transferGo"]').disabled===true);
 // 12 حذف العائلة
 S=fresh();go('family-delete');render();ACT.famDelGo();render();ok('name required',S.fdErr===1&&!S.famDel&&/غير مطابق/.test(txt()));document.getElementById('fdN').value='عائلة المنصور';ACT.famDelGo();render();ok('delete needs pin',!S.famDel);pin();ok('delete pending 30',S.famDel===30&&/تُحذف بعد (٣٠|30) يوماً/.test(txt()),txt().slice(0,120));
 go('family');render();ok('family shows deletion',/تُحذف بعد/.test(txt()));ACT.famDelCancel();render();ok('delete cancelled',S.famDel===0);
 S=fresh();go('family-settings');render();ok('settings → delete screen',!!ph.querySelector('[data-a="go:family-delete"]'));
 // 13 إزالة فرد
 S=fresh();S.xfer={to:'sara',left:7,st:'pending'};go('member-remove','sara');render();ok('remove: transfer cancel noted',/طلب نقل الملكية/.test(txt()));ACT.memRemove('sara');render();ok('remove needs pin',!S.removed.sara);pin();ok('removed 30d + transfer dropped',S.removed.sara===30&&S.xfer===null&&/أُزيلت سارة/.test(txt()));
 ACT.memRestore('sara');render();ok('restored',!S.removed.sara);go('member-remove','ahmad');render();ok('owner not removable',/المالك لا يُزال/.test(txt()));
 S=fresh();go('member','khaled');render();ok('teen: single delegation toggle',!!ph.querySelector('[data-a="teenT:"]')&&!!ph.querySelector('[data-a="go:member-remove:khaled"]'));ACT.teenT('');ok('teen off',S.teenTasks===false);
 setPersona('teen');go('t-me');render();ok('teen can ask',!!ph.querySelector('[data-a="preqSend:teen"]'));ACT.preqSend('teen');setPersona('owner');ACT.preqOk('0');ok('teen request granted',S.teenTasks===true);
 // 14 بلوغ 13
 S=fresh();go('turn13');render();ok('turn13 before',/2030|٢٠٣٠/.test(txt())&&!ph.querySelector('[data-a="rev13Done"]'));S.rev13=1;go('family');render();ok('family review prompt',/صارت مراهقة/.test(txt()));go('turn13','now');render();ok('turn13 now: decision',!!ph.querySelector('[data-a="rev13Done"]')&&!!ph.querySelector('[data-a="teenT:13"]'));ACT.rev13Done();ok('reviewed',S.rev13===2);
 // 15 كل أسطح S1-03: لا تجاوز أفقي + لا كلام مهندسين + لا معرّفات
 const over=[],eng=[];const ids=Object.keys(SC).filter(k=>SC[k].sys==='S1-03');for(const id of ids){for(const pre of [null,'guardian','none']){try{S=fresh();if(pre)S.tpl=pre;jump(id);render();const sc=document.getElementById('scr');if(sc&&sc.scrollWidth>sc.clientWidth+1)over.push(id);
   if(/[a-z]+\.[a-z_]+\.[a-z_]+|PERM_|scope|valid_until|deny|قالب|القوالب|مفتاح ذري|مفاتيح|المصفوفة|step-up|409|Parent Gate|PIN/.test(txt()))eng.push(id+':'+(txt().match(/[a-z]+\.[a-z_]+\.[a-z_]+|PERM_|scope|valid_until|deny|قالب|القوالب|مفتاح ذري|مفاتيح|المصفوفة|step-up|409|Parent Gate|PIN/)||[])[0]);}catch(e){F.push('ERR '+id+' '+e.message)}}}
 R.over=over;R.eng=eng;R.n=ids.length;R.ids=ids.join(' ');R.checks=N;R.fail=F;return R;});
R.errs=errs;}catch(e){R.crash=String(e.stack||e).slice(0,900)}finally{await b.close()}
console.log(JSON.stringify(R,null,1));})();
