import { View, Text, Button } from 'react-native';
import { useTheme } from '../contexts/themeContext';

export default function SettingsScreen() {
  const { fontSize, setFontSize, primaryColor, setPrimaryColor } = useTheme();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize }}>Font Size: {fontSize}</Text>
      {/* <Slider minimumValue={12} maximumValue={40} step={1} value={fontSize} onValueChange={setFontSize} /> */}
      <Button title="Set Primary Color: Blue" onPress={() => setPrimaryColor('blue')} />
    </View>
  );
}
