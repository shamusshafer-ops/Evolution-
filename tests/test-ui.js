/* Auto-pause banner: a backgrounded tab pauses the sim to save battery, and that
   needs to be visibly distinct from the player pausing it deliberately — otherwise
   the sim appears to have silently stopped for no reason. */
let pass=0, fail=0; const check=(n,c)=>{ c?pass++:(fail++,console.log('FAIL:',n)); };

const els = { btnRun:{ textContent:'', title:'', setAttribute(){} },
              btnViewRun:{ textContent:'', title:'', setAttribute(){} },
              autopaused:{ hidden:true }, extinct:{ hidden:true } };
document.getElementById = (id) => els[id] || null;

initWorld({seed:'ui', scenario:'temperate'});

/* --- visibilitychange-style auto-pause sets the flag --- */
setRunning(true);
check('starts running with no auto-pause flag', state.running === true && UI.autoPaused === false);
check('side-panel and in-well controls both show Pause while running',
      els.btnRun.textContent === 'Pause' && els.btnViewRun.textContent === 'Pause');
setRunning(false, true);   // simulates document.hidden firing
check('backgrounding sets running false', state.running === false);
check('backgrounding sets the auto-pause flag', UI.autoPaused === true);
paintReadouts();
check('the banner becomes visible', els.autopaused.hidden === false);

/* --- any deliberate action clears it, not just pressing Run --- */
setRunning(false, true);
check('flag is set again before this check', UI.autoPaused === true);
setRunning(true);   // e.g. the player pressing Run — no `auto` argument
check('pressing Run clears the auto-pause flag', UI.autoPaused === false);
paintReadouts();
check('the banner hides again', els.autopaused.hidden === true);

/* --- a MANUAL pause must never show the auto-pause banner ---
   This is the check that actually matters: without it, pressing Pause yourself
   could be misread as "the tab went to the background", which would be worse than
   the original bug — a false explanation is worse than no explanation. */
setRunning(true);
setRunning(false);   // player presses Pause deliberately, no `auto` argument
check('a manual pause does not set the auto-pause flag', UI.autoPaused === false);
check('side-panel and in-well controls both show Run while paused',
      els.btnRun.textContent === 'Run' && els.btnViewRun.textContent === 'Run');
paintReadouts();
check('the banner stays hidden for a manual pause', els.autopaused.hidden === true);

/* --- restart clears the auto-pause flag too, so a stale banner cannot survive a reset --- */
setRunning(false, true);
check('flag is set before reset', UI.autoPaused === true);
restart({ seed:'ui2' });
check('restart clears the auto-pause flag', UI.autoPaused === false);

/* --- shock buttons: disabled while a patch-based shock is blocking, banner shows
   remaining time, and cull's button is never disabled since it never conflicts --- */
els.shocks = { children: SHOCKS.map(sh => ({ textContent: sh.name, disabled: false })),
               appendChild(el){ this.children.push(el); },
               get innerHTML(){ return this._html || ''; },
               set innerHTML(v){ this._html = v; if (v === '') this.children = []; } };
els.shockActive = { hidden:true, textContent:'' };
initWorld({seed:'shockui', scenario:'temperate'});
paintShocks();
check('no shock active -> banner hidden', els.shockActive.hidden === true);
check('no shock active -> no button disabled',
      els.shocks.children.every(b => b.disabled === false));

triggerShock('drought');
paintShocks();
check('a patch shock active -> the other patch shock button is disabled',
      els.shocks.children.find(b=>b.textContent==='Bloom').disabled === true);
check("the same patch shock's own button is also shown disabled (already running)",
      els.shocks.children.find(b=>b.textContent==='Drought').disabled === true);
check("cull's button is never disabled by a patch shock",
      els.shocks.children.find(b=>b.textContent==='Die-off').disabled === false);
check('the banner shows while a patch shock is active', els.shockActive.hidden === false);

for(let i=0;i<SHOCKS_BY_ID.drought.duration;i++) step();
paintShocks();
check('the banner clears once the shock expires', els.shockActive.hidden === true);
check('buttons re-enable once the shock expires',
      els.shocks.children.every(b => b.disabled === false));

/* --- About panel: opens, closes, renders the changelog exactly once, and never
   touches simulation state (it's an explainer, not a pause) --- */
els.aboutPanel = { hidden:true };
els.aboutBackdrop = { hidden:true };
els.changelog = { innerHTML:'', dataset:{} };

initWorld({seed:'about', scenario:'temperate'});
setRunning(true);
const runningBefore = state.running;

openAbout();
check('opening About shows the panel', els.aboutPanel.hidden === false);
check('opening About shows the backdrop', els.aboutBackdrop.hidden === false);
check('opening About does not pause the sim', state.running === runningBefore);
check('the changelog renders every entry', (els.changelog.innerHTML.match(/chLine/g)||[]).length === CHANGELOG.length);
check('every changelog entry has a date, tag, and title present in the rendered html',
      CHANGELOG.every(c => els.changelog.innerHTML.includes(c.date) && els.changelog.innerHTML.includes(c.tag) && els.changelog.innerHTML.includes(c.title)));

const htmlAfterFirstRender = els.changelog.innerHTML;
openAbout();   // opening again must not rebuild/duplicate the list
check('re-opening does not re-render (no duplicate entries)', els.changelog.innerHTML === htmlAfterFirstRender);

closeAbout();
check('closing hides the panel', els.aboutPanel.hidden === true);
check('closing hides the backdrop', els.aboutBackdrop.hidden === true);
check('closing does not affect the sim run state', state.running === runningBefore);

/* --- the bug that mock-DOM tests above CANNOT catch ---
   Every check up to here uses a plain JS object standing in for the DOM, so it only
   proves the JS sets `.hidden` correctly — it says nothing about whether the actual
   browser CSS cascade respects that. It didn't, once: `#aboutPanel{ display:flex }`
   is an ID selector (specificity 1,0,0), which OUTRANKS the browser's built-in
   `[hidden]{ display:none }` (an attribute selector, 0,1,0). Setting `.hidden = true`
   correctly set the DOM attribute; the panel stayed visibly on screen anyway,
   because the ID rule's `display:flex` won the cascade regardless. Only
   #aboutBackdrop actually disappeared (it declares no `display` of its own), so
   closing looked half-broken — the darkening vanished, the dialog didn't.
   No headless test with a mocked getElementById can see this; it can only be caught
   by asserting the actual CSS source carries the fix. This check reads the real
   shell.html template (not the mocked DOM) and would fail again if the override
   rule were ever deleted or a future panel repeated the same mistake. */
if (typeof require !== 'undefined'){
  try {
    const fs = require('fs');
    // process.cwd(), not __dirname: this file is invoked two different ways in
    // practice (`cat ... | node`, reading from stdin, and copied to a scratch path
    // for direct execution) and __dirname resolves differently under each. cwd is
    // reliable because every documented invocation (see README.md) runs from the
    // project root.
    const html = fs.readFileSync(require('path').join(process.cwd(), 'src', 'shell.html'), 'utf8');
    check('the CSS explicitly restores display:none when #aboutPanel is hidden (see the "why" comment above)',
          /#aboutPanel\[hidden\]\s*\{[^}]*display\s*:\s*none/.test(html));
    check('the Specimens panel contains a visible legend for hue, size, speed, sense, and adaptation marks',
          /class="specimenLegend"/.test(html) && /Body hue/.test(html) && /Body width/.test(html) &&
          /Long body \+ tail/.test(html) && /Large eyes/.test(html) && /armour, venom, nocturnal, carnivore/.test(html) &&
          /claws, camouflage, pack hunting/.test(html));
    check('species adaptation icons expose a hover/focus explanation',
          /\.adGlyph:hover::after/.test(html) && /\.adGlyph:focus-visible::after/.test(html));
    check('the well exposes pause, zoom, reset, fullscreen, and pointer navigation in both layouts',
          /id="btnViewRun"/.test(html) && /id="btnZoomOut"/.test(html) && /id="btnZoomIn"/.test(html) &&
          /id="btnViewReset"/.test(html) && /id="btnFull"/.test(html) && /touch-action\s*:\s*none/.test(html));
  } catch(e){
    console.log('  (skipped CSS-source check: could not read src/shell.html from', process.cwd(), '—', e.message, ')');
  }
}

/* --- speciation notifications: driven by recorded lineage EVENTS ---
   Rewritten when lineage tracking landed. The previous version of these tests
   fabricated state.clades by hand with no `event` field, because the old detector
   inferred "something split" from the viable-count rising above its previous peak.
   That inference no longer exists: the lineage matcher records split/merge/new
   directly, so notifications now read a fact rather than deduce one. The wobble
   guard those tests protected is likewise obsolete — a clade dipping below the
   viability threshold and recovering produces no new split event, so there is
   nothing to double-fire. */
els.toasts = { children: [], appendChild(el){ this.children.push(el); }, innerHTML:'' };
els.wellFlash = { classList:{ _has:false, add(){ this._has=true; }, remove(){ this._has=false; } }, offsetWidth:0 };

initWorld({seed:'evtA', scenario:'temperate'});
check('events queue starts empty', state.events.length === 0);

/* Exercise detectSpeciation() against clades shaped the way computeSpecies()
   actually produces them, rather than against invented ones. */
state.clades = [{id:0, n:200, event:null, from:null}, {id:1, n:40, event:'split', from:[0]}];
detectSpeciation();
check('a recorded split fires exactly one event', state.events.length === 1);
check('the event names the ACTUAL new lineage, not merely the smallest',
      state.events[0].name === cladeName(1));
check('the event names the parent lineage exactly', state.events[0].parent === cladeName(0));

state.events = [];
state.clades = [{id:0, n:200, event:null, from:null}, {id:1, n:40, event:null, from:null}];
detectSpeciation();
check('a steady two-lineage state fires nothing (no event recorded)', state.events.length === 0);

/* A clade dipping below viability and recovering must not fire — under the old
   count-based detector this was the wobble case that needed a peak guard. */
state.clades = [{id:0, n:200, event:null, from:null}, {id:1, n:3, event:null, from:null}];
detectSpeciation();
state.clades = [{id:0, n:200, event:null, from:null}, {id:1, n:40, event:null, from:null}];
detectSpeciation();
check('a viability wobble fires nothing (no split was recorded)', state.events.length === 0);

/* Unviable splits are ignored — a "split" of 2 organisms is noise, not a species. */
state.events = [];
state.clades = [{id:0, n:200, event:null, from:null}, {id:9, n:2, event:'split', from:[0]}];
detectSpeciation();
check('a split too small to be viable does not fire', state.events.length === 0);

/* Merges are announced too: a name vanishing from the list with no explanation
   would be worse than saying what happened. */
state.events = [];
state.clades = [{id:0, n:240, event:'merge', from:[1]}];
detectSpeciation();
check('a recorded merge fires an event', state.events.length === 1);
check('the merge event is typed distinctly from a speciation', state.events[0].type === 'merge');
check('the merge names what was absorbed', state.events[0].absorbed[0] === cladeName(1));

/* --- UI drain: renders a toast per event, clears the queue, triggers the flash --- */
state.events = [{ type:'speciation', tick:1000, name:'Ember', n:42, totalSpecies:2 }];
drainEvents();
check('drainEvents empties the queue', state.events.length === 0);
check('drainEvents renders exactly one toast', els.toasts.children.length === 1);
check('the toast text includes the species name', els.toasts.children[0].innerHTML.includes('Ember'));
check('the flash pulse class is applied', els.wellFlash.classList._has === true);

/* multiple queued events in one drain (e.g. two splits in the same census window)
   must each get their own toast */
els.toasts.children = [];
state.events = [
  { type:'speciation', tick:2000, name:'Fen', n:10, totalSpecies:3 },
  { type:'speciation', tick:2000, name:'Gale', n:8, totalSpecies:4 },
];
drainEvents();
check('multiple queued events each get their own toast', els.toasts.children.length === 2);

/* --- restart clears stale toasts from the previous run --- */
els.toasts.children = ['stale']; els.toasts.innerHTML = '<div>stale</div>';
restart({ seed:'evtB' });
check('restart clears any toast left over from the previous run', els.toasts.innerHTML === '');
check('restart resets peakSpeciesSeen for the new run', state.peakSpeciesSeen === 1);

/* --- fullscreen: native path, CSS fallback, and Escape priority --- */
els.wellWrap = { classList:{ _c:new Set(),
                 toggle(n,on){ on ? this._c.add(n) : this._c.delete(n); },
                 contains(n){ return this._c.has(n); } } };
els.btnFull = { textContent:'', title:'', setAttribute(){}, onclick:null };

/* No native API available -> the CSS fallback must engage. This is the iOS Safari
   case, where element fullscreen does not exist at all. */
delete els.wellWrap.requestFullscreen;
UI.cssFullscreen = false;
enterFullscreen();
check('with no native API, the CSS fallback engages', UI.cssFullscreen === true);
check('the fallback applies the fs class', els.wellWrap.classList.contains('fs'));
check('isFullscreenActive reports true under the fallback', isFullscreenActive() === true);

exitFullscreen();
check('exiting clears the fallback flag', UI.cssFullscreen === false);
check('exiting removes the fs class', !els.wellWrap.classList.contains('fs'));
check('isFullscreenActive reports false once exited', isFullscreenActive() === false);

/* toggle flips both ways */
toggleFullscreen();
check('toggle enters when inactive', isFullscreenActive() === true);
toggleFullscreen();
check('toggle exits when active', isFullscreenActive() === false);

/* Escape priority: the About dialog must win Escape while it is open, and only
   otherwise should Escape leave fullscreen. Getting this backwards would trap a
   user in fullscreen with the About panel open and no obvious way out. */
enterFullscreen();
els.aboutPanel.hidden = false;          // About is open on top of fullscreen
// simulate the handler's own branch order
if (!els.aboutPanel.hidden) closeAbout();
else if (isFullscreenActive()) exitFullscreen();
check('Escape closes About first when both are open', els.aboutPanel.hidden === true);
check('...and leaves fullscreen still active', isFullscreenActive() === true);

if (!els.aboutPanel.hidden) closeAbout();
else if (isFullscreenActive()) exitFullscreen();
check('a second Escape then exits fullscreen', isFullscreenActive() === false);

/* Native exit driven by the browser (Escape, gesture, tab switch) must resync our
   own state rather than leaving the button stuck showing "exit". */
UI.cssFullscreen = true;
syncFullscreenUI();
check('sync reflects the fallback state on the button', els.btnFull.textContent === '\u2715');
UI.cssFullscreen = false;
syncFullscreenUI();
check('sync restores the enter-fullscreen glyph', els.btnFull.textContent === '\u26F6');

console.log(`\n${pass}/${pass+fail} checks passed`);
if(fail) process.exit(1);
