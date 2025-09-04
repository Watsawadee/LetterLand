import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from "react-native";
import GardenBackgroundBlueSky from "@/assets/backgroundTheme/GardenBackgroundBlue";
import WordBankModal from "@/components/WordBank";
import { ButtonStyles } from "@/theme/ButtonStyles";
import { Typography } from "@/theme/Font";
import MyGamesRow from "@/components/mygame";
import UserOverviewCard from "@/components/UserOverViewCard";
import { Image } from "react-native";
import mascot from "@/assets/images/mascot.png";
import Book from "@/assets/icon/Book";

// ⬇️ NEW
import AchievementsRow from "../../components/AchievementRow";

export default function Home() {
  const router = useRouter();
  const [showBook, setShowBook] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= 1024;

  // If you have an auth token from context/secure store, pass it here:
  // const token = useAuthTokenFromContext();
  const token = undefined;

  return (
    <View style={styles.root}>
      <GardenBackgroundBlueSky style={styles.bg} />

      <View style={[styles.page, { flexDirection: isWide ? "row" : "column" }]}>
        {/* LEFT PANEL */}
        <View
          style={[
            styles.leftPanel,
            { marginRight: isWide ? 24 : 0, marginBottom: isWide ? 0 : 24 },
          ]}
        >
          {/* greeting + Word Bank */}
          <View style={styles.headerRow}>
            {/* Mascot + Greeting */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Image
                source={mascot}
                style={{ width: 90, height: 90, borderRadius: 25, transform: [{ scaleX: -1 }] }}
                resizeMode="contain"
              />
              <View>
                <Text style={[Typography.header25, { marginBottom: 4 }]}>
                  Hello Watsawadee Saeyong
                </Text>
                <Text style={[Typography.body20, { opacity: 0.8 }]}>
                  How are you? Long time no see LEK
                </Text>
              </View>
            </View>

            {/* Word Bank Button */}
            <TouchableOpacity
              style={[ButtonStyles.wordBank.container, { flexDirection: "row", alignItems: "center" }]}
              onPress={() => setShowBook(true)}
            >
              <Book width={50} height={50} style={{ marginRight: 4 }} />
              <View style={{ flexDirection: "column", alignItems: "flex-start", paddingLeft: 8 }}>
                <Text style={ButtonStyles.wordBank.text}>Word</Text>
                <Text style={ButtonStyles.wordBank.text}>Bank</Text>
              </View>
            </TouchableOpacity>

            {/* modal */}
            <WordBankModal visible={showBook} onClose={() => setShowBook(false)} />
          </View>

          {/* ⬇️ ACHIEVEMENT SECTION (live data) */}
          <AchievementsRow title="Achievement"  />

          {/* Recent game title row */}
          <View style={styles.sectionHeader}>
            <Text style={Typography.header25}>Recent game</Text>
            <Text style={[Typography.body14, styles.link]}>view all</Text>
          </View>

          {/* Your games row */}
          <MyGamesRow title=" " />
        </View>

        {/* RIGHT SIDEBAR */}
        <View style={styles.rightPanel}>
          <UserOverviewCard />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, width: "100%", height: "100%", alignItems: "center",
  },
  bg: {
    position: "absolute", bottom: 0, left: 0, width: "100%", height: 1000, zIndex: 0,
  },
  page: {
    flex: 1, width: "100%", maxWidth: 1500, paddingHorizontal: 0,
    paddingTop: 16, paddingBottom: 24, flexDirection: "row",
  },
  leftPanel: { flex: 2.5, borderRadius: 20, padding: 16 },
  rightPanel: { flex: 1, borderRadius: 20, padding: 16, justifyContent: "center", alignItems: "center" },
  headerRow: {
    flexDirection: "row", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 40,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  link: { color: "#2F80ED" },
});
