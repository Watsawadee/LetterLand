
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
import {ButtonStyles} from "@/theme/ButtonStyles";
import { Typography } from "@/theme/Font";
import MyGamesRow from "@/components/mygame";      
import UserOverviewCard from "@/components/UserOverViewCard";
import { Image } from "react-native"; 
import mascot from "@/assets/images/mascot.png"; 
import Book from "@/assets/icon/Book"; 

//achievements
const achievementsData = [
  {
    id: 1,
    title: "First Puzzle Solved",
    description: "Complete your first game",
    points: 10,
    progress: 1,
    total: 1,
    icon: "🏆",
    color: "#FFD700",
  },
  {
    id: 2,
    title: "Consistency",
    description: "Continue playing for three days straight.",
    points: 30,
    progress: 3,
    total: 1,
    icon: "📅",
    color: "#4CAF50",
  },
  {
    id: 3,
    title: "Hard Puzzle",
    description: "Solve the difficult question",
    points: 50,
    progress: 1,
    total: 1,
    icon: "🏔️",
    color: "#2196F3",
  },
];

const AchievementCard = ({ achievement }: { achievement: any }) => (
  <View style={styles.achievementCard}>
    <View style={styles.achievementIcon}>
      <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
      <View style={styles.checkmark}>
        <Text style={styles.checkmarkText}>✓</Text>
      </View>
    </View>
    <Text style={styles.achievementTitle}>{achievement.title}</Text>
    <Text style={styles.achievementDescription}>{achievement.description}</Text>
    <View style={styles.achievementFooter}>
      <View style={styles.pointsBadge}>
        <Text style={styles.pointsText}>🪙 {achievement.points}</Text>
      </View>
      <Text style={styles.progressText}>
        {achievement.progress}/{achievement.total}
      </Text>
    </View>
    <View style={styles.progressBar}>
      <View 
        style={[
          styles.progressFill, 
          { width: `${(achievement.progress / achievement.total) * 100}%` }
        ]} 
      />
    </View>
  </View>
);

export default function Home() {
  const router = useRouter();
  const [showBook, setShowBook] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= 1024;

  return (
    <View style={styles.root}>
      {/* background grass / sky */}
      <GardenBackgroundBlueSky style={styles.bg} />

      {/* page content container */}
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


           {/* Achievement Section */}
           <View style={styles.section}>
            <Text style={[Typography.header25, styles.sectionHeaderText]}>Achievement</Text>
            <FlatList
              data={achievementsData}
              renderItem={({ item }) => <AchievementCard achievement={item} />}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsList}
              ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
            />
          </View>

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

  // Achievement Card Styles
  achievementCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    width: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  achievementIcon: {
    position: "relative",
    alignSelf: "center",
    marginBottom: 12,
  },

  achievementEmoji: {
    fontSize: 40,
  },

  checkmark: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  checkmarkText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },

  achievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
    color: "#333",
  },

  achievementDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 16,
  },

  achievementFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  pointsBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  pointsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F57C00",
  },

  progressText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },

  progressBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#E91E63",
    borderRadius: 2,
  },

  achievementsList: {
    paddingHorizontal: 0,
  },

  section: {
    marginBottom: 70,
  },
    
  sectionHeaderText: {
    marginBottom: 30, // This adds space between the section title and the achievement cards
  },
});