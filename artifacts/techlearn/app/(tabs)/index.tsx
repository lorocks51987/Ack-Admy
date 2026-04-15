import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native";
import { router } from "expo-router";
import { Shield, BookOpen, Key, ChevronRight, Lock, Zap, Star, Play } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

const MODULES = [
  { id: 1, title: "Fundamentos da LGPD", subtitle: "Dados pessoais, direitos e obrigações", lessons: 4, completed: 0, Icon: BookOpen, active: true },
  { id: 2, title: "Engenharia Social e Phishing", subtitle: "BEC, spear phishing e red flags", lessons: 4, completed: 0, Icon: Shield, active: false },
  { id: 3, title: "Higiene de Senhas e Mesa Limpa", subtitle: "Políticas de senha e documentos", lessons: 4, completed: 0, Icon: Key, active: false },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Bem-vindo de volta</Text>
            <Text style={[styles.name, { color: colors.foreground }]}>Colaborador ACK-ADMY</Text>
          </View>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Zap size={13} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>5</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Star size={13} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>0 XP</Text>
            </View>
          </View>
        </View>

        <View style={styles.complianceArea}>
          <View style={styles.goalRow}>
            <Text style={[styles.goalLabel, { color: colors.mutedForeground }]}>Conformidade LGPD</Text>
            <Text style={[styles.goalValue, { color: colors.foreground }]}>0 / 3 módulos</Text>
          </View>
          <View style={[styles.goalTrack, { backgroundColor: colors.muted }]}>
            <View style={[styles.goalFill, { backgroundColor: colors.primary, width: "0%" }]} />
          </View>
          <Text style={[styles.complianceWarning, { color: colors.warning }]}>
            ⚠ Treinamento obrigatório pendente
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TRILHA DE CONFORMIDADE</Text>

        {MODULES.map((mod, index) => (
          <View key={mod.id}>
            {index > 0 && <View style={[styles.connector, { backgroundColor: colors.border, marginLeft: 37 }]} />}
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: mod.active ? 1 : 0.45 }]}
              onPress={() => {
                if (!mod.active) return;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/lesson");
              }}
              activeOpacity={mod.active ? 0.8 : 1}
            >
              <View style={[styles.iconWrap, { backgroundColor: colors.muted, borderColor: mod.active ? colors.primary : colors.border }]}>
                <mod.Icon size={20} color={mod.active ? colors.primary : colors.mutedForeground} strokeWidth={2} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>{mod.title}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>{mod.subtitle}</Text>
                <View style={styles.progressRow}>
                  <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
                    <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${(mod.completed / mod.lessons) * 100}%` }]} />
                  </View>
                  <Text style={[styles.progressText, { color: colors.mutedForeground }]}>{mod.completed}/{mod.lessons}</Text>
                </View>
              </View>
              {mod.active
                ? <ChevronRight size={16} color={colors.primary} strokeWidth={2} />
                : <Lock size={16} color={colors.mutedForeground} strokeWidth={2} />
              }
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
          <Play size={16} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.startBtnText}>Iniciar Treinamento</Text>
        </TouchableOpacity>
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
  badge: { flexDirection: "row", alignItems: "center", borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, gap: 4 },
  badgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  complianceArea: { gap: 6 },
  goalRow: { flexDirection: "row", justifyContent: "space-between" },
  goalLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  goalValue: { fontSize: 11, fontFamily: "Inter_700Bold" },
  goalTrack: { height: 5, borderRadius: 3, overflow: "hidden" },
  goalFill: { height: 5, borderRadius: 3 },
  complianceWarning: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  scroll: { padding: 20, gap: 0 },
  sectionLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 2, marginBottom: 16 },
  connector: { width: 2, height: 14 },
  card: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, padding: 14, gap: 14, marginBottom: 4 },
  iconWrap: { width: 46, height: 46, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardInfo: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  cardSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  progressTrack: { flex: 1, height: 3, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 3, borderRadius: 2 },
  progressText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  startBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 10, paddingVertical: 16, gap: 8, marginTop: 24 },
  startBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", letterSpacing: 0.3, color: "#FFFFFF" },
});
