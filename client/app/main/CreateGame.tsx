import { useEffect, useState } from "react";
import { YStack, XStack, Text, Button, Input, Card } from "tamagui";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getUserCEFR } from "@/services/getUserCEFR";
import { useUserCEFR } from "@/hooks/useGetUserCEFR";

const CreateGameScreen = () => {
  const { userId, gameType } = useLocalSearchParams<{
    userId?: string;
    gameType?: "crossword" | "wordsearch";
  }>();

  type CEFRResponse = {
    englishLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  };

  const [englishLevel, setEnglishLevel] = useState<CEFRResponse["englishLevel"]>();

  const { data, isLoading, isError } = useUserCEFR(userId)

  useEffect(() => {
    if (data?.englishLevel) {
      setEnglishLevel(data.englishLevel);
    }
  }, [data]);


  const [timer, setTimer] = useState<"none" | "1" | "3" | "5">("none");
  const [uploadType, setUploadType] = useState<"text" | "link" | "image">("text");
  const [input, setInput] = useState("");
  // if (!userId) {
  //   return (
  //     <YStack padding="$4">
  //       <Text color="red">❌ Missing user ID in route parameters.</Text>
  //     </YStack>
  //   );
  // }

  if (isError) {
    return (
      <YStack padding="$4">
        <Text color="red">❌ Failed to fetch user level. Please try again.</Text>
      </YStack>
    );
  }

  return (
    <YStack padding="$3" margin={"%2"}>
      <Card
        backgroundColor="#fef9f2"
        padding="$6"
        borderRadius="$6"
        gap="$4"
        elevate
      >
        <Text fontSize="$8" fontWeight="800" color="#333">
          Create Puzzle
        </Text>
        <YStack gap={"$2"}>
          <Text fontWeight="700" color="#555">
            English Level
          </Text>
          <XStack gap="$3" flexWrap="wrap">
            {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
              <Button
                key={level}
                backgroundColor={englishLevel === level ? "#EF476F" : "#fff"}
                color={englishLevel === level ? "white" : "#333"} // ← add this line
                borderRadius="$10"
                borderWidth={1}
                borderColor={englishLevel === level ? "#EF476F" : "#ddd"}
                onPress={() => setEnglishLevel(level as typeof englishLevel)}
              >
                {level}
              </Button>
            ))}
          </XStack>
          <Text fontWeight="700" color="#555">
            Timer
          </Text>
          <XStack gap="$3" flexWrap="wrap">
            {["none", "1", "3", "5"].map((t) => (
              <Button
                key={t}
                backgroundColor={timer === t ? "#58A7F8" : "#fff"}
                color={timer === t ? "white" : "#333"}
                borderRadius="$10"
                borderWidth={1}
                borderColor="#ddd"
                onPress={() => setTimer(t as any)}
              >
                {t === "none" ? "None" : `${t} mins`}
              </Button>
            ))}
          </XStack>

          <Text fontWeight="700" color="#555">
            Upload type
          </Text>
          <XStack gap="$3" flexWrap="wrap">
            {["text", "link", "image"].map((type) => (
              <Button
                key={type}
                backgroundColor={uploadType === type ? "#58A7F8" : "#fff"}
                color={uploadType === type ? "white" : "#333"}
                borderRadius="$10"
                borderWidth={1}
                borderColor="#ddd"
                onPress={() => setUploadType(type as any)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </XStack>
        </YStack>
        <Input
          placeholder="Input text..."
          multiline
          height={100}
          borderRadius="$6"
          backgroundColor="#fff"
          value={input}
          onChangeText={setInput}
        />

        {/* Create Button */}
        <Button
          backgroundColor="#007AFF"
          borderRadius="$10"
          alignSelf="center"
          paddingHorizontal="$6"
        >
          <Text color="white" fontWeight="bold">
            Create
          </Text>
        </Button>
      </Card>
    </YStack>
  );
};

export default CreateGameScreen;
