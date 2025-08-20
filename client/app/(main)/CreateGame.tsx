import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUserProfile } from "@/hooks/useGetUserProfile";
import { View, Dimensions } from "react-native";
import {
  Text,
  Button,
  TextInput,
  Card,
} from "react-native-paper";
import { theme } from "@/theme";
import { useCreateGameFromGemini } from "@/hooks/useCreateGeminiGame";
import { CreateGameFromGeminiRequest } from "../../libs/type";

const CreateGameScreen = () => {
  const router = useRouter();
  const { gameType } = useLocalSearchParams<{
    gameType?: "WORD_SEARCH" | "CROSSWORD_SEARCH";
  }>();


  const [englishLevel, setEnglishLevel] = useState<CreateGameFromGeminiRequest["difficulty"]>();
  const [timer, setTimer] = useState<"none" | "1" | "3" | "5">("none");
  const [uploadType, setUploadType] = useState<"text" | "link" | "image">("text");
  const [input, setInput] = useState("");

  const { data: user, isLoading, isError } = useUserProfile();
  const createGameMutation = useCreateGameFromGemini();

  useEffect(() => {
    if (user && "englishLevel" in user) {
      setEnglishLevel(user.englishLevel);
    }

  }, [user]);

  const handleCreate = async () => {
    if (!user || !("id" in user) || !englishLevel || !input || !gameType) {
      alert("Please fill in all fields");
      return;
    }
    const apiUploadType = uploadType === "image" ? "pdf" : uploadType;
    createGameMutation.mutate({
      userId: user.id,
      difficulty: englishLevel,
      inputData: input,
      type: apiUploadType,
      gameType: gameType!,
    });
  };

  if (isError) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: "red" }}>❌ Failed to fetch user level. Please try again.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fef9f2" }}>
      <Card
        style={{
          padding: 24,
          borderRadius: 16,
          gap: 16,
          backgroundColor: "#fef9f2",
        }}
      >
        <Text variant="titleLarge" style={{ fontWeight: "800", color: "#333" }}>
          Create Puzzle
        </Text>
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: "700", color: "#555" }}>English Level</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
              <Button
                key={level}
                onPress={() => setEnglishLevel(level as typeof englishLevel)}
                style={{
                  marginRight: 8,
                  marginBottom: 8,
                  borderRadius: 20,
                  borderColor: englishLevel === level ? "#EF476F" : "#ddd",
                  backgroundColor: englishLevel === level ? "#EF476F" : "#fff",
                }}
              >
                <Text style={{ color: englishLevel === level ? theme.colors.white : theme.colors.darkGrey, fontWeight: "bold" }}>
                  {level}
                </Text>
              </Button>
            ))}
          </View>
          <Text style={{ fontWeight: "700", color: "#555" }}>
            Timer
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {["none", "1", "3", "5"].map((t) => (
              <Button
                key={t}
                style={{
                  marginRight: 8,
                  marginBottom: 8,
                  borderRadius: 20,
                  backgroundColor: timer === t ? "#58A7F8" : "#fff",
                  borderColor: "#ddd",
                }}
                onPress={() => setTimer(t as any)}
              >
                <Text style={{ color: timer === t ? theme.colors.white : theme.colors.darkGrey, fontWeight: "bold" }}>
                  {t === "none" ? "None" : `${t} mins`}
                </Text>
              </Button>
            ))}
          </View>

          <Text style={{ fontWeight: "700", color: "#555" }}>
            Upload type
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {["text", "link", "image"].map((type) => (
              <Button
                key={type}
                style={{
                  marginRight: 8,
                  marginBottom: 8,
                  borderRadius: 20,
                  backgroundColor: uploadType === type ? "#58A7F8" : "#fff",
                  borderColor: "#ddd",
                }}
                onPress={() => setUploadType(type as any)}
              >
                <Text style={{ color: uploadType === type ? theme.colors.white : theme.colors.darkGrey, fontWeight: "bold" }}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </Button>
            ))}
          </View>
        </View>
        <TextInput
          placeholder="Input text..."
          multiline
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            marginTop: 16,
          }}
          value={input}
          onChangeText={setInput}
        />

        {/* Create Button */}
        <Button
          mode="contained"
          onPress={handleCreate}
          loading={createGameMutation.status === "pending"}
          disabled={createGameMutation.status === "pending"}
          style={{
            backgroundColor: "#007AFF",
            borderRadius: 20,
            alignSelf: "center",
            marginTop: 16,
            width: "20%"
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Create
          </Text>
        </Button>
      </Card>
    </View >
  );
};

export default CreateGameScreen;
