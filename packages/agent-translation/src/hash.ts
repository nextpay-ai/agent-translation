const FNV_PRIME = 0x01000193
const FNV_OFFSET = 0x811c9dc5

/**
 * FNV-1a 32-bit hash of a string, iterating over UTF-8 bytes.
 * Returns an 8-character lowercase hex string.
 *
 * Uses TextEncoder to produce canonical UTF-8 bytes so results match
 * any other correct FNV-1a implementation (important for non-ASCII en values
 * such as strings containing ₱, é, etc.)
 */
export function fnv1a(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let hash = FNV_OFFSET
  for (const byte of bytes) {
    hash ^= byte
    hash = Math.imul(hash, FNV_PRIME) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}
