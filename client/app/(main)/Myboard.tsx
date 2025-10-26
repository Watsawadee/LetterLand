import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import GardenBackgroundBlueSky from "@/assets/backgroundTheme/GardenBackgroundBlue";
import WordBankModal from "@/components/WordBank";
import { ButtonStyles } from "@/theme/ButtonStyles";
import { Typography } from "@/theme/Font";
import MyGamesRow from "@/components/mygame";
import UserOverviewCard from "@/components/UserOverViewCard";
import Book from "@/assets/icon/Book";
import ArrowLeft from "@/assets/icon/ArrowLeft";
import { Color } from "@/theme/Color";

export default function Public() {
  const router = useRouter();
  const [showBook, setShowBook] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= 1024;

  // Navigate back to Home
  const handleBackPress = () => {
    router.push("/Home");
  };

  return (
    <View style={styles.root}>
      <GardenBackgroundBlueSky style={styles.bg} />

      <View style={[styles.page, { flexDirection: isWide ? "row" : "column" }]}>
        {/* LEFT PANEL */}
        <View
          style={[
            styles.leftPanel,
            { marginRight: isWide ? 24 : 0, marginBottom: isWide ? 25 : 24 },
          ]}
        >
          {/* Header with back button */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backButton}
            >
             <ArrowLeft width={24} height={24} color={Color.gray} />
              <Text style={[Typography.header30, { color: Color.gray, marginLeft: 4 }]}>
                My Board
              </Text>
            </TouchableOpacity>

            {/* Word Bank Button */}
            <TouchableOpacity
              style={[
                ButtonStyles.wordBank.container,
                { flexDirection: "row", alignItems: "center" },
              ]}
              onPress={() => setShowBook(true)}
            >
              <Book width={50} height={50} style={{ marginRight: 4 }} />
              <View
                style={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  paddingLeft: 9,
                }}
              >
                <Text style={ButtonStyles.wordBank.text}>Word</Text>
                <Text style={ButtonStyles.wordBank.text}>Bank</Text>
              </View>
            </TouchableOpacity>

            <WordBankModal
              visible={showBook}
              onClose={() => setShowBook(false)}
            />
          </View>
          <View style={styles.publicGamesContainer}>
            <MyGamesRow
              title=" "
              scrollDirection="vertical"
            />
          </View>
        </View>

        {/* RIGHT PANEL */}
        <View style={styles.rightPanel}>
          <UserOverviewCard />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
  },
  bg: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: 1000,
    zIndex: 0,
  },
  page: {
    flex: 1,
    width: "100%",
    maxWidth: 1125,
    maxHeight: 850,
    paddingHorizontal: 0,
    paddingTop: 16,
    paddingBottom: 50,
    flexDirection: "row",
  },
  leftPanel: {
    flex: 3,
    borderRadius: 20,
    padding: 16,
    
  },
  rightPanel: {
    flex: 1.55,
    borderRadius: 20,
    paddingTop: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  link: {
    color: "#2F80ED",
  },
  publicGamesContainer: {
    flexDirection: "column",
    gap: 16,
    flex: 1,
    minHeight: 0,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4, // smaller gap between arrow and text
    paddingVertical: 8,
    paddingHorizontal: 0, // remove horizontal padding to shift left
    marginLeft: -8, // nudge it to the left
  },
  // container: { flex: 1 },
  listArea: { flex: 1, minHeight: 0 },
});
