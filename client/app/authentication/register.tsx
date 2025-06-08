import { useState } from "react";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { Button, Input, YStack, Card, Text } from "tamagui";
import { registerUser } from "@/services/authService";
import { useMutation } from "@tanstack/react-query";
import { useRegister } from "@/hooks/useRegister";
import * as SecureStore from "expo-secure-store"
import { storeToken } from "@/utils/storeToken";

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
      params: { userId: user.id.toString() },
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
    <YStack
      flex={1}
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
      backgroundColor={"#ffff"}
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
            Create Account
          </Text>
        </Card.Header>
        <Input
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          size="$4"
        />
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
        <Input
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          size="$4"
        />
        <Button
          size="$4"
          backgroundColor="#007AFF"
          // icon={Brain}
          borderRadius="$4"
          onPress={handleRegister}
          color={"white"}
        >
          <Text fontWeight="800" fontSize="$4" color="white">
            {isPending ? "Registering..." : "Register"}
          </Text>
        </Button>
      </Card>
    </YStack>
  );
};

export default RegisterScreen;
