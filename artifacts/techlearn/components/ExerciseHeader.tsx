import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
  Modal, Pressable,
} from "react-native";
import { X, Heart, Zap, Lightbulb, AlertCircle } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { ProgressBar } from "./ProgressBar";
import { audioService } from "@/services/audioService";
import type { PhaseInfo, ExerciseType } from "@/constants/lessons";

// Custo em XP de cada tipo de ajuda
const HINT_COST = 5;    // Ver dica
const POWERUP_COST = 10; // Power-up / ajuda forte

// Fallback hints per exercise type
const FALLBACK_HINTS: Record<string, string> = {
  multiple_choice:
    "Observe as palavras-chave do enunciado e escolha o conceito mais relacionado.",
  association:
    "Comece ligando os pares mais óbvios e use eliminação para os restantes.",
  text_input:
    "Digite a palavra-chave principal. Maiúsculas e acentos não importam.",
  ordering:
    "Pense na ordem mais segura: primeiro identificar, depois agir.",
  fill_blank:
    "Leia a frase inteira e pense no termo que completa melhor o sentido.",
  phishing_email:
    "Procure sinais de urgência, links suspeitos, remetente estranho ou pedido de dados.",
  default:
    "Releia o enunciado e procure a palavra-chave do conceito.",
};

function getHintText(hint: string | undefined, exerciseType: ExerciseType | undefined): string {
  if (hint && hint.trim().length > 0) return hint;
  if (exerciseType && FALLBACK_HINTS[exerciseType]) return FALLBACK_HINTS[exerciseType];
  return FALLBACK_HINTS.default;
}

interface ExerciseHeaderProps {
  current: number;
  total: number;
  lives: number;
  xp: number;
  onClose: () => void;
  phaseInfo?: PhaseInfo;
  isBriefing?: boolean;
  moduleName?: string;
  // Hint props
  hint?: string;
  exerciseType?: ExerciseType;
  showHintIcon?: boolean;
  // Power-up props
  powerUpUsed?: boolean;
  onPowerUp?: () => boolean;   // retorna true = power-up aplicado; false = não aplicável
  onSkip?: () => void;
  // XP moeda
  currentXP?: number;
  onSpendXP?: (amount: number) => boolean;
  onIncrementHintUsed?: () => void;
  isMistakesReview?: boolean;
}

const POWER_UP_LABELS: Record<string, string> = {
  multiple_choice: "Eliminar 2 respostas erradas",
  fill_blank: "Revelar primeira letra",
  association: "Resolver 1 par",
  ordering: "Fixar 1 item",
  text_input: "Revelar primeira letra",
  phishing_email: "Destacar sinal suspeito",
};

type ViewState = "menu" | "hint" | "confirm_hint" | "confirm_powerup" | "insufficient_xp" | "powerup_unavailable";

export function ExerciseHeader({
  current, total, lives, xp, onClose, phaseInfo, isBriefing, moduleName,
  hint, exerciseType, showHintIcon = false,
  powerUpUsed = false, onPowerUp, onSkip,
  currentXP, onSpendXP, onIncrementHintUsed,
  isMistakesReview = false,
}: ExerciseHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, Platform.OS === "web" ? 16 : 0);
  const [hintModalOpen, setHintModalOpen] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("menu");
  const [pendingAction, setPendingAction] = useState<"hint" | "powerup" | null>(null);

  const hintText = getHintText(hint, exerciseType);
  const availableXP = currentXP ?? xp;

  const openHint = () => {
    Haptics.selectionAsync();
    setViewState("menu");
    setHintModalOpen(true);
  };

  /** Solicita confirmação para gastar XP em dica simples */
  const requestHint = () => {
    if (isMistakesReview) {
      // Ajudas são gratuitas na Caixa de Erros
      setHintUsed(true);
      audioService.playHintUsed();
      setViewState("hint");
      return;
    }
    if (!onSpendXP) {
      // Sem controle de XP: mostrar dica diretamente
      setHintUsed(true);
      setViewState("hint");
      return;
    }
    setPendingAction("hint");
    if (availableXP < HINT_COST) {
      setViewState("insufficient_xp");
    } else {
      setViewState("confirm_hint");
    }
  };

  /** Confirma gasto de XP e mostra a dica */
  const confirmHint = () => {
    if (!onSpendXP) return;
    const success = onSpendXP(HINT_COST);
    if (success) {
      setHintUsed(true);
      audioService.playHintUsed();
      audioService.playXpSpent();
      onIncrementHintUsed?.();
      setViewState("hint");
    } else {
      setViewState("insufficient_xp");
    }
  };

  /** Solicita confirmação para power-up */
  const requestPowerUp = () => {
    if (isMistakesReview && onPowerUp) {
      // Power-up gratuito na Caixa de Erros
      setHintModalOpen(false);
      onPowerUp();
      return;
    }
    if (!onSpendXP || !onPowerUp) return;
    setPendingAction("powerup");
    if (availableXP < POWERUP_COST) {
      setViewState("insufficient_xp");
    } else {
      setViewState("confirm_powerup");
    }
  };

  /** Confirma gasto de XP e ativa power-up */
  const confirmPowerUp = () => {
    if (!onSpendXP || !onPowerUp) return;
    // IMPORTANTE: chama onPowerUp PRIMEIRO para verificar se é aplicável.
    // Só desconta XP se o power-up for realmente aplicado.
    const applied = onPowerUp();
    if (!applied) {
      // Power-up não pôde ser aplicado (todos os itens já resolvidos, etc.)
      setViewState("powerup_unavailable");
      return;
    }
    // Aplica foi bem-sucedido — agora debita o XP
    const success = onSpendXP(POWERUP_COST);
    if (success) {
      audioService.playXpSpent();
      setHintModalOpen(false);
    } else {
      // Isso só acontece em race condition extrema (XP mudou entre confirm e spend)
      setViewState("insufficient_xp");
    }
  };

  const closeModal = () => {
    setHintModalOpen(false);
    setViewState("menu");
    setPendingAction(null);
  };

  return (
    <>
      <View style={[
        styles.container,
        {
          paddingTop: topPad + 8,
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}>
        {/* Close button */}
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeBtn}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          accessibilityLabel="Fechar exercício"
        >
          <X size={20} color={colors.mutedForeground} strokeWidth={2} />
        </TouchableOpacity>

        {/* Center progress */}
        <View style={styles.center}>
          <ProgressBar progress={current} total={total} />
        </View>

        {/* Right cluster: XP + hearts + hint icon */}
        <View style={styles.rightCluster}>
          {!isBriefing && (
            <>
              {/* XP chip — mostra o XP disponível (global, que é debitado) */}
              <View style={[styles.xpChip, { backgroundColor: colors.primary + "14" }]}>
                <Zap size={11} color={colors.primary} strokeWidth={2.5} />
                <Text style={[styles.xpText, { color: colors.primary }]}>{availableXP}</Text>
              </View>

              {/* Hearts */}
              <View style={styles.heartsRow}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    size={14}
                    color={i < lives ? "#EF4444" : colors.border}
                    strokeWidth={2}
                    fill={i < lives ? "#EF4444" : "transparent"}
                  />
                ))}
              </View>

              {/* Hint lightbulb icon */}
              {showHintIcon && (
                <TouchableOpacity
                  onPress={openHint}
                  style={[
                    styles.hintIconBtn,
                    {
                      backgroundColor: hintUsed
                        ? colors.primary + "20"
                        : colors.muted,
                      borderColor: hintUsed ? colors.primary + "50" : colors.border,
                    },
                  ]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel="Ver dica da questão"
                  activeOpacity={0.7}
                >
                  <Lightbulb
                    size={15}
                    color={hintUsed ? colors.primary : colors.mutedForeground}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>

      {/* ── Ajuda Modal ── */}
      <Modal
        visible={hintModalOpen}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={closeModal}
        >
          <Pressable style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>

            {/* ── MENU principal ── */}
            {viewState === "menu" && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalIconWrap, { backgroundColor: colors.primary + "15" }]}>
                    <Lightbulb size={20} color={colors.primary} strokeWidth={2} />
                  </View>
                  <Text style={[styles.modalTitle, { color: colors.foreground }]}>Ajuda da questão</Text>
                  <TouchableOpacity
                    onPress={closeModal}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <X size={18} color={colors.mutedForeground} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: -6 }}>
                  {isMistakesReview 
                    ? "Revisão de Erros: Para apoiar seu aprendizado, dicas e power-ups são grátis!" 
                    : "Escolha uma opção de ajuda. Dicas e power-ups custam XP."}
                </Text>

                <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />

                <View style={{ gap: 10 }}>
                  {/* Ver dica — 5 XP */}
                  <TouchableOpacity
                    style={[styles.helpOptBtn, { borderColor: colors.border }]}
                    onPress={requestHint}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.helpOptText, { color: colors.foreground }]}>Ver dica</Text>
                      <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 }}>
                        {isMistakesReview ? "Grátis nesta revisão" : `Custa ${HINT_COST} XP`}
                      </Text>
                    </View>
                    <View style={[styles.xpCostBadge, { backgroundColor: isMistakesReview ? colors.success + "15" : colors.primary + "15", borderColor: isMistakesReview ? colors.success + "30" : colors.primary + "30" }]}>
                      <Zap size={10} color={isMistakesReview ? colors.success : colors.primary} strokeWidth={2.5} />
                      <Text style={[styles.xpCostText, { color: isMistakesReview ? colors.success : colors.primary }]}>{isMistakesReview ? 0 : HINT_COST}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Power-up — 10 XP */}
                  {exerciseType && POWER_UP_LABELS[exerciseType] && onPowerUp && (
                    <TouchableOpacity
                      style={[
                        styles.helpOptBtn, 
                        { borderColor: colors.border },
                        powerUpUsed && { opacity: 0.5, backgroundColor: colors.card }
                      ]}
                      onPress={() => {
                        if (!powerUpUsed) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          requestPowerUp();
                        }
                      }}
                      activeOpacity={powerUpUsed ? 1 : 0.7}
                      disabled={powerUpUsed}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.helpOptText, { color: colors.primary }]}>{POWER_UP_LABELS[exerciseType]}</Text>
                        {!powerUpUsed && (
                          <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 }}>
                            {isMistakesReview ? "Grátis nesta revisão" : `Custa ${POWERUP_COST} XP`}
                          </Text>
                        )}
                      </View>
                      {powerUpUsed ? (
                        <Text style={[styles.usedText, { color: colors.mutedForeground }]}>Usada</Text>
                      ) : (
                        <View style={[styles.xpCostBadge, { backgroundColor: isMistakesReview ? colors.success + "15" : colors.primary + "15", borderColor: isMistakesReview ? colors.success + "30" : colors.primary + "30" }]}>
                          <Zap size={10} color={isMistakesReview ? colors.success : colors.primary} strokeWidth={2.5} />
                          <Text style={[styles.xpCostText, { color: isMistakesReview ? colors.success : colors.primary }]}>{isMistakesReview ? 0 : POWERUP_COST}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )}

                  {/* Pular questão — gratuito */}
                  {onSkip && (
                    <TouchableOpacity
                      style={[styles.helpOptBtn, { borderColor: colors.border }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        closeModal();
                        onSkip();
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.helpOptText, { color: colors.foreground }]}>Pular questão</Text>
                      <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>Grátis</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}

            {/* ── CONFIRMAR dica (5 XP) ── */}
            {viewState === "confirm_hint" && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalIconWrap, { backgroundColor: "#F59E0B18" }]}>
                    <AlertCircle size={20} color="#F59E0B" strokeWidth={2} />
                  </View>
                  <Text style={[styles.modalTitle, { color: colors.foreground }]}>Usar dica?</Text>
                  <TouchableOpacity onPress={closeModal} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <X size={18} color={colors.mutedForeground} strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                <View style={[styles.warnBox, { backgroundColor: "#F59E0B12", borderColor: "#F59E0B40" }]}>
                  <Zap size={14} color="#F59E0B" />
                  <Text style={[styles.warnText, { color: colors.foreground }]}>
                    Usar esta ajuda custa <Text style={{ fontFamily: "Inter_700Bold", color: "#F59E0B" }}>{HINT_COST} XP</Text> e pode afetar sua posição no ranking.{"\n"}
                    <Text style={{ color: colors.mutedForeground }}>Você tem {availableXP} XP disponíveis.</Text>
                  </Text>
                </View>

                <View style={styles.confirmRow}>
                  <TouchableOpacity
                    style={[styles.confirmCancelBtn, { borderColor: colors.border }]}
                    onPress={() => setViewState("menu")}
                  >
                    <Text style={[styles.confirmCancelText, { color: colors.foreground }]}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmOkBtn, { backgroundColor: "#F59E0B" }]}
                    onPress={confirmHint}
                  >
                    <Text style={styles.confirmOkText}>Usar — {HINT_COST} XP</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ── CONFIRMAR power-up (10 XP) ── */}
            {viewState === "confirm_powerup" && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalIconWrap, { backgroundColor: "#F59E0B18" }]}>
                    <AlertCircle size={20} color="#F59E0B" strokeWidth={2} />
                  </View>
                  <Text style={[styles.modalTitle, { color: colors.foreground }]}>Usar ajuda?</Text>
                  <TouchableOpacity onPress={closeModal} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <X size={18} color={colors.mutedForeground} strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                <View style={[styles.warnBox, { backgroundColor: "#F59E0B12", borderColor: "#F59E0B40" }]}>
                  <Zap size={14} color="#F59E0B" />
                  <Text style={[styles.warnText, { color: colors.foreground }]}>
                    Usar esta ajuda custa <Text style={{ fontFamily: "Inter_700Bold", color: "#F59E0B" }}>{POWERUP_COST} XP</Text> e pode afetar sua posição no ranking.{"\n"}
                    <Text style={{ color: colors.mutedForeground }}>Você tem {availableXP} XP disponíveis.</Text>
                  </Text>
                </View>

                <View style={styles.confirmRow}>
                  <TouchableOpacity
                    style={[styles.confirmCancelBtn, { borderColor: colors.border }]}
                    onPress={() => setViewState("menu")}
                  >
                    <Text style={[styles.confirmCancelText, { color: colors.foreground }]}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmOkBtn, { backgroundColor: "#F59E0B" }]}
                    onPress={confirmPowerUp}
                  >
                    <Text style={styles.confirmOkText}>Usar — {POWERUP_COST} XP</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ── DICA exibida ── */}
            {viewState === "hint" && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalIconWrap, { backgroundColor: colors.primary + "15" }]}>
                    <Lightbulb size={20} color={colors.primary} strokeWidth={2} />
                  </View>
                  <Text style={[styles.modalTitle, { color: colors.foreground }]}>Dica</Text>
                  <TouchableOpacity
                    onPress={closeModal}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <X size={18} color={colors.mutedForeground} strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />

                <Text style={[styles.modalHintText, { color: colors.foreground }]}>
                  {hintText}
                </Text>

                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                  onPress={closeModal}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalBtnText}>Entendido</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── XP INSUFICIENTE ── */}
            {viewState === "insufficient_xp" && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalIconWrap, { backgroundColor: colors.error + "18" }]}>
                    <AlertCircle size={20} color={colors.error} strokeWidth={2} />
                  </View>
                  <Text style={[styles.modalTitle, { color: colors.foreground }]}>XP insuficiente</Text>
                  <TouchableOpacity onPress={closeModal} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <X size={18} color={colors.mutedForeground} strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 22 }}>
                  Você precisa de{" "}
                  <Text style={{ fontFamily: "Inter_700Bold", color: colors.primary }}>
                    {pendingAction === "hint" ? HINT_COST : POWERUP_COST} XP
                  </Text>{" "}
                  para usar esta ajuda, mas tem apenas{" "}
                  <Text style={{ fontFamily: "Inter_700Bold" }}>{availableXP} XP</Text>.{"\n\n"}
                  Continue respondendo questões para ganhar mais XP!
                </Text>

                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                  onPress={closeModal}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalBtnText}>Entendido</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── POWER-UP NÃO DISPONÍVEL (sem custo de XP) ── */}
            {viewState === "powerup_unavailable" && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalIconWrap, { backgroundColor: colors.success + "18" }]}>
                    <AlertCircle size={20} color={colors.success} strokeWidth={2} />
                  </View>
                  <Text style={[styles.modalTitle, { color: colors.foreground }]}>Já resolvido!</Text>
                  <TouchableOpacity onPress={closeModal} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <X size={18} color={colors.mutedForeground} strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 22 }}>
                  Não há mais itens disponíveis para esta ajuda nesta questão.{"\n\n"}
                  <Text style={{ color: colors.mutedForeground }}>Seu XP não foi debitado.</Text>
                </Text>

                <View style={styles.confirmRow}>
                  <TouchableOpacity
                    style={[styles.confirmCancelBtn, { borderColor: colors.border }]}
                    onPress={() => setViewState("menu")}
                  >
                    <Text style={[styles.confirmCancelText, { color: colors.foreground }]}>Ver opções</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmOkBtn, { backgroundColor: colors.primary }]}
                    onPress={closeModal}
                  >
                    <Text style={styles.confirmOkText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  closeBtn: { padding: 4, flexShrink: 0 },
  center: { flex: 1 },
  phaseCol: { gap: 3 },
  moduleLabel: {
    fontSize: 10, fontFamily: "Inter_500Medium", letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  dotsRow: { flexDirection: "row", gap: 4, alignItems: "center" },
  phaseDot: { height: 4, borderRadius: 2 },
  phaseText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  // Right cluster
  rightCluster: { flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 },
  xpChip: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
  },
  xpText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  heartsRow: { flexDirection: "row", alignItems: "center", gap: 2 },

  // Hint icon
  hintIconBtn: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },

  // XP cost badge
  xpCostBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1,
  },
  xpCostText: { fontSize: 11, fontFamily: "Inter_700Bold" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  modalTitle: { flex: 1, fontSize: 17, fontFamily: "Inter_700Bold" },
  modalDivider: { height: 1, borderRadius: 1 },
  modalHintText: {
    fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24,
  },
  modalBtn: {
    borderRadius: 10, paddingVertical: 13,
    alignItems: "center", justifyContent: "center",
  },
  modalBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  helpOptBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    gap: 8,
  },
  helpOptText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  usedText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Warning box
  warnBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
  },
  warnText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  // Confirm buttons
  confirmRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  confirmCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmCancelText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  confirmOkBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmOkText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
});
