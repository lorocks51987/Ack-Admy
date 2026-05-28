import React, { useState, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { CheckCircle2, XCircle } from "lucide-react-native";
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

  // Power-up auto-resolves first pair
  React.useEffect(() => {
    if (powerUpUsed && matched[0] === undefined) {
      const newMatched = { ...matched, 0: 0 };
      setMatched(newMatched);
      if (selectedLeft === 0) setSelectedLeft(null);
      if (Object.keys(newMatched).length === exercise.pairs.length) {
        setTimeout(() => {
          onAnswer(true);
        }, 600);
      }
    }
  }, [powerUpUsed]);

  const evaluateMatch = useCallback((lIdx: number, rIdx: number) => {
    if (lIdx === rIdx) {
      // Correct Match!
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newMatched = { ...matched, [lIdx]: rIdx };
      setMatched(newMatched);
      setSelectedLeft(null);
      
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
    setSelectedLeft(prev => prev === idx ? null : idx);
  }, [locked, matched]);

  const handleSelectRight = useCallback((origIdx: number) => {
    if (locked || Object.values(matched).includes(origIdx)) return;
    if (selectedLeft === null) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    evaluateMatch(selectedLeft, origIdx);
  }, [locked, matched, selectedLeft, evaluateMatch]);

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
            {selectedLeft === null 
              ? "👉 Passo 1: Escolha um conceito abaixo." 
              : "🎯 Passo 2: Agora escolha a definição correspondente."}
          </Text>
        </View>

        {/* LISTA DE CONCEITOS PENDENTES */}
        {pendingConcepts.length > 0 && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { color: colors.mutedForeground }]}>CONCEITOS DISPONÍVEIS</Text>
            <View style={s.list}>
              {pendingConcepts.map((c) => {
                const isSelected = selectedLeft === c.originalIdx;
                const isWrong = wrongLeft === c.originalIdx;
                return (
                  <TouchableOpacity
                    key={`concept-${c.originalIdx}`}
                    style={[
                      s.cardItem,
                      {
                        backgroundColor: isSelected 
                          ? colors.primary + "12" 
                          : isWrong 
                          ? colors.error + "12" 
                          : colors.card,
                        borderColor: isSelected 
                          ? colors.primary 
                          : isWrong 
                          ? colors.error 
                          : colors.border,
                      }
                    ]}
                    onPress={() => handleSelectLeft(c.originalIdx)}
                    activeOpacity={0.75}
                  >
                    <Text style={[s.cardText, { color: isSelected ? colors.primary : colors.foreground, fontFamily: isSelected ? "Inter_700Bold" : "Inter_500Medium" }]}>
                      {c.left}
                    </Text>
                  </TouchableOpacity>
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
              {pendingDefinitions.map((d) => {
                const isWrong = wrongRight === d.originalIdx;
                return (
                  <TouchableOpacity
                    key={`def-${d.originalIdx}`}
                    style={[
                      s.cardItem,
                      {
                        backgroundColor: isWrong ? colors.error + "12" : colors.card,
                        borderColor: isWrong ? colors.error : colors.border,
                        opacity: selectedLeft === null ? 0.6 : 1,
                      }
                    ]}
                    onPress={() => handleSelectRight(d.originalIdx)}
                    activeOpacity={selectedLeft === null ? 1 : 0.75}
                  >
                    <Text style={[s.cardText, { color: colors.foreground }]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
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
                <View
                  key={`done-${idx}`}
                  style={[s.doneItem, { backgroundColor: colors.success + "08", borderColor: colors.success + "30" }]}
                >
                  <CheckCircle2 size={16} color={colors.success} strokeWidth={2.5} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[s.doneLeftText, { color: colors.foreground }]}>{p.left}</Text>
                    <Text style={[s.doneRightText, { color: colors.mutedForeground }]}>{p.right}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {!feedbackVisible && (
        <View style={[s.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) }]}>
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
  footerMessage: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center", paddingVertical: 6 },
});
