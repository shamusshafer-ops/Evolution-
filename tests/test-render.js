/* Render smoke test: drive the draw path against a mock 2D context so obvious
   throws are caught without a browser. Does not verify appearance. */
let pass=0, fail=0; const check=(n,c)=>{ c?pass++:(fail++,console.log('FAIL:',n)); };
const calls={};
function mockCtx(){
  const rec=(k)=>(...a)=>{ calls[k]=(calls[k]||0)+1; };
  return { fillRect:rec('fillRect'), strokeRect:rec('strokeRect'), beginPath:rec('beginPath'),
    ellipse:rec('ellipse'), moveTo:rec('moveTo'), lineTo:rec('lineTo'), closePath:rec('closePath'),
    quadraticCurveTo:rec('quadraticCurveTo'), translate:rec('translate'), rotate:rec('rotate'),
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
const wells={ well:mockCanvas(900,620), ribbon:mockCanvas(900,170), census:mockCanvas(900,96), specimen:mockCanvas(300,150) };
document.getElementById = (id)=> wells[id] || null;
globalThis.devicePixelRatio = 2;

initWorld({seed:'render', scenario:'oasis'});
check('initRender succeeds with canvases present', initRender()===true);
check('well camera starts at the fitted 1x view', _camera.zoom === 1);

/* Camera maths is tested independently of browser pointer dispatch. In particular,
   zooming must hold the world point under the cursor still; otherwise every wheel
   notch makes the object being inspected slide away from the pointer. */
const clientAnchorX=225, clientAnchorY=155;
const anchorX=clientAnchorX*(wells.well.width/900), anchorY=clientAnchorY*(wells.well.height/620);
const worldBeforeZoom={ x:(anchorX-_view.ox)/_view.scale, y:(anchorY-_view.oy)/_view.scale };
zoomWellAt(2,clientAnchorX,clientAnchorY);
const worldAfterZoom={ x:(anchorX-_view.ox)/_view.scale, y:(anchorY-_view.oy)/_view.scale };
check('zoom changes camera magnification', _camera.zoom === 2);
check('zoom remains anchored under the cursor',
      Math.abs(worldBeforeZoom.x-worldAfterZoom.x)<1e-9 && Math.abs(worldBeforeZoom.y-worldAfterZoom.y)<1e-9);
const cxBeforePan=_camera.cx;
panWellBy(45,0);
check('dragging pans the camera in world space', _camera.cx < cxBeforePan);
zoomWellAt(100);
check('zoom is capped at 8x', _camera.zoom === VIEW_MAX_ZOOM);
resetWellView();
check('reset restores fitted zoom and world centre',
      _camera.zoom===1 && _camera.cx===state.cfg.w/2 && _camera.cy===state.cfg.h/2);

let threw=null;
try{ for(let i=0;i<800;i++) step(); drawAll(); }catch(e){ threw=e; }
check('drawAll does not throw', threw===null);
if(threw) console.log('   ', threw.message);
check('well was painted', (calls.fillRect||0) > 0);
check('organisms were drawn', (calls.arc||0) > 0);
check('ribbon drew trait labels', (calls.fillText||0) >= TRAITS.length);
check('ribbon buffer populated', state.ribbon.length > 5);
/* census now samples on its own coarser cadence (every censusSampleEvery ticks,
   default 240) than the ribbon/history (every sampleEvery, default 30) — split
   deliberately because computeSpecies() is O(pop^2) and doesn't need 30-tick
   freshness. This smoke test's job is "does painting the census strip crash", not
   "is the buffer densely populated", so the threshold only needs >=1 sample, not >5. */
check('census buffer populated', state.census.length >= 1);
check('ribbon histograms have one entry per trait',
      Object.keys(state.ribbon[0]).length === TRAITS.length);

/* Clade colours must be valid for any index, including past the end of the palette
   (a run can produce more species than we have colours for, and must wrap rather
   than render undefined). */
let badColor=false;
for(const k of [0,1,2,7,8,19]){
  if(!/^#[0-9A-Fa-f]{6}$/.test(cladeColor(k))) badColor=true;
}
check('cladeColor valid for any index incl. past palette end', !badColor);
check('palette wraps rather than returning undefined',
      cladeColor(0) === cladeColor(CLADE_COLORS.length));
check('distinct clades within the palette get distinct colours',
      new Set(CLADE_COLORS.map((_,k)=>cladeColor(k))).size === CLADE_COLORS.length);
/* organismColor now blends DIET hue with clade colour, so it returns rgb(...) rather
   than a hex literal — the check is that it produces a valid colour for an organism
   that has not been assigned a clade yet, not that it matches any particular format
   the old flat-colour version happened to use. */
const o0 = makeOrganism(0,0,{speed:1,size:1,sense:30,diet:0.5},1);
check('organismColor works on an organism with no clade assigned yet',
      /^rgb\(\d+,\d+,\d+\)$/.test(organismColor(o0)));
check('organismColor varies with diet (specialists look different from each other)',
      organismColor(makeOrganism(0,0,{speed:1,size:1,sense:30,diet:0},1))
      !== organismColor(makeOrganism(0,0,{speed:1,size:1,sense:30,diet:1},1)));
check('drawCreature does not throw at trait extremes', (() => {
  const c = wells.well.getContext('2d');
  try {
    for (const tr of [[0.2,0.35,4,0],[6,3.2,150,1],[1,1,30,0.5]]){
      const o = makeOrganism(0,0,{speed:tr[0],size:tr[1],sense:tr[2],diet:tr[3]},1,
        {armor:true,venom:true,nocturnal:true,carnivore:true,claws:true,camouflage:true,pack:true,
         philopatry:true,courtship:true,latebreeder:true});
      drawCreature(c, o, 8, {detail:true});
      drawCreature(c, o, 1, {detail:false});
    }
    return true;
  } catch(e){ return false; }
})());

/* extinction must not break the draw path */
state.organisms=[];
threw=null; try{ drawAll(); }catch(e){ threw=e; }
check('drawAll survives an extinct population', threw===null);

console.log(`${pass}/${pass+fail} checks passed`);
if(fail) process.exit(1);
