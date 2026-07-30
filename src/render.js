/* ============================================================================
   render.js — canvas drawing. Reads state, never mutates it.
   Two surfaces: the specimen well (the world) and the drift ribbon (the signature).
   ========================================================================== */

let _well = null, _wellCtx = null, _ribbon = null, _ribbonCtx = null;
let _view = { scale:1, ox:0, oy:0 };

function initRender(){
  _well   = document.getElementById('well');
  _ribbon = document.getElementById('ribbon');
  if (!_well || !_ribbon) return false;
  _wellCtx   = _well.getContext('2d');
  _ribbonCtx = _ribbon.getContext('2d');
  initCensus();
  fitCanvases();
  return true;
}

function fitCanvases(){
  if (!_well) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap: 3x DPR on phones triples fill cost
  for (const c of [_well, _ribbon, _census].filter(Boolean)){
    const r = c.getBoundingClientRect();
    c.width  = Math.max(1, Math.round(r.width  * dpr));
    c.height = Math.max(1, Math.round(r.height * dpr));
  }
  const cfg = state ? state.cfg : WORLD;
  const s = Math.min(_well.width / cfg.w, _well.height / cfg.h);
  _view.scale = s;
  _view.ox = (_well.width  - cfg.w * s) / 2;
  _view.oy = (_well.height - cfg.h * s) / 2;
}

/* An organism's hue is its emergent CLADE, assigned by size rank. Because species are
   derived rather than declared, the colour of a given lineage can change between
   samples if the size ordering changes — accepted deliberately: a stable colour would
   require stable identity, which is exactly the thing this model refuses to assume. */
function hexToRgb(h){
  const n = parseInt(h.slice(1), 16);
  return [(n>>16)&255, (n>>8)&255, n&255];
}
function cladeColor(k){ return CLADE_COLORS[k % CLADE_COLORS.length]; }
function organismColor(o){ return cladeColor(o.clade || 0); }

function drawWell(){
  if (!_wellCtx || !state) return;
  const ctx = _wellCtx, cfg = state.cfg, s = _view.scale;
  const X = x => _view.ox + x * s;
  const Y = y => _view.oy + y * s;

  ctx.fillStyle = PAL.well;
  ctx.fillRect(0, 0, _well.width, _well.height);

  // culture medium
  ctx.fillStyle = PAL.medium;
  ctx.fillRect(X(0), Y(0), cfg.w*s, cfg.h*s);

  // resource sites — faint haloes marking ground worth returning to
  if (state.sites && cfg.clumped){
    const rr = (cfg.clumpRadius || 30) * s;
    for (const st of state.sites){
      const g = ctx.createRadialGradient(X(st.x), Y(st.y), 0, X(st.x), Y(st.y), rr);
      const st_t = FOOD_TYPES[st.t || 0] || FOOD_TYPES[0];
      const rgb = hexToRgb(st_t.color);
      g.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.085)`);
      g.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(X(st.x), Y(st.y), rr, 0, Math.PI*2); ctx.fill();
    }
  }

  // food, coloured by resource type so partitioning is visible in the well itself:
  // two specialists foraging different ground is the shape this slice produces.
  const fr = Math.max(1.1, 2.0 * s);
  for (const f of state.food){
    const ft = FOOD_TYPES[f.t || 0] || FOOD_TYPES[0];
    ctx.fillStyle = ft.color;
    ctx.beginPath(); ctx.arc(X(f.x), Y(f.y), fr, 0, Math.PI*2); ctx.fill();
  }

  // organisms
  for (const o of state.organisms){
    const r = Math.max(1.6, o.size * 3.4 * s);
    ctx.fillStyle = organismColor(o);
    ctx.globalAlpha = 0.30 + 0.70 * Math.min(1, o.energy / LIFE.reproduceAt);
    ctx.beginPath(); ctx.arc(X(o.x), Y(o.y), r, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // frame
  ctx.strokeStyle = PAL.rule; ctx.lineWidth = 1;
  ctx.strokeRect(X(0)+0.5, Y(0)+0.5, cfg.w*s-1, cfg.h*s-1);
}

/* ---------- The drift ribbon ----------
   The signature element. Each trait gets a horizontal band; within a band, time
   runs left to right and the population's distribution for that trait is drawn as
   a vertical density column per sample. Watching the bright core of a band migrate
   upward over a few hundred generations IS natural selection, made visible. A mean
   line alone would hide the variance the process actually acts on. */
function drawRibbon(){
  if (!_ribbonCtx || !state) return;
  const ctx = _ribbonCtx;
  const W = _ribbon.width, H = _ribbon.height;
  ctx.fillStyle = PAL.well; ctx.fillRect(0,0,W,H);

  const bands = TRAITS.length;
  const pad = 3;
  const bh = (H - pad*(bands+1)) / bands;
  const hist = state.ribbon || [];
  const cols = Math.max(1, hist.length);
  const cw = W / Math.max(cols, 120);

  TRAITS.forEach((t, bi) => {
    const top = pad + bi*(bh+pad);

    ctx.fillStyle = PAL.medium;
    ctx.fillRect(0, top, W, bh);

    for (let c = 0; c < hist.length; c++){
      const bins = hist[c][t.key];
      if (!bins) continue;
      let peak = 1;
      for (const v of bins) if (v > peak) peak = v;
      const nb = bins.length;
      const x = c * cw;
      for (let b = 0; b < nb; b++){
        const v = bins[b] / peak;
        if (v <= 0.012) continue;
        const y = top + bh - ((b+1)/nb)*bh;
        ctx.globalAlpha = Math.min(1, 0.10 + v*0.95);
        ctx.fillStyle = t.color;
        ctx.fillRect(x, y, Math.max(1, cw+0.6), Math.max(1, bh/nb + 0.6));
      }
    }
    ctx.globalAlpha = 1;

    // label + current mean
    const st = traitStats(t.key);
    ctx.fillStyle = PAL.chalkDim;
    ctx.font = `600 ${Math.round(9.5*Math.min(2,window.devicePixelRatio||1))}px ui-monospace, Menlo, monospace`;
    ctx.textBaseline = 'top';
    ctx.fillText(t.label.toUpperCase(), 6, top + 4);
    ctx.fillStyle = t.color;
    ctx.textAlign = 'right';
    ctx.fillText(st.mean.toFixed(t.key==='sense'?1:2), W - 6, top + 4);
    ctx.textAlign = 'left';

    ctx.strokeStyle = PAL.rule; ctx.lineWidth = 1;
    ctx.strokeRect(0.5, top+0.5, W-1, bh-1);
  });
}



/* ---------- The census strip ----------
   Stacked absolute population by species over time. This is where competitive
   exclusion is legible as a shape: one band swelling while another is pinched to
   nothing. Absolute counts rather than shares, so a total collapse reads
   differently from a species merely losing ground — with shares, a population
   crashing from 900 to 9 while still holding 60% would look like it was winning. */
let _census = null, _censusCtx = null;

function initCensus(){
  _census = document.getElementById('census');
  if (!_census) return false;
  _censusCtx = _census.getContext('2d');
  return true;
}

function drawCensus(){
  if (!_censusCtx || !state) return;
  const ctx = _censusCtx, W = _census.width, H = _census.height;
  ctx.fillStyle = PAL.well; ctx.fillRect(0,0,W,H);
  ctx.fillStyle = PAL.medium; ctx.fillRect(0,0,W,H);

  const hist = state.census || [];
  if (!hist.length){ return; }

  let peak = 1;
  for (const s of hist){
    let tot = 0;
    for (const v of (s.clades||[])) tot += v;
    if (tot > peak) peak = tot;
  }

  const cw = W / Math.max(hist.length, 120);
  for (let i = 0; i < hist.length; i++){
    const s = hist[i];
    let acc = 0;
    const sizes = s.clades || [];
    for (let id = 0; id < sizes.length; id++){
      const v = sizes[id];
      if (v <= 0){ continue; }
      const h0 = (acc / peak) * H;
      const h1 = ((acc + v) / peak) * H;
      ctx.fillStyle = cladeColor(Number(id));
      ctx.fillRect(i*cw, H - h1, Math.max(1, cw + 0.6), Math.max(1, h1 - h0));
      acc += v;
    }
  }

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  ctx.font = `600 ${Math.round(9.5*dpr)}px ui-monospace, Menlo, monospace`;
  ctx.textBaseline = 'top';
  ctx.fillStyle = PAL.chalkDim;
  ctx.fillText('CENSUS \u00b7 ' + ((hist[hist.length-1]||{}).nClades || 0) + ' SPECIES', 6, 4);
  ctx.textAlign = 'right';
  ctx.fillText('peak ' + peak, W - 6, 4);
  ctx.textAlign = 'left';

  ctx.strokeStyle = PAL.rule; ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, W-1, H-1);
}

function drawAll(){ drawWell(); drawRibbon(); drawCensus(); }
