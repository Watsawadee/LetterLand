import { useEffect, useState } from "react";
import { YStack, Card, Text, Button, XStack, Spinner } from "tamagui";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getWords, setupProfile } from "../../services/setupProfile";
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
      router.replace("/main/Home");
    } catch (error) {
      console.error(error);
      alert("Failed to setup profile.");
    }
  };

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" color="#007AFF" />
      </YStack>
    );
  }

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="#ffff"
    >
      <Card
        elevate
        bordered
        padding="$6"
        width="90%"
        maxWidth={600}
        // backgroundColor="#fae269"
        borderRadius="$8"
        gap="$4"
      >
        <Card.Header alignItems="center">
          <Text fontSize="$8" fontWeight="800" color="#5B6073">
            What words are you familiar with?
          </Text>
        </Card.Header>

        <XStack flexWrap="wrap" gap="$2" justifyContent="center">
          {words.map((word, index) => (
            <Button
              key={index}
              size="$3"
              backgroundColor={
                selectedWords.includes(word) ? "#FF7E1D" : "white"
              }
              color={selectedWords.includes(word) ? "white" : "#FF7E1D"}
              borderRadius="$4"
              onPress={() => handleWordToggle(word)}
            >
              {word}
            </Button>
          ))}
        </XStack>

        <Button
          size="$4"
          backgroundColor="#007AFF"
          borderRadius="$4"
          onPress={handleSubmit}
          marginTop="$4"
        >
          <Text fontWeight="800" fontSize="$4" color="white">
            Continue
          </Text>
        </Button>
      </Card>
    </YStack>
  );
};

export default VocabEvalScreen;
