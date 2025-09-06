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
} from "@/services/pronunciationService";

function cap(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
import {
  fetchLearnedWords,
  LearnedWord,
} from "@/services/pronunciationService";
import { CustomButton } from "@/theme/ButtonCustom";
import * as FileSystem from "expo-file-system";
import { Audio as ExpoAudio } from "expo-av";

type Props = {
  visible: boolean;
  onClose: () => void;
  gameId: number | string;
  words: string[];
  timeUsedSeconds?: number;
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
  timeUsedSeconds,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pronunciations, setPronunciations] = useState<PronunciationItem[]>([]);
  const [learned, setLearned] = useState<LearnedWord[]>([]);
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  const soundRef = useRef<ExpoAudio.Sound | null>(null);

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
        console.log("[learned]", gameId, {
          learnedLen: learned?.length,
          pronLen: pronRaw?.length,
        });

        if (canceled) return;
        const pron = asArray<PronunciationItem>(pronRaw);
        const words = asArray<LearnedWord>(learnedRaw);

        const seen = new Set<string>();
        const unique = words.filter((w) => {
          const k = String(w?.word ?? "").trim().toLowerCase();
          if (!k || seen.has(k)) return false;
          seen.add(k);
          return true;
        });

        setPronunciations(pron);
        setLearned(unique);
      } catch (e: any) {
        if (!canceled) setErr(e?.message || "Failed to load data");
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [visible, gameId]);

  useEffect(() => {
    return () => {
      try {
        soundRef.current?.unloadAsync();
      } catch {}
      soundRef.current = null;
    };
  }, []);

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

  function formatDuration(totalSec?: number) {
    if (typeof totalSec !== "number") return "";
    const sec = Math.max(0, Math.floor(totalSec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }

  async function play(item?: PronunciationItem) {
    if (!item?.dataUrl) return;

    try {
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
        } catch {}
        try {
          await soundRef.current.unloadAsync();
        } catch {}
        soundRef.current = null;
      }
    } catch {}

    try {
      if (Platform.OS === "web") {
        const a = new Audio(item.dataUrl);
        setPlayingKey(item.fileName || "");
        a.onended = () => setPlayingKey(null);
        await a.play();
        return;
      }

      const base64 = (item.dataUrl.split(",")[1] || "").trim();
      const fileName = item.fileName || `${item.answer}.mp3`;
      const fileUri = (FileSystem.cacheDirectory || "") + `pron-${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { sound } = await ExpoAudio.Sound.createAsync({ uri: fileUri });
      soundRef.current = sound;
      setPlayingKey(fileName);
      sound.setOnPlaybackStatusUpdate((s: any) => {
        if (s?.didJustFinish) setPlayingKey(null);
      });
      await sound.playAsync();
    } catch {
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
      const key = String(word ?? "").trim().toLowerCase();
      return { word: String(word ?? ""), item: byWord.get(key) };
    });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Word Learned</Text>

          <Text style={styles.subTitle}>
            {`Words learned: ${words?.length ?? 0}${
              typeof timeUsedSeconds === "number"
                ? `  •  Time used: ${formatDuration(timeUsedSeconds)}`
                : ""
            }`}
          </Text>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator />
            </View>
          ) : err ? (
            <View style={styles.center}>
              <Text style={styles.error}>{err}</Text>
            </View>
          ) : learnedList.length === 0 ? (
            <View style={styles.center}>
              <Text>No learned words yet.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.list}>
              {learnedList.map(({ word, item }, i) => {
                const canPlay = !!item?.dataUrl;
                const active = playingKey === (item?.fileName || "");
                const index = i + 1;
                return (
                  <View key={word} style={styles.row}>
                    <View style={styles.indexBox}>
                      <Text style={styles.indexText}>{index}</Text>
                    </View>
                    <Pressable
                      onPress={() => canPlay && play(item)}
                      disabled={!canPlay}
                      style={[
                        styles.soundBtn,
                        !canPlay && styles.soundBtnDisabled,
                      ]}
                    >
                      <Text style={styles.soundEmoji}>
                        {active ? "⏸" : "🔊"}
                      </Text>
                    </Pressable>
                    <Text style={styles.word}>{cap(word)}</Text>
                    {!canPlay && <Text style={styles.missing}>(no audio)</Text>}
                  </View>
                );
              })}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <CustomButton type="small" onPress={onClose} label="Home" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    width: 560,
    maxWidth: "95%",
    maxHeight: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 10,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  error: { color: "#c0392b" },
  list: { paddingVertical: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  soundBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef2f7",
    marginRight: 10,
  },
  soundBtnDisabled: { opacity: 0.4 },
  soundEmoji: { fontSize: 18 },
  word: { fontSize: 18, fontWeight: "600", color: "#25303b" },
  missing: { marginLeft: 8, fontSize: 12, color: "#a3a8af" },
  footer: { marginTop: 8, alignItems: "center" },
  indexBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    marginRight: 10,
  },
  indexText: { fontSize: 14, fontWeight: "700", color: "#4b5563" },
});
