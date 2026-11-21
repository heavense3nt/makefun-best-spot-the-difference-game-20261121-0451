// Boot and the one loop: input is read every frame, the world advances in
// fixed 1/60 s steps (several in a slow frame, none in a fast one), and the
// renderer paints what is there. The game moves between title, play,
// paused, level-clear, game-over and victory screens.
//
// ?seed=N fixes the shuffle behind hints. ?shot=start|play|play2|end (with
// &seed=N) stages that scene instead of running the loop, paints it twice
// and sets window.__shotReady for a screenshot.

import { BEST_KEY, SCREEN_OVER, SCREEN_VICTORY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_CLEAR, EVENT_FOUND, EVENT_HINT, EVENT_MISS, EVENT_OVER, EVENT_TICK, currentLevel, startGame, step } from './world.js';
import { createInput } from './input.js';
import { createRenderer } from './render.js';
import { createAudio } from './audio.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const audio = createAudio(() => world.muted);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best then lasts one visit.
  }
}

world.best = readBest();

/** Keep the screen-reader line and the best score in step with the world. */
function announce() {
  const level = world.levelIndex + 1;
  if (world.screen === 'play') {
    status.textContent = `Level ${level}: ${world.found.size} of ${currentLevel(world).diffs.length} differences found, ${world.hearts} hearts left.`;
  }
}

function onAction(action, mask) {
  audio.unlock();
  if (mask & EVENT_FOUND) audio.found();
  if (mask & EVENT_MISS) audio.miss();
  if (mask & EVENT_HINT) audio.hint();
  if (mask & EVENT_CLEAR) audio.clear();
  if (mask & EVENT_OVER) audio.over();
  if (action === 'restart' || action === 'confirm') {
    if (world.score > world.best) {
      world.best = world.score;
      saveBest(world.best);
    }
  }
  announce();
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  createInput(canvas, world, renderer, onAction);
  let accumulator = 0;
  let last = performance.now();
  function frame(now) {
    const elapsed = Math.min(MAX_FRAME, (now - last) / 1000);
    last = now;
    accumulator += elapsed;
    while (accumulator >= STEP) {
      accumulator -= STEP;
      const mask = step(world, STEP);
      if (mask & EVENT_TICK) audio.tick();
      if (mask & EVENT_OVER) {
        audio.over();
        if (world.score > world.best) {
          world.best = world.score;
          saveBest(world.best);
        }
      }
    }
    renderer.draw(world);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
