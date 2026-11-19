// عيّنة للعرض على المالك (الدفعة 5 — Q-446). غير موصولة بالنموذج: تُركَّب على الشاشة عند التصوير فقط. يُنقل المختار منها إلى النموذج بعد حكم المالك.
// رسوم العيّنات الثلاث بثلاث درجات ضوء: 0 مطفأة (غير متاح / غير موجود) · 1 زجاجة واحدة (فارغ، ابدأ) · 2 مضاءة كلها (نجاح).
const C={navy:'#1F3A6B',gold:'#C8A24A',green:'#1F6B3B',orange:'#CF5B2C',blue:'#2457A6',off:'#DEDACB',mute:'#827B69'};
const PET='M0-30C7-39 16-51 16-65A16 16 0 0 0-16-65C-16-51-7-39 0-30Z';
const LP=(len)=>`M0-28C12-44 36-${len-32} 36-${len}A36 36 0 0 0-36-${len}C-36-${len-32}-12-44 0-28Z`;
const SVG=(inner)=>`<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
function artA(lv){ // النافذة
  const cols=[C.blue,C.gold,C.green,C.orange,C.blue], ang=[-70,-35,0,35,70], one=1;
  const pet=ang.map((a,i)=>{const f=lv===0?C.off:cols[i], o=lv===2?1:lv===0?.9:(i===one?1:.26);return `<path transform="rotate(${a})" d="${PET}" fill="${f}" fill-opacity="${o}"/>`}).join('');
  const rays=lv===2?[-78,-52,-26,0,26,52,78].map(a=>`<path transform="rotate(${a})" d="M0-104V-114" stroke="${C.gold}" stroke-width="3" stroke-linecap="round"/>`).join(''):'';
  return SVG(`<g transform="translate(120 124)">${rays}${pet}<path d="M-90 8V0A90 90 0 0 1 90 0V8" fill="none" stroke="${lv===0?C.mute:C.navy}" stroke-opacity="${lv===0?.55:1}" stroke-width="9" stroke-linecap="round"/><path d="M-104 21H104" stroke="${C.off}" stroke-width="2" stroke-linecap="round"/></g>`);
}
function artB(lv){ // الضوء
  const s=.78, cols=[C.blue,C.gold,C.green,C.orange,C.gold], ang=[-72,-36,0,36,72], len=[92,104,116,104,92], one=1;
  const pet=ang.map((a,i)=>{const f=lv===0?C.mute:cols[i], o=lv===2?.78:lv===0?.2:(i===one?.85:.2);return `<path style="mix-blend-mode:multiply" transform="rotate(${a})" d="${LP(len[i])}" fill="${f}" fill-opacity="${o}"/>`}).join('');
  const dots=lv===2?`<g fill="${C.gold}"><circle cx="30" cy="34" r="4"/><circle cx="212" cy="26" r="3"/><circle cx="226" cy="74" r="4.5"/><circle cx="14" cy="80" r="3"/></g>`:'';
  return SVG(`<g transform="translate(120 128) scale(${s})" style="isolation:isolate">${pet}</g>${dots}`);
}
function artC(lv){ // النقش
  const R=[34,62,90], sp=[-90,-60,-30,0,30,60,90];
  const pt=(r,a)=>{const t=(a-90)*Math.PI/180;return [(r*Math.cos(t)).toFixed(1),(r*Math.sin(t)).toFixed(1)]};
  const seg=(r1,r2,a1,a2,f,o)=>{const [x1,y1]=pt(r1,a1),[x2,y2]=pt(r2,a1),[x3,y3]=pt(r2,a2),[x4,y4]=pt(r1,a2);return `<path d="M${x1} ${y1}L${x2} ${y2}A${r2} ${r2} 0 0 1 ${x3} ${y3}L${x4} ${y4}A${r1} ${r1} 0 0 0 ${x1} ${y1}Z" fill="${f}" fill-opacity="${o}"/>`};
  const fills=lv===2?[[0,C.blue],[1,C.gold],[2,C.green],[3,C.orange],[4,C.gold],[5,C.blue]].map(([i,c])=>seg(R[0],R[1],sp[i],sp[i+1],c,.92)).join('')+[[0,C.gold],[1,C.green],[2,C.orange],[3,C.blue],[4,C.orange],[5,C.green]].map(([i,c])=>seg(R[1],R[2],sp[i],sp[i+1],c,.5)).join(''):lv===1?seg(R[0],R[1],sp[3],sp[4],C.gold,.95)+seg(R[1],R[2],sp[1],sp[2],C.orange,.28)+seg(R[1],R[2],sp[4],sp[5],C.blue,.2):'';
  const st=`fill="none" stroke="${lv===0?C.mute:C.navy}" stroke-opacity="${lv===0?.6:1}" stroke-width="2" stroke-linecap="round"`;
  const arcs=R.map(r=>`<path d="M${-r} 0A${r} ${r} 0 0 1 ${r} 0" ${st}/>`).join('');
  const spokes=sp.slice(1,-1).map(a=>{const [x1,y1]=pt(R[0],a),[x2,y2]=pt(R[2],a);return `<path d="M${x1} ${y1}L${x2} ${y2}" ${st}/>`}).join('');
  return SVG(`<g transform="translate(120 122)">${fills}${arcs}${spokes}<path d="M-108 0H108" ${st}/></g>`);
}
const ART={A:artA,B:artB,C:artC};
const ART_CSS=`.art{position:relative;width:220px;height:138px;margin:0 auto 14px}.art svg.pic{display:block;width:220px;height:138px}
.art .aic{position:absolute;display:grid;place-items:center;border-radius:50%}.art .aic svg{width:24px;height:24px}
.art-A .aic{width:44px;height:44px;left:88px;top:92px;background:#1F3A6B;color:#fff}.art-A.lv0 .aic{background:#827B69}
.art-B .aic{width:48px;height:48px;left:86px;top:90px;background:#fff;color:#1F3A6B;box-shadow:0 2px 10px #1F3A6B2e}.art-B.lv0 .aic{color:#827B69}
.art-C .aic{width:26px;height:26px;left:97px;top:84px;color:#1F3A6B}.art-C .aic svg{width:21px;height:21px}.art-C.lv0 .aic{color:#827B69}.art.lv0 .aic svg{display:none}.art-B.lv0 .aic,.art-C.lv0 .aic{display:none}.art-A.lv0 .aic{width:30px;height:30px;left:95px;top:99px}`;
if(typeof module!=='undefined')module.exports={ART,ART_CSS};
