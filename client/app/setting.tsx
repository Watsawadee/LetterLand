import { View, Text, Button } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../contexts/themeContext';
import { useRouter } from 'expo-router';
import UserSettingCard from '@/components/UserSettingCard';

export default function SettingsScreen() {
  const { fontSize, setFontSize, primaryColor, setPrimaryColor } = useTheme();
  const router = useRouter();

  return (
    <View style={{ padding: 20, display: "flex", height: "100%", flexDirection: "row", justifyContent: "space-between" }}>
      <UserSettingCard />
    </View>
  );
}
