import React from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator, TextInput,
} from "react-native";
import { router } from "expo-router";
import {
  Shield, Key, AlertTriangle, FileText, Mail,
  ChevronRight, Lock, Zap, Star, CheckCircle2,
  Users, BarChart3, Presentation, ChevronLeft,
  Award, Target, TrendingUp, BookOpen, Medal, Crown,
  Plus, Edit2, Info, ChevronDown, ChevronUp
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useProgress } from "@/contexts/ProgressContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabaseClient";
import { MODULE_DEFINITIONS } from "@/constants/lessons";

const ICON_MAP = {
  Shield, Key, AlertTriangle, FileText, Mail,
} as const;

const TAB_HEIGHT = Platform.OS === "ios" ? 88 : 64;

const PODIUM_COLORS = ["#F59E0B", "#94A3B8", "#CD7C2F"] as const;

interface AdminClassSummary {
  name: string;
  studentCount: number;
  averageXp: number;
  averageCompleted: number;
  averageAccuracy: number;
  engagementScore: number;
}

interface AdminStudent {
  id: string;
  name: string;
  email: string;
  className: string;
  xp: number;
  completedCount: number;
  accuracy: number;
  streak: number;
}

interface AdminDashboardData {
  activeStudents: number;
  averageXp: number;
  completedModulesCount: number;
  highlightClass: string;
  classes: AdminClassSummary[];
  students: AdminStudent[];
}

function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [adminData, setAdminData] = React.useState<AdminDashboardData | null>(null);
  const [adminLoading, setAdminLoading] = React.useState(true);
  const [adminError, setAdminError] = React.useState<string | null>(null);
  const [selectedClass, setSelectedClass] = React.useState<string | null>(null);

  // Estados de Gestão de Turmas
  const [rawClasses, setRawClasses] = React.useState<{ id: string; name: string; course: string; term: string }[]>([]);
  const [isCreatingClass, setIsCreatingClass] = React.useState(false);
  const [newClassName, setNewClassName] = React.useState("");
  const [newClassCourse, setNewClassCourse] = React.useState("");
  const [newClassTerm, setNewClassTerm] = React.useState("");

  const [editingClassId, setEditingClassId] = React.useState<string | null>(null);
  const [editClassName, setEditClassName] = React.useState("");
  const [editClassCourse, setEditClassCourse] = React.useState("");
  const [editClassTerm, setEditClassTerm] = React.useState("");

  const [classActionLoading, setClassActionLoading] = React.useState(false);
  const [classActionError, setClassActionError] = React.useState<string | null>(null);
  const [classActionSuccess, setClassActionSuccess] = React.useState<string | null>(null);

  const fetchAdminData = async () => {
    setAdminLoading(true);
    setAdminError(null);
    try {
      // 1. Buscar perfis com role = 'student' contendo nome, email e turma
      const { data: studentProfiles, error: profilesErr } = await supabase
        .from("profiles")
        .select("id, name, email, class_name")
        .eq("role", "student");

      if (profilesErr) throw new Error(profilesErr.message);

      // 2. Buscar progresso de todos os alunos (incluindo respostas corretas, exercícios totais e dias ativos)
      const { data: progressData, error: progressErr } = await supabase
        .from("user_progress")
        .select("user_id, xp, completed_modules, correct_answers, total_exercises, streak");

      if (progressErr) throw new Error(progressErr.message);

      const progressMap = new Map<
        string,
        {
          xp: number;
          completedCount: number;
          correctAnswers: number;
          totalExercises: number;
          streak: number;
        }
      >();

      if (progressData) {
        progressData.forEach((p) => {
          progressMap.set(p.user_id, {
            xp: p.xp || 0,
            completedCount: Array.isArray(p.completed_modules) ? p.completed_modules.length : 0,
            correctAnswers: p.correct_answers || 0,
            totalExercises: p.total_exercises || 0,
            streak: p.streak || 0,
          });
        });
      }

      const activeStudents = studentProfiles?.length || 0;
      let totalXp = 0;
      let totalCompleted = 0;

      const classStats: Record<
        string,
        {
          totalXp: number;
          totalCompleted: number;
          correctAnswers: number;
          totalExercises: number;
          studentCount: number;
        }
      > = {};

      const studentsList: AdminStudent[] = [];

      (studentProfiles || []).forEach((p) => {
        const className = p.class_name || "Sem Turma";
        const prog = progressMap.get(p.id) || {
          xp: 0,
          completedCount: 0,
          correctAnswers: 0,
          totalExercises: 0,
          streak: 0,
        };

        totalXp += prog.xp;
        totalCompleted += prog.completedCount;

        if (!classStats[className]) {
          classStats[className] = {
            totalXp: 0,
            totalCompleted: 0,
            correctAnswers: 0,
            totalExercises: 0,
            studentCount: 0,
          };
        }
        classStats[className].totalXp += prog.xp;
        classStats[className].totalCompleted += prog.completedCount;
        classStats[className].correctAnswers += prog.correctAnswers;
        classStats[className].totalExercises += prog.totalExercises;
        classStats[className].studentCount += 1;

        const accuracy =
          prog.totalExercises > 0 ? Math.round((prog.correctAnswers / prog.totalExercises) * 100) : 0;

        studentsList.push({
          id: p.id,
          name: p.name || "Aluno",
          email: p.email || "",
          className: className,
          xp: prog.xp,
          completedCount: prog.completedCount,
          accuracy: accuracy,
          streak: prog.streak,
        });
      });

      const averageXp = activeStudents > 0 ? Math.round(totalXp / activeStudents) : 0;

      // Cálculo de Turma Destaque e Resumo das Turmas
      let highlightClass = "Nenhuma";
      let highestAvgXp = -1;
      const classesList: AdminClassSummary[] = [];

      Object.keys(classStats).forEach((className) => {
        const stats = classStats[className];
        const avgXp = stats.studentCount > 0 ? Math.round(stats.totalXp / stats.studentCount) : 0;

        if (avgXp > highestAvgXp) {
          highestAvgXp = avgXp;
          highlightClass = className;
        }

        const avgCompleted =
          stats.studentCount > 0 ? Math.round((stats.totalCompleted / stats.studentCount) * 10) / 10 : 0;
        const avgAccuracy =
          stats.totalExercises > 0 ? Math.round((stats.correctAnswers / stats.totalExercises) * 100) : 0;

        // Formula interna simples de engajamento do MVP: averageXp + averageCompleted * 5 + averageAccuracy * 2
        const engagementScore = Math.round(avgXp + avgCompleted * 5 + avgAccuracy * 2);

        classesList.push({
          name: className,
          studentCount: stats.studentCount,
          averageXp: avgXp,
          averageCompleted: avgCompleted,
          averageAccuracy: avgAccuracy,
          engagementScore: engagementScore,
        });
      });

      // Ordenar turmas por pontuação de engajamento decrescente
      classesList.sort((a, b) => b.engagementScore - a.engagementScore);

      // 3. Buscar todas as turmas cadastradas para Gestão
      const { data: dbClasses, error: dbClassesErr } = await supabase
        .from("classes")
        .select("id, name, course, term");

      let fetchedClasses = dbClasses || [];
      if (fetchedClasses.length === 0) {
        // Fallback local caso não tenha nada ou falhe
        fetchedClasses = Object.keys(classStats).map((name, idx) => ({
          id: `profile-${idx}`,
          name,
          course: "Trilha Geral",
          term: "Unimar"
        }));
      }

      setRawClasses(fetchedClasses.map(c => ({
        id: String(c.id),
        name: c.name || "",
        course: c.course || "",
        term: c.term || ""
      })));

      setAdminData({
        activeStudents,
        averageXp,
        completedModulesCount: totalCompleted,
        highlightClass,
        classes: classesList,
        students: studentsList,
      });
    } catch (err: any) {
      console.warn("Error fetching admin dashboard data:", err);
      setAdminError("Não foi possível carregar os indicadores das turmas.");
    } finally {
      setAdminLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAdminData();
  }, []);

  const isClassNameLocked = (name: string) => {
    if (!adminData) return false;
    return adminData.students.some(s => s.className.trim().toLowerCase() === name.trim().toLowerCase());
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      setClassActionError("O nome da turma é obrigatório.");
      return;
    }
    setClassActionLoading(true);
    setClassActionError(null);
    setClassActionSuccess(null);
    try {
      const { error } = await supabase
        .from("classes")
        .insert({
          name: newClassName.trim(),
          course: newClassCourse.trim() || null,
          term: newClassTerm.trim() || null
        });

      if (error) {
        if (error.message.includes("permission denied") || error.message.includes("row-level security")) {
          throw new Error("Você não tem permissão para salvar turmas.");
        }
        throw new Error(error.message);
      }

      setNewClassName("");
      setNewClassCourse("");
      setNewClassTerm("");
      setIsCreatingClass(false);
      setClassActionSuccess("Turma cadastrada com sucesso!");
      await fetchAdminData();
    } catch (err: any) {
      setClassActionError(err.message || "Erro ao salvar turma.");
    } finally {
      setClassActionLoading(false);
    }
  };

  const handleUpdateClass = async () => {
    if (!editingClassId) return;
    setClassActionLoading(true);
    setClassActionError(null);
    setClassActionSuccess(null);
    try {
      const targetCls = rawClasses.find(c => c.id === editingClassId);
      const locked = targetCls ? isClassNameLocked(targetCls.name) : false;

      const payload: Record<string, any> = {
        course: editClassCourse.trim() || null,
        term: editClassTerm.trim() || null
      };

      if (!locked) {
        if (!editClassName.trim()) {
          throw new Error("O nome da turma é obrigatório.");
        }
        payload.name = editClassName.trim();
      }

      const { error } = await supabase
        .from("classes")
        .update(payload)
        .eq("id", editingClassId);

      if (error) {
        if (error.message.includes("permission denied") || error.message.includes("row-level security")) {
          throw new Error("Você não tem permissão para salvar turmas.");
        }
        throw new Error(error.message);
      }

      setEditingClassId(null);
      setEditClassName("");
      setEditClassCourse("");
      setEditClassTerm("");
      setClassActionSuccess("Turma atualizada com sucesso!");
      await fetchAdminData();
    } catch (err: any) {
      setClassActionError(err.message || "Erro ao atualizar turma.");
    } finally {
      setClassActionLoading(false);
    }
  };

  if (adminLoading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.adminHeaderCard,
            { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          <View style={styles.headerTitleRow}>
            <Text style={[styles.adminHeaderTitle, { color: colors.foreground }]}>Painel Professor/Admin</Text>
            <View style={[styles.gestionBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.gestionBadgeText}>Visão de gestão</Text>
            </View>
          </View>
          <Text style={[styles.adminHeaderSub, { color: colors.mutedForeground }]}>
            Acompanhe o desempenho das turmas na Trilha de Segurança da Informação
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  if (adminError || !adminData) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.adminHeaderCard,
            { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          <View style={styles.headerTitleRow}>
            <Text style={[styles.adminHeaderTitle, { color: colors.foreground }]}>Painel Professor/Admin</Text>
            <View style={[styles.gestionBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.gestionBadgeText}>Visão de gestão</Text>
            </View>
          </View>
          <Text style={[styles.adminHeaderSub, { color: colors.mutedForeground }]}>
            Acompanhe o desempenho das turmas na Trilha de Segurança da Informação
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
          <AlertTriangle size={36} color={colors.error} style={{ marginBottom: 12 }} />
          <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", textAlign: "center", marginBottom: 8 }}>
            Erro ao carregar métricas
          </Text>
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 16 }}>
            {adminError}
          </Text>
          <TouchableOpacity
            style={{ paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: 8 }}
            onPress={fetchAdminData}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Se houver turma selecionada, renderiza a visão de detalhe
  if (selectedClass) {
    const classInfo = adminData.classes.find((c) => c.name === selectedClass);
    const studentsInClass = adminData.students
      .filter((s) => s.className === selectedClass)
      .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name));

    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.adminHeaderCard,
            { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={styles.backButtonRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedClass(null);
            }}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color={colors.primary} />
            <Text style={[styles.backButtonText, { color: colors.primary }]}>Voltar para turmas</Text>
          </TouchableOpacity>
          <Text style={[styles.adminHeaderTitle, { color: colors.foreground, marginTop: 8 }]}>
            Turma: {selectedClass}
          </Text>
          <Text style={[styles.adminHeaderSub, { color: colors.mutedForeground }]}>
            Acompanhamento analítico de desempenho individual dos alunos
          </Text>
        </View>

        <ScrollView
          key="class-detail-scroll"
          contentContainerStyle={[styles.scroll, { paddingBottom: TAB_HEIGHT + insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Métricas específicas da turma */}
          {classInfo && (
            <View style={styles.metricsGrid}>
              <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.metricIconWrap, { backgroundColor: colors.primary + "15" }]}>
                  <Users size={16} color={colors.primary} />
                </View>
                <Text style={[styles.metricValue, { color: colors.foreground }]}>{classInfo.studentCount}</Text>
                <Text style={[styles.metricSubtext, { color: colors.mutedForeground }]}>alunos na turma</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.metricIconWrap, { backgroundColor: "#F59E0B" + "15" }]}>
                  <Star size={16} color="#F59E0B" />
                </View>
                <Text style={[styles.metricValue, { color: colors.foreground }]}>{classInfo.averageXp}</Text>
                <Text style={[styles.metricSubtext, { color: colors.mutedForeground }]}>XP médio</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.metricIconWrap, { backgroundColor: colors.success + "15" }]}>
                  <CheckCircle2 size={16} color={colors.success} />
                </View>
                <Text style={[styles.metricValue, { color: colors.foreground }]}>
                  {classInfo.averageCompleted}
                </Text>
                <Text style={[styles.metricSubtext, { color: colors.mutedForeground }]}>mód. concluídos (méd.)</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.metricIconWrap, { backgroundColor: colors.primary + "15" }]}>
                  <Target size={16} color={colors.primary} />
                </View>
                <Text style={[styles.metricValue, { color: colors.foreground }]}>
                  {classInfo.averageAccuracy}%
                </Text>
                <Text style={[styles.metricSubtext, { color: colors.mutedForeground }]}>precisão média</Text>
              </View>
            </View>
          )}

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 24 }]}>
            RANKING DE ALUNOS
          </Text>

          {studentsInClass.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Users size={32} color={colors.mutedForeground} style={{ marginBottom: 8 }} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Esta turma ainda não possui alunos cadastrados.
              </Text>
            </View>
          ) : (
            studentsInClass.map((student, idx) => {
              const isTop3 = idx < 3;
              const podiumColor = isTop3 ? PODIUM_COLORS[idx] : colors.mutedForeground;

              return (
                <View
                  key={student.id}
                  style={[styles.studentDetailCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.studentCardHeader}>
                    {/* Rank Badge */}
                    <View
                      style={[
                        styles.studentRankBadge,
                        {
                          backgroundColor: isTop3 ? podiumColor + "20" : colors.muted,
                          borderColor: isTop3 ? podiumColor + "50" : colors.border,
                        },
                      ]}
                    >
                      {idx === 0 ? (
                        <Crown size={12} color={podiumColor} />
                      ) : idx === 1 || idx === 2 ? (
                        <Medal size={12} color={podiumColor} />
                      ) : null}
                      <Text style={[styles.studentRankText, { color: isTop3 ? podiumColor : colors.foreground }]}>
                        {idx + 1}º
                      </Text>
                    </View>
                    <View style={styles.studentCardTitle}>
                      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                        <Text style={[styles.studentName, { color: colors.foreground }]}>{student.name}</Text>
                        {isTop3 && (
                          <View style={[styles.pillBadge, { backgroundColor: podiumColor + "25", borderColor: podiumColor }]}>
                            <Text style={[styles.pillBadgeText, { color: podiumColor }]}>Top 3</Text>
                          </View>
                        )}
                        {student.xp === 0 && (
                          <View style={[styles.pillBadge, { backgroundColor: colors.error + "15", borderColor: colors.error }]}>
                            <Text style={[styles.pillBadgeText, { color: colors.error }]}>Sem progresso</Text>
                          </View>
                        )}
                        {student.accuracy >= 80 && (
                          <View style={[styles.pillBadge, { backgroundColor: colors.success + "15", borderColor: colors.success }]}>
                            <Text style={[styles.pillBadgeText, { color: colors.success }]}>Alta precisão</Text>
                          </View>
                        )}
                      </View>
                      {student.email ? (
                        <Text style={[styles.studentEmail, { color: colors.mutedForeground }]}>
                          {student.email}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Detalhes de progresso */}
                  <View style={[styles.studentStatsRow, { borderTopColor: colors.border }]}>
                    <View style={styles.studentStatItem}>
                      <Star size={12} color={colors.primary} />
                      <Text style={[styles.studentStatVal, { color: colors.foreground }]}>{student.xp}</Text>
                      <Text style={[styles.studentStatLbl, { color: colors.mutedForeground }]}>XP</Text>
                    </View>
                    <View style={styles.studentStatItem}>
                      <BookOpen size={12} color={colors.primary} />
                      <Text style={[styles.studentStatVal, { color: colors.foreground }]}>
                        {student.completedCount}
                      </Text>
                      <Text style={[styles.studentStatLbl, { color: colors.mutedForeground }]}>Módulos</Text>
                    </View>
                    <View style={styles.studentStatItem}>
                      <Target size={12} color={colors.success} />
                      <Text style={[styles.studentStatVal, { color: colors.foreground }]}>
                        {student.accuracy}%
                      </Text>
                      <Text style={[styles.studentStatLbl, { color: colors.mutedForeground }]}>Precisão</Text>
                    </View>
                    <View style={styles.studentStatItem}>
                      <Zap size={12} color="#F59E0B" />
                      <Text style={[styles.studentStatVal, { color: colors.foreground }]}>{student.streak}d</Text>
                      <Text style={[styles.studentStatLbl, { color: colors.mutedForeground }]}>Streak</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}

          <TouchableOpacity
            style={[styles.backBottomButton, { borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedClass(null);
            }}
            activeOpacity={0.75}
          >
            <ChevronLeft size={14} color={colors.mutedForeground} />
            <Text style={[styles.backBottomText, { color: colors.mutedForeground }]}>Voltar para turmas</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Estatística condicionais para Insight
  const bestClass = adminData.classes[0]?.name || "Nenhuma";
  const bestScore = adminData.classes[0]?.engagementScore || 0;
  const lowestClass = adminData.classes.length > 1 ? adminData.classes[adminData.classes.length - 1] : null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.adminHeaderCard,
          { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.headerTitleRow}>
          <Text style={[styles.adminHeaderTitle, { color: colors.foreground }]}>Painel Professor/Admin</Text>
          <View style={[styles.gestionBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.gestionBadgeText}>Visão de gestão</Text>
          </View>
        </View>
        <Text style={[styles.adminHeaderSub, { color: colors.mutedForeground }]}>
          Acompanhe o desempenho das turmas na Trilha de Segurança da Informação
        </Text>
      </View>

      <ScrollView
        key="admin-main-scroll"
        contentContainerStyle={[styles.scroll, { paddingBottom: TAB_HEIGHT + insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* INDICADORES PRINCIPAIS */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>INDICADORES PRINCIPAIS</Text>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: colors.primary + "15" }]}>
              <Users size={18} color={colors.primary} />
            </View>
            <Text style={[styles.metricValue, { color: colors.foreground }]}>{adminData.activeStudents}</Text>
            <Text style={[styles.metricSubtext, { color: colors.mutedForeground }]}>alunos cadastrados</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: "#F59E0B" + "15" }]}>
              <Star size={18} color="#F59E0B" />
            </View>
            <Text style={[styles.metricValue, { color: colors.foreground }]}>{adminData.averageXp}</Text>
            <Text style={[styles.metricSubtext, { color: colors.mutedForeground }]}>média geral</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: colors.success + "15" }]}>
              <CheckCircle2 size={18} color={colors.success} />
            </View>
            <Text style={[styles.metricValue, { color: colors.foreground }]}>{adminData.completedModulesCount}</Text>
            <Text style={[styles.metricSubtext, { color: colors.mutedForeground }]}>conclusões registradas</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: colors.primary + "15" }]}>
              <Presentation size={18} color={colors.primary} />
            </View>
            <Text style={[styles.metricValue, { color: colors.primary, fontSize: 13 }]} numberOfLines={1}>
              {adminData.highlightClass}
            </Text>
            <Text style={[styles.metricSubtext, { color: colors.mutedForeground }]}>maior engajamento</Text>
          </View>
        </View>

        {/* INSIGHT CARD */}
        <View style={[styles.insightCard, { backgroundColor: colors.primary + "08", borderColor: colors.primary + "20" }]}>
          <View style={styles.insightHeader}>
            <Info size={16} color={colors.primary} />
            <Text style={[styles.insightTitle, { color: colors.primary }]}>Insight Pedagógico</Text>
          </View>
          <Text style={[styles.insightDesc, { color: colors.foreground }]}>
            Turma com melhor engajamento: <Text style={{ fontFamily: "Inter_700Bold" }}>{bestClass}</Text> com <Text style={{ fontFamily: "Inter_700Bold" }}>{bestScore} pts</Text>. {lowestClass ? `Orientação: A turma "${lowestClass.name}" apresenta menor média de XP (${lowestClass.averageXp}). Considere realizar uma abordagem de fixação em sala.` : "Dica: Monitore o ranking de turmas para identificar alunos que precisam de reforço."}
          </Text>
        </View>

        {/* RESUMO DAS TURMAS */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 24 }]}>RESUMO DAS TURMAS</Text>
        <View style={{ gap: 12, marginBottom: 24 }}>
          {adminData.classes.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ color: colors.mutedForeground }}>Nenhuma turma cadastrada ainda.</Text>
            </View>
          ) : (
            adminData.classes.map((cls) => {
              const capValue = Math.min(100, Math.max(10, Math.round(cls.engagementScore / 4)));
              return (
                <View
                  key={cls.name}
                  style={[styles.cohortVisualCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.cohortHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cohortTitleText, { color: colors.foreground }]}>{cls.name}</Text>
                      <Text style={[styles.cohortSubtitleText, { color: colors.mutedForeground }]}>
                        {cls.studentCount} {cls.studentCount === 1 ? "aluno matriculado" : "alunos matriculados"}
                      </Text>
                    </View>
                    <View style={[styles.engagePill, { backgroundColor: colors.primary + "15" }]}>
                      <Text style={[styles.engagePillText, { color: colors.primary }]}>{cls.engagementScore} pts</Text>
                    </View>
                  </View>

                  <View style={styles.cohortStatsGrid}>
                    <View style={styles.cohortStatGridCell}>
                      <Text style={[styles.cohortGridVal, { color: colors.foreground }]}>{cls.averageXp}</Text>
                      <Text style={[styles.cohortGridLbl, { color: colors.mutedForeground }]}>XP médio</Text>
                    </View>
                    <View style={styles.cohortStatGridCell}>
                      <Text style={[styles.cohortGridVal, { color: colors.foreground }]}>{cls.averageCompleted}</Text>
                      <Text style={[styles.cohortGridLbl, { color: colors.mutedForeground }]}>Mód. concluídos</Text>
                    </View>
                    <View style={styles.cohortStatGridCell}>
                      <Text style={[styles.cohortGridVal, { color: colors.foreground }]}>{cls.averageAccuracy}%</Text>
                      <Text style={[styles.cohortGridLbl, { color: colors.mutedForeground }]}>Precisão média</Text>
                    </View>
                  </View>

                  {/* Barra de Engajamento */}
                  <View style={styles.engageBarArea}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                      <Text style={[styles.engageBarLabel, { color: colors.mutedForeground }]}>Nível de engajamento</Text>
                      <Text style={[styles.engageBarValue, { color: colors.primary }]}>{capValue}%</Text>
                    </View>
                    <View style={[styles.engageBarTrack, { backgroundColor: colors.muted }]}>
                      <View style={[styles.engageBarFill, { backgroundColor: colors.primary, width: `${capValue}%` }]} />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.cohortActionBtn, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "20" }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedClass(cls.name);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.cohortActionText, { color: colors.primary }]}>Ver alunos</Text>
                    <ChevronRight size={14} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* GESTÃO DE TURMAS */}
        <View style={styles.titleDividerRow}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>GESTÃO DE TURMAS</Text>
          <TouchableOpacity
            style={[styles.outlineBtn, { borderColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsCreatingClass(o => !o);
              setEditingClassId(null);
              setClassActionError(null);
              setClassActionSuccess(null);
            }}
            activeOpacity={0.7}
          >
            <Plus size={14} color={colors.primary} />
            <Text style={[styles.outlineBtnText, { color: colors.primary }]}>
              {isCreatingClass ? "Colapsar" : "Nova turma"}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.cohortSubtitleText, { color: colors.mutedForeground, marginTop: -8, marginBottom: 12 }]}>
          Cadastre e organize as turmas disponíveis para novos alunos.
        </Text>

        {classActionSuccess && (
          <View style={[styles.alertBanner, { backgroundColor: colors.success + "15", borderColor: colors.success + "30" }]}>
            <Text style={[styles.alertBannerText, { color: colors.success }]}>✓ {classActionSuccess}</Text>
          </View>
        )}

        {classActionError && (
          <View style={[styles.alertBanner, { backgroundColor: colors.error + "15", borderColor: colors.error + "30" }]}>
            <Text style={[styles.alertBannerText, { color: colors.error }]}>⚠ {classActionError}</Text>
          </View>
        )}

        {/* FORMULÁRIO DE CRIAÇÃO INLINE */}
        {isCreatingClass && (
          <View style={[styles.formContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>Cadastrar Nova Turma</Text>
            <View style={styles.formField}>
              <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Nome da Turma *</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Ex: ADS - 5º Termo"
                placeholderTextColor={colors.mutedForeground}
                value={newClassName}
                onChangeText={setNewClassName}
              />
            </View>
            <View style={styles.formField}>
              <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Curso</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Ex: Análise e Desenvolvimento de Sistemas"
                placeholderTextColor={colors.mutedForeground}
                value={newClassCourse}
                onChangeText={setNewClassCourse}
              />
            </View>
            <View style={styles.formField}>
              <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Termo / Semestre</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Ex: 5º Semestre"
                placeholderTextColor={colors.mutedForeground}
                value={newClassTerm}
                onChangeText={setNewClassTerm}
              />
            </View>
            <View style={styles.formActionsRow}>
              <TouchableOpacity
                style={[styles.formCancelBtn, { borderColor: colors.border }]}
                onPress={() => setIsCreatingClass(false)}
                disabled={classActionLoading}
              >
                <Text style={[styles.formCancelText, { color: colors.mutedForeground }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formSubmitBtn, { backgroundColor: colors.primary }]}
                onPress={handleCreateClass}
                disabled={classActionLoading}
              >
                {classActionLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.formSubmitText}>Salvar Turma</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* FORMULÁRIO DE EDIÇÃO INLINE */}
        {editingClassId && (
          <View style={[styles.formContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>Editar Turma</Text>
            {isClassNameLocked(rawClasses.find(c => c.id === editingClassId)?.name || "") && (
              <View style={[styles.lockWarningBanner, { backgroundColor: colors.warning + "15", borderColor: colors.warning + "30" }]}>
                <Info size={14} color={colors.warning} />
                <Text style={[styles.lockWarningText, { color: colors.warning }]}>
                  Esta turma já possui alunos vinculados. O nome da turma está protegido para preservar rankings e relatórios.
                </Text>
              </View>
            )}
            <View style={styles.formField}>
              <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Nome da Turma *</Text>
              <TextInput
                style={[
                  styles.formInput, 
                  { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground },
                  isClassNameLocked(rawClasses.find(c => c.id === editingClassId)?.name || "") && { opacity: 0.6 }
                ]}
                placeholder="Ex: ADS - 5º Termo"
                placeholderTextColor={colors.mutedForeground}
                value={editClassName}
                onChangeText={setEditClassName}
                editable={!isClassNameLocked(rawClasses.find(c => c.id === editingClassId)?.name || "")}
              />
            </View>
            <View style={styles.formField}>
              <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Curso</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Ex: Análise e Desenvolvimento de Sistemas"
                placeholderTextColor={colors.mutedForeground}
                value={editClassCourse}
                onChangeText={setEditClassCourse}
              />
            </View>
            <View style={styles.formField}>
              <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>Termo / Semestre</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Ex: 5º Semestre"
                placeholderTextColor={colors.mutedForeground}
                value={editClassTerm}
                onChangeText={setEditClassTerm}
              />
            </View>
            <View style={styles.formActionsRow}>
              <TouchableOpacity
                style={[styles.formCancelBtn, { borderColor: colors.border }]}
                onPress={() => setEditingClassId(null)}
                disabled={classActionLoading}
              >
                <Text style={[styles.formCancelText, { color: colors.mutedForeground }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formSubmitBtn, { backgroundColor: colors.primary }]}
                onPress={handleUpdateClass}
                disabled={classActionLoading}
              >
                {classActionLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.formSubmitText}>Salvar Alterações</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* LISTAGEM DE GESTÃO DE TURMAS */}
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {rawClasses.map((cls, idx) => (
            <View
              key={cls.id}
              style={[
                styles.listItem,
                idx < rawClasses.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                { paddingVertical: 12 }
              ]}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.className, { color: colors.foreground }]}>{cls.name}</Text>
                <Text style={[styles.classSub, { color: colors.mutedForeground }]}>
                  {cls.course || "Sem curso definido"} • {cls.term || "Sem termo"}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.editIconBtn, { borderColor: colors.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsCreatingClass(false);
                  setEditingClassId(cls.id);
                  setEditClassName(cls.name);
                  setEditClassCourse(cls.course);
                  setEditClassTerm(cls.term);
                  setClassActionError(null);
                  setClassActionSuccess(null);
                }}
                activeOpacity={0.7}
              >
                <Edit2 size={13} color={colors.primary} />
                <Text style={[styles.editIconText, { color: colors.primary }]}>Editar</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* ROADMAP / RECURSOS FUTUROS */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 12 }]}>ROADMAPP DE DESENVOLVIMENTO</Text>
        <View style={[styles.roadmapCard, { backgroundColor: colors.primary + "06", borderColor: colors.primary + "18" }]}>
          <BarChart3 size={22} color={colors.primary} />
          <View style={styles.roadmapInfo}>
            <Text style={[styles.roadmapTitle, { color: colors.primary }]}>Recursos futuros</Text>
            <Text style={[styles.roadmapDesc, { color: colors.foreground }]}>
              Em breve: relatórios analíticos aprofundados, exportações completas de turmas e criador dinâmico de trilhas de segurança.
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
  adminHeaderCard: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, gap: 6 },
  adminHeaderTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  adminHeaderSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  headerTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", marginTop: 8, gap: 8 },
  
  gestionBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, alignSelf: "flex-start" },
  gestionBadgeText: { color: "#FFF", fontSize: 10, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.5 },

  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 8 },
  metricCard: { flex: 1, minWidth: "45%", borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  metricIconWrap: { width: 34, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  metricValue: { fontSize: 26, fontFamily: "Inter_800ExtraBold" },
  metricLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  metricSubtext: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },

  insightCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 6, marginTop: 12, marginBottom: 16 },
  insightHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  insightTitle: { fontSize: 13, fontFamily: "Inter_700Bold" },
  insightDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },

  cohortVisualCard: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 12, marginBottom: 4 },
  cohortHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cohortTitleText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  cohortSubtitleText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  engagePill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  engagePillText: { fontSize: 12, fontFamily: "Inter_700Bold" },

  cohortStatsGrid: { flexDirection: "row", gap: 8, marginVertical: 4 },
  cohortStatGridCell: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 8, backgroundColor: "rgba(0,0,0,0.02)" },
  cohortGridVal: { fontSize: 14, fontFamily: "Inter_700Bold" },
  cohortGridLbl: { fontSize: 9, fontFamily: "Inter_500Medium" },

  engageBarArea: { gap: 2 },
  engageBarLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  engageBarValue: { fontSize: 10, fontFamily: "Inter_700Bold" },
  engageBarTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  engageBarFill: { height: 6, borderRadius: 3 },
  cohortActionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 8, borderWidth: 1, paddingVertical: 10, gap: 4, marginTop: 8 },
  cohortActionText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  titleDividerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16, marginBottom: 8 },
  outlineBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  outlineBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  alertBanner: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 },
  alertBannerText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  formContainer: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 16, gap: 12 },
  formTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 4 },
  formField: { gap: 4 },
  formLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  formInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, fontFamily: "Inter_400Regular" },
  formActionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 4 },
  formCancelBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  formCancelText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  formSubmitBtn: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, minWidth: 100, alignItems: "center", justifyContent: "center" },
  formSubmitText: { color: "#FFF", fontSize: 13, fontFamily: "Inter_600SemiBold" },

  lockWarningBanner: { flexDirection: "row", gap: 8, borderWidth: 1, borderRadius: 8, padding: 10, alignItems: "center", marginBottom: 4 },
  lockWarningText: { flex: 1, fontSize: 10, fontFamily: "Inter_500Medium", lineHeight: 14 },

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

  backButtonRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  backButtonText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  classSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  classRight: { flexDirection: "row", alignItems: "center" },
  
  emptyCard: { borderRadius: 12, borderWidth: 1, padding: 32, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  
  studentDetailCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12, gap: 12 },
  studentCardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  studentRankBadge: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, gap: 3
  },
  studentRankText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  studentCardTitle: { flex: 1, gap: 2 },
  studentName: { fontSize: 14, fontFamily: "Inter_700Bold" },
  studentEmail: { fontSize: 11, fontFamily: "Inter_400Regular" },
  
  studentStatsRow: { flexDirection: "row", borderTopWidth: 1, paddingTop: 12, gap: 8 },
  studentStatItem: { flex: 1, alignItems: "center", gap: 3 },
  studentStatVal: { fontSize: 13, fontFamily: "Inter_700Bold" },
  studentStatLbl: { fontSize: 9, fontFamily: "Inter_500Medium" },
  
  backBottomButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: 10, borderWidth: 1, paddingVertical: 12, marginTop: 12, gap: 6
  },
  backBottomText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  editIconBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  editIconText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  pillBadge: { borderRadius: 4, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
  pillBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold" },
});
