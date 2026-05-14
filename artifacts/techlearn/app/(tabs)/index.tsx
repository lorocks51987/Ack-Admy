import React from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import {
  Shield, Key, AlertTriangle, FileText, Mail,
  ChevronRight, Lock, Zap, Star, CheckCircle2,
  Users, BarChart3, Presentation,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useProgress } from "@/contexts/ProgressContext";
import { useAuth } from "@/contexts/AuthContext";
import { MODULE_DEFINITIONS } from "@/constants/lessons";

const ICON_MAP = {
  Shield, Key, AlertTriangle, FileText, Mail,
} as const;

const TAB_HEIGHT = Platform.OS === "ios" ? 88 : 64;

// ── ADMIN DASHBOARD COMPONENT ─────────────────────────────────────────

function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const summaryClasses = [
    { name: "ADS - 5º Termo", pct: 92 },
    { name: "Engenharia de Software", pct: 86 },
    { name: "Ciência da Computação", pct: 78 },
    { name: "Administração", pct: 64 },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.adminHeader, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.adminHeaderTitle, { color: colors.foreground }]}>Painel Professor/Admin</Text>
        <Text style={[styles.adminHeaderSub, { color: colors.mutedForeground }]}>Acompanhe o engajamento das turmas na trilha de segurança</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: TAB_HEIGHT + insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>MÉTRICAS GERAIS</Text>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: colors.primary + "15" }]}>
              <Users size={18} color={colors.primary} />
            </View>
            <Text style={[styles.metricValue, { color: colors.foreground }]}>124</Text>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Alunos ativos</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: "#F59E0B" + "15" }]}>
              <Star size={18} color="#F59E0B" />
            </View>
            <Text style={[styles.metricValue, { color: colors.foreground }]}>560</Text>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Média de XP</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: colors.success + "15" }]}>
              <CheckCircle2 size={18} color={colors.success} />
            </View>
            <Text style={[styles.metricValue, { color: colors.foreground }]}>342</Text>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Mód. concluídos</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: colors.primary + "15" }]}>
              <Presentation size={18} color={colors.primary} />
            </View>
            <Text style={[styles.metricValue, { color: colors.primary, fontSize: 13 }]} numberOfLines={1}>ADS - 5º T.</Text>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Turma destaque</Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 24 }]}>RESUMO DAS TURMAS</Text>
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {summaryClasses.map((cls, idx) => (
            <View key={cls.name} style={[
              styles.listItem, 
              idx < summaryClasses.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
            ]}>
              <Text style={[styles.className, { color: colors.foreground }]}>{cls.name}</Text>
              <View style={styles.classEngage}>
                <Text style={[styles.classEngageText, { color: colors.primary }]}>{cls.pct}%</Text>
                <Text style={[styles.classEngageLabel, { color: colors.mutedForeground }]}>engajamento</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.roadmapCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
          <BarChart3 size={24} color={colors.primary} />
          <View style={styles.roadmapInfo}>
            <Text style={[styles.roadmapTitle, { color: colors.primary }]}>Recursos futuros</Text>
            <Text style={[styles.roadmapDesc, { color: colors.foreground }]}>
              Em breve: relatórios, criação de trilhas, exportação de dados e visão por turma.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ── HOME SCREEN ───────────────────────────────────────────────────────

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { progress } = useProgress();
  const { profile, loading, profileLoading } = useAuth();

  if (loading || profileLoading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  // Se não existir profile, mostra aviso amigável
  if (!profile) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 20 }]}>
        <AlertTriangle size={48} color={colors.mutedForeground} style={{ marginBottom: 16 }} />
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", textAlign: "center", marginBottom: 8 }}>
          Perfil não encontrado.
        </Text>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 24 }}>
          Faça login novamente ou contate o suporte.
        </Text>
      </View>
    );
  }

  // Se for admin, exibe o painel. Se não, exibe a jornada normal de aluno.
  if (profile.role === "admin") {
    return <AdminDashboard />;
  }

  const completedCount = progress.completedModules.length;
  const totalModules = MODULE_DEFINITIONS.length;
  const progressPct = completedCount / totalModules;
  const accuracy = progress.totalExercises > 0
    ? Math.round((progress.correctAnswers / progress.totalExercises) * 100)
    : 0;

  const getModuleState = (mod: typeof MODULE_DEFINITIONS[0]) => {
    const isCompleted = progress.completedModules.includes(mod.id);
    const prevDone = mod.id === 1 || progress.completedModules.includes(mod.id - 1);
    return { isCompleted, isLocked: !prevDone && !isCompleted };
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Trilha de Segurança da Informação</Text>
            <Text style={[styles.name, { color: colors.foreground }]}>{profile.name || "Aluno"}</Text>
          </View>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Zap size={13} color="#F59E0B" strokeWidth={2} />
              <Text style={[styles.badgeText, { color: "#F59E0B" }]}>{progress.streak}d</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Star size={13} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>{progress.xp} XP</Text>
            </View>
          </View>
        </View>

        {/* Compliance bar */}
        <View style={styles.complianceArea}>
          <View style={styles.goalRow}>
            <Text style={[styles.goalLabel, { color: colors.mutedForeground }]}>Progresso da Trilha</Text>
            <Text style={[styles.goalValue, { color: colors.foreground }]}>{completedCount}/{totalModules} módulos</Text>
          </View>
          <View style={[styles.goalTrack, { backgroundColor: colors.muted }]}>
            <View style={[styles.goalFill, { backgroundColor: colors.primary, width: `${progressPct * 100}%` }]} />
          </View>
          <Text style={[
            styles.complianceStatus,
            { color: completedCount === totalModules ? colors.success : colors.warning },
          ]}>
            {completedCount === totalModules
              ? "✓ Você concluiu a jornada de segurança!"
              : `⚠ ${totalModules - completedCount} módulo(s) de segurança pendente(s)`}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: TAB_HEIGHT + insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats strip */}
        <View style={styles.statsStrip}>
          {[
            { label: "XP Total", value: String(progress.xp), color: colors.primary },
            { label: "Precisão", value: `${accuracy}%`, color: colors.success },
            { label: "Dias Ativos", value: `${progress.streak}d`, color: "#F59E0B" },
          ].map((s) => (
            <View key={s.label} style={[styles.statChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>MÓDULOS DE APRENDIZAGEM</Text>

        {MODULE_DEFINITIONS.map((mod, index) => {
          const { isCompleted, isLocked } = getModuleState(mod);
          const IconComp = ICON_MAP[mod.iconName];
          const accentColor = isCompleted ? colors.success : isLocked ? colors.mutedForeground : mod.accentColor;

          return (
            <View key={mod.id}>
              {index > 0 && (
                <View style={[styles.connector, {
                  backgroundColor: progress.completedModules.includes(mod.id - 1) ? colors.primary : colors.border,
                  marginLeft: 37,
                }]} />
              )}
              <TouchableOpacity
                style={[styles.card, {
                  backgroundColor: colors.card,
                  borderColor: isCompleted ? colors.success + "60" : isLocked ? colors.border : mod.accentColor + "40",
                  opacity: isLocked ? 0.45 : 1,
                }]}
                onPress={() => {
                  if (isLocked) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push({ pathname: "/lesson", params: { moduleId: mod.id } });
                }}
                activeOpacity={isLocked ? 1 : 0.8}
              >
                <View style={[styles.iconWrap, {
                  backgroundColor: accentColor + "18",
                  borderColor: accentColor + "50",
                }]}>
                  {isCompleted
                    ? <CheckCircle2 size={20} color={colors.success} strokeWidth={2} />
                    : <IconComp size={20} color={accentColor} strokeWidth={2} />
                  }
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>{mod.title}</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>{mod.subtitle}</Text>
                  <View style={styles.metaRow}>
                    <View style={[styles.diffBadge, { backgroundColor: accentColor + "20" }]}>
                      <Text style={[styles.diffText, { color: accentColor }]}>{mod.difficulty}</Text>
                    </View>
                    <Text style={[styles.lessonCount, { color: colors.mutedForeground }]}>
                      {mod.length - 1} exercícios
                    </Text>
                  </View>
                </View>
                {isCompleted
                  ? <CheckCircle2 size={18} color={colors.success} strokeWidth={2} />
                  : isLocked
                  ? <Lock size={16} color={colors.mutedForeground} strokeWidth={2} />
                  : <ChevronRight size={16} color={accentColor} strokeWidth={2} />
                }
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, gap: 14 },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  greeting: { fontSize: 11, fontFamily: "Inter_400Regular", letterSpacing: 0.5 },
  name: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 2 },
  badges: { flexDirection: "row", gap: 8 },
  badge: {
    flexDirection: "row", alignItems: "center", borderRadius: 20,
    borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, gap: 4,
  },
  badgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  complianceArea: { gap: 6 },
  goalRow: { flexDirection: "row", justifyContent: "space-between" },
  goalLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  goalValue: { fontSize: 11, fontFamily: "Inter_700Bold" },
  goalTrack: { height: 5, borderRadius: 3, overflow: "hidden" },
  goalFill: { height: 5, borderRadius: 3 },
  complianceStatus: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  scroll: { padding: 16, gap: 0 },
  statsStrip: { flexDirection: "row", gap: 8, marginBottom: 20 },
  statChip: {
    flex: 1, borderRadius: 10, borderWidth: 1,
    paddingVertical: 12, alignItems: "center", gap: 3,
  },
  statValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  sectionLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 2, marginBottom: 12 },
  connector: { width: 2, height: 12, marginBottom: 0 },
  card: {
    flexDirection: "row", alignItems: "center", borderRadius: 12,
    borderWidth: 1, padding: 14, gap: 12, marginBottom: 4,
  },
  iconWrap: {
    width: 46, height: 46, borderRadius: 12, borderWidth: 1,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  cardInfo: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  cardSubtitle: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  diffBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  diffText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  lessonCount: { fontSize: 10, fontFamily: "Inter_400Regular" },

  // Admin Dashboard specific styles
  adminHeader: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, gap: 6 },
  adminHeaderTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 8 },
  adminHeaderSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 8 },
  
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 8 },
  metricCard: { flex: 1, minWidth: "45%", borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  metricIconWrap: { width: 34, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  metricValue: { fontSize: 20, fontFamily: "Inter_800ExtraBold" },
  metricLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },

  listCard: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginTop: 4, marginBottom: 24 },
  listItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 16 },
  className: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  classEngage: { alignItems: "flex-end" },
  classEngageText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  classEngageLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },

  roadmapCard: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 16, gap: 16, marginBottom: 20 },
  roadmapInfo: { flex: 1, gap: 4 },
  roadmapTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  roadmapDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
