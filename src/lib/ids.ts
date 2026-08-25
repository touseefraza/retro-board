import { randomBytes } from "node:crypto";

/** Crockford base32 minus vowels: no accidental words, no 0/O or 1/I/L mixups. */
const ALPHABET = "0123456789bcdfghjkmnpqrstvwxyz";

/**
 * Short, URL-safe, case-insensitive-ish id.
 * 12 chars ≈ 59 bits — plenty for unguessable board links.
 */
export function newId(length = 12): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}
