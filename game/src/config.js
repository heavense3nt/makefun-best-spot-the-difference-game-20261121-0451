// Look Twice! — tuning numbers in one place.
//
// The game is a canvas spot-the-difference hunt: two panels show the same
// scene, the right one with a handful of changes. The player clicks every
// change before the clock runs out. Six hand-drawn scenes, forty
// differences in all, rising difficulty as the levels go on.

/** Logical size of the whole game canvas. */
export const VIEW = { width: 1280, height: 800 };

/** Logical size of one scene panel (the drawing space scenes use). */
export const SCENE = { width: 560, height: 420 };

/** Fixed-step world update, seconds per step. */
export const STEP = 1 / 60;

/** How long a wrong-click red X stays visible, in seconds. */
export const MISS_FLASH = 0.9;

/** How long a found-difference ring pops, in seconds. */
export const FOUND_POP = 0.45;

/** Mistakes allowed on one level before the run ends. */
export const HEARTS_PER_LEVEL = 3;

/** Hints handed out fresh on every level. */
export const HINTS_PER_LEVEL = 3;

/** Seconds a wrong click costs on the clock. */
export const MISS_TIME_PENALTY = 3;

/** Points for finding a difference, before the combo bonus. */
export const FIND_POINTS = 100;

/** Extra points per step of the current find streak. */
export const COMBO_POINTS = 25;

/** Points per second left when a level is cleared. */
export const TIME_BONUS_PER_SECOND = 10;

/** localStorage key for the best total score. */
export const BEST_KEY = 'look-twice-best-score';

/** Screens the game moves between. */
export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL_CLEAR = 'level-clear';
export const SCREEN_OVER = 'over';
export const SCREEN_VICTORY = 'victory';
