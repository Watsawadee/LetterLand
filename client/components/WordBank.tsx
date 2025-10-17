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
import { Animated, Easing } from "react-native";
import { fetchWordBankPage, type ApiOK } from "@/services/wordbankService";
import Wordbank from "@/assets/backgroundTheme/wordbankBook";
import { Color } from "@/theme/Color";
import { Typography } from "@/theme/Font";
import ArrowLeft from "@/assets/icon/ArrowLeft";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const BOOK_W = 574;
const BOOK_H = 377;

const DRAG_THRESHOLD_PCT = 1 / 3;
const ANGLE_TAN_30 = 0.577;
const RIBBON_W_INACTIVE = 87;
const RIBBON_W_ACTIVE = 115;

export default function WordBankModal({ visible, onClose }: Props) {
  const [page, setPage] = useState(1);
  const [source, setSource] = useState<"words" | "extra">("words");
  const [data, setData] = useState<ApiOK | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const lastOnRight = (data?.right?.length ?? 0) > 0;

  const sinceIso = useMemo(
    () => (source === "words" ? data?.wordsSince : data?.extraSince) ?? null,
    [data, source]
  );
  const isLastPage = useMemo(
    () => (data ? page === data.totalPages : false),
    [data, page]
  );

  // const [tipWord, setTipWord] = useState<string | null>(null);

  // useEffect(() => {
  //   setTipWord(null);
  // }, [page, source]);

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

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

  const renderSide = (items: ApiOK["left"]) => {
    if (!items || items.length === 0)
      return <Text style={styles.empty}>—</Text>;
    return items.map((it) => (
      <Pressable
        key={`${source}-${it.n}`}
        style={styles.lineRow}
        // onPress={() => setTipWord(normalizeWord(it.word))}
        accessibilityRole="button"
      >
        <Text style={styles.numCol}>{String(it.n).padStart(2, " ")}.</Text>
        <Text style={styles.wordText}>{titleCaseASCII(it.word)}</Text>
      </Pressable>
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
  }) => {
    const [widthAnim] = React.useState(
      () => new Animated.Value(active ? RIBBON_W_ACTIVE : RIBBON_W_INACTIVE)
    );

    useEffect(() => {
      Animated.timing(widthAnim, {
        toValue: active ? RIBBON_W_ACTIVE : RIBBON_W_INACTIVE,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, [active, widthAnim]);

    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        hitSlop={6}
      >
        <Animated.View
          style={[
            styles.ribbonBody,
            { width: widthAnim },
            active ? styles.ribbonBodyActive : styles.ribbonBodyInactive,
          ]}
        >
          <Text
            style={[
              styles.ribbonText,
              styles.ribbonTextRight,
              active ? styles.ribbonTextActive : styles.ribbonTextInactive,
            ]}
          >
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  type PageItem = number | "ellipsis";

  function getPaginationRange(
    current: number,
    total: number,
    siblingCount = 1,
    boundaryCount = 1
  ): PageItem[] {
    const range = (s: number, e: number) =>
      Array.from({ length: e - s + 1 }, (_, i) => s + i);

    const totalNumbers = boundaryCount * 2 + siblingCount * 2 + 3;
    if (total <= totalNumbers) return range(1, total);

    const left = Math.max(current - siblingCount, boundaryCount + 2);
    const right = Math.min(current + siblingCount, total - boundaryCount - 1);

    const showLeftDots = left > boundaryCount + 2;
    const showRightDots = right < total - boundaryCount - 1;

    const leftBoundary = range(1, boundaryCount);
    const rightBoundary = range(total - boundaryCount + 1, total);
    const middle = range(left, right);

    if (!showLeftDots && showRightDots) {
      const leftRange = range(1, boundaryCount + siblingCount * 2 + 2);
      return [...leftRange, "ellipsis", ...rightBoundary];
    }
    if (showLeftDots && !showRightDots) {
      const rightRange = range(
        total - (boundaryCount + siblingCount * 2 + 1),
        total
      );
      return [...leftBoundary, "ellipsis", ...rightRange];
    }
    return [
      ...leftBoundary,
      "ellipsis",
      ...middle,
      "ellipsis",
      ...rightBoundary,
    ];
  }

  function DotsPager({
    page,
    totalPages,
    onJump,
  }: {
    page: number;
    totalPages: number;
    onJump: (p: number) => void;
  }) {
    const items = useMemo(
      () => getPaginationRange(page, totalPages, 1, 1),
      [page, totalPages]
    );
    const compact = totalPages > 5;

    if (!compact) {
      return (
        <View style={styles.dots}>
          {Array.from({ length: totalPages }).map((_, i) => {
            const idx = i + 1;
            const active = idx === page;
            return (
              <Pressable
                key={`dot-${idx}`}
                onPress={() => !active && onJump(idx)}
                style={[styles.dotBase, active ? styles.dotActive : styles.dot]}
              />
            );
          })}
        </View>
      );
    }

    return (
      <View style={styles.compactRow}>
        {items.map((it, i) =>
          it === "ellipsis" ? (
            <Text key={`el-${i}`} style={styles.ellipsisText}>
              …
            </Text>
          ) : (
            <Pressable
              key={`p-${it}`}
              onPress={() => onJump(it)}
              style={[styles.pageChip, it === page && styles.pageChipActive]}
            >
              <Text
                style={[
                  styles.pageChipText,
                  it === page && styles.pageChipTextActive,
                ]}
              >
                {it}
              </Text>
            </Pressable>
          )
        )}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.container}>
          <View style={styles.bookWrap}>
            <View style={StyleSheet.absoluteFillObject}>
              <Wordbank width="100%" height="100%" />
            </View>
            {/* gesture layer */}
            <View
              style={styles.gestureLayer}
              pointerEvents="box-only"
              {...panResponder.panHandlers}
            >
              <Pressable style={styles.leftTapZone} onPress={goPrev} />
              <Pressable style={styles.rightTapZone} onPress={goNext} />
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
                <>
                  {renderSide(data.left)}
                  {!lastOnRight && isLastPage && sinceIso && (
                    <Text style={styles.sinceText}>Since {fmt(sinceIso)}</Text>
                  )}
                </>
              ) : null}
            </View>

            {/* Right page */}
            <View style={styles.rightColumn}>
              {loading ? (
                <ActivityIndicator />
              ) : err ? (
                <Text style={styles.error} />
              ) : data ? (
                <>
                  {renderSide(data.right)}
                  {lastOnRight && isLastPage && sinceIso && (
                    <Text style={styles.sinceText}>Since {fmt(sinceIso)}</Text>
                  )}
                </>
              ) : null}
            </View>

            {/* SIDE NAV ARROWS */}
            <TouchableOpacity
              style={[
                styles.sideNav,
                styles.sideNavLeft,
                !canPrev && styles.navBtnDisabled,
              ]}
              onPress={goPrev}
              disabled={!canPrev}
            >
              <View style={styles.navBtn}>
                <ArrowLeft color="#5B6073" width={30} height={30} />
              </View>
            </TouchableOpacity>

            {/* RIGHT */}
            <TouchableOpacity
              style={[
                styles.sideNav,
                styles.sideNavRight,
                !canNext && styles.navBtnDisabled,
              ]}
              onPress={goNext}
              disabled={!canNext}
            >
              <View style={[styles.navBtn, styles.navIconRight]}>
                <ArrowLeft color="#5B6073" width={30} height={30} />
              </View>
            </TouchableOpacity>

            {/* Pager */}
            <View style={styles.footer}>
              <View style={[styles.footerCol, styles.footerColCenter]}>
                <DotsPager
                  page={page}
                  totalPages={data?.totalPages ?? 1}
                  onJump={(p) => setPage(p)}
                />
              </View>
            </View>
          </View>
        </View>
        {/* <MeaningTooltip
          visible={!!tipWord}
          word={tipWord}
          onClose={() => setTipWord(null)}
        /> */}
      </View>
    </Modal>
  );
}

const COL_LEFT = { top: 40, left: 70, width: 220 };
const COL_RIGHT = { top: 80, right: 5, width: 240 };

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Color.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    width: BOOK_W,
    height: BOOK_H,
  },
  bookWrap: {
    width: "100%",
    height: "100%",
  },
  gestureLayer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },
  leftTapZone: { flex: 1 },
  rightTapZone: { flex: 1 },
  bookmarkRailRight: {
    position: "absolute",
    right: -54,
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
  empty: { color: "#9aa0a6", fontSize: 18 },
  error: { color: "#c0392b", fontSize: 14 },
  footer: {
    position: "absolute",
    bottom: 78,
    left: 0,
    right: 0,
    flexDirection: "row",
  },
  footerCol: {
    flex: 1,
    alignItems: "center",
  },
  footerColCenter: {
    flex: 1.4,
    alignItems: "center",
  },
  sideNav: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Color.lightblue,
    zIndex: 5,
    top: "50%",
    transform: [{ translateY: -21 }],
    elevation: 3,
  },
  sideNavLeft: {
    left: 8,
  },
  sideNavRight: {
    right: 8,
  },
  navBtn: {},
  navIconRight: {
    transform: [{ rotate: "180deg" }],
  },
  navBtnDisabled: { opacity: 0.4 },
  dots: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 24,
  },
  dotBase: {
    width: 8,
    height: 8,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#c3c7cf" },
  dotActive: { backgroundColor: Color.gray },
  ribbonBody: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 2,
    position: "relative",
    overflow: "visible",
    backgroundColor: Color.white,
  },
  ribbonText: { ...Typography.header13, letterSpacing: 0.5 },
  ribbonTextActive: { color: Color.white },
  ribbonTextInactive: { color: Color.gray },
  ribbonTextRight: { width: "100%", textAlign: "right" },
  ribbonBodyActive: { backgroundColor: Color.pink },
  ribbonBodyInactive: {
    backgroundColor: Color.white,
    borderColor: "#d6d9e0",
    borderWidth: 1,
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginVertical: 4,
  },
  numCol: {
    minWidth: 50,
    textAlign: "center",
    marginRight: 4,
    fontWeight: "700",
    fontSize: 22,
    color: Color.gray,
  },
  wordText: { fontSize: 22, color: Color.gray },
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 24,
  },
  pageChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d3d7df",
    backgroundColor: Color.white,
  },
  pageChipActive: { backgroundColor: Color.gray },
  pageChipText: { fontSize: 12, color: Color.gray },
  pageChipTextActive: { color: Color.white, fontWeight: "700" },
  ellipsisText: { fontSize: 14, color: Color.gray, marginHorizontal: 4 },
  sinceText: {
    marginTop: 10,
    ...Typography.body13,
    fontStyle: "italic",
    color: Color.gray,
    alignSelf: "center",
  },
});
