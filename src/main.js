/* ============================================================================
   main.js — boot and the frame loop. Loaded last.
   ========================================================================== */

function frame(){
  if (state && state.running && !extinct()){
    // speedMult ticks per frame. The sim is deterministic per tick, so running
    // faster changes only how quickly you watch it — never the outcome.
    const n = Math.max(1, state.speedMult | 0);
    for (let i = 0; i < n; i++) step();
  }
  drawAll();
  paintReadouts();
  requestAnimationFrame(frame);
}

function boot(){
  initWorld({ seed: 'origin', scenario: 'temperate' });
  if (!initRender()) return;
  buildScenarioButtons();
  buildTraitLegend();
  buildSpeciesList();
  bindUI();
  setRunning(true);
  requestAnimationFrame(frame);
}

// Headless test runs concatenate these modules under Node, where there is no DOM
// and no rAF worth driving. Boot only in a real document.
if (typeof document !== 'undefined' && !globalThis.__HEADLESS__){
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}
