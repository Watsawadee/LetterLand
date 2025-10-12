import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  fetchGamePronunciations,
  PronunciationItem,
  fetchLearnedWords,
  LearnedWord,
} from "@/services/pronunciationService";
import { Color } from "@/theme/Color";
import { Typography } from "@/theme/Font";
import Home from "@/assets/icon/Home";
import Play from "@/assets/icon/Play";
import Stop from "@/assets/icon/Stop";
import { CustomButton } from "@/theme/ButtonCustom";
import * as FS from "expo-file-system/legacy";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import GreenTape from "@/assets/icon/GreenTape";

const audioCache = new Map<string, string>();

function cap(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

type Props = {
  visible: boolean;
  onClose: () => void;
  gameId: number | string;
  words: string[];
  extraWords?: string[];
};

const asArray = <T,>(v: any): T[] =>
  Array.isArray(v)
    ? v
    : Array.isArray(v?.data?.game)
    ? v.data.game
    : Array.isArray(v?.results)
    ? v.results
    : Array.isArray(v?.items)
    ? v.items
    : [];

export default function WordLearnedModal({
  visible,
  onClose,
  gameId,
  words,
  extraWords = [],
}: Props) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pronunciations, setPronunciations] = useState<PronunciationItem[]>([]);
  const [learned, setLearned] = useState<LearnedWord[]>([]);
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  /** which words are still waiting on audio (for per-row spinner) */
  const [pendingWords, setPendingWords] = useState<Set<string>>(new Set());

  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const webAudioRef = useRef<any>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** map<word, PronunciationItem> for quick lookup */
  const byWord = useMemo(() => {
    const map = new Map<string, PronunciationItem>();
    for (const it of pronunciations) {
      const a = (it?.answer || "").toLowerCase();
      const f = (it?.fileName || "").replace(/\.mp3$/i, "").toLowerCase();
      if (a) map.set(a, it);
      if (f && !map.has(f)) map.set(f, it);
    }
    return map;
  }, [pronunciations]);

  useEffect(() => {
    if (!visible) return;

    let canceled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [pronRaw, learnedRaw] = await Promise.all([
          fetchGamePronunciations(gameId),
          fetchLearnedWords(gameId),
        ]);
        if (canceled) return;

        const pron = asArray<PronunciationItem>(pronRaw);
        const wordsArr = asArray<LearnedWord>(learnedRaw);

        const seen = new Set<string>();
        const unique = wordsArr.filter((w) => {
          const k = String(w?.word ?? "")
            .trim()
            .toLowerCase();
          if (!k || seen.has(k)) return false;
          seen.add(k);
          return true;
        });

        for (const it of pron) {
          const key =
            String(it?.answer || it?.fileName || "")
              .replace(/\.mp3$/i, "")
              .trim()
              .toLowerCase() || "";
          const du = (it?.dataUrl || "").trim();
          if (key && du && du.startsWith("data:audio/")) {
            audioCache.set(key, du);
          }
        }

        setPronunciations(pron);
        setLearned(unique);
        setLoading(false);

        // compute which words need audio (not in cache && not in current data)
        const needSet = new Set<string>();
        const learnedKeys = unique.map((w) =>
          String(w?.word || "")
            .trim()
            .toLowerCase()
        );
        const extraKeys = (extraWords || []).map((w) =>
          String(w || "")
            .trim()
            .toLowerCase()
        );

        for (const k of [...learnedKeys, ...extraKeys]) {
          if (!k) continue;
          const inCache = audioCache.get(k);
          const inState = byWord.get(k)?.dataUrl?.startsWith("data:audio/");
          if (!inCache && !inState) needSet.add(k);
        }

        if (canceled) return;
        setPendingWords(needSet);

        // progressive polling (only for missing words)
        if (needSet.size > 0) {
          const delays = [1000, 1500, 2000, 3000];
          for (const d of delays) {
            if (canceled || needSet.size === 0) break;
            await new Promise((r) => setTimeout(r, d));
            if (canceled) break;

            // ask backend
            const again = await fetchGamePronunciations(gameId, {
              refresh: true,
            } as any);
            if (canceled) break;

            const pron2 = asArray<PronunciationItem>(again);

            let changed = false;
            const merged = new Map<string, PronunciationItem>(byWord);

            for (const it of pron2) {
              const key =
                String(it?.answer || it?.fileName || "")
                  .replace(/\.mp3$/i, "")
                  .trim()
                  .toLowerCase() || "";
              if (!key) continue;

              const du = (it?.dataUrl || "").trim();
              if (du && du.startsWith("data:audio/")) {
                audioCache.set(key, du);
                needSet.delete(key);
                changed = true;

                const existing = merged.get(key);
                if (existing) {
                  merged.set(key, { ...existing, dataUrl: du });
                } else {
                  merged.set(key, it);
                }
              } else if (!merged.has(key)) {
                merged.set(key, it);
              }
            }

            if (changed && !canceled) {
              setPronunciations(Array.from(merged.values()));
              setPendingWords(new Set(needSet));
            }
          }
        }

        // one last short retry after 2s if still missing (kept your old behavior)
        if (!canceled && pendingWords.size > 0) {
          if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
          retryTimerRef.current = setTimeout(async () => {
            try {
              if (canceled) return;
              const again = await fetchGamePronunciations(gameId, {
                refresh: true,
              } as any);
              if (canceled) return;
              const pron2 = asArray<PronunciationItem>(again);

              const merged = new Map<string, PronunciationItem>(byWord);
              let changed = false;

              for (const it of pron2) {
                const key =
                  String(it?.answer || it?.fileName || "")
                    .replace(/\.mp3$/i, "")
                    .trim()
                    .toLowerCase() || "";
                if (!key) continue;
                const du = (it?.dataUrl || "").trim();
                if (du && du.startsWith("data:audio/")) {
                  audioCache.set(key, du);
                  merged.set(key, { ...(merged.get(key) || it), dataUrl: du });
                  changed = true;
                }
              }
              if (!canceled && changed) {
                setPronunciations(Array.from(merged.values()));
                // recompute missing set
                const nowMissing = new Set<string>();
                for (const k of pendingWords) {
                  if (!audioCache.get(k) && !merged.get(k)?.dataUrl) {
                    nowMissing.add(k);
                  }
                }
                setPendingWords(nowMissing);
              }
            } catch {}
          }, 2000);
        }
      } catch (e) {
        if (!canceled) {
          console.warn("[WordLearnedModal] load failed:", e);
          setErr("Failed to load data");
          setLoading(false);
        }
      }
    })();

    return () => {
      canceled = true;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [visible, gameId, extraWords]);

  useEffect(() => {
    return () => {
      try {
        if (Platform.OS === "web") {
          webAudioRef.current?.pause?.();
          webAudioRef.current = null;
        } else {
          player.pause?.();
        }
      } catch {}
      setPlayingKey(null);
    };
  }, []);

  useEffect(() => {
    if (!playingKey || !status) return;
    if (!status.playing && status.duration != null) {
      const done = status.currentTime >= status.duration - 0.05;
      if (done) setPlayingKey(null);
    }
  }, [status, playingKey]);

  async function play(item: PronunciationItem | undefined, rowKey: string) {
    const key =
      String(item?.answer || item?.fileName || "")
        .replace(/\.mp3$/i, "")
        .trim()
        .toLowerCase() || "";
    const cached = key ? audioCache.get(key) : undefined;

    const dataUrl = (cached || item?.dataUrl || "").trim();
    if (!dataUrl) return;

    try {
      if (Platform.OS === "web") {
        webAudioRef.current?.pause?.();
        webAudioRef.current = null;
      } else {
        await player.pause?.();
      }
    } catch {}

    const m = /^data:(audio\/[a-z0-9.+-]+);base64,(.+)$/i.exec(dataUrl);
    if (!m) {
      setPlayingKey(null);
      return;
    }
    const mime = m[1]?.toLowerCase() || "audio/mpeg";
    const base64 = (m[2] || "").trim();

    const ext = /m4a|aac|mp4/i.test(mime)
      ? "m4a"
      : /ogg|opus/i.test(mime)
      ? "ogg"
      : /wav/i.test(mime)
      ? "wav"
      : "mp3";

    try {
      if (Platform.OS === "web") {
        const a = new Audio(dataUrl);
        webAudioRef.current = a;
        setPlayingKey(rowKey);
        a.onended = () => setPlayingKey(null);
        await a.play();
        return;
      }

      const safeName = (item?.fileName || item?.answer || "audio")
        .replace(/[^a-z0-9_.-]/gi, "_")
        .replace(/\.(mp3|m4a|aac|wav|ogg|opus|bin)$/i, "");
      const fileUri = `${FS.cacheDirectory}pron-${safeName}.${ext}`;

      await FS.writeAsStringAsync(fileUri, base64, {
        encoding: FS.EncodingType.Base64,
      });

      await player.replace({ uri: fileUri });
      setPlayingKey(rowKey);
      player.seekTo(0);
      await player.play();
    } catch (e) {
      setPlayingKey(null);
    }
  }

  const learnedList = (Array.isArray(learned) ? learned : [])
    .filter((l) =>
      words.some(
        (w) => w.toLowerCase().trim() === String(l.word).toLowerCase().trim()
      )
    )
    .map(({ word }) => {
      const key = String(word ?? "")
        .trim()
        .toLowerCase();
      const cachedUrl = audioCache.get(key);
      const item = byWord.get(key);
      const effective: PronunciationItem | undefined = cachedUrl
        ? { ...(item || ({} as any)), dataUrl: cachedUrl }
        : item;
      return { word: String(word ?? ""), item: effective, key };
    });

  const extraSet = useMemo(() => {
    const s = new Set<string>();
    for (const w of extraWords || []) {
      const k = String(w || "")
        .trim()
        .toLowerCase();
      if (k) s.add(k);
    }
    return s;
  }, [extraWords]);

  for (const { word } of learnedList) {
    extraSet.delete(
      String(word || "")
        .trim()
        .toLowerCase()
    );
  }

  const extraDisplay = Array.from(extraSet).map((w) => {
    const key = String(w || "")
      .trim()
      .toLowerCase();
    const cachedUrl = audioCache.get(key);
    const item = byWord.get(key);
    const effective: PronunciationItem | undefined = cachedUrl
      ? { ...(item || ({} as any)), dataUrl: cachedUrl }
      : item;
    return { word: cap(key), item: effective, key };
  });

  const hasLearned = learnedList.length > 0;
  const hasExtra = extraDisplay.length > 0;
  const nothingToShow = !hasLearned && !hasExtra;
  const showCongrats = !loading && !err && hasLearned;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.tape}>
            <GreenTape width="100%" height="100%" />
          </View>
          <Text style={styles.title}>Word Learned</Text>
          {showCongrats && (
            <Text style={styles.subtitle}>
              Great job, now you have learned all these words.
            </Text>
          )}

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator />
            </View>
          ) : err ? (
            <View style={styles.center}>
              <Text style={styles.error}>{err}</Text>
            </View>
          ) : nothingToShow ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No learned words yet</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.list}>
              {hasLearned && (
                <>
                  <Text style={styles.sectionTitle}>Vocabulary</Text>
                </>
              )}
              {learnedList.map(({ word, item, key }, i) => {
                const canPlay = !!item?.dataUrl || !!audioCache.get(key);
                const isPending = !canPlay && pendingWords.has(key);
                const rowKey = `learn:${String(word).trim().toLowerCase()}`;
                const active = playingKey === rowKey;
                const index = i + 1;

                return (
                  <View key={`learn-${word}-${i}`} style={styles.row}>
                    <View
                      style={[styles.chip, !canPlay && styles.chipDisabled]}
                    >
                      <View style={styles.leftWrap}>
                        <Text style={styles.indexText}>{index}.</Text>
                        <Text style={styles.word} numberOfLines={1}>
                          {cap(word)}
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => canPlay && play(item, rowKey)}
                        disabled={!canPlay}
                        style={[
                          styles.soundBtn,
                          !canPlay && styles.soundBtnDisabled,
                        ]}
                      >
                        {isPending ? (
                          <ActivityIndicator />
                        ) : (
                          <Text style={styles.soundEmoji}>
                            {active ? <Stop /> : <Play />}
                          </Text>
                        )}
                      </Pressable>

                      {!canPlay &&
                        (isPending ? null : (
                          <Text style={styles.missing}>(No audio)</Text>
                        ))}
                    </View>
                  </View>
                );
              })}

              {hasExtra && (
                <>
                  <View
                    style={[hasLearned && styles.sectionSpacer]}
                  >
                    <Text style={styles.sectionTitle}>Extra Word</Text>
                  </View>
                  {extraDisplay.map(({ word, item, key }, i) => {
                    const canPlay = !!item?.dataUrl || !!audioCache.get(key);
                    const isPending = !canPlay && pendingWords.has(key);
                    const rowKey = `learn:${String(word).trim().toLowerCase()}`;
                    const active = playingKey === rowKey;
                    const index = i + 1;

                    return (
                      <View key={`extra-${word}-${i}`} style={styles.row}>
                        <View
                          style={[styles.chip, !canPlay && styles.chipDisabled]}
                        >
                          <View style={styles.leftWrap}>
                            <Text style={styles.indexText}>{index}.</Text>
                            <Text style={styles.word} numberOfLines={1}>
                              {cap(word)}
                            </Text>
                          </View>

                          <Pressable
                            onPress={() => canPlay && play(item, rowKey)}
                            disabled={!canPlay}
                            style={[
                              styles.soundBtn,
                              !canPlay && styles.soundBtnDisabled,
                            ]}
                          >
                            {isPending ? (
                              <ActivityIndicator />
                            ) : (
                              <Text style={styles.soundEmoji}>
                                {active ? <Stop /> : <Play />}
                              </Text>
                            )}
                          </Pressable>

                          {!canPlay && !isPending ? (
                            <Text style={styles.missing}>(No audio)</Text>
                          ) : null}
                        </View>
                      </View>
                    );
                  })}
                </>
              )}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <CustomButton
              type="small"
              onPress={onClose}
              icon={<Home />}
              customStyle={{ justifyContent: "center", alignItems: "center" }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Color.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    position: "relative",
    width: "90%",
    maxWidth: 560,
    maxHeight: "85%",
    backgroundColor: Color.lightblue,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    paddingTop: 45,
  },
  tape: {
    position: "absolute",
    top: -40,
    alignSelf: "center",
    width: "90%",
    aspectRatio: 6,
    transform: [{ rotate: "-1deg" }],
    opacity: 0.9,
    pointerEvents: "none",
    zIndex: 10,
  },
  title: {
    ...Typography.popupheader,
    textAlign: "center",
    marginVertical: 10,
    color: Color.gray,
  },
  subtitle: {
    ...Typography.body20,
    color: Color.gray,
    textAlign: "center",
    opacity: 0.75,
    marginTop: 5,
    marginBottom: 18,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  error: { color: "#c0392b" },
  list: { paddingVertical: 8, paddingHorizontal: 35, width: "100%" },
  sectionTitle: {
    ...Typography.header25,
    color: Color.blue,
    textAlign: "left",
    width: "100%",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 6,
  },
  indexText: {
    ...Typography.header25,
    width: 50,
    textAlign: "right",
    marginRight: 40,
    color: Color.gray,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Color.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flex: 1,
    minHeight: 60,
    shadowColor: Color.black,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  chipDisabled: { opacity: 0.8 },
  leftWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  soundBtn: {
    width: 39,
    height: 39,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  soundBtnDisabled: { opacity: 0.5 },
  soundEmoji: { fontSize: 30 },
  word: { ...Typography.header25, flexShrink: 1, color: Color.gray },
  missing: { marginLeft: 8, fontSize: 12, color: "#a3a8af" },
  footer: { marginTop: 20, alignItems: "center", flexDirection: "row", gap: 10 },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 12,
    minHeight: 160,
  },
  emptyTitle: {
    ...Typography.header20,
    color: Color.gray,
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
  },
  sectionSpacer: { marginTop: 30 },
});
