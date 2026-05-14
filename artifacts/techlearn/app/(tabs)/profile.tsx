import React from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert, ActivityIndicator
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Zap, Star, Target, BookOpen, CheckCircle2,
  AlertTriangle, FileText, Shield, Key, Mail, RotateCcw, TrendingUp, LogOut, Users,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useProgress } from "@/contexts/ProgressContext";
import { MODULE_DEFINITIONS } from "@/constants/lessons";
import { useAuth } from "@/contexts/AuthContext";

const ICON_MAP = { Shield, Key, AlertTriangle, FileText, Mail } as const;
const TAB_HEIGHT = Platform.OS === "ios" ? 88 : 64;
const XP_PER_LEVEL = 50;

const ACCENT_BLUE   = "#3B82F6";
const ACCENT_PURPLE = "#8B5CF6";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { progress, resetProgress } = useProgress();
  const { profile, loading, profileLoading, signOut } = useAuth();
  const router = useRouter();

  if (loading || profileLoading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 20 }]}>
        <Users size={48} color={colors.mutedForeground} style={{ marginBottom: 16 }} />
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", textAlign: "center", marginBottom: 8 }}>
          Perfil não encontrado.
        </Text>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 24 }}>
          Faça login novamente ou contate o suporte.
        </Text>
        <TouchableOpacity
          style={[styles.signOutBtn, { backgroundColor: colors.card, borderColor: colors.border, paddingHorizontal: 24 }]}
          onPress={() => signOut().then(() => router.replace("/sign-in" as any))}
        >
          <LogOut size={14} color={colors.mutedForeground} strokeWidth={2} />
          <Text style={[styles.signOutText, { color: colors.mutedForeground }]}>Sair</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isAdmin = profile.role === "admin";
  const displayName = profile.name || "User";
  const initials = getInitials(profile.name);
  const email = profile.email;
  
  const level       = Math.floor(progress.xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = progress.xp % XP_PER_LEVEL;
  const levelPct    = xpIntoLevel / XP_PER_LEVEL;
  const accuracy    = progress.totalExercises > 0
    ? Math.round((progress.correctAnswers / progress.totalExercises) * 100)
    : 0;

  const handleReset = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Resetar todo o progresso? Essa ação não pode ser desfeita.")) {
        resetProgress();
      }
    } else {
      Alert.alert(
        "Resetar Progresso",
        "Todo seu XP, módulos e histórico serão apagados. Deseja continuar?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Resetar", style: "destructive", onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            resetProgress();
          }},
        ],
      );
    }
  };

  const handleSignOut = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Deseja sair da sua conta?")) {
        signOut().then(() => router.replace("/sign-in" as any));
      }
    } else {
      Alert.alert("Sair", "Deseja sair da sua conta?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            signOut().then(() => router.replace("/sign-in" as any));
          },
        },
      ]);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + "25", borderColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={[styles.userName, { color: colors.foreground }]} numberOfLines={1}>{displayName}</Text>
            <Text style={[styles.userRole, { color: colors.mutedForeground }]}>
              {isAdmin ? "Professor / Admin Unimar" : `Nível ${level} — Aluno — ${profile.class_name || "ADS 5º Termo"}`}
            </Text>
            <Text style={[styles.userEmail, { color: colors.mutedForeground }]} numberOfLines={1}>{email}</Text>
          </View>
          {!isAdmin && (
            <View style={[styles.levelBadge, { backgroundColor: colors.primary + "20", borderColor: colors.primary }]}>
              <Text style={[styles.levelText, { color: colors.primary }]}>Nv {level}</Text>
            </View>
          )}
        </View>

        {!isAdmin && (
          <View style={styles.xpArea}>
            <View style={styles.xpRow}>
              <Text style={[styles.xpLabel, { color: colors.mutedForeground }]}>XP para Nível {level + 1}</Text>
              <Text style={[styles.xpValue, { color: colors.primary }]}>{xpIntoLevel}/{XP_PER_LEVEL} XP</Text>
            </View>
            <View style={[styles.xpTrack, { backgroundColor: colors.muted }]}>
              <View style={[styles.xpFill, { backgroundColor: colors.primary, width: `${levelPct * 100}%` }]} />
            </View>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: TAB_HEIGHT + insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {!isAdmin ? (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ESTATÍSTICAS</Text>
            <View style={styles.statsGrid}>
              {[
                { Icon: Star,        value: `${progress.xp}`,            label: "XP Total",   color: colors.primary },
                { Icon: Zap,         value: `${progress.streak}d`,       label: "Sequência",  color: colors.warning },
                { Icon: Target,      value: `${accuracy}%`,              label: "Precisão",   color: colors.success },
                { Icon: BookOpen,    value: `${progress.totalExercises}`, label: "Exercícios", color: ACCENT_BLUE },
                { Icon: CheckCircle2,value: `${progress.completedModules.length}`, label: "Módulos",   color: colors.success },
                { Icon: TrendingUp,  value: `${progress.correctAnswers}`, label: "Acertos",   color: ACCENT_PURPLE },
              ].map((s) => (
                <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <s.Icon size={20} color={s.color} strokeWidth={2} />
                  <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CONQUISTAS DE MÓDULO</Text>
            <View style={styles.badgesGrid}>
              {MODULE_DEFINITIONS.map((mod) => {
                const done     = progress.completedModules.includes(mod.id);
                const IconComp = ICON_MAP[mod.iconName];
                return (
                  <View
                    key={mod.id}
                    style={[
                      styles.modBadge,
                      {
                        backgroundColor: done ? mod.accentColor + "18" : colors.card,
                        borderColor:     done ? mod.accentColor + "60" : colors.border,
                        opacity:         done ? 1 : 0.4,
                      },
                    ]}
                  >
                    <IconComp size={24} color={done ? mod.accentColor : colors.mutedForeground} strokeWidth={2} />
                    <Text style={[styles.modBadgeTitle, { color: done ? colors.foreground : colors.mutedForeground }]} numberOfLines={2}>
                      {mod.title}
                    </Text>
                    {done && (
                      <View style={[styles.donePill, { backgroundColor: colors.success + "20" }]}>
                        <Text style={[styles.doneText, { color: colors.success }]}>Concluído</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {progress.totalExercises > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DESEMPENHO</Text>
                <View style={[styles.perfCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.perfRow}>
                    <View style={[styles.perfDot, { backgroundColor: colors.success }]} />
                    <Text style={[styles.perfLabel, { color: colors.foreground }]}>Respostas corretas</Text>
                    <Text style={[styles.perfValue, { color: colors.success }]}>{progress.correctAnswers}</Text>
                  </View>
                  <View style={styles.perfRow}>
                    <View style={[styles.perfDot, { backgroundColor: colors.error }]} />
                    <Text style={[styles.perfLabel, { color: colors.foreground }]}>Respostas incorretas</Text>
                    <Text style={[styles.perfValue, { color: colors.error }]}>{progress.totalExercises - progress.correctAnswers}</Text>
                  </View>
                  <View style={[styles.accBar, { backgroundColor: colors.muted }]}>
                    <View style={[styles.accFill, { backgroundColor: colors.success, width: `${accuracy}%` }]} />
                  </View>
                  <Text style={[styles.accPct, { color: colors.mutedForeground }]}>{accuracy}% de aproveitamento</Text>
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.resetBtn, { borderColor: colors.error + "50" }]}
              onPress={handleReset}
              activeOpacity={0.75}
            >
              <RotateCcw size={14} color={colors.error} strokeWidth={2} />
              <Text style={[styles.resetText, { color: colors.error }]}>Resetar progresso local</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={{ paddingVertical: 40, alignItems: "center", opacity: 0.6 }}>
            <Users size={48} color={colors.mutedForeground} strokeWidth={1} style={{ marginBottom: 16 }} />
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", textAlign: "center" }}>
              Estatísticas e relatórios detalhados{"\n"}estarão disponíveis em breve.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.signOutBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleSignOut}
          activeOpacity={0.75}
        >
          <LogOut size={14} color={colors.mutedForeground} strokeWidth={2} />
          <Text style={[styles.signOutText, { color: colors.mutedForeground }]}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1 },
  header:       { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, gap: 14 },
  avatarRow:    { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar:       { width: 56, height: 56, borderRadius: 28, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  avatarText:   { fontSize: 20, fontFamily: "Inter_700Bold" },
  avatarInfo:   { flex: 1 },
  userName:     { fontSize: 16, fontFamily: "Inter_700Bold" },
  userRole:     { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  userEmail:    { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  levelBadge:   { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  levelText:    { fontSize: 12, fontFamily: "Inter_700Bold" },
  xpArea:       { gap: 6 },
  xpRow:        { flexDirection: "row", justifyContent: "space-between" },
  xpLabel:      { fontSize: 11, fontFamily: "Inter_500Medium" },
  xpValue:      { fontSize: 11, fontFamily: "Inter_700Bold" },
  xpTrack:      { height: 6, borderRadius: 3, overflow: "hidden" },
  xpFill:       { height: 6, borderRadius: 3 },
  scroll:       { padding: 16, gap: 0 },
  sectionLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 2, marginBottom: 10, marginTop: 20 },
  statsGrid:    { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statCard:     { width: "30.5%", borderRadius: 10, borderWidth: 1, padding: 12, alignItems: "center", gap: 6 },
  statValue:    { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel:    { fontSize: 9, fontFamily: "Inter_500Medium", textAlign: "center" },
  badgesGrid:   { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  modBadge:     { width: "47%", borderRadius: 12, borderWidth: 1, padding: 14, alignItems: "center", gap: 8 },
  modBadgeTitle:{ fontSize: 11, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  donePill:     { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  doneText:     { fontSize: 9, fontFamily: "Inter_700Bold" },
  perfCard:     { borderRadius: 12, borderWidth: 1, padding: 16, gap: 10 },
  perfRow:      { flexDirection: "row", alignItems: "center", gap: 10 },
  perfDot:      { width: 8, height: 8, borderRadius: 4 },
  perfLabel:    { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  perfValue:    { fontSize: 14, fontFamily: "Inter_700Bold" },
  accBar:       { height: 6, borderRadius: 3, overflow: "hidden", marginTop: 4 },
  accFill:      { height: 6, borderRadius: 3 },
  accPct:       { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  resetBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, borderWidth: 1, gap: 8, marginTop: 24 },
  resetText:    { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  signOutBtn:   { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, borderWidth: 1, gap: 8, marginTop: 12 },
  signOutText:  { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
