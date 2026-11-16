/* إعادة عمل S1-01 — غلاف التطبيق. نموذج تفاعلي للمراجعة، ليس كود المنتج (G-012: بناء التطبيق غير مأذون بعد).
   نصوص المنتج كلها من i18n.js؛ نصوص منصة المراجعة (خارج الجهاز) عربية مباشرة لأنها أداة عمل. */
(() => {
  'use strict';
  const IC = window.FOS_ICONS, TR = window.FOS_TRACE, GOV = window.FOS_GOV, L = window.FOS_I18N;
  const DEMO_PIN = '246810';
  const VER = { cur: '1.4.0', none: { latest: '1.4.0', min: '1.2.0' }, normal: { latest: '1.6.0', min: '1.2.0' }, below_min: { latest: '1.6.0', min: '1.5.0' }, forced: { latest: '1.6.0', min: '1.2.0' } };

  const S = {
    profile: 'owner', size: 'compact', lang: 'ar', theme: 'light', platform: 'android', lowRam: false,
    online: true, lowbw: false, lowbwAuto: false, sched: 'hourly', lastSync: Date.now() - 5 * 60000, outbox: [], conflict: false,
    update: 'none', updDismissed: false, tpl: 'partner', grants: new Set(GOV.TEMPLATES.partner), inChannel: true, edu: false, a11ySos: false,
    tab: {}, stacks: {}, q: '', platTab: 'reg', reg: 'permission',
    gate: null, gateFails: 0, lockedUntil: 0, skew: 0, pin: DEMO_PIN, adminOpen: false, pinForm: null,
    sos: null, dialog: null, notif: false, cmd: null, childOnline: true, noAck: false, toast: null, audit: [], tt: 'now'
  };
  const $ = s => document.querySelector(s);
  const now = () => Date.now() + S.skew;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const t = (k, v) => { let s = L[S.lang][k]; if (s == null) { console.error('i18n missing', k); s = k; } return v ? s.replace(/\{(\w+)\}/g, (_, n) => v[n]) : s; };
  const num = n => S.lang === 'ar' ? String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]) : String(n);
  const pl = (k, n) => L.plural[S.lang][k](n).replace('{n}', num(n));
  const ic = (n, c = '') => { if (!IC[n]) console.error('icon missing', n); return `<svg class="ic ${c}" viewBox="0 -960 960 960" aria-hidden="true"><path d="${IC[n]}"/></svg>`; };
  const rtl = () => S.lang === 'ar';
  const audit = (action, result) => S.audit.unshift({ at: new Date(now()).toISOString().slice(11, 19) + 'Z', action, actor: S.profile, result });

  /* ── ملفات التجربة والتنقل: navigation-patterns.md §3 (الترتيب حرفي) ── */
  const PROFILES = {
    owner: { mode: 'parent', sh: 'SH-01', nav: ['home', 'family', 'chat', 'control', 'more'], lab: 'المالك' },
    delegate: { mode: 'parent', sh: 'SH-02', nav: ['home', 'chat', 'safety', 'control', 'more'], lab: 'بالغ مفوَّض' },
    teen: { mode: 'child', sh: 'SH-03', nav: ['home', 'chat', 'learn', 'me'], lab: 'مراهق' },
    child: { mode: 'child', sh: 'SH-04', nav: ['home', 'chat', 'play', 'rewards'], lab: 'طفل 7–12' },
    minimal: { mode: 'child', sh: 'SH-05', nav: [], lab: 'طفل دون 7' }
  };
  const DEST = { home: 'home', family: 'groups', chat: 'forum', control: 'tune', more: 'more_horiz', safety: 'location_on', learn: 'school', play: 'sports_esports', rewards: 'stars', me: 'person' };
  /* مالك محتوى كل وجهة — من SPEC §1 (خارج النطاق) و navigation-patterns.md §6 */
  const OWNER = { family: ['unknown', 'S1-03'], chat: ['sys', 'S1-08'], control: ['sys', 'S1-09'], safety: ['sys', 'S1-07'], rewards: ['sys', 'S1-05'], learn: ['sys', '—'], play: ['sys', '—'], transparency: ['sys', 'S1-02'], tchat: ['sys', 'S1-08'], trewards: ['sys', 'S1-05'] };
  const mode = () => PROFILES[S.profile].mode;
  const has = k => S.profile === 'owner' || (S.profile === 'delegate' && S.grants.has(k));
  function eligible(d) {
    if (d === 'learn' || d === 'play') return S.edu;                 // DS-NV-01: تظهر الخدمة بتسجيلها
    if (S.profile !== 'delegate') return true;
    return { home: has('hub.dashboard.view'), chat: S.inChannel, safety: has('location.view'), control: has('hub.settings.view'), more: true }[d];
  }
  const navItems = () => PROFILES[S.profile].nav.filter(eligible);
  const curTab = () => { const n = navItems(); if (S.profile === 'minimal') return 'tiles'; return n.includes(S.tab[S.profile]) ? S.tab[S.profile] : n[0]; };
  const stk = () => { const k = S.profile + ':' + curTab(); return S.stacks[k] || (S.stacks[k] = ['root']); };
  const top = () => { const s = stk(); return s[s.length - 1]; };
  const push = p => stk().push(p);
  const isList = () => ['more', 'me'].includes(curTab());
  const updScreen = () => S.online && (S.update === 'forced' || (S.update === 'below_min' && !S.updDismissed));
  const updStrip = () => S.online && S.update === 'below_min' && S.updDismissed;
  const netKind = () => !S.online ? 'none' : S.lowbw ? 'cell' : 'wifi';

  /* ── الصفحات ── */
  function listRows(kind) {
    const cfg = kind === 'admin' || has('shell.config.view');
    const R = {
      platform: { icon: 'hub', t1: t('more.platform'), t2: t('more.platform.sub') },
      health: { icon: 'monitor_heart', t1: t('more.health'), t2: t('more.health.sub') },
      sync: { icon: 'sync', t1: t('more.sync'), t2: t('more.sync.sub') },
      language: { icon: 'language', t1: t('more.language'), t2: t('lang.' + S.lang) },
      about: { icon: 'info', t1: t('more.about'), t2: t('more.about.sub', { v: VER.cur }) },
      transparency: { icon: 'visibility', t1: t('slot.transparency') },
      ops: { icon: 'lock', t1: t('me.parents'), t2: t('me.parents.sub') },
      pin: { icon: 'key', t1: t('admin.pin'), t2: t('admin.pin.sub') }
    };
    const ids = kind === 'more' ? [cfg && 'platform', cfg && 'health', 'sync', 'language', 'about']
      : kind === 'me' ? ['transparency', 'language', 'ops'] : ['health', 'platform', 'sync', 'language', 'pin'];
    return ids.filter(Boolean).map(id => ({ id, ...R[id] }));
  }
  const rowsHtml = (rows, sel) => `<div class="card">${rows.map(r => `<button class="row" data-act="open" data-arg="${r.id}" data-k="row-${r.id}" ${sel === r.id ? 'aria-current="true"' : ''}>${ic(r.icon)}<span class="tx"><span class="t1">${esc(r.t1)}</span>${r.t2 ? `<br><span class="t2">${esc(r.t2)}</span>` : ''}</span>${ic(rtl() ? 'chevron_left' : 'chevron_right')}</button>`).join('')}</div>`;
  function moreList(sel) {
    const q = S.q.trim(), rows = listRows('more').filter(r => !q || (r.t1 + ' ' + (r.t2 || '')).includes(q));
    return rows.length ? rowsHtml(rows, sel) : `<div class="note neutral">${ic('search')}<span>${t('more.none')}</span></div>`;
  }
  function slot(dest) {
    const teenChild = mode() === 'child' && dest === 'home';
    const o = OWNER[dest] || ['sys', 'S1-09'];
    const line = teenChild ? t('slot.open', { q: 'Q-090' }) : o[0] === 'unknown' ? t('slot.unknownOwner', { sys: o[1] }) : t('slot.owner', { sys: o[1] });
    const title = dest === 'transparency' ? t('slot.transparency') : dest === 'tchat' ? t('tile.chat') : dest === 'trewards' ? t('tile.rewards') : t('nav.' + dest);
    let h = '';
    if (!S.online) h += `<div class="pend">${ic('history')}<span class="tx">${t('sync.last')}: ${pl('ago', Math.round((now() - S.lastSync) / 60000))}.</span></div>`;
    else if (S.lowbw) h += `<div class="pend">${ic('schedule')}<span class="tx">${t('pend.text')}</span><button class="chipbtn" data-act="syncNow" data-k="pend-sync">${t('sync.now')}</button></div>`;
    return h + `<div class="slot"><span class="lab">${t('slot.label')}</span><b>${esc(title)}</b><p>${esc(line)}</p></div>`;
  }
  const kv = (k, v, demo) => `<div class="row"><span class="tx"><span class="t1">${k}</span></span><span class="val">${v}${demo ? `<span class="demo">${t('demo')}</span>` : ''}</span></div>`;
  const PAGES = {
    platform() {
      const tabs = ['reg', 'flags', 'ai'].map(x => `<button role="tab" aria-selected="${S.platTab === x}" data-act="platTab" data-arg="${x}" data-k="pt-${x}">${t('plat.tab.' + x)}</button>`).join('');
      let b = '';
      if (S.platTab === 'reg') {
        b = `<div class="note neutral">${ic('lock')}<span>${t('reg.readonly')}</span></div><div class="chips">${['control', 'permission', 'widget', 'notification'].map(r => `<button class="chipbtn" aria-pressed="${S.reg === r}" data-act="reg" data-arg="${r}" data-k="rg-${r}">${t('reg.' + r)}</button>`).join('')}</div>`;
        b += S.reg === 'permission'
          ? `<div class="card">${GOV.SHELL_KEYS.map(k => `<div class="row"><span class="tx"><span class="t1 kcode">${k.key}</span><br><span class="t2">${esc(k.holder.replace(/`/g, ''))}</span></span></div>`).join('')}</div>`
          : `<div class="note neutral">${ic('info')}<span>${t('reg.empty')}</span></div>`;
      } else if (S.platTab === 'flags') {
        const v = VER[S.update];
        b = `<p class="sec">${t('flags.region')}</p><div class="card">${kv(t('flags.region'), '<span class="ltr">YE</span>', 1)}${kv(t('flags.lowbw'), S.lowbw ? t('flags.on') : t('flags.off'))}${kv(t('flags.otp'), t('flags.fromOwner') + ' (S1-02)')}${kv(t('flags.pay'), t('flags.fromOwner') + ' (S1-04)')}</div>
          <p class="sec">${t('flags.plan')}</p><div class="card">${kv(t('flags.plan'), 'Basic', 1)}${kv(t('flags.feature'), t('flags.fromOwner'))}</div>
          <div class="note neutral">${ic('info')}<span>${t('flags.hidden')} ${t('flags.cached')}</span></div>
          <p class="sec">${t('flags.update')}</p><div class="card">${kv(t('about.min'), `<span class="ltr">${v.min}</span>`)}${kv(t('about.latest'), `<span class="ltr">${v.latest}</span>`)}${kv(t('flags.forced'), S.update === 'forced' ? t('flags.yes') : t('flags.no'))}</div>`;
      } else {
        b = `<div class="note info">${ic('info')}<span>${t('ai.none')}</span></div><div class="card">
          <div class="row">${ic('description')}<span class="tx"><span class="t1">${t('ai.contract')}</span><br><span class="t2 kcode">AI-VERIFICATION-CONTRACT.md</span></span><span class="state ok">${ic('check_circle')}${t('ai.contract.val')}</span></div>
          ${kv(t('ai.budget'), num(0), 1)}
          <div class="row">${ic('power_settings_new')}<span class="tx"><span class="t1">${t('ai.kill')}</span></span><span class="state off">${ic('block')}${t('ai.kill.val')}</span></div>
          ${kv(t('ai.keys') + ' <span class="kcode">agent.*</span>', num(0))}</div>`;
      }
      return { title: t('plat.title'), sub: `<div class="subtabs" role="tablist">${tabs}</div>`, body: b };
    },
    health() {
      const mem = S.lowRam ? 1536 : 3072, net = netKind(), ios = S.platform === 'ios';
      const enf = mode() === 'parent' ? ['na', 'info', t('health.enf.parent')] : ios ? ['na', 'mobile_off', t('health.enf.ios')] : ['ok', 'check_circle', t('health.enf.on')];
      return { title: t('health.title'), body: `<p class="sec">${t('health.device')}</p><div class="card">
        <div class="row">${ic('memory')}<span class="tx"><span class="t1">${t('health.mem')}</span></span><span class="val"><span class="ltr">${num(mem)} MB</span><span class="demo">${t('demo')}</span></span></div>
        <div class="row">${ic('battery_5_bar')}<span class="tx"><span class="t1">${t('health.bat')}</span></span><span class="val"><span class="ltr">${num(64)}%</span><span class="demo">${t('demo')}</span></span></div>
        <div class="row">${ic(net === 'none' ? 'wifi_off' : net === 'cell' ? 'signal_cellular_alt' : 'wifi')}<span class="tx"><span class="t1">${t('health.net')}</span></span><span class="val">${t('health.net.' + net)}</span></div>
        <div class="row">${ic('animation')}<span class="tx"><span class="t1">${t('health.fx')}</span><br><span class="t2">${S.lowRam ? t('health.fx.off') : t('health.fx.on')}</span></span></div></div>
        <div class="card"><div class="row">${ic('shield')}<span class="tx"><span class="t1">${t('health.enf')}</span><br><span class="state ${enf[0]}">${ic(enf[1])}${enf[2]}</span>${mode() === 'child' && ios ? `<span class="t2">${t('health.enf.ios.sub')}</span>` : ''}</span></div></div>` };
    },
    sync() {
      const sch = ['hourly', 'daily', 'manual'].map(x => `<button class="row" role="radio" aria-checked="${S.sched === x}" data-act="sched" data-arg="${x}" data-k="sc-${x}"><span class="radio"></span><span class="tx"><span class="t1">${t('sched.' + x)}</span></span></button>`).join('');
      return { title: t('sync.title'), body: `<div class="card">${kv(t('sync.last'), pl('ago', Math.round((now() - S.lastSync) / 60000)))}${S.outbox.length ? kv(t('sync.pending'), num(S.outbox.length)) : ''}</div>
        <button class="btn block" data-act="syncNow" data-k="sync-now" ${S.online ? '' : 'disabled'}>${ic('sync')}${t('sync.now')}</button>${S.online ? '' : `<div class="note neutral">${ic('cloud_off')}<span>${t('sync.now.off')}</span></div>`}
        <div class="card"><button class="row" role="switch" aria-checked="${S.lowbw}" data-act="lowbw" data-k="sw-lowbw"><span class="tx"><span class="t1">${t('sync.lowbw')}</span><br><span class="t2">${S.lowbw && S.lowbwAuto ? t('sync.auto') : t('sync.lowbw.sub')}</span></span><span class="sw"></span></button></div>
        ${S.lowbw ? `<div class="note info">${ic('data_saver_on')}<span>${t('sync.noauto')}</span></div>` : ''}
        <p class="sec">${t('sync.sched')}</p><div class="card" role="radiogroup">${sch}</div>` };
    },
    language() {
      return { title: t('lang.title'), body: `<div class="card" role="radiogroup">${['ar', 'en'].map(x => `<button class="row" role="radio" aria-checked="${S.lang === x}" data-act="lang" data-arg="${x}" data-k="lg-${x}" lang="${x}"><span class="radio"></span><span class="tx"><span class="t1">${L[x]['lang.' + x]}</span></span></button>`).join('')}</div><div class="note neutral">${ic('info')}<span>${t('lang.note')}</span></div>` };
    },
    about() {
      const v = VER[S.update], newer = v.latest !== VER.cur;
      return { title: t('about.title'), body: `<div class="card">${kv(t('about.version'), `<span class="ltr">${VER.cur}</span>`)}${kv(t('about.latest'), `<span class="ltr">${v.latest}</span>`)}${kv(t('about.min'), `<span class="ltr">${v.min}</span>`)}</div>
        ${newer ? `<button class="btn block" data-act="store" data-k="store">${ic('store')}${t('about.store')}</button>` : `<div class="note ok">${ic('check_circle')}<span>${t('about.uptodate')}</span></div>`}` };
    },
    ops() {
      const ops = [['admin', 'settings'], ['exit', 'logout'], ['unpair', 'link_off'], ['uninstall', 'delete']];
      return { title: t('ops.title'), body: `<div class="note neutral">${ic('lock')}<span>${t('ops.intro')}</span></div><div class="card">${ops.map(([o, i]) => `<button class="row" data-act="gate" data-arg="${o}" data-k="op-${o}">${ic(i)}<span class="tx"><span class="t1">${t('gate.op.' + o)}</span></span>${ic('lock')}</button>`).join('')}</div>` };
    },
    admin() {
      return { title: t('admin.title'), body: rowsHtml(listRows('admin')) + `<button class="btn sec2 block" data-act="adminClose" data-k="adm-close">${ic('lock')}${t('admin.closeAct')}</button>` };
    },
    pin() {
      const f = S.pinForm || { cur: '', nw: '', rep: '', err: {} };
      const fld = (id, lab, hint) => `<div class="field"><label for="pf-${id}">${lab}</label><input id="pf-${id}" data-k="pf-${id}" type="password" inputmode="numeric" autocomplete="off" maxlength="12" value="${esc(f[id])}" ${f.err[id] ? `aria-invalid="true" aria-describedby="pe-${id}"` : ''}>${f.err[id] ? `<span class="err" id="pe-${id}">${ic('error')}${t(f.err[id])}</span>` : hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
      return { title: t('pin.title'), body: fld('cur', t('pin.cur')) + fld('nw', t('pin.new'), t('pin.hint')) + fld('rep', t('pin.rep')) + `<button class="btn block" data-act="pinSave" data-k="pin-save">${t('pin.save')}</button>` };
    }
  };
  function page(id) {
    if (PAGES[id]) return PAGES[id]();
    return { title: id === 'transparency' ? t('slot.transparency') : id === 'tchat' ? t('tile.chat') : id === 'trewards' ? t('tile.rewards') : '', body: slot(id) };
  }
  function pinProblem(p) {
    if (!/^\d{6,}$/.test(p)) return 'pin.e.short';
    const d = [...p].map(Number);
    if (d.every((x, i) => !i || x === (d[i - 1] + 1) % 10) || d.every((x, i) => !i || x === (d[i - 1] + 9) % 10)) return 'pin.e.seq';
    if (new Set(d).size <= 2 || /^(\d{1,3})\1+$/.test(p)) return 'pin.e.rep';
    if (/(19[4-9]\d|20[0-2]\d)/.test(p)) return 'pin.e.year';
    return null;
  }

  /* ── تركيب الجهاز ── */
  function strips() {
    let h = '';
    if (!S.online) h += `<div class="strip" role="status">${ic('cloud_off')}<span class="tx">${t('strip.offline')}</span>${S.outbox.length ? `<span class="chip" title="${t('strip.outbox.note')}">${pl('pending', S.outbox.length)}</span>` : ''}</div>`;
    if (updStrip()) h += `<div class="strip" role="status">${ic('update')}<span class="tx">${t('strip.update')}</span><button class="act" data-act="store" data-k="st-upd">${t('strip.update.act')}</button></div>`;
    if (S.lowbw) h += `<div class="strip info" role="status">${ic('data_saver_on')}<span class="tx">${t('strip.lowbw', { sched: t('sched.' + S.sched) })}</span>${S.online ? `<button class="act" data-act="syncNow" data-k="st-sync">${t('strip.lowbw.act')}</button>` : ''}</div>`;
    return h;
  }
  const appbar = (title, back, extra = '') => `<header class="appbar">${back ? `<button class="iconbtn" data-act="back" data-k="back" aria-label="${t('nav.back')}">${ic(rtl() ? 'arrow_forward' : 'arrow_back')}</button>` : ''}<h1>${esc(title)}</h1>${extra}</header>`;
  const parentsBtn = () => `<button class="iconbtn" data-act="open" data-arg="ops" data-k="parents" aria-label="${t('me.parents')}">${ic('lock')}</button>`;
  function mainHtml() {
    const tab = curTab(), s = stk(), tp = top(), st = strips();
    if (S.profile === 'minimal') {
      if (tp === 'root') return `<header class="appbar"><h1></h1>${parentsBtn()}</header>${st}<div class="body"><div class="tiles">
        <button class="tile" data-act="open" data-arg="tchat" data-k="tile-chat">${ic('call')}${t('tile.chat')}</button>
        <button class="tile" data-act="open" data-arg="trewards" data-k="tile-rew">${ic('redeem')}${t('tile.rewards')}</button></div></div>${homebar()}`;
      const p = page(tp); return appbar(p.title, s.length > 2) + st + (p.sub || '') + `<div class="body">${p.body}</div>` + homebar();
    }
    const rootTitle = t('nav.' + tab);
    if (S.size === 'expanded' && isList()) {
      const kind = tab, sel = s[1];
      const list = kind === 'more' ? `<label class="search">${ic('search')}<input id="more-q" data-k="more-q" type="search" placeholder="${t('more.search')}" aria-label="${t('more.search')}" value="${esc(S.q)}"></label><div id="more-list">${moreList(sel)}</div>` : rowsHtml(listRows('me'), sel);
      let det = `<div class="body"><div class="note neutral">${ic('info')}<span>${t('more.pick')}</span></div></div>`;
      if (s.length > 1) { const p = page(tp); det = appbar(p.title, s.length > 2) + (p.sub || '') + `<div class="body">${p.body}</div>`; }
      return appbar(rootTitle, false) + st + `<div class="split"><div class="lst"><div class="body">${list}</div></div><div class="det">${det}</div></div>`;
    }
    if (tp === 'root') {
      const extra = S.profile === 'child' ? parentsBtn() : '';
      let b;
      if (tab === 'more') b = `<label class="search">${ic('search')}<input id="more-q" data-k="more-q" type="search" placeholder="${t('more.search')}" aria-label="${t('more.search')}" value="${esc(S.q)}"></label><div id="more-list">${moreList()}</div>`;
      else if (tab === 'me') b = rowsHtml(listRows('me'));
      else b = slot(tab);
      return appbar(rootTitle, false, extra) + st + `<div class="body">${b}</div>`;
    }
    const p = page(tp);
    return appbar(p.title, true) + st + (p.sub || '') + `<div class="body">${p.body}</div>`;
  }
  const homebar = () => `<div class="homebar"><button class="homebtn" data-act="home" data-k="homebtn" aria-label="${t('nav.homeBtn')}">${ic('home-fill')}</button></div>`;
  function navHtml() {
    const items = navItems(); if (!items.length) return '';
    const tab = curTab(), badge = { home: S.profile === 'owner' ? 2 : 0, control: S.profile === 'owner' ? 1 : 0 };
    return `<nav class="nav" aria-label="${t('nav.label')}"><div class="brand">${t('app.name')}</div>${items.map(d => `<button data-act="tab" data-arg="${d}" data-k="nav-${d}" ${d === tab ? 'aria-current="page"' : ''}><span class="pill">${ic(DEST[d] + (d === tab ? '-fill' : ''))}</span><span>${t('nav.' + d)}</span>${badge[d] ? `<span class="bdg">${num(badge[d])}</span>` : ''}</button>`).join('')}</nav>`;
  }
  function gateHtml() {
    const g = S.gate; if (!g) return '';
    const head = `<header class="appbar"><button class="iconbtn" data-act="gateClose" data-k="g-close" aria-label="${t('gate.close')}">${ic('close')}</button><h1>${t('gate.title')}</h1></header>`;
    const op = t('gate.op.' + g.op);
    let b;
    if (g.phase === 'locked') b = `<div class="gi">${ic('lock')}</div><h2>${t('gate.locked.title')}</h2><div class="count" id="g-count" role="timer">${clock(S.lockedUntil - now())}</div><p class="op">${t('gate.locked.body')}</p>`;
    else if (g.phase === 'needsOnline') b = `<div class="gi">${ic('cloud_off')}</div><h2>${t('gate.needsOnline.title')}</h2><p class="op">${t('gate.needsOnline.body')}</p><button class="btn" data-act="gateClose" data-k="g-ok">${t('gate.ok')}</button>`;
    else if (g.phase === 'proving') b = `<div class="gi">${ic('verified_user')}</div><h2>${t('gate.prove.title')}</h2><p class="op">${op}</p><div class="steps">${[1, 2, 3].map(i => `<div class="${g.step > i ? 'done' : g.step === i ? 'now' : ''}">${g.step > i ? ic('check_circle') : g.step === i ? '<span class="spin"></span>' : ic('pending')}<span>${t('gate.prove.' + i)}</span></div>`).join('')}</div>`;
    else if (g.phase === 'done') b = `<div class="gi">${ic('check_circle')}</div><h2>${t('gate.done.title')}</h2><p class="op">${t('gate.done.body', { op })}</p><div class="slot"><span class="lab">${t('slot.label')}</span><p>${t('slot.owner', { sys: 'S1-02' })}</p></div><button class="btn sec2" data-act="gateClose" data-k="g-back">${t('gate.done.back')}</button>`;
    else {
      const n = Math.max(6, g.digits.length);
      b = `<div class="g-col"><div class="gi">${ic('lock')}</div><h2>${op}</h2><p class="op">${t('gate.enter')}</p>
        <div class="dots ${g.shake ? 'shake' : ''}" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<i class="${i < g.digits.length ? 'on' : ''}"></i>`).join('')}</div>
        <p class="gmsg ${g.msg ? 'err' : ''}" role="alert">${g.msg || ''}</p></div>
        <div class="g-col"><div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `<button data-act="digit" data-arg="${d}" data-k="d${d}">${num(d)}</button>`).join('')}<button class="gh" tabindex="-1" aria-hidden="true"></button><button data-act="digit" data-arg="0" data-k="d0">${num(0)}</button><button class="bk" data-act="del" data-k="d-del" aria-label="${t('gate.del')}">${ic('backspace')}</button></div>
        <button class="btn" data-act="gateSubmit" data-k="g-open" ${g.digits.length >= 6 ? '' : 'disabled'}>${ic('lock_open')}${t('gate.open')}</button>
        <button class="link" data-act="dialog" data-arg="forgot" data-k="g-forgot">${t('gate.forgot')}</button></div>`;
    }
    return `<div class="layer full" role="dialog" aria-modal="true" aria-label="${t('gate.title')}">${head}<div class="gate">${b}</div></div>`;
  }
  const clock = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return num(String(Math.floor(s / 60)).padStart(2, '0')) + ':' + num(String(s % 60).padStart(2, '0')); };
  function updateHtml() {
    if (!updScreen()) return '';
    const f = S.update === 'forced', v = VER[S.update], req = f ? v.latest : v.min;
    return `<div class="layer full" role="dialog" aria-modal="true"><div class="center"><div class="big">${ic('system_update_alt')}</div><h2>${t(f ? 'upd.forced.title' : 'upd.min.title')}</h2><p>${t(f ? 'upd.forced.body' : 'upd.min.body')}</p>
      <span class="ver">${t('upd.ver', { cur: `<span class="ltr">${VER.cur}</span>`, req: `<span class="ltr">${req}</span>` })}</span>
      <div class="acts"><button class="btn" data-act="store" data-k="u-store">${ic('store')}${t('about.store')}</button>${f ? '' : `<button class="btn sec2" data-act="updLater" data-k="u-later">${t('upd.later')}</button>`}</div></div></div>`;
  }
  function dialogHtml() {
    const d = S.dialog; if (!d) return '';
    const box = (title, body, acts, sheet) => `<div class="layer scrim ${sheet ? 'sheet' : ''}"><div class="dialog" role="alertdialog" aria-modal="true"><h2>${title}</h2>${body}<div class="acts">${acts}</div></div></div>`;
    const ok = `<button class="btn" data-act="dialog" data-arg="" data-k="dlg-ok">${t('gate.ok')}</button>`;
    if (d === 'mode') return box(t('mode.title'), `<p>${t('mode.' + mode())}</p>`, ok);
    if (d === 'login') return box(t('mode.login.title'), `<p>${t('mode.login.body')}</p>`, ok);
    if (d === 'forgot') return box(t('gate.forgot.title'), `<p>${t('gate.forgot.body')}</p>`, ok, true);
    if (d === 'merge') return box(t('merge.title'), `<p>${t('merge.body')}</p><div class="diff"><div><span>${t('merge.yours')}</span><span>${t('sched.daily')} · <span class="ltr">v${num(6)}</span></span></div><div class="win"><span>${t('merge.newer')}</span><span>${t('sched.hourly')} · <span class="ltr">v${num(7)}</span></span></div></div>`, ok);
    if (d === 'sosConfirm') return box(t('sos.confirm.title'), `<p>${t('sos.confirm.body')}</p>`, `<button class="btn dng" data-act="sosFire" data-k="sos-yes">${t('sos.confirm.yes')}</button><button class="btn sec2" data-act="dialog" data-arg="" data-k="sos-no">${t('sos.confirm.no')}</button>`);
    return '';
  }
  function sosHtml() {
    const s = S.sos; let card = '';
    if (s) {
      const left = Math.max(0, Math.ceil((s.t0 + 10000 - now()) / 1000));
      card = `<div class="sos-card" role="alert"><div class="hd"><span class="dot"></span>${t(s.phase === 'active' ? 'sos.active' : s.offline ? 'sos.sent.off' : 'sos.sent')}</div><p>${t(s.offline ? 'sos.handoff.off' : 'sos.handoff.on')}</p>`;
      if (s.phase === 'window') card += `<p id="sos-count">${pl('cancelIn', left)}</p><div class="acts"><button data-act="sosAsk" data-k="sos-cancel">${t('sos.cancel')}</button></div>`;
      if (s.phase === 'why') card += `<p><b>${t('sos.cancel.why')}</b> <span id="sos-count">${pl('cancelIn', left)}</span></p><div class="acts"><button data-act="sosCancel" data-arg="mistake" data-k="why-1">${t('sos.why.mistake')}</button><button data-act="sosCancel" data-arg="test" data-k="why-2">${t('sos.why.test')}</button><button data-act="sosKeep" data-k="why-3">${t('sos.keep')}</button></div>`;
      card += `<div class="own">${t('sos.own')}</div></div>`;
    }
    return `<div class="sos-layer">${card}<button class="sos" id="sos" data-k="sos" aria-label="${t('sos.aria')}"><svg class="ring" viewBox="0 0 82 82" aria-hidden="true"><circle class="trk" cx="41" cy="41" r="36"/><circle class="prg" cx="41" cy="41" r="36"/></svg>${ic('sos')}<span>${t('sos.label')}</span></button></div>`;
  }
  function cmdHtml() {
    const c = S.cmd; if (!c) return '';
    const name = t('child.name'), m = { sending: ['<span class="spin"></span>', t('cmd.sending', { name })], acked: [ic('done_all'), t('cmd.acked', { name })], retry: ['<span class="spin"></span>', t('cmd.retry', { name }) + ' ' + pl('retry', c.n)], childOff: [ic('schedule'), t('cmd.childOff', { name })], queued: [ic('cloud_upload'), t('cmd.queued')] }[c.phase];
    return `<div class="cmd" role="status">${m[0]}<span class="tx">${m[1]}</span></div>`;
  }
  const toastHtml = () => S.toast ? `<div class="toast" role="status">${ic(S.toast.icon || 'info')}<span class="tx">${esc(S.toast.text)}</span></div>` : '';
  function shadeHtml() {
    if (!S.notif || S.platform !== 'android') return '';
    const m = mode();
    return `<div class="layer shade" data-act="notif"><div class="ncard"><span class="ni">${ic('shield')}</span><div><div class="app">${t('app.name')}</div><div class="nt">${t('notif.' + m + '.t')}</div><div class="nb">${t('notif.' + m + '.b')} <span class="demo">${t('demo')}</span></div></div></div></div>`;
  }
  function deviceHtml() {
    const net = netKind();
    return `<div class="dev" id="dev" dir="${rtl() ? 'rtl' : 'ltr'}" lang="${S.lang}" data-profile="${S.profile}" data-size="${S.size}" data-theme="${S.theme}" data-lowram="${S.lowRam}" data-mode="${mode()}">
      <div class="sysbar"><span>9:41</span><span>${ic(net === 'none' ? 'wifi_off' : net === 'cell' ? 'signal_cellular_alt' : 'wifi')}${ic('battery_5_bar')}</span></div>
      <div class="frame">${navHtml()}<main class="main">${mainHtml()}</main></div>
      ${updateHtml()}${gateHtml()}<div id="cmd-slot">${cmdHtml()}</div><div id="toast-slot">${toastHtml()}</div>${dialogHtml()}${shadeHtml()}${sosHtml()}</div>`;
  }

  /* ── منصة المراجعة ── */
  const seg = (key, opts) => `<div class="seg">${opts.map(([v, l]) => `<button aria-pressed="${S[key] === v}" data-act="set" data-arg="${key}=${v}" data-k="b-${key}-${v}">${l}</button>`).join('')}</div>`;
  const chk = (key, l, dis) => `<label class="chk"><input type="checkbox" data-bkey="${key}" data-k="c-${key}" ${S[key] ? 'checked' : ''} ${dis ? 'disabled' : ''}>${l}</label>`;
  function benchHtml() {
    const parent = mode() === 'parent', locked = now() < S.lockedUntil;
    let h = `<h2>ملف التجربة (يحدده الإقران — REQ-002)</h2>${seg('profile', Object.entries(PROFILES).map(([k, v]) => [k, v.lab]))}
      <p class="b-note">وضع الجهاز: <b>${parent ? 'وضع الأهل' : 'وضع الطفل'}</b></p>`;
    if (S.profile === 'delegate') {
      h += `<h2>منح البالغ المفوَّض (S1-03 §5-3-أ حرفياً)</h2>${seg('tpl', [['partner', 'شريك 43'], ['guardian', 'وصي 24'], ['observer', 'مراقب 10'], ['none', 'بلا منح']])}
        <div class="grants">${['hub.dashboard.view', 'location.view', 'hub.settings.view', 'shell.config.view'].map(k => `<label class="chk"><input type="checkbox" data-grant="${k}" data-k="g-${k}" ${S.grants.has(k) ? 'checked' : ''}>${k}</label>`).join('')}</div>
        ${chk('inChannel', 'عضو في قناة محادثة (chat.channel.view)')}<p class="b-note">أطفئ منحاً فيختفي عنصره من التنقل (Q-371).</p>`;
    }
    if (!parent) h += `<h2>تسجيل الخدمات</h2>${chk('edu', 'خدمة التعليم مسجَّلة (خارج المرحلة 1)')}<p class="b-note">يثبت DS-NV-01: العنصر يظهر بتسجيل خدمته دون تعديل التنقل.</p>`;
    h += `<h2>حجم النافذة (Q-392)</h2>${seg('size', [['compact', 'Compact'], ['medium', 'Medium'], ['expanded', 'Expanded']])}
      <h2>اللغة والسمة</h2>${seg('lang', [['ar', 'العربية'], ['en', 'English']])}<div style="height:4px"></div>${seg('theme', [['light', 'فاتح'], ['dark', 'داكن']])}
      <h2>الاتصال</h2>${chk('online', 'متصل')}${chk('lowbw', 'نطاق منخفض (ضعف اتصال)')}
      <button class="b-btn" data-act="addWrite" data-k="b-write" ${S.online ? 'disabled' : ''}>نفّذ فعلاً دون اتصال (${S.outbox.length} في Outbox)</button>${chk('conflict', 'تعارض نسخة عند التفريغ القادم')}
      <h2>الجهاز</h2>${seg('platform', [['android', 'Android'], ['ios', 'iOS']])}${chk('lowRam', 'ذاكرة أقل من 2GB')}${chk('notif', 'أظهر الإشعار الدائم', S.platform !== 'android')}
      <h2>إصدار التطبيق (ShellConfig.update)</h2>${seg('update', [['none', 'محدَّث'], ['normal', 'تحديث عادي'], ['below_min', 'دون الحد الأدنى'], ['forced', 'إلزامي']])}
      <h2>SOS</h2>${chk('a11ySos', 'بديل الوصول: خطوتان بدل الضغط المطوّل')}${S.sos ? '<button class="b-btn" data-act="sosReset" data-k="b-sosr">أنهِ عرض النداء</button>' : ''}`;
    if (!parent) h += `<h2>بوابة الوالدين</h2><p class="b-note">الرقم التجريبي: <code>${DEMO_PIN}</code> — أي رقم آخر خطأ؛ خمسة أخطاء تقفل 5 دقائق.</p>
      <button class="b-btn" data-act="skip" data-k="b-skip" ${locked ? '' : 'disabled'}>قدّم الساعة 5 دقائق</button>
      <h2>محاولات الوضع (REQ-018)</h2><button class="b-btn" data-act="dialog" data-arg="mode" data-k="b-mode">حاكِ محاولة تبديل الوضع</button><button class="b-btn" data-act="dialog" data-arg="login" data-k="b-login">أب يسجّل الدخول على هذا الجهاز</button>`;
    else h += `<h2>أمر لجهاز الابن (REQ-022)</h2>${chk('childOnline', 'جهاز الابن متصل')}${chk('noAck', 'لا يصل إقرار')}<button class="b-btn" data-act="cmd" data-k="b-cmd">أصدر أمراً تجريبياً</button>
      <h2>محاولات الوضع (REQ-018)</h2><button class="b-btn" data-act="dialog" data-arg="mode" data-k="b-mode">حاكِ محاولة تبديل الوضع</button>`;
    return h;
  }
  function visible() {
    const v = [PROFILES[S.profile].sh, 'SH-06'], tp = top();
    if (!S.online || S.outbox.length || S.dialog === 'merge') v.push('SH-07');
    if (S.lowbw || tp === 'sync') v.push('SH-08');
    if (updScreen() || updStrip() || tp === 'about') v.push('SH-09');
    if (S.gate || S.dialog === 'forgot' || tp === 'ops' || tp === 'admin') v.push('SH-10');
    if (tp === 'pin') v.push('SH-11');
    if (S.dialog === 'mode' || S.dialog === 'login') v.push('SH-12');
    if (tp === 'platform') v.push('SH-13');
    if (tp === 'health') v.push('SH-14');
    if (S.notif) v.push('SH-15');
    if (tp === 'language') v.push('SH-16');
    if (S.cmd) v.push('SH-17');
    return v;
  }
  const TAG = { A: 'معتمد', D: 'مشتق', P: 'مقترح', U: 'UNKNOWN' };
  const ids = s => `<div class="ids">${s.anchor ? `<span class="id">${s.anchor}</span>` : ''}${s.req.map(x => `<span class="id r" title="${esc(GOV.REQ[x])}">${x}</span>`).join('')}${s.acc.map(x => `<span class="id a" title="${esc(GOV.ACC[x])}">${x}</span>`).join('')}${s.ds.map(x => `<span class="id">${x}</span>`).join('')}${s.dec.map(x => `<span class="id q">${x}</span>`).join('')}</div>`;
  const item = ([g, x, src]) => `<div class="it"><span class="tag ${g}">${TAG[g]}</span><span>${esc(x)}</span>${src && src !== '—' ? `<span class="src">${esc(src)}</span>` : ''}</div>`;
  const surf = (s, open) => `<details class="surf" ${open ? 'open' : ''}><summary><span class="sid">${s.id}</span><span class="stt">${esc(s.title)}</span><button class="go" data-act="show" data-arg="${s.id}" data-k="go-${s.id}">اعرض</button></summary><div class="in">${ids(s)}${s.items.map(item).join('')}</div></details>`;
  const legend = `<div class="legend">${Object.entries(TAG).map(([k, v]) => `<span><span class="tag ${k}">${v}</span>${{ A: 'نص معتمد بمصدره', D: 'استدلال من نص معتمد', P: 'اقتراحي — ينتظر حكمك', U: 'لا مصدر محكوم' }[k]}</span>`).join('')}</div>`;
  function traceHtml() {
    const tabs = [['now', 'ما تراه الآن'], ['all', `الأسطح ${TR.surfaces.length}`], ['req', 'المتطلبات'], ['owner', 'للمالك'], ['audit', 'التدقيق']];
    let b = '';
    if (S.tt === 'now') { const v = visible(); b = legend + TR.surfaces.filter(s => v.includes(s.id)).map((s, i) => surf(s, true)).join(''); }
    if (S.tt === 'all') b = legend + TR.surfaces.map(s => surf(s, false)).join('');
    if (S.tt === 'req') {
      const where = (k, id) => TR.surfaces.filter(s => s[k].includes(id)).map(s => s.id);
      const row = (k, id, txt, no) => { const w = where(k, id); return `<tr><td class="k">${id}</td><td title="${esc(txt)}">${esc(txt.length > 110 ? txt.slice(0, 110) + '…' : txt)}</td><td class="k">${w.join(' ') || ''}${no ? `<div style="white-space:normal;direction:rtl;font-family:var(--font);color:#625C4D">${w.length ? '+ ' : ''}بلا واجهة: ${esc(no.why)}</div>` : ''}</td></tr>`; };
      b = `<table class="mx"><tr><th>REQ</th><th>النص (حرفياً من §3)</th><th>السطح</th></tr>${Object.entries(GOV.REQ).map(([id, x]) => row('req', id, x, TR.noUi.find(n => n.req === id))).join('')}</table>
        <h2>معايير القبول</h2><table class="mx"><tr><th>ACC</th><th>النص (حرفياً من §8)</th><th>السطح</th></tr>${Object.entries(GOV.ACC).map(([id, x]) => row('acc', id, x, TR.accNoUi.find(n => n.acc === id) || (TR.noUi.find(n => n.acc.includes(id))))).join('')}</table>`;
    }
    if (S.tt === 'owner') {
      const pickTag = g => TR.surfaces.map(s => { const it = s.items.filter(i => i[0] === g); return it.length ? `<div class="fnd"><span class="sid" style="font-family:ui-monospace;color:#1F3A6B;font-weight:600">${s.id}</span> ${esc(s.title)}${it.map(item).join('')}</div>` : ''; }).join('');
      b = `<h2 style="margin-top:0">تعارضات ونواقص في الحوكمة (تُرفع ولا تُصلَّح هنا)</h2>${TR.findings.map(f => `<div class="fnd"><b>${f.id} · ${f.kind}</b><br>${esc(f.text)}<div class="src" style="font-size:11.5px;color:#625C4D">${esc(f.where)}<br>ما اتُّبع: ${esc(f.used)}</div></div>`).join('')}
        <h2>أسئلة بلا مصدر محكوم (UNKNOWN)</h2>${pickTag('U')}<h2>اقتراحات تنتظر حكمك</h2>${pickTag('P')}`;
    }
    if (S.tt === 'audit') b = `<p class="b-note" style="margin:0 0 10px">أحداث <code>AuditEvent</code> بنطاق <code>domain="shell"</code> كما تعدّدها SPEC §5. تُسجَّل هنا عند وقوعها في النموذج.</p>` + (S.audit.length ? S.audit.map(a => `<div class="aud">${a.at} · ${a.action} · actor=${a.actor} · ${a.result}</div>`).join('') : '<p class="empty-b">لا أحداث بعد. جرّب بوابة الوالدين أو محاولة تبديل الوضع.</p>');
    return `<div class="t-tabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" aria-selected="${S.tt === k}" data-act="tt" data-arg="${k}" data-k="tt-${k}">${l}</button>`).join('')}</div><div class="t-body">${b}</div>`;
  }

  /* ── العرض ── */
  function render() {
    const ae = document.activeElement, k = ae && ae.dataset ? ae.dataset.k : null, sel = ae && ae.tagName === 'INPUT' && ae.type !== 'checkbox' ? [ae.selectionStart, ae.selectionEnd] : null;
    const sc = { side: $('#side').scrollTop, body: $('.t-body') ? $('.t-body').parentNode.scrollTop : 0 };
    $('#side').innerHTML = benchHtml(); $('#stage').innerHTML = `<div class="cap">${capText()}</div>` + deviceHtml(); $('#trace').innerHTML = traceHtml();
    $('#side').scrollTop = sc.side; $('#trace').scrollTop = sc.body;
    fit(); bindSos();
    if (k) { const el = document.querySelector(`[data-k="${k}"]`); if (el) { el.focus({ preventScroll: true }); if (sel && el.setSelectionRange) try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { } } }
  }
  const capText = () => `${PROFILES[S.profile].lab} · ${mode() === 'parent' ? 'وضع الأهل' : 'وضع الطفل'} · ${{ compact: 'Compact 360dp — شريط سفلي', medium: 'Medium 720dp — سكة جانبية', expanded: 'Expanded 1024dp — قائمة جانبية ثابتة' }[S.size]}`;
  function fit() {
    const st = $('#stage'), d = $('#dev'); if (!d) return;
    const w = d.offsetWidth + 40, h = d.offsetHeight + 70, sc = Math.min(1, st.clientWidth / w, st.clientHeight / h);
    d.style.transform = `translateY(12px) scale(${sc})`;
  }
  const part = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  let toastT, cmdT, proveT;
  function toast(text, icon) { S.toast = { text, icon }; part('toast-slot', toastHtml()); clearTimeout(toastT); toastT = setTimeout(() => { S.toast = null; part('toast-slot', ''); }, 3600); }

  /* ── SOS: ضغط مطوّل 3 ثوانٍ + حلقة تقدّم + اهتزاز تصاعدي (REQ-007) ── */
  let holdT = null;
  function bindSos() {
    const b = $('#sos'); if (!b) return;
    const start = e => { if (S.a11ySos || S.sos || holdT) return; e.preventDefault(); b.classList.add('hold'); if (navigator.vibrate) navigator.vibrate([60, 440, 120, 380, 200, 300, 320, 180, 500]); holdT = setTimeout(() => { holdT = null; fire(); }, 3000); };
    const stop = () => { if (!holdT) return; clearTimeout(holdT); holdT = null; b.classList.remove('hold'); if (navigator.vibrate) navigator.vibrate(0); toast(t('sos.hint'), 'touch_app'); };
    b.addEventListener('pointerdown', start); b.addEventListener('pointerup', stop); b.addEventListener('pointerleave', stop); b.addEventListener('pointercancel', stop);
    b.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) start(e); });
    b.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') stop(); });
    b.addEventListener('click', () => { if (S.a11ySos && !S.sos) { S.dialog = 'sosConfirm'; render(); } });
    b.addEventListener('contextmenu', e => e.preventDefault());
  }
  function fire() { S.toast = null; S.dialog = S.dialog === 'sosConfirm' ? null : S.dialog; S.sos = { phase: 'window', t0: now(), offline: !S.online }; render(); }

  /* ── الأفعال ── */
  function flush() {
    const n = S.outbox.length; S.lastSync = now(); if (!n) return 0; S.outbox = [];
    if (S.conflict) { S.conflict = false; S.dialog = 'merge'; }
    return n;
  }
  function runCmd() {
    clearTimeout(cmdT);
    const end = ms => { cmdT = setTimeout(() => { S.cmd = null; render(); }, ms); };
    if (!S.online) { S.outbox.push({ type: 'command' }); S.cmd = { phase: 'queued' }; return end(5000); }
    if (!S.childOnline) { S.cmd = { phase: 'childOff' }; return end(5000); }
    S.cmd = { phase: 'sending', n: 1 };
    const attempt = n => { cmdT = setTimeout(() => {
      if (S.noAck && n < 3) { S.cmd = { phase: 'retry', n: n + 1 }; part('cmd-slot', cmdHtml()); attempt(n + 1); }          // تراجع أسّي: 5 ث ثم 10 ث
      else if (S.noAck) { S.cmd = { phase: 'childOff' }; part('cmd-slot', cmdHtml()); end(5000); }
      else { S.cmd = { phase: 'acked' }; part('cmd-slot', cmdHtml()); end(4000); }
    }, S.noAck ? 5000 * Math.pow(2, n - 1) : 1200); };
    attempt(1);
  }
  function prove() { clearTimeout(proveT); proveT = setTimeout(() => { const g = S.gate; if (!g || g.phase !== 'proving') return; if (g.step >= 3) { g.phase = 'done'; } else g.step++; render(); if (g.phase === 'proving') prove(); }, 800); }
  function openGate(op) {
    if (now() < S.lockedUntil) { audit('parent_gate.failed', 'rejected_while_locked'); S.gate = { op, phase: 'locked', digits: '' }; }
    else S.gate = { op, phase: 'pin', digits: '', msg: '' };
  }
  const resetNav = () => { S.gate = null; S.dialog = null; S.adminOpen = false; S.pinForm = null; };
  const goto = (profile, tab, ...pages) => { S.profile = profile; resetNav(); if (tab) S.tab[profile] = tab; S.stacks[profile + ':' + curTab()] = ['root', ...pages]; };
  const SHOW = {
    'SH-01': () => goto('owner', 'home'), 'SH-02': () => goto('delegate', 'home'), 'SH-03': () => goto('teen', 'home'), 'SH-04': () => goto('child', 'home'), 'SH-05': () => goto('minimal'),
    'SH-06': () => { resetNav(); toast(t('sos.hint'), 'touch_app'); },
    'SH-07': () => { resetNav(); S.online = false; if (!S.outbox.length) S.outbox.push({ type: 'demo' }, { type: 'demo' }); },
    'SH-08': () => { goto('owner', 'more', 'sync'); S.lowbw = true; S.lowbwAuto = true; },
    'SH-09': () => { resetNav(); S.online = true; S.update = 'forced'; },
    'SH-10': () => { goto('teen', 'me', 'ops'); openGate('exit'); },
    'SH-11': () => { goto('teen', 'me', 'ops', 'admin', 'pin'); S.adminOpen = true; },
    'SH-12': () => { goto('child', 'home'); S.dialog = 'mode'; audit('shell.mode.refused', 'refused'); },
    'SH-13': () => goto('owner', 'more', 'platform'), 'SH-14': () => goto('owner', 'more', 'health'),
    'SH-15': () => { resetNav(); S.platform = 'android'; S.notif = true; },
    'SH-16': () => goto('owner', 'more', 'language'),
    'SH-17': () => { goto('owner', 'home'); S.online = true; runCmd(); }
  };
  const ACT = {
    set(a) { const [k, v] = a.split('='); S[k] = v;
      if (k === 'profile') resetNav();
      if (k === 'tpl') S.grants = new Set(v === 'none' ? [] : GOV.TEMPLATES[v]);
      if (k === 'update') S.updDismissed = false;
      if (k === 'platform' && v === 'ios') S.notif = false; },
    tt(a) { S.tt = a; },
    show(a) { SHOW[a](); S.tt = 'now'; },
    tab(a) { if (curTab() === a) S.stacks[S.profile + ':' + a] = ['root']; S.tab[S.profile] = a; },
    open(a) { const s = stk(); if (S.size === 'expanded' && isList() && s.length <= 2 && !['admin'].includes(a)) { s.length = 1; } if (a === 'pin') S.pinForm = null; push(a); },
    back() { const s = stk(); if (s.length > 1) { const p = s.pop(); if (p === 'admin') S.adminOpen = false; } },
    home() { stk().length = 1; S.adminOpen = false; },
    platTab(a) { S.platTab = a; }, reg(a) { S.reg = a; },
    sched(a) { S.sched = a; if (!S.online) S.outbox.push({ type: 'sync.schedule' }); },
    lowbw() { S.lowbw = !S.lowbw; S.lowbwAuto = false; },
    lang(a) { S.lang = a; },
    syncNow() { if (!S.online) return; const n = flush(); toast(n ? pl('flushed', n) : t('sync.done'), 'cloud_done'); },
    store() { toast(t('about.store.toast'), 'store'); },
    updLater() { S.updDismissed = true; },
    gate(a) { openGate(a); },
    gateClose() { S.gate = null; clearTimeout(proveT); },
    digit(a) { const g = S.gate; if (g.digits.length < 12) g.digits += a; g.msg = ''; g.shake = false; },
    del() { const g = S.gate; g.digits = g.digits.slice(0, -1); g.shake = false; },
    gateSubmit() {
      const g = S.gate; if (!g || g.digits.length < 6) return;
      if (g.digits === S.pin) {
        S.gateFails = 0; audit('parent_gate.open', 'granted:' + g.op);
        if (g.op === 'admin') { S.gate = null; S.adminOpen = true; push('admin'); }
        else if (!S.online) g.phase = 'needsOnline';
        else { g.phase = 'proving'; g.step = 1; prove(); }
      } else {
        S.gateFails++; audit('parent_gate.failed', 'wrong_pin');
        if (S.gateFails >= 5) { S.gateFails = 0; S.lockedUntil = now() + 5 * 60000; audit('parent_gate.locked', 'locked_5m'); g.phase = 'locked'; g.digits = ''; }
        else { g.digits = ''; g.shake = true; g.msg = t('gate.wrong') + ' ' + pl('attempts', 5 - S.gateFails); }
      }
    },
    adminClose() { const s = stk(), i = s.indexOf('admin'); if (i > 0) s.length = i; S.adminOpen = false; },
    pinSave() {
      const f = { cur: $('#pf-cur').value, nw: $('#pf-nw').value, rep: $('#pf-rep').value, err: {} };
      if (f.cur !== S.pin) { f.err.cur = 'pin.e.cur'; audit('parent_gate.failed', 'wrong_current_pin'); }
      const p = pinProblem(f.nw); if (p) f.err.nw = p; else if (f.nw === S.pin) f.err.nw = 'pin.e.same';
      if (!f.err.nw && f.rep !== f.nw) f.err.rep = 'pin.e.match';
      if (Object.keys(f.err).length) { S.pinForm = f; return; }
      S.pin = f.nw; S.pinForm = null; audit('parent_gate.pin_changed', 'ok'); stk().pop(); toast(t('pin.saved'), 'check_circle');
    },
    dialog(a) { S.dialog = a || null; if (a === 'mode' || a === 'login') audit('shell.mode.refused', 'refused'); },
    notif() { S.notif = false; },
    addWrite() { if (!S.online) S.outbox.push({ type: 'demo' }); },
    skip() { S.skew += 5 * 60000; if (S.gate && S.gate.phase === 'locked' && now() >= S.lockedUntil) S.gate = { op: S.gate.op, phase: 'pin', digits: '', msg: '' }; },
    cmd() { runCmd(); },
    sosFire() { fire(); return true; },
    sosAsk() { S.sos.phase = 'why'; },
    sosKeep() { S.sos.phase = 'window'; },
    sosCancel() { S.sos = null; toast(t('sos.cancelled'), 'check_circle'); },
    sosReset() { S.sos = null; }
  };
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
    if (el.classList.contains('go')) e.preventDefault();
    const r = ACT[el.dataset.act](el.dataset.arg);
    if (r !== true) render();
  });
  document.addEventListener('change', e => {
    const el = e.target;
    if (el.dataset.bkey) {
      const k = el.dataset.bkey; S[k] = el.checked;
      if (k === 'online' && S.online) { const n = flush(); render(); if (n) toast(pl('flushed', n), 'cloud_done'); return; }
      if (k === 'lowbw') S.lowbwAuto = el.checked;
      render();
    } else if (el.dataset.grant) { el.checked ? S.grants.add(el.dataset.grant) : S.grants.delete(el.dataset.grant); S.tpl = ''; render(); }
  });
  document.addEventListener('input', e => { if (e.target.id === 'more-q') { S.q = e.target.value; part('more-list', moreList(stk()[1])); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (S.dialog) { S.dialog = null; render(); } else if (S.notif) { S.notif = false; render(); } } });
  setInterval(() => {
    const g = S.gate;
    if (g && g.phase === 'locked') { if (now() >= S.lockedUntil) { S.gate = { op: g.op, phase: 'pin', digits: '', msg: '' }; render(); } else part('g-count', clock(S.lockedUntil - now())); }
    const s = S.sos;
    if (s && s.phase !== 'active') { const left = Math.ceil((s.t0 + 10000 - now()) / 1000); if (left <= 0) { s.phase = 'active'; render(); } else part('sos-count', pl('cancelIn', left)); }
  }, 500);
  window.addEventListener('resize', fit);
  window.FOS_APP = { S, ACT, SHOW, render, visible, pinProblem, navItems, DEMO_PIN };
  render();
})();
