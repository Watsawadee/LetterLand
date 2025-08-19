import { View } from "react-native";
import { useState } from "react";
import { Card, Text, TextInput, Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { getLoggedInUserId } from "@/utils/auth";
export default function AgeScreen() {
  const [age, setAge] = useState("");
  const router = useRouter();
  const handleAge = async () => {
    if (!age) {
      alert("Age required, please fill in your age");
      return;
    }
    const userId = await getLoggedInUserId();
    if (!userId) {
      alert("Session expired. Please log in again.");
      router.replace("/authentication/login");
      return;
    }
    router.replace({
      pathname: "/setupProfile/vocabEval",
      params: { age: age.toString() },
    });
  };
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        padding: 24,
      }}
    >

      <Card
        style={{
          backgroundColor: "transparent",
          padding: 40,
          width: "100%",
          maxWidth: 400,
          gap: 24,
          borderRadius: 16,
        }}
      >
        <Text
          variant="titleLarge"
          style={{ textAlign: "center", fontWeight: "800", color: "#5B6073", marginBottom: 16 }}
        >
          How old are you?
        </Text>

        <TextInput
          placeholder="Enter your age"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
          mode="outlined"
          style={{ marginBottom: 16 }}
        />

        <Button
          mode="contained"
          onPress={handleAge}
          style={{ backgroundColor: "#007AFF", borderRadius: 8 }}
          contentStyle={{ paddingVertical: 6 }}
        >
          <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>Continue</Text>
        </Button>
      </Card>
    </View>
  );
}
