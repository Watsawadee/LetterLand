import { useState } from "react";
import { useRouter } from "expo-router";
import { Alert, View } from "react-native";
import { Card, TextInput, Button, Text } from "react-native-paper";
import { useRegister } from "@/hooks/useRegister";
import { storeToken } from "@/utils/storeToken";
import GardenBackground from "@/assets/backgroundTheme/GardenBackground";

const RegisterScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");



  const router = useRouter();

  const { mutate: registerMutate, isPending } = useRegister(async ({ user, token }) => {
    console.log("User ID:", user.id);
    console.log("Token:", token);
    if (!user?.id || !token) {
      Alert.alert("Registration failed, Missing user or token");
      return;
    }
    // await SecureStore.setItemAsync("user-token", token);
    await storeToken(token);
    router.replace({
      pathname: "/setupProfile/age",
    })
  })
  const handleRegister = () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password did not match");
      return;
    }
    registerMutate({ username, email, password })
  }
  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        backgroundColor: "#F2F8F9",
      }}
    >
      <GardenBackground
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 1000,
          zIndex: 0,
        }}
      />
      <Card
        style={{
          padding: 24,
          width: "100%",
          maxWidth: 400,
          backgroundColor: "transparent",
          gap: 16,
        }}
      >
        <Text
          variant="titleLarge"
          style={{
            textAlign: "center",
            fontWeight: "800",
            color: "#5B6073",
            marginBottom: 12,
          }}
        >
          Create Account
        </Text>
        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          style={{ marginBottom: 12 }}
        />
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          autoCapitalize="none"
          style={{ marginBottom: 12 }}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          style={{ marginBottom: 12 }}
        />
        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          mode="outlined"
          style={{ marginBottom: 12 }}
        />
        <Button
          mode="contained"
          onPress={handleRegister}
          style={{ backgroundColor: "#007AFF", borderRadius: 8 }}
          contentStyle={{ paddingVertical: 6 }}
          loading={isPending}
          disabled={isPending}
        >
          <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>
            "Register"
          </Text>
        </Button>
      </Card>
    </View>
  );
};

export default RegisterScreen;
