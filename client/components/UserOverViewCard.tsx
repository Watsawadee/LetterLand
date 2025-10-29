// components/UserOverviewCard.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Image, Platform, useWindowDimensions, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect, usePathname } from "expo-router";
import { Button, Card, Dialog, IconButton, Portal, ProgressBar, Text } from "react-native-paper";
import { useQueryClient } from "@tanstack/react-query";
import { VictoryPie } from "victory-native";
import { getLoggedInUserId } from "@/utils/auth";
import { useUserProfile } from "@/hooks/useGetUserProfile";
import { useUserProgress } from "@/hooks/useDashboard"; // ✅ add this import
import coinIcon from "../assets/images/coin.png";
import SettingIcon from "@/assets/icon/settingIcon";
import { Color } from "@/theme/Color";
import { Typography } from "@/theme/Font";
import CloseIcon from "@/assets/icon/CloseIcon";
import InfoIcon from "@/assets/icon/infoIcon";
import GameTypeBackground from "@/assets/backgroundTheme/GameTypeBackground";
import GameTypeGrid from "@/assets/icon/GameTypeGrid";
import GameTypeCard from "./GameTypeModal";
import CreateGameModal from "./CreateGameModal";
import { Magnify } from "@/assets/icon/Magnify";
import Dashboard from "@/assets/icon/Dashboard";
import Explore from "@/assets/icon/ExploreIcon";
import ExploreIcon from "@/assets/icon/ExploreIcon";

type Props = {
  coins?: number;
  hint?: number;
  onOpenSettings?: () => void;
};

const SP = 16; // base spacing

const UserOverviewCard = ({ coins, hint, onOpenSettings }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;

  const dialogWidth = Math.min(isTablet ? 560 : width - SP * 2, width - SP * 2);
  const dialogMaxHeight = Math.min(680, height - SP * 4);
  const levelColors: Record<string, string> = {
    A1: Color.A1,
    A2: Color.A2,
    B1: Color.B1,
    B2: Color.B2,
    C1: Color.C1,
    C2: Color.C2,
  };

  const [userId, setUserId] = useState<string | null>(null);
  const [gameType, setGameType] = useState<"crossword" | "wordsearch" | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [infoDialogVisible, setInfoDialogVisible] = useState(false);
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);

  const { data: userProgress, isLoading: loadingProgress, refetch: refetchProgress } = useUserProgress();
  const { data: user, isLoading, refetch: refetchUser } = useUserProfile();

  const pathname = usePathname();
  const onDashboard = (pathname ?? "").toLowerCase() === "/dashboard";

  useFocusEffect(
    useCallback(() => {
      refetchUser();
      refetchProgress();
    }, [refetchUser, refetchProgress])
  );

  useEffect(() => {
    const fetchId = async () => setUserId(await getLoggedInUserId());
    fetchId();
  }, []);

  if (!userId || isLoading || !user) return (<View style={{ flexDirection: "column", height: "100%", justifyContent: "center" }}>
    <ActivityIndicator color={Color.gray} />
    <Text style={{ textAlign: "center", color: Color.gray }}>...Loading</Text>
  </View>)
  if ("error" in user) return <Text>Failed to load user data.</Text>;

  const handleSelect = (type: "crossword" | "wordsearch") => {
    setGameType(type);
    setDialogVisible(false);
    setShowCreateGame(true);
  };

  const gameOptions = [
    { type: "crossword", question: "Q. What is mammal?", label: "Crossword search" },
    { type: "wordsearch", question: "Q. Cat", label: "Word search" },
  ] as const;

  return (
    <Card
      style={{
        flex: 1,
        width: "100%",
        maxWidth: 720,
        alignSelf: "center",
        paddingRight: 30,
        paddingLeft: 30,
        paddingTop: 25,
        paddingBottom: 30,
        borderRadius: 24,
        backgroundColor: "white",
      }}
    >
      <View style={{ flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
        <View style={{ flexDirection: "column", gap: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text variant="titleLarge" style={{ fontWeight: "700", fontSize: 28, color: "#2D3142", marginTop: 9 }}>
              {user.username.charAt(0).toUpperCase() + user.username.slice(1).toLowerCase()}
            </Text>
            <Button
              onPress={onOpenSettings}
              contentStyle={{ padding: 8 }}
              style={{ width: undefined, minWidth: 0, padding: 0, borderRadius: 50 }}
              theme={{ roundness: 1 }}
              rippleColor="transparent"
              compact
              icon={({ size }) => <SettingIcon width={24} height={24} fill="#2D3142" />}
            >
              {""}
            </Button>
          </View>

          {/* Stats row */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
            {/* Coins */}
            <View
              style={{
                flex: 1,
                backgroundColor: "#FFF",
                padding: 14,
                borderRadius: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Image source={coinIcon} style={{ width: 27, height: 27, marginRight: 8 }} />
              <View>
                <Text style={{ color: "#F9C23C", fontWeight: "800", fontSize: 14 }}>
                  {typeof coins === "number" ? coins : user.coin}
                </Text>
                <Text style={{ color: "#C0C0C0", fontSize: 12, fontWeight: "500" }}>Coins</Text>
              </View>
            </View>

            {/* Hints */}
            <View
              style={{
                flex: 1,
                backgroundColor: "#FFF",
                padding: 14,
                borderRadius: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View style={{ marginRight: 8 }}>
                <Magnify width={30} height={30} />
              </View>
              <View>
                <Text style={{ color: "#4A5568", fontWeight: "900", fontSize: 20 }}>
                  {typeof hint === "number" ? hint : user.hint || 0}
                </Text>
                <Text style={{ color: "#C0C0C0", fontSize: 12, fontWeight: "500" }}>Hints</Text>
              </View>
            </View>

            {/* Solved */}
            <View
              style={{
                flex: 1,
                backgroundColor: "#FFF",
                padding: 14,
                paddingBottom: 10,
                borderRadius: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View style={{ width: 36, height: 36, marginRight: 2 }}>
                <View style={{ flexDirection: "row", marginBottom: 2 }}>
                  <View
                    style={{
                      width: 14,
                      height: 14,
                      backgroundColor: "#D9D9D9",
                      borderRadius: 4,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 2,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "900", fontSize: 10 }}>O</Text>
                  </View>
                  <View
                    style={{
                      width: 14,
                      height: 14,
                      backgroundColor: "#FAE269",
                      borderRadius: 4,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#F9C23C", fontWeight: "900", fontSize: 10 }}>V</Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      width: 14,
                      height: 14,
                      backgroundColor: "#FAE269",
                      borderRadius: 4,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 2,
                    }}
                  >
                    <Text style={{ color: "#F9C23C", fontWeight: "900", fontSize: 10 }}>U</Text>
                  </View>
                  <View
                    style={{
                      width: 14,
                      height: 14,
                      backgroundColor: "#D9D9D9",
                      borderRadius: 4,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "900", fontSize: 10 }}>X</Text>
                  </View>
                </View>
              </View>
              <View>
                <Text style={{ color: "#4A5568", fontWeight: "900", fontSize: 20 }}>
                  {user.completedGames || 0}
                </Text>
                <Text style={{ color: "#C0C0C0", fontSize: 10, fontWeight: "500" }}>Solved</Text>
              </View>
            </View>
          </View>

          {/* Level progress (whole block is clickable) */}
          <Pressable
            onPress={() => setShowProgressDialog(true)}
            accessibilityRole="button"
            accessibilityLabel="Open level progress details"
            android_ripple={{ color: "#00000010", borderless: false }}
            style={{
              backgroundColor: "#ffffff",
              padding: 20,
              borderRadius: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 24, marginRight: 12 }}>📖</Text>
                <View>
                  <Text style={{ fontWeight: "700", fontSize: 16, color: "#2D3142" }}>
                    Level Progress
                  </Text>
                  <Text style={{ fontSize: 12, color: "#8B8D98" }}>Keep playing to level up!</Text>
                </View>
              </View>

              <View
                style={{
                  backgroundColor: (() => {
                    const levelColors = {
                      A1: "#F2B9DD",
                      A2: "#FB7FC7",
                      B1: "#F19DB8",
                      B2: "#FB6C97",
                      C1: "#C8A8E0",
                      C2: "#AE7EDF",
                    };
                    return levelColors[user.englishLevel] || "#FFE5F0";
                  })(),
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text style={{ fontWeight: "700", fontSize: 14, color: "#FFFFFF" }}>
                  {user.englishLevel}
                </Text>
              </View>
            </View>

            <ProgressBar
              progress={Math.min((user?.progressPercent ?? 0) / 100, 1)}
              color={levelColors[user.englishLevel] || Color.green}
              style={{
                height: 12,
                borderRadius: 999,
                backgroundColor: "#E7E6E6",
                overflow: "hidden",
              }}
            />
          </Pressable>

          {/* Dashboard */}
          <View
            style={{
              backgroundColor: Color.A1 + "30",
              padding: 20,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: Color.A1,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Dashboard />
              <Text style={{ fontSize: 14, color: "#2D3142", flex: 1, lineHeight: 20, marginLeft: 15 }}>
                Access all your stats and updates in the dashboard.
              </Text>
            </View>
            <Button
              mode="contained"
              style={{ backgroundColor: Color.A1, borderRadius: 16 }}
              contentStyle={{ height: 48 }}
              labelStyle={{ fontSize: 15, fontWeight: "700", color: "#FFF" }}
              onPress={onDashboard ? undefined : () => router.push("/Dashboard")}
            >
              View Dashboard →
            </Button>
          </View>

          {/* Explore */}
          <View
            style={{
              backgroundColor: Color.lightgreen + "30",
              padding: 20,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: Color.lightgreen,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <ExploreIcon />
              <Text style={{ fontSize: 14, color: "#2D3142", flex: 1, lineHeight: 20, marginLeft: 15 }}>
                Explore and solve puzzles from the community
              </Text>
            </View>
            <Button
              mode="contained"
              style={{ backgroundColor: Color.lightgreen, borderRadius: 16 }}
              contentStyle={{ height: 48 }}
              labelStyle={{ fontSize: 15, fontWeight: "700", color: "#FFF" }}
              onPress={() => router.replace("/Publicboard")}
            >
              Explore other game →
            </Button>
          </View>
        </View>

        {/* Create Puzzle Button at bottom */}
        <View style={{ marginTop: 20 }}>
          <Button
            mode="contained"
            style={{ backgroundColor: "#4F9CF9", borderRadius: 20 }}
            contentStyle={{ height: 64, flexDirection: "row", alignItems: "center" }}
            labelStyle={{ fontSize: 18, fontWeight: "700", color: "#FFF" }}
            icon={() => (
              <View style={{ width: 36, height: 36, marginRight: 8, transform: [{ rotate: "-8deg" }] }}>
                <View style={{ flexDirection: "row", marginBottom: 2 }}>
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      backgroundColor: "#B5B5B5",
                      borderRadius: 4,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 2,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "900", fontSize: 10 }}>O</Text>
                  </View>
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      backgroundColor: "#FAE269",
                      borderRadius: 4,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#F9C23C", fontWeight: "900", fontSize: 10 }}>V</Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      backgroundColor: "#FAE269",
                      borderRadius: 4,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 2,
                    }}
                  >
                    <Text style={{ color: "#F9C23C", fontWeight: "900", fontSize: 10 }}>U</Text>
                  </View>
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      backgroundColor: "#B5B5B5",
                      borderRadius: 4,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "900", fontSize: 10 }}>X</Text>
                  </View>
                </View>
              </View>
            )}
            onPress={() => setDialogVisible(true)}
          >
            Create Puzzle
          </Button>
        </View>
      </View>

      {/* Game Type Dialogs */}
      <Portal>
        <Dialog
          visible={dialogVisible && !infoDialogVisible}
          dismissable={!infoDialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={{ backgroundColor: Color.white, width: "50%", alignSelf: "center", height: "50%" }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingRight: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Dialog.Title style={{ fontWeight: "800", color: Color.gray }}>Game Types Selection</Dialog.Title>
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
              onPress={() => setDialogVisible(false)}
              style={{ margin: 0 }}
              accessibilityLabel="Close dialog"
            />
          </View>
          <Dialog.Content>
            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 16, height: "75%" }}>
              {gameOptions.map(({ type, question, label }) => (
                <GameTypeCard
                  key={type}
                  question={question}
                  gameType={label}
                  selected={gameType === type}
                  onPress={() => handleSelect(type)}
                />
              ))}
            </View>
          </Dialog.Content>
        </Dialog>

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
          <View style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "50%", zIndex: 0 }}>
            <GameTypeBackground pointerEvents="none" style={{ width: "100%", height: "100%" }} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 5 }}>
            <Dialog.Title style={{ fontWeight: "800", color: Color.gray }}>Game Type</Dialog.Title>
            <IconButton
              icon={(p) => <CloseIcon width={18} height={18} fillColor={Color.gray} {...p} />}
              onPress={() => setInfoDialogVisible(false)}
              style={{ margin: 0 }}
              accessibilityLabel="Close dialog"
            />
          </View>
          <Dialog.Content>
            <View style={{ flexDirection: "column", justifyContent: "space-between", height: "93%" }}>
              <View style={{ flexDirection: "column" }}>
                <Text style={{ fontWeight: "800", fontSize: Typography.header20.fontSize, color: Color.gray }}>Crossword search</Text>
                <View style={{ flexDirection: "column", gap: 20 }}>
                  <View style={{ flexDirection: "row", backgroundColor: "#AEAEAE", padding: 15, borderRadius: 16, gap: 20 }}>
                    <GameTypeGrid emptyColor="#FFFF" />
                    <View style={{ flexDirection: "column", justifyContent: "space-around" }}>
                      <Text style={{ fontSize: Typography.body13.fontSize, color: Color.white }}>Q. What pet purrs?</Text>
                      <Text style={{ fontSize: Typography.body13.fontSize, color: Color.white }}>Q. What pet barks?</Text>
                      <Text style={{ fontSize: Typography.body13.fontSize, color: Color.white }}>Q. What gives milk?</Text>
                      <Text style={{ fontSize: Typography.body13.fontSize, color: Color.white }}>Q. What makes honey?</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 15, color: Color.gray, fontWeight: "bold", width: "95%" }}>
                    A puzzle where words are hidden in a grid of random letters, and you must find and circle them and the question is in form of sentence
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "column" }}>
                <Text style={{ fontWeight: "800", fontSize: Typography.header20.fontSize, color: Color.white }}>Word Search</Text>
                <View style={{ flexDirection: "column", gap: 20 }}>
                  <View style={{ flexDirection: "row", backgroundColor: Color.white, padding: 15, borderRadius: 16, gap: 20 }}>
                    <GameTypeGrid emptyColor="#AEAEAE" />
                    <View style={{ flexDirection: "column", justifyContent: "space-around" }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-around", width: "80%" }}>
                        <View style={{ backgroundColor: "#AEAEAE", width: "40%", padding: 10, justifyContent: "center", alignItems: "center", borderRadius: 24 }}>
                          <Text style={{ fontSize: 15, color: Color.white, fontWeight: "bold" }}>Dog</Text>
                        </View>
                        <View style={{ backgroundColor: "#AEAEAE", width: "40%", padding: 10, justifyContent: "center", alignItems: "center", borderRadius: 24 }}>
                          <Text style={{ fontSize: 15, color: Color.white, fontWeight: "bold" }}>Bee</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-around", width: "80%" }}>
                        <View style={{ backgroundColor: "#AEAEAE", width: "40%", padding: 10, justifyContent: "center", alignItems: "center", borderRadius: 24 }}>
                          <Text style={{ fontSize: 15, color: Color.white, fontWeight: "bold" }}>Cat</Text>
                        </View>
                        <View style={{ backgroundColor: "#AEAEAE", width: "40%", padding: 10, justifyContent: "center", alignItems: "center", borderRadius: 24 }}>
                          <Text style={{ fontSize: 15, color: Color.white, fontWeight: "bold" }}>Cow</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: "bold", color: Color.white, width: "95%" }}>
                    A puzzle where words are hidden in a grid of random letters, and you must find and circle them. The list of words to find is usually given, not as clues in sentence form.
                  </Text>
                </View>
              </View>
            </View>
          </Dialog.Content>
        </Dialog>

        {/* Progress Dialog */}
        <Dialog
          visible={showProgressDialog}
          onDismiss={() => setShowProgressDialog(false)}
          style={{
            borderRadius: 16,
            width: dialogWidth,
            maxHeight: dialogMaxHeight,
            alignSelf: "center",
            backgroundColor: "#FFFFFF",
          }}
        >
          <View style={{ paddingHorizontal: 29, paddingTop: 10, paddingBottom: 4 }}>
            <Text style={{
              fontSize: 25,
              fontWeight: "700",
              color: Color.black,
              marginBottom: 5,
              marginLeft: 19,
            }}>
              User Current Progress
            </Text>
          </View>

          <Dialog.ScrollArea style={{ borderTopWidth: 0, borderBottomWidth: 0 }}>
            <View style={{ paddingHorizontal: 29, paddingBottom: 15 }}>
              {loadingProgress ? (
                <ActivityIndicator />
              ) : userProgress ? (
                <>
                  <View style={{ alignItems: "center", justifyContent: "center" }}>
                    <View style={{ width: 250, height: 250 }}>
                      <VictoryPie
                        data={[
                          { x: "Progress", y: userProgress.donut.filled },
                          { x: "Remaining", y: userProgress.donut.remaining },
                        ]}
                        width={250}
                        height={250}
                        colorScale={[Color.green, "#EAEAEA"]}
                        innerRadius={70}
                        cornerRadius={5}
                        labels={() => null}
                        padding={45}
                      />
                      <View style={[StyleSheet.absoluteFillObject, styles.centered]}>
                        <Text style={{ fontSize: 25, fontWeight: "bold", color: Color.gray, textAlign: "center" }}>
                          {Number.isInteger(userProgress.donut.filled) ? userProgress.donut.filled.toFixed(0) : userProgress.donut.filled.toFixed(1)}%
                        </Text>
                        <Text style={{ color: Color.gray, fontSize: 16, textAlign: "center", fontWeight: "500" }}>
                          {userProgress.englishLevel}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={{ minWidth: "70%", gap: 19, marginTop: 16 }}>
                    {userProgress.summary.map((line: string, idx: number) => (
                      <Card
                        key={idx}
                        mode="elevated"
                        style={{
                          backgroundColor: "#F8FBFF",
                          borderRadius: 14,
                          paddingVertical: 10,
                          paddingHorizontal: 15,
                          elevation: 2,
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <View
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              backgroundColor: "#FFE58B",
                              justifyContent: "center",
                              alignItems: "center",
                              marginRight: 12,
                            }}
                          >
                            <Text style={{ color: "#A67C00", fontWeight: "bold", fontSize: 18 }}>!</Text>
                          </View>
                          <Text
                            style={{
                              flexShrink: 1,
                              color: Color.blue,
                              fontSize: Typography.body16.fontSize,
                              fontWeight: "500",
                              lineHeight: 22,
                            }}
                          >
                            {line}
                          </Text>
                        </View>
                      </Card>
                    ))}
                  </View>
                </>
              ) : (
                <Text style={{ color: Color.gray }}>No progress data available</Text>
              )}
            </View>
          </Dialog.ScrollArea>
        </Dialog>
      </Portal>

      <CreateGameModal
        visible={showCreateGame}
        onClose={() => setShowCreateGame(false)}
        gameType={gameType === "wordsearch" ? "WORD_SEARCH" : "CROSSWORD_SEARCH"}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default UserOverviewCard;