import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import GameSelectionModal from '../components/GameSelectionModal';

export default function Home() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const handleGameSelection = (type: 'word' | 'crossword') => {
    setModalVisible(false);
    if (type === 'word') {
      router.push('/wordSearchGame');
    } else {
      router.push('/game');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to LetterLand!</Text>

      <View style={styles.buttonContainer}>
        <Button title="Start Game" onPress={() => setModalVisible(true)} />
      </View>

      <View>
        <Button title="Settings" onPress={() => router.push('/setting')} />
      </View>

      <GameSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleGameSelection}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, margin: 10 },
  buttonContainer: { margin: 20 },
});
