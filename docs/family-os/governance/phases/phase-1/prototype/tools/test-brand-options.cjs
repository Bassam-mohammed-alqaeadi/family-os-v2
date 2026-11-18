/* فحص صفحة الشعارات المقترحة (Q-429): كل مقترح بحالاته التسع، الحركة تتوقف بتقليل الحركة، لا تجاوز أفقي، أهداف اللمس 48.
   التشغيل من مجلد prototype:  NODE_PATH=… LD_LIBRARY_PATH=… node tools/test-brand-options.cjs */
const path=require('path');const puppeteer=require('puppeteer-core');let chromium=require('@sparticuz/chromium');chromium=chromium.default||chromium;
(async()=>{const R={checks:0,fail:[],errs:[]};const ok=(n,c,x)=>{R.checks++;if(!c)R.fail.push(n+(x!==undefined?' → '+JSON.stringify(x):''))};
const args=[...chromium.args.filter(a=>!/in-process-gpu|use-gl|use-angle|swiftshader|ignore-gpu/.test(a)),'--disable-gpu','--allow-file-access-from-files'];
const b=await puppeteer.launch({args,executablePath:await chromium.executablePath(),headless:'shell'});
try{const page=await b.newPage();page.on('pageerror',e=>R.errs.push(String(e)));page.on('console',m=>{if(m.type()==='error')R.errs.push(m.text())});
 for(const w of [360,1100]){await page.setViewport({width:w,height:900});await page.goto('file://'+path.resolve(__dirname,'..','brand-options.html'));await page.evaluate(()=>document.fonts.ready);
  const d=await page.evaluate(()=>{const q=s=>[...document.querySelectorAll(s)],run=e=>getComputedStyle(e).animationName!=='none';
   const secs=q('#list .cx').map(s=>({id:s.id,states:q('#'+s.id+' .states svg').map(v=>v.dataset.s),hero:q('#'+s.id+' .hero svg').length,ctx:q('#'+s.id+' .ctx svg').length,texts:q('#'+s.id+' .mean div').every(x=>x.textContent.trim().length>12)}));
   const moving=k=>q(`#list .states svg[data-s=${k}]`).map(v=>[...v.querySelectorAll('*')].some(run));
   const small=q('.bar button,.nav a,.pick').filter(e=>e.getBoundingClientRect().height<48).map(e=>e.textContent.trim());
   const ids=q('svg.lg [id]').length;
   return{secs,load:moving('loading'),wait:moving('waiting'),sync:moving('sync'),prog:moving('progress'),rest:moving('rest'),off:moving('offline'),over:document.documentElement.scrollWidth-document.documentElement.clientWidth,small,ids,
    badge:['waiting','sync','success','error','offline','attention'].map(k=>q(`#list .states svg[data-s=${k}]`).every(v=>v.querySelector('.bd')))}});
  ok(w+': five proposals (the current one and four new)',d.secs.length===5,d.secs.map(s=>s.id));
  ok(w+': each has the nine states in the same order',d.secs.every(s=>s.states.join()==='rest,loading,waiting,progress,sync,success,error,offline,attention'),d.secs.map(s=>s.states.length));
  ok(w+': each is shown on light and dark, and in context',d.secs.every(s=>s.hero===2&&s.ctx>=5&&s.texts));
  ok(w+': loading, waiting, progress and sync move in every proposal',[d.load,d.wait,d.prog,d.sync].every(a=>a.length===5&&a.every(Boolean)),[d.load,d.wait,d.prog,d.sync]);
  ok(w+': rest and offline never move',d.rest.every(x=>!x)&&d.off.every(x=>!x),[d.rest,d.off]);
  ok(w+': states that must not depend on motion carry a badge',d.badge.every(Boolean),d.badge);
  ok(w+': no horizontal overflow',d.over<=0,d.over);
  ok(w+': controls are at least 48 high',d.small.length===0,d.small);
  await page.click('[data-rm="1"]');
  const m=await page.evaluate(()=>({run:[...document.querySelectorAll('svg.lg *,svg.lg')].filter(e=>getComputedStyle(e).animationName!=='none').length,pressed:document.querySelector('[data-rm="1"]').getAttribute('aria-pressed'),
   dim:[...document.querySelectorAll('#list .states svg[data-s=loading]')].every(v=>+getComputedStyle(v.querySelector('.m3')).opacity<+getComputedStyle(v.querySelector('.m1')).opacity)}));
  ok(w+': reduced motion stops every animation',m.run===0&&m.pressed==='true',m);
  ok(w+': reduced motion still shows loading by shape',m.dim);
  await page.click('[data-bg="night"]');
  const n=await page.evaluate(()=>({all:[...document.querySelectorAll('.stage')].every(e=>e.classList.contains('t-night')&&!e.classList.contains('t-cream')),f:getComputedStyle(document.querySelector('#c-B .states svg .f')).stroke}));
  ok(w+': the background switch recolours the mark for dark',n.all&&n.f==='rgb(252, 250, 237)',n);
 }
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await page.reload();
 ok('the system setting for reduced motion is honoured on load',await page.evaluate(()=>document.getElementById('main').classList.contains('rm')));
}catch(e){R.crash=String(e.stack||e).slice(0,900)}finally{await b.close()}
console.log(JSON.stringify(R,null,1));process.exit(R.fail.length||R.errs.length||R.crash?1:0)})();
