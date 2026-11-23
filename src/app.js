/* ===================== CORE ===================== */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const today=()=>new Date().toISOString().slice(0,10);
const KEY="epiquest_v1";
const DEF={xp:0,badges:[],best:{},read:[],career:{},stats:{},day:{},streak:0,lastDay:"",settings:{city:"Philadelphia",state:"Pennsylvania",sound:true},notes:""};
let S;try{S=Object.assign({},DEF,JSON.parse(localStorage.getItem(KEY)||"{}"))}catch(e){S={...DEF}}
S.settings=Object.assign({},DEF.settings,S.settings);
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};

function touchDay(){const t=today();if(S.lastDay===t)return;const y=new Date(Date.now()-864e5).toISOString().slice(0,10);S.streak=S.lastDay===y?S.streak+1:1;S.lastDay=t;S.day={date:t,games:0,correct:0,formula:0,myth:0,read:0};if(S.streak>=3)badge("streak3");save()}
function bump(k,n=1){touchDay();S.day[k]=(S.day[k]||0)+n;S.stats[k]=(S.stats[k]||0)+n;save();renderHeader()}

/* levels: level L needs 150*L*(L+1)/2 xp */
const need=l=>75*l*(l+1);
function levelOf(xp){let l=0;while(xp>=need(l+1))l++;return l}
function addXP(n,el){const before=levelOf(S.xp);S.xp+=n;save();renderHeader();
 const f=document.createElement("div");f.className="xpfloat";f.textContent="+"+n+" XP";
 const r=el&&el.getBoundingClientRect?el.getBoundingClientRect():{left:innerWidth/2,top:innerHeight/2};
 f.style.left=(r.left+(r.width||0)/2-40)+"px";f.style.top=(r.top)+"px";document.body.appendChild(f);setTimeout(()=>f.remove(),1100);
 const after=levelOf(S.xp);if(after>before){sfx("level");confetti(160);toast("LEVEL UP! You're now a "+LEVELS[Math.min(after,LEVELS.length-1)]+" 🎉")}}
function badge(id){if(S.badges.includes(id))return;S.badges.push(id);save();const b=BADGES[id];setTimeout(()=>{toast(b[0]+" Badge unlocked: "+b[1]);sfx("level");confetti(80)},400)}

/* sound */
let AC;function sfx(t){if(!S.settings.sound)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const seq={right:[[660,.07],[880,.1]],wrong:[[220,.18]],level:[[523,.08],[659,.08],[784,.08],[1046,.2]],click:[[440,.03]],tick:[[1200,.02]]}[t]||[[440,.05]];let tt=AC.currentTime;seq.forEach(([f,d])=>{const o=AC.createOscillator(),g=AC.createGain();o.type=t==="wrong"?"sawtooth":"square";o.frequency.value=f;g.gain.setValueAtTime(.08,tt);g.gain.exponentialRampToValueAtTime(.001,tt+d);o.connect(g);g.connect(AC.destination);o.start(tt);o.stop(tt+d);tt+=d})}catch(e){}}

function toast(m){const t=document.createElement("div");t.className="toast";t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),2700)}

/* confetti */
let cParts=[],cRun=false;
function confetti(n=120){const c=$("#confetti"),x=c.getContext("2d");c.width=innerWidth;c.height=innerHeight;const cols=["#ff2e88","#00e5ff","#b6ff00","#ffe600","#ff8a00","#7c4dff"];
 for(let i=0;i<n;i++)cParts.push({x:innerWidth/2+rnd(-80,80),y:innerHeight/3,vx:(Math.random()-.5)*16,vy:Math.random()*-14-4,s:rnd(6,12),c:pick(cols),r:Math.random()*6,vr:(Math.random()-.5)*.4,l:120});
 if(cRun)return;cRun=true;(function loop(){x.clearRect(0,0,c.width,c.height);cParts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.45;p.vx*=.99;p.r+=p.vr;p.l--;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);x.restore()});cParts=cParts.filter(p=>p.l>0&&p.y<c.height+20);if(cParts.length)requestAnimationFrame(loop);else{cRun=false;x.clearRect(0,0,c.width,c.height)}})()}

/* background viruses */
function bgfx(){const g=$("#bgfx"),em=["🦠","🧬","💉","🧫","🫁","🔬","🦇","📊","🧪"];for(let i=0;i<16;i++){const b=document.createElement("div");b.className="bug";b.textContent=pick(em);b.style.left=rnd(0,95)+"vw";b.style.fontSize=rnd(26,70)+"px";b.style.animationDuration=rnd(22,48)+"s";b.style.animationDelay=-rnd(0,40)+"s";g.appendChild(b)}}

/* ===================== HEADER / NAV ===================== */
const TABS=[["home","🏠","Home"],["intel","📡","Intel"],["diseases","🦠","Diseases"],["games","🎮","Games"],["formulas","🧮","Formulas"],["vaccines","💉","Vaccines"],["career","🎓","Career"]];
function renderHeader(){const l=levelOf(S.xp),lo=need(l),hi=need(l+1);
 $("#hdr").innerHTML=`<div class="logo" onclick="go('home')">EPI QUEST</div>
 <div class="xpbox"><div class="lvl">LV ${l+1}</div><div style="flex:1"><div class="mini" style="margin-bottom:2px">${LEVELS[Math.min(l,LEVELS.length-1)]} · ${S.xp} XP</div><div class="xpbar"><div class="xpfill" style="width:${Math.min(100,(S.xp-lo)/(hi-lo)*100)}%"></div></div></div></div>
 <div class="chip" title="Daily streak">🔥 ${S.streak||0}</div><div class="chip" title="Badges">🏅 ${S.badges.length}</div>
 <div class="chip focusring" id="focus" onclick="focusSprint()" style="cursor:pointer" title="10-minute focus sprint">${focusLabel()}</div>
 <button class="iconbtn" onclick="toggleSound()" title="Sound">${S.settings.sound?"🔊":"🔇"}</button>`}
function toggleSound(){S.settings.sound=!S.settings.sound;save();renderHeader()}
function renderNav(cur){$("#nav").innerHTML=TABS.map(([id,e,n])=>`<button class="${cur===id?"on":""}" onclick="go('${id}')"><span>${e}</span>${n}</button>`).join("")}
function go(p){location.hash=p}
function route(){const p=(location.hash||"#home").slice(1)||"home";const fn=PAGES[p]||PAGES.home;renderNav(p);const m=$("#main");m.innerHTML=`<div class="page">${fn()}</div>`;window.scrollTo(0,0);(AFTER[p]||(()=>{}))();sfx("click")}

/* focus sprint */
let focusEnd=0,focusInt;
function focusLabel(){if(!focusEnd)return"⏱️ Focus 10";const s=Math.max(0,Math.round((focusEnd-Date.now())/1000));return"⏱️ "+Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
function focusSprint(){if(focusEnd){if(confirm("End this focus sprint early?")){focusEnd=0;clearInterval(focusInt);renderHeader()}return}
 focusEnd=Date.now()+10*60*1000;toast("10-minute focus sprint started. You got this! ⚡");clearInterval(focusInt);
 focusInt=setInterval(()=>{const el=$("#focus");if(el)el.textContent=focusLabel();if(Date.now()>=focusEnd){clearInterval(focusInt);focusEnd=0;renderHeader();confetti(200);sfx("level");addXP(50);badge("focus");toast("Sprint done! +50 XP. Take a 3-minute movement break 💃🏾")}},1000)}

/* ===================== PAGES ===================== */
const AFTER={};
const QUESTS=[["games",2,"Play 2 games"],["correct",15,"Get 15 answers right"],["formula",5,"Solve 5 formula problems"],["myth",3,"Bust 3 vaccine myths"],["read",1,"Open a disease file"]];
function dailyQuests(){touchDay();const d=new Date().getDate();return [QUESTS[d%5],QUESTS[(d+2)%5],QUESTS[(d+4)%5]]}
const PAGES={
home(){const q=dailyQuests();const hr=new Date().getHours();const hi=hr<12?"Good morning":hr<17?"Hey":"Good evening";
 return `<div class="hero"><div class="bigemoji">🦠</div><div class="mini" style="color:#fff">${hi}, Tiff 👋🏾</div><div class="big">Ready to outsmart some pathogens?</div><p style="margin:8px 0 14px;max-width:560px">Short games. Big brain. Pick anything — or let the wheel decide.</p>
 <div class="row"><button class="btn" onclick="openWheel()">🎡 Spin the Wheel</button><button class="btn cyan" onclick="startGame('sprint')">⚡ 60-sec Formula Sprint</button><button class="btn lime" onclick="go('intel')">📡 Today's Intel</button></div></div>
 <div class="grid">
 <div class="card"><h3>🎯 Daily Quests</h3>${q.map(([k,n,t])=>{const v=Math.min(n,S.day[k]||0);return `<div class="quest ${v>=n?"done":""}"><div class="ck">${v>=n?"✓":""}</div><div class="qt" style="flex:1">${t}</div><div class="mini">${v}/${n}</div></div>`}).join("")}<p class="mini" style="margin-top:8px">New quests every day. Keep your 🔥 streak alive.</p></div>
 <div class="card"><h3>🧠 Quick Fact</h3><div id="qfact" style="font-size:18px;min-height:96px"></div><button class="btn sm violet" onclick="newFact()">Another one</button></div>
 <div class="card"><h3>🏅 Badges</h3><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px">${Object.entries(BADGES).map(([k,b])=>`<div class="badge ${S.badges.includes(k)?"":"off"}" title="${b[1]}: ${b[2]}" style="padding:4px"><div class="e" style="font-size:24px">${b[0]}</div></div>`).join("")}</div><p class="mini" style="margin-top:8px">${S.badges.length}/${Object.keys(BADGES).length} unlocked · hover for details</p></div>
 </div>
 <div class="sec disp">Jump in</div>
 <div class="grid">${GAMES.slice(0,6).map(gameCard).join("")}</div>
 <div style="text-align:center;margin-top:18px"><button class="btn pink" onclick="go('games')">See all ${GAMES.length} games →</button></div>
 <div class="sec disp">Settings</div>
 <div class="card"><div class="row"><label>My city <input id="setCity" value="${esc(S.settings.city)}" style="width:170px"></label>
 <label>My state <select id="setState">${STATES.map(s=>`<option ${s===S.settings.state?"selected":""}>${s}</option>`).join("")}</select></label>
 <button class="btn sm lime" onclick="saveSettings()">Save</button><button class="btn sm ghost" onclick="resetAll()">Reset progress</button></div><p class="mini" style="margin-top:6px">Your progress saves on this device/browser.</p></div>`},
intel(){const st=S.settings.state,c=S.settings.city;
 return `<h1 class="h1">📡 Intel Room</h1><p class="sub">What's happening in ${esc(c)}, ${esc(st)}, the U.S. and the world — live from CDC & WHO.</p>
 <div class="sec disp">Respiratory radar</div>
 <div class="grid" id="resp" style="grid-template-columns:repeat(auto-fill,minmax(330px,1fr))"><div class="card">Loading live CDC data… 🛰️</div></div>
 <p class="mini" style="margin-top:6px">% of all emergency department visits that were for each virus (CDC National Syndromic Surveillance Program), latest week. Arrows = CDC's trend call.</p>
 <div class="sec disp">🌍 World outbreaks</div><div class="card"><div id="who">Loading WHO Disease Outbreak News…</div></div>
 <div class="sec disp">🇺🇸 U.S. outbreaks & CDC news</div><div class="grid"><div class="card"><h3>CDC outbreak list</h3><div id="cdcout">Loading…</div></div><div class="card"><h3>CDC newsroom</h3><div id="cdcnews">Loading…</div></div></div>
 <div class="sec disp">🔗 Daily check-in links</div>
 <div class="grid">${[["🏙️ "+esc(c),cityLinks()],["🗺️ "+esc(st),stateLinks()],["🇺🇸 National",INTEL_LINKS.us],["🌍 Global",INTEL_LINKS.world]].map(([h,l])=>`<div class="card"><h3>${h}</h3>${l.map(([n,u])=>`<a class="newsitem" target="_blank" rel="noopener" href="${u}">${n} ↗</a>`).join("")}</div>`).join("")}</div>
 <div class="sec disp">🔎 News by topic</div>
 <div class="row">${DISEASES.map(d=>`<a class="btn sm" style="background:${d.color};text-decoration:none" target="_blank" rel="noopener" href="https://news.google.com/search?q=${encodeURIComponent(d.name.replace(/ \(.*\)/,"")+" "+(d.id==="ebola"||d.id==="marburg"?"outbreak":c))}">${d.emoji} ${d.name}</a>`).join("")}</div>
 <div class="sec disp">📝 My watch notes</div>
 <div class="card"><textarea id="notes" rows="5" style="width:100%" placeholder="Jot what you noticed today (e.g., 'Flu ED visits rising in PA — mention at Thursday meeting')">${esc(S.notes||"")}</textarea><div class="row" style="margin-top:8px"><button class="btn sm lime" onclick="S.notes=$('#notes').value;save();toast('Saved ✍🏾');addXP(5)">Save notes</button></div></div>`},
diseases(){return `<h1 class="h1">🦠 Disease Files</h1><p class="sub">Your 9 focus topics. Tap a file to open it (+10 XP the first time).</p>
 <div class="grid">${DISEASES.map(d=>`<div class="card click" onclick="openDisease('${d.id}')" style="border-color:#000;background:linear-gradient(160deg,${d.color}33,var(--card) 60%)"><div class="dz">${d.emoji}</div><h3 style="color:${d.color}">${d.name}</h3><span class="tag" style="background:${d.color}">${d.type}</span><p class="mini" style="margin-top:6px">${d.oneLiner}</p>${S.read.includes(d.id)?'<div class="pill status-Done" style="position:absolute;right:12px;top:12px">✓ read</div>':""}</div>`).join("")}</div>
 <div class="sec disp">Test yourself</div><div class="grid">${GAMES.filter(g=>["whoami","transmission","memory"].includes(g.id)).map(gameCard).join("")}</div>`},
games(){const cats=[["Epidemiology & Biostats",["sprint","outbreak","herd","design","bias","memory"]],["Program Planning & Community",["logic","smart","sem","services","prevention"]],["Diseases & Vaccines",["whoami","transmission","mythfact","parent"]]];
 return `<h1 class="h1">🎮 Game Arcade</h1><p class="sub">Every game is short (2–5 min). Bored? Hit the orange button and switch.</p><div class="row" style="margin-bottom:6px"><button class="btn" onclick="openWheel()">🎡 Can't choose? Spin!</button></div>
 ${cats.map(([n,ids])=>`<div class="sec disp">${n}</div><div class="grid">${ids.map(id=>gameCard(GAMES.find(g=>g.id===id))).join("")}</div>`).join("")}`},
formulas(){const cats=[...new Set(FORMULAS.map(f=>f.cat))];
 return `<h1 class="h1">🧮 Formula Lab</h1><p class="sub">Every formula you need, with a live calculator. Change the numbers and watch the answer update.</p>
 <div class="row" style="margin-bottom:10px"><button class="btn cyan" onclick="startGame('sprint')">⚡ Practice: Formula Sprint</button><div class="seg" id="fcat"><button class="on" data-c="all">All</button>${cats.map(c=>`<button data-c="${c}">${c}</button>`).join("")}</div></div>
 <div class="grid" id="flist">${FORMULAS.map(f=>`<div class="card calc" data-cat="${f.cat}"><span class="tag">${f.cat}</span><h3 style="font-size:17px">${f.name}</h3><div class="formula">${f.f}</div>${f.ins.map((i,k)=>`<label>${i[0]}<input type="number" step="any" value="${i[1]}" data-f="${f.id}" data-k="${k}"></label>`).join("")}<div class="result" id="r_${f.id}"></div><p class="mini" style="margin-top:6px">💡 ${f.tip}</p></div>`).join("")}</div>
 <div class="sec disp">2×2 table cheat sheet</div>
 <div class="card"><table class="t"><tr><th></th><th>Disease +</th><th>Disease −</th></tr><tr><th>Exposed +</th><td>a</td><td>b</td></tr><tr><th>Exposed −</th><td>c</td><td>d</td></tr></table>
 <p style="margin-top:10px">RR = [a/(a+b)] ÷ [c/(c+d)] · OR = ad/bc · For screening, swap rows to Test +/−: Sens = a/(a+c) · Spec = d/(b+d) · PPV = a/(a+b) · NPV = d/(c+d)</p></div>`},
vaccines(){return `<h1 class="h1">💉 Vaccine Talk</h1><p class="sub">Stay sharp for parent conversations. Practice, then go be the trusted messenger.</p>
 <div class="grid">${GAMES.filter(g=>["parent","mythfact"].includes(g.id)).map(gameCard).join("")}
 <div class="card"><h3>🧮 Herd immunity math</h3><p>Measles R0 ≈ 15 → 1 − 1/15 = <b>93%</b> need immunity. With a 97% effective vaccine, ~96% of kids need 2 doses of MMR.</p><button class="btn sm lime" style="margin-top:8px" onclick="startGame('herd')">Try the simulator</button></div></div>
 <div class="sec disp">⚠️ Heads-up for 2025–2026</div>
 <div class="card" style="border-color:var(--orange)"><p>Federal vaccine guidance changed a lot in 2025–2026 (ACIP membership, some CDC recommendations, and CDC web pages on autism). The American Academy of Pediatrics now publishes its own schedule, and many states and insurers follow it. <b>Before talking with parents, check both:</b></p><div class="row" style="margin-top:10px"><a class="btn sm cyan" target="_blank" rel="noopener" href="https://www.aap.org/en/patient-care/immunizations/">AAP Immunization Schedule ↗</a><a class="btn sm" target="_blank" rel="noopener" href="https://www.cdc.gov/vaccines/hcp/imz-schedules/index.html">CDC Schedules ↗</a><a class="btn sm lime" target="_blank" rel="noopener" href="https://www.healthychildren.org/English/safety-prevention/immunizations/Pages/default.aspx">HealthyChildren.org (for parents) ↗</a></div></div>
 <div class="sec disp">🗓️ Childhood schedule at a glance</div>
 <div class="card"><table class="t">${SCHEDULE.map(([a,v])=>`<tr><th style="width:130px">${a}</th><td style="text-align:left">${v}</td></tr>`).join("")}</table><p class="mini" style="margin-top:8px">Simplified overview based on the AAP-style routine schedule. Catch-up and high-risk recommendations differ — always confirm with the current official schedule.</p></div>
 <div class="sec disp">🗣️ Conversation toolkit</div>
 <div class="grid">${TALK_TOOLS.map(([t,d])=>`<div class="card"><h3 style="font-size:17px">${t}</h3><p>${d}</p></div>`).join("")}</div>
 <div class="sec disp">🧯 Myth vs. fact cards</div>
 <div class="grid">${DECKS.mythfact.cards.filter(c=>c[1]==="MYTH").map(c=>`<details class="card"><summary>❌ "${c[0]}"</summary><p style="margin-top:8px">✅ ${c[2]}</p></details>`).join("")}</div>`},
career(){const by=k=>CAREER.filter(c=>c.kind===k);const counts=["Interested","Studying","Applied","Done"].map(s=>[s,Object.values(S.career).filter(v=>v===s).length]);
 const sect=(t,k)=>`<div class="sec disp">${t}</div><div class="grid">${by(k).map(c=>{const st=S.career[c.id]||"None";return `<div class="card"><span class="pill status-${st}" style="float:right">${st==="None"?"Not started":st}</span><h3 style="font-size:17px;margin-right:90px">${c.name}</h3><div class="mini">${c.org}</div><p style="margin:8px 0">${c.info}</p><div class="row"><a class="btn sm cyan" target="_blank" rel="noopener" href="${c.url}">Visit ↗</a><select onchange="setCareer('${c.id}',this.value)">${["None","Interested","Studying","Applied","Done"].map(s=>`<option value="${s}" ${s===st?"selected":""}>${s==="None"?"Not started":s}</option>`).join("")}</select></div></div>`}).join("")}</div>`;
 return `<h1 class="h1">🎓 Career Quest</h1><p class="sub">Certs, trainings and organizations to join. Track your status — each step earns XP.</p>
 <div class="statgrid" style="grid-template-columns:repeat(4,1fr)">${counts.map(([s,n])=>`<div class="stat"><div class="n">${n}</div><div class="pill status-${s}">${s}</div></div>`).join("")}</div>
 ${sect("📜 Certifications","cert")}${sect("🆓 Trainings (mostly free)","training")}${sect("🤝 Organizations to join","org")}
 <p class="mini" style="margin-top:14px">Eligibility rules and fees change — always confirm on the official site before applying.</p>`}
};

function gameCard(g){const b=S.best[g.id];return `<div class="card click" onclick="startGame('${g.id}')" style="background:linear-gradient(160deg,${g.color}44,var(--card) 65%)"><div class="dz">${g.icon}</div><h3>${g.name}</h3><p class="mini">${g.desc}</p><div class="row" style="margin-top:8px"><span class="tag" style="background:${g.color}">${g.tag}</span>${b!=null?`<span class="tag" style="background:#fff">Best: ${b}</span>`:""}</div></div>`}

const STATES=["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];
function saveSettings(){S.settings.city=$("#setCity").value.trim()||"Philadelphia";S.settings.state=$("#setState").value;save();toast("Saved! Intel now tracks "+S.settings.city+", "+S.settings.state)}
function resetAll(){if(confirm("Erase all XP, badges and progress?")){localStorage.removeItem(KEY);location.reload()}}
function cityLinks(){const c=S.settings.city;return c.toLowerCase()==="philadelphia"?INTEL_LINKS.city:[[c+" health department",`https://www.google.com/search?q=${encodeURIComponent(c+" health department")}`],[c+" health news (Google News)",`https://news.google.com/search?q=${encodeURIComponent(c+" public health")}`]]}
function stateLinks(){const s=S.settings.state;return s==="Pennsylvania"?INTEL_LINKS.state:[[s+" Department of Health",`https://www.google.com/search?q=${encodeURIComponent(s+" department of health")}`],[s+" health news (Google News)",`https://news.google.com/search?q=${encodeURIComponent(s+" department of health")}`]]}
function setCareer(id,v){const was=S.career[id];S.career[id]=v;save();if(v!=="None"&&!was){addXP(20);badge("career")}if(v==="Done"&&was!=="Done"){addXP(100);confetti(200);toast("Huge! Achievement unlocked 🎓")}route()}

/* home fact */
function newFact(){const d=pick(DISEASES);const el=$("#qfact");if(el)el.innerHTML=`<span style="color:${d.color};font-weight:800">${d.emoji} ${d.name}:</span> ${pick(d.facts)}`}
AFTER.home=()=>newFact();
AFTER.formulas=()=>{const upd=f=>{const v=$$(`input[data-f="${f.id}"]`).map(i=>parseFloat(i.value));const r=$("#r_"+f.id);if(v.some(isNaN)){r.textContent="—";return}const x=f.calc(v);r.textContent=isFinite(x)?(+x.toFixed(2)).toLocaleString()+" "+f.unit:"—"};FORMULAS.forEach(upd);
 $("#flist").addEventListener("input",e=>{const f=FORMULAS.find(x=>x.id===e.target.dataset.f);if(f)upd(f)});
 $("#fcat").addEventListener("click",e=>{const c=e.target.dataset.c;if(!c)return;$$("#fcat button").forEach(b=>b.classList.toggle("on",b===e.target));$$("#flist .card").forEach(k=>k.style.display=c==="all"||k.dataset.cat===c?"":"none")})};

/* disease modal */
function openDisease(id){const d=DISEASES.find(x=>x.id===id);if(!S.read.includes(id)){S.read.push(id);save();addXP(10);bump("read");if(S.read.length>=DISEASES.length)badge("reader")}
 modal(`<div class="gamehead"><div class="dz">${d.emoji}</div><div><h2 style="color:${d.color}">${d.name}</h2><span class="tag" style="background:${d.color}">${d.type}</span></div></div>
 <p style="font-size:19px;font-weight:600">${d.oneLiner}</p>
 <div class="sec disp" style="font-size:18px">Need-to-know</div><ul class="list">${d.facts.map(f=>`<li>${f}</li>`).join("")}</ul>
 <div class="grid" style="margin-top:14px"><div class="card"><h3 style="font-size:16px">⚠️ Risk factors / triggers</h3><ul class="list">${d.triggers.map(f=>`<li>${f}</li>`).join("")}</ul></div>
 <div class="card"><h3 style="font-size:16px">🛡️ Prevention & interventions</h3><ul class="list">${d.prevent.map(f=>`<li>${f}</li>`).join("")}</ul></div></div>
 <div class="sec disp" style="font-size:18px">By the numbers</div>${d.numbers.map(([a,b])=>`<div class="fb" style="margin-top:6px"><b>${a}:</b> ${b}</div>`).join("")}
 <div class="fb" style="border-color:var(--yellow)">👀 <b>What to watch:</b> ${d.watch}</div>
 <div class="row" style="margin-top:14px">${d.links.map(([n,u])=>`<a class="btn sm cyan" target="_blank" rel="noopener" href="${u}">${n} ↗</a>`).join("")}<a class="btn sm" target="_blank" rel="noopener" href="https://news.google.com/search?q=${encodeURIComponent(d.name)}">Latest news ↗</a><button class="btn sm pink" onclick="startGame('whoami')">Play Who Am I?</button></div>`)}

/* modal */
let onClose=null;
function modal(html,cb){$("#modal").classList.add("on");$("#mbox").innerHTML=`<button class="close" onclick="closeModal()">✕</button>`+html;onClose=cb||null;$("#modal").scrollTop=0}
function closeModal(){$("#modal").classList.remove("on");$("#mbox").innerHTML="";if(onClose){const c=onClose;onClose=null;c()}stopAll();if(["home","games","diseases",""].includes(location.hash.slice(1)))route()}

/* wheel */
function openWheel(){const items=shuffle(GAMES).slice(0,8);const cols=["#ff2e88","#00e5ff","#b6ff00","#ffe600","#ff8a00","#7c4dff","#00ffa3","#ff3b3b"];
 modal(`<h2 style="text-align:center">🎡 Spin the Wheel</h2><p class="sub" style="text-align:center">Let fate pick your next game.</p><div class="wheelwrap"><div class="pin">🔻</div><canvas id="wheel" width="340" height="340"></canvas></div><div style="text-align:center"><button class="btn pink" id="spinb">SPIN!</button><div id="wres" class="score" style="margin-top:12px;min-height:30px"></div></div>`);
 const c=$("#wheel"),x=c.getContext("2d"),n=items.length,a=2*Math.PI/n;
 items.forEach((g,i)=>{x.beginPath();x.moveTo(170,170);x.arc(170,170,165,i*a-Math.PI/2,(i+1)*a-Math.PI/2);x.fillStyle=cols[i];x.fill();x.lineWidth=4;x.strokeStyle="#000";x.stroke();x.save();x.translate(170,170);x.rotate(i*a+a/2-Math.PI/2);x.textAlign="right";x.fillStyle="#000";x.font="bold 15px Lexend, sans-serif";x.fillText(g.icon+" "+g.short,155,5);x.restore()});
 let spun=false;$("#spinb").onclick=()=>{if(spun)return;spun=true;const k=rnd(0,n-1);const deg=360*6+(360-(k*360/n+180/n));c.style.transform=`rotate(${deg}deg)`;
  let t=0;const tk=setInterval(()=>{sfx("tick");if(++t>25)clearInterval(tk)},140);
  setTimeout(()=>{$("#wres").textContent=items[k].icon+" "+items[k].name+"!";sfx("level");confetti(60);setTimeout(()=>startGame(items[k].id),900)},4100)}}

/* ===================== INTEL LOADERS ===================== */
const ARROW={Increasing:["▲ Increasing","#ff3b3b"],Decreasing:["▼ Decreasing","#b6ff00"],"No Change":["● No change","#ffe600"]};
async function loadResp(){const box=$("#resp");if(!box)return;const geos=[S.settings.state,"United States"];
 try{const rows=await Promise.all(geos.map(g=>fetch(`https://data.cdc.gov/resource/rdmq-nq56.json?$limit=8&county=All&geography=${encodeURIComponent(g)}&$order=week_end%20DESC`).then(r=>r.json())));
  box.innerHTML=rows.map((rs,i)=>{const r=rs[0];if(!r)return `<div class="card">No data for ${geos[i]}</div>`;const wk=new Date(r.week_end).toLocaleDateString(undefined,{month:"short",day:"numeric"});
   const cell=(lab,k,tk,col)=>{const tr=ARROW[r[tk]]||[r[tk]||"",'#c9b8ff'];const series=rs.map(x=>+x[k]).reverse();const mx=Math.max(...series,.01);
    return `<div class="stat"><div class="mini">${lab}</div><div class="n" style="color:${col}">${(+r[k]).toFixed(2)}%</div><div class="trend" style="color:${tr[1]}">${tr[0]}</div><svg viewBox="0 0 80 24" width="100%" height="24"><polyline fill="none" stroke="${col}" stroke-width="3" points="${series.map((v,j)=>`${j*80/(series.length-1)},${22-v/mx*20}`).join(" ")}"/></svg></div>`};
   return `<div class="card" style="grid-column:span 1"><h3>${i===0?"🗺️ ":"🇺🇸 "}${geos[i]}</h3><div class="mini" style="margin-bottom:8px">Week ending ${wk}</div><div class="statgrid">${cell("COVID","percent_visits_covid","ed_trends_covid","#00ffa3")}${cell("Flu","percent_visits_influenza","ed_trends_influenza","#7c4dff")}${cell("RSV","percent_visits_rsv","ed_trends_rsv","#b6ff00")}</div></div>`}).join("")+
   `<div class="card"><h3>🏙️ ${esc(S.settings.city)}</h3><p>County-level ED trends are often suppressed. For city data, check your local dashboard:</p>${cityLinks().slice(0,2).map(([n,u])=>`<a class="newsitem" target="_blank" rel="noopener" href="${u}">${n} ↗</a>`).join("")}</div>`;
 }catch(e){box.innerHTML=`<div class="card">Couldn't reach CDC right now (offline?). <a target="_blank" href="https://www.cdc.gov/respiratory-viruses/data/index.html">Open CDC respiratory data ↗</a></div>`}}
const HOT=/ebola|marburg|influenza|avian|h5n1|covid|sars-cov|rsv|syncytial|measles|polio|mpox/i;
async function loadWHO(){const el=$("#who");if(!el)return;try{const j=await fetch("https://www.who.int/api/news/diseaseoutbreaknews?$top=12&$orderby=PublicationDateAndTime%20desc&$select=Title,PublicationDate,UrlName").then(r=>r.json());
 el.innerHTML=j.value.map(v=>`<a class="newsitem ${HOT.test(v.Title)?"hot":""}" target="_blank" rel="noopener" href="https://www.who.int/emergencies/disease-outbreak-news/item/${v.UrlName}"><div class="d">${new Date(v.PublicationDate).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}${HOT.test(v.Title)?" · 🔥 on your watchlist":""}</div><b>${esc(v.Title)}</b></a>`).join("")}catch(e){el.innerHTML=`Couldn't load. <a target="_blank" href="https://www.who.int/emergencies/disease-outbreak-news">Open WHO DON ↗</a>`}}
async function loadRSS(id,url,fallback){const el=$("#"+id);if(!el)return;try{const j=await fetch("https://api.rss2json.com/v1/api.json?rss_url="+encodeURIComponent(url)).then(r=>r.json());if(j.status!=="ok")throw 0;
 const tmp=document.createElement("div");el.innerHTML=j.items.sort((a,b)=>b.pubDate.localeCompare(a.pubDate)).slice(0,8).map(i=>{tmp.innerHTML=i.title;const t=tmp.textContent;tmp.innerHTML=t;return `<a class="newsitem ${HOT.test(t)?"hot":""}" target="_blank" rel="noopener" href="${esc(i.link)}"><div class="d">${i.pubDate.slice(0,10)}</div><b>${esc(tmp.textContent)}</b></a>`}).join("")}catch(e){el.innerHTML=`Couldn't load. <a target="_blank" href="${fallback}">Open on CDC ↗</a>`}}
AFTER.intel=()=>{loadResp();loadWHO();loadRSS("cdcout","https://tools.cdc.gov/api/v2/resources/media/285676.rss","https://www.cdc.gov/outbreaks/index.html");loadRSS("cdcnews","https://tools.cdc.gov/api/v2/resources/media/132608.rss","https://www.cdc.gov/media/index.html");addXPOnce("intel",5)};
function addXPOnce(k,n){touchDay();if(S.day["once_"+k])return;S.day["once_"+k]=1;save();addXP(n)}

/* boot */
window.addEventListener("hashchange",route);
window.addEventListener("DOMContentLoaded",()=>{touchDay();bgfx();renderHeader();route();$("#modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()})});
