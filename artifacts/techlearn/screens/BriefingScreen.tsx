import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Platform } from "react-native";
import { Shield, Zap, BookOpen, Layers, AlertCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import type { BriefingExercise } from "@/constants/lessons";

interface Props {
  exercise: BriefingExercise;
  onStart: () => void;
}

const CATEGORY_META = {
  blue_team:  { label: "BLUE TEAM",  Icon: Shield,       color: "#3B82F6" },
  red_team:   { label: "RED TEAM",   Icon: Zap,          color: "#EF4444" },
  lgpd:       { label: "LGPD",       Icon: BookOpen,     color: "#8B5CF6" },
  awareness:  { label: "AWARENESS",  Icon: AlertCircle,  color: "#F59E0B" },
} as const;

const DIFFICULTY_COLOR: Record<string, string> = {
  Iniciante:     "#22C55E",
  Intermediário: "#F59E0B",
  Avançado:      "#EF4444",
};

export function BriefingScreen({ exercise, onStart }: Props) {
  const colors = useColors();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const native = Platform.OS !== "web";

  const meta = CATEGORY_META[exercise.category];
  const diffColor = DIFFICULTY_COLOR[exercise.difficulty];
  const { Icon } = meta;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1000, useNativeDriver: native }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1000, useNativeDriver: native }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: meta.color + "20", borderColor: meta.color }]}>
            <Icon size={11} color={meta.color} strokeWidth={2} />
            <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: diffColor + "20", borderColor: diffColor }]}>
            <Text style={[styles.badgeText, { color: diffColor }]}>{exercise.difficulty}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Layers size={11} color={colors.mutedForeground} strokeWidth={2} />
            <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>{exercise.totalPhases} FASES</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>{exercise.scenarioTitle}</Text>

        {/* Narrative */}
        <View style={[styles.box, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.boxHeader}>
            <BookOpen size={13} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.boxLabel, { color: colors.primary }]}>BRIEFING</Text>
          </View>
          <Text style={[styles.narrative, { color: colors.foreground }]}>{exercise.narrative}</Text>
        </View>

        {/* Evidence terminal */}
        {!!exercise.evidence && (
          <View style={[styles.terminal, { backgroundColor: "#0A0A0F", borderColor: colors.primary + "40" }]}>
            <View style={[styles.termHeader, { borderBottomColor: "#1E1E2E" }]}>
              <View style={styles.termDots}>
                {["#EF4444", "#F59E0B", "#22C55E"].map((c) => (
                  <View key={c} style={[styles.dot, { backgroundColor: c }]} />
                ))}
              </View>
              <Text style={[styles.termLabel, { color: colors.mutedForeground }]}>terminal — evidência</Text>
            </View>
            <Text style={[styles.evidence, { color: colors.primary }]}>{exercise.evidence}</Text>
          </View>
        )}

        {/* Phase dots */}
        <View style={[styles.phasesRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {Array.from({ length: exercise.totalPhases }).map((_, i) => (
            <View key={i} style={styles.phaseItem}>
              <View style={[styles.phaseCircle, { borderColor: colors.primary, backgroundColor: colors.muted }]}>
                <Text style={[styles.phaseNum, { color: colors.primary }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.phaseLabel, { color: colors.mutedForeground }]}>
                {["Identificar", "Analisar", "Remediar", "Validar"][i] ?? `Fase ${i + 1}`}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer — not absolute, stays below scroll */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onStart();
            }}
            activeOpacity={0.85}
          >
            <Shield size={17} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.startBtnText}>Iniciar Módulo</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 24 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold", lineHeight: 28 },
  box: { borderRadius: 10, borderWidth: 1, padding: 16, gap: 10 },
  boxHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  boxLabel: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  narrative: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  terminal: { borderRadius: 10, borderWidth: 1, overflow: "hidden" },
  termHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
  },
  termDots: { flexDirection: "row", gap: 5 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  termLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  evidence: { fontFamily: "Inter_500Medium", fontSize: 12, lineHeight: 22, padding: 14 },
  phasesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
  },
  phaseItem: { alignItems: "center", gap: 8 },
  phaseCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  phaseNum: { fontSize: 14, fontFamily: "Inter_700Bold" },
  phaseLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  footer: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1 },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 16,
    gap: 8,
  },
  startBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.3, color: "#FFFFFF" },
});
