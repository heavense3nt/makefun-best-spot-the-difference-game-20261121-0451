// The painter: turns the world into a 1280x800 canvas every frame. The
// layout is a header (title, level, score, hearts, buttons), a timer bar
// with the found counter, two framed panels side by side, and a footer
// with the level trail and the last thing found. Screens other than play
// paint the panels dimmed underneath an overlay card.

import { SCENE, SCREEN_LEVEL_CLEAR, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_VICTORY, VIEW } from './config.js';
import { LEVELS, allDiffIds } from './scenes.js';
import { currentLevel, foundCount } from './world.js';

/** Panel rectangles in canvas space, computed once per draw. */
function panelRects() {
  const gap = 20;
  const width = (VIEW.width - gap * 3) / 2;
  const height = 460;
  const y = 116;
  return [
    { x: gap, y, w: width, h: height },
    { x: gap * 2 + width, y, w: width, h: height },
  ];
}

/** Where a scene point lands inside a panel rect (scene space 560x420). */
function sceneToPanel(panel, sx, sy) {
  const scale = Math.min(panel.w / SCENE.width, panel.h / SCENE.height);
  const dw = SCENE.width * scale;
  const dh = SCENE.height * scale;
  return {
    x: panel.x + (panel.w - dw) / 2 + sx * scale,
    y: panel.y + (panel.h - dh) / 2 + sy * scale,
    scale,
  };
}

/** Rounded-rectangle path helper. */
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** Make a renderer bound to one canvas. */
export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = VIEW.width * dpr;
  canvas.height = VIEW.height * dpr;
  ctx.scale(dpr, dpr);

  // Clickable header buttons, refreshed every draw for the input layer.
  const buttons = { hint: null, pause: null, sound: null };

  function drawButton(rect, label, enabled, accent) {
    ctx.fillStyle = enabled ? accent : '#3a3550';
    rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fill();
    ctx.fillStyle = enabled ? '#171226' : '#8a86a0';
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
  }

  function drawHeader(world) {
    ctx.fillStyle = '#221c38';
    ctx.fillRect(0, 0, VIEW.width, 72);
    ctx.fillStyle = '#ffd93d';
    ctx.font = 'bold 30px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('LOOK TWICE!', 20, 38);
    ctx.fillStyle = '#9d94c0';
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText('spot the difference', 232, 40);

    const level = currentLevel(world);
    ctx.fillStyle = '#332b52';
    rr(ctx, 470, 18, 300, 36, 18);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`LEVEL ${world.levelIndex + 1} · ${level.name.toUpperCase()}`, 620, 37);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText(`SCORE ${world.score}`, 1010, 30);
    ctx.fillStyle = '#9d94c0';
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText(`BEST ${Math.max(world.best, world.score)}`, 1010, 54);

    // Hearts.
    ctx.font = '20px system-ui, sans-serif';
    ctx.textAlign = 'left';
    let hearts = '';
    for (let i = 0; i < 3; i += 1) hearts += i < world.hearts ? '♥ ' : '♡ ';
    ctx.fillStyle = '#ff5a7a';
    ctx.fillText(hearts, 1030, 38);

    // Header buttons: hint, pause, sound.
    buttons.hint = { x: 1110, y: 16, w: 52, h: 40 };
    drawButton(buttons.hint, `H ${world.hintsLeft}`, world.hintsLeft > 0 && world.screen === SCREEN_PLAY, '#ffd93d');
    buttons.pause = { x: 1168, y: 16, w: 40, h: 40 };
    drawButton(buttons.pause, 'II', world.screen === SCREEN_PLAY || world.screen === SCREEN_PAUSED, '#9fd8f0');
    buttons.sound = { x: 1214, y: 16, w: 40, h: 40 };
    drawButton(buttons.sound, world.muted ? '✕' : '♪', true, '#7ec850');
  }

  function drawCounterBar(world) {
    const level = currentLevel(world);
    const total = level.diffs.length;
    const found = foundCount(world);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`FOUND  ${found} / ${total}`, 20, 94);
    ctx.fillStyle = '#3f9e4d';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText(found === total ? 'ALL FOUND!' : `${total - found} STILL HIDING`, 190, 95);

    // Timer bar.
    const bar = { x: 330, y: 82, w: 620, h: 24 };
    const fraction = Math.max(0, world.timeLeft / level.time);
    ctx.fillStyle = '#332b52';
    rr(ctx, bar.x, bar.y, bar.w, bar.h, 12);
    ctx.fill();
    ctx.fillStyle = fraction > 0.5 ? '#3f9e4d' : fraction > 0.25 ? '#f5a623' : '#e23b3b';
    if (fraction > 0) {
      rr(ctx, bar.x, bar.y, Math.max(24, bar.w * fraction), bar.h, 12);
      ctx.fill();
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(formatTime(world.timeLeft), 962, 95);
  }

  function drawPanels(world, dimmed) {
    const rects = panelRects();
    const level = currentLevel(world);
    const rightMods = allDiffIds(level);
    rects.forEach((panel, index) => {
      // Frame.
      ctx.fillStyle = '#2b2447';
      rr(ctx, panel.x - 4, panel.y - 4, panel.w + 8, panel.h + 8, 14);
      ctx.fill();
      ctx.save();
      rr(ctx, panel.x, panel.y, panel.w, panel.h, 10);
      ctx.clip();
      const scale = Math.min(panel.w / SCENE.width, panel.h / SCENE.height);
      const dw = SCENE.width * scale;
      const dh = SCENE.height * scale;
      ctx.translate(panel.x + (panel.w - dw) / 2, panel.y + (panel.h - dh) / 2);
      ctx.scale(scale, scale);
      level.draw(ctx, index === 0 ? new Set() : rightMods);
      ctx.restore();

      // Found markers on both panels.
      for (const diff of level.diffs) {
        if (!world.found.has(diff.id)) continue;
        const hinted = world.hinted.has(diff.id);
        const point = sceneToPanel(panel, diff.x, diff.y);
        const pulse = hinted ? 1 + 0.12 * Math.sin(world.elapsed * 6) : 1;
        ctx.strokeStyle = hinted ? '#ffd93d' : '#3f9e4d';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(point.x, point.y, (diff.r + 8) * point.scale * pulse, 0, Math.PI * 2);
        ctx.stroke();
        if (!hinted) {
          ctx.strokeStyle = '#3f9e4d';
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          const r = (diff.r + 8) * point.scale;
          ctx.beginPath();
          ctx.moveTo(point.x - r * 0.45, point.y);
          ctx.lineTo(point.x - r * 0.12, point.y + r * 0.35);
          ctx.lineTo(point.x + r * 0.5, point.y - r * 0.35);
          ctx.stroke();
        }
      }
      // Fresh-find pop rings.
      for (const pop of world.pops) {
        const point = sceneToPanel(panel, pop.x, pop.y);
        const grow = 1 + pop.age * 1.6;
        ctx.strokeStyle = `rgba(63, 158, 77, ${Math.max(0, 1 - pop.age)})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(point.x, point.y, (pop.r + 8) * point.scale * grow, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Wrong-click red X, on the panel it happened on.
      for (const miss of world.misses) {
        if (miss.panel !== undefined && miss.panel !== index) continue;
        const point = sceneToPanel(panel, miss.x, miss.y);
        const alpha = Math.max(0, 1 - miss.age / 0.9);
        ctx.strokeStyle = `rgba(226, 59, 59, ${alpha})`;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        const r = 16;
        ctx.beginPath();
        ctx.moveTo(point.x - r, point.y - r);
        ctx.lineTo(point.x + r, point.y + r);
        ctx.moveTo(point.x + r, point.y - r);
        ctx.lineTo(point.x - r, point.y + r);
        ctx.stroke();
      }

      // Panel label chip.
      ctx.fillStyle = index === 0 ? '#3b7de2' : '#e2607a';
      rr(ctx, panel.x + 10, panel.y + 10, 34, 30, 8);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(index === 0 ? 'A' : 'B', panel.x + 27, panel.y + 26);
    });
    if (dimmed) {
      ctx.fillStyle = 'rgba(23, 18, 38, 0.55)';
      ctx.fillRect(0, 72, VIEW.width, VIEW.height - 72);
    }
    return rects;
  }

  function drawFooter(world) {
    const level = currentLevel(world);
    ctx.fillStyle = '#221c38';
    ctx.fillRect(0, 592, VIEW.width, VIEW.height - 592);
    // Level trail.
    ctx.fillStyle = '#9d94c0';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('LEVELS', 20, 616);
    LEVELS.forEach((entry, i) => {
      const x = 100 + i * 96;
      const won = world.screen === SCREEN_VICTORY;
      const done = won || i < world.levelIndex || (i === world.levelIndex && world.screen === SCREEN_LEVEL_CLEAR);
      const current = i === world.levelIndex && world.screen !== SCREEN_LEVEL_CLEAR;
      ctx.fillStyle = done ? '#3f9e4d' : current ? '#ffd93d' : '#332b52';
      rr(ctx, x, 600, 86, 30, 15);
      ctx.fill();
      ctx.fillStyle = done ? '#ffffff' : current ? '#171226' : '#9d94c0';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${done ? '✓ ' : ''}${i + 1} ${entry.name.split(' ')[0]}`, x + 43, 616);
    });
    // Last found / hint line.
    ctx.fillStyle = '#ffffff';
    ctx.font = '17px system-ui, sans-serif';
    ctx.textAlign = 'left';
    const label = world.foundLabel && world.elapsed - world.foundLabelAt < 6
      ? `✓ ${world.foundLabel}`
      : `${level.hint} — ${level.diffs.length - foundCount(world)} to go`;
    ctx.fillText(label, 20, 660);
    // Controls help.
    ctx.fillStyle = '#9d94c0';
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText('Click a difference on either picture  ·  H hint  ·  P pause  ·  M sound  ·  R restart', 20, 700);
    ctx.fillStyle = '#6f6890';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText('Look Twice! — every scene is drawn by hand in code. No two panels are ever quite the same.', 20, 740);
  }

  function drawCard(title, lines, accent, button) {
    const w = 640;
    const h = 312;
    const x = (VIEW.width - w) / 2;
    const y = 210;
    ctx.fillStyle = 'rgba(23, 18, 38, 0.92)';
    rr(ctx, x, y, w, h, 20);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    rr(ctx, x, y, w, h, 20);
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.font = 'bold 44px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, VIEW.width / 2, y + 62);
    ctx.fillStyle = '#ffffff';
    ctx.font = '19px system-ui, sans-serif';
    lines.forEach((line, i) => {
      ctx.fillText(line, VIEW.width / 2, y + 122 + i * 32);
    });
    if (button) {
      ctx.fillStyle = accent;
      rr(ctx, VIEW.width / 2 - 200, y + 122 + lines.length * 32 + 8, 400, 44, 22);
      ctx.fill();
      ctx.fillStyle = '#171226';
      ctx.font = 'bold 17px system-ui, sans-serif';
      ctx.fillText(button, VIEW.width / 2, y + 122 + lines.length * 32 + 31);
    }
  }

  /** Paint the whole frame for the world's current screen. */
  function draw(world) {
    ctx.fillStyle = '#171226';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    drawHeader(world);
    drawCounterBar(world);
    const dimmed = world.screen !== SCREEN_PLAY && world.screen !== SCREEN_PAUSED;
    drawPanels(world, dimmed);
    drawFooter(world);

    if (world.screen === SCREEN_TITLE) {
      drawCard('LOOK TWICE!', [
        'Two pictures. One is lying — find every difference.',
        'Click a difference on either side. Wrong taps cost a heart.',
        'Six hand-drawn scenes · 40 differences · hints when you are stuck',
        `Best score so far: ${world.best}`,
      ], '#ffd93d', '▶  CLICK OR PRESS ENTER TO PLAY');
    } else if (world.screen === SCREEN_PAUSED) {
      drawCard('PAUSED', [
        'Take a breath. The differences will wait.',
        'Press P or click to keep hunting.',
      ], '#9fd8f0', '▶  RESUME');
    } else if (world.screen === SCREEN_LEVEL_CLEAR) {
      const level = currentLevel(world);
      drawCard('LEVEL CLEAR!', [
        `${level.name} — all ${level.diffs.length} differences found.`,
        `Time bonus: +${world.levelBonus} points`,
        `Score so far: ${world.score}`,
      ], '#3f9e4d', world.levelIndex + 1 >= LEVELS.length ? '▶  SEE YOUR RESULT' : '▶  NEXT LEVEL');
    } else if (world.screen === SCREEN_OVER) {
      drawCard('GAME OVER', [
        world.overReason,
        `You reached Level ${world.levelIndex + 1} · ${currentLevel(world).name}`,
        `Score: ${world.score}   ·   Best: ${Math.max(world.best, world.score)}`,
      ], '#e23b3b', '↻  PRESS R TO TRY AGAIN');
    } else if (world.screen === SCREEN_VICTORY) {
      drawCard('YOU FOUND THEM ALL!', [
        'Every difference in all six scenes — sharp eyes!',
        `Final score: ${world.score}`,
        `Best: ${Math.max(world.best, world.score)}   ·   40 differences found`,
      ], '#ffd93d', '↻  PRESS R TO PLAY AGAIN');
    }
  }

  return { draw, buttons, panelRects };
}
