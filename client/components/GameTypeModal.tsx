import { Card, Text } from "react-native-paper";
import { View, Image } from "react-native";
import GameTypeSelection from "../assets/images/GameTypeSelection.png";

type GameTypeCardProps = {
  question: string;
  gameType: string;
  selected?: boolean;
  onPress?: () => void;
};

const GameTypeCard = ({ question, gameType, selected, onPress }: GameTypeCardProps) => {
  return (
    <Card
      onPress={onPress}
      style={{
        width: 180,
        height: 200,
        padding: 15,
        borderRadius: 15,
        overflow: "hidden",
        backgroundColor: selected ? "#4D9DFE" : "#FFFF",
        borderWidth: 1,
        borderColor: "transparent",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 40,
          width: "auto",
          height: 100,
          gap: 8,
          backgroundColor: "#D9D9D9",
          borderRadius: 20,
        }}
      >
        <Image
          source={GameTypeSelection}
          style={{ width: 48, height: 50, resizeMode: "contain" }}
        />
        <Text style={{ textAlign: "center", fontSize: 14, fontWeight: "600", color: "#333" }}>
          {question}
        </Text>
      </View>

      <View
        style={{
          paddingVertical: 8,
          alignItems: "center",
          backgroundColor: selected ? "#4D9DFE" : "#FFFF",
        }}
      >
        <Text style={{ fontWeight: "700", fontSize: 16, color: selected ? "white" : "#333" }}>
          {gameType}
        </Text>
      </View>
    </Card>
  );
};

export default GameTypeCard;
