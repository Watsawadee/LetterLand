import { Text, View } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import 'react-native-reanimated'
export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/authentication/register");
      // router.replace("/authentication/login");

    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  return null;

  // return (
  //   <View
  //     style={{
  //       flex: 1,
  //       justifyContent: "center",
  //       alignItems: "center",
  //     }}
  //   >
  //     <Text>Edit app/index.tsx to edit this screen.</Text>
  //   </View>
  // );
}
