import { useState } from "react";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { Button, Input, YStack, Card, Text } from "tamagui";
import { useLogin } from "@/hooks/useLogins";
import * as SecureStore from "expo-secure-store";
import { storeToken } from "@/utils/storeToken";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const { mutate: loginMutate } = useLogin(async ({ user, token }) => {
    if (!user?.id || !token) {
      Alert.alert("Login failed", "Missing user or token");
      return;
    }

    await storeToken(token);


    router.replace({
      pathname: "/main/Home",
      params: { userId: user.id.toString() },
    });
  });

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Please fill in all fields");
      return;
    }

    loginMutate({ email, password });
  };
  return (
    <YStack
      flex={1}
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
      backgroundColor={"white"}
    >
      <Card
        elevate
        bordered
        padding="$6"
        width="100%"
        maxWidth={400}
        backgroundColor={"#fae269"}
        borderRadius="$8"
        gap="$4"
      >
        <Card.Header alignItems="center">
          <Text fontSize="$8" fontWeight="800" color="#5B6073">
            Log in to your Account
          </Text>
        </Card.Header>
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          size="$4"
          autoCapitalize="none"
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          size="$4"
        />
        <Button
          size="$4"
          backgroundColor="#007AFF"
          borderRadius="$4"
          onPress={handleLogin}
          color={"white"}
        >
          <Text fontWeight="800" fontSize="$4" color="white">
            Login
          </Text>
        </Button>
      </Card>
    </YStack>
  );
};

export default LoginScreen;
