import { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getWords, setupProfile } from "../../services/setupUser";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";
import { getLoggedInUserId } from "@/utils/auth";
import GardenBackground from "@/assets/backgroundTheme/GardenBackground";
import { theme } from "@/theme";
const VocabEvalScreen = () => {
  const { age } = useLocalSearchParams<{
    age: string;
  }>();
  const [userId, setUserId] = useState<string | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const id = await getLoggedInUserId();
      if (!id) {
        alert("Session expired. Please log in again.");
        router.replace("/authentication/login");
        return;
      }

      setUserId(id);

      try {
        const data = await getWords();
        if ("words" in data && Array.isArray(data.words)) {
          setWords(data.words.slice(0, 30));
        } else {
          // Handle error case
          setWords([]);
          alert("Failed to load words.");
        }
      } catch (error) {
        console.error("Failed to load words", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleWordToggle = (word: string) => {
    setSelectedWords((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
    );
  };

  const handleSubmit = async () => {
    if (!userId || !age) {
      alert("Missing userId or age");
      return;
    }
    console.log("VocabEvalScreen - Submitting profile setup with:", {
      userId,
      age,
      selectedWords,
    });
    try {
      await setupProfile({
        userId: Number(userId),
        age: Number(age),
        selectedWords,
      });
      router.replace("/authentication/login");
    } catch (error) {
      console.error(error);
      alert("Failed to setup profile.");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View
      style={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
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
          width: "90%",
          maxWidth: "80%",
          borderRadius: 16,
          gap: 16,
          backgroundColor: "transparent",

        }}
      >
        <Text
          variant="titleLarge"
          style={{
            textAlign: "center",
            fontWeight: "800",
            color: "#5B6073",
            marginBottom: 16,
          }}
        >
          What words are you familiar with?
        </Text>


        <View style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 8,
        }}>
          {words.map((word, index) => (
            <Button
              key={index}
              style={{
                margin: 4,
                backgroundColor: selectedWords.includes(word) ? "#58A7F8" : "white",
                borderColor: "#58A7F8",
                borderRadius: 12,
              }}
              labelStyle={{
                color: selectedWords.includes(word) ? "white" : "#58A7F8",
                fontWeight: "600",
              }}
              onPress={() => handleWordToggle(word)}
            >
              {word}
            </Button>
          ))}
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={{
            backgroundColor: "#58A7F8",
            borderRadius: 10,
            marginTop: 20,
            alignSelf: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>
            Continue
          </Text>
        </Button>
      </Card>
    </View>
  );
};

export default VocabEvalScreen;
