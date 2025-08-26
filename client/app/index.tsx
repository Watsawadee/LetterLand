import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { CustomButton } from "@/theme/ButtonCustom";
import { Typography } from "../theme/Font";
import { recentGamesMock, publicGamesMock } from "@/mock/gamemock";
import { mapRecentGameToCard, mapPublicGameToCard } from "@/utils/gameMappers";
import { Card } from "../components/GameCard";
import { achievementMock } from "@/mock/achievementMock";
import { mapUserAchievementToCard } from "@/utils/achievementMappers";
import { AchievementCard } from "@/components/AchievementCard";
import { wordBankStyles } from "../theme/WordBank";
import SvgIcon from "../components/WordBank";

export default function Home() {
  const router = useRouter();
  const [showBook, setShowBook] = useState(false);

  const recentGameCards = recentGamesMock.map(mapRecentGameToCard);
  const publicGameCards = publicGamesMock.map(mapPublicGameToCard);
  const achievements = achievementMock.map(mapUserAchievementToCard);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to LetterLand!</Text>

      <CustomButton
        label="Play"
        type="medium"
        onPress={() => router.push(`/`)}
      />
      
      {/* ✅ Word Bank Button */}
      <TouchableOpacity
        style={wordBankStyles.button}
        onPress={() => setShowBook(true)}
      >
        <Text style={wordBankStyles.buttonText}>Word Bank</Text>
      </TouchableOpacity>

      {/* ✅ Word Bank Modal */}
      <Modal visible={showBook} transparent animationType="fade">
        <View style={wordBankStyles.overlay}>
          <TouchableOpacity
            style={wordBankStyles.closeButton}
            onPress={() => setShowBook(false)}
          >
            <Text style={wordBankStyles.closeText}>✕</Text>
          </TouchableOpacity>
          <SvgIcon />
        </View>
      </Modal>

      <CustomButton type="fontSize" onPress={() => router.push("/")} />

      <View>
        <Button title="Settings" onPress={() => router.push("/setting")} />
      </View>

      {/* Recent & Public Games */}
      <View style={styles.cardSection}>
        <Text style={[Typography.header20, { marginBottom: 8 }]}>
          Recent Games
        </Text>
        <FlatList
          data={recentGameCards}
          horizontal
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card
              {...item}
              onPress={() =>
                router.push({
                  pathname: "/gameScreen",
                  params: { gameId: item.id.toString() },
                })
              }
            />
          )}
          showsHorizontalScrollIndicator={false}
        />

        <Text style={[Typography.header20, { marginVertical: 16 }]}>
          Public Games
        </Text>
        <FlatList
          data={publicGameCards}
          horizontal
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card
              {...item}
              onPress={() =>
                router.push({
                  pathname: "/gameScreen",
                  params: { gameId: item.id.toString() },
                })
              }
            />
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Achievements */}
      <View>
        <Text style={[Typography.header20, { marginBottom: 8 }]}>
          Achievements
        </Text>
        <FlatList
          data={achievements}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AchievementCard {...item} />}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, margin: 10 },
  buttonContainer: { margin: 20 },
  cardSection: { marginTop: 24 },
});
