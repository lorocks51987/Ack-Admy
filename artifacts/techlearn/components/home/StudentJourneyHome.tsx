import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import {
  Shield,
  Key,
  AlertTriangle,
  FileText,
  Mail,
  Star,
  Target,
  Zap,
  UserX,
  CheckCircle,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Rect,
  Path,
  Circle,
  Line,
} from "react-native-svg";
import { useColors } from "@/hooks/useColors";
import { useProgress } from "@/contexts/ProgressContext";
import { useAuth } from "@/contexts/AuthContext";
import { MODULE_DEFINITIONS } from "@/constants/lessons";
import {
  RoadmapNode,
  type NodeState,
  type NodeShape,
} from "@/components/home/RoadmapNode";
import { RoadmapPath } from "@/components/home/RoadmapPath";
import { FloatingLessonCard } from "@/components/home/FloatingLessonCard";

// ── Constantes ───────────────────────────────────────────────────────────────
const ICON_MAP = { Shield, Key, AlertTriangle, FileText, Mail, CheckCircle } as const;

const { width: WINDOW_W } = Dimensions.get("window");
const MAX_MAP_WIDTH = 480; // Limitado para não estourar no Web
const TAB_HEIGHT = Platform.OS === "ios" ? 88 : 64;
const ITEM_HEIGHT = 140; // Maior altura para dar sensação de caminho longo e elegante

const getOffset = (index: number) => {
  // Caminho sinuoso, ocupando melhor a tela mas ainda central
  const pattern = [0, -35, -55, -35, 0, 35, 55, 35];
  return pattern[index % pattern.length];
};

// ── Background Profundo (Layer 1) ────────────────────────────────────────────
function AmbientBackground() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <LinearGradient
        colors={["#050508", "#080911", "#05060A"]}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export function StudentJourneyHome() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { progress } = useProgress();
  const { profile, isGuest } = useAuth();

  const scrollRef = useRef<ScrollView>(null);
  const [selectedModuleId, setSelectedModuleId] = React.useState<number | null>(
    null,
  );

  const [reviewModalVisible, setReviewModalVisible] = React.useState(false);
  const [selectedModuleToReview, setSelectedModuleToReview] = React.useState<
    (typeof MODULE_DEFINITIONS)[0] | null
  >(null);

  // ── Métricas ─────────────────────────────────────────────────────────────
  const completedCount = progress.completedModules.length;
  const totalModules = MODULE_DEFINITIONS.length;
  const accuracy =
    progress.totalExercises > 0
      ? Math.round((progress.correctAnswers / progress.totalExercises) * 100)
      : 0;
  const progressPct = totalModules > 0 ? completedCount / totalModules : 0;

  // ── Estado ────────────────────────────────────────────────────────────────
  const getNodeState = useCallback(
    (mod: (typeof MODULE_DEFINITIONS)[0]): NodeState => {
      if (progress.completedModules.includes(mod.id)) return "completed";
      const prevDone =
        mod.id === 1 || progress.completedModules.includes(mod.id - 1);
      if (!prevDone) return "locked";
      const firstAvailableId = MODULE_DEFINITIONS.find(
        (m) =>
          !progress.completedModules.includes(m.id) &&
          (m.id === 1 || progress.completedModules.includes(m.id - 1)),
      )?.id;
      if (mod.id === firstAvailableId) return "current";
      return "available";
    },
    [progress.completedModules],
  );

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  const reversedModules = [...MODULE_DEFINITIONS].reverse();

  React.useEffect(() => {
    const currentIdx = reversedModules.findIndex(
      (m) => getNodeState(m) === "current",
    );
    if (currentIdx === -1) return;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, currentIdx * ITEM_HEIGHT - 140),
        animated: true,
      });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleNodePress = useCallback((mod: (typeof MODULE_DEFINITIONS)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedModuleId((prev) => (prev === mod.id ? null : mod.id));
  }, []);

  const handleStartLesson = useCallback(
    async (mod: (typeof MODULE_DEFINITIONS)[0], state: NodeState) => {
      if (state === "locked") return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedModuleId(null);
      if (state === "completed") {
        const userKey = isGuest ? "guest" : (profile?.id ?? "anon");
        const sessionKey = `@ackadmy:lesson_session:${userKey}:${mod.id}`;
        try {
          await AsyncStorage.removeItem(sessionKey);
        } catch { }
        router.push({
          pathname: "/lesson",
          params: { moduleId: mod.id, isRevision: "true" },
        });
      } else {
        router.push({ pathname: "/lesson", params: { moduleId: mod.id } });
      }
    },
    [isGuest, profile?.id],
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      {/* Fundo premium */}
      <AmbientBackground />

      {/* ── HUD / Status Bar Flutuante ─────────────────────────────────── */}
      <View style={[s.hud, { paddingTop: topPad + 8 }]}>
        <View style={s.hudRow}>
          <Text style={[s.hudGreeting, { color: colors.foreground }]}>
            {isGuest ? "Visitante" : profile?.name?.split(" ")[0] || "Aluno"}
          </Text>
          <View style={s.chips}>
            <View
              style={[
                s.chip,
                { backgroundColor: "#F59E0B22", borderColor: "#F59E0B40" },
              ]}
            >
              <Zap size={10} color="#F59E0B" strokeWidth={2.5} />
              <Text style={[s.chipText, { color: "#F59E0B" }]}>
                {progress.streak}d
              </Text>
            </View>
            <View
              style={[
                s.chip,
                {
                  backgroundColor: colors.primary + "22",
                  borderColor: colors.primary + "40",
                },
              ]}
            >
              <Star size={10} color={colors.primary} strokeWidth={2.5} />
              <Text style={[s.chipText, { color: colors.primary }]}>
                {progress.xp} XP
              </Text>
            </View>
            <View
              style={[
                s.chip,
                {
                  backgroundColor: colors.success + "22",
                  borderColor: colors.success + "40",
                },
              ]}
            >
              <Target size={10} color={colors.success} strokeWidth={2.5} />
              <Text style={[s.chipText, { color: colors.success }]}>
                {accuracy}%
              </Text>
            </View>
          </View>
        </View>

        {/* Faixa visitante integrada */}
        {isGuest && (
          <View
            style={[
              s.guestStripe,
              {
                backgroundColor: colors.primary + "10",
                borderColor: colors.primary + "20",
              },
            ]}
          >
            <UserX size={12} color={colors.primary} strokeWidth={2} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[s.guestStripeTitle, { color: colors.foreground }]}>
                Modo Visitante
              </Text>
              <Text style={[s.guestStripeText, { color: colors.mutedForeground }]}>
                Seu progresso não será salvo.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/sign-up" as any)}
              activeOpacity={0.8}
              style={[s.guestStripeBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={s.guestStripeBtnText}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Trilha do Mapa ─────────────────────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          s.mapContainer,
          // Dá mais espaço no topo para o HUD não cobrir os módulos
          {
            paddingTop: (isGuest ? 100 : 70) + topPad,
            paddingBottom: TAB_HEIGHT + insets.bottom + 40,
            maxWidth: MAX_MAP_WIDTH,
            width: "100%",
            alignSelf: "center",
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={{ flexGrow: 1 }}
          onPress={() => setSelectedModuleId(null)}
        // HitSlop grande para pegar em toda a área se não tiver conteúdo
        >
          {/* Checkpoint Final se tudo concluído */}
          {completedCount === totalModules && totalModules > 0 && (
            <View style={s.completedBanner}>
              <View
                style={[
                  s.completedIconWrap,
                  { backgroundColor: colors.success + "20" },
                ]}
              >
                <CheckCircle
                  size={24}
                  color={colors.success}
                  strokeWidth={2.5}
                />
              </View>
              <Text style={[s.completedText, { color: colors.foreground }]}>
                Trilha Completa
              </Text>
              <Text style={[s.completedSub, { color: colors.mutedForeground }]}>
                Novos desafios em breve
              </Text>
            </View>
          )}

          {/* Módulos */}
          {reversedModules.map((mod, revIdx) => {
            const state = getNodeState(mod);
            const isSelected = selectedModuleId === mod.id;
            const isLast = revIdx === reversedModules.length - 1;
            const origIdx = MODULE_DEFINITIONS.findIndex(
              (m) => m.id === mod.id,
            );
            const xOffset = getOffset(origIdx);
            const isNodeLeft = xOffset < 0;
            
            const prevOrigIdx = isLast ? -1 : origIdx - 1;
            const prevXOffset = getOffset(Math.max(0, prevOrigIdx)); // Base can connect to 0

            const IconComp =
              ICON_MAP[mod.iconName as keyof typeof ICON_MAP] ?? Shield;
            const iconColor =
              state === "completed"
                ? "#4ADE80"
                : state === "current"
                  ? mod.accentColor
                  : state === "locked"
                    ? colors.mutedForeground
                    : colors.foreground;

            const xpPossible = (mod.exercises?.length ?? 5) * 10;

            return (
              <View key={mod.id} style={s.nodeBlock}>
                {/* Conjunto do Nó + Labels + Cards transladado para seguir a estrada */}
                <View style={{ transform: [{ translateX: xOffset }], alignItems: "center", zIndex: isSelected ? 50 : 10 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                    
                    {/* Card à esquerda do nó (se nó está na direita) */}
                    {isSelected && !isNodeLeft && (
                      <View style={{ position: "absolute", right: 48, width: 175, zIndex: 100 }}>
                        <FloatingLessonCard
                          module={mod}
                          state={state}
                          side="right"
                          colors={colors}
                          xpPossible={xpPossible}
                          onStart={() => handleStartLesson(mod, state)}
                          onClose={() => setSelectedModuleId(null)}
                        />
                      </View>
                    )}

                    {/* O Nó Principal */}
                    <RoadmapNode
                      state={state}
                      accentColor={mod.accentColor}
                      icon={
                        <IconComp
                          size={state === "current" ? 28 : 20}
                          color={iconColor}
                          strokeWidth={2}
                        />
                      }
                      onPress={() => handleNodePress(mod)}
                      isSelected={isSelected}
                    />

                    {/* Card à direita do nó (se nó está na esquerda) */}
                    {isSelected && isNodeLeft && (
                      <View style={{ position: "absolute", left: 48, width: 175, zIndex: 100 }}>
                        <FloatingLessonCard
                          module={mod}
                          state={state}
                          side="left"
                          colors={colors}
                          xpPossible={xpPossible}
                          onStart={() => handleStartLesson(mod, state)}
                          onClose={() => setSelectedModuleId(null)}
                        />
                      </View>
                    )}
                  </View>

                  {/* Título do Módulo */}
                  <View style={[s.labelRow, { marginTop: 8 }]}>
                    <Text
                      style={[
                        s.nodeLabel,
                        {
                          color:
                            state === "completed"
                              ? "#4ADE80"
                              : state === "current"
                                ? mod.accentColor
                                : state === "locked"
                                  ? colors.mutedForeground
                                  : colors.foreground,
                          fontFamily:
                            state === "current"
                              ? "Inter_700Bold"
                              : "Inter_500Medium",
                          opacity: state === "locked" ? 0.8 : 1,
                        },
                      ]}
                    >
                      {(mod as any).shortTitle ?? mod.title.split(" ")[0]}
                    </Text>
                  </View>
                </View>

                {/* Estrada conectando o nó atual ao próximo (que está visualmente abaixo) */}
                {!isLast && (
                  <RoadmapPath
                    filled={progress.completedModules.includes(mod.id)}
                    isActive={state === "current"}
                    primaryColor={colors.primary}
                    mutedColor={colors.border}
                    startX={xOffset}
                    endX={prevXOffset}
                    height={90}
                  />
                )}
              </View>
            );
          })}

          {/* Ponto de partida */}
          <View style={s.originBase}>
            <Shield
              size={18}
              color={colors.border}
              strokeWidth={1.5}
              style={{ opacity: 0.5 }}
            />
            <Text style={[s.originText, { color: colors.mutedForeground }]}>
              BASE DE OPERAÇÕES
            </Text>
          </View>
        </Pressable>
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewModalVisible(false)}
        statusBarTranslucent
      >
        <Pressable
          style={s.modalOverlay}
          onPress={() => setReviewModalVisible(false)}
        >
          <Pressable
            style={[
              s.modalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[s.modalTitle, { color: colors.foreground }]}>
              Revisar aula
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Inter_400Regular",
                color: colors.mutedForeground,
                lineHeight: 20,
                textAlign: "center",
              }}
            >
              Deseja refazer os exercícios desta atividade do início?
            </Text>
            <View style={s.modalActions}>
              <TouchableOpacity
                style={[s.modalCancel, { borderColor: colors.border }]}
                onPress={() => {
                  setReviewModalVisible(false);
                  setSelectedModuleToReview(null);
                }}
              >
                <Text
                  style={{
                    color: colors.mutedForeground,
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalConfirm, { backgroundColor: colors.primary }]}
                onPress={async () => {
                  if (!selectedModuleToReview) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setReviewModalVisible(false);
                  const userKey = isGuest ? "guest" : (profile?.id ?? "anon");
                  const sessionKey = `@ackadmy:lesson_session:${userKey}:${selectedModuleToReview.id}`;
                  try {
                    await AsyncStorage.removeItem(sessionKey);
                  } catch { }
                  router.push({
                    pathname: "/lesson",
                    params: {
                      moduleId: selectedModuleToReview.id,
                      isRevision: "true",
                    },
                  });
                  setSelectedModuleToReview(null);
                }}
              >
                <Text style={{ color: "#FFF", fontFamily: "Inter_700Bold" }}>
                  Revisar do início
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },

  // HUD
  hud: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 20,
    paddingBottom: 10,
    // Cria um efeito "vidro" apenas visual no fundo
    backgroundColor: "rgba(5,5,10,0.6)",
  },
  hudRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hudGreeting: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  chips: { flexDirection: "row", gap: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  chipText: { fontSize: 10, fontFamily: "Inter_700Bold" },

  guestStripe: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  guestStripeTitle: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  guestStripeText: {
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    marginTop: 1,
  },
  guestStripeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  guestStripeBtnText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#FFF",
  },

  // Mapa
  mapContainer: {
    paddingHorizontal: 16,
    alignItems: "stretch",
  },

  nodeBlock: {
    alignItems: "center",
    position: "relative",
  },
  nodeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  labelRow: {
    alignItems: "center",
    marginTop: 6,
    marginBottom: 4,
  },
  nodeLabel: {
    fontSize: 11,
    letterSpacing: 0.5,
  },

  // Base
  originBase: {
    alignItems: "center",
    gap: 6,
    marginTop: 24,
  },
  originText: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2.5,
  },

  // Checkpoint Final
  completedBanner: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 16,
  },
  completedIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  completedText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  completedSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 14,
    alignItems: "center",
  },
  modalTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
    width: "100%",
  },
  modalCancel: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  modalConfirm: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
});
