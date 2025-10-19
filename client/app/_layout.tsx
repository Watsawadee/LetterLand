import { Slot, useRouter, useSegments, usePathname, Stack } from "expo-router";
import { ThemeProvider } from "../contexts/themeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PaperProvider, Text } from "react-native-paper";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { getToken } from "@/utils/auth";
import { ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "@/types/decodedJwtToken";
import { storeToken } from "@/utils/storeToken";
import { clearToken } from "@/utils/clearToken";
import { GlobalLoadingProvider } from "@/contexts/GlobalLoadingContext";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const queryClient = new QueryClient();

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();
  const pathName = usePathname();

  const [isChecking, setIsChecking] = useState(true);
  useEffect(() => {
    if (__DEV__) {
      // expose router so you can call it from debugger console
      (globalThis as any).SecureStore = SecureStore;
      (globalThis as any).router = router;
      console.log("Router exposed to globalThis");
    }
    const checkAuth = async () => {
      const token = await getToken();
      const inAuthGroup = segments[0] === "authentication";

      // if (pathName === "/") {

      //   if (token) {
      //     router.replace("/Home");
      //   } else {
      //     router.replace("/authentication/login");
      //   }
      //   setIsChecking(false);
      //   return;
      // }
      if (token) {
        try {
          const decoded: DecodedToken = jwtDecode(token);

          if (decoded.exp && Date.now() / 1000 > decoded.exp) {
            await clearToken();
            router.replace("/authentication/login");
            setIsChecking(false);
            return;
          }
        } catch {
          await clearToken();
          router.replace("/authentication/login");
          setIsChecking(false);
          return;
        }
      }
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
    return <ActivityIndicator size={"large"} />;
  }
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider>
            <GlobalLoadingProvider>
              <Stack screenOptions={{ headerShown: false }} />
              {/* <ReactQueryDevtools initialIsOpen={true} /> */}
              <GlobalLoadingOverlay />
            </GlobalLoadingProvider>
          </ThemeProvider>
        </GestureHandlerRootView>
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
