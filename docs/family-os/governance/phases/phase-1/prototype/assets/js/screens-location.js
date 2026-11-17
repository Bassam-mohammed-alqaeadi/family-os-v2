/* النظام S1-07: الموقع الأساسي والاستغاثة.
   الخريطة (LO-01)، موقع فرد (LO-02)، الاستغاثة عند المرسِل (LO-03)، جهات الطوارئ (LO-04)، سجل التنقل (LO-05)،
   الاستغاثة عند الأهل وقائمتها (LO-06)، والخريطة المصغرة في الرئيسية (LO-07).
   القاعدة الحاكمة: موقع قديم لا يُعرض كأنه حي (REQ-003)، والاستغاثة لا يحجبها شيء ولا تُعرض مرسَلة وهي لم تُرسل. */

/* قيم المختبر المعتمدة (Q-027 · 2026-11-08): الموقع حي حتى 15 دقيقة، والدقة ضعيفة فوق 50 متراً، والبطارية منخفضة دون 15%. */
const LOC_FRESH = 15, LOC_POOR = 50, BAT_LOW = 15;
const minTxt = m => (m < 1 ? 'الآن' : m < 60 ? `قبل ${m} د` : `قبل ${Math.floor(m / 60)} س${m % 60 ? ' و' + (m % 60) + ' د' : ''}`);

/* حال موقع فرد كما يراه من يحمل الهاتف. «موقع خالد» و«هواتف الأطفال iPhone» و«منقطع» من الاستوديو تغيّره. */
function locOf(id) {
  const k = S.kid[id]; if (!k) return null;
  const o = { id, place: k.place, area: k.area, x: k.x, y: k.y, ago: k.ago, acc: 12, bat: k.bat, moving: k.moving, why: '' };
  if (!isAdult() && me().id === id) {   /* الطفل على جهازه: موقعه من هاتفه مباشرة */
    if (S.gpsOff) { o.ago = 18; o.why = 'gps'; } else o.ago = 0;
  } else {
    const v = id === 'khaled' ? S.locK : '';
    if (v === 'none') return { id, none: 1, bat: k.bat, low: k.bat < BAT_LOW };
    if (v === 'old') { o.ago = 25; o.why = 'net'; }
    if (v === 'off') { o.ago = 190; o.bat = 3; o.why = 'off'; }
    if (v === 'poor') o.acc = 120;
    if (v === 'low') o.bat = 12;
    if (v === 'mov') { o.moving = true; o.ago = 1; o.x = 58; o.y = 38; o.place = AD_ROAD; o.area = 'الصافية'; }
    if (S.os === 'ios' && !o.why) { o.ago += 20; o.why = 'ios'; }
    if (offline() || S.stale) { o.ago += 42; o.why = o.why || 'me'; }
  }
  o.live = o.ago <= LOC_FRESH; o.poor = o.acc > LOC_POOR; o.low = o.bat < BAT_LOW;
  if (o.live) o.why = '';
  return o;
}
const locLine = l => (l.live ? `${l.moving ? 'يتحرك' : 'ثابت'} · ${minTxt(l.ago)}` : `آخر موقع معروف · ${minTxt(l.ago)}`);
const locWhy = (l, m) => ({ net: `${vb(m, 'جهازه', 'جهازها')} بلا اتصال الآن`, off: `${vb(m, 'جهازه', 'جهازها')} مغلق أو نفدت بطاريته`, ios: `${vb(m, 'هاتفه', 'هاتفها')} iPhone، والنظام يؤخر تحديث الموقع في الخلفية`, me: 'أنت دون اتصال', gps: 'تحديد الموقع متوقف في الهاتف' }[l.why] || '');
const batChip = l => chip(l.bat + '%', l.low ? 'da' : 'ol', l.low ? 'battery_alert' : 'battery_5_bar');
/* من يظهر لي على الخريطة: البالغ يرى من سُمح له برؤيته، والطفل يرى نفسه فقط. */
const locIds = () => (isAdult() ? KIDS.filter(id => can('location.view', id)) : S.kid[me().id] ? [me().id] : []);
const kidNo = () => empty('lock', 'هذه الصفحة للأهل', 'تجد مكانك في «موقعي».', btn('موقعي', 'go:map', 'sm sec'));
const saraSees = id => { if (S.co) return true; const g = S.g['location.view']; return gLive(g) && (g.sc === 'all' || g.sc === 'fam' || g.sc.includes(id)); };

/* مكاني أنا: من هاتفي مباشرة. يظهر لي وحدي ولا يُرسل لأحد (ظهور البالغين على خريطة غيرهم لم يُحكم فيه). */
const ME_AT = { ahmad: { x: 84, y: 74 }, sara: { x: 30, y: 66 } };
const meAt = () => (isAdult() && !S.myLocOff ? ME_AT[me().id] || null : null);
/* البعد عني: تقريبي ومدوَّر، لأن موقعين كلٌّ منهما بدقة أمتار لا يعطيان مسافة دقيقة. */
const distTxt = l => { const p = meAt(); if (!p || !l || l.none || S.privacy) return ''; const m = Math.hypot(l.x - p.x, l.y - p.y) * 45; return m < 150 ? 'قريب منك' : m < 950 ? `يبعد نحو ${Math.round(m / 50) * 50} م` : `يبعد نحو ${(m / 1000).toFixed(1)} كم`; };
const MAP_Z = [1, 1.6, 2.4];
const mapOff = () => S.privacy || (S.lbw && !S.mapLoaded) || S.tilesFail;

/* الخريطة: توضيحية في النموذج (المصدر الفعلي OpenStreetMap). لا تُعكس في RTL.
   العناوين المكتوبة تأتي من الخريطة نفسها (الحي والشارع). لا أماكن تسمّيها العائلة:
   تسمية المكان وتنبيه الوصول والمغادرة من المرحلة 5 (Q-056). */
function fMap(h = 150, o = {}) {
  const box = (i, t, b) => `<div class="${o.fill ? 'mapx' : ''}"><div class="card flat c"><div class="muted sm" ${b ? 'style="margin-bottom:8px"' : ''}>${ic(i)} ${t}</div>${b || ''}</div></div>`;
  if (S.privacy) return box('visibility_off', 'الخريطة مخفية في وضع الخصوصية');
  if (S.lbw && !S.mapLoaded) return box('map', 'لم تُحمَّل الخريطة لتوفير البيانات', btn('تحميل الخريطة (≈ 180 ك.ب)', 'set:mapLoaded:true', 'sm sec', 'download'));
  if (S.tilesFail) return box('map', 'تعذّر تحميل الخريطة. المواقع المكتوبة صحيحة.', btn('أعد المحاولة', 'set:tilesFail:false', 'sm sec', 'refresh'));
  const dk = S.theme === 'dark', road = dk ? '#22324d' : '#fff', blk = dk ? '#15233b' : '#DDE3D3', wat = dk ? '#0d2a45' : '#BFD8EA', grn = dk ? '#12301f' : '#C9DDBE';
  const ids = o.ids || locIds(), z = o.z || 1, c0 = o.c || { x: 50, y: 50 };
  /* التكبير حول مركز: المركز لا يخرج بالخريطة عن حدودها. */
  const cl = v => Math.max(50 / z, Math.min(100 - 50 / z, v)), cx = cl(c0.x), cy = cl(c0.y), px = x => 50 + (x - cx) * z, py = y => 50 + (y - cy) * z;
  const act = o.pin || (id => 'go:loc:' + id), cact = o.clu || (() => 'go:map'), on = o.on || [];
  const lab = o.lab || (l => `${pname(M[l.id])} · <span class="ltr">${l.bat}%</span> · ${minTxt(l.ago)}`);
  const A = a => (a ? `data-a="${a}"` : 'tabindex="-1"');
  const isSos = l => S.sos && S.sos.from === l.id && S.sos.st === 'sent';
  /* العلامات المتقاربة على الشاشة تُجمع في علامة واحدة بعددها، فلا تتراكب علامتان لا تُقرآن. */
  const G = [];
  ids.forEach(id => { const l = locOf(id); if (!l || l.none) return; const X = px(l.x), Y = py(l.y), g = G.find(g => Math.abs(g.X - X) < 13 && Math.abs(g.Y - Y) < 11); if (g) g.L.push(l); else G.push({ X, Y, L: [l] }); });
  const pins = o.sk ? G.map(g => `<i class="pin sk" style="left:${g.X}%;top:${g.Y}%"></i>`).join('') : G.map(g => {
    const st = `style="left:${g.X}%;top:${g.Y}%"`;
    if (g.L.length > 1) {
      const N = g.L.map(l => pname(M[l.id])), I = g.L.map(l => l.id);
      return `<button class="pin clu ${g.L.some(l => l.live) ? '' : 'old'} ${g.L.some(isSos) ? 'sosp' : ''} ${I.every(i => on.includes(i)) ? 'on' : ''}" ${st} ${A(cact(I))} aria-label="${N.join(' و')} في المكان نفسه">${o.big ? `<label>${N.length > 2 ? N.length + ' في المكان نفسه' : N.join(' و')}</label>` : ''}<span class="pa">${g.L.slice(0, 2).map(l => av(M[l.id])).join('')}<b class="cn">${g.L.length}</b></span></button>`;
    }
    const l = g.L[0], mv = l.live && l.moving;
    return `${l.poor ? `<i class="unc" style="left:${g.X}%;top:${g.Y}%;width:${96 * z}px;height:${96 * z}px"></i>` : ''}<button class="pin ${l.live ? '' : 'old'} ${isSos(l) ? 'sosp' : ''} ${mv ? 'mv' : ''} ${on.includes(l.id) ? 'on' : ''}" ${st} ${A(act(l.id))} aria-label="${pname(M[l.id])}">${o.big ? `<label>${lab(l)}</label>` : ''}<span class="pa">${av(M[l.id])}${mv ? `<i class="mvb">${ic('directions_walk')}</i>` : ''}</span></button>`;
  }).join('');
  const p = o.me && meAt(), meDot = p ? `<i class="medot" style="left:${px(p.x)}%;top:${py(p.y)}%"><label>أنت</label></i>` : '';
  /* محطات السجل: المحطات في المكان نفسه تُجمع في علامة واحدة بأرقامها. */
  const H = {}; (o.pts || []).forEach((p, i) => { const k = p.x + ',' + p.y; (H[k] = H[k] || { p, n: [] }).n.push(i); });
  const pts = Object.values(H).map(g => `<button class="hp ${g.n.includes(o.hon) ? 'on' : ''}" style="left:${px(g.p.x)}%;top:${py(g.p.y)}%" data-a="histPt:${g.n.includes(o.hon) ? o.hon : g.n[0]}" aria-label="المحطة ${g.n.map(i => i + 1).join(' و')}">${g.n.map(i => i + 1).join('،')}</button>`).join('');
  const zi = MAP_Z.indexOf(z);
  const ctl = o.ctl ? `<div class="mctl"><button data-a="mapZ:1" aria-label="تكبير" ${zi >= MAP_Z.length - 1 ? 'disabled' : ''}>${ic('add')}</button><button data-a="mapZ:-1" aria-label="تصغير" ${zi <= 0 ? 'disabled' : ''}>${ic('remove')}</button><button data-a="mapFit" aria-label="أظهر الجميع">${ic('groups')}</button></div>` : '';
  const tf = z === 1 ? '' : `style="transform-origin:0 0;transform:translate(${50 - cx * z}%,${50 - cy * z}%) scale(${z})"`;
  return `<div class="map ${o.fill ? 'fill' : ''}" ${o.fill ? '' : `style="height:${h}px"`}><svg class="m" ${tf} viewBox="0 0 400 ${o.fill ? 470 : h * 400 / 358}" preserveAspectRatio="xMidYMid slice"><rect width="400" height="640" fill="${blk}"/><path d="M-10 250 Q120 210 210 260 T420 230 V640 H-10Z" fill="${wat}" opacity=".7"/><rect x="250" y="20" width="120" height="70" rx="10" fill="${grn}"/><rect x="30" y="120" width="90" height="60" rx="10" fill="${grn}"/><g stroke="${road}" stroke-linecap="round" fill="none"><path d="M-10 100 H420" stroke-width="14"/><path d="M140 -10 V200 Q140 230 180 232" stroke-width="12"/><path d="M-10 190 H420" stroke-width="9"/><path d="M240 -10 V240" stroke-width="9"/><path d="M320 100 V230" stroke-width="7"/><path d="M60 100 V190" stroke-width="7"/><path d="M-10 40 H250" stroke-width="6"/></g></svg>${pts}${meDot}${pins}${ctl}<span class="attr">خريطة توضيحية · المصدر الفعلي OpenStreetMap</span></div>`;
}
const miniMap = (h = 150, big) => fMap(h, { big });
/* شرائح الأماكن تحت الخريطة المصغرة في الرئيسية (LO-07): كل طفل بحيّه وبطاريته، وعمر الموقع إن لم يكن حياً. */
function locChips() {
  return locIds().map(id => { const l = locOf(id), n = pname(M[id]);
    if (l.none) return chip(`${n}: لا موقع بعد`, 'stale', 'location_off');
    return chip(`${n}: ${S.privacy ? '••••' : l.area} · ${l.bat}%${l.live ? '' : ' · ' + minTxt(l.ago)}`, l.low ? 'da' : l.live ? '' : 'stale', l.low ? 'battery_alert' : l.live ? 'location_on' : 'history'); }).join('');
}

/* ---------- LO-01 الخريطة ---------- */
/* سطر الحال تحت العنوان: الحي يقول الحركة والعمر والبعد، والقديم يقول عمره وسببه. */
const locStat = (l, m) => (l.live ? [l.moving ? 'يتحرك' : 'ثابت', minTxt(l.ago), distTxt(l)].filter(Boolean).join(' · ') : [`آخر موقع معروف ${minTxt(l.ago)}`, locWhy(l, m)].filter(Boolean).join(' · '));
/* من يراهم هذا الابن من إخوته بقرار الأب. الافتراضي: لا أحد. */
const sibSeen = id => ((S.locShare || {})[id] || []).filter(k => S.kid[k] && k !== id);
const sibSees = id => KIDS.filter(k => k !== id && sibSeen(k).includes(id));
surface('map', {
  t: () => (isAdult() ? 'خريطة العائلة' : 'موقعي'), sys: 'S1-07', p: 'any', flush: true, req: '07:1,2,3,6,11,12,15 09:10,11 01:10',
  note: 'الخريطة تملأ الشاشة والقائمة لوحة سفلية. شرائح الأسماء تصفّي الخريطة على فرد واحد وتقرّبه. على كل علامة: الاسم والبطارية وعمر الموقع. الموقع الأقدم من 15 دقيقة يُكتب «آخر موقع معروف» مع سببه ويتغيّر شكل علامته. من في المكان نفسه يُجمعون في علامة بعددهم. نقطة «أنت» من هاتفك وتظهر لك وحدك. العناوين من الخريطة نفسها: لا أماكن مسمّاة ولا تنبيه وصول ومغادرة هنا (المرحلة 5، Q-056). جرّب من الاستوديو: «موقع خالد» و«تحميل المواقع» و«منقطع» و«iOS».',
  r() {
    if (!isAdult()) return `<div class="mpad">${locSelf()}</div>`;
    const ids = locIds();
    if (!ids.length) return `<div class="mpad">${empty('location_off', 'لا مواقع مرئية لكِ', 'لم يُسمح لكِ برؤية موقع أحد من الأطفال.', why('nd:location.view'))}</div>`;
    if (S.locLoad) return `<div class="mapscr" aria-busy="true"><div class="fch mfch">${ids.map(() => '<span class="skel" style="width:78px;height:36px;border-radius:99px;margin:0;flex:none"></span>').join('')}</div>${fMap(0, { fill: 1, ids, sk: 1 })}<section class="mpanel ${mapOff() ? 'nomap' : ''}"><p class="sm muted fx" style="margin:16px 4px 12px;gap:6px" role="status">${ic('sync')}<span>جارٍ جلب المواقع…</span></p>${ids.map(() => '<div class="skel" style="height:54px"></div>').join('')}</section></div>`;
    const Ls = ids.map(locOf), F = (S.mapF || '').split(',').filter(id => ids.includes(id)), one = F.length === 1 ? F[0] : '';
    const P = (F.length ? F.map(locOf) : Ls).filter(l => !l.none), z = S.mapZ || 1;
    const c = P.length ? { x: P.reduce((s, l) => s + l.x, 0) / P.length, y: P.reduce((s, l) => s + l.y, 0) / P.length } : { x: 50, y: 50 };
    const old = Ls.filter(l => !l.none && !l.live), sos = S.sos && S.sos.st === 'sent' && S.sos.from !== me().id;
    const strip = sos ? `<button class="mstrip da" data-a="go:sos-status">${ic('sos')}<span><b>${M[S.sos.from].n} ${vb(M[S.sos.from], 'يستغيث', 'تستغيث')} الآن</b> · افتح التنبيه</span></button>`
      : offline() ? `<div class="mstrip wa">${ic('cloud_off')}<span>أنت دون اتصال: تُعرض آخر المواقع المعروفة، لا المواقع الحية.</span></div>`
      : S.os === 'ios' ? `<div class="mstrip nt">${ic('info')}<span>هواتف الأطفال iPhone: النظام يؤخر تحديث الموقع في الخلفية. ${why('ios')}</span></div>`
      : old.length ? `<div class="mstrip wa">${ic('history')}<span>${old.map(l => pname(M[l.id])).join(' و')}: يُعرض آخر موقع معروف، لا الموقع الحي.</span></div>` : '';
    const chips = ids.length > 1 && !S.privacy ? `<div class="fch mfch"><button aria-pressed="${!F.length}" data-a="mapFit">${ic('groups')}الكل</button>${ids.map(id => `<button aria-pressed="${one === id}" data-a="mapF:${id}">${av(M[id], 'sm')}${pname(M[id])}</button>`).join('')}</div>` : '';
    const rowOf = id => { const l = locOf(id), m = M[id]; return row('', pname(m), l.none ? 'لا موقع معروف بعد' : `${S.privacy ? '••••' : l.place}<br>${locStat(l, m)}`, { lead: av(m), a: 'mapF:' + id, v: batChip(l), chev: false }); };
    let body;
    if (one) {
      const l = locOf(one), m = M[one], d = distTxt(l);
      body = `<div class="mhead">${av(m)}<div class="grow"><b>${pname(m)}</b><div class="sm muted">${l.none ? 'لا موقع معروف بعد' : S.privacy ? 'المكان مخفي (وضع الخصوصية)' : l.place}</div></div><button class="ib" data-a="mapFit" aria-label="أغلق وأظهر الجميع">${ic('close')}</button></div>
      ${l.none ? `<p class="sm muted" style="margin:10px 2px">لم يرسل جهاز ${pname(m)} موقعاً حتى الآن. يظهر هنا عند أول اتصال له.</p>` : `<div class="chips" style="margin:10px 0">${l.live ? chip(`${l.moving ? 'يتحرك' : 'موقع حي'} · ${minTxt(l.ago)}`, 'ok', l.moving ? 'directions_walk' : 'check') : chip(`آخر موقع معروف ${minTxt(l.ago)}`, 'stale', 'history')}${batChip(l)}${d ? chip(d, 'ol', 'route') : ''}${l.poor ? chip(`تقريبي · ضمن ${l.acc} متراً`, 'wa', 'location_on') : ''}</div>
      ${l.live ? '' : `<p class="sm" style="margin:0 2px 10px">${locWhy(l, m)}. قد ${vb(m, 'يكون', 'تكون')} في مكان آخر الآن.</p>`}`}
      <div class="btns3">${l.none ? '' : btn('الاتجاهات', 'locDir:' + one, 'sm sec', 'route')}${btn('اتصال', 'locCall:' + one, 'sm sec', 'call')}${btn('مراسلة', 'locMsg:' + one, 'sm sec', 'chat')}</div>
      ${l.none ? '' : list(row('location_on', 'التفاصيل وسجل التنقل', '', { a: 'go:loc:' + one }))}`;
    } else if (F.length) {
      body = `<div class="mhead"><div class="grow"><b>في المكان نفسه</b><div class="sm muted">${S.privacy ? '••••' : locOf(F[0]).place}</div></div><button class="ib" data-a="mapFit" aria-label="أغلق وأظهر الجميع">${ic('close')}</button></div><div class="gap"></div>${list(F.map(rowOf))}`;
    } else {
      const sh = KIDS.reduce((n, k) => n + sibSeen(k).length, 0);
      body = `${list(ids.map(rowOf))}
      ${ids.length < KIDS.length ? `<p class="xs muted" style="margin:6px 4px">تظهر مواقع من سُمح لكِ برؤيتهم فقط.</p>` : ''}
      ${S.myLocOff ? `<p class="xs muted" style="margin:6px 4px">تحديد الموقع متوقف في هاتفك: لا يظهر مكانك على الخريطة ولا بُعد أبنائك عنك.</p>` : ''}
      <p class="xs muted" style="margin:6px 4px">الموقع يتحدّث كل دقيقة أثناء الحركة، وكل 5 دقائق عند السكون.</p>
      ${sec('المشاركة والاستغاثة')}${list(isOwner() && KIDS.length > 1 ? row('visibility', 'ما يراه الأبناء', sh ? 'بعضهم يرى مكان إخوته' : 'كل ابن يرى مكانه فقط', { a: 'go:loc-share' }) : '', row('contact_emergency', 'جهات الطوارئ', (S.ec || []).length ? `${(S.ec || []).length} غير أهل البيت` : 'لا أحد غير أهل البيت بعد', { a: 'go:emergency' }), row('sos', 'تنبيهات الاستغاثة', sos ? 'استغاثة نشطة الآن' : 'لا استغاثة الآن', { a: 'go:sos-log' }))}`;
    }
    return `<div class="mapscr">${chips}${strip}${fMap(0, { fill: 1, big: 1, ids: F.length ? F : ids, z, c, me: 1, ctl: !S.mapX, on: F, pin: id => 'mapF:' + id, clu: I => 'mapF:' + I.join(',') })}
    <section class="mpanel ${S.mapX ? 'x' : ''} ${mapOff() ? 'nomap' : ''}"><button class="mgrab" data-a="mapX" aria-expanded="${!!S.mapX}" aria-label="${S.mapX ? 'صغّر اللوحة' : 'كبّر اللوحة'}"><i></i></button>${body}</section></div>`;
  },
});
Object.assign(ACT, {
  /* لمس الاسم أو العلامة: الخريطة تقتصر عليه وتقترب. لمسه ثانية يعيد الجميع. */
  mapF(v) { v = typeof v === 'string' ? v : ''; if (!v || v === S.mapF) { S.mapF = ''; S.mapZ = 1; } else { S.mapF = v; S.mapZ = Math.max(S.mapZ || 1, 1.6); } },
  mapFit() { S.mapF = ''; S.mapZ = 1; },
  mapZ(d) { const i = Math.max(0, MAP_Z.indexOf(S.mapZ || 1)); S.mapZ = MAP_Z[Math.max(0, Math.min(MAP_Z.length - 1, i + (+d)))]; },
  mapX() { S.mapX = !S.mapX; },
  locDir(id) { toast(`يفتح تطبيق الخرائط في هاتفك على مكان ${pname(M[id])}`, null, 'route'); },
});

/* موقعي كما يراه الطفل والمراهق: أين أنا، ومن أراه من إخوتي بقرار الأب، ومن يرى مكاني. شفافية بلا أرقام تقنية. */
function locSelf() {
  const m = me(), id = m.id, l = locOf(id), teen = m.role === 'teen', P = teen ? ['والدك', 'والدتك'] : ['بابا', 'ماما'];
  if (!l) return empty('location_off', 'لا موقع', '');
  const see = sibSeen(id), seen = sibSees(id);
  const sibRow = k => { const s = locOf(k), n = M[k]; return row('', pname(n), s.none ? 'لا مكان معروف بعد' : `${S.privacy ? '••••' : s.place}<br>${s.live ? minTxt(s.ago) : 'آخر مكان معروف ' + minTxt(s.ago)}`, { lead: av(n) }); };
  const foot = [seen.length ? '' : 'إخوتك لا يرون مكانك', see.length ? '' : (seen.length ? 'لا ترى مكان إخوتك' : 'وأنت لا ترى مكانهم')].filter(Boolean).join('، ');
  return `${fMap(230, { ids: [id, ...see], big: 1, pin: () => '', clu: () => '', lab: s => (s.id === id ? 'أنت' : `${pname(M[s.id])} · ${minTxt(s.ago)}`) })}<div class="gap"></div>
  <div class="card fx">${av(m, 'lg')}<div class="grow"><b style="font-size:calc(18px*var(--ts))">${l.why === 'gps' ? 'آخر مكان عرفه هاتفك' : 'أنت هنا'}</b><div class="sm muted">${S.privacy ? '••••' : l.place}${l.why === 'gps' ? ' · ' + minTxt(l.ago) : ''}</div></div>${batChip(l)}</div>
  ${l.why === 'gps' ? callout(`<b>تحديد الموقع متوقف في هاتفك</b><br>${teen ? 'شغّله ليعرف أهلك مكانك.' : 'اطلب من بابا أن يشغّله.'} زر الاستغاثة يعمل في كل حال، ويرسل آخر مكان معروف.`, 'wa', 'location_off') : ''}
  ${l.low ? callout('بطارية هاتفك منخفضة. اشحنه حين تستطيع.', 'wa', 'battery_alert') : ''}
  ${see.length ? sec(teen ? 'من أراه من إخوتي' : 'إخوتي') + list(see.map(sibRow)) + `<p class="xs muted" style="margin:6px 4px">${teen ? 'والدك هو من سمح لك برؤيتهم.' : 'بابا سمح لك أن ترى مكانهم.'}</p>` : ''}
  ${sec('من يرى مكاني')}${list(row('', P[0], teen ? 'يرى مكانك الدقيق دائماً، وسجل تنقلك 7 أيام' : 'يرى مكانك دائماً ليطمئن عليك', { lead: av(M.ahmad) }), saraSees(id) ? row('', P[1], teen ? 'ترى مكانك لأن والدك سمح لها' : 'ترى مكانك أيضاً', { lead: av(M.sara) }) : '', seen.map(k => row('', pname(M[k]), teen ? `${vb(M[k], 'يرى', 'ترى')} مكانك الآن فقط، بلا سجل، لأن والدك سمح` : `${vb(M[k], 'يرى', 'ترى')} مكانك لأن بابا سمح`, { lead: av(M[k]) })))}
  <p class="xs muted" style="margin:6px 4px">${foot ? foot + '. ' : ''}${teen ? 'مشاركة الموقع مع الوالد لا تُطفأ.' : ''}</p>
  ${callout(`في الخطر اضغط زر الاستغاثة ${S.sos2 ? 'ثم أكّد' : '3 ثوانٍ'}: يصل مكانك ${teen ? 'لأهلك' : 'لبابا وماما'} فوراً.`, '', 'sos')}`;
}

/* ما يراه الأبناء: «الطفل يرى موقعه وموقع من يشاركه الأب» (LO-01 و§9-4). المواصفة تذكر القرار ولا تذكر له تحكماً ولا مفتاح صلاحية: فجوة مرفوعة للمالك. */
surface('loc-share', {
  t: 'ما يراه الأبناء', sys: 'S1-07', p: 'owner', req: '07:11,12',
  note: 'الأب يقرر من يظهر لكل ابن من إخوته على خريطته. الافتراضي: كل ابن يرى مكانه فقط. من يُعرض مكانه يجد اسم أخيه في «من يرى مكاني». الأخ يرى المكان الحالي فقط: لا سجل تنقل ولا بطارية. التغيير يحتاج اتصالاً. المواصفة تذكر «من يشاركه الأب» ولا تذكر أين يقرر الأب ذلك ولا بأي صلاحية (فجوة مرفوعة).',
  r() {
    if (!isOwner()) return empty('lock', 'هذا القرار لصاحب العائلة', 'أحمد هو من يحدد ما يراه الأبناء من مواقع إخوتهم.');
    return `${callout('كل ابن يرى مكانه هو فقط. هنا تختار من يظهر له من إخوته.<br>من تُظهر مكانه يعرف من يراه، والأخ يرى المكان الحالي فقط بلا سجل تنقل.', '', 'visibility')}
    ${offline() ? callout('أنت دون اتصال: التغيير هنا يحتاج اتصالاً.', 'wa', 'cloud_off') : ''}
    ${KIDS.map(k => sec(`على خريطة ${pname(M[k])}`) + list(KIDS.filter(s => s !== k).map(s => row('', pname(M[s]), sibSeen(k).includes(s) ? `${vb(M[s], 'يظهر', 'تظهر')} ${vb(M[k], 'له', 'لها')} الآن` : `لا ${vb(M[s], 'يظهر', 'تظهر')}`, { lead: av(M[s]), tg: sibSeen(k).includes(s), ta: `shareT:${k}:${s}` })))).join('')}
    <p class="xs muted" style="margin:10px 4px">مكان الأبناء الدقيق يبقى ظاهراً لك دائماً مهما اخترت هنا.</p>`;
  },
});
Object.assign(ACT, {
  shareT(k, s) {
    if (offline()) { toast('يحتاج اتصالاً بالإنترنت', null, 'cloud_off'); return; }
    const L = S.locShare = S.locShare || {}, A = L[k] = L[k] || [], i = A.indexOf(s);
    if (i >= 0) A.splice(i, 1); else A.push(s);
    toast(i >= 0 ? `${pname(M[k])} لم ${vb(M[k], 'يعد يرى', 'تعد ترى')} مكان ${pname(M[s])}` : `${pname(M[k])} ${vb(M[k], 'يرى', 'ترى')} مكان ${pname(M[s])} الآن`, null, 'visibility');
  },
});

/* ---------- LO-02 موقع فرد ---------- */
surface('loc', {
  t: id => (isAdult() ? 'موقع ' + pname(M[id] || M.khaled) : 'موقعي'), sys: 'S1-07', p: 'any', a: ['khaled'], req: '07:2,3,6,11,12',
  note: 'آخر موقع لفرد واحد بوسمه الصادق: حي أم آخر موقع معروف، وسبب القِدم بكلمة مفهومة (جهازه بلا اتصال، مغلق، iPhone، أنت دون اتصال). الدقة الضعيفة تُرسم دائرة لا نقطة. من هنا: مراسلة، اتصال، سجل التنقل. الطفل يرى موقعه هو فقط.',
  r(id) {
    if (!isAdult()) return id === me().id ? locSelf() : empty('location_off', 'هذه التفاصيل للأهل', 'تجد مكانك ومن تراه من إخوتك في «موقعي».', btn('موقعي', 'go:map', 'sm sec'));
    const m = M[id];
    if (!m || !S.kid[id]) return empty('location_off', 'لا يوجد فرد بهذا الوصف', '');
    if (!can('location.view', id)) return empty('location_off', `موقع ${pname(m)} غير مسموح لكِ`, 'لم يُسمح لكِ برؤية موقعه.', why('nd:location.view'));
    const l = locOf(id), sos = S.sos && S.sos.from === id && S.sos.st === 'sent';
    const talk = `<div class="btns">${btn('مراسلة ' + pname(m), 'locMsg:' + id, 'sec', 'chat')}${btn('اتصال', 'locCall:' + id, 'sec', 'call')}</div>`;
    if (l.none) return `${empty('location_off', 'لا موقع معروف بعد', `لم يرسل جهاز ${pname(m)} موقعاً حتى الآن. يظهر هنا عند أول اتصال له.`)}${talk}`;
    return `${sos ? `<button class="callout da" style="width:100%;text-align:start" data-a="go:sos-status">${ic('sos')}<div><b>${m.n} ${vb(m, 'يستغيث', 'تستغيث')} الآن</b><br>افتح التنبيه</div></button>` : ''}
    <div class="card fx">${av(m, 'lg')}<div class="grow"><b style="font-size:calc(19px*var(--ts))">${S.privacy ? 'المكان مخفي (وضع الخصوصية)' : l.place}</b><div class="sm muted">${locLine(l)}</div><div class="chips" style="margin-top:6px">${l.live ? chip('موقع حي', 'ok', 'check') : chip('ليس موقعاً حياً', 'stale', 'history')}${batChip(l)}</div></div></div>
    ${l.live ? '' : callout(`<b>آخر موقع معروف ${minTxt(l.ago)}</b><br>${locWhy(l, m)}. قد ${vb(m, 'يكون', 'تكون')} في مكان آخر الآن.${l.why === 'ios' ? ' ' + why('ios') : ''}`, 'wa', 'history')}
    ${fMap(210, { ids: [id], big: 1 })}<div class="gap"></div>
    ${list(row('schedule', 'آخر تحديث', '', { v: minTxt(l.ago) }), row('location_on', 'الدقة', l.poor ? `تقريبي: ${vb(m, 'هو', 'هي')} في مكان ما داخل الدائرة` : '', { v: l.poor ? `ضمن ${l.acc} متراً` : `بحدود ${l.acc} متراً` }), row(l.low ? 'battery_alert' : 'battery_5_bar', 'البطارية', l.low ? 'منخفضة: يقلّ تحديث الموقع ليبقى ما يكفي للاستغاثة' : '', { v: l.bat + '%' }), distTxt(l) ? row('route', 'البعد عنك', l.live ? 'تقريبي' : 'من آخر موقع معروف', { v: distTxt(l).replace('يبعد ', '') }) : '')}
    ${l.low && l.why !== 'off' ? `<div class="gap"></div>${btn(`اطلب من ${pname(m)} شحن الهاتف`, 'locMsg:' + id, 'ton', 'chat')}` : ''}<div class="gap"></div>${talk}<div class="gap"></div>
    ${list(row('route', 'الاتجاهات', l.live ? 'يفتح تطبيق الخرائط في هاتفك' : 'إلى آخر موقع معروف', { a: 'locDir:' + id }), can('location.history.view', id) ? row('history', 'سجل التنقل', 'آخر 7 أيام', { a: 'go:history:' + id }) : row('history', 'سجل التنقل', avail('not_delegated'), { a: 'denied:location.history.view', c: 'dis' }))}`;
  },
});
Object.assign(ACT, {
  locMsg(id) { if (S.chat['dm-' + id]) go('thread', 'dm-' + id); else go('chat'); },
  locCall(id) { toast(`يفتح تطبيق الهاتف للاتصال ب${pname(M[id])}`, null, 'call'); },
});

/* ---------- LO-05 سجل التنقل ---------- */
const HDAYS = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'أمس', 'اليوم'];
/* محطات اليوم: أين بقي ومتى. بيانات توضيحية. الفجوة (gap) صادقة: لا بيانات حين كان الجهاز مغلقاً. */
function histOf(id, d) {
  const H = { p: AD_HOME, x: 36, y: 60 }, C = { p: AD_SCHOOL, x: 68, y: 30 }, K = { p: 'شعوب · شارع مأرب', x: 22, y: 34 };
  const st = (o, t, to, bat, x) => Object.assign({ t, to, bat, acc: 12 }, o, x || {});
  if (id === 'yusuf') return d === 4 ? [st(H, '12:00 ص', '3:30 م', 90), st(K, '4:05 م', '8:40 م', 71), st(H, '9:10 م', '11:59 م', 64)] : [st(H, '12:00 ص', d === 6 ? 'الآن' : '11:59 م', 88)];
  if (id === 'khaled' && d === 2) return [];
  if (d === 4) return [st(H, '12:00 ص', '3:30 م', 80), st(K, '4:05 م', '8:40 م', 62), st(H, '9:10 م', '11:59 م', 55)];
  const A = [st(H, '12:00 ص', '6:40 ص', 96), st(C, '7:05 ص', '1:10 م', 83)];
  if (id === 'khaled' && d === 5) A.push({ gap: 1, t: '1:10 م', to: '2:20 م' });
  if (id === 'khaled' && d === 6) return A.concat(st(H, '1:35 م', '3:40 م', 71), st(C, '4:05 م', 'الآن', 64, { acc: 80 }));
  return A.concat(st(H, id === 'khaled' && d === 5 ? '2:20 م' : '1:35 م', d === 6 ? 'الآن' : '11:59 م', d === 6 ? 41 : 58));
}
surface('history', {
  t: id => 'سجل تنقل ' + pname(M[id] || M.layan), sys: 'S1-07', p: 'adult', a: ['layan'], req: '07:6,12,13,14',
  note: 'سجل 7 أيام: أين بقي كل يوم ومتى. محطات اليوم من الأقدم إلى الأحدث (Q-386)، وشرائح الأيام تبدأ باليوم لأنه الأكثر طلباً. المحطة تُلمس فتُعلَّم على الخريطة. الفترة التي كان فيها الجهاز مغلقاً تُكتب «بلا بيانات» ولا تُملأ تخميناً. لا تشغيل مسار متحرك ولا حذف يدوي. الدقة تُذكر فقط حين تكون ضعيفة (اختيار تصميم: المواصفة تعرضها في كل نقطة).',
  r(id) {
    if (!isAdult()) return kidNo();
    if (!M[id] || !S.kid[id]) id = 'layan';
    if (!can('location.history.view', id)) return empty('history', `سجل تنقل ${pname(M[id])} غير مسموح لكِ`, 'رؤية السجل صلاحية يعطيها أحمد.', why('nd:location.history.view'));
    const d = S.hDay ?? 6, P = histOf(id, d), stops = P.filter(p => !p.gap), on = S.hPt ?? -1, kids = KIDS.filter(k => can('location.history.view', k));
    return `${kids.length > 1 ? `<div class="fch">${kids.map(k => `<button aria-pressed="${k === id}" data-a="histKid:${k}">${av(M[k], 'sm')}${pname(M[k])}</button>`).join('')}</div>` : ''}
    <div class="fch">${HDAYS.map((n, i) => `<button aria-pressed="${i === d}" data-a="histDay:${i}">${n}</button>`).reverse().join('')}</div>
    ${offline() ? callout('أنت دون اتصال: يُعرض ما حُفظ على هاتفك من السجل.', 'wa', 'cloud_off') : ''}
    ${stops.length ? `${fMap(180, { ids: [], pts: stops, hon: on })}<div class="gap"></div>${list(P.map(p => { if (p.gap) return row('cloud_off', 'بلا بيانات', `${p.t} – ${p.to} · الجهاز كان مغلقاً أو بلا اتصال`, { c: 'dis' }); const i = stops.indexOf(p);
      return row('', S.privacy ? '••••' : p.p, `${p.t} – ${p.to}${p.acc > LOC_POOR ? ` · موقع تقريبي (ضمن ${p.acc} متراً)` : ''}`, { lead: `<span class="lead hn ${on === i ? 'on' : ''}">${i + 1}</span>`, a: 'histPt:' + i, chev: false, v: chip(p.bat + '%', p.bat < BAT_LOW ? 'da' : 'ol', p.bat < BAT_LOW ? 'battery_alert' : 'battery_5_bar') }); }))}`
      : empty('history', 'لا نقاط في هذا اليوم', `لم يرسل جهاز ${pname(M[id])} موقعاً في هذا اليوم.`)}
    ${callout('يبقى السجل 7 أيام ثم يُحذف من نفسه. لا يُحذف يدوياً ولا تُمدّ مدته.', 'nt', 'delete')}`;
  },
});
Object.assign(ACT, {
  histDay(i) { S.hDay = +i; S.hPt = -1; },
  histPt(i) { S.hPt = S.hPt === +i ? -1 : +i; },
  histKid(id) { S.stack[S.stack.length - 1].a = [id]; S.hPt = -1; },
});

/* ---------- LO-04 جهات الطوارئ ---------- */
const SMS_Q = { free: 20, basic: 50, premium: 100 };
const smsLeft = () => (S.smsOut ? 0 : Math.max(0, SMS_Q[S.plan] - S.sms.used));
const smsEm = () => S.smsEm ?? 3;
/* من يصله تنبيه الاستغاثة: كل بالغ في العائلة غير المستغيث، ثم جهات الطوارئ التي أضافها الأب. بهذا الترتيب تُرسل الرسائل النصية. */
function sosRcp(from) { return ['ahmad', 'sara'].filter(id => id !== from).map(id => ({ n: M[id].n, m: id })).concat((S.ec || []).map(c => ({ n: c.n, ext: 1 }))); }
surface('emergency', {
  t: 'جهات الطوارئ', sys: 'S1-07', p: 'adult', req: '07:9,10,17 04:11',
  note: 'كل بالغ في العائلة يصله تنبيه الاستغاثة بلا إضافة. هنا يضيف الأب من هم خارج البيت: قريباً أو جاراً برقمه (Q-287). الجهة الخارجية يصلها اسم المستغيث ومكانه فقط، ولا ترى الخريطة. الإضافة والحذف للأب وحده ويحتاجان الإنترنت. منتقي «بالغ من العائلة» في المواصفة أُسقط: البالغون يصلهم التنبيه أصلاً (اختيار تصميم).',
  r() {
    if (!isAdult()) return kidNo();
    const own = isOwner(), C = S.ec || [], q = SMS_Q[S.plan], left = smsLeft(), em = smsEm(), per = sosRcp('layan').length;
    return `${sec('يصلهم التنبيه دائماً')}${list(row('', M.ahmad.n, 'صاحب العائلة', { lead: av(M.ahmad) }), row('', M.sara.n, 'بالغة في العائلة', { lead: av(M.sara) }))}
    <p class="xs muted" style="margin:6px 4px">كل بالغ في العائلة يصله تنبيه الاستغاثة ومكان المستغيث، بلا إضافة.</p>
    ${sec('من خارج البيت')}${C.length ? list(C.map(c => row('contact_emergency', c.n, `<span class="ltr">${c.p}</span> · أضافه ${c.by} ${c.at}`, { v: own ? `<button class="ib" data-a="ecDel:${c.id}" aria-label="حذف ${c.n}">${ic('delete')}</button>` : '' })))
      : empty('contact_emergency', 'لا أحد من خارج البيت بعد', 'أضف قريباً أو جاراً تثق به: يصله اسم المستغيث ومكانه عند كل استغاثة، ولا يرى الخريطة.')}
    ${own ? (offline() ? callout('الإضافة والحذف يحتاجان الإنترنت. القائمة المعروضة هي المحفوظة على هاتفك.', 'wa', 'cloud_off') : btn('أضف جهة طوارئ', 'ecNew', '', 'add')) : `<p class="sm muted" style="margin:8px 4px">${ic('lock')} يضيفهم ويحذفهم أحمد وحده.</p>`}
    ${sec('إن انقطع الإنترنت')}<div class="card"><div class="sm">عند الاستغاثة بلا إنترنت يرسل الهاتف رسالة نصية بالمكان إلى كل واحد: <b>${per} ${per > 2 && per < 11 ? 'رسائل' : per === 2 ? 'رسالتان' : 'رسالة'}</b> لكل استغاثة.</div>
    <div class="fx sb sm" style="margin-top:10px"><b>رصيد الرسائل هذا الشهر</b><span>${left} باقية من ${q}</span></div><div style="margin:8px 0">${pbar((q - left) / q * 100, left / q < .2 ? 'wa' : '')}</div>
    <div class="xs muted">بعد نفاد الرصيد تبقى 3 رسائل للاستغاثة فقط كل شهر${em < 3 ? ` · الباقي منها ${em}` : ''}.</div></div>
    ${left + em < per ? callout(`<b>الرصيد لا يكفي لإبلاغ الجميع بلا إنترنت</b><br>${left + em ? `تصل الرسالة إلى ${left + em} من ${per} بهذا الترتيب: أنت، ثم البالغون، ثم من خارج البيت.` : 'لن تُرسل أي رسالة نصية. تبقى الاستغاثة محفوظة في الهاتف وتُرسل فور عودة الإنترنت.'}${own ? `<div style="margin-top:8px">${btn('تعبئة الرصيد', 'go:topup', 'sm')}</div>` : ''}`, 'wa', 'sms') : ''}`;
  },
});
surface('ec-add', {
  kind: 'sheet', t: 'جهة طوارئ جديدة', sys: 'S1-07', p: 'owner', req: '07:10',
  note: 'اسم ورقم جوال. الخطأ يظهر بجانب حقله. بلا أرقام افتراضية (Q-287).',
  r() { const f = S.ecF || {};
    return `<h4>جهة طوارئ جديدة</h4><p class="d">قريب أو جار تثق به. يصله عند كل استغاثة اسم المستغيث ومكانه. لا يرى الخريطة ولا يتابع أحداً.</p>
    <label class="fld ${f.en ? 'err' : ''}"><span>الاسم</span><input id="ecN" placeholder="مثال: العم ناصر" value="${f.n || ''}">${f.en ? `<small>${f.en}</small>` : ''}</label>
    <label class="fld ${f.ep ? 'err' : ''}"><span>رقم الجوال</span><input id="ecP" inputmode="tel" dir="ltr" placeholder="77 123 4567" value="${f.p || ''}"><small>${f.ep || 'رقم جوال يستقبل الرسائل النصية. خارج اليمن: اكتبه مع مفتاح الدولة (+).'}</small></label>
    ${btn('أضف', 'ecSave')}<div class="gap"></div>${btn('إلغاء', 'close', 'txt')}`; },
});
Object.assign(ACT, {
  ecNew() { S.ecF = {}; go('ec-add'); },
  ecSave() {
    const n = (($('#ecN') || {}).value || '').trim(), raw = (($('#ecP') || {}).value || '').trim(), f = S.ecF = { n, p: raw };
    const intl = /^(\+|00)/.test(raw), dg = raw.replace(/\D/g, '').replace(/^00/, '');
    if (n.length < 2) f.en = 'اكتب اسماً تعرفه به';
    const loc = !intl && dg.replace(/^967/, '');
    if (!dg) f.ep = 'اكتب رقم الجوال';
    else if (intl ? dg.length < 8 || dg.length > 15 : !/^7[01378]\d{7}$/.test(loc)) f.ep = intl ? 'الرقم غير مكتمل' : 'رقم الجوال اليمني 9 أرقام ويبدأ بـ 70 أو 71 أو 73 أو 77 أو 78';
    const p = intl ? '+' + dg : `+967 ${loc.slice(0, 2)} ${loc.slice(2, 5)} ${loc.slice(5)}`;
    if (!f.ep && (S.ec || []).some(c => c.p.replace(/\D/g, '') === p.replace(/\D/g, ''))) f.ep = 'هذا الرقم مضاف من قبل';
    if (f.en || f.ep) return;
    S.ec = (S.ec || []).concat({ id: 'e' + Date.now().toString(36), n, p, by: me().n, at: 'الآن' }); S.ecF = null; S.sheet = null;
    if (S.checklist) S.checklist.emergency = 1;
    audit(`أُضيفت جهة طوارئ: ${n}`, 'location.emergency.manage'); toast(`أُضيف ${n} إلى جهات الطوارئ`);
  },
  /* للاستوديو والرحلات: جهة جاهزة بنقرة */
  ecAdd() { S.ec = (S.ec || []).concat({ id: 'e' + ((S.ec || []).length + 1), n: 'العم ناصر', p: '+967 77 123 4567', by: 'أحمد', at: 'الآن' }); if (S.checklist) S.checklist.emergency = 1; toast('أُضيفت جهة الطوارئ'); },
  ecDel(id) {
    const c = (S.ec || []).find(x => x.id === id); if (!c) return;
    if (offline()) { toast('الحذف يحتاج الإنترنت', null, 'cloud_off'); return; }
    confirmDlg(`حذف ${c.n}؟`, 'لن تصله الاستغاثات القادمة.', 'حذف', () => { const keep = S.ec.slice(); S.ec = S.ec.filter(x => x.id !== id); audit(`حُذفت جهة طوارئ: ${c.n}`, 'location.emergency.manage'); toast(`حُذف ${c.n}`, () => { S.ec = keep; }); }, true);
  },
});

/* ---------- LO-03 الاستغاثة عند المرسِل ---------- */
let sosTimer;
surface('sos-count', {
  kind: 'full', cls: 'red', t: 'عدّ تنازلي للاستغاثة', sys: 'S1-07', p: 'any', req: '07:7 01:7',
  note: 'ضغط مطوّل 3 ثوانٍ، ثم 10 ثوانٍ للإلغاء قبل الإرسال (Q-286). الإلغاء هنا لا يرسل شيئاً ولا يُحسب من الرصيد. بعد الإرسال لا يلغيها المرسِل.',
  r() { return `<div class="body" style="justify-content:center"><p class="ttl">تُرسل الاستغاثة بعد</p><div class="cnt">${S.sosN}</div><p class="sub">سيصل مكانك الآن إلى ${me() && me().role === 'adult' ? 'كل البالغين في العائلة' : 'بابا وماما'}${(S.ec || []).length ? ' وجهات الطوارئ' : ''}.</p>${btn('ضغطت بالخطأ · ألغِ', 'sosCancel', 'sec" style="background:#fff;color:#B42318;box-shadow:none;min-height:64px;font-size:20px')}<div class="gap"></div>${btn('أرسل الآن', 'sosSend', 'txt" style="color:#fff;width:100%')}</div>`; },
});
surface('sos-sent', {
  kind: 'full', cls: 'red', t: 'حالة الاستغاثة', sys: 'S1-07', p: 'any', req: '07:7,8,9,17 04:11 01:7',
  note: 'حالة صادقة عند المرسِل: وصلت إلى كم من كم، ومن أكّد أنه في الطريق، وبأي طريق أُرسلت. بلا إنترنت تُرسل رسالة نصية بالمكان. إن لم يبقَ رصيد رسائل تُكتب «معلّقة» ولا تُعرض كأنها أُرسلت. على iPhone بلا إنترنت تُفتح رسالة جاهزة يضغط المستخدم إرسالها (Q-229، Q-238). بلا موقع جديد تُرسل بآخر موقع معروف مع عمره (Q-288). المرسِل لا يلغي استغاثة أُرسلت: يغلقها الأب (Q-286). ضغط الزر مرة ثانية يعيد هذه الشاشة ولا يرسل تنبيهاً ثانياً.',
  r() {
    const s = S.sos, R = s.R || sosRcp(s.from), tot = R.length, got = s.got ?? tot, kid = !isAdult(), dad = kid ? (me().role === 'teen' ? 'والدك' : 'بابا') : 'سارة';
    const W = 'sec" style="background:#fff;color:#B42318;box-shadow:none', T = 'txt" style="color:#fff;width:100%';
    const box = h => `<div style="background:#ffffff1a;border-radius:18px;padding:6px 14px">${h}</div>`, ln = (a, b, last) => `<div class="fx sb" style="padding:9px 0;${last ? '' : 'border-bottom:1px solid #ffffff22'}"><span>${a}</span><b style="text-align:end">${b}</b></div>`;
    const where = s.fix === 'last' ? ln('المكان المرسل', `${s.place} · آخر مكان معروف ${minTxt(s.lk || 18)}`, 1) : ln('مكانك المرسل', s.place, 1);
    const call = btn(`اتصل ب${dad} الآن`, 'sosCallOut', W, 'call');
    if (s.st === 'resolved') return `<div class="body"><div style="flex:1;display:flex;flex-direction:column;justify-content:center"><div class="bigic">${ic('check_circle')}</div><p class="ttl">انتهت الاستغاثة</p><p class="sub">أغلقها ${s.by || 'أحمد'}.</p></div>${btn('أغلق', 'close', W)}</div>`;
    if (s.pend === 'quota') return `<div class="body"><div style="flex:1;display:flex;flex-direction:column;justify-content:center"><div class="bigic">${ic('schedule')}</div><p class="ttl">الاستغاثة معلّقة</p><p class="sub">لم تُرسل بعد: لا إنترنت الآن، ورصيد الرسائل النصية انتهى. تُرسل من نفسها فور عودة الإنترنت.</p>${box(ln('الرسائل الطارئة الباقية', `${smsEm()} من 3`) + where)}<p class="c" style="font-size:14px;margin:14px 0 0"><b>لا تنتظر: اتصل الآن.</b></p></div>${call}<div class="gap"></div>${btn('أخفِ هذه الشاشة', 'close', T)}</div>`;
    if (s.pend === 'composer') return `<div class="body"><div style="flex:1;display:flex;flex-direction:column;justify-content:center"><div class="bigic">${ic('sms')}</div><p class="ttl">لم تُرسل الاستغاثة بعد</p><p class="sub">لا إنترنت الآن. جهّزنا رسالة نصية فيها مكانك إلى ${R.map(r => r.n).join(' و')}. افتحها واضغط «إرسال».</p>${box(where)}</div>${btn('افتح الرسالة وأرسلها', 'sosCompose', W, 'sms')}<div class="gap"></div>${call.replace(W, T)}</div>`;
    const sms = s.ch === 'sms';
    return `<div class="body"><div style="flex:1;display:flex;flex-direction:column;justify-content:center"><div class="bigic">${ic(s.ack ? 'done_all' : 'sos')}</div><p class="ttl">${s.ack ? `${s.ack} في الطريق إليك` : 'أُرسلت استغاثتك'}</p><p class="sub">وصلت إلى ${got} من ${tot} · ${sms ? 'برسالة نصية' : 'عبر الإنترنت'}</p>
    ${box(R.map((r, i) => ln(r.n, `<span class="fx" style="gap:5px;font-size:13px;justify-content:flex-end">${ic(s.ack === r.n ? 'directions_walk' : i < got ? 'done_all' : 'schedule')}${s.ack === r.n ? 'في الطريق' : i < got ? 'وصلت' : 'لم تُرسل بعد'}</span>`)).join('') + where)}
    ${sms ? `<p class="c" style="font-size:13px;opacity:.9;margin:12px 0 0">لا يوجد إنترنت، فأرسلنا رسالة نصية بمكانك.${got < tot ? ' الرصيد لم يكفِ للجميع: الباقون يصلهم التنبيه فور عودة الإنترنت.' : ''}${s.em || !smsLeft() ? ` الباقي ${smsEm()} من 3 رسائل طارئة.` : ''}</p>` : ''}
    ${s.fix === 'last' ? `<p class="c" style="font-size:13px;opacity:.9;margin:10px 0 0">لم يلتقط الهاتف مكاناً جديداً، فأرسلنا آخر مكان معروف. نحاول تحديد مكانك الآن.</p>` : ''}
    <p class="c" style="font-size:13px;opacity:.9;margin:10px 0 0">ضغطت بالخطأ؟ أخبر ${dad}: هو من يغلق الاستغاثة.</p></div>
    ${call}<div class="gap"></div>${btn('أخفِ هذه الشاشة · تعود بزر الاستغاثة', 'close', T)}</div>`;
  },
});
/* إرسال الرسائل النصية بلا إنترنت: من رصيد الشهر أولاً، ثم من الثلاث الطارئة. بالترتيب: الأب، البالغون، جهات الطوارئ. */
function sosSms(s) {
  const n = (s.R || sosRcp(s.from)).length, fromQ = Math.min(smsLeft(), n), fromE = Math.min(smsEm(), n - fromQ);
  s.got = fromQ + fromE; s.tot = n; S.sms.used += fromQ; if (fromE) { S.smsEm = smsEm() - fromE; s.em = 1; }
  if (!s.got) { s.st = 'pending'; s.pend = 'quota'; } else { s.st = 'sent'; s.pend = ''; }
}
/* عودة الإنترنت: المعلّقة تُرسل عبر الخادم، والمرسلة نصياً تُطابَق معه بلا تنبيه ثانٍ. */
function sosFlush() {
  const s = S.sos; if (!s || s.st === 'resolved') return;
  const R = s.R || sosRcp(s.from);
  if (s.st === 'pending') { s.st = 'sent'; s.pend = ''; s.ch = 'server'; s.via = 'عبر الإنترنت'; }
  s.got = s.tot = R.length;
}
Object.assign(ACT, {
  sosStart() {
    const mine = S.sos && S.sos.from === PERSONA[S.persona].m && S.sos.st !== 'resolved';
    S.sheet = null; S.dlg = null;
    if (mine) { S.full = { id: 'sos-sent', a: [] }; return; }   /* استغاثة قائمة: تُعاد حالتها ولا يُنشأ تنبيه ثانٍ */
    S.sosN = 10; S.full = { id: 'sos-count', a: [] }; clearInterval(sosTimer);
    sosTimer = setInterval(() => { S.sosN -= 1; if (S.sosN <= 0) { ACT.sosSend(); render(); } else if (S.full && S.full.id === 'sos-count') renderOv(); }, 1000);
  },
  sosCancel() { clearInterval(sosTimer); S.full = null; toast('أُلغيت الاستغاثة · لم يُرسل شيء'); },
  sosSend() {
    clearInterval(sosTimer);
    const id = PERSONA[S.persona].m, off = offline(), R = sosRcp(id), k = S.kid[id];
    const s = S.sos = { from: id, st: 'sent', ch: off ? 'sms' : 'server', via: off ? 'عبر SMS (دون اتصال)' : 'عبر الإنترنت', place: k ? k.place : AD_HOME, fix: S.gpsOff ? 'last' : 'new', lk: 18, ack: null, exh: 0, pend: '', R, got: R.length, tot: R.length };
    if (off) { if (S.os === 'ios') { s.st = 'pending'; s.pend = 'composer'; } else sosSms(s); }
    S.full = { id: 'sos-sent', a: [] };
  },
  /* iPhone بلا إنترنت: النظام يفتح رسالة جاهزة والمستخدم يضغط إرسال. الحوار هنا يحاكي ذلك. إغلاقه بلا إرسال يُبقي الاستغاثة «لم تُرسل». */
  sosCompose() { const s = S.sos; confirmDlg('رسالة الاستغاثة جاهزة', `في الهاتف الحقيقي تُفتح هنا رسالة نصية مكتوبة فيها مكانك إلى ${(s.R || sosRcp(s.from)).map(r => r.n).join(' و')}، وتضغط «إرسال» بنفسك.`, 'ضغطتُ إرسال', () => { s.st = 'sent'; s.pend = ''; s.ch = 'sms'; }); },
  sosCallOut() { toast('يفتح تطبيق الهاتف للاتصال', null, 'call'); },
  sosCall() { toast(`يفتح تطبيق الهاتف للاتصال ب${S.sos ? M[S.sos.from].n : ''}`, null, 'call'); },
});

/* ---------- LO-06 الاستغاثة عند الأهل ---------- */
const sosStTxt = s => (s.st === 'resolved' ? ['حُلّت', 'ok', 'check'] : s.exh ? ['لم يؤكد أحد', 'da', 'priority_high'] : s.ack ? [`أكّد ${s.ack}`, 'in', 'done_all'] : ['لم يؤكد أحد بعد', 'wa', 'schedule']);
surface('sos-status', {
  t: 'استغاثة', sys: 'S1-07', p: 'adult', req: '07:8,9,16,17,18 09:3',
  note: 'تنبيه الاستغاثة عند الأهل: من، وأين لحظتها، وبأي طريق وصل، ومن أكّد. «أنا في الطريق» يؤكد الاستلام ويراه المستغيث فوراً. «حُلّ الأمر» يغلق التنبيه عند الجميع ولا تراجع فيه. إن لم يؤكد أحد يُعاد التنبيه بعد 5 دقائق ثم على فترات، خمس مرات، وبعدها يبقى ظاهراً بشارة «لم يؤكد أحد» ولا يسقط (Q-284). التأكيد والحل يحتاجان الإنترنت؛ والاتصال الهاتفي متاح دائماً.',
  r() {
    if (!isAdult()) return kidNo();
    const s = S.sos && S.sos.st !== 'pending' ? S.sos : null;
    if (!s) return `${empty('check_circle', 'لا استغاثة الآن', 'كل شيء على ما يرام. عند ضغط أي فرد زر الاستغاثة يظهر التنبيه هنا مع مكانه.')}${list(row('history', 'الاستغاثات السابقة', '', { a: 'go:sos-log' }), row('contact_emergency', 'جهات الطوارئ', '', { a: 'go:emergency' }))}`;
    const m = M[s.from], k = S.kid[s.from], R = s.R || sosRcp(s.from), got = s.got ?? R.length, st = sosStTxt(s), off = offline(), sms = s.ch === 'sms' || /SMS/.test(s.via || '');
    if (s.from === me().id) return `${empty('sos', 'هذه استغاثتك أنت', 'يغلقها بالغ آخر في العائلة.')}${btn('حالة استغاثتي', 'sosStart', 'sec')}`;
    const ackOk = can('location.sos.acknowledge'), resOk = can('location.sos.resolve');
    return `<div class="card" style="border-color:var(--danger);background:var(--danger-soft)"><div class="fx">${av(m, 'lg')}<div class="grow"><b style="font-size:calc(20px*var(--ts))">${m.n} ${vb(m, 'يستغيث', 'تستغيث')}</b><div class="sm">${s.st === 'resolved' ? 'انتهت' : 'قبل لحظات'} · ${sms ? 'برسالة نصية' : 'عبر الإنترنت'}</div><div style="margin-top:6px">${chip(st[0], st[1], st[2])}</div></div></div></div>
    ${s.st !== 'resolved' && s.exh ? callout('<b>لم يؤكد أحد استلام هذه الاستغاثة</b><br>أُعيد التنبيه خمس مرات خلال ساعة ونصف، ثم توقف. أُرسلت رسالة نصية إلى أحمد. التنبيه باقٍ هنا حتى يُغلق.', 'da', 'priority_high') : ''}
    ${s.fix === 'last' ? callout(`<b>هذا آخر مكان معروف ${minTxt(s.lk || 18)}، لا مكان اللحظة</b><br>لم يلتقط الهاتف مكاناً جديداً عند الاستغاثة. يتحدّث هنا فور التقاطه.`, 'wa', 'history') : ''}
    ${fMap(200, { ids: k ? [s.from] : [], big: 1 })}<div class="gap"></div>
    ${list(row('location_on', S.privacy ? '••••' : s.place, s.fix === 'last' ? 'آخر مكان معروف قبل الاستغاثة' : 'المكان لحظة الاستغاثة', {}),
      k ? row(k.bat < BAT_LOW ? 'battery_alert' : 'battery_5_bar', 'بطارية الجهاز', '', { v: k.bat + '%' }) : '',
      row(sms ? 'sms' : 'done_all', 'وصل إلى', R.slice(0, got).map(r => r.n).join(' · ') + (got < R.length ? ` · لم يصل بعد: ${R.slice(got).map(r => r.n).join(' · ')}` : ''), {}),
      sms ? row('verified', 'رسالة موثّقة', `تحقّق التطبيق أنها من جهاز ${m.n}`, {}) : '',
      s.st !== 'resolved' && !s.ack && !s.exh ? row('notifications_active', 'إن لم يؤكد أحد', 'يُعاد التنبيه للجميع بعد 5 دقائق', {}) : '')}
    ${s.st === 'resolved' ? callout(`<b>أغلقها ${s.by || 'أحمد'}</b>${s.note ? `<br>${s.note}` : ''}<br>سُجّل الإغلاق في سجل العائلة.`, 'ok', 'check_circle')
      : `${off ? callout('أنت دون اتصال: التأكيد والإغلاق يحتاجان الإنترنت. <b>اتصل هاتفياً الآن.</b>', 'wa', 'cloud_off') : ''}
      <div class="btns">${btn('اتصل ب' + m.n, 'sosCall', off ? '' : 'sec', 'call')}${s.ack === me().n ? `<span class="btn ton" style="pointer-events:none">${ic('done_all')}أكّدتَ الاستلام</span>` : btn('أنا في الطريق', off ? 'sosOff' : ackOk ? 'sosAck' : 'denied:location.sos.acknowledge', off ? 'sec dis' : 'ton', ackOk ? '' : 'lock')}</div><div class="gap"></div>
      ${btn('حُلّ الأمر · أغلق الاستغاثة', off ? 'sosOff' : resOk ? 'go:sos-resolve' : 'denied:location.sos.resolve', off ? 'sec dis' : resOk ? 'ok' : 'sec', resOk ? 'check' : 'lock')}`}
    <div class="gap"></div>${list(row('history', 'الاستغاثات السابقة', '', { a: 'go:sos-log' }))}`;
  },
});
surface('sos-resolve', {
  kind: 'sheet', t: 'إغلاق الاستغاثة', sys: 'S1-07', p: 'adult', req: '07:18',
  note: 'الحل يوقف التنبيه والتذكيرات عند الجميع فوراً ويُسجَّل. لا تراجع فيه. الملاحظة اختيارية.',
  r() { const s = S.sos; if (!s) return `<h4>لا استغاثة الآن</h4>${btn('أغلق', 'close', 'sec')}`; const m = M[s.from];
    return `<h4>هل انتهى الأمر؟</h4><p class="d">يتوقف التنبيه عند الجميع، ${vb(m, 'ويُبلَّغ', 'وتُبلَّغ')} ${m.n} أنك أغلقته. <b>لا تراجع بعد الإغلاق.</b></p>
    <label class="fld"><span>ملاحظة (اختياري)</span><input id="sosNote" placeholder="مثال: ضغطت الزر بالخطأ"></label>
    ${btn('نعم، أغلق الاستغاثة', 'sosDone', 'ok', 'check')}<div class="gap"></div>${btn('ليس بعد', 'close', 'txt')}`; },
});
surface('sos-log', {
  t: 'تنبيهات الاستغاثة', sys: 'S1-07', p: 'adult', req: '07:8,16,18',
  note: 'الاستغاثة الحالية إن وُجدت، ثم السابقة بمن أغلقها وملاحظته. استغاثة لم يؤكدها أحد تبقى هنا بشارتها. مدة بقاء الاستغاثات السابقة غير مذكورة في المواصفة (فجوة مسجلة).',
  r() {
    if (!isAdult()) return kidNo();
    const cur = S.sos && S.sos.st !== 'pending' && S.sos.from !== me().id ? S.sos : null, past = S.sosLog || [];
    if (!cur && !past.length) return empty('check_circle', 'لا تنبيهات استغاثة', 'كل شيء على ما يرام.');
    const st = cur && sosStTxt(cur);
    return `${cur ? sec(cur.st === 'resolved' ? 'الأخيرة' : 'الآن') + list(row('sos', `${M[cur.from].n} · ${S.privacy ? '••••' : cur.place}`, cur.st === 'resolved' ? `أغلقها ${cur.by || 'أحمد'}${cur.note ? ' · ' + cur.note : ''}` : 'قبل لحظات', { a: 'go:sos-status', v: chip(st[0], st[1], st[2]) })) : callout('لا استغاثة الآن. كل شيء على ما يرام.', 'ok', 'check_circle')}
    ${past.length ? sec('السابقة') + list(past.map(p => row('sos', `${M[p.from].n} · ${p.at}`, `${S.privacy ? '••••' : p.place} · أغلقها ${p.by}${p.note ? ' · ' + p.note : ''}`, { v: chip('حُلّت', 'ok', 'check') }))) : ''}`;
  },
});
Object.assign(ACT, {
  sosOff() { toast('يحتاج الإنترنت · اتصل هاتفياً الآن', null, 'cloud_off'); },
  sosAck() { const s = S.sos; if (!s || s.st === 'resolved') return; s.ack = me().n; s.exh = 0; audit(`أكّد استلام استغاثة ${M[s.from].n}`, 'location.sos.acknowledge'); toast(`أُبلغ${vb(M[s.from], '', 'ت')} ${M[s.from].n} أنك في الطريق`); },
  sosDone() { const s = S.sos; if (!s) return; s.st = 'resolved'; s.by = me().n; s.note = (($('#sosNote') || {}).value || '').trim(); S.sheet = null; audit(`حُلّت استغاثة ${M[s.from].n}${s.note ? ' · ' + s.note : ''}`, 'location.sos.resolve'); toast('أُغلقت الاستغاثة عند الجميع'); },
  /* للرحلات والاختبارات القديمة: إغلاق مباشر بلا ملاحظة */
  sosResolve() { ACT.sosDone(); },
});
