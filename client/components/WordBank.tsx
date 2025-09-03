
// components/WordBankModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { fetchWordBankPage, type ApiOK } from "@/services/wordbankService";
import Wordbank from "@/assets/backgroundTheme/wordbankBook";

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Override base URL for Android emulator or device if needed */
  apiBase?: string;
};

export default function WordBankModal({ visible, onClose, apiBase }: Props) {
  const [page, setPage] = useState(1); // 1-based
  const [data, setData] = useState<ApiOK | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Reset when opened
  useEffect(() => {
    if (visible) {
      setPage(1);
      setData(null);
      setErr(null);
    }
  }, [visible]);

  // Fetch current page
  useEffect(() => {
    if (!visible) return;
    let canceled = false;

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const body = await fetchWordBankPage(page, apiBase);
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
  }, [visible, page, apiBase]);

  const canPrev = useMemo(() => (data ? page > 1 : false), [page, data]);
  const canNext = useMemo(
    () => (data ? page < data.totalPages : false),
    [page, data]
  );

  const renderSide = (items: ApiOK["left"]) => {
    if (!items || items.length === 0) {
      return <Text style={styles.empty}>—</Text>;
    }
    return items.map((it) => (
      <Text key={it.n} style={styles.line}>
        <Text style={styles.num}>{it.n}. </Text>
        {it.word}
      </Text>
    ));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Close */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Book */}
        <View style={styles.bookWrap}>
          <Wordbank />

          {/* Left page */}
          <View style={styles.leftColumn}>
            <Text style={styles.title}>List of Words</Text>
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
              onPress={() => canPrev && setPage((p) => p - 1)}
              disabled={!canPrev}
            >
              <Text style={styles.navText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.dots}>
              {Array.from({ length: Math.max(data?.totalPages || 1, 1) }).map((_, i) => {
                const idx = i + 1;
                const active = idx === page;
                return <View key={idx} style={[styles.dot, active && styles.dotActive]} />;
              })}
            </View>

            <TouchableOpacity
              style={[styles.navBtn, !canNext && styles.navBtnDisabled]}
              onPress={() => canNext && setPage((p) => p + 1)}
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

const COL_LEFT = {
  top: 95,
  left: 85,
  width: 220,
};
const COL_RIGHT = {
  top: 110,
  right: 95,
  width: 240,
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  bookWrap: {
    width: 574,
    height: 377,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 30,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  closeText: { fontSize: 18, fontWeight: "700", color: "#333" },

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
    bottom: 22,
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
  navBtnDisabled: {
    opacity: 0.4,
  },
  navText: { fontSize: 24, fontWeight: "700", color: "#5b6073" },
  dots: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#c3c7cf",
  },
  dotActive: { backgroundColor: "#5b6073" },
});