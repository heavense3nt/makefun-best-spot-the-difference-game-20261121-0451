// The screenshot scenes behind ?shot=start|play|play2|end. Each one plays
// the real rules forward — startGame, clickAtScene, useHint, nextLevel —
// so the frame is what a short game really looks like, and the same seed
// always gives the same frame. The main loop paints the staged world
// twice and sets window.__shotReady for the screenshot tool.
//
//   start — title screen over the first scene
//   play  — level 1 mid-hunt: 3 of 6 found, rings on both panels
//   play2 — level 3 deeper in: 4 of 6 found, one hint used, one heart lost
//   end   — victory screen after all six levels

import { LEVELS } from './scenes.js';
import { clickAtScene, nextLevel, startGame, useHint } from './world.js';
import { SCREEN_TITLE, SCREEN_VICTORY } from './config.js';

/** Tap every difference of the current level, in listed order. */
function clearLevel(world) {
  const level = LEVELS[world.levelIndex];
  for (const diff of level.diffs) clickAtScene(world, diff.x, diff.y, 0);
}

/** Tap the first `count` differences of the current level. */
function findSome(world, count) {
  const level = LEVELS[world.levelIndex];
  for (let i = 0; i < count; i += 1) clickAtScene(world, level.diffs[i].x, level.diffs[i].y, i % 2);
}

/**
 * Set `world` to the named scene and return the screen to draw over it.
 * Any other name is the title screen.
 */
export function stageShot(name, world) {
  if (name === 'play') {
    startGame(world);
    findSome(world, 3);
    world.timeLeft = 62;
    world.foundLabel = 'The sun wears sunglasses';
    return { screen: world.screen };
  }
  if (name === 'play2') {
    startGame(world);
    clearLevel(world);
    nextLevel(world);
    clearLevel(world);
    nextLevel(world);
    // One wrong tap on empty sand, then four finds and a hint.
    clickAtScene(world, 60, 380, 0);
    findSome(world, 4);
    useHint(world);
    world.timeLeft = 41;
    return { screen: world.screen };
  }
  if (name === 'end') {
    startGame(world);
    for (let level = 0; level < LEVELS.length; level += 1) {
      clearLevel(world);
      nextLevel(world);
    }
    world.screen = SCREEN_VICTORY;
    return { screen: SCREEN_VICTORY };
  }
  world.screen = SCREEN_TITLE;
  return { screen: SCREEN_TITLE };
}
