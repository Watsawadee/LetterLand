import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Portal, Dialog, IconButton } from "react-native-paper";

import { Typography } from "@/theme/Font";
import { Color } from "@/theme/Color";
import { cardStyles as card } from "@/theme/CardStyles";

import { getCardBGImage } from "@/services/mygameService";
import {
  getPublicGames,
  startPublicGame,
  checkPublicGamePlayed,
} from "@/services/publicgameService";

import { PublicGameItem, PublicGameType } from "@/types/publicgametypes";

import GameTypeCard from "@/components/GameTypeModal";
import InfoIcon from "@/assets/icon/infoIcon";
import GameTypeBackground from "@/assets/backgroundTheme/GameTypeBackground";
import CloseIcon from "@/assets/icon/CloseIcon";

/* ------------------ Timer pills (UiTimer = seconds-as-strings) ------------------ */
export type UiTimer = "none" | "60" | "180" | "300";
const TIMER_OPTIONS: UiTimer[] = ["none", "60", "180", "300"];

const minutesFromUiTimer = (t: UiTimer): number | null =>
  t === "none" ? null : Math.floor(Number(t) / 60);

function TimerChips({
  value,
  onChange,
}: {
  value: UiTimer;
  onChange: (v: UiTimer) => void;
}) {
  return (
    <View style={{ marginTop: 6 }}>
      <Text style={t.title}>Timer</Text>
      <View style={t.row}>
        {TIMER_OPTIONS.map((opt) => {
          const selected = value === opt;
          const mins = opt === "none" ? null : Number(opt) / 60;
          const label = mins === null ? "None" : `${mins} min${mins === 1 ? "" : "s"}`;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              style={[t.chip, selected && t.chipSelected]}
            >
              <Text style={[t.chipText, selected && t.chipTextSelected]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const t = StyleSheet.create({
  title: { fontSize: 14, fontWeight: "700", color: "#6B7280", marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  chip: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E6EBF2",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  chipSelected: { backgroundColor: "#5EA1FF", borderColor: "transparent" },
  chipText: { color: "#6B7280", fontWeight: "700" },
  chipTextSelected: { color: "#FFFFFF", fontWeight: "700" },
});

/* ------------------ Grid Card ------------------ */
type GridCardProps = {
  id: number;
  image: string | null | undefined;
  title: string;
  subtitle?: string;
  level?: string;
  onPress?: () => void;
};

const GridCard: React.FC<GridCardProps> = ({
  image,
  title,
  subtitle,
  level,
  onPress,
}) => (
  <TouchableOpacity style={card.card} onPress={onPress}>
    {!!image && <Image source={{ uri: image }} style={card.image} />}
    <View style={card.content}>
      <View style={card.row}>
        <Text style={card.title}>{title}</Text>
        {!!level && <Text style={card.level}>{level}</Text>}
      </View>
      {!!subtitle && <Text style={card.subtitle}>{subtitle}</Text>}
    </View>
  </TouchableOpacity>
);

/* ------------------ Component ------------------ */
type Props = { title?: string; limit?: number; offset?: number };

export default function PublicGames({
  title = "Public Games",
  limit = 50,
  offset = 0,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PublicGameItem[]>([]);

  // selection/time flow
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<PublicGameType | null>(null);
  const [timer, setTimer] = useState<UiTimer>("none"); // "none" | "60" | "180" | "300"

  // dialogs
  const [comboDialogVisible, setComboDialogVisible] = useState(false); // Type + Timer
  const [infoDialogVisible, setInfoDialogVisible] = useState(false); // Info
  const [remarkVisible, setRemarkVisible] = useState(false); // Replay remark

  // replay detection
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [checkingReplay, setCheckingReplay] = useState(false);

  const gameOptions = useMemo(
    () => [
      { type: "WORD_SEARCH" as const, question: "Q. Cat", label: "Word search" },
      { type: "CROSSWORD_SEARCH" as const, question: "Q. What is mammal?", label: "Crossword search" },
    ],
    []
  );

  /* ---------- load list ---------- */
  const fetchPublic = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getPublicGames(limit, offset);
      const withImages = await Promise.all(
        list.map(async (g) => {
          if (g.imageUrl) {
            try {
              const full = await getCardBGImage(g.imageUrl);
              return { ...g, imageUrl: full };
            } catch {
              return g;
            }
          }
          return g;
        })
      );
      setItems(withImages);
    } catch (err: any) {
      console.error("[PublicGames] load failed:", err?.response?.data || err?.message || err);
      Alert.alert("Couldn’t load public games", err?.response?.data?.error ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => { fetchPublic(); }, [fetchPublic]);

  const cards: GridCardProps[] = items.map((g) => ({
    id: g.id,
    title: g.title,
    subtitle: g.gameType,
    level: g.difficulty,
    image: g.imageUrl,
  }));

  /* ---------- open combined dialog ---------- */
  const handlePress = (templateId: number) => {
    setSelectedTemplateId(templateId);
    const base = items.find((x) => x.id === templateId);
    setSelectedType(base?.gameType ?? "WORD_SEARCH");
    setTimer("none"); // reset to no timer
    setAlreadyPlayed(false);
    setRemarkVisible(false);
    setComboDialogVisible(true);
  };

  /* ---------- replay check (send SECONDS to API) ---------- */
  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!comboDialogVisible || !selectedTemplateId || !selectedType) return;

      const timerSecondsForApi: number | undefined =
        timer === "none" ? undefined : Number(timer);

      try {
        setCheckingReplay(true);
        const resp = await checkPublicGamePlayed(selectedTemplateId, {
          newType: selectedType,
          timerSeconds: timerSecondsForApi,
        });
        if (active) setAlreadyPlayed(resp.alreadyPlayed);
      } catch (e: any) {
        console.error("[checkPublicGamePlayed] failed:", e?.response?.data || e?.message || e);
        if (active) setAlreadyPlayed(false);
      } finally {
        if (active) setCheckingReplay(false);
      }
    };
    const id = setTimeout(run, 150);
    return () => { active = false; clearTimeout(id); };
  }, [comboDialogVisible, selectedTemplateId, selectedType, timer]);

  useEffect(() => {
    if (comboDialogVisible && alreadyPlayed) setRemarkVisible(true);
  }, [comboDialogVisible, alreadyPlayed]);

  /* ---------- actually create the game (send SECONDS) ---------- */
  const reallyStart = useCallback(async () => {
    if (!selectedTemplateId) return;

    const timerSecondsForApi: number | null =
      timer === "none" ? null : Number(timer);

    try {
      const payload = {
        ...(selectedType ? { newType: selectedType } : {}),
        timerSeconds: timerSecondsForApi,
      };
      const started = await startPublicGame(selectedTemplateId, payload);

      // reset + close
      setRemarkVisible(false);
      setComboDialogVisible(false);
      setTimer("none");
      setSelectedType(null);
      setSelectedTemplateId(null);

      router.push({ pathname: "/GameScreen", params: { gameId: String(started.id) } });
    } catch (err: any) {
      console.error("[PublicGames] start failed:", err?.response?.data || err?.message || err);
      Alert.alert("Couldn’t start game", err?.response?.data?.error ?? "Please try again.");
    }
  }, [router, selectedTemplateId, selectedType, timer]);

  const confirmAndStart = () => {
    if (alreadyPlayed) setRemarkVisible(true);
    else reallyStart();
  };

  const selectionSummary = useMemo(() => {
    const tLabel = selectedType === "CROSSWORD_SEARCH" ? "Crossword search" : "Word search";
    const mins = minutesFromUiTimer(timer);
    const timeLabel = mins === null ? "No timer" : `${mins} min${mins === 1 ? "" : "s"}`;
    return `${tLabel} • ${timeLabel}`;
  }, [selectedType, timer]);

  return (
    <View style={{ flex: 1, minHeight: 0, marginTop: 24 }}>
      <Text style={[Typography.header20, { marginBottom: 8 }]}>{title}</Text>

      {loading ? (
        <ActivityIndicator size="small" />
      ) : cards.length > 0 ? (
        <FlatList<GridCardProps>
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 16 }}
          data={cards}
          numColumns={3}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <GridCard {...item} onPress={() => handlePress(item.id)} />}
          showsVerticalScrollIndicator
          columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
        />
      ) : (
        <Text style={{ color: "gray", textAlign: "center", marginTop: 10 }}>No public games found.</Text>
      )}

      {/* ==================== DIALOGS ==================== */}
      <Portal>
        {/* -------- Combined Type + Timer Dialog -------- */}
        <Dialog
          visible={comboDialogVisible && !infoDialogVisible}
          dismissable={!infoDialogVisible}
          onDismiss={() => setComboDialogVisible(false)}
          style={{ backgroundColor: Color.white, width: "60%", alignSelf: "center", height: "60%" }}
        >
          {/* Title Row */}
          <View style={s.titleRow}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Dialog.Title style={{ fontWeight: "800", color: Color.gray }}>Game Type & Timer</Dialog.Title>
              <IconButton
                icon={(p) => <InfoIcon size={16} color={p.color ?? Color.gray} />}
                size={16}
                onPress={() => setInfoDialogVisible(true)}
                iconColor={Color.gray}
                containerColor="transparent"
                style={{ margin: 0 }}
                accessibilityLabel="Game Types info"
              />
            </View>
            <IconButton
              icon={(p) => <CloseIcon width={18} height={18} fillColor={Color.gray} {...p} />}
              onPress={() => setComboDialogVisible(false)}
              style={{ margin: 0 }}
              accessibilityLabel="Close dialog"
            />
          </View>

          <Dialog.Content>
            {/* Type Cards */}
            <View style={s.typeRow}>
              {gameOptions.map(({ type, question, label }) => (
                <GameTypeCard
                  key={type}
                  question={question}
                  gameType={label}
                  selected={selectedType === type}
                  onPress={() => setSelectedType(type)}
                />
              ))}
            </View>

            {/* Timer Pills (UiTimer seconds, displayed as minutes) */}
            <TimerChips value={timer} onChange={setTimer} />

            {/* Selection summary */}
            <View style={s.summaryRow}>
              <Text style={s.summaryText}>Selected:</Text>
              <View style={s.summaryBadge}>
                <Text style={s.summaryBadgeText}>{selectionSummary}</Text>
              </View>
            </View>

            {/* Inline replay notice */}
            {checkingReplay ? (
              <Text style={s.inlineNotice}>Checking…</Text>
            ) : alreadyPlayed ? (
              <View style={s.inlineBadge}>
                <Text style={s.inlineBadgeText}>
                  You’ve played this setup before. Replays don’t earn coins (extra word still gives 1).
                </Text>
              </View>
            ) : null}

            {/* Actions */}
            <View style={s.actions}>
              <Pressable style={[m.btn, m.outline]} onPress={() => setComboDialogVisible(false)}>
                <Text style={[m.btnText, { color: "#333" }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[m.btn, m.primary, { opacity: selectedType ? 1 : 0.5 }]}
                disabled={!selectedType}
                onPress={confirmAndStart}
              >
                <Text style={[m.btnText, { color: "white" }]}>Start</Text>
              </Pressable>
            </View>
          </Dialog.Content>
        </Dialog>

        {/* -------- Info Dialog (unchanged) -------- */}
        <Dialog
          visible={infoDialogVisible}
          onDismiss={() => setInfoDialogVisible(false)}
          style={{
            width: Platform.OS === "web" ? "60%" : "35%",
            alignSelf: "center",
            height: "90%",
            backgroundColor: Color.white,
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <View style={s.bgHalf}>
            <GameTypeBackground pointerEvents="none" style={{ width: "100%", height: "100%" }} />
          </View>

          <View style={s.infoHeader}>
            <Dialog.Title style={{ fontWeight: "800", color: Color.gray }}>Game Type</Dialog.Title>
            <IconButton
              icon={(p) => <CloseIcon width={18} height={18} fillColor={Color.gray} {...p} />}
              onPress={() => setInfoDialogVisible(false)}
              style={{ margin: 0 }}
            />
          </View>

          <Dialog.Content>
            {/* … your info dialog content … */}
            <View style={{ height: 300 }} />
          </Dialog.Content>
        </Dialog>

        {/* -------- Remark Dialog (replay) -------- */}
        <Dialog
          visible={remarkVisible}
          onDismiss={() => setRemarkVisible(false)}
          style={{ width: "50%", alignSelf: "center", backgroundColor: Color.white, borderRadius: 24 }}
        >
          <Dialog.Content>
            <Text style={{ fontSize: 28, fontWeight: "800", color: "#4B5563", marginBottom: 12 }}>Remark</Text>
            <Text style={{ fontSize: 18, lineHeight: 26, color: "#4B5563", marginBottom: 22 }}>
              You won’t earn coins for replaying this game, but finding the extra word will still reward you a coin.
              Time spent will count toward your progress.
            </Text>

            <Pressable onPress={reallyStart} style={s.playBtn}>
              <Text style={{ color: "white", fontSize: 18, fontWeight: "800" }}>Play</Text>
            </Pressable>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
}

const s = StyleSheet.create({
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingRight: 10, paddingTop: 4 },
  typeRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 16, marginBottom: 18 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 16 },
  inlineBadge: { marginTop: 12, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: "#F3F4F6" },
  inlineBadgeText: { color: "#4B5563", fontSize: 13, fontWeight: "600" },
  inlineNotice: { marginTop: 10, color: "#6B7280", fontStyle: "italic" },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  summaryText: { color: "#6B7280", fontWeight: "700" },
  summaryBadge: { backgroundColor: "#EEF2FF", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  summaryBadgeText: { color: "#374151", fontWeight: "700" },
  infoHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 5 },
  bgHalf: { position: "absolute", bottom: 0, left: 0, width: "100%", height: "50%", zIndex: 0 },
  playBtn: { backgroundColor: "#5EA1FF", paddingVertical: 14, borderRadius: 20, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
});

const m = StyleSheet.create({
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  outline: { backgroundColor: "#F2F2F2" },
  primary: { backgroundColor: "#4D9DFE" },
  btnText: { fontSize: 16, fontWeight: "700" },
});
