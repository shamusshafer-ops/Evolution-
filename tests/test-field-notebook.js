/* R0 Field Notebook, organism inspection, and controlled comparison contracts. */
let pass=0,fail=0;const check=(name,condition)=>{condition?pass++:(fail++,console.log('FAIL:',name));};

initWorld({seed:'notebook',scenario:'temperate'});
check('a run begins with one durable baseline entry',
  state.notebook.length===1&&state.notebook[0].type==='start'&&state.notebook[0].tick===0);
check('the baseline carries population, species, and trait evidence',
  state.notebook[0].evidence.pop===LIFE.startPop&&state.notebook[0].evidence.species===1&&
  Number.isFinite(state.notebook[0].evidence.traits.speed.mean));
check('the notification queue remains empty at baseline',state.events.length===0);

const beforeNotebook=state.notebook.length;
triggerShock('cull');
check('a steward-triggered shock is retained as an intervention',
  state.notebook.length===beforeNotebook+1&&state.notebook.at(-1).type==='intervention');
check('a steward intervention does not create an unrelated toast',state.events.length===0);
check('the intervention snapshot records the reduced population',
  state.notebook.at(-1).evidence.pop===state.organisms.length);

initWorld({seed:'planet-log',scenario:'livingworld'});
const baselineCount=state.notebook.length;
applyLivingWorldEvent('dispersal');
check('an automatic planetary event enters both notebook and toast queue',
  state.notebook.length===baselineCount+1&&state.notebook.at(-1).type==='environment'&&
  state.events.some(e=>e.type==='environment'&&e.key==='dispersal'));

initWorld({seed:'costs',scenario:'wild'});
const inspected=state.organisms[0],cost=energyCostBreakdown(inspected);
check('energy breakdown components sum to the charged total',
  Math.abs(cost.total-(cost.basal+cost.travel+cost.sensory+cost.adaptations+cost.cognition))<1e-12);
check('inspector total is exactly metabolicCost()',Math.abs(cost.total-metabolicCost(inspected))<1e-12);
seedRng('inspection-rng');const expectedFirst=rnd(),expectedSecond=rnd();
seedRng('inspection-rng');const actualFirst=rnd();energyCostBreakdown(inspected);const actualSecond=rnd();
check('reading an energy breakdown consumes no RNG',actualFirst===expectedFirst&&actualSecond===expectedSecond);

const lineage=state.clades.find(c=>c.n>=5),representative=representativeOrganismForLineage(lineage.id);
check('lineage representative is a real living member',
  !!representative&&state.organisms.includes(representative)&&representative.clade===lineage.id);
check('selecting a lineage selects its real representative',selectLineage(lineage.id)===representative);
const renderedInspector=inspectorHtml(representative);
check('inspector explains costs, pedigree, phenotype, and learning',
  /Per-tick energy costs/.test(renderedInspector)&&/Parents/.test(renderedInspector)&&
  /Inherited phenotype/.test(renderedInspector)&&/not inherited/.test(renderedInspector));

const a=state.organisms[0],b=state.organisms[1];a.energy=b.energy=LIFE.reproduceAt+100;
const aChildren=a.offspring||0,bChildren=b.offspring||0;
reproduceSexual(a,b);
check('successful reproduction updates both parents lifetime output',
  a.offspring===aChildren+1&&b.offspring===bChildren+1);

const supporting={
  plains:{seed:'pair',tick:6000,speed:2.0,sense:25},
  oasis:{seed:'pair',tick:6000,speed:1.5,sense:34},
};
let assessment=comparisonAssessment(supporting);
check('matched seed and tick produce a valid comparison',assessment.valid===true);
check('the predicted opposing trait directions are recognized',
  assessment.supports===true&&assessment.speedDelta>0&&assessment.senseDelta>0);
assessment=comparisonAssessment({plains:supporting.plains,oasis:{...supporting.oasis,seed:'other'}});
check('different seeds are rejected as an unmatched comparison',
  assessment.valid===false&&/Seeds differ/.test(assessment.message));
assessment=comparisonAssessment({plains:supporting.plains,oasis:{...supporting.oasis,tick:7000}});
check('different ticks are rejected as an unmatched comparison',
  assessment.valid===false&&/Ticks differ/.test(assessment.message));

initWorld({seed:'capture',scenario:'plains'});
UI.comparisonRuns={plains:null,oasis:null};
check('comparison capture stays locked before a meaningful evolutionary interval',
  captureComparisonResult()===false);
state.tick=COMPARISON_TICK;
check('capturing a supported scenario stores its seed and tick',
  captureComparisonResult()===true&&UI.comparisonRuns.plains.seed==='capture'&&UI.comparisonRuns.plains.tick===COMPARISON_TICK);
initWorld({seed:'capture',scenario:'temperate'});
check('unrelated scenarios cannot be captured into this experiment',captureComparisonResult()===false);

initWorld({seed:'extinction-log',scenario:'temperate'});
const oldId=state.clades[0].id;state.organisms=[];sampleCensus();
const extinction=state.notebook.find(e=>e.type==='extinction'&&e.lineageId===oldId);
check('a disappeared viable lineage receives one explicit extinction record',!!extinction);
sampleCensus();
check('the same extinction is never logged twice',
  state.notebook.filter(e=>e.type==='extinction'&&e.lineageId===oldId).length===1);

console.log(`\n${pass}/${pass+fail} checks passed`);
if(fail)process.exit(1);
