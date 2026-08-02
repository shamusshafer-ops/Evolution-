/* ============================================================================
   render.js — shared render dispatch plus the complete Canvas fallback.
   Reads state, never mutates it. The drift ribbon and census remain analytical 2D.
   ========================================================================== */

let _well = null, _wellCtx = null, _ribbon = null, _ribbonCtx = null;
let _view = { scale:1, baseScale:1, ox:0, oy:0 };
let _camera = { zoom:1, cx:null, cy:null };
let _use3D = false;
const VIEW_MIN_ZOOM = 1, VIEW_MAX_ZOOM = 24;

function getRenderBackend(){ return _use3D ? '3d' : '2d'; }

/* A canvas keeps the first context family it creates. If optional 3D startup claims
   one surface and then fails on the other, disposing WebGL does not make getContext
   ('2d') legal again. Startup happens before UI binding, so replacing only a claimed
   canvas is a safe, transactional route back to the complete 2D renderer. */
function twoDCanvasFallback(canvas){
  if(!canvas||typeof canvas.getContext!=='function')return{canvas,ctx:null};
  let ctx=null;
  try{ctx=canvas.getContext('2d');}catch(_err){}
  if(ctx)return{canvas,ctx};
  if(canvas.parentNode&&typeof canvas.cloneNode==='function'){
    const replacement=canvas.cloneNode(true);
    canvas.parentNode.replaceChild(replacement,canvas);
    try{ctx=replacement.getContext('2d');}catch(_err){}
    return{canvas:replacement,ctx};
  }
  return{canvas,ctx:null};
}

function initRender(){
  _use3D=false;
  _well   = document.getElementById('well');
  _ribbon = document.getElementById('ribbon');
  if (!_well || !_ribbon) return false;
  _ribbonCtx = _ribbon.getContext('2d');
  initCensus();
  _card = document.getElementById('specimen');

  // 3D is the default when the bundled renderer and WebGL2 are available. The query
  // switch is deliberately simple and permanent for the page lifetime: a canvas
  // cannot change from WebGL to 2D after its first context has been created.
  const force2D = typeof location!=='undefined' && /(?:^|[?&])renderer=2d(?:&|$)/.test(location.search||'');
  if(!force2D && typeof initThreeRender==='function'){
    try{ _use3D=!!initThreeRender(_well,_card); }catch(e){ _use3D=false; }
  }
  if(_use3D){
    _wellCtx=null;_cardCtx=null;
    if(typeof bindThreeSpecimenControls==='function')bindThreeSpecimenControls();
  }else{
    if(typeof disposeThreeRender==='function')disposeThreeRender();
    const well2D=twoDCanvasFallback(_well),card2D=twoDCanvasFallback(_card);
    _well=well2D.canvas;_wellCtx=well2D.ctx;
    _card=card2D.canvas;_cardCtx=card2D.ctx;
    if(!_wellCtx||!_cardCtx)return false;
  }
  if(_well&&_well.setAttribute)_well.setAttribute('aria-label',_use3D
    ?'3D specimen world. Drag to pan; right-drag, two-finger twist, or Q and E rotates; wheel or pinch zooms.'
    :'Specimen world. Drag to pan; wheel or pinch zooms.');
  if(_card&&_card.setAttribute)_card.setAttribute('aria-label',_use3D
    ?'Interactive 3D species forms. Drag or use arrow keys to rotate; wheel or plus and minus zooms; 0 resets.'
    :'Current two-dimensional form of each species.');
  fitCanvases();
  return true;
}

function fitCanvases(){
  if (!_well) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap: 3x DPR on phones triples fill cost
  const cpuCanvases=_use3D?[_ribbon,_census]:[_well,_ribbon,_census,_card];
  for (const c of cpuCanvases.filter(Boolean)){
    const r = c.getBoundingClientRect();
    c.width  = Math.max(1, Math.round(r.width  * dpr));
    c.height = Math.max(1, Math.round(r.height * dpr));
  }
  if(_use3D&&typeof fitThreeRender==='function')fitThreeRender();
  const cfg = state ? state.cfg : WORLD;
  _view.baseScale = Math.min(_well.width / cfg.w, _well.height / cfg.h);
  if (!Number.isFinite(_camera.cx)) _camera.cx = cfg.w / 2;
  if (!Number.isFinite(_camera.cy)) _camera.cy = cfg.h / 2;
  updateViewTransform();
}

/* ---------- Well camera ----------
   Camera position is stored in WORLD coordinates, rather than canvas pixels. That
   makes the view survive a backing-store resize when entering or leaving fullscreen:
   the same organism remains centred even though the number of screen pixels changes. */
function updateViewTransform(){
  if (!_well) return;
  const cfg = state ? state.cfg : WORLD;
  _camera.zoom = Math.max(VIEW_MIN_ZOOM, Math.min(VIEW_MAX_ZOOM, _camera.zoom || 1));
  const nextScale = _view.baseScale * _camera.zoom;
  const halfW = Math.min(cfg.w/2, _well.width / (2*nextScale));
  const halfH = Math.min(cfg.h/2, _well.height / (2*nextScale));
  _camera.cx = Math.max(halfW, Math.min(cfg.w - halfW, Number.isFinite(_camera.cx) ? _camera.cx : cfg.w/2));
  _camera.cy = Math.max(halfH, Math.min(cfg.h - halfH, Number.isFinite(_camera.cy) ? _camera.cy : cfg.h/2));
  _view.scale = nextScale;
  _view.ox = _well.width / 2 - _camera.cx * _view.scale;
  _view.oy = _well.height / 2 - _camera.cy * _view.scale;
}

function resetWellView(){
  if(_use3D&&typeof resetThreeWorldView==='function'){resetThreeWorldView();return;}
  const cfg = state ? state.cfg : WORLD;
  _camera.zoom = 1;
  _camera.cx = cfg.w / 2;
  _camera.cy = cfg.h / 2;
  updateViewTransform();
}

function selectedLineageIdForRender(){
  return typeof UI!=='undefined'&&Number.isFinite(UI.selectedLineageId)?UI.selectedLineageId:null;
}

function focusWellOn(x,y,zoom){
  if(_use3D&&typeof focusThreeWorldOn==='function')return focusThreeWorldOn(x,y,zoom);
  if(!_well||!Number.isFinite(x)||!Number.isFinite(y))return false;
  _camera.cx=x;_camera.cy=y;
  if(Number.isFinite(zoom))_camera.zoom=Math.max(VIEW_MIN_ZOOM,Math.min(VIEW_MAX_ZOOM,zoom));
  updateViewTransform();return true;
}

function panWellBy(clientDx, clientDy){
  if(_use3D&&typeof panThreeWorldBy==='function'){panThreeWorldBy(clientDx,clientDy);return;}
  if (!_well || !_view.scale) return;
  const rect = _well.getBoundingClientRect();
  const px = clientDx * (_well.width / Math.max(1, rect.width));
  const py = clientDy * (_well.height / Math.max(1, rect.height));
  _camera.cx -= px / _view.scale;
  _camera.cy -= py / _view.scale;
  updateViewTransform();
}

function zoomWellAt(factor, clientX, clientY){
  if(_use3D&&typeof zoomThreeWorldAt==='function'){zoomThreeWorldAt(factor,clientX,clientY);return;}
  if (!_well || !Number.isFinite(factor) || factor <= 0) return;
  const rect = _well.getBoundingClientRect();
  const ax = clientX == null ? _well.width/2 : (clientX - (rect.left||0)) * (_well.width / Math.max(1,rect.width));
  const ay = clientY == null ? _well.height/2 : (clientY - (rect.top||0)) * (_well.height / Math.max(1,rect.height));
  const worldX = (ax - _view.ox) / _view.scale;
  const worldY = (ay - _view.oy) / _view.scale;
  const next = Math.max(VIEW_MIN_ZOOM, Math.min(VIEW_MAX_ZOOM, _camera.zoom * factor));
  if (next === _camera.zoom) return;
  const nextScale = _view.baseScale * next;
  _camera.zoom = next;
  _camera.cx = worldX - (ax - _well.width/2) / nextScale;
  _camera.cy = worldY - (ay - _well.height/2) / nextScale;
  updateViewTransform();
}

function hexToRgb(h){
  const n = parseInt(h.slice(1), 16);
  return [(n>>16)&255, (n>>8)&255, n&255];
}
/* Colour keys off the LINEAGE id (stable since M8), not population rank, so a clade
   keeps its colour for the whole run. */
function cladeColor(k){ return CLADE_COLORS[k % CLADE_COLORS.length]; }

/* ---------- Morphology ----------
   Every organism descends from one invented terrestrial tetrapod-like ancestor. The
   shared skeleton matters: derived species can diverge dramatically, but the sim does
   not model unrelated phyla appearing from nowhere. Four continuously inherited
   ecological traits change homologous anatomy:

     size  -> the whole body at a fixed scale
     speed -> distal limb length, digitigrade stance, torso streamlining, gait
     sense -> restrained eye/orbit size (sense detects food, not everything)
     diet  -> long gracile soft-food mouth through short deep woody-food crusher

   Physical adaptations alter anatomy. Behavioural/life-history genes remain badges
   or live interaction cues; inventing a "site-fidelity fin" or "parental-care organ"
   would falsely claim biology that the model does not contain. Rendering is layered
   by screen-space level of detail so zoom reveals joints, digits, plates and teeth. */
const PHYSICAL_ADAPTATIONS = ['armor','venom','nocturnal','carnivore','claws','camouflage','courtship'];
const BEHAVIOUR_ADAPTATIONS = ['pack','philopatry','latebreeder','flocking','kinshare','parentalcare'];

function traitFraction(o, key){
  const t = TRAITS.find(x => x.key === key);
  if (!t) return 0;
  return Math.max(0, Math.min(1, ((o[key] == null ? t.init : o[key]) - t.min) / (t.max - t.min)));
}
function mixChannel(a,b,f){ return Math.round(a + (b-a)*f); }
function rgbString(rgb){ return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`; }
function mixRgb(a,b,f){ return [mixChannel(a[0],b[0],f),mixChannel(a[1],b[1],f),mixChannel(a[2],b[2],f)]; }
function shadeColor(col, amount){
  let rgb;
  if (col[0] === '#') rgb = hexToRgb(col);
  else {
    const m = col.match(/\d+/g);
    rgb = m ? m.slice(0,3).map(Number) : [100,120,112];
  }
  const target = amount >= 0 ? [255,255,255] : [0,0,0];
  return rgbString(mixRgb(rgb,target,Math.min(1,Math.abs(amount))));
}

/* Body colour is deliberately NOT diet colour. Diet is now legible in the feeding
   apparatus; lineage colour remains an analytical outline/accent rather than a claim
   that woody-food specialists must evolve brown skin. */
function organismColor(o){
  const neutral = [103,122,113];
  return rgbString(mixRgb(neutral,hexToRgb(cladeColor(o.clade || 0)),0.28));
}

function cosmeticBodyColor(o){
  const cos=typeof cosmeticGenomeFor==='function'?cosmeticGenomeFor(o):{pigment:.5};
  const palette=[[82,108,101],[101,121,108],[126,113,92],[113,98,105],[91,109,124],[132,119,83]];
  const pigment=Math.max(0,Math.min(.999,cos.pigment==null?.5:cos.pigment));
  return rgbString(mixRgb(palette[Math.floor(pigment*palette.length)],hexToRgb(cladeColor(o.clade||0)),.22));
}

function derivePhenotype(o, R){
  const speed = traitFraction(o,'speed');
  const sense = traitFraction(o,'sense');
  const diet = Math.max(0,Math.min(1,o.diet == null ? 0.5 : o.diet));
  const wary = traitFraction(o,'wariness');
  const plasticity = traitFraction(o,'plasticity');
  const carnivore = !!(o.ad && o.ad.carnivore);
  const cos=typeof cosmeticGenomeFor==='function'?cosmeticGenomeFor(o):{};
  const cv=(key,fallback)=>Math.max(0,Math.min(1,Number.isFinite(cos[key])?cos[key]:fallback));
  const headProfile=cv('headProfile',.5),muzzleCurve=cv('muzzleCurve',.5);
  const bodyHeight=cv('bodyHeight',.5),shoulderLine=cv('shoulderLine',.5);
  const tailProportion=cv('tailLength',.5),tailCurl=cv('tailCurl',.5),tailTaper=cv('tailTaper',.5);
  const covering=cv('covering',.5);
  return {
    R, speed, sense, diet, wary, plasticity,cosmetics:cos,
    headProfile,muzzleCurve,bodyHeight,shoulderLine,tailProportion,tailCurl,tailTaper,
    earSize:cv('earSize',.5),horns:cv('horns',.42),covering,
    coveringIndex:Math.min(3,Math.floor(covering*4)),coatLength:cv('coatLength',.48),
    pattern:cv('pattern',.5),
    torsoL:R*(1.16 - speed*0.10)*(0.94+shoulderLine*.12),
    torsoW:R*(0.96 - speed*0.18)*(0.92+shoulderLine*.16),
    neckL:R*(0.24 + wary*0.24),
    neckW:R*(0.34 + (1-speed)*0.10),
    headL:R*(0.52 + (1-diet)*0.18 + (carnivore?0.12:0))*(0.86+headProfile*.28),
    headW:R*(0.50 + diet*0.32 + (carnivore?0.14:0))*(1.13-headProfile*.23),
    snoutL:R*((0.52 - diet*0.28) + (carnivore?0.10:0))*(0.86+muzzleCurve*.28),
    eyeR:Math.max(0.34,R*(0.045 + sense*0.135)),
    upperLeg:R*(0.48 + speed*0.48),
    lowerLeg:R*(0.38 + speed*0.58),
    footL:R*(0.20 + speed*0.22),
    tailL:R*(1.12 + (1-diet)*0.10)*(0.72+tailProportion*.58),
    tailCurve:(tailCurl-.5)*R*1.25,
    tailTip:R*(.025+(1-tailTaper)*.075),
    baseColor:cosmeticBodyColor(o),
    accent:cladeColor(o.clade || 0),
  };
}

function limbPoints(p, front, side, gait){
  const rootX = (front ? p.torsoL*0.50 : -p.torsoL*0.52);
  const rootY = side*p.torsoW*0.58;
  const swing = gait*(0.10 + p.speed*0.22)*p.R;
  const jointX = rootX + (front ? 0.08 : -0.16)*p.R + swing;
  const jointY = rootY + side*p.upperLeg*0.78;
  const footX = jointX + (front ? 0.34 : 0.24)*p.lowerLeg - swing*0.42;
  const footY = jointY + side*p.lowerLeg*0.48;
  return { rootX,rootY,jointX,jointY,footX,footY };
}

function strokeLimb(ctx, p, q, near, detail){
  ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.strokeStyle=shadeColor(p.baseColor,-0.48);
  ctx.lineWidth=Math.max(0.7,p.R*(near?0.27:0.22));
  ctx.beginPath(); ctx.moveTo(q.rootX,q.rootY); ctx.lineTo(q.jointX,q.jointY); ctx.lineTo(q.footX,q.footY); ctx.stroke();
  ctx.strokeStyle=near?p.baseColor:shadeColor(p.baseColor,-0.12);
  ctx.lineWidth=Math.max(0.45,p.R*(near?0.18:0.14));
  ctx.beginPath(); ctx.moveTo(q.rootX,q.rootY); ctx.lineTo(q.jointX,q.jointY); ctx.lineTo(q.footX,q.footY); ctx.stroke();
  if (detail){
    ctx.fillStyle=shadeColor(p.baseColor,0.10);
    for (const pt of [[q.rootX,q.rootY],[q.jointX,q.jointY]]){
      ctx.beginPath();ctx.arc(pt[0],pt[1],Math.max(0.38,p.R*0.10),0,Math.PI*2);ctx.fill();
    }
  }
}

function drawDigits(ctx, p, q, side, hasClaws){
  const n=hasClaws?3:2;
  ctx.strokeStyle=hasClaws?ADAPT_BY_KEY.claws.color:shadeColor(p.baseColor,-0.30);
  ctx.lineWidth=Math.max(0.45,p.R*(hasClaws?0.065:0.045));
  for(let i=0;i<n;i++){
    const spread=(i-(n-1)/2)*p.R*0.11;
    ctx.beginPath();
    ctx.moveTo(q.footX,q.footY+spread);
    ctx.quadraticCurveTo(q.footX+p.footL*0.62,q.footY+spread+side*p.R*0.035,
                         q.footX+p.footL,q.footY+spread-side*p.R*(hasClaws?0.07:0));
    ctx.stroke();
  }
}

function drawBehaviourCues(ctx,o,p,lod,portrait){
  if(o.ad&&o.ad.flocking&&o.flockN>0&&lod!=='low'){
    ctx.strokeStyle=ADAPT_BY_KEY.flocking.color;
    ctx.globalAlpha=Math.min(0.75,0.18+o.flockN*0.10);
    ctx.lineWidth=Math.max(0.45,p.R*0.055);
    for(const side of [-1,1]){
      ctx.beginPath();ctx.arc(0,0,p.R*(1.45+Math.min(3,o.flockN)*0.10),
                              side<0?Math.PI*1.12:Math.PI*0.12,
                              side<0?Math.PI*1.88:Math.PI*0.88);ctx.stroke();
    }
    ctx.globalAlpha=1;
  }
  if(!portrait||!o.ad) return;
  const active=BEHAVIOUR_ADAPTATIONS.filter(k=>o.ad[k]);
  if(o.plasticity>0.12) active.push('plasticity');
  if(!active.length) return;
  const gap=Math.max(9,p.R*0.38), total=(active.length-1)*gap;
  const y=-p.R*1.72;
  ctx.font=`700 ${Math.max(7,Math.round(p.R*0.25))}px ui-monospace, Menlo, monospace`;
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(let i=0;i<active.length;i++){
    const key=active[i], def=ADAPT_BY_KEY[key];
    const glyph=def?def.glyph:'↻', color=def?def.color:TRAITS.find(t=>t.key==='plasticity').color;
    const x=-total/2+i*gap, rr=Math.max(4.5,p.R*0.16);
    ctx.fillStyle=PAL.well;ctx.beginPath();ctx.arc(x,y,rr,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=color;ctx.lineWidth=Math.max(0.55,p.R*0.035);ctx.stroke();
    ctx.fillStyle=color;ctx.fillText(glyph,x,y+0.2);
  }
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
}

function drawCreature(ctx,o,R,opts){
  opts=opts||{};
  const lod=opts.detail===false?'low':(opts.portrait||R>=8?'high':(R>=2.6?'medium':'low'));
  const p=derivePhenotype(o,R), detail=lod==='high';
  const phase=opts.portrait?0:(((state&&state.tick)||0)*0.09*(0.35+p.speed)+(o.id||0)*0.73);
  const gait=Math.sin(phase), ad=o.ad||{};
  const limbs=[];
  for(const front of [false,true]) for(const side of [-1,1]){
    const counter=(front===(side>0))?gait:-gait;
    limbs.push({front,side,q:limbPoints(p,front,side,counter)});
  }

  ctx.save();
  drawBehaviourCues(ctx,o,p,lod,!!opts.portrait);

  // A muscular tapering tail reads as the inherited tetrapod body plan, not a mouse's
  // hairless cord. Its length is deliberately not a speed gauge.
  ctx.fillStyle=shadeColor(p.baseColor,-0.12);
  ctx.beginPath();
  const tailTipX=-p.torsoL-p.tailL,tailTipY=p.tailCurve;
  ctx.moveTo(-p.torsoL*0.76,-p.R*0.30);
  ctx.quadraticCurveTo(-p.torsoL-p.tailL*0.48,-p.R*0.22+p.tailCurve*.42,tailTipX,tailTipY-p.tailTip);
  ctx.quadraticCurveTo(-p.torsoL-p.tailL*0.45,p.R*0.18+p.tailCurve*.42,-p.torsoL*0.76,p.R*0.30);
  ctx.closePath();ctx.fill();

  // Far limbs, then torso, then near limb highlights create readable joint depth.
  if(lod!=='low') for(const limb of limbs) strokeLimb(ctx,p,limb.q,false,detail);

  ctx.fillStyle=p.baseColor;ctx.strokeStyle=shadeColor(p.accent,-0.20);
  ctx.lineWidth=Math.max(0.55,p.R*0.075);
  ctx.beginPath();
  ctx.moveTo(-p.torsoL,0);
  ctx.quadraticCurveTo(-p.torsoL*0.84,-p.torsoW*0.68,-p.torsoL*0.46,-p.torsoW*0.82);
  ctx.quadraticCurveTo(p.torsoL*0.10,-p.torsoW*0.72,p.torsoL*0.56,-p.torsoW);
  ctx.quadraticCurveTo(p.torsoL*0.86,-p.torsoW*0.82,p.torsoL,-p.torsoW*0.34);
  ctx.lineTo(p.torsoL,p.torsoW*0.34);
  ctx.quadraticCurveTo(p.torsoL*0.86,p.torsoW*0.82,p.torsoL*0.56,p.torsoW);
  ctx.quadraticCurveTo(p.torsoL*0.10,p.torsoW*0.72,-p.torsoL*0.46,p.torsoW*0.82);
  ctx.quadraticCurveTo(-p.torsoL*0.84,p.torsoW*0.68,-p.torsoL,0);
  ctx.closePath();ctx.fill();ctx.stroke();
  if(lod!=='low'){
    // Shoulder and pelvic masses make the limb roots anatomical rather than strokes
    // pasted onto an oval. A dorsal highlight describes the intervening ribcage.
    ctx.fillStyle=shadeColor(p.baseColor,-0.08);ctx.globalAlpha=0.32;
    ctx.beginPath();ctx.ellipse(p.torsoL*0.48,0,p.torsoL*0.30,p.torsoW*0.78,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(-p.torsoL*0.50,0,p.torsoL*0.25,p.torsoW*0.66,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=shadeColor(p.baseColor,0.15);ctx.globalAlpha=0.38;
    ctx.beginPath();ctx.ellipse(-p.R*0.02,-p.torsoW*0.30,p.torsoL*0.66,p.torsoW*0.20,0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
    if(detail){
      ctx.strokeStyle=shadeColor(p.baseColor,-0.25);ctx.lineWidth=Math.max(0.35,p.R*0.025);ctx.globalAlpha=0.46;
      ctx.beginPath();ctx.moveTo(-p.torsoL*0.68,0);ctx.quadraticCurveTo(0,-p.R*0.08,p.torsoL*0.78,0);ctx.stroke();
      ctx.globalAlpha=1;
    }
  }

  // Neck and a distinct skull remove the oval-plus-eyes mouse silhouette.
  const headX=p.torsoL*0.86+p.neckL+p.headL*0.22;
  ctx.fillStyle=p.baseColor;
  ctx.beginPath();ctx.ellipse(p.torsoL*0.70,0,p.neckL+p.R*0.22,p.neckW,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(headX,0,p.headL,p.headW,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=shadeColor(p.accent,-0.20);ctx.lineWidth=Math.max(0.5,p.R*0.065);ctx.stroke();

  if(lod!=='low'){
    const earL=p.R*(.10+p.earSize*.32),earW=p.R*(.06+p.earSize*.13);
    ctx.fillStyle=shadeColor(p.baseColor,.12);
    for(const side of [-1,1]){
      ctx.beginPath();ctx.moveTo(headX-p.headL*.20,side*p.headW*.56);
      ctx.quadraticCurveTo(headX-p.headL*.28,side*(p.headW+earL),headX+p.headL*.02,side*(p.headW*.62+earW));ctx.closePath();ctx.fill();
    }
    const hornL=Math.max(0,(p.horns-.58)/.42)*p.R*.72;
    if(hornL>.04){ctx.strokeStyle=shadeColor(p.baseColor,-.42);ctx.lineWidth=Math.max(.7,p.R*.085);ctx.lineCap='round';
      for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(headX-p.headL*.10,side*p.headW*.45);ctx.quadraticCurveTo(headX-p.headL*.28,side*(p.headW+hornL*.48),headX+p.headL*.02,side*(p.headW+hornL));ctx.stroke();}
    }
  }

  // Feeding apparatus: diet 0 is a long narrow soft-food probe/cropper; diet 1 is a
  // short broad woody-food crushing/chiselling face. Carnivory deepens the whole jaw.
  const mouthX=headX+p.headL*0.58;
  const mouthW=p.headW*(0.36+p.diet*0.43);
  ctx.fillStyle=shadeColor(p.baseColor,p.diet>0.55?-0.18:0.08);
  const tipX=mouthX+p.snoutL*1.18,tipW=mouthW*(0.20+p.diet*0.55);
  ctx.beginPath();ctx.moveTo(mouthX,-mouthW*0.72);
  ctx.quadraticCurveTo(mouthX+p.snoutL*0.58,-mouthW*0.62,tipX,-tipW);
  ctx.lineTo(tipX,tipW);
  ctx.quadraticCurveTo(mouthX+p.snoutL*0.58,mouthW*0.62,mouthX,mouthW*0.72);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle=shadeColor(p.baseColor,-0.26);ctx.lineWidth=Math.max(0.38,p.R*0.035);ctx.stroke();
  ctx.strokeStyle=shadeColor(p.baseColor,-0.42);ctx.lineWidth=Math.max(0.45,p.R*0.045);
  ctx.beginPath();ctx.moveTo(mouthX,0);ctx.lineTo(tipX,0);ctx.stroke();
  if(p.diet>0.58&&!ad.carnivore&&lod!=='low'){
    ctx.fillStyle=FOOD_TYPES[1].color;
    ctx.fillRect(tipX-Math.max(0.7,p.R*0.09),-tipW,Math.max(0.7,p.R*0.09),tipW*2);
  }

  if(lod!=='low'){
    const patternStrength=Math.abs(p.pattern-.5)*2;
    if(patternStrength>.14){
      ctx.fillStyle=shadeColor(p.accent,-.34);ctx.globalAlpha=.28+.32*patternStrength;
      for(const q of [[-.55,-.25,.16,.12],[-.18,.30,.20,.11],[.18,-.28,.17,.12],[.48,.22,.15,.10]]){
        ctx.beginPath();ctx.ellipse(p.torsoL*q[0],p.torsoW*q[1],p.torsoL*q[2]*patternStrength,p.torsoW*q[3],q[1],0,Math.PI*2);ctx.fill();
      }ctx.globalAlpha=1;
    }
    if(p.coveringIndex===1){
      ctx.strokeStyle=shadeColor(p.baseColor,-.28);ctx.lineWidth=Math.max(.3,p.R*.024);ctx.globalAlpha=.66;
      for(let x=-4;x<=4;x++)for(let y=-2;y<=2;y++){
        const nx=x/5,ny=y/3;if(nx*nx+ny*ny>.82)continue;
        ctx.beginPath();ctx.arc(nx*p.torsoL*.82,ny*p.torsoW*.72,p.R*.085,0,Math.PI);ctx.stroke();
      }ctx.globalAlpha=1;
    }else if(p.coveringIndex===2){
      ctx.strokeStyle=shadeColor(p.baseColor,.24);ctx.lineWidth=Math.max(.35,p.R*.026);ctx.globalAlpha=.78;
      const len=p.R*(.08+p.coatLength*.13);
      for(let x=-5;x<=5;x++)for(let y=-2;y<=2;y++){
        const nx=x/6,ny=y/3;if(nx*nx+ny*ny>.86)continue;
        const px=nx*p.torsoL*.82,py=ny*p.torsoW*.74;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-len,py+ny*len*.45);ctx.stroke();
      }ctx.globalAlpha=1;
    }else if(p.coveringIndex===3){
      ctx.fillStyle=shadeColor(p.baseColor,.20);ctx.globalAlpha=.80;
      for(let x=-4;x<=4;x++)for(let y=-2;y<=2;y++){
        const nx=x/5,ny=y/3;if(nx*nx+ny*ny>.82)continue;
        const px=nx*p.torsoL*.80,py=ny*p.torsoW*.72;
        ctx.beginPath();ctx.ellipse(px,py,p.R*(.10+p.coatLength*.08),p.R*.045,nx*.3,0,Math.PI*2);ctx.fill();
      }ctx.globalAlpha=1;
    }
    // Camouflage is a low-contrast disruptive surface pattern, never active colour change.
    if(ad.camouflage){
      ctx.fillStyle=shadeColor(ADAPT_BY_KEY.camouflage.color,-0.32);ctx.globalAlpha=0.62;
      for(const q of [[-0.64,-0.25,0.25,0.20],[-0.28,0.34,0.34,0.17],[0.12,-0.33,0.24,0.19],[0.43,0.22,0.28,0.16]]){
        ctx.beginPath();ctx.ellipse(p.torsoL*q[0],p.torsoW*q[1],p.torsoL*q[2],p.torsoW*q[3],q[1],0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;
    }

    // Armour is continuous overlapping coverage, matching its modeled immunity better
    // than the previous single decorative arc.
    if(ad.armor){
      ctx.fillStyle=ADAPT_BY_KEY.armor.color;ctx.strokeStyle=shadeColor(ADAPT_BY_KEY.armor.color,-0.45);
      ctx.lineWidth=Math.max(0.35,p.R*0.035);
      for(let i=-3;i<=3;i++){
        const x=i*p.torsoL*0.22, breadth=(1-Math.abs(i)/5)*p.torsoW;
        ctx.beginPath();ctx.ellipse(x,-p.torsoW*0.08,p.torsoL*0.15,breadth*0.64,0,0,Math.PI*2);ctx.fill();
        if(detail)ctx.stroke();
      }
    }

    // Courtship signal is a real keratinous dorsal crest. Colour follows diet because
    // mate choice actually compares feeding niche, though the gene itself is binary.
    if(ad.courtship){
      const dietCol=rgbString(mixRgb(hexToRgb(FOOD_TYPES[0].color),hexToRgb(FOOD_TYPES[1].color),p.diet));
      ctx.fillStyle=dietCol;ctx.strokeStyle=ADAPT_BY_KEY.courtship.color;
      for(let i=0;i<4;i++){
        const x=-p.torsoL*0.38+i*p.torsoL*0.25;
        ctx.beginPath();ctx.moveTo(x,-p.torsoW*0.70);ctx.lineTo(x+p.R*0.10,-p.torsoW*(1.12+0.08*i));
        ctx.lineTo(x+p.R*0.23,-p.torsoW*0.68);ctx.closePath();ctx.fill();if(detail)ctx.stroke();
      }
    }
  }

  // Eyes sit on the skull rather than directly on the torso. Sense affects them, but
  // modestly: the simulation only grants a wider food-detection radius.
  const eyeX=headX+p.headL*0.12, eyeY=p.headW*0.66;
  ctx.fillStyle=shadeColor(p.baseColor,0.34);
  for(const side of [-1,1]){
    ctx.beginPath();ctx.arc(eyeX,side*eyeY,p.eyeR*1.28,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=PAL.well;ctx.beginPath();ctx.arc(eyeX+p.eyeR*0.16,side*eyeY,p.eyeR,0,Math.PI*2);ctx.fill();
    if(ad.nocturnal){ctx.strokeStyle=ADAPT_BY_KEY.nocturnal.color;ctx.lineWidth=Math.max(0.4,p.eyeR*0.30);ctx.stroke();}
    ctx.fillStyle=shadeColor(p.baseColor,0.34);
  }

  if(lod!=='low'){
    if(ad.venom){
      // Paired fang delivery plus gland swellings; no unmodeled scorpion-like tail.
      ctx.fillStyle=ADAPT_BY_KEY.venom.color;ctx.globalAlpha=0.72;
      for(const side of [-1,1]){
        ctx.beginPath();ctx.arc(headX-p.headL*0.05,side*p.headW*0.57,p.R*0.17,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.moveTo(mouthX+p.snoutL*0.58,side*p.R*0.07);
        ctx.lineTo(mouthX+p.snoutL*0.90,side*p.R*0.18);ctx.lineTo(mouthX+p.snoutL*0.77,side*p.R*0.02);ctx.closePath();ctx.fill();
      }
      ctx.globalAlpha=1;
    }
    if(ad.carnivore){
      ctx.fillStyle='#E8E2CF';
      for(const side of [-1,1])for(let i=0;i<3;i++){
        const x=mouthX+p.snoutL*(0.42+i*0.22);
        ctx.beginPath();ctx.moveTo(x,side*p.R*0.04);ctx.lineTo(x+p.R*0.12,side*p.R*0.19);ctx.lineTo(x+p.R*0.19,side*p.R*0.03);ctx.closePath();ctx.fill();
      }
    }
  }

  if(lod!=='low') for(const limb of limbs){
    strokeLimb(ctx,p,limb.q,true,detail);
    if(detail||ad.claws) drawDigits(ctx,p,limb.q,limb.side,!!(ad.claws&&limb.front));
  }

  ctx.restore();
}

function drawWell(){
  if(_use3D&&typeof drawThreeWorld==='function'){drawThreeWorld();return;}
  if (!_wellCtx || !state) return;
  const ctx = _wellCtx, cfg = state.cfg, s = _view.scale;
  const X = x => _view.ox + x * s;
  const Y = y => _view.oy + y * s;

  ctx.fillStyle = PAL.well;
  ctx.fillRect(0, 0, _well.width, _well.height);

  // culture medium
  ctx.fillStyle = PAL.medium;
  ctx.fillRect(X(0), Y(0), cfg.w*s, cfg.h*s);

  // resource sites — faint haloes marking ground worth returning to
  if (state.sites && cfg.clumped){
    const rr = (cfg.clumpRadius || 30) * s;
    for (const st of state.sites){
      const g = ctx.createRadialGradient(X(st.x), Y(st.y), 0, X(st.x), Y(st.y), rr);
      const st_t = FOOD_TYPES[st.t || 0] || FOOD_TYPES[0];
      const rgb = hexToRgb(st_t.color);
      g.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.085)`);
      g.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(X(st.x), Y(st.y), rr, 0, Math.PI*2); ctx.fill();
    }
  }

  // food, coloured by resource type so partitioning is visible in the well itself:
  // two specialists foraging different ground is the shape this slice produces.
  const fr = Math.max(1.1, 2.0 * s);
  for (const f of state.food){
    const ft = FOOD_TYPES[f.t || 0] || FOOD_TYPES[0];
    ctx.fillStyle = ft.color;
    ctx.beginPath(); ctx.arc(X(f.x), Y(f.y), fr, 0, Math.PI*2); ctx.fill();
  }

  // organisms
  // At deep zoom, a visible animal may span hundreds of pixels. Cull bodies that are
  // wholly outside the camera before asking for joints, plates, toes and teeth; this
  // changes no visible result and prevents 24× inspection from fully rendering every
  // off-screen member of a thousand-organism population.
  const worldPad=12/Math.max(0.001,s);
  const viewLeft=(-_view.ox)/s-worldPad,viewRight=(_well.width-_view.ox)/s+worldPad;
  const viewTop=(-_view.oy)/s-worldPad,viewBottom=(_well.height-_view.oy)/s+worldPad;
  const selectedLineage=selectedLineageIdForRender();
  for (const o of state.organisms){
    if(o.x<viewLeft||o.x>viewRight||o.y<viewTop||o.y>viewBottom)continue;
    const r = Math.max(1.6, o.size * 3.4 * s);
    ctx.save();
    if(selectedLineage!=null&&o.clade!==selectedLineage)ctx.globalAlpha=.16;
    ctx.translate(X(o.x), Y(o.y));
    ctx.rotate(o.dir);
    // Anatomy resolves progressively in screen space. At normal scale the head and
    // shared tetrapod silhouette remain legible; deep zoom reveals joints, plates,
    // digits, jaws and fangs. Condition no longer changes transparency—starving
    // animals do not become ghosts.
    drawCreature(ctx, o, r, { detail: r >= 3 });
    if(selectedLineage!=null&&o.clade===selectedLineage){
      ctx.globalAlpha=1;ctx.strokeStyle=PAL.chalk;ctx.lineWidth=Math.max(1,1.15*s);
      ctx.beginPath();ctx.arc(0,0,r*1.48,0,Math.PI*2);ctx.stroke();
    }
    ctx.restore();
  }

  // frame
  ctx.strokeStyle = PAL.rule; ctx.lineWidth = 1;
  ctx.strokeRect(X(0)+0.5, Y(0)+0.5, cfg.w*s-1, cfg.h*s-1);
}

function timelineMarkerPositions(ticks,entries,width,minColumns){
  if(!ticks||!ticks.length||!entries||!entries.length||!Number.isFinite(width))return[];
  const first=ticks[0],last=ticks[ticks.length-1],cols=Math.max(ticks.length,minColumns||120);
  const step=ticks.length>1?(last-first)/(ticks.length-1):1;
  return entries.filter(e=>e.type!=='start'&&e.tick>=first&&e.tick<=last).map(e=>({
    entry:e,x:((e.tick-first)/Math.max(1e-9,step))*width/cols,
  }));
}

function timelineMarkerColor(entry){
  if(entry&&entry.color)return entry.color;
  if(!entry)return PAL.chalkDim;
  if(entry.type==='intervention')return PAL.warn;
  if(entry.type==='environment')return PAL.food;
  if(entry.type==='adaptation')return PAL.size;
  if(entry.type==='speciation'||entry.type==='merge')return PAL.sense;
  if(entry.type==='extinction')return PAL.speed;
  return PAL.chalkDim;
}

function drawTimelineEvidence(ctx,ticks,W,H){
  if(!ctx||!state)return;
  const selected=typeof UI!=='undefined'?UI.selectedNotebookId:null;
  for(const marker of timelineMarkerPositions(ticks,state.notebook||[],W,120)){
    const active=selected!=null&&marker.entry.id===selected;
    ctx.globalAlpha=active?1:.48;ctx.strokeStyle=active?PAL.chalk:timelineMarkerColor(marker.entry);
    ctx.lineWidth=active?2:1;ctx.beginPath();ctx.moveTo(marker.x+.5,0);ctx.lineTo(marker.x+.5,H);ctx.stroke();
    ctx.fillStyle=active?PAL.chalk:timelineMarkerColor(marker.entry);ctx.fillRect(marker.x-2,0,active?5:3,active?6:4);
  }
  ctx.globalAlpha=1;
  if(ticks&&ticks.length){
    const dpr=Math.min(2,window.devicePixelRatio||1);ctx.font=`600 ${Math.round(8*dpr)}px ui-monospace, Menlo, monospace`;
    ctx.textBaseline='bottom';ctx.fillStyle=PAL.chalkDim;ctx.fillText(`tick ${Number(ticks[0]).toLocaleString()}`,5,H-3);
    if(state.cfg&&(state.cfg.seasonal||state.cfg.dayNight)){
      ctx.textAlign='center';ctx.fillText(environmentPhase(state.tick,state.cfg).toUpperCase(),W/2,H-3);
    }
    ctx.textAlign='right';ctx.fillText(`tick ${Number(ticks[ticks.length-1]).toLocaleString()}`,W-5,H-3);ctx.textAlign='left';
  }
}

/* ---------- The drift ribbon ----------
   The signature element. Each trait gets a horizontal band; within a band, time
   runs left to right and the population's distribution for that trait is drawn as
   a vertical density column per sample. Watching the bright core of a band migrate
   upward over a few hundred generations IS natural selection, made visible. A mean
   line alone would hide the variance the process actually acts on. */
function drawRibbon(){
  if (!_ribbonCtx || !state) return;
  const ctx = _ribbonCtx;
  const W = _ribbon.width, H = _ribbon.height;
  ctx.fillStyle = PAL.well; ctx.fillRect(0,0,W,H);

  const bands = TRAITS.length;
  const pad = 3;
  const bh = (H - pad*(bands+1)) / bands;
  const hist = state.ribbon || [];
  const cols = Math.max(1, hist.length);
  const cw = W / Math.max(cols, 120);

  TRAITS.forEach((t, bi) => {
    const top = pad + bi*(bh+pad);

    ctx.fillStyle = PAL.medium;
    ctx.fillRect(0, top, W, bh);

    for (let c = 0; c < hist.length; c++){
      const bins = hist[c][t.key];
      if (!bins) continue;
      let peak = 1;
      for (const v of bins) if (v > peak) peak = v;
      const nb = bins.length;
      const x = c * cw;
      for (let b = 0; b < nb; b++){
        const v = bins[b] / peak;
        if (v <= 0.012) continue;
        const y = top + bh - ((b+1)/nb)*bh;
        ctx.globalAlpha = Math.min(1, 0.10 + v*0.95);
        ctx.fillStyle = t.color;
        ctx.fillRect(x, y, Math.max(1, cw+0.6), Math.max(1, bh/nb + 0.6));
      }
    }
    ctx.globalAlpha = 1;

    // label + current mean
    const st = traitStats(t.key);
    ctx.fillStyle = PAL.chalkDim;
    ctx.font = `600 ${Math.round(9.5*Math.min(2,window.devicePixelRatio||1))}px ui-monospace, Menlo, monospace`;
    ctx.textBaseline = 'top';
    ctx.fillText(t.label.toUpperCase(), 6, top + 4);
    ctx.fillStyle = t.color;
    ctx.textAlign = 'right';
    ctx.fillText(st.mean.toFixed(t.key==='sense'?1:2), W - 6, top + 4);
    ctx.textAlign = 'left';

    ctx.strokeStyle = PAL.rule; ctx.lineWidth = 1;
    ctx.strokeRect(0.5, top+0.5, W-1, bh-1);
  });
  drawTimelineEvidence(ctx,state.ribbonTicks||[],W,H);
}



/* ---------- The census strip ----------
   Stacked absolute population by species over time. This is where competitive
   exclusion is legible as a shape: one band swelling while another is pinched to
   nothing. Absolute counts rather than shares, so a total collapse reads
   differently from a species merely losing ground — with shares, a population
   crashing from 900 to 9 while still holding 60% would look like it was winning. */
let _census = null, _censusCtx = null;

function initCensus(){
  _census = document.getElementById('census');
  if (!_census) return false;
  _censusCtx = _census.getContext('2d');
  return true;
}

function drawCensus(){
  if (!_censusCtx || !state) return;
  const ctx = _censusCtx, W = _census.width, H = _census.height;
  ctx.fillStyle = PAL.well; ctx.fillRect(0,0,W,H);
  ctx.fillStyle = PAL.medium; ctx.fillRect(0,0,W,H);

  const hist = state.census || [];
  if (!hist.length){ return; }

  let peak = 1;
  for (const s of hist){
    let tot = 0;
    for (const item of (s.lineages||[])) tot += item.n;
    if(!(s.lineages||[]).length)for(const v of (s.clades||[]))tot+=v;
    if (tot > peak) peak = tot;
  }

  const cw = W / Math.max(hist.length, 120);
  const selectedLineage=selectedLineageIdForRender();
  for (let i = 0; i < hist.length; i++){
    const s = hist[i];
    let acc = 0;
    const lineages=(s.lineages&&s.lineages.length)?s.lineages:(s.clades||[]).map((n,id)=>({id,n}));
    for (const lineage of lineages){
      const id=lineage.id,v=lineage.n;
      if (v <= 0){ continue; }
      const h0 = (acc / peak) * H;
      const h1 = ((acc + v) / peak) * H;
      ctx.globalAlpha=selectedLineage==null||id===selectedLineage?1:.14;
      ctx.fillStyle = cladeColor(Number(id));
      ctx.fillRect(i*cw, H - h1, Math.max(1, cw + 0.6), Math.max(1, h1 - h0));
      acc += v;
    }
  }
  ctx.globalAlpha=1;

  drawTimelineEvidence(ctx,hist.map(s=>s.tick),W,H);

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  ctx.font = `600 ${Math.round(9.5*dpr)}px ui-monospace, Menlo, monospace`;
  ctx.textBaseline = 'top';
  ctx.fillStyle = PAL.chalkDim;
  const latest=hist[hist.length-1]||{},selectedNow=(latest.lineages||[]).find(l=>l.id===selectedLineage);
  const censusLabel=selectedLineage==null
    ?'CENSUS \u00b7 '+(latest.nClades||0)+' SPECIES'
    :`CENSUS · ${cladeName(selectedLineage).toUpperCase()} ${selectedNow?selectedNow.n:0} ALIVE`;
  ctx.fillText(censusLabel, 6, 4);
  ctx.textAlign = 'right';
  ctx.fillText('peak ' + peak, W - 6, 4);
  ctx.textAlign = 'left';

  ctx.strokeStyle = PAL.rule; ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, W-1, H-1);
}

function drawAll(){ drawWell(); drawRibbon(); drawCensus(); drawSpecimenCard(); }

/* ---------- Specimen card ----------
   A large portrait of one lineage's current average form. This is where morphology
   earns its keep: at well scale a creature is a few pixels, but here 20,000 ticks of
   accumulated drift becomes something you can actually look at and compare against
   the same lineage twenty minutes earlier.

   Draws a stable real medoid plus real divergent variants. It never synthesises a
   mean animal carrying a gene combination that no living individual possesses. */
let _card = null, _cardCtx = null;

function initCard(){
  _card = document.getElementById('specimen');
  if (!_card) return false;
  _cardCtx = _card.getContext('2d');
  return true;
}

function morphologyDistance(a,b){
  let sum=0, axes=0;
  for(const key of ['speed','size','sense','diet']){
    const t=TRAITS.find(x=>x.key===key), d=((a[key]||0)-(b[key]||0))/(t.max-t.min);
    sum+=d*d;axes++;
  }
  for(const key of PHYSICAL_ADAPTATIONS){
    if(!!(a.ad&&a.ad[key])!==!!(b.ad&&b.ad[key])) sum+=0.10;
    axes++;
  }
  if(typeof COSMETIC_GENE_KEYS!=='undefined'){
    const ac=cosmeticGenomeFor(a),bc=cosmeticGenomeFor(b);
    for(const key of COSMETIC_GENE_KEYS){const d=ac[key]-bc[key];sum+=d*d*.72;axes+=.72;}
  }
  return Math.sqrt(sum/Math.max(1,axes));
}

/* The central portrait is an actual living medoid—the member closest to its clade's
   continuous-trait means—not a synthetic body carrying a combination of majority
   genes that may exist in no individual. Two farthest-sampled real members make
   polymorphism visible without changing identity every frame. */
function representativeMembers(clade,limit){
  const members=(state.organisms||[]).filter(o=>o.clade===clade.id).slice().sort((a,b)=>a.id-b.id);
  if(!members.length)return [];
  const target=clade.traits||members[0];
  let medoid=members[0],best=Infinity;
  for(const o of members){
    let d=0;
    for(const key of ['speed','size','sense','diet']){
      const t=TRAITS.find(x=>x.key===key),z=(o[key]-target[key])/(t.max-t.min);d+=z*z;
    }
    if(d<best){best=d;medoid=o;}
  }
  const chosen=[medoid],want=Math.min(limit||3,members.length);
  while(chosen.length<want){
    let pick=null,pickD=-1;
    for(const candidate of members){
      if(chosen.includes(candidate))continue;
      let nearest=Infinity;
      for(const prior of chosen)nearest=Math.min(nearest,morphologyDistance(candidate,prior));
      if(nearest>pickD){pickD=nearest;pick=candidate;}
    }
    if(!pick)break;
    chosen.push(pick);
  }
  return chosen;
}

function fitSpecimenHeight(nClades){
  if(!_card||!_card.style||!_card.getBoundingClientRect)return;
  const rows=Math.max(1,nClades);
  const cssH=Math.max(380,rows*300),next=cssH+'px';
  if(_card.style.height===next)return;
  _card.style.height=next;
  if(_use3D&&typeof fitThreeRender==='function'){fitThreeRender();return;}
  const rect=_card.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
  _card.width=Math.max(1,Math.round(rect.width*dpr));
  _card.height=Math.max(1,Math.round(rect.height*dpr));
}

function drawSpecimenCard(){
  if(_use3D&&typeof drawThreeSpecimens==='function'){
    if(!state)return;
    const live=(state.clades||[]).filter(c=>c.n>=5);
    fitSpecimenHeight(live.length);
    drawThreeSpecimens();
    return;
  }
  if (!_cardCtx || !state) return;
  const clades = (state.clades || []).filter(c => c.n >= 5);
  fitSpecimenHeight(clades.length);
  const ctx = _cardCtx, W = _card.width, H = _card.height;
  ctx.fillStyle = PAL.well; ctx.fillRect(0,0,W,H);
  if (!clades.length){
    ctx.fillStyle = PAL.chalkDim;
    ctx.font = `500 ${Math.round(11*Math.min(2,window.devicePixelRatio||1))}px ui-monospace, Menlo, monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('no viable species', W/2, H/2);
    ctx.textAlign = 'left';
    return;
  }

  // Every viable lineage gets a full-width field-guide cell. The canvas grows
  // vertically instead of shrinking anatomy or silently dropping later species; the
  // containing sidebar already scrolls.
  const cols=1,rows=clades.length;
  const cw = W / cols,ch=H/rows;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const viableIds=new Set(clades.map(c=>c.id));
  const maxCurrentSize=Math.max(0.35,...(state.organisms||[]).filter(o=>viableIds.has(o.clade)).map(o=>o.size));

  for (let i = 0; i < clades.length; i++){
    const c = clades[i];
    const col=i%cols,row=Math.floor(i/cols),x0=col*cw,y0=row*ch;
    const cx=x0+cw*0.50,cy=y0+ch*0.38;
    const reps=representativeMembers(c,3),main=reps[0];
    // One fixed scale across every current species. Fit to the largest living body,
    // not the theoretical 3.2 maximum, so an ordinary size-1 lineage uses the field-
    // guide space instead of remaining postage-stamp small.
    const unit=Math.min(cw*0.19,ch*0.15)/maxCurrentSize;

    ctx.fillStyle=PAL.medium;ctx.globalAlpha=0.54;ctx.fillRect(x0+2,y0+2,cw-4,ch-4);ctx.globalAlpha=1;
    ctx.strokeStyle=PAL.rule;ctx.lineWidth=1;ctx.strokeRect(x0+2.5,y0+2.5,cw-5,ch-5);

    ctx.fillStyle=cladeColor(c.id);
    ctx.beginPath();ctx.arc(x0+12*dpr,y0+13*dpr,3.4*dpr,0,Math.PI*2);ctx.fill();
    ctx.font=`700 ${Math.round(10.5*dpr)}px ui-monospace, Menlo, monospace`;
    ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText(cladeName(c.id),x0+19*dpr,y0+13*dpr);
    ctx.fillStyle=PAL.chalkDim;ctx.textAlign='right';
    ctx.font=`500 ${Math.round(8.5*dpr)}px ui-monospace, Menlo, monospace`;
    ctx.fillText(`n=${c.n}`,x0+cw-8*dpr,y0+13*dpr);

    if(main){
      ctx.save();ctx.translate(cx,cy);
      drawCreature(ctx,main,Math.max(1.6,unit*main.size),{detail:true,portrait:true});
      ctx.restore();
      ctx.fillStyle=PAL.chalk;ctx.textAlign='center';ctx.textBaseline='top';
      ctx.font=`600 ${Math.round(8.5*dpr)}px ui-monospace, Menlo, monospace`;
      ctx.fillText(`representative #${main.id} · gen ${main.gen}`,cx,y0+ch*0.66);
    }

    const variants=reps.slice(1);
    for(let j=0;j<variants.length;j++){
      const o=variants[j],vx=x0+cw*(j===0?0.28:0.72),vy=y0+ch*0.80;
      ctx.save();ctx.translate(vx,vy);
      drawCreature(ctx,o,Math.max(1.3,unit*o.size*0.60),{detail:true,portrait:true});
      ctx.restore();
      ctx.fillStyle=PAL.chalkDim;ctx.textAlign='center';ctx.textBaseline='top';
      ctx.font=`500 ${Math.round(7.5*dpr)}px ui-monospace, Menlo, monospace`;
      ctx.fillText(`#${o.id}`,vx,y0+ch*0.92);
    }
    if(variants.length){
      ctx.fillStyle=PAL.chalkDim;ctx.textAlign='left';ctx.textBaseline='bottom';
      ctx.font=`500 ${Math.round(7*dpr)}px ui-monospace, Menlo, monospace`;
      ctx.fillText('actual variants · 0.6×',x0+7*dpr,y0+ch-6*dpr);
    }
    ctx.textAlign='left';
  }
}
