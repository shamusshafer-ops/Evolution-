/* Living World is the seeded free-for-all: every mechanism is enabled, while random
   environmental events remain reproducible and individually testable. */
let pass=0,fail=0;
const check=(n,c,d)=>{if(c)pass++;else{fail++;console.log('FAIL:',n,d||'');}};

for(const sc of ['temperate','wild','foodchain','armsrace','radiation','social']){
  initWorld({seed:'living-gate',scenario:sc});
  check(`automatic environment is OFF in ${sc}`,!state.cfg.stochasticEnvironment);
}

initWorld({seed:'living-gate',scenario:'livingworld'});
const everyFlag=['twoPatches','seasonal','stochasticEnvironment','predation','adaptations','dayNight',
  'learning','carnivory','advancedAdaptations','radiationAdaptations','socialEvolution'];
check('Living World enables every existing system',everyFlag.every(k=>!!state.cfg[k]));
check('every scenario-gated adaptation is enabled',
      ADAPTATIONS.every(a=>!a.enabledBy||state.cfg[a.enabledBy]));
check('founders still begin as one unadapted ancestral population',
      viableSpeciesCount()===1&&state.organisms.every(o=>ADAPT_KEYS.every(k=>!o.ad[k])));
check('the first event is scheduled inside the configured seeded interval',
      state.nextEnvironmentEvent>=LIVING_WORLD.minInterval&&state.nextEnvironmentEvent<=LIVING_WORLD.maxInterval);

/* --- every environmental event has a real, bounded effect --- */
initWorld({seed:'event-drought',scenario:'livingworld'});
check('automatic drought starts the existing reversible shock',
      applyLivingWorldEvent('drought')&&state.cfg.foodPerTick===SHOCKS_BY_ID.drought.patch.foodPerTick&&state.activeShocks.length===1);

initWorld({seed:'event-bloom',scenario:'livingworld'});
check('automatic bloom raises food production temporarily',
      applyLivingWorldEvent('bloom')&&state.cfg.foodPerTick===SHOCKS_BY_ID.bloom.patch.foodPerTick);

initWorld({seed:'event-dieoff',scenario:'livingworld'});
state.organisms=state.organisms.slice(0,100);
check('random die-off removes the configured moderate fraction, not the manual 70% shock',
      applyLivingWorldEvent('dieoff')&&state.organisms.length===80);

initWorld({seed:'event-turnover',scenario:'livingworld'});
const siteTypes=state.sites.map(s=>s.t);
applyLivingWorldEvent('turnover');
const changedSites=state.sites.filter((s,i)=>s.t!==siteTypes[i]).length;
check('resource turnover changes exactly the configured fraction of site niches',
      changedSites===Math.floor(state.sites.length*LIVING_WORLD.turnoverFraction));

initWorld({seed:'event-dispersal',scenario:'livingworld'});
const oldX=new Map(state.organisms.map(o=>[o.id,o.x]));
applyLivingWorldEvent('dispersal');
const moved=state.organisms.filter(o=>Math.abs(o.x-oldX.get(o.id))>1e-9).length;
check('dispersal moves exactly the configured population fraction across habitat',
      moved===Math.floor(state.organisms.length*LIVING_WORLD.dispersalFraction));
check('environment effects are recorded and queued for visible notification',
      state.environmentHistory.length===1&&state.events.some(e=>e.type==='environment'&&e.key==='dispersal'));

/* --- UI event path --- */
const toastHost={children:[],appendChild(el){this.children.push(el);}};
document.getElementById=id=>id==='toasts'?toastHost:null;
drainEvents();
check('draining an environment event produces an explanatory toast',
      toastHost.children.length===1&&toastHost.children[0].innerHTML.includes('Dispersal storm'));

/* --- seeded randomness is replayable --- */
function eventFingerprint(seed,ticks){
  initWorld({seed,scenario:'livingworld'});
  for(let i=0;i<ticks;i++)step();
  return state.environmentHistory.map(e=>`${e.tick}:${e.key}:${e.detail}`).join('|');
}
const fpA=eventFingerprint('living-repeat',7000);
const fpB=eventFingerprint('living-repeat',7000);
const fpC=eventFingerprint('living-other',7000);
check('the same seed reproduces the exact environmental history',fpA===fpB&&fpA.length>0);
check('a different seed produces a different environmental history',fpA!==fpC);
check('multiple kinds of environmental change occur in a typical watched run',
      new Set(fpA.split('|').map(x=>x.split(':')[1])).size>=2,fpA);

/* --- long-run free-for-all: viable, varied, and active rather than merely enabled --- */
function livingRun(seed,ticks){
  initWorld({seed,scenario:'livingworld'});
  for(let i=0;i<ticks&&state.organisms.length;i++)step();
  const learned=state.organisms.length
    ? state.organisms.reduce((s,o)=>s+(o.learned||0),0)/state.organisms.length : 0;
  return {tick:state.tick,pop:state.organisms.length,events:state.environmentHistory.length,
    eventTypes:new Set(state.environmentHistory.map(e=>e.key)).size,
    extant:ADAPT_KEYS.filter(k=>adaptFrequency(k)>0).length,peakSpecies:state.peakSpeciesSeen,
    kills:state.stats.predated,kin:state.stats.kinTransfers,flock:state.stats.flockTicks,
    care:state.stats.careEnergy,learned};
}
const livingRuns=['a','b','c'].map(s=>livingRun(s,30000));
console.log('living world @30k — '+livingRuns.map(r=>
  `pop ${r.pop}, events ${r.events}/${r.eventTypes} types, adaptations ${r.extant}/${ADAPT_KEYS.length}, species ${r.peakSpecies}`).join(' | '));
check('all long-run worlds remain viable through 30,000 ticks',livingRuns.every(r=>r.tick===30000&&r.pop>0));
check('every world experiences many events of all five kinds',livingRuns.every(r=>r.events>=15&&r.eventTypes===LIVING_WORLD.events.length));
check('every adaptation remains represented in every measured world',livingRuns.every(r=>r.extant===ADAPT_KEYS.length));
check('speciation emerges in every measured free-for-all',livingRuns.every(r=>r.peakSpecies>=2));
check('predation is active rather than merely configured',livingRuns.every(r=>r.kills>100));
check('social systems all execute in every world',livingRuns.every(r=>r.kin>100&&r.flock>1000&&r.care>1000));
check('learning acquires non-zero within-lifetime skill in every world',livingRuns.every(r=>r.learned>0));

console.log(`\n${pass}/${pass+fail} checks passed`);
if(fail)process.exit(1);
