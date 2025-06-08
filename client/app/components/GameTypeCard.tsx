import { Card, YStack, Text } from "tamagui";
import { Image } from "react-native";
import GameTypeSelection from "../../assets/images/GameTypeSelection.png";

type GameTypeCardProps = {
  question: string;
  gameType: string;
  selected?: boolean;
};

const GameTypeCard = ({ question, gameType, selected }: GameTypeCardProps) => {
  return (
    <Card
      width={180}
      height={200}
      borderRadius="$6"
      overflow="hidden"
      bordered
      backgroundColor={selected ? "#4D9DFE" : "#FFFF"}
      padded
    >
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        padding="$3"
        gap="$2"
        backgroundColor="#D9D9D9"
        borderRadius={20}
      >
        <Image
          source={GameTypeSelection}
          style={{ width: 48, height: 48, resizeMode: "contain" }}
        />
        <Text textAlign="center" fontSize="$3" fontWeight="600" color="#333">
          {question}
        </Text>
      </YStack>

      <YStack
        paddingVertical="$2"
        alignItems="center"
        backgroundColor={selected ? "#4D9DFE" : "#FFFF"}
      >
        <Card.Footer>
          <Text
            fontWeight="700"
            fontSize="$4"
            color={selected ? "white" : "#333"}
          >
            {gameType}
          </Text>
        </Card.Footer>
      </YStack>
    </Card>
  );
};

export default GameTypeCard;
