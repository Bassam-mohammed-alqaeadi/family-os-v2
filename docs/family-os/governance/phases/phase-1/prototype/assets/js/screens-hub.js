/* ============================================================
   S1-09 — مركز التحكم والإعدادات
   السجل الواحد (الخدمات والتحكمات) ← منه تُبنى «التحكم» و«الخدمات» وصفحة الخدمة والبحث الشامل.
   المركز يعرض ويجمع ولا يملك: كل تعديل يذهب إلى شاشة الخدمة صاحبته أو إلى فعلها (REQ-002).
   ============================================================ */

/* ---------- الخدمات (REQ-005، REQ-014، REQ-015) ---------- */
const SVC = [
  { id: 'prot', n: 'الحماية ووقت الشاشة', d: 'قواعد التطبيقات والحصة والجدول', i: 'shield', go: 'go:protection', k: 'protection.rule.view', home: 'الأوضاع الجاهزة ووقت الشاشة اليوم لكل طفل', ios: 1, log: 'go:prot-audit' },
  { id: 'loc', n: 'الموقع والاستغاثة', d: 'الخريطة والسجل وجهات الطوارئ', i: 'location_on', go: 'go:map', k: 'location.view', home: 'خريطة «أين العائلة الآن» ومكان كل طفل', keep: 'زر الاستغاثة يبقى ظاهراً دائماً على أجهزة الأبناء.' },
  { id: 'tasks', n: 'المهام والتقويم', d: 'مهام بنقاط وتقويم هجري وميلادي', i: 'task_alt', go: 'go:tasks', k: 'tasks.view', home: 'بطاقة مهام اليوم وزر «مهمة جديدة»' },
  { id: 'rew', n: 'المكافآت', d: 'المحافظ والسلاسل والوقت الإضافي', i: 'stars', go: 'go:rewards-admin', k: 'rewards.wallet.view', home: 'بطاقة نقاط الأطفال وزرّا «منح وقت» و«منح نقاط»' },
  { id: 'chat', n: 'المحادثة العائلية', d: 'القنوات ورؤية محادثات القاصرين', i: 'forum', go: 'go:chat-settings', k: 'chat.minor.view', home: 'بطاقة عدد الرسائل الجديدة، بلا محتواها' },
  { id: 'ai', n: 'المساعد الذكي', d: 'مستوى الاستقلالية وسجل الأفعال', i: 'wand_stars', go: 'go:ai', k: 'hub.settings.view', home: 'بطاقة اقتراح المساعد' },
];
const svcOf = id => SVC.find(s => s.id === id);
/* الخدمة تظهر ما دامت مسجّلة في التطبيق. الأب لا يخفي خدمة بنفسه (Q-407): إزالتها تتم عند نشر التطبيق فقط؛ والاستوديو يحاكيها بـ S.svcGone لعرض الأثر (REQ-015). */
const svcOn = id => S.svcGone !== id;
const svcIos = s => !!s.ios && S.os === 'ios';
function svcState(s) {
  if (!svcOn(s.id)) return chip('أُزيلت', 'ol', 'visibility_off');
  if (!can(s.k)) return avail('not_delegated');
  if (svcIos(s)) return avail('unavailable_on_device');
  return chip('تعمل', 'ok', 'check');
}

/* ---------- التحكمات (REQ-008، REQ-009): اسم إنساني + وصف + قيمة سارية + مصدر + نوع ----------
   النوع: go = محرر كامل في شاشة الخدمة · pick = اختيار من قيم (ورقة «تعديل إعداد») · sw = مفتاح فوري مع تراجع · fix = ثابت لا يتغير. */
const CTL = [
  { id: 'quota', s: 'prot', g: 'الوقت والتطبيقات', t: 'الحصة اليومية', d: 'مجموع وقت الشاشة المسموح في اليوم', syn: 'وقت الشاشة مدة ساعات حد يومي دقائق', v: id => S.kid[id].quota + ' د', src: () => 'الأب', a: id => `go:quota:${id}`, k: 'protection.quota.edit', ios: 1 },
  { id: 'apps', s: 'prot', g: 'الوقت والتطبيقات', t: 'قواعد التطبيقات', d: 'ما يُفتح وما يُحظر وما له حدّ', syn: 'تطبيق لعبة حظر منع برامج العاب يوتيوب', v: id => S.apps[id].filter(a => a.act).length + ' قواعد', src: () => 'الأب', a: id => `go:apps:${id}`, k: 'protection.rule.view', ios: 1 },
  { id: 'sleep', s: 'prot', g: 'الوقت والتطبيقات', t: 'نافذة النوم', d: 'يُغلق الجهاز فيها ليلاً', syn: 'النوم الليل ساعات الهدوء وقت النوم سهر', v: id => winTxt(id, 'sleep'), src: () => 'الأب', a: id => `go:schedule:${id}`, k: 'protection.schedule.edit', ios: 1 },
  { id: 'school', s: 'prot', g: 'الوقت والتطبيقات', t: 'نافذة المدرسة', d: 'تُفتح فيها تطبيقات الدراسة فقط', syn: 'المدرسة الدراسة الدوام مذاكرة', v: id => winTxt(id, 'school'), src: () => 'الأب', a: id => `go:schedule:${id}`, k: 'protection.schedule.edit', ios: 1 },
  { id: 'mode', s: 'prot', g: 'الوقت والتطبيقات', t: 'الوضع الساري', d: 'وضع مؤقت يعلو القواعد اليومية', syn: 'وضع حر دراسة نوم رحلة مؤقت', v: id => (fmOf(id) ? 'وضع حر' : pmOf(id) ? modeN(pmOf(id)) : 'لا وضع الآن'), src: id => (fmOf(id) || pmOf(id) ? 'مؤقت' : 'افتراضي'), a: id => `psFor:${id}`, k: 'protection.mode_preset.apply', ios: 1 },
  { id: 'rank', s: 'prot', g: 'الوقت والتطبيقات', t: 'ترتيب أنواع القواعد', d: 'أيّ قاعدة تغلب عند التعارض', syn: 'اولويه تعارض ترتيب', v: id => RANK[rankOf(id)[0]][0] + ' أولاً', src: id => (S.rankKid[id] ? 'خاص به' : rankOf(id).join() === 'sleep,school,app,quota' ? 'افتراضي' : 'الأب'), a: () => 'go:priority', k: 'protection.priority.edit' },
  { id: 'safe', s: 'prot', g: 'الويب', t: 'البحث الآمن', d: 'يحجب النتائج غير اللائقة في محركات البحث', syn: 'انترنت نت جوجل بحث متصفح', v: id => (wfFlagOf(id, 'safe') ? 'مفعّل' : 'مطفأ'), src: () => 'افتراضي', a: id => `go:webfilter:${id}`, k: 'protection.filter.view' },
  { id: 'cats', s: 'prot', g: 'الويب', t: 'فئات المواقع', d: 'ما يُحجب من المواقع بحسب نوعه', syn: 'انترنت نت مواقع حجب متصفح اباحي قمار', v: () => '30 فئة', src: () => 'افتراضي', a: id => `go:webfilter:${id}`, k: 'protection.filter.view' },
  { id: 'share', s: 'loc', g: 'الموقع', t: 'مشاركة الموقع', d: 'مكان الطفل يظهر لوالده دائماً ولا يُطفأ', syn: 'مكان تتبع خريطه اين gps', v: () => 'دائماً', src: () => 'ثابت', a: id => 'go:loc:' + id, k: 'location.view' },
  { id: 'locnow', s: 'loc', g: 'الموقع', t: 'حدّث الموقع الآن', d: 'يطلب من جهاز الابن مكانه في الحال', syn: 'مكان تحديث الان اين موقع حالا', v: () => 'عند الطلب', src: () => 'فعل', type: 'act', go: 'حدّث الآن', gi: 'refresh', k: 'location.view', run: id => ACT.locRefresh(id),
    fx: id => `يصل الطلب إلى جهاز ${pname(M[id])} فيرد بمكانه خلال لحظات. إن كان بلا اتصال أو مغلقاً يبقى آخر موقع معروف ويُكتب السبب.` },
  { id: 'hist', s: 'loc', g: 'الموقع', t: 'سجل المواقع', d: 'يُحفظ سبعة أيام ثم يُحذف تلقائياً', syn: 'مكان اماكن سابقه تاريخ', v: () => '7 أيام', src: () => 'ثابت', a: id => 'go:history:' + id, k: 'location.history.view' },
  { id: 'cap', s: 'rew', g: 'المكافآت', t: 'حدّ الوقت الإضافي اليومي', d: 'أقصى وقت إضافي لكل ابن في اليوم، صرفاً بالنقاط أو منحاً منك', syn: 'نقاط شراء وقت صرف مكافاه اضافي منح حد', v: () => S.redeemCap + ' د', src: () => 'الأب', type: 'pick', opts: [30, 45, 60, 90, 120], get: () => S.redeemCap, k: 'rewards.settings.edit', all: 1,
    fx: v => `يأخذ كل ابن ${v} دقيقة إضافية في اليوم على الأكثر، صرفاً بنقاطه أو منحاً منك. ما أُخذ اليوم يبقى محسوباً.`, set: v => { S.redeemCap = +v; } },
  { id: 'rate', s: 'rew', g: 'المكافآت', t: 'سعر الصرف', d: 'كل عشر نقاط تساوي عشر دقائق، ولا يتغيّر', syn: 'نقاط شراء وقت مكافاه سعر', v: () => '10 نقاط = 10 د', src: () => 'ثابت', a: () => 'go:rw-settings', k: 'rewards.settings.view' },
  { id: 'bonus', s: 'rew', g: 'المكافآت', t: 'مكافأة السلسلة', d: 'نقاط تودَع كل سبعة أيام إنجاز متتالية', syn: 'سلسله ايام متتاليه مكافاه شعله', v: () => (RW().bonus ? RW().bonus + ' نقطة' : 'بلا'), src: () => (RW().bonus === 50 ? 'افتراضي' : 'الأب'), a: () => 'go:rw-edit:bonus', k: 'rewards.settings.edit' },
  { id: 'cele', s: 'rew', g: 'المكافآت', t: 'شدة الاحتفال', d: 'ما يظهر للطفل عند كل كسب', syn: 'احتفال قصاصات حركه صوت', v: () => RW_CELE[RW().cele][0], src: () => (RW().cele === 'full' ? 'افتراضي' : 'الأب'), a: () => 'go:rw-edit:cele', k: 'rewards.settings.edit' },
  { id: 'src', s: 'rew', g: 'المكافآت', t: 'مصادر النقاط', d: 'الأنظمة التي تودِع في المحفظة', syn: 'مصدر كسب مهام نقاط', v: () => (RW().src.tasks ? 'المهام' : 'متوقفة'), src: () => (RW().src.tasks ? 'افتراضي' : 'الأب'), a: () => 'go:rw-settings', k: 'rewards.settings.edit' },
  { id: 'tkpts', s: 'tasks', g: 'المهام والتقويم', t: 'النقاط الافتراضية للمهمة', d: 'ما تبدأ به كل مهمة جديدة، ويتغيّر لكل مهمة', syn: 'مهمه مهام نقاط افتراضي واجب', v: () => rwPt(TK().pts), src: () => (TK().pts === 10 ? 'افتراضي' : 'الأب'), a: () => 'go:tk-edit:pts', k: 'shell.config.edit' },
  { id: 'tkproof', s: 'tasks', g: 'المهام والتقويم', t: 'طريقة الإثبات الافتراضية', d: 'صورة أو تسجيل صوتي. الإقرار وحده ليس افتراضياً أبداً', syn: 'مهمه اثبات دليل صوره تسجيل اقرار', v: () => TK_PF[TK().proof][0], src: () => (TK().proof === 'photo' ? 'افتراضي' : 'الأب'), a: () => 'go:tk-edit:proof', k: 'shell.config.edit' },
  { id: 'tkrem', s: 'tasks', g: 'المهام والتقويم', t: 'التذكير الافتراضي', d: 'متى يصل التذكير قبل المهمة أو الحدث', syn: 'تذكير منبه تنبيه موعد تقويم', v: () => tkRm(TK().rem), src: () => (TK().rem === 60 ? 'افتراضي' : 'الأب'), a: () => 'go:tk-edit:rem', k: 'shell.config.edit' },
  { id: 'tkrec', s: 'tasks', g: 'المهام والتقويم', t: 'تكرار المهام', d: 'خيار التكرار عند إنشاء المهمة', syn: 'مهمه تكرار يومي اسبوعي متكرره', v: () => (TK().rec ? 'مفعّل' : 'متوقف'), src: () => (TK().rec ? 'افتراضي' : 'الأب'), type: 'sw', own: 1, sys: 'S1-06', all: 1, get: () => (TK().rec ? 1 : 0), set: v => { TK().rec = !!v; }, fmt: v => (v ? 'مفعّل' : 'متوقف'), k: 'shell.config.edit',
    fx: v => (v ? 'خيار التكرار يظهر عند إنشاء كل مهمة.' : 'يختفي خيار التكرار من المهام الجديدة. المهام المتكررة القائمة تبقى كما هي.') },
  { id: 'tkcats', s: 'tasks', g: 'المهام والتقويم', t: 'فئات المهام', d: 'أربع أساسية، وتضيف فئات عائلتك', syn: 'مهمه فئه فئات تصنيف نوع', v: () => `${4 + Object.keys(TK().cats).length} فئات`, src: () => (Object.keys(TK().cats).length ? 'الأب' : 'افتراضي'), a: () => 'go:tk-cats', k: 'tasks.category.create' },
  { id: 'tkai', s: 'tasks', g: 'المهام والتقويم', t: 'المساعد يُعدّ المهام', d: 'يقترح عليك، أو يسند ضمن حدودك، أو لا يُعدّ', syn: 'مساعد ذكاء مهمه اقتراح تفويض اسناد', v: () => TK_LV[TK().ai.lv][3], src: () => (TK().ai.lv === 'suggest' ? 'افتراضي' : 'الأب'), a: () => 'go:tk-ai', k: 'shell.config.edit' },
  { id: 'cls', s: 'chat', g: 'المحادثة', t: 'المصنّف الآلي للرسائل', d: 'ينبّهك عند رسالة خطرة دون أن يعرض المحادثة', syn: 'رسائل تنمر خطر مراقبه شات دردشه', v: id => (M[id].role === 'teen' ? ((S.clsTeen ?? true) ? 'مفعّل' : 'متوقف') : 'دائم'), src: id => (M[id].role === 'teen' ? 'الأب' : 'ثابت'), a: () => 'go:chat-settings', k: 'chat.minor.view' },
];
const ctlOf = id => CTL.find(c => c.id === id);
const ctlAct = (c, kid) => (c.type ? `go:ctl-edit:${c.id}:${kid}` : c.a(kid));
const ctlRow = (c, kid) => srow(c.t, c.v(kid), c.src(kid), ctlAct(c, kid), c.k, { ios: c.ios, hl: S.hl === c.id });
const ctlGroups = (kid, sid) => { const G = []; CTL.filter(c => (!sid || c.s === sid) && svcOn(c.s)).forEach(c => { let g = G.find(x => x[0] === c.g); if (!g) G.push(g = [c.g, []]); g[1].push(c); }); return G.map(([g, L]) => `${sec(g)}<div class="list">${L.map(c => ctlRow(c, kid)).join('')}</div>`).join(''); };
/* شجرة العرض المتقدّم: تتولّد من السجل، لا من قائمة ثابتة (settings-patterns.md DS-SE-01) */
function advTree(id) { return ctlGroups(id); }

/* ---------- H09-08 صفحة الخدمة ---------- */
surface('svc', {
  t: id => (svcOf(id) || SVC[0]).n, sys: 'S1-09', p: 'owner', a: ['prot'], req: '09:2,5,8,9,14,15',
  note: 'صفحة خدمة واحدة، للمالك: حالتها بصدق، وما تضعه في الرئيسية، وإعداداتها لكل طفل بالقيمة السارية ومصدرها. الأعمدة التقنية (المفتاح، النوع، جدول Android / iOS) مخفية: يظهر «غير متاح على هذا الجهاز» حيث لا يعمل الإعداد فقط. لا مفتاح إخفاء: الخدمة تُزال عند نشر التطبيق فقط (جرّب «خدمة أُزيلت» من الاستوديو).',
  r(id) {
    if (!isOwner()) return empty('lock_person', 'هذه الصفحة للمالك', 'إعدادات ما سُمح لكِ به تجدينها في «التحكم».', btn('التحكم', 'tab:control', 'sm sec'));
    const s = svcOf(id) || SVC[0], on = svcOn(s.id), kid = S.ctlKid || 'layan', body = ctlGroups(kid, s.id);
    return `<div class="card fx"><span class="qi lg ${toneOf(s.i)}">${ic(s.i)}</span><div class="grow"><b style="font-size:calc(18px*var(--ts))">${s.n}</b><div class="sm muted">${s.d}</div><div style="margin-top:6px">${svcState(s)}${svcIos(s) ? ' ' + why('ios') : ''}</div></div></div>
    ${!on ? callout(`<b>هذه الخدمة أُزيلت من التطبيق</b><br>اختفت بطاقاتها من الرئيسية ومن «التحكم». تنبيهاتها السابقة باقية في «كل التنبيهات».${s.keep ? ' ' + s.keep : ''}`, 'nt', 'visibility_off') : btn('افتح ' + s.n, s.go, '', 'open_in_new') + '<div class="gap"></div>'}
    ${on ? sec('ما تعرضه في الرئيسية') + `<div class="card flat sm">${s.home}</div>` : ''}
    ${on && body ? `<div class="fch" style="margin-top:12px">${KIDS.map(k => `<button aria-pressed="${kid === k}" data-a="set:ctlKid:${k}">${av(M[k], 'sm')}${pname(M[k])}</button>`).join('')}</div>${body}` : on ? `<p class="sm muted" style="margin:10px 4px">إعدادات هذه الخدمة داخل شاشتها.</p>` : ''}
    ${on && s.log ? list(row('receipt_long', 'سجل تغييرات هذه الخدمة', 'من غيّر ماذا ومتى', { a: s.log })) : ''}`;
  },
});

/* ---------- H09-09 تعديل إعداد واحد: الأنواع الثلاثة في السجل (REQ-008) — pick اختيار من قيم · sw مفتاح · act فعل يُنفَّذ مرة ---------- */
surface('ctl-edit', {
  kind: 'sheet', t: 'تعديل إعداد', sys: 'S1-09', p: 'adult', a: ['cap', 'layan'], req: '09:2,8',
  note: 'ورقة واحدة لكل إعداد بسيط: اسمه بلغة الناس، قيمته الآن ومصدرها، معاينة أثر القيمة الجديدة بجملة، ثم حفظ صريح مع تراجع وسطر في السجل. الإعداد يُكتب عند الخدمة صاحبته لا في المركز. الإعدادات المركّبة (جدول، قواعد تطبيقات) تفتح شاشتها مباشرة.',
  r(id, kid) {
    const c = ctlOf(id) || ctlOf('cap'), off = offline(), k = M[kid] && KIDS.includes(kid) ? kid : S.ctlKid || 'layan';
    if (c.type === 'act') return `<h4>${c.t}</h4><p class="d">${c.d}. فعل يُنفَّذ مرة واحدة، ولا يغيّر إعداداً.</p>
    <div class="card flat fx sb sm"><span>على من</span><span class="fx" style="gap:6px">${av(M[k], 'sm')}<b>${pname(M[k])}</b></span></div>
    ${callout(c.fx(k), 'nt', 'visibility')}${off ? callout('أنت غير متصل. هذا الفعل يحتاج اتصالاً.', 'wa', 'cloud_off') : ''}
    <div class="btns">${btn('إلغاء', 'ctlCancel', 'sec')}${btn(c.go, `ctlRun:${c.id}:${k}`, off ? '" disabled="' : '', c.gi)}</div>`;
    const cur = c.get(), d = S.ctlDraft = (S.ctlDraft && S.ctlDraft.id === c.id ? S.ctlDraft : { id: c.id, v: cur }), ch = d.v !== cur;
    return `<h4>${c.t}</h4><p class="d">${c.d}. ${c.all ? 'يسري على كل الأطفال.' : ''}</p>
    <div class="card flat fx sb sm"><span>القيمة الآن</span><span><b>${c.v()}</b> ${chip(c.src(), 'ol', 'person')}</span></div>
    <div class="fld"><span>القيمة الجديدة</span>${seg(c.type === 'sw' ? [[1, 'مفعّل'], [0, 'متوقف']] : c.opts.map(o => [o, o + ' د']), d.v, 'ctlPick')}</div>
    ${callout(c.fx(d.v), ch ? '' : 'nt', 'visibility')}
    ${off && ch ? callout('أنت غير متصل. يُحفظ التغيير هنا ويُرسل عند عودة الاتصال.', 'wa', 'cloud_off') : ''}
    <div class="btns">${btn('إلغاء', 'ctlCancel', 'sec')}${btn(off ? 'احفظ · يُرسل لاحقاً' : 'احفظ', 'ctlSave', ch ? '' : '" disabled="')}</div>`;
  },
});
Object.assign(ACT, {
  ctlPick(v) { if (S.ctlDraft) S.ctlDraft.v = +v; },
  ctlCancel() { S.ctlDraft = null; S.sheet = null; },
  ctlSave() {
    const d = S.ctlDraft, c = d && ctlOf(d.id); if (!c) return; if (!can('hub.settings.edit') || !can(c.k) || (c.own && !isOwner())) return ACT.denied(c.k);
    const was = c.get(); if (d.v === was) return; c.set(d.v); S.ctlDraft = null; S.sheet = null;
    const sw = c.type === 'sw', off = queue(sw ? `${c.t}: ${c.fmt(d.v)}` : `${c.t}: ${d.v} د`, c.sys || 'S1-05'); audit(sw ? `عُدّل ${c.t}: ${c.fmt(was)} ← ${c.fmt(d.v)}` : `عُدّل ${c.t}: ${was} ← ${d.v} د`, c.k);
    toast(off ? 'محفوظ · يُرسل عند عودة الاتصال' : sw ? `${c.t}: ${c.fmt(d.v)}` : `${c.t}: ${d.v} دقيقة`, () => { c.set(was); render(); }, off ? 'cloud_upload' : 'check_circle');
  },
  /* نوع «فعل»: يُنفَّذ مرة عند الخدمة صاحبته، بالشرطين نفسيهما (مفتاح التعديل في المركز ومفتاح الفعل) */
  ctlRun(id, kid) { const c = ctlOf(id); if (!c || c.type !== 'act') return; if (!can('hub.settings.edit') || !can(c.k, kid)) return ACT.denied(c.k); S.ctlDraft = null; S.sheet = null; c.run(kid); },
  /* من البحث الشامل: يفتح العرض المتقدّم عند الإعداد ويبرزه */
  ctlFind(id) { const c = ctlOf(id); if (!c) return; S.ctl = 'adv'; S.hl = id; tab('control'); setTimeout(() => { const e = document.querySelector('#scr .row.hl'); if (e && e.scrollIntoView) e.scrollIntoView({ block: 'center' }); }, 80); setTimeout(() => { S.hl = null; const e = document.querySelector('#scr .row.hl'); if (e) e.classList.remove('hl'); }, 3200); },
});

/* ---------- H09-04 / H09-05 التنبيهات ---------- */
/* نوع التنبيه ← [اسمه، أيقونته، الخدمة صاحبته، اسمها المختصر] */
const AK = {
  sos: ['استغاثة', 'sos', 'loc', 'الموقع والاستغاثة'], tamper: ['حماية', 'gpp_maybe', 'prot', 'الحماية'], chat: ['محادثة', 'chat_error', 'chat', 'المحادثة'],
  perm: ['صلاحيات', 'lock_person', '', 'العائلة والصلاحيات'], grant: ['صلاحية تنتهي', 'schedule', '', 'العائلة والصلاحيات'],
};
function alertSees(a) { return a.k === 'tamper' ? can('protection.tamper.view') : a.k === 'chat' ? can('chat.minor.view') : a.k === 'perm' || a.k === 'grant' ? isOwner() : true; }
function allAlerts() {
  if (!can('hub.alerts.view')) return [];
  const A = [], ack = S.ackd || {};
  if (S.sos && S.sos.st !== 'pending' && S.sos.from !== me().id) A.push({ id: 'sos', k: 'sos', kid: S.sos.from, t: `استغاثة من ${M[S.sos.from].n}`, s: `${S.sos.via} · ${S.sos.place}`, ago: 'الآن', p: 0, open: S.sos.st === 'sent' ? 1 : 0, live: 1, late: /SMS/.test(S.sos.via) ? 'وصلت برسالة نصية لأن الهاتف كان بلا إنترنت' : '' });
  S.alerts.forEach(a => A.push(a));
  if (isOwner() && S.persona === 'owner') soonList().forEach(k => A.push({ id: 'gx-' + k, k: 'grant', kid: null, who: 'سارة', t: gDays(S.g[k]) < 0 ? 'انتهت صلاحية لسارة' : `صلاحية لسارة تنتهي بعد ${dTxt(gDays(S.g[k]))}`, s: PL[k][0], ago: 'اليوم', p: 2, open: ack['gx-' + k] ? 0 : 1, gk: k }));
  return A.filter(alertSees);
}
function alertGo(a) {
  if (a.k === 'sos') return a.live ? 'go:sos-status' : 'go:map';
  if (a.k === 'tamper') return `go:tamper:${a.id}`;
  if (a.k === 'chat') return a.rv ? 'go:chat-review' : 'go:chat-flag:dm-khaled-layan:0';
  if (a.k === 'grant') return `keyOpen:${a.gk}`;
  return /جهة استرداد/.test(a.t) ? 'go:security' : `go:denial:${a.id}`;
}
const alertTone = a => (a.p === 0 ? 'da' : a.k === 'tamper' || a.k === 'grant' ? 'go' : a.k === 'chat' ? 'in' : '');
surface('alert', {
  t: 'تنبيه', sys: 'S1-09', p: 'adult', a: ['a1'], req: '09:3,10,15',
  note: 'تفصيل تنبيه واحد: ما حدث، ومن يخص، ووقته الأصلي، والخدمة صاحبته، ثم زر يفتحها. «تمّت قراءته» يخفيه عند كل البالغين. الاستغاثة النشطة ومشكلة الحماية القائمة لا تُغلقان بالقراءة: تُحلّان من شاشتيهما. والاستغاثة التي وصلت متأخرة تحمل وقت إرسالها لا وقت وصولها.',
  r(id) {
    const a = allAlerts().find(x => x.id === id); if (!a) return empty('notifications_off', 'هذا التنبيه لم يعد موجوداً', 'ربما أغلقه بالغ آخر، أو لم يعد من صلاحياتك.', btn('كل التنبيهات', 'back', 'sm sec'));
    const going = a.k === 'tamper' && a.open && (S.tam || []).some(e => e.kid === a.kid && e.open);   /* مشكلة ما زالت قائمة: لا تُغلق بالقراءة */
    const K = AK[a.k] || AK.perm, s = svcOf(K[2]), hid = s && !svcOn(s.id), who = a.kid ? pname(M[a.kid]) : a.who || '', ack = can('hub.alerts.acknowledge');
    return `<div class="card"><div class="fx top"><span class="qi lg ${alertTone(a)}">${ic(K[1])}</span><div class="grow"><b style="font-size:calc(17px*var(--ts));line-height:1.5">${a.t}</b><div class="sm muted" style="margin-top:2px">${a.s}</div>
      <div class="chips" style="margin-top:8px">${chip(K[0], 'ol')}${a.p === 0 ? chip('طارئ', 'da', 'priority_high') : a.p === 1 ? chip('عاجل', 'wa') : ''}${a.open ? chip('لم يُقرأ', 'in') : chip('قُرئ', 'ok', 'done_all')}</div></div></div></div>
    ${a.late ? callout(`<b>وصل متأخراً</b><br>${a.late}. الوقت المعروض هو وقت الإرسال، لا وقت الوصول.`, 'wa', 'history') : ''}
    ${list(row('schedule', 'وقت الحدث', '', { v: a.ago }), who ? row('person', 'يخص', '', { v: who }) : '', row(s ? s.i : 'groups', 'الخدمة', hid ? 'أُزيلت من التطبيق · تنبيهاتها السابقة باقية' : '', { v: K[3] }))}
    ${hid ? '' : btn('افتح ' + K[3], alertGo(a), a.open && ack && !a.live && !going ? 'sec' : '', 'open_in_new')}<div class="gap"></div>
    ${a.live && a.open ? callout('الاستغاثة تبقى ظاهرة حتى تُحل من شاشتها.', 'da', 'sos') : going ? callout('المشكلة ما زالت قائمة. يبقى التنبيه حتى تُحل من شاشة الحماية.', 'wa', 'gpp_maybe') : a.open && ack ? btn('تمّت قراءته', `alertAck:${a.id}`, '', 'done_all') : ''}`;
  },
});
Object.assign(ACT, {
  alertAck(id) {
    if (!can('hub.alerts.acknowledge')) return ACT.denied('hub.alerts.acknowledge');
    const a = S.alerts.find(x => x.id === id), gx = id.startsWith('gx-'); if (!a && !gx) return;
    if (a && a.k === 'tamper' && (S.tam || []).some(e => e.kid === a.kid && e.open)) return toast('يبقى حتى تُحل المشكلة من شاشة الحماية', null, 'gpp_maybe');
    if (a) a.open = 0; else { S.ackd = S.ackd || {}; S.ackd[id] = 1; }
    const off = queue('تأكيد قراءة تنبيه', 'S1-09'); if (S.stack[S.stack.length - 1].id === 'alert') back();
    toast(off ? 'محفوظ · يُرسل عند عودة الاتصال' : 'أُغلق التنبيه عند كل البالغين', () => { if (a) a.open = 1; else delete S.ackd[id]; render(); }, off ? 'cloud_upload' : 'done_all');
  },
  alK(k) { S.alK = k; },
});
/* تبويب «كل التنبيهات» في شاشة التنبيهات (H09-04) */
function alertLog() {
  const all = allAlerts(), un = S.alUn ?? false, kf = S.alK || 'all', kinds = [...new Set(all.map(a => a.k))];
  const L = all.filter(a => (!un || a.open) && (kf === 'all' || a.k === kf));
  return `<div class="fch"><button aria-pressed="${kf === 'all'}" data-a="alK:all">الكل</button>${kinds.map(k => `<button aria-pressed="${kf === k}" data-a="alK:${k}">${AK[k][0]}</button>`).join('')}</div>
  <div class="card tight">${row('', 'غير المقروءة فقط', '', { tg: un, ta: 'flip:alUn' })}</div>
  ${L.length ? list(L.map(a => row(AK[a.k][1], a.t, `${a.ago} · ${AK[a.k][3]}${a.late ? ' · وصل متأخراً' : ''}`, { a: `go:alert:${a.id}`, c: a.open ? 'unread' : '', v: a.open ? '<i class="udot" aria-label="لم يُقرأ"></i>' : '' }))) : empty('notifications_off', un ? 'لا تنبيهات غير مقروءة' : 'لا تنبيهات', 'كل ما تنشره الخدمات من تنبيهات يُجمع هنا، والأحدث أولاً.')}`;
}

/* ---------- H09-12 / H09-13 سجل أفعال المساعد ---------- */
/* الطفل والمراهق: ما يخصه ونُفّذ فعلاً فقط؛ الاقتراح الذي لم يقرره الأب، والمرفوض، لا يظهران له (Q-407). */
const agentDone = g => g.st !== 'بانتظارك' && g.st !== 'رُفض';
const agentSees = g => isOwner() || (S.persona === 'delegate' && can(g.need)) || (!isAdult() && g.kid === me().id && agentDone(g));
const agentKid = g => (g.st === 'تُرُوجع عنه' && g.ktu ? [g.ktu, g.kresu] : g.st.includes('نُفّذ') && g.ktd ? [g.ktd, g.kresd] : [g.kt, g.kres]);
const agentTone = g => (g.st.includes('نُفّذ') || g.st === 'تمّ' ? 'ok' : g.st === 'رُفض' || g.st === 'تُرُوجع عنه' ? '' : 'wa');
function agentLog() {
  const f = S.agF || 'all', L = S.agent.filter(agentSees).filter(g => f === 'all' || g.kid === f || g.kid === 'all');
  return `${!isOwner() ? `<div style="margin:0 2px 8px">${chip('ترين ما يخص صلاحياتكِ فقط', 'in', 'filter_alt')}</div>` : ''}<div class="fch"><button aria-pressed="${f === 'all'}" data-a="set:agF:all">الكل</button>${KIDS.map(id => `<button aria-pressed="${f === id}" data-a="set:agF:${id}">${av(M[id], 'sm')}${pname(M[id])}</button>`).join('')}</div>
  ${L.length ? list(L.map(g => row(g.st === 'بانتظارك' ? 'pending_actions' : g.st === 'محال' ? 'forward_to_inbox' : 'wand_stars', g.t, `${g.at} · ${g.gate}`, { a: `go:ai-act:${g.id}`, v: chip(g.st, agentTone(g)) }))) : `<div class="card flat c sm muted">لا أفعال للمساعد هنا</div>`}`;
}
surface('ai-act', {
  kind: 'sheet', t: 'فعل للمساعد', sys: 'S1-09', p: 'any', a: ['g3'], req: '09:18',
  note: 'تفصيل فعل واحد بخمسة أسئلة: ماذا فعل، بأي إذن، إلى ماذا استند، ما النتيجة، وكيف يُتراجع عنه. الدليل ملخّص بلا محتوى رسائل ولا صور. اسم القدرة التقني مخفي ويظهر اسمها بالعربية.',
  r(id) {
    const g = S.agent.find(x => x.id === id); if (!g || !agentSees(g)) return `<h4>لا يوجد فعل بهذا الوصف</h4><p class="d">ربما لم يعد من صلاحياتك.</p>${btn('حسناً', 'close')}`;
    const kid = !isAdult(), cap = g.cap || (AIK.find(x => x[0] === g.k) || [0, 'يساعد'])[1];
    return `<div class="fx" style="margin-bottom:10px"><span class="qi lg in">${ic('wand_stars')}</span><div><h4 style="margin:0">${kid ? agentKid(g)[0] : g.t}</h4><span class="sm muted">${g.at}${g.kid && g.kid !== 'all' && !kid ? ' · يخص ' + pname(M[g.kid]) : ''}</span></div></div>
    ${list(row('', 'ما نوع الفعل', '', { v: cap }), row('', kid ? 'من قرّر' : 'بأي إذن', '', { v: kid ? 'والدك' : g.gate }), row('', 'إلى ماذا استند', g.ev), row('', 'النتيجة', kid ? agentKid(g)[1] : g.res, { v: kid ? '' : chip(g.st, agentTone(g)) }))}
    ${kid ? '' : g.tid ? (t => !t ? `<p class="sm muted" style="margin:2px 4px 10px">لم تعد هذه المهمة قائمة.</p>` : `<p class="sm muted" style="margin:2px 4px 10px">${g.op === 'assign' ? (t.st === 'CANCELLED' ? 'أُلغيت هذه المهمة.' : 'التراجع عنه: إلغاء المهمة من صفحتها، لأي بالغ يملك مهام ' + pname(M[t.kid]) + '.') : g.st === 'محال' ? (t.st === 'SUBMITTED' ? 'لم يودِع المساعد شيئاً. القرار لك في مراجعة التسليم.' : 'لم يودِع المساعد شيئاً، وقد حُسم التسليم بعدها.') : t.vf === 'ai' && t.st === 'APPROVED' ? 'التراجع عنه: «ألغِ التحقق» من صفحة المهمة، في يومه فقط، وللمالك وحده.' : 'تغيّرت حال المهمة بعد هذا الفعل. صفحتها تعرض ما هي عليه الآن.'}</p>${btn(g.st === 'محال' && t.st === 'SUBMITTED' ? 'راجع التسليم' : 'افتح المهمة', `go:${g.st === 'محال' && t.st === 'SUBMITTED' ? 'task-review' : 'task'}:${t.id}`, 'sec', 'arrow_back')}`)(S.tasks.find(x => x.id === g.tid)) : g.undo ? btn('تراجع عن هذا الفعل', `aiUndo:${g.id}`, 'sec', 'undo') : `<p class="sm muted" style="margin:2px 4px 10px">${g.st === 'بانتظارك' ? 'لم يُنفَّذ شيء بعد. القرار لك من بطاقة الاقتراح في الرئيسية.' : 'لا شيء يُتراجع عنه: هذا الفعل لم يغيّر إعداداً ولا بيانات.'}</p>`}
    ${btn(kid ? 'حسناً' : 'إغلاق', 'close', kid ? '' : 'txt')}`;
  },
});
surface('ai-mine', {
  t: 'المساعد وأنا', sys: 'S1-09', p: 'kid', req: '09:18',
  note: 'شفافية للطفل والمراهق: يرى من سجل المساعد ما يخصه هو ونُفّذ فعلاً، بكلمات على قدّه، وبلا أي إجراء. اقتراح لم يقرره الأب بعد، أو رفضه، لا يظهر.',
  r() { const L = S.agent.filter(agentSees);
    return `${callout('المساعد يساعد والدك في ترتيب أمور العائلة. لا يغيّر شيئاً يخصك دون أن يوافق والدك. هنا ترى ما فعله بخصوصك.', '', 'wand_stars')}${L.length ? list(L.map(g => row('wand_stars', agentKid(g)[0], g.at, { a: `go:ai-act:${g.id}` }))) : empty('wand_stars', 'لا شيء بعد', 'عندما يفعل المساعد شيئاً يخصك يظهر هنا.')}`; },
});

/* ---------- H09-14 البحث الشامل في الإعدادات ---------- */
function gsIndex() {
  const own = isOwner(), I = [];
  const add = (t, s, a, syn, i) => I.push({ t, s, a, i: i || 'settings', q: norm(t + ' ' + s + ' ' + (syn || '')) });
  add('العائلة', 'الاسم والبلد والتوقيت', 'go:family-settings', 'اسم العائله بلد دوله منطقه زمنيه حذف العائله', 'family_home');
  add('الأعضاء', 'أفراد العائلة ودعوة فرد', 'tab:family', 'افراد اطفال اضافه طفل دعوه زوجه ام', 'groups');
  if (own) add('قائمة الإعداد الأولي', 'ما بقي من إعداد العائلة', 'go:checklist', 'اكمل اعداد عائلتك بدايه خطوات', 'checklist');
  if (own) add('الخدمات', 'خدمات التطبيق وحالتها', 'go:registry', 'انظمه', 'widgets');
  add('القوالب', 'قوالب العرض والأدوار الجاهزة', 'go:templates', 'قالب عمر مبسط مراهق', 'view_agenda');
  add('الموافقات والاستثناءات', 'ما ينتظر قرارك', 'go:alerts', 'طلبات تنبيهات اشعارات وقت اضافي', 'pending_actions');
  if (can('protection.rule.view')) add('القواعد', 'الحماية ووقت الشاشة', 'go:protection', 'حمايه حظر تطبيقات', 'rule');
  if (own || can('roles.audit.view')) add('التدقيق', 'من غيّر ماذا ومتى', 'go:audit', 'سجل تغييرات تاريخ', 'receipt_long');
  add('الخصوصية والبيانات', 'تصدير · حذف · شفافية', 'go:privacy', 'تنزيل بياناتي نسخه حذف حسابي', 'privacy_tip');
  if (can('hub.plan.view')) add('الخطة والفوترة', 'خطتك وما استُهلك منها', 'go:plan', 'اشتراك باقه دفع فلوس ترقيه رصيد رسائل', 'workspace_premium');
  add('الأمان', 'الرقم السري والبصمة وأجهزتي', 'go:security', 'كلمه السر رمز قفل بصمه فقدت الهاتف', 'security');
  add('المساعد الذكي', 'ما يفعله وما لا يفعله', 'go:ai', 'ذكاء اصطناعي اقتراحات', 'wand_stars');
  add('اللغة والعرض', 'العربية · حجم النص · الوضع الداكن', 'go:display', 'انجليزي خط كبير داكن ليلي', 'translate');
  add('البيانات والمزامنة', 'ما ينتظر الإرسال', 'go:outbox', 'انترنت اتصال توفير', 'sync');
  add('المساعدة والدعم', 'أسئلة شائعة · راسلنا', 'go:help', 'مشكله تواصل', 'contact_support');
  if (own) add('الأدوار', 'أدوار البالغين الجاهزة', 'go:roles', 'شريك وصي مراقب صلاحيات تفويض', 'handshake');
  if (can('location.view')) add('جهات الطوارئ', 'من يصله تنبيه الاستغاثة', 'go:emergency', 'استغاثه طوارئ رقم قريب جار', 'contact_emergency');
  if (can('location.sos.acknowledge')) add('تنبيهات الاستغاثة', 'الحالية والسابقة', 'go:sos-log', 'نداء خطر طوارئ', 'sos');
  if (own) SVC.forEach(s => add(s.n, 'خدمة · ' + s.d, 'go:svc:' + s.id, '', s.i));
  CTL.filter(c => svcOn(c.s) && can(c.k)).forEach(c => add(c.t, `إعداد · ${svcOf(c.s).n}`, 'ctlFind:' + c.id, c.d + ' ' + c.syn, 'tune'));
  return I;
}
function gsRun(v) {
  const q = norm(v.trim()), out = document.getElementById('gsOut'), body = document.getElementById('gsBody'); if (!out || !body) return;
  if (!q) { out.hidden = true; body.hidden = false; out.innerHTML = ''; return; }
  const W = q.split(/\s+/).map(w => (w.length > 3 ? w.replace(/^ال/, '') : w)), R = gsIndex().filter(e => W.every(w => e.q.includes(w))).slice(0, 12);
  body.hidden = true; out.hidden = false;
  out.innerHTML = R.length ? `<div class="list">${R.map(e => row(e.i, e.t, e.s, { a: e.a })).join('')}</div>` : empty('search_off', 'لا نتيجة', 'جرّب كلمة أخرى، مثل: النوم، الموقع، الرقم السري.');
}
document.addEventListener('input', e => { const el = e.target.closest && e.target.closest('[data-gs]'); if (el) gsRun(el.value); });
