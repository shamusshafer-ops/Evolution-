#!/usr/bin/env node
/* build.js — concatenate src/ modules into build/evo.js, then bundle Three.js
   and inline both bundles into a single self-contained index.html.

   Order matters: data before sim (sim reads WORLD/TRAITS/LIFE at call time, but
   render and ui read palette constants at module scope), and main last.

   Usage:
     node build.js           rebuild
     node build.js --check   verify generated artifacts match src/ (CI/parity)
*/
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const ORDER = ['data.js', 'sim.js', 'render.js', 'render3d.js', 'ui.js', 'main.js'];
const ROOT  = __dirname;
const SRC   = path.join(ROOT, 'src');
const BUILD = path.join(ROOT, 'build');
const VENDOR_ENTRY = `
import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';

globalThis.THREE = THREE;
globalThis.ThreeMapControls = MapControls;
`;

function bundle(){
  const parts = ORDER.map(f => {
    const p = path.join(SRC, f);
    if (!fs.existsSync(p)) throw new Error(`missing src module: ${f}`);
    const body = fs.readFileSync(p, 'utf8');
    return `/* ==== ${f} ${'='.repeat(Math.max(0, 68 - f.length))} */\n${body}`;
  });
  return parts.join('\n\n');
}

function vendorBundle(){
  const result = esbuild.buildSync({
    stdin: {
      contents: VENDOR_ENTRY,
      loader: 'js',
      resolveDir: ROOT,
      sourcefile: 'three-entry.js',
    },
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    minify: true,
    legalComments: 'inline',
    write: false,
  });
  if (!result.outputFiles || result.outputFiles.length !== 1){
    throw new Error('Three.js vendor bundle did not produce exactly one output file');
  }
  // Three's embedded GLSL preserves upstream indentation inside template strings.
  // Normalize whitespace-only formatting so the generated HTML remains clean under
  // `git diff --check`; GLSL treats these changes as insignificant whitespace.
  return result.outputFiles[0].text
    .split('\n')
    .map(line => line
      .replace(/^[\t ]+/, indent => indent.replace(/\t/g, '  '))
      .replace(/[\t ]+$/, ''))
    .join('\n')
    .trimEnd();
}

function page(js, vendor){
  const shell = fs.readFileSync(path.join(SRC, 'shell.html'), 'utf8');
  if (!shell.includes('/*__BUNDLE__*/')) throw new Error('shell.html is missing the /*__BUNDLE__*/ marker');
  const inline = `${vendor}\n\n/* ==== Evolution application ${'='.repeat(42)} */\n${js}`;
  return shell.replace('/*__BUNDLE__*/', () => inline);
}

function artifacts(){
  const js = bundle();
  const vendor = vendorBundle();
  return { js, html:page(js, vendor) };
}

function build(){
  if (!fs.existsSync(BUILD)) fs.mkdirSync(BUILD, { recursive:true });
  const { js, html } = artifacts();
  fs.writeFileSync(path.join(BUILD, 'evo.js'), js);
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);
  return { js, html };
}

if (process.argv.includes('--check')){
  const { js, html } = artifacts();
  const cur = fs.existsSync(path.join(BUILD, 'evo.js')) ? fs.readFileSync(path.join(BUILD,'evo.js'),'utf8') : '';
  const curHtml = fs.existsSync(path.join(ROOT,'index.html')) ? fs.readFileSync(path.join(ROOT,'index.html'),'utf8') : '';
  const stale = [];
  if (cur !== js) stale.push('build/evo.js');
  if (curHtml !== html) stale.push('index.html');
  if (stale.length){
    console.error('generated artifacts are stale or missing:\n  ' + stale.join('\n  '));
    process.exit(1);
  }
  console.log('build parity ok');
} else {
  const { js, html } = build();
  console.log('build ok:');
  console.log(`  build/evo.js  ${js.length} bytes`);
  console.log(`  index.html    ${html.length} bytes`);
}
