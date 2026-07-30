/* Selection: the sim's actual thesis.
   Identical founding stock must converge somewhere DIFFERENT under different
   pressure. If these pass, the model earns its existence; if they fail, it is an
   expensive random walk. Each result averages 3 seeds so we read selection rather
   than one lucky lineage. */
let pass=0, fail=0;
const check=(n,c,detail)=>{ if(c) pass++; else { fail++; console.log('FAIL:', n, detail||''); } };

function run(scenario, seed, ticks){
  initWorld({ seed, scenario });
  for(let i=0;i<ticks;i++) step();
  if(!state.organisms.length) return null;
  const o = { pop: state.organisms.length };
  for(const t of TRAITS) o[t.key] = traitStats(t.key).mean;
  return o;
}
function avg(scenario, ticks){
  const rs = ['s1','s2','s3'].map(s => run(scenario, s, ticks)).filter(Boolean);
  if(!rs.length) return null;
  const o = { speed:0, size:0, sense:0, pop:0, seeds:rs.length };
  for(const r of rs) for(const k of ['speed','size','sense','pop']) o[k] += r[k]/rs.length;
  return o;
}

const T = 6000;
const R = {};
for(const sc of SCENARIOS.map(s=>s.id)) R[sc] = avg(sc, T);

console.log('scenario      seeds   pop   speed   size   sense');
for(const [k,v] of Object.entries(R)){
  if(!v){ console.log(`${k.padEnd(12)}  EXTINCT`); continue; }
  console.log(`${k.padEnd(12)}  ${v.seeds}/3  ${v.pop.toFixed(0).padStart(5)}  ${v.speed.toFixed(2).padStart(5)}  ${v.size.toFixed(2).padStart(5)}  ${v.sense.toFixed(1).padStart(5)}`);
}
console.log('');

for(const [k,v] of Object.entries(R)) check(`${k} survives all seeds`, v && v.seeds === 3);

/* The primary axis: how food is DISTRIBUTED, not how much there is.
   Dispersed food rewards covering ground; concentrated food rewards finding it.
   These two must land in opposite corners or the model has no thesis. */
const plains = R.plains, oasis = R.oasis;
if(plains && oasis){
  check('oasis selects wider sense than plains', oasis.sense > plains.sense + 4,
        `(oasis ${oasis.sense.toFixed(1)} vs plains ${plains.sense.toFixed(1)})`);
  check('plains selects more speed than oasis', plains.speed > oasis.speed + 0.25,
        `(plains ${plains.speed.toFixed(2)} vs oasis ${oasis.speed.toFixed(2)})`);
  check('the two traits trade off against each other',
        (oasis.sense - plains.sense) > 0 && (oasis.speed - plains.speed) < 0);
}

/* Secondary axis: absolute scarcity. We deliberately do NOT assert a direction on
   mean size here. Size's only current payoff is a slightly wider bite radius while
   its metabolic cost is the steepest of the three traits, so the famine-vs-glut
   size difference measures at ~0.03 — below the seed-to-seed noise floor, and it has
   flipped sign between builds. Asserting it would be fitting a test to noise.
   What IS robust is that food supply sets carrying capacity. See ROADMAP #1
   (predation): giving size a payoff that scales with the trait is the fix, and once
   it lands this is the check to tighten. */
const famine = R.famine, glut = R.glut;
if(famine && glut){
  check('glut supports a much larger population than famine', glut.pop > famine.pop * 1.5,
        `(glut ${glut.pop.toFixed(0)} vs famine ${famine.pop.toFixed(0)})`);
  const dSize = Math.abs(famine.size - glut.size);
  console.log(`  note: famine-vs-glut mean size differs by ${dSize.toFixed(3)} — below the noise floor, not asserted`);
}

/* Founding stock is identical everywhere, so any divergence is selection. */
const senseInit = TRAITS.find(t=>t.key==='sense').init;
if(oasis) check('sense rises above its founding value under concentrated food',
                oasis.sense > senseInit + 8, `(${oasis.sense.toFixed(1)} vs init ${senseInit})`);

console.log(`\n${pass}/${pass+fail} checks passed`);
if(fail) process.exit(1);
