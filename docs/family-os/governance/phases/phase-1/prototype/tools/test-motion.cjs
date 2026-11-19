// اختبار الحركة (Q-451): الحركة قصيرة ولها سبب، ولا تتكرر بلا سبب، وتتوقف عند «تقليل الحركة».
//   أ) المدد ضمن جدول الرموز في motion-and-feedback.md §2.
//   ب) الدخول مرة واحدة: الورقة والحوار والشاشة الكاملة تتحرك عند الفتح فقط، لا عند كل إعادة رسم وهي مفتوحة، ولا يعود تمريرها إلى الأعلى.
//   ج) التنقل: تبديل التبويب تلاشٍ سريع بلا انزلاق؛ الدخول والرجوع انزلاق قصير باتجاهين.
//   د) لحظة النجاح: النافذة تضيء مرة واحدة حين يظهر النجاح، لا عند إعادة الرسم؛ والاحتفال داخل 1500 م.ث ويحترم شدة الاحتفال.
//   هـ) تقليل الحركة: لا حركة جارية بعد لحظة، وما يتكرر يتوقف بدل أن يدور بسرعة قصوى، ولا قصاصات.
//   و) استجابة اللمس: كل ما يُضغط في كل الشاشات له استجابة عند الضغط.
// التشغيل من مجلد النموذج: NODE_PATH=<node_modules> node tools/test-motion.cjs        النجاح: fail=[] و errs=[].
const puppeteer=require('puppeteer-core');let chromium=require('@sparticuz/chromium');chromium=chromium.default||chromium;
const root=require('path').join(__dirname,'..');
(async()=>{const args=[...chromium.args.filter(a=>!/in-process-gpu|use-gl|use-angle|swiftshader|ignore-gpu/.test(a)),'--disable-gpu','--allow-file-access-from-files'];
const b=await puppeteer.launch({args,executablePath:await chromium.executablePath(),headless:'shell'});let R={};
try{const page=await b.newPage();await page.setViewport({width:1500,height:1000});const errs=[];page.on('pageerror',e=>errs.push(String(e)));page.on('console',m=>{if(m.type()==='warning'||m.type()==='error')errs.push('console:'+m.text())});
await page.goto('file://'+root+'/index.html?quiet=1');await page.evaluate(()=>document.fonts.ready);await new Promise(r=>setTimeout(r,1700));
R=await page.evaluate(async()=>{const R={},F=[];let N=0;const ph=document.getElementById('phone');const ok=(n,c,x)=>{N++;if(!c)F.push(n+(x!==undefined?' → '+JSON.stringify(x):''))};
 const W=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>ph.querySelector(s);
 const cls=e=>{const c=e.className;return typeof c==='string'?c:(c&&c.baseVal)||''};
 /* الحركات الجارية الآن: الاسم@أصناف العنصر */
 const run=()=>document.getAnimations().filter(a=>a.playState==='running'&&ph.contains(a.effect.target)).map(a=>(a.animationName||'tr')+'@'+cls(a.effect.target));
 const has=(n,c)=>run().some(x=>x.startsWith(n+'@')&&(!c||x.includes(c)));
 const start=p=>{document.getElementById('toast').innerHTML='';document.getElementById('notif').innerHTML='';document.getElementById('fx').innerHTML='';S=fresh();setPersona(p||'owner');render()};
 const ms=v=>{v=String(v).trim();return v.endsWith('ms')?parseFloat(v):parseFloat(v)*1000};
 try{
 /* ---------- أ) المدد ---------- */
 start();await W(350);const cs=getComputedStyle(ph),fast=ms(cs.getPropertyValue('--fast')),mid=ms(cs.getPropertyValue('--mid')),slow=ms(cs.getPropertyValue('--slow'));
 ok('أ1 السريعة 120–150 م.ث',fast>=120&&fast<=150,fast);ok('أ2 العادية 220–250 م.ث',mid>=220&&mid<=250,mid);ok('أ3 البطيئة 350–400 م.ث',slow>=350&&slow<=400,slow);
 ok('أ4 منحنى الارتداد معرَّف',/cubic-bezier/.test(cs.getPropertyValue('--spring')),cs.getPropertyValue('--spring'));
 ok('أ5 لا حركة جارية والشاشة ساكنة',run().length===0,run());

 /* ---------- ب) الدخول مرة واحدة ---------- */
 go('grant-points','layan');render();ok('ب1 الورقة تصعد عند الفتح',has('up','sheet')&&has('fd','scrim'),run());
 ok('ب2 مدة الصعود هي العادية',ms(getComputedStyle(q('.sheet')).animationDuration)===mid,getComputedStyle(q('.sheet')).animationDuration);
 await W(mid+120);ok('ب3 ثم تسكن',run().length===0,run());
 q('.sheet').scrollTop=30;const y0=q('.sheet').scrollTop;q('.sheet [data-a^="gpSet:n:"]:not([disabled])').click();
 ok('ب4 ضغطة داخل الورقة لا تعيد صعودها',!has('up')&&!has('fd'),run());ok('ب5 والورقة مفتوحة بقيمتها الجديدة',!!q('.scrim.st .sheet')&&S.gp.n!==10,S.gp&&S.gp.n);
 ok('ب6 ولا يعود تمريرها إلى الأعلى',q('.sheet').scrollTop===y0,[y0,q('.sheet').scrollTop]);
 S.sheet=null;render();ok('ب7 أُغلقت',!q('.sheet'));go('grant-points','layan');render();ok('ب8 فتحها من جديد يحرّكها من جديد',has('up','sheet')&&!q('.scrim.st'),run());await W(mid+120);
 go('grant-time','layan');render();ok('ب9 ورقة أخرى مكانها تدخل بحركتها',has('up','sheet'),run());await W(mid+120);
 /* الحوار */
 start();confirmDlg('عنوان','نص','نعم',()=>{});render();ok('ب10 الحوار يكبر عند الفتح',has('pop','dlg'),run());await W(mid+120);
 render();ok('ب11 وإعادة الرسم لا تعيده',!has('pop')&&!has('fd')&&!!q('.scrim.mid.st'),run());S.dlg=null;render();
 /* الشاشة الكاملة: لوحة الرقم السري */
 start();go('pin-set');render();ok('ب12 الشاشة الكاملة تتلاشى دخولاً',has('fd','full'),run());await W(mid+120);
 const key=q('.full .pad button');key.click();ok('ب13 ضغطة رقم لا تعيد دخولها',!has('fd')&&!!q('.full.st'),run());S.full=null;render();

 /* ---------- ج) التنقل ---------- */
 start();await W(60);const tabs=[...ph.querySelectorAll('.nav button')];tabs[1].click();
 ok('ج1 تبديل التبويب تلاشٍ',has('fd','tabf')&&!has('in')&&!has('inb'),run());ok('ج2 بالمدة السريعة',ms(getComputedStyle(q('#scr')).animationDuration)===fast,getComputedStyle(q('#scr')).animationDuration);
 await W(fast+100);ph.querySelector('.nav button[aria-current="page"]').click();ok('ج3 ضغط التبويب الحالي لا يحرّك شيئاً',run().length===0,run());
 start();go('family');render();const n1=getComputedStyle(q('#scr')).animationName;ok('ج4 الدخول انزلاق قصير',/^(in|inb)$/.test(n1)&&ms(getComputedStyle(q('#scr')).animationDuration)===mid,n1);
 await W(mid+100);back();render();const n2=getComputedStyle(q('#scr')).animationName;ok('ج5 والرجوع بالاتجاه المعاكس',/^(in|inb)$/.test(n2)&&n2!==n1,[n1,n2]);await W(mid+100);
 let off=0;for(const ss of document.styleSheets)for(const r of ss.cssRules)if(r.type===CSSRule.KEYFRAMES_RULE&&/^(in|inb)$/.test(r.name)){const m=/translateX\((-?\d+)px\)/.exec(r.cssText);off=Math.max(off,Math.abs(+m[1]))}
 ok('ج6 إزاحة الدخول صغيرة (8–24)',off>=8&&off<=24,off);

 /* ---------- د) لحظة النجاح ---------- */
 start();S.pin.set=true;go('pair-code','layan');render();await W(mid+100);ok('د1 قبل الاقتران لا نافذة احتفال',!q('#scr .art.fest'));
 q('[data-a="pcSet:done"]').click();ok('د2 عند الاقتران تظهر النافذة وتضيء',!!q('#scr .art.fest.nw')&&has('lt'),run());
 const last=Math.max(...[...ph.querySelectorAll('#scr .art.nw *')].map(e=>{const c=getComputedStyle(e);return c.animationName==='none'?0:ms(c.animationDuration)+ms(c.animationDelay)}));
 ok('د3 الإضاءة كلها أقل من نصف ثانية',last>0&&last<=500,last);await W(last+120);ok('د4 ثم تسكن',run().length===0,run());
 render();ok('د5 إعادة الرسم لا تعيد الإضاءة',!!q('#scr .art.fest')&&!q('#scr .art.nw')&&!has('lt'),run());
 start();go('plan-grace');render();ok('د6 نافذة «كل شيء بخير» لا تتحرك عند دخول شاشة',!!q('#scr .art.lit')&&!q('#scr .art.nw')&&!has('lt'),run());await W(mid+100);
 /* الطفل كسب نقاطاً */
 start();ACT.taskOk('t1');document.getElementById('toast').innerHTML='';setPersona('child');render();await W(330);
 ok('د7 بطاقة الكسب تنزل ونافذتها تضيء',!!q('.notif.cel .art.fest.nw')&&has('lt'),run());
 ok('د8 بارتداد خفيف في قالب الطفل',getComputedStyle(q('.notif.cel')).animationTimingFunction===cs.getPropertyValue('--spring').trim().replace(/,\s*/g,', ')||/1\.45/.test(getComputedStyle(q('.notif.cel')).animationTimingFunction),getComputedStyle(q('.notif.cel')).animationTimingFunction);
 ok('د9 وعدّاد النقاط ينبض',!!q('.bar .chip.go.pls'));
 const cf=[...ph.querySelectorAll('#fx .confetti i')],lim=Math.max(0,...cf.map(e=>{const c=getComputedStyle(e);return ms(c.animationDuration)+ms(c.animationDelay)}));
 ok('د10 القصاصات في الشدة الكاملة',cf.length>0);ok('د11 والاحتفال كله داخل 1500 م.ث',lim>=800&&lim<=1500,lim);
 await W(1600);ok('د12 القصاصات تُزال بعدها',!q('#fx .confetti'));
 start();RW().cele='light';ACT.taskOk('t1');setPersona('child');render();await W(330);ok('د13 الخفيف: بطاقة بلا قصاصات',!!q('.notif.cel')&&!q('#fx .confetti'));
 start();RW().cele='off';ACT.taskOk('t1');setPersona('child');render();await W(330);ok('د14 الصامت: لا بطاقة ولا قصاصات ولا نبضة',!q('.notif')&&!q('#fx .confetti')&&!q('.chip.pls'));
 /* الورقة: طُبّق الدور */
 start();go('tpl-diff','guardian');render();await W(mid+100);ok('د15 قبل التطبيق لا نافذة',!q('.sheet .art'));
 go('tpl-diff','guardian',1);render();ok('د16 ورقة النتيجة فيها النافذة المضيئة',!!q('.sheet .artc .art.lit'));

 /* ---------- هـ) تقليل الحركة ---------- */
 start();S.motion='off';render();ok('هـ1 الهاتف يعلن تقليل الحركة',ph.dataset.motion==='off');
 go('grant-points','layan');render();await W(40);ok('هـ2 الورقة تظهر فوراً',run().length===0,run());S.sheet=null;
 S.chLoad=1;tab('chat');render();await W(40);const sk=q('.skel');
 ok('هـ3 هيكل التحميل ظاهر',!!sk);if(sk){const c=getComputedStyle(sk);ok('هـ4 ولا يدور: مرة واحدة فورية',c.animationIterationCount==='1'&&ms(c.animationDuration)<=1,[c.animationIterationCount,c.animationDuration]);}
 ok('هـ5 لا حركة جارية',run().length===0,run());
 start();S.motion='off';S.pin.set=true;go('pair-code','layan');render();q('[data-a="pcSet:done"]').click();await W(40);
 ok('هـ6 النافذة تظهر مضيئة بلا حركة',!!q('#scr .art.fest')&&run().length===0,run());
 const dl=[...ph.querySelectorAll('#scr .art *')].map(e=>ms(getComputedStyle(e).animationDelay));ok('هـ7 وبلا تأخير متدرّج',dl.every(v=>v===0),dl.filter(v=>v));
 start();S.motion='off';ACT.taskOk('t1');setPersona('child');render();await W(330);ok('هـ8 الكسب: بطاقة ثابتة بلا قصاصات',!!q('.notif.cel')&&!q('#fx .confetti')&&run().length===0,run());
 start();S.lbw=true;render();ok('هـ9 وضع النطاق المنخفض يوقف الحركة كذلك',ph.dataset.motion==='off');S.lbw=false;
 /* الاستغاثة تحتفظ بمدة الضغط المطوّل (وظيفة لا زينة) */
 let hold=false;for(const ss of document.styleSheets)for(const r of ss.cssRules)if(r.selectorText&&/data-motion="off"\] \.sos\.holding i/.test(r.selectorText)&&/3s/.test(r.cssText))hold=true;ok('هـ10 الضغط المطوّل للاستغاثة يبقى 3 ثوانٍ',hold);

 /* ---------- و) استجابة اللمس ---------- */
 const act=[];for(const ss of document.styleSheets)for(const r of ss.cssRules)if(r.selectorText&&r.selectorText.includes(':active'))for(const s of r.selectorText.split(/,(?![^(]*\))/))if(s.includes(':active'))act.push(s.replace(/:active/g,'').trim());
 ok('و1 قواعد الاستجابة مقروءة',act.length>=15,act.length);
 /* المستثنى بقصد: المفتاح (تغيّر حالته هو الاستجابة)، وزر الاستغاثة (له عدّ ظاهر عند الضغط)، وخلفية الورقة. */
 const skip=e=>e.matches('.tg,.sw,.sos,.scrim');const miss={};let tot=0,seen=0;
 for(const p of ['owner','child','teen'])for(const id of Object.keys(SC)){const d=SC[id];try{S=fresh();setPersona(p);go(id,...(d.a||[]));render()}catch(e){continue}seen++;
  for(const e of ph.querySelectorAll('button,a[data-a],[data-a]')){if(e.disabled||!e.offsetParent||skip(e))continue;tot++;let hit=false;
   for(const s of act){try{if(e.matches(s)){hit=true;break}const i=s.lastIndexOf(' ');if(i>0&&e.matches(s.slice(0,i))&&e.querySelector(s.slice(i+1))){hit=true;break}}catch(_){}}
   if(!hit){const k=e.tagName.toLowerCase()+'.'+cls(e).replace(/\s+/g,'.');miss[k]=(miss[k]||0)+1}}}
 ok('و2 فُحصت الشاشات كلها بثلاث شخصيات',seen>=500&&tot>4000,[seen,tot]);ok('و3 كل ما يُضغط يستجيب',Object.keys(miss).length===0,miss);
 }catch(e){F.push('ERR '+e.message+' '+String(e.stack).split('\n')[1])}
 R.checks=N;R.fail=F;return R;});
R.errs=errs;}catch(e){R.crash=String(e.stack||e).slice(0,900)}finally{await b.close()}
console.log(JSON.stringify(R,null,1));process.exitCode=(R.crash||(R.fail||[]).length||(R.errs||[]).length)?1:0;})();
