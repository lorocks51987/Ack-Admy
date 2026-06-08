import React from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator, TextInput,
} from "react-native";
import {
  Shield, AlertTriangle, Star, CheckCircle2,
  Users, ChevronRight, ChevronLeft,
  Target, BookOpen, Medal, Crown,
  Plus, Edit2, Info, MessageSquare, ThumbsUp, Download, Zap,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { supabase } from "@/services/supabaseClient";
import { Platform as RNPlatform } from "react-native";

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

export function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [adminData, setAdminData] = React.useState<AdminDashboardData | null>(null);
  const [adminLoading, setAdminLoading] = React.useState(true);
  const [adminError, setAdminError] = React.useState<string | null>(null);
  const [selectedClass, setSelectedClass] = React.useState<string | null>(null);
  const [hiddenReportIds, setHiddenReportIds] = React.useState<string[]>([]);

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
      { xp: number; completedCount: number; correctAnswers: number; totalExercises: number; streak: number }
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
      { totalXp: number; totalCompleted: number; correctAnswers: number; totalExercises: number; studentCount: number }
    > = {};

    const studentsList: AdminStudent[] = [];

    studentProfiles.forEach((p: any) => {
      const className = (p.course && p.term && p.room)
        ? `${p.course} - ${p.term} ${p.room}`
        : (p.class_name || "Sem Turma");
      const prog = progressMap.get(p.id) || { xp: 0, completedCount: 0, correctAnswers: 0, totalExercises: 0, streak: 0 };

      totalXp += prog.xp;
      totalCompleted += prog.completedCount;

      if (!classStats[className]) {
        classStats[className] = { totalXp: 0, totalCompleted: 0, correctAnswers: 0, totalExercises: 0, studentCount: 0 };
      }
      classStats[className].totalXp += prog.xp;
      classStats[className].totalCompleted += prog.completedCount;
      classStats[className].correctAnswers += prog.correctAnswers;
      classStats[className].totalExercises += prog.totalExercises;
      classStats[className].studentCount += 1;

      const accuracy = prog.totalExercises > 0 ? Math.round((prog.correctAnswers / prog.totalExercises) * 100) : 0;

      studentsList.push({
        id: p.id,
        name: p.name || "Aluno",
        email: p.email || "",
        className,
        xp: prog.xp,
        completedCount: prog.completedCount,
        accuracy,
        streak: prog.streak,
      });
    });

    const averageXp = activeStudents > 0 ? Math.round(totalXp / activeStudents) : 0;

    let fetchedClasses: any[] = [];
    try {
      const { data: dbClasses, error: dbClassesErr } = await supabase.from("classes").select("id, name, course, term");
      if (dbClassesErr) throw dbClassesErr;
      fetchedClasses = dbClasses || [];
    } catch (classErr) {
      console.warn("Supabase fetch classes error:", classErr);
    }

    if (fetchedClasses.length === 0) {
      fetchedClasses = Object.keys(classStats).map((name, idx) => ({
        id: `profile-${idx}`,
        name,
        course: "Trilha Geral",
        term: "Unimar",
      }));
    }

    setRawClasses(fetchedClasses.map((c) => ({ id: String(c.id), name: c.name || "", course: c.course || "", term: c.term || "" })));

    let highlightClass = "Nenhuma";
    let highestAvgXp = -1;
    const classesList: AdminClassSummary[] = [];

    Object.keys(classStats).forEach((className) => {
      const stats = classStats[className];
      const rawAvgXp = stats.studentCount > 0 ? stats.totalXp / stats.studentCount : 0;
      const avgXp = isFinite(rawAvgXp) ? Math.round(rawAvgXp) : 0;

      if (avgXp > highestAvgXp) { highestAvgXp = avgXp; highlightClass = className; }

      const rawAvgCompleted = stats.studentCount > 0 ? stats.totalCompleted / stats.studentCount : 0;
      const avgCompleted = isFinite(rawAvgCompleted) ? Math.round(rawAvgCompleted * 10) / 10 : 0;
      const rawAvgAccuracy = stats.totalExercises > 0 ? (stats.correctAnswers / stats.totalExercises) * 100 : 0;
      const avgAccuracy = isFinite(rawAvgAccuracy) ? Math.round(rawAvgAccuracy) : 0;
      const rawEngagement = avgXp + avgCompleted * 5 + avgAccuracy * 2;
      const engagementScore = isFinite(rawEngagement) ? Math.round(rawEngagement) : 0;

      const matchedDbClass = fetchedClasses.find(
        (c) => String(c.name).trim().toLowerCase() === className.trim().toLowerCase()
      );

      classesList.push({
        name: className, studentCount: stats.studentCount, averageXp: avgXp, averageCompleted: avgCompleted,
        averageAccuracy: avgAccuracy, engagementScore, course: matchedDbClass?.course || "Trilha Geral", term: matchedDbClass?.term || "",
      });
    });

    classesList.sort((a, b) => b.engagementScore - a.engagementScore);

    let feedbackStats = { total: 0, usability: 0, clarity: 0, exercises: 0, feedback: 0, returnIntention: 0, recommendationYesPct: 0 };
    let recentFeedbacks: any[] = [];
    try {
      const { data: feedbackData, error: feedbackErr } = await supabase
        .from("feedbacks").select("*").order("created_at", { ascending: false });
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
    } catch (fbErr) { console.warn("Supabase fetch feedbacks error:", fbErr); }

    let reportsData: any[] = [];
    try {
      const { data: reports, error: reportsErr } = await supabase
        .from("question_reports").select("*").order("created_at", { ascending: false });
      if (reportsErr) throw reportsErr;
      reportsData = reports || [];
    } catch (repErr) { console.warn("Supabase fetch question reports error:", repErr); }

    setAdminData({
      activeStudents, averageXp, completedModulesCount: totalCompleted, highlightClass,
      classes: classesList, students: studentsList, feedbackStats, recentFeedbacks, reports: reportsData,
    });
    setAdminLoading(false);
  };

  React.useEffect(() => { fetchAdminData(); }, []);

  const isClassNameLocked = (name: string) => {
    if (!adminData) return false;
    return adminData.students.some((s) => s.className.trim().toLowerCase() === name.trim().toLowerCase());
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) { setClassActionError("O nome da turma é obrigatório."); return; }
    setClassActionLoading(true); setClassActionError(null); setClassActionSuccess(null);
    try {
      const { error } = await supabase.from("classes").insert({
        name: newClassName.trim(),
        course: newClassCourse.trim() || null,
        term: newClassTerm.trim() || null,
      });
      if (error) {
        if (error.message.includes("permission denied") || error.message.includes("row-level security")) throw new Error("Você não tem permissão para salvar turmas.");
        throw new Error(error.message);
      }
      setNewClassName(""); setNewClassCourse(""); setNewClassTerm("");
      setIsCreatingClass(false);
      setClassActionSuccess("Turma cadastrada com sucesso!");
      await fetchAdminData();
    } catch (err: any) { setClassActionError(err.message || "Erro ao salvar turma."); }
    finally { setClassActionLoading(false); }
  };

  const handleUpdateClass = async () => {
    if (!editingClassId) return;
    setClassActionLoading(true); setClassActionError(null); setClassActionSuccess(null);
    try {
      const targetCls = rawClasses.find((c) => c.id === editingClassId);
      const locked = targetCls ? isClassNameLocked(targetCls.name) : false;
      const payload: Record<string, any> = { course: editClassCourse.trim() || null, term: editClassTerm.trim() || null };
      if (!locked) {
        if (!editClassName.trim()) throw new Error("O nome da turma é obrigatório.");
        payload.name = editClassName.trim();
      }
      const { error } = await supabase.from("classes").update(payload).eq("id", editingClassId);
      if (error) {
        if (error.message.includes("permission denied") || error.message.includes("row-level security")) throw new Error("Você não tem permissão para salvar turmas.");
        throw new Error(error.message);
      }
      setEditingClassId(null); setEditClassName(""); setEditClassCourse(""); setEditClassTerm("");
      setClassActionSuccess("Turma atualizada com sucesso!");
      await fetchAdminData();
    } catch (err: any) { setClassActionError(err.message || "Erro ao atualizar turma."); }
    finally { setClassActionLoading(false); }
  };

  const handleResolveReport = async (reportId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const oldHidden = hiddenReportIds;
    setHiddenReportIds((prev) => [...prev, reportId]);
    try {
      const { error } = await supabase.from("question_reports").delete().eq("id", reportId);
      if (error) throw error;
    } catch (err) {
      console.warn("Error deleting question report:", err);
      setHiddenReportIds(oldHidden);
      if (Platform.OS === "web") {
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
    const headers = ["Turma", "Nome do Aluno", "Email", "XP", "Modulos Concluidos", "Precisao (%)", "Dias Ativos"];
    const rows = studentsInClass.map((s) => [s.className, s.name, s.email, s.xp, s.completedCount, s.accuracy, s.streak]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    if (Platform.OS === "web") {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Relatorio_${selectedClass.replace(/[^a-zA-Z0-9]/g, "_")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } else {
      const FileSystem = require("expo-file-system");
      const Sharing = require("expo-sharing");
      const fileUri = `${FileSystem.documentDirectory}Relatorio_${selectedClass.replace(/[^a-zA-Z0-9]/g, "_")}.csv`;
      FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 })
        .then(() => { Sharing.shareAsync(fileUri); })
        .catch((err: any) => { console.warn("Erro ao compartilhar relatorio CSV:", err); });
    }
  };

  // ── Loading State ───────────────────────────────────────────────────────────
  if (adminLoading) {
    return (
      <View style={[s.root, { backgroundColor: colors.background }]}>
        <View style={[s.adminHeaderCard, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={s.headerTitleRow}>
            <Text style={[s.adminHeaderTitle, { color: colors.foreground }]}>Painel Professor/Admin</Text>
            <View style={[s.gestionBadge, { backgroundColor: colors.primary }]}>
              <Text style={s.gestionBadgeText}>Visão de gestão</Text>
            </View>
          </View>
          <Text style={[s.adminHeaderSub, { color: colors.mutedForeground }]}>
            Acompanhe o desempenho das turmas na Trilha de Segurança da Informação
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  // ── Error State ─────────────────────────────────────────────────────────────
  if (adminError || !adminData) {
    return (
      <View style={[s.root, { backgroundColor: colors.background }]}>
        <View style={[s.adminHeaderCard, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={s.headerTitleRow}>
            <Text style={[s.adminHeaderTitle, { color: colors.foreground }]}>Painel Professor/Admin</Text>
            <View style={[s.gestionBadge, { backgroundColor: colors.primary }]}>
              <Text style={s.gestionBadgeText}>Visão de gestão</Text>
            </View>
          </View>
          <Text style={[s.adminHeaderSub, { color: colors.mutedForeground }]}>
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

  // ── Class Detail View ───────────────────────────────────────────────────────
  if (selectedClass) {
    const classInfo = adminData.classes.find((c) => c.name === selectedClass);
    const studentsInClass = adminData.students
      .filter((s) => s.className === selectedClass)
      .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name));

    return (
      <View style={[s.root, { backgroundColor: colors.background }]}>
        <View style={[s.adminHeaderCard, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={s.backButtonRow} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedClass(null); }} activeOpacity={0.7}>
            <ChevronLeft size={20} color={colors.primary} />
            <Text style={[s.backButtonText, { color: colors.primary }]}>Voltar para turmas</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", marginTop: 8, gap: 10 }}>
            <Text style={[s.adminHeaderTitle, { color: colors.foreground, flex: 1, marginTop: 0 }]}>Turma: {selectedClass}</Text>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
              onPress={handleExportCSV} activeOpacity={0.8}
            >
              <Download size={14} color="#FFF" />
              <Text style={{ color: "#FFF", fontSize: 12, fontFamily: "Inter_700Bold" }}>Exportar CSV</Text>
            </TouchableOpacity>
          </View>
          <Text style={[s.adminHeaderSub, { color: colors.mutedForeground }]}>Acompanhe o desempenho individual dos alunos.</Text>
        </View>
        <ScrollView key="class-detail-scroll" contentContainerStyle={[s.scroll, { paddingBottom: TAB_HEIGHT + insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>
          {classInfo && (
            <View style={s.metricsGrid}>
              {[
                { icon: <Users size={16} color={colors.primary} />, bg: colors.primary + "15", val: classInfo.studentCount, lbl: "alunos" },
                { icon: <Star size={16} color="#F59E0B" />, bg: "#F59E0B15", val: classInfo.studentCount > 0 ? classInfo.averageXp : 0, lbl: "XP médio" },
                { icon: <CheckCircle2 size={16} color={colors.success} />, bg: colors.success + "15", val: classInfo.studentCount > 0 ? classInfo.averageCompleted : 0, lbl: "Módulos (méd.)" },
                { icon: <Target size={16} color={colors.primary} />, bg: colors.primary + "15", val: classInfo.studentCount > 0 ? `${classInfo.averageAccuracy}%` : "—", lbl: "Precisão média" },
              ].map((m, i) => (
                <View key={i} style={[s.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[s.metricIconWrap, { backgroundColor: m.bg }]}>{m.icon}</View>
                  <Text style={[s.metricValue, { color: colors.foreground }]} numberOfLines={1} adjustsFontSizeToFit>{m.val}</Text>
                  <Text style={[s.metricSubtext, { color: colors.mutedForeground }]}>{m.lbl}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={[s.sectionLabel, { color: colors.mutedForeground, marginTop: 24 }]}>RANKING DE ALUNOS</Text>
          {studentsInClass.length === 0 ? (
            <View style={[s.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Users size={32} color={colors.mutedForeground} style={{ marginBottom: 8 }} />
              <Text style={[s.emptyText, { color: colors.mutedForeground }]}>Esta turma ainda não possui alunos cadastrados.</Text>
            </View>
          ) : (
            studentsInClass.map((student, idx) => {
              const isTop3 = idx < 3;
              const podiumColor = isTop3 ? PODIUM_COLORS[idx] : colors.mutedForeground;
              return (
                <View key={student.id} style={[s.studentDetailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={s.studentCardHeader}>
                    <View style={[s.studentRankBadge, { backgroundColor: isTop3 ? podiumColor + "20" : colors.muted, borderColor: isTop3 ? podiumColor + "50" : colors.border }]}>
                      {idx === 0 ? <Crown size={12} color={podiumColor} /> : idx === 1 || idx === 2 ? <Medal size={12} color={podiumColor} /> : null}
                      <Text style={[s.studentRankText, { color: isTop3 ? podiumColor : colors.foreground }]}>{idx + 1}º</Text>
                    </View>
                    <View style={s.studentCardTitle}>
                      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                        <Text style={[s.studentName, { color: colors.foreground }]}>{student.name}</Text>
                        {isTop3 && <View style={[s.pillBadge, { backgroundColor: podiumColor + "25", borderColor: podiumColor }]}><Text style={[s.pillBadgeText, { color: podiumColor }]}>Top 3</Text></View>}
                        {student.xp === 0 && <View style={[s.pillBadge, { backgroundColor: colors.error + "15", borderColor: colors.error }]}><Text style={[s.pillBadgeText, { color: colors.error }]}>Sem progresso</Text></View>}
                        {student.accuracy >= 80 && <View style={[s.pillBadge, { backgroundColor: colors.success + "15", borderColor: colors.success }]}><Text style={[s.pillBadgeText, { color: colors.success }]}>Alta precisão</Text></View>}
                      </View>
                      {student.email ? <Text style={[s.studentEmail, { color: colors.mutedForeground }]} numberOfLines={1} ellipsizeMode="tail">{student.email}</Text> : null}
                    </View>
                  </View>
                  <View style={[s.studentStatsRow, { borderTopColor: colors.border }]}>
                    {[
                      { icon: <Star size={12} color={colors.primary} />, val: student.xp, lbl: "XP" },
                      { icon: <BookOpen size={12} color={colors.primary} />, val: student.completedCount, lbl: "Módulos" },
                      { icon: <Target size={12} color={colors.success} />, val: `${student.accuracy}%`, lbl: "Precisão" },
                      { icon: <Zap size={12} color="#F59E0B" />, val: `${student.streak}d`, lbl: "Streak" },
                    ].map((stat, si) => (
                      <View key={si} style={s.studentStatItem}>
                        {stat.icon}
                        <Text style={[s.studentStatVal, { color: colors.foreground }]}>{stat.val}</Text>
                        <Text style={[s.studentStatLbl, { color: colors.mutedForeground }]}>{stat.lbl}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })
          )}
          <TouchableOpacity style={[s.backBottomButton, { borderColor: colors.border }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedClass(null); }} activeOpacity={0.75}>
            <ChevronLeft size={14} color={colors.mutedForeground} />
            <Text style={[s.backBottomText, { color: colors.mutedForeground }]}>Voltar para turmas</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  const bestClass = adminData.classes[0]?.name || "Nenhuma";
  const bestScore = adminData.classes[0]?.engagementScore || 0;
  const lowestClass = adminData.classes.length > 1 ? adminData.classes[adminData.classes.length - 1] : null;

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <View style={[s.adminHeaderCard, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={s.headerTitleRow}>
          <Text style={[s.adminHeaderTitle, { color: colors.foreground }]}>Painel do Professor</Text>
          <View style={[s.gestionBadge, { backgroundColor: colors.primary }]}>
            <Text style={s.gestionBadgeText}>Visão de gestão</Text>
          </View>
        </View>
        <Text style={[s.adminHeaderSub, { color: colors.mutedForeground }]}>Acompanhe turmas, progresso e feedbacks.</Text>
      </View>

      <ScrollView key="admin-main-scroll" contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 120 }]} showsVerticalScrollIndicator={false}>
        {/* INDICADORES PRINCIPAIS */}
        <Text style={[s.sectionLabel, { color: colors.mutedForeground }]}>INDICADORES PRINCIPAIS</Text>
        <View style={s.metricsGrid}>
          {[
            { val: adminData.activeStudents, lbl: "Alunos ativos" },
            { val: adminData.classes.length, lbl: "Turmas" },
            { val: adminData.averageXp, lbl: "XP médio" },
            { val: adminData.feedbackStats.total, lbl: "Feedbacks" },
          ].map((m, i) => (
            <View key={i} style={[s.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[s.metricValue, { color: colors.foreground }]}>{m.val}</Text>
              <Text style={[s.metricSubtext, { color: colors.mutedForeground }]}>{m.lbl}</Text>
            </View>
          ))}
        </View>

        {/* INSIGHT CARD */}
        <View style={[s.insightCard, { backgroundColor: colors.primary + "08", borderColor: colors.primary + "20" }]}>
          <View style={s.insightHeader}>
            <Info size={16} color={colors.primary} />
            <Text style={[s.insightTitle, { color: colors.primary }]}>Destaque</Text>
          </View>
          <Text style={[s.insightDesc, { color: colors.foreground }]}>
            {adminData.classes.length === 0
              ? "Nenhuma turma cadastrada ainda. Cadastre turmas em Gestão de Turmas."
              : lowestClass
              ? `🏆 Mais engajada: ${bestClass} (${bestScore} pts).\n⚠️ Menor engajamento: "${lowestClass.name}" (${lowestClass.averageXp} XP médio). Considere atenção especial.`
              : `🏆 Turma destaque: ${bestClass} com ${bestScore} pts de engajamento.`}
          </Text>
        </View>

        {/* RESUMO DAS TURMAS */}
        <Text style={[s.sectionLabel, { color: colors.mutedForeground, marginTop: 24 }]}>RESUMO DAS TURMAS</Text>
        <View style={{ gap: 12, marginBottom: 24 }}>
          {adminData.classes.length === 0 ? (
            <View style={[s.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ color: colors.mutedForeground }}>Nenhuma turma cadastrada ainda.</Text>
            </View>
          ) : (
            adminData.classes.map((cls) => (
              <View key={cls.name} style={[s.cohortVisualCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={s.cohortHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cohortTitleText, { color: colors.foreground }]}>{cls.name}</Text>
                    {cls.course ? <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.primary, marginTop: 2 }}>{cls.course} {cls.term ? `• ${cls.term}` : ""}</Text> : null}
                    <Text style={[s.cohortSubtitleText, { color: colors.mutedForeground, marginTop: 2 }]}>{cls.studentCount} {cls.studentCount === 1 ? "aluno matriculado" : "alunos matriculados"}</Text>
                  </View>
                  <View style={[s.engagePill, { backgroundColor: colors.primary + "15" }]}>
                    <Text style={[s.engagePillText, { color: colors.primary }]}>{cls.engagementScore} pts</Text>
                  </View>
                </View>
                <View style={s.cohortStatsGrid}>
                  {[
                    { val: cls.studentCount > 0 ? `${cls.averageXp}` : "0", lbl: "XP médio", color: colors.primary, bg: colors.primary + "08" },
                    { val: cls.studentCount > 0 ? `${cls.averageCompleted}` : "0", lbl: "Módulos", color: colors.success, bg: colors.success + "08" },
                    { val: cls.studentCount > 0 ? `${cls.averageAccuracy}%` : "—", lbl: "Precisão", color: "#F59E0B", bg: "#F59E0B08" },
                  ].map((stat, si) => (
                    <View key={si} style={[s.cohortStatGridCell, { backgroundColor: stat.bg }]}>
                      <Text style={[s.cohortGridVal, { color: stat.color }]} numberOfLines={1} adjustsFontSizeToFit>{stat.val}</Text>
                      <Text style={[s.cohortGridLbl, { color: colors.mutedForeground }]}>{stat.lbl}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={[s.cohortActionBtn, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "20" }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedClass(cls.name); }}
                  activeOpacity={0.7}
                >
                  <Text style={[s.cohortActionText, { color: colors.primary }]}>Ver alunos</Text>
                  <ChevronRight size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* FEEDBACKS DOS ALUNOS */}
        <Text style={[s.sectionLabel, { color: colors.mutedForeground, marginTop: 12 }]}>FEEDBACKS DOS ALUNOS</Text>
        <View style={{ marginBottom: 24, gap: 12 }}>
          {adminData.feedbackStats.total === 0 ? (
            <View style={[s.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[s.emptyText, { color: colors.mutedForeground }]}>Os feedbacks aparecerão aqui após os alunos concluírem a primeira aula.</Text>
            </View>
          ) : (
            <>
              <View style={[s.feedbackSummaryCard, { backgroundColor: colors.card, borderColor: colors.border, padding: 16 }]}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <View style={{ gap: 4 }}>
                    <Text style={[s.feedbackTotalText, { color: colors.foreground }]}>{adminData.feedbackStats.total} {adminData.feedbackStats.total === 1 ? "avaliação" : "avaliações"}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
                      <Text style={{ fontSize: 28, fontFamily: "Inter_800ExtraBold", color: colors.foreground }}>{adminData.feedbackStats.usability || "0.0"}</Text>
                      <View style={{ gap: 2 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                          {[1, 2, 3, 4, 5].map((num) => {
                            const active = num <= Math.round(adminData.feedbackStats.usability || 0);
                            return <Shield key={num} size={12} color={active ? colors.primary : colors.border} fill={active ? colors.primary : "transparent"} strokeWidth={1.5} />;
                          })}
                        </View>
                        <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>Nota média geral</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ gap: 4, alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 20, fontFamily: "Inter_800ExtraBold", color: colors.success }}>{adminData.feedbackStats.recommendationYesPct}%</Text>
                    <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_500Medium", textAlign: "right" }}>Recomendam o app</Text>
                  </View>
                </View>
              </View>
              {adminData.recentFeedbacks.length > 0 && (
                <View style={{ gap: 8, marginTop: 4 }}>
                  <Text style={[s.feedbackRecentTitle, { color: colors.foreground }]}>Comentários recentes</Text>
                  {adminData.recentFeedbacks.map((f) => (
                    <View key={f.id} style={[s.feedbackItemCard, { backgroundColor: colors.card, borderColor: colors.border, gap: 4 }]}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={[s.feedbackItemName, { color: colors.foreground, fontSize: 13, fontFamily: "Inter_700Bold" }]}>{f.user_name || "Aluno anônimo"}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                          {[1, 2, 3, 4, 5].map((num) => {
                            const active = num <= (f.rating_usability ?? 5);
                            return <Shield key={num} size={12} color={active ? colors.primary : colors.border} fill={active ? colors.primary : "transparent"} strokeWidth={1.5} />;
                          })}
                        </View>
                      </View>
                      <Text style={[s.feedbackItemClass, { color: colors.mutedForeground, fontSize: 11, fontFamily: "Inter_500Medium" }]}>{f.class_name || "Sem turma"}</Text>
                      {f.liked_most ? <View style={{ marginTop: 6 }}><Text style={[s.feedbackQ, { color: colors.foreground, fontSize: 11, fontFamily: "Inter_600SemiBold" }]}>O que gostou</Text><Text style={[s.feedbackA, { color: colors.mutedForeground, fontSize: 12, lineHeight: 16 }]} numberOfLines={3}>{f.liked_most}</Text></View> : null}
                      {f.improvement_suggestion ? <View style={{ marginTop: 4 }}><Text style={[s.feedbackQ, { color: colors.foreground, fontSize: 11, fontFamily: "Inter_600SemiBold" }]}>O que melhoraria</Text><Text style={[s.feedbackA, { color: colors.mutedForeground, fontSize: 12, lineHeight: 16 }]} numberOfLines={3}>{f.improvement_suggestion}</Text></View> : null}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* CONTESTAÇÕES */}
        <Text style={[s.sectionLabel, { color: colors.mutedForeground, marginTop: 12 }]}>CONTESTAÇÕES</Text>
        <Text style={[s.cohortSubtitleText, { color: colors.mutedForeground, marginTop: -8, marginBottom: 12 }]}>Respostas que os alunos pediram revisão.</Text>
        <View style={{ marginBottom: 24, gap: 12 }}>
          {(!adminData.reports || adminData.reports.filter((r) => !hiddenReportIds.includes(r.id)).length === 0) ? (
            <View style={[s.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[s.emptyText, { color: colors.mutedForeground }]}>Nenhuma contestação pendente.</Text>
            </View>
          ) : (
            adminData.reports.filter((r) => !hiddenReportIds.includes(r.id)).slice(0, 5).map((report) => (
              <View key={report.id} style={[s.feedbackItemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[s.feedbackItemName, { color: colors.foreground }]} numberOfLines={1}>{report.user_email}</Text>
                    <Text style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 1 }}>Módulo {report.module_id} • Questão {Number(report.question_id) + 1}</Text>
                  </View>
                  <TouchableOpacity
                    style={{ backgroundColor: colors.success + "15", borderColor: colors.success + "30", borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}
                    onPress={() => handleResolveReport(report.id)}
                  >
                    <Text style={{ color: colors.success, fontSize: 11, fontFamily: "Inter_700Bold" }}>Resolver</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ marginVertical: 4 }}>
                  <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: colors.foreground }}>Questão: "{report.question_title}"</Text>
                </View>
                <View style={{ backgroundColor: colors.background, padding: 10, borderRadius: 8, marginTop: 6 }}>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 2 }}>Motivo da contestação:</Text>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 16 }}>"{report.reason}"</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* GESTÃO DE TURMAS */}
        <View style={s.titleDividerRow}>
          <Text style={[s.sectionLabel, { color: colors.mutedForeground }]}>GESTÃO DE TURMAS</Text>
          <TouchableOpacity
            style={[s.outlineBtn, { borderColor: colors.primary }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsCreatingClass((o) => !o); setEditingClassId(null); setClassActionError(null); setClassActionSuccess(null); }}
            activeOpacity={0.7}
          >
            <Plus size={14} color={colors.primary} />
            <Text style={[s.outlineBtnText, { color: colors.primary }]}>{isCreatingClass ? "Colapsar" : "Nova turma"}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[s.cohortSubtitleText, { color: colors.mutedForeground, marginTop: -8, marginBottom: 12 }]}>Cadastre e organize as turmas disponíveis para novos alunos.</Text>

        {classActionSuccess && <View style={[s.alertBanner, { backgroundColor: colors.success + "15", borderColor: colors.success + "30" }]}><Text style={[s.alertBannerText, { color: colors.success }]}>✓ {classActionSuccess}</Text></View>}
        {classActionError && <View style={[s.alertBanner, { backgroundColor: colors.error + "15", borderColor: colors.error + "30" }]}><Text style={[s.alertBannerText, { color: colors.error }]}>⚠ {classActionError}</Text></View>}

        {isCreatingClass && (
          <View style={[s.formContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.formTitle, { color: colors.foreground }]}>Cadastrar Nova Turma</Text>
            {[
              { label: "Nome da Turma *", value: newClassName, setter: setNewClassName, placeholder: "Ex: ADS - 5º Termo" },
              { label: "Curso", value: newClassCourse, setter: setNewClassCourse, placeholder: "Ex: Análise e Desenvolvimento de Sistemas" },
              { label: "Termo / Semestre", value: newClassTerm, setter: setNewClassTerm, placeholder: "Ex: 5º Semestre" },
            ].map((field) => (
              <View key={field.label} style={s.formField}>
                <Text style={[s.formLabel, { color: colors.mutedForeground }]}>{field.label}</Text>
                <TextInput style={[s.formInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]} placeholder={field.placeholder} placeholderTextColor={colors.mutedForeground} value={field.value} onChangeText={field.setter} />
              </View>
            ))}
            <View style={s.formActionsRow}>
              <TouchableOpacity style={[s.formCancelBtn, { borderColor: colors.border }]} onPress={() => setIsCreatingClass(false)} disabled={classActionLoading}><Text style={[s.formCancelText, { color: colors.mutedForeground }]}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={[s.formSubmitBtn, { backgroundColor: colors.primary }]} onPress={handleCreateClass} disabled={classActionLoading}>
                {classActionLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.formSubmitText}>Salvar Turma</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {editingClassId && (
          <View style={[s.formContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.formTitle, { color: colors.foreground }]}>Editar Turma</Text>
            {isClassNameLocked(rawClasses.find((c) => c.id === editingClassId)?.name || "") && (
              <View style={[s.lockWarningBanner, { backgroundColor: colors.warning + "15", borderColor: colors.warning + "30" }]}>
                <Info size={14} color={colors.warning} />
                <Text style={[s.lockWarningText, { color: colors.warning }]}>Esta turma já possui alunos vinculados. O nome da turma está protegido para preservar rankings e relatórios.</Text>
              </View>
            )}
            {[
              { label: "Nome da Turma *", value: editClassName, setter: setEditClassName, placeholder: "Ex: ADS - 5º Termo", locked: isClassNameLocked(rawClasses.find((c) => c.id === editingClassId)?.name || "") },
              { label: "Curso", value: editClassCourse, setter: setEditClassCourse, placeholder: "Ex: Análise e Desenvolvimento de Sistemas", locked: false },
              { label: "Termo / Semestre", value: editClassTerm, setter: setEditClassTerm, placeholder: "Ex: 5º Semestre", locked: false },
            ].map((field) => (
              <View key={field.label} style={s.formField}>
                <Text style={[s.formLabel, { color: colors.mutedForeground }]}>{field.label}</Text>
                <TextInput style={[s.formInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }, field.locked && { opacity: 0.6 }]} placeholder={field.placeholder} placeholderTextColor={colors.mutedForeground} value={field.value} onChangeText={field.setter} editable={!field.locked} />
              </View>
            ))}
            <View style={s.formActionsRow}>
              <TouchableOpacity style={[s.formCancelBtn, { borderColor: colors.border }]} onPress={() => setEditingClassId(null)} disabled={classActionLoading}><Text style={[s.formCancelText, { color: colors.mutedForeground }]}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={[s.formSubmitBtn, { backgroundColor: colors.primary }]} onPress={handleUpdateClass} disabled={classActionLoading}>
                {classActionLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.formSubmitText}>Salvar Alterações</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {rawClasses.map((cls, idx) => (
            <View key={cls.id} style={[s.listItem, idx < rawClasses.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }, { paddingVertical: 12 }]}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[s.className, { color: colors.foreground }]}>{cls.name}</Text>
                <Text style={[s.classSub, { color: colors.mutedForeground }]}>{cls.course || "Sem curso definido"} • {cls.term || "Sem termo"}</Text>
              </View>
              <TouchableOpacity
                style={[s.editIconBtn, { borderColor: colors.border }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsCreatingClass(false); setEditingClassId(cls.id); setEditClassName(cls.name); setEditClassCourse(cls.course); setEditClassTerm(cls.term); setClassActionError(null); setClassActionSuccess(null); }}
                activeOpacity={0.7}
              >
                <Edit2 size={13} color={colors.primary} />
                <Text style={[s.editIconText, { color: colors.primary }]}>Editar</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ paddingVertical: 24, alignItems: "center" }}>
          <Text style={{ fontSize: 11, color: colors.mutedForeground, textAlign: "center" }}>
            Em breve: relatórios analíticos, exportações completas e criação dinâmica de trilhas.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 16 },
  sectionLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 2, marginBottom: 12 },
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
  cohortStatGridCell: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 8 },
  cohortGridVal: { fontSize: 14, fontFamily: "Inter_700Bold" },
  cohortGridLbl: { fontSize: 9, fontFamily: "Inter_500Medium" },
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
  classSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  editIconBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  editIconText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  emptyCard: { borderRadius: 12, borderWidth: 1, padding: 32, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  studentDetailCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12, gap: 12 },
  studentCardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  studentRankBadge: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, gap: 3 },
  studentRankText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  studentCardTitle: { flex: 1, gap: 2 },
  studentName: { fontSize: 14, fontFamily: "Inter_700Bold" },
  studentEmail: { fontSize: 11, fontFamily: "Inter_400Regular" },
  studentStatsRow: { flexDirection: "row", borderTopWidth: 1, paddingTop: 12, gap: 8 },
  studentStatItem: { flex: 1, alignItems: "center", gap: 3 },
  studentStatVal: { fontSize: 13, fontFamily: "Inter_700Bold" },
  studentStatLbl: { fontSize: 9, fontFamily: "Inter_500Medium" },
  backBottomButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 10, borderWidth: 1, paddingVertical: 12, marginTop: 12, gap: 6 },
  backBottomText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  backButtonRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  backButtonText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  pillBadge: { borderRadius: 4, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
  pillBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold" },
  feedbackSummaryCard: { borderRadius: 12, borderWidth: 1, padding: 16 },
  feedbackTotalText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  feedbackRecentTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginLeft: 4 },
  feedbackItemCard: { borderRadius: 12, borderWidth: 1, padding: 14 },
  feedbackItemName: { fontSize: 13, fontFamily: "Inter_700Bold" },
  feedbackItemClass: { fontSize: 11, fontFamily: "Inter_500Medium" },
  feedbackQ: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  feedbackA: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 16 },
});
