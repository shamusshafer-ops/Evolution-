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

const summary=sampleSummary([1,2,3]);
check('batch summaries report their replicate count and paired mean',summary.n===3&&summary.mean===2);
check('batch variability uses sample standard deviation',Math.abs(summary.sd-1)<1e-12);
check('paired dz standardizes the mean by between-seed variation',Math.abs(summary.dz-2)<1e-12);
check('an empty summary remains explicitly unavailable',sampleSummary([]).mean===null);

const syntheticBatch={pairs:[
  {plains:{seed:'a',tick:6000,speed:3,sense:20},oasis:{seed:'a',tick:6000,speed:1,sense:23}},
  {plains:{seed:'b',tick:6000,speed:2,sense:21},oasis:{seed:'b',tick:6000,speed:1,sense:23}},
  {plains:{seed:'c',tick:6000,speed:1,sense:20},oasis:{seed:'c',tick:6000,speed:1.5,sense:21}},
]};
const batchAssessment=batchComparisonAssessment(syntheticBatch);
check('batch assessment recognizes positive paired mean effects',batchAssessment.valid&&batchAssessment.supports);
check('batch assessment retains every complete replicate',batchAssessment.n===3);
check('a contrary pair is reported rather than averaged out',
  batchAssessment.negativeSeeds.length===1&&batchAssessment.negativeSeeds[0]==='c');
const incomplete=batchComparisonAssessment({pairs:[{plains:syntheticBatch.pairs[0].plains,oasis:null}]});
check('incomplete batch pairs are excluded and named',!incomplete.valid&&incomplete.missingSeeds[0]==='a');

initWorld({seed:'live-preservation',scenario:'temperate'});for(let i=0;i<7;i++)step();
const liveState=state,liveTick=state.tick;
seedRng('isolated-rng');const isolatedFirst=rnd(),isolatedExpectedSecond=rnd();
seedRng('isolated-rng');const isolatedActualFirst=rnd();
const isolated=isolatedScenarioObservation('plains','isolated-observation',30);
const isolatedActualSecond=rnd();
check('an isolated observation carries scenario, ruleset, and exact tick metadata',
  isolated.scenario==='plains'&&isolated.ruleset===VERSION&&isolated.tick===30);
check('an isolated observation returns finite population trait measurements',
  isolated.pop>0&&Number.isFinite(isolated.speed)&&Number.isFinite(isolated.sense));
check('an isolated observation restores the exact live world object and tick',state===liveState&&state.tick===liveTick);
check('an isolated observation restores both RNG channels exactly',
  isolatedActualFirst===isolatedFirst&&isolatedActualSecond===isolatedExpectedSecond);
const isolatedAgain=isolatedScenarioObservation('plains','isolated-observation',30);
check('isolated observations are deterministic',
  isolatedAgain.pop===isolated.pop&&isolatedAgain.speed===isolated.speed&&isolatedAgain.sense===isolated.sense);

const actualBatch=runBatchComparison('batch-contract',2),actualAssessment=batchComparisonAssessment(actualBatch);
check('the batch stores ruleset, observation time, and its exact seed list',
  actualBatch.ruleset===VERSION&&actualBatch.tick===COMPARISON_TICK&&actualBatch.seeds.length===2);
check('every batch member is a same-seed same-tick pair',actualBatch.pairs.every(p=>
  p.plains.seed===p.oasis.seed&&p.plains.tick===COMPARISON_TICK&&p.oasis.tick===COMPARISON_TICK));
check('actual batch analysis reports all complete pairs without requiring a positive result',
  actualAssessment.valid&&actualAssessment.n===2&&actualAssessment.speed.n===2&&actualAssessment.sense.n===2);
check('running the full batch also restores the live world',state===liveState&&state.tick===liveTick);

initWorld({seed:'lineage-map',scenario:'temperate'});
for(let i=0;i<240;i++)step();
check('ribbon columns retain exact aligned tick metadata',
  state.ribbonTicks.length===state.ribbon.length&&state.ribbonTicks.at(-1)===240);
check('census rows retain stable lineage ids alongside compatibility counts',
  state.census.at(-1).lineages.length===state.census.at(-1).clades.length&&
  state.census.at(-1).lineages[0].id===state.clades[0].id);
const mapLineage=state.clades[0].id,mapMembers=state.organisms.filter(o=>o.clade===mapLineage);
mapMembers[0].x=2;mapMembers[1].x=state.cfg.w-2;
for(let i=2;i<mapMembers.length;i++)mapMembers[i].x=1;
const mapTarget=lineageMapTarget(mapLineage);
check('lineage map target includes the living lineage and a bounded useful zoom',
  mapTarget.n===mapMembers.length&&mapTarget.zoom>=1&&mapTarget.zoom<=8);
check('wrapped lineage focus stays near a population crossing the map edge',
  mapTarget.x<state.cfg.w*.1||mapTarget.x>state.cfg.w*.9);
const mapA=mapMembers[0],mapB=mapMembers[1];mapA.energy=mapB.energy=LIFE.reproduceAt+100;
const mappedChild=reproduceSexual(mapA,mapB);
check('new descendants retain their display lineage between coarse censuses',mappedChild.clade===mapLineage);
UI.selectedLineageId=mapLineage;UI.followLineage=false;
check('lineage follow can be enabled for a living selected lineage',toggleLineageFollow()===true&&UI.followLineage);
check('manual-navigation cancellation stops lineage follow',stopLineageFollow()===true&&!UI.followLineage);

initWorld({seed:'followup-window',scenario:'seasonal'});triggerShock('drought');
const pendingEvent=state.notebook.at(-1);
check('non-baseline events schedule a fixed evidence follow-up',
  pendingEvent.followupDue===pendingEvent.tick+NOTEBOOK.followupTicks&&!pendingEvent.followup);
check('pending Notebook detail names the future observation without claiming causation',
  /Follow-up pending/.test(notebookDetailHtml(pendingEvent))&&/without claiming causation/.test(notebookDetailHtml(pendingEvent)));
for(let i=0;i<NOTEBOOK.followupTicks-1;i++)step();
check('follow-up evidence does not resolve early',!pendingEvent.followup);
step();
check('follow-up evidence resolves on the first sample at or after its due tick',
  pendingEvent.followup&&pendingEvent.followup.tick===NOTEBOOK.followupTicks);
const observedDelta=notebookEvidenceDelta(pendingEvent);
check('the evidence window reports signed population, food, species, and trait changes',
  observedDelta&&Number.isFinite(observedDelta.pop)&&Number.isFinite(observedDelta.food)&&
  Number.isFinite(observedDelta.species)&&Number.isFinite(observedDelta.traits.speed));
check('completed Notebook detail labels changes as observation rather than cause',
  /Follow-up · tick/.test(notebookDetailHtml(pendingEvent))&&/not proof that the event caused them/.test(notebookDetailHtml(pendingEvent)));

initWorld({seed:'focal-followup',scenario:'temperate'});
const focalId=state.clades[0].id,focalEvent=recordNotebookEvent({type:'observation',lineageId:focalId,name:'Focal check'});
check('lineage-linked evidence records focal and global populations separately',
  focalEvent.evidence.focalPop===state.organisms.filter(o=>o.clade===focalId).length&&focalEvent.evidence.pop===state.organisms.length);
focalEvent.followupDue=state.tick;
seedRng('followup-rng');const followupFirst=rnd(),followupExpectedSecond=rnd();
seedRng('followup-rng');const followupActualFirst=rnd();updateNotebookFollowups();const followupActualSecond=rnd();
check('resolving a follow-up consumes no simulation RNG',
  followupActualFirst===followupFirst&&followupActualSecond===followupExpectedSecond);
check('the baseline remains a reference rather than scheduling a follow-up',
  state.notebook[0].type==='start'&&state.notebook[0].followupDue==null);

console.log(`\n${pass}/${pass+fail} checks passed`);
if(fail)process.exit(1);
