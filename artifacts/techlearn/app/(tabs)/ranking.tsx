import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Trophy, Medal, Crown } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
// removed EnvironmentContext
import { useAuth } from "@/contexts/AuthContext";

// ── Types & Mocks ─────────────────────────────────────────────────────

type StudentData = {
  id: string;
  name: string;
  xp: number;
  isCurrentUser?: boolean;
};

type ClassData = {
  id: string;
  className: string;
  averageXp: number;
  isMyClass?: boolean;
};

const MOCK_MY_CLASS_STUDENTS: StudentData[] = [
  { id: "s1", name: "Ana Beatriz", xp: 820 },
  { id: "s2", name: "João Pedro", xp: 760 },
  { id: "s3", name: "Maria Eduarda", xp: 690 },
  { id: "s4", name: "User", xp: 430, isCurrentUser: true },
  { id: "s5", name: "Lucas Silva", xp: 390 },
  { id: "s6", name: "Carlos Eduardo", xp: 310 },
  { id: "s7", name: "Fernanda Costa", xp: 280 },
];
// Sorting is already correct descending, but let's ensure it's logical
MOCK_MY_CLASS_STUDENTS.sort((a, b) => b.xp - a.xp);

const MOCK_ALL_CLASSES: ClassData[] = [
  { id: "c1", className: "ADS - 5º Termo", averageXp: 720, isMyClass: true },
  { id: "c2", className: "Engenharia de Software", averageXp: 680 },
  { id: "c3", className: "Ciência da Computação", averageXp: 610 },
  { id: "c4", className: "Administração", averageXp: 520 },
  { id: "c5", className: "Direito", averageXp: 480 },
  { id: "c6", className: "Marketing", averageXp: 430 },
];
MOCK_ALL_CLASSES.sort((a, b) => b.averageXp - a.averageXp);

const PODIUM_COLORS = ["#F59E0B", "#94A3B8", "#CD7C2F"] as const;

const TAB_HEIGHT = Platform.OS === "ios" ? 88 : 64;

export default function RankingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { profile, loading, profileLoading } = useAuth();
  const isAdmin = profile?.role === "admin";

  if (loading || profileLoading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const [activeTab, setActiveTab] = useState<"my_class" | "all_classes">("my_class");

  const myUser = isAdmin ? undefined : MOCK_MY_CLASS_STUDENTS.find((s) => s.isCurrentUser);
  const myRankIndex = MOCK_MY_CLASS_STUDENTS.findIndex((s) => s.isCurrentUser);
  const top3 = MOCK_MY_CLASS_STUDENTS.slice(0, 3);
  
  // Calculate how much XP needed to reach Top 3 (if not in top 3)
  const xpNeededForTop3 = myRankIndex > 2 && top3.length === 3 
    ? top3[2].xp - (myUser?.xp || 0) 
    : 0;

  const myClassIndex = MOCK_ALL_CLASSES.findIndex(c => c.isMyClass);
  const myClassData = isAdmin ? undefined : MOCK_ALL_CLASSES[myClassIndex];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      
      {/* HEADER FIXO */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Ranking Unimar</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Acompanhe sua posição e o desempenho das turmas</Text>

        {/* Abas */}
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

        {/* Banner Slim Fixado */}
        {activeTab === "my_class" && myUser ? (
          <View style={[styles.slimBanner, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
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
          </View>
        ) : activeTab === "all_classes" && myClassData ? (
          <View style={[styles.slimBanner, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
            <View style={styles.bannerRow}>
              <Text style={[styles.bannerMainText, { color: colors.primary }]}>
                Sua turma está em {myClassIndex + 1}º lugar
              </Text>
            </View>
            <Text style={[styles.bannerSubText, { color: colors.mutedForeground }]}>
              {myClassData.className} • {myClassData.averageXp} XP médio
            </Text>
          </View>
        ) : null}
      </View>

      {/* LISTA ROLÁVEL */}
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: TAB_HEIGHT + insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "my_class" && (
          <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {MOCK_MY_CLASS_STUDENTS.map((student, index) => {
              const isYou = !isAdmin && !!student.isCurrentUser;
              const isTop3 = index < 3;
              const medalColor = isTop3 ? PODIUM_COLORS[index] : colors.muted;

              return (
                <View
                  key={student.id}
                  style={[
                    styles.listItem,
                    index < MOCK_MY_CLASS_STUDENTS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
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
                      {isYou && profile?.name ? profile.name : student.name}
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
            })}
          </View>
        )}

        {activeTab === "all_classes" && (
          <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {MOCK_ALL_CLASSES.map((cls, index) => {
              const isMyClass = !isAdmin && !!cls.isMyClass;
              const isTop3 = index < 3;
              const medalColor = isTop3 ? PODIUM_COLORS[index] : colors.muted;

              return (
                <View
                  key={cls.id}
                  style={[
                    styles.listItem,
                    index < MOCK_ALL_CLASSES.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    isMyClass && { backgroundColor: colors.primary + "15" },
                  ]}
                >
                  <View style={[styles.rankBadge, { 
                    backgroundColor: isTop3 ? medalColor + "20" : isMyClass ? colors.primary + "20" : colors.muted 
                  }]}>
                    {index === 0 ? <Crown size={16} color={medalColor} strokeWidth={2.5}/> :
                     index === 1 ? <Medal size={16} color={medalColor} strokeWidth={2.5}/> :
                     index === 2 ? <Medal size={16} color={medalColor} strokeWidth={2.5}/> :
                     <Text style={[styles.rankNum, { color: isMyClass ? colors.primary : colors.mutedForeground }]}>{index + 1}º</Text>}
                  </View>

                  <View style={styles.studentNameContainer}>
                    <Text style={[styles.studentName, { 
                      color: isMyClass ? colors.primary : colors.foreground, 
                      fontFamily: isMyClass || isTop3 ? "Inter_700Bold" : "Inter_500Medium" 
                    }]}>
                      {cls.className}
                    </Text>
                    {isMyClass && (
                      <View style={[styles.youBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.youText}>SUA TURMA</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.avgContainer}>
                    <Text style={[styles.avgXpText, { color: isTop3 ? medalColor : isMyClass ? colors.primary : colors.foreground }]}>
                      {cls.averageXp}
                    </Text>
                    <Text style={[styles.avgXpLabel, { color: colors.mutedForeground }]}>XP Médio</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
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
  
  slimBanner:   { borderRadius: 8, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, alignItems: "center" },
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
});
