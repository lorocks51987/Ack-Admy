import { BlurView } from "expo-blur";
import { Redirect, Tabs } from "expo-router";
import { House, Trophy, UserCircle } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

function TabLayoutContent() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";

  const isWeb = Platform.OS === 'web';
  const safeBottom = Math.max(insets.bottom, isWeb ? 20 : 10);
  const tabHeight = isWeb ? 85 : 64 + safeBottom;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: tabHeight,
          paddingBottom: safeBottom,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 12,
          marginTop: 4,
          paddingBottom: isWeb ? 4 : 0,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={90} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => <House size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          title: "Ranking",
          tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => <UserCircle size={size} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  const { session, loading, profileLoading, isGuest } = useAuth();
  const colors = useColors();

  if (loading || profileLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!session && !isGuest) {
    return <Redirect href="/sign-in" />;
  }

  return <TabLayoutContent />;
}
