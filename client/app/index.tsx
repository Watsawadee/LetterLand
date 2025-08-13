import React, { useState } from "react";
import { useRouter } from "expo-router";
import GameSelectionModal from "@/components/GameSelectionModal";
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { CustomButton } from '@/theme/ButtonCustom';
import { Typography } from '../theme/Font';
import { recentGamesMock, publicGamesMock } from '@/mock/gamemock';
import { mapRecentGameToCard, mapPublicGameToCard } from '@/utils/gameMappers';
import { Card } from '../components/GameCard';
import { achievementMock } from '@/mock/achievementMock';
import { mapUserAchievementToCard } from '@/utils/achievementMappers';
import { AchievementCard } from '@/components/AchievementCard';
import { wordBankStyles } from '../theme/WordBank';
import SvgIcon from '../components/WordBank';

export default function Home() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const handleGameSelection = (type: "word" | "crossword") => {
    setModalVisible(false);
    if (type === "word") {
      router.push("/wordSearchGame");
    } else {
      router.push('/crosswordSearchGame');
    }
  };

  const recentGameCards = recentGamesMock.map(mapRecentGameToCard);
  const publicGameCards = publicGamesMock.map(mapPublicGameToCard);
  const achievements = achievementMock.map(mapUserAchievementToCard);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to LetterLand!</Text>

      <View style={styles.buttonContainer}>
        <Button title="Start Game" onPress={() => setModalVisible(true)} />
      </View>

      <CustomButton
        label="Play"
        type="medium"
        onPress={() => router.push('/')}
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

      <CustomButton
        label="Play"
        type="small"
        onPress={() => router.push('/crosswordSearchGame')}
      />
      <CustomButton
        type="fontSize"
        onPress={() => router.push('/crosswordSearchGame')}
      />

      <View>
        <Button title="Settings" onPress={() => router.push("/setting")} />
      </View>

      {/* Recent & Public Games */}
      <View style={styles.cardSection}>
        <Text style={[Typography.header20, { marginBottom: 8 }]}>Recent Games</Text>
        <FlatList
          data={recentGameCards}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Card {...item} />}
          showsHorizontalScrollIndicator={false}
        />

        <Text style={[Typography.header20, { marginVertical: 16 }]}>Public Games</Text>
        <FlatList
          data={publicGameCards}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Card {...item} />}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Achievements */}
      <View>
        <Text style={[Typography.header20, { marginBottom: 8 }]}>Achievements</Text>
        <FlatList
          data={achievements}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AchievementCard {...item} />}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Game Selection Modal */}
      <GameSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleGameSelection}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, margin: 10 },
  buttonContainer: { margin: 20 },
  cardSection: { marginTop: 24 },
});