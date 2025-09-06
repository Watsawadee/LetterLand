import { View, Image } from "react-native";
import { useRouter } from "expo-router";
import GameTypeCard from "./GameTypeModal";
import { useEffect, useState } from "react";
import { getLoggedInUserId } from "@/utils/auth";
import { useUserProfile } from "@/hooks/useGetUserProfile";
import coinIcon from "../assets/images/coin.png"
import Explore from "../assets/images/Explore.png"
import { Button, Card, Dialog, Portal, Text } from "react-native-paper";
import mascot from "@/assets/images/mascot.png";
import SettingIcon from "@/assets/icon/settingIcon";
import { Color } from "@/theme/Color";
import { Typography } from "@/theme/Font";


const UserOverviewCard = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [gameType, setGameType] = useState<"crossword" | "wordsearch" | null>(
    null
  );
  const [dialogVisible, setDialogVisible] = useState(false);


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
    if (!userId) return;

    router.push({
      pathname: "/CreateGame",
      params: {
        gameType: type === "wordsearch" ? "WORD_SEARCH" : "CROSSWORD_SEARCH"
      },
    });
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
      <View style={{ display: "flex", flexDirection: "column", gap: "30%" }}>
        <View style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignContent: "center", gap: 5 }}>
            <View style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <Text
                variant="titleMedium" style={{ fontWeight: "700", color: Color.darkGrey, display: "flex", alignContent: "flex-start" }}
              >
                {user.username}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Image source={coinIcon} style={{ width: 30, height: 30, }} />
                <Text style={{ color: Color.darkGrey }}>{user.coin}</Text>
              </View>
            </View>
            <Button
              onPress={() => router.push("/setting")}
              contentStyle={{ padding: 0 }}
              style={{ width: undefined, minWidth: 0, padding: 0, borderRadius: 50 }}
              theme={{ roundness: 1 }}
              rippleColor="transparent"
              compact
              icon={({ size }) => (
                <SettingIcon width={size} height={size} fill={Color.darkGrey} />
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
                <Text style={{ fontWeight: "700", color: Color.darkGrey }} >Dashboard</Text>

                <Text variant="bodyMedium" style={{ color: Color.darkGrey }}>This is your current game performance</Text>
                <View style={{ backgroundColor: Color.pink, padding: 6, borderRadius: 10, width: "13%" }}>
                  <Text style={{ fontWeight: "500", color: Color.darkGrey, textAlign: "center" }}>{user.englishLevel}</Text>
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
            }}>
              <View style={{ display: "flex", flexDirection: "row" }}>
                <Image source={Explore} style={{ width: 35, height: 30 }} />

                <Text style={{ fontWeight: "700", color: Color.darkGrey, display: "flex", flexDirection: "column", justifyContent: "center" }}>Solve puzzles created by others</Text>
              </View>
              <Button mode="contained" style={{ backgroundColor: Color.green }} onPress={() => { router.replace("/Public") }}>
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
            <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={{ backgroundColor: Color.white, width: "50%", display: "flex", alignSelf: 'center' }}>
              <Dialog.Title style={{ fontWeight: "800", color: Color.darkGrey }}>Game Types Selection</Dialog.Title>
              <Dialog.Content>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 16,
                    marginTop: 12,
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
          </Portal >
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
