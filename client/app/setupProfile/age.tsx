import { View } from "react-native";
import { useState } from "react";
import { YStack, Card, Input, Text, Button } from "tamagui";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ageScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [age, setAge] = useState("");
  const router = useRouter();
  const handleAge = () => {
    if (!age) {
      alert("Age required, please fill in your age");
      return;
    }
    router.replace({
      pathname: "/setupProfile/vocabEval",
      params: { userId, age: age.toString() },
    });
  };
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      backgroundColor={"#ffff"}
    >
      <Card
        backgroundColor={"#fae269"}
        borderRadius={"$8"}
        gap={"$6"}
        padding={50}
      >
        <Card.Header alignItems="center">
          <Text fontSize="$8" fontWeight="800" color="#5B6073">
            How old are you?
          </Text>
        </Card.Header>
        <Input
          placeholder="Enter your age"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
          size="$4"
        />

        <Button
          size="$4"
          backgroundColor="#007AFF"
          borderRadius="$4"
          onPress={handleAge}
          color="white"
        >
          <Text fontWeight="800" fontSize="$4" color="white">
            Continue
          </Text>
        </Button>
      </Card>
    </YStack>
  );
}
