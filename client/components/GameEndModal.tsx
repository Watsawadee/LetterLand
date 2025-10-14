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
import ClockTimer from "@/assets/icon/ClockTimer";
import WordLearned from "@/assets/icon/WordLearned";
import { Typography } from "@/theme/Font";
import ExcellentComplete from "@/assets/backgroundTheme/ExcellentComplete";
import DontGiveUpNotComplete from "@/assets/backgroundTheme/DontGiveUpNotComplete";
import PinkTape from "@/assets/icon/PinkTape";
import BlueTape from "@/assets/icon/BlueTape";

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

  extraWordsCount?: number | null;
  alreadyFinished?: boolean;
  extraCoinsEarnedThisRun?: number;

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

function getStatCardColor(type: "timer" | "coin" | "word") {
  switch (type) {
    case "timer":
      return { borderColor: "rgba(88, 167, 248, 0.7)" };
    case "coin":
      return { borderColor: "rgba(113, 203, 134, 0.7)" };
    case "word":
      return { borderColor: "rgba(239, 137, 196, 0.7)" };
  }
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

    extraWordsCount,
    alreadyFinished = false,
    extraCoinsEarnedThisRun = 0,

    onRestart,
    onContinue,
    restartIcon,
    continueIcon,
    restartIconStyle,
    continueIconStyle,

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

  const baseCoins = Number(coinsEarned ?? 0);
  const extraCoins = Math.max(0, Number(extraCoinsEarnedThisRun ?? 0));
  const baseLearned = Number(wordsLearned ?? 0);
  const extraLearned = Math.max(0, Number(extraWordsCount ?? 0));

  const showCoinsBreakdown = extraCoins > 0;
  const showLearnedBreakdown = extraLearned > 0;
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
                  <View style={styles.cardWrap}>
                    <View style={[styles.statCard, getStatCardColor("timer")]}>
                      <View style={styles.topRow}>
                        <ClockTimer />
                        <Text style={styles.statValue}>
                          {mmss(timeUsedSeconds)}
                        </Text>
                      </View>
                      <Text style={styles.statLabel}>Time you have taken</Text>
                    </View>
                    <View
                      style={styles.blueTapeBottomLeft}
                      pointerEvents="none"
                    >
                      <BlueTape />
                    </View>
                  </View>
                )}

                <View style={styles.cardWrap}>
                  <View style={[styles.statCard, getStatCardColor("coin")]}>
                    <View style={styles.topRow}>
                      <Coin />
                      <Text style={styles.statValue}>
                        {baseCoins}
                        {showCoinsBreakdown && (
                          <Text style={[styles.inlineBonus, styles.coinsColor]}>
                            {" "}
                            (+{extraCoins})
                          </Text>
                        )}
                      </Text>
                    </View>
                    <Text style={styles.statLabel}>Coins Earn</Text>
                    {showCoinsBreakdown ? (
                      <Text style={[styles.statSub, styles.coinsColor]}>
                        +{extraCoins} from extra word{extraCoins > 1 ? "s" : ""}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.cardWrap}>
                  <View style={[styles.statCard, getStatCardColor("word")]}>
                    <View style={styles.pinkTapeTopRight} pointerEvents="none">
                      <PinkTape />
                    </View>
                    <View style={styles.topRow}>
                      <WordLearned />
                      <Text style={styles.statValue}>
                        {baseLearned}
                        {showLearnedBreakdown && (
                          <Text style={[styles.inlineBonus, styles.wordsColor]}>
                            {" "}
                            (+{extraLearned})
                          </Text>
                        )}
                      </Text>
                    </View>
                    <Text style={styles.statLabel}>Word learned</Text>
                    {showLearnedBreakdown ? (
                      <Text style={[styles.statSub, styles.wordsColor]}>
                        +{extraLearned} from extra word
                        {extraLearned > 1 ? "s" : ""}
                      </Text>
                    ) : null}
                  </View>
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
    backgroundColor: Color.overlay,
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
    color: Color.gray,
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
  cardWrap: {
    position: "relative",
    width: "31%",
    alignItems: "stretch",
    overflow: "visible",
  },
  statCard: {
    // width: "31%",
    position: "relative",
    height: 150,
    backgroundColor: Color.white,
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "space-around",
    elevation: 4,
    shadowColor: Color.black,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  topRow: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 6,
  },
  statValue: {
    ...Typography.header25,
    textAlign: "center",
  },
  statLabel: {
    ...Typography.header16,
    color: Color.gray,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    width: "100%",
    marginTop: 12,
  },
  inlineBonus: {
    ...Typography.header25,
    opacity: 0.9,
  },
  statSub: {
    ...Typography.body13,
    marginTop: 6,
  },
  coinsColor: { color: Color.green },
  wordsColor: { color: Color.pink },
  pinkTapeTopRight: {
    position: "absolute",
    top: -15,
    right: -33,
    transform: [{ rotate: "20deg" }],
    zIndex: 10,
    elevation: 8,
  },
  blueTapeBottomLeft: {
    position: "absolute",
    bottom: -28,
    left: -28,
    zIndex: 10,
    elevation: 8,
  },
});
