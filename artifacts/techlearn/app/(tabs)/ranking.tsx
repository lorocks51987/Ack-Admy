import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  TrendingUp, TrendingDown, Minus, Shield, AlertTriangle,
  AlertOctagon, Trophy, Users, Medal, Crown,
} from "lucide-react-native";
import { useColors } from "@/hooks/useColors";

type StatusType = "secure" | "warning" | "critical";
type Filter = "all" | "warning" | "critical";

interface Department {
  name: string;
  completion: number;
  trend: number;
  members: number;
  status: StatusType;
  pendingModules: number;
}

const DEPARTMENTS: Department[] = [
  { name: "Jurídico",    completion: 98, trend: +3, members: 12, status: "secure",   pendingModules: 0 },
  { name: "Financeiro",  completion: 94, trend: +1, members: 28, status: "secure",   pendingModules: 0 },
  { name: "RH",          completion: 91, trend: +4, members: 19, status: "secure",   pendingModules: 1 },
  { name: "Marketing",   completion: 87, trend: -2, members: 35, status: "warning",  pendingModules: 1 },
  { name: "Vendas",      completion: 72, trend: +5, members: 67, status: "warning",  pendingModules: 2 },
  { name: "Operações",   completion: 61, trend: -8, members: 43, status: "critical", pendingModules: 3 },
  { name: "TI",          completion: 55, trend: -3, members: 22, status: "critical", pendingModules: 3 },
];

const STATUS_META: Record<StatusType, { label: string; color: string; Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }> }> = {
  secure:   { label: "Protegido", color: "#22C55E", Icon: Shield },
  warning:  { label: "Em Risco",  color: "#F59E0B", Icon: AlertTriangle },
  critical: { label: "Crítico",   color: "#EF4444", Icon: AlertOctagon },
};

const PODIUM_ICONS = [Crown, Medal, Medal];
const PODIUM_COLORS = ["#F59E0B", "#94A3B8", "#CD7C2F"];
const TAB_HEIGHT = Platform.OS === "ios" ? 88 : 64;

export default function RankingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [filter, setFilter] = useState<Filter>("all");

  const totalMembers   = DEPARTMENTS.reduce((a, d) => a + d.members, 0);
  const avgCompletion  = Math.round(DEPARTMENTS.reduce((a, d) => a + d.completion, 0) / DEPARTMENTS.length);
  const secureCount    = DEPARTMENTS.filter((d) => d.status === "secure").length;
  const criticalCount  = DEPARTMENTS.filter((d) => d.status === "critical").length;

  const filtered = filter === "all"
    ? DEPARTMENTS
    : DEPARTMENTS.filter((d) => d.status === filter);

  const top3 = DEPARTMENTS.slice(0, 3);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Ranking Corporativo</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Conformidade de Segurança — Mai 2026</Text>

        {/* Summary chips */}
        <View style={styles.summaryRow}>
          {[
            { Icon: Users,  value: totalMembers,          label: "Colaboradores", color: colors.primary },
            { Icon: Trophy, value: `${avgCompletion}%`,   label: "Média Geral",   color: colors.primary },
            { Icon: Shield, value: `${secureCount}/${DEPARTMENTS.length}`, label: "Protegidos", color: "#22C55E" },
            { Icon: AlertOctagon, value: criticalCount,   label: "Críticos",      color: "#EF4444" },
          ].map((s) => (
            <View key={s.label} style={[styles.summaryCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <s.Icon size={14} color={s.color} strokeWidth={2} />
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: TAB_HEIGHT + insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Podium top 3 */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TOP 3 DEPARTAMENTOS</Text>
        <View style={styles.podium}>
          {top3.map((dept, i) => {
            const PodiumIcon = PODIUM_ICONS[i];
            const podColor = PODIUM_COLORS[i];
            const meta = STATUS_META[dept.status];
            return (
              <View key={dept.name} style={[
                styles.podiumCard,
                {
                  backgroundColor: colors.card,
                  borderColor: podColor + "50",
                  transform: [{ scale: i === 0 ? 1.04 : 0.97 }],
                },
              ]}>
                <PodiumIcon size={20} color={podColor} strokeWidth={2} />
                <Text style={[styles.podiumName, { color: colors.foreground }]}>{dept.name}</Text>
                <Text style={[styles.podiumPct, { color: podColor }]}>{dept.completion}%</Text>
                <View style={[styles.podiumBar, { backgroundColor: colors.muted }]}>
                  <View style={[styles.podiumFill, { backgroundColor: podColor, width: `${dept.completion}%` }]} />
                </View>
                <View style={[styles.statusPill, { backgroundColor: meta.color + "20", borderColor: meta.color }]}>
                  <Text style={[styles.statusPillText, { color: meta.color }]}>{meta.label}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Filter tabs */}
        <View style={[styles.filterRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {([["all", "Todos"], ["warning", "Em Risco"], ["critical", "Crítico"]] as [Filter, string][]).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.filterTab,
                filter === key && { backgroundColor: colors.primary + "20", borderColor: colors.primary },
              ]}
              onPress={() => setFilter(key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterText, { color: filter === key ? colors.primary : colors.mutedForeground }]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Full ranking list */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CLASSIFICAÇÃO COMPLETA</Text>

        {filtered.map((dept, listIdx) => {
          const globalIdx = DEPARTMENTS.indexOf(dept);
          const meta = STATUS_META[dept.status];
          const { Icon: StatusIcon } = meta;

          return (
            <View key={dept.name} style={[styles.deptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Rank badge */}
              <View style={[styles.rankBadge, {
                backgroundColor: globalIdx < 3 ? PODIUM_COLORS[globalIdx] + "20" : colors.muted,
                borderColor: globalIdx < 3 ? PODIUM_COLORS[globalIdx] : colors.border,
              }]}>
                <Text style={[styles.rankNum, { color: globalIdx < 3 ? PODIUM_COLORS[globalIdx] : colors.mutedForeground }]}>
                  #{globalIdx + 1}
                </Text>
              </View>

              <View style={styles.deptInfo}>
                {/* Name + status */}
                <View style={styles.deptRow}>
                  <Text style={[styles.deptName, { color: colors.foreground }]}>{dept.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: meta.color + "20", borderColor: meta.color }]}>
                    <StatusIcon size={10} color={meta.color} strokeWidth={2} />
                    <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.progressRow}>
                  <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
                    <View style={[styles.progressFill, { backgroundColor: meta.color, width: `${dept.completion}%` }]} />
                  </View>
                  <Text style={[styles.progressPct, { color: colors.foreground }]}>{dept.completion}%</Text>
                </View>

                {/* Meta row */}
                <View style={styles.metaRow}>
                  <Text style={[styles.membersText, { color: colors.mutedForeground }]}>
                    {dept.members} colaboradores · {dept.pendingModules} pendente(s)
                  </Text>
                  <View style={styles.trendRow}>
                    {dept.trend > 0
                      ? <TrendingUp size={11} color="#22C55E" strokeWidth={2} />
                      : dept.trend < 0
                      ? <TrendingDown size={11} color="#EF4444" strokeWidth={2} />
                      : <Minus size={11} color={colors.mutedForeground} strokeWidth={2} />
                    }
                    <Text style={[styles.trendText, {
                      color: dept.trend > 0 ? "#22C55E" : dept.trend < 0 ? "#EF4444" : colors.mutedForeground,
                    }]}>
                      {dept.trend > 0 ? "+" : ""}{dept.trend}%
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
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, gap: 6 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 8 },
  headerSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 8 },
  summaryRow: { flexDirection: "row", gap: 8 },
  summaryCard: {
    flex: 1, borderRadius: 10, borderWidth: 1,
    paddingVertical: 10, alignItems: "center", gap: 3,
  },
  summaryValue: { fontSize: 15, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 8, fontFamily: "Inter_500Medium", textAlign: "center" },
  scroll: { padding: 16, gap: 0 },
  sectionLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 2, marginBottom: 10, marginTop: 16 },
  podium: { flexDirection: "row", gap: 8, marginBottom: 8 },
  podiumCard: {
    flex: 1, borderRadius: 12, borderWidth: 1.5,
    padding: 12, alignItems: "center", gap: 6,
  },
  podiumName: { fontSize: 11, fontFamily: "Inter_700Bold", textAlign: "center" },
  podiumPct: { fontSize: 18, fontFamily: "Inter_700Bold" },
  podiumBar: { width: "100%", height: 4, borderRadius: 2, overflow: "hidden" },
  podiumFill: { height: 4, borderRadius: 2 },
  statusPill: {
    borderRadius: 4, borderWidth: 1,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  statusPillText: { fontSize: 8, fontFamily: "Inter_700Bold" },
  filterRow: {
    flexDirection: "row", borderRadius: 10, borderWidth: 1,
    padding: 4, gap: 4, marginBottom: 8,
  },
  filterTab: {
    flex: 1, borderRadius: 7, borderWidth: 1,
    borderColor: "transparent", paddingVertical: 8, alignItems: "center",
  },
  filterText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  deptCard: {
    flexDirection: "row", alignItems: "center", borderRadius: 10,
    borderWidth: 1, padding: 12, gap: 10, marginBottom: 8,
  },
  rankBadge: {
    width: 36, height: 36, borderRadius: 8, borderWidth: 1,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  rankNum: { fontSize: 11, fontFamily: "Inter_700Bold" },
  deptInfo: { flex: 1, gap: 6 },
  deptRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  deptName: { fontSize: 13, fontFamily: "Inter_700Bold" },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 20, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3,
  },
  statusText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressTrack: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 5, borderRadius: 3 },
  progressPct: { fontSize: 12, fontFamily: "Inter_700Bold", width: 34, textAlign: "right" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  membersText: { fontSize: 10, fontFamily: "Inter_400Regular", flex: 1 },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  trendText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
});
