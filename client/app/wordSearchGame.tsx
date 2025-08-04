import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function WordSearchGame() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Button title="← Back to Home" onPress={() => router.replace('/main/Home')} />

      <Text style={styles.title}>Word Search Game (Coming Soon)</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, alignItems: 'center', backgroundColor: '#f9f9f9' },
  title: { fontSize: 22, marginVertical: 20 },
});
