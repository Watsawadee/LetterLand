export type DictDefinition = { definition: string; example?: string };
export type DictMeaning = {
  partOfSpeech: string;
  definitions: DictDefinition[];
  synonyms?: string[];
};
export type DictEntry = {
  word: string;
  phonetic?: string;
  meanings: DictMeaning[];
  audioUrls: string[];
  synonyms?: string[];
};

const DICT_POS_TTL_MS = 24 * 60 * 60 * 1000;
const DICT_NEG_TTL_MS = 2 * 60 * 60 * 1000;
const DICT_TIMEOUT_MS = 8000;

type DictCacheEntry = { entry: DictEntry | null; ts: number };
const dictCache = new Map<string, DictCacheEntry>();
const dictInflight = new Map<string, Promise<DictEntry>>();

export function normalizeWord(s: string) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z']/g, "");
}

function getDictFromCache(key: string): DictEntry | null | undefined {
  const e = dictCache.get(key);
  if (!e) return undefined;
  const ttl = e.entry ? DICT_POS_TTL_MS : DICT_NEG_TTL_MS;
  if (Date.now() - e.ts < ttl) return e.entry;
  dictCache.delete(key);
  return undefined;
}

function setDictCache(key: string, entry: DictEntry | null) {
  dictCache.set(key, { entry, ts: Date.now() });
}

async function fetchWithTimeout(
  url: string,
  ms = DICT_TIMEOUT_MS
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function fetchDictionaryEntry(word: string): Promise<DictEntry> {
  const key = normalizeWord(word);
  if (!key) throw new Error("Invalid word");

  const cached = getDictFromCache(key);
  if (cached !== undefined) {
    if (cached) return cached;
    throw new Error("No definition found");
  }

  if (dictInflight.has(key)) return dictInflight.get(key)!;

  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
    key
  )}`;

  const pending = (async () => {
    try {
      const res = await fetchWithTimeout(url, DICT_TIMEOUT_MS);
      if (!res.ok) {
        if (res.status === 404) setDictCache(key, null);
        throw new Error("No definition found");
      }

      let json: any;
      try {
        json = await res.json();
      } catch {
        throw new Error("No definition found");
      }

      const first = json?.[0];
      if (!first?.word || !Array.isArray(first?.meanings)) {
        setDictCache(key, null);
        throw new Error("No definition found");
      }

      // Collect audio urls from phonetics
      const audioUrls: string[] = Array.from(
        new Set(
          (first.phonetics || [])
            .map((p: any) => String(p?.audio || "").trim())
            .filter((u: string) => !!u)
        )
      );

      // Map meanings + gather synonyms
      const meanings: DictMeaning[] = (first.meanings || [])
        .filter((m: any) => Array.isArray(m?.definitions))
        .map((m: any) => ({
          partOfSpeech: String(m.partOfSpeech || ""),
          definitions: (m.definitions || [])
            .filter(
              (d: any) =>
                typeof d?.definition === "string" && d.definition.length > 0
            )
            .map((d: any) => ({
              definition: String(d.definition),
              example: d?.example ? String(d.example) : undefined,
            })),
          synonyms: Array.isArray(m?.synonyms)
            ? m.synonyms.map((s: any) => String(s)).filter(Boolean)
            : undefined,
        }))
        .filter((m: DictMeaning) => m.definitions.length > 0);

      if (!meanings.length) {
        setDictCache(key, null);
        throw new Error("No definition found");
      }

      // Aggregate synonyms across meanings (deduped)
      const aggSynonyms = Array.from(
        new Set(meanings.flatMap((m) => m.synonyms ?? []))
      );

      const entry: DictEntry = {
        word: String(first.word),
        phonetic:
          first.phonetic ||
          first.phonetics?.find((p: any) => p?.text)?.text ||
          undefined,
        meanings,
        audioUrls,
        synonyms: aggSynonyms.length ? aggSynonyms : undefined,
      };

      setDictCache(key, entry);
      return entry;
    } finally {
      dictInflight.delete(key);
    }
  })();

  dictInflight.set(key, pending);
  return pending;
}

export function getDictionaryCacheSnapshot() {
  return Array.from(dictCache.entries()).map(([word, v]) => ({
    word,
    hitType: v.entry ? "pos" : "neg",
    ageMs: Date.now() - v.ts,
  }));
}

export function clearDictionaryCache() {
  dictCache.clear();
}
