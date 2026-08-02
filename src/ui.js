/* ============================================================================
   ui.js — DOM controls and readouts. Reads sim state; the only mutations it makes
   are the ones the player asked for (start/pause/reset/scenario/speed).
   ========================================================================== */

const UI = { els:{}, lastPaint:0, autoPaused:false, cssFullscreen:false,
  selectedOrganismId:null, selectedLineageId:null, selectedNotebookId:null,
  notebookSignature:'', comparisonRuns:{plains:null,oasis:null},
  batchComparison:null,batchRunning:false,batchError:'',followLineage:false };
const COMPARISON_TICK=6000;
const BATCH_REPLICATES=5;

function $(id){ return document.getElementById(id); }

function buildScenarioButtons(){
  const host = $('scenarios');
  if (!host) return;
  host.innerHTML = '';
  const groups=[
    ['Foundations',['temperate','plains','oasis','famine','glut','mono','seasonal']],
    ['Speciation',['archipelago','radiation']],
    ['Coevolution',['nocturne','wild','predation','foodchain','armsrace','social','baldwin']],
    ['Living worlds',['livingworld']],
  ];
  for(const [label,ids] of groups){
    const group=document.createElement('div');group.className='scenarioGroup';
    const head=document.createElement('div');head.className='scenarioGroupLabel';head.textContent=label;group.appendChild(head);
    const choices=document.createElement('div');choices.className='scenarioChoices';group.appendChild(choices);
    for(const id of ids){
      const sc=SCENARIOS.find(s=>s.id===id);if(!sc)continue;
      const b = document.createElement('button');
      b.className = 'chip' + (sc.id === state.scenario ? ' on' : '');
      b.textContent = sc.name;
      b.title = sc.blurb;
      b.setAttribute('aria-pressed', String(sc.id === state.scenario));
      b.onclick = () => restart({ scenario: sc.id, seed: $('seed').value.trim() || 'origin' });
      choices.appendChild(b);
    }
    host.appendChild(group);
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
          const prevalence = `${Math.round(f*100)}% of this clade`;
          const status = solid ? 'established' : 'spreading';
          const tip = `${a.name}: ${a.blurb} ${prevalence}; ${status}.`;
          glyphs += `<span class="adGlyph" tabindex="0" style="color:${a.color};opacity:${solid?1:0.55}" title="${a.name} — ${prevalence}" data-tip="${tip}" aria-label="${tip}">${a.glyph}</span>`;
        }
      }
    }
    html += `<button type="button" class="sprow speciesSelect${UI.selectedLineageId===c.id?' selected':''}" data-lineage="${c.id}" aria-label="Inspect ${cladeName(c.id)} lineage">` +
      `<span class="dot" style="background:${cladeColor(c.id)}"></span>` +
      `<span class="spname">${cladeName(c.id)}` +
        `<span class="spsub">spd ${c.traits.speed.toFixed(2)} \u00b7 sns ${c.traits.sense.toFixed(0)} \u00b7 sz ${c.traits.size.toFixed(2)}</span>` +
      '</span>' +
      `<span class="adGlyphs">${glyphs}</span>` +
      `<span class="spcount">${c.n}</span></button>`;
  }
  host.innerHTML = html;
  if(host.querySelectorAll)for(const row of host.querySelectorAll('.speciesSelect')){
    row.onclick=()=>selectLineage(Number(row.getAttribute('data-lineage')));
  }
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
    b.onclick = () => { triggerShock(sh.id); paintShocks(); paintNotebook(); };
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

function escHtml(value){
  return String(value==null?'':value).replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[ch]);
}

function selectOrganism(id){
  const o=organismById(Number(id));
  UI.selectedOrganismId=o?o.id:Number(id);
  if(o)UI.selectedLineageId=o.clade;
  if(o&&typeof focusWellOn==='function')focusWellOn(o.x,o.y,6);
  paintInspector();paintSpecies();
  if(typeof drawWell==='function')drawWell();if(typeof drawCensus==='function')drawCensus();
  return o;
}

function selectLineage(id){
  UI.selectedLineageId=Number(id);
  const o=representativeOrganismForLineage(UI.selectedLineageId);
  UI.selectedOrganismId=o?o.id:null;
  locateLineage(UI.selectedLineageId);
  paintInspector();paintSpecies();
  return o;
}

function locateLineage(id){
  const target=lineageMapTarget(Number(id));
  if(!target)return null;
  if(typeof focusWellOn==='function')focusWellOn(target.x,target.y,target.zoom);
  if(typeof drawWell==='function')drawWell();if(typeof drawCensus==='function')drawCensus();
  return target;
}

function stopLineageFollow(){
  if(!UI.followLineage)return false;
  UI.followLineage=false;paintInspector();return true;
}

function toggleLineageFollow(){
  if(UI.selectedLineageId==null||!lineageMapTarget(UI.selectedLineageId))return false;
  UI.followLineage=!UI.followLineage;
  if(UI.followLineage)locateLineage(UI.selectedLineageId);
  paintInspector();return UI.followLineage;
}

function inspectorHtml(o){
  if(!o)return '<p class="emptyState">Select a living species or specimen to inspect its real costs and history.</p>';
  const cost=energyCostBreakdown(o);
  const traitRows=TRAITS.map(t=>`<dt>${escHtml(t.label)}</dt><dd>${fmt(o[t.key],t.key==='sense'?1:2)}</dd>`).join('');
  const active=ADAPTATIONS.filter(a=>o.ad&&o.ad[a.key]).map(a=>a.name);
  const side=state.cfg.twoPatches?(o.homePatch===0?'west':'east'):'not divided';
  return `<div class="inspectHead"><span class="dot" style="background:${cladeColor(o.clade)}"></span>`+
    `<b>${escHtml(cladeName(o.clade))} #${o.id}</b><span>generation ${o.gen}</span></div>`+
    `<dl class="stats compact"><dt>Energy</dt><dd>${fmt(o.energy,1)}</dd><dt>Age</dt><dd>${o.age} ticks</dd>`+
    `<dt>Food eaten</dt><dd>${o.eaten||0}</dd><dt>Offspring</dt><dd>${o.offspring||0}</dd>`+
    `<dt>Escapes</dt><dd>${o.escapes||0}</dd><dt>Kills</dt><dd>${o.kills||0}</dd>`+
    `<dt>Birth patch</dt><dd>${side}</dd><dt>Parents</dt><dd>${o.parents&&o.parents.length?o.parents.join(' · '):'founder'}</dd></dl>`+
    `<h3>Per-tick energy costs</h3><dl class="stats compact"><dt>Basal</dt><dd>${fmt(cost.basal,3)}</dd>`+
    `<dt>Travel</dt><dd>${fmt(cost.travel,3)}</dd><dt>Sensory</dt><dd>${fmt(cost.sensory,3)}</dd>`+
    `<dt>Adaptations</dt><dd>${fmt(cost.adaptations,3)}</dd><dt>Cognition</dt><dd>${fmt(cost.cognition,3)}</dd>`+
    `<dt>Total</dt><dd>${fmt(cost.total,3)}</dd></dl><h3>Inherited phenotype</h3>`+
    `<dl class="stats compact">${traitRows}</dl><p class="inspectNote"><b>Adaptations:</b> ${active.length?escHtml(active.join(', ')):'none'}. `+
    `Learned escape skill ${fmt(o.learned||0,3)} is acquired within this lifetime and is not inherited.</p>`+
    `<div class="row"><button type="button" id="btnLocateLineage" class="chip">Locate lineage</button>`+
    `<button type="button" id="btnFollowLineage" class="chip${UI.followLineage?' on':''}" aria-pressed="${UI.followLineage}">${UI.followLineage?'Stop following':'Follow lineage'}</button></div>`;
}

function paintInspector(){
  const host=$('inspector');if(!host||!state)return;
  let o=UI.selectedOrganismId==null?null:organismById(UI.selectedOrganismId);
  if(!o&&UI.selectedLineageId!=null)o=representativeOrganismForLineage(UI.selectedLineageId);
  if(o){UI.selectedOrganismId=o.id;if(UI.followLineage){const target=lineageMapTarget(o.clade);if(target&&typeof focusWellOn==='function')focusWellOn(target.x,target.y,target.zoom);}}
  else UI.followLineage=false;
  host.innerHTML=inspectorHtml(o);
  const locate=$('btnLocateLineage'),follow=$('btnFollowLineage');
  if(locate)locate.onclick=()=>locateLineage(UI.selectedLineageId);
  if(follow)follow.onclick=toggleLineageFollow;
}

function notebookLabel(entry){
  if(entry.type==='start')return 'Baseline';
  if(entry.type==='intervention')return 'Steward action';
  if(entry.type==='environment')return 'Planet event';
  if(entry.type==='adaptation')return 'Innovation';
  if(entry.type==='speciation')return 'Lineage split';
  if(entry.type==='merge')return 'Lineage merge';
  if(entry.type==='extinction')return 'Extinction';
  return 'Observation';
}

function selectNotebookEntry(id){
  UI.selectedNotebookId=Number(id);
  const entry=(state.notebook||[]).find(e=>e.id===UI.selectedNotebookId);
  if(entry&&entry.lineageId!=null)selectLineage(entry.lineageId);
  paintNotebook();
  return entry;
}

function notebookEvidenceDelta(entry){
  const a=entry&&entry.evidence,b=entry&&entry.followup;if(!a||!b)return null;
  const traits={};
  for(const t of TRAITS){
    const av=a.traits&&a.traits[t.key],bv=b.traits&&b.traits[t.key];
    traits[t.key]=av&&bv?bv.mean-av.mean:null;
  }
  return {ticks:(b.tick||0)-(a.tick||0),pop:b.pop-a.pop,
    focalPop:a.focalPop==null||b.focalPop==null?null:b.focalPop-a.focalPop,
    food:b.food-a.food,species:b.species-a.species,generation:b.generation-a.generation,traits};
}

function signed(value,digits){
  if(value==null||!Number.isFinite(value))return '—';
  return `${value>0?'+':''}${value.toFixed(digits==null?0:digits)}`;
}

function notebookDetailHtml(entry){
  if(!entry)return '<p class="emptyState">Events and steward actions will accumulate here without disappearing.</p>';
  const ev=entry.evidence||{},traits=ev.traits||{};
  const traitSummary=TRAITS.slice(0,4).map(t=>`${t.label.toLowerCase()} ${fmt(traits[t.key]&&traits[t.key].mean,t.key==='sense'?1:2)}`).join(' · ');
  const focal=ev.focalPop==null?'':`<dt>Focal lineage</dt><dd>${ev.focalPop}</dd>`;
  let followup='';
  if(entry.followup){
    const after=entry.followup,delta=notebookEvidenceDelta(entry);
    const traitDelta=TRAITS.slice(0,4).map(t=>`${t.label.toLowerCase()} ${signed(delta.traits[t.key],t.key==='sense'?1:2)}`).join(' · ');
    followup=`<h3>Follow-up · tick ${Number(after.tick).toLocaleString()}</h3>`+
      `<dl class="stats compact"><dt>Population</dt><dd>${after.pop}</dd>${after.focalPop==null?'':`<dt>Focal lineage</dt><dd>${after.focalPop}</dd>`}`+
      `<dt>Species</dt><dd>${after.species}</dd><dt>Food</dt><dd>${after.food}</dd></dl>`+
      `<p class="evidenceLine">Observed over ${delta.ticks.toLocaleString()} ticks: population ${signed(delta.pop)}, `+
      `${delta.focalPop==null?'':`focal lineage ${signed(delta.focalPop)}, `}species ${signed(delta.species)}, food ${signed(delta.food)}; ${escHtml(traitDelta)}. `+
      `These are changes after the event, not proof that the event caused them.</p>`;
  }else if(entry.followupDue!=null){
    const remaining=Math.max(0,entry.followupDue-state.tick);
    followup=`<h3>Follow-up pending</h3><p class="evidenceLine">Scheduled at tick ${entry.followupDue.toLocaleString()} (${remaining.toLocaleString()} remaining). The later observation will show change without claiming causation.</p>`;
  }
  return `<div class="notebookDetailHead"><span class="eventKind">${escHtml(notebookLabel(entry))}</span><b>${escHtml(entry.name||entry.key||'Event')}</b></div>`+
    `<p>${escHtml(entry.message||'Recorded observation.')}</p>${entry.detail?`<p class="spsub">${escHtml(entry.detail)}</p>`:''}`+
    `<h3>Event snapshot</h3><dl class="stats compact"><dt>Tick</dt><dd>${Number(entry.tick||0).toLocaleString()}</dd><dt>Generation</dt><dd>${ev.generation==null?'—':ev.generation}</dd>`+
    `<dt>Population</dt><dd>${ev.pop==null?'—':ev.pop}</dd>${focal}<dt>Species</dt><dd>${ev.species==null?'—':ev.species}</dd>`+
    `<dt>Food</dt><dd>${ev.food==null?'—':ev.food}</dd></dl>`+
    `<p class="evidenceLine">Snapshot: ${escHtml(traitSummary)}.</p>${followup}`;
}

function paintNotebook(){
  const list=$('notebookList'),detail=$('notebookDetail');if(!list||!detail||!state)return;
  const entries=state.notebook||[];
  if(UI.selectedNotebookId==null&&entries.length)UI.selectedNotebookId=entries[entries.length-1].id;
  const signature=`${state.seed}|${entries.length}|${entries.filter(e=>e.followup).length}|${UI.selectedNotebookId}`;
  if(signature!==UI.notebookSignature){
    UI.notebookSignature=signature;
    list.innerHTML=entries.slice().reverse().map(e=>`<button type="button" class="notebookEntry${e.id===UI.selectedNotebookId?' selected':''}" data-entry="${e.id}">`+
      `<span class="notebookTick">${Number(e.tick||0).toLocaleString()}</span><span><b>${escHtml(e.name||e.key||'Event')}</b>`+
      `<small>${escHtml(notebookLabel(e))}${e.followup?' · follow-up ready':''}</small></span></button>`).join('');
    if(list.querySelectorAll)for(const b of list.querySelectorAll('.notebookEntry'))b.onclick=()=>selectNotebookEntry(Number(b.getAttribute('data-entry')));
  }
  detail.innerHTML=notebookDetailHtml(entries.find(e=>e.id===UI.selectedNotebookId)||entries[entries.length-1]);
}

function comparisonSnapshot(){
  if(!state||!['plains','oasis'].includes(state.scenario)||state.tick<COMPARISON_TICK)return null;
  return {scenario:state.scenario,seed:state.seed,tick:state.tick,pop:state.organisms.length,
    speed:traitStats('speed').mean,sense:traitStats('sense').mean};
}

function comparisonAssessment(runs){
  const p=runs&&runs.plains,o=runs&&runs.oasis;
  if(!p||!o)return {valid:false,message:'Capture both scenarios at the same tick with the same seed.'};
  if(p.seed!==o.seed)return {valid:false,message:'Seeds differ; this is not a paired comparison.'};
  if(p.tick!==o.tick)return {valid:false,message:'Ticks differ; capture both at the same evolutionary time.'};
  const supports=p.speed>o.speed&&o.sense>p.sense;
  return {valid:true,supports,speedDelta:p.speed-o.speed,senseDelta:o.sense-p.sense,
    message:supports?'This paired run supports the prediction.':'This paired run does not support the full prediction yet.'};
}

function sampleSummary(values){
  const xs=(values||[]).filter(Number.isFinite),n=xs.length;
  if(!n)return {n:0,mean:null,sd:null,dz:null};
  const mean=xs.reduce((a,b)=>a+b,0)/n;
  const sd=n>1?Math.sqrt(xs.reduce((s,x)=>s+(x-mean)*(x-mean),0)/(n-1)):null;
  return {n,mean,sd,dz:sd!=null&&sd>1e-12?mean/sd:null};
}

function batchComparisonAssessment(batch){
  const pairs=batch&&Array.isArray(batch.pairs)?batch.pairs:[];
  const valid=pairs.filter(p=>p.plains&&!p.plains.extinct&&p.oasis&&!p.oasis.extinct&&
    p.plains.seed===p.oasis.seed&&p.plains.tick===p.oasis.tick);
  const deltas=valid.map(p=>({seed:p.plains.seed,
    speed:p.plains.speed-p.oasis.speed,sense:p.oasis.sense-p.plains.sense}));
  const speed=sampleSummary(deltas.map(d=>d.speed)),sense=sampleSummary(deltas.map(d=>d.sense));
  const negativeSeeds=deltas.filter(d=>d.speed<=0||d.sense<=0).map(d=>d.seed);
  const missingSeeds=pairs.filter(p=>!p.plains||p.plains.extinct||!p.oasis||p.oasis.extinct||
    p.plains.seed!==p.oasis.seed||p.plains.tick!==p.oasis.tick)
    .map(p=>(p.plains&&p.plains.seed)||(p.oasis&&p.oasis.seed)||'unknown');
  const supports=valid.length>=2&&speed.mean>0&&sense.mean>0;
  let message='At least two complete paired seeds are required.';
  if(valid.length>=2&&supports&&negativeSeeds.length===0)message=`Mean effects and all ${valid.length} pairs support the prediction.`;
  else if(valid.length>=2&&supports)message=`Mean effects support the prediction, but ${negativeSeeds.length} pair${negativeSeeds.length===1?' does':'s do'} not show both directions.`;
  else if(valid.length>=2)message='The batch does not support the full two-trait prediction.';
  return {valid:valid.length>=2,supports,n:valid.length,speed,sense,negativeSeeds,missingSeeds,message};
}

function runBatchComparison(baseSeed,count){
  const n=Math.max(2,Math.min(20,Math.floor(count||BATCH_REPLICATES)));
  const root=String(baseSeed||'origin');
  const seeds=Array.from({length:n},(_,i)=>`${root}/pair-${i+1}`);
  const pairs=seeds.map(seed=>({
    plains:isolatedScenarioObservation('plains',seed,COMPARISON_TICK),
    oasis:isolatedScenarioObservation('oasis',seed,COMPARISON_TICK),
  }));
  return {experiment:'food-distribution',ruleset:VERSION,tick:COMPARISON_TICK,
    baseSeed:root,seeds,pairs};
}

function startBatchComparison(){
  if(UI.batchRunning)return false;
  const seed=($('seed')&&$('seed').value.trim())||(state&&state.seed)||'origin';
  UI.batchRunning=true;UI.batchError='';paintComparison();
  setTimeout(()=>{
    try{UI.batchComparison=runBatchComparison(seed,BATCH_REPLICATES);}
    catch(err){UI.batchError=err&&err.message?err.message:String(err);}
    finally{UI.batchRunning=false;paintComparison();}
  },20);
  return true;
}

function captureComparisonResult(){
  const snap=comparisonSnapshot();if(!snap)return false;
  UI.comparisonRuns[snap.scenario]=snap;paintComparison();return true;
}

function runComparisonScenario(scenario){
  if(!['plains','oasis'].includes(scenario))return false;
  const seed=($('seed')&&$('seed').value.trim())||state.seed||'origin';
  restart({scenario,seed});return true;
}

function paintComparison(){
  const host=$('comparisonResults'),capture=$('btnCaptureComparison'),batchBtn=$('btnBatchComparison');if(!host)return;
  const p=UI.comparisonRuns.plains,o=UI.comparisonRuns.oasis,a=comparisonAssessment(UI.comparisonRuns);
  if(capture)capture.disabled=!state||!['plains','oasis'].includes(state.scenario)||state.tick<COMPARISON_TICK;
  if(batchBtn){batchBtn.disabled=UI.batchRunning;batchBtn.textContent=UI.batchRunning?'Running 5 pairs…':'Run 5-seed batch';}
  const row=r=>r?`${escHtml(r.seed)} · tick ${r.tick.toLocaleString()} · speed ${fmt(r.speed,2)} · sense ${fmt(r.sense,1)}`:'not captured';
  let verdict=a.message;
  if(a.valid)verdict+=` Plains − Oasis speed ${a.speedDelta>=0?'+':''}${fmt(a.speedDelta,2)}; Oasis − Plains sense ${a.senseDelta>=0?'+':''}${fmt(a.senseDelta,1)}.`;
  const wait=state&&['plains','oasis'].includes(state.scenario)&&state.tick<COMPARISON_TICK?` Capture unlocks at tick ${COMPARISON_TICK.toLocaleString()} (${(COMPARISON_TICK-state.tick).toLocaleString()} remaining).`:'';
  let batchHtml='';
  if(UI.batchRunning)batchHtml='<div class="batchResults"><b>Batch running…</b><p>Five paired seeds, ten temporary worlds. Your live world and RNG will be restored exactly.</p></div>';
  else if(UI.batchError)batchHtml=`<div class="batchResults"><b>Batch failed</b><p>${escHtml(UI.batchError)}</p></div>`;
  else if(UI.batchComparison){
    const b=UI.batchComparison,ba=batchComparisonAssessment(b);
    const stat=s=>s.n?`${s.mean>=0?'+':''}${fmt(s.mean,2)} ± ${fmt(s.sd,2)} SD; paired dz ${s.dz==null?'—':fmt(s.dz,2)}`:'—';
    const exceptions=ba.negativeSeeds.length?` Exceptions: ${ba.negativeSeeds.join(', ')}.`:' No directional exceptions.';
    const missing=ba.missingSeeds.length?` Incomplete/extinct pairs: ${ba.missingSeeds.join(', ')}.`:'';
    batchHtml=`<div class="batchResults"><b>${ba.n}/${b.seeds.length} complete pairs · ruleset ${escHtml(b.ruleset)} · tick ${b.tick.toLocaleString()}</b>`+
      `<p>Plains − Oasis speed: ${escHtml(stat(ba.speed))}</p><p>Oasis − Plains sense: ${escHtml(stat(ba.sense))}</p>`+
      `<p class="comparisonVerdict">${escHtml(ba.message+exceptions+missing)} dz standardizes each paired mean by its between-seed SD. Paired seeds align the starts, but treatment-specific random draws can later diverge; five pairs show repeatability, not an exact counterfactual or universal proof.</p>`+
      `<p class="seedList"><b>Seeds:</b> ${escHtml(b.seeds.join(', '))}</p></div>`;
  }
  host.innerHTML=`<div class="singleComparison"><p><b>Plains:</b> ${row(p)}</p><p><b>Oasis:</b> ${row(o)}</p><p class="comparisonVerdict">${escHtml(verdict)} One seed is descriptive; repeat across seeds before making a causal claim.${escHtml(wait)}</p></div>${batchHtml}`;
}

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
    else if (ev.type === 'adaptation') showAdaptationToast(ev);
    else if (ev.type === 'environment') showEnvironmentToast(ev);
  }
}

function showEnvironmentToast(ev){
  const host=$('toasts'); if(!host)return;
  const el=document.createElement('div');
  el.className='toast environment'; el.style.borderColor=ev.color||PAL.sense;
  el.innerHTML=`<b style="color:${ev.color||PAL.sense}">${ev.name}</b> — ${ev.message||'the environment changed.'}${ev.detail?` <span class="spsub">${ev.detail}</span>`:''}`;
  host.appendChild(el);
  setTimeout(()=>{if(el.parentNode)el.parentNode.removeChild(el);},5100);
}

function showAdaptationToast(ev){
  const host = $('toasts');
  if (!host) return;
  const el = document.createElement('div');
  el.className = 'toast adaptation';
  el.style.borderColor = ev.color || PAL.food;
  el.innerHTML = `<b style="color:${ev.color||PAL.food}">${ev.glyph||''} ${ev.name} evolved</b> — the ${ev.lineage||'population'} lineage ${ev.message||'has a new heritable adaptation.'}`;
  host.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 5100);
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
  set('statPhase', environmentPhase(state.tick,state.cfg));
  set('statBorn', state.stats.born.toLocaleString());
  set('statDied', (state.stats.starved + state.stats.aged).toLocaleString());

  for (const t of TRAITS){
    const s = traitStats(t.key);
    const el = $('val-' + t.key);
    if (el) el.textContent = `${fmt(s.mean, t.key==='sense'?1:2)} ±${fmt(s.sd, t.key==='sense'?1:2)}`;
  }

  paintSpecies();
  paintShocks();
  paintInspector();
  paintNotebook();
  paintComparison();

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
  for (const id of ['btnRun','btnViewRun']){
    const b = $(id);
    if (b){
      b.textContent = on ? 'Pause' : 'Run';
      b.title = on ? 'Pause simulation (Space)' : 'Resume simulation (Space)';
      b.setAttribute('aria-pressed', String(on));
    }
  }
}

function restart(opts){
  opts = opts || {};
  const seed = opts.seed != null ? opts.seed : (($('seed') && $('seed').value.trim()) || 'origin');
  const scenario = opts.scenario || state.scenario;
  const wasRunning = state ? state.running : true;
  initWorld({ seed, scenario });
  UI.selectedOrganismId=null; UI.selectedLineageId=null; UI.selectedNotebookId=null;
  UI.notebookSignature='';UI.followLineage=false;
  const toastHost = $('toasts');
  if (toastHost) toastHost.innerHTML = '';   // a toast from the old run mid-animation would otherwise linger, naming a species that no longer exists
  if ($('seed')) $('seed').value = seed;
  resetWellView();
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
function blocksGlobalShortcut(e){
  const target=e&&e.target,tag=(target&&target.tagName||'').toUpperCase();
  return !!(e.defaultPrevented||e.repeat||e.altKey||e.ctrlKey||e.metaKey||
    (target&&target.isContentEditable)||['INPUT','SELECT','TEXTAREA','BUTTON'].includes(tag));
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
    if ((e.key === 'f' || e.key === 'F') && !blocksGlobalShortcut(e)){ toggleFullscreen(); }
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

/* ---------- Well navigation ----------
   Pointer events cover mouse, pen, and touch with one path. One pointer pans; in 3D
   a right-drag or Q/E rotates the oblique camera. Two pointers pan, pinch, and twist
   around their shared midpoint. Wheel/buttons/keys call the same camera helpers, so embedded
   and fullscreen behaviour cannot drift apart. */
function bindWellNavigation(){
  const well = $('well');
  if (!well) return;
  const pointers = new Map();
  const point = e => ({ x:e.clientX, y:e.clientY, button:e.button });
  const pairMetrics = values => {
    const p = Array.from(values).slice(0,2);
    return { x:(p[0].x+p[1].x)/2, y:(p[0].y+p[1].y)/2,
             d:Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y),
             a:Math.atan2(p[1].y-p[0].y,p[1].x-p[0].x) };
  };
  const repaint = () => { drawWell(); };

  well.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0 && !(_use3D&&e.button===2)) return;
    stopLineageFollow();
    pointers.set(e.pointerId, point(e));
    if (well.setPointerCapture) well.setPointerCapture(e.pointerId);
    well.classList.add('dragging');
    e.preventDefault();
  });
  well.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    const before = pointers.size >= 2 ? pairMetrics(pointers.values()) : null;
    const old = pointers.get(e.pointerId);
    const moved=point(e);moved.button=old.button;
    pointers.set(e.pointerId,moved);
    if (pointers.size >= 2){
      const after = pairMetrics(pointers.values());
      panWellBy(after.x-before.x, after.y-before.y);
      if (before.d > 0) zoomWellAt(after.d/before.d, after.x, after.y);
      if(_use3D&&typeof rotateThreeWorldBy==='function'){
        const turn=Math.atan2(Math.sin(after.a-before.a),Math.cos(after.a-before.a));
        if(Math.abs(turn)>0.002)rotateThreeWorldBy(turn*180,0);
      }
    } else {
      if(_use3D&&old.button===2&&typeof rotateThreeWorldBy==='function')rotateThreeWorldBy(e.clientX-old.x,e.clientY-old.y);
      else panWellBy(e.clientX-old.x, e.clientY-old.y);
    }
    repaint();
    e.preventDefault();
  });
  const endPointer = e => {
    pointers.delete(e.pointerId);
    if (!pointers.size) well.classList.remove('dragging');
  };
  well.addEventListener('pointerup', endPointer);
  well.addEventListener('pointercancel', endPointer);
  well.addEventListener('contextmenu',e=>{if(_use3D)e.preventDefault();});
  well.addEventListener('wheel', e => {
    stopLineageFollow();
    zoomWellAt(Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY);
    repaint(); e.preventDefault();
  }, { passive:false });
  well.addEventListener('dblclick', () => { stopLineageFollow();resetWellView(); repaint(); });
  well.addEventListener('keydown', e => {
    const pan = 36;
    if (e.key === 'ArrowLeft') panWellBy(pan,0);
    else if (e.key === 'ArrowRight') panWellBy(-pan,0);
    else if (e.key === 'ArrowUp') panWellBy(0,pan);
    else if (e.key === 'ArrowDown') panWellBy(0,-pan);
    else if (e.key === '+' || e.key === '=') zoomWellAt(1.35);
    else if (e.key === '-' || e.key === '_') zoomWellAt(1/1.35);
    else if (_use3D&&(e.key==='q'||e.key==='Q')&&typeof rotateThreeWorldBy==='function') rotateThreeWorldBy(-26,0);
    else if (_use3D&&(e.key==='e'||e.key==='E')&&typeof rotateThreeWorldBy==='function') rotateThreeWorldBy(26,0);
    else if (e.key === '0') resetWellView();
    else return;
    stopLineageFollow();repaint(); e.preventDefault();
  });

  const viewRun = $('btnViewRun');
  if (viewRun) viewRun.onclick = () => setRunning(!state.running);
  const zoomIn = $('btnZoomIn');
  if (zoomIn) zoomIn.onclick = () => { stopLineageFollow();zoomWellAt(1.35); repaint(); };
  const zoomOut = $('btnZoomOut');
  if (zoomOut) zoomOut.onclick = () => { stopLineageFollow();zoomWellAt(1/1.35); repaint(); };
  const reset = $('btnViewReset');
  if (reset) reset.onclick = () => { stopLineageFollow();resetWellView(); repaint(); };
}

function bindUI(){
  UI.els.run = $('btnRun');
  if (UI.els.run) UI.els.run.onclick = () => setRunning(!state.running);
  bindWellNavigation();

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

  const plains = $('btnExperimentPlains');
  if (plains) plains.onclick = () => runComparisonScenario('plains');
  const oasis = $('btnExperimentOasis');
  if (oasis) oasis.onclick = () => runComparisonScenario('oasis');
  const capture = $('btnCaptureComparison');
  if (capture) capture.onclick = captureComparisonResult;
  const batch = $('btnBatchComparison');
  if (batch) batch.onclick = startBatchComparison;

  window.addEventListener('resize', () => { fitCanvases(); drawAll(); });

  // Space toggles run — the control you reach for most, on the key nearest the thumb.
  document.addEventListener('keydown', e => {
    if (blocksGlobalShortcut(e)) return;
    if (e.code === 'Space'){ e.preventDefault(); setRunning(!state.running); }
    if (e.key === 'r' || e.key === 'R') restart({});
  });

  // A simulation left running in a background tab burns battery for nothing.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.running){ setRunning(false, true); }
  });
}
