import UserOverviewCard from "../../components/UserOverViewCard";
import { View } from "react-native";
export default function Home() {
  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        padding: 16,
      }}
    >
      <UserOverviewCard />

    </View>
  );
}
