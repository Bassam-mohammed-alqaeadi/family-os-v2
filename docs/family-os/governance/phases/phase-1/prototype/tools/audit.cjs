// فحص أهداف اللمس في المنصة كلها (المراجعة الختامية — ROADMAP):
//   يفتح كل سطح بكل شخصية، ويقيس مساحة اللمس الفعلية لكل ما يُلمس بوحدات التصميم (لا ببكسلات الشاشة).
//   مساحة اللمس = الزر نفسه + العنصر الشفاف الذي يكمله (‎::before‎)، مقصوصةً بما يقصّها من الحاويات.
//   touch    ما مساحة لمسه أقل من 48 ارتفاعاً أو 44 عرضاً (خلايا التقويم السبع لا تتسع لـ48 في عرض الهاتف)
//   overlap  هدفان تتداخل مساحتا لمسهما بأكثر من بكسلين (أحدهما يسرق اللمسة من الآخر)
//   jiggle   حاوية صارت تُمرَّر عمودياً ببضعة بكسلات بسبب مساحة لمس خرجت عنها
// يحتاج puppeteer-core و@sparticuz/chromium (غير مضمَّنين في المستودع):  NODE_PATH=<node_modules> node tools/audit.cjs [حجم الخط] [en]
//   dead     زر يحمل اسم فعل غير معرَّف (يُضغط فلا يحدث شيء)
//   gap      هدفان ظاهرا الشكل بينهما أقل من 8 (وللطفل 12) — spacing-and-grid §3 (Q-430)
//   states   عدد الحالات غير الافتراضية التي قيست فوق الحالة الافتراضية: كل مفتاح داخل السطح يبدّل حالته يُضغط ثم يُعاد القياس (Q-430)
// النجاح: touch=[] و overlap=[] و gap=[] و jiggle=[] و dead=[] و errs=[].
const puppeteer=require('puppeteer-core');let chromium=require('@sparticuz/chromium');chromium=chromium.default||chromium;
const root=require('path').join(__dirname,'..');
(async()=>{const args=[...chromium.args.filter(a=>!/in-process-gpu|use-gl|use-angle|swiftshader|ignore-gpu/.test(a)),'--disable-gpu','--allow-file-access-from-files'];
const b=await puppeteer.launch({args,executablePath:await chromium.executablePath(),headless:'shell',protocolTimeout:300000});let R={};
try{const page=await b.newPage();await page.setViewport({width:1500,height:1000});const errs=[];page.on('pageerror',e=>errs.push(String(e)));
await page.goto('file://'+root+'/index.html?quiet=1');await page.evaluate(()=>document.fonts.ready);await new Promise(r=>setTimeout(r,1500));
await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});   /* القياس بعد استقرار الشاشة لا في منتصف حركة الدخول */
const TS=+process.argv[2]||0,LANG=process.argv[3]||'';   /* اختياري: حجم الخط (مثل 1.3) واللغة (en) */
R=await page.evaluate((TS,LANG)=>{const R={};const ph=document.getElementById('phone');const MIN=47.5,MINW=43.5;
 const SCALE=ph.getBoundingClientRect().width/ph.offsetWidth;R.scale=+SCALE.toFixed(3);
 const SEL='button,a[href],[data-a],[role="button"],[role="switch"],input[type="checkbox"],input[type="radio"],select';
 const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'};
 /* مساحة اللمس بوحدات التصميم: {t,b,l,r} */
 const hit=e=>{const r=e.getBoundingClientRect();const es=getComputedStyle(e);let t=r.top,bt=r.bottom,l=r.left,rt=r.right;
   for(const ps of ['::before','::after']){const cs=getComputedStyle(e,ps);if(cs.content==='none'||cs.position!=='absolute'||cs.pointerEvents==='none'||cs.display==='none')continue;
     const w=parseFloat(cs.width),h=parseFloat(cs.height);if(!(w>0&&h>0))continue;const m=(cs.transform.match(/matrix\(([^)]+)\)/)||[0,'1,0,0,1,0,0'])[1].split(',').map(Number);
     const pt=r.top+(parseFloat(es.borderTopWidth)+parseFloat(cs.top)+m[5])*SCALE,pl=r.left+(parseFloat(es.borderLeftWidth)+parseFloat(cs.left)+m[4])*SCALE;
     if(isNaN(pt)||isNaN(pl))continue;t=Math.min(t,pt);bt=Math.max(bt,pt+h*SCALE);l=Math.min(l,pl);rt=Math.max(rt,pl+w*SCALE)}
   if(es.overflow!=='visible'){t=r.top;bt=r.bottom;l=r.left;rt=r.right}
   /* القصّ: الحاوية التي تقصّ تنقص المساحة؛ والتي تُمرَّر فعلاً لا تنقصها (ما خرج عنها يُجلب بالتمرير) ويتوقف القصّ عندها */
   let cy=true,cx=true,sc=null;for(let a=e.parentElement;a&&a!==ph.parentElement&&(cx||cy);a=a.parentElement){const as=getComputedStyle(a);const ar=a.getBoundingClientRect();
     if(cy&&as.overflowY!=='visible'){if(/auto|scroll/.test(as.overflowY)&&a.scrollHeight>a.clientHeight+1){cy=false;sc=a}else{t=Math.max(t,ar.top);bt=Math.min(bt,ar.bottom)}}
     if(cx&&as.overflowX!=='visible'){if(/auto|scroll/.test(as.overflowX)&&a.scrollWidth>a.clientWidth+1)cx=false;else{l=Math.max(l,ar.left);rt=Math.min(rt,ar.right)}}}
   return {t:t/SCALE,b:bt/SCALE,l:l/SCALE,r:rt/SCALE,sc}};
 /* عنصر داخل حاوية تُمرَّر، والآخر خارجها (شريط التنقل): الحاوية تقصّ مساحة لمسه عند حدّها، فلا يتداخلان فعلاً (Q-430) */
 const clipTo=(h,o)=>{if(!h.sc||h.sc.contains(o))return h;const r=h.sc.getBoundingClientRect();return {t:Math.max(h.t,r.top/SCALE),b:Math.min(h.b,r.bottom/SCALE),l:h.l,r:h.r}};
 const name=e=>(e.className&&String(e.className).split(' ')[0]||(String(e.parentElement.className).split(' ')[0]||e.parentElement.tagName.toLowerCase())+'>'+e.tagName.toLowerCase())+(e.closest('h3.sec')?'@sec':e.closest('.nav')?'@nav':e.closest('.hero')?'@hero':e.closest('.bar')?'@bar':e.closest('.sheet')?'@sheet':'');
 const touch={},over={},jig={},dead={},gap={},EX={};const GAP=()=>ph.dataset.mode==='child'?12:8;
 /* الفاصل بين هدفين (spacing-and-grid §3: 8، وللطفل 12) يُقاس بين شكلين ظاهرين. ما لا شكل له (سطر في قائمة، زر أيقونة، زر نصّي، خانة تقويم غير مختارة)
    حبره أصغر من مساحته فلا يُقاس؛ ودبوس الخريطة موضعه جغرافي. */
 const shaped=e=>{const cs=getComputedStyle(e);const al=c=>{const m=c.match(/rgba?\(([^)]+)\)/);if(!m)return 0;const p=m[1].split(/[, /]+/);return p.length>3?+p[3]:1};
   return al(cs.backgroundColor)>0||cs.backgroundImage!=='none'||cs.boxShadow!=='none'||(parseFloat(cs.borderTopWidth)>0&&parseFloat(cs.borderBottomWidth)>0&&parseFloat(cs.borderLeftWidth)>0&&al(cs.borderTopColor)>0)};   /* خط فاصل من جهة واحدة ليس شكلاً */
 /* الشكل الظاهر: الإطار الشفاف (الاستغاثة) من مساحة اللمس لا من الشكل */
 const vrect=e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);const bw=parseFloat(cs.borderTopWidth)||0;if(!(bw>0&&cs.backgroundClip==='padding-box'&&/, 0\)$/.test(cs.borderTopColor)))return r;const k=bw*SCALE;return {top:r.top+k,bottom:r.bottom-k,left:r.left+k,right:r.right-k}};
 const joined=(a,c)=>!shaped(a)||!shaped(c)||!!(a.closest('.map .pin,.map .hp')||c.closest('.map .pin,.map .hp'));const add=(o,k,v)=>(o[k]=o[k]||new Set()).add(v);
 const meas=at=>{
   for(const e of ph.querySelectorAll('[data-a]')){const n=e.dataset.a.split(':')[0];if(typeof ACT[n]!=='function'){add(dead,n,at);EX[n]=EX[n]||e.outerHTML.replace(/\s+/g,' ').slice(0,140)}}   /* زر بلا فعل: اسم الفعل غير معرَّف */
   const lay=[...ph.querySelectorAll('#ov > .scrim, #ov > .full')].pop();   /* ورقة أو شاشة كاملة فوق الشاشة: يُفحص ما في الطبقة العليا وحدها، فما تحتها لا يُلمس الآن */
   const els=[...ph.querySelectorAll(SEL)].filter(e=>vis(e)&&!e.disabled&&!e.closest('[inert]')&&(!lay||lay.contains(e)||e.closest('#sosL'))&&!e.matches('.scrim'));const H=new Map();
   for(const e of els){const lab=e.closest('label');if(lab&&lab!==e&&lab.getBoundingClientRect().height/SCALE>=MIN)continue;      /* الخانة داخل سطر يُلمس كله */
     const par=e.parentElement.closest('[data-a]');if(par&&par.getBoundingClientRect().height/SCALE>=MIN&&!e.dataset.a)continue;
     const h=hit(e);H.set(e,h);const hh=h.b-h.t,ww=h.r-h.l;
     if(hh<MIN||ww<MINW){const k=name(e)+' | '+Math.round(ww)+'×'+Math.round(hh);add(touch,k,at);EX[k]=EX[k]||e.outerHTML.replace(/\s+/g,' ').slice(0,140)}}
   const L=[...H.entries()];
   for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const [a,x0]=L[i],[c,y0]=L[j];if(a.contains(c)||c.contains(a))continue;const x=clipTo(x0,c),y=clipTo(y0,a);
     {const va=vrect(a),vc=vrect(c);const vy=(Math.min(va.bottom,vc.bottom)-Math.max(va.top,vc.top))/SCALE,vx=(Math.min(va.right,vc.right)-Math.max(va.left,vc.left))/SCALE;
      const d=vy>2&&vx<=0?-vx:vx>2&&vy<=0?-vy:-1;if(d>=0&&d<GAP()-.5&&x0.sc===y0.sc&&!joined(a,c)){const k=name(a)+' ⇄ '+name(c)+' | '+Math.round(d);add(gap,k,at);EX[k]=EX[k]||(a.parentElement===c.parentElement?'same:':'')+String(a.parentElement.className).slice(0,30)+' / '+String(c.parentElement.className).slice(0,30)}}
     const dy=Math.min(x.b,y.b)-Math.max(x.t,y.t),dx=Math.min(x.r,y.r)-Math.max(x.l,y.l);if(dy<=2||dx<=2)continue;
     const ra=a.getBoundingClientRect(),rc=c.getBoundingClientRect();if(Math.min(ra.bottom,rc.bottom)-Math.max(ra.top,rc.top)>2&&Math.min(ra.right,rc.right)-Math.max(ra.left,rc.left)>2)continue;   /* متداخلان في الشكل أصلاً (طبقة فوق طبقة) */
     const k=name(a)+' ⇄ '+name(c)+' | '+Math.round(Math.min(dx,dy));add(over,k,at)}
   for(const a of ph.querySelectorAll('.fch,.chs,.seg,.chips,.bar,.nav,.hero,.card,.list')){const d=a.scrollHeight-a.clientHeight;if(d>1&&d<40&&/auto|scroll/.test(getComputedStyle(a).overflowY))add(jig,String(a.className).split(' ').slice(0,2).join('.')+' | '+d,at)}
 };
 const setup=(id,p)=>{const tt=document.getElementById('toast');if(tt)tt.innerHTML='';S=fresh();setPersona(p);if(TS)S.ts=TS;if(LANG)S.lang=LANG;jump(id);render()};
 const curId=()=>S.full?S.full.id:S.sheet?S.sheet.id:S.stack[S.stack.length-1].id;
 /* حالات السطح غير الافتراضية (Q-430): كل مفتاح داخل السطح يبدّل حالته (تبويب داخلي، تصفية، اختيار، مفتاح تشغيل، قسم يُفتح) يُضغط ثم يُعاد القياس. يُجرى بالشخصية صاحبة السطح وحدها. */
 const NAT={adult:'owner',owner:'owner',any:'owner',delegate:'delegate',teen:'teen',kid:'child',child:'child',guest:'guest'};let nst=0;
 const STSEL='.seg button[aria-pressed="false"],.fch button[aria-pressed="false"],.chs button[aria-pressed="false"],[data-a^="set:"]:not([aria-pressed="true"]),.tg[data-a],[aria-expanded="false"][data-a]';
 for(const id of Object.keys(SC))for(const p of ['guest','owner','delegate','teen','child']){const at=id+'/'+p;try{setup(id,p);meas(at);
   if(p!==NAT[SC[id].p])continue;
   const lay0=[...ph.querySelectorAll('#ov > .scrim, #ov > .full')].pop();
   const acts=[...new Set([...ph.querySelectorAll(STSEL)].filter(e=>vis(e)&&!e.disabled&&!e.closest('[inert]')&&(!lay0||lay0.contains(e))).map(e=>e.dataset.a))];
   for(const a of acts){setup(id,p);const el=[...ph.querySelectorAll('[data-a]')].find(e=>e.dataset.a===a&&vis(e));if(!el)continue;el.click();render();if(curId()!==id||S.dlg)continue;meas(at+'#'+a);nst++}
 }catch(e){add(touch,'ERR '+e.message.slice(0,80),at)}}
 const out=o=>Object.entries(o).map(([k,v])=>[k,v.size,[...v].slice(0,5).join(' '),EX[k]||'']).sort((a,b)=>a[0]<b[0]?-1:1);
 R.touch=out(touch);R.overlap=out(over);R.gap=out(gap);R.states=nst;R.jiggle=out(jig);R.dead=out(dead);S=fresh();render();return R;},TS,LANG);
R.errs=errs;}catch(e){R.crash=String(e.stack||e).slice(0,900)}finally{await b.close()}
console.log(JSON.stringify(R,null,1));process.exitCode=(R.crash||R.errs.length||R.touch.length||R.overlap.length||R.gap.length||R.jiggle.length||R.dead.length)?1:0;})();
