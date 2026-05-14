import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache as nativeTokenCache } from "@clerk/expo/token-cache";
import { Platform } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProgressProvider } from "@/contexts/ProgressContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

function AppCore() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ProgressProvider>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Slot />
            </GestureHandlerRootView>
          </QueryClientProvider>
        </ProgressProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

function NativeRoot() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={nativeTokenCache}>
      <AppCore />
    </ClerkProvider>
  );
}

function WebRoot() {
  return <AppCore />;
}

const AppRoot = Platform.OS === "web" ? WebRoot : NativeRoot;

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return <AppRoot />;
}
