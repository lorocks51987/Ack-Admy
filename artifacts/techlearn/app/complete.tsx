import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Award, Zap, CheckCircle2, TrendingUp, ChevronRight, RotateCcw } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useProgress } from "@/contexts/ProgressContext";
import { MODULE_DEFINITIONS } from "@/constants/lessons";

export default function CompleteScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { xp: xpParam, moduleId: moduleIdParam } = useLocalSearchParams<{ xp: string; moduleId: string }>();
  const { progress } = useProgress();
  const native = Platform.OS !== "web";

  const xpEarned = parseInt(xpParam || "0", 10);
  const moduleId = parseInt(moduleIdParam || "1", 10);
  const moduleDef = MODULE_DEFINITIONS.find((m) => m.id === moduleId);
  const nextModule = MODULE_DEFINITIONS.find((m) => m.id === moduleId + 1);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 60, useNativeDriver: native }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: native }),
        Animated.spring(slideAnim, { toValue: 0, friction: 7, tension: 60, useNativeDriver: native }),
      ]),
    ]).start();
  }, []);

  const accuracy = progress.totalExercises > 0
    ? Math.round((progress.correctAnswers / progress.totalExercises) * 100)
    : 0;

  return (
    <View style={[styles.root, {
      backgroundColor: colors.background,
      paddingTop: topPad + 16,
      paddingBottom: bottomPad + 16,
    }]}>
      {/* Trophy animation */}
      <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.glowOuter, { borderColor: colors.primary + "30" }]} />
        <View style={[styles.glowMid, { borderColor: colors.primary + "50" }]} />
        <View style={[styles.iconBg, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <Award size={52} color={colors.primary} strokeWidth={1.5} />
        </View>
      </Animated.View>

      {/* Text + stats */}
      <Animated.View style={[styles.textArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Módulo Concluído!</Text>
        {moduleDef && (
          <Text style={[styles.modName, { color: colors.primary }]}>{moduleDef.title}</Text>
        )}
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Excelente desempenho! Continue sua jornada de conformidade.
        </Text>

        <View style={styles.statsRow}>
          {[
            { Icon: Zap,         value: `+${xpEarned}`, label: "XP Ganho",    color: colors.primary },
            { Icon: CheckCircle2, value: `${progress.completedModules.length}/${MODULE_DEFINITIONS.length}`, label: "Módulos", color: colors.success },
            { Icon: TrendingUp,  value: `${accuracy}%`, label: "Precisão",    color: "#F59E0B" },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <s.Icon size={20} color={s.color} strokeWidth={2} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* XP total bar */}
        <View style={[styles.xpBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Zap size={14} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.xpBarText, { color: colors.foreground }]}>
            Total acumulado: <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold" }}>{progress.xp} XP</Text>
          </Text>
        </View>
      </Animated.View>

      {/* Action buttons */}
      <Animated.View style={[styles.btns, { opacity: fadeAnim }]}>
        {nextModule ? (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.replace({ pathname: "/lesson", params: { moduleId: nextModule.id } });
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Próximo Módulo: {nextModule.title}</Text>
            <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.success }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.replace("/"); }}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Treinamento Completo! Voltar ao Início</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: colors.border }]}
          onPress={() => { Haptics.selectionAsync(); router.replace("/"); }}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryBtnText, { color: colors.mutedForeground }]}>Voltar ao Início</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tertiaryBtn}
          onPress={() => { Haptics.selectionAsync(); router.replace({ pathname: "/lesson", params: { moduleId } }); }}
          activeOpacity={0.75}
        >
          <RotateCcw size={13} color={colors.mutedForeground} strokeWidth={2} />
          <Text style={[styles.tertiaryBtnText, { color: colors.mutedForeground }]}>Repetir este módulo</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "space-around", paddingHorizontal: 24 },
  iconWrap: { alignItems: "center", justifyContent: "center" },
  iconBg: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  glowOuter: { position: "absolute", width: 168, height: 168, borderRadius: 84, borderWidth: 1, opacity: 0.2 },
  glowMid:   { position: "absolute", width: 144, height: 144, borderRadius: 72, borderWidth: 1, opacity: 0.35 },
  textArea: { alignItems: "center", gap: 8, width: "100%" },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center" },
  modName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  statsRow: { flexDirection: "row", gap: 8, marginTop: 8, width: "100%" },
  statCard: { flex: 1, borderRadius: 10, borderWidth: 1, padding: 12, alignItems: "center", gap: 5 },
  statValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 9, fontFamily: "Inter_500Medium", textAlign: "center" },
  xpBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 11, width: "100%",
  },
  xpBarText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  btns: { width: "100%", gap: 10 },
  primaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: 12, paddingVertical: 16, paddingHorizontal: 20, gap: 6,
  },
  primaryBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: 0.2, textAlign: "center" },
  secondaryBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center", borderWidth: 1 },
  secondaryBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", letterSpacing: 0.2 },
  tertiaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8 },
  tertiaryBtnText: { fontSize: 12, fontFamily: "Inter_500Medium" },
});
