import { View } from "react-native";
import { useState } from "react";
import { Card, Text, TextInput, Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { getLoggedInUserId } from "@/utils/auth";
import GardenBackground from "@/assets/backgroundTheme/GardenBackground";
import { Color } from "@/theme/Color";
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


      <View style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "40%" }}>
        <Card
          mode="contained"
          style={{
            backgroundColor: "transparent",
            padding: 40,
            width: "100%",
            maxWidth: 400,
            gap: 24,
            borderRadius: 16,
          }}
        >
          <View style={{ display: "flex", flexDirection: "column", width: "100%", justifyContent: "center" }}>
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
              textColor="black"
              activeOutlineColor="#5B6073"
              style={{ marginBottom: 12, backgroundColor: "transparent" }}
            />

            <Button
              mode="contained"
              onPress={handleAge}
              style={{ backgroundColor: Color.blue, borderRadius: 8 }}
              contentStyle={{ paddingVertical: 6 }}
            >
              <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>Continue</Text>
            </Button>
          </View>
        </Card>
      </View>
    </View>
  );
}
