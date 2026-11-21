// Look Twice! — the hand-in program (Node 22, standard library only).
// The game itself is the plain static files under game/ (index.html plus
// its ES modules, no library, no network request), and the screenshots
// under screenshots/ are real renders of it. This program copies both
// folders beside it into the output directory and writes dossier.json,
// the summary the judge reads, with the vendored make.fun library.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for
// /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Everything the entry ships lives beside this file: game/ (the playable
// static game), screenshots/ (real renders of it) and vendor/ (the
// make.fun dossier library, unchanged). Nothing else is copied out.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

const dossierPath = join(out, 'dossier.json');
writeFileSync(
  dossierPath,
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

// Say what was handed in, so a local run shows the same shape the grader
// will see: the dossier plus the game and screenshot folders beside it.
console.log(`Look Twice! handed in to ${out} (dossier.json, ${statSync(dossierPath).size} bytes)`);
