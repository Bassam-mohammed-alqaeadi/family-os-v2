// فحص أهداف اللمس في المنصة كلها (المراجعة الختامية — ROADMAP):
//   يفتح كل سطح بكل شخصية، ويقيس مساحة اللمس الفعلية لكل ما يُلمس بوحدات التصميم (لا ببكسلات الشاشة).
//   مساحة اللمس = الزر نفسه + العنصر الشفاف الذي يكمله (‎::before‎)، مقصوصةً بما يقصّها من الحاويات.
//   touch    ما مساحة لمسه أقل من 48 ارتفاعاً أو 44 عرضاً (خلايا التقويم السبع لا تتسع لـ48 في عرض الهاتف)
//   overlap  هدفان تتداخل مساحتا لمسهما بأكثر من بكسلين (أحدهما يسرق اللمسة من الآخر)
//   jiggle   حاوية صارت تُمرَّر عمودياً ببضعة بكسلات بسبب مساحة لمس خرجت عنها
// يحتاج puppeteer-core و@sparticuz/chromium (غير مضمَّنين في المستودع):  NODE_PATH=<node_modules> node tools/audit.cjs [حجم الخط] [en]
//   dead     زر يحمل اسم فعل غير معرَّف (يُضغط فلا يحدث شيء)
// النجاح: touch=[] و overlap=[] و jiggle=[] و dead=[] و errs=[].
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
   let cy=true,cx=true;for(let a=e.parentElement;a&&a!==ph.parentElement&&(cx||cy);a=a.parentElement){const as=getComputedStyle(a);const ar=a.getBoundingClientRect();
     if(cy&&as.overflowY!=='visible'){if(/auto|scroll/.test(as.overflowY)&&a.scrollHeight>a.clientHeight+1)cy=false;else{t=Math.max(t,ar.top);bt=Math.min(bt,ar.bottom)}}
     if(cx&&as.overflowX!=='visible'){if(/auto|scroll/.test(as.overflowX)&&a.scrollWidth>a.clientWidth+1)cx=false;else{l=Math.max(l,ar.left);rt=Math.min(rt,ar.right)}}}
   return {t:t/SCALE,b:bt/SCALE,l:l/SCALE,r:rt/SCALE}};
 const name=e=>(e.className&&String(e.className).split(' ')[0]||(String(e.parentElement.className).split(' ')[0]||e.parentElement.tagName.toLowerCase())+'>'+e.tagName.toLowerCase())+(e.closest('h3.sec')?'@sec':e.closest('.nav')?'@nav':e.closest('.hero')?'@hero':e.closest('.bar')?'@bar':e.closest('.sheet')?'@sheet':'');
 const touch={},over={},jig={},dead={},EX={};const add=(o,k,v)=>(o[k]=o[k]||new Set()).add(v);
 for(const id of Object.keys(SC))for(const p of ['guest','owner','delegate','teen','child','mini']){const at=id+'/'+p;try{S=fresh();setPersona(p);if(TS)S.ts=TS;if(LANG)S.lang=LANG;jump(id);render();
   for(const e of ph.querySelectorAll('[data-a]')){const n=e.dataset.a.split(':')[0];if(typeof ACT[n]!=='function'){add(dead,n,at);EX[n]=EX[n]||e.outerHTML.replace(/\s+/g,' ').slice(0,140)}}   /* زر بلا فعل: اسم الفعل غير معرَّف */
   const lay=[...ph.querySelectorAll('#ov > .scrim, #ov > .full')].pop();   /* ورقة أو شاشة كاملة فوق الشاشة: يُفحص ما في الطبقة العليا وحدها، فما تحتها لا يُلمس الآن */
   const els=[...ph.querySelectorAll(SEL)].filter(e=>vis(e)&&!e.disabled&&!e.closest('[inert]')&&(!lay||lay.contains(e)||e.closest('#sosL'))&&!e.matches('.scrim'));const H=new Map();
   for(const e of els){const lab=e.closest('label');if(lab&&lab!==e&&lab.getBoundingClientRect().height/SCALE>=MIN)continue;      /* الخانة داخل سطر يُلمس كله */
     const par=e.parentElement.closest('[data-a]');if(par&&par.getBoundingClientRect().height/SCALE>=MIN&&!e.dataset.a)continue;
     const h=hit(e);H.set(e,h);const hh=h.b-h.t,ww=h.r-h.l;
     if(hh<MIN||ww<MINW){const k=name(e)+' | '+Math.round(ww)+'×'+Math.round(hh);add(touch,k,at);EX[k]=EX[k]||e.outerHTML.replace(/\s+/g,' ').slice(0,140)}}
   const L=[...H.entries()];
   for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const [a,x]=L[i],[c,y]=L[j];if(a.contains(c)||c.contains(a))continue;
     const dy=Math.min(x.b,y.b)-Math.max(x.t,y.t),dx=Math.min(x.r,y.r)-Math.max(x.l,y.l);if(dy<=2||dx<=2)continue;
     const ra=a.getBoundingClientRect(),rc=c.getBoundingClientRect();if(Math.min(ra.bottom,rc.bottom)-Math.max(ra.top,rc.top)>2&&Math.min(ra.right,rc.right)-Math.max(ra.left,rc.left)>2)continue;   /* متداخلان في الشكل أصلاً (طبقة فوق طبقة) */
     const k=name(a)+' ⇄ '+name(c)+' | '+Math.round(Math.min(dx,dy));add(over,k,at)}
   for(const a of ph.querySelectorAll('.fch,.chs,.seg,.chips,.bar,.nav,.hero,.card,.list')){const d=a.scrollHeight-a.clientHeight;if(d>1&&d<40&&/auto|scroll/.test(getComputedStyle(a).overflowY))add(jig,String(a.className).split(' ').slice(0,2).join('.')+' | '+d,at)}
 }catch(e){add(touch,'ERR '+e.message.slice(0,80),at)}}
 const out=o=>Object.entries(o).map(([k,v])=>[k,v.size,[...v].slice(0,5).join(' '),EX[k]||'']).sort((a,b)=>a[0]<b[0]?-1:1);
 R.touch=out(touch);R.overlap=out(over);R.jiggle=out(jig);R.dead=out(dead);S=fresh();render();return R;},TS,LANG);
R.errs=errs;}catch(e){R.crash=String(e.stack||e).slice(0,900)}finally{await b.close()}
console.log(JSON.stringify(R,null,1));process.exitCode=(R.crash||R.errs.length||R.touch.length||R.overlap.length||R.jiggle.length||R.dead.length)?1:0;})();
