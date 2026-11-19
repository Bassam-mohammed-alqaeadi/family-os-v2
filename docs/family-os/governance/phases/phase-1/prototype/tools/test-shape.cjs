// اختبار الشكل (Q-452 و Q-453): قاعدتان تُحرسان بالقياس لا بالنظر.
//   أ) جواب الشاشة أولاً عند الأب: «العائلة» و«المزيد» وصفحة الابن تفتح ببطاقة بارزة واحدة فيها الجواب،
//      بنصوصها وأزرارها وصلاحياتها كما كانت، وبتباين مقروء في الوضعين وبالخط المكبّر.
//   ب) علامة الشاشة الجادة: شكل واحد (دائرة)، حجمان، نبرات محدودة تُكتب صنفاً لا لوناً داخل الشاشة،
//      والأحمر لما لا يعود فقط، ولا رسم في الشاشات الجادة.
// التشغيل من مجلد النموذج: NODE_PATH=<node_modules> node tools/test-shape.cjs        النجاح: fail=[] و errs=[].
const puppeteer=require('puppeteer-core');let chromium=require('@sparticuz/chromium');chromium=chromium.default||chromium;
const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..');
/* من المصدر: لا لون ولا حجم يُكتب داخل الشاشة للعلامة ولا لعنوانها */
const SRC=fs.readdirSync(path.join(root,'assets/js')).filter(f=>f.endsWith('.js')).map(f=>[f,fs.readFileSync(path.join(root,'assets/js',f),'utf8')]);
const inl=[],ttl=[],tones={};
for(const [f,s] of SRC){for(const m of s.matchAll(/class="bigic([^"]*)"( style=)?/g)){if(m[2])inl.push(f);for(const t of m[1].replace(/\$\{[^}]*\}/g,' ').split(/\s+/).filter(Boolean))tones[t]=(tones[t]||0)+1}
 for(const m of s.matchAll(/class="ttl[^"]*" style="[^"]*font-size/g))ttl.push(f)}
(async()=>{const args=[...chromium.args.filter(a=>!/in-process-gpu|use-gl|use-angle|swiftshader|ignore-gpu/.test(a)),'--disable-gpu','--allow-file-access-from-files'];
const b=await puppeteer.launch({args,executablePath:await chromium.executablePath(),headless:'shell'});let R={};
try{const page=await b.newPage();await page.setViewport({width:1500,height:1000});const errs=[];page.on('pageerror',e=>errs.push(String(e)));page.on('console',m=>{if(m.type()==='warning'||m.type()==='error')errs.push('console:'+m.text())});
await page.goto('file://'+root+'/index.html?quiet=1');await page.evaluate(()=>document.fonts.ready);await new Promise(r=>setTimeout(r,1700));
R=await page.evaluate(async(src)=>{const R={},F=[];let N=0;const ph=document.getElementById('phone');const ok=(n,c,x)=>{N++;if(!c)F.push(n+(x!==undefined?' → '+JSON.stringify(x):''))};
 const q=s=>ph.querySelector(s),qa=s=>[...ph.querySelectorAll(s)];
 const start=(p,f)=>{document.getElementById('toast').innerHTML='';S=fresh();setPersona(p||'owner');if(f)f();render()};
 const top=()=>topE()?topE().id:'';
 /* التباين */
 const rgb=c=>{const m=String(c).match(/[\d.]+/g).map(Number);return {r:m[0],g:m[1],b:m[2],a:m.length>3?m[3]:1}};
 const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
 const over=(f,bk)=>({r:f.r*f.a+bk.r*(1-f.a),g:f.g*f.a+bk.g*(1-f.a),b:f.b*f.a+bk.b*(1-f.a),a:1});
 const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
 const hex=h=>{h=h.trim().replace('#','');return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16),a:1}};
 /* أقل تباين لكل نص داخل البطاقة البارزة، على لونَي تدرّجها */
 const minCr=()=>{const A=q('#scr .ans'),cs=getComputedStyle(ph),H=[hex(cs.getPropertyValue('--hero')),hex(cs.getPropertyValue('--hero2'))];let min=99,who='';
  for(const e of A.querySelectorAll('*')){if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;if(e.closest('.av'))continue;
   const fg=rgb(getComputedStyle(e).color);for(const h of H){let bk=h;const chain=[];for(let p=e;p&&p!==A;p=p.parentElement)chain.unshift(p);
    for(const p of chain){const c=rgb(getComputedStyle(p).backgroundColor);if(c.a>0)bk=over(c,bk)}
    const v=cr(over(fg,bk),bk);if(v<min){min=v;who=e.textContent.trim().slice(0,24)}}}
  return [Math.round(min*100)/100,who]};
 const txt=e=>e?e.textContent.replace(/\s+/g,' ').trim():'';
 try{
 /* ---------- أ) جواب الشاشة أولاً ---------- */
 start('owner',()=>tab('family'));let A=qa('#scr .ans');
 ok('أ1 «العائلة»: بطاقة بارزة واحدة',A.length===1,A.length);
 ok('أ2 «العائلة»: فيها اسم العائلة',A[0]&&txt(A[0]).includes(famN()),txt(A[0]).slice(0,60));
 const mem=Object.keys(M).length,faces=qa('#scr .ans .faces .av').length;
 ok('أ3 «العائلة»: وجه لكل فرد',faces===mem,[faces,mem]);
 ok('أ4 «العائلة»: الوجوه لا تُضغط والقائمة تحتها هي المدخل',qa('#scr .ans [data-a]').length===0&&qa('#scr [data-a^="go:member:"]').length>=mem-1,[qa('#scr .ans [data-a]').length,qa('#scr [data-a^="go:member:"]').length]);
 ok('أ5 «العائلة»: البطاقة قبل أول قائمة',A[0]&&q('#scr .list,#scr .card')&&(A[0].compareDocumentPosition(q('#scr .list'))&4)>0);
 let c=minCr();ok('أ6 «العائلة»: التباين داخل البطاقة ≥ 4.5 (فاتح)',c[0]>=4.5,c);
 start('owner',()=>{S.theme='dark';tab('family')});c=minCr();ok('أ7 «العائلة»: التباين ≥ 4.5 (داكن)',c[0]>=4.5,c);

 start('owner',()=>tab('more'));A=qa('#scr .ans');
 ok('ب1 «المزيد»: بطاقة بارزة واحدة وهي زر الحساب',A.length===1&&A[0].tagName==='BUTTON'&&A[0].dataset.a==='go:account',A.map(e=>e.tagName+':'+e.dataset.a));
 ok('ب2 «المزيد»: فيها اسم صاحب الحساب',A[0]&&txt(A[0]).includes(me().n),txt(A[0]).slice(0,60));
 c=minCr();ok('ب3 «المزيد»: التباين ≥ 4.5 (فاتح)',c[0]>=4.5,c);
 A[0].click();ok('ب4 «المزيد»: الضغط يفتح الحساب',top()==='account',top());
 start('delegate',()=>tab('more'));ok('ب5 «المزيد» عند الأم: البطاقة باسمها',txt(q('#scr .ans')).includes(M.sara.n),txt(q('#scr .ans')).slice(0,40));
 start('owner',()=>{S.theme='dark';tab('more')});c=minCr();ok('ب6 «المزيد»: التباين ≥ 4.5 (داكن)',c[0]>=4.5,c);

 for(const id of KIDS){start('owner',()=>go('member',id));A=qa('#scr .ans');const k=S.kid[id];
  ok('ج1 صفحة '+M[id].n+': بطاقة بارزة واحدة',A.length===1,A.length);
  ok('ج2 صفحة '+M[id].n+': الهوية والحماية والبطارية فيها',A[0]&&txt(A[0]).includes(M[id].n)&&qa('#scr .ans .chip').length===2&&txt(A[0]).includes(k.bat+'%'),txt(A[0]).slice(0,80));
  ok('ج3 صفحة '+M[id].n+': الوقت الباقي داخلها بحلقته',!!q('#scr .ans .now .ring')&&qa('#scr .ring').length===qa('#scr .ans .ring').length,[qa('#scr .ring').length,qa('#scr .ans .ring').length]);
  ok('ج4 صفحة '+M[id].n+': «منح وقت» داخلها',!!q('#scr .ans .now [data-a="go:grant-time:'+id+'"]'));
  c=minCr();ok('ج5 صفحة '+M[id].n+': التباين ≥ 4.5 (فاتح)',c[0]>=4.5,c);
  start('owner',()=>{S.theme='dark';go('member',id)});c=minCr();ok('ج6 صفحة '+M[id].n+': التباين ≥ 4.5 (داكن)',c[0]>=4.5,c)}
 start('owner',()=>go('member','layan'));q('#scr .ans [data-a="go:grant-time:layan"]').click();ok('ج7 «منح وقت» يفتح منح الوقت',top()==='grant-time'||(S.sheet&&S.sheet.id==='grant-time')||!!q('.sheet'),top());
 /* الصلاحية كما كانت: الزر يظهر لمن يملك المنح فقط */
 start('delegate',()=>go('member','layan'));ok('ج8 الأم: الزر يتبع صلاحيتها',!!q('#scr .ans [data-a="go:grant-time:layan"]')===!!can('rewards.grant.create'),can('rewards.grant.create'));
 /* طفل بلا جهاز */
 start('owner',()=>{S.kid.layan.nd=1;go('member','layan')});
 ok('ج9 بلا جهاز: البطاقة هوية فقط',qa('#scr .ans').length===1&&!q('#scr .ans .now')&&!q('#scr .ans .ring')&&qa('#scr .ans .chip').length===1,[qa('#scr .ans .chip').length]);
 ok('ج10 بلا جهاز: بطاقة «لم يُقرن جهازه» تحتها',!!q('#scr .card.nodev')&&(q('#scr .ans').compareDocumentPosition(q('#scr .card.nodev'))&4)>0);
 c=minCr();ok('ج11 بلا جهاز: التباين ≥ 4.5',c[0]>=4.5,c);
 /* البالغ: صفحته لا تأخذ بطاقة الطفل */
 start('owner',()=>go('member','sara'));ok('ج12 صفحة البالغ بلا حلقة وقت',!q('#scr .ring'));
 /* الخط المكبّر: لا شيء يخرج من البطاقة */
 for(const [n,f] of [['العائلة',()=>tab('family')],['المزيد',()=>tab('more')],['صفحة ليان',()=>go('member','layan')],['صفحة خالد',()=>go('member','khaled')]]){
  start('owner',()=>{S.ts=1.3;f()});const a=q('#scr .ans'),r=a.getBoundingClientRect();let out=[];
  for(const e of a.querySelectorAll('b,.chip,.btn,.av,.ring,.sm')){const x=e.getBoundingClientRect();if(x.width&&(x.left<r.left-1||x.right>r.right+1))out.push(txt(e).slice(0,20))}
  ok('د1 خط مكبّر، '+n+': لا شيء خارج البطاقة',out.length===0,out);
  const bt=a.querySelector('.now .btn');if(bt){const g=a.querySelector('.now .grow').getBoundingClientRect();ok('د2 خط مكبّر، '+n+': نص الوقت لا يضيق عن 120',g.width/ (ph.getBoundingClientRect().width/ph.offsetWidth)>=120,Math.round(g.width))}}
 /* بطاقة بارزة واحدة على الأكثر في كل شاشة (Q-448) */
 const PRO='.ans,.blc.plt,.cplate,.wallet,.hero,.khero';const many={};let seen=0;
 for(const p of ['owner','delegate','child','teen'])for(const id of Object.keys(SC)){try{S=fresh();setPersona(p);go(id,...(SC[id].a||[]));render()}catch(e){continue}seen++;const n=qa(PRO).filter(e=>!e.parentElement.closest(PRO)).length;if(n>1)many[p+':'+id]=n}
 ok('هـ1 فُحصت الشاشات كلها بأربع شخصيات',seen>=700,seen);ok('هـ2 بطاقة بارزة واحدة على الأكثر في كل شاشة',Object.keys(many).length===0,many);

 /* ---------- ب) علامة الشاشة الجادة ---------- */
 ok('و1 المصدر: لا لون ولا حجم مكتوب داخل الشاشة للعلامة',src.inl.length===0,src.inl);
 ok('و2 المصدر: لا حجم مكتوب داخل الشاشة لعنوان الحالة',src.ttl.length===0,src.ttl);
 const ALLOW=['wa','da','ok','gd','mu','sm','fp','bcfp','bad'];
 ok('و3 المصدر: النبرات من القائمة المعتمدة',Object.keys(src.tones).every(t=>ALLOW.includes(t)),src.tones);
 const bad={},da={},sizes={};let marks=0,scr=0;const sc=()=>ph.getBoundingClientRect().width/ph.offsetWidth;
 for(const p of ['owner','delegate','child','teen','guest'])for(const id of Object.keys(SC)){try{S=fresh();setPersona(p);go(id,...(SC[id].a||[]));render()}catch(e){continue}
  const L=qa('.bigic');if(!L.length)continue;scr++;
  for(const e of L){marks++;const cs=getComputedStyle(e),w=Math.round(parseFloat(cs.width)),h=Math.round(parseFloat(cs.height)),sv=e.querySelector('svg'),sw=sv?Math.round(parseFloat(getComputedStyle(sv).width)):0;
   const want=e.matches('.fp,.bcfp')?112:(e.closest('.sheet')||e.matches('.sm'))?56:72,wi=want===112?56:want===56?28:34;sizes[want]=(sizes[want]||0)+1;
   const ring=getComputedStyle(e,'::after');
   if(cs.borderTopLeftRadius!=='50%'||w!==want||h!==want||sw!==wi||ring.borderTopStyle!=='solid'||e.getAttribute('style'))bad[p+':'+id]=[cs.borderTopLeftRadius,w,h,sw,want];
   if(e.matches('.da'))da[id]=1}}
 ok('ز1 العلامة ظاهرة في 15 شاشة على الأقل',scr>=15&&marks>=20,[scr,marks]);
 ok('ز2 شكل واحد: دائرة بحلقة، 72 في الشاشة و56 في النافذة والصف و112 للبصمة',Object.keys(bad).length===0,bad);
 ok('ز3 الحجمان مستعملان',sizes[72]>0&&sizes[56]>0,sizes);
 /* الأحمر لما لا يعود فقط */
 const RED=['delete-account','family-delete','unpair','leave-family'];
 ok('ز4 الأحمر في شاشات الفقد الذي لا يعود فقط',Object.keys(da).every(k=>RED.includes(k))&&RED.every(k=>da[k]),Object.keys(da));
 const tone=()=>{const e=q('.bigic');return e?[...e.classList].filter(x=>x!=='bigic').join(' '):'none'};
 start('owner',()=>{S.famDel=30;go('family-delete')});ok('ز5 حذف العائلة المعلّق (يُلغى): تنبيه لا أحمر',tone()==='wa',tone());
 start('owner',()=>{go('pin-set');S.ps={kind:'change',step:'done',a:'',err:''}});ok('ز6 تغيّر الرقم السري: نبرة «تمّ»',tone()==='ok',tone());
 start('owner',()=>{S.unp={layan:1};go('unpair','layan')});ok('ز7 فُكّ الإقران: نبرة «تمّ»',tone()==='ok',tone());
 start('owner',()=>{S.plan='free';go('plan-limit')});ok('ز8 حدّ الخطة: نبرة الخطة',tone()==='gd',tone());
 for(const id of ['sys-update','sys-maint','sys-first']){start('owner',()=>go(id));const e=q('.bigic');ok('ز9 '+id+': العلامة بيضاء على الكحلي',e&&getComputedStyle(e).color==='rgb(255, 255, 255)'&&tone()==='',e&&getComputedStyle(e).color)}
 /* لا رسم في الشاشات الجادة */
 const SER=['pin','pin-set','sys-update','sys-maint','sys-first','delete-account','family-delete','unpair','leave-family','bio-unlock','bio-confirm'];const art=[];
 for(const id of SER){try{start(id==='leave-family'?'delegate':'owner',()=>go(id,...(SC[id].a||[])))}catch(e){art.push('ERR '+id);continue}if(q('.art')||!q('.bigic'))art.push(id)}
 ok('ح1 الشاشات الجادة: علامة بلا رسم',art.length===0,art);
 /* الوضع الداكن: العلامة تبقى مميَّزة عن خلفيتها */
 const low=[];for(const id of ['delete-account','family-delete','pin','owner-now']){start('owner',()=>{S.theme='dark';go(id,...(SC[id].a||[]))});const e=q('.bigic'),cs=getComputedStyle(e);const v=cr(rgb(cs.color),rgb(cs.backgroundColor));if(v<3)low.push([id,Math.round(v*100)/100])}
 ok('ح2 داكن: رمز العلامة بتباين ≥ 3 على قرصها',low.length===0,low);
 }catch(e){F.push('ERR '+e.message+' '+String(e.stack).split('\n')[1])}
 R.checks=N;R.fail=F;return R;},{inl,ttl,tones});
R.errs=errs;}catch(e){R.crash=String(e.stack||e).slice(0,900)}finally{await b.close()}
console.log(JSON.stringify(R,null,1));process.exitCode=(R.crash||(R.fail||[]).length||(R.errs||[]).length)?1:0;})();
