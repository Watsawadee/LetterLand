import { useState } from "react";
import { Adapt, Button, Dialog, Sheet, Text, XStack, YStack } from "tamagui";
import GameTypeCard from "../components/GameTypeCard";
import { useRouter } from "expo-router";
import { Image } from "react-native";
import ShowMoreDetail from "../../assets/images/ShowMoreDetailButton.png";

const SelectGameType = () => {
  const [gameType, setGameType] = useState<"crossword" | "wordsearch" | null>(
    null
  );
  const router = useRouter();

  const handleSelect = (type: "crossword" | "wordsearch") => {
    setGameType(type);

    setTimeout(() => {
      router.push({
        pathname: "/main/CreateGame",
        params: { gameType: type },
      });
    }, 500);
  };
  return (
    <YStack padding="$5" gap="$2">
      <XStack alignItems="center">
        <Text fontSize="$6" fontWeight="700" color="#111">
          Upload Material
        </Text>

        <Dialog modal>
          <Dialog.Trigger asChild>
            <Button
              circular
              backgroundColor="transparent"
              padding={4}
              height={24}
              width={24}
            >
              <Image
                source={ShowMoreDetail}
                style={{ width: 14, height: 14, resizeMode: "contain" }}
              />
            </Button>
          </Dialog.Trigger>

          <Adapt platform="touch">
            <Sheet />
          </Adapt>

          <Dialog.Portal>
            <Dialog.Overlay opacity={0.5} />
            <Dialog.Content
              bordered
              elevate
              backgroundColor="white"
              borderRadius="$4"
              padding="$4"
              width="90%"
            >
              <Dialog.Title fontWeight="800" fontSize="$6">
                Game Type Info
              </Dialog.Title>
              <Dialog.Description fontSize="$4" color="#444">
                Choose between "Crossword search" and "Word search". Crossword
                puzzles place words in intersecting grids, while Word search
                puzzles hide words in a letter matrix.
              </Dialog.Description>

              <XStack justifyContent="flex-end" marginTop="$4">
                <Dialog.Close asChild>
                  <Button borderRadius="$4">Got it</Button>
                </Dialog.Close>
              </XStack>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </XStack>

      <XStack gap="$4" justifyContent="center" alignItems="center" height={180}>
        {[
          {
            type: "crossword",
            question: "Q. What is mammal?",
            label: "Crossword search",
          },
          { type: "wordsearch", question: "Q. Cat", label: "Word search" },
        ].map(({ type, question, label }) => (
          <Button
            key={type}
            onPress={() => handleSelect(type as "crossword" | "wordsearch")}
            backgroundColor="transparent"
            padding={0}
            borderWidth={0}
          >
            <GameTypeCard
              question={question}
              gameType={label}
              selected={gameType === type}
            />
          </Button>
        ))}
      </XStack>
    </YStack>
  );
};

export default SelectGameType;
