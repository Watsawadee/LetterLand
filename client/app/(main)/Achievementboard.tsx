import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
} from "react-native";

import GardenBackgroundBlueSky from "@/assets/backgroundTheme/GardenBackgroundBlue";
import WordBankModal from "@/components/WordBank";
import { ButtonStyles } from "@/theme/ButtonStyles";
import { Typography } from "@/theme/Font";

import UserOverviewCard from "@/components/UserOverViewCard";
import Book from "@/assets/icon/Book";
import ArrowLeft from "@/assets/icon/ArrowLeft";
import AchievementsRow from "@/components/AchievementRow";

export default function Achievementboard() {
  const router = useRouter();
  const [showBook, setShowBook] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= 1024;

  const handleBackPress = () => {
    router.push("/Home");
  };

  return (
    <View style={styles.root}>
      <GardenBackgroundBlueSky style={styles.bg} />

      <View style={[styles.page, { flexDirection: isWide ? "row" : "column" }]}>
        {/* LEFT PANEL (scrollable area) */}
        <View
          style={[
            styles.leftPanel,
            { marginRight: isWide ? 24 : 0, marginBottom: isWide ? 0 : 24 },
          ]}
        >
          {/* Header with back button and Word Bank */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <ArrowLeft width={24} height={24} />
              <Text style={[Typography.header30, { marginLeft: 4 }]}>
                Achievement
              </Text>
            </TouchableOpacity>

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
                  paddingLeft: 8,
                }}
              >
                <Text style={ButtonStyles.wordBank.text}>Word</Text>
                <Text style={ButtonStyles.wordBank.text}>Bank</Text>
              </View>
            </TouchableOpacity>

            <WordBankModal visible={showBook} onClose={() => setShowBook(false)} />
          </View>

          {/* ✅ Scrollable content (like in Publicboard) */}
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 24,
            }}
            showsVerticalScrollIndicator
          >
            <View style={styles.achievementContainer}>
              <AchievementsRow title="All Achievements" showAll />
            </View>
          </ScrollView>
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
    paddingBottom: 24,
    flexDirection: "row",
    minHeight: 0,
  },
  leftPanel: {
    flex: 2.5,
    borderRadius: 20,
    padding: 16,
    minHeight: 0,
  },
  rightPanel: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginLeft: -8,
  },
  achievementContainer: {
    flexDirection: "column",
    gap: 16,
    flex: 1,
    minHeight: 0,
    marginTop: 8,
  },
});
