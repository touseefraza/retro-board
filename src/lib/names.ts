/**
 * Display identity derived from a participant id — no accounts, no server round
 * trip, and every client derives the same name and colour for the same person.
 */

const ADJECTIVES = [
  "Amber", "Brisk", "Calm", "Clever", "Copper", "Eager", "Fleet", "Golden",
  "Keen", "Lucid", "Merry", "Nimble", "Quiet", "Rapid", "Sage", "Sunny",
  "Swift", "Tidy", "Vivid", "Warm",
];

const ANIMALS = [
  "Otter", "Heron", "Falcon", "Lynx", "Ibex", "Marten", "Puffin", "Raven",
  "Sparrow", "Tapir", "Vireo", "Walrus", "Badger", "Crane", "Dingo", "Egret",
  "Finch", "Gecko", "Hare", "Jackal",
];

/** FNV-1a. Small, stable across engines, good enough for picking a word. */
function hash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** "Swift Otter" — the name someone gets until they type their own. */
export function defaultName(id: string): string {
  const h = hash(id);
  return `${ADJECTIVES[h % ADJECTIVES.length]} ${ANIMALS[(h >>> 9) % ANIMALS.length]}`;
}

/**
 * Cursor/avatar hue. Stepping by the golden angle spreads neighbouring hashes
 * far apart, so two people in the same retro rarely land on similar colours.
 */
export function hue(id: string): number {
  return Math.round((hash(`${id}#hue`) * 137.508) % 360);
}

/** Up to two letters for an avatar chip. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
