import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, Animated, Keyboard, KeyboardAvoidingView, Platform, View } from "react-native";
import { Card, TextInput, Button, Text } from "react-native-paper";
import { useLogin } from "@/hooks/useLogins";
import { storeToken } from "@/utils/storeToken";
import GardenBackground from "@/assets/backgroundTheme/GardenBackground";
import { jwtDecode } from "jwt-decode";
import { Color } from "@/theme/Color";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const bgHeight = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    Animated.timing(bgHeight, {
      toValue: keyboardVisible ? 200 : 100,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [keyboardVisible]);

  const router = useRouter();
  const { mutate: loginMutate, isPending } = useLogin(async ({ user, token }) => {
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
      setErrorMessage("Please fill in all fields");
      return;
    }

    setErrorMessage("");

    loginMutate({ email, password }, {
      onError: (error: any) => {
        if (error?.response?.status === 401) {
          setErrorMessage("Email or password is incorrect");
        } else {
          setErrorMessage("Email or password is incorrectใ");
        }
      },
      onSettled: () => {},
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F2F8F9" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: bgHeight.interpolate({
              inputRange: [100, 200],
              outputRange: ["100%", "200%"],
            }),
            zIndex: 0,
          }}
        >
          <GardenBackground pointerEvents="none" style={{ width: "100%", height: "100%" }} />
        </Animated.View>

        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "40%",
          }}
        >
          <Card
            mode="contained"
            style={{
              width: "100%",
              maxWidth: "100%",
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
              Log in to your Account
            </Text>

            <TextInput
              placeholder={isFocused ? "" : "Email"}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrorMessage("");
              }}
              mode="outlined"
              autoCapitalize="none"
              textColor="black"
              activeOutlineColor="#5B6073"
              style={{ marginBottom: 12, backgroundColor: "transparent" }}
            />

            <TextInput
              placeholder={isFocused ? "" : "Password"}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorMessage("");
              }}
              mode="outlined"
              secureTextEntry
              textColor="black"
              activeOutlineColor="#5B6073"
              style={{ backgroundColor: "transparent", color: "black",marginBottom: 8 }}
            />

            {/* 🔽 Error message moved here (under password field) */}
            {errorMessage ? (
              <View
                style={{
                  backgroundColor: "#FFEBEE",
                  padding: 12,
                  borderRadius: 8,
                  marginTop: 10,
                  marginBottom: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: "#D32F2F",
                  width: "100%",
                }}
              >
                <Text style={{ color: "#D32F2F", fontSize: 14 }}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            <Button
              mode="contained"
              onPress={handleLogin}
              style={{ backgroundColor: Color.blue, borderRadius: 8 }}
              contentStyle={{ paddingVertical: 6 }}
              loading={isPending}
              disabled={isPending}
            >
              <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>
                Login
              </Text>
            </Button>

            <View
              style={{
                display: "flex",
                alignItems: "flex-start",
                marginBottom: 12,
              }}
            >
              <Button
                onPress={() => {
                  router.push("/authentication/register");
                }}
                rippleColor={"transparent"}
              >
                <Text style={{ color: Color.black }}>
                  No account yet? Create your account for free
                </Text>
              </Button>
            </View>
          </Card>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
