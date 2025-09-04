import { View, Text, Button } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../contexts/themeContext';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { fontSize, setFontSize, primaryColor, setPrimaryColor } = useTheme();
  const router = useRouter();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize }}>Font Size: {fontSize}</Text>
      <Slider minimumValue={12} maximumValue={40} step={1} value={fontSize} onValueChange={setFontSize} />
      <Button title="Set Primary Color: Blue" onPress={() => setPrimaryColor('blue')} />
      <Button title="← Back to Home" onPress={() => router.replace("/Home")} />
    </View>
  );
}
