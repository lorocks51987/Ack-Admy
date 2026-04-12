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
    title: "Controle de Versao",
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
            backgroundColor: colors.primary,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Bem-vindo!</Text>
            <Text style={styles.name}>Dev Aprendiz</Text>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.streakBadge}>
              <Feather name="zap" size={16} color="#F5C842" />
              <Text style={styles.streakText}>5</Text>
            </View>
            <View style={styles.xpBadge}>
              <Feather name="star" size={16} color="#FFFFFF" />
              <Text style={styles.xpText}>230 XP</Text>
            </View>
          </View>
        </View>

        <View style={styles.dailyGoal}>
          <View style={styles.dailyGoalText}>
            <Text style={styles.goalLabel}>Meta diária</Text>
            <Text style={styles.goalValue}>2/3 licoes</Text>
          </View>
          <View style={[styles.goalTrack, { backgroundColor: "#FFFFFF30" }]}>
            <View
              style={[
                styles.goalFill,
                { backgroundColor: "#F5C842", width: "67%" },
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom:
              (Platform.OS === "web" ? 34 : insets.bottom) + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Sua jornada
        </Text>

        {MODULES.map((mod, index) => (
          <View key={mod.id} style={styles.moduleRow}>
            {index > 0 && (
              <View
                style={[
                  styles.connector,
                  {
                    backgroundColor: mod.active ? colors.primary : colors.border,
                    marginLeft: 36,
                  },
                ]}
              />
            )}

            <TouchableOpacity
              style={[
                styles.moduleCard,
                {
                  backgroundColor: mod.active ? colors.card : colors.muted,
                  borderColor: mod.active ? colors.primary : colors.border,
                  opacity: mod.active ? 1 : 0.65,
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
                  {
                    backgroundColor: mod.active
                      ? colors.primary
                      : colors.border,
                  },
                ]}
              >
                <Feather name={mod.icon} size={24} color="#FFFFFF" />
              </View>

              <View style={styles.moduleInfo}>
                <Text
                  style={[
                    styles.moduleTitle,
                    { color: mod.active ? colors.foreground : colors.mutedForeground },
                  ]}
                >
                  {mod.title}
                </Text>
                <Text
                  style={[styles.moduleSubtitle, { color: colors.mutedForeground }]}
                >
                  {mod.subtitle}
                </Text>
                <View style={styles.moduleProgress}>
                  <View
                    style={[
                      styles.progressTrack,
                      { backgroundColor: colors.border },
                    ]}
                  >
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
                  <Text
                    style={[
                      styles.progressText,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {mod.completed}/{mod.lessons}
                  </Text>
                </View>
              </View>

              {mod.active ? (
                <Feather name="chevron-right" size={20} color={colors.primary} />
              ) : (
                <Feather name="lock" size={18} color={colors.mutedForeground} />
              )}
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={[
            styles.startBtn,
            { backgroundColor: colors.primary },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/lesson");
          }}
          activeOpacity={0.85}
        >
          <Feather name="play" size={20} color="#FFFFFF" />
          <Text style={styles.startBtnText}>Iniciar Proxima Licao</Text>
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    gap: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF99",
  },
  name: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF20",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  streakText: {
    color: "#F5C842",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF20",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  xpText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  dailyGoal: {
    gap: 8,
  },
  dailyGoalText: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  goalLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#FFFFFF99",
  },
  goalValue: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  goalTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  goalFill: {
    height: 8,
    borderRadius: 4,
  },
  scroll: {
    padding: 20,
    gap: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginBottom: 16,
  },
  moduleRow: {
    gap: 0,
  },
  connector: {
    width: 3,
    height: 20,
    marginBottom: 0,
  },
  moduleCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    gap: 14,
    marginBottom: 4,
  },
  moduleIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  moduleInfo: {
    flex: 1,
    gap: 4,
  },
  moduleTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  moduleSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  moduleProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 16,
    gap: 10,
    marginTop: 24,
  },
  startBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
});
