import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Lock, ChevronRight, RotateCcw, Play, Zap } from "lucide-react-native";
import type { ModuleDefinition } from "@/constants/lessons";
import type { NodeState } from "./RoadmapNode";

interface FloatingLessonCardProps {
  module: ModuleDefinition;
  state: NodeState;
  side: "left" | "right";
  colors: {
    card: string;
    foreground: string;
    mutedForeground: string;
    border: string;
    primary: string;
    success: string;
    background: string;
  };
  xpPossible: number;
  onStart: () => void;
  onClose: () => void;
}

export function FloatingLessonCard({
  module,
  state,
  side,
  colors,
  xpPossible,
  onStart,
  onClose,
}: FloatingLessonCardProps) {
  const isLocked = state === "locked";
  const isCompleted = state === "completed";
  const isCurrent = state === "current";

  const accent = isCompleted
    ? colors.success
    : isLocked
      ? colors.mutedForeground
      : module.accentColor;

  const actionLabel = isCompleted
    ? "Revisar"
    : isCurrent
      ? "Continuar"
      : "Começar";
  const ActionIcon = isCompleted ? RotateCcw : isCurrent ? ChevronRight : Play;

  // Seta: aponta para o nó (se nó à direita, seta no lado direito do card)
  const arrowStyle =
    side === "left"
      ? { left: -7, borderRightWidth: 7, borderRightColor: colors.card }
      : { right: -7, borderLeftWidth: 7, borderLeftColor: colors.card };

  return (
    <View
      style={[
        s.card,
        {
          backgroundColor: colors.card + "E6", // Glassy feel
          borderColor: isLocked ? colors.border + "80" : accent + "50",
          alignSelf: side === "left" ? "flex-start" : "flex-end",
          marginLeft: side === "left" ? 6 : 0,
          marginRight: side === "right" ? 6 : 0,
          shadowColor: isLocked ? "transparent" : accent,
          shadowOpacity: isLocked ? 0 : 0.25,
          shadowRadius: 15,
          shadowOffset: { width: 0, height: 5 },
          elevation: isLocked ? 0 : 8,
        },
      ]}
    >
      {/* Seta */}
      <View style={[s.arrow, arrowStyle]} />

      {/* Cabeçalho compacto: XP + fechar */}
      <View style={s.header}>
        {!isLocked && (
          <View style={[s.xpPill, { backgroundColor: "#F59E0B18" }]}>
            <Zap size={9} color="#F59E0B" strokeWidth={2.5} />
            <Text style={[s.xpText, { color: "#F59E0B" }]}>
              +{xpPossible} XP
            </Text>
          </View>
        )}
        {isLocked && (
          <View style={[s.xpPill, { backgroundColor: colors.border + "40" }]}>
            <Lock size={9} color={colors.mutedForeground} strokeWidth={2} />
            <Text style={[s.xpText, { color: colors.mutedForeground }]}>
              Bloqueado
            </Text>
          </View>
        )}
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={s.closeBtn}
        >
          <Text
            style={{
              fontSize: 15,
              color: colors.mutedForeground,
              lineHeight: 16,
            }}
          >
            ×
          </Text>
        </TouchableOpacity>
      </View>

      {/* Título */}
      <Text style={[s.title, { color: colors.foreground }]} numberOfLines={2}>
        {module.title}
      </Text>

      {/* Subtítulo — apenas se não bloqueado (evita excesso de info) */}
      {!isLocked && (
        <Text
          style={[s.subtitle, { color: colors.mutedForeground }]}
          numberOfLines={2}
        >
          {module.subtitle}
        </Text>
      )}

      {/* Contagem de exercícios — linha discreta */}
      {!isLocked && (
        <Text style={[s.meta, { color: colors.mutedForeground }]}>
          {module.exercises?.length ?? 5} exercícios · {module.difficulty}
        </Text>
      )}

      {/* Botão de ação */}
      {isLocked ? (
        <View style={s.lockedFooter}>
          <Lock size={10} color={colors.mutedForeground} strokeWidth={2} />
          <Text style={[s.lockedMsg, { color: colors.mutedForeground }]}>
            Etapa anterior pendente
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[s.actionBtn, { backgroundColor: accent }]}
          onPress={onStart}
          activeOpacity={0.82}
        >
          <ActionIcon size={12} color="#FFF" strokeWidth={2.5} />
          <Text style={s.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    width: 175, // menor, mais compacto
    borderRadius: 12,
    borderWidth: 1,
    padding: 10, // padding menor
    gap: 5,
    position: "relative",
  },
  arrow: {
    position: "absolute",
    top: 18,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  xpPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  xpText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
  },
  closeBtn: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    lineHeight: 17,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 14,
  },
  meta: {
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
  lockedFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  lockedMsg: {
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    lineHeight: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 2,
  },
  actionText: {
    color: "#FFF",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
});
