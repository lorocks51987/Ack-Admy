import React, { useState, useCallback, useMemo } from "react";
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

  const shuffledRight = useMemo(
    () =>
      exercise.pairs
        .map((p, i) => ({ label: p.right, originalIdx: i }))
        .sort(() => Math.random() - 0.5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleLeft = useCallback(
    (idx: number) => {
      if (checked || matched[idx] !== undefined) return;
      Haptics.selectionAsync();
      setSelectedLeft((prev) => (prev === idx ? null : idx));
    },
    [checked, matched]
  );

  const handleRight = useCallback(
    (origIdx: number) => {
      if (checked || selectedLeft === null) return;
      if (Object.values(matched).includes(origIdx)) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setMatched((prev) => ({ ...prev, [selectedLeft]: origIdx }));
      setSelectedLeft(null);
    },
    [checked, selectedLeft, matched]
  );

  const handleCheck = () => {
    if (Object.keys(matched).length < exercise.pairs.length) return;
    setChecked(true);
    onAnswer(exercise.pairs.every((_, i) => matched[i] === i));
  };

  const getLeftBg = (idx: number) => {
    if (checked && matched[idx] !== undefined) {
      return matched[idx] === idx ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)";
    }
    if (selectedLeft === idx) return "rgba(99,102,241,0.15)";
    return colors.card;
  };

  const getLeftBorder = (idx: number) => {
    if (checked && matched[idx] !== undefined) {
      return matched[idx] === idx ? colors.success : colors.error;
    }
    if (selectedLeft === idx) return colors.primary;
    if (matched[idx] !== undefined) return colors.primary + "60";
    return colors.border;
  };

  const getRightBg = (origIdx: number) => {
    const leftKey = Number(Object.keys(matched).find((k) => matched[+k] === origIdx));
    if (checked && !isNaN(leftKey)) {
      return leftKey === origIdx ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)";
    }
    if (Object.values(matched).includes(origIdx)) return colors.muted;
    if (selectedLeft !== null) return "rgba(99,102,241,0.06)";
    return colors.card;
  };

  const getRightBorder = (origIdx: number) => {
    const leftKey = Number(Object.keys(matched).find((k) => matched[+k] === origIdx));
    if (checked && !isNaN(leftKey)) {
      return leftKey === origIdx ? colors.success : colors.error;
    }
    if (Object.values(matched).includes(origIdx)) return colors.primary + "60";
    if (selectedLeft !== null) return colors.primary;
    return colors.border;
  };

  const allMatched = Object.keys(matched).length === exercise.pairs.length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.tag, { color: colors.primary }]}>ASSOCIAÇÃO</Text>
        <Text style={[styles.instruction, { color: colors.foreground }]}>
          {exercise.instruction}
        </Text>

        {selectedLeft !== null && (
          <View style={[styles.hint, { backgroundColor: colors.card, borderColor: colors.primary }]}>
            <Text style={[styles.hintText, { color: colors.primary }]}>
              Conectando: "{exercise.pairs[selectedLeft].left}"
            </Text>
          </View>
        )}

        <View style={styles.columns}>
          {/* LEFT column */}
          <View style={styles.column}>
            {exercise.pairs.map((pair, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.chip,
                  {
                    backgroundColor: getLeftBg(idx),
                    borderColor: getLeftBorder(idx),
                    opacity: checked || matched[idx] !== undefined ? 0.9 : 1,
                  },
                ]}
                onPress={() => handleLeft(idx)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, { color: colors.foreground }]}>{pair.left}</Text>
                {matched[idx] !== undefined && (
                  <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* RIGHT column */}
          <View style={styles.column}>
            {shuffledRight.map((item) => {
              const isUsed = Object.values(matched).includes(item.originalIdx);
              return (
                <TouchableOpacity
                  key={item.originalIdx}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: getRightBg(item.originalIdx),
                      borderColor: getRightBorder(item.originalIdx),
                      opacity: isUsed ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => handleRight(item.originalIdx)}
                  activeOpacity={0.75}
                  disabled={isUsed && !checked}
                >
                  <Text style={[styles.chipText, { color: colors.foreground }]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={[styles.statusHint, { color: colors.mutedForeground }]}>
          {checked
            ? ""
            : allMatched
            ? "Tudo conectado! Clique em Verificar."
            : selectedLeft !== null
            ? "Agora selecione um item à direita"
            : "Selecione um item à esquerda para começar"}
        </Text>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: allMatched ? colors.primary : colors.muted }]}
          onPress={handleCheck}
          activeOpacity={0.85}
          disabled={!allMatched}
        >
          <Text style={[styles.btnText, { color: allMatched ? "#FFFFFF" : colors.mutedForeground }]}>
            Verificar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 14, paddingBottom: 24 },
  tag: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  instruction: { fontSize: 15, fontFamily: "Inter_700Bold", lineHeight: 24 },
  hint: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  hintText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  columns: { flexDirection: "row", gap: 10 },
  column: { flex: 1, gap: 10 },
  chip: {
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 12,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  chipText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    lineHeight: 18,
    flex: 1,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statusHint: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", fontStyle: "italic" },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  btn: { borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
});
