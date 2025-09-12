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

function cap(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

type Props = {
  visible: boolean;
  onClose: () => void;
  gameId: number | string;
  words: string[];
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
}: Props) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pronunciations, setPronunciations] = useState<PronunciationItem[]>([]);
  const [learned, setLearned] = useState<LearnedWord[]>([]);
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const webAudioRef = useRef<any>(null);

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
      const done = status.currentTime >= (status.duration - 0.05);
      if (done) setPlayingKey(null);
    }
  }, [status, playingKey]);

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

  async function play(item?: PronunciationItem) {
    if (!item?.dataUrl) return;

    try {
      if (Platform.OS === "web") {
        webAudioRef.current?.pause?.();
        webAudioRef.current = null;
      } else {
        await player.pause?.();
      }
    } catch {}

    try {
      if (Platform.OS === "web") {
        const a = new Audio(item.dataUrl);
        webAudioRef.current = a;
        setPlayingKey(item.fileName || "");
        a.onended = () => setPlayingKey(null);
        await a.play();
        return;
      }

      const base64 = (item.dataUrl.split(",")[1] || "").trim();
      const fileName = item.fileName || `${item.answer}.mp3`;
      const fileUri = (FS.cacheDirectory || "") + `pron-${fileName}`;

      await FS.writeAsStringAsync(fileUri, base64, {
        encoding: FS.EncodingType.Base64,
      });

      await player.replace({ uri: fileUri });
      setPlayingKey(fileName);
      player.seekTo(0);
      await player.play();
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Word Learned</Text>

          {loading ? (
            <View style={styles.center}><ActivityIndicator /></View>
          ) : err ? (
            <View style={styles.center}><Text style={styles.error}>{err}</Text></View>
          ) : learnedList.length === 0 ? (
            <View style={styles.center}><Text>No learned words yet.</Text></View>
          ) : (
            <ScrollView contentContainerStyle={styles.list}>
              {learnedList.map(({ word, item }, i) => {
                const canPlay = !!item?.dataUrl;
                const active = playingKey === (item?.fileName || "");
                const index = i + 1;
                return (
                  <View key={word} style={styles.row}>
                    <Text style={styles.indexText}>{index}.</Text>

                    <View style={[styles.chip, !canPlay && styles.chipDisabled]}>
                      <Pressable
                        onPress={() => canPlay && play(item)}
                        disabled={!canPlay}
                        style={[styles.soundBtn, !canPlay && styles.soundBtnDisabled]}
                      >
                        <Text style={styles.soundEmoji}>{active ? <Stop /> : <Play />}</Text>
                      </Pressable>

                      <Text style={styles.word} numberOfLines={1}>{cap(word)}</Text>
                      {!canPlay && <Text style={styles.missing}>(no audio)</Text>}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <CustomButton type="small" onPress={onClose} icon={<Home />} />
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
    width: "50%",
    maxWidth: "95%",
    maxHeight: "85%",
    backgroundColor: Color.lightblue,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
  },
  title: {
    ...Typography.header30,
    textAlign: "center",
    marginVertical: 10,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  error: { color: "#c0392b" },

  list: { paddingVertical: 8, width: "100%" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 12,
    marginVertical: 6,
  },

  indexText: {
    ...Typography.header25,
    width: 50,
    textAlign: "right",
    marginRight: 12,
    backgroundColor: Color.grey,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Color.white,
    borderRadius: 99,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flex: 1,
    minHeight: 48,
  },
  chipDisabled: {
    opacity: 0.8,
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

  word: { ...Typography.header25, flexShrink: 1 },

  missing: { marginLeft: 8, fontSize: 12, color: "#a3a8af" },

  footer: { marginTop: 8, alignItems: "center" },
});
