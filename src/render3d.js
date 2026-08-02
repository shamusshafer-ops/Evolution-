/* ============================================================================
   render3d.js — optional Three.js views. Reads state, never mutates it.

   The simulation remains two-dimensional. This module gives the same organisms a
   three-dimensional, homologous terrestrial anatomy for the well and specimen
   cards. It deliberately owns no randomness: gait phases are functions of tick and
   organism id, representatives are selected by stable distance and every other
   visual decision is derived from inherited state.

   Three.js is vendored separately and may be absent in tests or on a browser without
   WebGL. No THREE property is touched at module evaluation time; initThreeRender()
   simply returns false when the optional renderer cannot start.
   ========================================================================== */

let _threeReady = false;
let _threeMapCanvas = null, _threeCardCanvas = null;
let _threeCardOverlay = null;
let _threeMapRenderer = null, _threeCardRenderer = null;
let _threeMapScene = null, _threeCardCamera = null;
let _threeWorldCamera = null, _threeGround = null, _threeGrid = null;
let _threeWorldParts = null, _threeEnvironmentMeshes = null;
let _threeWorldCapacity = 0, _threeCardRows = [];
let _threeCardSelections = new Map(), _threeCardSelectionState = null;
let _threeGeometryCache = null, _threeMaterialCache = null;
let _threeHemisphereLight = null, _threeSunLight = null;
let _threeAmbientLight = null, _threeFillLight = null;
let _threeCardOrbit = { yaw:0.64, pitch:0.22, zoom:1 };
let _threeWorldView = { zoom:1, cx:null, cy:null, yaw:-0.72, pitch:0.94 };
let _threeCardHandlers = null;
let _threeOverlaySignature = '';
let _threeWorldBatchCache = null;

const _THREE_MIN_ZOOM = 1;
const _THREE_MAX_ZOOM = 24;
const _THREE_PHYSICAL = ['armor','venom','nocturnal','carnivore','claws','camouflage','courtship'];
const _THREE_BEHAVIOURAL = ['pack','philopatry','latebreeder','flocking','kinshare','parentalcare'];

function _threeFinite(v, fallback){ return Number.isFinite(v) ? v : fallback; }
function _threeClamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }
function _threeTraitDef(key){
  return typeof TRAITS !== 'undefined' ? TRAITS.find(t => t.key === key) : null;
}
function _threeTraitFraction(o, key){
  const t = _threeTraitDef(key);
  if (!t) return 0;
  const value = o && o[key] != null ? Number(o[key]) : t.init;
  return _threeClamp((value - t.min) / Math.max(1e-9, t.max - t.min), 0, 1);
}
function _threeHex(value, fallback){
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}
function _threeCladeColor(id){
  if (typeof CLADE_COLORS === 'undefined' || !CLADE_COLORS.length) return '#4EA8DE';
  const n = Math.abs(Math.trunc(_threeFinite(Number(id), 0)));
  return CLADE_COLORS[n % CLADE_COLORS.length];
}
function _threeAdaptationColor(key, fallback){
  if (typeof ADAPT_BY_KEY !== 'undefined' && ADAPT_BY_KEY[key]){
    return _threeHex(ADAPT_BY_KEY[key].color, fallback);
  }
  return fallback;
}

/* Pure, size-independent anatomical description. bodyScale is the only dimension
   controlled by the size trait; all other measurements describe proportions in the
   shared ancestral coordinate system. Keeping this pure lets tests prove that 3D
   rendering cannot consume simulation RNG or feed anything back into selection. */
function phenotype3DDescriptor(o){
  o = o || {};
  const speed = _threeTraitFraction(o, 'speed');
  const sense = _threeTraitFraction(o, 'sense');
  const diet = _threeTraitFraction(o, 'diet');
  const wariness = _threeTraitFraction(o, 'wariness');
  const plasticity = _threeTraitFraction(o, 'plasticity');
  const sizeDef = _threeTraitDef('size');
  const rawSize = o.size == null ? (sizeDef ? sizeDef.init : 1) : Number(o.size);
  const bodyScale = sizeDef
    ? _threeClamp(_threeFinite(rawSize, sizeDef.init), sizeDef.min, sizeDef.max)
    : Math.max(0.05, _threeFinite(rawSize, 1));
  const adaptations = {};
  const known = typeof ADAPTATIONS !== 'undefined'
    ? ADAPTATIONS.map(a => a.key)
    : Object.keys(o.ad || {}).sort();
  for (const key of known) adaptations[key] = !!(o.ad && o.ad[key]);
  const carnivore = !!adaptations.carnivore;
  const cosmetics=typeof cosmeticGenomeFor==='function'?cosmeticGenomeFor(o):{};
  const cv=(key,fallback)=>_threeClamp(_threeFinite(cosmetics[key],fallback),0,1);
  const headProfile=cv('headProfile',.5),muzzleCurve=cv('muzzleCurve',.5);
  const bodyHeight=cv('bodyHeight',.5),shoulderLine=cv('shoulderLine',.5);
  const tailProportion=cv('tailLength',.5),tailCurl=cv('tailCurl',.5);
  const tailTaper=cv('tailTaper',.5),earSize=cv('earSize',.5),horns=cv('horns',.42);
  const covering=cv('covering',.5),coatLength=cv('coatLength',.48);
  const pattern=cv('pattern',.5),pigment=cv('pigment',.5);
  const coveringNames=['smooth skin','scales','fur','feathers'];
  const coveringIndex=Math.min(3,Math.floor(covering*4));
  const pigmentPalette=['#5E756E','#687D73','#7B7466','#746B70','#65747D','#80775E'];

  return {
    speed, sense, diet, wariness, plasticity, bodyScale,
    cosmetics:Object.assign({},cosmetics),
    headProfile,muzzleCurve,bodyHeight,shoulderLine,tailProportion,tailCurl,tailTaper,
    earSize,horns,covering,coatLength,pattern,pigment,
    coveringType:coveringNames[coveringIndex],
    coveringIndex,
    torsoLength:(2.18 - speed*0.22)*(0.94+shoulderLine*.12),
    torsoWidth:(1.18 - speed*0.30)*(0.92+shoulderLine*.16),
    torsoDepth:(1.02 - speed*0.10)*(0.92+shoulderLine*.15),
    neckLength:0.38 + wariness*0.22,
    neckRadius:(0.28 + (1-speed)*0.07)*(0.92+headProfile*.16),
    headLength:(0.76 + (1-diet)*0.13 + (carnivore?0.12:0))*(0.86+headProfile*.28),
    headWidth:(0.62 + diet*0.20 + (carnivore?0.12:0))*(1.13-headProfile*.23),
    headDepth:(0.64 + diet*0.20 + (carnivore?0.24:0))*(0.88+headProfile*.24),
    snoutLength:(0.84 - diet*0.38 + (carnivore?0.08:0))*(0.86+muzzleCurve*.28),
    snoutWidth:(0.34 + diet*0.34 + (carnivore?0.12:0))*(1.12-muzzleCurve*.22),
    snoutDepth:(0.30 + diet*0.30 + (carnivore?0.13:0))*(0.88+muzzleCurve*.24),
    jawDepth:0.20 + diet*0.28 + (carnivore?0.25:0),
    eyeRadius:0.075 + sense*0.115,
    upperLegLength:0.68 + speed*0.34,
    lowerLegLength:0.58 + speed*0.52,
    footLength:0.30 + speed*0.25,
    stanceHeight:(1.02 + speed*0.62)*(0.82+bodyHeight*.36),
    tailLength:(1.55 + (1-diet)*0.18)*(0.72+tailProportion*.58),
    tailBaseRadius:(0.25 + (1-speed)*0.06)*(0.88+(1-tailTaper)*.25),
    tailCurve:(tailCurl-.5)*1.15,
    tailTipRadius:0.018+(1-tailTaper)*0.075,
    earLength:0.10+earSize*.34,
    earWidth:0.07+earSize*.15,
    hornLength:Math.max(0,(horns-.58)/.42)*.72,
    surfaceRelief:0.025+coatLength*.075,
    patternStrength:Math.abs(pattern-.5)*2,
    baseColor:pigmentPalette[Math.min(pigmentPalette.length-1,Math.floor(pigment*pigmentPalette.length))],
    accentColor:_threeCladeColor(o.clade || 0),
    adaptations,
  };
}

function _threeApi(){
  return typeof globalThis !== 'undefined' ? globalThis.THREE : null;
}
function _threeHasWebGL(){
  if (typeof document === 'undefined') return false;
  return typeof WebGLRenderingContext !== 'undefined' || typeof WebGL2RenderingContext !== 'undefined';
}
function _threePixelRatio(){
  return Math.min(2, typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1);
}
function _threeState(){ return typeof state !== 'undefined' ? state : null; }
function _threeConfig(){
  const s = _threeState();
  if (s && s.cfg) return s.cfg;
  return typeof WORLD !== 'undefined' ? WORLD : {w:900,h:620};
}

function _threeGeometry(key){
  const T = _threeApi();
  if (!T) return null;
  if (_threeGeometryCache.has(key)) return _threeGeometryCache.get(key);
  let geometry;
  if (key === 'sphere') geometry = new T.SphereGeometry(1, 12, 8);
  else if (key === 'sphereHi') geometry = new T.SphereGeometry(1, 28, 18);
  else if (key === 'eye') geometry = new T.SphereGeometry(1, 10, 7);
  else if (key === 'limb') geometry = new T.CylinderGeometry(0.72, 1, 1, 7, 1);
  else if (key === 'limbHi') geometry = new T.CylinderGeometry(0.76, 1, 1, 16, 3);
  else if (key === 'tail') geometry = new T.CylinderGeometry(0.55, 1, 1, 8, 1);
  else if (key === 'cone') geometry = new T.ConeGeometry(1, 1, 5, 1);
  else if (key === 'plate') geometry = new T.ConeGeometry(1, 1, 4, 1);
  else if (key === 'feather'){
    geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.Float32BufferAttribute([
      0,0,0, -.55,.30,0, 0,1,0, .55,.30,0,
    ],3));
    geometry.setIndex([0,1,2,0,2,3]);geometry.computeVertexNormals();
  }
  else if (key === 'food') geometry = new T.DodecahedronGeometry(1, 0);
  else if (key === 'ground') geometry = new T.PlaneGeometry(1,1);
  else if (key === 'halo'){
    geometry = new T.RingGeometry(.82,1,24,1);
    geometry.rotateX(-Math.PI/2);
  }
  else if (key === 'site'){
    geometry = new T.CircleGeometry(1, 24);
    geometry.rotateX(-Math.PI/2);
  } else geometry = new T.BoxGeometry(1, 1, 1);
  _threeGeometryCache.set(key, geometry);
  return geometry;
}

function _threeMaterial(key, color, options){
  const T = _threeApi();
  options = options || {};
  const cacheKey = [key,color,options.vertexColors?'v':'',options.emissive||'',options.transparent?'t':''].join('|');
  if (_threeMaterialCache.has(cacheKey)) return _threeMaterialCache.get(cacheKey);
  let material;
  if (options.basic){
    material = new T.MeshBasicMaterial({
      color:color, vertexColors:!!options.vertexColors, transparent:!!options.transparent,
      opacity:options.opacity == null ? 1 : options.opacity, depthWrite:options.depthWrite !== false,
      side:options.doubleSide ? T.DoubleSide : T.FrontSide,
    });
  } else {
    material = new T.MeshStandardMaterial({
      color:color, vertexColors:!!options.vertexColors,
      roughness:options.roughness == null ? 0.76 : options.roughness,
      metalness:options.metalness == null ? 0.02 : options.metalness,
      emissive:options.emissive || '#000000',
      emissiveIntensity:options.emissiveIntensity || 0,
      side:options.doubleSide ? T.DoubleSide : T.FrontSide,
    });
  }
  if(options.toneMapped===false)material.toneMapped=false;
  _threeMaterialCache.set(cacheKey, material);
  return material;
}

function _threeMakeWorldPart(name, geometry, material){
  const T = _threeApi();
  const mesh = new T.InstancedMesh(geometry, material, _threeWorldCapacity);
  mesh.name = 'population-' + name;
  mesh.count = 0;
  mesh.frustumCulled = false;
  if (T.DynamicDrawUsage) mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
  _threeMapScene.add(mesh);
  _threeWorldParts[name] = mesh;
  return mesh;
}

function _threeBuildWorldBatches(){
  const T = _threeApi();
  _threeWorldParts = {};
  _threeWorldCapacity = typeof LIFE !== 'undefined' ? LIFE.maxPop : 1400;
  /* A real brightness floor matters here: at whole-world scale most anatomy covers
     only a handful of pixels, and software WebGL otherwise averages the shaded
     facets almost to black. Modest neutral emission keeps inherited colour legible
     without flattening the directional modelling visible after zooming in. */
  const skin = _threeMaterial('world-skin','#ffffff',{vertexColors:true,roughness:0.72,emissive:'#5C7169',emissiveIntensity:0.98});
  const dark = _threeMaterial('world-dark','#ffffff',{vertexColors:true,roughness:0.80,emissive:'#435951',emissiveIntensity:0.88});
  const glossy = _threeMaterial('world-eye','#ffffff',{vertexColors:true,roughness:0.22,emissive:'#D7E3E3',emissiveIntensity:0.58});
  const feather = _threeMaterial('world-feather','#ffffff',{vertexColors:true,roughness:0.82,emissive:'#435951',emissiveIntensity:0.82,doubleSide:true});
  const flockHalo = _threeMaterial('world-flock',_threeAdaptationColor('flocking','#58B7D9'),
    {basic:true,transparent:true,opacity:.32,depthWrite:false,doubleSide:true,toneMapped:false});
  for (const key of ['torso','shoulder','pelvis','head','snout','jaw','footFL','footFR','footHL','footHR',
    'camoA','camoB','patternA','patternB','patternC','tailJ0','tailJ1','tailJ2','tailJ3','furRuff']){
    _threeMakeWorldPart(key,_threeGeometry('sphere'),key.startsWith('camo')?dark:skin);
  }
  _threeMakeWorldPart('neck',_threeGeometry('limb'),skin);
  for (const key of ['upperFL','upperFR','upperHL','upperHR','lowerFL','lowerFR','lowerHL','lowerHR']){
    _threeMakeWorldPart(key,_threeGeometry('limb'),skin);
  }
  for (const key of ['tail0','tail1','tail2','tail3','tail4']) _threeMakeWorldPart(key,_threeGeometry('tail'),skin);
  _threeMakeWorldPart('eyeL',_threeGeometry('eye'),glossy);
  _threeMakeWorldPart('eyeR',_threeGeometry('eye'),glossy);
  for (const key of ['armor','crest','earL','earR','scaleRidge']) _threeMakeWorldPart(key,_threeGeometry('plate'),dark);
  _threeMakeWorldPart('featherMantle',_threeGeometry('feather'),feather);
  for (const key of ['fangL','fangR','clawFL','clawFR','hornL','hornR','tailTuft']) _threeMakeWorldPart(key,_threeGeometry('cone'),dark);
  _threeMakeWorldPart('flockHalo',_threeGeometry('halo'),flockHalo);
  if (T.ColorManagement && 'enabled' in T.ColorManagement) T.ColorManagement.enabled = true;
}

function _threeBuildWorldScene(){
  const T = _threeApi();
  _threeMapScene = new T.Scene();
  _threeMapScene.background = new T.Color(typeof PAL !== 'undefined' ? PAL.well : '#0B1417');
  _threeAmbientLight = new T.AmbientLight('#E6F3EF',1.65);
  _threeHemisphereLight = new T.HemisphereLight('#ECFAF5','#31545D',2.45);
  _threeSunLight = new T.DirectionalLight('#FFF2CF',3.15);
  _threeSunLight.position.set(-300,480,260);
  _threeFillLight = new T.DirectionalLight('#85BFE0',1.15);
  _threeFillLight.position.set(420,210,-360);
  _threeMapScene.add(_threeAmbientLight,_threeHemisphereLight,_threeSunLight,_threeFillLight);
  _threeGround = new T.Mesh(
    _threeGeometry('ground'),
    _threeMaterial('ground','#152B31',{roughness:0.96,emissive:'#081214',emissiveIntensity:.35})
  );
  _threeGround.rotation.x = -Math.PI/2;
  _threeGround.position.y = -0.04;
  _threeMapScene.add(_threeGround);
  _threeWorldCamera = new T.OrthographicCamera(-1,1,1,-1,0.1,5000);
  _threeBuildWorldBatches();
  _threeEnvironmentMeshes = {sites:null,foodSoft:null,foodWoody:null,sitesCapacity:0,foodSoftCapacity:0,foodWoodyCapacity:0};
}

function _threeSetRendererDefaults(renderer){
  const T = _threeApi();
  renderer.setPixelRatio(_threePixelRatio());
  renderer.shadowMap.enabled = false;
  if (T.SRGBColorSpace) renderer.outputColorSpace = T.SRGBColorSpace;
  if (T.ACESFilmicToneMapping != null){
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.26;
  }
}

function initThreeRender(wellCanvas, cardCanvas){
  disposeThreeRender();
  const T = _threeApi();
  if (!T || !T.WebGLRenderer || !wellCanvas || !cardCanvas || !_threeHasWebGL()) return false;
  try {
    _threeMapCanvas = wellCanvas;
    _threeCardCanvas = cardCanvas;
    _threeCardOverlay = typeof document !== 'undefined' ? document.getElementById('specimenOverlay') : null;
    if(_threeCardOverlay)_threeCardOverlay.removeAttribute('aria-hidden');
    _threeGeometryCache = new Map();
    _threeMaterialCache = new Map();
    _threeWorldBatchCache = null;
    _threeMapRenderer = new T.WebGLRenderer({canvas:wellCanvas,antialias:true,alpha:false,powerPreference:'high-performance'});
    _threeCardRenderer = new T.WebGLRenderer({canvas:cardCanvas,antialias:true,alpha:false,powerPreference:'high-performance'});
    _threeSetRendererDefaults(_threeMapRenderer);
    _threeSetRendererDefaults(_threeCardRenderer);
    _threeBuildWorldScene();
    _threeCardCamera = new T.PerspectiveCamera(31,1,0.1,100);
    _threeReady = true;
    resetThreeWorldView();
    bindThreeSpecimenControls();
    fitThreeRender();
    return true;
  } catch (err){
    disposeThreeRender();
    return false;
  }
}

function _threeCanvasSize(renderer, canvas){
  if (!renderer || !canvas) return {width:1,height:1};
  const rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : {width:canvas.clientWidth||canvas.width||1,height:canvas.clientHeight||canvas.height||1};
  const width = Math.max(1,Math.round(rect.width||canvas.clientWidth||canvas.width||1));
  const height = Math.max(1,Math.round(rect.height||canvas.clientHeight||canvas.height||1));
  const dpr=_threePixelRatio();
  if(!renderer.getPixelRatio||renderer.getPixelRatio()!==dpr)renderer.setPixelRatio(dpr);
  const T=_threeApi(),current=renderer.getSize?renderer.getSize(new T.Vector2()):null;
  if(!current||Math.round(current.x)!==width||Math.round(current.y)!==height)renderer.setSize(width,height,false);
  return {width,height};
}

function fitThreeRender(){
  if (!_threeReady) return false;
  _threeCanvasSize(_threeMapRenderer,_threeMapCanvas);
  _threeCanvasSize(_threeCardRenderer,_threeCardCanvas);
  _threeUpdateWorldCamera();
  return true;
}

function _threeDisposeObject(object){
  if (!object || !object.traverse) return;
  object.traverse(child => {
    if (child.userData && child.userData.ownedGeometry && child.geometry && child.geometry.dispose) child.geometry.dispose();
    if (child.userData && child.userData.ownedMaterial && child.material && child.material.dispose) child.material.dispose();
  });
}

function disposeThreeRender(){
  if (_threeCardHandlers && _threeCardCanvas){
    for (const item of _threeCardHandlers) _threeCardCanvas.removeEventListener(item[0],item[1],item[2]);
  }
  _threeCardHandlers = null;
  for (const row of _threeCardRows) _threeDisposeObject(row.scene);
  _threeCardRows = [];
  _threeCardSelections.clear();_threeCardSelectionState=null;
  if (_threeMapRenderer){ try{_threeMapRenderer.dispose();}catch(_err){} }
  if (_threeCardRenderer){ try{_threeCardRenderer.dispose();}catch(_err){} }
  if (_threeGeometryCache) for (const g of _threeGeometryCache.values()) if (g && g.dispose) g.dispose();
  if (_threeMaterialCache) for (const m of _threeMaterialCache.values()) if (m && m.dispose) m.dispose();
  _threeReady=false;
  _threeMapRenderer=_threeCardRenderer=null;
  _threeMapScene=_threeWorldCamera=_threeCardCamera=null;
  _threeMapCanvas=_threeCardCanvas=null;
  if(_threeCardOverlay){
    while(_threeCardOverlay.firstChild)_threeCardOverlay.removeChild(_threeCardOverlay.firstChild);
    _threeCardOverlay.setAttribute('aria-hidden','true');
  }
  _threeCardOverlay=null;
  _threeOverlaySignature='';
  _threeWorldBatchCache=null;
  _threeGround=_threeGrid=null;
  _threeWorldParts=_threeEnvironmentMeshes=null;
  _threeGeometryCache=_threeMaterialCache=null;
  return true;
}

function _threeUpdateWorldCamera(){
  if (!_threeReady || !_threeWorldCamera || !_threeMapCanvas) return;
  const cfg = _threeConfig();
  const rect = _threeMapCanvas.getBoundingClientRect ? _threeMapCanvas.getBoundingClientRect() : {width:_threeMapCanvas.width,height:_threeMapCanvas.height};
  const aspect = Math.max(0.1,(rect.width||1)/Math.max(1,rect.height||1));
  const fitHalf = Math.max(cfg.h*0.68,cfg.w*0.68/aspect);
  const halfH = fitHalf / _threeClamp(_threeWorldView.zoom,_THREE_MIN_ZOOM,_THREE_MAX_ZOOM);
  const halfW = halfH*aspect;
  _threeWorldCamera.left=-halfW;_threeWorldCamera.right=halfW;
  _threeWorldCamera.top=halfH;_threeWorldCamera.bottom=-halfH;
  _threeWorldCamera.near=0.1;_threeWorldCamera.far=5000;
  const cx=_threeClamp(_threeFinite(_threeWorldView.cx,cfg.w/2),0,cfg.w);
  const cy=_threeClamp(_threeFinite(_threeWorldView.cy,cfg.h/2),0,cfg.h);
  _threeWorldView.cx=cx;_threeWorldView.cy=cy;
  const pitch=_threeClamp(_threeWorldView.pitch,0.40,1.42);
  const distance=Math.max(cfg.w,cfg.h)*1.55;
  const horizontal=Math.cos(pitch)*distance;
  _threeWorldCamera.position.set(
    cx+Math.sin(_threeWorldView.yaw)*horizontal,
    Math.sin(pitch)*distance,
    cy+Math.cos(_threeWorldView.yaw)*horizontal
  );
  _threeWorldCamera.up.set(0,1,0);
  _threeWorldCamera.lookAt(cx,0,cy);
  _threeWorldCamera.updateProjectionMatrix();
  _threeWorldCamera.updateMatrixWorld(true);
}

function resetThreeWorldView(){
  const cfg=_threeConfig();
  _threeWorldView={zoom:1,cx:cfg.w/2,cy:cfg.h/2,yaw:-0.72,pitch:0.94};
  _threeUpdateWorldCamera();
  return _threeReady;
}

function _threeGroundAtClient(clientX,clientY){
  const T=_threeApi();
  if (!_threeReady||!T||!_threeWorldCamera||!_threeMapCanvas)return null;
  const rect=_threeMapCanvas.getBoundingClientRect();
  const x=((clientX-rect.left)/Math.max(1,rect.width))*2-1;
  const y=-((clientY-rect.top)/Math.max(1,rect.height))*2+1;
  const raycaster=new T.Raycaster();
  raycaster.setFromCamera({x,y},_threeWorldCamera);
  const hit=new T.Vector3();
  const plane=new T.Plane(new T.Vector3(0,1,0),0);
  return raycaster.ray.intersectPlane(plane,hit) ? hit : null;
}

function panThreeWorldBy(clientDx,clientDy){
  if (!_threeReady||!_threeMapCanvas)return false;
  const rect=_threeMapCanvas.getBoundingClientRect();
  const x=rect.left+rect.width/2,y=rect.top+rect.height/2;
  const a=_threeGroundAtClient(x,y),b=_threeGroundAtClient(x+clientDx,y+clientDy);
  if (a&&b){_threeWorldView.cx+=a.x-b.x;_threeWorldView.cy+=a.z-b.z;_threeUpdateWorldCamera();}
  return true;
}

function zoomThreeWorldAt(factor,clientX,clientY){
  if (!_threeReady||!Number.isFinite(factor)||factor<=0)return false;
  const rect=_threeMapCanvas.getBoundingClientRect();
  const x=clientX==null?rect.left+rect.width/2:clientX;
  const y=clientY==null?rect.top+rect.height/2:clientY;
  const before=_threeGroundAtClient(x,y);
  _threeWorldView.zoom=_threeClamp(_threeWorldView.zoom*factor,_THREE_MIN_ZOOM,_THREE_MAX_ZOOM);
  _threeUpdateWorldCamera();
  const after=_threeGroundAtClient(x,y);
  if(before&&after){_threeWorldView.cx+=before.x-after.x;_threeWorldView.cy+=before.z-after.z;_threeUpdateWorldCamera();}
  return true;
}

function rotateThreeWorldBy(clientDx,clientDy){
  if (!_threeReady)return false;
  _threeWorldView.yaw+=_threeFinite(clientDx,0)*0.006;
  _threeWorldView.pitch=_threeClamp(_threeWorldView.pitch+_threeFinite(clientDy,0)*0.004,0.40,1.42);
  _threeUpdateWorldCamera();
  return true;
}

function _threeCompose(mesh,index,root,position,quaternion,scale,color){
  const T=_threeApi();
  const local=new T.Matrix4().compose(position,quaternion,scale);
  const world=new T.Matrix4().multiplyMatrices(root,local);
  mesh.setMatrixAt(index,world);
  if(color)mesh.setColorAt(index,color instanceof T.Color?color:new T.Color(color));
}

function _threePart(name,index,root,x,y,z,sx,sy,sz,color,quaternion){
  const T=_threeApi(),mesh=_threeWorldParts[name];
  _threeCompose(mesh,index,root,new T.Vector3(x,y,z),quaternion||new T.Quaternion(),new T.Vector3(Math.max(1e-5,sx),Math.max(1e-5,sy),Math.max(1e-5,sz)),color);
}

function _threeSegment(name,index,root,a,b,radius,color,visible){
  const T=_threeApi();
  if(!visible){_threePart(name,index,root,0,0,0,1e-5,1e-5,1e-5,color);return;}
  const av=new T.Vector3(a[0],a[1],a[2]),bv=new T.Vector3(b[0],b[1],b[2]);
  const delta=bv.clone().sub(av),length=Math.max(1e-5,delta.length());
  const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
  const mid=av.add(bv).multiplyScalar(0.5);
  _threeCompose(_threeWorldParts[name],index,root,mid,q,new T.Vector3(radius,length,radius),color);
}

function _threeUpdateCreatureBatches(){
  const T=_threeApi(),s=_threeState();
  if(!s||!_threeWorldParts)return;
  const pop=(s.organisms||[]).slice(0,_threeWorldCapacity);
  const tick=_threeFinite(s.tick,0);
  for(let i=0;i<pop.length;i++){
    const o=pop[i],d=phenotype3DDescriptor(o),ad=d.adaptations;
    const gait=Math.sin(tick*(0.025+d.speed*0.035)+_threeFinite(o.id,0)*0.73);
    const scale=d.bodyScale*2.55;
    const root=new T.Matrix4().compose(
      new T.Vector3(_threeFinite(o.x,0),0.16,_threeFinite(o.y,0)),
      new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),-_threeFinite(o.dir,0)),
      new T.Vector3(scale,scale,scale)
    );
    const base=new T.Color(d.baseColor).lerp(new T.Color(d.accentColor),0.42).lerp(new T.Color('#FFFFFF'),0.16);
    const dark=base.clone().multiplyScalar(0.76);
    const light=base.clone().lerp(new T.Color('#FFFFFF'),0.28);
    const y=d.stanceHeight+Math.abs(gait)*0.025;
    _threePart('torso',i,root,0,y,0,d.torsoLength*.50,d.torsoDepth*.50,d.torsoWidth*.50,base);
    _threePart('shoulder',i,root,d.torsoLength*.31,y-.02,0,d.torsoLength*.25,d.torsoDepth*.52,d.torsoWidth*.52,light);
    _threePart('pelvis',i,root,-d.torsoLength*.34,y-.06,0,d.torsoLength*.23,d.torsoDepth*.46,d.torsoWidth*.45,dark);
    const headX=d.torsoLength*.56+d.neckLength+d.headLength*.30,headY=y+d.neckLength*.10;
    _threeSegment('neck',i,root,[d.torsoLength*.38,y+.02,0],[headX-d.headLength*.30,headY,0],d.neckRadius,base,true);
    _threePart('head',i,root,headX,headY,0,d.headLength*.52,d.headDepth*.50,d.headWidth*.50,base);
    const snoutX=headX+d.headLength*.45+d.snoutLength*.44;
    const snoutY=headY-.03+(d.muzzleCurve-.5)*.16;
    _threePart('snout',i,root,snoutX,snoutY,0,d.snoutLength*.52,d.snoutDepth*.48,d.snoutWidth*.50,light);
    _threePart('jaw',i,root,snoutX-.03,headY-d.snoutDepth*.36,0,d.snoutLength*.48,d.jawDepth*.34,d.snoutWidth*.48,dark);
    const eyeX=headX+d.headLength*.13,eyeY=headY+d.headDepth*.23,eyeZ=d.headWidth*.43;
    const eyeColor=ad.nocturnal?_threeAdaptationColor('nocturnal','#8294FF'):'#DCE7DF';
    _threePart('eyeL',i,root,eyeX,eyeY,-eyeZ,d.eyeRadius,d.eyeRadius,d.eyeRadius,eyeColor);
    _threePart('eyeR',i,root,eyeX,eyeY, eyeZ,d.eyeRadius,d.eyeRadius,d.eyeRadius,eyeColor);
    /* The first tail point is buried in the pelvic mass and every bend has a joint
       volume. That overlap plus five progressively tapered segments avoids the old
       cylinder visibly plugging into the torso. */
    const tailBaseX=-d.torsoLength*.48;
    const tailPts=[
      [-d.torsoLength*.30,y-.03,0],
      [tailBaseX,y-.07,0],
      [tailBaseX-d.tailLength*.20,y-.11+d.tailCurve*.08,d.tailCurve*.04],
      [tailBaseX-d.tailLength*.48,y-.16+d.tailCurve*.27,d.tailCurve*.10],
      [tailBaseX-d.tailLength*.76,y-.22+d.tailCurve*.54,d.tailCurve*.07],
      [tailBaseX-d.tailLength,y-.28+d.tailCurve*.82,0],
    ];
    const tailR=[d.tailBaseRadius*1.12,d.tailBaseRadius,d.tailBaseRadius*.78,d.tailBaseRadius*.54,d.tailBaseRadius*.30,d.tailTipRadius];
    for(let k=0;k<5;k++)_threeSegment('tail'+k,i,root,tailPts[k],tailPts[k+1],(tailR[k]+tailR[k+1])*.5,dark,true);
    for(let k=0;k<4;k++)_threePart('tailJ'+k,i,root,tailPts[k+1][0],tailPts[k+1][1],tailPts[k+1][2],tailR[k+1],tailR[k+1],tailR[k+1],dark);
    const limbs=[['F','L',1,-1],['F','R',1,1],['H','L',-1,-1],['H','R',-1,1]];
    for(const limb of limbs){
      const front=limb[2]>0,side=limb[3],suffix=limb[0]+limb[1];
      const phase=((front===(side>0))?gait:-gait)*(0.16+d.speed*.20);
      const hipX=(front?d.torsoLength*.30:-d.torsoLength*.34);
      const z=side*d.torsoWidth*.38;
      const rootP=[hipX,y-.10,z];
      const knee=[hipX+phase+(front?.10:-.12),y-d.upperLegLength*.68,z+side*.06];
      const foot=[knee[0]+d.lowerLegLength*(front?.25:.18)-phase*.34,.10,z];
      _threeSegment('upper'+suffix,i,root,rootP,knee,.105,base,true);
      _threeSegment('lower'+suffix,i,root,knee,foot,.075,dark,true);
      _threePart('foot'+suffix,i,root,foot[0]+d.footLength*.25,foot[1],foot[2],d.footLength*.45,.065,.105,dark);
      if(front){
        const clawName=side<0?'clawFL':'clawFR';
        const clawColor=_threeAdaptationColor('claws','#F2C14E');
        const q=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),-Math.PI/2);
        _threePart(clawName,i,root,foot[0]+d.footLength*.73,foot[1],foot[2],ad.claws?.11:1e-5,ad.claws?.28:1e-5,ad.claws?.11:1e-5,clawColor,q);
      }
    }
    const armorColor=_threeAdaptationColor('armor','#9BB4C4');
    _threePart('armor',i,root,-.05,y+d.torsoDepth*.52,0,ad.armor?d.torsoLength*.38:1e-5,ad.armor?d.torsoDepth*.38:1e-5,ad.armor?d.torsoWidth*.34:1e-5,armorColor);
    const crestColor=_threeAdaptationColor('courtship','#E56AA6');
    _threePart('crest',i,root,d.torsoLength*.20,y+d.torsoDepth*.61,0,ad.courtship?.28:1e-5,ad.courtship?.52:1e-5,ad.courtship?.17:1e-5,crestColor);
    const camoColor=_threeAdaptationColor('camouflage','#75B798');
    _threePart('camoA',i,root,-.32,y+d.torsoDepth*.43,-d.torsoWidth*.25,ad.camouflage?.34:1e-5,ad.camouflage?.06:1e-5,ad.camouflage?.22:1e-5,camoColor);
    _threePart('camoB',i,root,.32,y+d.torsoDepth*.42,d.torsoWidth*.20,ad.camouflage?.28:1e-5,ad.camouflage?.06:1e-5,ad.camouflage?.18:1e-5,camoColor);
    const patternColor=base.clone().lerp(new T.Color(d.accentColor),.38).multiplyScalar(.82);
    const patternVisible=d.patternStrength>.22;
    _threePart('patternA',i,root,-.42,y+d.torsoDepth*.47,-d.torsoWidth*.23,patternVisible?.30*d.patternStrength:1e-5,.025,patternVisible?.22:1e-5,patternColor);
    _threePart('patternB',i,root,.02,y+d.torsoDepth*.50,d.torsoWidth*.18,patternVisible?.26*d.patternStrength:1e-5,.025,patternVisible?.18:1e-5,patternColor);
    _threePart('patternC',i,root,.43,y+d.torsoDepth*.43,-d.torsoWidth*.20,patternVisible?.21*d.patternStrength:1e-5,.025,patternVisible?.15:1e-5,patternColor);
    const earColor=light.clone();
    const earQ=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),Math.PI);
    for(const side of [-1,1])_threePart(side<0?'earL':'earR',i,root,headX-d.headLength*.18,headY+d.headDepth*.42,side*d.headWidth*.34,
      d.earWidth,d.earLength,d.earWidth,earColor,earQ);
    const hornColor=dark.clone().lerp(new T.Color('#C9B991'),.35),showHorns=d.hornLength>.015;
    for(const side of [-1,1]){
      const hq=new T.Quaternion().setFromEuler(new T.Euler(0,0,side*.38));
      _threePart(side<0?'hornL':'hornR',i,root,headX-d.headLength*.05,headY+d.headDepth*.48,side*d.headWidth*.27,
        showHorns?.09:1e-5,showHorns?d.hornLength:1e-5,showHorns?.09:1e-5,hornColor,hq);
    }
    const isScale=d.coveringIndex===1,isFur=d.coveringIndex===2,isFeather=d.coveringIndex===3;
    _threePart('scaleRidge',i,root,-.05,y+d.torsoDepth*.55,0,isScale?.20+d.surfaceRelief:1e-5,isScale?.28+d.surfaceRelief:1e-5,isScale?.16:1e-5,dark);
    _threePart('furRuff',i,root,d.torsoLength*.37,y+.02,0,isFur?d.neckRadius*1.42:1e-5,isFur?d.neckRadius*1.55:1e-5,isFur?d.neckRadius*1.42:1e-5,light);
    _threePart('featherMantle',i,root,-.02,y+d.torsoDepth*.56,0,isFeather?.28+d.surfaceRelief:1e-5,isFeather?.44+d.surfaceRelief:1e-5,isFeather?.20:1e-5,light);
    const tip=tailPts[5],tuftQ=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),-Math.PI/2);
    _threePart('tailTuft',i,root,tip[0],tip[1],tip[2],(isFur||isFeather)?.14+d.surfaceRelief:1e-5,(isFur||isFeather)?.32+d.surfaceRelief:1e-5,(isFur||isFeather)?.14+d.surfaceRelief:1e-5,light,tuftQ);
    const fangColor=ad.venom?_threeAdaptationColor('venom','#C88BE0'):'#E9E4D2';
    const showFangs=ad.venom||ad.carnivore;
    const fq=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),Math.PI);
    for(const side of [-1,1])_threePart(side<0?'fangL':'fangR',i,root,snoutX+d.snoutLength*.15,headY-d.snoutDepth*.42,side*d.snoutWidth*.25,showFangs?.07:1e-5,showFangs?.22:1e-5,showFangs?.07:1e-5,fangColor,fq);
    // Flocking is behaviour, not an invented organ. A ground halo appears only when
    // the carrier is actually grouped with nearby flockmates, matching the 2D cue.
    const grouped=!!(ad.flocking&&_threeFinite(o.flockN,0)>0);
    const haloScale=grouped?1.38+Math.min(3,o.flockN)*.12:1e-5;
    _threePart('flockHalo',i,root,0,-.045,0,haloScale,haloScale,haloScale,null);
  }
  for(const mesh of Object.values(_threeWorldParts)){
    mesh.count=pop.length;mesh.instanceMatrix.needsUpdate=true;
    if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  }
}

function _threeEnsureEnvironment(kind,count){
  const T=_threeApi(),env=_threeEnvironmentMeshes;
  const capKey=kind+'Capacity';
  if(env[kind]&&env[capKey]>=count)return env[kind];
  if(env[kind]){_threeMapScene.remove(env[kind]);env[kind].dispose();}
  const isFood=kind.indexOf('food')===0;
  const capacity=Math.max(isFood?512:64,Math.pow(2,Math.ceil(Math.log2(Math.max(1,count)))));
  /* Fixed-colour food batches are intentional. Some Firefox/SWGL combinations
     quantise a two-pixel InstancedMesh's instance colour almost to black. Separate
     unlit batches keep both resource identities exact even at whole-world scale. */
  const foodColor=kind==='foodWoody'
    ?(typeof FOOD_TYPES!=='undefined'?FOOD_TYPES[1].color:'#C2A45E')
    :(typeof FOOD_TYPES!=='undefined'?FOOD_TYPES[0].color:'#6FD3A2');
  const material=isFood
    ?_threeMaterial('world-'+kind,foodColor,{basic:true,toneMapped:false})
    :_threeMaterial('world-sites','#ffffff',{vertexColors:true,basic:true,transparent:true,opacity:.13,depthWrite:false,doubleSide:true});
  const mesh=new T.InstancedMesh(_threeGeometry(isFood?'food':'site'),material,capacity);
  mesh.frustumCulled=false;mesh.count=0;_threeMapScene.add(mesh);
  env[kind]=mesh;env[capKey]=capacity;return mesh;
}

function _threeUpdateEnvironment(){
  const T=_threeApi(),s=_threeState(),cfg=_threeConfig();if(!s)return;
  _threeGround.position.set(cfg.w/2,-.04,cfg.h/2);_threeGround.scale.set(cfg.w,cfg.h,1);
  const sites=(s.sites||[]),siteMesh=_threeEnsureEnvironment('sites',sites.length);
  const q=new T.Quaternion();
  for(let i=0;i<sites.length;i++){
    const st=sites[i],radius=cfg.clumpRadius||30;
    siteMesh.setMatrixAt(i,new T.Matrix4().compose(new T.Vector3(st.x,.01,st.y),q,new T.Vector3(radius,radius,radius)));
    const def=typeof FOOD_TYPES!=='undefined'?(FOOD_TYPES[st.t||0]||FOOD_TYPES[0]):null;
    siteMesh.setColorAt(i,new T.Color(def?def.color:'#6FD3A2'));
  }
  siteMesh.count=sites.length;siteMesh.instanceMatrix.needsUpdate=true;if(siteMesh.instanceColor)siteMesh.instanceColor.needsUpdate=true;
  const food=(s.food||[]),soft=[],woody=[];
  for(const f of food)(f.t===1?woody:soft).push(f);
  for(const batch of [['foodSoft',soft],['foodWoody',woody]]){
    const kind=batch[0],items=batch[1],mesh=_threeEnsureEnvironment(kind,items.length);
    for(let i=0;i<items.length;i++){
      const f=items[i],pulse=1.48+.18*Math.sin(_threeFinite(s.tick,0)*.04+i*.37+(kind==='foodWoody'?1.7:0));
      mesh.setMatrixAt(i,new T.Matrix4().compose(new T.Vector3(f.x,.62,f.y),q,new T.Vector3(pulse,pulse,pulse)));
    }
    mesh.count=items.length;mesh.instanceMatrix.needsUpdate=true;
  }
}

function drawThreeWorld(){
  if(!_threeReady||!_threeMapRenderer||!_threeState())return false;
  try{
    const s=_threeState();
    const nextBatchKey={
      state:s,
      tick:_threeFinite(s.tick,0),
      organisms:(s.organisms||[]).length,
      food:(s.food||[]).length,
      sites:(s.sites||[]).length,
    };
    const prior=_threeWorldBatchCache;
    const batchesChanged=!prior||prior.state!==nextBatchKey.state||prior.tick!==nextBatchKey.tick||
      prior.organisms!==nextBatchKey.organisms||prior.food!==nextBatchKey.food||prior.sites!==nextBatchKey.sites;
    if(batchesChanged){
      _threeUpdateEnvironment();_threeUpdateCreatureBatches();
      /* Commit only after both updates succeed. A failed partial update is retried on
         the next frame instead of being mistaken for a valid cached batch. */
      _threeWorldBatchCache=nextBatchKey;
    }
    // Camera changes are deliberately outside the batch cache: a paused world must
    // still pan, orbit and zoom immediately while reusing its unchanged matrices.
    _threeUpdateWorldCamera();
    const night=!!(s.cfg&&s.cfg.dayNight&&typeof isNight==='function'&&isNight(s.tick));
    _threeMapScene.background.set(night?'#07101A':(typeof PAL!=='undefined'?PAL.well:'#0B1417'));
    _threeAmbientLight.intensity=night?.72:1.65;
    _threeHemisphereLight.intensity=night?1.05:2.45;_threeSunLight.intensity=night?.62:3.15;_threeFillLight.intensity=night?.42:1.15;
    _threeMapRenderer.setScissorTest(false);_threeMapRenderer.render(_threeMapScene,_threeWorldCamera);return true;
  }catch(_err){return false;}
}

function _threeCylinderBetween(a,b,radius,color,kind){
  const T=_threeApi(),delta=b.clone().sub(a),length=Math.max(.001,delta.length());
  const mesh=new T.Mesh(_threeGeometry(kind||'limbHi'),_threeMaterial('card-'+color,color,{roughness:.76}));
  mesh.position.copy(a).add(b).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
  mesh.scale.set(radius,length,radius);return mesh;
}

/* A continuously tapered Catmull-Rom tube. The old portrait tail was three separate
   cylinders, so every radius change produced a visible socket. This geometry shares
   rings and normals across the whole curve; its first ring is buried inside the
   torso or skull so the remaining junction reads as grown tissue rather than parts. */
function _threeOrganicTube(points,radii,color,options){
  const T=_threeApi();options=options||{};
  const curve=new T.CatmullRomCurve3(points,false,'catmullrom',.42);
  const segments=options.segments||24,radial=options.radial||14;
  const positions=[],indices=[];
  const radiusAt=(values,t)=>{
    const scaled=t*Math.max(1,values.length-1),i=Math.min(values.length-2,Math.floor(scaled));
    const f=scaled-i;return values[i]+(values[i+1]-values[i])*f;
  };
  for(let i=0;i<=segments;i++){
    const t=i/segments,center=curve.getPoint(t),tangent=curve.getTangent(t).normalize();
    const ringA=new T.Vector3(0,0,1).addScaledVector(tangent,-tangent.z).normalize();
    const ringB=new T.Vector3().crossVectors(tangent,ringA).normalize();
    const width=radiusAt(options.widths||radii,t),depth=radiusAt(options.depths||radii,t);
    for(let j=0;j<radial;j++){
      const angle=j/radial*Math.PI*2;
      const p=center.clone().addScaledVector(ringA,Math.cos(angle)*width).addScaledVector(ringB,Math.sin(angle)*depth);
      positions.push(p.x,p.y,p.z);
    }
  }
  for(let i=0;i<segments;i++)for(let j=0;j<radial;j++){
    const next=(j+1)%radial,a=i*radial+j,b=i*radial+next,c=(i+1)*radial+next,d=(i+1)*radial+j;
    indices.push(a,b,d,b,c,d);
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const mesh=new T.Mesh(geometry,_threeMaterial('card-organic-'+color,color,{roughness:options.roughness==null ? .78 : options.roughness}));
  mesh.userData.ownedGeometry=true;return mesh;
}

function _threeMesh(geometry,color,scale,position,options){
  const T=_threeApi(),mesh=new T.Mesh(_threeGeometry(geometry),_threeMaterial('card-'+geometry+'-'+color,color,options||{}));
  mesh.scale.set(scale[0],scale[1],scale[2]);mesh.position.set(position[0],position[1],position[2]);return mesh;
}

function _threeAddDetailedLimb(group,d,front,side,color,ad){
  const T=_threeApi(),root=new T.Group();
  root.position.set(front?d.torsoLength*.31:-d.torsoLength*.34,d.stanceHeight-.08,side*d.torsoWidth*.40);
  root.rotation.z=front?-.14:.18;
  const upper=_threeMesh('limbHi',color,[.11,d.upperLegLength,.11],[0,-d.upperLegLength*.5,0]);
  const knee=new T.Mesh(_threeGeometry('sphereHi'),_threeMaterial('card-joint-'+color,color,{roughness:.8}));
  knee.scale.setScalar(.14);knee.position.y=-d.upperLegLength;
  const lowerRoot=new T.Group();lowerRoot.position.y=-d.upperLegLength;lowerRoot.rotation.z=front?.24:-.28;
  lowerRoot.add(_threeMesh('limbHi',color,[.082,d.lowerLegLength,.082],[0,-d.lowerLegLength*.5,0]));
  const ankle=new T.Mesh(_threeGeometry('sphereHi'),_threeMaterial('card-joint-'+color,color,{roughness:.8}));
  ankle.scale.setScalar(.10);ankle.position.y=-d.lowerLegLength;lowerRoot.add(ankle);
  const foot=new T.Group();foot.position.set(0,-d.lowerLegLength,0);
  foot.add(_threeMesh('sphereHi',color,[d.footLength*.52,.075,.12],[d.footLength*.34,0,0]));
  for(let digit=-1;digit<=1;digit++){
    const toe=_threeMesh('box',color,[d.footLength*.44,.035,.035],[d.footLength*.65,-.02,digit*.10]);foot.add(toe);
    if(ad.claws&&front){
      const claw=_threeMesh('cone',_threeAdaptationColor('claws','#F2C14E'),[.055,.18,.055],[d.footLength*.91,-.03,digit*.10]);
      claw.rotation.z=-Math.PI/2;foot.add(claw);
    }
  }
  lowerRoot.add(foot);root.add(upper,knee,lowerRoot);group.add(root);
  root.userData.gaitSign=(front===(side>0))?1:-1;root.userData.restZ=root.rotation.z;
  group.userData.limbRoots.push(root);
}

function _threeBuildDetailedCreature(o){
  const T=_threeApi(),d=phenotype3DDescriptor(o),ad=d.adaptations;
  const group=new T.Group();group.userData={organism:o,descriptor:d,limbRoots:[],bodyScale:d.bodyScale};
  const base=new T.Color(d.baseColor).lerp(new T.Color(d.accentColor),.28).getStyle();
  const dark=new T.Color(base).multiplyScalar(.67).getStyle();
  const light=new T.Color(base).lerp(new T.Color('#FFFFFF'),.17).getStyle();
  const y=d.stanceHeight;
  /* A single elliptical axial mesh now forms pelvis, ribcage, and shoulders. The
     profile changes continuously at shared rings rather than intersecting three
     scaled spheres, so inherited shoulder and torso proportions blend naturally. */
  const bodyX=[-.56,-.43,-.18,.10,.34,.54].map(v=>v*d.torsoLength);
  const bodyPts=bodyX.map((x,i)=>new T.Vector3(x,y+[-.07,-.04,0,.015,.025+d.shoulderLine*.035,0][i],0));
  group.add(_threeOrganicTube(bodyPts,[1,1,1,1,1,1],base,{segments:32,radial:20,
    widths:[d.torsoWidth*.20,d.torsoWidth*.44,d.torsoWidth*.50,d.torsoWidth*.51,d.torsoWidth*.48,d.torsoWidth*.22],
    depths:[d.torsoDepth*.18,d.torsoDepth*.43,d.torsoDepth*.50,d.torsoDepth*.52,d.torsoDepth*.54,d.torsoDepth*.22]}));
  const headX=d.torsoLength*.56+d.neckLength+d.headLength*.30,headY=y+d.neckLength*.10;
  group.add(_threeOrganicTube([
    new T.Vector3(d.torsoLength*.24,y-.01,0),
    new T.Vector3(d.torsoLength*.42,y+.02+d.shoulderLine*.05,0),
    new T.Vector3(headX-d.headLength*.42,headY-.02,0),
    new T.Vector3(headX-d.headLength*.17,headY,0),
  ],[d.neckRadius*1.34,d.neckRadius*1.08,d.neckRadius*.94,d.neckRadius*.82],base,{segments:18}));
  group.add(_threeMesh('sphereHi',base,[d.headLength*.52,d.headDepth*.50,d.headWidth*.50],[headX,headY,0]));
  const snoutX=headX+d.headLength*.45+d.snoutLength*.44;
  const snoutY=headY-.03+(d.muzzleCurve-.5)*.16;
  group.add(_threeOrganicTube([
    new T.Vector3(headX-d.headLength*.12,headY,0),
    new T.Vector3(headX+d.headLength*.30,headY-.01,0),
    new T.Vector3(snoutX-d.snoutLength*.18,(headY+snoutY)*.5,0),
    new T.Vector3(snoutX+d.snoutLength*.46,snoutY,0),
  ],[1,1,1,1],light,{segments:20,radial:16,
    widths:[d.headWidth*.44,d.headWidth*.45,d.snoutWidth*.48,d.snoutWidth*.27],
    depths:[d.headDepth*.39,d.headDepth*.38,d.snoutDepth*.47,d.snoutDepth*.27]}));
  const jaw=_threeMesh('sphereHi',dark,[d.snoutLength*.48,d.jawDepth*.36,d.snoutWidth*.48],[snoutX-.03,headY-d.snoutDepth*.38,0]);group.add(jaw);
  for(const side of [-1,1]){
    const eyeColor=ad.nocturnal?_threeAdaptationColor('nocturnal','#8294FF'):'#E9F1EA';
    const eye=_threeMesh('eye',eyeColor,[d.eyeRadius,d.eyeRadius,d.eyeRadius],[headX+d.headLength*.13,headY+d.headDepth*.24,side*d.headWidth*.44],ad.nocturnal?{roughness:.2,emissive:eyeColor,emissiveIntensity:.8}:{roughness:.2});group.add(eye);
    const pupil=_threeMesh('eye','#091013',[d.eyeRadius*.42,d.eyeRadius*.42,d.eyeRadius*.20],[headX+d.headLength*.17,headY+d.headDepth*.25,side*(d.headWidth*.44+d.eyeRadius*.80)],{roughness:.1});group.add(pupil);
    const ear=_threeMesh('plate',light,[d.earWidth,d.earLength,d.earWidth],[headX-d.headLength*.18,headY+d.headDepth*.43,side*d.headWidth*.33]);
    ear.rotation.x=side*.28;ear.rotation.z=Math.PI;group.add(ear);
  }
  const tailBaseX=-d.torsoLength*.47;
  const tailPts=[
    new T.Vector3(-d.torsoLength*.28,y-.03,0),
    new T.Vector3(tailBaseX,y-.07,0),
    new T.Vector3(tailBaseX-d.tailLength*.20,y-.11+d.tailCurve*.08,d.tailCurve*.04),
    new T.Vector3(tailBaseX-d.tailLength*.48,y-.16+d.tailCurve*.27,d.tailCurve*.10),
    new T.Vector3(tailBaseX-d.tailLength*.76,y-.22+d.tailCurve*.54,d.tailCurve*.07),
    new T.Vector3(tailBaseX-d.tailLength,y-.28+d.tailCurve*.82,0),
  ];
  group.add(_threeOrganicTube(tailPts,[d.tailBaseRadius*1.18,d.tailBaseRadius,d.tailBaseRadius*.78,
    d.tailBaseRadius*.53,d.tailBaseRadius*.28,d.tailTipRadius],dark,{segments:34,radial:16}));
  for(const front of [false,true])for(const side of [-1,1])_threeAddDetailedLimb(group,d,front,side,base,ad);

  /* Neutral ornaments are inherited anatomy, not badges. Horn expression is
     continuous above a threshold; ears, pigment, pattern, and covering vary in all
     animals, including founders and organisms in the controlled scenarios. */
  if(d.hornLength>.015){
    const hornColor=new T.Color(dark).lerp(new T.Color('#C9B991'),.38).getStyle();
    for(const side of [-1,1])group.add(_threeOrganicTube([
      new T.Vector3(headX-d.headLength*.10,headY+d.headDepth*.36,side*d.headWidth*.25),
      new T.Vector3(headX-d.headLength*.18,headY+d.headDepth*.62,side*(d.headWidth*.34+d.hornLength*.10)),
      new T.Vector3(headX-d.headLength*.04,headY+d.headDepth*.72+d.hornLength*.45,side*(d.headWidth*.32+d.hornLength*.28)),
    ],[.105,.072,.012],hornColor,{segments:14,radial:10,roughness:.63}));
  }
  const patternColor=new T.Color(base).lerp(new T.Color(d.accentColor),.40).multiplyScalar(.78).getStyle();
  if(d.patternStrength>.14){
    const marks=[[-.46,.28,-.36,.23],[-.12,.42,.25,.18],[.22,.37,-.28,.21],[.47,.22,.20,.16]];
    for(const m of marks)group.add(_threeMesh('sphereHi',patternColor,
      [m[3]*d.patternStrength,.018,m[3]*.68],[m[0]*d.torsoLength,y+d.torsoDepth*m[1],m[2]*d.torsoWidth]));
  }
  if(d.coveringIndex===1){
    for(let row=-2;row<=2;row++)for(let col=-4;col<=4;col++){
      const nx=col/5,nz=row/3;if(nx*nx+nz*nz>.82)continue;
      const scale=_threeMesh('sphereHi',dark,[.105,.022,.075],[nx*d.torsoLength*.47,y+d.torsoDepth*(.46-.08*Math.abs(nx)),nz*d.torsoWidth*.48]);
      scale.rotation.y=(row&1)?.18:-.18;group.add(scale);
    }
  }else if(d.coveringIndex===2){
    for(let row=-2;row<=2;row++)for(let col=-5;col<=5;col++){
      const nx=col/6,nz=row/3;if(nx*nx+nz*nz>.88)continue;
      const tuft=_threeMesh('cone',light,[.022+d.surfaceRelief*.20,d.surfaceRelief,.022+d.surfaceRelief*.20],
        [nx*d.torsoLength*.48,y+d.torsoDepth*(.47-.07*Math.abs(nx)),nz*d.torsoWidth*.48]);
      tuft.rotation.z=(nx*.16);group.add(tuft);
    }
  }else if(d.coveringIndex===3){
    for(let row=-2;row<=2;row++)for(let col=-4;col<=4;col++){
      const nx=col/5,nz=row/3;if(nx*nx+nz*nz>.82)continue;
      const feather=_threeMesh('feather',dark,[.075+d.surfaceRelief*.18,.18+d.surfaceRelief,1],
        [nx*d.torsoLength*.47,y+d.torsoDepth*(.48-.07*Math.abs(nx)),nz*d.torsoWidth*.46],{doubleSide:true});
      feather.rotation.z=Math.PI*.43+nx*.10;feather.rotation.x=nz*.22;group.add(feather);
    }
  }
  if(d.coveringIndex>=2){
    const tip=tailPts[tailPts.length-1];
    for(let j=-2;j<=2;j++){
      const tuft=_threeMesh(d.coveringIndex===3?'feather':'cone',light,
        d.coveringIndex===3?[.08+d.surfaceRelief*.25,.24+d.surfaceRelief,1]:[.05+d.surfaceRelief*.25,.18+d.surfaceRelief,.04],
        [tip.x,tip.y+j*.025,tip.z+j*.035],{doubleSide:true});tuft.rotation.z=d.coveringIndex===3?Math.PI/2:-Math.PI/2+j*.09;group.add(tuft);
    }
  }
  if(ad.armor){
    const color=_threeAdaptationColor('armor','#9BB4C4');
    for(let i=-3;i<=3;i++){const plate=_threeMesh('plate',color,[.20,.30+.06*(3-Math.abs(i)),.26],[i*d.torsoLength*.115,y+d.torsoDepth*.54,0]);group.add(plate);}
  }
  if(ad.courtship){
    const color=_threeAdaptationColor('courtship','#E56AA6');
    for(let i=0;i<4;i++){const crest=_threeMesh('plate',color,[.17,.42+i*.035,.10],[-.30+i*.24,y+d.torsoDepth*.58,0]);group.add(crest);}
  }
  if(ad.camouflage){
    const color=_threeAdaptationColor('camouflage','#75B798');
    for(const p of [[-.48,.18,-.42,.28],[.02,.25,.43,.24],[.43,.10,-.36,.20]])group.add(_threeMesh('sphereHi',color,[p[3],.035,p[3]*.68],[p[0],y+d.torsoDepth*.49,p[2]]));
  }
  if(ad.venom||ad.carnivore){
    const color=ad.venom?_threeAdaptationColor('venom','#C88BE0'):'#EEE7D4';
    for(const side of [-1,1])for(let tooth=0;tooth<(ad.carnivore?3:1);tooth++){
      const fang=_threeMesh('cone',color,[.055,.18+(tooth===0?.04:0),.055],[snoutX-.18+tooth*.18,headY-d.snoutDepth*.46,side*d.snoutWidth*.25]);fang.rotation.z=Math.PI;group.add(fang);
    }
  }
  if(ad.venom){
    const color=_threeAdaptationColor('venom','#C88BE0');
    for(const side of [-1,1])group.add(_threeMesh('sphereHi',color,[.15,.13,.15],[headX-.08,headY-.12,side*d.headWidth*.47]));
  }
  group.position.y=.03;return group;
}

function _threeMorphologyDistance(a,b){
  let sum=0,n=0;
  for(const key of ['speed','size','sense','diet']){const t=_threeTraitDef(key);if(!t)continue;const z=((a[key]||0)-(b[key]||0))/(t.max-t.min);sum+=z*z;n++;}
  for(const key of _THREE_PHYSICAL){if(!!(a.ad&&a.ad[key])!==!!(b.ad&&b.ad[key]))sum+=.10;n++;}
  if(typeof COSMETIC_GENE_KEYS!=='undefined'){
    const ac=typeof cosmeticGenomeFor==='function'?cosmeticGenomeFor(a):{};
    const bc=typeof cosmeticGenomeFor==='function'?cosmeticGenomeFor(b):{};
    for(const key of COSMETIC_GENE_KEYS){
      const z=_threeFinite(ac[key],.5)-_threeFinite(bc[key],.5);sum+=z*z*.72;n+=.72;
    }
  }
  return Math.sqrt(sum/Math.max(1,n));
}
function _threeRepresentatives(clade,limit){
  const s=_threeState(),members=(s&&s.organisms?s.organisms:[]).filter(o=>o.clade===clade.id).slice().sort((a,b)=>a.id-b.id);if(!members.length)return[];
  const target=clade.traits||members[0];let medoid=members[0],best=Infinity;
  for(const o of members){let d=0;for(const key of ['speed','size','sense','diet']){const t=_threeTraitDef(key);const z=(o[key]-target[key])/(t.max-t.min);d+=z*z;}if(d<best){best=d;medoid=o;}}
  const chosen=[medoid],want=Math.min(limit||3,members.length);
  while(chosen.length<want){let pick=null,pickD=-1;for(const candidate of members){if(chosen.includes(candidate))continue;let nearest=Infinity;for(const prior of chosen)nearest=Math.min(nearest,_threeMorphologyDistance(candidate,prior));if(nearest>pickD){pickD=nearest;pick=candidate;}}if(!pick)break;chosen.push(pick);}return chosen;
}

function _threeLayoutCardRow(row){
  const placements=[[0,0,0,1.12],[-2.27,0,.62,.58],[2.27,0,-.62,.58]];
  const requested=_threeCardSelections.get(row.cladeId);
  const selected=row.models.find(model=>model.userData.organism.id===requested)||row.models[0];
  if(!selected)return;
  row.selectedId=selected.userData.organism.id;
  _threeCardSelections.set(row.cladeId,row.selectedId);
  const ordered=[selected,...row.models.filter(model=>model!==selected)];
  ordered.forEach((model,i)=>{
    const p=placements[i]||placements[0];model.position.set(p[0],p[1],p[2]);
    const relative=model.userData.descriptor.bodyScale/Math.max(.05,row.maxSize);
    model.scale.setScalar(p[3]*relative);
  });
}

function _threeBuildCardRow(clade,reps,maxSize){
  const T=_threeApi(),scene=new T.Scene();scene.background=new T.Color(typeof PAL!=='undefined'?PAL.medium:'#101E24');
  scene.add(new T.AmbientLight('#E7F1ED',.82));scene.add(new T.HemisphereLight('#F0FAF4','#294750',2.25));const sun=new T.DirectionalLight('#FFF0CE',3.1);sun.position.set(-4,8,7);scene.add(sun);
  const floor=new T.Mesh(_threeGeometry('site'),_threeMaterial('card-floor',typeof PAL!=='undefined'?PAL.well:'#0B1417',{roughness:1}));floor.scale.setScalar(4.7);floor.position.y=-.02;scene.add(floor);
  const models=[];
  reps.forEach(o=>{const model=_threeBuildDetailedCreature(o);scene.add(model);models.push(model);});
  const row={scene,models,ids:reps.map(o=>o.id),cladeId:clade.id,
    medoidId:reps.length?reps[0].id:null,maxSize,stateRef:_threeState(),selectedId:null};
  _threeLayoutCardRow(row);return row;
}

function _threeSyncCardRows(clades){
  const s=_threeState(),viable=new Set(clades.map(c=>c.id));
  if(_threeCardSelectionState!==s){
    _threeCardSelections.clear();_threeCardSelectionState=s;_threeOverlaySignature='';
  }
  const maxSize=Math.max(.35,...(s.organisms||[]).filter(o=>viable.has(o.clade)).map(o=>_threeFinite(o.size,1)));
  const next=[];
  for(let i=0;i<clades.length;i++){
    const c=clades[i],reps=_threeRepresentatives(c,3),ids=reps.map(o=>o.id);
    const old=_threeCardRows[i];
    if(old&&old.stateRef===s&&old.cladeId===c.id&&old.ids.length===ids.length&&old.ids.every((id,k)=>id===ids[k])){
      old.maxSize=maxSize;_threeLayoutCardRow(old);next.push(old);
    }
    else{if(old)_threeDisposeObject(old.scene);next.push(_threeBuildCardRow(c,reps,maxSize));}
  }
  for(let i=clades.length;i<_threeCardRows.length;i++)_threeDisposeObject(_threeCardRows[i].scene);
  _threeCardRows=next;
}

function _threeFitSpecimenCanvas(rows){
  if(!_threeCardCanvas||!_threeCardCanvas.style)return;
  const height=Math.max(380,Math.max(1,rows)*300)+'px';
  if(_threeCardCanvas.style.height!==height)_threeCardCanvas.style.height=height;
  _threeCanvasSize(_threeCardRenderer,_threeCardCanvas);
}

function _threeUpdateSpecimenOverlay(clades){
  if(!_threeCardOverlay||typeof document==='undefined')return;
  const rect=_threeCardCanvas.getBoundingClientRect();
  const rowH=Math.max(1,rect.height/clades.length);
  const signature=clades.map((c,i)=>{
    const row=_threeCardRows[i],reps=row?row.models.map(m=>m.userData.organism):[];
    return [c.id,reps.map(o=>o.id).join(','),reps[0]&&reps[0].ad?Object.keys(reps[0].ad).filter(k=>reps[0].ad[k]).sort().join(','):'',reps[0]&&reps[0].plasticity>.12?'p':''].join(':');
  }).join('|')+'@'+Math.round(rect.height);
  if(signature===_threeOverlaySignature){
    const metas=_threeCardOverlay.querySelectorAll('.specimen3DLabel .meta');
    for(let i=0;i<metas.length&&i<clades.length;i++)metas[i].textContent='n='+clades[i].n;
    return;
  }
  _threeOverlaySignature=signature;
  while(_threeCardOverlay.firstChild)_threeCardOverlay.removeChild(_threeCardOverlay.firstChild);
  if(!clades.length)return;
  for(let i=0;i<clades.length;i++){
    const c=clades[i],row=_threeCardRows[i],reps=row?row.models.map(m=>m.userData.organism):[];
    const representative=reps[0];
    const label=document.createElement('div');label.className='specimen3DLabel';label.style.top=(i*rowH+8)+'px';
    const dot=document.createElement('span');dot.textContent='●';dot.style.color=_threeCladeColor(c.id);label.appendChild(dot);
    const name=document.createElement('span');name.className='name';name.textContent=typeof cladeName==='function'?cladeName(c.id):('Species '+c.id);label.appendChild(name);
    if(representative&&typeof ADAPTATIONS!=='undefined'){
      const badges=document.createElement('span');badges.className='adGlyphs';badges.style.marginLeft='4px';
      for(const def of ADAPTATIONS){
        if(!(representative.ad&&representative.ad[def.key]))continue;
        const badge=document.createElement('span');badge.className='adGlyph';badge.textContent=def.glyph||'●';badge.style.color=def.color||'#D7E3E3';badge.style.pointerEvents='auto';
        const kind=_THREE_BEHAVIOURAL.includes(def.key)?'Behavioural adaptation':'Physical adaptation';
        badge.title=kind+': '+def.name+'. '+(def.blurb||'');badge.setAttribute('data-tip',badge.title);
        badge.setAttribute('role','img');badge.setAttribute('aria-label',badge.title);badge.tabIndex=0;badges.appendChild(badge);
      }
      if(_threeFinite(representative.plasticity,0)>.12){
        const badge=document.createElement('span');badge.className='adGlyph';badge.textContent='↻';badge.style.color='#7FD1AE';badge.style.pointerEvents='auto';
        badge.title='Inherited plasticity: learns escape skill after surviving encounters.';badge.setAttribute('data-tip',badge.title);
        badge.setAttribute('role','img');badge.setAttribute('aria-label',badge.title);badge.tabIndex=0;badges.appendChild(badge);
      }
      const form=phenotype3DDescriptor(representative);
      const coveringGlyph=['·','▦','≋','⌁'][form.coveringIndex]||'·';
      const coveringBadge=document.createElement('span');coveringBadge.className='adGlyph';coveringBadge.textContent=coveringGlyph;
      coveringBadge.style.color=form.baseColor;coveringBadge.style.pointerEvents='auto';coveringBadge.tabIndex=0;
      coveringBadge.title='Neutral inherited covering: '+form.coveringType+'. Recombines and mutates, but currently has no fitness effect.';
      coveringBadge.setAttribute('data-tip',coveringBadge.title);coveringBadge.setAttribute('role','img');coveringBadge.setAttribute('aria-label',coveringBadge.title);badges.appendChild(coveringBadge);
      if(form.hornLength>.015){
        const hornBadge=document.createElement('span');hornBadge.className='adGlyph';hornBadge.textContent='⋔';hornBadge.style.color='#C9B991';hornBadge.style.pointerEvents='auto';hornBadge.tabIndex=0;
        hornBadge.title='Neutral inherited head ornament: horn expression. Recombines and mutates without changing fitness.';
        hornBadge.setAttribute('data-tip',hornBadge.title);hornBadge.setAttribute('role','img');hornBadge.setAttribute('aria-label',hornBadge.title);badges.appendChild(hornBadge);
      }
      label.appendChild(badges);
    }
    const meta=document.createElement('span');meta.className='meta';meta.textContent='n='+c.n;label.appendChild(meta);_threeCardOverlay.appendChild(label);
    if(representative){
      const variants=document.createElement('div');variants.className='specimen3DVariants';variants.style.top=(i*rowH+rowH-29)+'px';
      const prompt=document.createElement('span');prompt.className='specimen3DChoiceLabel';prompt.textContent='full-size view · sides 0.6×';variants.appendChild(prompt);
      for(const o of reps){
        const medoid=o.id===row.medoidId;
        const choice=document.createElement('button');choice.type='button';choice.className='specimen3DChoice';choice.style.pointerEvents='auto';
        choice.textContent=(medoid?'representative':'variant')+' #'+o.id;
        choice.title='Show '+(medoid?'the true species medoid':'actual variant')+' #'+o.id+' at full size';
        choice.setAttribute('aria-label',choice.title);choice.setAttribute('aria-pressed',String(o.id===row.selectedId));
        if(o.id===row.selectedId)choice.classList.add('selected');
        choice.addEventListener('click',()=>{
          _threeCardSelections.set(c.id,o.id);_threeLayoutCardRow(row);
          if(typeof selectOrganism==='function')selectOrganism(o.id);
          for(const peer of variants.querySelectorAll('.specimen3DChoice')){
            const active=peer===choice;peer.classList.toggle('selected',active);peer.setAttribute('aria-pressed',String(active));
          }
          drawThreeSpecimens();
        });
        variants.appendChild(choice);
      }
      _threeCardOverlay.appendChild(variants);
    }
  }
}

function drawThreeSpecimens(){
  if(!_threeReady||!_threeCardRenderer||!_threeState())return false;
  try{
    const clades=(_threeState().clades||[]).filter(c=>c.n>=5);
    _threeFitSpecimenCanvas(clades.length);_threeSyncCardRows(clades);_threeUpdateSpecimenOverlay(clades);
    /* Viewports are expressed in renderer-logical pixels; WebGLRenderer applies DPR
       internally. Using drawing-buffer pixels here would multiply DPR twice and
       clip every row on Retina/high-density displays. */
    const size=_threeCardRenderer.getSize(new (_threeApi()).Vector2()),W=size.x,H=size.y;
    _threeCardRenderer.setScissorTest(false);_threeCardRenderer.setClearColor(typeof PAL!=='undefined'?PAL.well:'#0B1417',1);_threeCardRenderer.clear();_threeCardRenderer.setScissorTest(true);
    if(!clades.length){_threeCardRenderer.setScissorTest(false);return true;}
    const rowH=H/clades.length,aspect=W/Math.max(1,rowH),tick=_threeFinite(_threeState().tick,0);
    _threeCardCamera.aspect=aspect;_threeCardCamera.updateProjectionMatrix();
    const distance=10/_threeClamp(_threeCardOrbit.zoom,.65,2.8),horizontal=Math.cos(_threeCardOrbit.pitch)*distance;
    _threeCardCamera.position.set(Math.sin(_threeCardOrbit.yaw)*horizontal,3.1+Math.sin(_threeCardOrbit.pitch)*distance*.52,Math.cos(_threeCardOrbit.yaw)*horizontal);
    _threeCardCamera.lookAt(0,1,0);
    for(let i=0;i<_threeCardRows.length;i++){
      const row=_threeCardRows[i];
      for(const model of row.models){const o=model.userData.organism,gait=Math.sin(tick*.035+_threeFinite(o.id,0)*.73);for(const limb of model.userData.limbRoots)limb.rotation.z=limb.userData.restZ+gait*limb.userData.gaitSign*.10;model.rotation.y=Math.sin(tick*.006+o.id)*.025;}
      const bottom=Math.floor(H-(i+1)*rowH),height=Math.ceil(rowH);
      _threeCardRenderer.setViewport(0,bottom,W,height);_threeCardRenderer.setScissor(0,bottom,W,height);_threeCardRenderer.render(row.scene,_threeCardCamera);
    }
    _threeCardRenderer.setScissorTest(false);return true;
  }catch(_err){return false;}
}

function bindThreeSpecimenControls(){
  if(!_threeCardCanvas||_threeCardHandlers)return false;
  const pointers=new Map();
  const down=e=>{if(e.pointerType==='mouse'&&e.button!==0)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(_threeCardCanvas.setPointerCapture)_threeCardCanvas.setPointerCapture(e.pointerId);if(_threeCardCanvas.classList)_threeCardCanvas.classList.add('dragging');e.preventDefault();};
  const move=e=>{const prior=pointers.get(e.pointerId);if(!prior)return;_threeCardOrbit.yaw+=(e.clientX-prior.x)*.008;_threeCardOrbit.pitch=_threeClamp(_threeCardOrbit.pitch+(e.clientY-prior.y)*.006,-.12,.82);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});drawThreeSpecimens();e.preventDefault();};
  const up=e=>{pointers.delete(e.pointerId);if(!pointers.size&&_threeCardCanvas.classList)_threeCardCanvas.classList.remove('dragging');};
  const wheel=e=>{_threeCardOrbit.zoom=_threeClamp(_threeCardOrbit.zoom*Math.exp(-e.deltaY*.0015),.65,2.8);drawThreeSpecimens();e.preventDefault();};
  const dbl=()=>{_threeCardOrbit={yaw:.64,pitch:.22,zoom:1};drawThreeSpecimens();};
  const key=e=>{
    if(e.key==='ArrowLeft')_threeCardOrbit.yaw-=.14;
    else if(e.key==='ArrowRight')_threeCardOrbit.yaw+=.14;
    else if(e.key==='ArrowUp')_threeCardOrbit.pitch=_threeClamp(_threeCardOrbit.pitch-.10,-.12,.82);
    else if(e.key==='ArrowDown')_threeCardOrbit.pitch=_threeClamp(_threeCardOrbit.pitch+.10,-.12,.82);
    else if(e.key==='+'||e.key==='=')_threeCardOrbit.zoom=_threeClamp(_threeCardOrbit.zoom*1.22,.65,2.8);
    else if(e.key==='-'||e.key==='_')_threeCardOrbit.zoom=_threeClamp(_threeCardOrbit.zoom/1.22,.65,2.8);
    else if(e.key==='0')_threeCardOrbit={yaw:.64,pitch:.22,zoom:1};
    else return;
    drawThreeSpecimens();e.preventDefault();
  };
  _threeCardHandlers=[['pointerdown',down,false],['pointermove',move,false],['pointerup',up,false],['pointercancel',up,false],['wheel',wheel,{passive:false}],['dblclick',dbl,false],['keydown',key,false]];
  for(const item of _threeCardHandlers)_threeCardCanvas.addEventListener(item[0],item[1],item[2]);
  return true;
}
