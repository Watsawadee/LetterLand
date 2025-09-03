import { View, Image } from "react-native";
import { useRouter } from "expo-router";
import GameTypeCard from "./GameTypeModal";
import { useEffect, useState } from "react";
import { getLoggedInUserId } from "@/utils/auth";
import { useUserProfile } from "@/hooks/useGetUserProfile";
import coinIcon from "../assets/images/coin.png"
import Explore from "../assets/images/Explore.png"
import { Button, Card, Dialog, Portal, Text } from "react-native-paper";
import { theme } from "@/theme";


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
        maxWidth: "100%",
        height: "100%",
      }}
    >
      <View style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <Text
          variant="titleMedium" style={{ fontWeight: "700", color: theme.colors.darkGrey, display: "flex", alignContent: "flex-start" }}
        >
          {user.username}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Image source={coinIcon} style={{ width: 30, height: 30, }} />
          <Text style={{ color: theme.colors.darkGrey }}>{user.coin}</Text>
        </View>
        <View style={{
          alignItems: "center",
          gap: 8,
          padding: 20,
          borderColor: "#5B6073",
          borderRadius: 20,
          borderWidth: 1,
          marginBottom: 16,
        }}>
          <View style={{ display: "flex", flexDirection: "column", minWidth: "20%" }} onTouchStart={() => {
            router.push("/Dashboard")
          }}>
            <Text style={{ fontWeight: "700", color: theme.colors.darkGrey }} >Dashboard</Text>

            <Text variant="bodyMedium" style={{ color: theme.colors.darkGrey }}>This is your current game performance</Text>
            <View style={{ backgroundColor: theme.colors.pink, padding: 6, borderRadius: 10, width: "13%" }}>
              <Text style={{ fontWeight: "500", color: theme.colors.darkGrey, textAlign: "center" }}>{user.englishLevel}</Text>
            </View>
          </View>
        </View>
        <View style={{ alignItems: "center", gap: "6", minWidth: "20%" }}>

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

              <Text style={{ fontWeight: "700", color: theme.colors.darkGrey, display: "flex", flexDirection: "column", justifyContent: "center" }}>Solve puzzles created by others</Text>
            </View>
            <Button mode="contained" style={{ backgroundColor: theme.colors.green }} onPress={() => { router.replace("/Public") }}>
              <Text style={{ color: theme.colors.darkGrey, fontWeight: "bold" }}>Explore other game</Text>
            </Button>
          </View>
        </View>
      </View>


      <Button
        mode="contained"
        style={{
          backgroundColor: theme.colors.blue,
          borderRadius: 12,
          marginTop: 12,
        }}
        onPress={() => {
          setDialogVisible(true);
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Create Puzzle</Text>
      </Button>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={{ backgroundColor: theme.colors.white, width: "50%", display: "flex", alignSelf: 'center' }}>
          <Dialog.Title style={{ fontWeight: "800", color: theme.colors.darkGrey }}>Game Types Selection</Dialog.Title>
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

    </Card >
  );
};

export default UserOverviewCard;
