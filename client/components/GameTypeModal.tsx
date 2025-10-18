import { Card, Text } from "react-native-paper";
import { View, Image } from "react-native";
import Grid from "@/assets/icon/Grid";
import { Color } from "@/theme/Color";
import { Typography } from "@/theme/Font";

type GameTypeCardProps = {
  question: string;
  gameType: string;
  selected?: boolean;
  onPress?: () => void;
};

const GameTypeCard = ({
  question,
  gameType,
  selected,
  onPress,
}: GameTypeCardProps) => {
  return (
    <Card
      onPress={onPress}
      style={{
        width: 180,
        height: "100%",
        padding: 15,
        borderRadius: 15,
        backgroundColor: selected ? "#4D9DFE" : Color.white,
        borderWidth: 1,
        borderColor: "transparent",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      }}
    >
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          minHeight: 120,
          gap: 10,
          backgroundColor: "#D9D9D9",
          borderRadius: 20,
        }}
      >
        <Grid />
        <Text
          style={{
            ...Typography.header13,
            textAlign: "center",
            color: Color.gray,
          }}
        >
          {question}
        </Text>
      </View>

      <View
        style={{
          paddingVertical: 18,
          alignItems: "center",
          backgroundColor: selected ? "#4D9DFE" : "#FFFF",
        }}
      >
        <Text
          style={{
            ...Typography.header16,
            color: selected ? "white" : "#333",
          }}
        >
          {gameType}
        </Text>
      </View>
    </Card>
  );
};

export default GameTypeCard;
