import React, { useState, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { CheckCircle2 } from "lucide-react-native";
import Reanimated, { FadeIn, LinearTransition, ZoomIn } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import type { AssociationExercise } from "@/constants/lessons";
import { audioService } from "@/services/audioService";

interface Props {
  exercise: AssociationExercise;
  onAnswer: (correct: boolean) => void;
  feedbackVisible?: boolean;
  powerUpUsed?: boolean;
}

export function AssociationScreen({ exercise, onAnswer, feedbackVisible = false, powerUpUsed = false }: Props) {
  const colors = useColors();
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [wrongLeft, setWrongLeft] = useState<number | null>(null);
  const [wrongRight, setWrongRight] = useState<number | null>(null);
  const [matched, setMatched] = useState<Record<number, number>>({});

  const insets = useSafeAreaInsets();
  const locked = feedbackVisible;

  // Shuffled right definitions list
  const shuffledRight = useMemo(
    () =>
      exercise.pairs
        .map((p, i) => ({ label: p.right, originalIdx: i }))
        .sort(() => Math.random() - 0.5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Power-up: resolve o primeiro par ainda não resolvido de forma correta.
  // A relação correta em AssociationExercise é lIdx === rIdx (par i do conceito = definição i).
  React.useEffect(() => {
    if (!powerUpUsed) return;

    // Encontra o primeiro índice de par que ainda não foi resolvido
    const firstUnresolvedIdx = exercise.pairs.findIndex((_, i) => matched[i] === undefined);

    if (firstUnresolvedIdx === -1) {
      // Todos os pares já estão resolvidos — não faz nada.
      // O ExerciseHeader exibirá "powerup_unavailable" (handlePowerUp retornou false no lesson.tsx)
      return;
    }

    const newMatched = { ...matched, [firstUnresolvedIdx]: firstUnresolvedIdx };
    setMatched(newMatched);
    // Limpa seleções ativas se o item resolvido estava selecionado
    if (selectedLeft === firstUnresolvedIdx) setSelectedLeft(null);
    if (selectedRight === firstUnresolvedIdx) setSelectedRight(null);

    // Se completou todos, dispara onAnswer
    if (Object.keys(newMatched).length === exercise.pairs.length) {
      setTimeout(() => {
        onAnswer(true);
      }, 600);
    }
  }, [powerUpUsed]); // eslint-disable-line react-hooks/exhaustive-deps

  const evaluateMatch = useCallback((lIdx: number, rIdx: number) => {
    if (lIdx === rIdx) {
      // Correct Match!
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newMatched = { ...matched, [lIdx]: rIdx };
      setMatched(newMatched);
      setSelectedLeft(null);
      setSelectedRight(null);
      
      // Check if all matched
      if (Object.keys(newMatched).length === exercise.pairs.length) {
        setTimeout(() => {
          onAnswer(true);
        }, 600);
      }
    } else {
      // Wrong Match!
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      audioService.playWrong();
      setWrongLeft(lIdx);
      setWrongRight(rIdx);
      setSelectedLeft(null);
      setSelectedRight(null);
      
      // Clear wrong flash after 600ms
      setTimeout(() => {
        setWrongLeft(null);
        setWrongRight(null);
      }, 600);
    }
  }, [matched, exercise.pairs.length, onAnswer]);

  const handleSelectLeft = useCallback((idx: number) => {
    if (locked || matched[idx] !== undefined) return;
    Haptics.selectionAsync();

    if (selectedLeft === idx) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(idx);
      if (selectedRight !== null) {
        evaluateMatch(idx, selectedRight);
      }
    }
  }, [locked, matched, selectedLeft, selectedRight, evaluateMatch]);

  const handleSelectRight = useCallback((origIdx: number) => {
    if (locked || Object.values(matched).includes(origIdx)) return;
    Haptics.selectionAsync();

    if (selectedRight === origIdx) {
      setSelectedRight(null);
    } else {
      setSelectedRight(origIdx);
      if (selectedLeft !== null) {
        evaluateMatch(selectedLeft, origIdx);
      }
    }
  }, [locked, matched, selectedLeft, selectedRight, evaluateMatch]);

  // Filtra itens ainda pendentes para conexão
  const pendingConcepts = useMemo(() => {
    return exercise.pairs
      .map((p, idx) => ({ ...p, originalIdx: idx }))
      .filter(p => matched[p.originalIdx] === undefined);
  }, [exercise.pairs, matched]);

  const pendingDefinitions = useMemo(() => {
    return shuffledRight.filter(item => !Object.values(matched).includes(item.originalIdx));
  }, [shuffledRight, matched]);

  // Pares concluídos
  const completedPairs = useMemo(() => {
    return Object.keys(matched).map(lIdx => {
      const idx = parseInt(lIdx, 10);
      return exercise.pairs[idx];
    });
  }, [matched, exercise.pairs]);

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 150 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Instrução Dinâmica */}
        <View style={[s.instructionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.instructionText, { color: colors.foreground }]}>
            {exercise.instruction || "Conecte os conceitos à sua definição correspondente."}
          </Text>
        </View>

        {/* LISTA DE CONCEITOS PENDENTES */}
        {pendingConcepts.length > 0 && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: colors.mutedForeground }]}>CONCEITOS DISPONÍVEIS</Text>
            <View style={s.list}>
              {pendingConcepts.map((c, idx) => {
                const isSelected = selectedLeft === c.originalIdx;
                const isWrong = wrongLeft === c.originalIdx;
                return (
                  <Reanimated.View 
                    key={`concept-${c.originalIdx}`}
                    entering={FadeIn.duration(300).delay(idx * 50)}
                    layout={LinearTransition.duration(300)}
                  >
                    <TouchableOpacity
                      style={[
                        s.cardItem,
                        {
                          backgroundColor: isSelected ? colors.primary + "12" : isWrong ? colors.error + "12" : colors.card,
                          borderColor: isSelected ? colors.primary : isWrong ? colors.error : colors.border,
                          borderWidth: isSelected ? 2.5 : 1.5,
                        }
                      ]}
                      onPress={() => handleSelectLeft(c.originalIdx)}
                      activeOpacity={0.75}
                    >
                      <Text style={[s.cardText, { color: isSelected ? colors.primary : colors.foreground, fontFamily: isSelected ? "Inter_700Bold" : "Inter_500Medium" }]}>
                        {c.left}
                      </Text>
                    </TouchableOpacity>
                  </Reanimated.View>
                );
              })}
            </View>
          </View>
        )}

        {/* LISTA DE DEFINIÇÕES PENDENTES */}
        {pendingDefinitions.length > 0 && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: colors.mutedForeground }]}>DEFINIÇÕES DISPONÍVEIS</Text>
            <View style={s.list}>
              {pendingDefinitions.map((d, idx) => {
                const isSelected = selectedRight === d.originalIdx;
                const isWrong = wrongRight === d.originalIdx;
                return (
                  <Reanimated.View
                    key={`def-${d.originalIdx}`}
                    entering={FadeIn.duration(300).delay(idx * 50)}
                    layout={LinearTransition.duration(300)}
                  >
                    <TouchableOpacity
                      style={[
                        s.cardItem,
                        {
                          backgroundColor: isSelected ? colors.primary + "12" : isWrong ? colors.error + "12" : colors.card,
                          borderColor: isSelected ? colors.primary : isWrong ? colors.error : colors.border,
                          borderWidth: isSelected ? 2.5 : 1.5,
                        }
                      ]}
                      onPress={() => handleSelectRight(d.originalIdx)}
                      activeOpacity={0.75}
                    >
                      <Text style={[s.cardText, { color: isSelected ? colors.primary : colors.foreground, fontFamily: isSelected ? "Inter_700Bold" : "Inter_500Medium" }]}>
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  </Reanimated.View>
                );
              })}
            </View>
          </View>
        )}

        {/* CONEXÕES FEITAS */}
        {completedPairs.length > 0 && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: colors.success }]}>CONEXÕES FEITAS</Text>
            <View style={s.list}>
              {completedPairs.map((p, idx) => (
                <Reanimated.View
                  key={`done-${idx}`}
                  entering={FadeIn.duration(300)}
                  layout={LinearTransition.duration(300)}
                  style={[s.doneItem, { backgroundColor: colors.success + "08", borderColor: colors.success + "30" }]}
                >
                  <Text style={{ fontSize: 13, color: colors.success, fontFamily: "Inter_700Bold" }}>✓</Text>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[s.doneLeftText, { color: colors.foreground }]}>{p.left}</Text>
                    <Text style={[s.doneRightText, { color: colors.mutedForeground }]}>{p.right}</Text>
                  </View>
                </Reanimated.View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {!feedbackVisible && (
        <View style={[s.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Text style={[s.hintText, { color: colors.mutedForeground, textAlign: "center", fontStyle: "italic", marginBottom: 8, fontSize: 12 }]}>
            Dica: Toque em um item de cada lista em qualquer ordem para conectá-los.
          </Text>
          <Text style={[s.footerMessage, { color: colors.mutedForeground }]}>
            {completedPairs.length < exercise.pairs.length
              ? `Progresso: ${completedPairs.length} de ${exercise.pairs.length} pares conectados`
              : "Verificando conexões..."}
          </Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, gap: 20, paddingBottom: 32 },
  instructionBox: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  instructionText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    lineHeight: 20,
  },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  list: { gap: 8 },
  cardItem: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
    justifyContent: "center",
  },
  cardText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    lineHeight: 18,
  },
  doneItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  doneLeftText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  doneRightText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
  footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1 },
  hintText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  footerMessage: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center", paddingVertical: 6 },
});
