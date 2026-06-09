import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams, Redirect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Award, Zap, CheckCircle2, TrendingUp, ChevronRight, RotateCcw, Crown } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useProgress } from "@/contexts/ProgressContext";
import { useAuth } from "@/contexts/AuthContext";
import { MODULE_DEFINITIONS } from "@/constants/lessons";
import { ConfettiEmitter } from "@/components/ConfettiEmitter";
import { audioService } from "@/services/audioService";

export default function CompleteScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { session, loading, isGuest } = useAuth();
  const { xp: xpParam, moduleId: moduleIdParam } = useLocalSearchParams<{ xp: string; moduleId: string }>();
  const { progress } = useProgress();
  const native = Platform.OS !== "web";

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!session && !isGuest) {
    return <Redirect href="/sign-in" />;
  }

  const xpEarned = parseInt(xpParam || "0", 10);
  const moduleId = parseInt(moduleIdParam || "1", 10);
  const moduleDef = MODULE_DEFINITIONS.find((m) => m.id === moduleId);
  const nextModule = MODULE_DEFINITIONS.find((m) => m.id === moduleId + 1);
  const isCourseFinished = !nextModule && moduleId !== -1;

  const topPad = Math.max(insets.top, Platform.OS === "web" ? 16 : 0);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    audioService.playVictory();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 60, useNativeDriver: native }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: native }),
        Animated.spring(slideAnim, { toValue: 0, friction: 7, tension: 60, useNativeDriver: native }),
      ]),
    ]).start();
  }, []);

  const accuracy = progress.totalExercises > 0
    ? Math.round((progress.correctAnswers / progress.totalExercises) * 100)
    : 0;

  return (
    <View style={[styles.root, {
      backgroundColor: colors.background,
      paddingTop: topPad + 16,
      paddingBottom: bottomPad + 40,
    }]}>
      <ConfettiEmitter />
      {/* Trophy / Crown animation */}
      <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.glowOuter, { borderColor: isCourseFinished ? "#D9770630" : colors.primary + "30" }]} />
        <View style={[styles.glowMid, { borderColor: isCourseFinished ? "#D9770650" : colors.primary + "50" }]} />
        <View style={[styles.iconBg, { backgroundColor: colors.card, borderColor: isCourseFinished ? "#D97706" : colors.primary }]}>
          {isCourseFinished ? (
            <Crown size={56} color="#D97706" strokeWidth={1.5} />
          ) : (
            <Award size={52} color={colors.primary} strokeWidth={1.5} />
          )}
        </View>
      </Animated.View>

      {/* Text + stats */}
      <Animated.View style={[styles.textArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {moduleId === -1 
            ? "Revisão Concluída!" 
            : isCourseFinished 
            ? "🏆 Formação Completa!" 
            : "Módulo Concluído!"}
        </Text>
        {moduleId === -1 ? (
          <Text style={[styles.modName, { color: colors.primary }]}>Caixa de Erros Limpa</Text>
        ) : isCourseFinished ? (
          <Text style={[styles.modName, { color: "#D97706" }]}>Você é um Guardião Lendário!</Text>
        ) : moduleDef ? (
          <Text style={[styles.modName, { color: colors.primary, textAlign: "center" }]} numberOfLines={2} adjustsFontSizeToFit>{moduleDef.title}</Text>
        ) : null}
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {moduleId === -1
            ? "Parabéns! Você revisou suas dúvidas e fixou os conceitos com maestria!"
            : isCourseFinished
            ? "Sensacional! Você superou todos os desafios pedagógicos e práticos de AppSec do Ack-Admy. Agora sua mente é uma fortaleza impenetrável!"
            : "Excelente desempenho! Continue sua jornada de aprendizado em segurança."}
        </Text>

        <View style={styles.statsRow}>
          {[
            { Icon: Zap,         value: `+${xpEarned}`, label: "XP Ganho",    color: colors.primary },
            { Icon: CheckCircle2, value: `${progress.completedModules.length}/${MODULE_DEFINITIONS.length}`, label: "Módulos", color: colors.success },
            { Icon: TrendingUp,  value: `${accuracy}%`, label: "Precisão",    color: "#F59E0B" },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <s.Icon size={20} color={s.color} strokeWidth={2} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* XP total bar */}
        <View style={[styles.xpBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Zap size={14} color={isCourseFinished ? "#D97706" : colors.primary} strokeWidth={2} />
          <Text style={[styles.xpBarText, { color: colors.foreground }]}>
            Total acumulado: <Text style={{ color: isCourseFinished ? "#D97706" : colors.primary, fontFamily: "Inter_700Bold" }}>{progress.xp} XP</Text>
          </Text>
        </View>

        {isCourseFinished && (
          <View style={{
            backgroundColor: "#D9770615",
            borderColor: "#D9770640",
            borderWidth: 1.5,
            borderRadius: 16,
            padding: 16,
            width: "100%",
            alignItems: "center",
            gap: 8,
            marginTop: 10,
          }}>
            <Crown size={32} color="#D97706" strokeWidth={2} />
            <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: "#D97706" }}>Nova Conquista Desbloqueada!</Text>
            <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>👑 Guardião Lendário</Text>
            <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center", lineHeight: 16 }}>
              Concedida por completar 100% da trilha pedagógica de segurança de aplicações. Seu nome está marcado na história do ACK-ADMY!
            </Text>
          </View>
        )}

        {isGuest && (
          <View style={{ backgroundColor: colors.primary + "12", borderColor: colors.primary + "30", borderWidth: 1, padding: 14, borderRadius: 10, marginTop: 8, width: "100%" }}>
            <Text style={{ color: colors.primary, fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 4, textAlign: 'center' }}>
              Progresso salvo apenas neste dispositivo
            </Text>
            <Text style={{ color: colors.foreground, fontSize: 12, fontFamily: "Inter_400Regular", textAlign: 'center', lineHeight: 18 }}>
              Seus {parseInt(xpParam || "0", 10)} XP estão armazenados localmente. Crie uma conta para salvar na nuvem e desbloquear os demais módulos.
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Action buttons */}
      <Animated.View style={[styles.btns, { opacity: fadeAnim }]}>
        {isGuest ? (
          <>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.replace('/sign-up' as any); }}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Criar conta e liberar acesso</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: colors.border }]}
              onPress={() => { Haptics.selectionAsync(); router.replace('/sign-in' as any); }}
              activeOpacity={0.85}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.mutedForeground }]}>Já tenho conta (Entrar)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tertiaryBtn}
              onPress={() => { Haptics.selectionAsync(); router.replace("/"); }}
              activeOpacity={0.75}
            >
              <Text style={[styles.tertiaryBtnText, { color: colors.mutedForeground }]}>Voltar para a Home</Text>
            </TouchableOpacity>
          </>
        ) : moduleId === -1 ? (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.replace("/profile" as any);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Voltar ao Perfil</Text>
            <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        ) : nextModule ? (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.replace({ pathname: "/lesson", params: { moduleId: nextModule.id } });
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Próximo Módulo: {nextModule.title}</Text>
            <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: "#D97706" }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.replace("/"); }}
            activeOpacity={0.85}
          >
            <Crown size={16} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.primaryBtnText}>Formação Concluída! Voltar ao Início</Text>
          </TouchableOpacity>
        )}

        {!isGuest && (
          <>
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: colors.border }]}
              onPress={() => { Haptics.selectionAsync(); router.replace("/"); }}
              activeOpacity={0.85}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.mutedForeground }]}>Voltar ao Início</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tertiaryBtn}
              onPress={() => { Haptics.selectionAsync(); router.replace({ pathname: "/lesson", params: { moduleId } }); }}
              activeOpacity={0.75}
            >
              <RotateCcw size={13} color={colors.mutedForeground} strokeWidth={2} />
              <Text style={[styles.tertiaryBtnText, { color: colors.mutedForeground }]}>Repetir este módulo</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "space-around", paddingHorizontal: 24 },
  iconWrap: { alignItems: "center", justifyContent: "center" },
  iconBg: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  glowOuter: { position: "absolute", width: 168, height: 168, borderRadius: 84, borderWidth: 1, opacity: 0.2 },
  glowMid:   { position: "absolute", width: 144, height: 144, borderRadius: 72, borderWidth: 1, opacity: 0.35 },
  textArea: { alignItems: "center", gap: 8, width: "100%" },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center" },
  modName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  statsRow: { flexDirection: "row", gap: 8, marginTop: 8, width: "100%" },
  statCard: { flex: 1, borderRadius: 10, borderWidth: 1, padding: 12, alignItems: "center", gap: 5 },
  statValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 9, fontFamily: "Inter_500Medium", textAlign: "center" },
  xpBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 11, width: "100%",
  },
  xpBarText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  btns: { width: "100%", gap: 10 },
  primaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: 12, paddingVertical: 16, paddingHorizontal: 20, gap: 6,
  },
  primaryBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: 0.2, textAlign: "center" },
  secondaryBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center", borderWidth: 1 },
  secondaryBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", letterSpacing: 0.2 },
  tertiaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8 },
  tertiaryBtnText: { fontSize: 12, fontFamily: "Inter_500Medium" },
});
