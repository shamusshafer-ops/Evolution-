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
  initCard();
  fitCanvases();
  return true;
}

function fitCanvases(){
  if (!_well) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap: 3x DPR on phones triples fill cost
  for (const c of [_well, _ribbon, _census, _card].filter(Boolean)){
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

function hexToRgb(h){
  const n = parseInt(h.slice(1), 16);
  return [(n>>16)&255, (n>>8)&255, n&255];
}
/* Colour keys off the LINEAGE id (stable since M8), not population rank, so a clade
   keeps its colour for the whole run. */
function cladeColor(k){ return CLADE_COLORS[k % CLADE_COLORS.length]; }

/* ---------- Morphology ----------
   Draws an organism as the creature its traits describe, rather than as a coloured
   dot. Nothing here is invented decoration: every visual property maps to a trait
   that already drives the simulation, so what you see IS what is being selected.

     size      -> body radius (it already is one)
     speed     -> elongation along the heading, plus tail length. Fast-moving bodies
                  are streamlined in reality for the same reason they are here: drag.
     sense     -> eye radius, and eyes sit forward. Vision is expensive tissue, and
                  the cost term in METAB is sense^2, so big eyes should LOOK costly.
     diet      -> hue, interpolated between the two resource colours, so a specialist
                  visibly belongs to the resource it eats.
     armour    -> plated dorsal arc
     venom     -> barb at the tail
     nocturnal -> pale eyeshine ring

   Drawn in local space (origin at the organism, +x along heading) and transformed by
   the caller, so the same routine serves the tiny well markers and the large specimen
   card without a second implementation drifting out of sync with this one. */
function drawCreature(ctx, o, R, opts){
  opts = opts || {};
  const detail = opts.detail !== false;      // false for tiny well markers
  const tSpeed = (o.speed - TRAITS[0].min) / (TRAITS[0].max - TRAITS[0].min);
  const tSense = (o.sense - TRAITS[2].min) / (TRAITS[2].max - TRAITS[2].min);

  const elong = 1 + tSpeed * 0.95;           // streamlining
  const bodyW = R, bodyL = R * elong;
  const col = organismColor(o);

  ctx.save();

  // tail — longer and thinner with speed
  if (detail && tSpeed > 0.12){
    const tail = bodyL * (0.5 + tSpeed * 1.4);
    ctx.strokeStyle = col;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = Math.max(0.6, R * 0.22);
    ctx.beginPath();
    ctx.moveTo(-bodyL * 0.8, 0);
    ctx.quadraticCurveTo(-bodyL - tail * 0.5, R * 0.35, -bodyL - tail, 0);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // body
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.ellipse(0, 0, bodyL, bodyW, 0, 0, Math.PI * 2);
  ctx.fill();

  if (detail){
    // armour — a plated arc over the back
    if (o.ad && o.ad.armor){
      ctx.strokeStyle = ADAPT_BY_KEY.armor.color;
      ctx.lineWidth = Math.max(0.7, R * 0.30);
      ctx.beginPath();
      ctx.arc(0, 0, bodyW * 0.86, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }
    // venom — a barb at the tail tip
    if (o.ad && o.ad.venom){
      ctx.fillStyle = ADAPT_BY_KEY.venom.color;
      ctx.beginPath();
      ctx.moveTo(-bodyL * 1.0, 0);
      ctx.lineTo(-bodyL * 1.5, -R * 0.30);
      ctx.lineTo(-bodyL * 1.5,  R * 0.30);
      ctx.closePath();
      ctx.fill();
    }
    // eyes — forward-set, scaled by sense
    const eyeR = Math.max(0.5, R * (0.16 + tSense * 0.52));
    const eyeX = bodyL * 0.46, eyeY = bodyW * 0.42;
    ctx.fillStyle = PAL.well;
    for (const sy of [-1, 1]){
      ctx.beginPath(); ctx.arc(eyeX, eyeY * sy, eyeR, 0, Math.PI * 2); ctx.fill();
    }
    // nocturnal — eyeshine, the classic tapetum lucidum ring
    if (o.ad && o.ad.nocturnal){
      ctx.strokeStyle = ADAPT_BY_KEY.nocturnal.color;
      ctx.lineWidth = Math.max(0.4, eyeR * 0.42);
      for (const sy of [-1, 1]){
        ctx.beginPath(); ctx.arc(eyeX, eyeY * sy, eyeR * 1.15, 0, Math.PI * 2); ctx.stroke();
      }
    }
  }

  ctx.restore();
}

/* Hue carries DIET (which resource it eats) blended toward the clade colour, so a
   creature reads as both "what it eats" and "who it is related to". Diet is the
   stronger signal at a glance because it is what the body is actually adapted to. */
function organismColor(o){
  const base = hexToRgb(cladeColor(o.clade || 0));
  const t0 = hexToRgb((FOOD_TYPES[0] && FOOD_TYPES[0].color) || '#6FD3A2');
  const t1 = hexToRgb((FOOD_TYPES[1] && FOOD_TYPES[1].color) || '#C2A45E');
  const d = (o.diet == null) ? 0.5 : o.diet;
  const mix = (a, b, f) => Math.round(a + (b - a) * f);
  const dr = mix(t0[0], t1[0], d), dg = mix(t0[1], t1[1], d), db = mix(t0[2], t1[2], d);
  // 55% diet, 45% clade — enough clade signal to tell lineages apart in the well.
  return `rgb(${mix(dr, base[0], 0.45)},${mix(dg, base[1], 0.45)},${mix(db, base[2], 0.45)})`;
}

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
    ctx.globalAlpha = 0.30 + 0.70 * Math.min(1, o.energy / LIFE.reproduceAt);
    ctx.save();
    ctx.translate(X(o.x), Y(o.y));
    ctx.rotate(o.dir);
    // Detail is dropped below ~3px: eyes and barbs are sub-pixel there, so drawing
    // them costs fill operations for every organism every frame and returns nothing
    // visible. At 1400 organisms that is the difference between a smooth frame and a
    // stuttering one on a phone.
    drawCreature(ctx, o, r, { detail: r >= 3 });
    ctx.restore();
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

function drawAll(){ drawWell(); drawRibbon(); drawCensus(); drawSpecimenCard(); }

/* ---------- Specimen card ----------
   A large portrait of one lineage's current average form. This is where morphology
   earns its keep: at well scale a creature is a few pixels, but here 20,000 ticks of
   accumulated drift becomes something you can actually look at and compare against
   the same lineage twenty minutes earlier.

   Draws the clade MEAN, not a sampled individual — an individual would jitter frame
   to frame with whoever happened to be picked, which reads as noise rather than as
   the lineage changing. */
let _card = null, _cardCtx = null;

function initCard(){
  _card = document.getElementById('specimen');
  if (!_card) return false;
  _cardCtx = _card.getContext('2d');
  return true;
}

function meanOrganismOf(clade){
  // A synthetic organism carrying the clade's mean traits and its most common
  // adaptations. Not a real member — a portrait of the average.
  const o = { dir:0, energy:LIFE.reproduceAt, clade:clade.id, ad:{} };
  for (const t of TRAITS) o[t.key] = clade.traits[t.key];
  for (const a of ADAPTATIONS) o.ad[a.key] = cladeAdaptFrequency(clade.id, a.key) >= 0.5;
  return o;
}

function drawSpecimenCard(){
  if (!_cardCtx || !state) return;
  const ctx = _cardCtx, W = _card.width, H = _card.height;
  ctx.fillStyle = PAL.well; ctx.fillRect(0,0,W,H);

  const clades = (state.clades || []).filter(c => c.n >= 5);
  if (!clades.length){
    ctx.fillStyle = PAL.chalkDim;
    ctx.font = `500 ${Math.round(11*Math.min(2,window.devicePixelRatio||1))}px ui-monospace, Menlo, monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('no viable species', W/2, H/2);
    ctx.textAlign = 'left';
    return;
  }

  // Lay every lineage out side by side, so divergence is a visual comparison rather
  // than a table of numbers.
  const cols = Math.min(clades.length, 4);
  const cw = W / cols;
  const dpr = Math.min(2, window.devicePixelRatio || 1);

  for (let i = 0; i < cols; i++){
    const c = clades[i];
    const cx = cw * (i + 0.5);
    const cy = H * 0.46;
    // Scale so the largest possible body still fits the cell.
    const R = Math.min(cw * 0.20, H * 0.24) * (0.45 + 0.55 * (c.traits.size / TRAITS[1].max));

    ctx.save();
    ctx.translate(cx, cy);
    drawCreature(ctx, meanOrganismOf(c), R, { detail:true });
    ctx.restore();

    ctx.fillStyle = cladeColor(c.id);
    ctx.font = `700 ${Math.round(10.5*dpr)}px ui-monospace, Menlo, monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(cladeName(c.id), cx, H * 0.76);
    ctx.fillStyle = PAL.chalkDim;
    ctx.font = `500 ${Math.round(9*dpr)}px ui-monospace, Menlo, monospace`;
    ctx.fillText(`n=${c.n}`, cx, H * 0.86);
    ctx.textAlign = 'left';
  }
}
