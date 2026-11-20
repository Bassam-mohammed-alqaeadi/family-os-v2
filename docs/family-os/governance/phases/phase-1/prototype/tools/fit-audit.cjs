// قياس الاتساع واللغة في المنصة كلها (Q-462): كل سطح يُفتح بأربع هيئات ويُقاس.
//   small    هاتف صغير 320×640 (نافذة متصفح بهذا القياس، فالنموذج يملؤها): تجاوز أفقي للشاشة، أو عنصر ظاهر يخرج عن حدّها
//   wrap     في الهاتف الصغير: زر انكسر نصه إلى سطرين (يُقرأ لكنه يُراجع)
//   tablet   هيئة اللوحي في لوحة العرض (Q-392): المقياس نفسه
//   en       الإنجليزية: المقياس نفسه + نسبة الحروف العربية الباقية على الشاشة (غير مترجم)
// يحتاج puppeteer-core و@sparticuz/chromium:  NODE_PATH=<node_modules> node tools/fit-audit.cjs [list]
// النتيجة قياس لا بوابة: تُكتب أرقامها في prototype/README.md. الخروج 1 عند خطأ تشغيل فقط.
const puppeteer=require('puppeteer-core');let chromium=require('@sparticuz/chromium');chromium=chromium.default||chromium;
const root=require('path').join(__dirname,'..');const LIST=process.argv.includes('list');
(async()=>{const args=[...chromium.args.filter(a=>!/in-process-gpu|use-gl|use-angle|swiftshader|ignore-gpu/.test(a)),'--disable-gpu','--allow-file-access-from-files'];
const b=await puppeteer.launch({args,executablePath:await chromium.executablePath(),headless:'shell',protocolTimeout:300000});let R={};
try{const errs=[];
const run=async(vw,vh,modes)=>{const page=await b.newPage();await page.setViewport({width:vw,height:vh});page.on('pageerror',e=>errs.push(String(e)));
 await page.goto('file://'+root+'/index.html?quiet=1');await page.evaluate(()=>document.fonts.ready);await new Promise(r=>setTimeout(r,1700));
 const out=await page.evaluate((modes)=>{const ph=document.getElementById('phone');const R={n:0,small:[],wrap:[],tablet:[],en:[],enLeft:[],errs:[]};
 const AR=/[\u0600-\u06FF]/g,LT=/[A-Za-z]/g;
 const scrollsX=e=>{for(let p=e.parentElement;p&&p!==ph;p=p.parentElement){const o=getComputedStyle(p).overflowX;if((o==='auto'||o==='scroll')&&p.scrollWidth>p.clientWidth+1)return true}return false};
 const measure=()=>{const out=[];const sc=document.getElementById('scr');if(sc&&sc.scrollWidth>sc.clientWidth+1)out.push('scr +'+(sc.scrollWidth-sc.clientWidth));
  const pr=ph.getBoundingClientRect();for(const e of ph.querySelectorAll('button,a,b,span,p,h1,h2,h3,h4,label,input,.chip,.row,.card,.btn')){const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.position==='fixed'||e.closest('.fab-st'))continue;
   if((r.right>pr.right+1.5||r.left<pr.left-1.5)&&!scrollsX(e)){out.push((e.className&&String(e.className).split(' ')[0]||e.tagName)+' «'+(e.textContent||'').trim().slice(0,24)+'»');if(out.length>3)break}}
  return out};
 const wraps=()=>{const o=[];for(const e of ph.querySelectorAll('.btn')){const r=e.getBoundingClientRect();if(!r.width)continue;const lh=parseFloat(getComputedStyle(e).lineHeight)||24;const rg=document.createRange();rg.selectNodeContents(e);const h=rg.getBoundingClientRect().height;if(h>lh*1.7)o.push((e.textContent||'').trim().slice(0,22))}return o};
 const ids=Object.keys(SC);R.n=ids.length;
 for(const id of ids){for(const mode of modes){try{S=fresh();if(mode==='tablet')S.device='tablet';jump(id);if(mode==='en')S.lang='en';render();
   const o=measure();if(o.length)R[mode].push(id+': '+o.join(' | '));
   if(mode==='small'){const w=wraps();if(w.length)R.wrap.push(id+': '+w.join(' | '))}
   if(mode==='en'){const t=ph.innerText||'';const a=(t.match(AR)||[]).length,l=(t.match(LT)||[]).length;if(a>0)R.enLeft.push([id,Math.round(100*a/(a+l||1))])}
  }catch(e){R.errs.push(id+' '+mode+' '+e.message)}}}
 return R},modes);await page.close();return out};
const A=await run(320,640,['small']);const B=await run(1500,1200,['tablet','en']);
R={n:A.n,small:A.small,wrap:A.wrap,tablet:B.tablet,en:B.en,enLeft:B.enLeft,errs:A.errs.concat(B.errs)};
R.enFull=R.n-R.enLeft.length;R.enMostly=R.enLeft.filter(x=>x[1]<=10).length;R.enPartial=R.enLeft.filter(x=>x[1]>10&&x[1]<=50).length;R.enArabic=R.enLeft.filter(x=>x[1]>50).length;
R.errs=(R.errs||[]).concat(errs);}catch(e){R.crash=String(e)}finally{await b.close()}
const out=LIST?R:{surfaces:R.n,small:(R.small||[]).length,wrap:(R.wrap||[]).length,tablet:(R.tablet||[]).length,en:(R.en||[]).length,enFull:R.enFull,enMostly:R.enMostly,enPartial:R.enPartial,enArabic:R.enArabic,errs:R.errs,crash:R.crash};
console.log(JSON.stringify(out,null,1));process.exitCode=(R.crash||(R.errs&&R.errs.length))?1:0;})();
