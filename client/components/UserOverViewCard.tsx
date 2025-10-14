import { View, Image, Platform, Pressable } from "react-native";
import { useRouter } from "expo-router";
import GameTypeCard from "./GameTypeModal";
import { useEffect, useState } from "react";
import { getLoggedInUserId } from "@/utils/auth";
import { useUserProfile } from "@/hooks/useGetUserProfile";
import coinIcon from "../assets/images/coin.png"
import Explore from "../assets/images/Explore.png"
import { Button, Card, Dialog, IconButton, Portal, ProgressBar, Text } from "react-native-paper";
import mascot from "@/assets/images/mascot.png";
import SettingIcon from "@/assets/icon/settingIcon";
import { Color } from "@/theme/Color";
import { Typography } from "@/theme/Font";
import * as SecureStore from "expo-secure-store";
import CloseIcon from "@/assets/icon/CloseIcon";
import InfoIcon from "@/assets/icon/infoIcon";
import { ImageBackground } from "expo-image";
import GardenBackground from "@/assets/backgroundTheme/GardenBackground";
import GameTypeBackground from "@/assets/backgroundTheme/GameTypeBackground";
import GameTypeGrid from "@/assets/icon/GameTypeGrid";
import { useQueryClient } from "@tanstack/react-query";
import CreateGameModal from "./CreateGameModal";

type Props = {
  coins?: number;
  onOpenSettings?: () => void;
};
const UserOverviewCard = ({ coins, onOpenSettings }: Props) => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [gameType, setGameType] = useState<"crossword" | "wordsearch" | null>(
    null
  );
  const [dialogVisible, setDialogVisible] = useState(false);

  const [infoDialogVisible, setInfoDialogVisible] = useState(false);
  const [showCreateGame, setShowCreateGame] = useState(false);
  const queryClient = useQueryClient();



  useEffect(() => {
    const fetchId = async () => {
      const id = await getLoggedInUserId();
      setUserId(id);
    };
    fetchId();
  }, []);

  const { data: user, isLoading } = useUserProfile();

  if (!userId || isLoading || !user) return <Text>Loading...</Text>;
  if ("error" in user) return <Text>Failed to load user data.</Text>;

  const handleSelect = (type: "crossword" | "wordsearch") => {
    setGameType(type);
    setDialogVisible(false);
    setShowCreateGame(true);

    // if (!userId) return;

    // router.push({
    //   pathname: "/CreateGame",
    //   params: {
    //     gameType: type === "wordsearch" ? "WORD_SEARCH" : "CROSSWORD_SEARCH"
    //   },
    // });
  };


  const gameOptions = [
    {
      type: "crossword",
      question: "Q. What is mammal?",
      label: "Crossword search",
    },
    {
      type: "wordsearch",
      question: "Q. Cat",
      label: "Word search",
    },
  ] as const;

  return (
    <Card
      style={{
        padding: 16,
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 16,
        gap: 20,
        minWidth: "30%",
        height: "100%",
      }}
    >
      <View style={{ display: "flex", flexDirection: "column", gap: "25%" }}>
        <View style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignContent: "center", gap: 5 }}>
            <View style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <Text
                variant="titleMedium" style={{ fontWeight: Typography.header20.fontWeight, fontSize: Typography.header20.fontSize, color: Color.gray, display: "flex", alignContent: "flex-start" }}
              >
                {user.username}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Image source={coinIcon} style={{ width: 30, height: 30, }} />
                <Text style={{ color: "#F9C23C", fontWeight: "900", fontSize: Typography.header16.fontSize }}>{typeof coins === "number" ? coins : user.coin}</Text>
              </View>
            </View>
            <Button
              onPress={onOpenSettings}
              contentStyle={{ padding: 0 }}
              style={{ width: undefined, minWidth: 0, padding: 0, borderRadius: 50 }}
              theme={{ roundness: 1 }}
              rippleColor="transparent"
              compact
              icon={({ size }) => (
                <SettingIcon width={size} height={size} fill={Color.gray} />
              )}
            >
              {""}
            </Button>
          </View>
          <View style={{ alignItems: "center" }}>
            {/*Dashboard*/}
            <View style={{
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
              padding: 20,
              borderColor: "#5B6073",
              borderRadius: 20,
              borderWidth: 1,
              width: "100%"
            }}>
              <View style={{ display: "flex", flexDirection: "column", minWidth: "20%" }} onTouchStart={() => {
                router.push("/Dashboard")
              }}>
                <Text style={{ fontWeight: "700", color: Color.gray }} >Dashboard</Text>

                <Text variant="bodyMedium" style={{ color: Color.gray }}>Access all your stats and updates in {"\n"} the dashboard.</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                  }}
                >
                  {/* Level badge */}
                  <View
                    style={{
                      backgroundColor: Color.pink,
                      padding: 6,
                      borderRadius: 10,
                      width: "15%",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontWeight: "500", color: Color.gray, textAlign: "center" }}>
                      {user.englishLevel}
                    </Text>
                  </View>

                  {/* Progress bar */}
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "column",
                      justifyContent: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                    }}
                  >
                    <ProgressBar
                      progress={Math.min((user?.progressPercent ?? 0) / 100, 1)}
                      color={Color.pink}

                      style={{
                        height: 18,
                        borderRadius: 999,
                        backgroundColor: Color.white,
                        overflow: "hidden",
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={{
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
              padding: 20,
              borderColor: "#5B6073",
              borderRadius: 20,
              borderWidth: 1,
              width: "100%"
            }}>
              <View style={{ display: "flex", flexDirection: "row" }}>
                <Image source={Explore} style={{ width: 45, height: 40 }} />

                <Text variant="bodyMedium" style={{ color: Color.gray }}>Explore and solve puzzles{"\n"}from the community.</Text>
              </View>
              <Button mode="contained" style={{ backgroundColor: Color.green }} onPress={() => { router.replace("/Publicboard") }}>
                <Text style={{ color: Color.white, fontWeight: "bold" }}>Explore other game</Text>
              </Button>
            </View>
          </View>
        </View>

        <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", alignItems: "center" }}>
          <Button
            mode="contained"
            style={{
              backgroundColor: Color.blue,
              borderRadius: 25,
              marginTop: 12,
              alignItems: "center"
            }}
            contentStyle={{
              height: 80,
            }}
            onPress={() => {
              setDialogVisible(true);
            }}
          >
            <Text style={{
              color: "white", fontWeight: "bold",
              fontSize: 20
            }}>Create Puzzle</Text>
          </Button>

          <Portal>
            <Dialog visible={dialogVisible && !infoDialogVisible} dismissable={!infoDialogVisible} onDismiss={() => setDialogVisible(false)} style={{ backgroundColor: Color.white, width: "50%", display: "flex", alignSelf: 'center', height: "50%" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingRight: 10,
                }}
              >
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
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 16,
                    height: "75%"
                  }}
                >
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
            <Dialog visible={infoDialogVisible} onDismiss={() => { setInfoDialogVisible(false) }} style={{
              width: Platform.OS === "web" ? "60%" : "35%", display: "flex", alignSelf: 'center', height: "90%", backgroundColor: Color.white
              , borderRadius: "5%",
              overflow: "hidden"

            }}>
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: "50%",
                  zIndex: 0,
                }}
              >
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
                      <View style={{ flexDirection: "row", backgroundColor: "#AEAEAE", padding: 15, borderRadius: "5%", gap: 20 }}>
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
                      <View style={{ flexDirection: "row", backgroundColor: Color.white, padding: 15, borderRadius: "5%", gap: 20 }}>
                        <GameTypeGrid emptyColor="#AEAEAE" />
                        <View style={{ flexDirection: "column", justifyContent: "space-around" }}>
                          <View style={{ flexDirection: "row", justifyContent: "space-around", width: "80%" }}>
                            <View style={{ backgroundColor: "#AEAEAE", width: "40%", padding: 10, display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "23%" }}>
                              <Text style={{ fontSize: 15, color: Color.white, fontWeight: "bold" }}>Dog</Text>
                            </View>
                            <View style={{ backgroundColor: "#AEAEAE", width: "40%", padding: 10, display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "23%" }}>
                              <Text style={{ fontSize: 15, color: Color.white, fontWeight: "bold" }}>Bee</Text>
                            </View>
                          </View>
                          <View style={{ flexDirection: "row", justifyContent: "space-around", width: "80%" }}>
                            <View style={{ backgroundColor: "#AEAEAE", width: "40%", padding: 10, display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "23%" }}>
                              <Text style={{ fontSize: 15, color: Color.white, fontWeight: "bold" }}>Cat</Text>
                            </View>
                            <View style={{ backgroundColor: "#AEAEAE", width: "40%", padding: 10, display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "23%" }}>
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
          </Portal >
          <CreateGameModal
            visible={showCreateGame}
            onClose={() => setShowCreateGame(false)}
            gameType={
              gameType === "wordsearch"
                ? "WORD_SEARCH"
                : "CROSSWORD_SEARCH"
            }
          />
          <Image
            source={mascot}
            style={{ width: 90, height: 100, borderRadius: 25, transform: [{ rotateY: "360deg" }] }}
            resizeMode="contain"
          />
        </View>
      </View>
    </Card >
  );
};

export default UserOverviewCard;
