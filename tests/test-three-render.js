/* Three-dimensional rendering contracts. This suite intentionally runs without a
   WebGL context: the procedural phenotype is pure data, and failure to start the 3D
   backend must leave the deterministic simulation completely untouched. */
let pass=0, fail=0;
const check=(name,condition)=>{ condition?pass++:(fail++,console.log('FAIL:',name)); };
const close=(a,b,eps=1e-12)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=eps;
const stateSnapshot=()=>JSON.stringify(state,(key,value)=>{
  if(value instanceof Map)return {__map:Array.from(value.entries())};
  if(value instanceof Set)return {__set:Array.from(value.values())};
  return value;
});

check('3D phenotype descriptor is exposed as a pure render contract',
      typeof phenotype3DDescriptor==='function');
check('3D renderer exposes a safe optional initialiser',
      typeof initThreeRender==='function');
check('active render backend can be inspected',
      typeof getRenderBackend==='function');
check('3D world renderer exposes draw, fit, disposal, and camera contracts',
      typeof drawThreeWorld==='function'&&typeof fitThreeRender==='function'&&
      typeof disposeThreeRender==='function'&&
      typeof panThreeWorldBy==='function'&&typeof zoomThreeWorldAt==='function'&&
      typeof rotateThreeWorldBy==='function'&&typeof resetThreeWorldView==='function');
check('3D specimen renderer exposes draw and interaction contracts',
      typeof drawThreeSpecimens==='function'&&typeof bindThreeSpecimenControls==='function');
check('organic tapered mesh builder is available to detailed anatomy',
      typeof _threeOrganicTube==='function');

let selectionLayout=null,selectionScale=null;
if(typeof _threeLayoutCardRow==='function'&&typeof _threeCardSelections!=='undefined'){
  const model=(id,bodyScale)=>({
    userData:{organism:{id},descriptor:{bodyScale}},
    position:{value:null,set(...v){this.value=v;}},
    scale:{value:null,setScalar(v){this.value=v;}},
  });
  const medoid=model(901,1),variant=model(902,2),other=model(903,.5);
  const row={cladeId:991,maxSize:2,models:[medoid,variant,other]};
  _threeCardSelections.set(row.cladeId,variant.userData.organism.id);
  _threeLayoutCardRow(row);
  selectionLayout=row.selectedId===902&&variant.position.value[0]===0&&medoid.position.value[0]<0;
  selectionScale=close(variant.scale.value,1.12)&&close(medoid.scale.value,.29);
  _threeCardSelections.delete(row.cladeId);
}
check('a selected real variant moves into the central card position',selectionLayout===true);
check('variant focus preserves inherited size while changing display prominence',selectionScale===true);

if(typeof phenotype3DDescriptor==='function' &&
   typeof initThreeRender==='function' &&
   typeof getRenderBackend==='function'){
  const blankAdaptations=()=>Object.fromEntries(ADAPT_KEYS.map(k=>[k,false]));
  const specimen=(traits={},adaptations={})=>Object.assign({
    id:77,clade:2,speed:1,size:1,sense:30,diet:0.5,wariness:0.05,plasticity:0.05,
    ad:Object.assign(blankAdaptations(),adaptations)
  },traits);
  const anatomyKeys=[
    'torsoLength','torsoWidth','torsoDepth','neckLength','neckRadius',
    'headLength','headWidth','headDepth','snoutLength','snoutWidth','snoutDepth',
    'jawDepth','eyeRadius','upperLegLength','lowerLegLength','footLength',
    'stanceHeight','tailLength','tailBaseRadius'
  ];

  const ordinary=specimen();
  const first=phenotype3DDescriptor(ordinary);
  const second=phenotype3DDescriptor(ordinary);
  check('descriptor is deterministic for the same individual',
        JSON.stringify(first)===JSON.stringify(second));
  check('descriptor is serialisable data rather than live Three.js objects',(()=>{
    try{return JSON.parse(JSON.stringify(first)).torsoLength===first.torsoLength;}
    catch(e){return false;}
  })());
  check('descriptor provides every stable anatomical dimension',
        anatomyKeys.every(k=>Number.isFinite(first[k])&&first[k]>0));
  check('descriptor exposes finite normalised trait fractions',
        ['speed','sense','diet','wariness','plasticity'].every(k=>
          Number.isFinite(first[k])&&first[k]>=0&&first[k]<=1));
  check('descriptor carries valid body and lineage colours',
        typeof first.baseColor==='string'&&typeof first.accentColor==='string');

  check('cosmetic genes are separate from ecological and speciation traits',
        COSMETIC_GENE_KEYS.length===13&&COSMETIC_GENE_KEYS.every(k=>
          !TRAIT_KEYS.includes(k)&&!SPECIATION_TRAITS.some(t=>t.key===k)));
  const cosmeticLow=Object.fromEntries(COSMETIC_GENE_KEYS.map(k=>[k,0]));
  const cosmeticHigh=Object.fromEntries(COSMETIC_GENE_KEYS.map(k=>[k,1]));
  const lowSource=specimen();lowSource.cos=cosmeticLow;
  const highSource=specimen();highSource.cos=cosmeticHigh;
  const lowForm=phenotype3DDescriptor(lowSource),highForm=phenotype3DDescriptor(highSource);
  check('neutral head, stature, and tail loci visibly change homologous anatomy',
        highForm.headLength>lowForm.headLength&&highForm.stanceHeight>lowForm.stanceHeight&&
        highForm.tailLength>lowForm.tailLength&&highForm.tailCurve>lowForm.tailCurve);
  check('integument locus spans smooth skin through feather-like keratin',
        lowForm.coveringType==='smooth skin'&&highForm.coveringType==='feathers');
  check('horn expression and ear size are continuous inherited ornaments',
        lowForm.hornLength===0&&highForm.hornLength>0&&highForm.earLength>lowForm.earLength);
  check('descriptor cosmetic data is detached from the organism genome',(()=>{
    lowForm.cosmetics.headProfile=1;return lowSource.cos.headProfile===0;
  })());
  check('cosmetic divergence contributes to representative morphology distance',
        _threeMorphologyDistance(lowSource,highSource)>0);

  /* Render scale belongs to the camera/model instance, not phenotype derivation.
     Extra call-site arguments therefore cannot leak card or map scale into anatomy. */
  check('phenotype mapping is independent of card or world render scale',
        JSON.stringify(phenotype3DDescriptor(ordinary,1))===
        JSON.stringify(phenotype3DDescriptor(ordinary,1000)));

  const sizeDef=TRAITS.find(t=>t.key==='size');
  const small=phenotype3DDescriptor(specimen({size:sizeDef.min}));
  const large=phenotype3DDescriptor(specimen({size:sizeDef.max}));
  check('size is represented once as a clamped whole-body scale',
        close(small.bodyScale,sizeDef.min)&&close(large.bodyScale,sizeDef.max)&&
        large.bodyScale>small.bodyScale);
  check('changing size does not distort homologous normalised anatomy',
        anatomyKeys.every(k=>close(small[k],large[k])));

  const speedDef=TRAITS.find(t=>t.key==='speed');
  const slow=phenotype3DDescriptor(specimen({speed:speedDef.min}));
  const fast=phenotype3DDescriptor(specimen({speed:speedDef.max}));
  check('speed lengthens distal legs and raises stance',
        fast.lowerLegLength>slow.lowerLegLength&&fast.stanceHeight>slow.stanceHeight);
  check('speed streamlines rather than uniformly enlarging the torso',
        fast.torsoWidth<slow.torsoWidth);

  const senseDef=TRAITS.find(t=>t.key==='sense');
  const dull=phenotype3DDescriptor(specimen({sense:senseDef.min}));
  const keen=phenotype3DDescriptor(specimen({sense:senseDef.max}));
  check('sense enlarges the restrained eye anatomy',keen.eyeRadius>dull.eyeRadius);

  const soft=phenotype3DDescriptor(specimen({diet:0}));
  const woody=phenotype3DDescriptor(specimen({diet:1}));
  check('diet changes the feeding apparatus from long/narrow to short/broad',
        soft.snoutLength>woody.snoutLength&&soft.snoutWidth<woody.snoutWidth);
  check('woody-resource anatomy deepens the snout and jaw',
        woody.snoutDepth>soft.snoutDepth&&woody.jawDepth>soft.jawDepth);
  const predator=phenotype3DDescriptor(specimen({}, {carnivore:true}));
  check('carnivory produces a deeper predatory head and jaw',
        predator.headDepth>first.headDepth&&predator.jawDepth>first.jawDepth);

  const allAdaptations=Object.fromEntries(ADAPT_KEYS.map((k,i)=>[k,i%2===0]));
  const adaptedSource=specimen({},allAdaptations);
  const adapted=phenotype3DDescriptor(adaptedSource);
  check('every heritable adaptation crosses the renderer boundary explicitly',
        adapted.adaptations&&ADAPT_KEYS.every(k=>adapted.adaptations[k]===allAdaptations[k]));
  check('descriptor adaptation data is detached from simulation genes',(()=>{
    const key=ADAPT_KEYS[0],before=adaptedSource.ad[key];
    adapted.adaptations[key]=!before;
    return adaptedSource.ad[key]===before;
  })());

  /* Behavioural and life-history genes may drive pose, animation, or external cues,
     but must not invent organs. Their static homologous anatomy stays identical. */
  const socialOff=phenotype3DDescriptor(specimen());
  const socialOn=phenotype3DDescriptor(specimen({},
    Object.fromEntries(BEHAVIOUR_ADAPTATIONS.map(k=>[k,true]))));
  check('behavioural adaptations do not invent different body anatomy',
        anatomyKeys.every(k=>close(socialOff[k],socialOn[k])));

  initWorld({seed:'three-render-contract',scenario:'livingworld'});
  check('every founder receives a complete bounded appearance genome',
        state.organisms.every(o=>COSMETIC_GENE_KEYS.every(k=>Number.isFinite(o.cos[k])&&o.cos[k]>=0&&o.cos[k]<=1)));
  check('founders contain visible neutral genetic variation',
        new Set(state.organisms.map(o=>o.cos.covering.toFixed(3))).size>4&&
        new Set(state.organisms.map(o=>o.cos.tailCurl.toFixed(3))).size>4);
  const cosmeticRngBefore=_rngState,cosmeticSpareBefore=_spare;
  const inheritedA=inheritCosmeticGenome(state.organisms[0],state.organisms[1],999,state.seed);
  const inheritedB=inheritCosmeticGenome(state.organisms[0],state.organisms[1],999,state.seed);
  check('cosmetic inheritance is deterministic and consumes no ecological RNG',
        JSON.stringify(inheritedA)===JSON.stringify(inheritedB)&&
        _rngState===cosmeticRngBefore&&_spare===cosmeticSpareBefore);
  check('inherited appearance stays bounded at every locus',
        COSMETIC_GENE_KEYS.every(k=>inheritedA[k]>=0&&inheritedA[k]<=1));
  const stateRef=state,organismsRef=state.organisms;
  const beforeState=stateSnapshot(),beforeRng=_rngState,beforeSpare=_spare;
  phenotype3DDescriptor(state.organisms[0]);
  check('deriving a live phenotype consumes no simulation RNG',
        _rngState===beforeRng&&_spare===beforeSpare);
  check('deriving a live phenotype cannot mutate simulation state',
        state===stateRef&&state.organisms===organismsRef&&stateSnapshot()===beforeState);

  let fallbackResult, fallbackError=null;
  try{ fallbackResult=initThreeRender(null,null); }catch(e){ fallbackError=e; }
  check('missing canvases fail 3D initialisation safely',
        fallbackError===null&&fallbackResult===false);
  check('headless execution remains on the 2D backend',getRenderBackend()==='2d');
  check('3D fallback consumes no simulation RNG',
        _rngState===beforeRng&&_spare===beforeSpare);
  check('3D fallback cannot mutate simulation state',
        state===stateRef&&state.organisms===organismsRef&&stateSnapshot()===beforeState);
}

console.log(`${pass}/${pass+fail} checks passed`);
if(fail)process.exit(1);
