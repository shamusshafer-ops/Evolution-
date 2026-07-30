/* Auto-pause banner: a backgrounded tab pauses the sim to save battery, and that
   needs to be visibly distinct from the player pausing it deliberately — otherwise
   the sim appears to have silently stopped for no reason. */
let pass=0, fail=0; const check=(n,c)=>{ c?pass++:(fail++,console.log('FAIL:',n)); };

const els = { btnRun:{ textContent:'', setAttribute(){} }, autopaused:{ hidden:true }, extinct:{ hidden:true } };
document.getElementById = (id) => els[id] || null;

initWorld({seed:'ui', scenario:'temperate'});

/* --- visibilitychange-style auto-pause sets the flag --- */
setRunning(true);
check('starts running with no auto-pause flag', state.running === true && UI.autoPaused === false);
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
paintReadouts();
check('the banner stays hidden for a manual pause', els.autopaused.hidden === true);

/* --- restart clears the auto-pause flag too, so a stale banner cannot survive a reset --- */
setRunning(false, true);
check('flag is set before reset', UI.autoPaused === true);
restart({ seed:'ui2' });
check('restart clears the auto-pause flag', UI.autoPaused === false);

/* --- shock buttons: disabled while a patch-based shock is blocking, banner shows
   remaining time, and cull's button is never disabled since it never conflicts --- */
els.shocks = { children: SHOCKS.map(sh => ({ textContent: sh.name, disabled: false })), innerHTML:'' };
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

console.log(`\n${pass}/${pass+fail} checks passed`);
if(fail) process.exit(1);
