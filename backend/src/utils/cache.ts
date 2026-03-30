/**
 * Simple in-memory TTL cache — no Redis, no external dependencies.
 *
 * Suitable for low-to-medium traffic where slightly stale reads (seconds–minutes)
 * are acceptable: institution lists, platform stats, fundraiser totals, board hot
 * posts, etc.
 *
 * Eviction is lazy (checked on every get) + periodic sweep every 5 minutes to
 * prevent unbounded memory growth.
 *
 * Usage:
 *   cache.set('key', value, 60_000)   // TTL in ms
 *   cache.get<T>('key')               // returns T | null
 *   cache.del('key')                  // manual invalidation
 *   cache.delByPrefix('stats:')       // invalidate a namespace
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>()

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs })
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.value as T
  }

  del(key: string): void {
    this.store.delete(key)
  }

  /** Invalidate all keys that start with a given prefix (e.g. 'stats:') */
  delByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key)
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  size(): number {
    return this.store.size
  }

  /** Sweep expired entries — called automatically every 5 minutes */
  private sweep(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) this.store.delete(key)
    }
  }

  constructor() {
    // Periodic cleanup to prevent memory leaks on long-running servers
    setInterval(() => this.sweep(), 5 * 60 * 1000).unref()
  }
}

// Single shared instance across the whole application
export const cache = new MemoryCache()

// ─── TTL constants (in milliseconds) ─────────────────────────────────────────
export const TTL = {
  /** Institution/program hierarchy — rarely changes */
  INSTITUTIONS: 60 * 60 * 1000,     // 1 hour
  /** Per-slug institution lookups */
  INSTITUTION_SLUG: 30 * 60 * 1000, // 30 minutes
  /** Program + subjects */
  PROGRAM: 30 * 60 * 1000,          // 30 minutes
  /** Platform stats (downloads, resource count) */
  STATS: 2 * 60 * 1000,             // 2 minutes
  /** Fundraiser total raised */
  FUNDRAISER: 60 * 1000,            // 1 minute
  /** Public donors list */
  DONORS: 2 * 60 * 1000,            // 2 minutes
  /** Board hot posts (computed ranking) */
  BOARD_HOT: 30 * 1000,             // 30 seconds
} as const
