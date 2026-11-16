// ===== Game logic =====
const KEY = 'jjk-idle-v1';
const fresh = () => ({ ce: 0, yen: 0, lvl: 1, pts: 0, sp: 0,
  st: { pow: 1, vit: 1, ctl: 1, spd: 1 }, sk: {}, dr: {}, it: {}, cleared: 0, read: [] });
let S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}'));
let fight = null, exp = null, logs = [];
const $ = id => document.getElementById(id);
const f = n => Math.floor(n).toLocaleString();
const g = (o, k) => o[k] || 0;
const save = () => localStorage.setItem(KEY, JSON.stringify(S));

// ----- derived values -----
const cps = () => DRILLS.reduce((a, d) => a + d.cps * g(S.dr, d.id), 0) * (1 + S.st.ctl * .1) * (1 + .15 * g(S.sk, 'flow'));
const clickGain = () => 1 + S.st.pow + S.st.ctl * .5;
const maxHp = () => 40 + S.st.vit * 10 + 15 * g(S.it, 'charm');
const atk = () => 4 + S.st.pow * 2 + 4 * g(S.it, 'blade');
const lvCost = () => Math.floor(100 * 1.6 ** (S.lvl - 1));
const drillCost = (d) => Math.ceil(d.base * 1.15 ** g(S.dr, d.id));
const price = (i) => Math.ceil(i.base * (i.tonic ? 1 + S.lvl : 1.5 ** g(S.it, i.id)));
const enemy = i => { const b = i % 5 === 4 ? 1.5 : 1;
  return { n: STAGE_NAMES[i] + (b > 1 ? ' (Boss)' : ''), hp: Math.floor(30 * 1.6 ** i * b),
    atk: Math.floor(3 * 1.4 ** i), yen: Math.floor(10 * 1.7 ** i), ce: Math.floor(25 * 1.8 ** i) }; };

// ----- tabs -----
function show(id) {
  document.querySelectorAll('section').forEach(s => s.classList.toggle('on', s.id === id));
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.getAttribute('onclick') === `show('${id}')`));
}

// ----- training -----
function channel() { S.ce += clickGain(); renderTop(); }
function buyDrill(id) { const d = DRILLS.find(x => x.id === id), c = drillCost(d);
  if (S.ce < c) return; S.ce -= c; S.dr[id] = g(S.dr, id) + 1; renderAll(); }
function levelUp() { const c = lvCost(); if (S.ce < c) return;
  S.ce -= c; S.lvl++; S.pts += 3; S.sp++; renderAll(); }

// ----- stats & skills -----
function addStat(id) { if (S.pts < 1) return; S.pts--; S.st[id]++; renderAll(); }
function addSkill(id) { if (S.sp < 1 || g(S.sk, id) >= 5) return; S.sp--; S.sk[id] = g(S.sk, id) + 1; renderAll(); }

// ----- shop -----
function buyItem(id) { const i = ITEMS.find(x => x.id === id), p = price(i);
  if (S.yen < p) return; S.yen -= p;
  if (i.tonic) S.ce += Math.max(100, cps() * 60); else S.it[id] = g(S.it, id) + 1;
  renderAll(); }

// ----- combat -----
function say(t) { logs.unshift(t); logs = logs.slice(0, 7); }
function startFight(i) { if (fight) return;
  fight = { i, n: 0, php: maxHp(), ehp: enemy(i).hp }; logs = []; say(`A ${enemy(i).n} appears!`); renderAll(); }
function combatTick() {
  if (!fight) return;
  const e = enemy(fight.i); fight.n++;
  let d = atk() * (.85 + Math.random() * .3), t = 'You strike';
  if (Math.random() < g(S.sk, 'bf') * .1 + S.st.spd * .01) { d *= 2.5; t = 'BLACK FLASH!'; }
  if (g(S.sk, 'dom') && fight.n % 5 === 0) { d = atk() * (2 + .5 * g(S.sk, 'dom')); t = 'DOMAIN EXPANSION!'; }
  d = Math.floor(d); fight.ehp -= d; say(`${t} ${d} damage.`);
  if (fight.ehp <= 0) {
    S.yen += e.yen; S.ce += e.ce;
    if (fight.i === S.cleared && S.cleared < STAGE_NAMES.length) S.cleared++;
    say(`Victory! +${f(e.yen)} yen, +${f(e.ce)} CE.`); fight = null; renderAll(); return; }
  if (Math.random() < Math.min(.4, S.st.spd * .02)) say('You dodge the attack.');
  else { const h = Math.floor(e.atk * (.9 + Math.random() * .2)); fight.php -= h; say(`${e.n} hits you for ${h}.`); }
  fight.php = Math.min(maxHp(), fight.php + maxHp() * .03 * g(S.sk, 'rct'));
  if (fight.php <= 0) { say('You were forced to retreat. Train up and try again.'); fight = null; }
  renderFight();
}
function renderFight() {
  let h = '';
  if (fight) { const e = enemy(fight.i);
    h = `<h3>${e.n}</h3><div class="bar ehp"><i style="width:${Math.max(0, fight.ehp / e.hp * 100)}%"></i></div>
    <b>You</b> ${f(Math.max(0, fight.php))}/${f(maxHp())} HP<div class="bar hp"><i style="width:${Math.max(0, fight.php / maxHp() * 100)}%"></i></div>`; }
  $('fightbox').innerHTML = h + `<div id="log">${logs.map(l => `<p>${l}</p>`).join('') || '<p>Pick a stage to begin.</p>'}</div>`;
}

// ----- map expeditions -----
function goArea(i) { exp = { a: i }; renderMap(); }
function choose(ci) { const c = AREAS[exp.a].ch[ci], m = 1 + S.cleared * .6;
  if (Math.random() < c.p) { const y = Math.floor(c.y * m), ce = Math.floor(c.c * m); S.yen += y; S.ce += ce;
    exp.res = `Success! ${c.s} +${f(y)} yen, +${f(ce)} CE.`;
  } else { const l = Math.min(S.ce, Math.floor(c.l * m)); S.ce -= l; exp.res = `Failure. ${c.f} -${f(l)} CE.`; }
  renderAll(); }
function leaveArea() { exp = null; renderMap(); }

// ----- story -----
function claim(i) { if (S.read.includes(i)) return; S.read.push(i); S.pts += 3; renderAll(); }

// ----- rendering -----
function renderTop() {
  $('top').innerHTML = `<span>CE <b>${f(S.ce)}</b></span><span>(+${f(cps())}/s)</span><span>Yen <b>${f(S.yen)}</b></span>
    <span>Level <b>${S.lvl}</b></span><span>Stat pts <b>${S.pts}</b></span><span>Skill pts <b>${S.sp}</b></span>`;
  document.querySelectorAll('[data-c]').forEach(b => b.classList.toggle('poor', +b.dataset.c > S.ce));
  document.querySelectorAll('[data-y]').forEach(b => b.classList.toggle('poor', +b.dataset.y > S.yen));
}
function renderTrain() {
  $('train').innerHTML = `<h2>Training</h2>
    <button class="act" onclick="channel()">Channel Cursed Energy (+${clickGain().toFixed(1)})</button>
    <div class="row"><div><b>Level ${S.lvl}</b><br><small>Gain 3 stat points and 1 skill point</small></div>
      <button data-c="${lvCost()}" onclick="levelUp()">Level up: ${f(lvCost())} CE</button></div>
    <h3>Drills</h3>` + DRILLS.map(d => `<div class="row"><div><b>${d.n}</b> x${g(S.dr, d.id)}<br><small>+${d.cps} CE/s each</small></div>
      <button data-c="${drillCost(d)}" onclick="buyDrill('${d.id}')">${f(drillCost(d))} CE</button></div>`).join('');
}
function renderCombat() {
  $('combat').innerHTML = `<h2>Combat</h2><p><small>Attack ${atk()} · Max HP ${maxHp()}</small></p><div id="fightbox"></div><h3>Stages</h3>` +
    STAGE_NAMES.map((_, i) => { const e = enemy(i), ok = i <= S.cleared;
      return `<div class="row ${ok ? '' : 'lock'}"><div><b>${i + 1}. ${e.n}</b><br><small>HP ${f(e.hp)} · ATK ${e.atk} · Reward ${f(e.yen)} yen, ${f(e.ce)} CE</small></div>
      ${ok ? `<button onclick="startFight(${i})">Fight</button>` : '<small>Locked</small>'}</div>`; }).join('');
  renderFight();
}
function renderSkills() {
  $('skills').innerHTML = `<h2>Stats</h2><p>Stat points: <b>${S.pts}</b></p>` + STATS.map(s => `<div class="row"><div><b>${s.n}: ${S.st[s.id]}</b><br><small>${s.d}</small></div>
    <button onclick="addStat('${s.id}')">+1</button></div>`).join('') +
    `<h2>Skills</h2><p>Skill points: <b>${S.sp}</b></p>` + SKILLS.map(s => `<div class="row"><div><b>${s.n}: ${g(S.sk, s.id)}/5</b><br><small>${s.d}</small></div>
    <button onclick="addSkill('${s.id}')">Learn</button></div>`).join('');
}
function renderShop() {
  $('shop').innerHTML = `<h2>Shop</h2><p><small>Spend yen earned from combat and expeditions.</small></p>` + ITEMS.map(i => `<div class="row"><div><b>${i.n}</b> ${i.tonic ? '' : 'x' + g(S.it, i.id)}<br><small>${i.d}</small></div>
    <button data-y="${price(i)}" onclick="buyItem('${i.id}')">${f(price(i))} yen</button></div>`).join('');
}
function renderMap() {
  let h = '<h2>Map</h2>';
  if (!exp) h += '<p><small>Choose an area to start an expedition. Clear more combat stages to unlock areas.</small></p>' +
    AREAS.map((a, i) => { const ok = S.cleared >= a.need;
      return `<div class="row ${ok ? '' : 'lock'}"><div><b>${a.n}</b><br><small>${ok ? a.t : 'Clear stage ' + a.need + ' to unlock'}</small></div>
      ${ok ? `<button onclick="goArea(${i})">Explore</button>` : ''}</div>`; }).join('');
  else { const a = AREAS[exp.a]; h += `<div class="card"><h3>${a.n}</h3><p>${a.t}</p></div>`;
    if (exp.res) h += `<div class="card"><p>${exp.res}</p></div><button class="act" onclick="leaveArea()">Back to map</button>`;
    else h += a.ch.map((c, i) => `<div class="row"><div><b>${c.b}</b><br><small>Risk: ${Math.round((1 - c.p) * 100)}% chance to fail</small></div>
      <button onclick="choose(${i})">Choose</button></div>`).join(''); }
  $('map').innerHTML = h;
}
function renderStory() {
  $('story').innerHTML = '<h2>Story</h2>' + STORY.map((c, i) => S.cleared >= c.need
    ? `<div class="card"><h3>${c.t}</h3><p>${c.x}</p>${S.read.includes(i) ? '<small>Reward claimed</small>' : `<button class="small" onclick="claim(${i})">Claim +3 stat points</button>`}</div>`
    : `<div class="card lock"><h3>${c.t}</h3><small>Clear stage ${c.need} to unlock.</small></div>`).join('');
}
function renderAll() {
  [renderTrain, renderCombat, renderSkills, renderShop, renderMap, renderStory].forEach(r => r());
  renderTop(); save();
}

function resetGame() { if (confirm('Erase all progress?')) { localStorage.removeItem(KEY); location.reload(); } }

// ----- loops -----
setInterval(() => { S.ce += cps() / 4; renderTop(); }, 250);
setInterval(combatTick, 800);
setInterval(save, 10000);
renderAll(); show('train');
