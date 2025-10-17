import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Linking,
} from "react-native";
import { Color } from "@/theme/Color";
import {
  fetchDictionaryEntry,
  normalizeWord,
  type DictEntry,
} from "@/services/dictionaryService";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import Play from "@/assets/icon/Play";
import Stop from "@/assets/icon/Stop";
import { Typography } from "@/theme/Font";

type Props = {
  visible: boolean;
  word: string | null;
  onClose: () => void;
};

export default function MeaningTooltip({ visible, word, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [entry, setEntry] = useState<DictEntry | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const audioUrl = useMemo(() => entry?.audioUrls?.[0] ?? null, [entry]);

  const player = useAudioPlayer(audioUrl ?? null, {
    updateInterval: 500,
  });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!visible || !word) return;
      setLoading(true);
      setErr(null);
      setEntry(null);
      try {
        const e = await fetchDictionaryEntry(word);
        if (mounted) setEntry(e);
      } catch (e: any) {
        if (mounted) setErr(e?.message || "Meaning not found");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [visible, word]);

  useEffect(() => {
    if (!visible && status?.playing) {
      try {
        player.pause();
        player.seekTo(0);
      } catch {}
    }
  }, [visible]);

  useEffect(() => {
    if (!audioUrl) return;
    try {
      player.pause();
      player.seekTo(0);
    } catch {}
  }, [audioUrl]);

  if (!visible) return null;

  const nice = (s?: string) =>
    String(s ?? "")
      .toLowerCase()
      .replace(
        /(^|[^A-Za-z]+)([A-Za-z])/g,
        (_, sep, ch) => sep + ch.toUpperCase()
      );

  const onToggleAudio = async () => {
    try {
      if (!audioUrl) return;
      if (status?.playing) {
        player.pause();
        return;
      }
      if (
        status &&
        status.duration > 0 &&
        status.currentTime >= status.duration
      ) {
        player.seekTo(0);
      }
      await player.play();
    } catch {
      if (audioUrl) Linking.openURL(audioUrl).catch(() => {});
    }
  };

  const audioEnabled = !!audioUrl;
  const isPlaying = !!status?.playing;

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.word}>{nice(normalizeWord(word || ""))}</Text>
            {entry?.phonetic ? (
              <Text style={styles.phonetic}>{entry.phonetic}</Text>
            ) : null}
          </View>

          {audioEnabled ? (
            <Pressable
              onPress={onToggleAudio}
              style={[styles.audioBtn, isPlaying && styles.audioBtnActive]}
              accessibilityRole="button"
              accessibilityLabel={
                isPlaying ? "Stop pronunciation" : "Play pronunciation"
              }
            >
              {isPlaying ? (
                <Stop width={24} height={24} />
              ) : (
                <Play width={24} height={24} />
              )}
            </Pressable>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.centerRow}>
            <ActivityIndicator />
          </View>
        ) : err ? (
          <Text style={styles.error}>{err}</Text>
        ) : entry ? (
          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={styles.bodyScrollContent}
            showsVerticalScrollIndicator
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {entry.synonyms?.length ? (
              <View style={styles.synWrap}>
                <Text style={styles.synLabel}>Synonyms: </Text>
                <View style={styles.synChips}>
                  {entry.synonyms.slice(0, 50).map((s) => (
                    <View key={s} style={styles.synChip}>
                      <Text style={styles.synChipText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {renderTopMeanings(entry)}
          </ScrollView>
        ) : null}

        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>
    </View>
  );
}

function renderTopMeanings(entry: DictEntry) {
  const parts = entry.meanings.slice(0, 4);
  return (
    <>
      {parts.map((m, i) => {
        const defs = m.definitions.slice(0, 3);
        return (
          <View key={`${m.partOfSpeech}-${i}`} style={{ marginBottom: 10 }}>
            {m.partOfSpeech ? (
              <Text style={styles.pos}>{m.partOfSpeech}</Text>
            ) : null}
            {defs.map((d, j) => (
              <View key={j} style={{ marginTop: 2 }}>
                <Text style={styles.def}>• {truncate(d.definition, 220)}</Text>
                {d.example ? (
                  <Text style={styles.ex}>"{truncate(d.example, 160)}"</Text>
                ) : null}
              </View>
            ))}
          </View>
        );
      })}
    </>
  );
}

function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  card: {
    width: 360,
    maxWidth: "80%",
    maxHeight: 420,
    backgroundColor: Color.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e3e6ee",
    padding: 12,
    shadowColor: Color.black,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  word: { fontSize: 18, fontWeight: "800", color: "#2d3444" },
  phonetic: { fontSize: 14, color: "#7b8396", marginTop: 2 },
  audioBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d5dae6",
    alignItems: "center",
    justifyContent: "center",
  },
  audioBtnActive: { backgroundColor: Color.white },
  bodyScroll: {
    maxHeight: 320,
    marginTop: 6,
    flexGrow: 0,
  },
  bodyScrollContent: {
    paddingRight: 6,
    paddingBottom: 6,
  },

  synWrap: { marginTop: 4, marginBottom: 8 },
  synLabel: { color: "#6b7280", marginBottom: 6 },
  synChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  synChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  synChipText: { fontSize: 12, color: "#374151" },
  pos: { fontSize: 13, fontWeight: "700", color: "#59607a" },
  def: { fontSize: 14, color: "#3c4356", marginTop: 2, lineHeight: 19 },
  ex: { fontSize: 12, color: "#6b7280", marginTop: 1, fontStyle: "italic" },
  closeBtn: {
    alignSelf: "flex-end",
    marginTop: 10,
    paddingHorizontal: 10, 
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#d5dae6",
  },
  closeText: { color: Color.gray, ...Typography.header13 },
  centerRow: { paddingVertical: 10, alignItems: "center" },
  error: { color: "#c0392b", fontSize: 14, marginTop: 4 },
});
