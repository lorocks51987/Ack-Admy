import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator, TextInput, Modal
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Zap, Star, Target, BookOpen, CheckCircle2,
  AlertTriangle, RotateCcw, LogOut, Users, Edit3,
  Award, Briefcase, GraduationCap, Compass, Layers, Landmark, ChevronRight, Info, ChevronDown, ChevronUp
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useProgress } from "@/contexts/ProgressContext";
import { MODULE_DEFINITIONS } from "@/constants/lessons";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabaseClient";

const TAB_HEIGHT = Platform.OS === "ios" ? 88 : 64;

const LOCAL_FALLBACK_CLASSES = [
  "ADS - 5º Termo",
  "Engenharia de Software",
  "Ciência da Computação",
  "Administração",
  "Direito",
  "Marketing"
];

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
  const { profile, loading, profileLoading, refreshProfile, signOut } = useAuth();
  const router = useRouter();

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editClass, setEditClass] = useState("");
  const [classList, setClassList] = useState<{ id: string; name: string }[]>([]);
  const [isClassListDropdownOpen, setIsClassListDropdownOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Custom Modal States
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

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
      setEditClass(profile.class_name || "");
    }
  }, [profile, isEditing]);

  // Load Classes for Dropdown
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data, error } = await supabase.from("classes").select("id, name");
        if (error) throw new Error(error.message);
        if (data && data.length > 0) {
          setClassList(data.map(d => ({ id: String(d.id), name: d.name })));
        } else {
          setClassList(LOCAL_FALLBACK_CLASSES.map((c, i) => ({ id: String(i), name: c })));
        }
      } catch (err) {
        console.warn("Failed to load classes in profile edit:", err);
        setClassList(LOCAL_FALLBACK_CLASSES.map((c, i) => ({ id: String(i), name: c })));
      }
    };
    fetchClasses();
  }, []);

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

  if (!profile) {
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

  const isAdmin = profile.role === "admin";
  const displayName = profile.name || "Usuário";
  const initials = getInitials(profile.name);
  const email = profile.email || "Sem e-mail";

  // Student specific parameters
  const completedCount = progress.completedModules.length;
  const totalModules = MODULE_DEFINITIONS.length;
  const progressPct = totalModules > 0 ? completedCount / totalModules : 0;
  const accuracy = progress.totalExercises > 0
    ? Math.round((progress.correctAnswers / progress.totalExercises) * 100)
    : 0;

  // Save profile updates
  const handleSaveProfile = async () => {
    const cleanName = editName.trim().replace(/\s+/g, " ");
    if (!cleanName) {
      setUpdateError("O nome é obrigatório.");
      return;
    }
    if (cleanName.length < 3) {
      setUpdateError("O nome deve ter no mínimo 3 caracteres.");
      return;
    }
    if (!isAdmin && !editClass) {
      setUpdateError("Selecione sua turma.");
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
      if (!isAdmin) {
        updates.class_name = editClass;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id);

      if (error) throw new Error(error.message);

      await refreshProfile(profile.id);
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
        contentContainerStyle={[styles.scroll, { paddingBottom: TAB_HEIGHT + insets.bottom + 20 }]}
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

        {/* MODO DE EDIÇÃO INLINE */}
        {isEditing ? (
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
                <Text style={[styles.editFormLabel, { color: colors.mutedForeground }]}>Sua Turma *</Text>
                
                {/* AVISO DO IMPACTO DE ALTERAR TURMA */}
                <View style={[styles.infoWarningBox, { backgroundColor: colors.primary + "09", borderColor: colors.primary + "20" }]}>
                  <Info size={14} color={colors.primary} />
                  <Text style={[styles.infoWarningText, { color: colors.primary }]}>
                    Alterar sua turma também atualiza sua posição nos rankings.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.inlineSelectBtn, { backgroundColor: colors.input, borderColor: colors.border }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIsClassListDropdownOpen((o) => !o);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: editClass ? colors.foreground : colors.mutedForeground, fontSize: 14, fontFamily: "Inter_500Medium" }}>
                    {editClass || "Selecione uma turma"}
                  </Text>
                  {isClassListDropdownOpen ? (
                    <ChevronUp size={16} color={colors.mutedForeground} />
                  ) : (
                    <ChevronDown size={16} color={colors.mutedForeground} />
                  )}
                </TouchableOpacity>

                {isClassListDropdownOpen && (
                  <View style={[styles.dropdownScroll, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled={true}>
                      {classList.map((cls) => {
                        const isSelected = editClass === cls.name;
                        return (
                          <TouchableOpacity
                            key={cls.id}
                            style={[
                              styles.dropdownRowBtn,
                              isSelected && { backgroundColor: colors.primary + "15" },
                              { borderBottomWidth: 1, borderBottomColor: colors.border + "40" }
                            ]}
                            onPress={() => {
                              Haptics.selectionAsync();
                              setEditClass(cls.name);
                              setIsClassListDropdownOpen(false);
                            }}
                          >
                            <Text style={[styles.dropdownRowText, { color: colors.foreground, fontFamily: isSelected ? "Inter_700Bold" : "Inter_400Regular" }]}>
                              {cls.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
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
                {isAdmin ? "Professor/Admin Unimar" : `Aluno — ${profile.class_name || "Sem Turma"}`}
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

            {/* DADOS ACADÊMICOS */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DADOS ACADÊMICOS</Text>
            <View style={[styles.academicCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.academicRow, { borderBottomWidth: 1, borderBottomColor: colors.border + "50" }]}>
                <Landmark size={15} color={colors.mutedForeground} />
                <Text style={[styles.academicLabel, { color: colors.mutedForeground }]}>Turma</Text>
                <Text style={[styles.academicValue, { color: colors.foreground }]}>{profile.class_name || "Sem Turma"}</Text>
              </View>
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

        {/* AÇÕES DA CONTA */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>AÇÕES DA CONTA</Text>
        <View style={[styles.actionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {!isAdmin ? (
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
          ) : (
            <View style={[styles.actionInfoContainer, { borderBottomWidth: 1, borderBottomColor: colors.border + "50" }]}>
              <Info size={16} color={colors.mutedForeground} />
              <Text style={[styles.actionInfoText, { color: colors.mutedForeground }]}>
                Contas administrativas não possuem progresso de trilha.
              </Text>
            </View>
          )}

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
});
