/* Competing species: Gause's competitive exclusion principle.
   Two species on one limiting resource cannot coexist indefinitely. Species here
   differ ONLY in where they start in trait space — same rules, same costs — so any
   divergence in outcome is competition rather than something we handed out. */
let pass=0, fail=0;
const check=(n,c,d)=>{ if(c) pass++; else { fail++; console.log('FAIL:', n, d||''); } };

/* --- founding fairness --- */
initWorld({seed:'found', scenario:'temperate'});
const c0 = speciesCounts();
const counts0 = Object.values(c0);
check('every species is founded', counts0.every(v => v > 0));
check('founding shares are equal', Math.max(...counts0) - Math.min(...counts0) <= 1,
      JSON.stringify(c0));
check('total founding pop matches startPop within rounding',
      Math.abs(state.organisms.length - LIFE.startPop) <= SPECIES.length);

/* --- species is inherited, never hybridised --- */
initWorld({seed:'inherit', scenario:'temperate'});
for(let i=0;i<1200;i++) step();
const validIds = new Set(state.activeSpecies);
check('no organism carries an unknown species tag',
      state.organisms.every(o => validIds.has(o.sp)));
const bornAfterFounding = state.organisms.filter(o => o.gen > 1);
check('later generations exist', bornAfterFounding.length > 0);

/* --- the environment picks the winner, and picks the predicted one ---
   Sprinter is fast and near-sighted: it should win where food is scattered.
   Watcher is slow and wide-sighted: it should win where food is concentrated.

   IMPORTANT: diet is equalised before the run. Since slice B, species differ in diet
   as well as speed/sense, and on a single resource the species starting nearest that
   resource wins on a dietary head start regardless of how it forages. That confound
   made this check report Sprinter winning everywhere. Setting every founder to the
   resource's own type isolates the axis this test is actually about. The diet axis is
   tested on its own terms in test-niche.js. */
function dominant(scenario, seed, ticks){
  initWorld({seed, scenario});
  for(const o of state.organisms) o.diet = 0;   // single-resource scenarios are all type 0
  for(let i=0;i<ticks;i++) step();
  const c = speciesCounts();
  let best=null, bv=-1;
  for(const [k,v] of Object.entries(c)) if(v>bv){ bv=v; best=k; }
  return { winner:best, counts:c, alive:survivingSpecies() };
}
function majority(scenario, ticks){
  const wins = {};
  for(const sd of ['a','b','c']){
    const r = dominant(scenario, sd, ticks);
    wins[r.winner] = (wins[r.winner]||0) + 1;
  }
  let best=null, bv=-1;
  for(const [k,v] of Object.entries(wins)) if(v>bv){ bv=v; best=k; }
  return { winner:best, votes:bv, wins };
}

const plains = majority('plains', 10000);
const mono   = majority('mono',   10000);
console.log('plains winner:', plains.winner, JSON.stringify(plains.wins));
console.log('mono   winner:', mono.winner,   JSON.stringify(mono.wins));
check('scattered food favours the fast near-sighted species',
      plains.winner === 'sprinter', `(got ${plains.winner})`);
check('concentrated food favours the slow wide-sighted species',
      mono.winner === 'watcher', `(got ${mono.winner})`);
check('the two environments produce different winners',
      plains.winner !== mono.winner);

/* --- exclusion actually completes somewhere ---
   On open plains the wide-sighted species should be driven out entirely, not merely
   reduced. This is the check that distinguishes exclusion from coexistence. */
const pl = dominant('plains', 'a', 12000);   // diet equalised inside dominant()
check('a species is fully excluded on open plains',
      pl.alive.length < SPECIES.length, JSON.stringify(pl.counts));
check('the excluded species is the wide-sighted one',
      !pl.alive.includes('watcher'), JSON.stringify(pl.counts));

/* --- census bookkeeping --- */
initWorld({seed:'census', scenario:'temperate'});
for(let i=0;i<600;i++) step();
check('census is sampled', state.census.length > 5);
const last = state.census[state.census.length-1];
const sum = Object.values(last.counts).reduce((a,b)=>a+b,0);
check('census counts sum to the live population', sum === state.organisms.length,
      `${sum} vs ${state.organisms.length}`);
check('speciesExtinct agrees with the counts',
      state.activeSpecies.every(id => speciesExtinct(id) === (last.counts[id] === 0)));

/* --- determinism survives the species change --- */
function fp(seed){
  initWorld({seed, scenario:'oasis'});
  for(let i=0;i<500;i++) step();
  return JSON.stringify(speciesCounts());
}
check('species runs are reproducible', fp('z') === fp('z'));

console.log(`\n${pass}/${pass+fail} checks passed`);
if(fail) process.exit(1);
