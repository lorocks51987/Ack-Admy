import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
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
      if (checked) return;
      if (matched[idx] !== undefined) return;
      Haptics.selectionAsync();
      setSelectedLeft(idx === selectedLeft ? null : idx);
    },
    [checked, matched, selectedLeft]
  );

  const handleRight = useCallback(
    (shuffledItem: { originalIdx: number }) => {
      if (checked) return;
      if (selectedLeft === null) return;
      const rightIdx = shuffledItem.originalIdx;
      const alreadyMatched = Object.values(matched).includes(rightIdx);
      if (alreadyMatched) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setMatched((prev) => ({ ...prev, [selectedLeft]: rightIdx }));
      setSelectedLeft(null);
    },
    [checked, selectedLeft, matched]
  );

  const handleCheck = () => {
    if (Object.keys(matched).length < exercise.pairs.length) return;
    setChecked(true);
    const correct = exercise.pairs.every((_, i) => matched[i] === i);
    onAnswer(correct);
  };

  const isMatchedLeft = (idx: number) => matched[idx] !== undefined;
  const isMatchedRight = (origIdx: number) => Object.values(matched).includes(origIdx);

  const getLeftStyle = (idx: number) => {
    if (checked && matched[idx] !== undefined) {
      const correct = matched[idx] === idx;
      return {
        backgroundColor: correct ? "#0D2010" : "#2D0A0A",
        borderColor: correct ? "#00FF66" : "#FF4444",
      };
    }
    if (selectedLeft === idx) {
      return { backgroundColor: "#1A2A2A", borderColor: colors.primary };
    }
    if (isMatchedLeft(idx)) {
      return { backgroundColor: "#1A1E2A", borderColor: "#444" };
    }
    return { backgroundColor: colors.card, borderColor: colors.border };
  };

  const getRightStyle = (origIdx: number) => {
    if (checked) {
      const leftKey = Object.keys(matched).find(
        (k) => matched[parseInt(k)] === origIdx
      );
      if (leftKey !== undefined) {
        const correct = parseInt(leftKey) === origIdx;
        return {
          backgroundColor: correct ? "#0D2010" : "#2D0A0A",
          borderColor: correct ? "#00FF66" : "#FF4444",
        };
      }
    }
    if (isMatchedRight(origIdx)) {
      return { backgroundColor: "#1A1E2A", borderColor: "#444" };
    }
    if (selectedLeft !== null && !isMatchedRight(origIdx)) {
      return { backgroundColor: "#1A2A2A", borderColor: colors.primary };
    }
    return { backgroundColor: colors.card, borderColor: colors.border };
  };

  const allMatched = Object.keys(matched).length === exercise.pairs.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.typeTag}>
          <Text style={[styles.typeText, { color: colors.primary }]}>Associar</Text>
        </View>
        <Text style={[styles.instruction, { color: colors.foreground }]}>
          {exercise.instruction}
        </Text>
        <View style={styles.columns}>
          <View style={styles.column}>
            {exercise.pairs.map((pair, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.chip, getLeftStyle(idx)]}
                onPress={() => handleLeft(idx)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, { color: colors.foreground }]}>{pair.left}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.column}>
            {shuffledRight.map((item) => (
              <TouchableOpacity
                key={item.originalIdx}
                style={[styles.chip, getRightStyle(item.originalIdx)]}
                onPress={() => handleRight(item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, { color: colors.foreground }]}>{item.right}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          {selectedLeft !== null
            ? `Associe com "${exercise.pairs[selectedLeft].left}"`
            : "Toque em um item da esquerda para começar"}
        </Text>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.checkBtn, { backgroundColor: allMatched ? colors.primary : colors.muted }]}
          onPress={handleCheck}
          activeOpacity={0.85}
          disabled={!allMatched}
        >
          <Text style={[styles.checkText, { color: allMatched ? "#121212" : colors.mutedForeground }]}>
            Verificar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 120, gap: 16 },
  typeTag: { marginBottom: 4 },
  typeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 1 },
  instruction: { fontSize: 18, fontFamily: "Inter_700Bold", lineHeight: 28, marginBottom: 8 },
  columns: { flexDirection: "row", gap: 10 },
  column: { flex: 1, gap: 10 },
  chip: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
  },
  chipText: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center", lineHeight: 20 },
  hint: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", fontStyle: "italic" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1 },
  checkBtn: { borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  checkText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
});
