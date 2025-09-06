import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { CustomButton } from "../theme/ButtonCustom";
import { Color } from "@/theme/Color";
import Coin from "@/assets/icon/Coin";
import Timer from "@/assets/icon/Timer";
import WordLearned from "@/assets/icon/WordLearned";
import { Typography } from "@/theme/Font";
import ExcellentComplete from "@/assets/backgroundTheme/ExcellentComplete";
import DontGiveUpNotComplete from "@/assets/backgroundTheme/DontGiveUpNotComplete";

type Variant = "success" | "timeout";

interface GameEndModalProps {
  visible: boolean;

  // visual state
  variant: Variant;
  hasTimer?: boolean;

  // content
  subtitle?: string;
  timeUsedSeconds?: number | null;
  coinsEarned?: number | null;
  wordsLearned?: number | null;

  // actions
  onRestart?: () => void;
  onContinue?: () => void;
  restartText?: string;
  continueText?: string;

  // icons
  restartIcon?: React.ReactNode;
  continueIcon?: React.ReactNode;
  restartIconStyle?: StyleProp<ViewStyle>;
  continueIconStyle?: StyleProp<ViewStyle>;

  // backward-compat
  onConfirm?: () => void;
  onClose?: () => void;
  confirmText?: string;
  closeText?: string;
  confirmIcon?: React.ReactNode;
  closeIcon?: React.ReactNode;
  confirmIconStyle?: StyleProp<ViewStyle>;
  closeIconStyle?: StyleProp<ViewStyle>;
}

function mmss(total?: number | null) {
  const s = Math.max(0, Math.floor(total ?? 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  const mm = String(m);
  const ss = r < 10 ? `0${r}` : String(r);
  return `${mm}:${ss}`;
}

export default function GameEndModal(props: GameEndModalProps) {
  const {
    visible,
    variant,
    hasTimer,
    subtitle,

    timeUsedSeconds,
    coinsEarned,
    wordsLearned,

    onRestart,
    onContinue,
    restartIcon,
    continueIcon,
    restartIconStyle,
    continueIconStyle,

    // legacy support
    onConfirm,
    onClose,
    confirmIcon,
    closeIcon,
    confirmIconStyle,
    closeIconStyle,
  } = props;

  const leftHandler = onRestart ?? onConfirm;
  const rightHandler = onContinue ?? onClose;
  const leftIcon = restartIcon ?? confirmIcon;
  const rightIcon = continueIcon ?? closeIcon;
  const leftIconStyleFinal = restartIconStyle ?? confirmIconStyle;
  const rightIconStyleFinal = continueIconStyle ?? closeIconStyle;

  const showTimeCard = variant === "success" && !!hasTimer;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {variant === "success" ? (
            <>
              <View style={styles.icon}>
                <ExcellentComplete />
              </View>

              <Text style={styles.subtitle}>
                {subtitle ??
                  (hasTimer
                    ? "You have completed on time"
                    : "You have found all the words")}
              </Text>

              <View style={styles.statsRow}>
                {showTimeCard && (
                  <View style={styles.statCard}>
                    <View style={styles.topRow}>
                      <Timer size={35} />
                      <Text style={styles.statValue}>
                        {mmss(timeUsedSeconds)}
                      </Text>
                    </View>
                    <Text style={styles.statLabel}>Time you have taken</Text>
                  </View>
                )}

                <View style={styles.statCard}>
                  <View style={styles.topRow}>
                    <Coin />
                    <Text style={styles.statValue}>
                      {typeof coinsEarned === "number"
                        ? `+${coinsEarned}`
                        : "-"}
                    </Text>
                  </View>
                  <Text style={styles.statLabel}>Coins Earn</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={styles.topRow}>
                    <WordLearned />
                    <Text style={styles.statValue}>
                      {typeof wordsLearned === "number" ? wordsLearned : 0}
                    </Text>
                  </View>
                  <Text style={styles.statLabel}>New word learned</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <DontGiveUpNotComplete />
              <Text style={styles.subtitle}>
                You didn’t quite make it this time, but don’t worry you’re
                almost there!
              </Text>
            </>
          )}

          <View style={styles.buttonRow}>
            {leftHandler && (
              <CustomButton
                type="small"
                onPress={leftHandler}
                icon={leftIcon}
                iconStyle={leftIconStyleFinal}
                customStyle={{ justifyContent: "center", alignItems: "center" }}
              />
            )}

            {rightHandler && (
              <CustomButton
                type="small"
                onPress={rightHandler}
                icon={rightIcon}
                iconStyle={rightIconStyleFinal}
                customStyle={{ justifyContent: "center", alignItems: "center" }}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modal: {
    backgroundColor: Color.lightblue,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: "51%",
    alignItems: "center",
  },
  icon: {
    paddingBottom: 15,
  },
  subtitle: {
    ...Typography.header25,
    color: "#3B3B3B",
    marginBottom: 20,
    textAlign: "center",
    textOverflow: "wrapup",
  },
  statsRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  statCard: {
    width: "31%",
    backgroundColor: Color.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: Color.black,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 6,
  },
  statValue: {
    ...Typography.header25,
    textAlign: "center",
  },
  statLabel: {
    ...Typography.body16,
    color: Color.grey,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    width: "100%",
    marginTop: 12,
  },
});
