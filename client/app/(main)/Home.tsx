import UserOverviewCard from "../../components/UserOverViewCard";
import { Platform, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { Button } from "react-native-paper";
export default function Home() {
  const router = useRouter();
  const handleLogout = async () => {
    if (Platform.OS === "web") {
      localStorage.removeItem("user-token");
    } else {
      await SecureStore.deleteItemAsync("user-token");
    }
    router.replace("/authentication/login");
  };
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
      <Button onPress={handleLogout}>
        Logout
      </Button>

    </View>
  );
}
