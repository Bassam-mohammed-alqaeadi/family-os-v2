/* ============ التعارض بين ما يحفظه الأهل (Q-419) ============
   القاعدة: لا يُحفظ شيء متعارض بصمت. كاشف واحد وبطاقة واحدة لكل الأنظمة.
   - عند الحفظ: نحسب ما سيحدث لو حُفظ التعديل (cfScan على نسخة فيها التعديل)، فإن ظهر تعارض جديد يمسّ ما يُحفظ
     فُتحت ورقة «conflict» قبل أن يُحفظ شيء: الطرفان باسميهما، ما سيحدث فعلاً، وحلول بضغطة.
   - مستويان: block يمنع الحفظ (نافذتان متداخلتان، اسم وضع مكرر) · warn يُحفظ إن اختار «احفظ كما هو» ويبقى عليه وسم «متعارض».
   - ما يظهر لاحقاً بلا بطاقة (حذف، تراجع، مهمة أضافها المراهق لنفسه، أو بالغ آخر أبقاه) يصل المالك في «يتطلب انتباهك».
   نص «ما سيحدث» مشتق من ترتيب القواعد نفسه الذي يقرأه decide()، لا من افتراض. */
const CF_WEB = { tt: ['tiktok.com', 19], ytk: ['youtubekids.com', 6], mc: ['minecraft.net', 8], pubg: ['pubgmobile.com', 8], wa: ['whatsapp.com', 2] };   /* موقع التطبيق وفئته في تصفية الويب */
const cfOkAll = () => S.cfOk || (S.cfOk = {});
const cfCat = id => WCAT.find(c => c[0] === id);
const cfHm = s => +String(s).slice(0, 2) * 60 + +String(s).slice(2);
const cfHm4 = m => String(Math.floor(m / 60)).padStart(2, '0') + String(m % 60).padStart(2, '0');
const cfGr = (kid, aid) => RW().gt.filter(g => g.kid === kid && g.app === aid).reduce((s, g) => s + g.n, 0);   /* ما مُنح اليوم ليس من الحد نفسه */
const cfLims = (kid, a) => (a.limD ? a.limD.slice() : Array(7).fill(a.nx ? a.lim : a.lim - cfGr(kid, a.id)));
const cfWinAt = (W, d, m) => W.find(w => spans(w).some(([a, b]) => hitWk(a, b, d * 1440 + m, d * 1440 + m + 1)));
const cfRng = w => `${hm(t2m(w.s))} – ${hm(t2m(w.e))}`;
const cfOne = (L, a, b) => (L.length === 1 ? a : b);
const cfV = (kid, p = {}) => ({ kid, apps: p.apps || S.apps[kid], q: p.q || qOf(kid), W: p.W || S.sched[kid], rank: p.rank || rankOf(kid), wc: p.wc || S.wfc[kid], dom: p.dom || S.wdom[kid], modes: p.modes || S.modes, tasks: p.tasks || S.tasks, events: p.events || S.events, p });
const cfWebAct = (v, aid) => { const w = CF_WEB[aid], x = v.dom.find(d => d.d === w[0]); return x ? x.a : v.wc[w[1]] || wDef(w[1]); };

/* ---------- الأطراف: كل طرف باسمه وتفصيله وطريق تعديله ---------- */
const cfP = (ids, i, n, d, go, lb, pk) => ({ ids, i, n, d, go, lb, pk });
const cfRuleT = (kid, a) => (a.act === 'LIMIT' ? (a.limD ? 'حدّ يومي يختلف بالأيام' : `حدّ يومي ${cfLims(kid, a)[0]} د`) : a.act === 'BLOCK' ? 'محظور' : a.act === 'ALLOW' ? 'مسموح دائماً' : 'بلا قاعدة');
const cfPApps = (kid, L, d) => (L.length === 1 ? cfP(['app.' + L[0].id], L[0].i, L[0].n, d || cfRuleT(kid, L[0]), `app-rule:${kid}:${L[0].id}`, `عدّل قاعدة ${L[0].n}`, 'protection.rule.edit') : cfP(L.map(a => 'app.' + a.id), 'apps', 'قواعد التطبيقات', anames(L), `apps:${kid}`, 'افتح التطبيقات', 'protection.rule.view'));
const cfPRank = (kid, r) => cfP(['rank'], 'swap_vert', 'ترتيب القواعد', r.map(k => RANK[k][0]).join(' ← '), `priority:${kid}`, `رتّب قواعد ${kn(kid)}`, 'protection.priority.edit');
const cfPQuota = (kid, v, day) => cfP(['quota'], 'hourglass_top', 'الحصة اليومية', `${v} دقيقة${day == null ? ' في اليوم' : ' · ' + DAYN[day]}`, `quota:${kid}`, 'عدّل الحصة', 'protection.quota.edit');
const cfPWin1 = (kid, w, ids) => cfP(ids || ['win.' + w.id], WT[w.type][1], w.type === 'sleep' ? 'وقت النوم' : 'وقت المدرسة', `${daysTxt(w.days)} · ${winRange(w)}`, `schedule:${kid}`, 'عدّل الجدول', 'protection.schedule.edit');
const cfPWin = (kid, W, ty) => { const L = W.filter(w => w.type === ty); return cfPWin1(kid, L[0], L.map(w => 'win.' + w.id)); };
const cfPWeb = (kid, v, aid) => { const w = CF_WEB[aid], x = v.dom.find(d => d.d === w[0]), act = cfWebAct(v, aid); return cfP(['web'], 'travel_explore', 'تصفية الويب', x ? `استثناء الموقع: ${WACT[act][0]}` : `فئة «${cfCat(w[1])[1]}»: ${WACT[act][0]}`, `${x ? 'web-domains' : 'webfilter'}:${kid}`, 'عدّل تصفية الويب', 'protection.filter.edit'); };
const cfPMode = m => cfP(['mode.' + m.id], m.i, MODE0[m.id] ? m.n : `وضع «${m.n}»`, modeShort(m), MODE0[m.id] ? '' : `mode-edit:${m.id}`, 'عدّل الوضع', 'protection.rule.edit');
const cfPStudy = kid => cfP(['study'], 'school', 'تطبيقات الدراسة', 'لم تُختر بعد', `study-apps:${kid}`, 'اختر تطبيقات الدراسة', 'protection.rule.edit');
const cfTaskDays = t => (tkRR(t) === 'none' ? [tkDt(tkDk(t)).getDay()] : tkWd(t));
const cfPTask = t => cfP(['task.' + t.id], 'task_alt', `مهمة «${t.t}»`, `${tkRR(t) === 'none' ? tkDayT(tkDk(t)) : tkRepT(tkRR(t), tkWd(t))} · ${tkTm(t.hm)}`, `task-new:${t.id}`, `عدّل «${t.t}»`, 'tasks.create');
const cfPEv = e => cfP(['ev.' + e.id], 'event', `حدث «${e.t}»`, `${tkDayT(e.dk)} · ${tkTm(e.hm)}`, `tkEvEdit:${e.id}`, `عدّل «${e.t}»`, 'calendar.event.create');

/* وقت بديل لمهمة يخرجها من النافذة: قبل بدء النوم إن كانت مساءً، أو بعد نهاية النافذة. يرجع دقائق أو null */
function cfMove(W, D, m, w) {
  const s = t2m(w.s), e = t2m(w.e), eve = e <= s ? m >= s : true;
  const c = w.type === 'sleep' && eve ? Math.floor((s - 30) / 30) * 30 : Math.ceil(e / 30) * 30;
  return c >= 300 && c <= 1380 && D.every(d => !cfWinAt(W, d, c)) ? c : null;
}
/* حدثان لشخص واحد في الوقت نفسه (أقل من ساعة بينهما). لا مدة للحدث في البيانات، فالمقارنة ببدايتيهما. */
function cfEvPairs(E) {
  const X = [];
  for (let i = 0; i < E.length; i++) for (let j = i + 1; j < E.length; j++) {
    let a = E[i], b = E[j]; if (a.id > b.id) [a, b] = [b, a];
    const who = a.who === b.who ? a.who : a.who === 'all' ? b.who : b.who === 'all' ? a.who : '';
    if (!who) continue; const day = tkEvOn(a, b.dk) ? b.dk : tkEvOn(b, a.dk) ? a.dk : ''; if (!day) continue;
    const dl = Math.abs(cfHm(a.hm) - cfHm(b.hm)); if (dl >= 60) continue;
    const last = [a, b].every(e => !e.rr || e.rr === 'none') ? day : TK_END; if (last < TK_TODAY) continue;
    const m = M[who], nm = who === 'all' ? 'العائلة كلها' : pname(m);
    X.push({ k: `ev2.${a.id}.${b.id}`, kid: who, tier: 'warn', ti: `حدثان ل${who === 'all' ? 'لعائلة' : nm} في الوقت نفسه`, a: cfPEv(a), b: cfPEv(b), fix: [],
      fx: `«${a.t}» ${tkTm(a.hm)} و«${b.t}» ${tkTm(b.hm)} ${tkDayT(day)}${dl ? `، يفصل بينهما ${dl} دقيقة فقط` : ''}. ${who === 'all' ? 'لا تحضر العائلة الاثنين معاً' : `لا ${vb(m, 'يستطيع', 'تستطيع')} ${nm} حضور الاثنين`}.` });
  }
  return X;
}
/* استثناء موقع بضغطة: يفوز على فئته (REQ-029). يرجع دالة التراجع. */
function cfDom(kid, d, a) { const was = S.wdom[kid].slice(), un = () => { S.wdom[kid] = was; render(); }; S.wdom[kid] = was.filter(x => x.d !== d).concat([{ d, a }]); xaud(`استثناء موقع ل${M[kid].n}: ${d} ← ${WACT[a][0]}`, 'protection.filter.edit', kid, 'web', un); return un; }

/* ---------- الكاشف: كل التعارضات القائمة عند طفل، على الحالة كما هي أو على نسخة فيها تعديل لم يُحفظ ---------- */
function cfScan(kid, p) {
  const v = cfV(kid, p), k = M[kid], n = kn(kid), R = v.rank, iA = R.indexOf('app'), iQ = R.indexOf('quota'), A = v.apps, X = [];
  const add = (key, ti, a, b, fx, fix) => X.push({ k: key, kid, tier: 'warn', ti, a, b, fx, fix: fix || [] });
  const ruled = A.filter(a => a.act);
  /* 1) الحصة فوق قواعد التطبيقات: الحصة تحسم قبل أن يُنظر إلى أي قاعدة */
  if (iQ < iA && ruled.length) {
    const bl = ruled.filter(a => a.act === 'BLOCK'), li = ruled.filter(a => a.act === 'LIMIT'), al = ruled.filter(a => a.act === 'ALLOW'), T = [];
    if (bl.length) T.push(`${anames(bl)} ${cfOne(bl, 'محظور، لكنه سيُفتح', 'محظورة، لكنها ستُفتح')} عند ${n} ما دام في الحصة اليومية وقت`);
    if (li.length) T.push(`${cfOne(li, 'حدّ', 'حدود')} ${anames(li)} ${cfOne(li, 'لن يعمل', 'لن تعمل')}: ${cfOne(li, 'يُفتح', 'تُفتح')} ما دام في الحصة وقت`);
    if (al.length) T.push(`${anames(al)} ${cfOne(al, 'مسموح دائماً، لكنه سيُغلق', 'مسموحة دائماً، لكنها ستُغلق')} حين تنفد الحصة`);
    add('dead', 'قواعد التطبيقات لا تعمل', cfPApps(kid, ruled), cfPRank(kid, R), T.join('. ') + '. السبب: الحصة اليومية فوق قواعد التطبيقات في الترتيب.');
  }
  /* 2) وقت النوم أو المدرسة ليس الحاسم في الترتيب */
  ['sleep', 'school'].forEach(ty => {
    if (!v.W.some(w => w.type === ty)) return; const iT = R.indexOf(ty), tn = WTN[ty];
    if (iQ < iT) add('rank.' + ty, `وقت ${tn} لا يغلق التطبيقات`, cfPWin(kid, v.W, ty), cfPRank(kid, R), `في وقت ${tn} تُفتح ${ty === 'school' ? 'كل ' : ''}التطبيقات عند ${n} ما دام في الحصة اليومية وقت: الحصة فوق ${tn} في الترتيب.`);
    else if (iA < iT) { const L = ruled.filter(a => a.act !== 'BLOCK' && (ty === 'sleep' || !a.study)); if (L.length) add('rank.' + ty, `تطبيقات تُفتح في وقت ${tn}`, cfPWin(kid, v.W, ty), cfPRank(kid, R), `${anames(L)} ${cfOne(L, 'يُفتح', 'تُفتح')} عند ${n} في وقت ${tn}${ty === 'school' ? ` ولو لم ${cfOne(L, 'يكن تطبيق', 'تكن تطبيقات')} دراسة` : ''}: قواعد التطبيقات فوق ${tn} في الترتيب.`); }
  });
  /* 3) حدّ تطبيق أكبر من الحصة: التطبيق الذي له حدّ يتبع حدّه، فلا توقفه الحصة */
  if (iA < iQ) ruled.filter(a => a.act === 'LIMIT').forEach(a => {
    const L = cfLims(kid, a), D = [0, 1, 2, 3, 4, 5, 6].filter(d => L[d] > v.q[d]); if (!D.length) return;
    const d = D.includes(NOW.d) ? NOW.d : D[0], lo = Math.min(...D.map(x => v.q[x])), per = !!a.limD;
    add('lim.' + a.id, `حدّ ${a.n} أكبر من الحصة`, cfPApps(kid, [a], `حدّ يومي ${L[d]} د`), cfPQuota(kid, v.q[d], D.length === 7 ? null : d),
      `حدّ ${a.n} (${L[d]} د) أكبر من حصة ${n} اليومية (${v.q[d]} د)${D.length === 7 ? '' : D.length === 1 ? ` يوم ${DAYN[d]}` : ` في ${D.length} أيام منها ${DAYN[d]}`}. سيُفتح ${L[d]} دقيقة كاملة ولن توقفه الحصة: التطبيق الذي له حدّ يتبع حدّه.`,
      [{ t: per ? 'اجعل الحد بقدر الحصة' : `اجعل الحد ${lo} د`, p: 'app.' + a.id, pk: 'protection.rule.edit', run() { const r = appOf(kid, a.id), was = { lim: r.lim, limD: r.limD }, un = () => { r.lim = was.lim; r.limD = was.limD; render(); }; if (r.limD) { r.limD = r.limD.map((x, i) => Math.min(x, v.q[i])); r.lim = r.limD[NOW.d] + cfGr(kid, a.id); } else r.lim = lo + cfGr(kid, a.id); xaud(`عُدّلت قاعدة ${a.n} لـ${M[kid].n}: الحد بقدر الحصة`, 'protection.rule.edit', kid, 'rule', un); return un; } },
       { t: per ? 'ارفع الحصة بقدر الحد' : `ارفع الحصة إلى ${L[d]} د`, p: 'quota', pk: 'protection.quota.edit', run() { const s = S.kid[kid], was = { quota: s.quota, qD: s.qD }, un = () => { s.quota = was.quota; s.qD = was.qD; render(); }; s.qD = v.q.map((x, i) => Math.max(x, L[i])); s.quota = s.qD[NOW.d]; xaud(`عُدّلت حصة ${M[kid].n} اليومية: رُفعت بقدر حدّ ${a.n}`, 'protection.quota.edit', kid, 'rule', un); return un; } }]);
  });
  /* 4) قاعدة التطبيق وتصفية الويب تقولان شيئين */
  ruled.forEach(a => {
    const w = CF_WEB[a.id]; if (!w) return; const act = cfWebAct(v, a.id), cn = cfCat(w[1])[1], ex = v.dom.some(d => d.d === w[0]), site = `<span class="ltr">${w[0]}</span>`;
    if (a.act === 'BLOCK' && act !== 'BLOCK') add('web.' + a.id, `${a.n} محظور وموقعه مفتوح`, cfPApps(kid, [a]), cfPWeb(kid, v, a.id), `${a.n} محظور كتطبيق عند ${n}، لكن موقعه ${site} يُفتح في المتصفح: ${ex ? 'له استثناء يفتحه' : `فئة «${cn}» ${act === 'ALERT' ? 'عليها تنبيه فقط' : 'مسموحة'}`}.`,
      [{ t: 'احظر موقعه أيضاً', p: 'dom', pk: 'protection.filter.edit', run: () => cfDom(kid, w[0], 'BLOCK') }]);
    if (a.act !== 'BLOCK' && act === 'BLOCK') add('web.' + a.id, `${a.n} مسموح وموقعه محجوب`, cfPApps(kid, [a]), cfPWeb(kid, v, a.id), `${a.n} ${a.act === 'LIMIT' ? 'له حدّ يومي' : 'مسموح دائماً'} عند ${n}، لكن تصفية الويب تحجب موقعه ${site}: ${ex ? 'عليه استثناء يحظره' : `فئة «${cn}» محظورة`}. يُفتح التطبيق، وقد لا يعمل فيه ما يحتاج الموقع.`,
      [{ t: 'اسمح بموقعه', p: 'dom', pk: 'protection.filter.edit', run: () => cfDom(kid, w[0], 'ALLOW') }]);
  });
  /* 5) وضع خاص يفتح تطبيقاً محظوراً عند هذا الطفل: المحظور يبقى مغلقاً في كل وضع */
  v.modes.filter(m => m.open === 'list').forEach(m => {
    const L = A.filter(a => m.apps.includes(a.id) && a.act === 'BLOCK'); if (!L.length) return;
    add('mode.' + m.id, `وضع «${m.n}» يفتح تطبيقاً محظوراً`, cfPMode(m), cfPApps(kid, L), `وضع «${m.n}» يفتح ${anames(L)}، و${cfOne(L, 'هو محظور', 'هي محظورة')} عند ${n}: ${cfOne(L, 'سيبقى مغلقاً', 'ستبقى مغلقة')} على جهاز${vb(k, 'ه', 'ها')} حين تطبّق الوضع.`);
  });
  /* 6) وقت مدرسة بلا تطبيقات دراسة */
  if (v.W.some(w => w.type === 'school') && R.indexOf('school') < iQ && !A.some(a => a.study && a.act !== 'BLOCK')) add('study', 'وقت المدرسة يغلق كل شيء', cfPWin(kid, v.W, 'school'), cfPStudy(kid), `في وقت المدرسة يُغلق كل شيء على جهاز ${n}: لم تُختر ${vb(k, 'له', 'لها')} تطبيقات دراسة.`);
  /* 7) موعد مهمة داخل وقت النوم أو المدرسة (مهمة الدراسة لا تتعارض مع وقت المدرسة) */
  v.tasks.filter(t => t.kid === kid && t.hm && t.st === 'PENDING').forEach(t => {
    const D = cfTaskDays(t), m = cfHm(t.hm); let w = null, d0 = 0;
    for (const d of D) { const x = cfWinAt(v.W, d, m); if (x && !(x.type === 'school' && t.cat === 'school')) { w = x; d0 = d; break; } }
    if (!w) return; const sl = w.type === 'sleep', eve = t2m(w.e) <= t2m(w.s) ? m >= t2m(w.s) : true, rem = +t.rem || 0, ring = sl && rem < 1440 && cfWinAt(v.W, d0, m - rem) === w, c = cfMove(v.W, D, m, w), self = 'task.' + t.id;
    add(self, sl ? 'موعد مهمة في وقت النوم' : 'موعد مهمة في وقت المدرسة', cfPTask(t), cfPWin1(kid, w),
      sl ? `موعد «${t.t}» ${tkTm(t.hm)} يقع في وقت نوم ${n} (${cfRng(w)})${eve ? `. عملياً ${vb(k, 'عليه أن يسلّمها', 'عليها أن تسلّمها')} قبل ${hm(t2m(w.s))}` : `: ${vb(k, 'هو نائم', 'هي نائمة')} حينها بحسب الجدول`}${ring ? '، والتذكير سيرنّ في وقت النوم' : ''}.`
         : `موعد «${t.t}» ${tkTm(t.hm)} يقع في وقت مدرسة ${n} (${cfRng(w)}): ${vb(k, 'هو', 'هي')} في المدرسة حينها، وجهاز${vb(k, 'ه', 'ها')} لا يفتح إلا تطبيقات الدراسة.`,
      c == null ? [] : [{ t: `اجعل الموعد ${hm(c)}`, p: self, pk: 'tasks.create', draft: v.p.setHm && v.p.self === self ? () => v.p.setHm(cfHm4(c)) : null,
        run() { const r = tkT(t.id), was = { hm: r.hm, due: r.due }, un = () => { r.hm = was.hm; r.due = was.due; render(); }; r.hm = cfHm4(c); r.due = `${tkDayT(tkDk(r))} ${tkTm(r.hm)}`; audit(`تعديل موعد مهمة «${r.t}» إلى ${tkTm(r.hm)}`, 'tasks.create'); return un; } }]);
  });
  /* 8) حدث للطفل في وقت نومه، وحدثان له في الوقت نفسه. أحداث وقت المدرسة لا تُعدّ تعارضاً: أغلبها في المدرسة نفسها. */
  v.events.filter(e => e.who === kid && (e.dk >= TK_TODAY || (e.rr && e.rr !== 'none'))).forEach(e => {
    const w = cfWinAt(v.W, tkDt(e.dk).getDay(), cfHm(e.hm)); if (!w || w.type !== 'sleep') return;
    add('ev.' + e.id, 'حدث في وقت النوم', cfPEv(e), cfPWin1(kid, w), `«${e.t}» ${tkDayT(e.dk)} ${tkTm(e.hm)} يقع في وقت نوم ${n} (${cfRng(w)}): تطبيقات جهاز${vb(k, 'ه', 'ها')} مغلقة حينها.`);
  });
  cfEvPairs(v.events).forEach(c => { if (c.kid === kid) X.push(c); });
  return X;
}
const cfHas = (c, id) => c.a.ids.includes(id) || c.b.ids.includes(id);
const cfKey = c => c.kid + '|' + c.k;
const cfAll = () => [...KIDS.flatMap(k => cfScan(k)), ...cfEvPairs(S.events).filter(c => !KIDS.includes(c.kid))];
function cfSweep() { const live = new Set(cfAll().map(cfKey)), O = cfOkAll(); Object.keys(O).forEach(k => { if (!live.has(k)) delete O[k]; }); }
/* التعارضات الجديدة التي يمسّها هذا الحفظ. ما كان قائماً وأُبقي من قبل لا يُسأل عنه ثانية. */
function cfNew(kids, mk, self) { const O = cfOkAll(); return kids.flatMap(kid => { const had = new Set(cfScan(kid).map(c => c.k)); return cfScan(kid, Object.assign({ self }, mk(kid))).filter(c => cfHas(c, self) && !(had.has(c.k) && O[cfKey(c)])); }); }

/* ---------- تعارضان لحظيان: لا يبقيان بعد الفعل، فلا وسم لهما ---------- */
/* منح وقت لتطبيق مغلق الآن بوقت النوم أو المدرسة أو بوضع سارٍ */
function cfGrantNow(kid, aid, n) {
  const a = appOf(kid, aid); if (!a || fmOf(kid)) return []; const k = M[kid], nm = kn(kid), m = modeAct(kid), R = rankOf(kid), me1 = cfP(['grant'], 'more_time', 'الوقت الإضافي', `${a.n} · ${n} دقيقة · حتى منتصف الليل`);
  const mk = (b, fx) => [{ k: 'grant', kid, tier: 'warn', once: 1, ti: 'الوقت الممنوح لن يُستعمل الآن', a: me1, b, fx, fix: [] }];
  if (m) { if (!(m.open === 'none' || (m.open === 'study' && !a.study) || (m.open === 'list' && !m.apps.includes(aid)))) return [];
    return mk(cfP(['mode.' + m.id], m.i, MODE0[m.id] ? m.n : `وضع «${m.n}»`, `سارٍ حتى ${S.pm[kid].until}`, 'presets:' + m.id, 'افتح الأوضاع', 'protection.mode_preset.apply'), `${modeQ(m.id)} سارٍ عند ${nm} حتى ${S.pm[kid].until} ولا يفتح ${a.n}. الدقائق تُضاف، لكن ${vb(k, 'لن يستعملها', 'لن تستعملها')} حتى ينتهي الوضع.`); }
  const ty = schedNow(kid); if (!ty || (ty === 'school' && a.study)) return []; const iT = R.indexOf(ty); if (!(iT < R.indexOf('app') && iT < R.indexOf('quota'))) return [];
  const t = NOW.d * 1440 + NOW.m; let w = null, endIn = 0;
  S.sched[kid].forEach(x => { if (x.type === ty) spans(x).forEach(([s, e]) => [0, WK, -WK].forEach(sh => { if (!w && s + sh <= t && t < e + sh) { w = x; endIn = e + sh - t; } })); });
  if (!w) return []; const end = hm(t2m(w.e)), lost = endIn >= 1440 - NOW.m;
  return mk(cfPWin1(kid, w), ty === 'sleep' ? `الآن وقت نوم ${nm} (حتى ${end}). الدقائق تُضاف، لكن ${a.n} لن يُفتح في وقت النوم${lost ? `، والوقت الإضافي ينتهي عند منتصف الليل قبل أن ${vb(k, 'يستيقظ: لن يستعمله', 'تستيقظ: لن تستعمله')}` : ''}.`
    : `الآن وقت مدرسة ${nm} (حتى ${end}). ${a.n} ليس تطبيق دراسة فلن يُفتح الآن. ${vb(k, 'يستعمل', 'تستعمل')} الدقائق بعد ${end} وحتى منتصف الليل.`);
}
/* تطبيق وضع لا يفتح شيئاً عند هذا الطفل */
function cfApply(mk, kid) {
  const m = modeOf(mk); if (!m) return []; const A = S.apps[kid], nm = kn(kid), k = M[kid], pm = cfP(['mode.' + m.id], m.i, MODE0[m.id] ? m.n : `وضع «${m.n}»`, modeShort(m), MODE0[m.id] ? '' : `mode-edit:${m.id}`, 'عدّل الوضع', 'protection.rule.edit'), dev = `جهاز${vb(k, 'ه', 'ها')}`;
  const one = (ti, b, fx) => [{ k: 'apply.' + kid, kid, tier: 'warn', once: 1, ti, a: pm, b, fx, fix: [] }];
  if (m.open === 'study' && !A.some(a => a.study && a.act !== 'BLOCK')) return one(`${m.n} يغلق كل شيء عند ${nm}`, cfPStudy(kid), `لم تُختر تطبيقات دراسة ل${nm}: ${m.n} سيغلق كل التطبيقات على ${dev} طول مدته.`);
  if (m.open === 'list' && !A.some(a => m.apps.includes(a.id) && a.act !== 'BLOCK')) { const bl = A.filter(a => m.apps.includes(a.id));
    return one(`وضع «${m.n}» لا يفتح شيئاً عند ${nm}`, bl.length ? cfPApps(kid, bl) : cfP(['dev'], 'devices', `جهاز ${nm}`, 'لا تطبيق من هذا الوضع عليه'), bl.length ? `${anames(bl)} ${cfOne(bl, 'محظور', 'محظورة')} عند ${nm}، ولا تطبيق آخر من الوضع على ${dev}: سيُغلق كل شيء طول مدته.` : `لا تطبيق من تطبيقات الوضع على جهاز ${nm}: سيُغلق كل شيء طول مدته.`); }
  return [];
}
/* نافذتان متداخلتان: المستوى المانع. يرجع تعارضاً بحلّ بضغطة (قصّ النافذة عند حدّ الأخرى) أو null */
function cfClash(kid, w) {
  const txt = w.days.length ? winClash(kid, w) : ''; if (!txt) return null; const mine = spans(w); let o = null, h = null, x = null;
  for (const q of S.sched[kid]) { if (q.id === w.id) continue; for (const a of mine) for (const b of spans(q)) { const r = hitWk(a[0], a[1], b[0], b[1]); if (r && !o) { o = q; h = r; x = a; } } }
  const self = cfP(['win.' + w.id], WT[w.type][1], w.type === 'sleep' ? 'هذه النافذة · نوم' : 'هذه النافذة · مدرسة', `${daysTxt(w.days)} · ${winRange(w)}`), fix = [];
  if (o) { if (h[0] > x[0]) fix.push({ t: `اجعلها تنتهي ${hm(h[0])}`, a: `cfWd:e:${cfHm4(((h[0] % 1440) + 1440) % 1440)}` }); else if (h[1] < x[1]) fix.push({ t: `اجعلها تبدأ ${hm(h[1])}`, a: `cfWd:s:${cfHm4(((h[1] % 1440) + 1440) % 1440)}` }); fix.push({ t: 'افتح الأخرى وعدّلها', a: `winOpen:${kid}:${o.id}`, cls: 'sec' }); }
  return { k: 'clash', kid, tier: 'block', ti: 'نافذتان متداخلتان — صحّح التداخل', a: self, b: o ? cfPWin1(kid, o) : self, fx: `${txt}. لا تُحفظ نافذتان في الوقت نفسه: لا يُعرف أيهما تحكم الجهاز.`, fix };
}

/* ---------- البطاقة الواحدة: الطرفان، ما سيحدث، الحلول ---------- */
/* o.mode: save (داخل ورقة الحفظ، برقم البطاقة i وطرف الحفظ self) · page (صفحة التعارضات) · inline (داخل محرر) */
function cfFixes(c, o) {
  const F = [], sv = o.mode === 'save', may = f => !f.pk || can(f.pk, KIDS.includes(c.kid) ? c.kid : undefined);
  c.fix.forEach((f, j) => { if (!may(f)) return; if (f.a) return F.push({ t: f.t, a: f.a, cls: f.cls || 'ton' }); if (o.mode === 'inline' && (!o.nav || (f.p === o.self && !o.own))) return;
    if (sv && ((f.p === o.self && !f.draft) || f.p === o.hide)) return; F.push({ t: f.t, a: sv ? `cfFix:${o.i}:${j}` : `cfDo:${c.kid}:${c.k}:${j}`, cls: 'ton' }); });
  if (o.mode !== 'inline' || o.nav) ['a', 'b'].forEach(s => { const x = c[s]; if (!x.go || x.ids.includes(o.self) || !may(x) || (s === 'b' && c.b === c.a)) return; F.push({ t: x.lb, a: sv ? `cfOpen:${o.i}:${s}` : `cfNav:${c.kid}:${c.k}:${s}`, cls: 'sec' }); });
  if (o.mode === 'page' && !cfOkAll()[cfKey(c)]) F.push({ t: 'أبقِه كما هو', a: `cfOkSet:${c.kid}:${c.k}`, cls: 'txt' });
  return F;
}
function cfCard(c, o = {}) {
  const P = x => `<div class="cfx"><b>${ic(x.i)}<span>${x.n}</span></b><small>${x.d}</small></div>`, F = cfFixes(c, o), ok = cfOkAll()[cfKey(c)], blk = c.tier === 'block';
  return `<div class="cfc ${blk ? 'blk' : ''}" data-cf="${c.k}"><div class="cfh">${ic(blk ? 'error' : 'warning')}<b>${c.ti}</b>${blk ? chip('يمنع الحفظ', 'da') : ''}</div>
  <div class="cfp">${P(c.a)}<span class="cfv">مع</span>${P(c.b)}</div><p class="cfe"><b>ما سيحدث:</b> ${c.fx}</p>
  ${o.mode === 'page' || o.nav ? `<p class="cfs">${ok ? `${ic('person')}${vb(M[ok.by], 'أبقاه', 'أبقته')} ${M[ok.by].n} كما هو · ${ok.at}` : `${ic('pending')}لم يقرّر أحد فيه بعد`}</p>` : ''}${F.length ? `<div class="cff">${F.map(f => btn(f.t, f.a, 'sm ' + f.cls)).join('')}</div>` : ''}</div>`;
}
/* وسم «متعارض» على صف، وبطاقات التعارض القائم داخل محرر الشيء نفسه */
const cfLive = kid => (KIDS.includes(kid) ? cfScan(kid) : cfEvPairs(S.events).filter(c => c.kid === kid));
const cfTag = (kid, id) => (cfLive(kid).some(c => cfHas(c, id)) ? ' ' + chip('متعارض', 'wa', 'warning') : '');
const cfEvTag = e => (cfAll().some(c => cfHas(c, 'ev.' + e.id)) ? ' ' + chip('متعارض', 'wa', 'warning') : '');
const cfHere = (kid, id, own) => cfLive(kid).filter(c => cfHas(c, id)).map(c => cfCard(c, { mode: 'inline', nav: 1, self: id, own })).join('');
const cfEvHere = e => cfAll().filter(c => cfHas(c, 'ev.' + e.id)).map(c => cfCard(c, { mode: 'inline', nav: 1, self: 'ev.' + e.id })).join('');
/* سطر «تعارضات» في صفحة قواعد الطفل */
function cfLine(kid) {
  const L = cfScan(kid); if (!L.length || !can('protection.rule.view', kid)) return ''; const u = L.filter(c => !cfOkAll()[cfKey(c)]).length;
  return `<button class="card fx cfl" data-a="go:conflicts:${kid}">${ic('warning')}<div class="grow"><b>تعارضات · ${L.length}</b><div class="sm muted">${u ? (u === 1 ? 'واحد ينتظر قرارك' : `${u} تنتظر قرارك`) : 'أُبقيت كما هي'} · ${L[0].ti}</div></div>${ic('chevron_right')}</button>`;
}

/* ---------- بوابة الحفظ ---------- */
let CFX = null;
function cfGate(find, go, o = {}) { cfSweep(); const L = find(); if (!L.length) return go(false); CFX = { find, go, o, L, back: S.sheet, S }; S.sheet = { id: 'conflict', a: [] }; }
const cfGoTo = s => { const [id, ...a] = s.split(':'); if (SC[id]) go(id, ...a); else if (ACT[id]) ACT[id](...a); };
const cfLog = c => { const t = `حُفظ مع تعارض${KIDS.includes(c.kid) ? ' عند ' + M[c.kid].n : ''}: ${c.ti}`; if (/^(task|ev)/.test(c.k)) audit(t, /^task/.test(c.k) ? 'tasks.create' : 'calendar.event.create'); else xaud(t, 'protection.rule.edit', c.kid, 'rule'); };
surface('conflict', {
  kind: 'sheet', t: 'تعارض عند الحفظ', sys: 'S1-10', p: 'adult', req: '10:6,13,33 06:14 05:11',
  note: 'Q-419. تظهر قبل أن يُحفظ شيء متعارض، بالشكل نفسه في كل الأنظمة: الطرفان باسميهما ومعهما الطفل والوقت، ثم ما سيحدث فعلاً لو بقي التعارض، ثم الحلول بضغطة. «احفظ كما هو» يحفظ ويترك وسم «متعارض»، وإن حفظ بالغ غير المالك وصل المالك تنبيه. لا تفتح وحدها: افتحها من رحلة «تعارض القواعد» في الاستوديو.',
  r() {
    if (CFX && CFX.S !== S) CFX = null;   /* بطاقة من حالة سابقة (بعد «حالة جديدة» من الاستوديو) لا تبقى حيّة (Q-435) */
    const x = CFX; if (!x) return `<h4>لا تعارض الآن</h4><p class="d">تظهر هذه الورقة حين تحفظ شيئاً يتعارض مع شيء موجود. جرّب رحلة «تعارض القواعد» من الاستوديو.</p>${btn('حسناً', 'close', 'sec')}`;
    const L = x.L, blk = L.some(c => c.tier === 'block'), once = L.every(c => c.once), kids = [...new Set(L.map(c => c.kid))].filter(k => KIDS.includes(k));
    return `<h4>${L.length === 1 ? 'هذا يتعارض مع شيء موجود' : `${L.length === 2 ? 'تعارضان' : L.length + ' تعارضات'} مع ما هو موجود`}</h4><p class="d">${x.o.lead || 'لم يُحفظ شيء بعد.'}${kids.length ? ` يخص ${kids.map(kn).join(' و')}.` : ''} اقرأ ما سيحدث ثم اختر.</p>
    ${L.map((c, i) => cfCard(c, { mode: 'save', i, self: x.o.self, hide: x.o.hide })).join('')}
    <div class="btns">${blk ? '' : btn(x.o.keep || 'احفظ كما هو', 'cfKeep', 'sec')}${btn(x.o.edit || 'عدّل هذا', 'cfEdit')}</div>
    ${blk || once ? '' : `<p class="xs muted c" style="margin:8px 0 0">إن حفظته كما هو بقي عليه وسم «متعارض»${isRoot() ? '' : '، ووصل أحمد تنبيه'}.</p>`}`;
  },
});
surface('conflicts', {
  t: id => 'تعارضات قواعد ' + M[id].n, sys: 'S1-10', p: 'adult', a: ['layan'], req: '10:13,25,26,33',
  note: 'Q-419. كل التعارضات القائمة عند طفل واحد في مكان واحد، بالبطاقة نفسها التي تظهر عند الحفظ: الطرفان، ما يحدث فعلاً، وحلول بضغطة. تحت كل بطاقة: من أبقاها كما هي ومتى، أو أنها تنتظر قراراً. تُفتح من سطر «تعارضات» في صفحة قواعد الطفل ومن بطاقة «رتّب قواعد …» في الرئيسية. ما حُلّ يختفي وحده.',
  r(id0) { const id = KIDS.includes(id0) ? id0 : 'layan', L = cfScan(id);
    return `${kidTabs(id)}${L.length ? `<p class="sm muted" style="margin:0 4px 10px">${L.length === 1 ? 'شيء واحد لن يعمل' : L.length === 2 ? 'شيئان لن يعملا' : `${L.length} أشياء لن تعمل`} كما كُتب عند ${kn(id)}. كل بطاقة تقول ما يحدث فعلاً وكيف تُرتَّب.</p>${L.map(c => cfCard(c, { mode: 'page' })).join('')}` : empty('check_circle', `لا تعارض في قواعد ${kn(id)}`, 'كل ما حُفظ يعمل كما كُتب. إن حفظت شيئاً يتعارض مع غيره نبّهناك قبل الحفظ.')}`; },
});
const cfFind = (kid, key) => (KIDS.includes(kid) ? cfScan(kid) : cfAll()).find(c => c.k === key);
Object.assign(ACT, {
  cfEdit() { const x = CFX; CFX = null; S.sheet = x ? x.back : null; },
  cfKeep() { const x = CFX; if (!x || x.L.some(c => c.tier === 'block')) return; CFX = null; S.sheet = x.back; const L = x.L.filter(c => !c.once); L.forEach(c => { cfOkAll()[cfKey(c)] = { by: me().id, at: 'الآن' }; }); x.go(true); L.forEach(cfLog); },
  cfFix(i, j) { const x = CFX; if (!x) return; const c = x.L[+i], f = c && c.fix[+j]; if (!f) return; if (f.p === x.o.self && f.draft) f.draft(); else f.run();
    const L = x.find(); if (L.length) { x.L = L; return; } CFX = null; S.sheet = x.back; x.go(true); },
  cfOpen(i, s) { const x = CFX; if (!x) return; const p = x.L[+i][s]; CFX = null; S.sheet = null; cfGoTo(p.go); toast('لم يُحفظ تعديلك بعد · عُد إليه حين تنتهي', null, 'info'); },
  cfNav(kid, key, s) { const c = cfFind(kid, key); if (c) cfGoTo(c[s].go); },
  cfDo(kid, key, j) { const c = cfFind(kid, key), f = c && c.fix[+j]; if (!f || !f.run) return; const un = f.run(); toast(cfFind(kid, key) ? 'عُدّل · بقي من التعارض شيء' : 'رُتّب التعارض', un, 'check_circle'); },
  cfOkSet(kid, key) { const c = cfFind(kid, key); if (!c) return; const O = cfOkAll(), k = cfKey(c); O[k] = { by: me().id, at: 'الآن' }; cfLog(c); toast('أُبقي كما هو · يبقى عليه وسم «متعارض»', () => { delete O[k]; render(); }); },
  cfSeen(kid) { const O = cfOkAll(); cfLive(kid).forEach(c => { const k = cfKey(c); if (!O[k]) O[k] = { by: me().id, at: 'الآن' }; else O[k].seen = 1; }); toast('تمّ · تجدها في صفحة التعارضات متى شئت', null, 'check_circle'); },
  cfWd(f, v) { if (S.wd) S.wd[f] = v.slice(0, 2) + ':' + v.slice(2); },
});
/* ما يصل «يتطلب انتباهك»: تعارض قائم لم يقرّر فيه أحد (للمالك ومن له صلاحيته الكاملة)، أو أبقاه بالغ آخر (للمالك نفسه). بطاقة واحدة لكل طفل. */
function cfAtt() {
  if (!isOwner()) return []; const O = cfOkAll(), G = {}, mine = me().id;
  cfAll().forEach(c => { const ok = O[cfKey(c)]; if (!ok || (isRoot() && ok.by !== mine && !ok.seen)) (G[c.kid] = G[c.kid] || []).push([c, ok]); });
  return Object.keys(G).map(kid => { const L = G[kid], c = L[0][0], ok = L[0][1], isKid = KIDS.includes(kid), nm = isKid ? kn(kid) : kid === 'all' ? 'العائلة' : pname(M[kid]), who = ok ? M[ok.by] : null;
    return { k: 'cf:' + kid, p: 2, c: 'var(--warning)', i: 'warning', t: L.length > 1 ? `${L.length === 2 ? 'تعارضان' : L.length + ' تعارضات'} ${isKid ? 'في قواعد ' + nm : 'في مواعيد ' + nm}` : c.ti + (isKid && !c.ti.includes(nm) ? ' · ' + nm : ''), s: who ? `${vb(who, 'حفظه', 'حفظته')} ${who.n} كما هو` : 'ظهر بعد آخر حفظ · لم يقرّر فيه أحد',
      b: isKid ? [[`رتّب قواعد ${nm}`, `go:conflicts:${kid}`, 'ton'], ['تمّ', `cfSeen:${kid}`, 'sec']] : [['افتح الحدث', `go:event:${c.a.ids[0].slice(3)}`, 'ton'], ['تمّ', `cfSeen:${kid}`, 'sec']] }; });
}

/* ---------- ربط كل حفظ بالبوابة: الفعل الأصلي لا يتغير، ويُستدعى بعد أن يقرّر الأب ---------- */
const cfWrap = (name, ctx) => { const orig = ACT[name]; ACT[name] = (...a) => { const c = ctx(...a); if (!c) return orig(...a); cfGate(c.find || (() => cfNew(c.kids, c.mk, c.self)), sh => { S.cfSkip = sh ? 1 : 0; try { orig(...a); } finally { S.cfSkip = 0; } }, Object.assign({ self: c.self, hide: c.hide }, c.o)); }; };
cfWrap('adSave', () => { const d = S.ad; if (!d || !adValid(d) || offline()) return null; return { self: 'app.' + d.id, kids: [d.kid], mk: () => ({ apps: S.apps[d.kid].map(a => (a.id !== d.id ? a : Object.assign({}, a, { act: d.act, study: d.study, lim: d.act === 'LIMIT' ? (d.per ? d.limD[NOW.d] : d.lim) : undefined, limD: d.act === 'LIMIT' && d.per ? d.limD.slice() : undefined, nx: 1 }))) }) }; });
cfWrap('qdSave', () => { const d = S.qd; if (!d || offline()) return null; return { self: 'quota', kids: [d.kid], mk: () => ({ q: d.v.slice() }) }; });
cfWrap('pdSave', () => { const d = S.pd; if (!d || offline()) return null; return { self: 'rank', kids: d.sc === 'fam' ? KIDS.filter(k => !S.rankKid[k]) : [d.sc], mk: () => ({ rank: d.r.slice() }), o: { edit: 'راجع الترتيب' } }; });
cfWrap('wdSave', () => { const d = S.wd; if (!d || !d.days.length || winClash(d.kid, d) || offline()) return null; return { self: 'win.' + d.id, kids: [d.kid], mk: () => ({ W: S.sched[d.kid].filter(w => w.id !== d.id).concat([{ id: d.id, type: d.type, days: d.days.slice().sort(), s: d.s, e: d.e }]) }), o: { edit: 'عدّل النافذة' } }; });
cfWrap('sdSave', () => { const d = S.sd; if (!d || offline()) return null; return { self: 'study', kids: [d.kid], mk: () => ({ apps: S.apps[d.kid].map(a => Object.assign({}, a, { study: d.on.includes(a.id) ? 1 : 0 })) }) }; });
cfWrap('wrSave', () => { const d = S.wr; if (!d || offline()) return null; return { self: 'web', kids: [d.kid], mk: () => ({ wc: d.c }) }; });
cfWrap('wdomAdd', id => { const d = domFix(($('#wdomN') || {}).value), n = S.wdN || {}; if (offline() || !n.a || !/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(d) || S.wdom[id].some(x => x.d === d)) return null; S.wdN = Object.assign({}, n, { d }); return { self: 'web', hide: 'dom', kids: [id], mk: () => ({ dom: S.wdom[id].concat([{ d, a: n.a }]) }) }; });
cfWrap('mdSave', () => { const d = S.md; if (!d || mdErr(d) || offline()) return null; const id = d.id === 'new' ? 'm' + (Math.max(0, ...S.modes.map(x => +x.id.slice(1))) + 1) : d.id; return { self: 'mode.' + id, kids: KIDS, mk: () => ({ modes: S.modes.filter(m => m.id !== id).concat([{ id, n: d.n.trim(), i: d.i, open: d.open, apps: d.open === 'list' ? d.apps.slice() : [], lim: d.open === 'list' ? d.lim : 1 }]) }), o: { edit: 'عدّل الوضع' } }; });
cfWrap('ntSave', () => { tkRead(); const n = S.nt; if (!n) return null; const t = (n.t || '').trim(), old = n.id ? tkT(n.id) : null; if (!can('tasks.create', n.kid) || !t || (n.rr === 'days' && !n.wd.length) || (old && old.st !== 'PENDING')) return null;
  n.nid = n.nid || 't' + Date.now(); const id = n.id || n.nid; return { self: 'task.' + id, kids: [n.kid], mk: () => ({ tasks: S.tasks.filter(x => x.id !== id).concat([{ id, kid: n.kid, t, cat: n.cat, dk: n.dk, hm: n.hm, rr: TK().rec ? n.rr : 'none', wd: n.wd.slice(), rem: +n.rem, st: 'PENDING' }]), setHm: v => { S.nt.hm = v; } }), o: { edit: 'عدّل الموعد', lead: 'لم تُحفظ المهمة بعد.' } }; });
cfWrap('evSave', () => { if (!can('calendar.event.create')) return null; ACT.tkEvRead(); const d = S.ev; if (!d || !(d.t || '').trim()) return null; d.nid = d.nid || 'e' + Date.now(); const id = d.id || d.nid, self = 'ev.' + id;
  return { self, o: { edit: 'عدّل الحدث', lead: 'لم يُحفظ الحدث بعد.' }, find: () => { const O = cfOkAll(), E = S.events.filter(x => x.id !== id).concat([{ id, t: d.t.trim(), dk: d.dk, hm: d.hm, who: d.who, rr: d.rr }]), had = new Set(cfAll().map(cfKey));
    return [...(KIDS.includes(d.who) ? cfScan(d.who, { events: E }).filter(c => !c.k.startsWith('ev2.')) : []), ...cfEvPairs(E)].filter(c => cfHas(c, self) && !(had.has(cfKey(c)) && O[cfKey(c)])); } }; });
cfWrap('gtGo', () => { const g = S.gt; if (!g || !can('rewards.grant.create', g.kid)) return null; const a = appOf(g.kid, g.app), k = S.kid[g.kid]; if (!a || !(g.n > 0) || g.n > rwCapLeft(g.kid) || (g.fz && rwFz(g.kid) && g.n > k.pts)) return null; return { self: 'grant', find: () => cfGrantNow(g.kid, g.app, g.n), o: { edit: 'لا تمنح الآن', keep: 'امنح على أي حال', lead: 'لم يُمنح شيء بعد.' } }; });
cfWrap('reqGrant', (id, min) => { const r = S.reqs.find(x => x.id === id); if (!r || r.st !== 'PENDING' || +min > rwCapLeft(r.kid)) return null; return { self: 'grant', find: () => cfGrantNow(r.kid, r.app, +min), o: { edit: 'لا تمنح الآن', keep: 'امنح على أي حال', lead: 'لم يُمنح شيء بعد.' } }; });
cfWrap('psGo', k => { const sel = (S.psK || []).slice(), n = S.psN; if (k === 'free' || !sel.length || !n || offline() || !modeOf(k) || (!S.psX && sel.some(id => crossAsk(k, crossOf(id, n))))) return null; return { self: 'mode.' + k, find: () => sel.flatMap(id => cfApply(k, id)), o: { edit: 'رجوع', keep: 'طبّق على أي حال', lead: 'لم يُطبَّق الوضع بعد.' } }; });

/* ---------- أحداث العرض (الاستوديو) ---------- */
function cfDemo() { CFX = null; S.sheet = S.full = S.dlg = null; const mc = appOf('layan', 'mc'); mc.act = 'LIMIT'; mc.lim = 30 + cfGr('layan', 'mc'); delete mc.limD; delete S.pm.layan; S.tasks = S.tasks.filter(t => t.id !== 'tcf'); S.wd = null; S.ad = null; S.nt = null; cfSweep(); }
function cfEv(v) {
  const mc = appOf('layan', 'mc');
  if (v === 'sara' || v === 'lim') { mc.act = 'LIMIT'; mc.lim = 150; delete mc.limD; cfOkAll()['layan|lim.mc'] = { by: v === 'sara' ? 'sara' : 'ahmad', at: 'الآن' }; S.audit.unshift({ t: 'حُفظ مع تعارض عند ليان: حدّ Minecraft أكبر من الحصة', w: v === 'sara' ? 'سارة' : 'أحمد', at: 'الآن', k: 'protection.rule.edit', kid: 'layan', ty: 'rule', d: 0 }); }
  if (v === 'teen' && !tkT('tcf')) S.tasks.unshift({ id: 'tcf', kid: 'khaled', t: 'مذاكرة الكيمياء', cat: 'school', pts: 0, due: 'اليوم 11:00 م', dk: TK_TODAY, hm: '2300', rr: 'none', rem: 60, proof: 'self', st: 'PENDING', by: 'khaled' });
}
