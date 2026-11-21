// The rules of Look Twice!: one run through the six levels, the clock,
// the hearts, the hints and the score. The world knows nothing about
// pixels — it works in scene space (560x420) and the renderer turns that
// into panels. `clickAtScene` is the one entry point for a mouse or touch
// tap on either panel, so the screenshot stager can play the real game.

import {
  COMBO_POINTS,
  FIND_POINTS,
  HEARTS_PER_LEVEL,
  HINTS_PER_LEVEL,
  MISS_FLASH,
  MISS_TIME_PENALTY,
  SCREEN_LEVEL_CLEAR,
  SCREEN_OVER,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
  SCREEN_VICTORY,
  TIME_BONUS_PER_SECOND,
} from './config.js';
import { LEVELS } from './scenes.js';
import { createRandom, shuffle } from './random.js';

/** The events the world can raise for the main loop (sound, status line). */
export const EVENT_FOUND = 1;
export const EVENT_MISS = 2;
export const EVENT_HINT = 4;
export const EVENT_CLEAR = 8;
export const EVENT_OVER = 16;
export const EVENT_WIN = 32;
export const EVENT_TICK = 64;

/** A fresh run: title screen, no score yet. */
export function createWorld(seed) {
  const random = createRandom(seed);
  return {
    seed,
    random,
    screen: SCREEN_TITLE,
    levelIndex: 0,
    score: 0,
    best: 0,
    combo: 0,
    found: new Set(),
    hinted: new Set(),
    hearts: HEARTS_PER_LEVEL,
    hintsLeft: HINTS_PER_LEVEL,
    timeLeft: LEVELS[0].time,
    levelBonus: 0,
    misses: [],
    pops: [],
    foundLabel: '',
    foundLabelAt: 0,
    elapsed: 0,
    overReason: '',
    muted: false,
  };
}

/** The level being played right now. */
export function currentLevel(world) {
  return LEVELS[Math.min(world.levelIndex, LEVELS.length - 1)];
}

/** How many differences this level has, and how many are found. */
export function foundCount(world) {
  return world.found.size;
}

/** Start a fresh run from the title screen. */
export function startGame(world) {
  world.screen = SCREEN_PLAY;
  world.levelIndex = 0;
  world.score = 0;
  world.combo = 0;
  world.levelBonus = 0;
  world.overReason = '';
  startLevel(world);
}

/** Set up the current level: fresh finds, hearts, hints and clock. */
export function startLevel(world) {
  const level = currentLevel(world);
  world.found = new Set();
  world.hinted = new Set();
  world.hearts = HEARTS_PER_LEVEL;
  world.hintsLeft = HINTS_PER_LEVEL;
  world.timeLeft = level.time;
  world.misses = [];
  world.pops = [];
  world.foundLabel = '';
  world.screen = SCREEN_PLAY;
}

/** Move on after a cleared level, or win the whole run. */
export function nextLevel(world) {
  if (world.levelIndex + 1 >= LEVELS.length) {
    world.screen = SCREEN_VICTORY;
    return EVENT_WIN;
  }
  world.levelIndex += 1;
  startLevel(world);
  return 0;
}

/** Pause and resume while playing. */
export function togglePause(world) {
  if (world.screen === SCREEN_PLAY) world.screen = SCREEN_PAUSED;
  else if (world.screen === SCREEN_PAUSED) world.screen = SCREEN_PLAY;
}

/**
 * A click at scene coordinates (x, y) on either panel. Returns an event
 * mask: FOUND when a new difference was tapped, MISS otherwise. A found
 * difference is marked on both panels at once.
 */
export function clickAtScene(world, x, y, panel) {
  if (world.screen !== SCREEN_PLAY) return 0;
  const level = currentLevel(world);
  for (const diff of level.diffs) {
    if (world.found.has(diff.id)) continue;
    const dx = x - diff.x;
    const dy = y - diff.y;
    if (dx * dx + dy * dy > diff.r * diff.r) continue;
    world.found.add(diff.id);
    world.combo += 1;
    const gained = FIND_POINTS + (world.combo - 1) * COMBO_POINTS;
    world.score += gained;
    world.foundLabel = diff.label;
    world.foundLabelAt = world.elapsed;
    world.pops.push({ x: diff.x, y: diff.y, r: diff.r, age: 0 });
    if (world.found.size === level.diffs.length) {
      world.levelBonus = Math.ceil(world.timeLeft) * TIME_BONUS_PER_SECOND;
      world.score += world.levelBonus;
      world.screen = SCREEN_LEVEL_CLEAR;
      return EVENT_FOUND | EVENT_CLEAR;
    }
    return EVENT_FOUND;
  }
  // Nothing there: a miss costs a heart, breaks the streak and eats time.
  world.combo = 0;
  world.hearts -= 1;
  world.timeLeft = Math.max(0, world.timeLeft - MISS_TIME_PENALTY);
  world.misses.push({ x, y, panel, age: 0 });
  if (world.hearts <= 0) {
    world.overReason = 'Out of hearts — three wrong taps ends the run.';
    world.screen = SCREEN_OVER;
    return EVENT_MISS | EVENT_OVER;
  }
  return EVENT_MISS;
}

/** Spend a hint: reveal one difference still unfound, for no points. */
export function useHint(world) {
  if (world.screen !== SCREEN_PLAY || world.hintsLeft <= 0) return 0;
  const level = currentLevel(world);
  const remaining = shuffle(world.random, level.diffs.filter((d) => !world.found.has(d.id)));
  if (remaining.length === 0) return 0;
  const picked = remaining[0];
  world.hintsLeft -= 1;
  world.found.add(picked.id);
  world.hinted.add(picked.id);
  world.combo = 0;
  world.foundLabel = `Hint: ${picked.label}`;
  world.foundLabelAt = world.elapsed;
  world.pops.push({ x: picked.x, y: picked.y, r: picked.r, age: 0 });
  if (world.found.size === level.diffs.length) {
    world.levelBonus = Math.ceil(world.timeLeft) * TIME_BONUS_PER_SECOND;
    world.score += world.levelBonus;
    world.screen = SCREEN_LEVEL_CLEAR;
    return EVENT_HINT | EVENT_CLEAR;
  }
  return EVENT_HINT;
}

/**
 * Advance the world by `dt` seconds. The clock only runs while playing;
 * misses and find-pops fade on their own timers. Returns an event mask.
 */
export function step(world, dt) {
  world.elapsed += dt;
  for (const miss of world.misses) miss.age += dt;
  world.misses = world.misses.filter((m) => m.age < MISS_FLASH);
  for (const pop of world.pops) pop.age += dt;
  world.pops = world.pops.filter((p) => p.age < 1.2);
  if (world.screen !== SCREEN_PLAY) return 0;
  world.timeLeft -= dt;
  const wholeBefore = Math.ceil(world.timeLeft + dt);
  const wholeNow = Math.ceil(world.timeLeft);
  if (world.timeLeft <= 0) {
    world.timeLeft = 0;
    world.overReason = 'Time ran out before every difference was found.';
    world.screen = SCREEN_OVER;
    return EVENT_OVER;
  }
  if (wholeNow !== wholeBefore && wholeNow <= 10) return EVENT_TICK;
  return 0;
}
