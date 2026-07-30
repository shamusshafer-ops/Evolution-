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

/* --- restart() clears it too, so a stale banner cannot survive a reset --- */
setRunning(false, true);
check('flag is set before reset', UI.autoPaused === true);
restart({ seed:'ui2' });
check('restart clears the auto-pause flag', UI.autoPaused === false);

console.log(`\n${pass}/${pass+fail} checks passed`);
if(fail) process.exit(1);
