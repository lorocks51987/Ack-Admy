import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Platform } from "react-native";
import { Shield, Zap, BookOpen, Layers, AlertCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import type { BriefingExercise } from "@/constants/lessons";

interface Props {
  exercise: BriefingExercise;
  onStart: () => void;
}

const CATEGORY_META = {
  blue_team: { label: "BLUE TEAM", Icon: Shield, color: "#3B82F6" },
  red_team: { label: "RED TEAM", Icon: Zap, color: "#EF4444" },
  lgpd: { label: "LGPD", Icon: BookOpen, color: "#8B5CF6" },
  awareness: { label: "AWARENESS", Icon: AlertCircle, color: "#F59E0B" },
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Iniciante: "#22C55E",
  Intermediário: "#F59E0B",
  Avançado: "#EF4444",
};

export function BriefingScreen({ exercise, onStart }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const meta = CATEGORY_META[exercise.category];
  const diffColor = DIFFICULTY_COLOR[exercise.difficulty];
  const { Icon } = meta;

  React.useEffect(() => {
    const native = Platform.OS !== "web";
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1000, useNativeDriver: native }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: native }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 100 }]} showsVerticalScrollIndicator={false}>

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

        <View style={[styles.narrativeBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.narrativeHeader}>
            <BookOpen size={13} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.narrativeLabel, { color: colors.primary }]}>BRIEFING</Text>
          </View>
          <Text style={[styles.narrativeText, { color: colors.foreground }]}>{exercise.narrative}</Text>
        </View>

        {exercise.evidence ? (
          <View style={[styles.evidenceBox, { backgroundColor: "#0A0A0F", borderColor: colors.primary + "40" }]}>
            <View style={styles.evidenceHeader}>
              <View style={styles.termDots}>
                <View style={[styles.dot, { backgroundColor: "#EF4444" }]} />
                <View style={[styles.dot, { backgroundColor: "#F59E0B" }]} />
                <View style={[styles.dot, { backgroundColor: "#22C55E" }]} />
              </View>
              <Text style={[styles.termLabel, { color: colors.mutedForeground }]}>terminal — evidência</Text>
            </View>
            <Text style={[styles.evidenceText, { color: colors.primary }]}>{exercise.evidence}</Text>
          </View>
        ) : null}

        <View style={[styles.phasesRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {Array.from({ length: exercise.totalPhases }).map((_, i) => (
            <View key={i} style={styles.phaseItem}>
              <View style={[styles.phaseCircle, { borderColor: colors.primary, backgroundColor: colors.muted }]}>
                <Text style={[styles.phaseNum, { color: colors.primary }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.phaseLabel, { color: colors.mutedForeground }]}>
                {["Identificar", "Responder", "Remediar"][i] ?? `Fase ${i + 1}`}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: bottomPad + 12 }]}>
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
            <Text style={[styles.startBtnText]}>Iniciar Módulo</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, gap: 16 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", lineHeight: 30 },
  narrativeBox: { borderRadius: 10, borderWidth: 1, padding: 16, gap: 10 },
  narrativeHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  narrativeLabel: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  narrativeText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  evidenceBox: { borderRadius: 10, borderWidth: 1, overflow: "hidden" },
  evidenceHeader: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#1E1E2E" },
  termDots: { flexDirection: "row", gap: 5 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  termLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  evidenceText: { fontFamily: "Inter_500Medium", fontSize: 12, lineHeight: 22, padding: 14 },
  phasesRow: { flexDirection: "row", justifyContent: "space-around", borderRadius: 10, borderWidth: 1, padding: 16 },
  phaseItem: { alignItems: "center", gap: 8 },
  phaseCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  phaseNum: { fontSize: 14, fontFamily: "Inter_700Bold" },
  phaseLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1 },
  startBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 10, paddingVertical: 16, gap: 8 },
  startBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.3, color: "#FFFFFF" },
});
