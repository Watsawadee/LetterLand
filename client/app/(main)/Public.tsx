
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
import {ButtonStyles} from "@/theme/ButtonStyles";
import { Typography } from "@/theme/Font";
import PublicGames from "@/components/publicgame";      
import UserOverviewCard from "@/components/UserOverViewCard";
import { Image } from "react-native"; 
import mascot from "@/assets/images/mascot.png"; 
import Book from "@/assets/icon/Book"; 


export default function Public() {
  const router = useRouter();
  const [showBook, setShowBook] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= 1024;

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

          <View style={styles.headerRow}>

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

<WordBankModal visible={showBook} onClose={() => setShowBook(false)} />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={Typography.header25}>Public game</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.publicGamesContainer}>
  <PublicGames title=" " />

</ScrollView>
        </View>

       
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
    maxWidth: 1500,
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
    // marginLeft: 20,
    justifyContent: 'center', 
    alignItems: 'center',  
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 40,
  },
  
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  link: {
    color: "#2F80ED",
  },
  publicGamesContainer: {
    flexDirection: "column",  // Ensures the children are laid out horizontally
    gap: 16,  // Optional: Space between items
  },
});