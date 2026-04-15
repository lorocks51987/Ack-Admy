import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Award, Zap, CheckCircle, TrendingUp } from "lucide-react-native";
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
  const native = Platform.OS !== "web";

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 60, useNativeDriver: native }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: native }),
    ]).start();
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPad + 20, paddingBottom: bottomPad + 20 }]}>
      <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.iconBg, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <Award size={52} color={colors.primary} strokeWidth={1.5} />
        </View>
        <View style={[styles.glowRing, { borderColor: colors.primary }]} />
      </Animated.View>

      <Animated.View style={[styles.textArea, { opacity: fadeAnim }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Módulo Concluído!</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Você completou todas as atividades deste módulo de conscientização.
        </Text>

        <View style={styles.statsRow}>
          {[
            { Icon: Zap, value: `${xpValue} XP`, label: "Ganho", color: colors.primary },
            { Icon: CheckCircle, value: "1", label: "Módulo", color: colors.success },
            { Icon: TrendingUp, value: "5", label: "Sequência", color: colors.warning },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <s.Icon size={20} color={s.color} strokeWidth={2} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <View style={styles.btns}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.replace("/"); }}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryBtnText]}>Continuar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: colors.border }]}
          onPress={() => { Haptics.selectionAsync(); router.replace("/lesson"); }}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryBtnText, { color: colors.mutedForeground }]}>Repetir Módulo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "space-around", paddingHorizontal: 24 },
  iconWrap: { alignItems: "center", justifyContent: "center" },
  iconBg: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  glowRing: { position: "absolute", width: 144, height: 144, borderRadius: 72, borderWidth: 1, opacity: 0.3 },
  textArea: { alignItems: "center", gap: 10, width: "100%" },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 12, width: "100%" },
  statCard: { flex: 1, borderRadius: 10, borderWidth: 1, padding: 14, alignItems: "center", gap: 6 },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  btns: { width: "100%", gap: 10 },
  primaryBtn: { borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  primaryBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.3, color: "#FFFFFF" },
  secondaryBtn: { borderRadius: 10, paddingVertical: 16, alignItems: "center", borderWidth: 1 },
  secondaryBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
});
