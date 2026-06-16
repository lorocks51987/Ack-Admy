import React from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator, TextInput,
  Modal, Pressable,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Shield, Key, AlertTriangle, FileText, Mail,
  ChevronRight, Lock, Zap, Star, CheckCircle2,
  Users, BarChart3, Presentation, ChevronLeft,
  Award, Target, TrendingUp, BookOpen, Medal, Crown,
  Plus, Edit2, Info, ChevronDown, ChevronUp, MessageSquare, ThumbsUp, Download
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
  course?: string;
  term?: string;
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
  feedbackStats: {
    total: number;
    usability: number;
    clarity: number;
    exercises: number;
    feedback: number;
    returnIntention: number;
    recommendationYesPct: number;
  };
  recentFeedbacks: any[];
  reports: any[];
}

function formatShortName(fullName: string | undefined | null): string {
  if (!fullName) return "Aluno";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstAndSecond = `${parts[0]} ${parts[1]}`;
  if (firstAndSecond.length > 18) return parts[0];
  return firstAndSecond;
}

function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, Platform.OS === "web" ? 16 : 0);

  const params = useLocalSearchParams<{ manage?: string }>();
  const scrollViewRef = React.useRef<ScrollView>(null);

  const [adminData, setAdminData] = React.useState<AdminDashboardData | null>(null);
  const [adminLoading, setAdminLoading] = React.useState(true);
  const [adminError, setAdminError] = React.useState<string | null>(null);
  const [selectedClass, setSelectedClass] = React.useState<string | null>(null);
  const [hiddenReportIds, setHiddenReportIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (params.manage === "true" && !adminLoading) {
      setIsCreatingClass(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 500);
    }
  }, [params.manage, adminLoading]);

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

    let studentProfiles: any[] = [];
    let progressData: any[] = [];

    // Core data fetch
    try {
      const { data: profiles, error: profilesErr } = await supabase
        .from("profiles")
        .select("id, name, email, class_name, course, term, room")
        .eq("role", "student");

      if (profilesErr) throw new Error(profilesErr.message);
      studentProfiles = profiles || [];

      const { data: progress, error: progressErr } = await supabase
        .from("user_progress")
        .select("user_id, xp, completed_modules, correct_answers, total_exercises, streak");

      if (progressErr) throw new Error(progressErr.message);
      progressData = progress || [];
    } catch (err: any) {
      console.warn("Error fetching core admin data:", err);
      setAdminError("Não foi possível carregar os indicadores das turmas.");
      setAdminLoading(false);
      return;
    }

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

    progressData.forEach((p) => {
      progressMap.set(p.user_id, {
        xp: p.xp || 0,
        completedCount: Array.isArray(p.completed_modules) ? p.completed_modules.length : 0,
        correctAnswers: p.correct_answers || 0,
        totalExercises: p.total_exercises || 0,
        streak: p.streak || 0,
      });
    });

    const activeStudents = studentProfiles.length;
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

    studentProfiles.forEach((p: any) => {
      const className = (p.course && p.term && p.room) 
        ? `${p.course} - ${p.term} ${p.room}`
        : (p.class_name || "Sem Turma");
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

    // 3. Buscar todas as turmas cadastradas para Gestão
    let fetchedClasses: any[] = [];
    try {
      const { data: dbClasses, error: dbClassesErr } = await supabase
        .from("classes")
        .select("id, name, course, term");
      if (dbClassesErr) throw dbClassesErr;
      fetchedClasses = dbClasses || [];
    } catch (classErr) {
      console.warn("Supabase fetch classes error:", classErr);
    }

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

    // Cálculo de Turma Destaque e Resumo das Turmas
    let highlightClass = "Nenhuma";
    let highestAvgXp = -1;
    const classesList: AdminClassSummary[] = [];

    Object.keys(classStats).forEach((className) => {
      const stats = classStats[className];
      // Guarda explícita: nunca retorna NaN ou undefined
      const rawAvgXp = stats.studentCount > 0 ? stats.totalXp / stats.studentCount : 0;
      const avgXp = isFinite(rawAvgXp) ? Math.round(rawAvgXp) : 0;

      if (avgXp > highestAvgXp) {
        highestAvgXp = avgXp;
        highlightClass = className;
      }

      const rawAvgCompleted = stats.studentCount > 0 ? stats.totalCompleted / stats.studentCount : 0;
      const avgCompleted = isFinite(rawAvgCompleted) ? Math.round(rawAvgCompleted * 10) / 10 : 0;

      const rawAvgAccuracy = stats.totalExercises > 0
        ? (stats.correctAnswers / stats.totalExercises) * 100
        : 0;
      const avgAccuracy = isFinite(rawAvgAccuracy) ? Math.round(rawAvgAccuracy) : 0;

      // Formula interna simples de engajamento: XP médio + módulos * 5 + precisão * 2
      const rawEngagement = avgXp + avgCompleted * 5 + avgAccuracy * 2;
      const engagementScore = isFinite(rawEngagement) ? Math.round(rawEngagement) : 0;

      const matchedDbClass = fetchedClasses.find(
        (c) => String(c.name).trim().toLowerCase() === className.trim().toLowerCase()
      );

      classesList.push({
        name: className,
        studentCount: stats.studentCount,
        averageXp: avgXp,
        averageCompleted: avgCompleted,
        averageAccuracy: avgAccuracy,
        engagementScore: engagementScore,
        course: matchedDbClass?.course || "Trilha Geral",
        term: matchedDbClass?.term || "",
      });
    });

    // Ordenar turmas por pontuação de engajamento decrescente
    classesList.sort((a, b) => b.engagementScore - a.engagementScore);

    // 4. Fetch feedbacks com try/catch isolado
    let feedbackStats = { total: 0, usability: 0, clarity: 0, exercises: 0, feedback: 0, returnIntention: 0, recommendationYesPct: 0 };
    let recentFeedbacks: any[] = [];
    try {
      const { data: feedbackData, error: feedbackErr } = await supabase
        .from("feedbacks")
        .select("*")
        .order("created_at", { ascending: false });

      if (feedbackErr) throw feedbackErr;

      if (feedbackData && feedbackData.length > 0) {
        let recYes = 0;
        feedbackData.forEach((f: any) => {
          feedbackStats.usability += f.rating_usability || 0;
          feedbackStats.clarity += f.rating_clarity || 0;
          feedbackStats.exercises += f.rating_exercises || 0;
          feedbackStats.feedback += f.rating_feedback || 0;
          feedbackStats.returnIntention += f.rating_return || 0;
          if (f.recommendation === "Sim") recYes++;
        });

        const total = feedbackData.length;
        feedbackStats = {
          total,
          usability: Number((feedbackStats.usability / total).toFixed(1)),
          clarity: Number((feedbackStats.clarity / total).toFixed(1)),
          exercises: Number((feedbackStats.exercises / total).toFixed(1)),
          feedback: Number((feedbackStats.feedback / total).toFixed(1)),
          returnIntention: Number((feedbackStats.returnIntention / total).toFixed(1)),
          recommendationYesPct: Math.round((recYes / total) * 100),
        };
        recentFeedbacks = feedbackData.slice(0, 3);
      }
    } catch (fbErr) {
      console.warn("Supabase fetch feedbacks error:", fbErr);
    }

    // 5. Fetch question reports (contestations) com try/catch isolado
    let reportsData: any[] = [];
    try {
      const { data: reports, error: reportsErr } = await supabase
        .from("question_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (reportsErr) throw reportsErr;
      reportsData = reports || [];
    } catch (repErr) {
      console.warn("Supabase fetch question reports error:", repErr);
    }

    setAdminData({
      activeStudents,
      averageXp,
      completedModulesCount: totalCompleted,
      highlightClass,
      classes: classesList,
      students: studentsList,
      feedbackStats,
      recentFeedbacks,
      reports: reportsData,
    });
    setAdminLoading(false);
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

  const handleResolveReport = async (reportId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const oldHidden = hiddenReportIds;
    setHiddenReportIds(prev => [...prev, reportId]);
    try {
      const { error } = await supabase.from("question_reports").delete().eq("id", reportId);
      if (error) throw error;
    } catch (err) {
      console.warn("Error deleting question report:", err);
      setHiddenReportIds(oldHidden);
      if (Platform.OS === 'web') {
        window.alert("Não foi possível resolver a contestação agora. Tente novamente.");
      } else {
        const { Alert } = require("react-native");
        Alert.alert("Erro", "Não foi possível resolver a contestação agora. Tente novamente.");
      }
    }
  };

  const handleExportCSV = () => {
    if (!selectedClass || !adminData) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const studentsInClass = adminData.students
      .filter((s) => s.className === selectedClass)
      .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name));

    // Headers em português do Brasil
    const headers = ["Turma", "Nome do Aluno", "Email", "XP", "Modulos Concluidos", "Precisao (%)", "Dias Ativos"];
    const rows = studentsInClass.map(s => [
      s.className,
      s.name,
      s.email,
      s.xp,
      s.completedCount,
      s.accuracy,
      s.streak
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");

    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Relatorio_${selectedClass.replace(/[^a-zA-Z0-9]/g, "_")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const FileSystem = require("expo-file-system");
      const Sharing = require("expo-sharing");
      const fileUri = `${FileSystem.documentDirectory}Relatorio_${selectedClass.replace(/[^a-zA-Z0-9]/g, "_")}.csv`;
      FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 })
        .then(() => {
          Sharing.shareAsync(fileUri);
        })
        .catch((err: any) => {
          console.warn("Erro ao compartilhar relatorio CSV:", err);
        });
    }
  };

  const AdminHeader = ({ compact = false }: { compact?: boolean }) => (
    <View
      style={[
        styles.adminHeaderCard,
        { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.headerTitleRow}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[styles.adminHeaderTitle, { color: colors.foreground }]}>Painel do Professor</Text>
          {!compact && (
            <Text style={[styles.adminHeaderSub, { color: colors.mutedForeground }]}>
              Turmas · Progresso · Feedbacks
            </Text>
          )}
        </View>
        <View style={[styles.gestionBadge, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "35", borderWidth: 1 }]}>
          <Presentation size={11} color={colors.primary} />
          <Text style={[styles.gestionBadgeText, { color: colors.primary }]}>Gestão</Text>
        </View>
      </View>
    </View>
  );

  if (adminLoading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <AdminHeader />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  if (adminError || !adminData) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <AdminHeader />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <View style={[styles.emptyStateWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <AlertTriangle size={32} color={colors.error} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyStateTitle, { color: colors.foreground }]}>Erro ao carregar métricas</Text>
            <Text style={[styles.emptyStateDesc, { color: colors.mutedForeground }]}>{adminError}</Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
              onPress={fetchAdminData}
            >
              <Text style={styles.primaryBtnText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
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
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", marginTop: 8, gap: 10 }}>
            <Text style={[styles.adminHeaderTitle, { color: colors.foreground, flex: 1, marginTop: 0 }]}>
              Turma: {selectedClass}
            </Text>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8
              }}
              onPress={handleExportCSV}
              activeOpacity={0.8}
            >
              <Download size={14} color="#FFF" />
              <Text style={{ color: "#FFF", fontSize: 12, fontFamily: "Inter_700Bold" }}>Exportar CSV</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.adminHeaderSub, { color: colors.mutedForeground }]}>
            Acompanhe o desempenho individual dos alunos.
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
                <Text style={[styles.metricValue, { color: colors.foreground }]} numberOfLines={1} adjustsFontSizeToFit>
                  {classInfo.studentCount}
                </Text>
                <Text style={[styles.metricSubtext, { color: colors.mutedForeground }]}>alunos</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.metricIconWrap, { backgroundColor: "#F59E0B" + "15" }]}>
                  <Star size={16} color="#F59E0B" />
                </View>
                <Text style={[styles.metricValue, { color: colors.foreground }]} numberOfLines={1} adjustsFontSizeToFit>
                  {classInfo.studentCount > 0 ? classInfo.averageXp : 0}
                </Text>
                <Text style={[styles.metricSubtext, { color: colors.mutedForeground }]}>XP médio</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.metricIconWrap, { backgroundColor: colors.success + "15" }]}>
                  <CheckCircle2 size={16} color={colors.success} />
                </View>
                <Text style={[styles.metricValue, { color: colors.foreground }]} numberOfLines={1} adjustsFontSizeToFit>
                  {classInfo.studentCount > 0 ? classInfo.averageCompleted : 0}
                </Text>
                <Text style={[styles.metricSubtext, { color: colors.mutedForeground }]}>Módulos (méd.)</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.metricIconWrap, { backgroundColor: colors.primary + "15" }]}>
                  <Target size={16} color={colors.primary} />
                </View>
                <Text style={[styles.metricValue, { color: colors.foreground }]} numberOfLines={1} adjustsFontSizeToFit>
                  {classInfo.studentCount > 0 ? `${classInfo.averageAccuracy}%` : "—"}
                </Text>
                <Text style={[styles.metricSubtext, { color: colors.mutedForeground }]}>Precisão média</Text>
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
                        <Text 
                          style={[styles.studentEmail, { color: colors.mutedForeground }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
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
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <View
        style={[
          styles.adminHeaderCard,
          { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.headerTitleRow}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.adminHeaderTitle, { color: colors.foreground }]}>Painel do Professor</Text>
            <Text style={[styles.adminHeaderSub, { color: colors.mutedForeground }]}>
              Turmas · Progresso · Feedbacks
            </Text>
          </View>
          <View style={[styles.gestionBadge, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "35", borderWidth: 1 }]}>
            <Presentation size={11} color={colors.primary} />
            <Text style={[styles.gestionBadgeText, { color: colors.primary }]}>Gestão</Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        key="admin-main-scroll"
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 180 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── INDICADORES ────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>INDICADORES</Text>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: colors.primary + "15" }]}>
              <Users size={15} color={colors.primary} />
            </View>
            <Text style={[styles.metricValue, { color: colors.foreground }]} numberOfLines={1} adjustsFontSizeToFit>
              {adminData.activeStudents}
            </Text>
            <Text style={[styles.metricSubtext, { color: colors.mutedForeground }]}>Alunos</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: "#8B5CF6" + "15" }]}>
              <Presentation size={15} color="#8B5CF6" />
            </View>
            <Text style={[styles.metricValue, { color: colors.foreground }]} numberOfLines={1} adjustsFontSizeToFit>
              {adminData.classes.length}
            </Text>
            <Text style={[styles.metricSubtext, { color: colors.mutedForeground }]}>Turmas</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: "#F59E0B" + "15" }]}>
              <Zap size={15} color="#F59E0B" />
            </View>
            <Text style={[styles.metricValue, { color: colors.foreground }]} numberOfLines={1} adjustsFontSizeToFit>
              {adminData.averageXp}
            </Text>
            <Text style={[styles.metricSubtext, { color: colors.mutedForeground }]}>XP Médio</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: colors.success + "15" }]}>
              <MessageSquare size={15} color={colors.success} />
            </View>
            <Text style={[styles.metricValue, { color: colors.foreground }]} numberOfLines={1} adjustsFontSizeToFit>
              {adminData.feedbackStats.total}
            </Text>
            <Text style={[styles.metricSubtext, { color: colors.mutedForeground }]}>Feedbacks</Text>
          </View>
        </View>

        {/* ── INSIGHT ────────────────────────────────────────────── */}
        {adminData.classes.length === 0 ? (
          <View style={[styles.insightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.insightHeader}>
              <Info size={14} color={colors.mutedForeground} />
              <Text style={[styles.insightTitle, { color: colors.mutedForeground }]}>Nenhuma turma</Text>
            </View>
            <Text style={[styles.insightDesc, { color: colors.mutedForeground }]}>
              Cadastre turmas na seção de Gestão de Turmas para acompanhar o progresso.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 8, marginTop: 12, marginBottom: 4 }}>
            <View style={[styles.insightCard, { backgroundColor: colors.primary + "08", borderColor: colors.primary + "20", marginTop: 0, marginBottom: 0 }]}>
              <View style={styles.insightHeader}>
                <Award size={14} color={colors.primary} />
                <Text style={[styles.insightTitle, { color: colors.primary }]}>Mais engajada</Text>
              </View>
              <Text style={[styles.insightDesc, { color: colors.foreground }]}>
                {bestClass} · <Text style={{ fontFamily: "Inter_700Bold" }}>{bestScore} pts</Text>
              </Text>
            </View>
            {lowestClass && (
              <View style={[styles.insightCard, { backgroundColor: colors.warning + "08", borderColor: colors.warning + "25", marginTop: 0, marginBottom: 0 }]}>
                <View style={styles.insightHeader}>
                  <AlertTriangle size={13} color={colors.warning} />
                  <Text style={[styles.insightTitle, { color: colors.warning }]}>Atenção</Text>
                </View>
                <Text style={[styles.insightDesc, { color: colors.foreground }]}>
                  {lowestClass.name} · <Text style={{ fontFamily: "Inter_700Bold" }}>{lowestClass.averageXp} XP médio</Text>
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── RESUMO DAS TURMAS ──────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 24 }]}>DESEMPENHO DAS TURMAS</Text>
        {adminData.classes.length === 0 ? (
          <View style={[styles.emptyStateWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Users size={28} color={colors.mutedForeground} style={{ marginBottom: 8 }} />
            <Text style={[styles.emptyStateTitle, { color: colors.mutedForeground }]}>Nenhuma turma cadastrada</Text>
            <Text style={[styles.emptyStateDesc, { color: colors.mutedForeground }]}>Use "Nova turma" abaixo para começar.</Text>
          </View>
        ) : (
          <View style={{ gap: 10, marginBottom: 24 }}>
            {adminData.classes.map((cls) => (
              <View
                key={cls.name}
                style={[styles.cohortVisualCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                {/* Cabeçalho do card */}
                <View style={styles.cohortHeaderRow}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.cohortTitleText, { color: colors.foreground }]} numberOfLines={1} ellipsizeMode="tail">
                      {cls.name}
                    </Text>
                    {cls.course ? (
                      <Text style={[styles.cohortCourseLine, { color: colors.mutedForeground }]} numberOfLines={1}>
                        {cls.course}{cls.term ? ` · ${cls.term}` : ""}
                      </Text>
                    ) : null}
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <View style={[styles.engagePill, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "25", borderWidth: 1 }]}>
                      <BarChart3 size={10} color={colors.primary} />
                      <Text style={[styles.engagePillText, { color: colors.primary }]}>{cls.engagementScore}</Text>
                    </View>
                    <Text style={{ fontSize: 10, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>
                      {cls.studentCount} {cls.studentCount === 1 ? "aluno" : "alunos"}
                    </Text>
                  </View>
                </View>

                {/* Estatísticas em linha */}
                <View style={styles.cohortStatsRow}>
                  <View style={styles.cohortStatInline}>
                    <Zap size={11} color="#F59E0B" />
                    <Text style={[styles.cohortStatInlineVal, { color: colors.foreground }]}>{cls.studentCount > 0 ? cls.averageXp : 0}</Text>
                    <Text style={[styles.cohortStatInlineLbl, { color: colors.mutedForeground }]}>XP</Text>
                  </View>
                  <View style={[styles.cohortStatDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.cohortStatInline}>
                    <BookOpen size={11} color={colors.success} />
                    <Text style={[styles.cohortStatInlineVal, { color: colors.foreground }]}>{cls.studentCount > 0 ? cls.averageCompleted : 0}</Text>
                    <Text style={[styles.cohortStatInlineLbl, { color: colors.mutedForeground }]}>módulos</Text>
                  </View>
                  <View style={[styles.cohortStatDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.cohortStatInline}>
                    <Target size={11} color={colors.primary} />
                    <Text style={[styles.cohortStatInlineVal, { color: colors.foreground }]}>{cls.studentCount > 0 ? `${cls.averageAccuracy}%` : "—"}</Text>
                    <Text style={[styles.cohortStatInlineLbl, { color: colors.mutedForeground }]}>precisão</Text>
                  </View>
                </View>

                {/* Botão Ver alunos — ghost / leve */}
                <TouchableOpacity
                  style={[styles.cohortActionBtn, { borderTopColor: colors.border }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedClass(cls.name);
                  }}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.cohortActionText, { color: colors.primary }]}>Ver alunos</Text>
                  <ChevronRight size={13} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* FEEDBACKS DOS ALUNOS */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 12 }]}>FEEDBACKS DOS ALUNOS</Text>
        <View style={{ marginBottom: 24, gap: 12 }}>
          {adminData.feedbackStats.total === 0 ? (
            <View style={[styles.emptyStateWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <MessageSquare size={26} color={colors.mutedForeground} style={{ marginBottom: 8 }} />
              <Text style={[styles.emptyStateTitle, { color: colors.mutedForeground }]}>Sem feedbacks ainda</Text>
              <Text style={[styles.emptyStateDesc, { color: colors.mutedForeground }]}>
                Aparecerão aqui após os alunos concluírem a primeira aula.
              </Text>
            </View>
          ) : (
            <>
              {/* Feedback Resumo Simplificado */}
              <View style={[styles.feedbackSummaryCard, { backgroundColor: colors.card, borderColor: colors.border, padding: 16 }]}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <View style={{ gap: 4 }}>
                    <Text style={[styles.feedbackTotalText, { color: colors.foreground }]}>
                      {adminData.feedbackStats.total} {adminData.feedbackStats.total === 1 ? "avaliação" : "avaliações"}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
                      <Text style={{ fontSize: 28, fontFamily: "Inter_800ExtraBold", color: colors.foreground }}>
                        {adminData.feedbackStats.usability || "0.0"}
                      </Text>
                      <View style={{ gap: 2 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                          {[1, 2, 3, 4, 5].map((num) => {
                            const avgVal = adminData.feedbackStats.usability || 0;
                            const active = num <= Math.round(avgVal);
                            return (
                              <Shield
                                key={num}
                                size={12}
                                color={active ? colors.primary : colors.border}
                                fill={active ? colors.primary : "transparent"}
                                strokeWidth={1.5}
                              />
                            );
                          })}
                        </View>
                        <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>Nota média geral</Text>
                      </View>
                    </View>
                  </View>

                  <View style={{ gap: 4, alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 20, fontFamily: "Inter_800ExtraBold", color: colors.success }}>
                      {adminData.feedbackStats.recommendationYesPct}%
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_500Medium", textAlign: "right" }}>
                      Recomendam o app
                    </Text>
                  </View>
                </View>
              </View>

              {/* Comentários recentes */}
              {adminData.recentFeedbacks.length > 0 && (
                <View style={{ gap: 8, marginTop: 4 }}>
                  <Text style={[styles.feedbackRecentTitle, { color: colors.foreground }]}>Comentários recentes</Text>
                  {adminData.recentFeedbacks.map(f => (
                    <View key={f.id} style={[styles.feedbackItemCard, { backgroundColor: colors.card, borderColor: colors.border, gap: 4 }]}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={[styles.feedbackItemName, { color: colors.foreground, fontSize: 13, fontFamily: "Inter_700Bold" }]}>
                          {f.user_name || "Aluno anônimo"}
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                          {[1, 2, 3, 4, 5].map((num) => {
                            const active = num <= (f.rating_usability ?? 5);
                            return (
                              <Shield
                                key={num}
                                size={12}
                                color={active ? colors.primary : colors.border}
                                fill={active ? colors.primary : "transparent"}
                                strokeWidth={1.5}
                              />
                            );
                          })}
                        </View>
                      </View>
                      <Text style={[styles.feedbackItemClass, { color: colors.mutedForeground, fontSize: 11, fontFamily: "Inter_500Medium" }]}>
                        {f.class_name || "Sem turma"}
                      </Text>
                      
                      {f.liked_most ? (
                        <View style={{ marginTop: 6 }}>
                          <Text style={[styles.feedbackQ, { color: colors.foreground, fontSize: 11, fontFamily: "Inter_600SemiBold" }]}>O que gostou</Text>
                          <Text style={[styles.feedbackA, { color: colors.mutedForeground, fontSize: 12, lineHeight: 16 }]} numberOfLines={3}>{f.liked_most}</Text>
                        </View>
                      ) : null}
                      
                      {f.improvement_suggestion ? (
                        <View style={{ marginTop: 4 }}>
                          <Text style={[styles.feedbackQ, { color: colors.foreground, fontSize: 11, fontFamily: "Inter_600SemiBold" }]}>O que melhoraria</Text>
                          <Text style={[styles.feedbackA, { color: colors.mutedForeground, fontSize: 12, lineHeight: 16 }]} numberOfLines={3}>{f.improvement_suggestion}</Text>
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* CENTRAL DE CONTESTAÇÕES */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 12 }]}>CONTESTAÇÕES</Text>
        <Text style={[styles.cohortSubtitleText, { color: colors.mutedForeground, marginTop: -8, marginBottom: 12 }]}>
          Respostas que os alunos pediram revisão.
        </Text>
        <View style={{ marginBottom: 24, gap: 12 }}>
          {(!adminData.reports || adminData.reports.filter(r => !hiddenReportIds.includes(r.id)).length === 0) ? (
            <View style={[styles.emptyStateWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <CheckCircle2 size={26} color={colors.success} style={{ marginBottom: 8 }} />
              <Text style={[styles.emptyStateTitle, { color: colors.mutedForeground }]}>Tudo resolvido</Text>
              <Text style={[styles.emptyStateDesc, { color: colors.mutedForeground }]}>Nenhuma contestação pendente.</Text>
            </View>
          ) : (
            adminData.reports.filter(r => !hiddenReportIds.includes(r.id)).slice(0, 5).map((report) => (
              <View key={report.id} style={[styles.feedbackItemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.feedbackItemName, { color: colors.foreground }]} numberOfLines={1}>
                      {report.user_email}
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 1 }}>
                      Módulo {report.module_id} • Questão {Number(report.question_id) + 1}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{ backgroundColor: colors.success + "15", borderColor: colors.success + "30", borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}
                    onPress={() => handleResolveReport(report.id)}
                  >
                    <Text style={{ color: colors.success, fontSize: 11, fontFamily: "Inter_700Bold" }}>Resolver</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ marginVertical: 4 }}>
                  <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: colors.foreground }}>
                    Questão: "{report.question_title}"
                  </Text>
                </View>
                <View style={{ backgroundColor: colors.background, padding: 10, borderRadius: 8, marginTop: 6 }}>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 2 }}>Motivo da contestação:</Text>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 16 }}>"{report.reason}"</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* DIVIDER E SEÇÃO DE GESTÃO */}
        <View style={{ height: 1, backgroundColor: colors.border, marginTop: 8, marginBottom: 24 }} />

        {/* GESTÃO DE TURMAS */}
        <View style={[styles.titleDividerRow, { marginTop: 0 }]}>
          <Text style={[styles.sectionLabel, { color: colors.foreground, fontSize: 11, fontFamily: "Inter_700Bold" }]}>GESTÃO DE TURMAS</Text>
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

        {/* LISTAGEM DE GESTÃO DE TURMAS — agrupada por curso/termo */}
        {(() => {
          if (rawClasses.length === 0) {
            return (
              <View style={[styles.emptyStateWrap, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 24 }]}>
                <Presentation size={26} color={colors.mutedForeground} style={{ marginBottom: 8 }} />
                <Text style={[styles.emptyStateTitle, { color: colors.mutedForeground }]}>Nenhuma turma criada</Text>
                <Text style={[styles.emptyStateDesc, { color: colors.mutedForeground }]}>Use o botão "Nova turma" acima para cadastrar.</Text>
              </View>
            );
          }

          // ── Agrupar por (course + term) — apenas renderização, sem alterar dados ──
          const groups: Array<{
            key: string;
            course: string;
            term: string;
            classes: typeof rawClasses;
          }> = [];

          rawClasses.forEach((cls) => {
            const groupKey = `${cls.course || ""}||${cls.term || ""}`;
            const existing = groups.find((g) => g.key === groupKey);
            if (existing) {
              existing.classes.push(cls);
            } else {
              groups.push({
                key: groupKey,
                course: cls.course || "",
                term: cls.term || "",
                classes: [cls],
              });
            }
          });

          // Extrair rótulo de sala: remove o prefixo curso/termo do nome, retorna o resto
          const getRoomLabel = (cls: { name: string; course: string; term: string }): string => {
            let label = cls.name || "";
            // Remove o curso
            if (cls.course && label.toLowerCase().startsWith(cls.course.toLowerCase())) {
              label = label.slice(cls.course.length);
            }
            // Remove separadores e o termo
            label = label.replace(/^[\s\-–·•]+/, "");
            if (cls.term && label.toLowerCase().startsWith(cls.term.toLowerCase())) {
              label = label.slice(cls.term.length);
            }
            label = label.replace(/^[\s\-–·•]+/, "").trim();
            // Se sobrou algo, mostra; senão usa o nome curto
            return label || cls.name;
          };

          return (
            <View style={{ gap: 10, marginBottom: 24 }}>
              {groups.map((group, gIdx) => (
                <View
                  key={group.key || String(gIdx)}
                  style={[styles.classGroupCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  {/* Header do grupo */}
                  <View style={styles.classGroupHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.classGroupTitle, { color: colors.foreground }]} numberOfLines={2}>
                        {group.course || "Sem curso"}
                      </Text>
                      <Text style={[styles.classGroupSub, { color: colors.mutedForeground }]}>
                        {[group.term, `${group.classes.length} ${group.classes.length === 1 ? "sala" : "salas"}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </Text>
                    </View>
                  </View>

                  {/* Chips de sala */}
                  <View style={styles.classChipRow}>
                    {group.classes.map((cls) => {
                      const roomLabel = getRoomLabel(cls);
                      const isEditing = editingClassId === cls.id;
                      return (
                        <TouchableOpacity
                          key={cls.id}
                          style={[
                            styles.classChip,
                            {
                              backgroundColor: isEditing ? colors.primary + "20" : colors.background,
                              borderColor: isEditing ? colors.primary : colors.border,
                              paddingVertical: 10,
                              paddingHorizontal: 12,
                            },
                          ]}
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
                          <Text
                            style={[
                              styles.classChipText,
                              { color: isEditing ? colors.primary : colors.foreground },
                            ]}
                            numberOfLines={1}
                          >
                            {roomLabel}
                          </Text>
                          <Edit2
                            size={12}
                            color={isEditing ? colors.primary : colors.mutedForeground}
                            strokeWidth={2}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          );
        })()}


      </ScrollView>
    </View>
  );
}

// ── HOME SCREEN ───────────────────────────────────────────────────────

interface StudentHomeContentProps {
  profile: any;
  progress: any;
  colors: any;
  insets: any;
  topPad: number;
  isGuest: boolean;
}

function StudentHomeContent({ profile, progress, colors, insets, topPad, isGuest }: StudentHomeContentProps) {
  // Estados para modal de revisar aula
  const [reviewModalVisible, setReviewModalVisible] = React.useState(false);
  const [selectedModuleToReview, setSelectedModuleToReview] = React.useState<typeof MODULE_DEFINITIONS[0] | null>(null);
  // Estado para feedback discreto de módulo bloqueado
  const [lockedFeedbackId, setLockedFeedbackId] = React.useState<number | null>(null);

  const completedCount = progress.completedModules.length;
  const totalModules = MODULE_DEFINITIONS.length;
  const progressPct = completedCount / totalModules;
  const accuracy = progress.totalExercises > 0
    ? Math.round((progress.correctAnswers / progress.totalExercises) * 100)
    : 0;

  const getModuleState = (mod: typeof MODULE_DEFINITIONS[0], index: number) => {
    const isCompleted = progress.completedModules.includes(mod.id);
    const prevDone = index === 0 || progress.completedModules.includes(MODULE_DEFINITIONS[index - 1].id);
    return { isCompleted, isLocked: !prevDone && !isCompleted };
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, paddingBottom: 10, backgroundColor: colors.card, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        <View style={styles.headerTop}>
          <View style={[styles.greetingContainer, { flex: 1, paddingRight: 8 }]}>
            <Text style={[styles.greetingText, { color: colors.mutedForeground }]} numberOfLines={1}>
              Olá, <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1} ellipsizeMode="tail">
                {isGuest ? "Visitante" : formatShortName(profile?.name)}
              </Text>
            </Text>
          </View>
          <View style={styles.badges}>
            <View style={[styles.badgeCompact, { backgroundColor: "#F59E0B" + "10" }]}>
              <Zap size={13} color="#F59E0B" strokeWidth={2.5} />
              <Text style={[styles.badgeTextCompact, { color: "#F59E0B" }]}>{progress.streak}d</Text>
            </View>
            <View style={[styles.badgeCompact, { backgroundColor: colors.primary + "10" }]}>
              <Star size={13} color={colors.primary} strokeWidth={2.5} />
              <Text style={[styles.badgeTextCompact, { color: colors.primary }]}>{progress.xp} XP</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { padding: 20, paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner de convidado — premium e compacto */}
        {isGuest && (
          <View style={{
            backgroundColor: colors.primary + "0A",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.primary + "20",
            paddingVertical: 10,
            paddingHorizontal: 14,
            marginBottom: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
              <Info size={16} color={colors.primary} strokeWidth={2} style={{ flexShrink: 0 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: colors.foreground }}>
                  Modo visitante • <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.primary }}>progresso local</Text>
                </Text>
                <Text style={{ fontSize: 10.5, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 1 }}>
                  Seu progresso fica salvo apenas neste aparelho.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: colors.primary,
                borderRadius: 8,
                flexShrink: 0,
              }}
              onPress={() => router.push("/sign-up" as any)}
              activeOpacity={0.85}
            >
              <Text style={{ color: "#FFF", fontSize: 11, fontFamily: "Inter_700Bold" }}>Salvar progresso</Text>
            </TouchableOpacity>
          </View>
        )}

        {MODULE_DEFINITIONS.map((mod, index) => {
          let { isCompleted, isLocked } = getModuleState(mod, index);
          const isNext = !isCompleted && !isLocked;
          // "currentNext" = primeiro módulo disponível que não foi concluído
          const isCurrentNext = isNext && !MODULE_DEFINITIONS.slice(0, index).some((m, idx) => {
            const s = getModuleState(m, idx);
            return !s.isCompleted && !s.isLocked;
          });

          const IconComp = ICON_MAP[mod.iconName];
          const accentColor = isCompleted
            ? colors.success
            : isLocked
            ? colors.mutedForeground
            : mod.accentColor;

          return (
            <View key={mod.id}>
              {index > 0 && (
                <View style={[styles.connector, {
                  backgroundColor: progress.completedModules.includes(MODULE_DEFINITIONS[index - 1].id) ? colors.primary + "50" : colors.border,
                  marginLeft: 37,
                }]} />
              )}
              <TouchableOpacity
                style={[styles.card, {
                  backgroundColor: colors.card,
                  borderColor: isCompleted
                    ? colors.success + "40"
                    : isCurrentNext
                    ? mod.accentColor + "60"
                    : colors.border,
                  borderWidth: isCurrentNext ? 1.5 : 1,
                  opacity: isLocked ? 0.75 : 1,
                  borderLeftWidth: isCurrentNext ? 4 : 1,
                  borderLeftColor: isCurrentNext ? mod.accentColor : (isCompleted ? colors.success + "40" : colors.border),
                  padding: 18,
                  marginBottom: 8,
                }]}
                onPress={() => {
                  if (isLocked) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setLockedFeedbackId(mod.id);
                    setTimeout(() => setLockedFeedbackId(null), 2500);
                    return;
                  }
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  if (isCompleted) {
                    setSelectedModuleToReview(mod);
                    setReviewModalVisible(true);
                  } else {
                    router.push({ pathname: "/lesson", params: { moduleId: mod.id } });
                  }
                }}
                activeOpacity={isLocked ? 0.85 : 0.8}
              >
                <View style={[styles.iconWrap, {
                  backgroundColor: accentColor + "12",
                  borderColor: accentColor + "25",
                }]}>
                  <IconComp size={20} color={accentColor} strokeWidth={2} />
                </View>
                <View style={[styles.cardInfo, { flexShrink: 1 }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "nowrap" }}>
                    <Text 
                       style={[styles.cardTitle, { color: isLocked ? colors.mutedForeground : colors.foreground, flexShrink: 1 }]} 
                       numberOfLines={1} 
                       ellipsizeMode="tail"
                    >
                      {mod.title}
                    </Text>
                  </View>
                  <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>
                    {mod.subtitle}
                  </Text>
                  {isCurrentNext && (
                    <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: mod.accentColor, marginTop: 6 }}>
                      Continuar aqui
                    </Text>
                  )}
                  {lockedFeedbackId === mod.id && (
                    <Text style={{ fontSize: 10, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 3 }}>
                      Complete o módulo anterior para desbloquear.
                    </Text>
                  )}
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
        {completedCount === totalModules && (
          <View style={{
            alignItems: "center",
            justifyContent: "center",
            marginTop: 28,
            marginBottom: 8,
            paddingVertical: 12,
          }}>
            <Text style={{
              fontSize: 13,
              fontFamily: "Inter_600SemiBold",
              color: colors.mutedForeground,
              letterSpacing: 0.5,
              fontStyle: "italic",
              textAlign: "center",
            }}>
              Em breve novas trilhas...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de Revisar Aula Customizado */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewModalVisible(false)}
        statusBarTranslucent
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setReviewModalVisible(false)}
        >
          <Pressable style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Revisar aula</Text>
            </View>
            
            <View style={{ gap: 14 }}>
              <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 20, textAlign: "center" }}>
                Deseja refazer os exercícios desta atividade do início? Seu progresso e pontuação de XP atual não serão afetados.
              </Text>
              
              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setReviewModalVisible(false);
                    setSelectedModuleToReview(null);
                  }}
                >
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: colors.primary }]}
                  onPress={async () => {
                    if (!selectedModuleToReview) return;
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setReviewModalVisible(false);
                    
                    const AsyncStorage = require("@react-native-async-storage/async-storage").default;
                    const userKey = isGuest ? "guest" : (profile?.id ?? "anon");
                    const sessionKey = `@ackadmy:lesson_session:${userKey}:${selectedModuleToReview.id}`;
                    try {
                      await AsyncStorage.removeItem(sessionKey);
                    } catch {}
                    
                    router.push({ pathname: "/lesson", params: { moduleId: selectedModuleToReview.id, isRevision: "true" } });
                    setSelectedModuleToReview(null);
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontFamily: "Inter_700Bold" }}>Revisar do início</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, Platform.OS === "web" ? 16 : 0);
  const { progress } = useProgress();
  const { profile, loading, profileLoading, isGuest } = useAuth();

  if (loading || profileLoading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  // Se não existir profile e não for guest, mostra aviso amigável
  if (!profile && !isGuest) {
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
  if (profile?.role === "admin") {
    return <AdminDashboard />;
  }

  return (
    <StudentHomeContent
      profile={profile}
      progress={progress}
      colors={colors}
      insets={insets}
      topPad={topPad}
      isGuest={isGuest}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  greetingContainer: { flexDirection: "row", alignItems: "baseline" },
  greetingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  name: { fontSize: 15, fontFamily: "Inter_700Bold" },
  badges: { flexDirection: "row", gap: 6 },
  badgeCompact: {
    flexDirection: "row", alignItems: "center", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 5, gap: 3.5,
  },
  badgeTextCompact: { fontSize: 11, fontFamily: "Inter_700Bold" },
  scroll: { padding: 16, gap: 0 },
  sectionLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 2, marginBottom: 12 },
  connector: { width: 2, height: 16, marginBottom: 0 },
  card: {
    flexDirection: "row", alignItems: "center", borderRadius: 12,
    borderWidth: 1, padding: 14, gap: 12, marginBottom: 0,
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

  // ── Admin Dashboard ──────────────────────────────────────────────────
  adminHeader: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  adminHeaderCard: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  adminHeaderTitle: { fontSize: 19, fontFamily: "Inter_800ExtraBold", lineHeight: 24 },
  adminHeaderSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  headerTitleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginTop: 6, gap: 10 },

  gestionBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5, alignSelf: "flex-start" },
  gestionBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold" },

  // Metric cards — bento-style 2×2
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 4 },
  metricCard: { flex: 1, minWidth: "44%", borderRadius: 14, borderWidth: 1, padding: 14, gap: 6 },
  metricIconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  metricValue: { fontSize: 28, fontFamily: "Inter_800ExtraBold", lineHeight: 32 },
  metricLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  metricSubtext: { fontSize: 10, fontFamily: "Inter_500Medium", letterSpacing: 0.3 },

  // Insight cards
  insightCard: { borderRadius: 12, borderWidth: 1, padding: 12, gap: 4, marginTop: 8, marginBottom: 8 },
  insightHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  insightTitle: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 0.2 },
  insightDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },

  // Class summary cards — lean
  cohortVisualCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 0 },
  cohortHeaderRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", padding: 14, paddingBottom: 10 },
  cohortTitleText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  cohortCourseLine: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  cohortSubtitleText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  engagePill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  engagePillText: { fontSize: 11, fontFamily: "Inter_700Bold" },

  // Inline stats row (replaces grid cells)
  cohortStatsRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10 },
  cohortStatInline: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  cohortStatInlineVal: { fontSize: 13, fontFamily: "Inter_700Bold" },
  cohortStatInlineLbl: { fontSize: 11, fontFamily: "Inter_400Regular" },
  cohortStatDivider: { width: 1, height: 14, opacity: 0.5 },

  // Keep grid cells for class detail view
  cohortStatsGrid: { flexDirection: "row", gap: 8, marginVertical: 4 },
  cohortStatGridCell: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 8 },
  cohortGridVal: { fontSize: 14, fontFamily: "Inter_700Bold" },
  cohortGridLbl: { fontSize: 9, fontFamily: "Inter_500Medium" },

  engageBarArea: { gap: 2 },
  engageBarLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  engageBarValue: { fontSize: 10, fontFamily: "Inter_700Bold" },
  engageBarTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  engageBarFill: { height: 6, borderRadius: 3 },
  // Action button — ghost style with border-top divider
  cohortActionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 12, borderTopWidth: 1 },
  cohortActionText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  titleDividerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20, marginBottom: 8 },
  outlineBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  outlineBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  alertBanner: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 },
  alertBannerText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  formContainer: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 16, gap: 12 },
  formTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 2 },
  formField: { gap: 5 },
  formLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
  formInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, fontFamily: "Inter_400Regular" },
  formActionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 4 },
  formCancelBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  formCancelText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  formSubmitBtn: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, minWidth: 100, alignItems: "center", justifyContent: "center" },
  formSubmitText: { color: "#FFF", fontSize: 13, fontFamily: "Inter_600SemiBold" },

  lockWarningBanner: { flexDirection: "row", gap: 8, borderWidth: 1, borderRadius: 8, padding: 10, alignItems: "flex-start", marginBottom: 4 },
  lockWarningText: { flex: 1, fontSize: 10, fontFamily: "Inter_500Medium", lineHeight: 14 },

  // Class management list — minimal
  listCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginTop: 4, marginBottom: 24 },
  listItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 13, paddingHorizontal: 16 },
  className: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  classEngage: { alignItems: "flex-end" },
  classEngageText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  classEngageLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  classSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  classRight: { flexDirection: "row", alignItems: "center" },

  roadmapCard: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 16, gap: 16, marginBottom: 20 },
  roadmapInfo: { flex: 1, gap: 4 },
  roadmapTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  roadmapDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },

  backButtonRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  backButtonText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // Empty states — centered, icon + title + desc
  emptyStateWrap: { borderRadius: 14, borderWidth: 1, padding: 28, alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 8 },
  emptyStateTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  emptyStateDesc: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18, marginTop: 2 },
  emptyCard: { borderRadius: 12, borderWidth: 1, padding: 28, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },

  // Primary action button
  primaryBtn: { borderRadius: 10, paddingHorizontal: 20, paddingVertical: 11, alignItems: "center", justifyContent: "center" },
  primaryBtnText: { color: "#FFF", fontSize: 13, fontFamily: "Inter_700Bold" },

  studentDetailCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 12 },
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

  editIconBtn: { width: 36, height: 36, borderWidth: 1, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  editIconText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  // Class management — grouped cards with chips
  classGroupCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 0 },
  classGroupHeader: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  classGroupTitle: { fontSize: 14, fontFamily: "Inter_700Bold", lineHeight: 20 },
  classGroupSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  classChipRow: {
    flexDirection: "row", flexWrap: "wrap", gap: 8,
    paddingHorizontal: 16, paddingBottom: 14, paddingTop: 4,
  },
  classChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 9,
    minWidth: 60,
  },
  classChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold", flexShrink: 1 },

  pillBadge: { borderRadius: 4, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
  pillBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold" },

  // Feedbacks
  feedbackSummaryCard: { borderRadius: 12, borderWidth: 1, padding: 16 },
  feedbackSummaryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  feedbackTotalText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  feedbackRecBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16 },
  feedbackRecText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  feedbackAveragesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  feedbackAvgItem: { flex: 1, minWidth: "20%", alignItems: "center", backgroundColor: "rgba(0,0,0,0.03)", paddingVertical: 10, borderRadius: 8 },
  feedbackAvgVal: { fontSize: 16, fontFamily: "Inter_700Bold" },
  feedbackAvgLbl: { fontSize: 10, fontFamily: "Inter_500Medium", marginTop: 2 },
  
  feedbackRecentTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginLeft: 4 },
  feedbackItemCard: { borderRadius: 12, borderWidth: 1, padding: 14 },
  feedbackItemName: { fontSize: 13, fontFamily: "Inter_700Bold" },
  feedbackItemClass: { fontSize: 11, fontFamily: "Inter_500Medium" },
  feedbackItemRec: { fontSize: 11, fontFamily: "Inter_700Bold" },
  feedbackQ: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  feedbackA: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 16 },

  // Modal de Revisar Aula
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  modalTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  modalActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
  },
  modalCancelBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalSubmitBtn: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
});
