import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

export default function CompleteScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { xp } = useLocalSearchParams<{ xp: string }>();
  const xpValue = parseInt(xp || "0", 10);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: topPad + 20,
          paddingBottom: bottomPad + 20,
        },
      ]}
    >
      <Animated.View
        style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={[styles.iconBg, { backgroundColor: "#0A1A1A", borderColor: colors.primary }]}>
          <Feather name="award" size={56} color={colors.primary} />
        </View>
      </Animated.View>

      <Animated.View style={[styles.textArea, { opacity: fadeAnim }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Lição Completa!</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Você terminou todas as atividades dessa lição.
        </Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="zap" size={22} color="#FFB300" />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{xpValue}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>XP Ganho</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="star" size={22} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>1</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Lição</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="trending-up" size={22} color="#00FF66" />
            <Text style={[styles.statValue, { color: colors.foreground }]}>5</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Sequência</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.btns}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.replace("/");
          }}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryBtnText, { color: "#121212" }]}>Continuar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.selectionAsync();
            router.replace("/lesson");
          }}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryBtnText, { color: colors.mutedForeground }]}>Repetir Lição</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 24,
  },
  iconContainer: { alignItems: "center" },
  iconBg: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  textArea: { alignItems: "center", gap: 12, width: "100%" },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", textAlign: "center" },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  statCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  btns: { width: "100%", gap: 12 },
  primaryBtn: { borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  primaryBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
  secondaryBtn: { borderRadius: 10, paddingVertical: 16, alignItems: "center", borderWidth: 1 },
  secondaryBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
});
