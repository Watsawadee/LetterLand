import api from "./api";

export type PronunciationItem = {
  questionId: number;
  answer: string;
  fileName: string;
  mimeType?: string;
  size?: number;
  dataUrl: string;
};

export type LearnedWord = {
  word: string;
  questionId?: number;
  foundAt?: string;
};

export async function fetchLearnedWords(
  gameId: number | string
): Promise<LearnedWord[]> {
  const res = await api.get(
    `/games/wordfound/${encodeURIComponent(String(gameId))}`
  );
  const arr = res?.data?.data?.game ?? [];
  if (!Array.isArray(arr)) return [];
  return arr.map((g: any) => ({
    word: String(g?.word ?? g?.question?.answer ?? "").trim(),
    questionId: Number(g?.questionId),
    foundAt: g?.foundAt,
  }));
}

const _cache = new Map<string, PronunciationItem[]>();

export async function fetchGamePronunciations(
  gameId: number | string
): Promise<PronunciationItem[]> {
  const key = String(gameId);
  const cached = _cache.get(key);
  if (cached) return cached;
  const res = await api.get(
    `/pronunciations/audio/${encodeURIComponent(String(gameId))}`
  );
  const d = res?.data;
  let out: PronunciationItem[] = [] as any;
  if (Array.isArray(d)) out = d as any;
  else if (Array.isArray(d?.items)) out = d.items as any;
  else if (Array.isArray(d?.results)) out = d.results as any;
  else if (Array.isArray(d?.data)) out = d.data as any;
  _cache.set(key, out);
  return out;
}
