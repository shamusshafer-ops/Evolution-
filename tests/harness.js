/* Headless harness. Concatenate as:
     cat tests/harness.js build/evo.js tests/test-NAME.js | node
   Provides the few browser globals the sim modules touch, so sim.js can be
   exercised for thousands of generations with no DOM. */
globalThis.window = globalThis;
globalThis.document = { getElementById: () => null, querySelector: () => null,
                        querySelectorAll: () => [], createElement: () => ({ style:{}, classList:{ add(){}, remove(){} } }),
                        addEventListener(){} };
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};
globalThis.localStorage = { _d:{}, getItem(k){ return this._d[k] ?? null; },
                            setItem(k,v){ this._d[k]=String(v); }, removeItem(k){ delete this._d[k]; } };
globalThis.__HEADLESS__ = true;
