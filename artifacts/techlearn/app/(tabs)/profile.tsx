import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator, TextInput, Modal, Switch
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Zap, Star, Target, BookOpen, CheckCircle2,
  AlertTriangle, RotateCcw, LogOut, Users, Edit3,
  Award, Briefcase, GraduationCap, Compass, Layers, Landmark, ChevronRight, Info, ShoppingBag,
  Volume2, VolumeX, Lightbulb, Flame, Crown
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter, router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useProgress } from "@/contexts/ProgressContext";
import { MODULE_DEFINITIONS } from "@/constants/lessons";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabaseClient";
import { FeedbackFormModal } from "@/components/FeedbackFormModal";
import { MessageSquare } from "lucide-react-native";
import { audioService } from "@/services/audioService";

const TAB_HEIGHT = Platform.OS === "ios" ? 88 : 64;

// Local Fallback removed for simplicity in pilot

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
  const { progress, resetProgress, buyStreakFreeze } = useProgress();
  const { profile, loading, profileLoading, refreshProfile, signOut, isGuest } = useAuth();
  const router = useRouter();

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Custom Modal States
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Toggle de som
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Carrega estado de som
  useEffect(() => {
    setSoundEnabled(!audioService.isMuted());
    audioService.refreshSoundState().then(() => {
      setSoundEnabled(!audioService.isMuted());
    });
  }, []);

  // Admin summary state
  const [adminStats, setAdminStats] = useState<{
    totalStudents: number;
    totalClasses: number;
    averageXp: number;
    totalCompletions: number;
  } | null>(null);
  const [adminStatsLoading, setAdminStatsLoading] = useState(false);
  const [adminStatsError, setAdminStatsError] = useState<string | null>(null);

  // Initialize edit fields
  useEffect(() => {
    if (profile) {
      setEditName(profile.name || "");
    }
  }, [profile, isEditing]);

  // Load Admin Stats
  useEffect(() => {
    if (profile?.role === "admin") {
      const loadAdminStats = async () => {
        setAdminStatsLoading(true);
        setAdminStatsError(null);
        try {
          const { count: classesCount, error: cErr } = await supabase
            .from("classes")
            .select("id", { count: "exact", head: true });

          const { count: studentsCount, error: sErr } = await supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "student");

          const { data: progressData, error: pErr } = await supabase
            .from("user_progress")
            .select("xp, completed_modules");

          if (cErr) throw new Error(cErr.message);
          if (sErr) throw new Error(sErr.message);
          if (pErr) throw new Error(pErr.message);

          let totalXp = 0;
          let totalCompletions = 0;
          if (progressData && progressData.length > 0) {
            progressData.forEach((p) => {
              totalXp += p.xp || 0;
              totalCompletions += (p.completed_modules || []).length;
            });
          }
          const averageXp =
            progressData && progressData.length > 0
              ? Math.round(totalXp / progressData.length)
              : 0;

          setAdminStats({
            totalClasses: classesCount || 0,
            totalStudents: studentsCount || 0,
            averageXp,
            totalCompletions,
          });
        } catch (err: any) {
          console.warn("Failed to load admin stats in profile:", err);
          setAdminStatsError("Não foi possível carregar o resumo administrativo.");
        } finally {
          setAdminStatsLoading(false);
        }
      };
      loadAdminStats();
    }
  }, [profile]);

  if (loading || profileLoading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.loadingText, { color: colors.mutedForeground, marginTop: 12 }]}>Carregando perfil...</Text>
      </View>
    );
  }

  if (!profile && !isGuest) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 20 }]}>
        <Users size={48} color={colors.mutedForeground} style={{ marginBottom: 16 }} />
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", textAlign: "center", marginBottom: 8 }}>
          Perfil não encontrado.
        </Text>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 24 }}>
          Saia e entre novamente ou contate o suporte.
        </Text>
        <TouchableOpacity
          style={[styles.signOutBtn, { backgroundColor: colors.card, borderColor: colors.border, paddingHorizontal: 24 }]}
          onPress={() => signOut().then(() => router.replace("/sign-in" as any))}
        >
          <LogOut size={14} color={colors.mutedForeground} strokeWidth={2} />
          <Text style={[styles.signOutText, { color: colors.mutedForeground }]}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isAdmin = profile?.role === "admin";
  const displayName = profile?.name || "Visitante";
  const initials = getInitials(profile?.name || "?");
  const email = profile?.email || "Sem e-mail";

  // Student specific parameters
  const completedCount = progress.completedModules.length;
  const totalModules = MODULE_DEFINITIONS.length;
  const progressPct = totalModules > 0 ? completedCount / totalModules : 0;
  const accuracy = progress.totalExercises > 0
    ? Math.round((progress.correctAnswers / progress.totalExercises) * 100)
    : 0;

  // Lógica de Revisão Espaçada (Spaced Repetition)
  const todayDateStr = new Date().toISOString().split("T")[0];
  const pendingReviewsCount = Object.values(progress.spacedRepetition || {}).filter(
    (item) => item.nextReviewDate <= todayDateStr
  ).length;
  const legacyErrorsCount = (progress.failedQuestionIds || []).filter(
    id => !progress.spacedRepetition?.[id]
  ).length;
  const totalPendingReviews = pendingReviewsCount + legacyErrorsCount;
  const hasPendingReviews = totalPendingReviews > 0;
  
  const totalMastered = Object.values(progress.spacedRepetition || {}).filter(
    (item) => item.level >= 3
  ).length; // Just in case we want to show it, though it gets removed when mastered in our logic.

  // Save profile updates
  const handleSaveProfile = async () => {
    if (!profile) return;

    const cleanName = editName.trim().replace(/\s+/g, " ");
    if (!cleanName) {
      setUpdateError("O nome é obrigatório.");
      return;
    }
    if (cleanName.length < 3) {
      setUpdateError("O nome deve ter no mínimo 3 caracteres.");
      return;
    }

    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const updates: any = {
        name: cleanName,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id);

      if (error) throw new Error(error.message);

      if (profile) {
        await refreshProfile(profile.id);
      }
      setUpdateSuccess("Perfil atualizado com sucesso.");
      setIsEditing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      console.warn("Error updating profile:", err);
      setUpdateError("Não foi possível atualizar seu perfil. Tente novamente.");
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* HEADER DA TELA */}
      <View style={[styles.screenHeader, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>Meu Perfil</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {updateSuccess && (
          <View style={[styles.successBanner, { backgroundColor: colors.success + "15", borderColor: colors.success + "30" }]}>
            <Text style={[styles.successBannerText, { color: colors.success }]}>✓ {updateSuccess}</Text>
          </View>
        )}

        {updateError && (
          <View style={[styles.alertBanner, { backgroundColor: colors.error + "15", borderColor: colors.error + "30" }]}>
            <Text style={[styles.alertBannerText, { color: colors.error }]}>⚠ {updateError}</Text>
          </View>
        )}

        {isGuest ? (
          <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>?</Text>
            </View>
            <View style={styles.userCardInfo}>
              <Text style={[styles.userName, { color: colors.foreground }]} numberOfLines={1}>Visitante</Text>
              <Text style={[styles.userEmail, { color: colors.mutedForeground }]} numberOfLines={1}>Modo teste sem login</Text>
              
              <Text style={[styles.userSubtitle, { color: colors.mutedForeground, marginTop: 4, marginBottom: 8 }]}>
                Seu progresso atual é temporário e não será salvo na nuvem. Crie uma conta para salvar e liberar a trilha completa!
              </Text>

              <View style={{ flexDirection: 'column', gap: 8 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={{ flex: 1, backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6, alignItems: 'center' }} onPress={() => router.replace('/sign-up' as any)}>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>Criar conta</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1, borderWidth: 1, borderColor: colors.primary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6, alignItems: 'center' }} onPress={() => router.replace('/sign-in' as any)}>
                    <Text style={{ color: colors.primary, fontSize: 13, fontWeight: 'bold' }}>Entrar</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6, alignItems: 'center' }} onPress={async () => { await signOut(); }}>
                  <Text style={{ color: colors.mutedForeground, fontSize: 13, fontWeight: 'bold' }}>Sair do modo teste</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : isEditing ? (
          <View style={[styles.editFormContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.editFormTitle, { color: colors.foreground }]}>Editar Informações do Perfil</Text>

            <View style={styles.editFormField}>
              <Text style={[styles.editFormLabel, { color: colors.mutedForeground }]}>Nome Completo *</Text>
              <TextInput
                style={[styles.editFormInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Ex: João da Silva"
                placeholderTextColor={colors.mutedForeground}
                value={editName}
                onChangeText={setEditName}
              />
            </View>

            {!isAdmin && (
              <View style={styles.editFormField}>
                <Text style={[styles.readOnlyLabel, { color: colors.mutedForeground }]}>Turma</Text>
                <View style={[styles.readOnlyField, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.readOnlyText, { color: colors.mutedForeground }]}>{profile?.class_name || "Sem Turma"}</Text>
                </View>
                <Text style={[styles.readOnlyHelper, { color: colors.mutedForeground }]}>A turma não pode ser alterada pelo app.</Text>
              </View>
            )}

            {/* DADOS ACADÊMICOS APENAS LEITURA NO EDIT */}
            <View style={styles.editFormField}>
              <Text style={[styles.readOnlyLabel, { color: colors.mutedForeground }]}>E-mail Institucional</Text>
              <View style={[styles.readOnlyField, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.readOnlyText, { color: colors.mutedForeground }]}>{email}</Text>
              </View>
              <Text style={[styles.readOnlyHelper, { color: colors.mutedForeground }]}>O e-mail não pode ser alterado pelo app.</Text>
            </View>

            <View style={styles.editFormField}>
              <Text style={[styles.readOnlyLabel, { color: colors.mutedForeground }]}>Tipo de Conta</Text>
              <View style={[styles.readOnlyField, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.readOnlyText, { color: colors.mutedForeground }]}>{isAdmin ? "Professor/Admin" : "Aluno Unimar"}</Text>
              </View>
              <Text style={[styles.readOnlyHelper, { color: colors.mutedForeground }]}>Gerenciado pela secretaria acadêmica.</Text>
            </View>

            <View style={styles.editFormActionsRow}>
              <TouchableOpacity
                style={[styles.editFormCancelBtn, { borderColor: colors.border }]}
                onPress={() => {
                  setIsEditing(false);
                  setUpdateError(null);
                }}
                disabled={updateLoading}
              >
                <Text style={[styles.editFormCancelText, { color: colors.mutedForeground }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editFormSubmitBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveProfile}
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.editFormSubmitText}>Salvar Alterações</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* VISÃO NORMAL DE DADOS */
          <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
            </View>
            <View style={styles.userCardInfo}>
              <Text style={[styles.userName, { color: colors.foreground }]} numberOfLines={1}>{displayName}</Text>
              <Text style={[styles.userEmail, { color: colors.mutedForeground }]} numberOfLines={1}>{email}</Text>
              
              <View style={styles.badgeRow}>
                <View style={[styles.roleBadge, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
                  <Text style={[styles.roleBadgeText, { color: colors.primary }]}>
                    {isAdmin ? "Professor/Admin" : "Aluno Unimar"}
                  </Text>
                </View>
              </View>

              <Text style={[styles.userSubtitle, { color: colors.mutedForeground }]}>
                {isAdmin ? "Professor/Admin Unimar" : (
                  profile?.course && profile?.term && profile?.room 
                    ? `${profile.course} • ${profile.term} Sala ${profile.room}`
                    : `Aluno — ${profile?.class_name || "Sem Turma"}`
                )}
              </Text>

              {/* BOTÃO DE EDITAR PERFIL */}
              <TouchableOpacity
                style={[styles.editProfileBtn, { borderColor: colors.primary + "40" }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsEditing(true);
                  setUpdateSuccess(null);
                  setUpdateError(null);
                }}
              >
                <Edit3 size={12} color={colors.primary} />
                <Text style={[styles.editProfileText, { color: colors.primary }]}>Editar perfil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* PERFIL DO ALUNO */}
        {!isAdmin ? (
          <>
            {/* ESTADO SEM PROGRESSO */}
            {progress.xp === 0 && completedCount === 0 && (
              <View style={[styles.alertBanner, { backgroundColor: colors.primary + "08", borderColor: colors.primary + "20" }]}>
                <Info size={16} color={colors.primary} />
                <Text style={[styles.alertBannerText, { color: colors.primary }]}>
                  Comece o primeiro módulo para acompanhar sua evolução.
                </Text>
              </View>
            )}

            {/* RESUMO DE PROGRESSO */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>RESUMO DE PROGRESSO</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Star size={20} color="#F59E0B" />
                <Text style={[styles.statValue, { color: colors.foreground }]}>{progress.xp}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>XP Total</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <CheckCircle2 size={20} color="#10B981" />
                <Text style={[styles.statValue, { color: colors.foreground }]}>{completedCount}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Módulos</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Target size={20} color="#3B82F6" />
                <Text style={[styles.statValue, { color: colors.foreground }]}>{accuracy}%</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Precisão</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Zap size={20} color="#EF4444" />
                <Text style={[styles.statValue, { color: colors.foreground }]}>{progress.streak}d</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Dias Ativos</Text>
              </View>
            </View>

            {/* PROGRESSO DA TRILHA */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PROGRESSO DA TRILHA</Text>
            <View style={[styles.trilhaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.trilhaHeader}>
                <GraduationCap size={18} color={colors.primary} />
                <Text style={[styles.trilhaTitle, { color: colors.foreground }]}>Trilha de Segurança</Text>
                <Text style={[styles.trilhaPctText, { color: colors.primary }]}>{Math.round(progressPct * 100)}%</Text>
              </View>
              <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
                <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${progressPct * 100}%` }]} />
              </View>
              <Text style={[styles.trilhaInfoText, { color: colors.mutedForeground }]}>
                {completedCount} de {totalModules} módulos concluídos
              </Text>
            </View>

            {/* PRÓXIMO OBJETIVO */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PRÓXIMO OBJETIVO</Text>
            <View style={[styles.objectiveCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Compass size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.objectiveLabel, { color: colors.mutedForeground }]}>Sua próxima meta</Text>
                <Text style={[styles.objectiveDesc, { color: colors.foreground }]}>
                  {completedCount === 0
                    ? "Comece pelo primeiro módulo da trilha."
                    : completedCount < totalModules
                    ? "Continue sua trilha para liberar novos módulos."
                    : "Você concluiu a trilha de Segurança da Informação."}
                </Text>
              </View>
            </View>

            {/* CAIXA DE ERROS / MISTAKES INBOX */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>REVISÃO E APRENDIZADO</Text>
            <View style={[styles.objectiveCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <AlertTriangle size={20} color={hasPendingReviews ? "#EF4444" : colors.mutedForeground} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.objectiveLabel, { color: colors.mutedForeground }]}>Caixa de Erros Inteligente</Text>
                <Text style={[styles.objectiveDesc, { color: colors.foreground }]}>
                  {!hasPendingReviews
                    ? "Nenhuma revisão programada para hoje. Ótimo trabalho!"
                    : `${totalPendingReviews} ${totalPendingReviews === 1 ? "revisão agendada" : "revisões agendadas"} para hoje`}
                </Text>
              </View>
              {hasPendingReviews && (
                <TouchableOpacity
                  style={{ backgroundColor: "#EF4444", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push({ pathname: "/lesson", params: { moduleId: "mistakes" } } as any);
                  }}
                >
                  <Text style={{ color: "#FFF", fontSize: 12, fontFamily: "Inter_700Bold" }}>Revisar</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* LOJA DO ALUNO */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>LOJA DO ALUNO</Text>
            <View style={[styles.trilhaCard, { backgroundColor: colors.card, borderColor: colors.border, padding: 0, overflow: "hidden" }]}>
              {/* Header da loja */}
              <View style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + "15", alignItems: "center", justifyContent: "center" }}>
                  <ShoppingBag size={20} color={colors.primary} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground }}>Loja de Itens</Text>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 }}>Use XP para desbloquear vantagens</Text>
                </View>
                <View style={{ backgroundColor: "#F59E0B15", borderRadius: 6, borderWidth: 1, borderColor: "#F59E0B40", paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: "#F59E0B", letterSpacing: 0.5 }}>EM BREVE</Text>
                </View>
              </View>
              {/* Items da loja */}
              {[
                { icon: Zap, color: "#F59E0B", name: "Protetor de Ofensiva", desc: "Proteja seu streak por 1 dia", cost: 100 },
                { icon: Lightbulb, color: "#3B82F6", name: "Dica Extra", desc: "Uma dica gratuita em qualquer questão", cost: 50 },
                { icon: CheckCircle2, color: "#10B981", name: "Segunda Chance", desc: "Continue o módulo com vidas cheias", cost: 75 },
                { icon: Star, color: "#8B5CF6", name: "Cosméticos", desc: "Personalize seu perfil", cost: 0 },
              ].map((item, idx, arr) => (
                <View
                  key={item.name}
                  style={[
                    { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
                    idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                  ]}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: item.color + "15", alignItems: "center", justifyContent: "center" }}>
                    <item.icon size={18} color={item.color} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{item.name}</Text>
                    <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 }}>{item.desc}</Text>
                    {item.cost > 0 && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 }}>
                        <Zap size={10} color="#F59E0B" />
                        <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#F59E0B" }}>{item.cost} XP</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ backgroundColor: colors.input, borderRadius: 8, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground }}>Em breve</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* CONQUISTAS E EMBLEMAS */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CONQUISTAS E EMBLEMAS</Text>
            <View style={[styles.trilhaCard, { backgroundColor: colors.card, borderColor: colors.border, padding: 14 }]}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" }}>
                {[
                  {
                    id: "first_steps",
                    title: "Primeiros Passos",
                    desc: "Concluiu 1 módulo",
                    icon: Award,
                    color: "#3B82F6",
                  },
                  {
                    id: "master_match",
                    title: "Mestre do Match",
                    desc: "20 acertos no app",
                    icon: Target,
                    color: "#10B981",
                  },
                  {
                    id: "invincible",
                    title: "Invencível",
                    desc: "Acumulou 100 XP",
                    icon: Star,
                    color: "#F59E0B",
                  },
                  {
                    id: "constant_fire",
                    title: "Fogo Constante",
                    desc: "Ofensiva de 3 dias",
                    icon: Flame,
                    color: "#EF4444",
                  },
                  {
                    id: "no_fear_of_error",
                    title: "Sem Medo de Errar",
                    desc: "Errou 5+ questões",
                    icon: Zap,
                    color: "#8B5CF6",
                  },
                  {
                    id: "helper_used",
                    title: "Usou a Cabeça",
                    desc: "Usou 3+ dicas",
                    icon: Lightbulb,
                    color: "#06B6D4",
                  },
                  {
                    id: "legendary_guardian",
                    title: "Guardião Lendário",
                    desc: "Concluiu o curso",
                    icon: Crown,
                    color: "#D97706",
                  },
                ].map((badge) => {
                  const unlocked = progress.achievements && progress.achievements.includes(badge.id);
                  const BadgeIcon = badge.icon;
                  return (
                    <View
                      key={badge.id}
                      style={{
                        width: "47%",
                        alignItems: "center",
                        padding: 12,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: unlocked ? badge.color + "40" : colors.border,
                        backgroundColor: unlocked ? badge.color + "08" : colors.background,
                        opacity: unlocked ? 1 : 0.45,
                      }}
                    >
                      <View
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 21,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: unlocked ? badge.color + "18" : colors.border,
                          marginBottom: 6,
                        }}
                      >
                        <BadgeIcon size={20} color={unlocked ? badge.color : colors.mutedForeground} />
                      </View>
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Inter_700Bold",
                          color: unlocked ? colors.foreground : colors.mutedForeground,
                          textAlign: "center",
                        }}
                      >
                        {badge.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 9,
                          fontFamily: "Inter_500Medium",
                          color: colors.mutedForeground,
                          textAlign: "center",
                          marginTop: 2,
                        }}
                      >
                        {badge.desc}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
            {/* CONFIGURAÇÕES */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CONFIGURAÇÕES</Text>
            <View style={[styles.academicCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.academicRow}>
                {soundEnabled
                  ? <Volume2 size={16} color={colors.primary} strokeWidth={2} />
                  : <VolumeX size={16} color={colors.mutedForeground} strokeWidth={2} />
                }
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>Efeitos Sonoros</Text>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 }}>
                    {soundEnabled ? "Sons ativados" : "Sons desativados"}
                  </Text>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={async (val) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSoundEnabled(val);
                    await audioService.setMuted(!val);
                  }}
                  trackColor={{ false: colors.border, true: colors.primary + "80" }}
                  thumbColor={soundEnabled ? colors.primary : colors.mutedForeground}
                />
              </View>
            </View>

            {/* DADOS ACADÊMICOS */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DADOS ACADÊMICOS</Text>
            <View style={[styles.academicCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.academicRow, { borderBottomWidth: 1, borderBottomColor: colors.border + "50" }]}>
                <Landmark size={15} color={colors.mutedForeground} />
                <Text style={[styles.academicLabel, { color: colors.mutedForeground }]}>Turma</Text>
                <Text style={[styles.academicValue, { color: colors.foreground }]}>{profile?.class_name || "Sem Turma"}</Text>
              </View>
              {profile?.course && (
                <View style={[styles.academicRow, { borderBottomWidth: 1, borderBottomColor: colors.border + "50" }]}>
                  <Text style={[styles.academicLabel, { color: colors.mutedForeground }]}>Curso</Text>
                  <Text style={[styles.academicValue, { color: colors.foreground }]}>{profile.course}</Text>
                </View>
              )}
              {profile?.term && (
                <View style={[styles.academicRow, { borderBottomWidth: 1, borderBottomColor: colors.border + "50" }]}>
                  <Text style={[styles.academicLabel, { color: colors.mutedForeground }]}>Termo</Text>
                  <Text style={[styles.academicValue, { color: colors.foreground }]}>{profile.term}</Text>
                </View>
              )}
              {profile?.room && (
                <View style={[styles.academicRow, { borderBottomWidth: 1, borderBottomColor: colors.border + "50" }]}>
                  <Text style={[styles.academicLabel, { color: colors.mutedForeground }]}>Sala</Text>
                  <Text style={[styles.academicValue, { color: colors.foreground }]}>{profile.room}</Text>
                </View>
              )}
              <View style={[styles.academicRow, { borderBottomWidth: 1, borderBottomColor: colors.border + "50" }]}>
                <Award size={15} color={colors.mutedForeground} />
                <Text style={[styles.academicLabel, { color: colors.mutedForeground }]}>Tipo de Conta</Text>
                <Text style={[styles.academicValue, { color: colors.foreground }]}>Aluno Unimar</Text>
              </View>
              <View style={styles.academicRow}>
                <Users size={15} color={colors.mutedForeground} />
                <Text style={[styles.academicLabel, { color: colors.mutedForeground }]}>E-mail</Text>
                <Text style={[styles.academicValue, { color: colors.foreground }]} numberOfLines={1}>{email}</Text>
              </View>
            </View>
          </>
        ) : (
          /* PERFIL PROFESSOR/ADMIN */
          <>
            {/* IDENTIDADE ADMINISTRATIVA */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>IDENTIDADE ADMINISTRATIVA</Text>
            <View style={[styles.academicCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.academicRow, { borderBottomWidth: 1, borderBottomColor: colors.border + "50" }]}>
                <Award size={15} color={colors.primary} />
                <Text style={[styles.academicLabel, { color: colors.mutedForeground }]}>Tipo de Conta</Text>
                <Text style={[styles.academicValue, { color: colors.foreground }]}>Professor/Admin</Text>
              </View>
              <View style={[styles.academicRow, { borderBottomWidth: 1, borderBottomColor: colors.border + "50" }]}>
                <Users size={15} color={colors.primary} />
                <Text style={[styles.academicLabel, { color: colors.mutedForeground }]}>Acesso</Text>
                <Text style={[styles.academicValue, { color: colors.foreground }]}>Gestão de turmas</Text>
              </View>
              <View style={styles.academicRow}>
                <Compass size={15} color={colors.primary} />
                <Text style={[styles.academicLabel, { color: colors.mutedForeground }]}>Permissão</Text>
                <Text style={[styles.academicValue, { color: colors.foreground }]}>Acompanhamento acadêmico</Text>
              </View>
            </View>

            {/* RESUMO ADMINISTRATIVO (MÉTRICAS SUPABASE EM TEMPO REAL) */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>RESUMO ADMINISTRATIVO</Text>
            
            {adminStatsLoading ? (
              <View style={[styles.adminCard, { backgroundColor: colors.card, borderColor: colors.border, padding: 24, alignItems: "center" }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.adminLoadingText, { color: colors.mutedForeground, marginTop: 8 }]}>
                  Carregando dados acadêmicos...
                </Text>
              </View>
            ) : adminStatsError ? (
              <View style={[styles.adminCard, { backgroundColor: colors.card, borderColor: colors.border, padding: 16, alignItems: "center" }]}>
                <AlertTriangle size={24} color={colors.warning} style={{ marginBottom: 8 }} />
                <Text style={{ color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center" }}>
                  {adminStatsError}
                </Text>
              </View>
            ) : adminStats ? (
              <View style={styles.statsGrid}>
                <View style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <GraduationCap size={20} color={colors.primary} />
                  <Text style={[styles.statValue, { color: colors.foreground }]}>{adminStats.totalStudents}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Alunos Ativos</Text>
                </View>
                <View style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Landmark size={20} color="#8B5CF6" />
                  <Text style={[styles.statValue, { color: colors.foreground }]}>{adminStats.totalClasses}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Turmas Reais</Text>
                </View>
                <View style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Star size={20} color="#F59E0B" />
                  <Text style={[styles.statValue, { color: colors.foreground }]}>{adminStats.averageXp}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Média de XP</Text>
                </View>
                <View style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <CheckCircle2 size={20} color="#10B981" />
                  <Text style={[styles.statValue, { color: colors.foreground }]}>{adminStats.totalCompletions}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Conclusões</Text>
                </View>
              </View>
            ) : (
              <View style={[styles.adminCard, { backgroundColor: colors.card, borderColor: colors.border, padding: 16, alignItems: "center" }]}>
                <Text style={{ color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_500Medium" }}>
                  Nenhum dado administrativo encontrado ainda.
                </Text>
              </View>
            )}

            {/* ACESSO RÁPIDO */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACESSO RÁPIDO</Text>
            <View style={{ gap: 8 }}>
              <TouchableOpacity
                style={[styles.quickAccessBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push("/(tabs)" as any)}
                activeOpacity={0.75}
              >
                <Layers size={18} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.quickAccessTitle, { color: colors.foreground }]}>Painel de turmas</Text>
                  <Text style={[styles.quickAccessSub, { color: colors.mutedForeground }]}>Acesse a lista e detalhes de alunos</Text>
                </View>
                <ChevronRight size={16} color={colors.mutedForeground} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickAccessBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push("/(tabs)/ranking" as any)}
                activeOpacity={0.75}
              >
                <Star size={18} color="#F59E0B" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.quickAccessTitle, { color: colors.foreground }]}>Ranking Unimar</Text>
                  <Text style={[styles.quickAccessSub, { color: colors.mutedForeground }]}>Veja o engajamento geral das turmas</Text>
                </View>
                <ChevronRight size={16} color={colors.mutedForeground} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickAccessBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push("/(tabs)" as any)}
                activeOpacity={0.75}
              >
                <Landmark size={18} color="#8B5CF6" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.quickAccessTitle, { color: colors.foreground }]}>Gestão de turmas</Text>
                  <Text style={[styles.quickAccessSub, { color: colors.mutedForeground }]}>Gerencie, cadastre ou edite novas turmas</Text>
                </View>
                <ChevronRight size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* RECURSOS ADMINISTRATIVOS */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>RECURSOS ADMINISTRATIVOS</Text>
            <View style={[styles.academicCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.academicRow, { borderBottomWidth: 1, borderBottomColor: colors.border + "50" }]}>
                <CheckCircle2 size={14} color="#10B981" />
                <Text style={[styles.featureText, { color: colors.foreground }]}>Acompanhar turmas</Text>
              </View>
              <View style={[styles.academicRow, { borderBottomWidth: 1, borderBottomColor: colors.border + "50" }]}>
                <CheckCircle2 size={14} color="#10B981" />
                <Text style={[styles.featureText, { color: colors.foreground }]}>Visualizar desempenho dos alunos</Text>
              </View>
              <View style={[styles.academicRow, { borderBottomWidth: 1, borderBottomColor: colors.border + "50" }]}>
                <CheckCircle2 size={14} color="#10B981" />
                <Text style={[styles.featureText, { color: colors.foreground }]}>Gerenciar turmas</Text>
              </View>
              <View style={styles.academicRow}>
                <CheckCircle2 size={14} color="#10B981" />
                <Text style={[styles.featureText, { color: colors.foreground }]}>Consultar ranking geral</Text>
              </View>
            </View>

            {/* ROADMAP CURTO */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ROADMAP DO SISTEMA</Text>
            <View style={[styles.roadmapCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Briefcase size={16} color={colors.primary} />
              <Text style={[styles.roadmapText, { color: colors.mutedForeground }]}>
                Em breve: relatórios analíticos, exportações e criação dinâmica de trilhas.
              </Text>
            </View>
          </>
        )}

        {/* SEÇÃO DE FEEDBACK */}
        {!isAdmin && !isGuest && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>AJUDE A MELHORAR O ACK-ADMY</Text>
            <View style={[styles.feedbackCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.feedbackHeader}>
                <MessageSquare size={20} color={colors.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.feedbackTitle, { color: colors.foreground }]}>Feedback da experiência</Text>
                  <Text style={[styles.feedbackSub, { color: colors.mutedForeground }]}>
                    Depois de concluir o primeiro módulo, envie sua opinião sobre a experiência.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.feedbackBtn,
                  completedCount === 0 ? { backgroundColor: colors.input, borderColor: colors.border } : { backgroundColor: colors.primary }
                ]}
                disabled={completedCount === 0}
                onPress={() => setShowFeedbackModal(true)}
              >
                <Text style={[
                  styles.feedbackBtnText,
                  completedCount === 0 ? { color: colors.mutedForeground } : { color: "#fff" }
                ]}>
                  {completedCount === 0 ? "Conclua o primeiro módulo para liberar o feedback" : "Enviar feedback"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* AÇÕES DA CONTA */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>AÇÕES DA CONTA</Text>
        <View style={[styles.actionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {!isAdmin && !isGuest ? (
            <TouchableOpacity
              style={[styles.actionRowBtn, { borderBottomWidth: 1, borderBottomColor: colors.border + "50" }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowResetModal(true);
              }}
              activeOpacity={0.75}
            >
              <RotateCcw size={16} color={colors.error} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, { color: colors.error }]}>Resetar progresso</Text>
                <Text style={[styles.actionSub, { color: colors.mutedForeground }]}>
                  Zera seu XP, estatísticas e recomeça a trilha
                </Text>
              </View>
            </TouchableOpacity>
          ) : !isGuest ? (
            <View style={[styles.actionInfoContainer, { borderBottomWidth: 1, borderBottomColor: colors.border + "50" }]}>
              <Info size={16} color={colors.mutedForeground} />
              <Text style={[styles.actionInfoText, { color: colors.mutedForeground }]}>
                Contas administrativas não possuem progresso de trilha.
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.actionRowBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowLogoutModal(true);
            }}
            activeOpacity={0.75}
          >
            <LogOut size={16} color={colors.mutedForeground} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionTitle, { color: colors.foreground }]}>Sair da conta</Text>
              <Text style={[styles.actionSub, { color: colors.mutedForeground }]}>
                Encerra a sessão e retorna à tela de login
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL CUSTOMIZADO DE LOGOUT */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Sair da conta?</Text>
            <Text style={[styles.modalText, { color: colors.mutedForeground }]}>
              Você será desconectado da sua conta atual.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtnCancel, { borderColor: colors.border }]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={[styles.modalBtnCancelText, { color: colors.mutedForeground }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnDestructive, { backgroundColor: colors.error }]}
                onPress={() => {
                  setShowLogoutModal(false);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  signOut().then(() => router.replace("/sign-in" as any));
                }}
              >
                <Text style={styles.modalBtnDestructiveText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL CUSTOMIZADO DE RESET */}
      <Modal
        visible={showResetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Resetar progresso?</Text>
            <Text style={[styles.modalText, { color: colors.mutedForeground }]}>
              Essa ação zera seu XP, módulos concluídos e estatísticas. Não será possível desfazer.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtnCancel, { borderColor: colors.border }]}
                onPress={() => setShowResetModal(false)}
              >
                <Text style={[styles.modalBtnCancelText, { color: colors.mutedForeground }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnDestructive, { backgroundColor: colors.error }]}
                onPress={() => {
                  setShowResetModal(false);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  resetProgress();
                }}
              >
                <Text style={styles.modalBtnDestructiveText}>Resetar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FEEDBACK MODAL */}
      <FeedbackFormModal
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        userId={profile?.id || ""}
        userName={profile?.name || ""}
        userEmail={profile?.email || ""}
        course={profile?.course || null}
        term={profile?.term || null}
        room={profile?.room || null}
        className={profile?.class_name || null}
        onSuccess={() => {
          // You could optionally set a state here to show "Feedback já enviado" instead of the button.
          // For now, it just closes.
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  screenHeader: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  screenTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 8 },
  scroll: { padding: 16 },
  
  // CARD PRINCIPAL
  userCard: { flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 1, padding: 18, gap: 16, marginBottom: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 22, fontFamily: "Inter_700Bold" },
  userCardInfo: { flex: 1, gap: 2 },
  userName: { fontSize: 18, fontFamily: "Inter_700Bold" },
  userEmail: { fontSize: 12, fontFamily: "Inter_400Regular" },
  badgeRow: { flexDirection: "row", marginTop: 4, marginBottom: 2 },
  roleBadge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  roleBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.5 },
  userSubtitle: { fontSize: 11, fontFamily: "Inter_500Medium" },

  // EDIÇÃO DE PERFIL
  editFormContainer: { borderRadius: 16, borderWidth: 1, padding: 18, gap: 12, marginBottom: 16 },
  editFormTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 4 },
  editFormField: { gap: 6 },
  editFormLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  editFormInput: { height: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, fontSize: 14, fontFamily: "Inter_400Regular" },
  infoWarningBox: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: 8, padding: 10, marginVertical: 2 },
  infoWarningText: { flex: 1, fontSize: 10, fontFamily: "Inter_500Medium", lineHeight: 14 },
  inlineSelectBtn: { height: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderRadius: 8, paddingHorizontal: 12 },
  dropdownScroll: { borderWidth: 1, borderRadius: 8, marginTop: 4, overflow: "hidden" },
  dropdownRowBtn: { paddingVertical: 12, paddingHorizontal: 16 },
  dropdownRowText: { fontSize: 13 },
  readOnlyLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  readOnlyField: { height: 42, borderWidth: 1, borderRadius: 8, justifyContent: "center", paddingHorizontal: 12, opacity: 0.7 },
  readOnlyText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  readOnlyHelper: { fontSize: 9, fontFamily: "Inter_400Regular" },
  editFormActionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 12 },
  editFormCancelBtn: { height: 40, borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, justifyContent: "center", alignItems: "center" },
  editFormCancelText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  editFormSubmitBtn: { height: 40, borderRadius: 8, paddingHorizontal: 16, justifyContent: "center", alignItems: "center", minWidth: 120 },
  editFormSubmitText: { color: "#FFF", fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // ALERTA
  alertBanner: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 10, padding: 12, gap: 8, marginBottom: 12 },
  alertBannerText: { flex: 1, fontSize: 11, fontFamily: "Inter_500Medium", lineHeight: 15 },
  successBanner: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 10, padding: 12, gap: 8, marginBottom: 12 },
  successBannerText: { flex: 1, fontSize: 11, fontFamily: "Inter_600SemiBold" },

  // LABELS E GRIDS
  sectionLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5, marginBottom: 8, marginTop: 18 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 4 },
  statItem: { flex: 1, minWidth: "45%", borderRadius: 12, borderWidth: 1, padding: 14, alignItems: "center", gap: 6 },
  statValue: { fontSize: 22, fontFamily: "Inter_800ExtraBold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },

  // TRILHA
  trilhaCard: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 10 },
  trilhaHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  trilhaTitle: { flex: 1, fontSize: 14, fontFamily: "Inter_700Bold" },
  trilhaPctText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  progressBarTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressBarFill: { height: 6, borderRadius: 3 },
  trilhaInfoText: { fontSize: 11, fontFamily: "Inter_500Medium" },

  // OBJETIVO
  objectiveCard: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 14, gap: 12 },
  objectiveLabel: { fontSize: 10, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  objectiveDesc: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginTop: 2 },

  // DADOS ACADÊMICOS
  academicCard: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  academicRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16, gap: 10 },
  academicLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  academicValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  featureText: { fontSize: 13, fontFamily: "Inter_500Medium" },

  // ADMIN SPECIFIC
  adminCard: { borderRadius: 12, borderWidth: 1 },
  adminLoadingText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  quickAccessBtn: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 14, gap: 12 },
  quickAccessTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  quickAccessSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  roadmapCard: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  roadmapText: { flex: 1, fontSize: 12, fontFamily: "Inter_500Medium", lineHeight: 18 },

  // AÇÕES
  actionsCard: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  actionRowBtn: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  actionTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  actionSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  actionInfoContainer: { flexDirection: "row", alignItems: "center", padding: 16, gap: 8 },
  actionInfoText: { flex: 1, fontSize: 11, fontFamily: "Inter_500Medium" },

  signOutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 10, borderWidth: 1, gap: 8, marginTop: 12 },
  signOutText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  editProfileBtn: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 4, borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginTop: 6 },
  editProfileText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  // MODAIS CUSTOMIZADOS
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalCard: { width: "100%", maxWidth: 340, borderRadius: 16, borderWidth: 1, padding: 20, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 8 },
  modalBtnCancel: { height: 38, borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, justifyContent: "center", alignItems: "center" },
  modalBtnCancelText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  modalBtnDestructive: { height: 38, borderRadius: 8, paddingHorizontal: 14, justifyContent: "center", alignItems: "center" },
  modalBtnDestructiveText: { color: "#FFF", fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // FEEDBACK
  feedbackCard: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 12 },
  feedbackHeader: { flexDirection: "row", alignItems: "flex-start" },
  feedbackTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  feedbackSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 16 },
  feedbackBtn: { height: 44, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  feedbackBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
