import { Slot } from "expo-router";
import { ThemeProvider } from "../contexts/themeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PaperProvider } from "react-native-paper";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <ThemeProvider>
          <Slot />
          {/* <ReactQueryDevtools initialIsOpen={true} /> */}
        </ThemeProvider>
      </PaperProvider>
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