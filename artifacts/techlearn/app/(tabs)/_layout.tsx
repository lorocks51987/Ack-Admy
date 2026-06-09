import { BlurView } from "expo-blur";
import { Redirect, Tabs } from "expo-router";
import { House, Trophy, UserCircle } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Platform, StyleSheet, View, useColorScheme, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

function WebCustomTabBar({ state, descriptors, navigation, colors }: any) {
  return (
    <View style={{
      flexDirection: 'row',
      height: 70,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    }}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;
        const color = isFocused ? colors.primary : colors.mutedForeground;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 4 }}
          >
            {options.tabBarIcon && options.tabBarIcon({ focused: isFocused, color, size: 24 })}
            <Text style={{ color, fontSize: 11, fontFamily: "Inter_600SemiBold", marginTop: 4 }}>
              {label as string}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TabLayoutContent() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";

  const isWeb = Platform.OS === 'web';
  const safeBottom = Math.max(insets.bottom, 0);

  return (
    <Tabs
      tabBar={(props: any) => 
        isWeb ? <WebCustomTabBar {...props} colors={colors} /> : undefined
      }
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
          height: 64 + safeBottom,
          paddingBottom: safeBottom,
          paddingTop: 8,
        },
        tabBarItemStyle: {
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 11,
          marginTop: 2,
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
