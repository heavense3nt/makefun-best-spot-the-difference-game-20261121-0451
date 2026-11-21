# Look Twice!

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/heavense3nt/makefun-best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/heavense3nt/makefun-best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**Look Twice!** is a complete spot-the-difference game: two near-identical pictures side by side, and one of them is lying. Find every difference before the clock runs out — six hand-drawn scenes, 40 differences in all, with a timer, score, combo streaks, hearts, hints, and a best score that sticks around.

## How to play

- **Click a difference** on either picture (A or B). Found ones get a green ring and a check on both sides.
- **Wrong taps cost a heart** and 3 seconds. Three wrong taps ends the run.
- **H** spends a hint and circles one difference still hiding (3 per level).
- **P** pauses, **M** mutes the sounds, **R** restarts, **Enter** starts / continues.
- Clear a level to bank a time bonus; clear all six scenes to win.

The scenes — Sunny Park, Cozy Kitchen, Beach Day, Night Camp, Space Station, City Street — are all drawn in code with canvas shapes. No image files, no network, no library: the whole game is plain static files under `game/`, and it runs offline in any desktop browser.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 and play. Screenshot scenes are staged with `?shot=start|play|play2|end&seed=7` (see `shots.json`).

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` into the output directory and writes `dossier.json` with the vendored make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/?ref=s5yp534n&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
