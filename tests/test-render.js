/* Render smoke test: drive the draw path against a mock 2D context so obvious
   throws are caught without a browser. Does not verify appearance. */
let pass=0, fail=0; const check=(n,c)=>{ c?pass++:(fail++,console.log('FAIL:',n)); };
const calls={};
function mockCtx(){
  const rec=(k)=>(...a)=>{ calls[k]=(calls[k]||0)+1; };
  return { fillRect:rec('fillRect'), strokeRect:rec('strokeRect'), beginPath:rec('beginPath'),
    arc:rec('arc'), fill:rec('fill'), stroke:rec('stroke'), fillText:rec('fillText'),
    createRadialGradient:()=>({addColorStop(){}}), save(){}, restore(){},
    set fillStyle(v){}, get fillStyle(){return '';}, set strokeStyle(v){}, get strokeStyle(){return '';},
    set lineWidth(v){}, set globalAlpha(v){}, get globalAlpha(){return 1;},
    set font(v){}, set textBaseline(v){}, set textAlign(v){} };
}
function mockCanvas(w,h){
  return { width:w, height:h, getContext:()=>mockCtx(),
           getBoundingClientRect:()=>({width:w,height:h}) };
}
const wells={ well:mockCanvas(900,620), ribbon:mockCanvas(900,170), census:mockCanvas(900,96) };
document.getElementById = (id)=> wells[id] || null;
globalThis.devicePixelRatio = 2;

initWorld({seed:'render', scenario:'oasis'});
check('initRender succeeds with canvases present', initRender()===true);
let threw=null;
try{ for(let i=0;i<400;i++) step(); drawAll(); }catch(e){ threw=e; }
check('drawAll does not throw', threw===null);
if(threw) console.log('   ', threw.message);
check('well was painted', (calls.fillRect||0) > 0);
check('organisms were drawn', (calls.arc||0) > 0);
check('ribbon drew trait labels', (calls.fillText||0) >= TRAITS.length);
check('ribbon buffer populated', state.ribbon.length > 5);
check('census buffer populated', state.census.length > 5);
check('ribbon histograms have one entry per trait',
      Object.keys(state.ribbon[0]).length === TRAITS.length);

/* organismColor must produce a valid rgb() for every species, and an unknown tag
   must not crash the draw path. */
let badColor=false;
for(const id of SPECIES.map(s=>s.id).concat(['__unknown__'])){
  const o=makeOrganism(0,0,{speed:1,size:1,sense:30},1,id);
  if(!/^rgb\(\d+,\d+,\d+\)$/.test(organismColor(o))) badColor=true;
}
check('organismColor valid for all species and unknown tags', !badColor);
check('distinct species render distinct colours',
      new Set(SPECIES.map(s=>organismColor(makeOrganism(0,0,{speed:1,size:1,sense:30},1,s.id)))).size === SPECIES.length);

/* extinction must not break the draw path */
state.organisms=[];
threw=null; try{ drawAll(); }catch(e){ threw=e; }
check('drawAll survives an extinct population', threw===null);

console.log(`${pass}/${pass+fail} checks passed`);
if(fail) process.exit(1);
