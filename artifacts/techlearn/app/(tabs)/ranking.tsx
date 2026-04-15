import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TrendingUp, TrendingDown, Minus, Shield, AlertTriangle, AlertOctagon, Trophy, Users } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";

type StatusType = "secure" | "warning" | "critical";

interface Department {
  name: string;
  completion: number;
  trend: number;
  members: number;
  status: StatusType;
}

const DEPARTMENTS: Department[] = [
  { name: "Jurídico", completion: 98, trend: +3, members: 12, status: "secure" },
  { name: "Financeiro", completion: 94, trend: +1, members: 28, status: "secure" },
  { name: "RH", completion: 91, trend: +4, members: 19, status: "secure" },
  { name: "Marketing", completion: 87, trend: -2, members: 35, status: "warning" },
  { name: "Vendas", completion: 72, trend: +5, members: 67, status: "warning" },
  { name: "Operações", completion: 61, trend: -8, members: 43, status: "critical" },
  { name: "TI", completion: 55, trend: -3, members: 22, status: "critical" },
];

const STATUS_META: Record<StatusType, { label: string; color: string; Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }> }> = {
  secure: { label: "Protegido", color: "#22C55E", Icon: Shield },
  warning: { label: "Em Risco", color: "#F59E0B", Icon: AlertTriangle },
  critical: { label: "Crítico", color: "#EF4444", Icon: AlertOctagon },
};

export default function RankingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const totalMembers = DEPARTMENTS.reduce((a, d) => a + d.members, 0);
  const avgCompletion = Math.round(DEPARTMENTS.reduce((a, d) => a + d.completion, 0) / DEPARTMENTS.length);
  const secure = DEPARTMENTS.filter((d) => d.status === "secure").length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Ranking de Departamentos</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Conformidade LGPD — Abril 2026</Text>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Users size={16} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>{totalMembers}</Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Colaboradores</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Trophy size={16} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>{avgCompletion}%</Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Média Geral</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Shield size={16} color="#22C55E" strokeWidth={2} />
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>{secure}/{DEPARTMENTS.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Protegidos</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CLASSIFICAÇÃO POR SETOR</Text>

        {DEPARTMENTS.map((dept, idx) => {
          const meta = STATUS_META[dept.status];
          const { Icon: StatusIcon } = meta;
          return (
            <View key={dept.name} style={[styles.deptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.rankBadgeWrap}>
                <View style={[styles.rankBadge, { backgroundColor: idx < 3 ? colors.primary + "20" : colors.muted, borderColor: idx < 3 ? colors.primary : colors.border }]}>
                  <Text style={[styles.rankNum, { color: idx < 3 ? colors.primary : colors.mutedForeground }]}>#{idx + 1}</Text>
                </View>
              </View>

              <View style={styles.deptInfo}>
                <View style={styles.deptRow}>
                  <Text style={[styles.deptName, { color: colors.foreground }]}>{dept.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: meta.color + "20", borderColor: meta.color }]}>
                    <StatusIcon size={10} color={meta.color} strokeWidth={2} />
                    <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                </View>

                <View style={styles.progressRow}>
                  <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
                    <View style={[styles.progressFill, { backgroundColor: meta.color, width: `${dept.completion}%` }]} />
                  </View>
                  <Text style={[styles.progressPct, { color: colors.foreground }]}>{dept.completion}%</Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={[styles.membersText, { color: colors.mutedForeground }]}>
                    {dept.members} colaboradores
                  </Text>
                  <View style={styles.trendRow}>
                    {dept.trend > 0
                      ? <TrendingUp size={12} color="#22C55E" strokeWidth={2} />
                      : dept.trend < 0
                        ? <TrendingDown size={12} color="#EF4444" strokeWidth={2} />
                        : <Minus size={12} color={colors.mutedForeground} strokeWidth={2} />
                    }
                    <Text style={[styles.trendText, { color: dept.trend > 0 ? "#22C55E" : dept.trend < 0 ? "#EF4444" : colors.mutedForeground }]}>
                      {dept.trend > 0 ? "+" : ""}{dept.trend}% vs. mês anterior
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, gap: 4 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 8 },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 12 },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryCard: { flex: 1, borderRadius: 10, borderWidth: 1, padding: 12, alignItems: "center", gap: 4 },
  summaryValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  scroll: { padding: 16, gap: 10 },
  sectionLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 2, marginBottom: 6 },
  deptCard: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, padding: 14, gap: 12 },
  rankBadgeWrap: { alignItems: "center" },
  rankBadge: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  rankNum: { fontSize: 12, fontFamily: "Inter_700Bold" },
  deptInfo: { flex: 1, gap: 6 },
  deptRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  deptName: { fontSize: 14, fontFamily: "Inter_700Bold" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressTrack: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 5, borderRadius: 3 },
  progressPct: { fontSize: 12, fontFamily: "Inter_700Bold", width: 36, textAlign: "right" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  membersText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  trendText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
