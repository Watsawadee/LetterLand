import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Typography } from "@/theme/Font";
import MarketHeaderBG from "@/assets/backgroundTheme/MarketHeaderBG";
import OneHint from "@/assets/icon/OneHint";
import ThreeHints from "@/assets/icon/ThreeHints";
import FiveHints from "@/assets/icon/FiveHints";
import Coin from "@/assets/icon/Coin";
import { Color } from "@/theme/Color";
import { getLoggedInUserId } from "@/utils/auth";
import { getUserData, purchaseHints } from "@/services/gameService";

type Pack = 1 | 3 | 5;

type HintShopModalProps = {
  visible: boolean;
  onClose: () => void;
  onPurchased?: (newHint: number, newCoin?: number) => void;
};

export default function HintShopModal({
  visible,
  onClose,
  onPurchased,
}: HintShopModalProps) {
  const [userId, setUserId] = useState<number | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const prices: Record<Pack, number> = { 1: 100, 3: 300, 5: 500 };

  const resolveUserId = useCallback(async (): Promise<number | null> => {
    const uidStr = await getLoggedInUserId();
    if (!uidStr) return null;
    const uid = Number(uidStr);
    return Number.isFinite(uid) ? uid : null;
  }, []);

  const fetchUserBalance = useCallback(async () => {
    try {
      setLoadError(null);
      setLoading(true);

      let uid = userId;
      if (!uid) {
        uid = await resolveUserId();
        if (!uid) throw new Error("Not signed in");
        setUserId(uid);
      }

      const user = await getUserData(uid);
      setBalance(user?.coin ?? 0);
    } catch (e) {
      setLoadError("Failed to load balance. Please sign in again.");
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [userId, resolveUserId]);

  useEffect(() => {
    if (visible) {
      setBuying(false);
      fetchUserBalance();
    }
  }, [visible, fetchUserBalance]);

  const handlePurchase = async (qty: Pack) => {
    if (!userId || buying) return;
    const price = prices[qty];
    if (balance < price) return;

    try {
      setBuying(true);
      const updated = await purchaseHints(userId, qty);
      const newCoin = updated?.coin ?? balance - price;
      const newHint = updated?.hint ?? 0;

      setBalance(newCoin);
      onPurchased?.(newHint, newCoin);
      onClose();
    } catch (e) {
    } finally {
      setBuying(false);
    }
  };

  const PackIcon = ({ qty }: { qty: Pack }) => {
    if (qty === 1) return <OneHint />;
    if (qty === 3) return <ThreeHints />;
    return <FiveHints />;
  };

  const Card = ({
    title,
    qty,
    price,
    disabled,
  }: {
    title: string;
    qty: Pack;
    price: number;
    disabled: boolean;
  }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.packIconWrap}>
        <PackIcon qty={qty} />
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.buyBtn, (disabled || buying) && styles.buyBtnDisabled]}
        onPress={() => handlePurchase(qty)}
        disabled={disabled || buying}
      >
        <Coin width={25} height={25} />
        <Text style={styles.buyText}>{price}</Text>
      </TouchableOpacity>

      {(disabled || buying) && (
        <Text style={styles.disabledNote}>
          {buying ? "Processing..." : "Not enough coins"}
        </Text>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!buying) onClose();
      }}
    >
      <Pressable
        style={styles.backdrop}
        onPress={() => {
          if (!buying) onClose();
        }}
      >
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            <MarketHeaderBG width={530} height={78} />
            <Pressable
              style={styles.closeBtn}
              onPress={() => {
                if (!buying) onClose();
              }}
              hitSlop={10}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>

            <View style={styles.balancePill}>
              <Coin width={30} height={30} />
              {loading ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text style={styles.balanceText}>{balance}</Text>
              )}
            </View>
          </View>

          <View style={styles.content}>
            {loadError ? (
              <Text
                style={{
                  ...Typography.body13,
                  color: Color.gray,
                  textAlign: "center",
                }}
              >
                {loadError}
              </Text>
            ) : (
              <>
                <View style={styles.row}>
                  <Card
                    title="One hint"
                    qty={1}
                    price={prices[1]}
                    disabled={balance < prices[1] || buying}
                  />
                  <Card
                    title="Three hints"
                    qty={3}
                    price={prices[3]}
                    disabled={balance < prices[3] || buying}
                  />
                </View>

                <View style={styles.rowCenter}>
                  <Card
                    title="Five hints"
                    qty={5}
                    price={prices[5]}
                    disabled={balance < prices[5] || buying}
                  />
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Color.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sheet: {
    width: 520,
    height: 600,
    maxWidth: 550,
    backgroundColor: Color.lightblue,
    borderRadius: 16,
    overflow: "hidden",
  },
  header: { position: "relative", width: "100%" },
  closeBtn: {
    position: "absolute",
    right: 10,
    top: 15,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    opacity: 1,
  },
  closeText: { fontSize: 40, lineHeight: 28, color: Color.white },
  balancePill: {
    position: "absolute",
    left: 12,
    top: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Color.white,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    shadowColor: Color.black,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  balanceText: { ...Typography.popupbody20, color: Color.gray },
  content: { padding: 18, paddingBottom: 20, gap: 16 },
  row: { flexDirection: "row", gap: 16, alignItems: "stretch" },
  rowCenter: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "center",
  },
  card: {
    flex: 1,
    minWidth: 160,
    backgroundColor: Color.white,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: Color.black,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: { ...Typography.header25, color: Color.gray, marginBottom: 12 },
  packIconWrap: {
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  buyBtn: {
    marginTop: 4,
    backgroundColor: Color.blue,
    borderRadius: 18,
    paddingHorizontal: 30,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    alignSelf: "center",
    shadowColor: Color.black,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  buyBtnDisabled: { backgroundColor: Color.gray },
  buyText: { ...Typography.header20, color: Color.white, marginLeft: 8 },
  disabledNote: { marginTop: 8, ...Typography.body13, color: Color.gray },
});
