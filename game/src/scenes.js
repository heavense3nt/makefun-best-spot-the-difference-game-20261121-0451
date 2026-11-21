// The six scenes of Look Twice!, each drawn from scratch with canvas
// shapes — no image files, no borrowed art. A level is a `draw` function
// that paints the scene in a 560x420 space, plus a `diffs` list. The left
// panel is drawn with no differences active; the right panel with all of
// them, so the two pictures are near-identical by construction. A
// difference is a spot in scene space with a click radius and a short
// label the game can announce; the draw function reads `mods` (a Set of
// the active difference ids) and changes exactly that one thing.

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

/** Filled circle helper. */
function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** Filled ellipse helper. */
function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** A puffy cloud from three circles. `puffs` is how many bumps it has. */
function cloud(ctx, x, y, scale, puffs) {
  ctx.fillStyle = '#ffffff';
  circle(ctx, x, y, 18 * scale);
  circle(ctx, x + 20 * scale, y - 6 * scale, 15 * scale);
  if (puffs >= 3) circle(ctx, x + 38 * scale, y, 13 * scale);
  ctx.fillRect(x - 18 * scale, y, 56 * scale, 12 * scale);
}

/** A five-pointed star (or `points`-pointed) at x, y. */
function star(ctx, x, y, outer, inner, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

/** A simple bird: two short arcs like a distant "v". */
function bird(ctx, x, y, scale) {
  ctx.strokeStyle = '#2d3a4a';
  ctx.lineWidth = 3 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12 * scale, y);
  ctx.quadraticCurveTo(x - 6 * scale, y - 8 * scale, x, y);
  ctx.quadraticCurveTo(x + 6 * scale, y - 8 * scale, x + 12 * scale, y);
  ctx.stroke();
}

/* ------------------------------------------------------------------ */
/* Level 1 — Sunny Park. 6 differences, 90 seconds.                    */
/* ------------------------------------------------------------------ */

function drawPark(ctx, mods) {
  // Sky and grass.
  ctx.fillStyle = '#9fd8f0';
  ctx.fillRect(0, 0, 560, 300);
  ctx.fillStyle = '#7ec850';
  ctx.fillRect(0, 300, 560, 120);
  ctx.fillStyle = '#6db844';
  ctx.fillRect(0, 300, 560, 10);

  // Sun, top left. Right panel: it wears sunglasses.
  ctx.fillStyle = '#ffd93d';
  circle(ctx, 82, 68, 34);
  ctx.strokeStyle = '#f5b800';
  ctx.lineWidth = 4;
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(82 + Math.cos(a) * 42, 68 + Math.sin(a) * 42);
    ctx.lineTo(82 + Math.cos(a) * 52, 68 + Math.sin(a) * 52);
    ctx.stroke();
  }
  ctx.fillStyle = '#2d3a4a';
  circle(ctx, 74, 64, 3);
  circle(ctx, 92, 64, 3);
  ctx.strokeStyle = '#2d3a4a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(83, 74, 8, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  if (mods.has('shades')) {
    ctx.fillStyle = '#1c2430';
    rr(ctx, 62, 58, 16, 11, 4);
    ctx.fill();
    rr(ctx, 88, 58, 16, 11, 4);
    ctx.fill();
    ctx.fillRect(78, 61, 10, 3);
  }

  // Cloud, top middle. Right panel: one puff fewer.
  cloud(ctx, 300, 62, 1, mods.has('cloud') ? 2 : 3);
  // Second small cloud, identical on both sides.
  cloud(ctx, 470, 44, 0.6, 3);

  // Bird. Right panel: it flew away.
  if (!mods.has('bird')) bird(ctx, 350, 128, 1);

  // Apple tree, right side.
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(462, 210, 18, 92);
  ctx.fillStyle = '#3f9e4d';
  circle(ctx, 430, 190, 34);
  circle(ctx, 490, 190, 34);
  circle(ctx, 460, 158, 38);
  ctx.fillStyle = '#e23b3b';
  circle(ctx, 438, 200, 7);
  circle(ctx, 482, 182, 7);
  if (!mods.has('apple')) circle(ctx, 460, 210, 7);

  // Bench, left.
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(150, 330, 120, 10);
  ctx.fillRect(158, 340, 10, 34);
  ctx.fillRect(252, 340, 10, 34);
  ctx.fillRect(150, 302, 120, 8);
  if (!mods.has('bench')) ctx.fillRect(150, 316, 120, 8);
  ctx.fillRect(158, 288, 8, 20);
  ctx.fillRect(254, 288, 8, 20);

  // Flower row along the grass.
  const flowers = [60, 130, 210, 300, 380];
  flowers.forEach((x, i) => {
    const petal = i === 2 && mods.has('flower') ? '#3b7de2' : '#e23b6e';
    ctx.fillStyle = petal;
    for (let p = 0; p < 5; p += 1) {
      const a = (p * Math.PI * 2) / 5;
      circle(ctx, x + Math.cos(a) * 8, 384 + Math.sin(a) * 8, 6);
    }
    ctx.fillStyle = '#ffd93d';
    circle(ctx, x, 384, 6);
    ctx.strokeStyle = '#3f9e4d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 390);
    ctx.lineTo(x, 408);
    ctx.stroke();
  });

  // A red kite stuck in the grass, same on both sides.
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(330, 372);
  ctx.lineTo(352, 340);
  ctx.stroke();
  ctx.fillStyle = '#e23b3b';
  ctx.beginPath();
  ctx.moveTo(352, 336);
  ctx.lineTo(372, 356);
  ctx.lineTo(352, 366);
  ctx.lineTo(336, 352);
  ctx.closePath();
  ctx.fill();
}

/* ------------------------------------------------------------------ */
/* Level 2 — Cozy Kitchen. 6 differences, 90 seconds.                  */
/* ------------------------------------------------------------------ */

function drawKitchen(ctx, mods) {
  // Wall, floor and counter.
  ctx.fillStyle = '#f6d9a8';
  ctx.fillRect(0, 0, 560, 320);
  ctx.fillStyle = '#c98f5f';
  ctx.fillRect(0, 320, 560, 100);
  ctx.fillStyle = '#a4713f';
  ctx.fillRect(0, 316, 560, 6);
  ctx.fillStyle = '#e8b06a';
  ctx.fillRect(40, 250, 480, 66);

  // Window with a sunny view. Right panel: one curtain drawn shut.
  ctx.fillStyle = '#7ec8ee';
  ctx.fillRect(66, 66, 130, 120);
  ctx.fillStyle = '#ffd93d';
  circle(ctx, 160, 100, 18);
  ctx.fillStyle = '#ffffff';
  circle(ctx, 96, 150, 12);
  circle(ctx, 116, 144, 10);
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 6;
  ctx.strokeRect(66, 66, 130, 120);
  ctx.beginPath();
  ctx.moveTo(131, 66);
  ctx.lineTo(131, 186);
  ctx.moveTo(66, 126);
  ctx.lineTo(196, 126);
  ctx.stroke();
  ctx.fillStyle = '#e2607a';
  ctx.fillRect(54, 58, 22, 136);
  ctx.fillRect(186, 58, 22, 136);
  if (mods.has('curtain')) {
    ctx.fillStyle = '#e2607a';
    ctx.fillRect(96, 58, 60, 136);
  }

  // Wall clock. Right panel: half past four, not three o'clock.
  ctx.fillStyle = '#ffffff';
  circle(ctx, 300, 96, 32);
  ctx.strokeStyle = '#2d3a4a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(300, 96, 32, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(300, 96);
  ctx.lineTo(300, 76);
  ctx.moveTo(300, 96);
  if (mods.has('clock')) ctx.lineTo(286, 112);
  else ctx.lineTo(318, 96);
  ctx.stroke();
  circle(ctx, 300, 96, 3);

  // Kettle on the stove. Right panel: no steam rising.
  ctx.fillStyle = '#3b3f4a';
  ctx.fillRect(420, 236, 90, 14);
  ctx.fillStyle = '#c0c8d4';
  ctx.beginPath();
  ctx.moveTo(428, 236);
  ctx.lineTo(442, 196);
  ctx.lineTo(492, 196);
  ctx.lineTo(506, 236);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2d3a4a';
  ctx.fillRect(458, 184, 18, 14);
  ctx.strokeStyle = '#2d3a4a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(492, 206);
  ctx.lineTo(514, 196);
  ctx.stroke();
  if (!mods.has('steam')) {
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(452, 176);
    ctx.quadraticCurveTo(444, 162, 452, 148);
    ctx.moveTo(472, 176);
    ctx.quadraticCurveTo(480, 162, 472, 148);
    ctx.stroke();
  }

  // Fruit bowl. Right panel: the middle fruit is a green apple, not an orange.
  ctx.fillStyle = '#3b7de2';
  ctx.beginPath();
  ctx.moveTo(180, 300);
  ctx.lineTo(260, 300);
  ctx.lineTo(248, 316);
  ctx.lineTo(192, 316);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e23b3b';
  circle(ctx, 198, 292, 11);
  circle(ctx, 242, 292, 11);
  ctx.fillStyle = mods.has('fruit') ? '#7ec850' : '#f58a1f';
  circle(ctx, 220, 288, 12);

  // Mug on the counter. Right panel: blue, not red.
  ctx.fillStyle = mods.has('mug') ? '#3b7de2' : '#e23b3b';
  rr(ctx, 330, 282, 34, 30, 5);
  ctx.fill();
  ctx.strokeStyle = mods.has('mug') ? '#3b7de2' : '#e23b3b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(368, 297, 9, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();

  // Cat asleep on the rug. Right panel: its tail points down, not up.
  ctx.fillStyle = '#e8a04c';
  ctx.beginPath();
  ctx.moveTo(430, 396);
  ctx.lineTo(430, 356);
  ctx.lineTo(520, 356);
  ctx.lineTo(520, 396);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f2c14e';
  ellipse(ctx, 478, 372, 34, 14);
  circle(ctx, 448, 364, 12);
  ctx.beginPath();
  ctx.moveTo(440, 354);
  ctx.lineTo(444, 344);
  ctx.lineTo(448, 354);
  ctx.moveTo(452, 354);
  ctx.lineTo(456, 344);
  ctx.lineTo(460, 354);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#f2c14e';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (mods.has('tail')) {
    ctx.moveTo(508, 378);
    ctx.quadraticCurveTo(522, 384, 516, 396);
  } else {
    ctx.moveTo(508, 368);
    ctx.quadraticCurveTo(522, 356, 520, 342);
  }
  ctx.stroke();
}

/* ------------------------------------------------------------------ */
/* Level 3 — Beach Day. 6 differences, 80 seconds.                     */
/* ------------------------------------------------------------------ */

function drawBeach(ctx, mods) {
  // Sky, sea and sand.
  ctx.fillStyle = '#8fd0f5';
  ctx.fillRect(0, 0, 560, 180);
  ctx.fillStyle = '#2f8fd0';
  ctx.fillRect(0, 180, 560, 120);
  ctx.fillStyle = '#f2d492';
  ctx.fillRect(0, 300, 560, 120);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(20, 220);
  ctx.quadraticCurveTo(90, 210, 160, 220);
  ctx.moveTo(300, 250);
  ctx.quadraticCurveTo(370, 240, 440, 250);
  ctx.stroke();

  // Smiling sun. Right panel: it lost its smile.
  ctx.fillStyle = '#ffd93d';
  circle(ctx, 84, 62, 30);
  ctx.fillStyle = '#2d3a4a';
  circle(ctx, 76, 58, 3);
  circle(ctx, 94, 58, 3);
  if (!mods.has('sunface')) {
    ctx.strokeStyle = '#2d3a4a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(85, 66, 9, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  // Sailboat. Right panel: a striped sail, not a plain one.
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(446, 216, 54, 8);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(472, 216);
  ctx.lineTo(472, 160);
  ctx.lineTo(500, 216);
  ctx.closePath();
  ctx.fill();
  if (mods.has('sail')) {
    ctx.fillStyle = '#e2607a';
    ctx.beginPath();
    ctx.moveTo(472, 188);
    ctx.lineTo(486, 188);
    ctx.lineTo(486, 216);
    ctx.lineTo(472, 216);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(472, 160);
  ctx.lineTo(472, 216);
  ctx.stroke();

  // Beach umbrella. Right panel: blue stripes, not red.
  const stripe = mods.has('umbrella') ? '#3b7de2' : '#e2607a';
  ctx.fillStyle = stripe;
  ctx.beginPath();
  ctx.moveTo(280, 130);
  ctx.arc(280, 190, 62, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(280, 130);
  ctx.arc(280, 190, 62, Math.PI * 1.25, Math.PI * 1.75);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = stripe;
  ctx.beginPath();
  ctx.moveTo(280, 130);
  ctx.arc(280, 190, 62, Math.PI * 1.5, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(280, 130);
  ctx.lineTo(280, 260);
  ctx.stroke();

  // Beach ball. Right panel: the top stripe is green, not yellow.
  ctx.fillStyle = '#ffffff';
  circle(ctx, 150, 336, 26);
  ctx.save();
  ctx.beginPath();
  ctx.arc(150, 336, 26, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#e23b3b';
  ctx.fillRect(124, 310, 16, 52);
  ctx.fillStyle = mods.has('ball') ? '#3f9e4d' : '#ffd93d';
  ctx.fillRect(142, 310, 16, 52);
  ctx.fillStyle = '#3b7de2';
  ctx.fillRect(160, 310, 16, 52);
  ctx.restore();
  ctx.strokeStyle = '#2d3a4a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(150, 336, 26, 0, Math.PI * 2);
  ctx.stroke();

  // Bucket and spade. Right panel: the spade is gone.
  ctx.fillStyle = '#e2607a';
  ctx.beginPath();
  ctx.moveTo(420, 330);
  ctx.lineTo(456, 330);
  ctx.lineTo(450, 366);
  ctx.lineTo(426, 366);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f2d492';
  circle(ctx, 438, 330, 20);
  if (!mods.has('spade')) {
    ctx.strokeStyle = '#3b7de2';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(462, 330);
    ctx.lineTo(486, 306);
    ctx.stroke();
    ctx.fillStyle = '#3b7de2';
    ctx.beginPath();
    ctx.moveTo(486, 300);
    ctx.lineTo(498, 306);
    ctx.lineTo(492, 318);
    ctx.lineTo(480, 312);
    ctx.closePath();
    ctx.fill();
  }

  // Starfish. Right panel: it washed away.
  if (!mods.has('starfish')) {
    ctx.fillStyle = '#f58a1f';
    star(ctx, 306, 372, 18, 8, 5);
  }
}

/* ------------------------------------------------------------------ */
/* Level 4 — Night Camp. 7 differences, 80 seconds.                    */
/* ------------------------------------------------------------------ */

function drawCamp(ctx, mods) {
  // Night sky, ground and stars.
  ctx.fillStyle = '#1b2a4a';
  ctx.fillRect(0, 0, 560, 300);
  ctx.fillStyle = '#2f4d2a';
  ctx.fillRect(0, 300, 560, 120);
  ctx.fillStyle = '#ffffff';
  const stars = [[60, 40], [180, 30], [250, 70], [330, 36], [420, 52], [510, 34], [140, 110], [380, 110]];
  stars.forEach(([x, y], i) => {
    if (i === 5 && mods.has('star')) return;
    star(ctx, x, y, 7, 3, 4);
  });

  // Moon. Right panel: a crescent, not full.
  ctx.fillStyle = '#f5ecd7';
  circle(ctx, 92, 76, 30);
  if (mods.has('moon')) {
    ctx.fillStyle = '#1b2a4a';
    circle(ctx, 106, 68, 26);
  }

  // Tent. Right panel: the door is open, showing the dark inside.
  ctx.fillStyle = '#e2603b';
  ctx.beginPath();
  ctx.moveTo(210, 300);
  ctx.lineTo(280, 210);
  ctx.lineTo(350, 300);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c94a28';
  ctx.beginPath();
  ctx.moveTo(280, 210);
  ctx.lineTo(308, 300);
  ctx.lineTo(252, 300);
  ctx.closePath();
  ctx.fill();
  if (mods.has('tent')) {
    ctx.fillStyle = '#241a12';
    ctx.beginPath();
    ctx.moveTo(280, 252);
    ctx.lineTo(298, 300);
    ctx.lineTo(262, 300);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(280, 210);
  ctx.lineTo(280, 300);
  ctx.stroke();

  // Campfire. Right panel: two flame tongues, not three.
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(412, 322, 56, 10);
  ctx.fillRect(420, 312, 40, 10);
  ctx.fillStyle = '#f58a1f';
  ctx.beginPath();
  ctx.moveTo(420, 322);
  ctx.quadraticCurveTo(428, 292, 440, 288);
  ctx.quadraticCurveTo(448, 300, 446, 322);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd93d';
  ctx.beginPath();
  ctx.moveTo(432, 322);
  ctx.quadraticCurveTo(436, 304, 442, 302);
  ctx.quadraticCurveTo(446, 312, 444, 322);
  ctx.closePath();
  ctx.fill();
  if (!mods.has('fire')) {
    ctx.fillStyle = '#f58a1f';
    ctx.beginPath();
    ctx.moveTo(446, 322);
    ctx.quadraticCurveTo(452, 298, 460, 296);
    ctx.quadraticCurveTo(462, 312, 458, 322);
    ctx.closePath();
    ctx.fill();
  }

  // Log bench by the fire. Right panel: it is missing.
  if (!mods.has('log')) {
    ctx.fillStyle = '#8a5a2b';
    rr(ctx, 500, 330, 44, 14, 6);
    ctx.fill();
    ctx.fillStyle = '#a4713f';
    circle(ctx, 504, 337, 7);
  }

  // Owl on the pine. Right panel: its eyes are shut.
  ctx.fillStyle = '#1f3a24';
  ctx.beginPath();
  ctx.moveTo(496, 200);
  ctx.lineTo(528, 120);
  ctx.lineTo(560, 200);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(524, 200, 8, 30);
  ctx.fillStyle = '#6b4a8a';
  ellipse(ctx, 528, 108, 16, 20);
  ctx.beginPath();
  ctx.moveTo(516, 92);
  ctx.lineTo(520, 84);
  ctx.lineTo(524, 92);
  ctx.moveTo(532, 92);
  ctx.lineTo(536, 84);
  ctx.lineTo(540, 92);
  ctx.closePath();
  ctx.fill();
  if (mods.has('owl')) {
    ctx.strokeStyle = '#1c2430';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(518, 104);
    ctx.lineTo(526, 104);
    ctx.moveTo(530, 104);
    ctx.lineTo(538, 104);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#ffffff';
    circle(ctx, 522, 104, 5);
    circle(ctx, 534, 104, 5);
    ctx.fillStyle = '#1c2430';
    circle(ctx, 522, 104, 2.5);
    circle(ctx, 534, 104, 2.5);
  }

  // Lantern hanging from a branch. Right panel: its light is out.
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(150, 150);
  ctx.lineTo(150, 168);
  ctx.stroke();
  if (!mods.has('lantern')) {
    ctx.fillStyle = 'rgba(255, 217, 61, 0.25)';
    circle(ctx, 150, 186, 30);
  }
  ctx.fillStyle = '#2d3a4a';
  rr(ctx, 138, 168, 24, 34, 5);
  ctx.fill();
  ctx.fillStyle = mods.has('lantern') ? '#5a6b7a' : '#ffd93d';
  rr(ctx, 143, 176, 14, 18, 3);
  ctx.fill();
}

/* ------------------------------------------------------------------ */
/* Level 5 — Space Station. 7 differences, 75 seconds.                 */
/* ------------------------------------------------------------------ */

function drawSpace(ctx, mods) {
  // Deep space and a band of stars.
  ctx.fillStyle = '#0d1030';
  ctx.fillRect(0, 0, 560, 420);
  ctx.fillStyle = '#ffffff';
  const stars = [[50, 50], [120, 90], [200, 40], [300, 80], [380, 40], [470, 70], [520, 130], [90, 180], [250, 150]];
  stars.forEach(([x, y], i) => {
    if (i === 7 && mods.has('star2')) return;
    circle(ctx, x, y, i % 3 === 0 ? 3 : 2);
  });

  // Ringed planet. Right panel: no rings.
  ctx.fillStyle = '#e2607a';
  circle(ctx, 448, 108, 40);
  ctx.fillStyle = '#c94a68';
  circle(ctx, 432, 96, 10);
  circle(ctx, 462, 122, 7);
  if (!mods.has('rings')) {
    ctx.strokeStyle = '#ffd93d';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(448, 108, 62, 16, -0.35, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Rocket. Right panel: its engine flame is out.
  ctx.fillStyle = '#e8ecf2';
  ctx.beginPath();
  ctx.moveTo(150, 150);
  ctx.quadraticCurveTo(176, 176, 176, 220);
  ctx.lineTo(124, 220);
  ctx.quadraticCurveTo(124, 176, 150, 150);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e23b3b';
  ctx.beginPath();
  ctx.moveTo(150, 150);
  ctx.lineTo(162, 176);
  ctx.lineTo(138, 176);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3b7de2';
  circle(ctx, 150, 198, 10);
  ctx.strokeStyle = '#3b7de2';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(150, 198, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#e23b3b';
  ctx.beginPath();
  ctx.moveTo(124, 210);
  ctx.lineTo(106, 236);
  ctx.lineTo(124, 228);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(176, 210);
  ctx.lineTo(194, 236);
  ctx.lineTo(176, 228);
  ctx.closePath();
  ctx.fill();
  if (!mods.has('flame')) {
    ctx.fillStyle = '#f58a1f';
    ctx.beginPath();
    ctx.moveTo(138, 220);
    ctx.lineTo(150, 252);
    ctx.lineTo(162, 220);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffd93d';
    ctx.beginPath();
    ctx.moveTo(144, 220);
    ctx.lineTo(150, 240);
    ctx.lineTo(156, 220);
    ctx.closePath();
    ctx.fill();
  }

  // Astronaut. Right panel: the tether to the station is gone.
  if (!mods.has('tether')) {
    ctx.strokeStyle = '#c0c8d4';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(300, 300);
    ctx.quadraticCurveTo(330, 260, 360, 250);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = '#ffffff';
  ellipse(ctx, 300, 300, 26, 20);
  circle(ctx, 300, 268, 15);
  ctx.fillStyle = '#9fd8f0';
  rr(ctx, 288, 258, 24, 16, 7);
  ctx.fill();
  ctx.fillStyle = '#e23b3b';
  ctx.fillRect(296, 288, 8, 12);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(278, 296, 14, 8);
  ctx.fillRect(314, 296, 14, 8);

  // Satellite. Right panel: its dish points down, not up.
  ctx.fillStyle = '#c0c8d4';
  ctx.fillRect(478, 250, 46, 26);
  ctx.fillStyle = '#3b7de2';
  ctx.fillRect(478, 250, 46, 8);
  ctx.strokeStyle = '#c0c8d4';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(524, 263);
  ctx.lineTo(540, 246);
  ctx.stroke();
  ctx.fillStyle = '#ffd93d';
  ctx.beginPath();
  if (mods.has('dish')) {
    ctx.arc(540, 258, 12, Math.PI * 0.15, Math.PI * 0.85);
  } else {
    ctx.arc(540, 234, 12, Math.PI * 1.15, Math.PI * 1.85);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3b7de2';
  ctx.fillRect(466, 258, 12, 10);
  ctx.fillRect(482, 258, 12, 10);

  // A little green alien peeking from the station window. Right panel: gone.
  ctx.fillStyle = '#2d3a4a';
  rr(ctx, 60, 300, 90, 70, 10);
  ctx.fill();
  if (!mods.has('alien')) {
    ctx.fillStyle = '#7ec850';
    circle(ctx, 105, 332, 16);
    ctx.fillStyle = '#1c2430';
    ellipse(ctx, 99, 330, 3, 5);
    ellipse(ctx, 111, 330, 3, 5);
    ctx.strokeStyle = '#7ec850';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(98, 318);
    ctx.lineTo(94, 308);
    ctx.moveTo(112, 318);
    ctx.lineTo(116, 308);
    ctx.stroke();
    ctx.fillStyle = '#7ec850';
    circle(ctx, 94, 307, 2.5);
    circle(ctx, 116, 307, 2.5);
  }
  ctx.fillStyle = '#ffd93d';
  circle(ctx, 132, 318, 4);

  // Control panel lights along the bottom. Right panel: one light is red.
  ctx.fillStyle = '#1c2430';
  rr(ctx, 220, 384, 200, 26, 8);
  ctx.fill();
  const lights = ['#3f9e4d', '#3f9e4d', '#3f9e4d', '#ffd93d', '#3f9e4d'];
  lights.forEach((colour, i) => {
    ctx.fillStyle = i === 2 && mods.has('lights') ? '#e23b3b' : colour;
    circle(ctx, 240 + i * 36, 397, 7);
  });
}

/* ------------------------------------------------------------------ */
/* Level 6 — City Street. 8 differences, 70 seconds.                   */
/* ------------------------------------------------------------------ */

function drawCity(ctx, mods) {
  // Sky, sun and road.
  ctx.fillStyle = '#a8d0e8';
  ctx.fillRect(0, 0, 560, 300);
  ctx.fillStyle = '#ffd93d';
  circle(ctx, 500, 56, 26);
  ctx.fillStyle = '#5a5a6a';
  ctx.fillRect(0, 300, 560, 120);
  ctx.fillStyle = '#f5ecd7';
  for (let x = 20; x < 560; x += 80) ctx.fillRect(x, 352, 44, 8);

  // Cloud. Right panel: it drifted away.
  if (!mods.has('cloud2')) cloud(ctx, 120, 60, 0.9, 3);

  // Buildings with lit windows.
  const buildings = [
    { x: 30, y: 110, w: 110, h: 190, colour: '#7a6a9a' },
    { x: 160, y: 70, w: 120, h: 230, colour: '#5a7a9a' },
    { x: 300, y: 130, w: 100, h: 170, colour: '#9a6a5a' },
  ];
  buildings.forEach((b, bi) => {
    ctx.fillStyle = b.colour;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        const wx = b.x + 14 + col * 32;
        const wy = b.y + 18 + row * 44;
        const missing = bi === 1 && row === 2 && col === 1 && mods.has('windows');
        ctx.fillStyle = missing ? '#3a3a4a' : '#ffd93d';
        ctx.fillRect(wx, wy, 18, 24);
      }
    }
  });

  // Traffic light. Right panel: red, not green.
  ctx.fillStyle = '#2d3a4a';
  ctx.fillRect(426, 210, 14, 90);
  rr(ctx, 414, 150, 38, 74, 8);
  ctx.fill();
  ctx.fillStyle = mods.has('light') ? '#e23b3b' : '#3a3a4a';
  circle(ctx, 433, 168, 9);
  ctx.fillStyle = '#ffd93d';
  circle(ctx, 433, 188, 9);
  ctx.fillStyle = mods.has('light') ? '#3a3a4a' : '#3f9e4d';
  circle(ctx, 433, 208, 9);

  // Red car. Right panel: blue.
  const car = mods.has('car') ? '#3b7de2' : '#e23b3b';
  ctx.fillStyle = car;
  rr(ctx, 200, 318, 150, 30, 10);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(230, 318);
  ctx.lineTo(248, 296);
  ctx.lineTo(312, 296);
  ctx.lineTo(330, 318);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#9fd8f0';
  ctx.fillRect(252, 300, 56, 18);
  ctx.fillStyle = '#1c2430';
  circle(ctx, 232, 350, 14);
  circle(ctx, 318, 350, 14);
  ctx.fillStyle = '#c0c8d4';
  circle(ctx, 232, 350, 6);
  circle(ctx, 318, 350, 6);
  ctx.fillStyle = '#ffd93d';
  circle(ctx, 344, 332, 5);

  // Tree with a bird nest. Right panel: no nest.
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(486, 250, 12, 50);
  ctx.fillStyle = '#3f9e4d';
  circle(ctx, 470, 236, 24);
  circle(ctx, 508, 236, 24);
  circle(ctx, 490, 214, 26);
  if (!mods.has('tree')) {
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(490, 226, 12, 0, Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#5a7de2';
    circle(ctx, 484, 222, 4);
    circle(ctx, 496, 222, 4);
  }

  // Fire hydrant. Right panel: yellow cap, not red.
  ctx.fillStyle = '#e23b3b';
  rr(ctx, 96, 330, 26, 40, 6);
  ctx.fill();
  ctx.fillStyle = mods.has('hydrant') ? '#ffd93d' : '#e23b3b';
  circle(ctx, 109, 326, 10);
  ctx.fillStyle = '#c0c8d4';
  ctx.fillRect(100, 344, 18, 6);

  // Street sign. Right panel: the arrow points right, not left.
  ctx.fillStyle = '#2d3a4a';
  ctx.fillRect(392, 250, 6, 70);
  ctx.fillStyle = '#3f9e4d';
  rr(ctx, 366, 214, 58, 34, 6);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  if (mods.has('sign')) {
    ctx.moveTo(412, 231);
    ctx.lineTo(394, 231);
    ctx.lineTo(394, 224);
    ctx.lineTo(384, 231);
    ctx.lineTo(394, 238);
    ctx.lineTo(394, 231);
  } else {
    ctx.moveTo(378, 231);
    ctx.lineTo(396, 231);
    ctx.lineTo(396, 224);
    ctx.lineTo(406, 231);
    ctx.lineTo(396, 238);
    ctx.lineTo(396, 231);
  }
  ctx.closePath();
  ctx.fill();

  // Zebra crossing. Right panel: four stripes, not five.
  ctx.fillStyle = '#ffffff';
  const stripes = mods.has('zebra') ? 4 : 5;
  for (let i = 0; i < stripes; i += 1) ctx.fillRect(420 + i * 24, 392, 14, 22);
}

/* ------------------------------------------------------------------ */
/* The level table: name, par time, scene painter and differences.    */
/* ------------------------------------------------------------------ */

export const LEVELS = [
  {
    name: 'Sunny Park',
    hint: 'A morning in the park',
    time: 90,
    draw: drawPark,
    diffs: [
      { id: 'shades', x: 82, y: 68, r: 40, label: 'The sun wears sunglasses' },
      { id: 'cloud', x: 320, y: 62, r: 40, label: 'A cloud lost a puff' },
      { id: 'bird', x: 350, y: 128, r: 26, label: 'A bird flew away' },
      { id: 'apple', x: 460, y: 210, r: 22, label: 'An apple is missing' },
      { id: 'bench', x: 210, y: 312, r: 34, label: 'A bench slat is missing' },
      { id: 'flower', x: 210, y: 384, r: 24, label: 'A flower changed colour' },
    ],
  },
  {
    name: 'Cozy Kitchen',
    hint: 'Tea time at home',
    time: 90,
    draw: drawKitchen,
    diffs: [
      { id: 'curtain', x: 126, y: 126, r: 40, label: 'A curtain is drawn shut' },
      { id: 'clock', x: 300, y: 96, r: 36, label: 'The clock shows another time' },
      { id: 'steam', x: 462, y: 162, r: 30, label: 'The kettle stopped steaming' },
      { id: 'fruit', x: 220, y: 288, r: 24, label: 'An orange became an apple' },
      { id: 'mug', x: 347, y: 297, r: 26, label: 'The mug changed colour' },
      { id: 'tail', x: 514, y: 366, r: 28, label: 'The cat moved its tail' },
    ],
  },
  {
    name: 'Beach Day',
    hint: 'Sun, sand and sea',
    time: 80,
    draw: drawBeach,
    diffs: [
      { id: 'sunface', x: 84, y: 62, r: 34, label: 'The sun lost its smile' },
      { id: 'sail', x: 484, y: 188, r: 30, label: 'The sail gained a stripe' },
      { id: 'umbrella', x: 280, y: 160, r: 46, label: 'The umbrella changed colour' },
      { id: 'ball', x: 150, y: 336, r: 30, label: 'A ball stripe changed colour' },
      { id: 'spade', x: 482, y: 310, r: 26, label: 'The spade is gone' },
      { id: 'starfish', x: 306, y: 372, r: 24, label: 'The starfish washed away' },
    ],
  },
  {
    name: 'Night Camp',
    hint: 'Under the stars',
    time: 80,
    draw: drawCamp,
    diffs: [
      { id: 'moon', x: 92, y: 76, r: 34, label: 'The moon turned crescent' },
      { id: 'star', x: 510, y: 34, r: 22, label: 'A star went out' },
      { id: 'tent', x: 280, y: 276, r: 30, label: 'The tent door opened' },
      { id: 'fire', x: 452, y: 306, r: 26, label: 'The fire lost a flame' },
      { id: 'log', x: 522, y: 337, r: 26, label: 'The log bench is missing' },
      { id: 'owl', x: 528, y: 104, r: 26, label: 'The owl closed its eyes' },
      { id: 'lantern', x: 150, y: 186, r: 28, label: 'The lantern went dark' },
    ],
  },
  {
    name: 'Space Station',
    hint: 'Floating among the stars',
    time: 75,
    draw: drawSpace,
    diffs: [
      { id: 'rings', x: 448, y: 108, r: 48, label: 'The planet lost its rings' },
      { id: 'flame', x: 150, y: 236, r: 26, label: 'The rocket flame went out' },
      { id: 'tether', x: 330, y: 272, r: 30, label: 'The tether is gone' },
      { id: 'dish', x: 540, y: 240, r: 24, label: 'The dish points the other way' },
      { id: 'alien', x: 105, y: 332, r: 28, label: 'The alien stopped peeking' },
      { id: 'lights', x: 312, y: 397, r: 22, label: 'A panel light turned red' },
      { id: 'star2', x: 90, y: 180, r: 20, label: 'A star went out' },
    ],
  },
  {
    name: 'City Street',
    hint: 'Downtown at noon',
    time: 70,
    draw: drawCity,
    diffs: [
      { id: 'windows', x: 224, y: 224, r: 28, label: 'A window went dark' },
      { id: 'light', x: 433, y: 186, r: 28, label: 'The light turned red' },
      { id: 'car', x: 275, y: 322, r: 44, label: 'The car changed colour' },
      { id: 'tree', x: 490, y: 226, r: 28, label: 'The nest is gone' },
      { id: 'hydrant', x: 109, y: 340, r: 26, label: 'The hydrant cap changed colour' },
      { id: 'cloud2', x: 130, y: 60, r: 38, label: 'A cloud drifted away' },
      { id: 'sign', x: 395, y: 231, r: 28, label: 'The sign arrow flipped' },
      { id: 'zebra', x: 492, y: 403, r: 26, label: 'A crossing stripe is missing' },
    ],
  },
];

/** The set of every difference id of a level (what the right panel shows). */
export function allDiffIds(level) {
  return new Set(level.diffs.map((d) => d.id));
}
