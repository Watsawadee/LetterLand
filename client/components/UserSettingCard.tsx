import { View, Image, Alert, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import GameTypeCard from "./GameTypeModal";
import { useEffect, useMemo, useState } from "react";
import { getLoggedInUserId, getToken, setToken } from "@/utils/auth";
import { useUserProfile } from "@/hooks/useGetUserProfile";
import coinIcon from "../assets/images/coin.png"
import Explore from "../assets/images/Explore.png"
import { Button, Card, Dialog, IconButton, Portal, Text, TextInput } from "react-native-paper";
import mascot from "@/assets/images/mascot.png";
import SettingIcon from "@/assets/icon/settingIcon";
import { Color } from "@/theme/Color";
import { Typography } from "@/theme/Font";
import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";


import { useUpdateUserSetting } from "@/hooks/useUpdateSetting";
import { UpdateUserSettingSchema } from "@/types/setting.schema";
import ArrowLeft from "@/assets/icon/ArrowLeft";
import { red } from "react-native-reanimated/lib/typescript/Colors";
import InfoIcon from "@/assets/icon/infoIcon";
import { useProgressLevelup } from "@/hooks/useProgressLevelup";
import GameTypeGrid from "@/assets/icon/GameTypeGrid";
import GameTypeBackground from "@/assets/backgroundTheme/GameTypeBackground";
import CloseIcon from "@/assets/icon/CloseIcon";

type Props = { onBack?: () => void };
const UserSettingCard = ({ onBack }: Props) => {
  const { data: user, isLoading } = useUserProfile();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [gameType, setGameType] = useState<"crossword" | "wordsearch" | null>(
    null
  );
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [updateLevelDialogVisible, setupdateLevelDialogVisible] = useState(false);
  const [infoDialogVisible, setInfoDialogVisible] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const { mutate: saveSettings, isPending } = useUpdateUserSetting(async (res) => {
    // store the fresh token re-signed by the backend
    if (res.token) {
      await setToken(res.token);
    }
    Alert.alert("Success", res.message);
  });
  //ProgressLevelup
  const { mutate: levelUp, isPending: isLevelUpPending } = useProgressLevelup(
    token ?? "",
    (data) => Alert.alert("Success", data.message),
    (error) => Alert.alert("Error", error.response?.data?.message || "Failed to level up")
  );


  const queryClient = useQueryClient();

  const router = useRouter(); // Already imported, just reuse

  useEffect(() => {
    if (user && !("error" in user)) {
      if (username === "") setUsername(user.username ?? "");
      if (email === "") setEmail(user.email ?? "");
      setUserId(user.id?.toString() ?? null);
    }
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



  const handleLevelup = () => {
    if (!user?.id) {
      Alert.alert("Error, user not found")
    }
    levelUp({ userId: user.id })
  }

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
          <ArrowLeft color={Color.gray} />
        </Pressable>
        <Text style={{ color: Color.gray, fontSize: 25, fontWeight: "bold", marginLeft: 4 }}>
          Account
        </Text>
      </View>

      <View style={{ flexDirection: "column", justifyContent: "space-between", height: "80%", marginTop: 20 }}>
        <View style={{ flexDirection: "column", gap: 20 }} >
          <View>
            <View style={{ flexDirection: "column", width: "100%" }} >
              <Text style={{ color: Color.gray, fontWeight: Typography.header20.fontWeight, fontSize: Typography.header16.fontSize }}>Username</Text>
              <TextInput
                mode="outlined"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                outlineColor="#B5B5B5"
                activeOutlineColor={Color.gray}
                textColor={Color.gray}
                style={{ backgroundColor: "#FFF", marginBottom: 12 }}
                contentStyle={{ paddingVertical: 5 }}
                outlineStyle={{ borderRadius: 999, borderWidth: 1.5 }}
                onFocus={() => setIsUsernameFocused(true)}
                onBlur={() => setIsUsernameFocused(false)}
                right={<TextInput.Icon icon="pencil" color={isUsernameFocused ? Color.gray : "#B5B5B5"} />}
              />
            </View>
            <View style={{ flexDirection: "column", gap: 5 }} >
              <Text style={{ color: Color.gray, fontWeight: Typography.header20.fontWeight, fontSize: Typography.header16.fontSize }}>Email</Text>
              <TextInput
                // label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ backgroundColor: "#fff" }}
                contentStyle={{ paddingVertical: 12 }}
                outlineStyle={{ borderRadius: 999, borderWidth: 1.5 }}
                outlineColor="#B5B5B5"
                activeOutlineColor={Color.gray}
                textColor={Color.gray}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                right={<TextInput.Icon icon="pencil" color={isEmailFocused ? Color.gray : "#B5B5B5"} />}
              />
            </View>

            {isDirty && (
              <Button
                mode="contained"
                onPress={onSave}
                disabled={!isDirty || isPending}
                loading={isPending}
                style={{ marginTop: 20, backgroundColor: !isDirty || isPending ? "#B5B5B5" : Color.blue }}
              >
                <Text style={{ marginTop: 8, color: Color.white, fontWeight: Typography.header25.fontWeight }}>
                  Save
                </Text>
              </Button>)}
          </View>

          <View style={{ display: "flex", flexDirection: "row", gap: 3, alignItems: "center" }}>
            <Text style={{ fontSize: Typography.header25.fontSize, fontWeight: Typography.header25.fontWeight, color: Color.gray }}>
              Upgrade Level
            </Text>
            <Button icon={({ size, color }) => <InfoIcon size={15} color={Color.gray} />} onPress={() => {
              setupdateLevelDialogVisible(true);
              setDialogVisible(false);
              setInfoDialogVisible(false);

            }}
              rippleColor={"transparent"} >
              {""}
            </Button>
          </View>
          <View style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <Button style={{ backgroundColor: user?.canLevelUp ? Color.blue : "#B5B5B5", width: "90%" }} contentStyle={{ height: 50 }} disabled={!user?.canLevelUp} onPress={() => {
              handleLevelup()
            }}>
              <Text style={{ fontSize: Typography.header20.fontSize, fontWeight: Typography.header20.fontWeight, color: Color.white }} >
                {user?.nextLevel ? `Jump to ${user.nextLevel}` : "Jump to the next level"}
              </Text>
            </Button>
            <Portal>
              <Dialog visible={updateLevelDialogVisible} onDismiss={() => setupdateLevelDialogVisible(false)} style={{ backgroundColor: Color.lightblue, width: "50%", display: "flex", alignSelf: 'center' }}>
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20 }}>
                  <Dialog.Title style={{ fontWeight: "800", color: Color.gray }}>Upgrade Level</Dialog.Title>
                  <IconButton icon={CloseIcon} onPress={() => {
                    setupdateLevelDialogVisible(false)
                  }} />
                </View>
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
                      To advance to the next level, your performance for the current week must exceed that of the previous week, no hints should have been used in the last five games, and a minimum of 200 total play hours must be accumulated.
                    </Text>
                  </View>
                </Dialog.Content>
              </Dialog>
            </Portal >
          </View>
        </View>
      </View>
      <View style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "20%", marginBottom: 20 }}>

        <Button onPress={() => {
          if (Platform.OS === "web") {
            localStorage.removeItem("user-token");
            queryClient.clear();
            router.replace("/authentication/login");
          } else {
            SecureStore.deleteItemAsync("user-token")
              .then(() => {
                console.log("token cleared");
                queryClient.clear();
                router.replace("/authentication/login");
              });
          }

        }}
          rippleColor={"transparent"}
          style={{ backgroundColor: Color.blue, width: "100%" }}
        >
          <Text style={{ color: Color.white, fontWeight: "bold" }}>
            Logout
          </Text>
        </Button>
      </View>

    </Card >
  );
};

export default UserSettingCard;
