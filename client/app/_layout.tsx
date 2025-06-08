import { Slot } from "expo-router";
import { ThemeProvider } from "../contexts/themeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TamaguiProvider } from "tamagui";
import config from "../tamagui.config";

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config}>
        <ThemeProvider>
          <Slot />
        </ThemeProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}

// export default function RootLayout() {
//   return <Stack />;
// }

// import { Slot } from 'expo-router';
// import { ThemeProvider } from '../contexts/themeContext';

// export default function Layout() {
//   return (
//     <ThemeProvider>
//       <Slot />
//     </ThemeProvider>
//   );
// }