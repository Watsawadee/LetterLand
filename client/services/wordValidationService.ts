const POS_TTL_MS = 24 * 60 * 60 * 1000;
const NEG_TTL_MS = 2 * 60 * 60 * 1000;
const TIMEOUT_MS = 2500;

type CacheEntry = { ok: boolean; ts: number };
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<boolean>>();

function clean(word: string) {
  return (word || "").trim().toLowerCase().replace(/[^a-z]/g, "");
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

async function fetchWithTimeout(url: string, ms = TIMEOUT_MS): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function isValidEnglishWord(raw: string): Promise<boolean> {
  const w = clean(raw);
  if (w.length < 3) return false;

  const cached = getFromCache(w);
  if (cached != null) return cached;

  if (inflight.has(w)) return inflight.get(w)!;

  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`;

  const pending = (async () => {
    try {
      const res = await fetchWithTimeout(url, TIMEOUT_MS);

      if (!res.ok) {
        setCache(w, false);
        return false;
      }

      const data = await res.json();
      const ok =
        Array.isArray(data) &&
        data.length > 0 &&
        typeof data[0]?.word === "string" &&
        Array.isArray(data[0]?.meanings) &&
        data[0].meanings.some(
          (m: any) => Array.isArray(m?.definitions) && m.definitions.length > 0
        );

      setCache(w, !!ok);
      return !!ok;
    } catch {
      setCache(w, false);
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