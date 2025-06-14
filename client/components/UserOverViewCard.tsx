import { Card, XStack, Text, Separator, YStack, Button, Dialog, Adapt, Sheet } from "tamagui";
import { Image, ImageSourcePropType } from "react-native";
import { useRouter } from "expo-router";
import GameTypeCard from "./GameTypeModal";
import { useState } from "react";
const router = useRouter();
type userOverviewCardProps = {
  icon: ImageSourcePropType;
  title: string;
  value: string;
  icon2: ImageSourcePropType;
  title2: string;
  value2: string;
  userId: string;

};

const userOverviewCard = ({
  icon,
  title,
  value,
  icon2,
  title2,
  value2,
  userId,
}: userOverviewCardProps) => {


  const [gameType, setGameType] = useState<"crossword" | "wordsearch" | null>(
    null
  );
  const handleSelect = (type: "crossword" | "wordsearch") => {
    setGameType(type);

    setTimeout(() => {
      router.push({
        pathname: "/main/CreateGame",
        params: { userId, gameType: type, },
      });
    }, 500);
  };
  return (
    <Card
      elevate
      bordered
      padding="$4"
      backgroundColor="#fff"
      borderRadius="$6"
      gap="$2"
    >
      <Text
        fontSize="$7"
        fontWeight="700"
        color="#333"
        alignContent="flex-start"
      >
        Dashboard
      </Text>
      <XStack alignItems="center" gap="$3">
        <YStack
          width={45}
          height={45}
          borderRadius={9999}
          backgroundColor="#EC8388"
          alignItems="center"
          justifyContent="center"
        >
          <Image source={icon} style={{ width: 25, height: 25 }} />
        </YStack>
        <YStack>
          <Text fontWeight="700">{title}</Text>

          <Text fontSize="$5" fontWeight="bold">
            {value}
          </Text>
        </YStack>
      </XStack>
      <Separator alignSelf="stretch" marginVertical={15} />
      <XStack alignItems="center" gap="$3">
        <YStack
          width={45}
          height={45}
          borderRadius={9999}
          backgroundColor="#9B75C1"
          alignItems="center"
          justifyContent="center"
        >
          <Image source={icon2} style={{ width: 25, height: 25 }} />
        </YStack>
        <YStack alignItems="flex-start">
          <Text fontWeight="700">{title2}</Text>

          <Text fontSize="$5" fontWeight="bold">
            {value2}
          </Text>
        </YStack>
      </XStack>
      {/* <Separator alignSelf="stretch" marginVertical={15} /> */}


      <Dialog modal>
        <Dialog.Trigger asChild>
          <Button
            size="$5"
            backgroundColor="#007AFF"
            color="white"
            fontWeight="bold"
            borderRadius="$6"
            marginTop="$6"
            hoverStyle={{ backgroundColor: "#007AFF" }}
            pressStyle={{ backgroundColor: "#007AFF" }}
            focusStyle={{ backgroundColor: "#007AFF" }}
            onPress={() => {
              console.log("✅ Navigating with userId:", userId); // Log for debug
              // router.push({
              //   // pathname: "/main/CreateGame",
              //   pathname: "/main/SelectGameType",
              //   params: {
              //     userId, // make sure this is a string
              //     gameType: "wordsearch",
              //   },
              // });
            }}
          >
            <Text color="white" fontWeight="bold">
              Create Puzzle
            </Text>
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
            gap="$4"
            width="60%"
          >
            <Dialog.Title fontWeight="800" fontSize="$6">
              Game Types Selection
            </Dialog.Title>
            <XStack gap="$4" justifyContent="center" alignItems="center" height={180}>
              {[
                {
                  type: "crossword",
                  question: "Q. What is mammal?",
                  label: "Crossword search",
                },
                { type: "wordsearch", question: "Q. Cat", label: "Word search" },
              ].map(({ type, question, label }, idx) => (
                <Button
                  key={type || idx}
                  onPress={() => handleSelect(type as "crossword" | "wordsearch")}
                  backgroundColor="transparent"
                  padding={0}
                  borderWidth={0}
                >
                  <GameTypeCard
                    question={question}
                    gameType={label}
                    selected={gameType === type}
                    userId={userId}
                  />
                </Button>
              ))}
            </XStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </Card>
  );
};

export default userOverviewCard;
