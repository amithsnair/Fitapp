import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import { Platform } from "react-native";
import { ThemeProvider } from "./context/ThemeContext";

// Conditionally import AdMob only on native platforms
let AdMobBanner, setTestDeviceIDAsync;
if (Platform.OS !== "web") {
  try {
    const AdMob = require('expo-ads-admob');
    AdMobBanner = AdMob.AdMobBanner;
    setTestDeviceIDAsync = AdMob.setTestDeviceIDAsync;
  } catch (error) {
    console.warn("AdMob not available:", error);
  }
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (process.env.EXPO_PUBLIC_TEMPO && Platform.OS === "web") {
      const { TempoDevtools } = require("tempo-devtools");
      TempoDevtools.init();
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Initialize AdMob for native platforms only
  useEffect(() => {
    if (Platform.OS !== "web" && typeof setTestDeviceIDAsync === 'function') {
      // This function is not available on web
      setTestDeviceIDAsync('EMULATOR');
    }
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <Stack
        screenOptions={({ route }) => ({
          headerShown: !route.name.startsWith("tempobook"),
        })}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default RootLayout;
