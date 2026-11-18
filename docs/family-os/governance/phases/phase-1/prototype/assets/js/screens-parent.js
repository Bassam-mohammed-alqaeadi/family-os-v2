/* أسطح وضع الأهل: مركز الأوامر، العائلة والصلاحيات، التحكم (الحماية/الموقع/المهام/المكافآت). */
'use strict';
M.sara.f = M.layan.f = 1;
const vb = (m, a, b) => (m.f ? b : a);
const kidsVisible = () => KIDS;   // المرحلة 1: النطاق «كل الأطفال» (scope) — تخصيص النطاق يُعرض في ورقة المنح
const appOf = (kid, id) => S.apps[kid].find(a => a.id === id);
const ENF = { active: ['الحماية تعمل', 'verified_user', 'ok'], degraded: ['الحماية تعمل جزئياً', 'gpp_maybe', 'wa'], off: ['الحماية متوقفة', 'shield', 'da'], none: ['لم يُقرن جهازه بعد', 'mobile_off', ''] };

/* ============ قائمة «يتطلب انتباهك» — تجمع من الأنظمة ولا تملك بياناتها (S1-09 REQ-002) ============ */
function attention() {
  const A = [];
  if (S.sos && S.sos.st === 'sent' && S.sos.from !== me().id) A.push({ k: 'sos', p: 0, c: 'var(--danger)', i: 'sos', t: `استغاثة من ${M[S.sos.from].n}`, s: `${S.sos.via} · ${S.sos.place}`, b: [['عرض الموقع والحالة', 'go:sos-status', 'dng']] });
  if (can('rewards.time_request.decide')) S.reqs.filter(r => r.st === 'PENDING').forEach(r => { const k = M[r.kid], g = Math.min(r.min, rwCapLeft(r.kid)); A.push({ k: 'req:' + r.id, p: 1, c: 'var(--accent)', i: 'more_time', t: `${k.n} ${vb(k, 'يطلب', 'تطلب')} ${r.min} دقيقة إضافية`, s: g ? `${appOf(r.kid, r.app).n} · نفد حدّه اليوم` : `${appOf(r.kid, r.app).n} · بلغ حد الوقت الإضافي اليوم`, b: g ? [[`منح ${g} د`, `reqGrant:${r.id}:${g}`, 'ok'], ['خيارات أخرى', `go:time-decide:${r.id}`, 'sec']] : [['اقرأ وقرّر', `go:time-decide:${r.id}`, 'ton']] }); });
  if (can('rewards.objection.decide')) RW().obj.filter(o => o.st === 'PENDING' && !o.q).forEach(o => { const k = M[o.kid]; A.push({ k: 'obj:' + o.id, p: 2, c: 'var(--info)', i: 'balance', t: `${k.n} ${vb(k, 'يعترض', 'تعترض')} على قرار`, s: rwSub(o.kid, o.sub).t, b: [['اقرأ وقرّر', `go:obj-decide:${o.id}`, 'ton']] }); });
  if (can('protection.tamper.view')) S.alerts.filter(a => a.k === 'tamper' && a.open).forEach(a => A.push({ k: 'al:' + a.id, p: 1, c: 'var(--warning)', i: 'gpp_maybe', t: a.t, s: a.s, b: [['عرض التفاصيل', `go:tamper:${a.id}`, 'ton']] }));
  if (can('protection.rule.view')) reviews().forEach(r => A.push({ k: 'rev:' + r.k + ':' + r.kid, p: 2, c: 'var(--info)', i: 'rule', t: r.k === 'teen' ? `قواعد ${M[r.kid].n} تحتاج مراجعتك` : r.k === 'new' ? `اقترن جهاز ${pname(M[r.kid])}: اضبط قواعده` : `جهاز جديد ل${pname(M[r.kid])}: قواعده أُعيدت إليه`, s: r.k === 'teen' ? 'بلغت 13 سنة · قواعدها ما زالت سارية' : r.k === 'new' ? 'حصة اليوم الجاهزة فقط · لا نوم ولا مدرسة ولا حدود تطبيقات بعد' : 'راجعها أو أبقِها كما هي', b: [['راجع', 'go:rules-review', 'ton']] }));
  if (can('tasks.approve')) S.tasks.filter(t => t.st === 'SUBMITTED' && can('tasks.approve', t.kid)).forEach(t => { const k = M[t.kid]; A.push({ k: 'task:' + t.id, p: 2, c: 'var(--info)', i: 'task_alt', t: `${k.n} ${vb(k, 'سلّم', 'سلّمت')} «${t.t}»`, s: tkWhyHere(t), b: [['اعتماد', `taskOk:${t.id}`, 'ok'], ['مراجعة', `go:task-review:${t.id}`, 'sec']] }); });
  if (can('chat.minor.view')) S.alerts.filter(a => a.k === 'chat' && a.open).forEach(a => A.push({ k: 'al:' + a.id, p: 2, c: 'var(--info)', i: 'chat_error', t: a.t, s: a.s, b: [[a.rv ? 'راجع الرسالة' : 'عرض التنبيه', a.rv ? 'go:chat-review' : 'go:chat-flag:dm-khaled-layan:0', 'ton'], ['تجاهل', `alertClose:${a.id}`, 'sec']] }));
  S.alerts.filter(a => a.k === 'help' && a.open).forEach(a => A.push({ k: 'al:' + a.id, p: 1, c: 'var(--accent)', i: 'front_hand', t: a.t, s: a.s, b: [[`تحدّث مع ${M[a.kid].n}`, 'dmStart:' + a.kid, 'ton'], ['تمّ', `alertClose:${a.id}`, 'sec']] }));
  S.alerts.filter(a => a.k === 'prof' && a.open).forEach(a => A.push({ k: 'al:' + a.id, p: 3, c: 'var(--info)', i: 'palette', t: a.t, s: a.s, b: [['افتح الملف', alertGo(a), 'ton'], ['تمّ', `alertClose:${a.id}`, 'sec']] }));
  if (can('identity.device.pair') || isOwner()) KIDS.filter(noDev).forEach(id => A.push({ k: 'pair:' + id, p: 2, c: 'var(--info)', i: 'devices', t: `بقي إقران جهاز ${pname(M[id])}`, s: 'ملفه في العائلة · برمز صالح 15 دقيقة', b: [['اقرن جهازه', 'go:pair-code:' + id, 'ton']] }));
  if (isOwner()) S.alerts.filter(a => a.k === 'perm' && a.open).forEach(a => A.push({ k: 'al:' + a.id, p: 3, c: 'var(--border-strong)', i: 'lock_person', t: a.t, s: a.s, b: [['التفاصيل', `go:denial:${a.id}`, 'ton'], ['تمّ', `alertClose:${a.id}`, 'sec']] }));
  if (isOwner()) S.preq.forEach((q, i) => { if (q.st === 'pending') A.push({ k: 'preq:' + i, p: 3, c: 'var(--info)', i: 'key', t: preqTxt(q), s: 'تقبل أو تؤجل', b: [['اقرأ وقرّر', `go:perm-request:${i}`, 'ton']] }); });
  if (S.co && !S.co.seen && S.persona === 'delegate') A.push({ k: 'co', p: 1, c: 'var(--warning)', i: 'admin_panel_settings', t: 'أعطاكِ أحمد الصلاحية الكاملة', s: 'تفعلين كل ما يفعله · يسحبها متى شاء', b: [['عرض', 'go:my-perms', 'ton'], ['تمّ', 'coSeen', 'sec']] });
  if (S.persona === 'delegate' && S.ownDel && S.co) A.push({ k: 'owndel', p: 1, c: 'var(--danger)', i: 'auto_delete', t: 'أحمد يحذف حسابه', s: `أنتِ تديرين العائلة الآن · إن لم يتراجع خلال ${S.ownDel} يوماً صرتِ مالكتها`, b: [['عرض', 'go:my-perms', 'ton']] });
  if (S.persona === 'delegate') { const N = pnNew(); if (N.length) A.push({ k: 'pn:' + N.length, p: 2, c: 'var(--info)', i: 'key', t: N.length === 1 ? N[0].sn : `${N.length} تغييرات في صلاحياتكِ`, s: N.length === 1 ? 'يسري الآن على كل أجهزتكِ' : `آخرها: ${N[0].sn}`, b: [['عرض', 'go:my-perms', 'ton'], ['تمّ', 'pnSeen', 'sec']] }); }
  if (isOwner() && S.persona === 'owner') soonList().forEach(k => A.push({ k: 'soon:' + k, p: 2, c: 'var(--warning)', i: 'schedule', t: gDays(S.g[k]) < 0 ? `انتهت صلاحية لسارة: ${PL[k][0]}` : `صلاحية لسارة تنتهي بعد ${dTxt(gDays(S.g[k]))}`, s: gDays(S.g[k]) < 0 ? 'توقفت · جدّدها إن أردت' : PL[k][0], b: [['جدّد', `keyOpen:${k}`, 'ton']] }));
  cfAtt().forEach(a => A.push(a));   /* Q-419: تعارض قائم لم يقرّر فيه أحد، أو أبقاه بالغ آخر */
  blAtt().forEach(a => A.push(a));   /* S1-04: المهلة، دفعة لم تتأكد، العودة إلى المجانية، طلب ترقية من بالغ */
  return A.sort((x, y) => x.p - y.p);
}
/* Q-416: بطاقة الرئيسية تذكير ومدخل سريع. الإكس يخفيها من الرئيسية لهذا البالغ فقط؛ الأمر نفسه يبقى في «التنبيهات» وفي العدّاد حتى يُحسم. الاستغاثة القائمة لا تُخفى. */
const attX = () => S.attX || (S.attX = {});
const attKey = a => me().id + '|' + a.k;
const attHome = () => attention().filter(a => a.p === 0 || !attX()[attKey(a)]);
const attCard = (a, x) => `<div class="att" style="--pc:${a.c}"><div class="hd"><span class="lead" style="color:${a.c}">${ic(a.i)}</span><span class="tx"><b>${a.t}</b><span>${a.s}</span></span>${a.p <= 1 ? `<span class="pr ${a.p ? '' : 'p0'}">${a.p ? 'عاجل' : 'طارئ'}</span>` : ''}${x === true && a.p > 0 ? `<button class="atx" data-a="attHide:${a.k}" aria-label="أخفِ هذا التذكير من الرئيسية">${ic('close')}</button>` : ''}</div><div class="ft">${a.b.map(([t, act, c]) => btn(t, act, 'sm ' + c)).join('')}</div></div>`;
ACT.attHide = (...k) => { const key = me().id + '|' + k.filter(x => typeof x === 'string').join(':'); attX()[key] = 1; toast('أُخفي من الرئيسية · تجده في «التنبيهات»', () => { delete attX()[key]; render(); }, 'notifications'); };

function kidOrb(id) {
  const m = M[id], k = S.kid[id], pct = left(id) / (k.quota + k.extra), st = S.sos && S.sos.from === id && S.sos.st === 'sent' ? ['sos', '#B42318'] : noDev(id) ? ['mobile_off', '#5E5A4B'] : k.enf !== 'active' ? ['priority_high', '#9A5B00'] : left(id) === 0 ? ['hourglass_empty', '#CF5B2C'] : ['check', '#1F6B3B'];
  const r = 26, c = 2 * Math.PI * r;
  return `<button class="orb" data-a="go:member:${id}" aria-label="${m.n}"><span class="rw"><svg class="rg" width="58" height="58"><circle cx="29" cy="29" r="${r}" stroke="#ffffff26"/><circle cx="29" cy="29" r="${r}" stroke="${pct < .2 ? '#F6A77F' : '#8FD3A5'}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}"/></svg>${av(m)}<span class="bd" style="background:${st[1]}">${ic(st[0])}</span></span><b>${pname(m)}</b><small>${noDev(id) ? 'بلا جهاز بعد' : fmOf(id) ? 'وضع حر' : pmOf(id) ? modeN(pmOf(id)) : `بقي ${left(id)} د`}</small></button>`;
}
/* ============ الرئيسية: مركز الأوامر ============ */
surface('home', {
  t: 'الرئيسية', sys: 'S1-09', p: 'adult', bar: false, flush: true, hero: true,
  req: '09:1,2,3,4,6,7,10,11,16,17 01:4,7,8 07:15 08:16 05:14 10:20,24',
  note: 'مركز الأوامر: ترويسة «نبض العائلة» ← شريط الحالة ← قائمة الانتباه بالأهم ← أوضاع جاهزة ← بطاقات. الرئيسية تعرض لكل بالغ ما يستطيعه فقط، بلا أقفال (Q-096، Q-407)؛ والأقفال وطلب الصلاحية مكانهما «التحكم» و«صلاحياتي». غيّر الشخصية إلى «سارة» وبدّل دورها لترى اللوحة تتقلص.',
  r() {
    const A = attention(), H = attHome(), d = dateAr(), m = me();
    const tasksToday = S.tasks.filter(t => t.st !== 'CANCELLED' && t.st !== 'EXPIRED' && can('tasks.view', t.kid)), done = tasksToday.filter(t => t.st === 'APPROVED').length;
    const ck = Object.values(S.checklist), ckDone = ck.filter(Boolean).length;
    const un = S.plan === 'premium';
    const hs = S.hub || '', bad = hs === 'nosnap' || hs === 'bad', nk = hs === 'empty';
    return `<div class="hero"><div class="top"><button data-a="tab:more" aria-label="حسابي" style="margin-inline-start:8px">${av(m)}</button><div class="hi"><small>${d.s}</small><b>${L('مساء الخير، ' + m.n, 'Good evening, ' + m.en)}</b></div>
      <button class="ib" data-a="flip:privacy" aria-label="وضع الخصوصية" aria-pressed="${S.privacy}">${ic(S.privacy ? 'visibility_off' : 'visibility')}</button>
      ${can('hub.alerts.view') ? `<button class="ib" data-a="go:alerts" aria-label="التنبيهات">${ic('notifications')}${S.alerts.filter(a => a.open).length ? `<span class="dot">${S.alerts.filter(a => a.open).length}</span>` : ''}</button>` : ''}</div>
      ${can('hub.dashboard.view') && !bad ? `<div class="pulse">${nk ? '' : kidsVisible().map(kidOrb).join('')}${can('identity.family.invite') ? `<button class="orb" data-a="go:add-member"><span class="rw"><span class="av" style="--c:#ffffff1f">${ic('add')}</span></span><b>إضافة</b><small>فرد جديد</small></button>` : ''}</div>
      ${nk ? '' : `<button class="strip ${A.length ? 'at' : ''}" data-a="${A.length ? 'go:alerts' : 'go:enf-all'}">${ic(A.length ? 'pending_actions' : 'verified_user')}<span>${A.length ? `${A.length} ${A.length === 1 ? 'أمر يحتاج' : 'أمور تحتاج'} انتباهك` : 'كل شيء على ما يرام · لا شيء يحتاج قرارك'}</span>${age(2)}</button>`}` : ''}
    </div><div style="padding:14px 16px 24px">
    ${!can('hub.dashboard.view') ? empty('lock_person', 'لا توجد صلاحيات بعد', 'انضممتِ إلى العائلة بدور بالغ بلا أي منح. اطلبي من الأب تفويضك لتظهر هنا لوحة العائلة.', btn('عرض صلاحياتي', 'go:my-perms', 'sm ton')) : hs === 'nosnap' ? empty('cloud_off', 'لا بيانات بعد', 'اتصل بالإنترنت مرة واحدة لعرض اللوحة. بعدها تفتح فوراً حتى دون اتصال.', btn('حاول الآن', 'hubRetry', 'sm')) : hs === 'bad' ? empty('sync_problem', 'لا بيانات موثوقة', 'تعذّرت قراءة آخر نسخة محفوظة على هذا الهاتف، فلا نعرضها. نجلب نسخة جديدة عند الاتصال.', btn('حدّث الآن', 'hubRetry', 'sm')) : nk ? empty('child_care', 'أضف طفلاً من الإعدادات لتبدأ', 'تظهر هنا حالة كل طفل: مكانه، وقته، وما يحتاج قرارك.', btn('أضف طفلاً', 'go:add-member', 'sm', 'person_add')) : `
    ${H.length ? sec('يتطلب انتباهك', 'الكل', 'go:alerts') + H.slice(0, 3).map(a => attCard(a, true)).join('') : ''}
    ${ckDone < ck.length && isOwner() && !attX()[me().id + '|checklist'] ? `<div class="card ckc"><button class="ckm" data-a="go:checklist"><div class="fx sb"><b>أكمل إعداد عائلتك</b>${chip(`${ckDone} من ${ck.length}`, 'in')}</div><div style="margin:8px 0 6px">${pbar(ckDone / ck.length * 100, 'ok')}</div><span class="sm muted">${ckLeft()}</span></button><button class="atx" data-a="ckHide" aria-label="أخفِ هذا التذكير من الرئيسية">${ic('close')}</button></div>` : ''}
    ${svcOn('prot') && (can('protection.mode_preset.apply') || can('protection.rule.create')) ? sec('الأوضاع') + modeTiles(1) : ''}
    <div class="qa" style="grid-template-columns:repeat(3,1fr);margin-top:8px">${[['add_task', 'مهمة جديدة', 'go:task-new', 'tasks.create', 'tasks'], ['more_time', 'منح وقت', 'go:grant-time', 'rewards.grant.create', 'rew'], ['stars', 'منح نقاط', 'go:grant-points', 'rewards.grant.create', 'rew']].filter(x => svcOn(x[4]) && can(x[3])).map(([i, t, a, k]) => `<button data-a="${can(k) ? a : 'denied:' + k}" class="${can(k) ? '' : 'dis'}"><span class="qi ${can(k) ? toneOf(i) : ''}">${ic(can(k) ? i : 'lock')}</span>${t}</button>`).join('')}</div>
    ${(can('agent.summary.read') || isOwner()) && svcOn('ai') ? aiCard() : ''}
    ${mapIds().length && svcOn('loc') ? sec('أين العائلة الآن', 'الخريطة', 'go:map') + fMap(140, { ids: mapIds() }) + `<div class="chips" style="margin:8px 0 2px">${locChips()}${age(2)}</div>` : ''}
    ${!svcOn('prot') ? '' : sec('وقت الشاشة اليوم', 'القواعد', 'tab:control') + `<div class="card">${KIDS.map(id => { const k = S.kid[id], pc = k.used / (k.quota + k.extra) * 100; return `<button class="fx" style="width:100%;padding:6px 0" data-a="go:member:${id}">${av(M[id], 'sm')}<span class="grow"><span class="fx sb sm"><b>${pname(M[id])}</b><span class="muted">${noDev(id) ? 'لم يُقرن جهازه بعد' : `${k.used} من ${k.quota + k.extra} د`}</span></span><span style="display:block;margin-top:5px">${pbar(pc, pc > 85 ? 'wa' : 'ok')}</span></span></button>`; }).join('')}</div>`}
    ${svcOn('chat') ? chWidget() : ''}
    <div class="gap"></div><div class="g2 fill">${can('tasks.view') && svcOn('tasks') ? `<button class="card stat" data-a="go:tasks"><span class="qi ac">${ic('task_alt')}</span><b>${done}/${tasksToday.length}</b><span>مهام اليوم المنجزة</span></button>` : ''}
    ${can('rewards.wallet.view') && svcOn('rew') ? `<button class="card stat" data-a="go:rewards-admin"><span class="qi go">${ic('stars')}</span><b>${KIDS.filter(k => M[k].role === 'child').reduce((n, k) => n + S.kid[k].pts, 0)}</b><span>نقاط الأطفال${RW().obj.some(o => o.st === 'PENDING' && !o.q) && can('rewards.objection.decide') ? ' · اعتراض ينتظرك' : S.kid.layan.streak ? ' · سلسلة ليان ' + rwDy(S.kid.layan.streak) : ''}</span></button>` : ''}
    ${can('hub.plan.view') ? `<button class="card stat" data-a="go:plan"><span class="qi go">${ic('workspace_premium')}</span><b>${{ free: 'المجانية', basic: 'الأساسية', premium: 'المميزة' }[S.plan]}</b><span>SMS: ${S.sms.used} من ${{ free: 20, basic: 50, premium: 100 }[S.plan]} هذا الشهر</span></button>` : ''}</div>
    ${isOwner() ? '' : `<div class="gap"></div>` + list(row('key', 'صلاحياتي', 'ما أستطيعه هنا، وما أطلبه من أحمد', { a: 'go:my-perms' }))}`}
    </div>`;
  },
});
/* بلاطات الأوضاع: يملكها نظام الحماية ويعرضها المركز في الرئيسية وفي «التحكم ← سريع» (REQ-007) */
function modeTiles(noLock) {
  const P = [['study', 'وقت الدراسة', 'school'], ['sleep', 'وقت النوم', 'bedtime'], ['free', 'وضع حر', 'lock_open'], ...S.modes.map(x => [x.id, x.n, x.i])];
  return `<div class="qa" style="grid-template-columns:repeat(3,1fr)">${P.map(([k, t, i]) => { const on = KIDS.filter(x => (k === 'free' ? fmOf(x) > 0 : pmOf(x) === k)), ok = k === 'free' ? isOwner() : can('protection.mode_preset.apply'); if (noLock && !ok) return ''; return `<button aria-pressed="${on.length > 0}" data-a="${ok ? 'go:presets:' + k : 'denied:' + (k === 'free' ? 'protection.free_mode.activate' : 'protection.mode_preset.apply')}" class="${ok ? '' : 'dis'}"><span class="qi ${ok && k === 'free' ? 'ac' : ''}">${ic(ok ? i : 'lock')}</span>${t}${on.length ? `<span class="xs" style="color:var(--success);font-weight:700">${on.map(x => M[x].n).join('، ')}</span>` : ''}</button>`; }).join('')}${can('protection.rule.create') ? `<button data-a="go:mode-edit:new"><span class="qi">${ic('add')}</span>وضع جديد</button>` : ''}</div>`;
}
ACT.hubRetry = () => { if (offline()) return toast('ما زلت غير متصل', null, 'cloud_off'); S.hub = ''; toast('حُدّثت اللوحة'); };
function aiCard() {
  const g = S.agent.find(x => x.id === 'g3');
  if (S.aiKill) return `<div class="callout nt" style="margin-top:14px">${ic('power_settings_new')}<div>المساعد الذكي متوقف بمفتاح الإيقاف. <button class="why" data-a="go:ai">إدارته</button></div></div>`;
  if (!g || g.st !== 'بانتظارك') return '';
  return `<div class="ai" style="margin-top:14px"><div class="lb">${ic('wand_stars')}اقتراح من المساعد · ${isOwner() ? 'لا يُنفَّذ دون موافقتك' : 'القرار لأحمد'}</div><p>لاحظتُ أن خالد يستخدم هاتفه بعد 10:30 م في ليالي المدرسة ثلاث مرات هذا الأسبوع. أقترح تقديم نافذة النوم 30 دقيقة.</p><div class="btns">${isOwner() ? btn('طبّق الاقتراح', 'aiApply', 'sm') + btn('ليس الآن', 'aiDismiss', 'sm sec') : ''}<button class="why" data-a="why:ai">لماذا هذا؟</button></div></div>`;
}
Object.assign(ACT, {
  aiApply() { gate('تغيير قاعدة باقتراح المساعد يتطلب تأكيدك', () => { const g = S.agent.find(x => x.id === 'g3'); g.st = 'نُفّذ بموافقتك'; g.undo = 1; audit('قُدّمت نافذة نوم خالد 30 د (اقتراح المساعد)', 'agent.rule.change'); toast('عُدّلت نافذة النوم · يمكنك التراجع من سجل المساعد', () => { g.st = 'بانتظارك'; g.undo = 0; render(); }); }, 'stepup'); },
  aiDismiss() { S.agent.find(x => x.id === 'g3').st = 'رُفض'; toast('لن يُنفَّذ الاقتراح'); },
  alertClose(id) { const a = S.alerts.find(x => x.id === id); a.open = 0; toast('أُغلق التنبيه', () => { a.open = 1; render(); }); },
  /* اعتماد المهام وإعادتها: في screens-tasks.js */
});

surface('alerts', {
  t: 'التنبيهات', sys: 'S1-09', p: 'adult', req: '09:3,4,15,17 07:16 03:7 10:21 08:12 05:14',
  note: 'تبويبان: «تحتاج قرارك» بطاقات بقرار من نقرة واحدة، مرتبة بالأهم. و«كل التنبيهات» سجل ما نشرته الخدمات، يُصفّى بالنوع وبغير المقروء، وكل صف يفتح تفصيله. يظهر لكل بالغ ما يخص صلاحياته فقط.',
  r() { const A = attention(), v = S.alV || 'todo';
    return seg([['todo', `تحتاج قرارك${A.length ? ' · ' + A.length : ''}`], ['log', 'كل التنبيهات']], v, 'set:alV') + (v === 'log' ? alertLog() : A.length ? A.map(a => attCard(a)).join('') : empty('task_alt', 'لا شيء يحتاج قرارك', 'عندما يطلب أحد الأطفال وقتاً أو يسلّم مهمة سيظهر هنا.')); },
});
/* بنود قائمة الإعداد الأولي: [المفتاح، العنوان، الشرح، الفعل، اسم البند في «بقي: …»]. مدخلها الدائم صف في «المزيد»، وبطاقتها في الرئيسية تذكير يُخفى كغيره (Q-423). */
const CK_I = [['family', 'أنشئ العائلة', 'الاسم والمنطقة والمنطقة الزمنية', '', 'إنشاء العائلة'], ['child', 'أضف ملف طفل', 'اسم مستعار وصورة رمزية ولون وسنة ميلاد', 'go:add-member', 'إضافة ملف طفل'], ['pin', 'أنشئ رقمك السري', '6 أرقام تحمي إعدادات أجهزة أطفالك', 'pinChange', 'إنشاء رقمك السري'], ['pair', 'اقرن جهاز الطفل', 'برمز إقران صالح 15 دقيقة', 'go:pair-code:layan', 'إقران جهاز الطفل'], ['rules', 'راجع قواعد الوقت', 'حصة يومية وجدول نوم ومدرسة', 'tab:control', 'مراجعة قواعد الوقت'], ['adult', 'ادعُ بالغاً آخر', 'برمز دعوة لمرة واحدة', 'go:invite', 'دعوة بالغ آخر'], ['emergency', 'أضف جهات الطوارئ', 'تصلهم رسالة SOS مع الموقع', 'go:emergency', 'إضافة جهات الطوارئ']];
const ckRest = () => CK_I.filter(x => !S.checklist[x[0]]);
const ckLeft = () => { const R = ckRest(); return !R.length ? 'مكتملة' : R.length === 1 ? 'بقي: ' + R[0][4] : `${R.length === 2 ? 'بقي بندان، أولهما' : `بقي ${R.length} بنود، أولها`}: ${R[0][4]}`; };
ACT.ckHide = () => { const key = me().id + '|checklist'; attX()[key] = 1; toast('أُخفي من الرئيسية · تجده في «المزيد»', () => { delete attX()[key]; render(); }, 'checklist'); };
surface('checklist', {
  t: 'قائمة الإعداد الأولي', sys: 'S1-01', p: 'owner', req: '09:1 07:10', st: 'pr',
  note: 'قائمة الإعداد الأولي (DS-CC-10): مدخلها الدائم صف في «المزيد» للمالك، وبطاقتها في الرئيسية تذكير يُخفى (Q-424). بلا هدف زمني (Q-157). بنودها الخمسة مشتقة من متطلبات الأنظمة ولم يصدر فيها حكم بنداً بنداً.',
  r() { const I = CK_I;
    return callout('كل بند يفتح شاشته مباشرة، ويمكنك التوقف والعودة لاحقاً.') + list(I.map(([k, t, s, a]) => row(S.checklist[k] ? 'check_circle-fill' : 'radio_button_unchecked', t, s, { a: S.checklist[k] ? '' : a, ic: S.checklist[k] ? 'var(--success)' : 'var(--muted)', v: S.checklist[k] ? 'تمّ' : '' }))); },
});

/* ============ العائلة ============ */
surface('family', {
  t: 'العائلة', sys: 'S1-03', p: 'adult', req: '03:1,2,3,10,16,20 02:8,11 01:1',
  note: 'قائمة أفراد العائلة مع بحث بالاسم، ونقطة الدخول لكل ما يخص صلاحياتهم. كل بالغ يحمل اسم دوره وعدد صلاحياته وأقرب انتهاء لها. ما ينتظر قراراً يظهر في أعلى الشاشة: صلاحية تنتهي قريباً، طلب صلاحية، حذف معلّق، مراجعة من صار مراهقاً.',
  act: () => (can('identity.family.invite') ? `<button class="ib" data-a="go:add-member" aria-label="إضافة فرد">${ic('person_add')}</button>` : ''),
  r() {
    const cap = { free: 5, basic: 10, premium: '∞' }[S.plan], own = isOwner(), soon = soonList(), near = soon.length ? Math.min(...soon.map(k => gDays(S.g[k]))) : null;
    const sub = m => (m.owner ? 'الأب' : m.role === 'adult' ? `الأم · ${S.co ? 'كل الصلاحيات' : grantsOf().length ? grantsOf().length + ' صلاحية' : 'بلا صلاحيات'}${near != null && own ? ` · ${near < 0 ? 'فيها ما انتهى' : 'أقرب انتهاء بعد ' + dTxt(near)}` : ''}` : `${m.rel.split(' · ')[0]} · مواليد ${m.by}`);
    const mrow = m => qrow(m.n + ' ' + m.en, row('', pname(m), sub(m), { lead: av(m), a: `go:member:${m.id}`, v: S.removed[m.id] ? chip(`${vb(m, 'أُزيل', 'أُزيلت')} · ${S.removed[m.id]} يوماً`, 'da', 'person_off') : m.owner ? (S.ownDel ? chip(`يحذف حسابه · ${S.ownDel} يوماً`, 'wa', 'auto_delete') : chip('المالك', 'go', 'verified')) : m.role === 'adult' ? chip(roleName(), S.co ? 'go' : S.tpl === 'none' ? 'ol' : 'in') : KIDS.includes(m.id) ? chip(ENF[S.kid[m.id].enf][0].replace('الحماية ', ''), ENF[S.kid[m.id].enf][2], ENF[S.kid[m.id].enf][1]) : '' }));
    const todo = [
      S.famDel ? callout(`<b>العائلة تُحذف بعد ${S.famDel} يوماً</b><br>${own ? 'تستطيع إلغاء الحذف في أي وقت قبلها.' : 'طُلب حذف العائلة. يلغيه المالك قبلها.'}${own ? `<div style="margin-top:8px">${btn('ألغِ الحذف', 'go:family-delete', 'sm sec')}</div>` : ''}`, 'da', 'delete_forever') : '',
      S.co && !isRoot() && me().id === 'sara' && !S.co.seen ? callout(`<b>أعطاكِ أحمد الصلاحية الكاملة</b><br>تفعلين كل ما يفعله. يسحبها متى شاء.<div style="margin-top:8px">${btn('عرض', 'go:my-perms', 'sm sec')}</div>`, 'wa', 'admin_panel_settings') : '',
      ...(own ? soon.slice(0, 2).map(k => callout(`<b>${gDays(S.g[k]) < 0 ? 'انتهت صلاحية لسارة' : 'صلاحية لسارة تنتهي بعد ' + dTxt(gDays(S.g[k]))}</b><br>${PL[k][0]}<div style="margin-top:8px">${btn('جدّد', `keyOpen:${k}`, 'sm sec')}</div>`, 'wa', 'schedule')) : []),
      ...(own ? S.preq.map((q, i) => (q.st === 'pending' ? callout(`<b>${preqTxt(q)}</b><div style="margin-top:8px">${btn('اقرأ وقرّر', `go:perm-request:${i}`, 'sm')}</div>`, '', 'key') : '')) : []),
      own && S.rev13 === 1 ? callout(`<b>ليان صارت مراهقة</b><br>تغيّرت واجهتها وحدها. راجع ما تسمح لها به.<div style="margin-top:8px">${btn('راجع الآن', 'go:turn13:now', 'sm')}</div>`, '', 'cake') : '',
    ].join('');
    return `${todo}<div class="card flat fx sb"><div><b>${famN()}</b><div class="sm muted">اليمن · توقيت صنعاء</div></div>${chip(`${blMemN()} من ${cap} أفراد`, 'ol', 'groups')}</div>
    ${srch('ابحث باسم الفرد', 'fam')}<div data-srch-box="fam"><div data-qg>${sec('البالغون')}<div class="list">${mrow(M.ahmad)}${mrow(M.sara)}</div></div><div data-qg>${sec('المراهقون والأطفال')}<div class="list">${KIDS.map(k => mrow(M[k])).join('')}</div></div></div><div data-srch-empty="fam" hidden>${empty('search_off', 'لا فرد بهذا الاسم', 'جرّب اسماً آخر.')}</div>
    ${list(can('identity.family.invite') ? row('person_add', 'أضف فرداً', 'ادعُ بالغاً أو أنشئ ملف طفل', { a: 'go:add-member' }) : '', own ? row('handshake', 'الأدوار', 'ثلاثة أدوار جاهزة تعدّل محتواها', { a: 'go:roles' }) : '', own || can('roles.key.view') ? row('menu_book', 'دليل الصلاحيات', 'شرح كل صلاحية في النظام', { a: 'go:perm-registry' }) : '', isAdult() && !isRoot() ? row('key', 'صلاحياتي', 'ما أستطيعه في هذه العائلة', { a: 'go:my-perms' }) : '', own || can('roles.audit.view') ? row('receipt_long', 'سجل الصلاحيات', 'من مُنح ومن سُحب منه ومتى', { a: 'go:audit' }) : '')}`;
  },
});
surface('member', {
  t: id => pname(M[id]), sys: 'S1-09', p: 'adult', a: ['layan'], req: '09:6,8,10,11 07:2,3,11,12 10:25,27 05:2 02:13 03:3',
  note: '«ملف الفرد»: عرض متقدّم لكل فرد يجمع حالته الآن وقواعده ومهامه ومحفظته. كل صف يحمل قيمته ومصدرها وقفله و«لماذا؟».',
  r(id) {
    const m = M[id]; if (m.role === 'adult') return memberAdult(m);
    const k = S.kid[id], e = ENF[k.enf], pc = left(id) / (k.quota + k.extra), apps = S.apps[id], lim = apps.filter(a => a.act === 'LIMIT' && a.used >= a.lim);
    const R = (i, t, s, key, a, v) => can(key, id) ? row(i, t, s, { a, v }) : row(i, t, s, { a: 'denied:' + key, v: avail('not_delegated'), c: 'dis', chev: false });
    return `<div class="card fx">${av(m, 'lg')}<div class="grow"><b style="font-size:calc(20px*var(--ts))">${pname(m)}</b><div class="sm muted">${m.rel} · ${m.role === 'teen' ? 'قالب المراهق' : 'قالب الطفل'}</div><div class="chips" style="margin-top:6px">${chip(e[0], e[2], e[1])}${noDev(id) ? '' : chip(k.bat + '%', k.bat < 20 ? 'da' : '', k.bat < 20 ? 'battery_alert' : 'battery_5_bar')}</div></div></div>
    ${noDev(id) ? `<div class="card nodev">${ic('mobile_off')}<div class="grow"><b>لم يُقرن جهاز ${pname(m)} بعد</b><div class="sm muted">ملفه محفوظ في العائلة. ما تضعه من قواعد الآن يصل جهازه عند الإقران.</div></div>${btn('اقرن جهازه', can('identity.device.pair') || isOwner() ? 'go:pair-code:' + id : 'denied:identity.device.pair', 'sm', 'devices')}</div>` : `<div class="card fx">${ring(pc, 76, 8, pc < .2 ? 'var(--accent)' : 'var(--success)', `<b style="font-size:20px;line-height:1">${left(id)}</b>`)}<div class="grow"><b>${fmOf(id) ? `وضع حر · بقي ${fmOf(id)} د` : pmOf(id) ? `${modeQ(pmOf(id))} حتى ${S.pm[id].until}` : `بقي ${left(id)} دقيقة اليوم`}</b><div class="sm muted">استُخدم ${k.used} من ${k.quota + k.extra} د${k.extra ? ` · منها ${k.extra} د ممنوحة` : ''}</div>${lim.length ? `<div class="sm" style="color:var(--accent-text);margin-top:2px">${lim.map(a => a.n).join('، ')}: نفد الحد</div>` : ''}</div>${can('rewards.grant.create') ? btn('منح وقت', `go:grant-time:${id}`, 'sm ton') : ''}</div>`}
    ${noDev(id) ? '' : can('location.view', id) ? (l => `<button class="card fx" data-a="go:loc:${id}">${ic(l.none ? 'location_off' : 'location_on')}<div class="grow"><b>${l.none ? 'لا موقع معروف بعد' : S.privacy ? 'الموقع مخفي (وضع الخصوصية)' : l.place}</b><div class="sm muted">${l.none ? 'يظهر عند أول اتصال للجهاز' : l.live ? 'الموقع الآن' : 'آخر موقع معروف'}</div></div>${l.none ? '' : chip(minTxt(l.ago), l.live ? 'ol' : 'stale', l.live ? 'schedule' : 'history')}</button>`)(locOf(id)) : `<div class="card fx dis">${ic('location_off')}<div class="grow"><b>الموقع</b></div>${avail('not_delegated')}</div>`}
    ${sec('القواعد')}${list(
      R('apps', 'التطبيقات', `${apps.filter(a => a.act === 'LIMIT').length} بحدّ · ${apps.filter(a => a.act === 'BLOCK').length} محظور · ${apps.filter(a => a.study).length} للدراسة`, 'protection.rule.view', `go:apps:${id}`),
      R('hourglass_top', 'الحصة اليومية', 'لكل يوم من أيام الأسبوع', 'protection.rule.view', `go:quota:${id}`, `${k.quota} د`),
      R('calendar_month', 'الجدول الأسبوعي', schedSum(id), 'protection.rule.view', `go:schedule:${id}`),
      R('bolt', 'الأوضاع', fmOf(id) ? `وضع حر · بقي ${fmOf(id)} د` : pmOf(id) ? `${modeN(pmOf(id))} حتى ${S.pm[id].until}` : 'لا وضع الآن · دراسة، نوم، حر، وأوضاعك', 'protection.mode_preset.apply', `psFor:${id}`),
      R('travel_explore', 'تصفية الويب', `${wfCount(id)} فئة محظورة · ${S.wdom[id].length ? S.wdom[id].length + ' مواقع مستثناة' : 'بلا مواقع مستثناة'}`, 'protection.filter.view', `go:webfilter:${id}`),
      R('verified_user', 'حالة الحماية على الجهاز', e[0], 'protection.state.view', `go:enf-state:${id}`))}
    ${sec('المهام والمكافآت')}${list(
      R('task_alt', 'المهام', `${S.tasks.filter(t => t.kid === id && t.st === 'PENDING').length} قيد التنفيذ`, 'tasks.view', `go:tasks:${id}`),
      R('stars', m.role === 'teen' ? 'الوقت الإضافي' : 'المحفظة', m.role === 'teen' ? 'لا محفظة للمراهقين · يطلب وقتاً والقرار لك' : `سلسلة ${k.streak ? rwDy(k.streak) : 'لم تبدأ'}`, 'rewards.wallet.view', `go:wallet-admin:${id}`, m.role === 'teen' ? `${k.spent} د اليوم` : `${k.pts} نقطة`),
      R('forum', 'محادثاته', 'مرئية للأب دائماً', 'chat.minor.view', 'go:minor-chats:' + id))}
    ${sec('الملف والجهاز')}${list(
      can('hub.dashboard.view') ? row('visibility', `ما يراه ${pname(m)}`, 'رئيسيته كما تظهر على جهازه · للمشاهدة فقط', { a: 'go:view-as:' + id }) : '',
      row('badge', 'بيانات الملف', `اسم مستعار · سنة الميلاد ${m.by} · لا تاريخ ميلاد كامل`, { a: can('identity.child.profile.edit') ? `go:child-profile:${id}` : 'denied:identity.child.profile.edit' }),
      id === 'layan' && isOwner() ? row('cake', 'تبلغ ليان 13 سنة في 2030', 'تنتقل وحدها إلى واجهة المراهقين، وتراجع أنت ما تسمح به', { a: 'go:turn13' }) : '',
      row('mobile', 'الجهاز المقترن', 'Android 13 · مقترن بهذه العائلة فقط', { a: 'go:device:' + id }))}
    ${m.role === 'teen' && isOwner() ? sec('ما تسمح به لخالد') + list(row('task_alt', 'ينشئ مهامه بنفسه', S.teenTasks ? `مهامه هو فقط · ${unTxt(S.teenUn)}` : 'مهام له هو فقط، ينجزها بلا اعتماد', { a: 'teenOpen:' + id, v: chip(S.teenTasks ? 'مسموح' : 'غير مسموح', S.teenTasks ? 'ok' : 'ol') })) + `<p class="sm muted" style="margin:8px 4px">المراهق لا يُعطى إشرافاً على إخوته.</p>` : ''}
    ${isOwner() ? list(row('person_remove', `أزل ${m.n} من العائلة`, 'مهلة تراجع 30 يوماً', { a: `go:member-remove:${id}`, ic: 'var(--danger)' })) : ''}`;
  },
});
/* ============ الصلاحيات بكلام الأب (S1-03) ============
   ما يُعطى لبالغ 44 صلاحية (43 في دور الشريك + إقران جهاز طفل) في تسع مجموعات. المعرّف التقني لا يُعرض على الشاشة أبداً.
   العناوين والأوصاف اعتمدها المالك (Q-401). النموذج مرن بالكامل: لكل صلاحية حالها (مسموح / غير مسموح / ممنوع) وحدّاها (على من، إلى متى). */
const PL = {
  'identity.child.create': ['إضافة طفل', 'ينشئ ملف طفل جديد في العائلة'], 'identity.child.profile.edit': ['تعديل ملف طفل', 'يغيّر اسم الطفل وصورته ولونه وسنة ميلاده'], 'identity.device.pair': ['إقران جهاز طفل', 'يصدر رمز الإقران ويربط جهازاً بطفل'], 'identity.family.invite': ['دعوة بالغ', 'يرسل دعوة انضمام إلى بالغ آخر ويلغيها'],
  'protection.rule.view': ['رؤية قواعد التطبيقات', 'يرى المسموح والمحدود والمحظور لكل طفل'], 'protection.rule.create': ['إضافة قاعدة لتطبيق', 'يضع حداً لتطبيق أو يحظره'], 'protection.rule.edit': ['تعديل قاعدة تطبيق', 'يغيّر حدّ التطبيق أو حالته'], 'protection.rule.delete': ['حذف قاعدة تطبيق', 'يرفع القيد عن تطبيق فيصير مفتوحاً'],
  'protection.schedule.edit': ['تعديل وقت النوم والمدرسة', 'يغيّر ساعات النوم والدراسة في الأسبوع'], 'protection.priority.edit': ['ترتيب القواعد عند التعارض', 'يحدد أي قاعدة تغلب إذا اجتمعت قاعدتان'], 'protection.mode_preset.apply': ['تشغيل وضع الدراسة أو النوم', 'يشغّل وضعاً جاهزاً لمدة محددة'], 'protection.filter.view': ['رؤية تصفية المواقع', 'يرى فئات المواقع المحجوبة'],
  'protection.state.view': ['رؤية حالة الحماية', 'يعرف هل الحماية تعمل على جهاز كل طفل'], 'protection.tamper.view': ['رؤية محاولات العبث', 'يرى إن حاول طفل تعطيل الحماية'], 'protection.audit.view': ['رؤية سجل الحماية', 'يرى من غيّر القواعد ومتى'],
  'location.view': ['رؤية الموقع الآن', 'يرى أين كل طفل على الخريطة'], 'location.history.view': ['رؤية سجل التنقل', 'يرى أين كان الطفل في الأيام السبعة الماضية'], 'location.sos.acknowledge': ['استلام الاستغاثة', 'يؤكد أنه رأى استغاثة الطفل'], 'location.sos.resolve': ['إنهاء الاستغاثة', 'يغلق الاستغاثة بعد الاطمئنان على الطفل'],
  'tasks.view': ['رؤية المهام', 'يرى مهام الأطفال وحالتها'], 'tasks.create': ['إنشاء مهمة', 'يكلّف طفلاً بمهمة جديدة'], 'tasks.approve': ['اعتماد مهمة', 'يقبل المهمة المنجزة فتُصرف نقاطها'], 'tasks.cancel': ['إلغاء مهمة', 'يلغي مهمة لم تُنجز'], 'calendar.view': ['رؤية التقويم', 'يرى مواعيد العائلة'], 'calendar.event.create': ['إضافة موعد', 'يضيف موعداً للتقويم ويعدّله ويحذفه'],
  'rewards.wallet.view': ['رؤية نقاط الأطفال', 'يرى رصيد كل طفل'], 'rewards.ledger.view': ['رؤية سجل النقاط', 'يرى كل ما كُسب وصُرف'], 'rewards.grant.create': ['منح نقاط', 'يعطي طفلاً نقاطاً بيده'], 'rewards.time_request.decide': ['الرد على طلب وقت إضافي', 'يقبل طلب الطفل وقتاً إضافياً أو يرفضه'],
  'chat.minor.view': ['قراءة محادثات الأطفال', 'يقرأ رسائل الأطفال والمراهقين'], 'chat.parents.view': ['محادثة الأهل', 'يرى محادثة البالغين في العائلة'], 'chat.channel.create.group': ['إنشاء مجموعة', 'ينشئ محادثة جماعية للعائلة'], 'chat.channel.close': ['إغلاق محادثة طفل', 'يوقف محادثة طفل فلا يرسل فيها'], 'chat.message.delete.any': ['حذف أي رسالة', 'يحذف رسالة أي فرد عند الجميع'],
  'hub.dashboard.view': ['رؤية اللوحة الرئيسية', 'يرى ملخص الأطفال في الصفحة الأولى'], 'hub.alerts.view': ['رؤية التنبيهات', 'تصله تنبيهات الأطفال'], 'hub.alerts.acknowledge': ['إغلاق تنبيه', 'يؤكد أنه قرأ التنبيه فيختفي عند الجميع'], 'hub.settings.view': ['رؤية صفحة التحكم', 'يرى إعدادات الأطفال'], 'hub.settings.edit': ['التعديل من صفحة التحكم', 'يعدّل ما مُنح صلاحيته من صفحة التحكم'], 'hub.plan.view': ['رؤية الخطة والاستخدام', 'يرى خطة العائلة وما استُهلك منها'],
  'shell.admin.access': ['دخول قسم الإدارة', 'يفتح الإعدادات الإدارية في التطبيق'], 'shell.config.view': ['رؤية إعدادات العائلة', 'يرى اسم العائلة وبلدها وتوقيتها'], 'roles.key.view': ['رؤية دليل الصلاحيات', 'يقرأ شرح كل صلاحية'], 'roles.audit.view': ['رؤية سجل الصلاحيات', 'يرى من مُنح ومن سُحب منه ومتى'],
  'roles.grant.create': ['منح الصلاحيات'], 'roles.grant.edit': ['تعديل الصلاحيات'], 'roles.grant.revoke': ['سحب الصلاحيات'], 'roles.template.apply': ['تغيير أدوار البالغين'], 'roles.ownership.transfer': ['نقل ملكية العائلة'],
  'shell.parent_gate.manage': ['تغيير الرقم السري'], 'shell.mode.exit_child': ['إيقاف القواعد من جهاز الطفل'], 'shell.config.edit': ['تعديل إعدادات العائلة'], 'identity.device.unpair': ['فك إقران جهاز'], 'identity.member.remove': ['إزالة فرد من العائلة'], 'identity.biometric.enable': ['تشغيل الفتح بالبصمة'], 'identity.session.revoke': ['إخراج جهاز من الحساب'],
  'billing.manage': ['إدارة الاشتراك'], 'billing.topup.buy': ['شراء رصيد رسائل'], 'billing.view': ['رؤية الاشتراك والفواتير'],
  'rewards.settings.edit': ['تعديل نظام المكافآت'], 'rewards.streak.freeze': ['تجميد سلسلة الأيام'], 'rewards.grant.reverse': ['التراجع عن منحة'], 'rewards.objection.decide': ['الرد على اعتراض طفل'], 'rewards.settings.view': ['رؤية إعدادات المكافآت'],
  'tasks.revoke': ['إلغاء اعتماد مهمة'], 'tasks.category.create': ['إضافة فئة مهام'], 'protection.free_mode.activate': ['تشغيل الوضع الحر'], 'protection.quota.edit': ['تعديل الحصة اليومية'], 'protection.tamper.resolve': ['إغلاق تنبيه عبث'], 'protection.filter.edit': ['تعديل تصفية المواقع'], 'location.emergency.manage': ['إدارة جهات الطوارئ'],
};
const PG = [
  ['kids', 'الأطفال والأجهزة', 'family_restroom', ['identity.child.create', 'identity.child.profile.edit', 'identity.device.pair', 'identity.family.invite']],
  ['time', 'وقت الشاشة والتطبيقات', 'hourglass_top', ['protection.rule.view', 'protection.rule.create', 'protection.rule.edit', 'protection.rule.delete', 'protection.schedule.edit', 'protection.priority.edit', 'protection.mode_preset.apply', 'protection.filter.view']],
  ['guard', 'حالة الحماية', 'verified_user', ['protection.state.view', 'protection.tamper.view', 'protection.audit.view']],
  ['loc', 'الموقع والاستغاثة', 'location_on', ['location.view', 'location.history.view', 'location.sos.acknowledge', 'location.sos.resolve']],
  ['tasks', 'المهام والتقويم', 'task_alt', ['tasks.view', 'tasks.create', 'tasks.approve', 'tasks.cancel', 'calendar.view', 'calendar.event.create']],
  ['rew', 'النقاط والوقت الإضافي', 'stars', ['rewards.wallet.view', 'rewards.ledger.view', 'rewards.grant.create', 'rewards.time_request.decide']],
  ['chat', 'المحادثات', 'forum', ['chat.minor.view', 'chat.parents.view', 'chat.channel.create.group', 'chat.channel.close', 'chat.message.delete.any']],
  ['hub', 'اللوحة والتنبيهات', 'dashboard', ['hub.dashboard.view', 'hub.alerts.view', 'hub.alerts.acknowledge', 'hub.settings.view', 'hub.settings.edit', 'hub.plan.view']],
  ['adm', 'الإعدادات والسجلات', 'settings', ['shell.admin.access', 'shell.config.view', 'roles.key.view', 'roles.audit.view']],
];
Object.assign(PL, {   /* ما لا يُعطى ولا يُسحب: يملكه كل فرد بحسب دوره، أو يخص المساعد الآلي */
  'shell.view': ['فتح التطبيق'], 'identity.login': ['الدخول برقم الهاتف'], 'identity.email.login': ['الدخول بالبريد'], 'identity.family.create': ['إنشاء عائلة'], 'identity.family.join': ['الانضمام بدعوة'], 'identity.account.delete_self': ['حذف حسابي'], 'identity.family.leave': ['مغادرة العائلة'],
  'billing.plan.edit': ['تغيير خطة الاشتراك'], 'rewards.objection.create': ['الاعتراض على خصم نقاط'], 'rewards.wallet.redeem': ['صرف النقاط'], 'rewards.time_request.create': ['طلب وقت إضافي'], 'tasks.submit': ['تسليم مهمة'], 'location.sos.trigger': ['إرسال استغاثة'],
  'chat.channel.create.direct': ['بدء محادثة خاصة'], 'chat.channel.view': ['رؤية محادثاتي'], 'chat.message.send': ['إرسال رسالة'],
  'agent.summary.read': ['المساعد: قراءة ملخص اليوم'], 'agent.plan.create': ['المساعد: اقتراح خطة'], 'agent.task.verify': ['المساعد: التحقق من صورة مهمة'], 'agent.rule.change': ['المساعد: اقتراح تغيير قاعدة'], 'agent.message.send': ['المساعد: إرسال رسالة'], 'agent.payment.execute': ['المساعد: تنفيذ دفع'], 'agent.data.delete': ['المساعد: حذف بيانات'],
});
const PGIVE = PG.flatMap(g => g[3]);                       /* كل ما يُعطى لبالغ */
const SENS = ['chat.minor.view', 'location.history.view', 'chat.channel.close', 'chat.message.delete.any', 'protection.rule.delete'];   /* الحساسة (Q-317): تُمنح بالرقم السري */
const OWNER_ONLY = [['credit_card', 'الاشتراك والدفع وشراء الرسائل'], ['key', 'منح الصلاحيات وسحبها وتعديل الأدوار'], ['hourglass_top', 'الحصة اليومية، والوضع الحر، وتعديل تصفية المواقع'], ['link_off', 'فك إقران الأجهزة وإزالة الأفراد وحذف العائلة'], ['lock', 'الرقم السري والبصمة وإخراج الأجهزة من الحساب'], ['stars', 'إعدادات المكافآت والرد على اعتراضات الأطفال'], ['emergency', 'جهات الطوارئ'], ['gpp_maybe', 'إغلاق تنبيهات العبث وإلغاء اعتماد المهام']];
const ROLE_IC = { partner: 'handshake', guardian: 'shield_person', observer: 'visibility', none: 'person' };
const rn = t => (t === 'none' ? 'بلا صلاحيات' : S.roles[t].n);
const rdsc = t => (t === 'none' ? 'عضو في العائلة لا يرى شؤون الأطفال ولا يديرها.' : S.roles[t].d);
const preqTxt = q => (q.k === 'teen' ? 'خالد يطلب أن ينشئ مهامه بنفسه' : q.k === 'role' ? 'سارة تطلب دوراً في العائلة' : `سارة تطلب صلاحية: ${permName(q.k)}`);
const permName = k => (PL[k] || ['هذا الإجراء'])[0];
const roleEdited = () => S.tpl !== 'none' && (Object.values(S.g).some(g => g.src !== 'role' || g.ed || g.d) || S.roles[S.tpl].keys.some(k => !S.g[k]));
const roleName = () => (S.co ? 'صلاحية كاملة' : rn(S.tpl) + (roleEdited() ? ' · معدَّل' : ''));
const grpOf = id => PG.find(g => g[0] === id);
const grpSum = (ks, has) => { const n = ks.filter(k => has.includes(k)).length; return n === 0 ? 'لا شيء' : n === ks.length ? 'كل شيء' : `${n} من ${ks.length}`; };
const sensChip = k => (SENS.includes(k) ? chip('حساسة', 'wa', 'lock') : '');
/* التواريخ والمدد */
const MON = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const fmtD = iso => { const [y, m, d] = iso.split('-'); return `${+d} ${MON[m - 1]} ${y}`; };
const addDays = n => new Date(Date.parse(TODAY) + n * 864e5).toISOString().slice(0, 10);
const dTxt = n => (n === 0 ? 'اليوم' : n === 1 ? 'يوم واحد' : n === 2 ? 'يومان' : n <= 10 ? `${n} أيام` : `${n} يوماً`);
const UNP = [['', 'حتى ألغيها أنا', 'تبقى سارية حتى تسحبها'], ['7', 'أسبوع'], ['30', 'شهر'], ['90', '3 أشهر'], ['365', 'سنة'], ['x', 'تاريخ آخر']];
const unTxt = un => (un == null ? 'اختر' : un === '' ? 'حتى تلغيها' : `حتى ${fmtD(un)}`);
const scTxt = sc => (sc == null ? 'اختر' : sc === 'fam' ? 'العائلة كلها' : sc === 'all' ? 'كل الأطفال' : sc.map(k => M[k].n).join(' و') || 'اختر');
const expChip = g => { const d = gDays(g); return d == null ? '' : d < 0 ? chip('انتهت', 'da', 'event_busy') : d <= 7 ? chip(d === 0 ? 'تنتهي اليوم' : `بقي ${dTxt(d)}`, 'wa', 'schedule') : ''; };
const gState = k => { const g = S.g[k]; return !g ? 'off' : g.d ? 'deny' : 'grant'; };
const gLine = k => { const g = S.g[k]; return !g ? 'غير مسموح' : `${g.d ? 'ممنوع' : gLive(g) ? 'مسموح' : 'انتهت مدتها'} · ${scTxt(g.sc)} · ${unTxt(g.un)}`; };
const gSrc = g => (g.d ? 'منعتها أنت' : g.src === 'role' ? `من دور ${rn(S.tpl)}${g.ed ? ' · عدّلتها أنت' : ''}` : 'أضفتها أنت');
const soonList = () => PGIVE.filter(k => S.g[k] && !S.g[k].d && gDays(S.g[k]) != null && gDays(S.g[k]) <= 7);
const sameAll = f => { const v = Object.values(S.g).filter(g => !g.d && g.sc !== 'fam').map(f); return v.length && v.every(x => JSON.stringify(x) === JSON.stringify(v[0])) ? v[0] : undefined; };
/* منتقي «على من» و«إلى متى»: لا شيء مختار مسبقاً (REQ-011 · Q-087). D = {sc, un, up} */
const termsOk = (D, fam) => D.un != null && (fam || D.sc === 'all' || (Array.isArray(D.sc) && D.sc.length > 0));
function termsUI(D, w, fam, noSc) {
  const sc = Array.isArray(D.sc) ? D.sc : [];
  return `${noSc ? '' : fam ? `<h3 class="sec"><span>على من</span></h3>${list(row('groups', 'العائلة كلها', 'هذه الصلاحية لا تخص طفلاً بعينه'))}` : `<h3 class="sec"><span>على من</span></h3>${list(row('groups', 'كل الأطفال', 'ومن يُضاف لاحقاً', { a: `tSc:${w}:all`, v: ic(D.sc === 'all' ? 'radio_button_checked' : 'radio_button_unchecked'), chev: false }), KIDS.map(k => row('', M[k].n, '', { lead: av(M[k], 'sm'), a: `tSc:${w}:${k}`, v: ic(sc.includes(k) ? 'check_box' : 'check_box_outline_blank'), chev: false })))}${Array.isArray(D.sc) && !sc.length ? callout('اختر طفلاً واحداً على الأقل.', 'wa', 'info') : ''}`}
  <h3 class="sec"><span>إلى متى</span></h3>${list(UNP.map(([k, t, s]) => row('', t, k === D.up && k && k !== 'x' && D.un ? `تنتهي في ${fmtD(D.un)}` : s || '', { a: `tUn:${w}:${k}`, v: ic(D.up === k ? 'radio_button_checked' : 'radio_button_unchecked'), chev: false })))}
  ${D.up === 'x' ? `<label class="fld ${D.bad ? 'err' : ''}"><span>تاريخ الانتهاء</span><input type="date" id="unD" data-w="${w}" min="${addDays(1)}" value="${D.un || ''}"><small>${D.bad ? 'اختر تاريخاً بعد اليوم.' : 'تنتهي الصلاحية وحدها في آخر هذا اليوم.'}</small></label>` : ''}`;
}
const draftOf = w => (w === 'k' ? S.kd : w === 't' ? S.td : S.rt);
const upOf = un => (un == null ? null : un === '' ? '' : 'x');
/* سجل منظَّم: من فعل، بمن، أي فعل، أي صلاحية */
function paud(t, act, o = {}) { S.audit.unshift({ t, w: me().n, at: 'الآن', k: o.k || 'roles.grant.' + (act === 'revoke' ? 'revoke' : act === 'edit' ? 'edit' : 'create'), deny: act === 'deny' ? 1 : undefined, who: o.who || 'sara', act, pk: o.pk, un: o.un, sc: o.sc, d: 0, undo: o.undo, sn: o.sn, co: o.co }); }
/* تراجع: يعيد الحال ويُسجَّل ويصل سارة إشعار به */
function undoTo(was, t) { [S.tpl, S.g] = JSON.parse(was); const a = S.audit.find(x => x.undo === was); if (a) a.undone = 1; paud(`تُراجع عن: ${t}`, 'edit', { sn: 'تراجع أحمد عن آخر تغيير في صلاحياتكِ' }); }
const pnNew = (who = 'sara') => S.audit.filter(a => a.sn && !a.rd && !a.co && a.who === who);

function memberAdult(m) {
  const root = isRoot(), self = m.id === me().id, own = isOwner() && !self;
  if (m.owner) return `<div class="card fx">${av(m, 'lg')}<div class="grow"><b style="font-size:calc(20px*var(--ts))">${m.n}</b><div class="sm muted">الأب</div><div class="chips" style="margin-top:6px">${chip('المالك', 'go', 'verified')}</div></div></div>
    ${callout('المالك يستطيع كل شيء. لا يزيله أحد من العائلة، ولا تُسحب منه صلاحية.', 'nt', 'verified')}${sec('ما لا يُعطى ضمن أي دور')}${list(OWNER_ONLY.map(([i, t]) => row(i, t, '')))}<p class="sm muted" style="margin:8px 4px">هذه لا يحصل عليها بالغ آخر إلا بالصلاحية الكاملة.</p>
    ${root ? sec('الصلاحية الكاملة') + list(row('admin_panel_settings', S.co ? 'سارة لها الصلاحية الكاملة' : 'أعطِ بالغاً الصلاحية الكاملة', S.co ? 'اعرضها أو اسحبها' : 'يصير مثلك، وتسحبها متى شئت', { a: 'go:transfer' })) : ''}`;
  if (S.removed[m.id]) return `<div class="card fx">${av(m, 'lg')}<div class="grow"><b style="font-size:calc(20px*var(--ts))">${m.n}</b><div class="sm muted">الأم</div><div class="chips" style="margin-top:6px">${chip('أُزيلت من العائلة', 'da', 'person_off')}</div></div></div>${callout(`خرجت سارة من العائلة وتوقف دخولها. تُمحى بياناتها نهائياً بعد ${S.removed[m.id]} يوماً.`, 'da', 'schedule')}${own ? btn('عرض وإعادتها', `go:member-remove:${m.id}`, 'sec') : ''}`;
  const has = grantsOf(), none = !Object.keys(S.g).length, soon = soonList(), den = PGIVE.filter(k => S.g[k] && S.g[k].d), mv = S.mv || 'sum', sc = sameAll(g => g.sc), un = sameAll(g => g.un);
  const head = `<div class="card fx">${av(m, 'lg')}<div class="grow"><b style="font-size:calc(20px*var(--ts))">${m.n}</b><div class="sm muted">الأم</div><div class="chips" style="margin-top:6px">${chip(roleName(), S.co ? 'go' : none ? 'ol' : 'in', S.co ? 'admin_panel_settings' : ROLE_IC[S.tpl])}</div></div></div>`;
  if (self) return `${head}${list(row('key', 'صلاحياتي', 'ما أستطيعه في هذه العائلة', { a: 'go:my-perms' }))}`;
  const keyRow = k => row('', `${PL[k][0]} ${sensChip(k)}`, gLine(k), { a: own ? `keyOpen:${k}` : `go:perm-key:${k}`, v: S.g[k] ? (S.g[k].d ? chip('ممنوع', 'da', 'block') : expChip(S.g[k]) || chip('مسموح', 'ok')) : chip('غير مسموح', 'ol'), c: gLive(S.g[k]) ? '' : 'dis' });
  return `${head}
  ${S.co ? callout(`<b>لسارة الصلاحية الكاملة منذ ${S.co.since}</b><br>تفعل كل ما تفعله أنت. دورها أدناه محفوظ ويعود إليها حين تسحبها.${root ? `<div style="margin-top:8px">${btn('اسحب الصلاحية الكاملة', 'coTake', 'sm sec')}</div>` : ''}`, 'wa', 'admin_panel_settings') : ''}
  ${none && !S.co ? callout(own ? 'سارة عضو في العائلة لكنها لا ترى شؤون الأطفال ولا تديرها. اختر لها دوراً، أو أضف صلاحيات بعينها.' : 'لم تُمنحي صلاحيات بعد.', 'nt', 'info') : ''}
  ${own ? soon.map(k => callout(`<b>${gDays(S.g[k]) < 0 ? 'انتهت' : 'تنتهي قريباً'}: ${PL[k][0]}</b><br>${gDays(S.g[k]) < 0 ? `انتهت في ${fmtD(S.g[k].un)} وتوقفت.` : `بقي ${dTxt(gDays(S.g[k]))} · ${fmtD(S.g[k].un)}`}<div style="margin-top:8px">${btn('جدّد', `keyOpen:${k}`, 'sm sec')}</div>`, 'wa', 'schedule')).join('') : ''}
  ${own ? list(row(ROLE_IC[S.tpl], 'الدور', rdsc(S.tpl), { a: 'go:role-pick', v: rn(S.tpl) }), none ? '' : row('groups', 'على من', sc === undefined ? 'تختلف من صلاحية لأخرى' : 'لكل صلاحيات الأطفال', { a: 'termsAll', v: sc === undefined ? 'مختلف' : scTxt(sc) }), none ? '' : row('event', 'إلى متى', un === undefined ? 'تختلف من صلاحية لأخرى' : un ? 'تنتهي وحدها بعدها' : 'تبقى حتى تسحبها', { a: 'termsAll', v: un === undefined ? 'مختلف' : unTxt(un) })) : ''}
  ${sec(S.co ? `صلاحيات ${m.n} المحفوظة` : `ماذا تستطيع ${m.n}`)}<p class="sm muted" style="margin:-4px 4px 8px">${S.co ? 'تعود إليها حين تسحب الصلاحية الكاملة · ' : ''}${has.length} مسموحة${den.length ? ` · ${den.length} ممنوعة` : ''} من ${PGIVE.length}</p>${seg([['sum', 'ملخص'], ['all', 'كل الصلاحيات']], mv, 'mvSet')}
  ${mv === 'sum' ? list(PG.map(([id, t, i, ks]) => row(i, t, ks.some(k => S.g[k] && S.g[k].d) ? 'فيها ممنوع' : '', { a: own ? `go:perm-group:${id}` : '', v: grpSum(ks, has), c: ks.some(k => has.includes(k)) ? '' : 'dis' }))) : PG.map(([, t, , ks]) => sec(t) + list(ks.map(keyRow))).join('')}
  ${own && !none ? sec('آخر التعديلات', 'السجل كله', 'auWho:sara') + (S.audit.filter(a => a.who === 'sara').length ? `<div class="card"><div class="tl">${S.audit.filter(a => a.who === 'sara').slice(0, 3).map(a => `<div class="ev ${a.deny ? 'da' : 'ok'}"><b>${a.t}</b><span>${a.w} · ${a.at}</span></div>`).join('')}</div></div>` : '') : ''}
  ${own ? sec('أخرى') + list(root ? row('admin_panel_settings', S.co ? 'الصلاحية الكاملة' : 'أعطِها الصلاحية الكاملة', S.co ? 'اعرضها أو اسحبها' : 'تصير مثلك، وتسحبها متى شئت', { a: 'go:transfer' }) : '', none ? '' : row('key_off', 'اسحب كل صلاحياتها', 'تبقى عضواً في العائلة بلا صلاحيات', { a: 'revokeAll', ic: 'var(--danger)' }), row('person_remove', `أزل ${m.n} من العائلة`, 'يتوقف دخولها · مهلة تراجع 30 يوماً', { a: `go:member-remove:${m.id}`, ic: 'var(--danger)' })) : ''}`;
}
surface('role-pick', {
  kind: 'sheet', t: 'اختيار الدور', sys: 'S1-03', p: 'owner', req: '03:13,14',
  note: 'الأدوار الثلاثة الجاهزة نقطة بداية، ومعها «بلا صلاحيات». كل دور موصوف بجملة تقول ما يستطيعه صاحبه. اختيار دور يفتح معاينة ما سيتغير قبل التطبيق. محتوى كل دور يعدّله المالك من «الأدوار» (Q-089).',
  r() { return `<h4>أي دور لسارة؟</h4><p class="d">الدور نقطة بداية. تستطيع بعده أن تضيف وتسحب صلاحيات بعينها.</p>${['partner', 'guardian', 'observer', 'none'].map(k => `<button class="card fx" data-a="${k === S.tpl && !roleEdited() ? 'close' : k === 'none' ? 'revokeAll' : 'rolePick:' + k}" ${S.tpl === k ? 'style="border-color:var(--success)"' : ''}>${ic(ROLE_IC[k])}<div class="grow"><b>${rn(k)}</b><div class="sm muted">${rdsc(k)}</div></div>${S.tpl === k ? chip('الحالي', 'ok', 'check') : ic('chevron_right')}</button>`).join('')}${btn('عدّل محتوى الأدوار', 'go:roles', 'txt', 'tune')}`; },
});
surface('tpl-diff', {
  kind: 'sheet', t: 'معاينة تغيير الدور', sys: 'S1-03', p: 'owner', a: ['guardian'], req: '03:10,11,12,13,14,19',
  note: 'قبل تطبيق الدور يرى الأب ما سيُضاف وما سيُسحب بكلام واضح، ويختار على من وإلى متى (لا شيء مختار مسبقاً). الدور الجديد يستبدل ما عدّله من قبل، وما منعه بعينه يبقى ممنوعاً. التطبيق بالرقم السري، وبعده تقرير بالنتيجة. دون اتصال لا يُطبَّق دور (Q-269).',
  r(k, done) {
    if (done) { const dn = PGIVE.filter(x => S.g[x] && S.g[x].d); return `<div class="bigic" style="width:64px;height:64px;border-radius:22px;background:var(--success-soft);color:var(--success)">${ic('check_circle')}</div><h4 class="c">صارت سارة ${rn(k)}</h4><p class="d c">يسري الآن على كل أجهزتها، ووصلها إشعار.</p>${list(row('check_circle', 'مسموحة', '', { v: `${grantsOf().length}` }), dn.length ? row('block', 'بقيت ممنوعة', dn.map(permName).join('، '), { v: `${dn.length}` }) : '', row('groups', 'على من', '', { v: scTxt(S.rt.sc) }), row('event', 'إلى متى', '', { v: unTxt(S.rt.un) }))}${S.os === 'ios' ? callout('بعض قواعد التطبيقات لا تُفرض على أجهزة iPhone. تظهر عند سارة بعلامة «غير متاح على هذا الجهاز».', 'nt', 'mobile_off') : ''}${btn('تم', 'close')}`; }
    const cur = grantsOf(), nxt = S.roles[k].keys.filter(x => !(S.g[x] && S.g[x].d)), add = nxt.filter(x => !cur.includes(x)), rem = cur.filter(x => !nxt.includes(x)), kept = S.roles[k].keys.filter(x => S.g[x] && S.g[x].d), sens = add.filter(x => SENS.includes(x)), off = offline(), ok = termsOk(S.rt), same = !add.length && !rem.length && !roleEdited();
    const grp = keys => PG.map(([, t, i, ks]) => { const h = ks.filter(x => keys.includes(x)); return h.length ? row(i, t, h.map(permName).join('، ')) : ''; });
    return `<h4>سارة: ${rn(k)}</h4><p class="d">${rdsc(k)}</p>
    ${roleEdited() ? callout('عدّلتَ صلاحيات بعينها لسارة من قبل. الدور الجديد يستبدلها، إلا ما منعته فيبقى ممنوعاً.', 'wa', 'info') : ''}
    ${add.length ? `<h3 class="sec" style="margin-top:4px"><span>ستستطيع (${add.length})</span></h3>${list(grp(add))}` : ''}${rem.length ? `<h3 class="sec"><span>لن تستطيع بعدها (${rem.length})</span></h3>${list(grp(rem))}` : ''}${kept.length ? `<h3 class="sec"><span>تبقى ممنوعة (${kept.length})</span></h3>${list(grp(kept))}` : ''}${same ? callout('هذا دورها الحالي بلا فرق.', 'ok', 'check_circle') : ''}
    ${list(row('groups', 'على من', '', { a: 'go:grant-terms:' + k, v: scTxt(S.rt.sc) }), row('event', 'إلى متى', '', { a: 'go:grant-terms:' + k, v: unTxt(S.rt.un) }))}
    ${ok ? '' : callout('اختر على من وإلى متى قبل التطبيق.', 'wa', 'info')}${sens.length ? callout(`فيه ${sens.length === 1 ? 'صلاحية حساسة' : sens.length + ' صلاحيات حساسة'}: ${sens.map(permName).join('، ')}.`, 'nt', 'lock') : ''}
    ${off ? callout('أنت غير متصل. تغيير الدور يحتاج اتصالاً.', 'wa', 'cloud_off') : ''}${btn('طبّق بالرقم السري', `tplApply:${k}`, off || !ok || same ? '" disabled="' : '', 'lock')}`;
  },
});
surface('grant-terms', {
  kind: 'sheet', t: 'على من وإلى متى', sys: 'S1-03', p: 'owner', req: '03:11',
  note: 'حدّا المنح يختارهما الأب بنفسه: على أي أطفال، وإلى متى. لا شيء مختار مسبقاً، ولا يُطبَّق دور قبل الاختيار (REQ-011 · Q-087). المدة: «حتى ألغيها أنا» أو مدة جاهزة أو أي تاريخ بعد اليوم. من ملف البالغ تغيّر هذه الورقة حدود كل صلاحياته دفعة واحدة؛ وكل صلاحية تُعدَّل حدودها وحدها من ورقتها. تنبيه قبل الانتهاء بسبعة أيام (Q-227).',
  r(ret) { return `<h4>${ret ? `دور ${rn(ret)} لسارة` : 'كل صلاحيات سارة'}</h4>${ret ? '' : `<p class="d">يغيّر حدود كل صلاحياتها الحالية معاً. ما منعته يبقى كما هو.</p>`}${termsUI(S.rt, 'r', false)}${btn(ret ? 'تم' : PGIVE.some(k => SENS.includes(k) && gLive(S.g[k])) ? 'احفظ للكل بالرقم السري' : 'احفظ للكل', 'gtDone:' + (ret || ''), ret || termsOk(S.rt) ? '' : '" disabled="')}`; },
});
surface('perm-group', {
  t: id => grpOf(id)[1], sys: 'S1-03', p: 'owner', a: ['chat'], req: '03:4,8,9,10,11,12,14,19',
  note: 'صلاحيات مجموعة واحدة لبالغ واحد. كل صلاحية بعنوان عربي وجملة تشرحها (REQ-008)، وتحتها حالها الفعلي: مسموح أو غير مسموح أو ممنوع، وعلى من، وإلى متى. المفتاح أو الصف يفتح ورقة الصلاحية. تغيير هنا لا يغيّر الدور الجاهز ولا صلاحيات غير سارة (REQ-014).',
  r(id) { const [, , , ks] = grpOf(id);
    return `<div class="card flat fx">${av(M.sara)}<div class="grow"><b>سارة</b><div class="sm muted">${roleName()}</div></div></div>${S.co ? callout('لسارة الصلاحية الكاملة الآن، فتستطيع كل شيء. ما تضبطه هنا يسري حين تسحبها.', 'wa', 'admin_panel_settings') : ''}
    <div class="list">${ks.map(k => { const g = S.g[k], on = gLive(g); return `<div class="row noic"><button class="tx" data-a="keyOpen:${k}" style="text-align:start"><b>${PL[k][0]} ${sensChip(k)} ${g && g.d ? chip('ممنوع', 'da', 'block') : g ? expChip(g) : ''}</b><span>${PL[k][1]}</span><span>${gLine(k)}${g ? ` · ${gSrc(g)}` : ''}</span></button>${tg(on, `keyOpen:${k}:${on ? 'off' : 'grant'}`, PL[k][0])}</div>`; }).join('')}</div>
    ${callout('كل تغيير يسري فوراً على كل أجهزة سارة، ويصلها إشعار، ويُكتب في السجل.', 'nt', 'bolt')}`; },
});
const KST = [['grant', 'مسموح'], ['off', 'غير مسموح'], ['deny', 'ممنوع']];
function kdInit(k, st) { const g = S.g[k]; S.kd = { k, st: st || gState(k), was: gState(k), sc: g ? (Array.isArray(g.sc) ? g.sc.slice() : g.sc) : (FAMK.includes(k) ? 'fam' : null), un: g ? g.un : null, up: g ? upOf(g.un) : null }; return S.kd; }
surface('perm-key', {
  kind: 'sheet', t: 'صلاحية واحدة', sys: 'S1-03', p: 'owner', a: ['chat.minor.view'], req: '03:4,8,10,11,12,17,19',
  note: 'ورقة صلاحية واحدة لبالغ واحد: ثلاث حالات (مسموح، غير مسموح، ممنوع). «ممنوع» رفض صريح يغلب أي دور يُعطى لاحقاً حتى يرفعه الأب (REQ-004). للمسموح والممنوع حدّان يختارهما الأب: على من، وإلى متى. منح الحساسة بالرقم السري؛ السحب والمنع بلا رقم سري ويسريان فوراً بلا مهلة. تعديل متزامن من جهاز آخر يعرض القيمتين ليختار الأب (REQ-019). دون اتصال: الحساسة لا تُمنح (Q-269) وغيرها يُرسل عند عودة الاتصال. لغير المالك: عرض للقراءة.',
  r(k) {
    const D = S.kd && S.kd.k === k ? S.kd : kdInit(k), g = S.g[k], fam = FAMK.includes(k), sens = SENS.includes(k), off = offline();
    if (!PGIVE.includes(k)) return `<div class="bigic" style="width:64px;height:64px;border-radius:22px">${ic('lock')}</div><h4 class="c">${permName(k)}</h4>${callout(window.FOS_PERM.ownerOnly.includes(k) ? 'هذه للمالك، ولا تُعطى ضمن أي دور. يحصل عليها بالغ آخر بالصلاحية الكاملة فقط.' : k.startsWith('agent.') ? 'هذه تخص المساعد الآلي، وتُضبط من صفحته.' : 'هذه لكل فرد بحسب دوره. لا تُعطى ولا تُسحب.', 'nt', 'lock')}${btn('فهمت', 'close')}`;
    const info = g ? list(row('account_tree', 'من أين', '', { v: gSrc(g) }), row('schedule', g.d ? 'مُنعت' : 'مُنحت', '', { v: `أحمد · ${g.at}` })) : '';
    if (!isOwner()) return `<div class="bigic" style="width:64px;height:64px;border-radius:22px">${ic(gLive(g) ? 'check_circle' : 'block')}</div><h4 class="c">${PL[k][0]}</h4><p class="d c">${PL[k][1]}</p>${list(row('person', 'سارة', '', { v: chip(gLive(g) ? 'مسموح' : g && g.d ? 'ممنوع' : 'غير مسموح', gLive(g) ? 'ok' : g && g.d ? 'da' : 'ol') }), g ? row('groups', 'على من', '', { v: scTxt(g.sc) }) : '', g ? row('event', 'إلى متى', '', { v: unTxt(g.un) }) : '')}${info}${btn('فهمت', 'close')}`;
    if (D.cf) return `<div class="bigic" style="width:64px;height:64px;border-radius:22px;background:var(--warning-soft);color:var(--warning)">${ic('sync_problem')}</div><h4 class="c">تغيّرت هذه الصلاحية قبل لحظات</h4><p class="d c">عُدّلت من جهاز آخر وأنت تعدّلها. لم يُحفظ شيء بعد. اختر أي القيمتين تبقى.</p>${list(row('edit', 'قيمتك', D.st === 'off' ? '' : `${scTxt(D.sc)} · ${unTxt(D.un)}`, { v: chip(KST.find(x => x[0] === D.st)[1], 'in') }), row('devices', 'القيمة الأحدث', `${fam ? 'العائلة كلها' : 'ليان'} · حتى ${fmtD(addDays(30))}`, { v: chip('مسموح', 'ok') }))}${btn(sens && D.st === 'grant' ? 'احفظ قيمتي بالرقم السري' : 'احفظ قيمتي', 'keySave:mine', '', sens && D.st === 'grant' ? 'lock' : '')}<div class="gap"></div>${btn('اقبل القيمة الأحدث', 'keySave:theirs', 'sec')}`;
    const ch = D.st !== D.was || (g && D.st !== 'off' && (JSON.stringify(D.sc) !== JSON.stringify(g.sc) || D.un !== g.un)), need = D.st !== 'off', ok = !need || termsOk(D, fam), blk = off && sens && D.st === 'grant';
    const lbl = !ch ? 'تم' : D.st === 'off' ? 'اسحب الصلاحية' : D.st === 'deny' ? 'امنع' : D.was === 'grant' ? (sens ? 'احفظ التعديل بالرقم السري' : 'احفظ التعديل') : sens ? 'امنح بالرقم السري' : 'امنح';
    return `<h4>${PL[k][0]} ${sensChip(k)}</h4><p class="d">${PL[k][1]}</p><div class="card flat fx" style="margin-bottom:10px">${av(M.sara, 'sm')}<div class="grow sm"><b>سارة</b> · ${gLine(k)} ${g && !g.d ? expChip(g) : ''}</div></div>
    ${seg(KST, D.st, 'kSt')}
    ${D.st === 'off' ? callout(D.was === 'grant' ? 'تتوقف الصلاحية فوراً على كل أجهزة سارة. لا تخرج من حسابها. لا مهلة تراجع.' : D.was === 'deny' ? 'يُرفع المنع. تبقى غير مسموحة حتى تمنحها أو تعطي دوراً يشملها.' : 'ليست عند سارة. قد تأتيها مع دور يشملها.', D.was === 'grant' ? 'wa' : 'nt', D.was === 'grant' ? 'bolt' : 'info') : ''}
    ${D.st === 'deny' ? callout('<b>ممنوع</b> أقوى من «غير مسموح»: تبقى ممنوعة حتى لو أعطيتها دوراً يشملها، إلى أن ترفع المنع أنت.', 'wa', 'block') : ''}
    ${need ? termsUI(D, 'k', fam) : ''}${info}
    ${sens && D.st === 'grant' ? callout('صلاحية حساسة: منحها وتعديلها بالرقم السري.', 'nt', 'lock') : ''}${blk ? callout('أنت غير متصل. الصلاحية الحساسة لا تُمنح بلا اتصال، ولا تُحفظ للإرسال لاحقاً.', 'wa', 'cloud_off') : off && ch ? callout('أنت غير متصل. يُحفظ التغيير ويُرسل عند عودة الاتصال.', 'nt', 'cloud_off') : ''}
    ${btn(lbl, ch ? 'keySave' : 'close', (ch && D.st === 'off' && D.was === 'grant' ? 'dng' : '') + (ch && (!ok || blk) ? '" disabled="' : ''), ch && sens && D.st === 'grant' ? 'lock' : '')}`;
  },
});
surface('roles', {
  t: 'الأدوار', sys: 'S1-03', p: 'owner', req: '03:13,14',
  note: 'الأدوار الثلاثة الجاهزة: اسم كل دور ووصفه وعدد صلاحياته. المالك يعدّل محتوى أي دور (Q-089)، ويطبّقه على بالغ. تعديل الدور لا يغيّر صلاحيات من طُبّق عليه من قبل (REQ-014).',
  r() { return `${callout('الدور مجموعة صلاحيات جاهزة تعطيها لبالغ بنقرة. تعدّل محتواه كما تشاء.', 'nt', 'info')}${['partner', 'guardian', 'observer'].map(t => { const r = S.roles[t], dirty = S.rd && S.rd.t === t && rdDirty(); return `<div class="card"><div class="fx">${ic(ROLE_IC[t])}<div class="grow"><b>${r.n}</b> ${S.tpl === t ? chip('دور سارة', 'in') : ''} ${dirty ? chip('تغييرات غير محفوظة', 'wa') : ''}<div class="sm muted">${r.d}</div></div></div><p class="sm muted" style="margin:8px 0">${r.keys.length} صلاحية${r.keys.some(k => SENS.includes(k)) ? ` · فيها ${r.keys.filter(k => SENS.includes(k)).length} حساسة` : ''}</p><div class="btns">${btn('عدّل المحتوى', 'go:role-edit:' + t, 'sm sec', 'tune')}${btn('طبّق على سارة', 'rolePick:' + t, 'sm')}</div></div>`; }).join('')}${list(row('menu_book', 'دليل الصلاحيات', 'شرح كل صلاحية', { a: 'go:perm-registry' }))}`; },
});
/* مغادرة محرر الدور وفيه تغييرات: تحذير، لا ضياع صامت (R03-08) */
window.leaveGuard = () => { const t = S.stack[S.stack.length - 1]; if (!t || t.id !== 'role-edit' || !S.rd) return false; rdRead(); if (!rdDirty()) { S.rd = null; return false; } confirmDlg('تغييرات غير محفوظة', 'عدّلت هذا الدور ولم تحفظ. إن خرجت ضاع ما عدّلته.', 'اخرج بلا حفظ', () => { S.rd = null; back(); }, 1); S.dlg.no = 'ابقَ'; return true; };
const rdDirty = () => { const r = S.roles[S.rd.t]; return S.rd.n !== r.n || S.rd.d !== r.d || JSON.stringify(S.rd.keys.slice().sort()) !== JSON.stringify(r.keys.slice().sort()); };
const rdRead = () => { if (S.rd && $('#reN')) { S.rd.n = $('#reN').value.trim(); S.rd.d = $('#reD').value.trim(); } };
surface('role-edit', {
  t: t => `دور ${S.roles[t].n}`, sys: 'S1-03', p: 'owner', a: ['guardian'], req: '03:13,14',
  note: 'محرر محتوى دور واحد: اسمه ووصفه وأي الصلاحيات يشملها. الحفظ صريح: تظهر «تغييرات غير محفوظة» حتى يحفظ الأب أو يتجاهل (محرر بحفظ صريح). ما هو للمالك لا يدخل في أي دور. دور بلا صلاحيات مقبول مع تنبيه. التعديل يسري على التطبيق القادم للدور، لا على من طُبّق عليه من قبل.',
  r(t) { if (!S.rd || S.rd.t !== t) { const r = S.roles[t]; S.rd = { t, n: r.n, d: r.d, keys: r.keys.slice() }; } const D = S.rd, dirty = rdDirty();
    return `<label class="fld ${D.err ? 'err' : ''}"><span>اسم الدور</span><input id="reN" value="${D.n}" maxlength="24" autocomplete="off"><small>${D.err ? 'اكتب اسماً للدور.' : ''}</small></label><label class="fld"><span>وصفه في جملة</span><input id="reD" value="${D.d}" maxlength="90" autocomplete="off"></label>
    ${callout(`لا يغيّر صلاحيات من أخذ هذا الدور من قبل${S.tpl === t ? ' (سارة)' : ''}. يسري حين تطبّقه مرة أخرى.`, 'nt', 'info')}${D.keys.length ? '' : callout('الدور الآن بلا أي صلاحية.', 'wa', 'warning')}
    ${PG.map(([id, g, , ks]) => `${sec(`${g} · ${grpSum(ks, D.keys)}`, ks.every(k => D.keys.includes(k)) ? 'أزل الكل' : 'اختر الكل', `reAll:${id}`)}${list(ks.map(k => row('', `${PL[k][0]} ${sensChip(k)}`, PL[k][1], { a: 'reT:' + k, v: ic(D.keys.includes(k) ? 'check_box' : 'check_box_outline_blank'), chev: false })))}`).join('')}
    ${callout('ما هو للمالك (الاشتراك، منح الصلاحيات، الحذف…) لا يدخل في أي دور.', 'nt', 'lock')}`; },
  foot(t) { return S.rd && S.rd.t === t && rdDirty() ? `<div class="bar" style="padding:10px 16px;background:var(--surface);box-shadow:0 -1px 0 var(--border)"><div class="sm" style="margin-bottom:8px">${ic('edit')} تغييرات غير محفوظة · ${S.rd.keys.length} صلاحية</div><div class="btns">${btn('تجاهل', 'reDrop', 'sec')}${btn('احفظ الدور', 'reSave')}</div></div>` : ''; },
});
const REGF = [['all', 'الكل'], ['give', 'تُعطى لبالغ'], ['sens', 'الحساسة'], ['own', 'للمالك'], ['self', 'لكل فرد'], ['agent', 'للمساعد']];
const regKind = k => (PGIVE.includes(k) ? 'give' : window.FOS_PERM.ownerOnly.includes(k) ? 'own' : k.startsWith('agent.') ? 'agent' : 'self');
const norm = s => s.replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase();
const qrow = (q, html) => html.replace(/^<(button|div) /, m => `${m}data-q="${norm(q)}" `);
const srch = (ph, id) => `<label class="fld" style="margin-bottom:10px"><input type="search" data-srch="${id}" placeholder="${ph}" autocomplete="off" aria-label="${ph}"></label>`;
surface('perm-registry', {
  t: 'دليل الصلاحيات', sys: 'S1-03', p: 'adult', req: '03:8,9,13,20',
  note: 'السجل الكامل: كل صلاحية في النظام بعنوان عربي، مع بحث وتصفية. أربعة أنواع: ما يُعطى لبالغ (مع الأدوار التي تشمله وشرحه)، وما هو للمالك، وما يملكه كل فرد بحسب دوره، وما يخص المساعد الآلي. العدّاد يطابق سجل الحوكمة. المعرّف التقني لكل صلاحية يبقى في الحوكمة للمبرمج ولا يُعرض.',
  r() { const f = S.pgF || 'all', all = window.FOS_PERM.all, kk = all.filter(k => f === 'all' || (f === 'sens' ? SENS.includes(k) : regKind(k) === f));
    const dots = k => ['partner', 'guardian', 'observer'].filter(t => S.roles[t].keys.includes(k)).map(rn).join(' · ') || 'تُضاف بعينها فقط';
    const KN = { give: 'تُعطى لبالغ', own: 'للمالك', self: 'لكل فرد بحسب دوره', agent: 'للمساعد الآلي' };
    const rowOf = k => { const kd = regKind(k); return qrow(PL[k][0] + ' ' + (PL[k][1] || ''), row('', `${PL[k][0]} ${sensChip(k)}`, kd === 'give' ? `${PL[k][1]}<br><span class="xs">${dots(k)}</span>` : KN[kd], { a: 'go:perm-key:' + k, chev: false, v: kd === 'give' ? '' : ic('lock') })); };
    const groups = f === 'all' || f === 'give' || f === 'sens' ? PG.map(([, t, , ks]) => { const h = ks.filter(k => kk.includes(k)); return h.length ? `<div data-qg>${sec(t)}<div class="list">${h.map(rowOf).join('')}</div></div>` : ''; }).join('') : '';
    const rest = ['own', 'self', 'agent'].map(kd => { const h = kk.filter(k => regKind(k) === kd); return h.length ? `<div data-qg>${sec(KN[kd])}<div class="list">${h.map(rowOf).join('')}</div></div>` : ''; }).join('');
    return `${srch('ابحث عن صلاحية', 'reg')}<div class="fch">${REGF.map(([k, t]) => `<button aria-pressed="${f === k}" data-a="pgF:${k}">${t}</button>`).join('')}</div><p class="sm muted" style="margin:0 4px 8px">${kk.length} صلاحية${f === 'all' ? ' في النظام كله' : ''}</p><div data-srch-box="reg">${groups}${rest}</div><div data-srch-empty="reg" hidden>${empty('search_off', 'لا صلاحية بهذا الاسم', 'جرّب كلمة أخرى.')}</div>
    ${f === 'all' ? callout('الأطفال والمراهقون لا يُعطَون أي إشراف على غيرهم. للمراهق صلاحية واحدة تُعطى: أن ينشئ مهامه بنفسه.', 'nt', 'child_care') : ''}`; },
});
surface('my-perms', {
  t: 'صلاحياتي', sys: 'S1-03', p: 'delegate', req: '03:2,4,10,15,17',
  note: 'ما يستطيعه البالغ المفوَّض: كل صلاحية بحالها وعلى من وإلى متى ومن أين جاءت. ما ليس عنده أو مُنع عنه يطلبه من المالك بنقرة. صاحب الصلاحية الكاملة يرى أنها عنده وأن المالك يسحبها متى شاء. للمراهق: ما سُمح له به فقط.',
  r() { const has = grantsOf(), req = k => S.preq.find(q => q.k === k && q.st === 'pending');
    if (!isAdult()) return list(row('task_alt', 'أنشئ مهامي بنفسي', S.teenTasks ? `سمح بها والدك · ${unTxt(S.teenUn).replace('تلغيها', 'يلغيها')}` : 'لم يسمح بها والدك بعد', { v: chip(S.teenTasks ? 'مسموح' : 'غير مسموح', S.teenTasks ? 'ok' : 'ol') })) + callout('الإشراف على إخوتك لا يُعطى للمراهق.', 'nt', 'lock');
    const head = `<div class="card fx">${av(me(), 'lg')}<div class="grow"><b style="font-size:calc(20px*var(--ts))">${me().n}</b><div class="chips" style="margin-top:6px">${chip(roleName(), S.co ? 'go' : S.tpl === 'none' ? 'ol' : 'in', S.co ? 'admin_panel_settings' : ROLE_IC[S.tpl])}</div></div></div>`;
    const chg = S.audit.filter(a => a.sn && a.who === 'sara').slice(0, 4), news = chg.length ? `${sec('آخر ما تغيّر', chg.some(a => !a.rd) ? 'تمّ' : '', 'pnSeen')}${list(chg.map(a => row('history', a.sn, `${a.w} · ${a.at}`, { v: a.rd ? '' : chip('جديد', 'in'), chev: false })))}` : '';
    if (S.co) return `${head}${news}<div class="bigic" style="background:var(--gold-soft);color:var(--text)">${ic('admin_panel_settings')}</div><p class="ttl" style="font-size:22px">لديكِ الصلاحية الكاملة</p><p class="sub">أعطاكِ إياها أحمد ${S.co.since}. تفعلين كل ما يفعله: الاشتراك والصلاحيات والقواعد.</p>${sec('ما يبقى لأحمد وحده')}${list(row('admin_panel_settings', 'إعطاء الصلاحية الكاملة وسحبها', 'يسحبها منكِ متى شاء'), row('verified', 'مكانه في العائلة', 'لا يُزال ولا تُسحب منه صلاحية'))}${S.ownDel ? callout(`<b>أحمد يحذف حسابه</b><br>أنتِ تديرين العائلة الآن. إن تراجع خلال ${S.ownDel} يوماً عاد مالكاً كما كان، وإلا صرتِ أنتِ مالكة العائلة.`, 'wa', 'auto_delete') : callout('إن سحبها عدتِ إلى دورك السابق: ' + rn(S.tpl) + '.', 'nt', 'info')}`;
    if (!has.length && !Object.keys(S.g).length) return head + news + empty('lock_person', 'لم تُمنحي صلاحيات بعد', 'أنتِ عضو في العائلة. أحمد وحده يمنح الصلاحيات ويسحبها.', req('role') ? chip('طلبك عند أحمد', 'wa', 'pending') : btn('اطلبي دوراً من أحمد', 'preqSend:role', 'sm'));
    return `${head}${news}${PG.map(([, t, , ks]) => `${sec(`${t} · ${grpSum(ks, has)}`)}${list(ks.map(k => { const g = S.g[k], on = gLive(g), q = req(k); return row(on ? 'check_circle' : g && g.d ? 'block' : 'lock', PL[k][0], on ? `${scTxt(g.sc)} · ${unTxt(g.un).replace('تلغيها', 'يلغيها أحمد')}` : g && g.d ? 'منعها أحمد' : g ? 'انتهت مدتها' : PL[k][1], { ic: on ? 'var(--success)' : '', c: on ? '' : 'dis', a: on ? 'go:perm-key:' + k : '', v: on ? expChip(g) : q ? chip('بانتظار أحمد', 'wa', 'pending') : btn('اطلبي', 'preqSend:' + k, 'sm txt'), chev: false }); }))}`).join('')}
    ${callout('حذف حسابك ومغادرة العائلة حقّان لك دائماً، لا يسحبهما أحد.', 'nt', 'verified')}`; },
});
surface('perm-request', {
  kind: 'sheet', t: 'طلب صلاحية', sys: 'S1-03', p: 'owner', a: ['0'], req: '03:2,10,12',
  note: 'طلب من بالغ مفوَّض أو مراهق أن يُسمح له بما ليس عنده. المالك يفتح ورقة الصلاحية فيختار على من وإلى متى ثم يمنح، أو يؤجل. التأجيل يصل الطالب «ليس الآن».',
  r(i) { const q = S.preq[+i]; if (!q || q.st !== 'pending') return `<h4>لا طلب معلّق</h4>${btn('إغلاق', 'close')}`; const role = q.k === 'role';
    if (q.k === 'teen') return `<div class="c" style="padding:4px 0 8px">${av(M.khaled, 'lg')}</div><h4 class="c">خالد يطلب أن ينشئ مهامه بنفسه</h4><p class="d c">مهام له هو فقط، ينجزها بلا اعتماد منك وبلا نقاط.</p>${btn('اختر المدة واسمح', 'preqOk:' + i)}<div class="gap"></div>${btn('ليس الآن', 'preqNo:' + i, 'sec')}`;
    return `<div class="c" style="padding:4px 0 8px">${av(M.sara, 'lg')}</div><h4 class="c">سارة تطلب ${role ? 'دوراً في العائلة' : 'صلاحية'}</h4>${role ? `<p class="d c">سارة بلا صلاحيات الآن. اختر لها دوراً.</p>${btn('اختر دوراً', 'preqRole:' + i)}` : `<div class="card flat c"><b>${permName(q.k)} ${sensChip(q.k)}</b><div class="sm muted">${PL[q.k][1]}</div>${S.g[q.k] && S.g[q.k].d ? `<div class="sm" style="margin-top:6px">${chip('منعتها أنت من قبل', 'da', 'block')}</div>` : ''}</div>${btn('اختر على من وإلى متى', 'preqOk:' + i)}`}<div class="gap"></div>${btn('ليس الآن', 'preqNo:' + i, 'sec')}`; },
});
surface('teen-grant', {
  kind: 'sheet', t: 'ما تسمح به للمراهق', sys: 'S1-03', p: 'owner', a: ['khaled'], req: '03:11,15',
  note: 'المراهق يُعطى صلاحية واحدة فقط: أن ينشئ مهامه بنفسه، لنفسه وحده (Q-325). لها مدة يختارها الأب كأي منح. لا إشراف على غيره أبداً.',
  r(id) { if (!S.td) S.td = { on: S.teenTasks, un: S.teenTasks ? S.teenUn : null, up: S.teenTasks ? upOf(S.teenUn) : null, sc: 'all' }; const D = S.td, m = M[id];
    return `<h4>${m.n}: ينشئ مهامه بنفسه</h4><p class="d">مهام له هو فقط، ينجزها بلا اعتماد منك وبلا نقاط.</p>${seg([['1', 'مسموح'], ['0', 'غير مسموح']], D.on ? '1' : '0', 'tdOn')}${D.on ? `<h3 class="sec"><span>على من</span></h3>${list(row('person', 'مهامه هو فقط', 'لا تشمل إخوته أبداً'))}${termsUI(D, 't', true, true)}` : callout(S.teenTasks ? 'يتوقف فوراً. مهامه التي أنشأها تبقى.' : 'غير مسموح له الآن.', 'nt', 'info')}${callout('لا يُعطى المراهق إشرافاً على إخوته، ولا شيئاً من الاشتراك.', 'nt', 'lock')}${btn('احفظ', 'tdSave', D.on && D.un == null ? '" disabled="' : '')}`; },
});
const AUA = [['all', 'كل الأفعال'], ['grant', 'منح'], ['edit', 'تعديل'], ['revoke', 'سحب'], ['deny', 'رفض'], ['role', 'دور'], ['other', 'أخرى']];
const AUP = [['all', 'كل الوقت'], ['0', 'اليوم'], ['7', '7 أيام'], ['30', '30 يوماً']];
const auAct = a => a.act || (a.deny ? 'deny' : 'other');
const auList = () => { const f = S.auF || {}; return S.audit.map((a, i) => [a, i]).filter(([a]) => (!f.who || a.who === f.who) && (!f.act || auAct(a) === f.act) && (f.per == null || (a.d || 0) <= +f.per)); };
surface('audit', {
  t: 'سجل الصلاحيات', sys: 'S1-03', p: 'adult', req: '03:7,17,18 10:26 02:28',
  note: 'كل منح وتعديل وسحب ورفض: من فعل، وبمن، وماذا، ومتى. ثلاث تصفيات تعمل معاً: بالفرد، وبالفعل، وبالفترة. كل حدث يُفتح بتفصيله، وفيه «تراجع» حيث يمكن. بصياغة يفهمها الأب، والأحدث أعلى.',
  r() { const f = S.auF || {}, L2 = auList(), who = [...new Set(S.audit.map(a => a.who).filter(Boolean))], fc = (opts, cur, a) => `<div class="fch">${opts.map(([k, t]) => `<button aria-pressed="${(cur ?? 'all') === k}" data-a="${a}:${k}">${t}</button>`).join('')}</div>`;
    return `${can('protection.audit.view') ? `<button class="card fx" data-a="go:prot-audit:all">${ic('shield')}<div class="grow"><b>سجل تغييرات الحماية</b><div class="sm muted">القواعد والأوضاع والتصفية وحدها، بتصفية بالطفل والنوع</div></div>${ic('chevron_right')}</button>` : ''}${fc([['all', 'كل الأفراد'], ...who.map(w => [w, M[w].n])], f.who, 'auWho')}${fc(AUA, f.act, 'auAct')}${fc(AUP, f.per, 'auPer')}${L2.length ? `<div class="list">${L2.map(([a, i]) => row(a.deny ? 'block' : auAct(a) === 'revoke' ? 'key_off' : auAct(a) === 'grant' ? 'key' : auAct(a) === 'edit' ? 'edit' : auAct(a) === 'role' ? 'handshake' : 'receipt_long', a.t, `${a.w} · ${a.at}${a.undone ? ' · تُراجع عنه' : ''}`, { a: 'go:audit-ev:' + i, ic: a.deny ? 'var(--danger)' : '' })).join('')}</div>` : empty('receipt_long', S.audit.length ? 'لا أحداث بهذه التصفية' : 'لا أحداث بعد', S.audit.length ? 'غيّر التصفية أو اعرض الكل.' : 'كل منح أو سحب أو رفض سيُكتب هنا.', S.audit.length ? btn('اعرض الكل', 'auClear', 'sm sec') : '')}`; },
});
surface('audit-ev', {
  kind: 'sheet', t: 'تفصيل حدث', sys: 'S1-03', p: 'adult', a: ['0'], req: '03:18',
  note: 'حدث واحد من السجل: من فعل، وبمن، وأي فعل، وأي صلاحية، ومتى، وعلى من، وإلى متى، والنتيجة. «تراجع» يظهر للمالك على آخر تغيير في الصلاحيات ما دام ممكناً.',
  r(i) { const a = S.audit[+i]; if (!a) return `<h4>الحدث غير موجود</h4>${btn('إغلاق', 'close')}`; const AN = { grant: 'منح', edit: 'تعديل', revoke: 'سحب', deny: 'رفض', role: 'تغيير دور', other: 'حدث' };
    return `<h4>${a.t}</h4>${list(row('person', 'من فعل', '', { v: a.w }), a.who ? row('person_search', 'بمن', '', { v: M[a.who].n }) : '', row('bolt', 'الفعل', '', { v: AN[auAct(a)] }), a.pk ? row('key', 'الصلاحية', '', { v: permName(a.pk) }) : '', row('schedule', 'متى', '', { v: a.at }), a.sc ? row('groups', 'على من', '', { v: scTxt(a.sc) }) : '', a.un != null ? row('event', 'إلى متى', '', { v: unTxt(a.un) }) : '', row('flag', 'النتيجة', '', { v: chip(a.deny ? 'رُفض' : a.undone ? 'تُراجع عنه' : 'تمّ', a.deny ? 'da' : a.undone ? 'ol' : 'ok') }))}${a.undo && !a.undone && isOwner() ? btn('تراجع عن هذا التغيير', 'auUndo:' + i, 'sec', 'undo') + '<div class="gap"></div>' : ''}${a.who === 'sara' && isOwner() ? btn('صلاحيات سارة', 'auGo', 'txt') : ''}${btn('إغلاق', 'close', 'sec')}`; },
});
surface('denial', {
  t: 'محاولة مرفوضة', sys: 'S1-03', p: 'owner', a: ['a3'], req: '03:7,18',
  note: 'تفصيل تنبيه رفض: من حاول، وماذا، ومتى، ولماذا رُفض. يصل المالك عند رفض صلاحية حساسة أو محاولة تجاوز يرفضها الخادم، لا عند كل نقرة على قفل ظاهر. «تمّ» يخفيه من كل الأجهزة.',
  r(id) { const a = S.alerts.find(x => x.id === id); if (!a) return empty('task_alt', 'هذا التنبيه أُغلق', 'تجده في سجل الصلاحيات.', btn('افتح السجل', 'go:audit', 'sm sec'));
    return `<div class="bigic" style="background:var(--warning-soft);color:var(--warning)">${ic('lock_person')}</div><p class="ttl" style="font-size:22px">${a.t}</p><p class="sub">${a.s}</p>
    ${list(row('person', 'من', '', { v: a.who || 'سارة' }), row('schedule', 'متى', '', { v: a.ago }), row('help', 'لماذا رُفض', '', { v: a.why || 'ليست عندها هذه الصلاحية' }), row('block', 'النتيجة', '', { v: chip('رُفض', 'da') }))}
    ${callout('لم يتغير شيء. الرفض يحمي الإعداد، والتنبيه لتعرف فقط.', 'nt', 'verified')}${list(row('key', 'صلاحيات سارة', '', { a: 'go:member:sara' }), row('receipt_long', 'سجل الصلاحيات', '', { a: 'go:audit' }))}${a.open ? btn('تمّ', 'denialAck:' + id) : ''}`; },
});
surface('transfer', {
  t: 'الصلاحية الكاملة', sys: 'S1-03', p: 'owner', req: '03:16,20',
  note: 'حكم المالك (Q-401): لا «نقل ملكية» بانتظار وقبول. المالك يعطي بالغاً الصلاحية الكاملة فتسري فوراً ويصله إشعار، ويبقى المالك مالكاً بكامل صلاحيته، ويسحبها متى شاء من هذه الشاشة. الإعطاء بالرقم السري ويحتاج اتصالاً؛ السحب بتأكيد واحد. لبالغ فقط. صاحب الصلاحية الكاملة لا يعطيها لغيره ولا يزيل المالك.',
  r() { const off = offline(), adults = Object.values(M).filter(m => m.role === 'adult' && !m.owner && !S.removed[m.id]);
    if (!isRoot()) return empty('admin_panel_settings', 'هذه لأحمد وحده', 'إعطاء الصلاحية الكاملة وسحبها بيد مالك العائلة.', btn('رجوع', 'back', 'sm sec'));
    if (S.co) return `<div class="bigic" style="background:var(--gold-soft);color:var(--text)">${ic('admin_panel_settings')}</div><p class="ttl" style="font-size:22px">لسارة الصلاحية الكاملة</p><p class="sub">منذ ${S.co.since}. تفعل كل ما تفعله أنت، وأنت المالك كما كنت.</p>${list(row('person', 'عند', '', { v: 'سارة' }), row('event', 'منذ', '', { v: S.co.since }), row('undo', 'إن سحبتها', '', { v: `تعود ${rn(S.tpl)}` }))}${sec('يبقى لك وحدك')}${list(row('admin_panel_settings', 'إعطاء الصلاحية الكاملة وسحبها', ''), row('verified', 'مكانك في العائلة', 'لا يزيلك أحد ولا تُسحب منك صلاحية'))}${off ? callout('أنت غير متصل. السحب يحتاج اتصالاً.', 'wa', 'cloud_off') : ''}${btn('اسحب الصلاحية الكاملة', 'coTake', 'dng' + (off ? '" disabled="' : ''))}`;
    if (!adults.length) return empty('group_off', 'لا بالغ آخر في العائلة', 'الصلاحية الكاملة تُعطى لبالغ فقط. ادعُ بالغاً أولاً.', btn('ادعُ بالغاً', 'go:add-member', 'sm'));
    return `${callout('<b>الصلاحية الكاملة تجعل سارة مثلك:</b><br>تدير الاشتراك، وتمنح الصلاحيات وتسحبها، وتغيّر كل القواعد.<br>تسري فوراً ويصلها إشعار. وأنت تبقى المالك، وتسحبها متى شئت.', 'wa', 'admin_panel_settings')}${sec('لمن')}${list(adults.map(m => row('', m.n, `بالغ · الآن: ${rn(S.tpl)}`, { lead: av(m), v: ic('radio_button_checked'), chev: false })))}<p class="sm muted" style="margin:8px 4px">المراهقون والأطفال لا تُعطى لهم.</p>
    ${sec('يبقى لك وحدك')}${list(row('admin_panel_settings', 'إعطاء الصلاحية الكاملة وسحبها', 'سارة لا تعطيها لغيرها'), row('verified', 'مكانك في العائلة', 'لا يزيلك أحد ولا تُسحب منك صلاحية'))}
    ${off ? callout('أنت غير متصل. الإعطاء يحتاج اتصالاً.', 'wa', 'cloud_off') : ''}${btn('أعطِ سارة الصلاحية الكاملة بالرقم السري', 'coGive', off ? '" disabled="' : '', 'lock')}`; },
});
surface('owner-now', {
  kind: 'full', t: 'صرتِ مالكة العائلة', sys: 'S1-03', p: 'delegate', req: '03:16,20',
  note: 'تظهر لصاحبة الصلاحية الكاملة مرة واحدة حين تكتمل مهلة حذف حساب المالك (30 يوماً) ولم يتراجع: تصير هي المالكة (Q-402). من هنا تطبيقها هو تطبيق المالك نفسه بكل شاشاته. لا تنتقل الملكية بأي طريق آخر.',
  r() { return `<div class="body" style="justify-content:center;text-align:center"><div class="bigic" style="background:var(--gold-soft);color:var(--text)">${ic('verified')}</div><p class="ttl">صرتِ مالكة العائلة</p><p class="sub">اكتمل حذف حساب أحمد اليوم. كل ما كان له وحده صار لكِ.</p>${list(row('admin_panel_settings', 'تعطين الصلاحية الكاملة وتسحبينها', 'لبالغ آخر في العائلة'), row('verified', 'لا يزيلكِ أحد من العائلة', 'ولا تُسحب منكِ صلاحية'), row('credit_card', 'الاشتراك باسمكِ', 'راجعي طريقة الدفع')).replace('class="list"', 'class="list" style="text-align:start"')}<div class="gap"></div>${btn('تمّ', 'ownerNowOk', '')}</div>`; },
});
surface('family-delete', {
  t: 'حذف العائلة', sys: 'S1-03', p: 'owner', req: '03:20 02:28',
  note: 'أخطر فعل في التطبيق: ما يُحذف وما يبقى خلال المهلة ← كتابة اسم العائلة ← الرقم السري ← حالة «تُحذف بعد 30 يوماً» مع «ألغِ الحذف» (Q-344). يحتاج اتصالاً، ولا يُصَفّ للإرسال لاحقاً.',
  r() { const off = offline();
    if (S.famDel) return `<div class="bigic" style="background:var(--danger-soft);color:var(--danger)">${ic('auto_delete')}</div><p class="ttl" style="font-size:22px">العائلة تُحذف بعد ${S.famDel} يوماً</p><p class="sub">${S.famDelBy && S.famDelBy !== me().n ? `طلبت ${S.famDelBy} الحذف. ` : ''}أُبلغ كل البالغين. كل شيء يعمل كما هو حتى ذلك اليوم. بعده يُمحى كل شيء نهائياً.</p>${btn('ألغِ الحذف', 'famDelCancel')}`;
    return `<div class="bigic" style="background:var(--danger-soft);color:var(--danger)">${ic('delete_forever')}</div><p class="ttl" style="font-size:22px">حذف ${famN()}</p>
    ${sec('بعد 30 يوماً يُمحى نهائياً')}${list(row('groups', 'كل الأفراد وملفات الأطفال', ''), row('forum', 'المحادثات والمهام والنقاط', ''), row('mobile_off', 'إقران أجهزة الأطفال', 'تتوقف الحماية عليها'), row('credit_card', 'الاشتراك', 'يتوقف بلا استرداد لما مضى'))}
    ${sec('خلال الثلاثين يوماً')}${callout('كل شيء يعمل كما هو، وتستطيع إلغاء الحذف في أي لحظة.', 'ok', 'undo')}
    <label class="fld ${S.fdErr ? 'err' : ''}"><span>اكتب اسم العائلة للتأكيد</span><input id="fdN" placeholder="${famN()}" autocomplete="off"><small>${S.fdErr ? 'الاسم غير مطابق. اكتب: ' + famN() : 'اكتب: ' + famN()}</small></label>
    ${off ? callout('أنت غير متصل. حذف العائلة يحتاج اتصالاً.', 'wa', 'cloud_off') : ''}${btn('احذف العائلة بالرقم السري', 'famDelGo', 'dng' + (off ? '" disabled="' : ''), 'lock')}`; },
});
surface('member-remove', {
  t: id => `إزالة ${M[id].n}`, sys: 'S1-03', p: 'owner', a: ['sara'], req: '03:20 02:28',
  note: 'إزالة فرد بالرقم السري. الشاشة تقول ما يتوقف فوراً وما يُمحى بعد 30 يوماً، ثم تعرض حالة «أُزيل» مع «أعِده إلى العائلة» خلال المهلة. المالك لا يُزال أبداً.',
  r(id) { const m = M[id], kid = m.role !== 'adult', d = S.removed[id];
    if (m.owner) return empty('verified', 'المالك لا يُزال', 'مكان المالك في العائلة ثابت. لا يزيله أحد.', btn('رجوع', 'back', 'sm sec'));
    if (d) return `<div class="bigic" style="background:var(--danger-soft);color:var(--danger)">${ic('person_off')}</div><p class="ttl" style="font-size:22px">${vb(m, 'أُزيل', 'أُزيلت')} ${m.n}</p><p class="sub">توقف ${vb(m, 'دخوله', 'دخولها')} الآن. تُمحى ${vb(m, 'بياناته', 'بياناتها')} نهائياً بعد ${d} يوماً.</p>${btn(`${vb(m, 'أعِده', 'أعِدها')} إلى العائلة`, 'memRestore:' + id)}`;
    return `<div class="c" style="padding:6px 0">${av(m, 'xl')}</div><p class="ttl" style="font-size:22px">إزالة ${m.n} من العائلة</p>
    ${sec('يتوقف فوراً')}${list(row('logout', `${vb(m, 'دخوله', 'دخولها')} إلى العائلة`, kid ? 'جهازه يُفك إقرانه وتتوقف الحماية عليه' : 'تخرج من كل أجهزتها'), kid ? '' : row('key_off', 'كل صلاحياتها', S.co ? 'ومنها الصلاحية الكاملة' : ''), S.rec === id ? row('support_agent', 'كونها من يساعدك على العودة', 'ستحتاج أن تختار غيرها') : '')}
    ${sec('بعد 30 يوماً يُمحى نهائياً')}${list(row('badge', `ملف ${m.n}`, ''), row('forum', `${vb(m, 'رسائله', 'رسائلها')}`, 'تبقى عند الآخرين بلا اسم'))}
    ${callout(`خلال الثلاثين يوماً تستطيع ${vb(m, 'إعادته كما كان', 'إعادتها كما كانت')}.`, 'ok', 'undo')}${offline() ? callout('أنت غير متصل. الإزالة تحتاج اتصالاً.', 'wa', 'cloud_off') : ''}${btn(`أزل ${m.n} بالرقم السري`, 'memRemove:' + id, 'dng' + (offline() ? '" disabled="' : ''), 'lock')}`; },
});
surface('turn13', {
  t: 'بلوغ 13 سنة', sys: 'S1-03', p: 'owner', a: [''], req: '03:1,3,15 02:13',
  note: 'حالتان. قبل الموعد: ماذا سيتغير ومتى (1 يناير من سنة بلوغ 13 — Q-235). وفي يومه: الدور تغيّر وحده، والأب يراجع ما يُسمح به للمراهق واحداً واحداً ثم يؤكد. ما يملكه كل مراهق بطبيعة دوره معروض للعلم. لا يُعطى إشرافاً. وعند 18 يصير بالغاً ويسقط ما سُمح له به مراهقاً.',
  r(st) { const now = st === 'now' || S.rev13 === 1;
    return `<div class="c" style="padding:10px 0 4px">${av(M.layan, 'xl')}</div><p class="ttl" style="font-size:22px">${now ? 'ليان صارت مراهقة' : 'ليان تكبر'}</p><p class="sub">${now ? 'تغيّرت واجهتها اليوم وحدها. راجع ما تسمح لها به.' : 'في 1 يناير 2030 تنتقل وحدها إلى واجهة المراهقين. لا تحتاج أن تفعل شيئاً الآن.'}</p>
    ${sec(now ? 'ما تغيّر وحده' : 'ما سيتغير وحده')}${list(row('dashboard', 'الواجهة', 'واجهة المراهقين: الرئيسية، المحادثات، تعلّم، أنا'), row('chat_error', 'تنبيهات المحادثة', 'يبقى الفحص الآلي يعمل، وتستطيع إيقافه'), row('stars', 'النقاط', 'نظام المراهقين يبدأ من صفر'))}
    ${sec('ما يبقى كما هو')}${list(row('hourglass_top', 'قواعد الوقت والتطبيقات', now ? (reviews().some(r => r.k === 'teen') ? 'ما زالت سارية · راجعها إن أردت' : 'ما زالت سارية') : 'تبقى سارية كما هي', can('protection.rule.view') ? { a: now && reviews().some(r => r.k === 'teen') ? 'go:rules-review' : 'go:apps:layan' } : {}), row('location_on', 'الموقع والاستغاثة', ''))}
    ${sec('ما يملكه كل مراهق')}<p class="sm muted" style="margin:-4px 4px 8px">رؤية مهامه وتسليمها، محادثاته، نقاطه وصرفها، طلب وقت إضافي، الاعتراض على خصم، الاستغاثة.</p>
    ${now ? sec('راجع وقرّر') + list(row('task_alt', 'تنشئ مهامها بنفسها', S.teenTasks13 ? 'مسموح · حتى تلغيها' : 'غير مسموح', { tg: S.teenTasks13 || false, ta: 'teenT:13' })) + callout('لا يُعطى المراهق إشرافاً على إخوته، ولا شيئاً من الاشتراك. وعند 18 تصير بالغة ويسقط ما سمحت به هنا.', 'nt', 'lock') + btn('أكّد الكل', 'rev13Done') : callout('عندما يحين الموعد يصلك تنبيه لتراجع ما تسمح لها به.', 'nt', 'notifications')}`; },
});
Object.assign(ACT, {
  mvSet(v) { S.mv = v; },
  rolePick(k) { S.rt = { sc: sameAll(g => g.sc) ?? null, un: sameAll(g => g.un) ?? null }; S.rt.up = upOf(S.rt.un); S.sheet = { id: 'tpl-diff', a: [k] }; },
  tplApply(k) { S.sheet = null; if (S.conflict) { S.conflict = false; return confirmDlg('تغيّرت الصلاحيات قبل لحظات', 'عُدّلت صلاحيات سارة من جهاز آخر للتو. لم يُحفظ تغييرك حتى لا يُكتب فوق الأحدث. حدّث ثم أعد المحاولة.', 'حدّث الآن', () => { toast('حُدّثت الصلاحيات · أعد اختيار الدور'); render(); }); }
    gate('تغيير دور سارة', () => { const was = JSON.stringify([S.tpl, S.g]), den = {}; Object.keys(S.g).forEach(x => { if (S.g[x].d) den[x] = S.g[x]; }); S.tpl = k; S.g = { ...roleCopy(S.roles[k].keys, S.rt.sc, S.rt.un), ...den }; paud(`صار دور سارة «${rn(k)}»`, 'role', { k: 'roles.template.apply', sc: S.rt.sc, un: S.rt.un, undo: was, sn: `صار دوركِ «${rn(k)}»` }); S.sheet = { id: 'tpl-diff', a: [k, 'done'] }; }, 'stepup'); },
  revokeAll() { S.sheet = null; confirmDlg('سحب كل صلاحيات سارة؟', 'تتوقف صلاحياتها الآن على كل أجهزتها، وتبقى عضواً في العائلة. لا تخرج من حسابها. ما منعته يُرفع أيضاً.', 'اسحب الصلاحيات', () => { const was = JSON.stringify([S.tpl, S.g]); S.tpl = 'none'; S.g = {}; paud('سُحبت كل صلاحيات سارة', 'revoke', { undo: was, sn: 'سحب أحمد كل صلاحياتكِ' }); toast('سُحبت الصلاحيات · وصل سارة إشعار', () => { undoTo(was, 'سحب كل صلاحيات سارة'); render(); }); render(); }, true); },
  termsAll() { S.rt = { sc: sameAll(g => g.sc) ?? null, un: sameAll(g => g.un) ?? null }; S.rt.up = upOf(S.rt.un); S.sheet = { id: 'grant-terms', a: [] }; },
  tSc(w, v) { const D = draftOf(w); dRead(); if (v === 'all') D.sc = 'all'; else { const c = Array.isArray(D.sc) ? D.sc.slice() : []; D.sc = c.includes(v) ? c.filter(x => x !== v) : [...c, v]; } },
  tUn(w, v) { const D = draftOf(w); D.up = v; D.bad = 0; D.un = v === '' ? '' : v === 'x' ? null : addDays(+v); },
  gtDone(k) { dRead(); if (k) { S.sheet = { id: 'tpl-diff', a: [k] }; return; } if (!termsOk(S.rt)) return; S.sheet = null;
    const go = () => { const was = JSON.stringify([S.tpl, S.g]); Object.values(S.g).forEach(g => { if (g.d) return; if (g.sc !== 'fam') g.sc = Array.isArray(S.rt.sc) ? S.rt.sc.slice() : S.rt.sc; g.un = S.rt.un; g.ed = 1; }); paud(`عُدّلت حدود كل صلاحيات سارة: ${scTxt(S.rt.sc)} · ${unTxt(S.rt.un)}`, 'edit', { sc: S.rt.sc, un: S.rt.un, undo: was, sn: `عدّل أحمد حدود صلاحياتكِ: ${scTxt(S.rt.sc)} · ${unTxt(S.rt.un).replace('تلغيها', 'يلغيها')}` }); toast('حُفظت للكل · وصل سارة إشعار', () => { undoTo(was, 'تعديل حدود كل الصلاحيات'); render(); }); };
    PGIVE.some(x => SENS.includes(x) && gLive(S.g[x])) ? gate('تعديل حدود صلاحيات فيها حساسة', go, 'stepup') : go(); },
  pgF(k) { S.pgF = k; },
  auWho(k) { S.auF = { ...(S.auF || {}), who: k === 'all' ? undefined : k }; if (S.stack[S.stack.length - 1].id !== 'audit') go('audit'); },
  auAct(k) { S.auF = { ...(S.auF || {}), act: k === 'all' ? undefined : k }; }, auPer(k) { S.auF = { ...(S.auF || {}), per: k === 'all' ? undefined : k }; }, auClear() { S.auF = {}; },
  auUndo(i) { const a = S.audit[+i]; S.sheet = null; undoTo(a.undo, a.t); toast('تُراجع عن التغيير · وصل سارة إشعار'); },
  auGo() { S.sheet = null; go('member', 'sara'); },
  keyOpen(k, st) { kdInit(k, st); S.sheet = { id: 'perm-key', a: [k] }; },
  kSt(v) { dRead(); const D = S.kd; D.st = v; if (v !== 'off' && D.sc == null && FAMK.includes(D.k)) D.sc = 'fam'; },
  keySave(how) {
    dRead(); const D = S.kd, k = D.k, g = S.g[k], sens = SENS.includes(k), fam = FAMK.includes(k);
    if (how === 'theirs') { S.conflict = false; S.g[k] = { d: 0, sc: fam ? 'fam' : ['layan'], un: addDays(30), src: g ? g.src : 'own', ed: 1, at: 'الآن' }; S.sheet = null; S.kd = null; return toast('أُخذت القيمة الأحدث'); }
    if (how === 'mine') { S.conflict = false; D.cf = 0; }
    if (D.st !== 'off' && !termsOk(D, fam)) return;
    if (S.conflict) { D.cf = 1; return; }
    const apply = () => { const was = JSON.stringify([S.tpl, S.g]), act = D.st === 'off' ? 'revoke' : D.was === D.st ? 'edit' : D.st === 'deny' ? 'deny-set' : 'grant';
      if (D.st === 'off') delete S.g[k]; else S.g[k] = { d: D.st === 'deny' ? 1 : 0, sc: fam ? 'fam' : D.sc, un: D.un, src: g && g.src === 'role' && D.st === 'grant' && !g.d ? 'role' : 'own', ed: 1, at: 'الآن' };
      const t = { revoke: D.was === 'deny' ? `رُفع المنع عن سارة: ${PL[k][0]}` : `سُحبت من سارة: ${PL[k][0]}`, edit: `عُدّلت لسارة: ${PL[k][0]}`, 'deny-set': `مُنعت سارة من: ${PL[k][0]}`, grant: `مُنحت سارة: ${PL[k][0]}` }[act];
      paud(t, act === 'deny-set' ? 'edit' : act, { pk: k, sc: D.st === 'off' ? undefined : (fam ? 'fam' : D.sc), un: D.st === 'off' ? undefined : D.un, undo: was, sn: { revoke: D.was === 'deny' ? `رفع أحمد المنع عن: ${PL[k][0]}` : `سحب أحمد منكِ: ${PL[k][0]}`, edit: `عدّل أحمد حدود: ${PL[k][0]}`, 'deny-set': `منع أحمد عنكِ: ${PL[k][0]}`, grant: `أعطاكِ أحمد: ${PL[k][0]}` }[act] });
      if (D.rq != null && S.preq[D.rq]) S.preq[D.rq].st = 'ok'; S.sheet = null; S.kd = null;
      toast(offline() ? 'حُفظ · يُرسل عند عودة الاتصال' : { revoke: 'سُحبت · وصل سارة إشعار', edit: 'حُفظ التعديل · وصل سارة إشعار', 'deny-set': 'مُنعت · وصل سارة إشعار', grant: 'مُنحت · وصل سارة إشعار' }[act], () => { undoTo(was, t); render(); }, offline() ? 'cloud_off' : 'check_circle'); if (offline()) queue(t, 'S1-03'); };
    if (D.st === 'grant' && sens) { if (offline()) return toast('صلاحية حساسة · منحها يحتاج اتصالاً', null, 'cloud_off'); S.sheet = null; return gate(`صلاحية حساسة: ${PL[k][0]}`, apply, 'stepup'); }
    apply();
  },
  reT(k) { rdRead(); const D = S.rd; D.keys = D.keys.includes(k) ? D.keys.filter(x => x !== k) : [...D.keys, k]; },
  reAll(id) { rdRead(); const ks = grpOf(id)[3], D = S.rd, all = ks.every(k => D.keys.includes(k)); D.keys = all ? D.keys.filter(k => !ks.includes(k)) : [...new Set([...D.keys, ...ks])]; },
  reDrop() { S.rd = null; toast('تُجوهلت التغييرات'); },
  reSave() { rdRead(); const D = S.rd; if (!D.n) { D.err = 1; return; } S.roles[D.t] = { n: D.n, d: D.d, keys: PGIVE.filter(k => D.keys.includes(k)) }; S.rd = null; paud(`عُدّل دور «${D.n}»: ${D.keys.length} صلاحية`, 'role', { k: 'roles.template.apply', who: undefined }); S.audit[0].who = undefined; toast('حُفظ الدور · يسري عند تطبيقه'); },
  preqSend(k) { S.sheet = null; const dad = isAdult() ? 'أحمد' : 'والدك'; if (S.preq.find(q => q.k === k && q.st === 'pending')) return toast(`طلبك عند ${dad}`); S.preq.push({ k, st: 'pending', at: 'الآن' }); toast(`أُرسل طلبك إلى ${dad}`, null, 'send'); },
  preqOk(i) { const q = S.preq[+i]; if (q.k === 'teen') { S.td = { on: true, un: null, up: null, sc: 'all', rq: +i }; S.sheet = { id: 'teen-grant', a: ['khaled'] }; return; } kdInit(q.k, 'grant'); S.kd.rq = +i; if (S.kd.was === 'grant') { S.kd.un = null; S.kd.up = null; } S.sheet = { id: 'perm-key', a: [q.k] }; },
  preqNo(i) { const q = S.preq[+i]; q.st = 'no'; S.sheet = null; toast(`وصل ${q.k === 'teen' ? 'خالد' : 'سارة'}: «ليس الآن»`); },
  preqRole(i) { S.preq[+i].st = 'ok'; S.sheet = { id: 'role-pick', a: [] }; },
  denialAck(id) { const a = S.alerts.find(x => x.id === id); if (a) a.open = 0; back(); toast('أُغلق التنبيه على كل الأجهزة'); },
  coGive() { gate('إعطاء سارة الصلاحية الكاملة', () => { S.co = { since: 'اليوم', seen: 0 }; paud('أُعطيت سارة الصلاحية الكاملة', 'grant', { k: 'roles.ownership.transfer', sn: 'أعطاكِ أحمد الصلاحية الكاملة', co: 1 }); toast('لسارة الصلاحية الكاملة الآن · وصلها إشعار', null, 'admin_panel_settings'); }, 'stepup'); },
  coTake() { confirmDlg('سحب الصلاحية الكاملة من سارة؟', `تتوقف فوراً على كل أجهزتها، وتعود إلى دورها السابق: ${rn(S.tpl)}. يصلها إشعار.`, 'اسحبها', () => { S.co = null; paud('سُحبت الصلاحية الكاملة من سارة', 'revoke', { k: 'roles.ownership.transfer', sn: `سحب أحمد الصلاحية الكاملة · عدتِ ${rn(S.tpl)}` }); toast(`سُحبت · عادت سارة ${rn(S.tpl)}`); render(); }, true); },
  coSeen() { if (S.co) S.co.seen = 1; },
  ownerNowOk() { S.full = null; },
  pnSeen() { S.audit.forEach(a => { if (a.sn && a.who === me().id) a.rd = 1; }); },
  famDelGo() { const v = ($('#fdN') || {}).value || ''; if (v.trim() !== famN()) { S.fdErr = 1; return; } S.fdErr = 0; gate('حذف ' + famN(), () => { S.famDel = 30; S.famDelBy = me().n; audit('طُلب حذف العائلة · مهلة 30 يوماً', 'identity.member.remove'); }, 'stepup'); },
  famDelCancel() { S.famDel = 0; audit('أُلغي حذف العائلة', 'identity.member.remove'); toast('أُلغي الحذف · العائلة كما كانت'); },
  memRemove(id) { const m = M[id]; gate(`إزالة ${m.n} من العائلة`, () => { S.removed[id] = 30; if (id === 'sara') S.co = null; if (S.rec === id) S.rec = ''; paud(`${vb(m, 'أُزيل', 'أُزيلت')} ${m.n} من العائلة · مهلة 30 يوماً`, 'other', { k: 'identity.member.remove', who: id }); }, 'stepup'); },
  memRestore(id) { const m = M[id]; delete S.removed[id]; paud(`${vb(m, 'أُعيد', 'أُعيدت')} ${m.n} إلى العائلة`, 'other', { k: 'identity.member.remove', who: id }); toast(`${vb(m, 'عاد', 'عادت')} ${m.n} كما ${vb(m, 'كان', 'كانت')}`); },
  teenOpen(id) { S.td = { on: S.teenTasks, un: S.teenTasks ? S.teenUn : null, up: S.teenTasks ? upOf(S.teenUn) : null, sc: 'all' }; S.sheet = { id: 'teen-grant', a: [id] }; },
  tdOn(v) { dRead(); S.td.on = v === '1'; },
  tdSave() { dRead(); const D = S.td; if (D.on && D.un == null) return; const was = S.teenTasks; S.teenTasks = D.on; S.teenUn = D.on ? D.un : ''; if (D.rq != null && S.preq[D.rq]) S.preq[D.rq].st = 'ok'; S.sheet = null; S.td = null; paud(D.on ? (was ? 'عُدّلت مدة السماح لخالد بإنشاء مهامه' : 'سُمح لخالد بإنشاء مهامه بنفسه') : 'أُوقف السماح لخالد بإنشاء مهامه بنفسه', D.on ? (was ? 'edit' : 'grant') : 'revoke', { who: 'khaled', pk: 'tasks.create', un: D.on ? D.un : undefined, sn: D.on ? (was ? `غيّر والدك مدة السماح بإنشاء مهامك: ${unTxt(D.un).replace('تلغيها', 'يلغيها')}` : 'سمح لك والدك بإنشاء مهامك بنفسك') : 'أوقف والدك السماح بإنشاء مهامك بنفسك' }); toast(D.on ? 'خالد ينشئ مهامه بنفسه · وصله إشعار' : 'أُوقف · وصل خالد إشعار'); },
  teenT(w) { if (w === '13') S.teenTasks13 = !S.teenTasks13; },
  rev13Done() { S.rev13 = 2; paud('راجع أحمد ما يُسمح به لليان بعد بلوغها 13', 'edit', { who: 'layan' }); back(); toast('تمت المراجعة'); },
});
/* قراءة حقل التاريخ قبل أي إعادة رسم، والبحث الحي بلا إعادة رسم */
function dRead() { const el = $('#unD'); if (!el) return; const D = draftOf(el.dataset.w); if (!D || D.up !== 'x') return; if (el.value && el.value > TODAY) { D.un = el.value; D.bad = 0; } else { D.un = null; D.bad = el.value ? 1 : 0; } }
document.addEventListener('change', e => { if (e.target.id === 'unD') { dRead(); render(); } });
document.addEventListener('input', e => { const el = e.target.closest && e.target.closest('[data-srch]'); if (!el) return; const id = el.dataset.srch, q = norm(el.value.trim()), box = document.querySelector(`[data-srch-box="${id}"]`); if (!box) return; let n = 0;
  box.querySelectorAll('[data-q]').forEach(r => { const ok = !q || r.dataset.q.includes(q); r.hidden = !ok; if (ok) n++; });
  box.querySelectorAll('[data-qg]').forEach(g => { g.hidden = !g.querySelector('[data-q]:not([hidden])'); });
  const em = document.querySelector(`[data-srch-empty="${id}"]`); if (em) em.hidden = n > 0; });

/* ============ التحكم ============ */
surface('control', {
  t: 'التحكم', sys: 'S1-09', p: 'adult', req: '09:2,5,6,7,8,9,15 10:24 01:11,19',
  note: 'عرض مزدوج: «سريع» أولاً بالأوضاع الجاهزة ثم الخدمات، و«متقدّم» عند الطلب بإعدادات كل طفل: القيمة السارية ومصدرها. إعطاء دور لبالغ إجراء منفصل لا بطاقة سريعة. كل شيء هنا يتولّد من سجل واحد للخدمات؛ والخدمة التي تُزال من التطبيق تختفي بطاقتها وإعداداتها فوراً. هنا يبقى ما لم يُفوَّض مقفلاً مع سببه وطلبه. التوفر صادق لكل جهاز (جرّب Android / iOS من الاستوديو).',
  r() {
    const v = S.ctl || 'quick', ios = S.os === 'ios';
    const own = isOwner(), vis = SVC.filter(x => svcOn(x.id));
    return seg([['quick', 'سريع'], ['adv', 'متقدّم']], v, 'set:ctl') + (v === 'quick' ? `
      ${ios ? callout('على iOS لا يتوفر التحكم العميق بالتطبيقات. نعرض ما يعمل فعلاً فقط، ونسمّي ما لا يعمل.', 'wa', 'ios') : ''}
      ${svcOn('prot') ? sec('الأوضاع', 'كل الأوضاع', can('protection.mode_preset.apply') ? 'go:presets:study' : 'denied:protection.mode_preset.apply') + modeTiles() : ''}
      ${own ? sec('الخدمات', 'إدارة', 'go:registry') : sec('الخدمات')}${vis.map(x => `<button class="card fx ${can(x.k) ? '' : 'dis'}" data-a="${can(x.k) ? x.go : 'denied:' + x.k}"><span class="qi lg ${can(x.k) ? toneOf(x.i) : ''}">${ic(x.i)}</span><div class="grow"><b>${x.n}</b><div class="sm muted">${x.d}</div>${!can(x.k) ? `<div style="margin-top:4px">${avail('not_delegated')}</div>` : svcIos(x) ? `<div style="margin-top:4px">${avail('unavailable_on_device')} ${why('ios')}</div>` : ''}</div>${ic('chevron_right')}</button>`).join('')}
      ${own ? list(row('handshake', 'أعطِ بالغاً دوراً جاهزاً', 'شريك · وصي محدود · مراقب', { a: 'go:roles' })) : ''}
      ${sec('خدمات قادمة')}<div class="card flat"><div class="chips">${['التعليم', 'القرآن والصلاة', 'الصحة', 'المالية العائلية'].map(x => chip(x, 'ol', 'hourglass_empty')).join('')}</div><div class="xs muted" style="margin-top:8px">أمثلة فقط؛ الأسماء لم تُحسم بعد. كل خدمة جديدة تظهر هنا من نفسها عند إضافتها.</div></div>` :
      `<div class="fch">${KIDS.map(id => `<button aria-pressed="${(S.ctlKid || 'layan') === id}" data-a="set:ctlKid:${id}">${av(M[id], 'sm')}${pname(M[id])}</button>`).join('')}</div>${advTree(S.ctlKid || 'layan')}
      ${own ? list(row('key', 'صلاحيات البالغين', 'ما سُمح به لكل بالغ، مفتاحاً مفتاحاً', { a: 'go:member:sara' }), row('receipt_long', 'سجل التغييرات', 'من غيّر ماذا ومتى', { a: 'go:audit' })) : ''}`);
  },
});
/* صف الإعداد الموحّد: الاسم + القيمة + شريحة المصدر + القفل + «لماذا؟» (settings-patterns.md) */
function srow(t, v, src, a, key, o = {}) {
  const ok = can(key), ios = o.ios && S.os === 'ios';
  return `<button class="row noic ${ok && !ios ? '' : 'dis'} ${o.hl ? 'hl' : ''}" data-a="${ios ? 'why:ios' : ok ? a : 'denied:' + key}"><span class="tx"><b>${t}</b><span>${ios ? avail('unavailable_on_device') : !ok ? avail('not_delegated') : chip(src, 'ol', src === 'قالب العمر' ? 'category' : src === 'الأب' ? 'person' : 'tune')}${o.own && !isOwner() ? '' : ''}</span></span><span class="val">${v}</span><span class="chev">${ic(ok && !ios ? 'chevron_right' : 'lock')}</span></button>`;
}
/* الموقع والاستغاثة (S1-07): في screens-location.js */

/* المهام والتقويم (S1-06): في screens-tasks.js */

/* ============ المكافآت (إدارة) ============ */
