/* ============================================================================
   ui.js — DOM controls and readouts. Reads sim state; the only mutations it makes
   are the ones the player asked for (start/pause/reset/scenario/speed).
   ========================================================================== */

const UI = { els:{}, lastPaint:0, autoPaused:false, cssFullscreen:false };

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
  const showAdapt = !!state.cfg.adaptations;
  let html = '';
  for (const c of clades){
    /* Adaptation glyphs are the legibility payoff of making these genes discrete:
       a clade's strategy reads at a glance as a row of symbols rather than as four
       decimal numbers. Only shown at >=50% within the clade — an adaptation drifting
       at 10% is not that clade's identity, and showing it would make every clade look
       the same. Dimmed between 50-85% to distinguish "spreading" from "fixed". */
    let glyphs = '';
    if (showAdapt){
      for (const a of ADAPTATIONS){
        const f = cladeAdaptFrequency(c.id, a.key);
        if (f >= 0.5){
          const solid = f >= 0.85;
          glyphs += `<span class="adGlyph" style="color:${a.color};opacity:${solid?1:0.55}" title="${a.name} — ${Math.round(f*100)}% of this clade">${a.glyph}</span>`;
        }
      }
    }
    html += '<div class="sprow">' +
      `<span class="dot" style="background:${cladeColor(c.id)}"></span>` +
      `<span class="spname">${cladeName(c.id)}` +
        `<span class="spsub">spd ${c.traits.speed.toFixed(2)} \u00b7 sns ${c.traits.sense.toFixed(0)} \u00b7 sz ${c.traits.size.toFixed(2)}</span>` +
      '</span>' +
      `<span class="adGlyphs">${glyphs}</span>` +
      `<span class="spcount">${c.n}</span></div>`;
  }
  host.innerHTML = html;
}

function buildSpeciesList(){ paintSpecies(); }

/* One button per shock, disabled while a patch-based shock is already active — this
   mirrors triggerShock()'s own refusal contract rather than fighting it: better to
   show the player why a button won't do anything than to let them click it and
   wonder why nothing happened. Cull is never disabled, since it doesn't conflict. */
function buildShockButtons(){
  const host = $('shocks');
  if (!host) return;
  host.innerHTML = '';
  for (const sh of SHOCKS){
    const b = document.createElement('button');
    b.className = 'chip';
    b.textContent = sh.name;
    b.title = sh.blurb;
    b.onclick = () => { triggerShock(sh.id); paintShocks(); };
    host.appendChild(b);
  }
}
function paintShocks(){
  const active = (state && state.activeShocks) || [];
  const patchShock = active.find(sh => SHOCKS_BY_ID[sh.id].patch);
  const host = $('shocks');
  if (host){
    for (const btn of host.children){
      const sh = SHOCKS.find(s => s.name === btn.textContent);
      btn.disabled = !!(patchShock && sh && sh.patch);
    }
  }
  const banner = $('shockActive');
  if (banner){
    if (patchShock){
      const left = Math.max(0, patchShock.until - state.tick);
      banner.hidden = false;
      banner.textContent = `${patchShock.name} active — ${left} ticks remaining.`;
    } else {
      banner.hidden = true;
    }
  }
}

function fmt(n, d){ return (n==null||!isFinite(n)) ? '—' : n.toFixed(d==null?2:d); }

/* Drains state.events (populated by detectSpeciation() in sim.js) each paint. The
   sim only KNOWS an event happened; it has no DOM and shouldn't — this is where that
   fact becomes something the player sees. Toasts are real wall-clock timed (CSS
   animation with a fixed duration), not tied to sim ticks, so they read at the same
   pace regardless of the speed multiplier — a notification that vanished in one
   frame at 20x speed would defeat the point of having one. */
function drainEvents(){
  if (!state || !state.events || !state.events.length) return;
  const events = state.events; state.events = [];
  for (const ev of events){
    if (ev.type === 'speciation') showSpeciationToast(ev);
    else if (ev.type === 'merge') showMergeToast(ev);
  }
}
function showSpeciationToast(ev){
  const host = $('toasts');
  if (host){
    const el = document.createElement('div');
    el.className = 'toast';
    // Naming the parent is now exact rather than inferred — the lineage matcher
    // records which lineage a split descended from.
    const label = ev.parent
      ? `<b>${ev.name}</b> split from <b>${ev.parent}</b>`
      : `<b>${ev.name}</b> has emerged`;
    el.innerHTML = `${label} — ${ev.totalSpecies} species now, ${ev.n} organisms.`;
    host.appendChild(el);
    // Remove after the CSS animation finishes rather than relying on the animation's
    // own visual end state — an element left in the DOM after fading out would still
    // occupy layout space and silently accumulate over a long unattended run.
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 5100);
  }
  const flash = $('wellFlash');
  if (flash){
    flash.classList.remove('pulse');
    void flash.offsetWidth;   // force reflow so re-adding the class restarts the animation
                              // if a second split happens before the first pulse finishes
    flash.classList.add('pulse');
  }
}

/* A merge is as real an event as a split. Without announcing it, a name would simply
   vanish from the species list with no explanation. Styled distinctly so it does not
   read as a new species appearing. */
function showMergeToast(ev){
  const host = $('toasts');
  if (host){
    const el = document.createElement('div');
    el.className = 'toast merge';
    const gone = (ev.absorbed||[]).map(n=>`<b>${n}</b>`).join(', ');
    el.innerHTML = `${gone} rejoined <b>${ev.name}</b> — ${ev.totalSpecies} species now.`;
    host.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 5100);
  }
}

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
  paintShocks();

  const ex = $('extinct');
  if (ex) ex.hidden = !extinct();
  const ap = $('autopaused');
  if (ap) ap.hidden = !UI.autoPaused;
}

/* `auto` distinguishes a background-tab pause from anything the player did. Any
   DELIBERATE action — the Run button, spacebar, seed change, reset, reroll —
   clears the flag, so the banner never lingers past the moment the player has
   actually taken control back. */
function setRunning(on, auto){
  state.running = on;
  UI.autoPaused = !!(auto && !on);
  const b = $('btnRun');
  if (b){ b.textContent = on ? 'Pause' : 'Run'; b.setAttribute('aria-pressed', String(on)); }
}

function restart(opts){
  opts = opts || {};
  const seed = opts.seed != null ? opts.seed : (($('seed') && $('seed').value.trim()) || 'origin');
  const scenario = opts.scenario || state.scenario;
  const wasRunning = state ? state.running : true;
  initWorld({ seed, scenario });
  const toastHost = $('toasts');
  if (toastHost) toastHost.innerHTML = '';   // a toast from the old run mid-animation would otherwise linger, naming a species that no longer exists
  if ($('seed')) $('seed').value = seed;
  fitCanvases();
  buildScenarioButtons();
  buildSpeciesList();
  buildShockButtons();
  setRunning(wasRunning);
  paintReadouts();
  drawAll();
}

/* About panel: a dialog over the running sim, not a navigation. It never touches
   `state` or pauses the run — closing it should hand the player back to exactly
   where they were, since the whole point is to explain what they're already
   watching, not interrupt it. */
function renderChangelog(){
  const host = $('changelog');
  if (!host || host.dataset.built) return;   // build once; the list never changes at runtime
  host.dataset.built = '1';
  let html = '';
  for (const c of CHANGELOG){
    html += `<div class="chLine"><div class="chHead">` +
      `<span class="chDate">${c.date}</span><span class="chTag">${c.tag}</span>` +
      `<span class="chTitle">${c.title}</span></div>` +
      `<div class="chText">${c.text}</div></div>`;
  }
  host.innerHTML = html;
}
function openAbout(){
  renderChangelog();
  const p = $('aboutPanel'), b = $('aboutBackdrop');
  if (p) p.hidden = false;
  if (b) b.hidden = false;
}
function closeAbout(){
  const p = $('aboutPanel'), b = $('aboutBackdrop');
  if (p) p.hidden = true;
  if (b) b.hidden = true;
}
function bindAbout(){
  const btn = $('btnAbout'), close = $('btnAboutClose'), backdrop = $('aboutBackdrop');
  if (btn) btn.onclick = openAbout;
  if (close) close.onclick = closeAbout;
  if (backdrop) backdrop.onclick = closeAbout;
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape'){
      // About wins Escape if it is open; otherwise Escape leaves fullscreen. Native
      // fullscreen also exits on Escape via the browser itself — harmless, since
      // exitFullscreen() is idempotent and the change handler resyncs either way.
      const p = $('aboutPanel');
      if (p && !p.hidden) closeAbout();
      else if (isFullscreenActive()) exitFullscreen();
    }
    // F toggles fullscreen, matching the convention of basically every media app.
    if ((e.key === 'f' || e.key === 'F') && e.target.tagName !== 'INPUT'){ toggleFullscreen(); }
  });
}

/* ---------- Fullscreen ----------
   Uses the native Fullscreen API where available, and falls back to a CSS class that
   pins the well over the viewport. Both paths matter: iOS Safari on iPhone does not
   support requestFullscreen on arbitrary elements at all, so on the platform this is
   most useful the fallback IS the feature, not a degraded path.

   Two things are easy to get wrong here and both are handled explicitly:

   1. The canvas has a fixed backing-store size set by fitCanvases(). Entering
      fullscreen changes the CSS box but NOT the backing store, so without an explicit
      refit the canvas is simply scaled up — a blurry, stretched version of the small
      render rather than a genuinely larger view. fitCanvases() + drawAll() run on
      every transition, in both directions.

   2. Escape. Native fullscreen exits on Escape by the browser's own handling and
      fires fullscreenchange, so the sync handler below catches it. The CSS fallback
      has no such behaviour and needs the explicit keydown path. The About panel also
      binds Escape, so ordering is resolved deliberately: if the About dialog is open
      it takes Escape first (it is the more recently opened, more modal thing), and
      only otherwise does Escape exit fullscreen. */
function isFullscreenActive(){
  return !!(document.fullscreenElement || document.webkitFullscreenElement) ||
         !!(UI.cssFullscreen);
}

function syncFullscreenUI(){
  const wrap = $('wellWrap');
  const btn = $('btnFull');
  const native = !!(document.fullscreenElement || document.webkitFullscreenElement);
  if (wrap) wrap.classList.toggle('fs', !!UI.cssFullscreen);
  if (btn){
    const on = native || !!UI.cssFullscreen;
    btn.textContent = on ? '\u2715' : '\u26F6';
    btn.title = on ? 'Exit fullscreen (Esc)' : 'Fullscreen';
    btn.setAttribute('aria-pressed', String(on));
  }
  // Refit AFTER the layout change has been applied, or the canvas measures its old
  // box. rAF is enough here — the class/attribute change is synchronous, the reflow
  // it triggers is not.
  requestAnimationFrame(() => { fitCanvases(); drawAll(); });
}

function enterFullscreen(){
  const wrap = $('wellWrap');
  if (!wrap) return;
  const req = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
  if (req){
    try {
      const r = req.call(wrap);
      // Older implementations return undefined rather than a promise.
      if (r && typeof r.catch === 'function'){
        r.catch(() => { UI.cssFullscreen = true; syncFullscreenUI(); });
      }
      syncFullscreenUI();
      return;
    } catch(e){ /* fall through to the CSS path */ }
  }
  UI.cssFullscreen = true;
  syncFullscreenUI();
}

function exitFullscreen(){
  const ex = document.exitFullscreen || document.webkitExitFullscreen;
  if ((document.fullscreenElement || document.webkitFullscreenElement) && ex){
    try { const r = ex.call(document); if (r && typeof r.catch === 'function') r.catch(()=>{}); }
    catch(e){ /* ignore — the CSS path below still clears our own state */ }
  }
  UI.cssFullscreen = false;
  syncFullscreenUI();
}

function toggleFullscreen(){
  if (isFullscreenActive()) exitFullscreen(); else enterFullscreen();
}

function bindFullscreen(){
  const btn = $('btnFull');
  if (btn) btn.onclick = toggleFullscreen;
  // The browser can exit fullscreen without us (Escape, gesture, tab switch), so the
  // button state has to follow the DOM rather than our own bookkeeping.
  for (const ev of ['fullscreenchange','webkitfullscreenchange']){
    document.addEventListener(ev, () => { UI.cssFullscreen = false; syncFullscreenUI(); });
  }
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
    if (document.hidden && state.running){ setRunning(false, true); }
  });
}
