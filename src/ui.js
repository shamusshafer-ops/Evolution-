/* ============================================================================
   ui.js — DOM controls and readouts. Reads sim state; the only mutations it makes
   are the ones the player asked for (start/pause/reset/scenario/speed).
   ========================================================================== */

const UI = { els:{}, lastPaint:0 };

function $(id){ return document.getElementById(id); }

function buildScenarioButtons(){
  const host = $('scenarios');
  if (!host) return;
  host.innerHTML = '';
  for (const sc of SCENARIOS){
    const b = document.createElement('button');
    b.className = 'chip' + (sc.id === state.scenario ? ' on' : '');
    b.textContent = sc.name;
    b.title = sc.blurb;
    b.setAttribute('aria-pressed', String(sc.id === state.scenario));
    b.onclick = () => restart({ scenario: sc.id, seed: $('seed').value.trim() || 'origin' });
    host.appendChild(b);
  }
  const cur = SCENARIOS.find(s => s.id === state.scenario);
  if (cur && $('scenarioBlurb')) $('scenarioBlurb').textContent = cur.blurb;
}

function buildTraitLegend(){
  const host = $('legend');
  if (!host) return;
  host.innerHTML = '';
  for (const t of TRAITS){
    const row = document.createElement('div');
    row.className = 'legrow';
    row.innerHTML =
      `<span class="dot" style="background:${t.color}"></span>` +
      `<span class="legname">${t.label}</span>` +
      `<span class="legval" id="val-${t.key}">—</span>`;
    row.title = t.blurb;
    host.appendChild(row);
  }
}

function buildSpeciesList(){
  const host = $('speciesList');
  if (!host) return;
  host.innerHTML = '';
  for (const id of state.activeSpecies){
    const s = SPECIES_BY_ID[id];
    const row = document.createElement('div');
    row.className = 'sprow';
    row.id = 'sp-' + id;
    row.title = s.blurb;
    row.innerHTML =
      `<span class="dot" style="background:${s.color}"></span>` +
      `<span class="spname">${s.name}<span class="spsub" id="sptr-${id}">\u2014</span></span>` +
      `<span class="spcount" id="spn-${id}">\u2014</span>`;
    host.appendChild(row);
  }
}

function paintSpecies(){
  const counts = speciesCounts();
  for (const id of state.activeSpecies){
    const n = counts[id] || 0;
    const cn = $('spn-' + id); if (cn) cn.textContent = n;
    const row = $('sp-' + id); if (row) row.classList.toggle('out', n === 0);
    const tr = $('sptr-' + id);
    if (tr){
      if (!n){ tr.textContent = 'excluded'; }
      else {
        const sp = speciesTraitStats(id,'speed').mean, se = speciesTraitStats(id,'sense').mean;
        tr.textContent = `spd ${sp.toFixed(2)} \u00b7 sns ${se.toFixed(0)}`;
      }
    }
  }
}

function fmt(n, d){ return (n==null||!isFinite(n)) ? '—' : n.toFixed(d==null?2:d); }

function paintReadouts(){
  if (!state) return;
  const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
  set('statPop',  state.organisms.length);
  set('statGen',  state.generation);
  set('statTick', state.tick.toLocaleString());
  set('statFood', state.food.length);
  set('statBorn', state.stats.born.toLocaleString());
  set('statDied', (state.stats.starved + state.stats.aged).toLocaleString());

  for (const t of TRAITS){
    const s = traitStats(t.key);
    const el = $('val-' + t.key);
    if (el) el.textContent = `${fmt(s.mean, t.key==='sense'?1:2)} ±${fmt(s.sd, t.key==='sense'?1:2)}`;
  }

  paintSpecies();

  const ex = $('extinct');
  if (ex) ex.hidden = !extinct();
}

function setRunning(on){
  state.running = on;
  const b = $('btnRun');
  if (b){ b.textContent = on ? 'Pause' : 'Run'; b.setAttribute('aria-pressed', String(on)); }
}

function restart(opts){
  opts = opts || {};
  const seed = opts.seed != null ? opts.seed : (($('seed') && $('seed').value.trim()) || 'origin');
  const scenario = opts.scenario || state.scenario;
  const wasRunning = state ? state.running : true;
  initWorld({ seed, scenario });
  if ($('seed')) $('seed').value = seed;
  fitCanvases();
  buildScenarioButtons();
  buildSpeciesList();
  setRunning(wasRunning);
  paintReadouts();
  drawAll();
}

function bindUI(){
  UI.els.run = $('btnRun');
  if (UI.els.run) UI.els.run.onclick = () => setRunning(!state.running);

  const reset = $('btnReset');
  if (reset) reset.onclick = () => restart({});

  const reroll = $('btnReroll');
  if (reroll) reroll.onclick = () => restart({ seed: 'run-' + Math.floor(Math.random()*1e6).toString(36) });

  const seed = $('seed');
  if (seed) seed.onchange = () => restart({ seed: seed.value.trim() || 'origin' });

  const sp = $('speed');
  if (sp) sp.oninput = () => {
    state.speedMult = Number(sp.value);
    const lab = $('speedLabel');
    if (lab) lab.textContent = state.speedMult + '\u00d7';
  };

  window.addEventListener('resize', () => { fitCanvases(); drawAll(); });

  // Space toggles run — the control you reach for most, on the key nearest the thumb.
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT'){ e.preventDefault(); setRunning(!state.running); }
    if (e.key === 'r' && e.target.tagName !== 'INPUT') restart({});
  });

  // A simulation left running in a background tab burns battery for nothing.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.running){ setRunning(false); }
  });
}
