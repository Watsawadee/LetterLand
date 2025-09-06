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
import MyGamesRow from "@/components/mygame";
import UserOverviewCard from "@/components/UserOverViewCard";
import Book from "@/assets/icon/Book"; 
import ArrowLeft from "@/assets/icon/ArrowLeft";

export default function Public() {
  const router = useRouter();
  const [showBook, setShowBook] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= 1024;

  // Navigate back to Home
  const handleBackPress = () => {
    router.push('/Home'); 
  };

  return (
    <View style={styles.root}>
      <GardenBackgroundBlueSky style={styles.bg} />

      <View style={[styles.page, { flexDirection: isWide ? 'row' : 'column' }]}>
        {/* LEFT PANEL */}
        <View style={[styles.leftPanel, { marginRight: isWide ? 24 : 0, marginBottom: isWide ? 0 : 24 }]}>
          
          {/* Header with back button */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <ArrowLeft width={24} height={24} />
              <Text style={[Typography.header30, { marginLeft: 4 }]}>My Board</Text>
            </TouchableOpacity>

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

            <WordBankModal visible={showBook} onClose={() => setShowBook(false)} />
          </View>

          {/* Public Games Scroll */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.publicGamesContainer}>
  <MyGamesRow title=" " scrollDirection="vertical" />
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
    maxWidth: 1300,
    maxHeight: 850,
    paddingHorizontal: 0,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: "row",
  },
  leftPanel: {
    flex: 2.5,  
    borderRadius: 20,
    padding: 16,
  },
  rightPanel: {
    flex: 1,  
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center', 
    alignItems: 'center',  
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
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,              // smaller gap between arrow and text
    paddingVertical: 8,
    paddingHorizontal: 0, // remove horizontal padding to shift left
    marginLeft: -8,       // nudge it to the left
  },
});
