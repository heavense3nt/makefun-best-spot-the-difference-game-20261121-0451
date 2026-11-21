// Mouse, touch and keyboard input. A click is mapped from page pixels to
// canvas pixels, then to a panel (or a header button, or an overlay card).
// Panel clicks become scene-space clicks on the world; everything else
// (title, level clear, game over, victory, pause) advances on any click
// or on its key, so the game is playable with mouse alone.

import { SCENE, SCREEN_LEVEL_CLEAR, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_VICTORY, VIEW } from './config.js';
import { clickAtScene, nextLevel, startGame, togglePause, useHint } from './world.js';

export const ACTION_CONFIRM = 'confirm';
export const ACTION_HINT = 'hint';
export const ACTION_PAUSE = 'pause';
export const ACTION_RESTART = 'restart';
export const ACTION_MUTE = 'mute';

/** Wire the canvas and keyboard up to the world. Returns a handle. */
export function createInput(canvas, world, renderer, onAction) {
  function toCanvas(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEW.width,
      y: ((event.clientY - rect.top) / rect.height) * VIEW.height,
    };
  }

  function inside(point, rect) {
    return rect && point.x >= rect.x && point.x <= rect.x + rect.w
      && point.y >= rect.y && point.y <= rect.y + rect.h;
  }

  /** Map a canvas point to scene coordinates inside a panel, or null. */
  function toScene(point) {
    const panels = renderer.panelRects();
    for (let index = 0; index < panels.length; index += 1) {
      const panel = panels[index];
      if (!inside(point, panel)) continue;
      const scale = Math.min(panel.w / SCENE.width, panel.h / SCENE.height);
      const dw = SCENE.width * scale;
      const dh = SCENE.height * scale;
      const ox = panel.x + (panel.w - dw) / 2;
      const oy = panel.y + (panel.h - dh) / 2;
      return { x: (point.x - ox) / scale, y: (point.y - oy) / scale, panel: index };
    }
    return null;
  }

  function confirm() {
    if (world.screen === SCREEN_TITLE) {
      startGame(world);
      return ACTION_CONFIRM;
    }
    if (world.screen === SCREEN_LEVEL_CLEAR) {
      nextLevel(world);
      return ACTION_CONFIRM;
    }
    if (world.screen === SCREEN_PAUSED) {
      togglePause(world);
      return ACTION_PAUSE;
    }
    if (world.screen === SCREEN_OVER || world.screen === SCREEN_VICTORY) {
      startGame(world);
      return ACTION_RESTART;
    }
    return null;
  }

  function onPointer(event) {
    const point = toCanvas(event);
    const buttons = renderer.buttons;
    if (inside(point, buttons.hint)) {
      const mask = useHint(world);
      onAction(ACTION_HINT, mask);
      return;
    }
    if (inside(point, buttons.pause)) {
      togglePause(world);
      onAction(ACTION_PAUSE, 0);
      return;
    }
    if (inside(point, buttons.sound)) {
      world.muted = !world.muted;
      onAction(ACTION_MUTE, 0);
      return;
    }
    if (world.screen === SCREEN_PLAY) {
      const scene = toScene(point);
      if (!scene) return;
      const mask = clickAtScene(world, scene.x, scene.y, scene.panel);
      onAction(ACTION_CONFIRM, mask);
      return;
    }
    const action = confirm();
    if (action) onAction(action, 0);
  }

  function onKey(event) {
    const key = event.key.toLowerCase();
    if (key === 'enter' || key === ' ') {
      event.preventDefault();
      const action = confirm();
      if (action) onAction(action, 0);
      return;
    }
    if (key === 'h') {
      const mask = useHint(world);
      onAction(ACTION_HINT, mask);
      return;
    }
    if (key === 'p' || key === 'escape') {
      togglePause(world);
      onAction(ACTION_PAUSE, 0);
      return;
    }
    if (key === 'm') {
      world.muted = !world.muted;
      onAction(ACTION_MUTE, 0);
      return;
    }
    if (key === 'r' && (world.screen === SCREEN_OVER || world.screen === SCREEN_VICTORY || world.screen === SCREEN_PLAY)) {
      startGame(world);
      onAction(ACTION_RESTART, 0);
    }
  }

  canvas.addEventListener('pointerdown', onPointer);
  window.addEventListener('keydown', onKey);
  return { toScene };
}
