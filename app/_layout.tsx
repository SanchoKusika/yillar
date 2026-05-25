import "react-native-url-polyfill/auto";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_700Bold_Italic,
  PlayfairDisplay_900Black,
} from "@expo-google-fonts/playfair-display";
import {
  IBMPlexMono_300Light,
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
  IBMPlexMono_700Bold,
} from "@expo-google-fonts/ibm-plex-mono";
import { QueryProvider, SessionProvider } from "@shared/providers";
import { ThemeProvider } from "@theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    // Playfair Display (display/wordmark)
    "PlayfairDisplay-Black": PlayfairDisplay_900Black,
    "PlayfairDisplay-Bold": PlayfairDisplay_700Bold,
    "PlayfairDisplay-BoldItalic": PlayfairDisplay_700Bold_Italic,
    // IBM Plex Mono (years, scores)
    "IBMPlexMono-Light": IBMPlexMono_300Light,
    "IBMPlexMono-Regular": IBMPlexMono_400Regular,
    "IBMPlexMono-Medium": IBMPlexMono_500Medium,
    "IBMPlexMono-SemiBold": IBMPlexMono_600SemiBold,
    "IBMPlexMono-Bold": IBMPlexMono_700Bold,
    // Open Sans (body)
    "OpenSans-Regular": require("../src/shared/assets/fonts/OpenSans-Regular.ttf"),
    "OpenSans-Medium": require("../src/shared/assets/fonts/OpenSans-Medium.ttf"),
    "OpenSans-SemiBold": require("../src/shared/assets/fonts/OpenSans-SemiBold.ttf"),
    "OpenSans-Bold": require("../src/shared/assets/fonts/OpenSans-Bold.ttf"),
    "OpenSans-ExtraBold": require("../src/shared/assets/fonts/OpenSans-ExtraBold.ttf"),
    "OpenSans-Italic": require("../src/shared/assets/fonts/OpenSans-Italic.ttf"),
    // Open Sans Condensed (headings, era tags)
    "OpenSansCondensed-Regular": require("../src/shared/assets/fonts/OpenSans_Condensed-Regular.ttf"),
    "OpenSansCondensed-Medium": require("../src/shared/assets/fonts/OpenSans_Condensed-Medium.ttf"),
    "OpenSansCondensed-SemiBold": require("../src/shared/assets/fonts/OpenSans_Condensed-SemiBold.ttf"),
    "OpenSansCondensed-Bold": require("../src/shared/assets/fonts/OpenSans_Condensed-Bold.ttf"),
    "OpenSansCondensed-ExtraBold": require("../src/shared/assets/fonts/OpenSans_Condensed-ExtraBold.ttf"),
    // Open Sans Semi Condensed (labels)
    "OpenSansSemiCondensed-Regular": require("../src/shared/assets/fonts/OpenSans_SemiCondensed-Regular.ttf"),
    "OpenSansSemiCondensed-SemiBold": require("../src/shared/assets/fonts/OpenSans_SemiCondensed-SemiBold.ttf"),
    "OpenSansSemiCondensed-Bold": require("../src/shared/assets/fonts/OpenSans_SemiCondensed-Bold.ttf"),
  });

  useEffect(() => {
    if (loaded || fontError) SplashScreen.hideAsync();
  }, [loaded, fontError]);

  if (!loaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <SessionProvider>
            <ThemeProvider>
              <StatusBar style="light" />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#1A1208" } }} />
            </ThemeProvider>
          </SessionProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
