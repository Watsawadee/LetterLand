import { View, Image, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import GameTypeCard from "./GameTypeModal";
import { useEffect, useMemo, useState } from "react";
import { getLoggedInUserId, getToken, setToken } from "@/utils/auth";
import { useUserProfile } from "@/hooks/useGetUserProfile";
import coinIcon from "../assets/images/coin.png"
import Explore from "../assets/images/Explore.png"
import { Button, Card, Dialog, Portal, Text, TextInput } from "react-native-paper";
import mascot from "@/assets/images/mascot.png";
import SettingIcon from "@/assets/icon/settingIcon";
import { Color } from "@/theme/Color";
import { Typography } from "@/theme/Font";
import * as SecureStore from "expo-secure-store";

import { useUpdateUserSetting } from "@/hooks/useUpdateSetting";
import { UpdateUserSettingSchema } from "@/types/setting.schema";
import ArrowLeft from "@/assets/icon/ArrowLeft";
import { red } from "react-native-reanimated/lib/typescript/Colors";
import InfoIcon from "@/assets/icon/infoIcon";
import { useProgressLevelup } from "@/hooks/useProgressLevelup";

type Props = { onBack?: () => void };
const UserSettingCard = ({ onBack }: Props) => {
  const { data: user, isLoading } = useUserProfile();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [gameType, setGameType] = useState<"crossword" | "wordsearch" | null>(
    null
  );
  const [dialogVisible, setDialogVisible] = useState(false);
  const [infoDialogVisible, setInfoDialogVisible] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setTokenState] = useState<string | null>(null);



  const router = useRouter(); // Already imported, just reuse

  useEffect(() => {
    if (!user || "error" in user) return;
    setUsername(user.username ?? "");
    setEmail(user.email ?? "");
  }, [user]);

  useEffect(() => {
    // Fetch token on mount
    getToken().then(setTokenState);
  }, []);

  const original = useMemo(() => {
    if (!user || "error" in user) return { username: "", email: "" };
    return { username: user.username ?? "", email: user.email ?? "" };
  }, [user]);
  const payload = useMemo(() => {
    const out: Record<string, string> = {};
    if (username.trim() !== original.username) out.newUsername = username.trim();
    if (email.trim().toLowerCase() !== original.email.toLowerCase()) out.newEmail = email.trim();
    return out;
  }, [username, email, original]);

  const isDirty = Object.keys(payload).length > 0;

  const { mutate: saveSettings, isPending } = useUpdateUserSetting(async (res) => {
    // store the fresh token re-signed by the backend
    if (res.token) {
      await setToken(res.token);
    }
    Alert.alert("Success", res.message);
  });

  if (isLoading || !user) return <Text>Loading...</Text>;
  if ("error" in user) return <Text>Failed to load user data.</Text>;

  const onSave = () => {
    const parsed = UpdateUserSettingSchema.safeParse(payload);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Invalid input";
      Alert.alert("Validation error", first);
      return;
    }
    // Lowercase email client-side (optional; server already does it)
    if (parsed.data.newEmail) parsed.data.newEmail = parsed.data.newEmail.toLowerCase();

    saveSettings(parsed.data);
  };

  //ProgressLevelup
  const { mutate: levelUp, isPending: isLevelUpPending } = useProgressLevelup(
    token ?? "",
    (data) => Alert.alert("Success", data.message),
    (error) => Alert.alert("Error", error.response?.data?.message || "Failed to level up")
  );

  const handleLevelup = () => {
    if (!user?.id) {
      Alert.alert("Error, user not found")
    }
    levelUp({ userId: user.id })
  }

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
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Pressable
          onPress={() => {
            if (onBack) return onBack();
            if (router.canGoBack?.()) router.back(); else {
              router.replace("/Home");
            }
          }}
          hitSlop={10}
        >
          <ArrowLeft />
        </Pressable>
        <Text style={{ color: Color.gray, fontSize: 25, fontWeight: "bold", marginLeft: 4 }}>
          Account
        </Text>
      </View>
      <View style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "80%", maxHeight: "100%" }}>

        <View style={{ gap: 10 }}>
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            autoCapitalize="none"
            textColor={Color.gray}
            style={{ backgroundColor: "#FFF" }}
            activeOutlineColor={Color.gray}
          />
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ backgroundColor: "#fff" }}
            activeOutlineColor={Color.gray}
            textColor={Color.gray}
          />

          <Button
            mode="contained"
            onPress={onSave}
            disabled={!isDirty || isPending}
            loading={isPending}
            style={{ marginTop: 8 }}
          >
            Save
          </Button>
        </View>
        <View style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "17%", }}>
          <View style={{ display: "flex", flexDirection: "row", gap: 5, alignItems: "center" }}>
            <Text style={{ fontSize: Typography.header25.fontSize, fontWeight: Typography.header25.fontWeight, color: Color.gray }}>
              Upgrade Level
            </Text>
            <Button icon={({ size, color }) => <InfoIcon size={15} color={Color.gray} />} onPress={() => {
              setInfoDialogVisible(true)
            }}
              rippleColor={"transparent"} >
              {""}
            </Button>
          </View>
          <View style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <Button style={{ backgroundColor: user?.canLevelUp ? Color.blue : Color.lightblue, width: "90%" }} contentStyle={{ height: 50 }} disabled={!user?.canLevelUp} onPress={() => {
              handleLevelup()
            }}>
              <Text style={{ fontSize: Typography.header20.fontSize, fontWeight: Typography.header20.fontWeight, color: Color.white }} >
                {user?.nextLevel ? `Jump to ${user.nextLevel}` : "Jump to the next level"}
              </Text>
            </Button>
            <Portal>
              <Dialog visible={infoDialogVisible} onDismiss={() => setInfoDialogVisible(false)} style={{ backgroundColor: Color.lightblue, width: "50%", display: "flex", alignSelf: 'center' }}>
                <Dialog.Title style={{ fontWeight: "800", color: Color.gray }}>Upgrade Level</Dialog.Title>
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
                    <Text style={{ color: Color.gray, fontSize: Typography.body20.fontSize, fontWeight: Typography.body20.fontWeight, textAlign: "center", lineHeight: 30 }}>
                      To level up, you need to do better this week than last week, use no hints in your last five games, and have at least 200 hours of total playtime.
                    </Text>
                  </View>
                </Dialog.Content>
              </Dialog>
            </Portal >
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
              <Dialog.Title style={{ fontWeight: "800", color: Color.gray }}>Game Types Selection</Dialog.Title>
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

export default UserSettingCard;
