/* Social evolution is local and paid for: flock benefits require nearby carriers,
   kin aid requires recent pedigree, and parental care moves conserved energy from
   adults to offspring. */
let pass=0,fail=0;
const check=(n,c,d)=>{if(c)pass++;else{fail++;console.log('FAIL:',n,d||'');}};

/* --- strict gating --- */
for(const sc of ['temperate','wild','foodchain','armsrace','radiation']){
  initWorld({seed:'social-gate',scenario:sc});
  check(`social evolution is OFF in ${sc}`,!state.cfg.socialEvolution);
}
initWorld({seed:'social-gate',scenario:'social'});
check('Social Evolution enables adaptations and predation with its own flag',
      !!state.cfg.socialEvolution&&!!state.cfg.adaptations&&!!state.cfg.predation);
for(const key of ['flocking','kinshare','parentalcare']){
  check(`${key} is gated, heritable, and notifying`,
        ADAPT_BY_KEY[key].enabledBy==='socialEvolution'&&ADAPT_BY_KEY[key].notify===true&&
        ADAPT_BY_KEY[key].mutateChance>ADAPT_MUTATE);
}
check('founders begin without social strategies',
      state.organisms.every(o=>!o.ad.flocking&&!o.ad.kinshare&&!o.ad.parentalcare));

const traits={speed:1,size:1,sense:30,diet:0.5};

/* --- flocking is actual local movement, not a global defence flag --- */
initWorld({seed:'flock',scenario:'social'});
const f1=makeOrganism(100,100,traits,1,{flocking:true});
const f2=makeOrganism(108,100,traits,1,{flocking:true});
const f3=makeOrganism(100,108,traits,1,{flocking:true});
f1.dir=Math.PI;f2.dir=f3.dir=0;
state.organisms=[f1,f2,f3];
const beforeDir=f1.dir;
socialMovementPass();
check('a carrier counts only physically nearby flockmates',f1.flockN===2);
check('local alignment changes a discordant carrier heading',f1.dir!==beforeDir);
const preySolo=makeOrganism(0,0,{...traits,speed:2},1,{flocking:true});preySolo.flockN=0;
const preyGroup=makeOrganism(0,0,{...traits,speed:2},1,{flocking:true});preyGroup.flockN=4;
const pred=makeOrganism(0,0,{...traits,speed:1,size:2},1,{});
check('a physical flock improves escape odds',predationEscapeChance(pred,preyGroup)>predationEscapeChance(pred,preySolo));
initWorld({seed:'flock-off',scenario:'wild'});
preyGroup.flockN=20;
check('fabricated flock state has no effect outside Social Evolution',
      predationEscapeChance(pred,preyGroup)===predationEscapeChance(pred,preySolo));

/* --- kin recognition uses pedigree, not shared species --- */
initWorld({seed:'kin',scenario:'social'});
const p1=makeOrganism(0,0,traits,1,{}),p2=makeOrganism(0,0,traits,1,{});
const sibA=makeOrganism(100,100,traits,2,{kinshare:true});sibA.parents=[p1.id,p2.id];
const sibB=makeOrganism(104,100,traits,2,{});sibB.parents=[p1.id,p2.id];
const half=makeOrganism(104,102,traits,2,{});half.parents=[p1.id,99999];
const stranger=makeOrganism(102,100,traits,2,{});
check('full siblings have relatedness 0.5',recentRelatedness(sibA,sibB)===0.5);
check('half siblings have relatedness 0.25',recentRelatedness(sibA,half)===0.25);
check('same-species strangers are not treated as close kin',recentRelatedness(sibA,stranger)===0);
sibA.energy=200;sibB.energy=10;stranger.energy=0;
state.organisms=[sibA,sibB,stranger];
const energyBefore=state.organisms.reduce((s,o)=>s+o.energy,0);
kinProvisionPass();
check('a well-fed carrier provisions its hungry sibling',sibB.energy>10&&sibA.energy<200);
check('provisioning conserves energy exactly',
      Math.abs(state.organisms.reduce((s,o)=>s+o.energy,0)-energyBefore)<1e-12);
check('the lower-energy stranger is ignored because it is unrelated',stranger.energy===0);
check('the transfer is recorded for observation',state.stats.kinTransfers===1&&state.stats.sharedEnergy>0);

/* --- parental care transfers, never creates, offspring energy --- */
function birth(caring){
  initWorld({seed:'care-'+caring,scenario:'social'});
  const ad=caring?{parentalcare:true}:{};
  const a=makeOrganism(100,100,traits,1,ad),b=makeOrganism(100,100,traits,1,ad);
  a.energy=b.energy=LIFE.reproduceAt*2;
  const before=a.energy+b.energy;
  const child=reproduceSexual(a,b);
  return {child,a,b,before,total:child.energy+a.energy+b.energy,care:state.stats.careEnergy};
}
const uncared=birth(false),cared=birth(true);
check('parental care gives newborns larger energy reserves',cared.child.energy>uncared.child.energy);
check('caring parents retain less energy for future reproduction',
      cared.a.energy+cared.b.energy<uncared.a.energy+uncared.b.energy);
check('parental investment conserves total family energy',Math.abs(cared.total-cared.before)<1e-9);
check('care energy is measured and zero without care',cared.care>0&&uncared.care===0);
check('parental care is inherited when both parents carry it',cared.child.ad.parentalcare===true);

/* --- first appearance notifications generalise to all three strategies --- */
initWorld({seed:'social-events',scenario:'social'});
const emerged=makeOrganism(0,0,traits,2,{flocking:true,kinshare:true,parentalcare:true});
detectAdaptationEmergence(emerged,emerged);
const keys=state.events.map(e=>e.key);
check('each social strategy announces its first appearance',
      ['flocking','kinshare','parentalcare'].every(k=>keys.includes(k)));
const n=state.events.length;detectAdaptationEmergence(emerged,emerged);
check('social emergence notifications fire only once per run',state.events.length===n);

/* --- live ecology: all behaviours must arise and actually execute --- */
function socialRun(seed,ticks){
  initWorld({seed,scenario:'social'});
  for(let i=0;i<ticks;i++)step();
  return {pop:state.organisms.length,flock:state.stats.flockTicks,
          transfers:state.stats.kinTransfers,care:state.stats.careEnergy,
          freq:['flocking','kinshare','parentalcare'].map(adaptFrequency)};
}
const socialRuns=['a','b','c'].map(s=>socialRun(s,30000));
console.log('social @30k — '+socialRuns.map(r=>
  `pop ${r.pop}, flock ${r.flock}, kin ${r.transfers}, care ${r.care.toFixed(0)}, freq ${r.freq.map(v=>v.toFixed(3)).join('/')}`).join(' | '));
check('all measured social populations remain viable',socialRuns.every(r=>r.pop>0));
check('physical flocking occurs extensively in every run',socialRuns.every(r=>r.flock>10000));
check('kin provisioning occurs repeatedly in every run',socialRuns.every(r=>r.transfers>100));
check('parental investment transfers substantial conserved energy in every run',socialRuns.every(r=>r.care>1000));
check('all three strategies remain present without any becoming a universal free upgrade',
      socialRuns.every(r=>r.freq.every(f=>f>0&&f<0.30)));

console.log(`\n${pass}/${pass+fail} checks passed`);
if(fail)process.exit(1);
