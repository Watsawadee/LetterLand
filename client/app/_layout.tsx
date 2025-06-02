// import { Stack } from "expo-router";

// export default function RootLayout() {
//   return <Stack />;
// }

import { Slot } from 'expo-router';
import { ThemeProvider } from '../contexts/themeContext';

export default function Layout() {
  return (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  );
}