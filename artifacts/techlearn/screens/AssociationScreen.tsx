import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import type { AssociationExercise } from "@/constants/lessons";

interface Props {
  exercise: AssociationExercise;
  onAnswer: (correct: boolean) => void;
}

export function AssociationScreen({ exercise, onAnswer }: Props) {
  const colors = useColors();
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);

  const shuffledRight = React.useMemo(() => {
    return exercise.pairs
      .map((p, i) => ({ ...p, originalIdx: i }))
      .sort(() => Math.random() - 0.5);
  }, [exercise.pairs]);

  const handleLeft = useCallback(
    (idx: number) => {
      if (checked || matched[idx] !== undefined) return;
      Haptics.selectionAsync();
      setSelectedLeft(idx === selectedLeft ? null : idx);
    },
    [checked, matched, selectedLeft]
  );

  const handleRight = useCallback(
    (shuffledItem: { originalIdx: number }) => {
      if (checked || selectedLeft === null) return;
      const rightIdx = shuffledItem.originalIdx;
      if (Object.values(matched).includes(rightIdx)) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setMatched((prev) => ({ ...prev, [selectedLeft]: rightIdx }));
      setSelectedLeft(null);
    },
    [checked, selectedLeft, matched]
  );

  const handleCheck = () => {
    if (Object.keys(matched).length < exercise.pairs.length) return;
    setChecked(true);
    onAnswer(exercise.pairs.every((_, i) => matched[i] === i));
  };

  const isMatchedLeft = (idx: number) => matched[idx] !== undefined;
  const isMatchedRight = (origIdx: number) => Object.values(matched).includes(origIdx);

  const getLeftStyle = (idx: number) => {
    if (checked && matched[idx] !== undefined) {
      const ok = matched[idx] === idx;
      return { backgroundColor: ok ? "#0D1F0D" : "#1F0A0A", borderColor: ok ? "#3FB950" : "#F85149" };
    }
    if (selectedLeft === idx) return { backgroundColor: "#1E1A2E", borderColor: colors.primary };
    if (isMatchedLeft(idx)) return { backgroundColor: "#1A1A2E", borderColor: "#2A3050" };
    return { backgroundColor: colors.card, borderColor: colors.border };
  };

  const getRightStyle = (origIdx: number) => {
    if (checked) {
      const leftKey = Object.keys(matched).find((k) => matched[parseInt(k)] === origIdx);
      if (leftKey !== undefined) {
        const ok = parseInt(leftKey) === origIdx;
        return { backgroundColor: ok ? "#0D1F0D" : "#1F0A0A", borderColor: ok ? "#3FB950" : "#F85149" };
      }
    }
    if (isMatchedRight(origIdx)) return { backgroundColor: "#1A1A2E", borderColor: "#2A3050" };
    if (selectedLeft !== null) return { backgroundColor: "#1E1A2E", borderColor: colors.primary };
    return { backgroundColor: colors.card, borderColor: colors.border };
  };

  const allMatched = Object.keys(matched).length === exercise.pairs.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.tag, { color: colors.primary }]}>ASSOCIAÇÃO</Text>
        <Text style={[styles.instruction, { color: colors.foreground }]}>{exercise.instruction}</Text>
        <View style={styles.columns}>
          <View style={styles.column}>
            {exercise.pairs.map((pair, idx) => (
              <TouchableOpacity key={idx} style={[styles.chip, getLeftStyle(idx)]} onPress={() => handleLeft(idx)} activeOpacity={0.8}>
                <Text style={[styles.chipText, { color: colors.foreground }]}>{pair.left}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.column}>
            {shuffledRight.map((item) => (
              <TouchableOpacity key={item.originalIdx} style={[styles.chip, getRightStyle(item.originalIdx)]} onPress={() => handleRight(item)} activeOpacity={0.8}>
                <Text style={[styles.chipText, { color: colors.foreground }]}>{item.right}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          {selectedLeft !== null ? `Associe com "${exercise.pairs[selectedLeft].left}"` : "Toque em um item da esquerda para começar"}
        </Text>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: allMatched ? colors.primary : colors.muted }]}
          onPress={handleCheck}
          activeOpacity={0.85}
          disabled={!allMatched}
        >
          <Text style={[styles.btnText, { color: allMatched ? "#0A0E1A" : colors.mutedForeground }]}>Verificar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 120, gap: 16 },
  tag: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  instruction: { fontSize: 18, fontFamily: "Inter_700Bold", lineHeight: 28 },
  columns: { flexDirection: "row", gap: 10 },
  column: { flex: 1, gap: 10 },
  chip: { borderRadius: 10, borderWidth: 1, padding: 14, alignItems: "center", justifyContent: "center", minHeight: 60 },
  chipText: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center", lineHeight: 20 },
  hint: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", fontStyle: "italic" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1 },
  btn: { borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
});
