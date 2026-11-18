// الفحص البصري للمنصة كلها (المراجعة الختامية — المرحلة 4 · Q-430): يفتح كل سطح بكل شخصية، في الفاتح والداكن، ويقيس ما يطلبه نظام التصميم بالأرقام.
//   tiny      نص أصغر من 12 (typography.md — DS-TY-02)
//   spacing   تباعد حروف على نص عربي (DS-TY-05)
//   contrast  نص تباينه مع خلفيته أقل من 4.5 (أو 3 للنص الكبير) — color-tokens.md §4؛ ما فوق تدرّج لوني أو صورة لا يُقاس
//   kid       هدف لمس في قالب الطفل أقل من 56 (spacing-and-grid.md §3)
//   cut       عنوان أو زر مقطوع بثلاث نقاط، في النص العادي والكبير 1.3 (للعلم: يُراجع بالعين؛ القائمة الطويلة تُقطع عمداً)
//   offscale  أحجام خط خارج السلّم (للعلم: لا يُفشل الفحص)
// التشغيل من مجلد prototype:  NODE_PATH=<node_modules> node tools/visual-audit.cjs [list]
// النجاح: tiny=[] و spacing=[] و contrast=[] و kid=[] و errs=[].
const puppeteer=require('puppeteer-core');let chromium=require('@sparticuz/chromium');chromium=chromium.default||chromium;
const root=require('path').join(__dirname,'..');
(async()=>{const args=[...chromium.args.filter(a=>!/in-process-gpu|use-gl|use-angle|swiftshader|ignore-gpu/.test(a)),'--disable-gpu','--allow-file-access-from-files'];
const b=await puppeteer.launch({args,executablePath:await chromium.executablePath(),headless:'shell',protocolTimeout:600000});let R={};
try{const page=await b.newPage();await page.setViewport({width:1500,height:1000});const errs=[];page.on('pageerror',e=>errs.push(String(e)));
await page.goto('file://'+root+'/index.html?quiet=1');await page.evaluate(()=>document.fonts.ready);await new Promise(r=>setTimeout(r,1500));
await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important}'});
R=await page.evaluate(()=>{const R={};const ph=document.getElementById('phone');const SCALE=ph.getBoundingClientRect().width/ph.offsetWidth;
 const SCALE_OK=[12,13,14,15,16,17,18,20,24,28,32,40].flatMap(v=>[v,v*1.15]);   /* السلّم (ومعه 13 و15 و17 المستعملة بين درجتين)، وكلٌّ بمضاعف الطفل */
 const rgb=s=>{const m=s.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(/[, /]+/).map(Number);return{r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}};
 const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
 const over=(t,u)=>({r:t.r*t.a+u.r*(1-t.a),g:t.g*t.a+u.g*(1-t.a),b:t.b*t.a+u.b*(1-t.a),a:1});
 /* الخلفية الفعلية تحت العنصر: تُركَّب الطبقات الشفافة؛ وتدرّج أو صورة = لا يُقاس */
 const bgOf=e=>{const st=[];for(let a=e;a&&a!==document.documentElement;a=a.parentElement){const cs=getComputedStyle(a);if(cs.backgroundImage!=='none')return null;if(+cs.opacity<1)return null;const c=rgb(cs.backgroundColor);if(c&&c.a>0){st.push(c);if(c.a>=1)break}}
   let base={r:255,g:255,b:255,a:1};for(let i=st.length-1;i>=0;i--)base=over(st[i],base);return base};
 const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'};
 const name=e=>{const c=String(e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className||'').split(' ').filter(Boolean).slice(0,2).join('.');const p=e.parentElement;const pc=p?String(p.className||'').split(' ')[0]||p.tagName.toLowerCase():'';return (c||e.tagName.toLowerCase())+' < '+pc};
 const tiny={},spc={},con={},kid={},off={},cut={},EX={};const add=(o,k,v)=>(o[k]=o[k]||new Set()).add(v);
 const SEL='button,a[href],[data-a],[role="button"],[role="switch"],input[type="checkbox"],input[type="radio"],select';
 const hit=e=>{const r=e.getBoundingClientRect();let h=r.height/SCALE,w=r.width/SCALE;for(const ps of ['::before','::after']){const cs=getComputedStyle(e,ps);if(cs.content==='none'||cs.position!=='absolute'||cs.pointerEvents==='none'||cs.display==='none')continue;const ww=parseFloat(cs.width),hh=parseFloat(cs.height);if(ww>0&&hh>0&&getComputedStyle(e).overflow==='visible'){h=Math.max(h,hh);w=Math.max(w,ww)}}return{h,w}};
 for(const [theme,ts] of [['light',1],['dark',1],['light',1.3]])for(const id of Object.keys(SC))for(const p of ['guest','owner','delegate','teen','child']){const at=id+'/'+p+(theme==='dark'?'/dark':'')+(ts>1?'/1.3':'');try{S=fresh();S.theme=theme;S.ts=ts;setPersona(p);jump(id);render();
   const lay=[...ph.querySelectorAll('#ov > .scrim, #ov > .full')].pop();
   if(theme==='light')for(const e of ph.querySelectorAll('.bar h2,.hero h1,.hero h2,.btn,.ttl,h3.sec,.nav button span,.chip')){if(!vis(e)||e.closest('[inert]')||(lay&&!lay.contains(e)))continue;const cs=getComputedStyle(e);if((cs.textOverflow==='ellipsis'&&e.scrollWidth>e.clientWidth+1)||(cs.webkitLineClamp!=='none'&&e.scrollHeight-e.clientHeight>parseFloat(cs.fontSize)*.8)){const k=name(e)+' | '+e.textContent.trim().slice(0,30);add(cut,k,at)}}
   if(ts>1)continue;
   const w=document.createTreeWalker(ph,NodeFilter.SHOW_TEXT);let n;const seen=new Set();
   while((n=w.nextNode())){const t=n.nodeValue.trim();if(!t)continue;const e=n.parentElement;if(seen.has(e)||!vis(e)||e.closest('[inert],svg,.sr'))continue;if(lay&&!lay.contains(e))continue;seen.add(e);
     const cs=getComputedStyle(e);const fs=parseFloat(cs.fontSize);const k=name(e);if(e.closest('.sbar'))continue;   /* شريط حالة النظام ليس من التطبيق */
     if(theme==='light'){if(fs<11.95){add(tiny,k+' | '+(+fs.toFixed(1)),at);EX[k]=EX[k]||t.slice(0,40)}
       else if(!SCALE_OK.some(v=>Math.abs(v-fs)<.3))add(off,(+fs.toFixed(1))+' | '+k,at);
       if(cs.letterSpacing!=='normal'&&parseFloat(cs.letterSpacing)!==0&&/[\u0600-\u06FF]/.test(t)){add(spc,k+' | '+cs.letterSpacing,at);EX[k]=EX[k]||t.slice(0,40)}}
     const fg=rgb(cs.color),bg=bgOf(e);if(!fg||!bg||e.disabled||e.closest('[disabled],[aria-disabled="true"]'))continue;
     let op=1;for(let a=e;a&&a!==ph;a=a.parentElement)op*=+getComputedStyle(a).opacity;const f=over({...fg,a:fg.a*op},bg);
     const l1=lum(f),l2=lum(bg),cr=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);const px=parseFloat(cs.fontSize),big=px>=24||(px>=18.66&&+cs.fontWeight>=700);
     if(cr<(big?3:4.5)-.05){const kk=k+' | '+cr.toFixed(2)+(theme==='dark'?' dark':'');add(con,kk,at);EX[kk]=EX[kk]||t.slice(0,40)+' · '+cs.color+' on rgb('+[bg.r,bg.g,bg.b].map(Math.round)+')'}}
   if(p==='child'&&theme==='light'&&['child','kid','any'].includes(SC[id].p)){   /* ما يصل إليه الطفل فقط */
     for(const e of ph.querySelectorAll(SEL)){if(!vis(e)||e.disabled||e.closest('[inert]')||(lay&&!lay.contains(e)&&!e.closest('#sosL'))||e.matches('.scrim'))continue;
       const lab=e.closest('label');if(lab&&lab!==e&&lab.getBoundingClientRect().height/SCALE>=55.5)continue;const par=e.parentElement.closest('[data-a]');if(par&&par.getBoundingClientRect().height/SCALE>=55.5&&!e.dataset.a)continue;
       const h=hit(e);if(h.h<55.5){const k=name(e)+' | '+Math.round(h.w)+'×'+Math.round(h.h);add(kid,k,at);EX[k]=EX[k]||e.outerHTML.replace(/\s+/g,' ').slice(0,120)}}}
 }catch(e){add(tiny,'ERR '+e.message.slice(0,80),at)}}
 const out=o=>Object.entries(o).map(([k,v])=>[k,v.size,[...v].slice(0,4).join(' '),EX[k]||EX[k.split(' | ')[0]]||'']).sort((a,b)=>b[1]-a[1]);
 R.tiny=out(tiny);R.spacing=out(spc);R.contrast=out(con);R.kid=out(kid);R.offscale=out(off);R.cut=out(cut);S=fresh();render();return R;});
R.errs=errs;}catch(e){R.crash=String(e.stack||e).slice(0,900)}finally{await b.close()}
if(process.argv[2]==='list')console.log(JSON.stringify(R,null,1));
else console.log(JSON.stringify({tiny:R.tiny&&R.tiny.length,spacing:R.spacing&&R.spacing.length,contrast:R.contrast&&R.contrast.length,kid:R.kid&&R.kid.length,offscale:R.offscale&&R.offscale.length,cut:R.cut&&R.cut.length,errs:R.errs,crash:R.crash}));
process.exitCode=(R.crash||R.errs.length||R.tiny.length||R.spacing.length||R.contrast.length||R.kid.length)?1:0;})();
