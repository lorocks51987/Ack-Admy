import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Platform } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProgressProvider } from "@/contexts/ProgressContext";

import { AuthProvider } from "@/contexts/AuthContext";

import { AppState, AppStateStatus } from "react-native";
import { notificationService } from "@/services/notificationService";
import Constants from "expo-constants";

SplashScreen.preventAutoHideAsync();

const isExpoGo = Constants.appOwnership === "expo";

const queryClient = new QueryClient();

function AppCore() {
  useEffect(() => {
    if (Platform.OS === "web" || isExpoGo) return;

    notificationService.setupNotificationsAsync().catch(() => {});
    // Solicita permissões e cancela alarmes pendentes ao iniciar o app
    notificationService.requestPermissionsAsync().catch(() => {});
    notificationService.cancelAllReminders().catch(() => {});

    // Escuta mudanças de estado do App (fundo/ativo)
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        notificationService.cancelAllReminders().catch(() => {});
      } else if (nextAppState === "background" || nextAppState === "inactive") {
        notificationService.scheduleDailyStreakReminder().catch(() => {});
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
            <ProgressProvider>
              <QueryClientProvider client={queryClient}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <Slot />
                </GestureHandlerRootView>
              </QueryClientProvider>
            </ProgressProvider>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

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

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return <AppCore />;
}
