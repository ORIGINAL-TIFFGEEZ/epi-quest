/* ===================== GAMES ===================== */
let GT=[],GRAF=null;
function stopAll(){GT.forEach(clearInterval);GT.forEach(clearTimeout);GT=[];if(GRAF)cancelAnimationFrame(GRAF);GRAF=null}
const SHORT={design:"Study Design",bias:"Bias",logic:"Logic Model",smart:"SMART",sem:"Soc-Eco",services:"10 Services",prevention:"Prevention",transmission:"Spread",mythfact:"Myth/Fact"};
const deckGame=(id,tag,desc)=>({id,name:DECKS[id].title,short:SHORT[id],icon:DECKS[id].icon,color:DECKS[id].color,tag,desc,run:()=>sorter(id)});
const GAMES=[
 {id:"sprint",name:"Formula Sprint",short:"Sprint",icon:"⚡",color:"#00e5ff",tag:"Biostats",desc:"60 seconds. Rapid-fire rates, ratios, RR, OR, sensitivity, herd immunity. How many can you crush?",run:()=>sprint()},
 {id:"outbreak",name:"Outbreak Detective",short:"Outbreak",icon:"🕵🏾‍♀️",color:"#ff2e88",tag:"Field Epi",desc:"People got sick after a big event. Read the epi curve, calculate attack rates, find the bad food.",run:()=>outbreak()},
 {id:"herd",name:"Herd Immunity Simulator",short:"Herd",icon:"🐑",color:"#b6ff00",tag:"Vaccines",desc:"Set vaccine coverage, release a virus, and watch it spread (or fizzle) live.",run:()=>herd()},
 {id:"parent",name:"Parent Talk Simulator",short:"Parent",icon:"🗣️",color:"#ffb800",tag:"Vaccines",desc:"Real parent concerns. Pick the response that builds trust. Watch the trust meter.",run:()=>parentSim()},
 {id:"whoami",name:"Who Am I? Disease Edition",short:"Who Am I",icon:"❓",color:"#7c4dff",tag:"Diseases",desc:"Guess the disease from clues. Fewer clues = more points.",run:()=>whoami()},
 {id:"memory",name:"Epi Memory Match",short:"Memory",icon:"🧠",color:"#00ffa3",tag:"Vocab",desc:"Flip cards and match epi & biostat terms to their meanings.",run:()=>memory()},
 deckGame("design","Epi Methods","Read the study. Name the design. RCT? Cohort? Case-control?"),
 deckGame("bias","Epi Methods","Recall bias, confounding, healthy worker effect… spot the flaw."),
 deckGame("logic","Program Planning","Sort pieces of a real program into the logic model."),
 deckGame("smart","Program Planning","Is this objective SMART or a hot mess?"),
 deckGame("sem","Community Interventions","Individual? Policy? Place each intervention on the Social Ecological Model."),
 deckGame("services","Public Health Core","Match each Essential Public Health Service to its core function."),
 deckGame("prevention","Community Interventions","Primordial, primary, secondary or tertiary prevention?"),
 deckGame("transmission","Diseases","Airborne, body fluids, vectors or food? How does it spread?"),
 deckGame("mythfact","Vaccines","Myth or fact? Train your misinformation radar.")
];
function startGame(id){stopAll();const g=GAMES.find(x=>x.id===id);if(!g)return;bump("games");badge("first");g.run()}
function endScreen(id,score,xp,msg){stopAll();const g=GAMES.find(x=>x.id===id);const prev=S.best[id];const isBest=prev==null||score>prev;if(isBest){S.best[id]=score;save()}
 addXP(xp);confetti(isBest?200:90);sfx("level");
 modal(`<div style="text-align:center"><div style="font-size:80px;animation:wob 2s infinite">${g.icon}</div><h2>${g.name}</h2><div class="score" style="font-size:54px;color:var(--yellow)">${score}</div>${isBest?'<div class="combo">🏆 NEW PERSONAL BEST!</div>':`<div class="mini">Best: ${prev}</div>`}<p style="margin:12px 0;font-size:18px">${msg||""}</p><div class="score" style="color:var(--lime)">+${xp} XP</div>
 <div class="row" style="justify-content:center;margin-top:16px"><button class="btn pink" onclick="startGame('${id}')">🔁 Again</button><button class="btn cyan" onclick="startGame(pick(GAMES.filter(x=>x.id!=='${id}')).id)">🎲 Surprise me</button><button class="btn ghost" onclick="closeModal()">Done</button></div></div>`)}
function headHTML(g,extra=""){return `<div class="gamehead"><span style="font-size:36px">${g.icon}</span><h2 style="font-size:22px">${g.name}</h2>${extra}</div>`}
function comboFx(c){if(c===5)badge("combo5");if(c===10)badge("combo10")}

/* ---------- generic sorter ---------- */
function sorter(id){const D=DECKS[id],g=GAMES.find(x=>x.id===id);const cards=shuffle(D.cards).slice(0,10);let i=0,score=0,combo=0,right=0,t,left;
 const show=()=>{if(i>=cards.length)return endScreen(id,score,right*6+(right===cards.length?30:0),`${right}/${cards.length} correct.${right===cards.length?" FLAWLESS! 💅🏾":""}`);
  const [q,a,why]=cards[i];left=20;
  modal(headHTML(g,`<span class="chip">${i+1}/${cards.length}</span><span class="chip score">⭐ ${score}</span>${combo>1?`<span class="combo">🔥x${combo}</span>`:""}`)+
  `<div class="row" style="margin-bottom:10px"><div class="timer"><div id="tbar" style="width:100%"></div></div><span class="chip" id="tleft">20s</span></div>
  <div class="qcard">${q}</div><div class="opts">${shuffle(D.options).map(o=>`<button class="opt" data-o="${esc(o)}">${o}</button>`).join("")}</div><div id="fbx"></div>`);
  stopAll();t=setInterval(()=>{left--;const b=$("#tbar");if(b){b.style.width=(left/20*100)+"%";$("#tleft").textContent=left+"s"}if(left<=0){clearInterval(t);answer(null)}},1000);GT.push(t);
  $$(".opt").forEach(b=>b.onclick=()=>answer(b.dataset.o,b));
  function answer(o,btn){stopAll();$$(".opt").forEach(b=>{b.disabled=true;if(b.dataset.o===a)b.classList.add("right")});const ok=o===a;
   if(ok){combo++;right++;const pts=100+left*5+(combo>1?combo*10:0);score+=pts;sfx("right");bump("correct");if(id==="mythfact")bump("myth");comboFx(combo);if((S.stats.myth||0)>=10)badge("myth")}else{combo=0;sfx("wrong");if(btn)btn.classList.add("wrong")}
   $("#fbx").innerHTML=`<div class="fb" style="border-color:${ok?"var(--lime)":"var(--red)"}"><b>${ok?"✅ Yes!":o?"❌ Nope — it's "+a:"⏰ Time! It's "+a}</b><br>${why}</div><div style="text-align:right;margin-top:10px"><button class="btn pink" id="nx">Next →</button></div>`;
   $("#nx").onclick=()=>{i++;show()}}};
 show()}

/* ---------- formula sprint ---------- */
const r1=x=>Math.round(x*10)/10,r2=x=>Math.round(x*100)/100;
const GEN=[
 ()=>{const n=rnd(60,200),c=rnd(10,n-20);return{q:`${c} of ${n} people at a cookout got sick. Attack rate?`,a:r1(c/n*100),u:"%",w:[r1(n/c),r1(c/(n-c)*100),r1((n-c)/n*100)]}},
 ()=>{const c=rnd(20,120),d=rnd(2,c-5);return{q:`${c} confirmed Ebola cases, ${d} deaths. Case fatality rate?`,a:r1(d/c*100),u:"%",w:[r1(d/(c+d)*100),r1((c-d)/c*100),r1(c/d)]}},
 ()=>{const p=rnd(2,20)*1000,c=rnd(50,900);return{q:`${c} people currently have asthma in a town of ${p.toLocaleString()}. Prevalence per 1,000?`,a:r1(c/p*1000),u:"per 1,000",w:[r1(c/p*100),r1(c/p*10000),r1(p/c)]}},
 ()=>{const py=rnd(10,60)*100,c=rnd(5,40);return{q:`${c} new cases over ${py.toLocaleString()} person-years. Incidence rate per 1,000 PY?`,a:r1(c/py*1000),u:"per 1,000 PY",w:[r1(c/py*100),r1(c/py*10000),r1(py/c)]}},
 ()=>{const a=rnd(20,60),b=rnd(20,80),c=rnd(5,25),d=rnd(60,120);return{q:`Cohort: exposed ${a} sick / ${b} well; unexposed ${c} sick / ${d} well. Risk ratio?`,a:r2((a/(a+b))/(c/(c+d))),u:"",w:[r2(a*d/(b*c)),r2((c/(c+d))/(a/(a+b))),r2(a/c)]}},
 ()=>{const a=rnd(20,60),b=rnd(10,40),c=rnd(10,40),d=rnd(30,80);return{q:`Case-control 2×2: a=${a}, b=${b}, c=${c}, d=${d}. Odds ratio?`,a:r2(a*d/(b*c)),u:"",w:[r2(b*c/(a*d)),r2((a/(a+b))/(c/(c+d))),r2(a*b/(c*d))]}},
 ()=>{const tp=rnd(60,95),fn=rnd(3,30);return{q:`A screening test finds ${tp} true positives and misses ${fn} people with the disease (false negatives). Sensitivity?`,a:r1(tp/(tp+fn)*100),u:"%",w:[r1(fn/(tp+fn)*100),r1(tp/fn*10),r1(100-tp)]}},
 ()=>{const tn=rnd(700,950),fp=rnd(10,120);return{q:`${tn} true negatives and ${fp} false positives. Specificity?`,a:r1(tn/(tn+fp)*100),u:"%",w:[r1(fp/(tn+fp)*100),r1(fp/tn*100),r1(tn/1000*100)]}},
 ()=>{const tp=rnd(40,95),fp=rnd(20,120);return{q:`${tp} true positives, ${fp} false positives. PPV?`,a:r1(tp/(tp+fp)*100),u:"%",w:[r1(fp/(tp+fp)*100),r1(tp/fp*10),r1(tp/(tp+fp+50)*100)]}},
 ()=>{const R=pick([1.5,2,2.5,3,4,5,6,8,10,12,15,18]);return{q:`R0 = ${R}. What % of the population needs immunity for herd immunity?`,a:r1((1-1/R)*100),u:"%",w:[r1(1/R*100),r1(Math.min(99,R*5)),r1((1-1/(R+2))*100)]}},
 ()=>{const u=rnd(10,40),v=r1(rnd(5,u*5)/10);return{q:`Attack rate unvaccinated ${u}%, vaccinated ${v}%. Vaccine efficacy?`,a:r1((u-v)/u*100),u:"%",w:[r1(v/u*100),r1(u-v),r1((u-v)/v*10)]}},
 ()=>{const b=rnd(8,30)*1000,d=rnd(40,250);return{q:`${d} infant deaths and ${b.toLocaleString()} live births. Infant mortality rate per 1,000?`,a:r1(d/b*1000),u:"per 1,000",w:[r1(d/b*100),r1(d/b*100000),r1(b/d/10)]}},
 ()=>{const b=rnd(8,30)*1000,p=Math.round(b*rnd(80,140)/1000);return{q:`${p.toLocaleString()} preterm births out of ${b.toLocaleString()} live births. Preterm birth rate?`,a:r1(p/b*100),u:"%",w:[r1(p/b*1000),r1(p/(b-p)*100+2),r1(b/p)]}},
 ()=>{const c=rnd(15,40),t=c-rnd(3,12);return{q:`Risk with placebo ${c}%, with treatment ${t}%. Number needed to treat?`,a:r1(100/(c-t)),u:"people",w:[r1(c-t),r1(100/c),r1(c/t)]}},
 ()=>{const re=rnd(20,50),ru=rnd(2,15);return{q:`Risk in exposed ${re}%, unexposed ${ru}%. Attributable risk % (among exposed)?`,a:r1((re-ru)/re*100),u:"%",w:[r1(re-ru),r1(ru/re*100),r1((re-ru)/ru*100)]}},
 ()=>{const m=rnd(60,120),sd=rnd(5,20),x=m+sd*pick([-2,-1.5,-1,1,1.5,2,2.5]);return{q:`Mean ${m}, SD ${sd}. Z-score for a value of ${x}?`,a:r2((x-m)/sd),u:"",w:[r2((m-x)/sd),r2((x-m)/(sd*sd)),r2(x/sd)]}},
 ()=>{const e=rnd(40,120),o=e+rnd(-30,60);return{q:`Observed ${o} deaths; ${e} were expected. SMR?`,a:r2(o/e),u:"",w:[r2(e/o),o-e,r2(o/e*100)]}},
 ()=>{const ct=rnd(12,40),c=rnd(2,ct-4);return{q:`Household study: ${c} of ${ct} susceptible contacts got sick. Secondary attack rate?`,a:r1(c/ct*100),u:"%",w:[r1(c/(ct+1)*50),r1((ct-c)/ct*100),r1(ct/c)]}},
 ()=>{const i=rnd(2,15),d=rnd(2,12);return{q:`Incidence ${i} per 1,000/yr, average duration ${d} years. Prevalence per 1,000 ≈ ?`,a:i*d,u:"per 1,000",w:[r1(i/d),i+d,i*d*10]}},
 ()=>{const b=rnd(10,30)*1000,m=rnd(2,12);return{q:`${m} maternal deaths, ${b.toLocaleString()} live births. Maternal mortality ratio per 100,000?`,a:r1(m/b*100000),u:"per 100,000",w:[r1(m/b*1000),r1(m/b*10000),r1(m/b*1000000)]}}
];
function sprint(){const g=GAMES[0];let score=0,combo=0,left=60;
 modal(headHTML(g,`<span class="chip score" id="sc">⭐ 0</span><span class="combo" id="cb"></span>`)+`<div class="row" style="margin-bottom:10px"><div class="timer"><div id="tbar" style="width:100%"></div></div><span class="chip" id="tleft">60s</span></div><div id="qa"></div>`);
 const t=setInterval(()=>{left--;$("#tbar").style.width=(left/60*100)+"%";$("#tleft").textContent=left+"s";if(left<=10)sfx("tick");if(left<=0){const fin=score;endScreen("sprint",fin,fin*6+5,fin>=10?"Formula ACE energy. 🧮🔥":fin>=5?"Solid! Run it back to beat it.":"Warm-up round. Peek at the Formula Lab then try again!");if(fin>=10)badge("formula")}},1000);GT.push(t);
 const next=()=>{const p=pick(GEN)();const fmt=v=>(+v).toLocaleString(undefined,{maximumFractionDigits:2})+(p.u?" "+p.u:"");let opts=[p.a];p.w.forEach(w=>{if(isFinite(w)&&w>0&&!opts.includes(w))opts.push(w)});while(opts.length<4){const z=r2(p.a*pick([.5,.8,1.25,1.5,2,3]));if(!opts.includes(z))opts.push(z)}opts=shuffle(opts.slice(0,4));
  $("#qa").innerHTML=`<div class="qcard">${p.q}</div><div class="opts">${opts.map(o=>`<button class="opt" data-v="${o}">${fmt(o)}</button>`).join("")}</div>`;
  $$("#qa .opt").forEach(b=>b.onclick=()=>{const ok=+b.dataset.v===p.a;$$("#qa .opt").forEach(x=>{x.disabled=true;if(+x.dataset.v===p.a)x.classList.add("right")});
   if(ok){score++;combo++;sfx("right");bump("correct");bump("formula");comboFx(combo)}else{combo=0;b.classList.add("wrong");sfx("wrong")}
   $("#sc").textContent="⭐ "+score;$("#cb").textContent=combo>1?"🔥x"+combo:"";const tt=setTimeout(next,ok?450:1300);GT.push(tt)})};
 next()}

/* ---------- outbreak detective ---------- */
const PATHS=[
 {n:"Staphylococcus aureus (toxin)",inc:[1,6],unit:"h",sx:"sudden, intense vomiting and cramps, little or no fever",foods:["Potato salad","Ham sandwiches","Cream puffs"]},
 {n:"Salmonella",inc:[12,60],unit:"h",sx:"diarrhea, fever and stomach cramps",foods:["Chicken","Deviled eggs","Cantaloupe"]},
 {n:"Norovirus",inc:[12,48],unit:"h",sx:"vomiting and watery diarrhea that pass in 1–3 days",foods:["Salad bar greens","Raw oysters","Fruit tray"]},
 {n:"Clostridium perfringens",inc:[6,24],unit:"h",sx:"diarrhea and cramps, usually no vomiting or fever",foods:["Gravy","Roast beef","Chili"]},
 {n:"E. coli O157:H7",inc:[48,168],unit:"h",sx:"severe cramps and bloody diarrhea",foods:["Hamburgers","Romaine salad","Unpasteurized juice"]}
];
const EVENTS=["church anniversary picnic","family reunion cookout","baby shower","block party","school fundraiser dinner","graduation party"];
const SIDES=["Mac & cheese","Collard greens","Cornbread","Fruit punch","Potato chips","Sweet tea","Rolls","Green beans","Cake","Coleslaw"];
function outbreak(){const g=GAMES[1];const P=pick(PATHS),ev=pick(EVENTS),culprit=pick(P.foods);const foods=shuffle([culprit,...shuffle(SIDES).slice(0,5)]);const N=rnd(70,130);
 const people=[...Array(N)].map(()=>{const ate={};foods.forEach(f=>ate[f]=Math.random()<(f===culprit?.6:rnd(35,80)/100));const ill=Math.random()<(ate[culprit]?.72:.06);const on=ill?(P.inc[0]+Math.pow(Math.random(),1.4)*(P.inc[1]-P.inc[0])*.9+Math.random()*(P.inc[1]-P.inc[0])*.1):null;return{ate,ill,on}});
 const ill=people.filter(p=>p.ill);const tab=foods.map(f=>{const e=people.filter(p=>p.ate[f]),u=people.filter(p=>!p.ate[f]);const ei=e.filter(p=>p.ill).length,ui=u.filter(p=>p.ill).length;return{f,ei,en:e.length,ui,un:u.length,are:ei/e.length*100,aru:u.length?ui/u.length*100:0}});
 tab.forEach(t=>t.rr=t.aru?t.are/t.aru:99);const ct=tab.find(t=>t.f===culprit);
 const bins=12,span=P.unit==="h"&&P.inc[1]>100?P.inc[1]:P.inc[1];const w=span/bins;const counts=Array(bins).fill(0);ill.forEach(p=>counts[Math.min(bins-1,Math.floor(p.on/w))]++);const mx=Math.max(...counts);
 const onsets=ill.map(p=>p.on).sort((a,b)=>a-b);const med=onsets[Math.floor(onsets.length/2)];
 let score=0,step=0;const choices=shuffle(PATHS).slice(0,4);if(!choices.includes(P))choices[0]=P;
 const steps=[
  ()=>`<p>📍 After a <b>${ev}</b> with <b>${N}</b> guests, <b>${ill.length}</b> people got sick with <b>${P.sx}</b>. Here's the epi curve (hours after the meal):</p>
   <div class="epibars">${counts.map((c,i)=>`<div title="${Math.round(i*w)}–${Math.round((i+1)*w)}h: ${c}" style="height:${c/mx*100}%;animation-delay:${i*60}ms"></div>`).join("")}</div><div class="row mini" style="justify-content:space-between"><span>0h</span><span>${Math.round(span/2)}h</span><span>${Math.round(span)}h</span></div>
   <p style="margin-top:10px">Median incubation ≈ <b>${Math.round(med)} hours</b>. One sharp peak = a point-source outbreak. <b>Which pathogen fits best?</b></p>
   <div class="opts">${shuffle(choices).map(c=>`<button class="opt" data-a="${c===P?1:0}">${c.n}<br><span class="mini" style="color:#000">${c.inc[0]}–${c.inc[1]}h</span></button>`).join("")}</div>`,
  ()=>`<p>🍽️ You interviewed everyone. Here's the food table. <b>Calculate the attack rate for people who ate the ${tab[0].f}</b> (round to whole %).</p>${foodTable(tab,false)}<div class="row" style="margin-top:10px"><input id="arin" type="number" placeholder="%" style="width:110px"><button class="btn cyan" id="arbtn">Check</button></div><p class="mini">Attack rate = ill ÷ total who ate × 100</p>`,
  ()=>`<p>Now all attack rates are filled in. <b>Which food is the most likely culprit?</b> (Look for: high attack rate among eaters, low among non-eaters, and most sick people ate it.)</p>${foodTable(tab,true)}<div class="opts" style="margin-top:10px">${foods.map(f=>`<button class="opt" data-a="${f===culprit?1:0}">${f}</button>`).join("")}</div>`,
  ()=>{const rr=r1(ct.rr);const o=shuffle([rr,r1(ct.are-ct.aru),r1(ct.aru/ct.are||.1),r1(ct.are/10)]);return `<p>🎯 ${culprit} it is. <b>What is the risk ratio</b> for eating ${culprit}?</p><p class="formula">RR = ${r1(ct.are)}% ÷ ${r1(ct.aru)}%</p><div class="opts">${[...new Set(o)].map(v=>`<button class="opt" data-a="${v===rr?1:0}">${v}</button>`).join("")}</div>`},
  ()=>`<p>📋 Final step. <b>What should the health department do next?</b></p><div class="opts">${shuffle([["Collect leftover food & stool samples for the lab, interview food handlers, and inspect how the food was stored",1],["Close the church permanently",0],[`Post on social media that everyone has ${P.n}`,0],["Wait to see if more people get sick",0]]).map(([t,a])=>`<button class="opt" data-a="${a}">${t}</button>`).join("")}</div>`
 ];
 const render=()=>{modal(headHTML(g,`<span class="chip">Step ${step+1}/5</span><span class="chip score">⭐ ${score}</span>`)+`<div id="ob">${steps[step]()}</div><div id="fbx"></div>`);
  if(step===1){$("#arbtn").onclick=()=>{const v=parseFloat($("#arin").value);const corr=Math.round(tab[0].are);const ok=Math.abs(v-corr)<=1;fin(ok,`${tab[0].ei} ÷ ${tab[0].en} × 100 = <b>${r1(tab[0].are)}%</b>`)}}
  else $$("#ob .opt").forEach(b=>b.onclick=()=>{$$("#ob .opt").forEach(x=>{x.disabled=true;if(x.dataset.a==="1")x.classList.add("right")});const ok=b.dataset.a==="1";if(!ok)b.classList.add("wrong");
   const why=[`${P.n}: incubation ${P.inc[0]}–${P.inc[1]} hours, ${P.sx}.`,"",`${culprit}: attack rate ${r1(ct.are)}% among eaters vs ${r1(ct.aru)}% among non-eaters. ${ct.ei} of ${ill.length} sick people ate it.`,`${r1(ct.are)} ÷ ${r1(ct.aru)} = ${r1(ct.rr)}. People who ate ${culprit} were ${r1(ct.rr)}× as likely to get sick.`,"Lab confirmation + an environmental investigation finds HOW it happened (temperature abuse, cross-contamination, a sick food handler) so you can prevent the next one."][step];fin(ok,why)})};
 const fin=(ok,why)=>{if(ok){score+=100;sfx("right");bump("correct")}else sfx("wrong");$("#fbx").innerHTML=`<div class="fb" style="border-color:${ok?"var(--lime)":"var(--red)"}"><b>${ok?"✅ Nailed it!":"❌ Not quite."}</b> ${why}</div><div style="text-align:right;margin-top:10px"><button class="btn pink" id="nx">${step<4?"Next →":"Close the case 🔒"}</button></div>`;
  $("#nx").onclick=()=>{step++;if(step<5)render();else{if(score>=400)badge("detective");endScreen("outbreak",score,Math.round(score/10)+10,`Case closed: <b>${P.n}</b> in the <b>${culprit}</b>. ${score>=400?"Disease Detective status! 🕵🏾‍♀️":""}`)}}};
 render()}
function foodTable(tab,full){return `<div style="overflow-x:auto"><table class="t"><tr><th rowspan="2">Food</th><th colspan="3">Ate it</th><th colspan="3">Didn't eat</th>${full?'<th rowspan="2">RR</th>':""}</tr><tr><th>Ill</th><th>Total</th><th>AR%</th><th>Ill</th><th>Total</th><th>AR%</th></tr>
 ${tab.map((t,i)=>`<tr><th>${t.f}</th><td>${t.ei}</td><td>${t.en}</td><td>${full?r1(t.are):"?"}</td><td>${t.ui}</td><td>${t.un}</td><td>${full?r1(t.aru):"?"}</td>${full?`<td>${r1(t.rr)}</td>`:""}</tr>`).join("")}</table></div>`}

/* ---------- herd immunity sim ---------- */
const DZ=[["Measles",15,97],["Pertussis",14,85],["Chickenpox",10,90],["COVID-19 (variant era)",8,60],["Mumps",5,88],["Ebola",2,95],["Seasonal flu",1.4,50]];
function herd(){const g=GAMES[2];
 modal(headHTML(g)+`<div class="row" style="margin-bottom:10px"><label>Disease <select id="hd">${DZ.map((d,i)=>`<option value="${i}">${d[0]} (R0 ${d[1]})</option>`).join("")}</select></label>
 <label style="flex:1;min-width:200px">Vaccinated: <b id="hcv">80</b>%<input id="hc" type="range" min="0" max="100" value="80" style="width:100%;padding:0"></label></div>
 <div class="fb" id="hinfo" style="margin:0 0 10px"></div>
 <div class="simwrap"><canvas id="hcan" width="720" height="380"></canvas></div>
 <div class="row" style="margin-top:10px;justify-content:space-between"><div class="legend"><span><i style="background:#fff"></i>Susceptible</span><span><i style="background:#ff3b3b"></i>Infected</span><span><i style="background:#7c4dff"></i>Recovered</span><span><i style="background:#00e5ff"></i>Vaccinated</span></div><div class="chip" id="hstat">Day 0</div></div>
 <div class="row" style="margin-top:10px"><button class="btn pink" id="hgo">🦠 Release the virus</button><button class="btn ghost" id="hreset">↺ Reset</button></div><div id="hres"></div>`);
 const c=$("#hcan"),x=c.getContext("2d"),W=720,H=380,N=320;let pop=[],running=false,day=0,links=[],hist=[];
 const info=()=>{const d=DZ[$("#hd").value],hit=(1-1/d[1])*100,vc=Math.min(100,hit/(d[2]/100));$("#hcv").textContent=$("#hc").value;$("#hinfo").innerHTML=`<b>${d[0]}</b>: R0 = ${d[1]}, vaccine effectiveness ≈ ${d[2]}%. Herd immunity threshold = 1 − 1/${d[1]} = <b>${r1(hit)}%</b>. Coverage needed with this vaccine ≈ <b>${vc>=100?"100%+ (vaccine alone can't do it — need other measures too)":r1(vc)+"%"}</b>.`};
 const reset=()=>{stopAll();running=false;day=0;hist=[];links=[];const cv=$("#hc").value/100;pop=[...Array(N)].map(()=>({x:rnd(10,W-10),y:rnd(10,H-60),vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,s:Math.random()<cv?"V":"S",d:0}));$("#hres").innerHTML="";$("#hstat").textContent="Day 0";info();loop()};
 const draw=()=>{x.fillStyle="#0b021c";x.fillRect(0,0,W,H);
  links=links.filter(l=>--l.t>0);links.forEach(l=>{x.strokeStyle=`rgba(255,59,59,${l.t/20})`;x.lineWidth=2;x.beginPath();x.moveTo(l.a.x,l.a.y);x.lineTo(l.b.x,l.b.y);x.stroke()});
  pop.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<6||p.x>W-6)p.vx*=-1;if(p.y<6||p.y>H-56)p.vy*=-1;x.beginPath();x.arc(p.x,p.y,p.s==="I"?6:4.5,0,7);x.fillStyle={S:"#fff",I:"#ff3b3b",R:"#7c4dff",V:"#00e5ff"}[p.s];x.fill();if(p.s==="I"){x.strokeStyle="#ff3b3b55";x.lineWidth=6;x.stroke()}});
  const mx=Math.max(10,...hist);x.fillStyle="#ffffff10";x.fillRect(0,H-50,W,50);hist.forEach((v,i)=>{x.fillStyle="#ff3b3b";const bw=Math.max(2,W/Math.max(60,hist.length));x.fillRect(i*bw,H-v/mx*46,bw-1,v/mx*46)});x.fillStyle="#c9b8ff";x.font="12px Lexend";x.fillText("infected each day",6,H-36)};
 const loop=()=>{draw();GRAF=requestAnimationFrame(loop)};
 const tick=()=>{const d=DZ[$("#hd").value],R=d[1],ve=d[2]/100,D=5;day++;let newI=0;const inf=pop.filter(p=>p.s==="I");
  inf.forEach(p=>{let k=0,lam=R/D,L=Math.exp(-lam),q=1;do{k++;q*=Math.random()}while(q>L);k--;for(let j=0;j<k;j++){const t=pick(pop);if(t===p)continue;if(t.s==="S"||(t.s==="V"&&Math.random()>ve)){t.s="I";t.d=D+1;newI++;links.push({a:p,b:t,t:20})}}});
  inf.forEach(p=>{if(--p.d<=0)p.s="R"});hist.push(pop.filter(p=>p.s==="I").length);
  const ever=pop.filter(p=>p.s==="I"||p.s==="R").length;$("#hstat").textContent=`Day ${day} · ${ever} ever infected`;
  if(!pop.some(p=>p.s==="I")){clearInterval(ti);running=false;const unv=pop.filter(p=>p.s!=="V").length;const pct=r1(ever/N*100);const stopped=ever<=12;
   if(stopped)badge("herd");$("#hres").innerHTML=`<div class="fb" style="border-color:${stopped?"var(--lime)":"var(--red)"}"><b>${stopped?"🐑 HERD IMMUNITY WINS!":"💥 Outbreak!"}</b> ${ever} of ${N} people (${pct}%) got infected over ${day} days. ${stopped?"The virus couldn't find enough susceptible people.":"Try raising coverage above the threshold and run it again."}</div>`;
   if(!S.day.once_herd){addXPOnce("herd",25)}sfx(stopped?"level":"wrong");if(stopped)confetti(150)}};
 let ti;$("#hgo").onclick=()=>{if(running)return;if(day>0)reset();running=true;const seeds=shuffle(pop.filter(p=>p.s==="S")).slice(0,3);if(seeds.length<3)seeds.push(...shuffle(pop).slice(0,3-seeds.length));seeds.forEach(p=>{p.s="I";p.d=6});ti=setInterval(tick,420);GT.push(ti)};
 $("#hreset").onclick=reset;$("#hc").oninput=()=>{if(!running)reset()};$("#hd").onchange=()=>{if(!running)reset()};reset()}

/* ---------- memory ---------- */
function memory(){const g=GAMES[5];const set=shuffle(VOCAB).slice(0,6);const cards=shuffle(set.flatMap((v,i)=>[{p:i,t:v[0],k:"t"},{p:i,t:v[1],k:"d"}]));let open=[],moves=0,found=0,lock=false;const t0=Date.now();
 modal(headHTML(g,`<span class="chip" id="mv">Moves: 0</span>`)+`<p class="sub">Match each term to its meaning.</p><div class="memgrid">${cards.map((c,i)=>`<div class="flip" data-i="${i}"><div class="in"><div class="f">${["🦠","🧬","💉","🧫","🔬","📊"][i%6]}</div><div class="b" style="${c.k==="t"?"font-family:Bungee;font-size:15px;font-weight:400":""}">${c.t}</div></div></div>`).join("")}</div>`);
 $$(".flip").forEach(el=>el.onclick=()=>{const i=+el.dataset.i;if(lock||el.classList.contains("on"))return;el.classList.add("on");sfx("click");open.push([i,el]);
  if(open.length===2){moves++;$("#mv").textContent="Moves: "+moves;const[a,b]=open;open=[];if(cards[a[0]].p===cards[b[0]].p&&cards[a[0]].k!==cards[b[0]].k){found++;sfx("right");bump("correct");a[1].classList.add("gone");b[1].classList.add("gone");if(found===6){badge("memory");const sc=Math.max(10,200-moves*10-Math.round((Date.now()-t0)/2000));const tt=setTimeout(()=>endScreen("memory",sc,30+Math.round(sc/10),`Cleared in ${moves} moves.`),700);GT.push(tt)}}
   else{lock=true;sfx("wrong");const tt=setTimeout(()=>{a[1].classList.remove("on");b[1].classList.remove("on");lock=false},900);GT.push(tt)}}})}

/* ---------- who am i ---------- */
function whoami(){const g=GAMES[4];const rounds=shuffle(WHOAMI).slice(0,6);let r=0,score=0,right=0;
 const show=()=>{if(r>=rounds.length){if(right>=5)badge("whoami");return endScreen("whoami",score,Math.round(score/5)+10,`${right}/${rounds.length} diseases identified.`)}
  const R=rounds[r];let n=1;const opts=shuffle([R.a,...shuffle(WHOAMI.filter(w=>w.a!==R.a)).slice(0,3).map(w=>w.a)]);
  const paint=()=>{modal(headHTML(g,`<span class="chip">${r+1}/${rounds.length}</span><span class="chip score">⭐ ${score}</span>`)+`<div class="qcard">${R.clues.slice(0,n).map((c,i)=>`<div style="margin:6px 0;animation:pop .4s">🔎 <b>Clue ${i+1}:</b> ${c}</div>`).join("")}</div>
   <div class="row" style="margin-bottom:10px"><button class="btn sm violet" id="more" ${n>=R.clues.length?"disabled":""}>➕ Another clue (−10)</button><span class="chip">Worth: ${60-n*10} pts</span></div><div class="opts">${opts.map(o=>`<button class="opt" data-o="${o}">${o}</button>`).join("")}</div><div id="fbx"></div>`);
   $("#more").onclick=()=>{n++;paint()};
   $$(".opt").forEach(b=>b.onclick=()=>{$$(".opt").forEach(x=>{x.disabled=true;if(x.dataset.o===R.a)x.classList.add("right")});$("#more").disabled=true;const ok=b.dataset.o===R.a;if(ok){score+=60-n*10;right++;sfx("right");bump("correct")}else{b.classList.add("wrong");sfx("wrong")}
    $("#fbx").innerHTML=`<div class="fb"><b>${ok?"✅ Yes! I'm "+R.a:"❌ I'm "+R.a}</b><br><span class="mini">All clues: ${R.clues.join(" · ")}</span></div><div style="text-align:right;margin-top:10px"><button class="btn pink" id="nx">Next →</button></div>`;$("#nx").onclick=()=>{r++;show()}})};paint()};
 show()}

/* ---------- parent sim ---------- */
function parentSim(){const g=GAMES[3];const sc=shuffle(PARENT_SIMS).slice(0,5);let i=0,trust=50;
 const show=()=>{if(i>=sc.length){if(trust>=130)badge("talker");return endScreen("parent",trust,Math.round(trust/4),trust>=130?"Parents leave your table feeling heard AND informed. 🗣️💜":trust>=90?"Good instincts! Lead with empathy, follow with facts.":"Practice the CASE method in the toolkit, then try again.")}
  const s=sc[i];modal(headHTML(g,`<span class="chip">${i+1}/${sc.length}</span>`)+`<div class="mini">Trust meter</div><div class="meter"><div style="width:${Math.min(100,trust/150*100)}%"></div></div>
  <div class="qcard" style="margin-top:14px">👩🏽‍🍼 <i>"${s.parent}"</i></div><div class="mini" style="margin-bottom:6px">How do you respond?</div>
  <div style="display:grid;gap:10px">${shuffle(s.opts).map(o=>`<button class="opt" style="text-align:left;font-weight:600" data-d="${o[1]}" data-w="${esc(o[2])}">${o[0]}</button>`).join("")}</div><div id="fbx"></div>`);
  $$(".opt").forEach(b=>b.onclick=()=>{const d=+b.dataset.d;trust=Math.max(0,trust+d);$$(".opt").forEach(x=>{x.disabled=true;if(+x.dataset.d===20)x.classList.add("right")});if(d<20)b.classList.add("wrong");sfx(d===20?"right":"wrong");if(d===20){bump("correct");bump("myth")}
   $(".meter div").style.width=Math.min(100,trust/150*100)+"%";$("#fbx").innerHTML=`<div class="fb" style="border-color:${d===20?"var(--lime)":"var(--orange)"}"><b>${d>0?"+":""}${d} trust.</b> ${b.dataset.w}</div><div style="text-align:right;margin-top:10px"><button class="btn pink" id="nx">Next parent →</button></div>`;$("#nx").onclick=()=>{i++;show()}})};
 show()}
