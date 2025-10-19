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
import { Magnify } from "@/assets/icon/Magnify";


type Props = {
  coins?: number;
  hint?: number;
  onOpenSettings?: () => void;
};

const UserOverviewCard = ({ coins, hint, onOpenSettings }: Props) => {
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
        borderRadius: 24,
        marginBottom: 16,
        gap: 20,
        minWidth: "30%",
        height: "100%",
      }}
    >
      <View style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1, justifyContent: "space-between" }}>
        {/* Header with username and settings */}
        <View style={{ flexDirection: "column", gap: 20 }}>
        <View style={{ 
          display: "flex", 
          flexDirection: "row", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginTop: 10
        }}>
          <Text
            variant="titleLarge" 
            style={{ 
              fontWeight: "700", 
              fontSize: 28, 
              color: "#2D3142"
            }}
          >
            {user.username}
          </Text>
          <Button
            onPress={onOpenSettings}
            contentStyle={{ padding: 0 }}
            style={{ width: undefined, minWidth: 0, padding: 0, borderRadius: 50 }}
            theme={{ roundness: 1 }}
            rippleColor="transparent"
            compact
            icon={({ size }) => (
              <SettingIcon width={size + 4} height={size + 4} fill="#2D3142" />
            )}
          >
            {""}
          </Button>
        </View>

        {/* Stats Cards Row */}
        <View style={{ 
          flexDirection: "row", 
          gap: 10,
          justifyContent: "space-between" 
        }}>
          {/* Coins Card */}
          <View style={{
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
          }}>
            <Image source={coinIcon} style={{ width: 36, height: 36, marginRight: 12 }} />
            <View>
              <Text style={{ color: "#F9C23C", fontWeight: "700", fontSize: 17 }}>
                {typeof coins === "number" ? coins : user.coin}
              </Text>
              <Text style={{ color: "#C0C0C0", fontSize: 12, fontWeight: "500" }}>
                Coins
              </Text>
            </View>
          </View>

        {/* Hints Card */}
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
  <View style={{ marginRight: 2 }}>
    <Magnify width={30} height={30} />
  </View>

  <View>
    <Text style={{ color: "#4A5568", fontWeight: "900", fontSize: 20 }}>
      {typeof hint === "number" ? hint : user.hint || 0}
    </Text>
    <Text style={{ color: "#C0C0C0", fontSize: 12, fontWeight: "500" }}>
      Hints
    </Text>
  </View>
</View>

          {/* Puzzles Solved Card */}
          <View style={{
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
          }}>
            <View style={{ width: 36, height: 36, marginRight: 12 }}>
              <View style={{ flexDirection: "row", marginBottom: 2 }}>
                <View style={{ width: 16, height: 16, backgroundColor: "#D9D9D9", borderRadius: 4, alignItems: "center", justifyContent: "center", marginRight: 2 }}>
                  <Text style={{ color: "#fff", fontWeight: "900", fontSize: 10 }}>O</Text>
                </View>
                <View style={{ width: 16, height: 16, backgroundColor: "#FAE269", borderRadius: 4, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#F9C23C", fontWeight: "900", fontSize: 10 }}>V</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row" }}>
                <View style={{ width: 16, height: 16, backgroundColor: "#FAE269", borderRadius: 4, alignItems: "center", justifyContent: "center", marginRight: 2 }}>
                  <Text style={{ color: "#F9C23C", fontWeight: "900", fontSize: 10 }}>U</Text>
                </View>
                <View style={{ width: 16, height: 16, backgroundColor: "#D9D9D9", borderRadius: 4, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#fff", fontWeight: "900", fontSize: 10 }}>X</Text>
                </View>
              </View>
            </View>
            <View>
              <Text style={{ color: "#4A5568", fontWeight: "900", fontSize: 20 }}>
                {user.completedGames || 0}
              </Text>
              <Text style={{ color: "#C0C0C0", fontSize: 12, fontWeight: "500" }}>
                Solved
              </Text>
            </View>
          </View>
        </View>

        {/* Level Progress Card */}
        <View style={{
          backgroundColor: "#FFF",
          padding: 20,
          borderRadius: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}>
          <View style={{ 
            flexDirection: "row", 
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12 
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text style={{ fontSize: 24 }}>📖</Text>
              <View>
                <Text style={{ 
                  fontWeight: "700", 
                  fontSize: 16, 
                  color: "#2D3142" 
                }}>
                  Level Progress
                </Text>
                <Text style={{ 
                  fontSize: 12, 
                  color: "#8B8D98" 
                }}>
                  Keep playing to level up!
                </Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: "#FFE5F0",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
              }}
            >
              <Text style={{ 
                fontWeight: "700", 
                fontSize: 14, 
                color: "#FF6B9D" 
              }}>
                {user.englishLevel}
              </Text>
            </View>
          </View>
          <ProgressBar
            progress={Math.min((user?.progressPercent ?? 0) / 100, 1)}
            color="#FF6B9D"
            style={{
              height: 12,
              borderRadius: 999,
              backgroundColor: "#F9F6F4",
              overflow: "hidden",
            }}
          />
        </View>


        {/* Dashboard Card */}
        <View style={{
          backgroundColor: Color.A1 + '30',
          padding: 20,
          borderRadius: 20,
          gap: 12,
          borderWidth: 2,
          borderColor: Color.A1,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text style={{ fontSize: 28 }}>📊</Text>
            <Text style={{ 
              fontSize: 14, 
              color: "#2D3142",
              flex: 1,
              lineHeight: 20 
            }}>
              Access all your stats and updates in the dashboard.
            </Text>
          </View>
          <Button 
            mode="contained" 
            style={{ 
              backgroundColor: Color.A1,
              borderRadius: 16,
            }}
            contentStyle={{ height: 48 }}
            labelStyle={{ 
              fontSize: 15, 
              fontWeight: "700",
              color: "#FFF" 
            }}
            onPress={() => { router.push("/Dashboard") }}
          >
            View Dashboard →
          </Button>
        </View>

 {/* Explore Card */}
 <View style={{
          backgroundColor: Color.lightgreen+ '30',
          padding: 20,
          borderRadius: 20,
          gap: 12,
          borderWidth: 2,
          borderColor: Color.lightgreen,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text style={{ fontSize: 28 }}>🌍</Text>
            <Text style={{ 
              fontSize: 14, 
              color: "#2D3142",
              flex: 1,
              lineHeight: 20 
            }}>
              Explore and solve puzzles from the community
            </Text>
          </View>
          <Button 
            mode="contained" 
            style={{ 
              backgroundColor: Color.lightgreen,
              borderRadius: 16,
            }}
            contentStyle={{ height: 48 }}
            labelStyle={{ 
              fontSize: 15, 
              fontWeight: "700",
              color: "#FFF" 
            }}
            onPress={() => { router.replace("/Publicboard") }}
          >
            Explore other game →
          </Button>
        </View>
        </View>


       {/* Create Puzzle Button */}
       <Button
          mode="contained"
          style={{
            backgroundColor: "#4F9CF9",
            borderRadius: 20,
            marginTop: 8,
          }}
          contentStyle={{
            height: 64,
            flexDirection: "row",
            alignItems: "center",
          }}
          labelStyle={{
            fontSize: 18,
            fontWeight: "700",
            color: "#FFF",
          }}
          icon={() => (
            <View style={{ width: 36, height: 36, marginRight: 8, transform: [{ rotate: '-8deg' }] }}>
              <View style={{ flexDirection: "row", marginBottom: 2 }}>
                <View style={{ width: 16, height: 16, backgroundColor: "#B5B5B5", borderRadius: 4, alignItems: "center", justifyContent: "center", marginRight: 2 }}>
                  <Text style={{ color: "#fff", fontWeight: "900", fontSize: 10 }}>O</Text>
                </View>
                <View style={{ width: 16, height: 16, backgroundColor: "#FAE269", borderRadius: 4, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#F9C23C", fontWeight: "900", fontSize: 10 }}>V</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row" }}>
                <View style={{ width: 16, height: 16, backgroundColor: "#FAE269", borderRadius: 4, alignItems: "center", justifyContent: "center", marginRight: 2 }}>
                  <Text style={{ color: "#F9C23C", fontWeight: "900", fontSize: 10 }}>U</Text>
                </View>
                <View style={{ width: 16, height: 16, backgroundColor: "#B5B5B5", borderRadius: 4, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#fff", fontWeight: "900", fontSize: 10 }}>X</Text>
                </View>
              </View>
            </View>
          )}
          onPress={() => {
            setDialogVisible(true);
          }}
        >
          Create Puzzle
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
        </Portal>
        <CreateGameModal
          visible={showCreateGame}
          onClose={() => setShowCreateGame(false)}
          gameType={
            gameType === "wordsearch"
              ? "WORD_SEARCH"
              : "CROSSWORD_SEARCH"
          }
        />
      </View>
    </Card>
  );
};

export default UserOverviewCard;