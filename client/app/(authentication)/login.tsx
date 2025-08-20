import { useState } from "react";
import { useRouter } from "expo-router";
import { Alert, View } from "react-native";
import { Card, TextInput, Button, Text } from "react-native-paper";
import { useLogin } from "@/hooks/useLogins";
import { storeToken } from "@/utils/storeToken";
import GardenBackground from "@/assets/backgroundTheme/GardenBackground";
import { jwtDecode } from "jwt-decode";
const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const router = useRouter();
  const { mutate: loginMutate } = useLogin(async ({ user, token }) => {
    if (!token) {
      Alert.alert("Login failed", "Missing token");
      return;
    }

    await storeToken(token);

    const decoded: any = jwtDecode(token);
    console.log("Decoded JWT:", decoded);

    if (!decoded?.userId) {
      Alert.alert("Invalid token payload");
      return;
    }

    router.replace({
      pathname: "/Home",
    });
  });

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    loginMutate({ email, password }, {
      onSettled: () => {
        setIsSubmitting(false);
      },
    });

  };



  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        // alignItems: "center",
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
        mode="contained"
        style={{
          padding: 24,
          width: '100%',
          maxWidth: "100%",
          backgroundColor: 'transparent',
          elevation: 0,
          borderColor: 'transparent',
          borderRadius: 0,
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
          Log in to your Account
        </Text>
        <TextInput
          placeholder={isFocused ? '' : "Email"}
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          autoCapitalize="none"
          textColor="black"
          activeOutlineColor="#5B6073"
          style={{ marginBottom: 12, backgroundColor: "transparent" }}
        />

        <TextInput
          placeholder={isFocused ? '' : 'Password'}
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          textColor="black"
          activeOutlineColor="#5B6073"
          style={{ marginBottom: 12, backgroundColor: "transparent", color: "black" }}
        />
        <Button
          mode="contained"
          onPress={handleLogin}
          style={{ backgroundColor: "#007AFF", borderRadius: 8 }}
          contentStyle={{ paddingVertical: 6 }}
          loading={isSubmitting}
          disabled={isSubmitting}

        >
          <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>
            Login
          </Text>
        </Button>
      </Card>
    </View>
  );
};

export default LoginScreen;
