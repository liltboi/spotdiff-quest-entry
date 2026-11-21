// Spotdiff Quest — contest hand-in program (Node 22, standard library only).
//
// The game itself is game/: plain static files, no build step, every script an ES module and
// every asset drawn in code, so game/index.html plays offline in a desktop browser. This file
// copies game/ and screenshots/ beside it into the output directory (MAKEFUN_OUTPUT_DIR outside
// the grader's container, /output inside it) and builds dossier.json with the vendored make.fun
// library, which is the summary the judge reads.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Keep it boring: copying, a few size guards, and one call into vendor/makefun-game.ts.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputRoot = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputRoot, { recursive: true });

// The playable game: copied whole, since the browser asks for index.html and its modules.
cpSync(join(repoRoot, 'game'), join(outputRoot, 'game'), { recursive: true });

// The photographs of the game the judge sees first. Optional only so a local run cannot fail on
// a checkout where they have not been taken yet.
const screenshotSource = join(repoRoot, 'screenshots');
const screenshotTarget = join(outputRoot, 'screenshots');
mkdirSync(screenshotTarget, { recursive: true });
if (existsSync(screenshotSource)) {
  cpSync(screenshotSource, screenshotTarget, { recursive: true });
}

const dossier = buildDossier(outputRoot, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

writeFileSync(join(outputRoot, 'dossier.json'), dossier);
console.log(`spotdiff-quest: wrote ${join(outputRoot, 'dossier.json')} (${Buffer.byteLength(dossier)} bytes)`);
