/* أسطح وضع الأهل: مركز الأوامر، العائلة والصلاحيات، التحكم (الحماية/الموقع/المهام/المكافآت). */
'use strict';
M.sara.f = M.layan.f = 1;
const vb = (m, a, b) => (m.f ? b : a);
const kidsVisible = () => KIDS;   // المرحلة 1: النطاق «كل الأطفال» (scope) — تخصيص النطاق يُعرض في ورقة المنح
const appOf = (kid, id) => S.apps[kid].find(a => a.id === id);
const ENF = { active: ['الحماية تعمل', 'verified_user', 'ok'], degraded: ['الحماية تعمل جزئياً', 'gpp_maybe', 'wa'], off: ['الحماية متوقفة', 'shield', 'da'] };

/* ============ قائمة «يتطلب انتباهك» — تجمع من الأنظمة ولا تملك بياناتها (S1-09 REQ-002) ============ */
function attention() {
  const A = [];
  if (S.sos && S.sos.st === 'sent' && S.sos.from !== me().id) A.push({ p: 0, c: 'var(--danger)', i: 'sos', t: `استغاثة من ${M[S.sos.from].n}`, s: `${S.sos.via} · ${S.sos.place}`, b: [['عرض الموقع والحالة', 'go:sos-status', 'dng']] });
  if (can('rewards.time_request.decide')) S.reqs.filter(r => r.st === 'PENDING').forEach(r => { const k = M[r.kid]; A.push({ p: 1, c: 'var(--accent)', i: 'more_time', t: `${k.n} ${vb(k, 'يطلب', 'تطلب')} ${r.min} دقيقة إضافية`, s: `${appOf(r.kid, r.app).n} · نفد حدّه اليوم`, b: [[`منح ${r.min} د`, `reqGrant:${r.id}:${r.min}`, 'ok'], ['خيارات أخرى', `go:time-decide:${r.id}`, 'sec']] }); });
  if (can('protection.tamper.view')) S.alerts.filter(a => a.k === 'tamper' && a.open).forEach(a => A.push({ p: 1, c: 'var(--warning)', i: 'gpp_maybe', t: a.t, s: a.s, b: [['عرض التفاصيل', `go:tamper:${a.id}`, 'ton']] }));
  if (can('tasks.approve')) S.tasks.filter(t => t.st === 'SUBMITTED').forEach(t => { const k = M[t.kid]; A.push({ p: 2, c: 'var(--info)', i: 'task_alt', t: `${k.n} ${vb(k, 'سلّم', 'سلّمت')} «${t.t}»`, s: t.ai === 'unsure' ? 'تعذّر على المساعد التحقق من الصورة · القرار لك' : 'بانتظار اعتمادك', b: [['اعتماد', `taskOk:${t.id}`, 'ok'], ['مراجعة', `go:task-review:${t.id}`, 'sec']] }); });
  if (can('chat.minor.view')) S.alerts.filter(a => a.k === 'chat' && a.open).forEach(a => A.push({ p: 2, c: 'var(--info)', i: 'chat_error', t: a.t, s: a.s, b: [['عرض المحادثة', 'go:thread:dm-khaled-layan', 'ton'], ['تجاهل', `alertClose:${a.id}`, 'sec']] }));
  if (isOwner()) S.alerts.filter(a => a.k === 'perm' && a.open).forEach(a => A.push({ p: 3, c: 'var(--border-strong)', i: 'lock_person', t: a.t, s: a.s, b: [['عرض التدقيق', 'go:audit', 'ton'], ['تمّ', `alertClose:${a.id}`, 'sec']] }));
  return A.sort((x, y) => x.p - y.p);
}
const attCard = a => `<div class="att" style="--pc:${a.c}"><div class="hd"><span class="lead" style="color:${a.c}">${ic(a.i)}</span><span class="tx"><b>${a.t}</b><span>${a.s}</span></span><span class="pr" title="الأولوية">P${a.p}</span></div><div class="ft">${a.b.map(([t, act, c]) => btn(t, act, 'sm ' + c)).join('')}</div></div>`;

function kidOrb(id) {
  const m = M[id], k = S.kid[id], pct = left(id) / (k.quota + k.extra), st = S.sos && S.sos.from === id && S.sos.st === 'sent' ? ['sos', '#B42318'] : k.enf !== 'active' ? ['priority_high', '#9A5B00'] : left(id) === 0 ? ['hourglass_empty', '#CF5B2C'] : ['check', '#1F6B3B'];
  const r = 26, c = 2 * Math.PI * r;
  return `<button class="orb" data-a="go:member:${id}" aria-label="${m.n}"><span class="rw"><svg class="rg" width="58" height="58"><circle cx="29" cy="29" r="${r}" stroke="#ffffff26"/><circle cx="29" cy="29" r="${r}" stroke="${pct < .2 ? '#F6A77F' : '#8FD3A5'}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}"/></svg>${av(m)}<span class="bd" style="background:${st[1]}">${ic(st[0])}</span></span><b>${pname(m)}</b><small>${S.freeMode ? 'وضع حر' : `بقي ${left(id)} د`}</small></button>`;
}
function miniMap(h = 150, big) {
  if (S.lbw && !S.mapLoaded) return `<div class="card flat c"><div class="muted sm" style="margin-bottom:8px">${ic('map')} لم تُحمَّل الخريطة لتوفير البيانات</div>${btn('تحميل الخريطة (≈ 180 ك.ب)', 'set:mapLoaded:true', 'sm sec', 'download')}</div>`;
  const old = offline() || S.stale, dk = S.theme === 'dark';
  const road = dk ? '#22324d' : '#fff', blk = dk ? '#15233b' : '#DDE3D3', wat = dk ? '#0d2a45' : '#BFD8EA', grn = dk ? '#12301f' : '#C9DDBE';
  const pins = KIDS.map(id => { const k = S.kid[id]; return `<button class="pin ${old ? 'old' : ''}" style="left:${k.x}%;top:${k.y}%" data-a="go:member:${id}">${big ? `<label>${pname(M[id])}</label>` : ''}${av(M[id])}</button>`; }).join('');
  return `<div class="map" style="height:${h}px"><svg class="m" viewBox="0 0 400 ${h * 400 / 358}" preserveAspectRatio="xMidYMid slice"><rect width="400" height="400" fill="${blk}"/><path d="M-10 250 Q120 210 210 260 T420 230 V420 H-10Z" fill="${wat}" opacity=".7"/><rect x="250" y="20" width="120" height="70" rx="10" fill="${grn}"/><rect x="30" y="120" width="90" height="60" rx="10" fill="${grn}"/><g stroke="${road}" stroke-linecap="round" fill="none"><path d="M-10 100 H420" stroke-width="14"/><path d="M140 -10 V200 Q140 230 180 232" stroke-width="12"/><path d="M-10 190 H420" stroke-width="9"/><path d="M240 -10 V240" stroke-width="9"/><path d="M320 100 V230" stroke-width="7"/><path d="M60 100 V190" stroke-width="7"/><path d="M-10 40 H250" stroke-width="6"/></g></svg>${pins}<span class="attr">خريطة توضيحية · المصدر الفعلي OpenStreetMap</span></div>`;
}

/* ============ الرئيسية: مركز الأوامر ============ */
surface('home', {
  t: 'الرئيسية', sys: 'S1-09', p: 'adult', bar: false, flush: true, hero: true,
  req: '09:1,2,3,4,6,7,10,11,16,17 01:4,7,8 07:15 08:16 05:14 10:20,24',
  note: 'مركز الأوامر: ترويسة «نبض العائلة» ← شريط الحالة ← قائمة الانتباه (P0–P4) ← أوضاع جاهزة ← بطاقات. كل عنصر يظهر فقط لمن يملك مفتاحه. غيّر الشخصية إلى «سارة» وبدّل قالبها لترى اللوحة تتقلص.',
  r() {
    const A = attention(), d = dateAr(), m = me();
    const tasksToday = S.tasks.filter(t => t.st !== 'CANCELLED'), done = tasksToday.filter(t => t.st === 'APPROVED').length;
    const ck = Object.values(S.checklist), ckDone = ck.filter(Boolean).length;
    const un = S.plan === 'premium';
    const P = [['study', 'وقت الدراسة', 'school'], ['sleep', 'وقت النوم', 'bedtime'], ['free', 'وضع حر', 'lock_open']];
    return `<div class="hero"><div class="top"><button data-a="tab:more" aria-label="حسابي" style="margin-inline-start:8px">${av(m)}</button><div class="hi"><small>${d.s}</small><b>${L('مساء الخير، ' + m.n, 'Good evening, ' + m.en)}</b></div>
      <button class="ib" data-a="flip:privacy" aria-label="وضع الخصوصية" aria-pressed="${S.privacy}">${ic(S.privacy ? 'visibility_off' : 'visibility')}</button>
      ${can('hub.alerts.view') ? `<button class="ib" data-a="go:alerts" aria-label="التنبيهات">${ic('notifications')}${S.alerts.filter(a => a.open).length ? `<span class="dot">${S.alerts.filter(a => a.open).length}</span>` : ''}</button>` : ''}${sosBtn()}</div>
      ${can('hub.dashboard.view') ? `<div class="pulse">${kidsVisible().map(kidOrb).join('')}<button class="orb" data-a="go:add-member"><span class="rw"><span class="av" style="--c:#ffffff1f">${ic('add')}</span></span><b>إضافة</b><small>فرد جديد</small></button></div>
      <button class="strip ${A.length ? 'at' : ''}" data-a="${A.length ? 'go:alerts' : 'go:enf-all'}">${ic(A.length ? 'pending_actions' : 'verified_user')}<span>${A.length ? `${A.length} ${A.length === 1 ? 'أمر يحتاج' : 'أمور تحتاج'} انتباهك` : 'كل شيء على ما يرام · لا شيء يحتاج قرارك'}</span>${age(2)}</button>` : ''}
    </div><div style="padding:14px 16px 24px">
    ${!can('hub.dashboard.view') ? empty('lock_person', 'لا توجد صلاحيات بعد', 'انضممتِ إلى العائلة بدور بالغ بلا أي منح. اطلبي من الأب تفويضك لتظهر هنا لوحة العائلة.', btn('عرض صلاحياتي', 'go:my-perms', 'sm ton')) : `
    ${A.length ? sec('يتطلب انتباهك', 'الكل', 'go:alerts') + A.slice(0, 3).map(attCard).join('') : ''}
    ${ckDone < ck.length && isOwner() ? `<button class="card" data-a="go:checklist"><div class="fx sb"><b>أكمل إعداد عائلتك</b>${chip(`${ckDone} من ${ck.length}`, 'in')}</div><div style="margin:8px 0 6px">${pbar(ckDone / ck.length * 100, 'ok')}</div><span class="sm muted">بقي: إضافة جهات الطوارئ</span></button>` : ''}
    ${sec('أوضاع جاهزة')}<div class="qa" style="grid-template-columns:repeat(3,1fr)">${P.map(([k, t, i]) => { const on = k === 'free' ? S.freeMode > 0 : S.preset === k, ok = k === 'free' ? isOwner() : can('protection.mode_preset.apply'); return `<button aria-pressed="${on}" data-a="${ok ? 'preset:' + k : 'denied:' + (k === 'free' ? 'protection.free_mode.activate' : 'protection.mode_preset.apply')}" class="${ok ? '' : 'dis'}"><span class="qi">${ic(ok ? i : 'lock')}</span>${t}${on ? '<span class="xs" style="color:var(--success);font-weight:700">مفعّل</span>' : ''}</button>`; }).join('')}</div>
    <div class="qa" style="grid-template-columns:repeat(3,1fr);margin-top:8px">${[['add_task', 'مهمة جديدة', 'go:task-new', 'tasks.create'], ['more_time', 'منح وقت', 'go:grant-time', 'rewards.grant.create'], ['stars', 'منح نقاط', 'go:grant-points', 'rewards.grant.create']].map(([i, t, a, k]) => `<button data-a="${can(k) ? a : 'denied:' + k}" class="${can(k) ? '' : 'dis'}"><span class="qi">${ic(can(k) ? i : 'lock')}</span>${t}</button>`).join('')}</div>
    ${can('agent.summary.read') || isOwner() ? aiCard() : ''}
    ${can('location.view') ? sec('أين العائلة الآن', 'الخريطة', 'go:map') + miniMap(140) + `<div class="chips" style="margin:8px 0 2px">${KIDS.map(id => chip(`${pname(M[id])}: ${S.privacy ? '••••' : S.kid[id].place}`, '', 'location_on')).join('')}${age(2)}</div>` : ''}
    ${sec('وقت الشاشة اليوم', 'القواعد', 'tab:control')}<div class="card">${KIDS.map(id => { const k = S.kid[id], pc = k.used / (k.quota + k.extra) * 100; return `<button class="fx" style="width:100%;padding:6px 0" data-a="go:member:${id}">${av(M[id], 'sm')}<span class="grow"><span class="fx sb sm"><b>${pname(M[id])}</b><span class="muted">${k.used} من ${k.quota + k.extra} د</span></span><span style="display:block;margin-top:5px">${pbar(pc, pc > 85 ? 'wa' : 'ok')}</span></span></button>`; }).join('')}</div>
    <div class="g2">${can('tasks.view') ? `<button class="card stat" data-a="go:tasks">${ic('task_alt')}<b>${done}/${tasksToday.length}</b><span>مهام اليوم المنجزة</span></button>` : ''}
    ${can('rewards.wallet.view') ? `<button class="card stat" data-a="go:rewards-admin">${ic('stars')}<b>${S.kid.layan.pts + S.kid.yusuf.pts}</b><span>نقاط الأطفال · سلسلة ليان ${S.kid.layan.streak} أيام</span></button>` : ''}
    <button class="card stat" data-a="tab:chat">${ic('forum')}<b>3</b><span>رسائل جديدة · بلا عرض للمحتوى هنا</span></button>
    ${can('hub.plan.view') ? `<button class="card stat" data-a="go:plan">${ic('workspace_premium')}<b>${{ free: 'المجانية', basic: 'الأساسية', premium: 'المميزة' }[S.plan]}</b><span>SMS: ${S.sms.used} من ${{ free: 20, basic: 50, premium: 100 }[S.plan]} هذا الشهر</span></button>` : ''}</div>`}
    </div>`;
  },
});
function aiCard() {
  const g = S.agent.find(x => x.id === 'g3');
  if (S.aiKill) return `<div class="callout nt" style="margin-top:14px">${ic('power_settings_new')}<div>المساعد الذكي متوقف بمفتاح الإيقاف. <button class="why" data-a="go:ai">إدارته</button></div></div>`;
  if (!g || g.st !== 'بانتظارك') return '';
  return `<div class="ai" style="margin-top:14px"><div class="lb">${ic('wand_stars')}اقتراح من المساعد · لا يُنفَّذ دون موافقتك</div><p>لاحظتُ أن خالد يستخدم هاتفه بعد 10:30 م في ليالي المدرسة ثلاث مرات هذا الأسبوع. أقترح تقديم نافذة النوم 30 دقيقة.</p><div class="btns">${btn('طبّق الاقتراح', isOwner() ? 'aiApply' : 'denied:agent.rule.change', 'sm')}${btn('ليس الآن', 'aiDismiss', 'sm sec')}<button class="why" data-a="why:ai">لماذا هذا؟</button></div></div>`;
}
Object.assign(ACT, {
  preset(k) {
    if (k === 'free') { if (S.freeMode) return ACT.freeOff(); return go('freemode'); }
    const was = S.preset; S.preset = was === k ? '' : k;
    if (queue(`تطبيق وضع «${k === 'study' ? 'الدراسة' : 'النوم'}»`, 'S1-10')) return toast('محفوظ في الصندوق الصادر · يُطبَّق عند عودة الاتصال', null, 'cloud_upload');
    audit(S.preset ? `طُبّق وضع «${k === 'study' ? 'الدراسة' : 'النوم'}» على كل الأطفال` : 'أُلغي الوضع الجاهز', 'protection.mode_preset.apply');
    toast(S.preset ? (k === 'study' ? 'وقت الدراسة: تطبيقات الدراسة فقط' : 'وقت النوم بدأ الآن على أجهزة الأطفال') : 'أُلغي الوضع · عادت القواعد المعتادة', () => { S.preset = was; render(); });
  },
  aiApply() { gate('تغيير قاعدة باقتراح المساعد يتطلب تأكيدك', () => { const g = S.agent.find(x => x.id === 'g3'); g.st = 'نُفّذ بموافقتك'; g.undo = 1; audit('قُدّمت نافذة نوم خالد 30 د (اقتراح المساعد)', 'agent.rule.change'); toast('عُدّلت نافذة النوم · يمكنك التراجع من سجل المساعد', () => { g.st = 'بانتظارك'; g.undo = 0; render(); }); }, 'stepup'); },
  aiDismiss() { S.agent.find(x => x.id === 'g3').st = 'رُفض'; toast('لن يُنفَّذ الاقتراح'); },
  alertClose(id) { const a = S.alerts.find(x => x.id === id); a.open = 0; toast('أُغلق التنبيه', () => { a.open = 1; render(); }); },
  reqGrant(id, min) {
    const r = S.reqs.find(x => x.id === id), k = S.kid[r.kid], a = appOf(r.kid, r.app); min = +min;
    r.st = 'GRANTED'; r.got = min; a.lim += min; k.extra += min; S.sheet = null;
    const off = queue(`منح ${min} د لـ${M[r.kid].n}`, 'S1-05');
    audit(`مُنحت ${M[r.kid].n} ${min} دقيقة إضافية لتطبيق ${a.n}`, 'rewards.time_request.decide');
    toast(off ? 'محفوظ · يصل جهاز الطفل عند عودة الاتصال' : `مُنحت ${min} دقيقة · ينتهي أثرها بنهاية اليوم`, () => { r.st = 'PENDING'; a.lim -= min; k.extra -= min; render(); }, off ? 'cloud_upload' : 'check_circle');
  },
  reqDeny(id, withTask) {
    const r = S.reqs.find(x => x.id === id); r.st = 'DENIED'; S.sheet = null;
    if (withTask) { S.tasks.unshift({ id: 't' + Date.now(), kid: r.kid, t: 'قراءة 15 دقيقة', cat: 'school', pts: 15, due: 'اليوم', proof: 'self', st: 'PENDING', swap: 1 }); r.task = 1; toast(`رُفض الطلب وأُسندت مهمة بديلة إلى ${M[r.kid].n}`); } else toast('رُفض الطلب · أُبلغ الطفل بلطف');
    audit(`رُفض طلب وقت إضافي من ${M[r.kid].n}${withTask ? ' مع إسناد مهمة' : ''}`, 'rewards.time_request.decide');
  },
  taskOk(id) {
    const t = S.tasks.find(x => x.id === id), k = S.kid[t.kid]; t.st = 'APPROVED'; k.pts += t.pts; S.sheet = null;
    const bonus = t.kid === 'layan' && k.streak === 6; if (t.kid !== 'khaled') k.streak += 1; if (bonus) k.pts += 50; t.cele = 1;
    queue(`اعتماد «${t.t}»`, 'S1-06');
    toast(`اعتُمدت المهمة${t.pts ? ` · أُودعت ${t.pts} نقاط في محفظة ${M[t.kid].n}` : ''}`, () => { t.st = 'SUBMITTED'; k.pts -= t.pts; if (t.kid !== 'khaled') k.streak -= 1; render(); });
  },
  taskReject(id) { const t = S.tasks.find(x => x.id === id); const n = ($('#rejNote') || {}).value || 'أعيدي المحاولة بصورة أوضح'; t.st = 'PENDING'; t.note = n; S.sheet = null; toast('أُعيدت المهمة مع ملاحظتك'); },
});

surface('alerts', {
  t: 'التنبيهات', sys: 'S1-09', p: 'adult', req: '09:3,17 07:16 03:7 10:21 08:12 05:14',
  note: 'كل الأنظمة تنشر تنبيهاتها هنا عبر السجل المركزي. مرتبة بالأولوية P0–P4، والقرار بنقرة واحدة حيث يمكن.',
  r() { const A = attention(), old = S.alerts.filter(a => !a.open); return (A.length ? sec('تحتاج قرارك') + A.map(attCard).join('') : empty('task_alt', 'لا شيء يحتاج قرارك', 'عندما يطلب أحد الأطفال وقتاً أو يسلّم مهمة سيظهر هنا.')) + (old.length ? sec('سابقة') + list(old.map(a => row(a.k === 'perm' ? 'lock_person' : 'notifications', a.t, a.ago + ' · ' + a.s))) : ''); },
});
surface('time-decide', {
  kind: 'sheet', t: 'قرار طلب الوقت', sys: 'S1-05', p: 'adult', a: ['r0'], req: '05:11,12,13,14 10:12 09:17',
  note: 'ورقة القرار: منح مباشر بلا نقاط، أو رفض، أو رفض مع إسناد مهمة بديلة. الوقت الممنوح يضاف إلى حد التطبيق فقط ولا يفتح نافذة نوم أو مدرسة.',
  r(id) {
    const r = S.reqs.find(x => x.id === id); if (!r) return `<h4>لا يوجد طلب معلّق</h4><p class="d">شغّل رحلة «نفد الوقت» من الاستوديو، أو انتقل إلى ليان واطلب وقتاً من شاشة الحظر.</p>`;
    const k = M[r.kid], a = appOf(r.kid, r.app);
    return `<div class="fx" style="margin-bottom:10px">${av(k)}<div><h4>${k.n} ${vb(k, 'يطلب', 'تطلب')} وقتاً إضافياً</h4><span class="sm muted">${a.n} · استُخدم ${a.used} من ${a.lim} د اليوم</span></div></div>
    ${r.msg ? `<div class="card flat sm">«${r.msg}»</div>` : ''}
    <p class="d">الوقت الممنوح يضاف إلى هذا التطبيق فقط، وينتهي بنهاية اليوم، ولا يفتحه أثناء النوم أو المدرسة. ${why('extra')}</p>
    <div class="btns" style="margin-bottom:8px">${[10, 15, 30].map(n => btn(`${n} د`, `reqGrant:${id}:${n}`, n === r.min ? '' : 'ton')).join('')}</div>
    ${btn('ارفض وأسند مهمة بدلاً منه', `reqDeny:${id}:1`, 'sec', 'add_task')}<div class="gap"></div>${btn('ارفض فقط', `reqDeny:${id}`, 'txt')}`;
  },
});
surface('task-review', {
  kind: 'sheet', t: 'مراجعة تسليم مهمة', sys: 'S1-06', p: 'adult', a: ['t1'], req: '06:7,8,9 05:5 09:17',
  note: 'المساعد يتحقق أولاً؛ إن لم يجزم بقيت المهمة معلّقة لاعتماد الأب. لا تودَع نقطة قبل التحقق. الرفض يعيدها مع ملاحظة.',
  r(id) {
    const t = S.tasks.find(x => x.id === id), k = M[t.kid];
    return `<h4>«${t.t}»</h4><p class="d">${k.n} · ${CAT[t.cat][0]} · ${t.pts} نقاط عند الاعتماد</p>
    <div class="msg" style="max-width:none;align-self:stretch;margin-bottom:10px"><div class="ph" style="width:100%;height:150px">${S.lbw ? ic('image') + 'الصورة لم تُحمَّل (نطاق منخفض)' : ic('photo_camera') + 'صورة الإثبات من ' + k.n}</div></div>
    <div class="ai"><div class="lb">${ic('wand_stars')}تحقّق المساعد</div><p style="margin:0">لم أستطع الجزم من الصورة: السرير مرتّب، لكن جزءاً من الأرضية خارج الإطار. تركتُ القرار لك.</p></div>
    ${t.sub ? list(t.sub.map(s => row('check_circle', s, '', { ic: 'var(--success)' }))) : ''}
    <label class="fld"><span>ملاحظة عند الإعادة (اختياري)</span><input id="rejNote" placeholder="مثال: صوّري الأرضية أيضاً"></label>
    <div class="btns">${btn('أعِد للطفل', `taskReject:${id}`, 'sec')}${btn('اعتمد وأودع النقاط', `taskOk:${id}`, 'ok')}</div>`;
  },
});
surface('checklist', {
  t: 'قائمة الإعداد الأولي', sys: 'S1-01', p: 'owner', req: '09:1 07:10', st: 'pr',
  note: 'قائمة الإعداد الأولي مصطلح معتمد في المسرد؛ بنودها هنا مقترحة ومشتقة من متطلبات الأنظمة.',
  r() { const I = [['family', 'أنشئ العائلة', 'الاسم والمنطقة والمنطقة الزمنية', ''], ['child', 'أضف ملف طفل', 'اسم مستعار وصورة رمزية ولون وسنة ميلاد', 'go:add-member'], ['pair', 'اقرن جهاز الطفل', 'برمز إقران صالح 15 دقيقة', 'go:pair-code:layan'], ['rules', 'راجع قواعد الوقت', 'حصة يومية وجدول نوم ومدرسة', 'tab:control'], ['adult', 'ادعُ بالغاً آخر', 'برمز دعوة لمرة واحدة', 'go:invite'], ['emergency', 'أضف جهات الطوارئ', 'تصلهم رسالة SOS مع الموقع', 'go:emergency']];
    return callout('كل بند يفتح شاشته مباشرة، ويمكنك التوقف والعودة لاحقاً.') + list(I.map(([k, t, s, a]) => row(S.checklist[k] ? 'check_circle-fill' : 'radio_button_unchecked', t, s, { a: S.checklist[k] ? '' : a, ic: S.checklist[k] ? 'var(--success)' : 'var(--muted)', v: S.checklist[k] ? 'تمّ' : '' }))); },
});

/* ============ العائلة ============ */
surface('family', {
  t: 'العائلة', sys: 'S1-03', p: 'adult', req: '03:1,2 02:8,11 01:1',
  note: 'تبويب «العائلة» يتمحور حول الفرد لا الخدمة: كل ما يخص فرداً في ملف واحد. تعداد الأدوار ثلاثي: adult / teen / child، والمالك صفة لا دور.',
  act: () => `<button class="ib" data-a="go:add-member" aria-label="إضافة فرد">${ic('person_add')}</button>`,
  r() {
    const cap = { free: 5, basic: 10, premium: '∞' }[S.plan];
    const mrow = m => row('', pname(m), m.rel, { lead: av(m), a: `go:member:${m.id}`, v: m.owner ? chip('المالك', 'go', 'verified') : m.role === 'adult' ? chip({ partner: 'شريك', guardian: 'وصي محدود', observer: 'مراقب', none: 'بلا منح' }[S.tpl], S.tpl === 'none' ? 'ol' : 'in') : KIDS.includes(m.id) ? chip(ENF[S.kid[m.id].enf][0].replace('الحماية ', ''), ENF[S.kid[m.id].enf][2], ENF[S.kid[m.id].enf][1]) : '' });
    return `<div class="card flat fx sb"><div><b>عائلة المنصور</b><div class="sm muted">اليمن · توقيت صنعاء (UTC+3)</div></div>${chip(`${Object.keys(M).length} من ${cap} أفراد`, 'ol', 'groups')}</div>
    ${sec('البالغون')}${list(mrow(M.ahmad), mrow(M.sara))}${sec('المراهقون والأطفال')}${list(KIDS.map(k => mrow(M[k])))}
    ${list(row('person_add', 'أضف فرداً', 'ادعُ بالغاً أو أنشئ ملف طفل', { a: can('identity.family.invite') ? 'go:add-member' : 'denied:identity.family.invite' }), row('key', isOwner() ? 'سجل الصلاحيات' : 'صلاحياتي', isOwner() ? '95 مفتاحاً ذرياً · 3 قوالب' : 'ما مُنح لكِ ومن منحه ومتى ينتهي', { a: isOwner() ? 'go:perm-registry' : 'go:my-perms' }), isOwner() || can('roles.audit.view') ? row('receipt_long', 'سجل التدقيق', 'كل منح وتعديل وإلغاء ورفض', { a: 'go:audit' }) : '')}`;
  },
});
surface('member', {
  t: id => pname(M[id]), sys: 'S1-09', p: 'adult', a: ['layan'], req: '09:6,8,10,11 07:2,3,11,12 10:25,27 05:2 02:13 03:3',
  note: '«ملف الفرد»: عرض متقدّم لكل فرد يجمع حالته الآن وقواعده ومهامه ومحفظته. كل صف يحمل قيمته ومصدرها وقفله و«لماذا؟».',
  r(id) {
    const m = M[id]; if (m.role === 'adult') return memberAdult(m);
    const k = S.kid[id], e = ENF[k.enf], pc = left(id) / (k.quota + k.extra), apps = S.apps[id], lim = apps.filter(a => a.act === 'LIMIT' && a.used >= a.lim);
    const R = (i, t, s, key, a, v) => can(key) ? row(i, t, s, { a, v }) : row(i, t, s, { a: 'denied:' + key, v: avail('not_delegated'), c: 'dis', chev: false });
    return `<div class="card fx">${av(m, 'lg')}<div class="grow"><b style="font-size:calc(20px*var(--ts))">${pname(m)}</b><div class="sm muted">${m.rel} · ${m.role === 'teen' ? 'قالب المراهق' : m.mini ? 'القالب المبسّط' : 'القالب القياسي'}</div><div class="chips" style="margin-top:6px">${chip(e[0], e[2], e[1])}${chip(k.bat + '%', k.bat < 20 ? 'da' : '', k.bat < 20 ? 'battery_alert' : 'battery_5_bar')}</div></div></div>
    <div class="card fx">${ring(pc, 76, 8, pc < .2 ? 'var(--accent)' : 'var(--success)', `<b style="font-size:20px;line-height:1">${left(id)}</b>`)}<div class="grow"><b>${S.freeMode ? 'وضع حر مفعّل' : `بقي ${left(id)} دقيقة اليوم`}</b><div class="sm muted">استُخدم ${k.used} من ${k.quota + k.extra} د${k.extra ? ` · منها ${k.extra} د ممنوحة` : ''}</div>${lim.length ? `<div class="sm" style="color:var(--accent-text);margin-top:2px">${lim.map(a => a.n).join('، ')}: نفد الحد</div>` : ''}</div>${can('rewards.grant.create') ? btn('منح وقت', `go:grant-time:${id}`, 'sm ton') : ''}</div>
    ${can('location.view') ? `<button class="card fx" data-a="go:map">${ic('location_on')}<div class="grow"><b>${S.privacy ? 'الموقع مخفي (وضع الخصوصية)' : k.place}</b><div class="sm muted">${offline() || S.stale ? 'آخر موقع معروف' : 'الموقع الآن'}</div></div>${age(k.ago)}</button>` : `<div class="card fx dis">${ic('location_off')}<div class="grow"><b>الموقع</b></div>${avail('not_delegated')}</div>`}
    ${sec('القواعد')}${list(
      R('apps', 'التطبيقات', `${apps.filter(a => a.act === 'LIMIT').length} بحدّ · ${apps.filter(a => a.act === 'BLOCK').length} محظور · ${apps.filter(a => a.study).length} للدراسة`, 'protection.rule.view', `go:apps:${id}`),
      R('hourglass_top', 'الحصة اليومية', 'لكل يوم من أيام الأسبوع', 'protection.rule.view', `go:quota:${id}`, `${k.quota} د`),
      R('calendar_month', 'الجدول الأسبوعي', 'نافذتا النوم والمدرسة', 'protection.rule.view', `go:schedule:${id}`),
      R('travel_explore', 'تصفية الويب', '30 فئة · بحث آمن', 'protection.filter.view', `go:webfilter:${id}`),
      R('verified_user', 'حالة الفرض على الجهاز', e[0], 'protection.state.view', `go:enf-state:${id}`))}
    ${sec('المهام والمكافآت')}${list(
      R('task_alt', 'المهام', `${S.tasks.filter(t => t.kid === id && t.st === 'PENDING').length} قيد التنفيذ`, 'tasks.view', `go:tasks:${id}`),
      R('stars', 'المحفظة', m.role === 'teen' ? 'نقاط المراهق الافتراضية صفر' : `سلسلة ${k.streak} أيام`, 'rewards.wallet.view', `go:wallet-admin:${id}`, `${k.pts} نقطة`),
      R('forum', 'محادثاته', 'مرئية للأب دائماً', 'chat.minor.view', 'go:minor-chats:' + id))}
    ${sec('الملف والجهاز')}${list(
      row('badge', 'بيانات الملف', `اسم مستعار · سنة الميلاد ${m.by} · لا تاريخ ميلاد كامل`, { a: can('identity.child.profile.edit') ? `go:child-profile:${id}` : 'denied:identity.child.profile.edit' }),
      id === 'layan' ? row('cake', 'تبلغ ليان 13 سنة في 2030', 'يتحول الدور تلقائياً إلى مراهق وتُراجَع القواعد معك', { a: 'go:turn13' }) : '',
      row('mobile', 'الجهاز المقترن', 'Android 13 · مقترن بهذه العائلة فقط', { a: 'go:device:' + id }))}`;
  },
});
function memberAdult(m) {
  if (m.owner) return `<div class="card fx">${av(m, 'lg')}<div class="grow"><b style="font-size:calc(20px*var(--ts))">${m.n}</b><div class="sm muted">${m.rel}</div><div class="chips" style="margin-top:6px">${chip('المالك', 'go', 'verified')}</div></div></div>${callout('الفوترة والملكية وحذف العائلة للمالك حصراً، ولا تُفوَّض لأحد.', 'nt', 'lock')}${isOwner() ? list(row('swap_horiz', 'انقل الملكية', 'إلى بالغ آخر فقط · يتطلب تأكيداً', { a: 'go:transfer' })) : ''}`;
  const P = window.FOS_PERM, n = S.tpl === 'none' ? 0 : P[S.tpl].length, names = { partner: 'شريك', guardian: 'وصي محدود', observer: 'مراقب' };
  return `<div class="card fx">${av(m, 'lg')}<div class="grow"><b style="font-size:calc(20px*var(--ts))">${m.n}</b><div class="sm muted">${m.rel}</div><div class="chips" style="margin-top:6px">${S.tpl === 'none' ? chip('بالغ بلا منح', 'ol') : chip(`قالب ${names[S.tpl]} · ${n} مفتاحاً`, 'in', 'key')}</div></div></div>
  ${S.tpl === 'none' ? callout('البالغ الجديد يبدأ بدور adult بلا أي منح. لا يرى شيئاً حتى تفوّضه.', 'nt', 'info') : `<div class="card"><div class="fx sb"><span class="sm muted">النطاق</span><b class="sm">كل الأطفال</b></div><div class="fx sb" style="margin-top:6px"><span class="sm muted">صالح حتى</span><b class="sm">15 فبراير 2027</b></div><div class="fx sb" style="margin-top:6px"><span class="sm muted">منحه</span><b class="sm">أحمد · أمس 8:02 م</b></div></div>`}
  ${isOwner() ? `${sec('ابدأ من قالب')}${Object.entries(names).map(([k, t]) => `<button class="card fx" data-a="go:tpl-diff:${k}" ${S.tpl === k ? 'style="border-color:var(--success)"' : ''}>${ic({ partner: 'handshake', guardian: 'shield_person', observer: 'visibility' }[k])}<div class="grow"><b>${t}</b><div class="sm muted">${P[k].length} مفتاحاً${k === 'observer' ? ' · للعرض فقط' : k === 'partner' ? ' · إدارة يومية كاملة عدا الحصري' : ' · متابعة واعتماد مهام'}</div></div>${S.tpl === k ? chip('مطبّق', 'ok', 'check') : ic('chevron_right')}</button>`).join('')}
  ${list(row('grid_view', 'مصفوفة التفويض', 'عدّل كل مفتاح على حدة', { a: 'go:matrix' }), S.tpl !== 'none' ? row('person_off', 'ألغِ كل المنح', 'يسري فوراً على كل أجهزتها', { a: 'revokeAll', ic: 'var(--danger)' }) : '')}` : ''}`;
}
const DOM = { shell: 'الغلاف', identity: 'الهوية', roles: 'الأدوار', billing: 'الفوترة', rewards: 'المكافآت', tasks: 'المهام', calendar: 'التقويم', location: 'الموقع', chat: 'المحادثة', hub: 'مركز الأوامر', protection: 'الحماية', agent: 'المساعد الذكي' };
const byDom = keys => keys.reduce((g, k) => { const d = k.split('.')[0]; (g[d] = g[d] || []).push(k); return g; }, {});
surface('tpl-diff', {
  kind: 'sheet', t: 'معاينة تطبيق القالب', sys: 'S1-03', p: 'owner', a: ['guardian'], req: '03:10,12,13,14,19',
  note: 'معاينة الفرق قبل التطبيق (settings-patterns: diff preview + تراجع دفعي). مفاتيح القوالب حرفية من S1-03 §5-3-أ. تطبيق القالب ينسخ مفاتيحه إلى منح العضو، ويتطلب PIN الأب.',
  r(k) {
    const P = window.FOS_PERM, cur = S.tpl === 'none' ? [] : P[S.tpl], nxt = P[k], add = nxt.filter(x => !cur.includes(x)), rem = cur.filter(x => !nxt.includes(x)), names = { partner: 'شريك', guardian: 'وصي محدود', observer: 'مراقب' };
    const grp = (keys, sign, cls) => Object.entries(byDom(keys)).map(([d, ks]) => `<div class="row noic"><span class="tx"><b>${DOM[d]} <span class="chip ${cls}">${sign}${ks.length}</span></b><span class="mono xs">${ks.map(x => x.split('.').slice(1).join('.')).join(' · ')}</span></span></div>`).join('');
    return `<h4>تطبيق قالب «${names[k]}» على سارة</h4><p class="d">${nxt.length} مفتاحاً. راجع ما سيتغيّر قبل التأكيد.</p>
    ${add.length ? `<h3 class="sec" style="margin-top:4px"><span>يُضاف (${add.length})</span></h3><div class="list">${grp(add, '+', 'ok')}</div>` : ''}${rem.length ? `<h3 class="sec"><span>يُزال (${rem.length})</span></h3><div class="list">${grp(rem, '−', 'da')}</div>` : ''}${!add.length && !rem.length ? callout('القالب مطبّق حالياً بلا فروق.', 'ok', 'check_circle') : ''}
    <div class="card flat"><div class="fx sb"><span class="sm">النطاق (scope)</span><b class="sm">كل الأطفال</b></div><div class="fx sb" style="margin-top:6px"><span class="sm">صالح حتى (valid_until)</span><b class="sm">15 فبراير 2027</b></div><div class="xs muted" style="margin-top:6px">الحقلان إلزاميان لكل منح، ولا قيمة افتراضية محكومة لهما — يحددهما الأب.</div></div>
    ${btn('أكّد بالرقم السري وطبّق', `tplApply:${k}`, '', 'lock')}`;
  },
});
surface('matrix', {
  t: 'مصفوفة التفويض — سارة', sys: 'S1-03', p: 'owner', req: '03:8,9,11,13,20 09:4', st: 'un',
  note: 'UNKNOWN: الحوكمة تسرد معرّفات المفاتيح الـ95 حرفياً لكنها لا تتضمن عناوينها العربية المعروضة؛ لذلك تُعرض المعرّفات كما هي حتى تُحسم العناوين. المفاتيح الحصرية للمالك (28) مقفلة.',
  r() {
    const P = window.FOS_PERM, has = S.tpl === 'none' ? [] : P[S.tpl], g = byDom(P.all.filter(k => !k.startsWith('agent.')));
    return callout(`${has.length} ممنوح من 95 · ${P.ownerOnly.length} للمالك حصراً لا تُمنح. الرفض الصريح يغلب المنح دائماً.`, '', 'info') + Object.entries(g).map(([d, ks]) => `${sec(`${DOM[d]} · ${ks.filter(k => has.includes(k)).length}/${ks.length}`)}<div class="list">${ks.map(k => { const oo = P.ownerOnly.includes(k); return `<div class="row noic"><span class="tx"><b class="mono" style="font-size:13px">${k}</b>${oo ? '<span>للمالك حصراً</span>' : ''}</span>${oo ? ic('lock') : tg(has.includes(k), 'keyToggle:' + k, k)}</div>`; }).join('')}</div>`).join('');
  },
});
surface('perm-registry', {
  t: 'سجل الصلاحيات', sys: 'S1-03', p: 'owner', req: '03:8,9,13,20 01:11',
  note: 'السجل المركزي لمفاتيح الصلاحيات: 95 مفتاحاً ذرياً بصيغة domain.action في 12 بادئة، مستخرجة آلياً من S1-03 SPEC §10-5.',
  r() { const P = window.FOS_PERM, g = byDom(P.all); return `<div class="g2" style="margin-bottom:10px"><div class="card stat"><b>${P.all.length}</b><span>مفتاحاً ذرياً</span></div><div class="card stat"><b>${P.ownerOnly.length}</b><span>للمالك حصراً</span></div></div>
    <table class="mx card" style="padding:0;display:table"><thead><tr><th>النطاق</th><th>الكل</th><th>شريك</th><th>وصي</th><th>مراقب</th></tr></thead><tbody>${Object.entries(g).map(([d, ks]) => `<tr><td style="padding-inline-start:12px">${DOM[d]}<div class="mono xs muted">${d}.*</div></td><td>${ks.length}</td>${['partner', 'guardian', 'observer'].map(t => { const n = ks.filter(k => P[t].includes(k)).length; return `<td class="${n ? 'y b' : 'n'}">${n || '—'}</td>`; }).join('')}</tr>`).join('')}<tr><td style="padding-inline-start:12px" class="b">المجموع</td><td class="b">95</td><td class="b">43</td><td class="b">24</td><td class="b">10</td></tr></tbody></table>
    ${callout('أي عملية إدارية جديدة في أي نظام تُضاف هنا أولاً كمفتاح قبل أن تظهر في الواجهة.', 'nt', 'rule')}`; },
});
surface('my-perms', {
  t: 'صلاحياتي', sys: 'S1-03', p: 'delegate', req: '03:2,4,17 09:4 07:12',
  note: 'شفافية للبالغ المفوَّض: ماذا مُنح، ومن منحه، ومتى ينتهي. ما لا يملك مفتاحه لا يظهر له، والإلغاء يسري فوراً.',
  r() { const P = window.FOS_PERM, has = S.tpl === 'none' ? [] : P[S.tpl]; if (!has.length) return empty('lock_person', 'لا توجد منح بعد', 'دورك «بالغ» بلا صلاحيات. الأب وحده يمنح ويعدّل ويلغي.'); const g = byDom(has);
    return `<div class="card"><div class="fx sb"><span class="sm muted">القالب</span>${chip({ partner: 'شريك', guardian: 'وصي محدود', observer: 'مراقب' }[S.tpl], 'in')}</div><div class="fx sb" style="margin-top:6px"><span class="sm muted">النطاق</span><b class="sm">كل الأطفال</b></div><div class="fx sb" style="margin-top:6px"><span class="sm muted">ينتهي في</span><b class="sm">15 فبراير 2027</b></div></div>${Object.entries(g).map(([d, ks]) => `${sec(`${DOM[d]} · ${ks.length}`)}<div class="card"><div class="chips">${ks.map(k => `<span class="chip mono" style="font-size:11px">${k.split('.').slice(1).join('.')}</span>`).join('')}</div></div>`).join('')}`; },
});
surface('audit', {
  t: 'سجل التدقيق', sys: 'S1-03', p: 'adult', req: '03:7,18 10:26 02:28',
  note: 'سجل كامل لكل منح وتعديل وإلغاء ورفض. الخط الزمني يبقى من الأقدم إلى الأحدث باتجاه ثابت (Q-386)؛ هنا القائمة عمودية والأحدث أعلى.',
  r() { return `<div class="fch"><button aria-pressed="true">الكل</button><button>الصلاحيات</button><button>الحماية</button><button>المرفوض</button></div><div class="card"><div class="tl">${S.audit.map(a => `<div class="ev ${a.deny ? 'da' : 'ok'}"><b>${a.t}</b><span>${a.w} · ${a.at} · <span class="mono">${a.k}</span></span></div>`).join('')}</div></div>`; },
});
surface('transfer', {
  t: 'نقل الملكية', sys: 'S1-03', p: 'owner', req: '03:16,20',
  note: 'نقل الملكية لبالغ فقط. فعل عالي الخطورة: شرح العواقب ← اختيار المستلم ← رفع أمني.',
  r() { return `${callout('بعد النقل تصبح سارة المالكة: تدير الفوترة والصلاحيات وحذف العائلة، وتصير أنت بالغاً بلا منح حتى تفوّضك.', 'wa', 'warning')}${sec('اختر المالك الجديد')}${list(row('', 'سارة', 'بالغ · مؤهلة', { lead: av(M.sara), v: ic('radio_button_checked') }), row('', 'خالد', 'مراهق · غير مؤهل (البالغون فقط)', { lead: av(M.khaled), c: 'dis', v: ic('block') }))}${btn('تابع إلى التأكيد', 'transferGo', 'dng', 'lock')}`; },
});
surface('turn13', {
  t: 'بلوغ 13 سنة', sys: 'S1-03', p: 'owner', req: '03:3,15 02:13',
  note: 'عند بلوغ 13 يتحول الدور تلقائياً من child إلى teen. تفويض المراهق يقتصر على صلاحيات غير إشرافية.',
  r() { return `<div class="c" style="padding:10px 0 4px">${av(M.layan, 'xl')}</div><p class="ttl" style="font-size:22px">ليان تكبر</p><p class="sub">سنة الميلاد 2017 تحدد الدور والقالب تلقائياً. في 2030 تنتقل إلى قالب المراهق.</p>
    ${sec('ما الذي يتغيّر تلقائياً')}${list(row('swap_horiz', 'الدور: طفل ← مراهق', 'child ← teen'), row('dashboard', 'الواجهة: تبويبات المراهق', 'الرئيسية · المحادثات · تعلّم · أنا'), row('chat_error', 'المصنّف في المحادثات', 'يبقى مفعّلاً افتراضياً ويمكنك إيقافه'))}
    ${sec('ما يمكنك تفويضه للمراهق')}${list(row('task_alt', 'إدارة مهامه الخاصة', 'صلاحية غير إشرافية', { tg: true, ta: 'soonT' }))}${callout('لا يُفوَّض للمراهق أي إشراف على إخوته، ولا الفوترة ولا الملكية.', 'nt', 'lock')}`; },
});
Object.assign(ACT, {
  soonT() { toast('حُفظ التفضيل'); },
  tplApply(k) { S.sheet = null; if (S.conflict) { S.conflict = false; return confirmDlg('تغيّرت الصلاحيات قبل لحظات', 'عدّلت نسخة أخرى من حسابك منح سارة للتو. لم يُحفظ تعديلك حتى لا يُكتب فوق الأحدث. حدّث ثم أعد المحاولة.', 'حدّث الآن', () => { toast('حُدّثت المنح · أعد تطبيق القالب'); render(); }); } gate('تطبيق قالب صلاحيات فعل حساس', () => { const was = S.tpl; S.tpl = k; audit(`طُبّق قالب «${{ partner: 'شريك', guardian: 'وصي محدود', observer: 'مراقب' }[k]}» على سارة`, 'roles.template.apply'); toast('طُبّق القالب · يسري فوراً على كل أجهزتها', () => { S.tpl = was; render(); }); }, 'stepup'); },
  revokeAll() { confirmDlg('إلغاء كل منح سارة؟', 'ستفقد سارة الوصول إلى لوحة العائلة فوراً على كل أجهزتها، وتبقى عضواً بالغاً في العائلة.', 'ألغِ المنح', () => { const was = S.tpl; S.tpl = 'none'; audit('أُلغيت كل منح سارة', 'roles.grant.revoke'); toast('أُلغيت المنح فوراً', () => { S.tpl = was; render(); }); render(); }, true); },
  keyToggle(k) { toast('المنح الفردي يفتح ورقة النطاق والمدة — المفتاح: ' + k, null, 'key'); },
  transferGo() { gate('نقل الملكية لا يُتراجع عنه بنقرة', () => toast('في التطبيق الفعلي تُنقل الملكية الآن. النموذج يُبقي أحمد مالكاً.', null, 'info'), 'stepup'); },
});

/* ============ التحكم ============ */
surface('control', {
  t: 'التحكم', sys: 'S1-09', p: 'adult', req: '09:5,6,7,8,9,15 10:24 01:11,19',
  note: 'عرض مزدوج: «سريع» ببطاقات جاهزة، ثم «متقدّم» بشجرة لكل فرد. الخدمات تُبنى من السجل المركزي؛ والتوفر صادق لكل منصة (جرّب تبديل Android / iOS من الاستوديو).',
  r() {
    const v = S.ctl || 'quick', ios = S.os === 'ios';
    const svc = [['shield', 'الحماية ووقت الشاشة', 'قواعد التطبيقات والحصة والجدول', 'go:protection', 'protection.rule.view', ios ? 'unavailable_on_device' : ''], ['location_on', 'الموقع والاستغاثة', 'الخريطة والسجل وجهات الطوارئ', 'go:map', 'location.view', ''], ['task_alt', 'المهام والتقويم', 'مهام بنقاط وتقويم هجري وميلادي', 'go:tasks', 'tasks.view', ''], ['stars', 'المكافآت', 'المحفظة والسلاسل وحدّ الصرف', 'go:rewards-admin', 'rewards.wallet.view', ''], ['forum', 'المحادثة العائلية', 'القنوات ورؤية محادثات القاصرين', 'go:chat-settings', 'chat.minor.view', ''], ['wand_stars', 'المساعد الذكي', 'مستوى الاستقلالية وسجل الأفعال', 'go:ai', 'hub.settings.view', '']];
    return seg([['quick', 'سريع'], ['adv', 'متقدّم']], v, 'set:ctl') + (v === 'quick' ? `
      ${ios ? callout('على iOS لا يتوفر التحكم العميق بالتطبيقات. نعرض ما يعمل فعلاً فقط، ونسمّي ما لا يعمل.', 'wa', 'ios') : ''}
      ${svc.map(([i, t, s, a, k, un]) => `<button class="card fx ${can(k) ? '' : 'dis'}" data-a="${can(k) ? a : 'denied:' + k}"><span class="qi" style="width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:var(--primary-soft);color:var(--primary);flex:none">${ic(i)}</span><div class="grow"><b>${t}</b><div class="sm muted">${s}</div>${!can(k) ? `<div style="margin-top:4px">${avail('not_delegated')}</div>` : un ? `<div style="margin-top:4px">${avail(un)} ${why('ios')}</div>` : ''}</div>${ic('chevron_right')}</button>`).join('')}
      ${sec('خدمات قادمة')}<div class="card flat"><div class="chips">${['التعليم', 'القرآن والصلاة', 'الصحة', 'المالية العائلية'].map(x => chip(x, 'ol', 'hourglass_empty')).join('')}</div><div class="xs muted" style="margin-top:8px">أمثلة توضيحية: أسماء الأنظمة 11–60 غير محسومة في الحوكمة. أي نظام جديد يظهر هنا تلقائياً بتسجيله في السجل المركزي، وإلغاء تسجيله يخفيه فوراً.</div></div>` :
      `<div class="fch">${KIDS.map(id => `<button aria-pressed="${(S.ctlKid || 'layan') === id}" data-a="set:ctlKid:${id}">${av(M[id], 'sm')}${pname(M[id])}</button>`).join('')}</div>${advTree(S.ctlKid || 'layan')}`);
  },
});
/* صف الإعداد الموحّد: الاسم + القيمة + شريحة المصدر + القفل + «لماذا؟» (settings-patterns.md) */
function srow(t, v, src, a, key, o = {}) {
  const ok = can(key), ios = o.ios && S.os === 'ios';
  return `<button class="row noic ${ok && !ios ? '' : 'dis'}" data-a="${ios ? 'why:ios' : ok ? a : 'denied:' + key}"><span class="tx"><b>${t}</b><span>${ios ? avail('unavailable_on_device') : !ok ? avail('not_delegated') : chip(src, 'ol', src === 'قالب العمر' ? 'category' : src === 'الأب' ? 'person' : 'tune')}${o.own && !isOwner() ? '' : ''}</span></span><span class="val">${v}</span><span class="chev">${ic(ok && !ios ? 'chevron_right' : 'lock')}</span></button>`;
}
function advTree(id) {
  const k = S.kid[id], ap = S.apps[id];
  return `${sec('الوقت والتطبيقات')}<div class="list">${srow('الحصة اليومية', k.quota + ' د', 'الأب', `go:quota:${id}`, 'protection.quota.edit', { ios: 1 })}${srow('قواعد التطبيقات', ap.length + ' تطبيقات', 'الأب', `go:apps:${id}`, 'protection.rule.view', { ios: 1 })}${srow('نافذة النوم', '9:00 م – 6:00 ص', 'قالب العمر', `go:schedule:${id}`, 'protection.schedule.edit', { ios: 1 })}${srow('نافذة المدرسة', '7:30 ص – 1:00 م', 'الأب', `go:schedule:${id}`, 'protection.schedule.edit', { ios: 1 })}${srow('ترتيب أنواع القواعد', 'النوم أولاً', 'افتراضي', 'go:priority', 'protection.priority.edit')}</div>
  ${sec('الويب')}<div class="list">${srow('البحث الآمن', 'مفعّل', 'افتراضي', `go:webfilter:${id}`, 'protection.filter.view')}${srow('فئات المواقع', '30 فئة', 'افتراضي', `go:webfilter:${id}`, 'protection.filter.view')}</div>
  ${sec('الموقع')}<div class="list">${srow('مشاركة الموقع', 'مفعّلة', 'الأب', 'go:map', 'location.view')}${srow('سجل المواقع', '7 أيام', 'ثابت', 'go:history:' + id, 'location.history.view')}</div>
  ${sec('المكافآت')}<div class="list">${srow('حدّ الصرف اليومي', S.redeemCap + ' د', 'الأب', 'go:rewards-admin', 'rewards.settings.edit')}${srow('سعر الصرف', '10 نقاط = 10 د', 'افتراضي', 'go:rewards-admin', 'rewards.settings.edit')}</div>
  ${sec('المحادثة')}<div class="list">${srow('المصنّف الآلي للرسائل', M[id].role === 'teen' ? 'مفعّل' : 'دائم', M[id].role === 'teen' ? 'الأب' : 'ثابت', 'go:chat-settings', 'chat.minor.view')}</div>`;
}
surface('protection', {
  t: 'الحماية ووقت الشاشة', sys: 'S1-10', p: 'adult', req: '10:1,2,6,10,18,24,25,28 09:8,9 01:19',
  note: 'صفحة الخدمة مولّدة من السجل: ترويسة ← قوالب ← مجموعات ← قيم لكل فرد ← سجل التغييرات.',
  r() {
    return `${S.os === 'ios' ? callout('أجهزة iOS: الفرض العميق غير متاح في هذه المرحلة. تبقى القواعد محفوظة وتتبع الطفل إلى أي جهاز Android يقترن به.', 'wa', 'ios') : ''}
    <div class="card">${KIDS.map(id => { const e = ENF[S.kid[id].enf]; return `<button class="fx" style="width:100%;padding:7px 0" data-a="go:enf-state:${id}">${av(M[id], 'sm')}<b class="grow">${pname(M[id])}</b>${chip(e[0], e[2], e[1])}</button>`; }).join('')}</div>
    ${sec('لكل طفل')}<div class="fch">${KIDS.map(id => `<button aria-pressed="${(S.ctlKid || 'layan') === id}" data-a="set:ctlKid:${id}">${av(M[id], 'sm')}${pname(M[id])}</button>`).join('')}</div>
    ${(id => list(row('apps', 'التطبيقات', 'سماح · حظر · حدّ يومي', { a: `go:apps:${id}` }), row('hourglass_top', 'الحصة اليومية الإجمالية', 'لكل يوم أسبوع', { a: `go:quota:${id}`, v: S.kid[id].quota + ' د' }), row('calendar_month', 'الجدول الأسبوعي', 'النوم والمدرسة', { a: `go:schedule:${id}` }), row('travel_explore', 'تصفية الويب', '30 فئة وتجاوزات النطاقات', { a: `go:webfilter:${id}` })))(S.ctlKid || 'layan')}
    ${sec('للعائلة كلها')}${list(row('swap_vert', 'ترتيب أنواع القواعد', 'النوم ← المدرسة ← حدود التطبيقات ← الحصة', { a: can('protection.priority.edit') ? 'go:priority' : 'denied:protection.priority.edit' }), row('lock_open', 'الوضع الحر', S.freeMode ? `مفعّل · بقي ${S.freeMode} د` : 'يعلّق كل القواعد مؤقتاً', { a: isOwner() ? 'go:freemode' : 'denied:protection.free_mode.activate', v: isOwner() ? '' : ic('lock') }), row('gpp_maybe', 'تنبيهات العبث', `${S.alerts.filter(a => a.k === 'tamper' && a.open).length} مفتوح`, { a: 'go:tamper:a1' }), row('receipt_long', 'سجل تغييرات الحماية', 'كل تغيير قاعدة مسجَّل', { a: 'go:audit' }))}`;
  },
});
surface('apps', {
  t: id => 'تطبيقات ' + M[id].n, sys: 'S1-10', p: 'adult', a: ['layan'], req: '10:1,3,5,7,12,27',
  note: 'قاعدة واحدة لكل طفل ولكل تطبيق: ALLOW / BLOCK / LIMIT. تطبيقات الدراسة تبقى مفتوحة في نافذة المدرسة. القواعد تتبع الطفل لا الجهاز.',
  r(id) { const A = { ALLOW: ['مسموح', 'ok', 'check'], BLOCK: ['محظور', 'da', 'block'], LIMIT: ['حدّ يومي', 'in', 'timer'] };
    return callout('القواعد تتبع ' + M[id].n + ' إلى أي جهاز يقترن به، لا الجهاز نفسه.', 'nt', 'devices') + list(S.apps[id].map(a => { const out = a.act === 'LIMIT' && a.used >= a.lim; return row(a.i, a.n, a.act === 'LIMIT' ? `${a.used} من ${a.lim} د اليوم${out ? ' · نفد' : ''}` : a.study ? 'تطبيق دراسة · يبقى مفتوحاً في وقت المدرسة' : a.act === 'BLOCK' ? 'لا يُفتح' : `${a.used} د اليوم`, { a: can('protection.rule.edit') ? `go:app-rule:${id}:${a.id}` : 'denied:protection.rule.edit', v: chip(A[a.act][0], out ? 'ac' : A[a.act][1], A[a.act][2]) }); })) + callout('تظهر هنا التطبيقات المثبتة على جهاز الطفل بعد الإقران.', 'nt', 'info'); },
});
surface('app-rule', {
  kind: 'sheet', t: 'قاعدة تطبيق', sys: 'S1-10', p: 'adult', a: ['layan', 'ytk'], req: '10:1,4,9,17,26',
  note: 'تعديل منخفض/متوسط الخطورة: يُحفظ فوراً مع تراجع 10 ثوانٍ. إن كان جهاز الطفل منقطعاً ينتظر التغيير على الخادم ويسري عند استلامه.',
  r(kid, id) { const a = appOf(kid, id);
    return `<div class="fx" style="margin-bottom:12px"><span class="av" style="--c:var(--primary)">${ic(a.i)}</span><div><h4>${a.n}</h4><span class="sm muted">قاعدة ${M[kid].n} لهذا التطبيق</span></div></div>
    ${seg([['ALLOW', 'اسمح'], ['LIMIT', 'حدّ يومي'], ['BLOCK', 'احظر']], a.act, `appAct:${kid}:${id}`)}
    ${a.act === 'LIMIT' ? `<div class="card flat"><div class="stepper"><button data-a="appLim:${kid}:${id}:-15" aria-label="أقل">${ic('remove')}</button><b>${a.lim}<small>دقيقة في اليوم</small></b><button data-a="appLim:${kid}:${id}:15" aria-label="أكثر">${ic('add')}</button></div><div class="days" style="margin-top:12px">${['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'].map((d, i) => `<button aria-pressed="${i < 5}">${d}<b>${i < 5 ? a.lim : a.lim + 30}</b></button>`).join('')}</div><div class="xs muted">الحد يُضبط لكل يوم من أيام الأسبوع. يظهر تحذير للطفل قبل 5 دقائق من النفاد.</div></div>` : ''}
    ${list(row('school', 'تطبيق دراسة', 'يبقى مفتوحاً أثناء نافذة المدرسة', { tg: !!a.study, ta: `appStudy:${kid}:${id}` }))}
    ${callout(S.kid[kid].online && !offline() ? 'يسري على جهاز ' + M[kid].n + ' خلال ثوانٍ.' : 'جهاز الطفل غير متصل الآن: يُحفظ التغيير ويسري عند أول اتصال.', S.kid[kid].online && !offline() ? 'ok' : 'wa', S.kid[kid].online && !offline() ? 'sync' : 'cloud_off')}`; },
});
Object.assign(ACT, {
  appAct(kid, id, v) { const a = appOf(kid, id), was = a.act; a.act = v; if (v === 'LIMIT' && !a.lim) a.lim = 30; queue(`قاعدة ${a.n}`, 'S1-10'); audit(`قاعدة ${a.n} لـ${M[kid].n}: ${was} ← ${v}`, 'protection.rule.edit'); toast('حُفظت القاعدة', () => { a.act = was; render(); }); },
  appLim(kid, id, d) { const a = appOf(kid, id); a.lim = Math.max(15, a.lim + +d); },
  appStudy(kid, id) { const a = appOf(kid, id); a.study = a.study ? 0 : 1; },
});
surface('quota', {
  t: id => 'حصة ' + M[id].n + ' اليومية', sys: 'S1-10', p: 'adult', a: ['layan'], req: '10:2,10,26 03:20',
  note: 'الحصة الإجمالية لكل طفل ولكل يوم أسبوع. مفتاح التعديل protection.quota.edit للمالك حصراً — جرّبها بشخصية سارة لترى القفل والتنبيه.',
  r(id) { const k = S.kid[id], d = S.qDay ?? 0, D = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'], val = i => (i > 4 ? k.quota + 60 : k.quota), own = isOwner();
    return `${own ? '' : callout('تعديل الحصة للأب فقط. يمكنك الاطلاع على القيم. ' + why('nd:protection.quota.edit'), 'nt', 'lock')}<div class="days">${D.map((n, i) => `<button aria-pressed="${i === d}" data-a="set:qDay:${i}">${n.replace('ال', '').slice(0, 3)}<b>${val(i)}</b></button>`).join('')}</div>
    <div class="card c"><div class="sm muted" style="margin-bottom:8px">${D[d]}</div><div class="stepper"><button data-a="${own ? `quotaAdj:${id}:-15` : 'denied:protection.quota.edit'}" aria-label="أقل">${ic(own ? 'remove' : 'lock')}</button><b>${val(d)}<small>دقيقة</small></b><button data-a="${own ? `quotaAdj:${id}:15` : 'denied:protection.quota.edit'}" aria-label="أكثر">${ic(own ? 'add' : 'lock')}</button></div></div>
    ${callout('الحصة آخر ما يُفحص: النوم ثم المدرسة ثم حدود التطبيقات ثم الحصة. ' + why('rank'), '', 'info')}`; },
});
ACT.quotaAdj = (id, d) => { const k = S.kid[id], was = k.quota; k.quota = Math.max(15, k.quota + +d); audit(`عُدّلت حصة ${M[id].n}: ${was} ← ${k.quota} د`, 'protection.quota.edit'); };
surface('schedule', {
  t: id => 'جدول ' + M[id].n, sys: 'S1-10', p: 'adult', a: ['layan'], req: '10:6,7,9,14',
  note: 'الجدول الأسبوعي قائمة 7 أيام. محور الوقت يبقى من اليسار إلى اليمين (Q-386). في نافذة النوم لا يُفتح أي تطبيق، وزر SOS يعمل دائماً.',
  r() { const D = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return `<div class="chips" style="margin-bottom:10px">${chip('نوم', '', 'bedtime')}${chip('مدرسة', 'in', 'school')}${chip('وقت متاح', 'ok', 'wb_sunny')}</div><div class="card">${D.map((d, i) => { const we = i > 4; return `<div style="margin-bottom:10px"><div class="fx sb sm"><b>${d}</b><span class="muted">${we ? 'نوم 10:00 م' : 'نوم 9:00 م · مدرسة 7:30 ص'}</span></div><div class="sched"><i class="sl" style="left:0;width:25%">نوم</i>${we ? '' : '<i class="sc" style="left:31.25%;width:22.9%">مدرسة</i>'}<i class="sl" style="left:${we ? 91.7 : 87.5}%;width:${we ? 8.3 : 12.5}%"></i></div></div>`; }).join('')}<div class="axis"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div></div>
    ${list(row('bedtime', 'نافذة النوم', 'لا يُفتح أي تطبيق · SOS يعمل دائماً', { a: can('protection.schedule.edit') ? 'schedEdit' : 'denied:protection.schedule.edit', v: '9:00 م – 6:00 ص' }), row('school', 'نافذة المدرسة', 'تطبيقات الدراسة فقط', { a: can('protection.schedule.edit') ? 'schedEdit' : 'denied:protection.schedule.edit', v: '7:30 ص – 1:00 م' }))}
    ${callout('تغيير الجدول يسري على جهاز الطفل عند استلامه، ويُفرض دون اتصال من آخر إعداد مزامَن.', 'nt', 'sync')}`; },
});
ACT.schedEdit = () => toast('منتقي الوقت (FosDateTimePicker) — خارج هذا الإصدار من النموذج', null, 'schedule');
const RANK = { sleep: ['النوم', 'bedtime'], school: ['المدرسة', 'school'], app: ['حدود التطبيقات', 'timer'], quota: ['الحصة الإجمالية', 'hourglass_top'] };
surface('priority', {
  t: 'ترتيب أنواع القواعد', sys: 'S1-10', p: 'adult', req: '10:10,11,12,13',
  note: 'الترتيب الافتراضي يعمل فوراً بلا إعداد. الأب يعيد الترتيب بحرية، والشاشة تعرض نتيجة ترتيبه بلغة صريحة قبل الحفظ.',
  r() { const r = S.rank, dflt = r.join() === 'sleep,school,app,quota';
    return `<p class="sm muted" style="margin:0 4px 10px">عند تعارض قاعدتين يفوز النوع الأعلى في القائمة.</p>${list(r.map((k, i) => `<div class="row"><span class="lead">${ic(RANK[k][1])}</span><span class="tx"><b>${i + 1}. ${RANK[k][0]}</b></span><button class="ib" data-a="rankMv:${i}:-1" aria-label="ارفع" ${i ? '' : 'disabled style="opacity:.3"'}>${ic('arrow_upward')}</button><button class="ib" data-a="rankMv:${i}:1" aria-label="أنزل" ${i < 3 ? '' : 'disabled style="opacity:.3"'}>${ic('arrow_downward')}</button></div>`))}
    ${sec('نتيجة ترتيبك')}<div class="card flat sm" style="line-height:1.9">${r.map((k, i) => i < 3 ? `<div>${ic('arrow_downward', 'xs')}<b>${RANK[k][0]}</b> ${k === 'sleep' ? 'يغلق كل التطبيقات' : k === 'school' ? 'تسمح بتطبيقات الدراسة فقط' : k === 'app' ? 'تحدّ كل تطبيق على حدة' : 'تحدّ مجموع اليوم'}، حتى لو سمح ${RANK[r[i + 1]][0].replace(/^ال/, 'ال')} بغير ذلك.</div>` : '').join('')}<div style="margin-top:6px">الوقت المكتسب أو الممنوح يضيف دقائق إلى حدّ التطبيق فقط، ولا يرفع نوعاً فوق نوع.</div></div>
    <div class="btns">${btn('أعد الافتراضي', 'rankReset', 'sec' + (dflt ? '" disabled="' : ''))}${btn('احفظ الترتيب', 'rankSave')}</div>`; },
});
Object.assign(ACT, {
  rankMv(i, d) { i = +i; d = +d; const r = S.rank, j = i + d; if (j < 0 || j > 3) return; [r[i], r[j]] = [r[j], r[i]]; },
  rankReset() { S.rank = ['sleep', 'school', 'app', 'quota']; },
  rankSave() { audit('عُدّل ترتيب أنواع القواعد: ' + S.rank.map(k => RANK[k][0]).join(' ← '), 'protection.priority.edit'); toast('حُفظ الترتيب · يسري على كل الأطفال'); back(); },
});
surface('freemode', {
  kind: 'sheet', t: 'الوضع الحر', sys: 'S1-10', p: 'owner', req: '10:18,19,20,26 03:12',
  note: 'للمالك حصراً. المدة يحددها الأب بالدقائق عند التفعيل (بلا مدة افتراضية محكومة). لافتة واضحة تبقى في لوحة الأهل، وSOS يعمل كالمعتاد.',
  r() { const n = S.fmN || 60; return `<h4>تفعيل الوضع الحر</h4><p class="d">يعلّق كل قواعد الفرض على أجهزة الأطفال مؤقتاً، ثم تعود تلقائياً. زر الاستغاثة يبقى يعمل.</p><div class="card flat"><div class="stepper"><button data-a="fmAdj:-15" aria-label="أقل">${ic('remove')}</button><b>${n}<small>دقيقة</small></b><button data-a="fmAdj:15" aria-label="أكثر">${ic('add')}</button></div></div>${btn('فعّل بالرقم السري', 'fmGo', '', 'lock')}`; },
});
Object.assign(ACT, {
  fmAdj(d) { S.fmN = Math.max(15, (S.fmN || 60) + +d); },
  fmGo() { S.sheet = null; gate('الوضع الحر يعلّق كل القواعد', () => { S.freeMode = S.fmN || 60; S.preset = ''; audit(`فُعّل الوضع الحر ${S.freeMode} د`, 'protection.free_mode.activate'); toast('الوضع الحر مفعّل'); }, 'stepup'); },
});
surface('tamper', {
  t: 'تنبيه عبث', sys: 'S1-10', p: 'adult', a: ['a1'], req: '10:21,22,23,25 01:6 09:3',
  note: 'كشف العبث: تنبيه فوري + إعادة تفعيل تلقائية تستمر عند كل نبضة تقييم. الصياغة تصف ما حدث بلا اتهام للطفل (microcopy: لا لوم).',
  r(id) { const a = S.alerts.find(x => x.id === id) || S.alerts[0], k = S.kid.khaled;
    return `<div class="card fx">${av(M.khaled, 'lg')}<div class="grow"><b>${a.open ? 'الحماية تعمل جزئياً على جهاز خالد' : 'عادت الحماية للعمل'}</b><div class="sm muted">خدمة الوصول (Accessibility) ${a.open ? 'متوقفة' : 'تعمل'}</div></div>${chip(a.open ? 'مفتوح' : 'محلول', a.open ? 'wa' : 'ok')}</div>
    ${sec('ما الذي حدث')}<div class="card"><div class="tl"><div class="ev wa"><b>توقفت خدمة الوصول</b><span>اليوم 5:00 م · قد يكون السبب تحديث النظام أو إيقافاً يدوياً</span></div><div class="ev"><b>محاولة إعادة تفعيل تلقائية (1)</b><span>5:00 م · لم تنجح</span></div><div class="ev"><b>محاولة إعادة تفعيل تلقائية (2)</b><span>5:01 م · لم تنجح · تستمر كل دقيقة</span></div>${a.open ? '' : '<div class="ev ok"><b>أُعيد التفعيل</b><span>الآن</span></div>'}</div></div>
    ${sec('ما الذي يعمل الآن')}${list(row('check_circle', 'حدود الوقت اليومية', 'تعمل', { ic: 'var(--success)' }), row(a.open ? 'error' : 'check_circle', 'حظر التطبيقات فوراً', a.open ? 'متوقف حتى تعود الخدمة' : 'يعمل', { ic: a.open ? 'var(--warning)' : 'var(--success)' }), row('check_circle', 'زر الاستغاثة والموقع', 'يعملان', { ic: 'var(--success)' }))}
    ${a.open ? `${callout('تحدّث مع خالد أولاً؛ كثيراً ما يكون السبب تقنياً. إعادة التفعيل من جهازه تحتاج دقيقة.', '', 'forum')}<div class="btns">${btn('أرسل له تذكيراً', 'tamperPing', 'sec')}${btn('علّمه محلولاً', isOwner() ? 'tamperOk:' + a.id : 'denied:protection.tamper.resolve', isOwner() ? '' : 'sec')}</div>` : ''}
    ${list(row('delete_forever', 'إلغاء تثبيت التطبيق من جهاز الطفل', 'يتطلب الرقم السري للأب دائماً', { v: ic('lock') }))}`; },
});
Object.assign(ACT, {
  tamperPing() { toast('أُرسل تذكير لطيف إلى خالد'); },
  tamperOk(id) { const a = S.alerts.find(x => x.id === id); a.open = 0; S.kid.khaled.enf = 'active'; audit('حُلّ تنبيه العبث على جهاز خالد', 'protection.tamper.resolve'); toast('عُلّم التنبيه محلولاً'); },
});
surface('enf-state', {
  t: id => 'حالة الفرض — ' + M[id].n, sys: 'S1-10', p: 'adult', a: ['layan'], req: '10:14,15,16,17,25,27 01:22,23',
  note: 'حالة الفرض مكشوفة لبقية الأنظمة: القواعد النشطة، المتبقي لكل تطبيق، الحد التالي، الوضع الحر، العبث. القواعد تُفرض دون اتصال من آخر إعداد مزامَن.',
  r(id) { const k = S.kid[id], e = ENF[k.enf], off = offline();
    return `<div class="card fx"><span class="bigic" style="width:56px;height:56px;border-radius:18px;margin:0">${ic(e[1])}</span><div class="grow"><b>${e[0]}</b><div class="sm muted">${off ? 'الجهاز يفرض القواعد محلياً من آخر إعداد مزامَن' : 'القواعد على الجهاز مطابقة للخادم'}</div></div></div>
    ${list(row('sync', 'آخر مزامنة للقواعد', 'نسخة الإعداد 42', { v: age(k.ago) }), row('timer', 'نبضة خصم الوقت', 'كل 60 ثانية · تعمل دون اتصال بالساعة الرتيبة', { v: chip('تعمل', 'ok') }), row('hourglass_top', 'الحد التالي', left(id) ? `الحصة اليومية بعد ${left(id)} د` : 'انتهت الحصة', {}), row('lock_open', 'الوضع الحر', S.freeMode ? `مفعّل · ${S.freeMode} د` : 'غير مفعّل', {}), row('gpp_maybe', 'العبث', k.enf === 'active' ? 'لا يوجد' : 'حدث مفتوح', { a: k.enf === 'active' ? '' : 'go:tamper:a1' }), row('verified', 'توقيع الجهاز', 'أمر الأب موقَّع والجهاز يقرّ بالاستلام', { v: chip('موثَّق', 'ok', 'check') }))}
    ${sec('المتبقي لكل تطبيق')}${list(S.apps[id].filter(a => a.act === 'LIMIT').map(a => row(a.i, a.n, `${Math.max(0, a.lim - a.used)} د متبقية`, { v: `${a.used}/${a.lim}` })))}
    ${callout('إن غيّرت قاعدة وجهاز الطفل منقطع، ينتظر التغيير على الخادم ويُسلَّم عند أول اتصال. أحداث الاستخدام دون اتصال تُسجَّل محلياً ثم تُزامَن.', 'nt', 'cloud_upload')}`; },
});
surface('enf-all', { t: 'حالة الحماية', sys: 'S1-10', p: 'adult', req: '10:25 09:1', r() { return list(KIDS.map(id => { const e = ENF[S.kid[id].enf]; return row('', pname(M[id]), e[0], { lead: av(M[id]), a: 'go:enf-state:' + id, v: chip('', e[2], e[1]) }); })); } });
const WCAT = [['pornography', 'محتوى إباحي', 'BLOCK'], ['matureContent', 'محتوى للبالغين', 'BLOCK'], ['gambling', 'قمار', 'BLOCK'], ['drugs', 'مخدرات', 'BLOCK'], ['alcohol', 'كحول'], ['tobacco', 'تبغ'], ['violence', 'عنف'], ['weapons', 'أسلحة'], ['profanity', 'ألفاظ نابية'], ['proxiesLoopholes', 'بروكسي وتحايل'], ['socialNetwork', 'شبكات اجتماعية'], ['chat', 'دردشة'], ['forums', 'منتديات'], ['webmail', 'بريد ويب'], ['fileSharing', 'مشاركة ملفات'], ['games', 'ألعاب'], ['entertainment', 'ترفيه'], ['shopping', 'تسوّق'], ['ai', 'ذكاء اصطناعي'], ['searchPortals', 'محركات بحث'], ['news', 'أخبار'], ['sports', 'رياضة'], ['travel', 'سفر'], ['technology', 'تقنية'], ['business', 'أعمال'], ['employment', 'توظيف'], ['government', 'حكومي'], ['health', 'صحة'], ['religion', 'دين'], ['educational', 'تعليمي']];
surface('webfilter', {
  t: id => 'تصفية الويب — ' + M[id].n, sys: 'S1-10', p: 'adult', a: ['layan'], req: '10:28,29,30,31', st: 'un',
  note: 'الفئات الثلاثون بمعرّفاتها من المواصفة. UNKNOWN: المواصفة تسمّي من الافتراضيات المحظورة خمساً فقط («…كما في Qustodio»)، فتُعرض البقية «غير محسوم» لا كقيمة مخترعة. الأعلام الخمسة بافتراضياتها الحرفية. التعديل للمالك حصراً.',
  r(id) { const own = isOwner(), A = { BLOCK: ['حظر', 'da', 'block'], ALERT: ['تنبيه', 'wa', 'notifications'], ALLOW: ['سماح', 'ok', 'check'] }, ov = S.wov || {}, open = S.wAll;
    const F = [['isSafeSearch', 'البحث الآمن', 'يفرض البحث الآمن في محركات البحث', true], ['isReportBlockedSites', 'أبلغني بالمواقع المحظورة', 'تنبيه عند محاولة فتح موقع محظور', true], ['isAllowUnknownSites', 'اسمح بالمواقع غير المصنّفة', '', false], ['isSearchAlertsNotificationsEnabled', 'تنبيهات كلمات البحث', '', false], ['isCategoryList', 'وضع قائمة الفئات', '', false]];
    return `${own ? '' : callout('تعديل التصفية للأب فقط؛ يمكنك الاطلاع.', 'nt', 'lock')}${sec('الأعلام الخمسة')}${list(F.map(([k, t, s, d]) => row('', t, (s ? s + ' · ' : '') + `<span class="mono xs">${k}</span>`, { tg: (S.wf || {})[k] ?? d, ta: own ? 'wfFlag:' + k : 'denied:protection.filter.edit' })))}
    ${sec(`الفئات (${WCAT.length})`, open ? 'أقل' : 'عرض الكل', 'flip:wAll')}${list(WCAT.slice(0, open ? 30 : 7).map(([k, t, d]) => { const v = ov[k] || d; return `<button class="row noic" data-a="${own ? 'wfCat:' + k : 'denied:protection.filter.edit'}"><span class="tx"><b>${t}</b><span class="mono xs">${k}</span></span>${v ? chip(A[v][0], A[v][1], A[v][2]) : chip('غير محسوم', 'ol', 'help')}</button>`; }))}
    ${sec('تجاوزات النطاقات')}${list(row('public', '<span class="ltr">khanacademy.org</span>', 'يفوز على إجراء الفئة (الأخص يفوز)', { v: chip('سماح', 'ok', 'check') }), row('add', 'أضف نطاقاً', 'سماح · حظر · تنبيه · تجاهل', { a: own ? 'soonD' : 'denied:protection.filter.edit' }))}`; },
});
Object.assign(ACT, {
  wfFlag(k) { S.wf = S.wf || {}; const d = ['isSafeSearch', 'isReportBlockedSites'].includes(k); S.wf[k] = !(S.wf[k] ?? d); audit('عُدّل علم التصفية ' + k, 'protection.filter.edit'); },
  wfCat(k) { S.wov = S.wov || {}; const d = (WCAT.find(c => c[0] === k)[2]) || 'ALLOW', cur = S.wov[k] || d, nx = { BLOCK: 'ALERT', ALERT: 'ALLOW', ALLOW: 'BLOCK' }[cur]; S.wov[k] = nx; audit(`فئة ${k}: ${cur} ← ${nx}`, 'protection.filter.edit'); },
  soonD() { toast('إضافة نطاق: حقل LTR + اختيار الإجراء', null, 'public'); },
});

/* ============ الموقع ============ */
surface('map', {
  t: 'موقع العائلة', sys: 'S1-07', p: 'adult', req: '07:1,2,3,6,11,12,13,15 09:10,11 01:10',
  note: 'الخريطة لا تُعكس في RTL. كل فرد ببطاريته ووسم زمني صريح؛ والموقع القديم يظهر بمظهر مختلف ولا يُعرض كأنه حي. المصطلح «مشاركة الموقع» لا «تعقّب».',
  act: () => `<button class="ib" data-a="go:emergency" aria-label="جهات الطوارئ">${ic('contact_emergency')}</button>`,
  r() { if (!can('location.view')) return empty('location_off', 'الموقع غير مفوَّض لك', 'اطلب من الأب صلاحية عرض الموقع.', why('nd:location.view'));
    const old = offline() || S.stale;
    return `${old ? callout('تعرض الخريطة آخر موقع معروف، لا الموقع الحي.', 'wa', 'history') : ''}${miniMap(300, true)}<div class="gap"></div>${list(KIDS.map(id => { const k = S.kid[id]; return row('', pname(M[id]), `${S.privacy ? '••••' : k.place} · ${old ? 'آخر موقع معروف' : k.moving ? 'يتحرك' : 'ثابت'}`, { lead: av(M[id]), a: can('location.history.view') ? 'go:history:' + id : 'denied:location.history.view', v: `${chip(k.bat + '%', k.bat < 20 ? 'da' : 'ol', k.bat < 20 ? 'battery_alert' : 'battery_5_bar')}` }); }))}<div class="chips">${age(2)}${chip('يتحدث كل 5 د عند السكون وكل دقيقة عند الحركة', 'ol', 'avg_pace')}</div>`; },
});
surface('history', {
  t: id => 'سجل مواقع ' + M[id].n, sys: 'S1-07', p: 'adult', a: ['layan'], req: '07:13,14,6',
  note: 'سجل 7 أيام يُحذف تلقائياً. الخط الزمني يبقى من الأقدم إلى الأحدث (Q-386).',
  r() { const d = S.hDay ?? 6; return `<div class="fch">${['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'أمس', 'اليوم'].map((n, i) => `<button aria-pressed="${i === d}" data-a="set:hDay:${i}">${n}</button>`).join('')}</div>${miniMap(170)}<div class="gap"></div><div class="card"><div class="tl">${[['6:10 ص', 'البيت', 'غادرت'], ['7:25 ص', 'المدرسة', 'وصلت'], ['1:05 م', 'المدرسة', 'غادرت'], ['1:32 م', 'البيت', 'وصلت']].map(([t, p, a]) => `<div class="ev"><b>${a} ${S.privacy ? '••••' : p}</b><span>${t}</span></div>`).join('')}</div></div>${callout('يُحتفظ بالسجل 7 أيام ثم يُحذف تلقائياً. النقاط الملتقطة دون اتصال تُرفع عند عودته بلا تكرار.', 'nt', 'delete')}`; },
});
surface('emergency', {
  t: 'جهات الطوارئ', sys: 'S1-07', p: 'adult', req: '07:9,10,17 04:11',
  note: 'يديرها الأب (location.emergency.manage — مالك حصري). عند SOS دون اتصال تُرسل SMS بالإحداثيات إليهم وإلى كل البالغين، وتُحسب من حصة الخطة مع 3 رسائل طوارئ بعد النفاد.',
  r() { const own = isOwner(), C = S.ec || [], q = { free: 20, basic: 50, premium: 100 }[S.plan];
    return `${C.length ? list(C.map(c => row('contact_emergency', c.n, `<span class="ltr">${c.p}</span>`, { v: own ? `<button class="ib" data-a="ecDel:${c.p}" aria-label="حذف">${ic('delete')}</button>` : '' }))) : empty('contact_emergency', 'لا توجد جهات طوارئ بعد', 'أضف قريباً أو جاراً يصله تنبيه الاستغاثة مع الموقع، حتى لو انقطع الإنترنت.')}
    ${btn('أضف جهة طوارئ', own ? 'ecAdd' : 'denied:location.emergency.manage', own ? '' : 'sec', own ? 'add' : 'lock')}<div class="gap"></div>
    <div class="card"><div class="fx sb sm"><b>رصيد SMS هذا الشهر</b><span>${S.sms.used} من ${q}</span></div><div style="margin:8px 0">${pbar(S.sms.used / q * 100, S.sms.used / q > .8 ? 'wa' : '')}</div><div class="xs muted">إن نفد الرصيد تبقى 3 رسائل استغاثة للطوارئ كل شهر.</div></div>`; },
});
Object.assign(ACT, {
  ecAdd() { S.ec = (S.ec || []).concat({ n: 'العم ناصر', p: '+967 77 123 4567' }); S.checklist.emergency = 1; toast('أُضيفت جهة الطوارئ'); },
  ecDel(p) { S.ec = S.ec.filter(c => c.p !== p); },
});

/* ============ المهام والتقويم ============ */
const TST = { PENDING: ['قيد التنفيذ', 'ol', 'radio_button_unchecked'], SUBMITTED: ['بانتظار الاعتماد', 'in', 'pending'], APPROVED: ['منجزة', 'ok', 'check_circle'], CANCELLED: ['ملغاة', '', 'cancel'], EXPIRED: ['فاتت', '', 'timer_off'] };
surface('tasks', {
  t: 'المهام والتقويم', sys: 'S1-06', p: 'adult', a: [''], req: '06:1,2,5,10,11,12,13,16 09:17',
  note: 'المهام دون اتصال أولاً. النسخة الفائتة من مهمة متكررة تنتهي بنهاية اليوم ولا تتراكم.',
  act: () => `<button class="ib" data-a="go:task-new" aria-label="مهمة جديدة">${ic('add')}</button>`,
  r(kid) { const v = S.tv || 'tasks', f = S.tf || kid || 'all', T = S.tasks.filter(t => f === 'all' || t.kid === f);
    return seg([['tasks', 'المهام'], ['cal', 'التقويم']], v, 'set:tv') + (v === 'cal' ? calView() : `<div class="fch"><button aria-pressed="${f === 'all'}" data-a="set:tf:all">الكل</button>${KIDS.map(id => `<button aria-pressed="${f === id}" data-a="set:tf:${id}">${av(M[id], 'sm')}${pname(M[id])}</button>`).join('')}</div>
    ${T.length ? list(T.map(t => row(CAT[t.cat][1], t.t, `${pname(M[t.kid])} · ${t.due}${t.rep ? ' · ' + ic('repeat', 'xs') + t.rep : ''}`, { ic: CAT[t.cat][2], a: t.st === 'SUBMITTED' ? `go:task-review:${t.id}` : `go:task:${t.id}`, v: chip(TST[t.st][0], TST[t.st][1], TST[t.st][2]) }))) : empty('add_task', 'لا مهام بعد', 'أنشئ أول مهمة وحدّد نقاطها.', btn('أنشئ مهمة', 'go:task-new', 'sm'))}`); },
});
function calView() {
  const ev = S.events, sel = S.cDay || 15, H = n => { try { return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric' }).format(new Date(2026, 10, n)); } catch (e) { return ''; } };
  return `<div class="card"><div class="fx sb" style="margin-bottom:8px"><b>نوفمبر 2026</b><span class="sm muted">جمادى الأولى – جمادى الآخرة 1448</span></div><div class="cal">${['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map(d => `<span class="dn">${d}</span>`).join('')}${Array.from({ length: 30 }, (_, i) => i + 1).map(n => `<button class="${n === 15 ? 'td' : ''} ${ev.some(e => e.d === n) ? 'ev' : ''}" style="${n === sel && n !== 15 ? 'box-shadow:inset 0 0 0 2px var(--primary)' : ''}" data-a="set:cDay:${n}">${n}<small>${H(n)}</small></button>`).join('')}</div></div>
  ${sec(sel === 15 ? 'اليوم' : `${sel} نوفمبر`, 'حدث جديد', can('calendar.event.create') ? 'go:event-new' : 'denied:calendar.event.create')}${(l => l.length ? list(l.map(e => row('event', e.t, `${e.at} · تذكير قبل ${e.rem >= 1440 ? 'يوم' : e.rem + ' دقيقة'}`))) : `<div class="card flat c sm muted">لا أحداث في هذا اليوم</div>`)(ev.filter(e => e.d === sel))}`;
}
surface('task', {
  t: 'مهمة', sys: 'S1-06', p: 'adult', a: ['t2'], req: '06:1,3,4,5,10,11',
  r(id) { const t = S.tasks.find(x => x.id === id), k = M[t.kid];
    return `<div class="card"><div class="fx top">${av(k)}<div class="grow"><b style="font-size:calc(18px*var(--ts))">${t.t}</b><div class="sm muted">${k.n} · ${t.due}</div><div class="chips" style="margin-top:6px">${chip(CAT[t.cat][0], '', CAT[t.cat][1])}${chip(TST[t.st][0], TST[t.st][1], TST[t.st][2])}${chip(t.pts + ' نقاط', 'go', 'star')}</div></div></div></div>
    ${t.note ? callout('ملاحظتك عند الإعادة: ' + t.note, 'wa', 'reply') : ''}
    ${list(row('photo_camera', 'طريقة الإثبات', '', { v: { photo: 'صورة', audio: 'تسجيل صوتي', self: 'إقرار ذاتي' }[t.proof] }), row('repeat', 'التكرار', t.rep ? 'النسخة الفائتة تنتهي بنهاية يومها ولا تتراكم' : '', { v: t.rep || 'مرة واحدة' }), row('alarm', 'التذكير', '', { v: 'قبل 60 دقيقة' }))}
    ${t.sub ? sec('قائمة الفحص') + list(t.sub.map(s => row('check_box', s, ''))) : ''}
    ${t.st === 'PENDING' ? btn('ألغِ المهمة', can('tasks.cancel') ? 'taskCancel:' + id : 'denied:tasks.cancel', 'dng sec') : ''}`; },
});
ACT.taskCancel = id => { const t = S.tasks.find(x => x.id === id), was = t.st; t.st = 'CANCELLED'; back(); toast('أُلغيت المهمة', () => { t.st = was; render(); }); };
surface('task-new', {
  t: 'مهمة جديدة', sys: 'S1-06', p: 'adult', req: '06:1,2,3,4,10,14,16',
  note: 'عنوان + مُسنَد إليه واحد + فئة + نقاط + استحقاق + طريقة إثبات. النقاط الافتراضية 10 وللمراهق 0. الفئات الأربع الافتراضية والأب يضيف فئاته.',
  r() { const n = S.nt = S.nt || { kid: 'layan', cat: 'home', pts: 10, proof: 'photo', rep: 'none' };
    return `<label class="fld"><span>ماذا يجب أن يُنجَز؟</span><input id="ntT" placeholder="مثال: سقي النباتات" value="${n.t || ''}"></label>
    <div class="fld"><span>لمن؟</span><div class="chips">${KIDS.map(id => `<button class="chip ${n.kid === id ? 'in' : 'ol'}" style="min-height:40px;padding:0 12px 0 4px" data-a="ntSet:kid:${id}">${av(M[id], 'sm')}&nbsp;${M[id].n}</button>`).join('')}</div></div>
    <div class="fld"><span>الفئة</span><div class="chips">${Object.entries(CAT).map(([k, [t, i]]) => `<button class="chip ${n.cat === k ? 'in' : 'ol'}" style="min-height:40px;padding:0 12px" data-a="ntSet:cat:${k}">${ic(i)}${t}</button>`).join('')}<button class="chip ol" style="min-height:40px" data-a="${isOwner() ? 'soonC' : 'denied:tasks.category.create'}">${ic(isOwner() ? 'add' : 'lock')}فئة</button></div></div>
    <div class="fld"><span>النقاط ${n.kid === 'khaled' ? '· الافتراضي للمراهق صفر' : ''}</span>${seg([[5, '5'], [10, '10'], [15, '15'], [25, '25']].concat(n.kid === 'khaled' ? [[0, '0']] : []), n.pts, 'ntSet:pts')}</div>
    <div class="fld"><span>كيف يثبت الإنجاز؟</span>${seg([['photo', 'صورة'], ['audio', 'تسجيل صوتي'], ['self', 'إقرار ذاتي']], n.proof, 'ntSet:proof')}</div>
    <div class="fld"><span>التكرار</span>${seg([['none', 'مرة'], ['daily', 'يومياً'], ['week', 'أيام محددة']], n.rep, 'ntSet:rep')}</div>
    ${list(row('event', 'الاستحقاق', '', { v: 'اليوم 6:00 م', a: 'schedEdit' }), row('alarm', 'التذكير', '15 · 30 · 60 دقيقة · يوم', { v: 'قبل 60 دقيقة' }), row('checklist', 'بنود فرعية', 'قائمة فحص داخل المهمة', { v: 'لا يوجد', a: 'soonC' }))}
    ${btn(offline() ? 'احفظ · تُرسل عند الاتصال' : 'أسند المهمة', 'ntSave', '', offline() ? 'cloud_upload' : '')}`; },
});
Object.assign(ACT, {
  ntSet(k, v) { S.nt.t = ($('#ntT') || {}).value; S.nt[k] = isNaN(v) ? v : +v; if (k === 'kid') S.nt.pts = v === 'khaled' ? 0 : 10; },
  soonC() { toast('حقل إضافي — خارج هذا الإصدار من النموذج', null, 'info'); },
  ntSave() { const n = S.nt, t = ($('#ntT') || {}).value.trim(); if (!t) { toast('اكتب عنوان المهمة أولاً', null, 'error'); return; } S.tasks.unshift({ id: 't' + Date.now(), kid: n.kid, t, cat: n.cat, pts: n.pts, due: 'اليوم 6:00 م', proof: n.proof, st: 'PENDING', rep: n.rep === 'daily' ? 'يومياً' : '' }); const off = queue('مهمة «' + t + '»', 'S1-06'); S.nt = null; back(); toast(off ? 'حُفظت المهمة في الصندوق الصادر' : `أُسندت المهمة إلى ${M[n.kid].n}`, null, off ? 'cloud_upload' : 'check_circle'); },
});
surface('event-new', {
  kind: 'sheet', t: 'حدث تقويم', sys: 'S1-06', p: 'adult', req: '06:12,13,14',
  r() { return `<h4>حدث عائلي جديد</h4><p class="d">يظهر لكل أفراد العائلة بالتاريخين.</p><label class="fld"><span>العنوان</span><input id="evT" placeholder="مثال: زيارة الجدة"></label>${list(row('today', 'التاريخ', `${S.cDay || 15} نوفمبر 2026`, { v: 'ميلادي + هجري' }), row('schedule', 'الوقت', '', { v: '5:00 م' }), row('alarm', 'التذكير', 'الافتراضي 60 دقيقة', { v: 'قبل 60 دقيقة' }))}${btn('أضف الحدث', 'evSave')}`; },
});
ACT.evSave = () => { const t = ($('#evT') || {}).value.trim(); if (!t) { toast('اكتب عنوان الحدث', null, 'error'); return; } S.events.push({ d: S.cDay || 15, t, at: '5:00 م', rem: 60 }); S.sheet = null; S.tv = 'cal'; toast('أُضيف الحدث إلى تقويم العائلة'); };

/* ============ المكافآت (إدارة) ============ */
surface('rewards-admin', {
  t: 'المكافآت', sys: 'S1-05', p: 'adult', req: '05:1,2,6,7,10,11,18 10:12',
  note: 'محفظة واحدة لكل طفل، ورصيدها ظاهر للطفل وللأب دائماً. الإعدادات للمالك حصراً (rewards.settings.edit).',
  r() { const own = isOwner();
    return `${['layan', 'yusuf', 'khaled'].map(id => { const k = S.kid[id]; return `<button class="card fx" data-a="go:wallet-admin:${id}">${av(M[id])}<div class="grow"><b>${pname(M[id])}</b><div class="sm muted">${id === 'khaled' ? 'مهام المراهق بلا نقاط افتراضياً' : `سلسلة ${k.streak} ${k.streak > 2 && k.streak < 11 ? 'أيام' : 'يوماً'}`}</div></div><b style="font-size:calc(20px*var(--ts))">${k.pts}</b>${coin()}</button>`; }).join('')}
    <div class="btns" style="margin-bottom:10px">${btn('امنح نقاطاً', can('rewards.grant.create') ? 'go:grant-points' : 'denied:rewards.grant.create', 'sm ton', 'stars')}${btn('امنح وقتاً', can('rewards.grant.create') ? 'go:grant-time' : 'denied:rewards.grant.create', 'sm ton', 'more_time')}</div>
    ${sec('القواعد')}${list(row('swap_horiz', 'سعر الصرف', 'يصرفها الطفل وقتاً للتطبيق الذي نفد وقته', { v: '10 نقاط = 10 د' }), row('hourglass_top', 'حدّ الصرف اليومي', 'أقصى وقت يُشترى بالنقاط في اليوم', { v: S.redeemCap + ' د', a: own ? 'capAdj' : 'denied:rewards.settings.edit' }), row('local_fire_department', 'مكافأة السلسلة', '7 أيام إنجاز متتالية', { v: '50 نقطة' }), row('ac_unit', 'تجميد السلسلة', 'يحفظ السلسلة في يوم غياب', { a: own ? 'soonC' : 'denied:rewards.streak.freeze', v: own ? '' : ic('lock') }), row('wand_stars', 'منح المساعد', 'كل منح ذكاء قابل للتراجع من سجله', { a: 'go:ai' }))}`; },
});
ACT.capAdj = () => { S.redeemCap = S.redeemCap === 60 ? 30 : S.redeemCap === 30 ? 45 : 60; toast('حدّ الصرف اليومي: ' + S.redeemCap + ' دقيقة'); };
surface('wallet-admin', {
  t: id => 'محفظة ' + M[id].n, sys: 'S1-05', p: 'adult', a: ['layan'], req: '05:1,2,5,6,7,9,18',
  r(id) { const k = S.kid[id];
    return `<div class="wallet"><small>الرصيد</small><div class="big">${k.pts} ${coin()}</div><small>سلسلة ${k.streak} أيام · صُرف اليوم ${k.spent} من ${S.redeemCap} د</small></div>
    ${sec('الحركات')}<div class="card"><div class="tl">${S.tasks.filter(t => t.kid === id && t.st === 'APPROVED' && t.pts).map(t => `<div class="ev ok"><b>+${t.pts} · ${t.t}</b><span>بعد الاعتماد · اليوم</span></div>`).join('')}${(S.grants || []).filter(g => g.kid === id).map(g => `<div class="ev ok"><b>+${g.n} · منحة من ${g.by}</b><span>${g.why || 'بلا سبب مذكور'} · الآن</span></div>`).join('')}<div class="ev"><b>−10 · صرف 10 د لـYouTube Kids</b><span>أمس · انتهى أثره منتصف الليل</span></div></div></div>
    ${can('rewards.grant.create') ? btn('امنح نقاطاً', 'go:grant-points:' + id, '', 'stars') : ''}`; },
});
surface('grant-points', {
  kind: 'sheet', t: 'منح نقاط', sys: 'S1-05', p: 'adult', a: ['layan'], req: '05:6',
  note: 'منح يدوي فوري بسقف 60 نقطة للمنحة الواحدة.',
  r(kid) { const g = S.gp = S.gp || { kid: kid || 'layan', n: 10 };
    return `<h4>امنح نقاطاً</h4><p class="d">تودَع فوراً في المحفظة. الحد 60 نقطة للمنحة.</p><div class="chips" style="margin-bottom:12px">${['layan', 'yusuf'].map(id => `<button class="chip ${g.kid === id ? 'in' : 'ol'}" style="min-height:40px;padding:0 12px 0 4px" data-a="gpSet:kid:${id}">${av(M[id], 'sm')}&nbsp;${M[id].n}</button>`).join('')}</div>
    <div class="card flat"><div class="stepper"><button data-a="gpSet:n:${Math.max(5, g.n - 5)}" aria-label="أقل">${ic('remove')}</button><b>${g.n}<small>نقطة</small></b><button data-a="gpSet:n:${Math.min(60, g.n + 5)}" aria-label="أكثر">${ic('add')}</button></div></div>
    <label class="fld"><span>السبب (يراه الطفل)</span><input id="gpW" placeholder="مثال: ساعدتِ أخاكِ اليوم"></label>${btn('امنح الآن', 'gpGo')}`; },
});
Object.assign(ACT, {
  gpSet(k, v) { S.gp[k] = isNaN(v) ? v : +v; },
  gpGo() { const g = S.gp, w = ($('#gpW') || {}).value; S.kid[g.kid].pts += g.n; (S.grants = S.grants || []).push({ kid: g.kid, n: g.n, by: me().n, why: w }); S.sheet = null; S.gp = null; queue('منح نقاط', 'S1-05'); toast(`أُودعت ${g.n} نقطة في محفظة ${M[g.kid].n}`, () => { S.kid[g.kid].pts -= g.n; S.grants.pop(); render(); }); },
});
surface('grant-time', {
  kind: 'sheet', t: 'منح وقت مباشر', sys: 'S1-05', p: 'adult', a: ['layan'], req: '05:11 10:12',
  note: 'الأب يمنح وقتاً إضافياً مباشرة بلا نقاط. يضاف إلى حدّ تطبيق محدد وينتهي بنهاية اليوم.',
  r(kid) { const g = S.gt = S.gt || { kid: kid || 'layan', n: 15 }, ap = S.apps[g.kid].filter(a => a.act === 'LIMIT'); g.app = ap.some(a => a.id === g.app) ? g.app : ap[0].id;
    return `<h4>امنح وقتاً إضافياً</h4><p class="d">بلا نقاط. يُضاف إلى تطبيق واحد وينتهي بنهاية اليوم.</p><div class="chips" style="margin-bottom:10px">${KIDS.map(id => `<button class="chip ${g.kid === id ? 'in' : 'ol'}" style="min-height:40px;padding:0 12px 0 4px" data-a="gtSet:kid:${id}">${av(M[id], 'sm')}&nbsp;${M[id].n}</button>`).join('')}</div>
    <div class="chips" style="margin-bottom:12px">${ap.map(a => `<button class="chip ${g.app === a.id ? 'in' : 'ol'}" style="min-height:40px;padding:0 12px" data-a="gtSet:app:${a.id}">${ic(a.i)}${a.n}</button>`).join('')}</div>
    ${seg([[10, '10 د'], [15, '15 د'], [30, '30 د'], [60, '60 د']], g.n, 'gtSet:n')}${btn('امنح الوقت', 'gtGo')}`; },
});
Object.assign(ACT, {
  gtSet(k, v) { S.gt[k] = isNaN(v) ? v : +v; },
  gtGo() { const g = S.gt, a = appOf(g.kid, g.app); a.lim += g.n; S.kid[g.kid].extra += g.n; S.sheet = null; S.gt = null; const off = queue('منح وقت', 'S1-05'); audit(`مُنح ${M[g.kid].n} ${g.n} د لتطبيق ${a.n}`, 'rewards.grant.create'); toast(off ? 'محفوظ · يصل الجهاز عند الاتصال' : `مُنحت ${g.n} دقيقة لـ${a.n}`, () => { a.lim -= g.n; S.kid[g.kid].extra -= g.n; render(); }); },
});
