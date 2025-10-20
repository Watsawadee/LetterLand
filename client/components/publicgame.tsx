import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Portal, Dialog, IconButton } from "react-native-paper";

import { Typography } from "@/theme/Font";
import { Color } from "@/theme/Color";
// NOTE: old cardStyles import removed because we now use the MyGamesRow-style card UI

import { getCardBGImage } from "@/services/mygameService";
import {
  getPublicGames,
  startPublicGame,
  checkPublicGamePlayed,
} from "@/services/publicgameService";

import { PublicGameItem, PublicGameType } from "@/types/publicgametypes";

import GameTypeCard from "@/components/GameTypeModal";
import InfoIcon from "@/assets/icon/infoIcon";
import CloseIcon from "@/assets/icon/CloseIcon";

/* ---------- use your existing profile service (returns CEFR level) ---------- */
import { getUserProfile } from "@/services/getUserProfileService";
import GameTypeDetails from "./GameTypeDetails";

/* ------------------ Timer pills (UiTimer = seconds-as-strings) ------------------ */
export type UiTimer = "none" | "60" | "180" | "300";
const TIMER_OPTIONS: UiTimer[] = ["none", "60", "180", "300"];

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
          const label =
            mins === null ? "None" : `${mins} min${mins === 1 ? "" : "s"}`;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              style={[t.chip, selected && t.chipSelected]}
            >
              <Text style={[t.chipText, selected && t.chipTextSelected]}>
                {label}
              </Text>
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

/* ----- CEFR order helper ----- */
const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
type Level = (typeof LEVEL_ORDER)[number];
const rank = (lvl?: string | null) => {
  const i = LEVEL_ORDER.indexOf(lvl as Level);
  return i === -1 ? Number.POSITIVE_INFINITY : i;
};

/* ---------- CEFR color palette ---------- */
const LEVEL_COLORS: Record<string, string> = {
  A1: "#F2B9DD",
  A2: "#FB7FC7",
  B1: "#F19DB8",
  B2: "#FB6C97",
  C1: "#C8A8E0",
  C2: "#AE7EDF",
};

/* ------------------ Grid Card (MyGamesRow-style, no subtitle) ------------------ */
type GridCardProps = {
  id: number;
  image: string | null | undefined;
  title: string;
  level?: string;
  locked?: boolean;
  onPress?: () => void;
};

const CARD_RADIUS = 18;
const CARD_WIDTH_GRID = 200;
const IMAGE_HEIGHT_GRID = 110;

const GridCard: React.FC<GridCardProps> = ({
  image,
  title,
  level,
  locked = false,
  onPress,
}) => {
  const W = CARD_WIDTH_GRID;
  const H = IMAGE_HEIGHT_GRID;
  const levelBg =
    level && LEVEL_COLORS[level] ? LEVEL_COLORS[level] : "#EAEAEA";

  return (
    <Pressable
      style={({ pressed }) => [
        pg.card,
        { width: W, borderRadius: CARD_RADIUS },
        locked && { opacity: 0.75 },
        !locked && pressed ? { opacity: 0.9 } : null,
      ]}
      onPress={() => {
        if (locked) return;
        onPress?.();
      }}
    >
      {/* Top image area */}
      <View
        style={[
          pg.imageWrap,
          {
            borderTopLeftRadius: CARD_RADIUS,
            borderTopRightRadius: CARD_RADIUS,
          },
        ]}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: "100%", height: H }}
            resizeMode="cover"
          />
        ) : (
          <View style={[{ width: "100%", height: H }, pg.imagePlaceholder]} />
        )}

        {locked && (
          <View style={pg.lockOverlay}>
            <Text style={pg.lockEmoji}>🔒</Text>
            <Text style={pg.lockText}>Locked</Text>
          </View>
        )}
      </View>

      {/* Bottom info panel */}
      <View
        style={[
          pg.bottomPanel,
          {
            borderBottomLeftRadius: CARD_RADIUS,
            borderBottomRightRadius: CARD_RADIUS,
          },
        ]}
      >
        <View style={pg.titleRow}>
          <Text numberOfLines={1} style={pg.title}>
            {title}
          </Text>
          {!!level && (
            <View style={[pg.levelPill, { backgroundColor: levelBg }]}>
              <Text style={pg.levelText}>{level}</Text>
            </View>
          )}
        </View>
        {/* No subtitle */}
      </View>
    </Pressable>
  );
};

const pg = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    // marginRight: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 4,
      },
      default: {
        shadowColor: "rgba(0,0,0,0.10)",
        shadowOpacity: 1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
    }),
    marginBottom: 14,
  },
  imageWrap: {
    overflow: "hidden",
    position: "relative",
  },
  imagePlaceholder: {
    backgroundColor: "#E8EEF5",
  },
  bottomPanel: {
    backgroundColor: "#F7F9FB",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    minHeight: 52,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#2A2A2A",
  },
  levelPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 13,
  },
  levelText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
  },
  lockOverlay: {
    position: "absolute",
    inset: 0 as any,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  lockEmoji: { fontSize: 28, marginBottom: 4, color: "white" },
  lockText: { color: "white", fontWeight: "800" },
});

/* ------------------ Component ------------------ */
type Props = {
  title?: string;
  limit?: number;
  offset?: number;
  /** When provided, show only these template IDs (used by Publicboard search) */
  whitelistIds?: number[] | null;
};

export default function PublicGames({
  title = "Public Games",
  limit = 50,
  offset = 0,
  whitelistIds = null,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PublicGameItem[]>([]);

  /* ---------- user CEFR level ---------- */
  const [userLevel, setUserLevel] = useState<
    "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null
  >(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // selection/time flow
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<PublicGameType | null>(null);
  const [timer, setTimer] = useState<UiTimer>("none"); // "none" | "60" | "180" | "300"

  // dialogs
  const [comboDialogVisible, setComboDialogVisible] = useState(false); // Type + Timer
  const [infoDialogVisible, setInfoDialogVisible] = useState(false); // Info
  const [remarkVisible, setRemarkVisible] = useState(false); // Replay remark

  // replay detection
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [checkingReplay, setCheckingReplay] = useState(false);

  // Double-click prevention
  const [isStarting, setIsStarting] = useState(false);

  const gameOptions = useMemo(
    () => [
      {
        type: "CROSSWORD_SEARCH" as const,
        question: "Q. What is mammal?",
        label: "Crossword search",
      },
      {
        type: "WORD_SEARCH" as const,
        question: "Q. Cat",
        label: "Word search",
      },
    ],
    []
  );

  /* ---------- load user english level ---------- */
  const fetchUserLevel = useCallback(async () => {
    try {
      setLoadingUser(true);
      const prof = await getUserProfile();

      // Try typical shapes: adjust if your schema is fixed
      const lvl =
        (prof as any)?.data?.englishLevel ??
        (prof as any)?.data?.user?.englishLevel ??
        (prof as any)?.englishLevel ??
        null;

      if (typeof lvl === "string") {
        const valid = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
        setUserLevel(
          valid.includes(lvl as any) ? (lvl as (typeof valid)[number]) : null
        );
      } else {
        setUserLevel(null);
      }
    } catch (err: any) {
      console.error(
        "[PublicGames] load user failed:",
        err?.response?.data || err?.message || err
      );
      Alert.alert(
        "Couldn't load your profile",
        "Some games may not be correctly locked."
      );
      setUserLevel(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  /* ---------- load public games ---------- */
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
      console.error(
        "[PublicGames] load failed:",
        err?.response?.data || err?.message || err
      );
      Alert.alert(
        "Couldn't load public games",
        err?.response?.data?.error ?? "Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    fetchUserLevel();
  }, [fetchUserLevel]);

  useEffect(() => {
    fetchPublic();
  }, [fetchPublic]);

  /* ---------- filter by whitelistIds when provided ---------- */
  const visibleItems = useMemo(
    () =>
      whitelistIds ? items.filter((i) => whitelistIds.includes(i.id)) : items,
    [items, whitelistIds]
  );

  /* ---------- build cards with lock flag (allow user level and below) ---------- */
  const cards: GridCardProps[] = useMemo(() => {
    // If we don't know the user level yet, don't lock anything (UI still sorts later once level loads)
    const userRank = userLevel ? rank(userLevel) : Number.POSITIVE_INFINITY;

    const mapped = visibleItems.map((g) => {
      const gRank = rank(g.difficulty);
      // Unlocked if game level <= user level
      const locked =
        userRank !== Number.POSITIVE_INFINITY ? gRank > userRank : false;

      // Priority for sorting:
      //   0 = same level (best match)
      //   1 = below user level (still playable)
      //   2 = locked (above user level)
      let priority = 2;
      if (!locked) {
        priority = gRank === userRank ? 0 : 1;
      }

      return {
        id: g.id,
        title: g.title,
        level: g.difficulty,
        image: g.imageUrl,
        locked,
        // internal sort keys
        _priority: priority,
        _gRank: gRank,
      } as GridCardProps & { _priority: number; _gRank: number };
    });

    // Sort: playable first (same level, then lower), then locked; within each group, lower rank first
    const sorted = mapped.sort((a, b) => {
      if (a._priority !== b._priority) return a._priority - b._priority;
      return a._gRank - b._gRank;
    });

    // Strip internal keys
    return sorted.map(({ _priority, _gRank, ...rest }) => rest);
  }, [visibleItems, userLevel]);

  /* ---------- open combined dialog ---------- */
  const handlePress = (templateId: number, locked?: boolean) => {
    if (locked) {
      Alert.alert(
        "Locked",
        "This game is locked for your current level. Play games at your level to unlock more later."
      );
      return;
    }
    setSelectedTemplateId(templateId);
    const base = items.find((x) => x.id === templateId);
    setSelectedType(base?.gameType ?? "WORD_SEARCH");
    setTimer("none"); // reset to no timer
    setAlreadyPlayed(false);
    setRemarkVisible(false);
    setIsStarting(false); // Reset starting state
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
        console.error(
          "[checkPublicGamePlayed] failed:",
          e?.response?.data || e?.message || e
        );
        if (active) setAlreadyPlayed(false);
      } finally {
        if (active) setCheckingReplay(false);
      }
    };
    const id = setTimeout(run, 150);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [comboDialogVisible, selectedTemplateId, selectedType, timer]);

  useEffect(() => {
    if (comboDialogVisible && alreadyPlayed) setRemarkVisible(true);
  }, [comboDialogVisible, alreadyPlayed]);

  /* ---------- start game (send SECONDS) ---------- */
  const reallyStart = useCallback(async () => {
    if (!selectedTemplateId || isStarting) return;

    const timerSecondsForApi: number | null =
      timer === "none" ? null : Number(timer);

    try {
      setIsStarting(true);
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

      router.push({
        pathname: "/GameScreen",
        params: { gameId: String(started.id) },
      });
    } catch (err: any) {
      console.error(
        "[PublicGames] start failed:",
        err?.response?.data || err?.message || err
      );
      Alert.alert(
        "Couldn't start game",
        err?.response?.data?.error ?? "Please try again."
      );
    } finally {
      setIsStarting(false);
    }
  }, [router, selectedTemplateId, selectedType, timer, isStarting]);

  const confirmAndStart = () => {
    if (isStarting) return;
    // Always start the game, even if already played
    reallyStart();
  };

  const showSpinner = loading || loadingUser;

  return (
    <View style={{ flex: 1, minHeight: 0, marginTop: 24 }}>
      <Text style={[Typography.header20, { marginBottom: 8 }]}>{title}</Text>

      {showSpinner ? (
        <ActivityIndicator size="small" />
      ) : cards.length > 0 ? (
        <FlatList<GridCardProps>
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 12 }}
          data={cards}
          numColumns={3}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <GridCard
              {...item}
              onPress={() => handlePress(item.id, item.locked)}
            />
          )}
          showsVerticalScrollIndicator
          columnWrapperStyle={{
            justifyContent: "flex-start",
            gap: 40,
            marginBottom: 16,
          }}
        />
      ) : (
        <Text style={{ color: "gray", textAlign: "center", marginTop: 10 }}>
          No public games found.
        </Text>
      )}

      {/* ==================== DIALOGS ==================== */}
      <Portal>
        {/* -------- Combined Type + Timer Dialog -------- */}
        <Dialog
          visible={comboDialogVisible && !infoDialogVisible}
          dismissable={!infoDialogVisible}
          onDismiss={() => {
            setComboDialogVisible(false);
            setIsStarting(false);
          }}
          style={{
            backgroundColor: Color.white,
            width: 650,
            alignSelf: "center",
            minHeight: 550,
          }}
        >
          {/* Title Row */}
          <View style={s.titleRow}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Dialog.Title style={{ fontWeight: "800", color: Color.gray }}>
                Game Type & Timer
              </Dialog.Title>
              <IconButton
                icon={(p) => (
                  <InfoIcon size={16} color={p.color ?? Color.gray} />
                )}
                size={16}
                onPress={() => setInfoDialogVisible(true)}
                iconColor={Color.gray}
                containerColor="transparent"
                style={{ margin: 0 }}
                accessibilityLabel="Game Types info"
              />
            </View>
            <IconButton
              icon={(p) => (
                <CloseIcon
                  width={18}
                  height={18}
                  fillColor={Color.gray}
                  {...p}
                />
              )}
              onPress={() => {
                setComboDialogVisible(false);
                setIsStarting(false);
              }}
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

            {alreadyPlayed ? (
              <View style={s.inlineBadge}>
                <Text style={s.inlineBadgeText}>
                  You've played this setup before. Replays don't earn coins
                  (extra word still gives 1).
                </Text>
              </View>
            ) : null}

            {/* Actions */}
            <View style={s.actions}>
              <Pressable
                style={[m.btn, m.outline]}
                onPress={() => {
                  setComboDialogVisible(false);
                  setIsStarting(false);
                }}
              >
                <Text style={[m.btnText, { color: Color.gray }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  m.btn,
                  m.primary,
                  { opacity: selectedType && !isStarting ? 1 : 0.5 },
                ]}
                disabled={!selectedType || isStarting}
                onPress={confirmAndStart}
              >
                <Text style={[m.btnText, { color: "white" }]}>
                  {isStarting ? "Starting..." : "Start"}
                </Text>
              </Pressable>
            </View>
          </Dialog.Content>
        </Dialog>

        {/* -------- Info Dialog -------- */}
        <GameTypeDetails
          visible={infoDialogVisible}
          onDismiss={() => setInfoDialogVisible(false)}
        />
      </Portal>
    </View>
  );
}

const s = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 10,
    paddingTop: 4,
  },
  typeRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginBottom: 18,
    height: 200,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
    alignItems: "center",
  },
  inlineBadge: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F3F4F6",
  },
  inlineBadgeText: { color: "#4B5563", fontSize: 13, fontWeight: "600" },
  inlineNotice: { marginTop: 10, color: "#6B7280", fontStyle: "italic" },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  summaryText: { color: "#6B7280", fontWeight: "700" },
  summaryBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  summaryBadgeText: { color: "#374151", fontWeight: "700" },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  bgHalf: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "50%",
    zIndex: 0,
  },
  playBtn: {
    backgroundColor: "#5EA1FF",
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});

const m = StyleSheet.create({
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  outline: { backgroundColor: "#F2F2F2" },
  primary: { backgroundColor: "#4D9DFE" },
  btnText: { ...Typography.header16 },
});