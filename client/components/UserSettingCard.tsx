import { View, Image, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import GameTypeCard from "./GameTypeModal";
import { useEffect, useMemo, useState } from "react";
import { getLoggedInUserId, setToken } from "@/utils/auth";
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

type Props = { onBack?: () => void };
const UserSettingCard = ({ onBack }: Props) => {
  const { data: user, isLoading } = useUserProfile();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter(); // Already imported, just reuse

  useEffect(() => {
    if (!user || "error" in user) return;
    setUsername(user.username ?? "");
    setEmail(user.email ?? "");
  }, [user]);
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
      <View style={{ gap: 10 }}>
        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          autoCapitalize="none"
          style={{ backgroundColor: "#fff" }}
          textColor={Color.gray}
        />
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={{ backgroundColor: "#fff" }}
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
    </Card >
  );
};

export default UserSettingCard;
