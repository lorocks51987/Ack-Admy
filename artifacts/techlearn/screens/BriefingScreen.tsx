import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native";
import { ChevronRight, Target, BookOpen, Shield, AlertTriangle, Key, FileText, Mail } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Reanimated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import type { BriefingExercise } from "@/constants/lessons";

interface Props {
  exercise: BriefingExercise;
  onStart: () => void;
}

const CATEGORY_META: Record<BriefingExercise["category"], { label: string; color: string }> = {
  blue_team:   { label: "Blue Team",      color: "#3B82F6" },
  red_team:    { label: "Red Team",       color: "#EF4444" },
  lgpd:        { label: "LGPD",           color: "#8B5CF6" },
  awareness:   { label: "Conscientização", color: "#F59E0B" },
};

const DIFFICULTY_COLOR: Record<BriefingExercise["difficulty"], string> = {
  Iniciante:     "#10B981",
  Intermediário: "#F59E0B",
  Avançado:      "#EF4444",
};

const CATEGORY_ICON: Record<BriefingExercise["category"], React.ReactNode> = {
  blue_team: <Shield  size={14} color="#3B82F6" strokeWidth={2} />,
  red_team:  <AlertTriangle size={14} color="#EF4444" strokeWidth={2} />,
  lgpd:      <FileText size={14} color="#8B5CF6" strokeWidth={2} />,
  awareness: <Mail size={14} color="#F59E0B" strokeWidth={2} />,
};

/** Extrai até 3 bullets a partir do campo `evidence`.
 *  Estratégia: pega linhas não-vazias que não sejam cabeçalhos (sem "→").
 *  Fallback: primeiras 3 linhas com conteúdo. */
function extractObjectiveBullets(evidence: string): string[] {
  if (!evidence) return [];

  // Tenta pegar linhas com "→" (formato "Chave → Valor")
  const arrowLines = evidence
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.includes("→"));

  if (arrowLines.length >= 2) {
    return arrowLines.slice(0, 3).map(l => {
      // Pega só a parte do valor após →
      const parts = l.split("→");
      return parts.length > 1 ? parts[1].trim() : l;
    });
  }

  // Fallback: primeiras 3 linhas não-vazias sem cabeçalhos
  return evidence
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 4 && !l.endsWith(":") && !l.endsWith("—"))
    .slice(0, 3);
}

export function BriefingScreen({ exercise, onStart }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const catMeta = CATEGORY_META[exercise.category];
  const diffColor = DIFFICULTY_COLOR[exercise.difficulty];
  const bullets = extractObjectiveBullets(exercise.evidence);

  // Pega somente a primeira frase/parágrafo da narrativa (contexto curto)
  const shortContext = exercise.narrative
    .split("\n\n")[0]
    ?.split(". ")
    .slice(0, 2)
    .join(". ")
    .trim()
    .replace(/\.$/, "") + ".";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 110, 130) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Badges de categoria e dificuldade */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: catMeta.color + "15", borderColor: catMeta.color + "35" }]}>
            {CATEGORY_ICON[exercise.category]}
            <Text style={[styles.badgeText, { color: catMeta.color }]}>{catMeta.label}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: diffColor + "15", borderColor: diffColor + "35" }]}>
            <Text style={[styles.badgeText, { color: diffColor }]}>{exercise.difficulty}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <BookOpen size={12} color={colors.mutedForeground} strokeWidth={2} />
            <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
              {exercise.totalPhases} etapas
            </Text>
          </View>
        </View>

        {/* Título principal — forte e direto */}
        <Reanimated.View entering={FadeIn.duration(400)}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {exercise.scenarioTitle}
          </Text>
        </Reanimated.View>

        {/* Contexto — máximo 2 frases */}
        <Reanimated.View entering={FadeIn.duration(400).delay(100)}>
          <Text style={[styles.context, { color: colors.mutedForeground }]}>
            {shortContext}
          </Text>
        </Reanimated.View>

        {/* Bloco "Seu objetivo" */}
        {bullets.length > 0 && (
          <Reanimated.View 
            entering={FadeIn.duration(400).delay(200)}
            style={[styles.objectiveCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.objectiveHeader}>
              <View style={[styles.objectiveIconWrap, { backgroundColor: colors.primary + "14" }]}>
                <Target size={14} color={colors.primary} strokeWidth={2.5} />
              </View>
              <Text style={[styles.objectiveLabel, { color: colors.foreground }]}>Diretrizes de Aprendizado</Text>
            </View>
            <View style={styles.bulletList}>
              {bullets.map((bullet, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.bulletText, { color: colors.mutedForeground }]}>{bullet}</Text>
                </View>
              ))}
            </View>
          </Reanimated.View>
        )}
      </ScrollView>

      {/* Footer com botão principal */}
      <Reanimated.View 
        entering={FadeIn.duration(400)}
        style={[styles.footer, {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom + 8, 20),
        }]}
      >
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onStart();
          }}
          activeOpacity={0.88}
        >
          <Text style={styles.startBtnText}>Iniciar Módulo</Text>
          <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </Reanimated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, gap: 20 },

  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    lineHeight: 30,
    letterSpacing: -0.3,
  },

  context: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    marginTop: -4,
  },

  objectiveCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  objectiveHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  objectiveIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  objectiveLabel: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.1,
  },
  bulletList: { gap: 10, paddingLeft: 4 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 7,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },

  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 6,
  },
  startBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
