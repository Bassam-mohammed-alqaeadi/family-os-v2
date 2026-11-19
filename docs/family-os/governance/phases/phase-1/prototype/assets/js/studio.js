/* الاستوديو: ما يحيط بالهاتف — الشخصيات، الرحلات، السياق، الحالات، خريطة التغطية، الأساسات. */
'use strict';
const REQIDX = {}; window.FOS_REQ.forEach(s => s.reqs.forEach(r => { REQIDX[`${s.id}/${r.id}`] = r; }));
const COVER = {};
function buildCover() { Object.values(SC).forEach(d => reqsOf(d).forEach(k => { if (!REQIDX[k]) return console.warn('REQ?', k, d.id); (COVER[k] = COVER[k] || []).push(d.id); })); }

/* الانتقال إلى أي سطح مع ضبط الشخصية المناسبة له */
const sosDemoCur = () => { const s = S.sos; return !s || s.from !== 'layan' || s.st === 'pending' ? '' : s.st === 'resolved' ? 'done' : s.exh ? 'exh' : s.ack ? 'ack' : s.fix === 'last' ? 'last' : s.ch === 'sms' || /SMS/.test(s.via || '') ? 'sms' : 'live'; };
function jump(id, args) {
  kidSync();
  const d = SC[id]; if (!d) return; const p = d.p || 'adult', cur = S.persona;
  const need = p === 'adult' ? (isAdult() ? cur : 'owner') : p === 'kid' ? (['child', 'teen'].includes(cur) ? cur : 'child') : p === 'any' ? (cur === 'guest' ? 'owner' : cur) : p;
  if (id === 'chat' || id === 'thread') { /* مشترك */ }
  if (need !== cur) setPersona(need); else { S.sheet = S.full = S.dlg = null; }
  const root = rootOf(S.persona), a = args || d.a || [];
  if (id === 'time-decide' && !S.reqs.some(r => r.st === 'PENDING')) S.reqs.push({ id: 'r0', kid: 'layan', app: 'ytk', min: 15, msg: 'بقيت حلقة واحدة', st: 'PENDING' });
  if (id === 'obj-decide' && !RW().obj.some(o => o.st === 'PENDING')) { RW().obj = RW().obj.filter(o => o.sub !== 'd1'); RW().obj.push({ id: 'o' + (++RW().n), kid: 'layan', sub: 'd1', txt: 'أنجزتها كما طُلب. قرأت القصة كلها لكن التسجيل انقطع', st: 'PENDING', at: 'قبل 10 د' }); }
  const a2 = id === 'time-decide' ? [S.reqs.find(r => r.st === 'PENDING').id] : id === 'obj-decide' ? [RW().obj.find(o => o.st === 'PENDING').id] : a;
  if ((id === 'sos-status' || id === 'sos-resolve') && !(S.sos && S.sos.st === 'sent')) S.sos = { from: 'layan', st: 'sent', ch: 'server', via: 'عبر الإنترنت', place: AD_HOME };
  if (id === 'sos-sent' && !S.sos) S.sos = { from: PERSONA[need].m, st: 'sent', ch: 'server', via: 'عبر الإنترنت', place: AD_HOME };
  if (id === 'grant-points') S.gp = null; if (id === 'grant-time') S.gt = null; if (id === 'time-decide') S.td = null; if (id === 'obj-decide') S.od = null; if (id === 'objection') { S.obQ = ''; S.obT = ''; } if (id === 'rw-edit') S.rwD = null; if (id === 'redeem') { S.rdA = ''; S.rdN = 10; }
  if (id === 'task-new') S.nt = null; if (id === 'event-new') S.ev = null; if (id === 'tk-edit') S.tkE = null; if (id === 'tk-ai') S.tkA = null; if (id === 'tk-cat-new') S.tkC = null; if (id === 't-task-new') { S.tt = null; S.teenTasks = true; } if (id === 'c-task') S.tkP = null; if (id === 'tk-sug') { TK().sug.forEach(x => { if (x.st === 'no') x.st = 'new'; }); }
  if (id === 'ec-add') S.ecF = {};
  if (id === 'sos-count') S.sosN = 10;
  if (id === 'recover-review' && !(S.recReq && S.recReq.st !== 'cancelled')) S.recReq = { st: 'pending', kind: 'num' };
  if (id === 'recover-wait' && !S.ob.rst) S.ob.rst = 'pending';
  if (id === 'rekey') S.bioChg = 1;
  if (id === 'bio-unlock') S.bioF = 0;
  if (d.kind === 'screen') { const isRoot = id === root || (TABS[mode()] || []).some(t => t[0] === id); S.stack = isRoot ? [{ id, a: [] }] : [{ id: root, a: [] }, { id, a: a2 }]; }
  else { S.stack = [{ id: root, a: [] }]; if (d.kind === 'sheet') S.sheet = { id, a: a2 }; else { if (id === 'pin') { pinBuf = ''; } S.full = { id, a: a2 }; } }
  render();
}

/* ---------- الرحلات الموجَّهة ---------- */
const ensureReq = () => { if (!S.reqs.some(r => r.kid === 'layan' && r.st === 'PENDING')) S.reqs.push({ id: 'r' + Date.now(), kid: 'layan', app: 'ytk', min: 15, msg: 'بقيت حلقة واحدة', st: 'PENDING' }); };
const JOURNEYS = [
  { t: 'أول تشغيل وإنشاء العائلة', d: 'هاتف أو بريد ← تحقق ← اسم العائلة', s: [
    ['جهاز جديد. تطبيق واحد لكل الأدوار. اضغط «أنشئ عائلة جديدة». من له حساب يضغط «لديّ حساب».', () => { S.ob = {}; jump('ob-welcome'); }],
    ['الحساب يُسجَّل برقم الهاتف أو بالبريد، وهما متساويان في أعلى الشاشة. اكتب 771234567 ثم «أرسل الرمز». الرقم 777000111 له حساب فيدخل مباشرة.', () => { S.ob = { flow: 'new' }; jump('ob-phone'); }],
    ['أو بالبريد: اكتب بريداً ثم «أرسل الرابط». لا يُطلب رقم هاتف.', () => { S.ob = { flow: 'new' }; jump('ob-email'); }],
    ['الرمز التجريبي 246810، أو «اقرأ الرمز تلقائياً». خمس أخطاء تقفل 15 دقيقة. «لم يصل؟» ثلاث مرات يُظهر حالة فشل القنوات كلها.', () => { S.ob = { flow: 'new', phone: '771234567' }; jump('ob-otp'); }],
    ['حقل واحد يُكتب: اسم العائلة. البلد والتوقيت مقترحان ويُغيَّران بنقرة.', () => { S.ob = { flow: 'new', phone: '771234567' }; jump('ob-family'); }],
    ['العائلة على الخطة المجانية تلقائياً، وهذا الهاتف صار موثوقاً بلا خطوة إضافية. ادخل إلى اللوحة.', () => jump('ob-done')],
  ] },
  { t: 'الانضمام بدعوة', d: 'دعوة ← رمز ← انضمام بلا صلاحيات', s: [
    ['أحمد ينشئ دعوة: رمز لشخص واحد صالح 7 أيام، والرسالة فيها رابط ورمز. كل دعوة معلقة تُلغى وحدها.', () => jump('invite')],
    ['سارة فتحت الرابط ووثّقت رقمها: الرمز معبّأ. اضغط «تابع».', () => { S.ob = { link: 1, phone: '733555019' }; jump('ob-join'); }],
    ['اسم العائلة يظهر بعد التحقق من الرمز فقط، مع ما ستستطيعه وما لا تستطيعه.', () => { S.ob = { link: 1, jok: 1 }; jump('ob-join'); }],
  ] },
  { t: 'فقدت الهاتف والرقم', d: 'طلب ← تأكيد ← 7 أيام ← اعتراض', s: [
    ['من جهاز جديد: «فقدت هاتفك ورقمك؟» في شاشة الرقم. اكتب الرقم القديم والجديد.', () => { S.ob = {}; jump('ob-recover'); }],
    ['بانتظار تأكيد من اختاره أحمد مسبقاً. اسمها لا يُكشف هنا.', () => { S.ob = { rst: 'pending' }; S.recReq = { st: 'pending', kind: 'num' }; jump('recover-wait'); }],
    ['على هاتف سارة: تتأكد بصوته ثم تؤكد أو ترفض.', () => { S.recReq = { st: 'pending', kind: 'num' }; setPersona('delegate'); jump('recover-review'); }],
    ['بدأت الأيام السبعة. صاحب الطلب يرى العدّ ويستطيع الإلغاء.', () => { S.ob = { rst: 'waiting' }; S.recReq = { st: 'waiting', kind: 'num' }; jump('recover-wait'); }],
    ['إن كان الطلب من محتال: أحمد الحقيقي يراه على هاتفه القديم ويوقفه فوراً.', () => { S.recReq = { st: 'waiting', kind: 'num' }; setPersona('owner'); jump('recover-review'); }],
  ] },
  { t: 'التأكيد بالبصمة', d: 'تشغيل ← تأكيد ← متى يعود الرقم', s: [
    ['في «الأمان» مفتاحان للبصمة: فتح التطبيق، وتأكيد الأفعال الحساسة. الثاني مطفأ، فالتأكيد بالرقم السري.', () => { S.bioAct = false; S.pinAgo = 12; S.bioChg = 0; jump('security'); }],
    ['شغّل «أكّد الأفعال الحساسة بالبصمة»: يُطلب الرقم السري مرة (482615)، ثم يظهر تنبيه من يستطيع التأكيد.', () => { S.bioAct = false; jump('security'); ACT.bioActT(); render(); }],
    ['الآن أي فعل حساس، مثل بدء التجربة، يطلب البصمة لا الرقم. «استعمل الرقم السري» متاح دائماً.', () => { S.bioAct = true; S.pinAgo = 12; S.bioChg = 0; S.plan = 'free'; S.bl = null; jump('trial'); ACT.trGo(); render(); }],
    ['ثلاث محاولات فاشلة بالبصمة تعيد لوحة الرقم السري مع السبب.', () => { S.bioAct = true; S.pinAgo = 12; S.bioChg = 0; S.plan = 'free'; S.bl = null; jump('trial'); ACT.trGo(); ACT.bcBad(); ACT.bcBad(); ACT.bcBad(); render(); }],
    ['بعد 30 يوماً بلا كتابة الرقم السري يُطلب مرة واحدة، حتى لا يُنسى.', () => { S.bioAct = true; S.pinAgo = 31; S.bioChg = 0; S.plan = 'free'; S.bl = null; jump('trial'); ACT.trGo(); render(); }],
    ['على جهاز ليان تبقى بوابة الوالدين بالرقم السري وحده، ولو كانت البصمة مشغّلة على هاتف الأب.', () => { S.bioAct = true; S.pinAgo = 12; setPersona('child'); jump('c-home'); gate('إعدادات الجهاز للأهل', () => {}); render(); }],
  ] },
  { t: 'تعارض القواعد', d: 'بطاقة قبل الحفظ ← حلّ بضغطة ← وسم ← تنبيه المالك', s: [
    ['حصة ليان 120 دقيقة. جعلنا حدّ Minecraft ‏150 وضغطنا «احفظ»: لا يُحفظ شيء، وتظهر البطاقة بالطرفين وما سيحدث فعلاً وحلول بضغطة.', () => { cfDemo(); S.ad = null; jump('app-rule', ['layan', 'mc']); render(); ACT.adLim('=', '150'); ACT.adSave(); }],
    ['«احفظ كما هو» يحفظ ويترك وسم «متعارض» على التطبيق في القائمة.', () => { cfDemo(); S.ad = null; jump('app-rule', ['layan', 'mc']); render(); ACT.adLim('=', '150'); ACT.adSave(); ACT.cfKeep(); jump('apps', ['layan']); }],
    ['في صفحة قواعد ليان سطر «تعارضات» يجمعها.', () => { cfDemo(); cfEv('lim'); S.ctlKid = 'layan'; jump('protection'); }],
    ['صفحة التعارضات: البطاقة نفسها، ومن أبقاها ومتى، والحلول بضغطة. جرّب «احظر موقعه أيضاً».', () => { cfDemo(); cfEv('lim'); jump('conflicts', ['layan']); }],
    ['مهمة موعدها 10:00 م ونوم ليان يبدأ 9:00 م: البطاقة تقترح «اجعل الموعد 8:30 م» بضغطة.', () => { cfDemo(); S.nt = null; jump('task-new', ['layan']); render(); const n = S.nt; n.t = 'قراءة قصة'; n.hm = '2200'; n.dirty = 1; render(); ACT.ntSave(); }],
    ['نافذتان متداخلتان لا تُحفظان أبداً: البطاقة حمراء، وفيها قصّ النافذة عند حدّ الأخرى بضغطة.', () => { cfDemo(); ACT.winOpen('layan', 'new', 'school'); ACT.wdDays('01234'); ACT.wdT('s', '05:00'); ACT.wdT('e', '08:00'); jump('schedule', ['layan']); S.sheet = { id: 'win-edit', a: ['layan', 'new'] }; }],
    ['وضع النوم سارٍ عند ليان، والأب يمنحها وقتاً: الدقائق لن تُستعمل الآن، ويُقال ذلك قبل المنح.', () => { cfDemo(); S.pm.layan = { k: 'sleep', left: 60, until: untilTxt(60) }; S.gt = null; jump('grant-time', ['layan']); render(); ACT.gtGo(); }],
    ['سارة حفظت حدّاً فوق الحصة وأبقته: يصل أحمد في «يتطلب انتباهك» مع «رتّب قواعد ليان».', () => { cfDemo(); cfEv('sara'); setPersona('owner'); jump('home'); }],
    ['خالد أضاف لنفسه مهمة بعد وقت نومه: لم يُسأل هو، ووصل التعارض إلى الأب.', () => { cfDemo(); cfEv('teen'); setPersona('owner'); jump('home'); }],
  ] },
  { t: 'الخطة والدفع', d: 'مقارنة ← تأكيد ← دفع ← تحقق', s: [
    ['الخطة وما استُهلك هذا الشهر: الأفراد، الرسائل النصية، عمليات المساعد. نفترض هنا أن فرداً خامساً انضم، فالعائلة مكتملة على المجانية.', () => { S.plan = 'free'; S.planSt = ''; S.bl = null; S.memX = 1; jump('plan'); }],
    ['ما تشترك فيه كل الخطط يُقال مرة واحدة، والبطاقات تعرض ما يختلف. الأسعار بعملة سوق العائلة.', () => jump('plans')],
    ['قبل أي دفع: ماذا يحدث ومتى، ثم طريقة الدفع. اضغط «رقِّ الآن» واكتب الرقم السري.', () => jump('plan-change', ['basic'])],
    ['في اليمن: تدفع من المحفظة ثم تكتب الرقم المرجعي. اكتب أي رقم واضغط «أكّد الدفع».', () => { BL().pend = null; jump('pay-wallet', ['basic', '', 'jaib']); }],
    ['الدفعة بانتظار التحقق: الخطة لا تتغير قبل تأكيد المحفظة.', () => { BL().pend = { w: 'basic', yr: false, ch: 'jaib', ref: '70451300', at: 'اليوم · 5:12 م' }; jump('plan'); }],
    ['المحفظة أكّدت: تتغير الخطة ويصل إشعار، والدفعة في السجل.', () => { if (!BL().pend) BL().pend = { w: 'basic', yr: false, ch: 'jaib', ref: '70451300', at: 'اليوم · 5:12 م' }; jump('plan'); blEv('ver'); }],
    ['على الأساسية وبقي من فترتها أيام: الترقية إلى المميزة لا تضيّعها، بل تحوّلها إلى أيام إضافية.', () => { S.plan = 'basic'; S.planSt = ''; S.bl = null; BL().pend = null; jump('plan-change', ['premium']); }],
    ['التجربة تنتهي بعد يومين: تذكير في «يتطلب انتباهك»، ولا خصم تلقائي.', () => { S.plan = 'free'; S.planSt = ''; S.bl = null; blEv('tr2'); jump('home'); }],
    ['انتهت الفترة ولم تُجدَّد: ثلاثة أيام مهلة والميزات باقية.', () => { S.plan = 'basic'; S.planSt = ''; S.bl = null; blEv('exp'); jump('plan-grace'); }],
    ['انتهت المهلة: عادت العائلة إلى المجانية بلا قفل ولا حذف، مع بيان ما تغيّر.', () => { blEv('fall'); jump('plan-grace'); }],
  ] },
  { t: 'إضافة طفل وإقران جهازه', d: 'ملف ← رمز ← موافقة مشتركة', s: [
    ['المجانية تتسع لخمسة وعائلتنا أربعة، فالإضافة مفتوحة: طفل بملف، أو بالغ بدعوة.', () => { S.memX = 0; jump('add-member'); }],
    ['اسم مستعار وصورة ولون وسنة ميلاد فقط. غيّر السنة ولاحظ القالب يتبدل تلقائياً.', () => { S.cn = null; jump('child-new'); }],
    ['رمز إقران من 6 خانات صالح 15 دقيقة.', () => jump('pair-code')],
    ['الآن جهاز الطفل: أدخل LY4N82.', () => { S.ob = {}; jump('ob-pair'); }],
    ['يتفقان معاً: يفعّل الطفل والأب المفتاحين، ثم يكتب بابا رقمه السري فيُحفظ على هذا الجهاز. «ليس الآن» يوقف الإقران بلا لوم.', () => { S.ob = { cons: {} }; jump('ob-consent'); }],
    ['الصيغة نفسها للمراهق: ما يعرفه والده وما لا يعرفه، ومعها حقّاه.', () => { S.ob = { cons: {}, kid: 'khaled' }; jump('ob-consent'); }],
    ['انتهى الإقران: الجهاز في وضع الطفل، والوضع ثابت.', () => jump('c-home')],
  ] },
  { t: 'نفد الوقت ← طلب ← قرار الأب', d: 'حلقة القرار بين جهازين', s: [
    ['ليان فتحت YouTube Kids وقد نفد حدّه: شاشة الحظر تظهر فوراً. اضغط «اطلبي وقتاً من بابا».', () => { S.reqs = S.reqs.filter(r => r.st !== 'PENDING'); setPersona('child'); S.full = { id: 'block', a: ['ytk'] }; render(); }],
    ['اختاري المدة وأرسلي الطلب.', () => { setPersona('child'); S.sheet = { id: 'ask-time', a: ['ytk'] }; render(); }],
    ['انتقلنا إلى جهاز الأب: الطلب أعلى قائمة «يتطلب انتباهك» بقرار من نقرة واحدة.', () => { ensureReq(); jump('home'); }],
    ['«خيارات أخرى»: امنح مدة لا تتجاوز ما بقي من حد اليوم، أو ارفض وأسند مهمة بديلة بقيمتها، أو ارفض فقط.', () => { ensureReq(); jump('time-decide'); }],
    ['عدنا إلى ليان: ترى النتيجة فوراً، والوقت أُضيف إلى التطبيق نفسه فقط.', () => { const r = S.reqs.find(x => x.st === 'PENDING'); if (r) ACT.reqGrant(r.id, 15); $('#toast').innerHTML = ''; jump('c-home'); }],
  ] },
  { t: 'مهمة ← إثبات ← اعتماد ← صرف', d: 'من الإنشاء إلى المكافأة', s: [
    ['الأب ينشئ مهمة: عنوان، فرد واحد، فئة، نقاط، وطريقة إثبات تشرح نفسها عند الاختيار.', () => jump('task-new')],
    ['ليان ترى مهامها محطاتٍ في «مسار اليوم»، وتحتها القادم في تقويم العائلة.', () => jump('c-home')],
    ['تفتح المهمة وتصوّر ما أنجزت، وتراجع صورتها قبل الإرسال.', () => { const t = S.tasks.find(x => x.id === 't2'); t.st = 'PENDING'; t.re = 0; jump('c-task', ['t2']); ACT.tkCap('t2'); ACT.tkShot(); render(); }],
    ['المساعد يتحقق من الصورة فتدخل النقاط محفظتها فوراً. ما لم يجزم به يذهب إلى الأب.', () => { const t = S.tasks.find(x => x.id === 't2'); if (t.st === 'PENDING') { setPersona('child'); ACT.tkSend('t2'); } jump('c-task', ['t2']); }],
    ['وهذه مهمة لم يجزم بها المساعد: الأب يرى الدليل وسبب الإحالة، فيعتمد أو يعيدها بملاحظة.', () => jump('task-review', ['t1'])],
    ['بعد الاعتماد تدخل النقاط محفظتها وتظهر في «آخر الحركات» بدليلها. السلسلة تزيد مرة واحدة في اليوم.', () => { const t = S.tasks.find(x => x.id === 't1'); if (t.st === 'SUBMITTED') { setPersona('owner'); ACT.taskOk('t1'); $('#toast').innerHTML = ''; } jump('c-rewards'); }],
    ['تحوّل نقاطها إلى وقت للتطبيق الذي نفد، ضمن حدّ اليوم.', () => jump('redeem')],
  ] },
  { t: 'المساعد يُعدّ المهام بتفويضك', d: 'يقترح فتوافق، أو يسند ضمن حدودك', s: [
    ['المساعد يقترح مهاماً في بطاقة هادئة أعلى قائمة المهام. لا تصل الأبناء حتى يوافق بالغ.', () => { S.tv = 'tasks'; jump('tasks'); }],
    ['كل اقتراح يعرض سببه وما استند إليه. توافق كما هو، أو تعدّل ثم تسند، أو تصرفه.', () => { jump('tk-ai'); jump('tk-sug', ['s1']); }],
    ['المالك يختار كم يفوّض المساعد: لا يُعدّ، يقترح، أو يسند مباشرة. كل خيار يشرح نفسه.', () => { S.tkA = null; jump('tk-ai'); }],
    ['«يسند مباشرة» يفتح الحدود: أقصى نقاط للمهمة، وعدد المهام في اليوم، ولمن يسند.', () => { jump('tk-ai'); ACT.tkAi('lv', 'assign'); render(); }],
    ['بعد الحفظ يسند المساعد ما يقع داخل الحدود ويخبرك، وما فوقها يبقى اقتراحاً ينتظر قرارك.', () => { jump('tk-ai'); if (TK().ai.lv !== 'assign') { ACT.tkAi('lv', 'assign'); ACT.tkAiSave(); $('#toast').innerHTML = ''; } render(); }],
    ['ليان ترى المهمة في مسار يومها، ومكتوب عليها أنها من المساعد بإذن بابا.', () => { const t = S.tasks.find(x => x.by === 'ai' && x.kid === 'layan'); if (t) jump('c-task', [t.id]); else jump('c-home'); }],
    ['وكل ما أسنده يظهر في سجل المساعد بسببه، وتلغيه من صفحة المهمة متى شئت.', () => jump('ai')],
  ] },
  { t: 'حدث في التقويم ← تذكير', d: 'تقويم بالتاريخين وتذكير يصل صاحبه', s: [
    ['التقويم بالتاريخين الهجري والميلادي: نقطة للحدث ونقطة للمهمة، وثلاثة أشهر قادمة.', () => { S.tv = 'cal'; S.tkM = 0; S.tkDay = null; jump('tasks'); }],
    ['حدث جديد: عنوان، يوم، وقت، لمن، وتذكير يقول من يصله.', () => { S.tv = 'cal'; jump('tasks'); ACT.tkEvNew('2026-11-20'); render(); }],
    ['تفصيل الحدث بالتاريخين، ومن أضافه، ومن يصله التذكير.', () => { S.tv = 'cal'; jump('tasks'); jump('event', ['e1']); }],
    ['هكذا يصل التذكير: لصاحب الحدث وللأب فقط، مرة واحدة، ولو بلا إنترنت.', () => { jump('tasks'); jump('tk-remind', ['e1']); }],
    ['ليان ترى تقويم العائلة عرضاً فقط، بأحداثه ومهامها هي.', () => jump('fam-cal')],
  ] },
  { t: 'اعتراض ← قرار الأب', d: 'مهمة لم تُعتمد، والطفل يرى أنها أُنجزت', s: [
    ['المساعد لم يعتمد «قراءة 15 دقيقة». ليان تفتح «قرار لم يكن عادلاً؟» من محفظتها وتختار القرار.', () => { RW().obj = []; jump('objection', ['']); }],
    ['تختار جملة جاهزة أو تكتب جملة قصيرة، ثم ترسل.', () => { S.obQ = '0'; S.obT = ''; jump('objection', ['d1']); }],
    ['يصل الاعتراض الأب بطاقةً في «يتطلب انتباهك».', () => { RW().obj = []; jump('obj-decide'); S.sheet = null; render(); }],
    ['يرى القرار وسببه ودليله وكلام ليان. القبول يعتمد المهمة ويودِع نقاطها، والرفض يلزمه سبب.', () => jump('obj-decide')],
    ['قبل الأب. ليان ترى الخبر في محفظتها والنقاط في «آخر الحركات».', () => { jump('obj-decide'); const o = RW().obj.find(x => x.st === 'PENDING'); if (o) ACT.rwObjYes(o.id); $('#toast').innerHTML = ''; jump('c-rewards'); }],
  ] },
  { t: 'سلسلة سبعة أيام', d: 'مكافأة السلسلة والشارة الفضية والتجميد', s: [
    ['سلسلة ليان ستة أيام ولم تُعتمد لها مهمة اليوم بعد.', () => { RW(); S.kid.layan.streak = 6; S.rw.day.layan = 0; jump('streak', ['layan']); setPersona('child', 1); jump('streak'); }],
    ['يعتمد الأب مهمتها: هذا أول كسب اليوم، فتكتمل سبعة أيام وتودَع مكافأة السلسلة.', () => { const t = S.tasks.find(x => x.id === 't1'); if (S.kid.layan.streak === 6 && t.st === 'SUBMITTED') { setPersona('owner'); ACT.taskOk('t1'); $('#toast').innerHTML = ''; } jump('c-rewards'); }],
    ['نالت الشارة الفضية، والشارة التالية عند ثلاثين يوماً.', () => jump('streak')],
    ['في يوم مرض يجمّد الأب السلسلة: يوم واحد في كل مرة، ومرتان في السلسلة.', () => { RW().day.layan = 0; setPersona('owner'); jump('streak', ['layan']); }],
  ] },
  { t: 'استغاثة SOS', d: '3 ثوانٍ ← 10 ثوانٍ ← وصلت', s: [
    ['زر SOS ظاهر في كل شاشة على أجهزة الأبناء، ولا يظهر عند الأهل. اضغطه مطوّلاً 3 ثوانٍ (في الهاتف) لتبدأ.', () => { S.sos = null; jump('c-home'); }],
    ['عشر ثوانٍ للإلغاء قبل الإرسال.', () => { setPersona('child'); ACT.sosStart(); render(); }],
    ['حالة صادقة: وصلت إلى كم من كم، وعبر أي قناة. اقطع الاتصال من «الحالات» وأعد التجربة لترى مسار SMS.', () => { setPersona('child'); ACT.sosSend(); render(); }],
    ['عند الأب: الاستغاثة أولوية P0 فوق كل شيء.', () => { if (!S.sos) S.sos = { from: 'layan', st: 'sent', via: 'عبر الإنترنت', place: AD_HOME }; S.sos.st = 'sent'; jump('home'); }],
    ['الموقع لحظة الاستغاثة، ثم الحل وتسجيله في التدقيق.', () => jump('sos-status')],
  ] },
  { t: 'دور لبالغ وصلاحية بعينها', d: 'دور ← معاينة ← الرقم السري ← أثر فوري', s: [
    ['ملف سارة عند الأب: دورها، وعلى من، وإلى متى، وما تستطيعه. «كل الصلاحيات» يعرضها واحدة واحدة.', () => { setRole('partner'); jump('member', ['sara']); }],
    ['اختيار دور آخر: كل دور موصوف بجملة. ومحتوى الدور نفسه يُعدَّل من «الأدوار».', () => jump('role-pick')],
    ['قبل التطبيق: ما ستستطيعه وما لن تستطيعه، وعلى من وإلى متى. التطبيق بالرقم السري 482615.', () => { ACT.rolePick('guardian'); render(); }],
    ['صلاحية واحدة: مسموح، أو غير مسموح، أو ممنوع. ولكل منها على من وإلى متى.', () => { setRole('guardian'); jump('member', ['sara']); ACT.keyOpen('location.history.view'); render(); }],
    ['صلاحية بمدة: قبل انتهائها بسبعة أيام يصل الأب تنبيه وزر «جدّد».', () => { setRole('partner'); S.g['location.history.view'].un = addDays(5); jump('member', ['sara']); }],
    ['جهاز سارة: ترى ما مُنح لها وحدوده، وما ليس عندها تطلبه من أحمد بنقرة.', () => { setRole('guardian'); jump('home'); setPersona('delegate'); go('my-perms'); render(); }],
    ['الأب يرى كل منح وسحب ورفض في السجل، بتصفية بالفرد والفعل والفترة.', () => jump('audit')],
  ] },
  { t: 'الصلاحية الكاملة', d: 'تُعطى فوراً ← تُسحب متى شاء المالك', s: [
    ['الأب يقرأ ما تعنيه ثم يعطيها بالرقم السري. تسري فوراً.', () => { S.co = null; jump('transfer'); }],
    ['سارة الآن مثله. الأب مالك كما كان، وزر السحب أمامه.', () => { S.co = { since: 'اليوم', seen: 0 }; jump('transfer'); }],
    ['جهاز سارة: إشعار، ثم ترى أن الصلاحية الكاملة عندها وأن أحمد يسحبها متى شاء.', () => { S.co = { since: 'اليوم', seen: 0 }; jump('home'); setPersona('delegate'); go('my-perms'); render(); }],
    ['إن أراد الأب حذف حسابه والصلاحية الكاملة عند سارة: تديرها سارة خلال المهلة، وتصير المالكة بعد 30 يوماً إن لم يتراجع.', () => { S.co = { since: 'اليوم', seen: 1 }; jump('delete-account'); }],
    ['وإن لم تكن الصلاحية الكاملة عند أحد: يعطيها أولاً، أو يحذف العائلة.', () => { S.co = null; jump('delete-account'); }],
  ] },
  { t: 'انقطاع الاتصال والمزامنة', d: 'يعمل دون اتصال بصدق', s: [
    ['قطعنا الاتصال: شريط خفيف، وكل معلومة تحمل عمرها. لا شيء يُعرض كأنه حي.', () => { S.net = 'off'; jump('home'); }],
    ['أرسل رسالة: تظهر فوراً بعلامة الساعة وتنتظر الإرسال.', () => { S.net = 'off'; jump('thread', ['majlis']); }],
    ['البيانات والمزامنة: ما ينتظر الإرسال بترتيبه.', () => { S.net = 'off'; jump('outbox'); }],
    ['عاد الاتصال: تُفرَّغ دفعة واحدة بالترتيب.', () => { setNet('on'); jump('home'); }],
  ] },
  { t: 'عبث بالحماية', d: 'تنبيه بلا اتهام', s: [
    ['تنبيه عبث على جهاز خالد: ما حدث، وما الذي ما زال يعمل.', () => { S.kid.khaled.enf = 'degraded'; S.alerts.find(a => a.id === 'a1').open = 1; jump('tamper', ['a1']); }],
    ['جهاز خالد: شرح هادئ وزر لإعادة التفعيل.', () => jump('t-home')],
    ['حالة الفرض مكشوفة: مزامنة، نبضة خصم، توقيع الجهاز.', () => jump('enf-state', ['khaled'])],
  ] },
];
let JR = null;
function setNet(v) { const was = S.net; S.net = v; if (was === 'off' && v === 'on') { Object.values(S.chat).forEach(ms => ms.forEach(m => { if (m.q) { m.q = 0; m.st = 2; } })); flushOutbox(); sosFlush(); } }

const Studio = {
  tab: 'ctx', open: {},
  init() {
    buildCover();
    $('#paneR').innerHTML = `<div class="brand"><div class="mk"><img src="assets/brand/logo-symbol-dark.svg" alt="" width="30" height="25"></div><h1>عائلتي<small>النموذج الأولي التفاعلي · المرحلة 1</small></h1></div>
      <p class="lede">نظام التصميم المعتمد حيّاً داخل هاتف: خمس شخصيات تتشارك حالة عائلة واحدة، وكل سطح مربوط بمتطلباته في الحوكمة.</p>
      <button class="lgcard" data-st="brand"><img src="assets/brand/logo-horizontal-ar-dark.svg" alt="عائلتي" height="64"><span>الشعار وأيقونة التطبيق — اضغط للعرض</span></button>
      <div class="st-h">الشخصيات</div><div id="personas"></div><div class="st-h">رحلات موجَّهة</div><div id="journeys"></div>
      <div class="note" style="margin-top:18px"><b>للتجربة:</b> رقم بوابة الوالدين <span class="mono">482615</span> · رمز التحقق <span class="mono">246810</span> · زر SOS بضغط مطوّل 3 ثوانٍ.</div>
      <button class="jr" data-st="reset" style="justify-content:center;margin-top:10px">${ic('refresh')}أعد ضبط بيانات العرض</button>`;
    $('#journeys').innerHTML = JOURNEYS.map((j, i) => `<button class="jr" data-st="journey:${i}"><i>${i + 1}</i><span><b style="font-weight:600">${j.t}</b><small>${j.d}</small></span></button>`).join('');
    document.addEventListener('click', e => { const el = e.target.closest('[data-st]'); if (!el) return; const [n, ...a] = el.dataset.st.split(':'); Studio.act[n](...a); });
    addEventListener('resize', Studio.fit); Studio.fit();
    addEventListener('keydown', e => { if (e.key === 'Escape') { back(); render(); } });
  },
  fit() {
    const st = $('.stage'), dev = $('.dev'); if (innerWidth <= 520) { dev.style.transform = ''; dev.style.width = '100vw'; dev.style.height = '100dvh'; $('#phone').style.width = '100%'; $('#phone').style.height = '100%'; return; }
    dev.style.width = dev.style.height = ''; $('#phone').style.width = $('#phone').style.height = '';
    const s = Math.min(1.15, (st.clientHeight - 28) / 868, (st.clientWidth - 24) / 414); dev.style.transform = `scale(${s})`;
  },
  act: {
    persona(p) { JR = null; setPersona(p); if (p === 'guest') { S.ob = {}; boot(); } render(); document.body.removeAttribute('data-open'); },
    journey(i) { JR = { i: +i, k: 0 }; JOURNEYS[i].s[0][1](); render(); document.body.removeAttribute('data-open'); },
    jnext() { const j = JOURNEYS[JR.i]; if (JR.k < j.s.length - 1) { JR.k++; j.s[JR.k][1](); render(); } else { JR = null; render(); } },
    jprev() { if (JR.k > 0) { JR.k--; JOURNEYS[JR.i].s[JR.k][1](); render(); } },
    jend() { JR = null; render(); },
    tab(t) { Studio.tab = t; Studio.sync(); },
    set(k, v) { const val = v === 'true' ? true : v === 'false' ? false : isNaN(v) || v === '' ? v : +v; if (k === 'net') setNet(val); else if (k === 'tpl') setRole(val); else S[k] = val; if (k === 'sys') { const F = { update: 'sys-update', maint: 'sys-maint', first: 'sys-first' }; S.full = F[val] ? { id: F[val], a: [] } : null; } if (['plan', 'planSt', 'reg', 'os'].includes(k)) S.bl = null;   /* حالة الفوترة تُبنى من جديد على الخطة والسوق المختارين */
      render(); },
    flip(k) { S[k] = !S[k]; render(); },
    sosDemo(v) { S.full = null; S.sheet = null; S.sos = v ? { from: 'layan', st: v === 'done' ? 'resolved' : 'sent', ch: v === 'sms' ? 'sms' : 'server', via: v === 'sms' ? 'عبر SMS (دون اتصال)' : 'عبر الإنترنت', place: AD_HOME, fix: v === 'last' ? 'last' : 'new', lk: 18, ack: v === 'ack' ? 'سارة' : null, exh: v === 'exh' ? 1 : 0, by: v === 'done' ? 'أحمد' : '', note: v === 'done' ? 'ضغطت الزر بالخطأ' : '' } : null; render(); },
    blEv(v) { blEv(v); },
    cfEv(v) { S.sheet = S.full = S.dlg = null; if (v === 'clear') cfDemo(); else cfEv(v); if (v !== 'clear') jump(v === 'lim' ? 'conflicts' : 'home', v === 'lim' ? ['layan'] : undefined); render(); },
    smsDemo(v) { S.smsOut = v !== 'ok'; S.smsEm = v === 'none' ? 0 : 3; render(); },
    ecFlip() { if ((S.ec || []).length) S.ec = []; else ACT.ecAdd(); render(); },
    odFlip() { if (S.ownDel) S.ownDel = 0; else { S.ownDel = 30; if (!S.co) S.co = { since: 'اليوم', seen: 1 }; } render(); },
    r13Flip() { S.rev13 = S.rev13 === 1 ? 0 : 1; render(); },
    /* المكافآت: أحداث وحالات للمعاينة */
    rwEv(v) { const R = RW(), L = S.kid.layan; S.sheet = S.full = S.dlg = null;
      if (v === 'day') { rwNextDay(); toast('انتقلنا إلى اليوم التالي', null, 'bedtime'); }
      else if (v === 'six') { L.streak = 6; R.day.layan = 0; R.frz.layan = { n: 0, on: 0 }; }
      else if (v === 'cap') { KIDS.forEach(id => { S.kid[id].spent = S.redeemCap; }); }
      else if (v === 'zero') { L.pts = 5; }
      else if (v === 'fz') { S.kid.khaled.pts = S.kid.khaled.pts ? 0 : 40; }
      else if (v === 'obj') { jump('obj-decide'); return; }
      else if (v === 'rev') { if (!R.led.layan.some(e => e.k === 'rev')) rwRev('layan', 'l5', 'ahmad'); setPersona('child'); jump('c-rewards'); return; }
      render(); },
    coFlip() { S.co = S.co ? null : { since: 'اليوم', seen: 0 }; render(); },
    expFlip() { const g = S.g['location.history.view']; if (g) { g.un = g.un ? '' : addDays(5); g.ed = g.un ? 1 : 0; } render(); },
    sys(id) { Studio.open[id] = !Studio.open[id]; Studio.sync(); },
    jump(id) { JR = null; jump(id); document.body.removeAttribute('data-open'); },
    req(k) { const ids = COVER[k]; if (ids) { JR = null; jump(ids[0]); document.body.removeAttribute('data-open'); } },
    reset() { const keep = { persona: S.persona, theme: S.theme, lang: S.lang, ts: S.ts }; S = fresh(); Object.assign(S, keep); S.stack = [{ id: rootOf(S.persona), a: [] }]; JR = null; render(); toast('أُعيدت بيانات العرض إلى بدايتها', null, 'refresh'); },
    warn5() { if (!['child', 'teen'].includes(S.persona)) setPersona('child'); const id = PERSONA[S.persona].m, a = S.apps[id].find(x => x.act === 'LIMIT') || S.apps[id][0]; S.full = null; S.sheet = { id: 'warn5', a: [a.id] }; render(); },
    boot() { boot(); },
    brand(pg) { const o = $('#brandOv'), f = $('#brandFr'); if (pg === 'opts') f.src = 'brand-options.html?v=20261127a'; else if (!f.getAttribute('src')) f.src = 'brand.html?v=20261127a'; o.hidden = false; document.body.removeAttribute('data-open'); },
    brandClose() { $('#brandOv').hidden = true; try { localStorage.setItem('fos-brand-seen', '1'); localStorage.setItem('fos-brand-opts-seen', '1'); } catch (e) { /* التخزين محجوب: لا يضر */ } },
    pane(x) { document.body.dataset.open === x ? document.body.removeAttribute('data-open') : (document.body.dataset.open = x); },
    closePane() { document.body.removeAttribute('data-open'); },
  },
  sync() {
    $('#personas').innerHTML = Object.entries(PERSONA).map(([k, p]) => { const m = p.m ? M[p.m] : { c: p.c, i: p.i }; return `<button class="pcard" data-st="persona:${k}" aria-pressed="${S.persona === k}"><span class="av" style="--c:${m.c}">${ic(m.i)}</span><span><b>${p.n}</b><span>${p.d}</span></span></button>`; }).join('');
    $('#jbar').innerHTML = JR ? (j => `<div class="jbar"><p><b>${j.t} · ${JR.k + 1}/${j.s.length}</b>${j.s[JR.k][0]}</p>${JR.k ? `<button class="x" data-st="jprev" aria-label="السابق">${ic('arrow_forward')}</button>` : ''}<button data-st="jnext">${JR.k < j.s.length - 1 ? 'التالي' : 'إنهاء'}</button><button class="x" data-st="jend" aria-label="إغلاق">${ic('close')}</button></div>`)(JOURNEYS[JR.i]) : '';
    const T = [['ctx', 'السياق'], ['state', 'الحالات'], ['cov', 'التغطية'], ['ds', 'الأساسات']];
    $('#paneL').innerHTML = `<div class="tabs" role="tablist">${T.map(([k, t]) => `<button role="tab" aria-selected="${Studio.tab === k}" data-st="tab:${k}">${t}</button>`).join('')}</div><div class="tabp">${Studio['p_' + Studio.tab]()}</div>`;
  },
  p_ctx() {
    const d = current(), R = reqsOf(d), st = { ok: ['السلوك من مواصفة معتمدة', 'ok'], pr: ['مقترح — PROPOSED', 'pr'], un: ['يتضمن غير محسوم — UNKNOWN', 'un'] }[d.st || 'ok'];
    const title = typeof d.t === 'function' ? d.t(...((S.full || S.sheet || topE()).a.length ? (S.full || S.sheet || topE()).a : d.a || [])) : d.t;
    const sysn = (window.FOS_REQ.find(s => s.id === d.sys) || {}).name || '';
    return `<div style="font-size:17px;font-weight:700;line-height:1.5">${title}</div><div class="mono" style="font-size:11px;color:var(--st-mute);margin:2px 0 10px">${d.id} · ${{ screen: 'شاشة', sheet: 'ورقة سفلية', full: 'طبقة كاملة' }[d.kind]}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px"><span class="tag ${st[1]}">${st[0]}</span><span class="tag nt">${d.sys} · ${sysn}</span><span class="tag nt">${PERSONA[S.persona].n}</span></div>
    ${d.note ? `<div class="note">${d.note}</div>` : ''}
    <div class="st-h">المتطلبات الممثَّلة هنا (${R.length})</div>${R.map(k => { const r = REQIDX[k]; return r ? `<div class="reqc"><code>${k.replace('/REQ-', '·')}</code><span>${r.t}</span></div>` : ''; }).join('') || '<div class="note">لا متطلبات مربوطة بهذا السطح.</div>'}
    <div class="st-h">المصدر</div><div class="note mono" style="font-size:10.5px;direction:ltr;text-align:left;word-break:break-all">docs/family-os/governance/phases/phase-1/${d.sys}-*/SPEC.md §3 · §9</div>
    <div class="note">التركيب البصري لكل الأسطح <b>مقترح</b> حتى يعتمده المالك. السلوك والأرقام والنصوص الحاكمة من المواصفات المعتمدة ونظام التصميم (Q-383).</div>`;
  },
  p_state() {
    const sg = (k, opts) => `<div class="sg">${opts.map(([v, t]) => `<button aria-pressed="${String(S[k]) === String(v)}" data-st="set:${k}:${v}">${t}</button>`).join('')}</div>`;
    const sw = (k, on) => `<button class="sw" role="switch" aria-checked="${on ?? !!S[k]}" data-st="flip:${k}"></button>`;
    const c = (t, s, ctl) => `<div class="ctl"><span>${t}${s ? `<small>${s}</small>` : ''}</span>${ctl}</div>`;
    return `<div class="st-h" style="margin-top:0">العرض</div>${c('المظهر', '', sg('theme', [['light', 'فاتح'], ['dark', 'داكن']]))}${c('اللغة والاتجاه', 'الغلاف والتهيئة مترجمان', sg('lang', [['ar', 'ع RTL'], ['en', 'EN LTR']]))}${c('حجم النص', '', sg('ts', [[0.9, 'ص'], [1, 'ع'], [1.15, 'ك'], [1.3, 'ك+']]))}${c('تقليل الحركة', '', `<button class="sw" role="switch" aria-checked="${S.motion === 'off'}" data-st="set:motion:${S.motion === 'off' ? 'on' : 'off'}"></button>`)}${c('وضع الخصوصية', 'يخفي الأسماء والأماكن', sw('privacy'))}
    <div class="st-h">الشبكة والبيانات</div>${c('الاتصال', 'الأفعال تُحفظ وتُرسل لاحقاً', sg('net', [['on', 'متصل'], ['off', 'منقطع']]))}${c('اتصال ضعيف', 'يفعّل توفير البيانات', sw('lbw'))}${c('تعارض مزامنة', 'يظهر في «البيانات والمزامنة»', sw('syncConflict'))}${c('بيانات قديمة', 'وسوم «آخر تحديث»', sw('stale'))}${c('خدمة أُزيلت', 'تختفي بطاقاتها فوراً', sg('svcGone', [['', 'لا شيء'], ['loc', 'الموقع'], ['chat', 'المحادثة'], ['prot', 'الحماية']]))}${c('حالة اللوحة', 'الرئيسية عند الأب', sg('hub', [['', 'عادية'], ['empty', 'بلا أطفال'], ['nosnap', 'بلا نسخة'], ['bad', 'نسخة تالفة']]))}${c('جهاز ليان', 'تغيير القاعدة ينتظر اتصاله', sg('kidOff', [['', 'متصل'], ['layan', 'منقطع']]))}
    <div class="st-h">المحادثة</div>${c('يكتب الآن', 'مؤشر الكتابة في مجلس العائلة', sw('typing'))}${c('فشل الإرسال', 'الرسالة التالية لا تصل للخادم', sw('sendFail'))}${c('صورة أكبر من الحد', 'أكبر من 10 م.ب', sw('bigMedia'))}${c('المصنّف يوقف الرسالة التالية', 'في محادثة فيها ابن', sw('blockNext'))}${c('فئة التنبيه', 'كما تظهر في «تنبيه المصنّف»', sg('flagCat', [['', 'تنمّر'], ['threat', 'تهديد'], ['sexual', 'غير لائق'], ['distress', 'ضيق']]))}${c('تحميل المحادثات', 'قبل وصول القائمة', sw('chLoad'))}${c('تعذّر جلب المحادثات', 'خطأ من الخادم', sw('chErr'))}${c('السجل القديم لا يُسترد', 'تغيّر الرقم السري دون القديم', sw('crDead'))}
    <div class="st-h">المكافآت</div><button class="jr" data-st="rwEv:day">${ic('bedtime')}<span>انتقل إلى اليوم التالي<small>ينتهي الوقت الإضافي، ويوم بلا كسب يقطع السلسلة</small></span></button><button class="jr" data-st="rwEv:six">${ic('local_fire_department')}<span>سلسلة ليان ستة أيام<small>اعتماد مهمة اليوم يكمل السبعة ويودِع المكافأة</small></span></button><button class="jr" data-st="rwEv:cap">${ic('hourglass_top')}<span>بلغ الحد اليومي<small>لا صرف ولا منح ولا طلب حتى الغد</small></span></button><button class="jr" data-st="rwEv:zero">${ic('stars')}<span>نقاط ليان لا تكفي<small>أقل من عشر نقاط</small></span></button><button class="jr" data-st="rwEv:obj">${ic('balance')}<span>اعتراض ينتظر الأب<small>ليان تعترض على مهمة لم تُعتمد</small></span></button><button class="jr" data-st="rwEv:rev">${ic('undo')}<span>الأب ألغى إيداعاً<small>ليان تراه في سجلها وتعترض</small></span></button>${c('لخالد رصيد مجمّد', 'كان له رصيد قبل بلوغه 13', `<button class="sw" role="switch" aria-checked="${S.kid.khaled.pts > 0}" data-st="rwEv:fz"></button>`)}
    <div class="st-h">الموقع والاستغاثة</div>${c('موقع خالد', 'كما يراه الأب', sg('locK', [['', 'حي'], ['old', 'قديم'], ['poor', 'تقريبي'], ['mov', 'يتحرك'], ['low', 'بطارية'], ['off', 'مغلق'], ['none', 'لا موقع']]))}${c('عنوان خالد', 'ما تعرفه الخريطة عن مكانه', sg('adK', [['', 'شارع'], ['poi', 'معلم'], ['area', 'حي فقط'], ['none', 'بلا اسم']]))}${c('سارة أوقفت مشاركة موقعها', 'يظهر ذلك لأحمد', sw('pause_sara'))}${c('تحميل المواقع', 'قبل وصول أول قراءة', sw('locLoad'))}${c('موقع هاتفي متوقف', 'لا نقطة «أنت» ولا مسافات', sw('myLocOff'))}${c('استغاثة ليان', 'كما يراها الأهل', `<div class="sg">${[['', 'لا شيء'], ['live', 'نشطة'], ['sms', 'نصية'], ['last', 'بلا موقع جديد'], ['ack', 'أُكّدت'], ['exh', 'لم يؤكد أحد'], ['done', 'حُلّت']].map(([v, t]) => `<button aria-pressed="${sosDemoCur() === v}" data-st="sosDemo:${v}">${t}</button>`).join('')}</div>`)}${c('رصيد الرسائل النصية', 'يحكم الاستغاثة بلا إنترنت', `<div class="sg">${[['ok', 'كافٍ'], ['out', 'انتهى'], ['none', 'انتهى مع الطارئة']].map(([v, t]) => `<button aria-pressed="${(S.smsOut ? (smsEm() ? 'out' : 'none') : 'ok') === v}" data-st="smsDemo:${v}">${t}</button>`).join('')}</div>`)}${c('تحديد الموقع متوقف', 'في الهاتف المحمول الآن', sw('gpsOff'))}${c('تعذّر تحميل الخريطة', '', sw('tilesFail'))}${c('جهة طوارئ خارجية', 'العم ناصر', `<button class="sw" role="switch" aria-checked="${(S.ec || []).length > 0}" data-st="ecFlip"></button>`)}
    <div class="st-h">المنصة والخطة</div>${c('نظام التشغيل', 'مصفوفة التوفر الصادقة', sg('os', [['android', 'Android'], ['ios', 'iOS']]))}${c('الخطة', 'حارس الحصص', sg('plan', [['free', 'مجانية'], ['basic', 'أساسية'], ['premium', 'مميزة']]))}${c('حالة الاشتراك', '', sg('planSt', [['', 'فعّال'], ['trial', 'تجربة'], ['grace', 'مهلة']]))}${c('سوق العائلة', 'يحدد العملة وطرق الدفع', sg('reg', [['YE', 'اليمن'], ['GCC', 'الخليج']]))}${c('دور سارة', 'يغيّر ما تراه البالغة المفوَّضة', sg('tpl', [['partner', 'شريك'], ['guardian', 'وصي'], ['observer', 'مراقب'], ['none', 'بلا']]))}${c('الصلاحية الكاملة لسارة', 'تصير مثل المالك', `<button class="sw" role="switch" aria-checked="${!!S.co}" data-st="coFlip"></button>`)}${c('المالك يحذف حسابه', 'والصلاحية الكاملة عند سارة', `<button class=\"sw\" role=\"switch\" aria-checked=\"${!!S.ownDel}\" data-st=\"odFlip\"></button>`)}${c('ليان بلغت 13', 'مراجعة ما يُسمح به لها', `<button class=\"sw\" role=\"switch\" aria-checked=\"${S.rev13 === 1}\" data-st=\"r13Flip\"></button>`)}${c('صلاحية لسارة تنتهي قريباً', 'تنبيه قبل 7 أيام', `<button class="sw" role="switch" aria-checked="${!!(S.g['location.history.view'] && S.g['location.history.view'].un)}" data-st="expFlip"></button>`)}
    <div class="st-h">الرقم السري والبصمة</div>${c('التأكيد بالبصمة', 'بدل الرقم السري، على هاتف الأهل', sw('bioAct'))}${c('آخر كتابة للرقم السري', 'بعد 30 يوماً يُطلب مرة', sg('pinAgo', [[12, 'قبل 12 يوماً'], [31, 'قبل 31 يوماً']]))}${c('بصمات الهاتف تغيّرت', 'أُضيفت بصمة أو حُذفت', sw('bioChg'))}
    <div class="st-h">تعارض القواعد</div><button class="jr" data-st="cfEv:sara">${ic('warning')}<span>سارة أبقت تعارضاً<small>حدّ Minecraft فوق حصة ليان · يصل أحمد</small></span></button><button class="jr" data-st="cfEv:teen">${ic('task_alt')}<span>خالد أضاف مهمة في وقت نومه<small>تعارض ظهر بلا بطاقة · يصل الأب</small></span></button><button class="jr" data-st="cfEv:lim">${ic('hourglass_top')}<span>حدّ فوق الحصة عند ليان<small>يفتح صفحة التعارضات</small></span></button><button class="jr" data-st="cfEv:clear">${ic('restart_alt')}<span>أعد قواعد العرض<small>يزيل ما أضافته هذه الأحداث</small></span></button>
    <div class="st-h">الخطة والدفع</div>${c('نتيجة الدفع بالمتجر', 'ما يردّ به الخادم بعد الشراء', sg('payDemo', [['', 'ينجح'], ['fail', 'مرفوض'], ['bad', 'إيصال لم يُقبل'], ['down', 'المتجر لا يرد']]))}${c('استعادة المشتريات', 'في سوق الخليج', sg('restDemo', [['', 'لا شيء'], ['found', 'وُجد اشتراك']]))}${c('شاشة الخطة', 'حالات الجلب', sg('blSt', [['', 'عادية'], ['load', 'تحميل'], ['err', 'خطأ'], ['part', 'عدّاد ناقص']]))}<button class="jr" data-st="blEv:ver">${ic('verified')}<span>المحفظة أكّدت الدفعة<small>تتغير الخطة ويصل إشعار</small></span></button><button class="jr" data-st="blEv:rej">${ic('error')}<span>المحفظة رفضت الدفعة<small>لا تتغير الخطة</small></span></button><button class="jr" data-st="blEv:tr2">${ic('notifications')}<span>التجربة تنتهي بعد يومين<small>تذكير · لا خصم تلقائي</small></span></button><button class="jr" data-st="blEv:tr0">${ic('notifications')}<span>اليوم الأخير من التجربة<small>التذكير الثاني</small></span></button><button class="jr" data-st="blEv:trend">${ic('redeem')}<span>انتهت التجربة<small>مهلة 3 أيام، أو العودة إلى الخطة المدفوعة فوراً</small></span></button><button class="jr" data-st="blEv:exp">${ic('event_busy')}<span>انتهت الفترة بلا تجديد<small>تبدأ مهلة 3 أيام</small></span></button><button class="jr" data-st="blEv:fall">${ic('info')}<span>انتهت المهلة<small>تعود العائلة إلى المجانية بلا قفل ولا حذف</small></span></button><button class="jr" data-st="blEv:w80">${ic('sms')}<span>الرسائل بلغت 85%<small>تنبيه 80%</small></span></button><button class="jr" data-st="blEv:aiout">${ic('wand_stars')}<span>نفدت عمليات المساعد<small>يتوقف بهدوء</small></span></button>
    <div class="st-h">حالات النظام</div>${c('حالة التطبيق', '', sg('sys', [['ok', 'عادي'], ['maint', 'صيانة'], ['first', 'أول فتح بلا اتصال']]))}${c('التحديث', 'متاح: صف في «عن التطبيق» · قديم: حثّ غير حاجب', sg('sys', [['ok', 'لا شيء'], ['avail', 'متاح'], ['soft', 'قديم'], ['update', 'إجباري']]))}${c('إذن الإشعارات', 'إيقافه يُظهر بانراً', sw('notifPerm'))}${c('استغاثة بنقرة ثم تأكيد', 'بديل الوصول', sw('sos2'))}${c('الوضع الجاهز للأطفال', '', sg('preset', [['', 'لا شيء'], ['study', 'دراسة'], ['sleep', 'نوم']]))}${c('تعارض تعديل متزامن', 'يفشل الحفظ التالي للصلاحيات', sw('conflict'))}
    <div class="st-h">أحداث</div><button class="jr" data-st="warn5">${ic('hourglass_top')}<span>تحذير الدقائق الخمس<small>على جهاز الطفل</small></span></button><button class="jr" data-st="boot">${ic('rocket_launch')}<span>إقلاع بارد<small>الهدف أقل من 1.2 ثانية</small></span></button><button class="jr" data-st="jump:pin">${ic('lock')}<span>بوابة الوالدين<small>5 أخطاء ← قفل 5 دقائق</small></span></button><button class="jr" data-st="jump:block">${ic('hourglass_empty')}<span>شاشة الحظر<small>على جهاز الطفل</small></span></button>`;
  },
  p_cov() {
    let ui = 0, rep = 0, noui = 0;
    const rows = window.FOS_REQ.map(s => { const u = s.reqs.filter(r => !r.noui), n = u.filter(r => COVER[`${s.id}/${r.id}`]).length; ui += u.length; rep += n; noui += s.reqs.length - u.length;
      const open = Studio.open[s.id], cur = new Set(reqsOf(current()));
      return `<button class="sysrow" data-st="sys:${s.id}"><span class="mono" style="color:var(--st-gold)">${s.id.slice(3)}</span><b>${s.name}</b><span class="bar"><i style="width:${n / u.length * 100}%"></i></span><span>${n}/${u.length}</span></button>${open ? s.reqs.map(r => { const k = `${s.id}/${r.id}`, c = COVER[k]; return `<button class="reqc ${c ? '' : 'no'} ${cur.has(k) ? 'cur' : ''}" ${c ? `data-st="req:${k}"` : ''}><code>${r.id.slice(4)}</code><span>${r.t}${r.noui ? ' <span class="tag nt">بلا واجهة</span>' : c ? '' : ' <span class="tag un">غير ممثَّل</span>'}${c && c.length > 1 ? ` <span style="color:var(--st-mute)">· ${c.length} أسطح</span>` : ''}</span></button>`; }).join('') : ''}`; }).join('');
    const nS = Object.keys(SC).length, k = Object.values(SC).reduce((a, d) => (a[d.kind]++, a), { screen: 0, sheet: 0, full: 0 });
    return `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">${[[`${rep}/${ui}`, 'متطلب واجهة ممثَّل'], [noui, 'بلا واجهة (خادم)'], [nS, 'سطحاً تفاعلياً']].map(([v, t]) => `<div class="note" style="margin:0;text-align:center"><b style="font-size:20px;display:block">${v}</b>${t}</div>`).join('')}</div>
    <div class="note">«ممثَّل» تعني أن للمتطلب سطحاً يعرضه أو يحاكيه في النموذج — لا أنه مُختبَر أو معتمد. المتطلبات الموسومة «بلا واجهة» في المواصفات تُحسب منفصلة. اضغط أي متطلب للانتقال إلى سطحه.<br>${k.screen} شاشة · ${k.sheet} ورقة · ${k.full} طبقة كاملة.</div>${rows}`;
  },
  p_ds() {
    const sw = (arr) => `<div class="swatch">${arr.map(([h, n, fg]) => `<div style="background:${h};color:${fg || '#fff'}" title="${n}">${n}</div>`).join('')}</div>`;
    const T = [[40, 700, 'عرض'], [28, 700, 'عنوان'], [20, 600, 'عنوان فرعي'], [16, 400, 'نص'], [14, 400, 'نص صغير'], [12, 500, 'تسمية (الحد الأدنى)']];
    return `<div class="note" style="margin-top:0">القيم من <span class="mono">design-system/*.md</span> المجمَّدة (Q-383). الهاتف يستخدمها مباشرة بلا قيم بديلة.</div>
    <div class="st-h">الألوان الأساسية · 60–30–10</div>${sw([['#1F3A6B', 'navy 500'], ['#142749', '700'], ['#0A152A', '900'], ['#081122', '950'], ['#FCFAED', 'cream', '#0A152A']])}<div style="height:6px"></div>${sw([['#1F6B3B', 'green'], ['#CF5B2C', 'orange'], ['#C8A24A', 'gold', '#0A152A'], ['#7F300E', 'orange txt'], ['#F7F6F0', 'n-50', '#0A152A']])}
    <div class="st-h">الدلالية (اللون ليس الإشارة الوحيدة)</div>${sw([['#1F6B3B', 'success'], ['#9A5B00', 'warning'], ['#B42318', 'danger'], ['#2457A6', 'info'], ['#625C4D', 'muted']])}<div style="height:6px"></div>${sw([['#73AB82', 'dark ok', '#081122'], ['#D09A65', 'dark warn', '#081122'], ['#EE7A6A', 'dark dng', '#081122'], ['#719CE0', 'dark info', '#081122'], ['#7089B5', 'dark pri', '#081122']])}
    <div class="st-h">الطباعة · IBM Plex Sans Arabic</div>${T.map(([s, w, n]) => `<div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:3px 0;border-bottom:1px dashed #1E315480"><span style="font-size:${Math.min(s, 30)}px;font-weight:${w};line-height:1.4">عائلتي</span><span class="mono" style="font-size:10.5px;color:var(--st-mute)">${s}/${w} · ${n}</span></div>`).join('')}<div class="note">بلا تباعد حروف في العربية · الطفل ×1.15.</div>
    <div class="st-h">الشبكة والزوايا واللمس</div><div style="display:flex;gap:8px;align-items:flex-end;margin-bottom:8px">${[4, 8, 12, 16, 24].map(r => `<div style="width:44px;height:44px;border:1.5px solid var(--st-gold);border-radius:${r}px;display:grid;place-items:center;font-size:10px" class="mono">${r}</div>`).join('')}</div><div style="display:flex;gap:8px;align-items:flex-end">${[[48, 'بالغ/مراهق'], [56, 'طفل'], [80, 'مبسّط']].map(([s, n]) => `<div style="text-align:center;font-size:10.5px;color:var(--st-mute)"><div style="width:${s}px;height:${s}px;border-radius:14px;background:#1F3A6B;border:1px solid #3C5F9E;display:grid;place-items:center;color:#fff;margin:0 auto 4px" class="mono">${s}</div>${n}</div>`).join('')}</div>
    <div class="st-h">الحركة</div><div class="kv"><dt>سريع</dt><dd class="mono">120–150ms</dd><dt>متوسط</dt><dd class="mono">220–250ms</dd><dt>بطيء</dt><dd class="mono">350–400ms</dd><dt>احتفال (أطفال فقط)</dt><dd class="mono">800–1500ms</dd></div>
    <div class="st-h">الأيقونات · Material Symbols Rounded</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">${[['home', 'nav.home'], ['sos', 'safety.sos'], ['lock', 'status.locked'], ['help', 'info.why'], ['supervisor_account', 'role.parent'], ['cloud_off', 'status.offline']].map(([i, n]) => `<div style="display:flex;align-items:center;gap:8px;font-size:11px" class="mono">${ic(i)}${n}</div>`).join('')}</div><div class="note">خط = غير محدد · ممتلئ = نشط · الاتجاهية تنعكس في RTL · الأيقونة تسند النص ولا تستبدله.</div>
    <div class="st-h">شارات التوفر السبع</div><div style="display:flex;flex-wrap:wrap;gap:6px">${['available', ...Object.keys(AVAIL)].map(k => `<span class="tag nt mono">${k}</span>`).join('')}</div>
    <div class="st-h">مفردات الحالة</div><div style="display:flex;flex-wrap:wrap;gap:6px"><span class="tag ok">سلوك معتمد</span><span class="tag pr">PROPOSED</span><span class="tag un">UNKNOWN</span></div>
    <div class="st-h">الأسطح غير المحسومة</div>${Object.values(SC).filter(d => d.st === 'un').map(d => `<button class="reqc" data-st="jump:${d.id}"><code>${d.id}</code><span>${(d.note || '').split('.')[0]}</span></button>`).join('')}`;
  },
};
window.Studio = Studio;
function boot() { $('#fx').innerHTML = `<div class="boot"><div><img src="assets/brand/logo-symbol-dark.svg" alt="عائلتي" width="150" height="125"><div class="ld"><i></i></div></div></div>`; setTimeout(() => { $('#fx').innerHTML = ''; }, 1150); }
/* رابط المراجعة (Q-448): ?show=الشاشة[:معامل]&as=child|teen&theme=dark&plan=basic|premium&pin=1 يفتح النموذج على شاشة بعينها، ليرى المالك كل تحسين في مكانه. أداة عرض، لا مسار في التطبيق. */
function reviewLink() {
  const q = new URLSearchParams(location.search), id = (q.get('show') || '').split(':'); if (!id[0] || !SC[id[0]]) return;
  if (q.get('theme') === 'dark') S.theme = 'dark'; if (['child', 'teen'].includes(q.get('as'))) setPersona(q.get('as'));
  if (PLAN[q.get('plan')]) S.plan = q.get('plan'); if (q.get('pin')) S.pin.set = true;
  go(id[0], ...id.slice(1)); render();
}
addEventListener('DOMContentLoaded', () => { mountSprite(); Studio.init(); render(); boot(); reviewLink();
  /* الشعار حُكم فيه («القمرية» — Q-433): لا تُفتح صفحته تلقائياً بعد الآن؛ مدخلها زر «الشعار والأيقونة». */
});
addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#brandOv').hidden) Studio.act.brandClose(); });
