import { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getWords, setupProfile } from "../../services/setupProfile";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";
const VocabEvalScreen = () => {
  const { userId, age } = useLocalSearchParams<{
    userId: string;
    age: string;
  }>();
  const [words, setWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const data = await getWords();
        setWords(data.slice(0, 30));
      } catch (error) {
        console.error("Failed to load words", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
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
      await setupProfile(Number(userId), Number(age), selectedWords);
      router.replace("/authentication/Login");
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
      <Card
        style={{
          padding: 24,
          width: "90%",
          maxWidth: 600,
          borderRadius: 16,
          gap: 16,
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
                backgroundColor: selectedWords.includes(word) ? "#FF7E1D" : "white",
                borderColor: "#FF7E1D",
                borderRadius: 12,
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
            backgroundColor: "#007AFF",
            borderRadius: 10,
            marginTop: 20,
            alignSelf: "center",
            paddingHorizontal: 16,
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
