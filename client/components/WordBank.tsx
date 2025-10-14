import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  PanResponder,
  PanResponderGestureState,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { fetchWordBankPage, type ApiOK } from "@/services/wordbankService";
import Wordbank from "@/assets/backgroundTheme/wordbankBook";
import { Color } from "@/theme/Color";
import { Typography } from "@/theme/Font";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const BOOK_W = 574;
const BOOK_H = 377;

const DRAG_THRESHOLD_PCT = 1 / 3;
const ANGLE_TAN_30 = 0.577;

export default function WordBankModal({ visible, onClose }: Props) {
  const [page, setPage] = useState(1);
  const [source, setSource] = useState<"words" | "extra">("words");
  const [data, setData] = useState<ApiOK | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setPage(1);
      setSource("words");
      setData(null);
      setErr(null);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    let canceled = false;

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const body = await fetchWordBankPage(page, source);
        if (!canceled) setData(body);
      } catch (e: any) {
        if (!canceled) setErr(e?.message || "Failed to load word bank");
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [visible, page, source]);

  const canPrev = useMemo(() => (data ? page > 1 : false), [page, data]);
  const canNext = useMemo(
    () => (data ? page < data.totalPages : false),
    [page, data]
  );

  const goPrev = () => canPrev && setPage((p) => p - 1);
  const goNext = () => canNext && setPage((p) => p + 1);

  const turnIfThresholdPassed = (dx: number, dy: number) => {
    if (Math.abs(dy) > Math.abs(dx) * ANGLE_TAN_30) return;
    const threshold = BOOK_W * DRAG_THRESHOLD_PCT;
    if (dx <= -threshold) goNext();
    else if (dx >= threshold) goPrev();
  };

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_evt, g) =>
          Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6,
        onPanResponderRelease: (_evt, g: PanResponderGestureState) =>
          turnIfThresholdPassed(g.dx, g.dy),
        onPanResponderTerminate: (_evt, g) => turnIfThresholdPassed(g.dx, g.dy),
      }),
    [canPrev, canNext]
  );

  function titleCaseASCII(s: string) {
    return (s ?? "")
      .toString()
      .toLowerCase()
      .replace(
        /(^|[^A-Za-z]+)([A-Za-z])/g,
        (_, sep, ch) => sep + ch.toUpperCase()
      );
  }

  function numberColWidth(
    left: ApiOK["left"] = [],
    right: ApiOK["right"] = []
  ) {
    const maxN = Math.max(
      0,
      ...left.map((i) => i.n ?? 0),
      ...right.map((i) => i.n ?? 0)
    );
    const digits = String(Math.max(1, maxN)).length;
    return 8 + digits * 10 + 6;
  }

  const numColW = useMemo(
    () => numberColWidth(data?.left, data?.right),
    [data?.left, data?.right]
  );

  const renderSide = (items: ApiOK["left"]) => {
    if (!items || items.length === 0)
      return <Text style={styles.empty}>—</Text>;
    return items.map((it) => (
      <View key={`${source}-${it.n}`} style={styles.lineRow}>
        <Text style={[styles.numCol, { width: numColW }]}>{it.n}.</Text>
        <Text style={styles.wordText}>{titleCaseASCII(it.word)}</Text>
      </View>
    ));
  };

  const Bookmark = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      {/* Main body */}
      <View
        style={[
          styles.ribbonBody,
          active ? styles.ribbonBodyActive : styles.ribbonBodyInactive,
        ]}
      >
        <Text
          style={[
            styles.ribbonText,
            active ? styles.ribbonTextActive : styles.ribbonTextInactive,
          ]}
        >
          {label}
        </Text>
      </View>

      <View />
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.bookWrap}>
          <Wordbank />

          {/* gesture layer */}
          <View
            style={styles.gestureLayer}
            pointerEvents="box-only"
            {...panResponder.panHandlers}
          >
            <Pressable
              style={styles.leftTapZone}
              onPress={goPrev}
              android_ripple={{ borderless: true }}
            />
            <Pressable
              style={styles.rightTapZone}
              onPress={goNext}
              android_ripple={{ borderless: true }}
            />
          </View>

          {/* RIGHT-SIDE BOOKMARK RAIL */}
          <View style={styles.bookmarkRailRight}>
            <Bookmark
              label="WORDS"
              active={source === "words"}
              onPress={() => {
                if (source !== "words") {
                  setPage(1);
                  setSource("words");
                }
              }}
            />
            <Bookmark
              label="EXTRA"
              active={source === "extra"}
              onPress={() => {
                if (source !== "extra") {
                  setPage(1);
                  setSource("extra");
                }
              }}
            />
          </View>

          {/* Left page */}
          <View style={styles.leftColumn}>
            <Text style={styles.title}>
              {source === "words" ? "List of Words" : "Extra Words"}
            </Text>
            {loading ? (
              <ActivityIndicator />
            ) : err ? (
              <Text style={styles.error}>{err}</Text>
            ) : data ? (
              renderSide(data.left)
            ) : null}
          </View>

          {/* Right page */}
          <View style={styles.rightColumn}>
            {loading ? (
              <ActivityIndicator />
            ) : err ? (
              <Text style={styles.error} />
            ) : data ? (
              renderSide(data.right)
            ) : null}
          </View>

          {/* Pager */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.navBtn, !canPrev && styles.navBtnDisabled]}
              onPress={goPrev}
              disabled={!canPrev}
            >
              <Text style={styles.navText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.dots}>
              {Array.from({ length: Math.max(data?.totalPages || 1, 1) }).map(
                (_, i) => {
                  const idx = i + 1;
                  const active = idx === page;
                  return (
                    <Pressable
                      key={`${source}-dot-${idx}`}
                      onPress={() => !active && setPage(idx)}
                      hitSlop={8}
                      android_ripple={{ borderless: true }}
                      style={({ pressed }) => [
                        styles.dotBase,
                        active ? styles.dotActive : styles.dot,
                        pressed && styles.dotPressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Go to page ${idx}`}
                      accessibilityState={{ selected: active }}
                    />
                  );
                }
              )}
            </View>

            <TouchableOpacity
              style={[styles.navBtn, !canNext && styles.navBtnDisabled]}
              onPress={goNext}
              disabled={!canNext}
            >
              <Text style={styles.navText}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const COL_LEFT = { top: 40, left: 70, width: 220 };
const COL_RIGHT = { top: 80, right: 5, width: 240 };

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  bookWrap: {
    width: BOOK_W,
    height: BOOK_H,
    alignItems: "center",
    justifyContent: "center",
  },
  gestureLayer: {
    position: "absolute",
    width: BOOK_W,
    height: BOOK_H,
    flexDirection: "row",
  },
  leftTapZone: { width: BOOK_W / 2, height: BOOK_H },
  rightTapZone: { width: BOOK_W / 2, height: BOOK_H },
  bookmarkRailRight: {
    position: "absolute",
    right: -36,
    top: 50,
    gap: 5,
    zIndex: 3,
    alignItems: "flex-end",
  },
  leftColumn: {
    position: "absolute",
    ...COL_LEFT,
  },
  rightColumn: {
    position: "absolute",
    ...COL_RIGHT,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#4a5261",
    marginBottom: 12,
  },
  line: {
    fontSize: 22,
    color: "#394150",
    marginVertical: 4,
  },
  num: { fontWeight: "700" },
  empty: { color: "#9aa0a6", fontSize: 18 },

  error: { color: "#c0392b", fontSize: 14 },

  footer: {
    position: "absolute",
    bottom: 200,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    alignItems: "center",
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e9edf3",
  },
  navBtnDisabled: { opacity: 0.4 },
  navText: { fontSize: 24, fontWeight: "700", color: "#5b6073" },
  dots: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dotBase: {
    width: 9,
    height: 9,
    borderRadius: 6,
    top: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    top: 150,
    borderRadius: 4,
    backgroundColor: "#c3c7cf",
  },
  dotActive: { backgroundColor: "#5b6073" },
  dotPressed: {
    transform: [{ scale: 0.9 }],
  },
  ribbonBody: {
    minWidth: 86,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 2,
    shadowColor: Color.black,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },

    position: "relative",
    overflow: "visible",
  },
  ribbonBodyActive: {
    backgroundColor: Color.pink,
  },
  ribbonBodyInactive: {
    backgroundColor: Color.white,
    borderColor: "#d6d9e0",
    borderWidth: 1,
  },
  ribbonText: { ...Typography.header13, letterSpacing: 0.5 },
  ribbonTextActive: { color: Color.white },
  ribbonTextInactive: { color: Color.gray },
  lineRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginVertical: 4,
  },
  numCol: {
    textAlign: "right",
    marginRight: 6,
    fontWeight: "700",
    fontSize: 22,
    color: "#394150",
  },
  wordText: {
    fontSize: 22,
    color: "#394150",
  },
});
