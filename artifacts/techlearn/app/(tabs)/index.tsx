import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

const MODULES = [
  {
    id: 1,
    title: "Fundamentos da Web",
    subtitle: "HTML, CSS e JavaScript",
    lessons: 5,
    completed: 2,
    icon: "globe" as const,
    active: true,
  },
  {
    id: 2,
    title: "Controle de Versão",
    subtitle: "Git e GitHub",
    lessons: 4,
    completed: 0,
    icon: "git-branch" as const,
    active: false,
  },
  {
    id: 3,
    title: "Banco de Dados",
    subtitle: "SQL e NoSQL",
    lessons: 6,
    completed: 0,
    icon: "database" as const,
    active: false,
  },
  {
    id: 4,
    title: "Redes e Protocolo",
    subtitle: "HTTP, TCP/IP e DNS",
    lessons: 5,
    completed: 0,
    icon: "wifi" as const,
    active: false,
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Bem-vindo!</Text>
            <Text style={[styles.name, { color: colors.foreground }]}>Dev Aprendiz</Text>
          </View>
          <View style={styles.headerActions}>
            <View style={[styles.badge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="zap" size={14} color="#FFB300" />
              <Text style={[styles.badgeText, { color: "#FFB300" }]}>5</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="star" size={14} color={colors.primary} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>230 XP</Text>
            </View>
          </View>
        </View>

        <View style={styles.dailyGoal}>
          <View style={styles.dailyGoalText}>
            <Text style={[styles.goalLabel, { color: colors.mutedForeground }]}>Meta diária</Text>
            <Text style={[styles.goalValue, { color: colors.foreground }]}>2/3 lições</Text>
          </View>
          <View style={[styles.goalTrack, { backgroundColor: colors.muted }]}>
            <View style={[styles.goalFill, { backgroundColor: colors.primary, width: "67%" }]} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          SUA JORNADA
        </Text>

        {MODULES.map((mod, index) => (
          <View key={mod.id} style={styles.moduleRow}>
            {index > 0 && (
              <View
                style={[
                  styles.connector,
                  { backgroundColor: mod.active ? colors.primary : colors.border },
                ]}
              />
            )}

            <TouchableOpacity
              style={[
                styles.moduleCard,
                {
                  backgroundColor: colors.card,
                  borderColor: mod.active ? colors.border : colors.border,
                  opacity: mod.active ? 1 : 0.5,
                },
              ]}
              onPress={() => {
                if (!mod.active) return;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/lesson");
              }}
              activeOpacity={mod.active ? 0.8 : 1}
            >
              <View
                style={[
                  styles.moduleIcon,
                  { backgroundColor: mod.active ? "#0A1A1A" : colors.muted, borderColor: mod.active ? colors.primary : colors.border },
                ]}
              >
                <Feather
                  name={mod.icon}
                  size={22}
                  color={mod.active ? colors.primary : colors.mutedForeground}
                />
              </View>

              <View style={styles.moduleInfo}>
                <Text style={[styles.moduleTitle, { color: colors.foreground }]}>
                  {mod.title}
                </Text>
                <Text style={[styles.moduleSubtitle, { color: colors.mutedForeground }]}>
                  {mod.subtitle}
                </Text>
                <View style={styles.moduleProgress}>
                  <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: colors.primary,
                          width: `${(mod.completed / mod.lessons) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
                    {mod.completed}/{mod.lessons}
                  </Text>
                </View>
              </View>

              {mod.active ? (
                <Feather name="chevron-right" size={18} color={colors.primary} />
              ) : (
                <Feather name="lock" size={16} color={colors.mutedForeground} />
              )}
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/lesson");
          }}
          activeOpacity={0.85}
        >
          <Feather name="play" size={18} color="#121212" />
          <Text style={[styles.startBtnText, { color: "#121212" }]}>Iniciar Próxima Lição</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    gap: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: { fontSize: 12, fontFamily: "Inter_400Regular" },
  name: { fontSize: 20, fontFamily: "Inter_700Bold" },
  headerActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  badgeText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  dailyGoal: { gap: 8 },
  dailyGoalText: { flexDirection: "row", justifyContent: "space-between" },
  goalLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  goalValue: { fontSize: 12, fontFamily: "Inter_700Bold" },
  goalTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  goalFill: { height: 6, borderRadius: 3 },
  scroll: { padding: 20, gap: 0 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  moduleRow: { gap: 0 },
  connector: { width: 2, height: 16, marginLeft: 34, marginBottom: 0 },
  moduleCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    gap: 14,
    marginBottom: 4,
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  moduleInfo: { flex: 1, gap: 3 },
  moduleTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  moduleSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular" },
  moduleProgress: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  progressTrack: { flex: 1, height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2 },
  progressText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 16,
    gap: 10,
    marginTop: 24,
  },
  startBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
});
