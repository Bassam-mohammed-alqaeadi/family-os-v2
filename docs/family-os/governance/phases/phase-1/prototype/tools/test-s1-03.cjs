// اختبار مسارات S1-03 (الأدوار والصلاحيات) في النموذج: الدور ومحتواه، الصلاحية الواحدة بحالاتها الثلاث وحدّيها، الحساسة، الطلب، الصلاحية الكاملة، الحذف والإزالة، السجل.
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
 const P=window.FOS_PERM;const dis=sel=>{const e=ph.querySelector(sel);return !e||e.disabled===true};const noIds=()=>!/[a-z]+\.[a-z_]+\.[a-z_]+/.test(txt());
 // 1 بيانات الصلاحيات: كل الـ95 معنونة، وما يُعطى له وصف، والمجموعات تغطي الأدوار الثلاثة
 ok('95 keys all titled',P.all.length===95&&P.all.every(k=>PL[k]&&PL[k][0]),P.all.filter(k=>!PL[k]));
 ok('44 grantable with description',PGIVE.length===44&&new Set(PGIVE).size===44&&PGIVE.every(k=>PL[k][1]));
 ok('templates inside groups',[...P.partner,...P.guardian,...P.observer].every(k=>PGIVE.includes(k)));
 ok('partner 43 guardian 24 observer 10',P.partner.length===43&&P.guardian.length===24&&P.observer.length===10);
 ok('owner-only never grantable',P.ownerOnly.length===28&&P.ownerOnly.every(k=>!PGIVE.includes(k)));
 ok('5 sensitive, all grantable',SENS.length===5&&SENS.every(k=>PGIVE.includes(k)));
 ok('family-scope keys grantable',FAMK.every(k=>PGIVE.includes(k)));
 S=fresh();ok('seed: partner copy 43, all kids, no expiry',grantsOf().length===43&&S.g['tasks.approve'].sc==='all'&&S.g['tasks.approve'].un===''&&S.g['chat.parents.view'].sc==='fam');
 // 2 العائلة: بحث بالاسم، عدد الصلاحيات، أقرب انتهاء
 S=fresh();go('family');render();ok('family: role chip + count',/شريك/.test(txt())&&/(43|٤٣) صلاحية/.test(txt())&&/المالك/.test(txt()));ok('family: owner links',!!ph.querySelector('[data-a="go:roles"]')&&!!ph.querySelector('[data-a="go:perm-registry"]')&&!!ph.querySelector('[data-a="go:audit"]'));
 const si=ph.querySelector('[data-srch="fam"]');si.value='لي';si.dispatchEvent(new Event('input',{bubbles:true}));ok('family search filters',[...ph.querySelectorAll('[data-srch-box="fam"] [data-q]')].filter(r=>!r.hidden).length===1);si.value='زز';si.dispatchEvent(new Event('input',{bubbles:true}));ok('family search empty',ph.querySelector('[data-srch-empty="fam"]').hidden===false);
 si.value='ساره';si.dispatchEvent(new Event('input',{bubbles:true}));ok('search normalises ة/ه',[...ph.querySelectorAll('[data-srch-box="fam"] [data-q]')].filter(r=>!r.hidden).length===1);
 S=fresh();S.g['location.view'].un=addDays(5);go('family');render();ok('family: nearest expiry + renew',/أقرب انتهاء بعد (5|٥) أيام/.test(txt())&&!!ph.querySelector('[data-a="keyOpen:location.view"]'));ok('home attention: expiring',attention().some(a=>/تنتهي بعد/.test(a.t)));
 setPersona('delegate');go('family');render();ok('family delegate: my perms, no roles',!!ph.querySelector('[data-a="go:my-perms"]')&&!ph.querySelector('[data-a="go:roles"]'));
 // 3 ملف البالغ: ملخص وقائمة كاملة
 S=fresh();go('member','sara');render();ok('member: 9 groups',ph.querySelectorAll('[data-a^="go:perm-group:"]').length===9);ok('member: role/scope/until',/الدور/.test(txt())&&/كل الأطفال/.test(txt())&&/حتى تلغيها/.test(txt()));ok('member: no key ids',noIds());
 ACT.mvSet('all');render();ok('member: full list 44',ph.querySelectorAll('[data-a^="keyOpen:"]').length===44,ph.querySelectorAll('[data-a^="keyOpen:"]').length);ok('member: recent changes',/آخر التعديلات/.test(txt()));
 go('member','ahmad');render();ok('owner profile: full authority entry',!!ph.querySelector('[data-a="go:transfer"]')&&/لا يزيله أحد/.test(txt()));
 // 4 تغيير الدور: معاينة ← حدود ← الرقم السري ← تقرير
 S=fresh();go('member','sara');go('role-pick');render();ok('role-pick: 4 roles',ph.querySelectorAll('.sheet button.card').length===4);
 ACT.rolePick('guardian');render();ok('diff opens',top()==='tpl-diff'&&/لن تستطيع بعدها \((١٩|19)\)/.test(txt()));ok('diff: no ids',noIds());ok('diff keeps current terms',S.rt.sc==='all'&&S.rt.un==='');
 ACT.tplApply('guardian');render();ok('apply needs pin',!!S.full&&S.tpl==='partner');pin();ok('applied + report',S.tpl==='guardian'&&grantsOf().length===24&&top()==='tpl-diff'&&/صارت سارة وصي محدود/.test(txt())&&S.audit[0].act==='role');
 ok('guardian cannot edit rules',(()=>{setPersona('delegate');return !can('protection.rule.edit')&&can('tasks.approve')})());
 S=fresh();setRole('none');ACT.rolePick('observer');render();ok('no preselected terms: apply blocked',dis('.sheet .btn[data-a^="tplApply"]')&&/اختر على من وإلى متى/.test(txt()));ACT.tSc('r','layan');render();ok('scope alone not enough',dis('.sheet .btn[data-a^="tplApply"]'));ACT.tUn('r','30');render();ok('terms chosen: apply enabled',!dis('.sheet .btn[data-a^="tplApply"]')&&S.rt.un===addDays(30));
 ACT.tplApply('observer');pin();ok('role with scope+date applied',S.g['location.view'].sc.join()==='layan'&&S.g['location.view'].un===addDays(30));setPersona('delegate');ok('scope enforced per child',can('location.view','layan')&&!can('location.view','khaled'));
 S=fresh();setRole('observer');S.sheet={id:'grant-terms',a:['guardian']};render();ACT.gtDone('guardian');render();ok('terms sheet returns to preview',top()==='tpl-diff');
 S=fresh();setRole('observer');ACT.rolePick('partner');render();ok('diff: sensitive notice',/حساسة/.test(txt()));S.net='off';render();ok('diff offline blocked',dis('.sheet .btn[data-a^="tplApply"]'));
 S=fresh();S.conflict=true;ACT.rolePick('guardian');ACT.tplApply('guardian');render();ok('conflict → dialog, no change',top()==='dlg'&&S.tpl==='partner'&&/جهاز آخر/.test(txt()));
 // 5 صلاحية واحدة: ثلاث حالات + حدّان
 S=fresh();go('perm-group','tasks');render();ok('group: 6 toggles + state line',ph.querySelectorAll('.tg').length===6&&/مسموح · كل الأطفال · حتى تلغيها/.test(txt()));
 ACT.keyOpen('tasks.approve','off');render();ok('revoke sheet: effect text',top()==='perm-key'&&/لا مهلة تراجع/.test(txt())&&/اسحب الصلاحية/.test(txt()));ACT.keySave();render();ok('revoke immediate no pin',!S.g['tasks.approve']&&!S.full&&/سُحبت/.test(txt())&&S.audit[0].act==='revoke');ok('role marked edited',/معدَّل/.test(roleName()));
 ACT.keyOpen('tasks.approve','grant');render();ok('new grant: nothing preselected, save blocked',S.kd.sc===null&&S.kd.un===null&&dis('.sheet .btn[data-a="keySave"]'));ACT.tSc('k','khaled');ACT.tSc('k','layan');ACT.tUn('k','7');render();ok('grant enabled after terms',!dis('.sheet .btn[data-a="keySave"]'));ACT.keySave();render();ok('granted with own scope+date',S.g['tasks.approve'].sc.join()==='khaled,layan'&&S.g['tasks.approve'].un===addDays(7)&&S.g['tasks.approve'].src==='own'&&!S.full);
 go('member','sara');render();ok('member: expiring callout + mixed terms',/تنتهي قريباً/.test(txt())&&/مختلف/.test(txt()));
 ACT.keyOpen('tasks.approve');ACT.tUn('k','x');render();ok('custom date field',!!ph.querySelector('#unD')&&dis('.sheet .btn[data-a="keySave"]'));ph.querySelector('#unD').value='2026-11-10';dRead();render();ok('past date rejected',S.kd.un===null&&/بعد اليوم/.test(txt()));ph.querySelector('#unD').value='2027-02-15';dRead();render();ok('custom date accepted',S.kd.un==='2027-02-15');ACT.keySave();render();ok('edit saved',S.g['tasks.approve'].un==='2027-02-15'&&S.audit[0].act==='edit'&&/15 فبراير 2027|١٥ فبراير ٢٠٢٧/.test(gLine('tasks.approve')));
 S=fresh();S.g['location.view'].un='2026-11-01';ok('expired grant not usable',!grantsOf().includes('location.view')&&(()=>{setPersona('delegate');return !can('location.view')})());
 // الممنوع: رفض صريح يغلب الدور
 S=fresh();ACT.keyOpen('chat.minor.view','deny');render();ok('deny explained',/أقوى من/.test(txt()));ACT.tSc('k','all');ACT.tUn('k','');ACT.keySave();render();ok('deny set, no pin',S.g['chat.minor.view'].d===1&&!S.full&&!grantsOf().includes('chat.minor.view'));
 ACT.rolePick('partner');render();ok('diff: stays denied',/تبقى ممنوعة/.test(txt()));ACT.rolePick('guardian');ACT.tplApply('guardian');pin();ok('deny survives role change',S.g['chat.minor.view']&&S.g['chat.minor.view'].d===1&&!grantsOf().includes('chat.minor.view'));
 S.sheet=null;setPersona('delegate');go('my-perms');render();ok('delegate sees denied + can ask',/منعها أحمد/.test(txt())&&!!ph.querySelector('[data-a="preqSend:chat.minor.view"]'));
 // الحساسة
 S=fresh();setRole('observer');go('perm-group','chat');render();ok('sensitive chip',/حساسة/.test(txt()));const a0=S.audit.length;ACT.keyOpen('chat.minor.view','grant');ACT.tSc('k','all');ACT.tUn('k','');render();ok('sensitive label asks pin',/امنح بالرقم السري/.test(txt()));ACT.keySave();render();ok('sensitive grant asks pin',!grantsOf().includes('chat.minor.view')&&!!S.full);pin();ok('sensitive granted after pin',grantsOf().includes('chat.minor.view')&&S.audit.length===a0+1);
 ACT.keyOpen('chat.minor.view','off');ACT.keySave();render();ok('sensitive revoke no pin',!grantsOf().includes('chat.minor.view')&&!S.full);
 S=fresh();setRole('observer');S.net='off';ACT.keyOpen('chat.minor.view','grant');ACT.tSc('k','all');ACT.tUn('k','');render();ok('sensitive offline blocked, not queued',dis('.sheet .btn[data-a="keySave"]')&&/لا تُحفظ للإرسال/.test(txt()));ACT.keySave();ok('still not granted',!S.g['chat.minor.view']&&S.outbox.length===0);
 ACT.keyOpen('chat.parents.view','grant');ACT.tUn('k','');render();ok('family-scope key: no child picker',/العائلة كلها/.test(txt())&&!ph.querySelector('.sheet [data-a="tSc:k:all"]'));ACT.keySave();render();ok('normal offline queued',grantsOf().includes('chat.parents.view')&&S.outbox.length===1&&/عند عودة الاتصال/.test(txt()));
 // تعارض
 S=fresh();S.conflict=true;ACT.keyOpen('tasks.approve','off');ACT.keySave();render();ok('conflict: both values shown',/قيمتك/.test(txt())&&/القيمة الأحدث/.test(txt())&&!!S.g['tasks.approve']);ACT.keySave('mine');render();ok('conflict: keep mine',!S.g['tasks.approve']&&S.conflict===false);
 S=fresh();S.conflict=true;ACT.keyOpen('tasks.approve','off');ACT.keySave();ACT.keySave('theirs');render();ok('conflict: accept theirs',S.g['tasks.approve'].sc.join()==='layan'&&S.conflict===false);
 S=fresh();setPersona('delegate');go('perm-key','chat.minor.view');render();ok('key sheet read-only for delegate',/قراءة محادثات الأطفال/.test(txt())&&!ph.querySelector('.sheet .seg')&&noIds());
 // إشعار سارة بكل تغيير من الأعلى (حكم Q-401): بلا قبول، يسري فوراً ويصلها إشعار
 S=fresh();ACT.keyOpen('tasks.approve','off');ACT.keySave();ACT.keyOpen('chat.minor.view','deny');ACT.tSc('k','all');ACT.tUn('k','');ACT.keySave();S.sheet=null;setPersona('delegate');render();ok('sara notified of both changes',attention().some(a=>/(2|٢) تغييرات في صلاحياتكِ/.test(a.t)));go('my-perms');render();ok('my-perms: what changed, no accept step',/آخر ما تغيّر/.test(txt())&&/سحب أحمد منكِ: اعتماد مهمة/.test(txt())&&/جديد/.test(txt())&&!/أقبل|موافقة|ارفضي/.test(txt()));ACT.pnSeen();render();ok('notices marked seen',!attention().some(a=>/في صلاحياتكِ/.test(a.t))&&!/جديد/.test(txt()));
 S=fresh();ACT.keyOpen('tasks.approve','off');ACT.keySave();const ud=S.audit[0].undo;undoTo(ud,'x');ok('toast undo is logged too',!!S.g['tasks.approve']&&S.audit[1].undone===1&&/تُراجع/.test(S.audit[0].t));
 // 6 حدود الكل دفعة واحدة
 S=fresh();setRole('observer');SENS.forEach(k=>delete S.g[k]);go('member','sara');ACT.termsAll();ACT.tSc('r','layan');ACT.tUn('r','90');render();ACT.gtDone('');render();ok('bulk terms saved (no sensitive → no pin)',S.g['location.view'].sc.join()==='layan'&&S.g['location.view'].un===addDays(90)&&!S.full);
 S=fresh();ACT.termsAll();ACT.tUn('r','30');ACT.gtDone('');render();ok('bulk with sensitive needs pin',!!S.full&&S.g['location.view'].un==='');pin();ok('bulk applied after pin',S.g['location.view'].un===addDays(30)&&S.g['chat.parents.view'].sc==='fam');
 // 7 سحب الكل
 S=fresh();go('member','sara');render();ACT.revokeAll();render();ok('revoke all confirm',top()==='dlg');dlgYes();ok('revoked all',S.tpl==='none'&&grantsOf().length===0&&/بلا صلاحيات/.test(txt()));setPersona('delegate');render();ok('delegate none: still in family',top()!=='ob-welcome'&&isAdult());
 // 8 الأدوار: محتواها يُعدَّل بحفظ صريح
 S=fresh();go('roles');render();ok('roles: 3 cards',ph.querySelectorAll('[data-a^="go:role-edit:"]').length===3&&/(24|٢٤) صلاحية/.test(txt()));
 go('role-edit','guardian');render();ok('role editor: 44 boxes, no save bar yet',ph.querySelectorAll('[data-a^="reT:"]').length===44&&!ph.querySelector('[data-a="reSave"]'));ACT.reT('protection.rule.edit');render();ok('unsaved bar',!!ph.querySelector('[data-a="reSave"]')&&/تغييرات غير محفوظة/.test(txt())&&S.roles.guardian.keys.length===24);
 const g0=JSON.stringify(S.g);ACT.reSave();render();ok('role saved, member copies untouched',S.roles.guardian.keys.length===25&&JSON.stringify(S.g)===g0&&!rdDirty());
 go('role-edit','observer');render();ACT.reT('location.view');ACT.reDrop();render();ok('discard keeps role',S.roles.observer.keys.length===10);
 go('role-edit','observer');render();ACT.reT('location.view');render();const sl=S.stack.length;back();render();ok('leave with changes warns',S.stack.length===sl&&top()==='dlg'&&/غير محفوظة/.test(txt())&&S.stack[S.stack.length-1].id==='role-edit');dlgYes();ok('leave discards',S.stack.length===sl-1&&S.roles.observer.keys.length===10);
 go('role-edit','observer');render();ph.querySelector('#reN').value='';ACT.reT('location.view');ACT.reSave();render();ok('role name required',S.rd&&S.rd.err===1&&S.roles.observer.keys.length===10);
 S=fresh();S.roles.guardian.keys.push('protection.rule.edit');ACT.rolePick('guardian');ACT.tplApply('guardian');pin();ok('edited role applies new content',grantsOf().length===25&&S.g['protection.rule.edit'].src==='role');
 // 9 صلاحياتي + الطلب
 S=fresh();setRole('guardian');setPersona('delegate');go('my-perms');render();ok('my-perms: request buttons',ph.querySelectorAll('[data-a^="preqSend:"]').length===44-24,ph.querySelectorAll('[data-a^="preqSend:"]').length);ok('my-perms: terms + seed rights',/كل الأطفال · حتى يلغيها أحمد/.test(txt())&&/حقّان لك دائماً/.test(txt()));
 const al=S.alerts.length;ACT.preqSend('protection.rule.edit');render();ok('request sent, not a denial',S.preq.length===1&&S.alerts.length===al&&/بانتظار أحمد/.test(txt()));
 setPersona('owner');render();ok('owner sees request',attention().some(a=>/سارة تطلب صلاحية/.test(a.t)));go('perm-request','0');render();ACT.preqOk('0');render();ok('request → key sheet, owner picks terms',top()==='perm-key'&&S.kd.st==='grant'&&dis('.sheet .btn[data-a="keySave"]'));ACT.tSc('k','all');ACT.tUn('k','30');ACT.keySave();render();ok('request granted',grantsOf().includes('protection.rule.edit')&&S.preq[0].st==='ok');
 S=fresh();setRole('none');setPersona('delegate');go('my-perms');render();ok('none: empty + ask role',/لم تُمنحي صلاحيات بعد/.test(txt())&&!!ph.querySelector('[data-a="preqSend:role"]'));
 // 10 القفل: العادي صامت، والحساس يُسجَّل
 S=fresh();setRole('observer');setPersona('delegate');const a1=S.alerts.length,u1=S.audit.length;ACT.denied('tasks.approve');render();ok('plain lock silent',S.alerts.length===a1&&S.audit.length===u1&&top()==='why'&&/اعتماد مهمة/.test(txt())&&!!ph.querySelector('[data-a="preqSend:tasks.approve"]'));
 ACT.denied('protection.quota.edit');render();ok('owner-only lock: no request',!ph.querySelector('[data-a^="preqSend:"]')&&noIds());
 ACT.denied('chat.minor.view');render();ok('sensitive denial logged + alert',S.alerts.length===a1+1&&S.audit.length===u1+1&&S.audit[0].deny===1);
 setPersona('owner');go('denial',S.alerts[0].id);render();ok('denial detail with reason',/لماذا رُفض/.test(txt())&&/قراءة محادثات الأطفال/.test(txt()));ACT.denialAck(S.alerts[0].id);render();ok('denial acked',S.alerts[0].open===0);
 // 11 الدليل والسجل
 S=fresh();go('perm-registry');render();ok('registry: all 95, no ids',ph.querySelectorAll('#scr [data-q]').length===95&&/(95|٩٥) صلاحية/.test(txt())&&noIds(),ph.querySelectorAll('#scr [data-q]').length);
 ACT.pgF('sens');render();ok('registry sensitive = 5',ph.querySelectorAll('#scr [data-q]').length===5);ACT.pgF('own');render();ok('registry owner = 28',ph.querySelectorAll('#scr [data-q]').length===28);ACT.pgF('agent');render();ok('registry agent = 7',ph.querySelectorAll('#scr [data-q]').length===7);ACT.pgF('self');render();ok('registry self = 16',ph.querySelectorAll('#scr [data-q]').length===16);
 ACT.pgF('all');render();const sr=ph.querySelector('[data-srch="reg"]');sr.value='محادثه';sr.dispatchEvent(new Event('input',{bubbles:true}));const vis=[...ph.querySelectorAll('#scr [data-q]')].filter(r=>!r.hidden).length;ok('registry search',vis>0&&vis<12,vis);
 S=fresh();go('audit');render();ok('audit all',ph.querySelectorAll('#scr .list .row').length===S.audit.length);ACT.auAct('deny');render();ok('audit by action',ph.querySelectorAll('#scr .list .row').length===1);ACT.auClear();ACT.auWho('khaled');render();ok('audit by member',ph.querySelectorAll('#scr .list .row').length===1);ACT.auClear();ACT.auPer('7');render();ok('audit by period',ph.querySelectorAll('#scr .list .row').length===3,ph.querySelectorAll('#scr .list .row').length);ACT.auWho('khaled');render();ok('audit filters combine → empty',/لا أحداث بهذه التصفية/.test(txt()));ok('audit no ids',noIds());
 S=fresh();ACT.keyOpen('tasks.approve','off');ACT.keySave();go('audit');go('audit-ev','0');render();ok('event detail + undo',/من فعل/.test(txt())&&/اعتماد مهمة/.test(txt())&&!!ph.querySelector('[data-a="auUndo:0"]'));ACT.auUndo('0');render();ok('undo from audit',!!S.g['tasks.approve']&&S.audit[1].undone===1);
 S=fresh();S.audit=[];go('audit');render();ok('audit empty',/لا أحداث بعد/.test(txt()));
 // 12 الصلاحية الكاملة (حكم Q-401): فورية، والمالك يسحبها متى شاء
 S=fresh();go('transfer');render();ok('full authority: adults only, no waiting words',!/خالد|ليان|يوسف/.test(document.querySelector('#scr .list').innerText)&&!/بانتظار|7 أيام|٧ أيام|قبول/.test(txt()));ACT.coGive();render();ok('give needs pin',!S.co);pin();ok('given immediately',!!S.co&&/لسارة الصلاحية الكاملة/.test(txt())&&!!ph.querySelector('[data-a="coTake"]'));
 ok('owner still owner',isOwner()&&isRoot()&&can('billing.manage'));setPersona('delegate');ok('sara has everything',isOwner()&&!isRoot()&&can('billing.manage')&&can('protection.quota.edit')&&can('roles.grant.create'));
 render();ok('sara notified',attention().some(a=>/الصلاحية الكاملة/.test(a.t)));go('my-perms');render();ok('sara sees it + who can take it',/لديكِ الصلاحية الكاملة/.test(txt())&&/يسحبها منكِ متى شاء/.test(txt()));
 go('transfer');render();ok('sara cannot give or take it',!ph.querySelector('[data-a="coGive"]')&&!ph.querySelector('[data-a="coTake"]'));go('member-remove','ahmad');render();ok('sara cannot remove owner',/المالك لا يُزال/.test(txt())&&!ph.querySelector('[data-a^="memRemove"]'));
 go('member','sara');render();ok('sara own page: no self-management',!ph.querySelector('[data-a="revokeAll"]')&&!ph.querySelector('[data-a="go:role-pick"]'));go('account');render();ok('co-owner can still leave',!!ph.querySelector('[data-a="go:leave-family"]'));
 setPersona('owner');go('member','sara');render();ok('owner sees take-back on sara',!!ph.querySelector('[data-a="coTake"]'));ACT.coTake();render();ok('take back: confirm only',top()==='dlg');dlgYes();ok('taken back, role restored',S.co===null&&S.tpl==='partner'&&grantsOf().length===43&&S.audit[0].act==='revoke');setPersona('delegate');ok('sara back to partner',!isOwner()&&!can('billing.manage')&&can('tasks.approve'));
 S=fresh();S.removed.sara=30;go('transfer');render();ok('no other adult',/لا بالغ آخر/.test(txt()));S=fresh();S.net='off';go('transfer');render();ok('give offline blocked',dis('[data-a="coGive"]'));
 S=fresh();go('delete-account');render();ok('owner account: no transfer wording',!/انقل الملكية/.test(txt())&&!!ph.querySelector('[data-a="go:transfer"]'));
 S=fresh();ACT.coGive();pin();ACT.keyOpen('tasks.approve','off');ACT.keySave();S.sheet=null;setPersona('delegate');go('family-delete');render();ok('sara with full authority may delete the family (owner ruling)',!!ph.querySelector('[data-a="famDelGo"]'));
 // المالك يحذف حسابه (Q-402)
 S=fresh();go('delete-account');render();ok('owner, no full authority: blocked with two ways',!ph.querySelector('[data-a="delGo"]')&&!!ph.querySelector('[data-a="go:transfer"]')&&!!ph.querySelector('[data-a="go:family-delete"]'));
 S=fresh();S.co={since:'اليوم',seen:1};go('delete-account');render();ok('owner with full authority at sara: may delete',!!ph.querySelector('[data-a="delGo"]')&&/صارت هي مالكة العائلة/.test(txt()));ACT.delGo();render();dlgYes();pin();ok('owner deletion pending',S.ownDel===30&&S.delP!==30&&/سارة تدير العائلة الآن/.test(txt()));
 setPersona('delegate');render();ok('sara told she runs the family',attention().some(a=>/أحمد يحذف حسابه/.test(a.t)));go('my-perms');render();ok('sara: becomes owner if he does not return',/صرتِ أنتِ مالكة العائلة/.test(txt()));go('leave-family');render();ok('sara cannot leave meanwhile',!ph.querySelector('[data-a="leaveFam"]'));go('delete-account');render();ok('sara cannot delete account meanwhile',!ph.querySelector('[data-a="delGo"]'));go('family');render();ok('family shows owner leaving',/يحذف حسابه/.test(txt()));
 setPersona('owner');go('delete-account');render();ACT.delUndo();render();ok('owner returns as owner',S.ownDel===0&&isRoot()&&!!S.co);
 S=fresh();setPersona('delegate');S.full={id:'owner-now',a:[]};render();ok('sara: owner-now screen',/صرتِ مالكة العائلة/.test(txt()));ACT.ownerNowOk();
 S=fresh();setPersona('delegate');go('delete-account');render();ok('plain adult deletes as before',!!ph.querySelector('[data-a="delGo"]'));
 // المراهق يصله إشعار
 S=fresh();ACT.teenOpen('khaled');ACT.tdOn('0');ACT.tdSave();setPersona('teen');render();ok('teen notified on home',/أوقف والدك السماح/.test(txt()));ACT.pnSeen();render();ok('teen notice cleared',!/أوقف والدك السماح/.test(txt()));
 // 13 حذف العائلة
 S=fresh();go('family-delete');render();ACT.famDelGo();render();ok('name required',S.fdErr===1&&!S.famDel&&/غير مطابق/.test(txt()));document.getElementById('fdN').value='عائلة المنصور';ACT.famDelGo();render();ok('delete needs pin',!S.famDel);pin();ok('delete pending 30',S.famDel===30&&/تُحذف بعد (٣٠|30) يوماً/.test(txt()));
 go('family');render();ok('family shows deletion',/تُحذف بعد/.test(txt()));ACT.famDelCancel();render();ok('delete cancelled',S.famDel===0);
 S=fresh();go('family-settings');render();ok('settings → delete + full authority',!!ph.querySelector('[data-a="go:family-delete"]')&&!!ph.querySelector('[data-a="go:transfer"]'));
 // 14 إزالة فرد
 S=fresh();S.co={since:'اليوم',seen:1};go('member-remove','sara');render();ok('remove: full authority noted',/ومنها الصلاحية الكاملة/.test(txt()));ACT.memRemove('sara');render();ok('remove needs pin',!S.removed.sara);pin();ok('removed 30d + full authority dropped',S.removed.sara===30&&S.co===null&&/أُزيلت سارة/.test(txt()));
 ACT.memRestore('sara');render();ok('restored',!S.removed.sara);go('member-remove','ahmad');render();ok('owner not removable',/المالك لا يُزال/.test(txt()));
 // المراهق: صلاحية واحدة بمدة
 S=fresh();go('member','khaled');render();ok('teen: single grant row',!!ph.querySelector('[data-a="teenOpen:khaled"]')&&!!ph.querySelector('[data-a="go:member-remove:khaled"]'));ACT.teenOpen('khaled');render();ok('teen sheet: self scope only',/مهامه هو فقط/.test(txt())&&!ph.querySelector('.sheet [data-a^="tSc:"]'));ACT.tUn('t','30');ACT.tdSave();render();ok('teen grant with date',S.teenTasks===true&&S.teenUn===addDays(30)&&S.audit[0].who==='khaled');
 ACT.teenOpen('khaled');ACT.tdOn('0');ACT.tdSave();ok('teen off',S.teenTasks===false);setPersona('teen');go('t-me');render();ok('teen can ask',!!ph.querySelector('[data-a="preqSend:teen"]'));ACT.preqSend('teen');setPersona('owner');ACT.preqOk('0');render();ok('teen request → owner picks duration',top()==='teen-grant'&&dis('.sheet .btn[data-a="tdSave"]'));ACT.tUn('t','');ACT.tdSave();ok('teen request granted',S.teenTasks===true&&S.preq[0].st==='ok');
 // 15 بلوغ 13
 S=fresh();go('turn13');render();ok('turn13 before',/2030|٢٠٣٠/.test(txt())&&!ph.querySelector('[data-a="rev13Done"]'));S.rev13=1;go('family');render();ok('family review prompt',/صارت مراهقة/.test(txt()));go('turn13','now');render();ok('turn13 now: decision',!!ph.querySelector('[data-a="rev13Done"]')&&!!ph.querySelector('[data-a="teenT:13"]'));ACT.rev13Done();ok('reviewed',S.rev13===2);
 // 16 كل أسطح S1-03: لا تجاوز أفقي + لا كلام مهندسين + لا معرّفات
 const over=[],eng=[];const ids=Object.keys(SC).filter(k=>SC[k].sys==='S1-03');for(const id of ids){for(const pre of [null,'guardian','none','co']){try{S=fresh();if(pre==='co')S.co={since:'اليوم',seen:0};else if(pre)setRole(pre);jump(id);render();const sc=document.getElementById('scr');if(sc&&sc.scrollWidth>sc.clientWidth+1)over.push(id);
   if(/[a-z]+\.[a-z_]+\.[a-z_]+|PERM_|scope|valid_until|deny|قالب|القوالب|مفتاح ذري|مفاتيح|المصفوفة|step-up|409|Parent Gate|PIN/.test(txt()))eng.push(id+':'+(txt().match(/[a-z]+\.[a-z_]+\.[a-z_]+|PERM_|scope|valid_until|deny|قالب|القوالب|مفتاح ذري|مفاتيح|المصفوفة|step-up|409|Parent Gate|PIN/)||[])[0]);}catch(e){F.push('ERR '+id+' '+e.message)}}}
 R.over=over;R.eng=eng;R.n=ids.length;R.ids=ids.join(' ');R.checks=N;R.fail=F;return R;});
R.errs=errs;}catch(e){R.crash=String(e.stack||e).slice(0,900)}finally{await b.close()}
console.log(JSON.stringify(R,null,1));})();
