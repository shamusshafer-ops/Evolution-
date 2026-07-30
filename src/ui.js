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

/* The species list is rebuilt every paint rather than once at boot: the number of
   species is an outcome of the run, so rows must appear and disappear as clades split
   and die. */
function paintSpecies(){
  const host = $('speciesList');
  if (!host || !state) return;
  const clades = (state.clades || []).filter(c => c.n >= 5);
  const nEl = $('statSpecies');
  if (nEl) nEl.textContent = clades.length;

  if (!clades.length){ host.innerHTML = '<div class="spsub">no viable species</div>'; return; }
  let html = '';
  for (const c of clades){
    html += '<div class="sprow">' +
      `<span class="dot" style="background:${cladeColor(c.id)}"></span>` +
      `<span class="spname">Clade ${c.id + 1}` +
        `<span class="spsub">spd ${c.traits.speed.toFixed(2)} \u00b7 sns ${c.traits.sense.toFixed(0)} \u00b7 diet ${c.traits.diet.toFixed(2)}</span>` +
      '</span>' +
      `<span class="spcount">${c.n}</span></div>`;
  }
  host.innerHTML = html;
}

function buildSpeciesList(){ paintSpecies(); }

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
