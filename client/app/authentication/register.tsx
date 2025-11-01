import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, Animated, Keyboard, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Card, TextInput, Button, Text } from "react-native-paper";
import { useRegister } from "@/hooks/useRegister";
import { storeToken } from "@/utils/storeToken";
import GardenBackground from "@/assets/backgroundTheme/GardenBackground";
import { Color } from "@/theme/Color";

const RegisterScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [keyboardVisible]);




  const router = useRouter();

  const { mutate: registerMutate, isPending } = useRegister(async ({ user, token }) => {
    try {
      if (!user?.id || !token) {
        Alert.alert("Registration failed, Missing user or token");
        return;
      }
      // await SecureStore.setItemAsync("user-token", token);
      await storeToken(token);
      router.replace({
        pathname: "/setupProfile/age",
      })
    }
    catch (error: any) {
      setErrorMessage("Registration failed")
    }
  })
  const handleRegister = () => {
    setErrorMessage("");

    if (!username || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Password did not match");
      return;
    }

    try {
      registerMutate(
        { username, email, password },
        {
          onError: (error: any) => {
            const msg =
              error?.response?.data?.message ||
              error?.message ||
              "Registration failed";
            setErrorMessage(msg);
          },
        }
      );
    } catch (err) {
      setErrorMessage("Registration failed");
    }
  }
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#F2F8F9" }}
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
          <GardenBackground
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "120%",
              zIndex: 0,
            }}
          />
        </Animated.View>
        <View style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "40%" }}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={{ width: "100%" }}
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
                Create Account
              </Text>
              <TextInput
                placeholder={isFocused ? "" : "Username"}
                value={username}
                onChangeText={setUsername}
                mode="outlined"
                autoCapitalize="none"
                textColor="black"
                activeOutlineColor="#5B6073"
                style={{ marginBottom: 12, backgroundColor: "transparent" }}
              />
              <TextInput
                placeholder={isFocused ? "" : "Email"}
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                autoCapitalize="none"
                textColor="black"
                activeOutlineColor="#5B6073"
                style={{ marginBottom: 12, backgroundColor: "transparent" }}
              />
              <TextInput
                placeholder={isFocused ? "" : "Password"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                mode="outlined"
                textColor="black"
                activeOutlineColor="#5B6073"
                style={{ marginBottom: 12, backgroundColor: "transparent" }}
              />
              <TextInput
                placeholder={isFocused ? "" : "Confirm Password"}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                mode="outlined"
                textColor="black"
                activeOutlineColor="#5B6073"
                style={{ backgroundColor: "transparent" }}
              />
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
              <View style={{ display: "flex", alignItems: "flex-start", marginBottom: 12 }}>
                <Button onPress={() => {
                  router.push("/authentication/login")
                }}
                  rippleColor={"transparent"}
                >
                  <Text style={{ color: Color.blue }}>
                    Already have an account? Login to your account
                  </Text>
                </Button>
              </View>
              <Button
                mode="contained"
                onPress={handleRegister}
                style={{ backgroundColor: Color.blue, borderRadius: 8 }}
                contentStyle={{ paddingVertical: 6 }}
                loading={isPending}
                disabled={isPending}
              >
                <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>
                  Register
                </Text>
              </Button>
            </Card>
          </ScrollView>
        </View>
      </View >
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
