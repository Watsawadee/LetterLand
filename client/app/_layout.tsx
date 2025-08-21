import { Slot, useRouter, useSegments, usePathname, Stack } from "expo-router";
import { ThemeProvider } from "../contexts/themeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PaperProvider, Text } from "react-native-paper";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { getToken } from "@/utils/auth";
import { ActivityIndicator } from "react-native";

const queryClient = new QueryClient();

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();
  const pathName = usePathname();


  const [isChecking, setIsChecking] = useState(true);
  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      const inAuthGroup = segments[0] === "authentication";

      if (!token && !inAuthGroup && pathName !== "/authentication/login") {
        router.replace("/authentication/login");
      } else if (token && inAuthGroup && pathName !== "/Home") {
        router.replace("/Home");
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [segments, pathName]);
  if (isChecking) {
    return <ActivityIndicator size={"large"} />
  }
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <ThemeProvider>
          <Stack />
          <ReactQueryDevtools initialIsOpen={true} />
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