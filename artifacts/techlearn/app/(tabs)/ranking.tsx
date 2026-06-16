import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Trophy, Medal, Crown, AlertTriangle, ChevronDown, ChevronUp, Users, Star, Target, CheckCircle2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabaseClient";
import { useProgress } from "@/contexts/ProgressContext";
import { progressService } from "@/services/progressService";

// ── Types ────────────────────────────────────────────────────────────

type StudentData = {
  id: string;
  name: string;
  xp: number;
  isCurrentUser?: boolean;
};

type FullStudentData = {
  id: string;
  name: string;
  email: string;
  className: string;
  xp: number;
  completedCount: number;
  accuracy: number;
  streak: number;
};

type AdminClassData = {
  className: string;
  studentCount: number;
  averageXp: number;
  totalCompletions: number;
  averageAccuracy: number;
  students: FullStudentData[];
};

const PODIUM_COLORS = ["#F59E0B", "#94A3B8", "#CD7C2F"] as const;
const TAB_HEIGHT = Platform.OS === "ios" ? 88 : 64;

export default function RankingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, Platform.OS === "web" ? 16 : 0);

  const { profile, loading, profileLoading, isGuest } = useAuth();
  const { progress } = useProgress();
  const isAdmin = profile?.role === "admin";

  const [activeTab, setActiveTab] = useState<"my_class" | "all_classes">("my_class");
  const [studentsList, setStudentsList] = useState<StudentData[]>([]);
  const [classesList, setClassesList] = useState<AdminClassData[]>([]);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [rankingError, setRankingError] = useState<string | null>(null);

  // Class toggle expansion states (stores className -> open boolean)
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});

  const toggleClassExpansion = (className: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedClasses((prev) => ({
      ...prev,
      [className]: !prev[className],
    }));
  };

  const fetchRankingData = React.useCallback(async () => {
    if (isGuest) {
      setRankingLoading(false);
      return;
    }
    setRankingLoading(true);
    setRankingError(null);
    try {
      const targetClass = profile?.class_name || "";

      // 1. Buscar todos os alunos estudantes (com nome e email)
      const { data: allProfiles, error: profilesErr } = await supabase
        .from("profiles")
        .select("id, name, email, role, class_name, course, term, room")
        .eq("role", "student");

      if (profilesErr) throw new Error(profilesErr.message);

      // 2. Buscar progresso de todos para mapear XP e estatísticas
      const { data: allProgress, error: progressErr } = await supabase
        .from("user_progress")
        .select("user_id, xp, completed_modules, correct_answers, total_exercises, streak");

      if (progressErr) throw new Error(progressErr.message);

      const progressMap = new Map<string, {
        xp: number;
        completedCount: number;
        accuracy: number;
        streak: number;
        correctAnswers: number;
        totalExercises: number;
      }>();

      if (allProgress) {
        allProgress.forEach((p) => {
          const correct = p.correct_answers || 0;
          const total = p.total_exercises || 0;
          const accuracyVal = total > 0 ? Math.round((correct / total) * 100) : 0;
          const completedModulesList = Array.isArray(p.completed_modules) ? p.completed_modules : [];

          progressMap.set(p.user_id, {
            xp: p.xp || 0,
            completedCount: completedModulesList.length,
            accuracy: accuracyVal,
            streak: p.streak || 0,
            correctAnswers: correct,
            totalExercises: total
          });
        });
      }

      // Agrupar estudantes por turma
      const studentsByClass: Record<string, FullStudentData[]> = {};
      const localStudentsList: StudentData[] = [];

      (allProfiles || []).forEach((p) => {
        const className = (p.course && p.term && p.room) 
          ? `${p.course} - ${p.term} ${p.room}`
          : (p.class_name || "Sem Turma");
          
        const progressInfo = progressMap.get(p.id) || {
          xp: 0,
          completedCount: 0,
          accuracy: 0,
          streak: 0,
          correctAnswers: 0,
          totalExercises: 0
        };

        const studentObj: FullStudentData = {
          id: p.id,
          name: p.name || "Aluno",
          email: p.email || "Sem e-mail",
          className: className,
          xp: progressInfo.xp,
          completedCount: progressInfo.completedCount,
          accuracy: progressInfo.accuracy,
          streak: progressInfo.streak
        };

        if (!studentsByClass[className]) {
          studentsByClass[className] = [];
        }
        studentsByClass[className].push(studentObj);

        // Se o aluno pertence à mesma turma do usuário
        if (!isAdmin && className === targetClass) {
          localStudentsList.push({
            id: p.id,
            name: p.name || "Aluno",
            xp: progressInfo.xp,
            isCurrentUser: p.id === profile?.id
          });
        }
      });

      // Ordenar lista de estudantes da própria turma do aluno
      localStudentsList.sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name));
      setStudentsList(localStudentsList);

      // Consolidar dados das turmas
      const consolidatedClasses: AdminClassData[] = Object.keys(studentsByClass).map((cName) => {
        const classStudents = studentsByClass[cName];
        classStudents.sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name));

        let totalXp = 0;
        let totalCompletions = 0;
        let totalAccuracySum = 0;

        classStudents.forEach((s) => {
          totalXp += s.xp;
          totalCompletions += s.completedCount;
          totalAccuracySum += s.accuracy;
        });

        const studentCount = classStudents.length;
        const rawAvgXp = studentCount > 0 ? totalXp / studentCount : 0;
        const averageXp = isFinite(rawAvgXp) ? Math.round(rawAvgXp) : 0;
        const rawAvgAccuracy = studentCount > 0 ? totalAccuracySum / studentCount : 0;
        const averageAccuracy = isFinite(rawAvgAccuracy) ? Math.round(rawAvgAccuracy) : 0;

        return {
          className: cName,
          studentCount,
          averageXp,
          totalCompletions,
          averageAccuracy,
          students: classStudents
        };
      });

      // Ordenar turmas por média de XP desc
      consolidatedClasses.sort((a, b) => b.averageXp - a.averageXp);
      setClassesList(consolidatedClasses);

    } catch (err: any) {
      console.warn("Error fetching ranking data:", err);
      setRankingError("Não foi possível carregar as informações do ranking.");
    } finally {
      setRankingLoading(false);
    }
  }, [isGuest, profile, isAdmin]);

  useFocusEffect(
    React.useCallback(() => {
      if (profile && !isGuest) {
        // Sincronização de autocura: salva o progresso local na nuvem imediatamente antes de buscar o ranking.
        const syncAndFetch = async () => {
          try {
            await progressService.saveProgress(progress, profile.id);
          } catch {}
          fetchRankingData();
        };
        syncAndFetch();
      } else {
        fetchRankingData();
      }
    }, [profile, isGuest, progress, fetchRankingData])
  );

  if (loading || profileLoading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const myUser = isAdmin || isGuest ? undefined : studentsList.find((s) => s.isCurrentUser);
  const myRankIndex = isAdmin || isGuest ? -1 : studentsList.findIndex((s) => s.isCurrentUser);
  const top3 = studentsList.slice(0, 3);
  
  const xpNeededForTop3 = myRankIndex > 2 && top3.length === 3 
    ? top3[2].xp - (myUser?.xp || 0) 
    : 0;

  const myClassIndex = classesList.findIndex(c => c.className === profile?.class_name);
  const myClassData = isAdmin || isGuest ? undefined : classesList[myClassIndex];

  // Render sublist of students under expanded dropdown
  const renderClassStudentsList = (classStudents: FullStudentData[], isAllowed: boolean) => {
    if (!isAllowed) {
      return (
        <View style={[styles.dropdownSubContent, { backgroundColor: colors.muted + "20" }]}>
          <Text style={[styles.noStudentsText, { color: colors.mutedForeground }]}>
            Informações detalhadas reservadas para a coordenação ou colegas da mesma turma.
          </Text>
        </View>
      );
    }

    if (classStudents.length === 0) {
      return (
        <View style={styles.dropdownSubContent}>
          <Text style={[styles.noStudentsText, { color: colors.mutedForeground }]}>
            Esta turma ainda não possui alunos cadastrados.
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.dropdownSubContent, { borderTopWidth: 1, borderTopColor: colors.border + "60", backgroundColor: colors.muted + "08" }]}>
        {classStudents.map((student, idx) => {
          const isTop3 = idx < 3;
          const medalColor = isTop3 ? PODIUM_COLORS[idx] : colors.mutedForeground;
          const isYou = student.id === profile?.id;
          
          return (
            <View
              key={student.id}
              style={[
                styles.subListItem,
                idx < classStudents.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border + "30" },
                isYou && { backgroundColor: colors.primary + "12" }
              ]}
            >
              <View style={styles.subListLeft}>
                {/* Position / Medal */}
                <View style={[styles.subRankBadge, { backgroundColor: isTop3 ? medalColor + "15" : colors.border + "50" }]}>
                  <Text style={[styles.subRankNum, { color: isTop3 ? medalColor : colors.mutedForeground }]}>
                    {idx + 1}º
                  </Text>
                </View>

                <View style={{ gap: 2, flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <Text style={[styles.subStudentName, { color: isYou ? colors.primary : colors.foreground, fontFamily: isYou || isTop3 ? "Inter_700Bold" : "Inter_500Medium" }]}>
                      {student.name}
                    </Text>
                    {isYou && (
                      <View style={[styles.youBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.youText}>VOCÊ</Text>
                      </View>
                    )}
                  </View>
                  
                  {isAdmin && (
                    <Text style={[styles.subStudentEmail, { color: colors.mutedForeground }]}>
                      {student.email}
                    </Text>
                  )}

                  {/* Student Status Badges */}
                  <View style={styles.badgeRowContainer}>
                    {isTop3 && student.xp > 0 && (
                      <View style={[styles.statusBadge, { backgroundColor: "#F59E0B" + "12", borderColor: "#F59E0B" + "30" }]}>
                        <Text style={[styles.statusBadgeText, { color: "#F59E0B" }]}>Top 3</Text>
                      </View>
                    )}
                    {student.xp === 0 && (
                      <View style={[styles.statusBadge, { backgroundColor: colors.error + "12", borderColor: colors.error + "30" }]}>
                        <Text style={[styles.statusBadgeText, { color: colors.error }]}>Sem progresso</Text>
                      </View>
                    )}
                    {student.accuracy >= 80 && student.xp > 0 && (
                      <View style={[styles.statusBadge, { backgroundColor: colors.success + "12", borderColor: colors.success + "30" }]}>
                        <Text style={[styles.statusBadgeText, { color: colors.success }]}>Alta precisão</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.subListRight}>
                <Text style={[styles.subStudentXp, { color: isYou ? colors.primary : colors.foreground }]}>
                  {student.xp} XP
                </Text>
                <Text style={[styles.subStudentStats, { color: colors.mutedForeground }]}>
                  {student.completedCount} mód{student.accuracy > 0 ? ` • ${student.accuracy}%` : ""}
                </Text>
                {student.streak > 0 && (
                  <Text style={[styles.subStudentStats, { color: colors.mutedForeground }]}>
                    {student.streak}d streak
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      
      {/* HEADER FIXO */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {isAdmin ? "Ranking das Turmas" : "Ranking Unimar"}
        </Text>

        {/* Abas (Somente se for Aluno logado) */}
        {!isAdmin && !isGuest && (
          <View style={[styles.tabsWrapper, { backgroundColor: colors.muted }]}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "my_class" && [styles.tabActive, { backgroundColor: colors.card }]]}
              onPress={() => setActiveTab("my_class")}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, { color: activeTab === "my_class" ? colors.foreground : colors.mutedForeground }]}>
                Minha turma
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "all_classes" && [styles.tabActive, { backgroundColor: colors.card }]]}
              onPress={() => setActiveTab("all_classes")}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, { color: activeTab === "all_classes" ? colors.foreground : colors.mutedForeground }]}>
                Turmas
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Banner Slim Fixado para Alunos */}
        {!isAdmin && !isGuest && (
          activeTab === "my_class" && myUser && myRankIndex !== -1 ? (
            <View style={[styles.slimBanner, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
              {myUser.xp === 0 ? (
                <View style={{ alignItems: "center" }}>
                  <Text style={[styles.bannerMainText, { color: colors.primary, textAlign: "center" }]}>
                    Complete seu primeiro módulo
                  </Text>
                  <Text style={[styles.bannerSubText, { color: colors.mutedForeground, textAlign: "center" }]}>
                    para entrar de verdade na disputa
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.bannerRow}>
                    <Text style={[styles.bannerMainText, { color: colors.primary }]}>
                      Você está em {myRankIndex + 1}º lugar • {myUser.xp} XP
                    </Text>
                  </View>
                  <Text style={[styles.bannerSubText, { color: colors.mutedForeground }]}>
                    {xpNeededForTop3 > 0 
                      ? `Faltam ${xpNeededForTop3} XP para alcançar o Top 3` 
                      : `Você está no Top 3 da turma!`}
                  </Text>
                </>
              )}
            </View>
          ) : activeTab === "all_classes" && myClassData && myClassIndex !== -1 ? (
            <View style={[styles.slimBanner, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
              {myClassData.averageXp === 0 ? (
                <View style={styles.bannerRow}>
                  <Text style={[styles.bannerMainText, { color: colors.primary, textAlign: "center" }]}>
                    Sua turma ainda não possui progresso
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.bannerRow}>
                    <Text style={[styles.bannerMainText, { color: colors.primary }]}>
                      Sua turma está em {myClassIndex + 1}º lugar
                    </Text>
                  </View>
                  <Text style={[styles.bannerSubText, { color: colors.mutedForeground }]}>
                    {myClassData.className} • {myClassData.averageXp} XP médio
                  </Text>
                </>
              )}
            </View>
          ) : null
        )}

        
      </View>

      {/* LISTA ROLÁVEL */}
      {!isGuest && (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
        >
        {rankingLoading ? (
          <View style={{ padding: 40, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : rankingError ? (
          <View style={{ padding: 30, alignItems: "center", justifyContent: "center" }}>
            <AlertTriangle size={36} color={colors.error} style={{ marginBottom: 12 }} />
            <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", textAlign: "center", marginBottom: 4 }}>
              Erro ao carregar ranking
            </Text>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center", fontSize: 12, marginBottom: 16 }}>
              {rankingError}
            </Text>
            <TouchableOpacity style={{ padding: 12, backgroundColor: colors.primary, borderRadius: 8 }} onPress={fetchRankingData}>
              <Text style={{ color: "#FFF", fontWeight: "600", fontSize: 13 }}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (isAdmin || isGuest || activeTab === "all_classes") ? (
          /* ABA TURMAS (PARA ADMIN E PARA ALUNOS) */
          <View style={{ gap: 12 }}>
            {classesList.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Nenhuma turma cadastrada.</Text>
              </View>
            ) : (
              classesList.map((cls, index) => {
                const isMyClass = !isAdmin && cls.className === profile?.class_name;
                const isTop3 = index < 3;
                const medalColor = isTop3 ? PODIUM_COLORS[index] : colors.muted;
                const isExpanded = !!expandedClasses[cls.className];
                const canExpand = isAdmin || isMyClass; // Students can only expand their own class

                return (
                  <View
                    key={cls.className}
                    style={[
                      styles.cohortCard,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      isMyClass && { borderColor: colors.primary }
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.cohortHeaderTouch}
                      onPress={() => canExpand && toggleClassExpansion(cls.className)}
                      activeOpacity={canExpand ? 0.75 : 1}
                    >
                      {/* Ranking Medal / Position */}
                      <View style={[styles.rankBadge, { 
                        backgroundColor: isTop3 ? medalColor + "15" : isMyClass ? colors.primary + "15" : colors.muted + "50" 
                      }]}>
                        {index === 0 ? <Crown size={16} color={medalColor} strokeWidth={2.5}/> :
                         index === 1 ? <Medal size={16} color={medalColor} strokeWidth={2.5}/> :
                         index === 2 ? <Medal size={16} color={medalColor} strokeWidth={2.5}/> :
                         <Text style={[styles.rankNum, { color: isMyClass ? colors.primary : colors.mutedForeground }]}>{index + 1}º</Text>}
                      </View>

                      {/* Class Info */}
                      <View style={{ flex: 1, gap: 2 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <Text style={[styles.cohortName, { 
                            color: isMyClass ? colors.primary : colors.foreground, 
                            fontFamily: isMyClass || isTop3 ? "Inter_700Bold" : "Inter_600SemiBold" 
                          }]} numberOfLines={2}>
                            {cls.className}
                          </Text>
                          {isMyClass && (
                            <View style={[styles.youBadge, { backgroundColor: colors.primary }]}>
                              <Text style={styles.youText}>SUA TURMA</Text>
                            </View>
                          )}
                        </View>

                        {/* Class Stats Summary */}
                        <Text style={[styles.cohortSub, { color: colors.mutedForeground }]}>
                          {cls.studentCount} alunos • {cls.totalCompletions} concl. • {cls.averageAccuracy}% prec.
                        </Text>
                      </View>

                      <View style={{ alignItems: "flex-end", gap: 4 }}>
                        <View style={styles.avgContainer}>
                          <Text style={[styles.avgXpText, { color: isTop3 ? medalColor : isMyClass ? colors.primary : colors.foreground }]}>
                            {cls.averageXp}
                          </Text>
                          <Text style={[styles.avgXpLabel, { color: colors.mutedForeground }]}>XP Médio</Text>
                        </View>
                        {canExpand && (
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                            <Text style={{ fontSize: 9, fontFamily: "Inter_600SemiBold", color: colors.primary }}>
                              {isExpanded ? "Ocultar" : "Ver alunos"}
                            </Text>
                            {isExpanded ? (
                              <ChevronUp size={12} color={colors.primary} />
                            ) : (
                              <ChevronDown size={12} color={colors.primary} />
                            )}
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Expandable Dropdown Row */}
                    {isExpanded && renderClassStudentsList(cls.students, canExpand)}
                  </View>
                );
              })
            )}
          </View>
        ) : (
          /* ABA MINHA TURMA (PARA ESTUDANTES) */
          <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {!profile?.class_name || studentsList.length === 0 ? (
              <View style={{ padding: 24, alignItems: "center" }}>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" }}>
                  {!profile?.class_name
                    ? "Você não está vinculado a nenhuma turma ainda."
                    : "Nenhum aluno nesta turma."}
                </Text>
              </View>
            ) : (
              studentsList.map((student, index) => {
                const isYou = !!student.isCurrentUser;
                const isTop3 = index < 3;
                const medalColor = isTop3 ? PODIUM_COLORS[index] : colors.muted;

                return (
                  <View
                    key={student.id}
                    style={[
                      styles.listItem,
                      index < studentsList.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                      isYou && { backgroundColor: colors.primary + "15" },
                    ]}
                  >
                    {/* Rank Badge / Medal */}
                    <View style={[styles.rankBadge, { 
                      backgroundColor: isTop3 ? medalColor + "20" : isYou ? colors.primary + "20" : colors.muted,
                    }]}>
                      {index === 0 ? <Crown size={16} color={medalColor} strokeWidth={2.5}/> :
                       index === 1 ? <Medal size={16} color={medalColor} strokeWidth={2.5}/> :
                       index === 2 ? <Medal size={16} color={medalColor} strokeWidth={2.5}/> :
                       <Text style={[styles.rankNum, { color: isYou ? colors.primary : colors.mutedForeground }]}>{index + 1}º</Text>}
                    </View>
                    
                    {/* User Name */}
                    <View style={styles.studentNameContainer}>
                      <Text style={[styles.studentName, { 
                        color: isYou ? colors.primary : colors.foreground, 
                        fontFamily: isYou || isTop3 ? "Inter_700Bold" : "Inter_500Medium" 
                      }]}>
                        {student.name}
                      </Text>
                      {isYou && (
                        <View style={[styles.youBadge, { backgroundColor: colors.primary }]}>
                          <Text style={styles.youText}>VOCÊ</Text>
                        </View>
                      )}
                    </View>
                    
                    {/* XP */}
                    <Text style={[styles.studentXp, { color: isTop3 ? medalColor : isYou ? colors.primary : colors.foreground }]}>
                      {student.xp} XP
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
      )}

      {isGuest && (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Tag Central de Prévia */}
          <View style={{
            alignSelf: "center",
            backgroundColor: colors.muted,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 10,
            paddingVertical: 4,
            marginBottom: 16,
            marginTop: 8,
          }}>
            <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 0.5 }}>
              PRÉVIA ILUSTRATIVA
            </Text>
          </View>

          {/* Podium Mock / Ilustrativo (Baixa Opacidade) */}
          <View style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "flex-end",
            height: 140,
            marginVertical: 12,
            opacity: 0.4,
            gap: 8,
          }}>
            {/* 2º lugar */}
            <View style={{ alignItems: "center", width: 85 }}>
              <Medal size={20} color="#94A3B8" />
              <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 4, textAlign: 'center' }} numberOfLines={1}>
                Participante
              </Text>
              <Text style={{ fontSize: 9, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
                950 XP
              </Text>
              <View style={{
                width: "100%",
                height: 55,
                backgroundColor: colors.muted,
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
                marginTop: 6,
              }} />
            </View>

            {/* 1º lugar */}
            <View style={{ alignItems: "center", width: 95 }}>
              <Crown size={24} color="#F59E0B" />
              <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 4, textAlign: 'center' }} numberOfLines={1}>
                Aluno da Turma
              </Text>
              <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.primary }}>
                1200 XP
              </Text>
              <View style={{
                width: "100%",
                height: 80,
                backgroundColor: colors.primary + "30",
                borderColor: colors.primary + "50",
                borderWidth: 1,
                borderBottomWidth: 0,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                marginTop: 6,
              }} />
            </View>

            {/* 3º lugar */}
            <View style={{ alignItems: "center", width: 85 }}>
              <Medal size={20} color="#CD7C2F" />
              <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 4, textAlign: 'center' }} numberOfLines={1}>
                Participante
              </Text>
              <Text style={{ fontSize: 9, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
                800 XP
              </Text>
              <View style={{
                width: "100%",
                height: 40,
                backgroundColor: colors.muted,
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
                marginTop: 6,
              }} />
            </View>
          </View>

          {/* Card de Conversão Premium */}
          <View style={{
            backgroundColor: colors.card,
            borderColor: colors.primary + "30",
            borderWidth: 1,
            borderRadius: 16,
            padding: 22,
            gap: 16,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 4,
            marginTop: 16,
          }}>
            <View style={{ alignItems: "center", gap: 6 }}>
              <Trophy size={36} color="#F59E0B" strokeWidth={1.5} style={{ marginBottom: 4 }} />
              <Text style={{ color: colors.foreground, fontSize: 16, fontFamily: "Inter_700Bold", textAlign: "center" }}>
                Entre no ranking
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 12.5, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18 }}>
                Crie uma conta para salvar seu XP, comparar seu desempenho e disputar posições com sua turma.
              </Text>
            </View>

            {/* Benefícios — condensados */}
            <View style={{
              backgroundColor: colors.background,
              borderRadius: 10,
              padding: 12,
              gap: 6,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
              <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, lineHeight: 18 }}>
                Salve seu XP, participe do ranking da turma e conquiste medalhas exclusivas.
              </Text>
              <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, lineHeight: 18 }}>
                Seu progresso fica na nuvem — acessível em qualquer dispositivo.
              </Text>
            </View>

            {/* CTAs */}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                }}
                onPress={() => {
                  Haptics.selectionAsync();
                  router.push("/sign-up" as any);
                }}
              >
                <Text style={{ color: "#FFF", fontSize: 13, fontFamily: "Inter_700Bold" }}>Criar conta</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: colors.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => {
                  Haptics.selectionAsync();
                  router.push("/sign-in" as any);
                }}
              >
                <Text style={{ color: colors.primary, fontSize: 13, fontFamily: "Inter_700Bold" }}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1 },
  header:       { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, gap: 6 },
  headerTitle:  { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 8 },
  headerSub:    { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 8 },
  
  tabsWrapper:  { flexDirection: "row", borderRadius: 8, padding: 4, marginBottom: 8 },
  tabBtn:       { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: "center" },
  tabActive:    { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText:      { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  
  slimBanner:   { borderRadius: 8, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, alignItems: "center", marginBottom: 6 },
  bannerRow:    { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  bannerMainText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  bannerSubText: { fontSize: 11, fontFamily: "Inter_500Medium" },

  scroll:       { padding: 16 },
  
  listCard:     { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  listItem:     { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 12, gap: 12 },
  rankBadge:    { width: 34, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  rankNum:      { fontSize: 13, fontFamily: "Inter_700Bold" },
  
  studentNameContainer: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  studentName:  { fontSize: 14 },
  
  youBadge:     { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  youText:      { color: "#FFF", fontSize: 8, fontFamily: "Inter_800ExtraBold", letterSpacing: 0.5 },
  
  studentXp:    { fontSize: 14, fontFamily: "Inter_700Bold" },
  
  avgContainer: { alignItems: "flex-end" },
  avgXpText:    { fontSize: 14, fontFamily: "Inter_700Bold" },
  avgXpLabel:   { fontSize: 10, fontFamily: "Inter_500Medium" },

  // COHORT DROPDOWNS
  cohortCard: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  cohortHeaderTouch: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  cohortName: { fontSize: 14 },
  cohortSub: { fontSize: 11, marginTop: 2 },
  emptyCard: { borderRadius: 12, borderWidth: 1, padding: 24, alignItems: "center" },

  dropdownSubContent: { padding: 12, gap: 10 },
  noStudentsText: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", paddingVertical: 12 },
  subListItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, paddingHorizontal: 6, borderRadius: 8, gap: 10 },
  subListLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  subRankBadge: { width: 26, height: 26, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  subRankNum: { fontSize: 11, fontFamily: "Inter_700Bold" },
  subStudentName: { fontSize: 13 },
  subStudentEmail: { fontSize: 10, fontFamily: "Inter_400Regular" },
  subListRight: { alignItems: "flex-end", gap: 4 },
  subStudentXp: { fontSize: 13, fontFamily: "Inter_700Bold" },
  subStudentStats: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "right" },

  badgeRowContainer: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  statusBadge: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  statusBadgeText: { fontSize: 8, fontFamily: "Inter_700Bold" },
});
