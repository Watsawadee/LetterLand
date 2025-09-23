const POS_TTL_MS = 24 * 60 * 60 * 1000;
const NEG_TTL_MS = 2 * 60 * 60 * 1000;
const TIMEOUT_MS = 2500;

type CacheEntry = { ok: boolean; ts: number };
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<boolean>>();

function clean(word: string) {
  return (word || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function getFromCache(w: string): boolean | null {
  const e = cache.get(w);
  if (!e) return null;
  const ttl = e.ok ? POS_TTL_MS : NEG_TTL_MS;
  return Date.now() - e.ts < ttl ? e.ok : null;
}

function setCache(w: string, ok: boolean) {
  cache.set(w, { ok, ts: Date.now() });
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);
}

async function checkDictionaryAPI(w: string): Promise<boolean> {
  const url = `https://api.datamuse.com/words?sp=${encodeURIComponent(
    w
  )}&max=1&md=d`;
  const res = await fetch(url);
  if (!res.ok) return false;

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return false;

  const hit = data[0];
  const exact = String(hit?.word || "").toLowerCase() === w;
  const hasDefs = Array.isArray(hit?.defs) && hit.defs.length > 0;

  return exact && hasDefs;
}

export async function isValidEnglishWord(raw: string): Promise<boolean> {
  const w = clean(raw);
  if (w.length < 3) return false;
  if (!/^[a-z]+$/.test(w)) return false;

  const cached = getFromCache(w);
  if (cached != null) return cached;

  if (inflight.has(w)) return inflight.get(w)!;

  const pending = (async () => {
    try {
      const ok = await withTimeout(checkDictionaryAPI(w), TIMEOUT_MS);
      setCache(w, ok);
      console.info(`[dict] '${w}' → ${ok ? "valid" : "invalid"}`);
      return ok;
    } catch {
      setCache(w, false);
      console.info(`[dict] '${w}' → invalid (timeout/network)`);
      return false;
    } finally {
      inflight.delete(w);
    }
  })();

  inflight.set(w, pending);
  return pending;
}

export function getWordCacheSnapshot() {
  return Array.from(cache.entries()).map(([word, v]) => ({
    word,
    ok: v.ok,
    ageMs: Date.now() - v.ts,
  }));
}
export function clearWordCache() {
  cache.clear();
}
