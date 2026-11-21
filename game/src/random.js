// A small seeded random generator (mulberry32) so a level can be shuffled
// the same way every time a seed is given, while a fresh visit still feels
// new. Used to shuffle which difference a hint reveals and to vary the
// little background details (extra stars, pebbles) without touching the
// differences themselves.

/** Make a generator that returns a float in [0, 1) from `seed`. */
export function createRandom(seed) {
  let state = (seed >>> 0) || 0x9e3779b9;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick an integer in [min, max] from the generator. */
export function randomInt(random, min, max) {
  return min + Math.floor(random() * (max - min + 1));
}

/** Shuffle a copy of `items` in place order using the generator. */
export function shuffle(random, items) {
  const copy = items.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    const held = copy[index];
    copy[index] = copy[other];
    copy[other] = held;
  }
  return copy;
}
